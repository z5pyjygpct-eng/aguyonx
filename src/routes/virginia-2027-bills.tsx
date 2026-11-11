import { useMemo, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import { PlainSummaryModal } from "@/components/site/plain-summary-modal";
import { EDITORIAL_LABEL, PENDING_MESSAGE, summaryFor } from "@/lib/va2027-bill-summaries";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import ledgerJson from "@/content/virginia-2027-bills.json";
import {
  categoryCounts,
  categoryIdsOf,
  categoryLabel,
  chamberOptions,
  committeeLines,
  continuedFilings,
  filterBills,
  measureKindCounts,
  newFilings,
  partyOptions,
  patronOptionLabel,
  patronOptions,
  patronRole,
  sortBills,
  statusOptions,
  type BillFilters,
  type BillRecord,
  type Ledger,
} from "@/lib/virginia-2027-bills";

const LEDGER = ledgerJson as Ledger;

export const Route = createFileRoute("/virginia-2027-bills")({
  validateSearch: (s: Record<string, unknown>): BillFilters => ({
    ...(typeof s.q === "string" && s.q.trim() ? { q: s.q.slice(0, 80) } : {}),
    ...(typeof s.category === "string" && s.category ? { category: s.category } : {}),
    ...(typeof s.patron === "string" && s.patron ? { patron: s.patron } : {}),
    ...(typeof s.chamber === "string" && s.chamber ? { chamber: s.chamber } : {}),
    ...(typeof s.party === "string" && s.party ? { party: s.party } : {}),
    ...(typeof s.status === "string" && s.status ? { status: s.status } : {}),
    ...(s.filing === "continued" ? { filing: "continued" as const } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Virginia 2027 bills · A Guy on X" },
      {
        name: "description",
        content:
          "New filings for the Virginia 2027 Regular Session, from the Legislative Information System. Continued bills are not listed. Categories are editorial filters, not official LIS subjects.",
      },
    ],
  }),
  component: Virginia2027BillsPage,
});

const MISSING = "Not in this LIS capture";

function Virginia2027BillsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fresh = useMemo(() => sortBills(newFilings(LEDGER)), []);
  const carried = useMemo(() => sortBills(continuedFilings(LEDGER)), []);
  const filing = search.filing === "continued" ? "continued" : "new";
  const population = filing === "continued" ? carried : fresh;
  const withheld = LEDGER.new_filings.length - fresh.length + (LEDGER.continued.length - carried.length);
  const visible = useMemo(() => filterBills(population, { ...search, filing }), [population, search, filing]);
  const categories = useMemo(() => categoryCounts(LEDGER, population), [population]);
  const patrons = useMemo(() => patronOptions(population), [population]);
  const chambers = useMemo(() => chamberOptions(population), [population]);
  const parties = useMemo(() => partyOptions(population), [population]);
  const statuses = useMemo(() => statusOptions(population), [population]);
  const kinds = useMemo(() => measureKindCounts(fresh), []);
  const withSummary = fresh.filter((b) => b.summary_plain).length;
  const missingParty = fresh.filter((b) => !b.chief_patron_party_code).length;
  const historyEvents = fresh.reduce((n, b) => n + (b.history_event_count ?? 0), 0);
  const active = Boolean(search.q || search.category || search.patron || search.chamber || search.party || search.status || search.filing);

  const setSearch = (patch: { [K in keyof BillFilters]?: BillFilters[K] | "" }) => {
    const next = { ...search, ...patch };
    const clean: BillFilters = {};
    if (next.q) clean.q = next.q;
    if (next.category) clean.category = next.category;
    if (next.patron) clean.patron = next.patron;
    if (next.chamber) clean.chamber = next.chamber;
    if (next.party) clean.party = next.party;
    if (next.status) clean.status = next.status;
    if (next.filing === "continued") clean.filing = "continued";
    navigate({ search: clean, replace: true, resetScroll: false });
  };

  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
            <Breadcrumbs items={[{ label: "Virginia 2027 bills" }]} />
            <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">LIS session {LEDGER.meta.session_code}</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
              Virginia 2027 <span className="text-gold">bills</span>
            </h1>
            <p className="mt-4 max-w-3xl text-base text-on-dark-muted sm:text-lg">
              {fresh.length} new filings for the {LEDGER.meta.session_label}. Continued 2026 measures stay off this list until you choose Continued from 2026.
            </p>
            {kinds.length ? (
              <p className="mt-1 max-w-3xl font-mono text-sm text-gold">{kinds.map((k) => `${k.label}: ${k.count}`).join(" · ")}</p>
            ) : null}
            <p className="mt-2 max-w-3xl text-sm text-on-dark-muted">
              Snapshot captured {LEDGER.meta.captured_at}
              {LEDGER.meta.timezone_note ? ` (${LEDGER.meta.timezone_note})` : ""}. Daily filing updates are a handoff from the CoS watch to Web. This page does not pull LIS itself. Official records:{" "}
              <a href="https://lis.virginia.gov/" target="_blank" rel="noreferrer" className="font-semibold text-gold underline">
                Legislative Information System
              </a>
              {" · "}
              <a href={LEDGER.meta.source_primary} target="_blank" rel="noreferrer" className="font-semibold text-gold underline">
                session bills file
              </a>
              .
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
          {withheld > 0 ? (
            <p className="mt-3 rounded-xl border border-flag bg-[#3a1020] px-4 py-3 text-sm" role="status">
              {withheld} {withheld === 1 ? "row was" : "rows were"} withheld because the filing class did not match its list.
            </p>
          ) : null}

          <section className="mt-4 rounded-xl border border-navy-line bg-navy-700 p-4 sm:p-5" aria-label="Filters">
            <form role="search" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="va2027-q" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">
                Search bill number, title, or patron
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-navy-line bg-navy-800 px-3 focus-within:border-gold">
                <Search className="size-4 shrink-0 text-gold" aria-hidden />
                <input
                  id="va2027-q"
                  type="search"
                  value={search.q ?? ""}
                  onChange={(e) => setSearch({ q: e.target.value })}
                  placeholder="SB837, data center, Favola"
                  className="h-12 w-full min-w-0 bg-transparent text-base text-white placeholder:text-night-muted focus:outline-none"
                />
              </div>
            </form>

            <FilingShortcuts
              fresh={fresh.length}
              carried={carried.length}
              selected={filing}
              onPick={(next) => setSearch({ filing: next === "continued" ? "continued" : "" })}
            />
            {filing === "continued" ? (
              <p className="mt-3 text-sm text-on-dark-muted" role="status">
                Continued from 2026: {carried.length} measures with LIS filing class continued_from_2026 (Carried_over yes). These are 2026 measures carried into this session. Carried over is not recorded as a failure. Continued records: editorial categories not all assigned.
              </p>
            ) : null}
            <PartyShortcuts parties={parties} selected={search.party ?? ""} onPick={(party) => setSearch({ party })} />

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Select label="Patron" value={search.patron ?? ""} onChange={(patron) => setSearch({ patron })}>
                <option value="">All Delegates and Senators ({population.length})</option>
                {patrons.map((p) => (
                  <option key={p.value} value={p.value}>
                    {patronOptionLabel(p)}
                  </option>
                ))}
              </Select>
              <Select label="Chamber" value={search.chamber ?? ""} onChange={(chamber) => setSearch({ chamber })}>
                <option value="">All chambers ({population.length})</option>
                {chambers.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} · {c.count}
                  </option>
                ))}
              </Select>
              <Select label="Party" value={search.party ?? ""} onChange={(party) => setSearch({ party })}>
                <option value="">All parties ({population.length})</option>
                {parties.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} · {p.count}
                  </option>
                ))}
              </Select>
              <Select label="Status" value={search.status ?? ""} onChange={(status) => setSearch({ status })}>
                <option value="">All statuses ({population.length})</option>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} · {s.count}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-4">
              <p className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase" id="va2027-cats">
                Editorial categories · counts from all {population.length} {filing === "continued" ? "continued records" : "new filings"}
              </p>
              <p className="mt-1 text-xs text-night-muted">
                Not official LIS subjects. A filing can be in more than one category, so the counts add up to more than {population.length}.
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="va2027-cats">
                <FilterChip active={!search.category} onClick={() => setSearch({ category: "" })} count={population.length}>
                  All categories
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip key={c.value} value={c.value} active={search.category === c.value} onClick={() => setSearch({ category: search.category === c.value ? "" : c.value })} count={c.count}>
                    {c.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <p className="mt-4 text-sm text-on-dark-muted" aria-live="polite">
              Showing {visible.length} of {population.length} {filing === "continued" ? "continued from 2026" : "new filings"}.
              {active ? (
                <button type="button" onClick={() => navigate({ search: {}, replace: true, resetScroll: false })} className="ml-3 font-semibold text-gold underline">
                  Clear filters
                </button>
              ) : null}
            </p>
          </section>

          <ul className="mt-4 space-y-4">
            {visible.map((bill) => (
              <li key={bill.bill_number}>
                <BillCard bill={bill} />
              </li>
            ))}
          </ul>
          {visible.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-navy-line px-4 py-6 text-sm text-on-dark-muted" role="status">
              No filings match these filters. Clearing them shows all {fresh.length} new filings.
            </p>
          ) : null}

          <section className="mt-8 rounded-xl border border-navy-line bg-navy-700 p-4 text-sm text-on-dark-muted sm:p-5">
            <h2 className="font-serif text-xl font-semibold text-white uppercase">Source and what is missing</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Bill number, title, patrons, chamber, committee, status, introduction date, and links are copied from the LIS capture. Nothing on a card was written to fill a blank.
              </li>
              <li>
                Official summaries are on {withSummary} of {fresh.length} new-filing cards. The other {fresh.length - withSummary} have no Summaries.csv row in this capture.
              </li>
              <li>
                Party is not a column in the LIS bill file. Chief-patron party comes from the chamber roster snapshot named on the card. {missingParty === 0
                  ? `All ${fresh.length} chief patrons in this new-filing set have a roster party.`
                  : `${missingParty} of ${fresh.length} chief patrons have no roster party. Those cards say so.`}
                {typeof LEDGER.meta.counts?.party_missing_chief_patron === "number"
                  ? ` The full session ledger notes ${LEDGER.meta.counts.party_missing_chief_patron} chief patrons without a roster party.`
                  : null}{" "}
                Co-patrons are not given a party unless the row includes one.
              </li>
              <li>
                Categories and confidence are editorial, from the official title and the official summary when one exists. LIS subject codes were not in this capture.
              </li>
              <li>History events attached to these {fresh.length} new filings in this capture: {historyEvents}.</li>
              {LEDGER.meta.counts ? (
                <li>
                  Full session file counts in this ledger: {LEDGER.meta.counts.total ?? "—"} total, {LEDGER.meta.counts.new_2027_filing ?? fresh.length} new,{" "}
                  {LEDGER.meta.counts.continued_from_2026 ?? "—"} continued. Only the new filings are on this page.
                </li>
              ) : null}
            </ul>
            <h3 className="mt-4 font-serif text-base font-semibold text-white uppercase">Sources joined</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <a href="https://lis.virginia.gov/" className="text-gold underline" target="_blank" rel="noreferrer">
                  lis.virginia.gov
                </a>
              </li>
              <li>
                <a href={LEDGER.meta.source_primary} className="break-all text-gold underline" target="_blank" rel="noreferrer">
                  {LEDGER.meta.source_primary}
                </a>
              </li>
              {LEDGER.meta.sources_joined.map((src) =>
                src.startsWith("https://") ? (
                  <li key={src}>
                    <a href={src} className="break-all text-gold underline" target="_blank" rel="noreferrer">
                      {src}
                    </a>
                  </li>
                ) : (
                  <li key={src}>{src}</li>
                ),
              )}
            </ul>
          </section>
        </div>
      </V4Main>
    </SiteShell>
  );
}

function FilingShortcuts({ fresh, carried, selected, onPick }: { fresh: number; carried: number; selected: "new" | "continued"; onPick: (next: "new" | "continued") => void }) {
  const chips = [
    { id: "new" as const, label: "New 2027 filings", count: fresh },
    { id: "continued" as const, label: "Continued from 2026", count: carried },
  ];
  return (
    <div className="mt-4">
      <p id="va2027-filing" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Filing</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="va2027-filing">
        {chips.map((chip) => {
          const active = selected === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              data-filing={chip.id}
              data-count={chip.count}
              aria-pressed={active}
              onClick={() => onPick(chip.id)}
              className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 text-base font-semibold ${active ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-800 text-white hover:border-gold"}`}
            >
              {chip.label}
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-navy-900/15" : "bg-navy-900/60 text-gold"}`}>{chip.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PartyShortcuts({ parties, selected, onPick }: { parties: { value: string; label: string; count: number }[]; selected: string; onPick: (party: string) => void }) {
  const shortcuts = (["R", "D"] as const).flatMap((code) => {
    const row = parties.find((p) => p.value === code);
    return row ? [row] : [];
  });
  if (!shortcuts.length) return null;
  return (
    <div className="mt-4">
      <p id="va2027-party-shortcuts" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Chief patron party</p>
      <p className="mt-1 text-xs text-night-muted">Republican and Democrat use the chief patron’s roster party. A co-patron does not change this filter.</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="va2027-party-shortcuts">
        {shortcuts.map((p) => {
          const active = selected === p.value;
          return (
            <button
              key={p.value}
              type="button"
              data-party-filter={p.value}
              data-count={p.count}
              aria-pressed={active}
              onClick={() => onPick(active ? "" : p.value)}
              className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 text-base font-semibold ${active ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-800 text-white hover:border-gold"}`}
            >
              {p.label}
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-navy-900/15" : "bg-navy-900/60 text-gold"}`}>{p.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  const id = `va2027-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <label htmlFor={id} className="block">
      <span className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-12 w-full rounded-xl border border-navy-line bg-navy-800 px-3 text-sm font-semibold text-white"
      >
        {children}
      </select>
    </label>
  );
}

function FilterChip({ active, onClick, count, children, value = "" }: { active: boolean; onClick: () => void; count: number; children: ReactNode; value?: string }) {
  return (
    <button
      type="button"
      data-category={value}
      data-count={count}
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold ${active ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-800 text-white hover:border-gold"}`}
    >
      {children}
      <span className={`rounded-full px-1.5 text-xs ${active ? "bg-navy-900/15" : "bg-navy-900/60 text-gold"}`}>{count}</span>
    </button>
  );
}

function BillCard({ bill }: { bill: BillRecord }) {
  const committees = committeeLines(bill);
  const ids = categoryIdsOf(bill);
  const sponsorRows = bill.sponsors ?? [];
  const chiefListed = !!bill.chief_patron_id && sponsorRows.some((s) => s.member_id === bill.chief_patron_id);
  const chiefRow = !chiefListed && bill.chief_patron_id
    ? [{ member_id: bill.chief_patron_id, member_name: bill.chief_patron_name || bill.chief_patron?.patron_name_from_bills || "Name not in this capture", patron_type: "not in Sponsors.csv" }]
    : [];
  const patrons = [...chiefRow, ...sponsorRows];
  const rec = summaryFor(bill.bill_number);
  const sourceLinks = [
    { label: "Official LIS page", url: bill.lis_detail_url },
    ...(bill.lis_text_url ? [{ label: "Bill text", url: bill.lis_text_url }] : []),
  ];
  return (
    <article
      id={`bill-${bill.bill_number}`}
      data-bill={bill.bill_number}
      data-categories={ids.join("|")}
      data-chamber={bill.chamber}
      data-party={bill.chief_patron_party_code ?? ""}
      data-status={bill.status_label}
      data-patrons={patrons.map((p) => p.member_id).join("|")}
      className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs tracking-widest text-gold uppercase">{bill.measure_kind} · {bill.chamber}</p>
          <h2 className="mt-1 font-serif text-3xl font-bold text-white">{bill.bill_number}</h2>
        </div>
        <PlainSummaryModal
          title={`${bill.bill_number} · ${bill.title}`}
          summary={rec.status === "ok" ? rec.summary : null}
          status={rec.status}
          editorialLabel={EDITORIAL_LABEL}
          sourceLinks={sourceLinks}
          pendingMessage={PENDING_MESSAGE}
        />
      </div>
      <p className="mt-2 text-base font-semibold text-white">{bill.title}</p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Patrons</dt>
          <dd className="mt-1">
            {patrons.length === 0 ? (
              <span className="text-on-dark-muted">{MISSING}</span>
            ) : (
              <ul className="space-y-1">
                {patrons.map((p) => {
                  const role = patronRole(p.member_id);
                  const isChief = p.member_id === bill.chief_patron_id;
                  const party = isChief ? bill.chief_patron_party : null;
                  return (
                    <li key={p.member_id}>
                      <span className="text-white">
                        {role ? `${role} ` : ""}
                        {p.member_name}
                      </span>
                      <span className="text-on-dark-muted"> · {p.member_id} · {p.patron_type}</span>
                      {party ? <span className="text-white"> · {party}</span> : isChief && !bill.chief_patron_party_code ? <span className="text-on-dark-muted"> · Unavailable</span> : null}
                      {isChief && bill.chief_patron_party_source ? <span className="mt-0.5 block text-xs text-night-muted">Party source: {bill.chief_patron_party_source}</span> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Committee</dt>
          <dd className="mt-1 text-white">{committees.length ? committees.map((c) => c.label).join("; ") : <span className="text-on-dark-muted">{MISSING}</span>}</dd>
        </div>
        <div>
          <dt className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Status</dt>
          <dd className="mt-1 text-white">{bill.status_label || MISSING}</dd>
        </div>
        <div>
          <dt className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Introduced</dt>
          <dd className="mt-1 text-white">{bill.introduction_date || MISSING}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Editorial categories · not LIS subjects</p>
        <ul className="mt-1 space-y-1 text-sm">
          {bill.categories.length === 0 ? <li className="text-on-dark-muted">No editorial category in this capture.</li> : null}
          {bill.categories.map((c) => (
            <li key={c.category_id}>
              <span className="font-semibold text-white">{c.category_label}</span>
              {bill.primary_category_id === c.category_id ? <span className="text-gold"> · primary</span> : null}
              <span className="text-on-dark-muted"> · confidence {c.confidence}</span>
              <span className="mt-0.5 block text-xs text-night-muted">
                {c.evidence} Source: {c.evidence_source}.
              </span>
            </li>
          ))}
        </ul>
        {ids.some((id) => !bill.categories.some((c) => c.category_id === id)) ? (
          <p className="mt-1 text-xs text-night-muted">
            Also tagged {ids.filter((id) => !bill.categories.some((c) => c.category_id === id)).map((id) => categoryLabel(LEDGER, id, bill)).join(", ")}.
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Official summary</p>
        {bill.summary_plain ? (
          <p className="mt-1 text-sm text-white">
            <span className="text-on-dark-muted">{bill.summary_type ?? "Summary"}: </span>
            {bill.summary_plain}
          </p>
        ) : (
          <p className="mt-1 text-sm text-on-dark-muted">No Summaries.csv row in this capture.</p>
        )}
      </div>

      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <a href={bill.lis_detail_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-gold underline">
          Official LIS page <ExternalLink className="size-3.5" aria-hidden />
        </a>
        {bill.lis_text_url ? (
          <a href={bill.lis_text_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-gold underline">
            Bill text <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : (
          <span className="inline-flex min-h-11 items-center text-on-dark-muted">Bill text link: {MISSING}</span>
        )}
      </p>
    </article>
  );
}
