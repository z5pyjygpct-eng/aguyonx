import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import {
  asLocalRecord,
  LEGISLATOR_RECORDS,
  rankCampaignMoney,
  type CampaignMoneyHit,
  type CampaignMoneyRecord,
  type OfficeKind,
} from "@/lib/campaign-money";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { label: "Patrick Hope", query: "Patrick Hope" },
  { label: "Kilgore", query: "Kilgore" },
  { label: "Phyllis Randall", query: "Phyllis Randall" },
  { label: "Ashburn school board", query: "Ashburn school board" },
];

const KIND_CHIPS: { label: string; kind: OfficeKind | "all" }[] = [
  { label: "All offices", kind: "all" },
  { label: "House and Senate", kind: "legislator" },
  { label: "Board of Supervisors", kind: "supervisor" },
  { label: "School board", kind: "school-board" },
];

function officeLine(hit: CampaignMoneyHit): string {
  return hit.officeLabel || (hit.chamber === "house" ? `House of Delegates · District ${hit.district}` : hit.chamber === "senate" ? `Senate of Virginia · District ${hit.district}` : hit.kind === "school-board" ? "School Board" : "Board of Supervisors");
}

function personLabel(hit: CampaignMoneyHit): string {
  if (hit.kind === "legislator") return `${hit.chamber === "house" ? "Del." : "Sen."} ${hit.name}`;
  return hit.name;
}

export function CampaignMoneyLookup({
  compact = false,
  initialQuery = "",
  initialKind = "all",
  localityId,
}: {
  compact?: boolean;
  initialQuery?: string;
  initialKind?: OfficeKind | "all";
  localityId?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery.trim());
  const [kind, setKind] = useState<OfficeKind | "all">(initialKind);
  const [localRecords, setLocalRecords] = useState<CampaignMoneyRecord[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/content/finance-local-committees.json")
      .then((mod) => {
        if (cancelled) return;
        const data = (mod as { default?: { committees: Parameters<typeof asLocalRecord>[0][] } }).default ?? (mod as { committees: Parameters<typeof asLocalRecord>[0][] });
        const list = (data as { committees: Parameters<typeof asLocalRecord>[0][] }).committees ?? [];
        setLocalRecords(list.map(asLocalRecord));
      })
      .catch(() => {
        if (!cancelled) setLocalRecords([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const records = useMemo(() => {
    return localRecords ? [...LEGISLATOR_RECORDS, ...localRecords] : LEGISLATOR_RECORDS;
  }, [localRecords]);

  const hits = useMemo(
    () => (submitted ? rankCampaignMoney(records, submitted, 25, { kind, localityId }) : []),
    [submitted, records, kind, localityId],
  );

  function run(next: string) {
    setQ(next);
    setSubmitted(next.trim());
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(q.trim());
  }

  return (
    <div className={cn(compact ? "" : "rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7")}>
      {compact ? null : (
        <>
          <h2 className="font-serif text-2xl font-semibold uppercase">Who is funding this campaign?</h2>
          <p className="mt-2 text-sm text-on-dark-muted">
            Type a person, a district, a donor, or part of a committee name. You do not need the exact official title.
            "Patrick Hope" will find "Friends of Patrick Hope," and "Kilgore" opens our custom view of official state filings.
            This covers sitting House and Senate members, plus Board of Supervisors and school board candidates who have filed
            with the Virginia Department of Elections.
          </p>
        </>
      )}

      <form role="search" onSubmit={onSubmit} className={cn("flex flex-col gap-3 sm:flex-row", compact ? "" : "mt-4")}>
        <label htmlFor="campaign-money-q" className="sr-only">
          Search for an official campaign committee
        </label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-night-muted" aria-hidden />
          <input
            id="campaign-money-q"
            type="search"
            name="q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              const next = e.target.value.trim();
              if (!next) setSubmitted("");
              else if (next.length >= 2 || /^\d{1,3}$/.test(next)) setSubmitted(next);
            }}
            placeholder="Name, district, or part of a committee title"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-12 w-full rounded-md border border-navy-line bg-navy-800 pr-4 pl-11 text-base text-white placeholder:text-night-muted focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-md border border-gold bg-gold px-5 text-sm font-bold text-navy-900 hover:bg-white hover:border-white"
        >
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {KIND_CHIPS.map((chip) => (
          <button
            key={chip.kind}
            type="button"
            onClick={() => setKind(chip.kind)}
            className={cn(
              "rounded-full border border-navy-line bg-navy-800 px-3 py-1.5 text-xs font-medium text-on-dark-muted hover:border-gold hover:text-gold",
              kind === chip.kind && "border-gold text-gold",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {EXAMPLES.map((chip) => (
          <button
            key={chip.query}
            type="button"
            onClick={() => run(chip.query)}
            className={cn(
              "rounded-full border border-navy-line bg-navy-800 px-3 py-1.5 text-xs font-medium text-on-dark-muted hover:border-gold hover:text-gold",
              submitted.toLowerCase() === chip.query.toLowerCase() && "border-gold text-gold",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {submitted ? (
        <div className="mt-5" aria-live="polite">
          {hits.length === 0 && kind !== "legislator" && localRecords === null ? (
            <p className="text-sm text-on-dark-muted">Loading Board of Supervisors and school board committees…</p>
          ) : hits.length === 0 ? (
            <p className="text-sm text-on-dark-muted">
              No official committee matched "{submitted}." Try a last name, a first and last name, or a district like HD 45 or Ashburn.
            </p>
          ) : (
            <>
              <p className="font-mono text-xs tracking-widest text-night-muted uppercase">
                {hits.length} {hits.length === 1 ? "match" : "matches"}
                {localRecords === null ? " · local committees still loading" : ""}
              </p>
              <ul className="mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
                {hits.map((hit) => (
                  <li key={hit.lisId || hit.committeeId} className="px-4 py-3 sm:px-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        {hit.profileHref ? (
                          <Link to={hit.profileHref as never} className="font-semibold text-white hover:text-gold hover:underline">
                            {personLabel(hit)}
                          </Link>
                        ) : (
                          <span className="font-semibold text-white">{personLabel(hit)}</span>
                        )}
                        <div className="text-sm text-on-dark-muted">{officeLine(hit)}</div>
                        <div className="text-sm text-on-dark-muted">
                          Official committee: {hit.committeeName}
                          {hit.committeeCode ? ` (${hit.committeeCode})` : ""}
                        </div>
                      </div>
                      {hit.kind === "legislator" && hit.slug && hit.chamber ? (
                        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                          <Link
                            to="/campaign-money"
                            search={{ member: hit.slug }}
                            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold bg-gold px-4 text-sm font-bold text-navy-900 hover:bg-white hover:border-white"
                          >
                            Our campaign money view
                          </Link>
                          <a
                            href={hit.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center justify-center gap-1 text-xs font-semibold text-gold hover:underline"
                            aria-label={`Official Virginia Department of Elections committee page for ${hit.name}`}
                          >
                            Official state committee page
                            <ExternalLink className="size-3" aria-hidden />
                          </a>
                        </div>
                      ) : (
                        <a
                          href={hit.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900"
                          aria-label={`Official Virginia Department of Elections committee page for ${hit.name}`}
                        >
                          Official committee page
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : compact ? (
        <p className="mt-3 text-xs text-night-muted">You do not need the exact committee title.</p>
      ) : null}
    </div>
  );
}
