import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, ExternalLink, FileText, Landmark, Mail, Phone, Play } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { GA_CONTACT_GENERATED, GA_MEMBER_CONTACT } from "@/content/ga-member-contact";
import { GA_DASHBOARD } from "@/lib/ga-dashboard";
import { billSentenceParts, breakdownBills, coPatronTotal, dateLabel, isHonorResolution, joinPlain, type BillBreakdown } from "@/lib/ga-member-stats";

export type GaBill = { session: string; bill: string; title: string; outcome: "signed" | "vetoed" | "passed" | "failed" | "tabled"; status: string; statusDate: string; subjects: string[]; categories?: string[]; href: string };
export type GaCounts = { total: number; passed: number; signed: number; vetoed: number; passedNoGovAction: number; failed: number; tabled: number };
export type GaMember = {
  slug: string; name: string; district: number; party: "D" | "R"; lisId: string; chamber: "house" | "senate"; committees: string[];
  bills: GaBill[]; billCounts: Record<string, GaCounts>; coPatronCounts: Record<string, number>;
  subjectCounts: [string, number][]; subjectBills: number;
  categoryCounts?: [string, number][]; categoryBills?: number;
  votes: { total: number; yea: number; nay: number; abstain: number; notVoting: number; withParty: number; againstParty: number };
  recentVotes: { date: string; session: string; vote: string; bills: { bill: string; title: string; action: string; voteHref: string }[]; moreBills: number }[];
};
export type GaMeta = { generated: string; sources: string[]; floorRollCalls: number };

const PARTY = { D: { label: "Democrat", color: "#7FA7FF" }, R: { label: "Republican", color: "#FF7A85" } } as const;
const VOTE: Record<string, { label: string; cls: string }> = {
  Y: { label: "Yea", cls: "text-[#7EE0A0]" }, N: { label: "Nay", cls: "text-[#FF7A85]" }, A: { label: "Abstain", cls: "text-gold" }, X: { label: "Not voting", cls: "text-night-muted" },
};
const OUT: Record<GaBill["outcome"], string> = { signed: "Signed", vetoed: "Vetoed", passed: "Passed", failed: "Failed", tabled: "Tabled / continued" };
const OUT_CLS: Record<GaBill["outcome"], string> = { signed: "text-[#7EE0A0]", vetoed: "text-[#FF7A85]", passed: "text-[#7EE0A0]", failed: "text-[#FF7A85]", tabled: "text-gold" };
const SUFFIX = /^(Jr\.?|Sr\.?|II|III|IV)$/;

function splitName(n: string) {
  const parts = n.replace(/,/g, "").split(/\s+/);
  let i = parts.length - 1;
  while (i > 0 && SUFFIX.test(parts[i])) i--;
  return { first: parts.slice(0, i).join(" "), last: parts.slice(i).join(" ") };
}
const surname = (n: string) => splitName(n).last.split(" ")[0];

function Card({ title, badge, children, id, asOf }: { title: string; badge?: string; children: React.ReactNode; id?: string; asOf?: string }) {
  return (
    <section id={id} className="min-w-0 scroll-mt-24 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7">
      <h2 className="flex flex-wrap items-center gap-3 font-serif text-2xl font-semibold uppercase">
        {title}
        {badge ? <span className="rounded border border-gold/60 px-2 py-0.5 font-sans text-[11px] font-bold tracking-wide text-gold normal-case">{badge}</span> : null}
      </h2>
      <div className="mt-5">{children}</div>
      {asOf ? <p className="mt-5 border-t border-navy-line/60 pt-3 text-xs text-night-muted">{asOf}</p> : null}
    </section>
  );
}
function Soon({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-navy-line bg-navy-800 px-4 py-3">
      <span className="text-sm text-on-dark-muted">{text ?? "No published data yet."}</span>
      <span className="shrink-0 whitespace-nowrap rounded-full bg-on-dark-muted px-3 py-1 text-xs font-bold text-navy-800">Coming soon</span>
    </div>
  );
}
function MemberContact({ lisId, chamber }: { lisId: string; chamber: "house" | "senate" }) {
  const c = GA_MEMBER_CONTACT[lisId];
  if (!c || (!c.firstElected && !c.office && !c.phone && !c.email)) return null;
  return (
    <div className="mt-6 grid gap-3 text-sm">
      {c.firstElected ? (
        <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-3">
          <div className="text-night-muted">First elected to the {chamber === "house" ? "House" : "Senate"}</div>
          <div className="font-semibold">{c.firstElected}</div>
        </div>
      ) : null}
      {c.office || c.phone || c.email ? (
        <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-3">
          <div className="text-night-muted">Capitol office &amp; contact</div>
          {c.office ? <address className="not-italic font-semibold">{c.office.map((l) => <span key={l} className="block">{l}</span>)}</address> : null}
          {c.phone ? <div className="mt-2">Phone: <a href={`tel:${c.phone.replace(/[^\d]/g, "")}`} className="font-semibold text-gold hover:underline">{c.phone}</a></div> : null}
          {c.email ? <div className="break-all">Email: <a href={`mailto:${c.email}`} className="font-semibold text-gold hover:underline">{c.email}</a></div> : null}
          <div className="mt-2 text-xs text-night-muted">As of {dateLabel(GA_CONTACT_GENERATED)} · Source: <a href={c.source} target="_blank" rel="noreferrer" className="underline hover:text-white">LIS member page</a> (official General Assembly Building office)</div>
        </div>
      ) : null}
    </div>
  );
}
function Stat({ n, label, tone = "text-gold" }: { n: number | string; label: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-3">
      <div className={`font-serif text-3xl font-bold ${tone}`}>{n}</div>
      <div className="mt-1 text-xs tracking-wide text-on-dark-muted uppercase">{label}</div>
    </div>
  );
}

const HERO_BTN = "inline-flex min-h-11 items-center gap-2 rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900";
const HERO_BTN_MAIN = "inline-flex min-h-11 items-center gap-2 rounded-md border border-gold bg-gold px-4 text-sm font-bold text-navy-900 hover:bg-white hover:border-white";

/** Phone, email, LIS page and FOIA buttons. Each one appears only when the data for it exists. */
function HeroActions({ m }: { m: GaMember }) {
  const c = GA_MEMBER_CONTACT[m.lisId];
  const lisPage = c?.source ?? `https://lis.virginia.gov/member-information/${m.lisId}/members-legislators`;
  // FOIA target is the one already verified on the Scott-approved General Assembly dashboard (House or Senate clerk's request form).
  const foia = GA_DASHBOARD.columns.find((col) => col.name.includes(m.chamber === "house" ? "House" : "Senate"))?.foia;
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        {c?.phone ? <a href={`tel:${c.phone.replace(/[^\d]/g, "")}`} className={HERO_BTN_MAIN}><Phone className="size-4" aria-hidden />Call {c.phone}</a> : null}
        {c?.email ? <a href={`mailto:${c.email}`} aria-label={`Email ${c.email}`} className={HERO_BTN}><Mail className="size-4" aria-hidden />Email the office</a> : null}
        <a href={lisPage} target="_blank" rel="noreferrer" className={HERO_BTN}><Landmark className="size-4" aria-hidden />LIS member page<ExternalLink className="size-3" aria-hidden /></a>
        {foia ? <a href={foia.href} target="_blank" rel="noreferrer" className={HERO_BTN}><FileText className="size-4" aria-hidden />{foia.label}<ExternalLink className="size-3" aria-hidden /></a> : null}
      </div>
      {foia ? <p className="mt-2 text-xs text-night-muted">Records requests go to the {m.chamber === "house" ? "House" : "Senate"} Clerk's office, which handles them for the whole chamber.</p> : null}
    </div>
  );
}

function Hero({ chamber, crumb, title, sub, actions }: { chamber: "house" | "senate"; crumb: string; title: React.ReactNode; sub: React.ReactNode; actions?: React.ReactNode }) {
  const ch = chamber === "house" ? { label: "House of Delegates", all: "All delegates" } : { label: "Senate", all: "All senators" };
  return (
    <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
      <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
        <Breadcrumbs
          items={[
            { label: "General Assembly", to: "/dashboards/general-assembly" },
            { label: ch.label, to: "/dashboards/$body", params: { body: chamber } },
            { label: "Members", to: `/dashboards/${chamber}/members` },
            { label: crumb },
          ]}
        />
        <Link to={`/dashboards/${chamber}/members`} className="mt-6 inline-block font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase hover:underline">‹ {ch.all}</Link>
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">{title}</h1>
        <div className="mt-3 text-on-dark-muted">{sub}</div>
        {actions}
      </div>
    </section>
  );
}

function SourceNote({ meta }: { meta: GaMeta }) {
  return (
    <p className="text-xs text-night-muted">
      Source: LIS public data files ({meta.sources.map((s, i) => <span key={s}>{i ? ", " : ""}<a href={s + "BILLS.CSV"} className="underline hover:text-white">{s.replace("https://", "")}</a></span>)}) — BILLS, HISTORY, VOTE, Sponsors, CommitteeMembers. Built {dateLabel(meta.generated)}. Floor roll calls only; committee votes excluded.
    </p>
  );
}


function billsForGroup(bills: GaBill[], name: string, tags: (b: GaBill) => string[]) {
  return bills.filter((b) => tags(b).includes(name));
}

function SubjectGroup({ name, bills, defaultOpen }: { name: string; bills: GaBill[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-navy-line/70 last:border-b-0">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-navy-600/40">
        <ChevronDown className={`size-4 shrink-0 text-gold transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
        <span className="min-w-0 flex-1 font-semibold">{name}</span>
        <span className="font-serif text-xl font-bold text-gold">{bills.length}</span>
      </button>
      {open ? (
        <ul className="border-t border-navy-line/50 bg-navy-800">
          {bills.map((b) => (
            <li key={b.session + b.bill} className="px-3 py-2 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <a href={b.href} target="_blank" rel="noreferrer" className="font-mono font-semibold text-gold hover:underline">{b.bill}<ExternalLink className="ml-1 inline size-3" aria-hidden /></a>
                <span className={`shrink-0 text-xs ${OUT_CLS[b.outcome]}`}>{OUT[b.outcome]}{b.session === "20262" ? " · Special I" : ""}</span>
              </div>
              <div className="text-on-dark-muted">{b.title}</div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SubjectGroupList({ groups, bills, tags }: { groups: [string, number][]; bills: GaBill[]; tags: (b: GaBill) => string[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-navy-line bg-navy-800">
      {groups.map(([name]) => {
        const list = billsForGroup(bills, name, tags);
        return <SubjectGroup key={name} name={name} bills={list} defaultOpen={list.length > 0 && list.length <= 8} />;
      })}
    </div>
  );
}

function BillSubjectsCard({ m, asOf }: { m: GaMember; asOf?: string }) {
  const official = m.subjectCounts ?? [];
  const categories = m.categoryCounts ?? [];
  const officialBills = m.subjectBills ?? 0;
  const categoryBills = m.categoryBills ?? 0;
  const uncategorized = m.bills.filter((b) => !(b.subjects && b.subjects.length) && !((b.categories ?? []).length));
  const badge = official.length && categories.length ? "LIS subjects + aguyonx categories" : official.length ? "LIS subjects" : categories.length ? "aguyonx categories" : "LIS subjects";
  const note = officialBills && categoryBills
    ? `LIS has published official subjects for ${officialBills} of this member's ${m.bills.length} bills, shown first. The remaining ${categoryBills} ${categoryBills === 1 ? "bill is" : "bills are"} grouped by aguyonx categories based on each bill's official LIS title and summary.`
    : officialBills && officialBills < m.bills.length
      ? `LIS has published official subjects for ${officialBills} of this member's ${m.bills.length} bills so far.`
      : officialBills
        ? "Official LIS subjects for this member's 2026 bills."
        : categoryBills
          ? `LIS has not published official subjects for ${m.bills.length === 1 ? "this bill" : `these ${m.bills.length} bills`}. The groups below are aguyonx categories based on each bill's official LIS title and summary. Every bill links to its LIS page.`
          : m.bills.length
            ? `LIS has not published official subjects for this member's ${m.bills.length} bills, and no clear category could be taken from the official titles or summaries.`
            : "No chief-patron bills in the 2026 LIS files.";
  return (
    <Card title="Bill subjects" badge={badge} asOf={asOf}>
      {m.bills.length ? <p className="mb-4 text-xs text-night-muted">{note}</p> : null}
      {official.length ? (
        <div className="mb-5">
          {categories.length || uncategorized.length ? <h3 className="mb-2 text-sm font-semibold tracking-wide text-gold uppercase">Official LIS subjects</h3> : null}
          <SubjectGroupList groups={official} bills={m.bills} tags={(b) => b.subjects ?? []} />
        </div>
      ) : null}
      {categories.length ? (
        <div>
          {official.length ? <h3 className="mb-2 text-sm font-semibold tracking-wide text-gold uppercase">aguyonx categories <span className="font-sans text-[11px] font-bold tracking-wide text-gold/80 normal-case">(from LIS titles and summaries)</span></h3> : null}
          <SubjectGroupList groups={categories} bills={m.bills} tags={(b) => b.categories ?? []} />
        </div>
      ) : null}
      {uncategorized.length ? (
        <div className={official.length || categories.length ? "mt-5" : ""}>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-gold uppercase">Uncategorized</h3>
          <p className="mb-2 text-xs text-night-muted">No official LIS subject, and no clear category from the official LIS title or summary. Each bill still links to its LIS page.</p>
          <div className="overflow-hidden rounded-lg border border-navy-line bg-navy-800">
            <SubjectGroup defaultOpen={uncategorized.length <= 8} name="Uncategorized" bills={uncategorized} />
          </div>
        </div>
      ) : null}
      {!m.bills.length ? <Soon text="No chief-patron bills in the 2026 LIS files." /> : null}
    </Card>
  );
}

type BillFilter = "all" | "signed" | "vetoed" | "honor" | "otherPassed" | "failed" | "tabled";
const FILTER_LABEL: Record<BillFilter, string> = { all: "All", signed: "Became law", vetoed: "Vetoed", honor: "Honor resolutions", otherPassed: "Also passed", failed: "Did not pass", tabled: "Left in committee" };
const FILTER_TONE: Record<Exclude<BillFilter, "all">, string> = { signed: "border-l-[#7EE0A0] text-[#7EE0A0]", vetoed: "border-l-[#FF7A85] text-[#FF7A85]", honor: "border-l-gold text-gold", otherPassed: "border-l-[#7EE0A0] text-[#7EE0A0]", failed: "border-l-[#FF7A85] text-[#FF7A85]", tabled: "border-l-gold text-gold" };
const FILTER_NOTE: Record<Exclude<BillFilter, "all">, string> = {
  signed: "signed by the governor", vetoed: "vetoed by the governor", honor: "remembering or commending people", otherPassed: "passed the General Assembly",
  failed: "defeated, stricken, or folded into another bill", tabled: "or continued to 2027",
};
const BILLS_FIRST = 8;

function matchesFilter(b: GaBill, f: BillFilter) {
  if (f === "all") return true;
  if (f === "honor") return isHonorResolution(b);
  if (f === "otherPassed") return b.outcome === "passed" && !isHonorResolution(b);
  return b.outcome === f;
}

function BillsCard({ m, counts, asOf }: { m: GaMember; counts: BillBreakdown; asOf: string }) {
  const [filter, setFilter] = useState<BillFilter>("all");
  const [all, setAll] = useState(false);
  const co = coPatronTotal(m);
  const keys = (["signed", "vetoed", "honor", "otherPassed", "failed", "tabled"] as const).filter((k) => counts[k] > 0);
  const filtered = m.bills.filter((b) => matchesFilter(b, filter));
  const shown = all ? filtered : filtered.slice(0, BILLS_FIRST);
  const parts = billSentenceParts(counts);
  const who = `${m.chamber === "house" ? "Del." : "Sen."} ${surname(m.name)}`;
  const pick = (f: BillFilter) => { setFilter(f); setAll(false); };
  return (
    <Card id="bills" title={`Bills patroned, 2026 (${counts.total})`} badge="LIS 2026" asOf={asOf}>
      <p className="text-sm text-on-dark-muted">
        {who} was the chief patron (the main sponsor) of {counts.total} {counts.total === 1 ? "bill or resolution" : "bills and resolutions"} in 2026
        {parts.length ? <>. Of those, {joinPlain(parts)}.</> : "."} This counts the 2026 Regular Session and Special Session I.
        {co ? ` ${who} also signed on as a co-patron (a supporting sponsor) of ${co.toLocaleString()} more, which are not listed here.` : ""}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {keys.map((k) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => pick(filter === k ? "all" : k)} className={`rounded-lg border border-l-4 bg-navy-800 px-4 py-3 text-left hover:border-gold ${filter === k ? "border-gold" : "border-navy-line"} ${FILTER_TONE[k].split(" ")[0]}`}>
            <div className="text-xs tracking-wide text-on-dark-muted uppercase">{FILTER_LABEL[k]}</div>
            <div className={`font-serif text-3xl font-bold ${FILTER_TONE[k].split(" ")[1]}`}>{counts[k]}</div>
            <div className="text-xs text-night-muted">{FILTER_NOTE[k]}</div>
          </button>
        ))}
      </div>
      {keys.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {(["all", ...keys] as BillFilter[]).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => pick(f)} className={`min-h-8 rounded-full border px-3 py-1 ${filter === f ? "border-gold bg-gold text-navy-900" : "border-navy-line text-on-dark-muted hover:text-white"}`}>
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      ) : null}
      <ul className="mt-3 divide-y divide-navy-line/70 rounded-lg border border-navy-line bg-navy-800">
        {shown.map((b) => (
          <li key={b.session + b.bill} className="px-3 py-2 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <a href={b.href} target="_blank" rel="noreferrer" className="font-mono font-semibold text-gold hover:underline">{b.bill}<ExternalLink className="ml-1 inline size-3" aria-hidden /></a>
              <span className="shrink-0 text-xs text-night-muted">{OUT[b.outcome]}{b.session === "20262" ? " · Special I" : ""}</span>
            </div>
            <div>{b.title}</div>
            <div className="text-xs text-night-muted">{b.status}{b.statusDate ? ` · ${dateLabel(b.statusDate)}` : ""}</div>
          </li>
        ))}
      </ul>
      {filtered.length > BILLS_FIRST ? (
        <button type="button" aria-expanded={all} onClick={() => setAll(!all)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900">
          {all ? `Show first ${BILLS_FIRST}` : `Show all ${filtered.length}`}
          <ChevronDown className={`size-4 transition-transform ${all ? "rotate-180" : ""}`} aria-hidden />
        </button>
      ) : null}
    </Card>
  );
}

type VoteRow = GaMember["recentVotes"][number];

/** Consecutive roll calls on the same bill(s) and date become one group. */
function groupVotes(rows: VoteRow[]) {
  const groups: { key: string; items: VoteRow[] }[] = [];
  for (const r of rows) {
    const key = `${r.date}|${r.bills.map((b) => b.bill).join(",")}|${r.moreBills}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(r);
    else groups.push({ key, items: [r] });
  }
  return groups;
}

function VoteLabel({ vote }: { vote: string }) {
  return <span className={`font-semibold ${VOTE[vote]?.cls ?? ""}`}>{VOTE[vote]?.label ?? vote}</span>;
}

function VoteBills({ r }: { r: VoteRow }) {
  return (
    <>
      {r.bills.map((b) => (
        <span key={b.bill} className="block">
          <a href={b.voteHref} target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">{b.bill}</a> <span className="text-on-dark-muted">{b.title}</span>
        </span>
      ))}
      {r.moreBills ? <span className="block text-xs text-night-muted">+{r.moreBills} more bills on this roll call</span> : null}
    </>
  );
}

function VoteGroup({ items }: { items: VoteRow[] }) {
  const [open, setOpen] = useState(false);
  const first = items[0];
  if (items.length === 1) {
    return (
      <li className="flex items-start gap-3 px-3 py-2 text-sm">
        <span className="w-20 shrink-0"><VoteLabel vote={first.vote} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-xs text-night-muted">{dateLabel(first.date)}</span>
          <VoteBills r={first} />
          {first.bills[0]?.action ? <span className="block text-xs text-night-muted">{first.bills[0].action}</span> : null}
        </span>
      </li>
    );
  }
  const tally = Object.entries(items.reduce<Record<string, number>>((a, r) => ({ ...a, [r.vote]: (a[r.vote] ?? 0) + 1 }), {}));
  return (
    <li className="text-sm">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-navy-600/40">
        <span className="w-20 shrink-0">
          {tally.length === 1 ? <><VoteLabel vote={tally[0][0]} /> <span className="text-night-muted">×{tally[0][1]}</span></> : tally.map(([v, n]) => <span key={v} className="block"><VoteLabel vote={v} /> <span className="text-night-muted">×{n}</span></span>)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-xs text-night-muted">{dateLabel(first.date)} · {items.length} roll calls on the same {first.bills.length > 1 ? "bills" : "bill"}</span>
          <VoteBills r={first} />
          <span className="mt-0.5 block text-xs text-gold">{open ? "Hide each vote" : `Show each of the ${items.length} votes`}</span>
        </span>
        <ChevronDown className={`mt-1 size-4 shrink-0 text-gold transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
      </button>
      {open ? (
        <ul className="divide-y divide-navy-line/50 border-t border-navy-line/50 bg-navy-900/40">
          {items.map((r, i) => (
            <li key={i} className="flex items-start gap-3 py-2 pr-3 pl-6 text-xs">
              <span className="w-16 shrink-0 text-sm"><VoteLabel vote={r.vote} /></span>
              <span className="min-w-0 flex-1 text-on-dark-muted">
                {r.bills[0]?.action ?? "Floor vote"}
                {r.bills[0]?.voteHref ? <> · <a href={r.bills[0].voteHref} target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">LIS vote<ExternalLink className="ml-1 inline size-3" aria-hidden /></a></> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function GaMemberProfile({ m, meta }: { m: GaMember; meta: GaMeta }) {
  const { first, last } = splitName(m.name);
  const title = m.chamber === "house" ? "Del." : "Sen.";
  const p = PARTY[m.party];
  const counts = breakdownBills(m.bills);
  const co = coPatronTotal(m);
  const v = m.votes;
  const unity = v.withParty + v.againstParty ? Math.round((1000 * v.withParty) / (v.withParty + v.againstParty)) / 10 : null;
  const ftm = `/dashboards/${m.chamber}/find-the-moment?q=${encodeURIComponent(surname(m.name))}`;
  const built = dateLabel(meta.generated);
  const asOf = `As of ${built} · Source: LIS`;
  const contact = GA_MEMBER_CONTACT[m.lisId];
  const hasContact = !!contact && !!(contact.firstElected || contact.office || contact.phone || contact.email);
  const hasSummary = m.committees.length > 0 || hasContact;
  const hasVotes = v.total > 0;
  const hasSubjects = counts.total > 0 && ((m.subjectCounts ?? []).length > 0 || (m.categoryCounts ?? []).length > 0);
  const glance: { n: number; label: string; href: string }[] = [
    { n: m.committees.length, label: "Committee seats", href: "#summary" },
    { n: counts.total, label: "Bills as chief patron", href: "#bills" },
    { n: co, label: "Bills co-patroned", href: "#bills" },
    { n: v.total, label: "Floor roll calls on record", href: "#votes" },
  ].filter((g) => g.n > 0);
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <Hero chamber={m.chamber} crumb={m.name} title={<>{title} {first} <span className="text-gold">{last}</span></>}
          sub={<>District {m.district} · <span style={{ color: p.color }}>{p.label}</span> · {m.chamber === "house" ? "Virginia House of Delegates" : "Senate of Virginia"}</>}
          actions={<HeroActions m={m} />} />
        <div className="mx-auto grid max-w-7xl items-start gap-6 px-4 py-10 sm:px-8 lg:grid-cols-2">
          {glance.length ? (
            <div className="lg:col-span-2">
              <ul className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]" aria-label="At a glance">
                {glance.map((g) => (
                  <li key={g.label}>
                    <a href={g.href} className="block h-full rounded-lg border border-navy-line bg-navy-700 px-4 py-3 hover:border-gold">
                      <div className="font-serif text-3xl font-bold text-gold">{g.n.toLocaleString()}</div>
                      <div className="mt-1 text-xs tracking-wide text-on-dark-muted uppercase">{g.label}</div>
                      <div className="mt-1 text-[11px] text-night-muted">LIS · as of {built}</div>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg border border-navy-line border-l-4 border-l-gold bg-navy-700/60 px-4 py-3 text-sm text-on-dark-muted">
                <strong className="text-white">How to read this page:</strong> every number here is a count from the General Assembly's own public records (called LIS). They are counts, not grades or opinions. Each card shows where its facts come from and the date the data was pulled. Votes are full-chamber floor votes only, not committee votes.
              </p>
            </div>
          ) : null}
          {hasSummary ? (
            <div className={`min-w-0 lg:self-stretch [&>section]:h-full ${hasVotes ? "" : "lg:col-span-2"}`}><Card id="summary" title="Summary" asOf={`${m.committees.length ? `Committees as of ${built} · Source: LIS · ` : ""}LIS member ID ${m.lisId}`}>
                {m.committees.length ? (
                  <>
                    <h3 className="text-sm font-semibold tracking-wide text-gold uppercase">Committees (2026, LIS)</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">{m.committees.map((c) => <li key={c} className="rounded-full border border-navy-line bg-navy-800 px-3 py-1 text-sm">{c}</li>)}</ul>
                  </>
                ) : null}
                <MemberContact lisId={m.lisId} chamber={m.chamber} />
              </Card></div>
          ) : null}
          {hasVotes ? (
            <div className={`min-w-0 lg:self-stretch [&>section]:h-full ${hasSummary ? "" : "lg:col-span-2"}`}><Card id="votes" title="Voting scorecard" badge="LIS 2026 floor votes" asOf={asOf}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat n={v.yea} label="Yea" tone="text-[#7EE0A0]" />
                <Stat n={v.nay} label="Nay" tone="text-[#FF7A85]" />
                <Stat n={v.abstain} label="Abstain" />
                <Stat n={v.notVoting} label="Not voting" tone="text-on-dark-muted" />
              </div>
              <p className="mt-3 text-sm text-on-dark-muted">{v.total.toLocaleString()} of {meta.floorRollCalls.toLocaleString()} {m.chamber === "house" ? "House" : "Senate"} floor roll calls in 2026 (Regular + Special Session I) list this member.</p>
              {unity !== null && (
                <p className="mt-2 text-sm"><span className="font-serif text-2xl font-bold text-gold">{unity}%</span> voted with the {p.label} majority <span className="text-night-muted">({v.withParty.toLocaleString()} of {(v.withParty + v.againstParty).toLocaleString()} yea/nay votes where that caucus's majority voted one way)</span></p>
              )}
              {m.recentVotes.length ? (
                <>
                  <h3 className="mt-6 text-sm font-semibold tracking-wide text-gold uppercase">Most recent floor votes on record</h3>
                  <ul className="mt-2 divide-y divide-navy-line/70 rounded-lg border border-navy-line bg-navy-800">
                    {groupVotes(m.recentVotes).map((g, i) => <VoteGroup key={g.key + i} items={g.items} />)}
                  </ul>
                </>
              ) : null}
            </Card></div>
          ) : null}
          <div className="min-w-0 lg:col-span-2">
            <Card title="Find the Moment">
              <a href={ftm} className="flex min-h-[72px] items-center gap-4 rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-800 px-5 py-3 hover:bg-navy-600">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold"><Play className="size-5" aria-hidden /></span>
                <span className="flex-1 text-lg font-semibold">Search floor video for “{surname(m.name)}”</span>
                <ArrowRight className="size-5 text-gold" aria-hidden />
              </a>
            </Card>
          </div>
          {counts.total ? (
            <div className={`min-w-0 ${hasSubjects ? "" : "lg:col-span-2"}`}>
              <BillsCard m={m} counts={counts} asOf={asOf} />
            </div>
          ) : null}
          {hasSubjects ? <div className="min-w-0"><BillSubjectsCard m={m} asOf={asOf} /></div> : null}
          <div className="lg:col-span-2"><SourceNote meta={meta} /></div>
        </div>
      </main>
    </SiteShell>
  );
}

export function GaVacancyProfile({ district }: { district: number }) {
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <Hero chamber="house" crumb={`District ${district} (vacant)`} title={<>District {district} <span className="text-gold">Vacant</span></>}
          sub={<>Virginia House of Delegates · Special election Nov 3</>} />
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-8 lg:grid-cols-2">
          <Card title="Summary">
            <p className="text-on-dark-muted">House District {district} has no sitting delegate. A special election is set for Nov 3.</p>
            <div className="mt-5 grid gap-3"><Soon text="Candidates" /><Soon text="Results" /></div>
          </Card>
          <Card title="Record"><div className="grid gap-3"><Soon text="Bills" /><Soon text="Floor votes" /><Soon text="Financials" /></div></Card>
        </div>
      </main>
    </SiteShell>
  );
}
