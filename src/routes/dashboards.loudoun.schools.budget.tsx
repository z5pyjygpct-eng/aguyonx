import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, FileText } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { V4VenueHero, FoiaButton } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { LcpsBudgetSearch } from "@/components/site/lcps-budget-search";
import { LCPS_BUDGET_DOCS, LCPS_BUDGET_FY27 as B } from "@/content/lcps-budget";

export const Route = createFileRoute("/dashboards/loudoun/schools/budget")({
  head: () => ({ meta: [{ title: "LCPS Budget & Finance · A Guy on X" }] }),
  component: Page,
});

const pct = (n: number) => `${((n / B.schoolOperatingAdopted) * 100).toFixed(1)}%`;
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const other = B.schoolOperatingAdopted - B.localTaxFunding;
const card = "rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6";
const lab = "font-mono text-xs tracking-widest text-gold uppercase";

function Q({ n, q, children }: { n: string; q: string; children: React.ReactNode }) {
  return (
    <section className={card}>
      <p className={lab}>Question {n}</p>
      <h2 className="mt-1 font-serif text-2xl font-semibold uppercase">{q}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Bar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div>
      <div className="flex h-8 overflow-hidden rounded-md">
        {parts.map((p) => <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />)}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-baseline gap-2">
            <span className="inline-block size-3 shrink-0 rounded-sm" style={{ background: p.color }} />
            <span className="flex-1">{p.label}</span>
            <span className="font-mono tabular-nums">{usd(p.value)}</span>
            <span className="w-14 text-right font-mono text-night-muted">{((p.value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Page() {
  const v = V4_VENUES["loudoun-lcps"];
  const max = B.schoolOperatingAdopted;
  return (
    <SiteShell>
      <V4Main>
        <V4VenueHero venue={v} kicker="Budget & Finance" />
        <div role="status" className="bg-gold text-navy-900"><p className="mx-auto max-w-7xl px-4 py-3 text-center font-serif text-lg font-bold tracking-[0.14em] uppercase sm:px-8">Coming soon · Preview mockup — not yet live</p></div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <section className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-6 sm:p-8">
            <p className={lab}>{B.fiscalYear} school operating fund · BOS Adopted</p>
            <p className="mt-2 font-serif text-5xl font-bold tabular-nums text-gold sm:text-7xl">{B.schoolOperatingAdoptedLabel}</p>
            <p className="mt-3 max-w-3xl text-base text-[#F6F3EA]">
              One year of day-to-day school spending ({B.fiscalSpan}), as appropriated by the Board of Supervisors.
              Up <span className="font-mono text-gold">{B.yoyChangeLabel}</span> from FY2026. Buildings are budgeted separately.
            </p>
            <p className="mt-3 text-xs text-night-muted">Per-pupil cost not shown: no sourced FY27 enrollment figure on file.</p>
            <div className="mt-5 flex flex-wrap gap-3"><FoiaButton foia={v.foia} /></div>
          </section>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Q n="1" q="Where does the money come from?">
              <Bar parts={[
                { label: "Local tax funding (county transfer)", value: B.localTaxFunding, color: "#F5B82E" },
                { label: "State, federal & other", value: other, color: "#2C4F86" },
              ]} />
              <p className="mt-3 text-sm text-night-muted">About {pct(B.localTaxFunding)} is local tax. "State, federal & other" is the remainder of the operating total, not a separately printed line.</p>
            </Q>
            <Q n="2" q="Where does it go?">
              <Bar parts={[
                { label: "School operating (salaries, programs, buses)", value: B.schoolOperatingAdopted, color: "#F5B82E" },
                { label: "School capital projects (CIP yr 1)", value: B.schoolCapitalProjects, color: "#C8102E" },
                { label: "CAPP (preserving buildings)", value: B.schoolCapp, color: "#6E8FC4" },
              ]} />
              <p className="mt-3 text-sm text-night-muted">Operating vs. capital. A line-by-line split of operating spending isn't in our data yet.</p>
            </Q>
            <Q n="3" q="What's changing year over year?">
              <div className="space-y-3">
                {[{ y: "FY2026", v: B.fy26OperatingAdopted }, { y: "FY2027", v: B.schoolOperatingAdopted }].map((r) => (
                  <div key={r.y}>
                    <div className="flex justify-between text-sm"><span className="font-mono">{r.y}</span><span className="font-mono tabular-nums">{usd(r.v)}</span></div>
                    <div className="mt-1 h-6 rounded bg-navy-800"><div className="h-6 rounded" style={{ width: `${(r.v / max) * 100}%`, background: r.y === "FY2027" ? "#F5B82E" : "#2C4F86" }} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">{B.yoyChangeLabel}</p>
              <p className="text-sm text-night-muted">+{((B.yoyChange / B.fy26OperatingAdopted) * 100).toFixed(1)}% operating, adopted to adopted. Plus a May 12, 2026 School Board amendment of {B.may12OperatingAmendmentLabel} (state compensation), not in these bars.</p>
            </Q>
          </div>

          <section className="mt-8">
            <h2 className="font-serif text-3xl font-semibold uppercase">Search the budget papers</h2>
            <div className="mt-4 rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-2"><LcpsBudgetSearch /></div>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">Hosted source files <span className="font-mono text-base text-night-muted">({LCPS_BUDGET_DOCS.length})</span></h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {LCPS_BUDGET_DOCS.map((doc) => (
                <li key={doc.href} id={`budget-doc-${doc.extractId}`}>
                  <a href={doc.href} target="_blank" rel="noopener noreferrer" className="flex h-full items-start gap-3 rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 px-4 py-3 hover:border-gold">
                    <FileText className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
                    <span className="min-w-0">
                      <span className="block font-semibold">{doc.label}</span>
                      <span className="mt-0.5 flex flex-wrap gap-2 font-mono text-[11px] uppercase">
                        <span className="rounded bg-gold px-1.5 text-navy-900">{doc.kind}</span>
                        <span className="text-night-muted">{doc.sizeLabel} · {doc.source}</span>
                      </span>
                      <span className="mt-1 block text-xs text-night-muted">{doc.dek}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-night-muted">
              Official doors: <a className="text-gold hover:underline" href="https://www.lcps.org/budget" target="_blank" rel="noreferrer">lcps.org/budget <ExternalLink className="inline size-3" /></a> · <a className="text-gold hover:underline" href="https://www.loudoun.gov/budget" target="_blank" rel="noreferrer">loudoun.gov/budget <ExternalLink className="inline size-3" /></a> · <a className="text-gold hover:underline" href="/files/lcps-budget/LCPS-budget-kitchen-table.md" target="_blank" rel="noreferrer">plain-English guide</a> · <Link to="/dashboards/loudoun/schools/policies" className="text-gold hover:underline">LCPS policies →</Link>
            </p>
          </section>
          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">How the budget gets made</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {[["Proposed", "Superintendent's Estimate of Needs (SEON)"], ["School Board Adopted", "School Board revises and adopts a request (Feb 2026)"], ["BOS Adopted", "Board of Supervisors appropriates the local dollars (Apr 2026)"]].map(([t, d], i) => (
                <li key={t} className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-4">
                  <p className="font-mono text-xs text-gold">STEP {i + 1}</p>
                  <p className="font-serif text-xl font-semibold uppercase">{t}</p>
                  <p className="text-sm text-night-muted">{d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 max-w-3xl text-sm text-night-muted">
              Loudoun schools are fiscally dependent on the county; they don't set the property tax. SEON, School Board Adopted Executive Summary and BOS Adopted Schedule all print {B.schoolOperatingAdoptedLabel}, but each PDF is still what it is. Still missing: a full multi-section FY27 School Board Adopted book (like FY26) and the FY27 BOS appropriations resolution packet.
            </p>
          </section>

          <figure className="mt-10 overflow-hidden rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-[#F6F3EA]">
            <img src="/files/lcps-budget/fy2027-operating-vs-ltf.png" alt="FY2027 Loudoun School Operating Fund total versus local tax funding, BOS Adopted" className="w-full" width={1600} height={900} loading="lazy" />
            <figcaption className="bg-navy-700 px-4 py-3 text-sm text-night-muted">
              FY2027 operating total vs local tax funding (BOS Adopted). Source: Loudoun County FY2027 Adopted Budget Executive Summary / Budget in Brief.
            </figcaption>
          </figure>

        </div>
      </V4Main>
    </SiteShell>
  );
}
