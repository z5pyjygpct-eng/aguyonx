import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, Search } from "lucide-react";
import {
  asLocalRecord,
  LEGISLATOR_RECORDS,
  rankCampaignMoney,
  type CampaignMoneyHit,
  type CampaignMoneyRecord,
  type OfficeKind,
} from "@/lib/campaign-money";
import { loadDonors } from "@/lib/global-search-load";
import type { DonorRecord } from "@/lib/finance-donors";
import type { FinanceDonor, FinanceIndexRow, FinanceSpendItem } from "@/lib/finance-summaries";
import { formatShortDate, formatUsd, kindLabel, reportUrl } from "@/lib/finance-summaries";
import { loadAllFinanceSummaries, loadFinanceIndex } from "@/lib/finance-summaries-load";
import type { FinanceSummary } from "@/lib/finance-summaries";
import {
  DOLLAR_RANGE_PILLS,
  DONOR_TYPE_PILLS,
  donorsFromGlobal,
  donorsFromSummaries,
  filterDonors,
  mergeFilterDonors,
  toggleList,
  type DollarRangePill,
  type DonorTypePill,
  type FilterDonor,
} from "@/lib/campaign-money-filters";
import { parseMoneyQuery, searchByAmount, searchLocalMoney, type AmountHit, type LocalMoneyHit } from "@/lib/money-query";
import { cn } from "@/lib/utils";

const KIND_CHIPS: { label: string; kind: OfficeKind | "all" }[] = [
  { label: "All offices", kind: "all" },
  { label: "House and Senate", kind: "legislator" },
  { label: "Board of Supervisors", kind: "supervisor" },
  { label: "School board", kind: "school-board" },
];


function FilterChip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-xs font-medium",
        pressed
          ? "border-gold bg-gold text-navy-900"
          : "border-navy-line bg-navy-800 text-on-dark-muted hover:border-gold hover:text-gold",
      )}
    >
      {label}
    </button>
  );
}

function DonorFilterRow({ donor }: { donor: FilterDonor }) {
  const [open, setOpen] = useState(false);
  const gifts = donor.gifts ?? [];
  const giftWord = donor.count === 1 ? "gift" : "gifts";
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-navy-600/40"
      >
        <span className="flex min-w-0 items-start gap-2">
          <ChevronDown className={`mt-0.5 size-4 shrink-0 text-gold transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
          <span className="min-w-0">
            <span className="block font-semibold">{donor.name}</span>
            <span className="block text-xs text-night-muted">
              {kindLabel(donor.kind)}
              {donor.count ? ` · ${donor.count} ${giftWord}` : ""}
              {` · ${open ? "Hide gifts" : "See gifts"}`}
            </span>
          </span>
        </span>
        <span className="shrink-0 font-serif text-lg font-bold text-gold">{formatUsd(donor.cents)}</span>
      </button>
      {open ? (
        <ul className="divide-y divide-navy-line/50 border-t border-navy-line/50 bg-navy-900/40">
          {gifts.length === 0 ? (
            <li className="px-4 py-3 pl-10 text-sm text-on-dark-muted">
              Official itemized dates for this total are on the state report
              {donor.donorId ? ", or on this donor's campaign-money page." : "."}
            </li>
          ) : (
            gifts.map((gift, i) => (
              <li key={`${gift.date ?? "undated"}-${gift.cents}-${gift.recipientSlug ?? ""}-${i}`} className="px-4 py-3 pl-10">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold">{gift.type === "inkind" ? "In-kind" : "Direct"}</span>
                    {gift.date ? ` · ${formatShortDate(gift.date)}` : ""}
                    {gift.item ? ` · ${gift.item}` : ""}
                    {gift.recipientName ? ` · to ${gift.recipientName}` : ""}
                  </span>
                  <span className="shrink-0 font-serif text-base font-bold text-gold">{formatUsd(gift.cents)}</span>
                </div>
                {gift.reportId ? (
                  <a
                    href={reportUrl(gift.reportId)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                  >
                    State report {gift.reportId}
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : null}
              </li>
            ))
          )}
          {donor.donorId ? (
            <li className="px-4 py-3 pl-10">
              <Link
                to="/campaign-money"
                search={{ donor: donor.donorId }}
                className="text-sm font-semibold text-gold hover:underline"
              >
                See all official gifts from this donor
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}
    </li>
  );
}

function officeLine(hit: CampaignMoneyHit): string {
  return hit.officeLabel || (hit.chamber === "house" ? `House of Delegates · District ${hit.district}` : hit.chamber === "senate" ? `Senate of Virginia · District ${hit.district}` : hit.kind === "school-board" ? "School Board" : "Board of Supervisors");
}

function personLabel(hit: CampaignMoneyHit): string {
  if (hit.kind === "legislator") return `${hit.chamber === "house" ? "Del." : "Sen."} ${hit.name}`;
  return hit.name;
}

function amountSearch(hit: AmountHit): { member?: string; donor?: string } {
  const raw = hit.href.split("?")[1] ?? "";
  const params = new URLSearchParams(raw);
  return {
    member: params.get("member") ?? undefined,
    donor: params.get("donor") ?? undefined,
  };
}

export function CampaignMoneyLookup({
  compact = false,
  embedded = false,
  initialQuery = "",
  initialKind = "all",
  localityId,
  inputId,
  placeholder,
  scope,
}: {
  compact?: boolean;
  embedded?: boolean;
  initialQuery?: string;
  initialKind?: OfficeKind | "all";
  localityId?: string;
  inputId?: string;
  placeholder?: string;
  scope?: {
    donors?: FinanceDonor[];
    vendors?: { name: string; cents: number; count?: number; items?: FinanceSpendItem[] }[];
  };
}) {
  const searchInputId = inputId ?? (embedded ? "profile-campaign-money-q" : "campaign-money-q");
  const searchPlaceholder =
    placeholder ??
    (embedded
      ? "Donor or vendor here, or another name / $10k+"
      : "Search a candidate, district (HD 45), donor like Clean Virginia, or $10k+...");
  const [q, setQ] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery.trim());
  const [kind, setKind] = useState<OfficeKind | "all">(initialKind);
  const [localRecords, setLocalRecords] = useState<CampaignMoneyRecord[] | null>(null);
  const [members, setMembers] = useState<FinanceIndexRow[] | null>(null);
  const [donors, setDonors] = useState<DonorRecord[] | null>(null);
  const [summaries, setSummaries] = useState<FinanceSummary[] | null>(null);
  const [donorTypes, setDonorTypes] = useState<DonorTypePill[]>([]);
  const [ranges, setRanges] = useState<DollarRangePill[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadFinanceIndex(), loadDonors(), loadAllFinanceSummaries()])
      .then(([index, list, rows]) => {
        if (cancelled) return;
        setMembers(index.members);
        setDonors(list);
        setSummaries(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setMembers([]);
          setDonors([]);
          setSummaries([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const money = useMemo(() => (submitted ? parseMoneyQuery(submitted) : null), [submitted]);
  const nameQuery = money ? money.rest : submitted;
  const hits = useMemo(
    () => (nameQuery ? rankCampaignMoney(records, nameQuery, 25, { kind, localityId }) : []),
    [nameQuery, records, kind, localityId],
  );
  const amountHits = useMemo(() => {
    if (!money) return [];
    if (members == null || donors == null) return null;
    let list = searchByAmount(money, members, donors, 25);
    if (kind === "legislator") list = list.filter((h) => h.kind === "legislator");
    if (kind === "supervisor" || kind === "school-board") list = list.filter((h) => h.kind === "donor");
    return list;
  }, [money, members, donors, kind]);
  const localHits = useMemo(
    () => (submitted && scope ? searchLocalMoney(submitted, scope.donors, scope.vendors, 8) : []),
    [submitted, scope, scope?.donors, scope?.vendors],
  );
  const row2On = donorTypes.length > 0 || ranges.length > 0;
  const shouldSearch = Boolean(submitted) || row2On;
  const campaignSlugs = useMemo(() => {
    if (!nameQuery || !hits.length) return undefined;
    const slugs = new Set(hits.map((hit) => hit.slug).filter((slug): slug is string => Boolean(slug)));
    return slugs.size ? slugs : undefined;
  }, [nameQuery, hits]);
  const scopedDonors = useMemo(() => {
    const memberDonors =
      kind === "supervisor" || kind === "school-board" ? [] : donorsFromSummaries(summaries ?? [], campaignSlugs);
    const localDonors = donorsFromGlobal(
      donors ?? [],
      records.filter((row) => row.kind !== "legislator"),
      kind,
    );
    if (kind === "legislator") return memberDonors;
    if (kind === "supervisor" || kind === "school-board") return localDonors;
    return mergeFilterDonors([memberDonors, localDonors]);
  }, [summaries, donors, records, kind, campaignSlugs]);
  const donorHits = useMemo(() => {
    if (!shouldSearch) return [];
    if (!row2On && campaignSlugs) return [];
    return filterDonors(scopedDonors, {
      types: donorTypes,
      ranges,
      // If the query already selected a campaign, don't also require the donor's name to match it.
      query: campaignSlugs ? "" : submitted,
      money,
      cap: row2On ? 40 : 8,
    });
  }, [shouldSearch, row2On, scopedDonors, donorTypes, ranges, submitted, money, campaignSlugs]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(q.trim());
  }

  function clearFilters() {
    setQ("");
    setSubmitted("");
    setKind("all");
    setDonorTypes([]);
    setRanges([]);
  }

  const filtersOn = kind !== "all" || donorTypes.length > 0 || ranges.length > 0 || Boolean(submitted);

  return (
    <div className={cn(compact ? "" : "rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7")}>
      {compact ? null : (
        <>
          <h2 className="font-serif text-2xl font-semibold uppercase">Who is funding this campaign?</h2>
          <p className="mt-2 text-sm text-on-dark-muted">
            Type a person, a district, a donor, or a dollar amount, and combine it with the office, donor-type, and total-given
            filters below. Totals are official aggregate gifts, not a single check. You do not need the exact committee title.
            This covers sitting House and Senate members, plus Board of Supervisors and school board candidates who have filed
            with the Virginia Department of Elections.
          </p>
        </>
      )}

      <form role="search" onSubmit={onSubmit} className={cn("flex flex-col gap-3 sm:flex-row", compact ? "" : "mt-4")}>
        <label htmlFor={searchInputId} className="sr-only">
          {embedded
            ? "Search this campaign's donors and vendors, or another candidate, donor, or dollar amount"
            : "Search for an official campaign committee"}
        </label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-night-muted" aria-hidden />
          <input
            id={searchInputId}
            type="search"
            name="q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              const next = e.target.value.trim();
              if (!next) setSubmitted("");
              else if (next.length >= 2 || /^\d{1,3}$/.test(next) || parseMoneyQuery(next)) setSubmitted(next);
            }}
            placeholder={searchPlaceholder}
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

      {embedded ? null : (
        <div className="mt-3 space-y-3">
          <div>
            <p id="campaign-money-office" className="font-mono text-[10px] font-semibold tracking-widest text-night-muted uppercase">
              Office
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="campaign-money-office">
              {KIND_CHIPS.map((chip) => (
                <FilterChip
                  key={chip.kind}
                  label={chip.label}
                  pressed={kind === chip.kind}
                  onClick={() => setKind(kind === chip.kind && chip.kind !== "all" ? "all" : chip.kind)}
                />
              ))}
            </div>
          </div>
          <div>
            <p id="campaign-money-donor-type" className="font-mono text-[10px] font-semibold tracking-widest text-night-muted uppercase">
              Donor type · official categories
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="campaign-money-donor-type">
              {DONOR_TYPE_PILLS.map((chip) => (
                <FilterChip
                  key={chip.id}
                  label={chip.label}
                  pressed={donorTypes.includes(chip.id)}
                  onClick={() => setDonorTypes((list) => toggleList(list, chip.id))}
                />
              ))}
            </div>
          </div>
          <div>
            <p id="campaign-money-donor-total" className="font-mono text-[10px] font-semibold tracking-widest text-night-muted uppercase">
              Total given · aggregate, not a single check
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="campaign-money-donor-total">
              {DOLLAR_RANGE_PILLS.map((chip) => (
                <FilterChip
                  key={chip.id}
                  label={chip.label}
                  pressed={ranges.includes(chip.id)}
                  onClick={() => setRanges((list) => toggleList(list, chip.id))}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {shouldSearch ? (
        <div className="mt-5" aria-live="polite">
          {row2On && summaries === null ? (
            <p className="text-sm text-on-dark-muted">Loading official donor totals…</p>
          ) : hits.length === 0 && !amountHits?.length && !localHits.length && !donorHits.length && kind !== "legislator" && localRecords === null ? (
            <p className="text-sm text-on-dark-muted">Loading Board of Supervisors and school board committees…</p>
          ) : money && amountHits === null && !localHits.length && !donorHits.length ? (
            <p className="text-sm text-on-dark-muted">Looking up dollar amounts…</p>
          ) : hits.length === 0 && !amountHits?.length && !localHits.length && !donorHits.length ? (
            <p className="text-sm text-on-dark-muted">
              No official committee, donor, vendor, or dollar-amount match{submitted ? ` for "{submitted}"` : " for these filters"}.
              Try a last name, a district like HD 45, or an amount such as $15,000, 50k, or $10k+.
              {filtersOn ? (
                <button type="button" onClick={clearFilters} className="ml-2 font-semibold text-gold underline">
                  Clear filters
                </button>
              ) : null}
            </p>
          ) : (
            <>
              <p className="font-mono text-xs tracking-widest text-night-muted uppercase">
                {(hits.length + (amountHits?.length ?? 0) + localHits.length + donorHits.length)} {(hits.length + (amountHits?.length ?? 0) + localHits.length + donorHits.length) === 1 ? "match" : "matches"}
                {localRecords === null ? " · local committees still loading" : ""}
                {filtersOn ? (
                  <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-gold underline normal-case tracking-normal">
                    Clear filters
                  </button>
                ) : null}
              </p>
              {donorHits.length > 0 ? (
                <ul className="mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
                  {donorHits.map((donor) => (
                    <DonorFilterRow key={donor.id} donor={donor} />
                  ))}
                </ul>
              ) : null}
              {localHits.length > 0 ? (
                <ul className={donorHits.length > 0 ? "mt-4 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800" : "mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800"}>
                  {localHits.map((hit: LocalMoneyHit) => (
                    <li key={`${hit.kind}-${hit.name}`} className="px-4 py-3 sm:px-5">
                      {hit.donorId ? (
                        <Link
                          to="/campaign-money"
                          search={{ donor: hit.donorId }}
                          className="font-semibold text-white hover:text-gold hover:underline"
                        >
                          {hit.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-white">{hit.name}</span>
                      )}
                      <div className="mt-1 text-xs uppercase tracking-widest text-gold">
                        {hit.kind === "donor" ? "Donor on this campaign" : "Vendor on this campaign"}
                      </div>
                      <div className="text-sm text-on-dark-muted">{hit.snippet}</div>
                    </li>
                  ))}
                </ul>
              ) : null}
              {amountHits && amountHits.length > 0 ? (
                <ul className={localHits.length > 0 || donorHits.length > 0 ? "mt-4 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800" : "mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800"}>
                  {amountHits.map((hit) => {
                    const search = amountSearch(hit);
                    return (
                      <li key={hit.id} className="px-4 py-3 sm:px-5">
                        <Link
                          to="/campaign-money"
                          search={search}
                          className="font-semibold text-white hover:text-gold hover:underline"
                        >
                          {hit.title}
                        </Link>
                        <div className="text-xs uppercase tracking-widest text-gold mt-1">
                          {hit.kind === "legislator" ? "Campaign total" : "Donor total"}
                          {hit.match === "min" ? " · at or above" : hit.match === "near" ? " · near this amount" : " · exact match"}
                        </div>
                        <div className="text-sm text-on-dark-muted">{hit.snippet}</div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {hits.length > 0 ? (
              <ul className={(amountHits && amountHits.length > 0) || localHits.length > 0 || donorHits.length > 0 ? "mt-4 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800" : "mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800"}>
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
              ) : null}
            </>
          )}
        </div>
      ) : compact ? (
        <p className="mt-3 text-xs text-night-muted">
          {embedded
            ? "Search this campaign's donors and vendors, or jump to another candidate, donor, or amount such as $15,000 or $10k+."
            : "You do not need the exact committee title. Combine the office, donor-type, and total-given filters with anything you type."}
        </p>
      ) : null}
    </div>
  );
}
