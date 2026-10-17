import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Play } from "lucide-react";
import { SiteShell } from "@/components/site/shell";

export type GaBill = { session: string; bill: string; title: string; outcome: "signed" | "vetoed" | "passed" | "failed" | "tabled"; status: string; statusDate: string; subjects: string[]; href: string };
export type GaCounts = { total: number; passed: number; signed: number; vetoed: number; passedNoGovAction: number; failed: number; tabled: number };
export type GaMember = {
  slug: string; name: string; district: number; party: "D" | "R"; lisId: string; chamber: "house" | "senate"; committees: string[];
  bills: GaBill[]; billCounts: Record<string, GaCounts>; coPatronCounts: Record<string, number>;
  subjectCounts: [string, number][]; subjectBills: number;
  votes: { total: number; yea: number; nay: number; abstain: number; notVoting: number; withParty: number; againstParty: number };
  recentVotes: { date: string; session: string; vote: string; bills: { bill: string; title: string; action: string; voteHref: string }[]; moreBills: number }[];
};
export type GaMeta = { generated: string; sources: string[]; floorRollCalls: number };

const SESS: Record<string, string> = { "20261": "2026 Regular Session", "20262": "2026 Special Session I" };
const PARTY = { D: { label: "Democrat", color: "#7FA7FF" }, R: { label: "Republican", color: "#FF7A85" } } as const;
const VOTE: Record<string, { label: string; cls: string }> = {
  Y: { label: "Yea", cls: "text-[#7EE0A0]" }, N: { label: "Nay", cls: "text-[#FF7A85]" }, A: { label: "Abstain", cls: "text-gold" }, X: { label: "Not voting", cls: "text-night-muted" },
};
const OUT: Record<GaBill["outcome"], string> = { signed: "Signed", vetoed: "Vetoed", passed: "Passed", failed: "Failed", tabled: "Tabled / continued" };
const SUFFIX = /^(Jr\.?|Sr\.?|II|III|IV)$/;

function dateLabel(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function splitName(n: string) {
  const parts = n.replace(/,/g, "").split(/\s+/);
  let i = parts.length - 1;
  while (i > 0 && SUFFIX.test(parts[i])) i--;
  return { first: parts.slice(0, i).join(" "), last: parts.slice(i).join(" ") };
}
const surname = (n: string) => splitName(n).last.split(" ")[0];

function Card({ title, badge, children, id }: { title: string; badge?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="min-w-0 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7">
      <h2 className="flex flex-wrap items-center gap-3 font-serif text-2xl font-semibold uppercase">
        {title}
        {badge ? <span className="rounded border border-gold/60 px-2 py-0.5 font-sans text-[11px] font-bold tracking-wide text-gold normal-case">{badge}</span> : null}
      </h2>
      <div className="mt-5">{children}</div>
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
function Stat({ n, label, tone = "text-gold" }: { n: number | string; label: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-3">
      <div className={`font-serif text-3xl font-bold ${tone}`}>{n}</div>
      <div className="mt-1 text-xs tracking-wide text-on-dark-muted uppercase">{label}</div>
    </div>
  );
}

function Hero({ chamber, crumb, title, sub }: { chamber: "house" | "senate"; crumb: string; title: React.ReactNode; sub: React.ReactNode }) {
  const ch = chamber === "house" ? { label: "House of Delegates", all: "All delegates" } : { label: "Senate", all: "All senators" };
  return (
    <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
      <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-night-muted">
          <Link to="/" className="hover:text-white">Home</Link><span className="mx-2 text-gold">›</span>
          <Link to="/dashboards/general-assembly" className="hover:text-white">General Assembly</Link><span className="mx-2 text-gold">›</span>
          <Link to="/dashboards/$body" params={{ body: chamber }} className="hover:text-white">{ch.label}</Link><span className="mx-2 text-gold">›</span>
          <Link to={`/dashboards/${chamber}/members`} className="hover:text-white">Members</Link><span className="mx-2 text-gold">›</span>
          <span className="font-semibold text-white">{crumb}</span>
        </nav>
        <Link to={`/dashboards/${chamber}/members`} className="mt-6 inline-block font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase hover:underline">‹ {ch.all}</Link>
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">{title}</h1>
        <div className="mt-3 text-on-dark-muted">{sub}</div>
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

export function GaMemberProfile({ m, meta }: { m: GaMember; meta: GaMeta }) {
  const { first, last } = splitName(m.name);
  const title = m.chamber === "house" ? "Del." : "Sen.";
  const p = PARTY[m.party];
  const reg = m.billCounts["20261"];
  const spec = m.billCounts["20262"];
  const [filter, setFilter] = useState<"all" | GaBill["outcome"] | "passedAll">("all");
  const shown = m.bills.filter((b) => filter === "all" || (filter === "passedAll" ? ["signed", "vetoed", "passed"].includes(b.outcome) : b.outcome === filter));
  const v = m.votes;
  const unity = v.withParty + v.againstParty ? Math.round((1000 * v.withParty) / (v.withParty + v.againstParty)) / 10 : null;
  const ftm = `/dashboards/${m.chamber}/find-the-moment?q=${encodeURIComponent(surname(m.name))}`;
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <Hero chamber={m.chamber} crumb={m.name} title={<>{title} {first} <span className="text-gold">{last}</span></>}
          sub={<>District {m.district} · <span style={{ color: p.color }}>{p.label}</span> · {m.chamber === "house" ? "Virginia House of Delegates" : "Senate of Virginia"}</>} />
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-8 lg:grid-cols-2">
          <Card title="Summary">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-night-muted">Chamber</dt><dd className="font-semibold">{m.chamber === "house" ? "House of Delegates" : "Senate"}</dd></div>
              <div><dt className="text-night-muted">District</dt><dd className="font-semibold">{m.district}</dd></div>
              <div><dt className="text-night-muted">Party</dt><dd className="font-semibold" style={{ color: p.color }}>{p.label}</dd></div>
              <div><dt className="text-night-muted">LIS member ID</dt><dd className="font-mono">{m.lisId}</dd></div>
            </dl>
            <h3 className="mt-6 text-sm font-semibold tracking-wide text-gold uppercase">Committees (2026, LIS)</h3>
            {m.committees.length ? (
              <ul className="mt-2 flex flex-wrap gap-2">{m.committees.map((c) => <li key={c} className="rounded-full border border-navy-line bg-navy-800 px-3 py-1 text-sm">{c}</li>)}</ul>
            ) : <div className="mt-2"><Soon text="LIS lists no committee seats for this member." /></div>}
            <div className="mt-6 grid gap-3">
              <Soon text="First elected" />
              <Soon text="Office & contact" />
            </div>
          </Card>
          <Card title="Voting scorecard" badge="LIS 2026 floor votes">
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
            <h3 className="mt-6 text-sm font-semibold tracking-wide text-gold uppercase">Recent floor votes</h3>
            <ul className="mt-2 divide-y divide-navy-line/70 rounded-lg border border-navy-line bg-navy-800">
              {m.recentVotes.map((r, i) => (
                <li key={i} className="flex items-start gap-3 px-3 py-2 text-sm">
                  <span className={`w-20 shrink-0 font-semibold ${VOTE[r.vote]?.cls ?? ""}`}>{VOTE[r.vote]?.label ?? r.vote}</span>
                  <span className="min-w-0 flex-1">
                    {r.bills.map((b, j) => (
                      <span key={b.bill} className="block">{j ? "" : <span className="font-mono text-xs text-night-muted">{dateLabel(r.date)} · </span>}
                        <a href={b.voteHref} target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">{b.bill}</a> <span className="text-on-dark-muted">{b.title}</span></span>
                    ))}
                    {r.moreBills ? <span className="block text-xs text-night-muted">+{r.moreBills} more bills on this roll call</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card id="bills" title={`Bills patroned, 2026 (${reg.total})`} badge="LIS 2026">
            <p className="text-sm text-on-dark-muted">Chief patron only; counts are the {SESS["20261"]}.{spec.total ? ` ${SESS["20262"]}: ${spec.total} more (${spec.passed} passed, ${spec.failed} failed, ${spec.tabled} tabled), listed below.` : ""} Also co-patron on {m.coPatronCounts["20261"] + m.coPatronCounts["20262"]} bills (not listed).</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => setFilter("passedAll")} className="rounded-lg border border-navy-line border-l-4 border-l-[#7EE0A0] bg-navy-800 px-4 py-3 text-left hover:border-gold">
                <div className="text-xs tracking-wide text-on-dark-muted uppercase">Passed</div><div className="font-serif text-3xl font-bold text-[#7EE0A0]">{reg.passed}</div>
                <div className="text-xs text-night-muted">{reg.signed} signed · {reg.vetoed} vetoed{reg.passedNoGovAction ? ` · ${reg.passedNoGovAction} resolutions/no gov. action` : ""}</div>
              </button>
              <button type="button" onClick={() => setFilter("failed")} className="rounded-lg border border-navy-line border-l-4 border-l-[#FF7A85] bg-navy-800 px-4 py-3 text-left hover:border-gold">
                <div className="text-xs tracking-wide text-on-dark-muted uppercase">Failed</div><div className="font-serif text-3xl font-bold text-[#FF7A85]">{reg.failed}</div>
                <div className="text-xs text-night-muted">stricken, passed by indefinitely, incorporated, defeated</div>
              </button>
              <button type="button" onClick={() => setFilter("tabled")} className="rounded-lg border border-navy-line border-l-4 border-l-gold bg-navy-800 px-4 py-3 text-left hover:border-gold">
                <div className="text-xs tracking-wide text-on-dark-muted uppercase">Tabled / continued</div><div className="font-serif text-3xl font-bold text-gold">{reg.tabled}</div>
                <div className="text-xs text-night-muted">left in committee, laid on table, continued to 2027</div>
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {(["all", "passedAll", "signed", "vetoed", "failed", "tabled"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 ${filter === f ? "border-gold bg-gold text-navy-900" : "border-navy-line text-on-dark-muted hover:text-white"}`}>
                  {f === "all" ? "All" : f === "passedAll" ? "Passed" : OUT[f]}
                </button>
              ))}
            </div>
            {m.bills.length ? (
              <ul className="mt-3 max-h-[520px] divide-y divide-navy-line/70 overflow-y-auto rounded-lg border border-navy-line bg-navy-800">
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
            ) : <div className="mt-3"><Soon text="No chief-patron bills in the 2026 LIS files." /></div>}
          </Card>
          <div className="grid min-w-0 content-start gap-6">
            <Card title="Bill subjects" badge="LIS subjects">
              {m.subjectCounts.length ? (
                <>
                  <ul className="flex flex-wrap gap-2">{m.subjectCounts.map(([s, n]) => <li key={s} className="rounded-full border border-navy-line bg-navy-800 px-3 py-1 text-sm">{s} <span className="text-gold">{n}</span></li>)}</ul>
                  <p className="mt-3 text-xs text-night-muted">LIS has published subjects for only {m.subjectBills} of this member's {m.bills.length} bills so far.</p>
                </>
              ) : <Soon text="LIS has not published subjects for this member's 2026 bills." />}
            </Card>
            <Card title="Find the Moment">
              <a href={ftm} className="flex min-h-[72px] items-center gap-4 rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-800 px-5 py-3 hover:bg-navy-600">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold"><Play className="size-5" aria-hidden /></span>
                <span className="flex-1 text-lg font-semibold">Search floor video for “{surname(m.name)}”</span>
                <ArrowRight className="size-5 text-gold" aria-hidden />
              </a>
            </Card>
            <Card title="Financials"><Soon text="Campaign finance from cfreports.elections.virginia.gov." /></Card>
          </div>
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
