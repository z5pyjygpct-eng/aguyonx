import { useState } from "react";
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

// Virginia state spending categories, FY27 SEON "Expenditures by State Category", FY27 column (display only).
const CATEGORIES = [
  { name: "Instruction", short: "$1.61B", pct: "78.0%", value: 1_612_910_188 },
  { name: "Operation & Maintenance", short: "$178.5M", pct: "8.6%", value: 178_524_084 },
  { name: "Pupil Transportation", short: "$97.4M", pct: "4.7%", value: 97_367_661 },
  { name: "Technology", short: "$73.2M", pct: "3.5%", value: 73_248_625 },
  { name: "Administration", short: "$57.2M", pct: "2.8%", value: 57_156_692 },
  { name: "Attendance & Health", short: "$40.1M", pct: "1.9%", value: 40_077_274 },
  { name: "Facilities", short: "$7.7M", pct: "0.4%", value: 7_670_145 },
];
// FY27 operating-fund departments, SEON p.20 Budget Summary (Operating column).
// cats = state categories each department feeds, per SEON p.64 "Reconciliation of School Funds to State Mandated
// Categories" (that table lists Administration, Attendance and Health as one row, so both chips use it).
// Non-Departmental, Charter School and School Board are not named in that table: shown under All only.
const AAH = ["Administration", "Attendance & Health"];
const DEPARTMENTS: { name: string; page: number; value: number; pct: string; cats: string[] }[] = [
  { name: "School Leadership", page: 157, value: 788_560_281, pct: "38.2%", cats: ["Instruction", ...AAH] },
  { name: "Student Services", page: 167, value: 421_085_534, pct: "20.4%", cats: ["Instruction", ...AAH] },
  { name: "Support Services", page: 193, value: 265_249_703, pct: "12.8%", cats: [...AAH, "Pupil Transportation", "Operation & Maintenance", "Facilities"] },
  { name: "Teaching and Learning", page: 207, value: 264_953_026, pct: "12.8%", cats: ["Instruction", ...AAH] },
  { name: "Non-Departmental", page: 145, value: 153_933_036, pct: "7.4%", cats: [] },
  { name: "Digital Innovation", page: 125, value: 73_248_625, pct: "3.5%", cats: ["Technology"] },
  { name: "Office of the Superintendent", page: 183, value: 29_228_953, pct: "1.4%", cats: [...AAH, "Pupil Transportation", "Operation & Maintenance"] },
  { name: "HR & Talent Dev", page: 135, value: 25_182_188, pct: "1.2%", cats: [...AAH] },
  { name: "Business & Financial Services", page: 97, value: 13_217_533, pct: "0.6%", cats: [...AAH] },
  { name: "Academics", page: 91, value: 13_099_848, pct: "0.6%", cats: [...AAH] },
  { name: "Communications & Community Engagement", page: 113, value: 9_070_338, pct: "0.4%", cats: [...AAH] },
  { name: "Charter School", page: 103, value: 8_378_039, pct: "0.4%", cats: [] },
  { name: "School Board", page: 151, value: 1_747_563, pct: "0.1%", cats: [] },
];

function DepartmentSection() {
  const [cat, setCat] = useState("All");
  const rows = cat === "All" ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.cats.includes(cat));
  return (
    <section className="mt-8 rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6">
      <h2 className="font-serif text-2xl font-semibold uppercase">By LCPS Department</h2>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by state category">
        {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-sm ${cat === c ? "border-gold bg-gold font-semibold text-navy-900" : "border-navy-line text-on-dark-muted hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-night-muted">
        {cat === "All" ? "All 13 operating-fund departments." : `Departments that feed ${cat}, per the SEON reconciliation table (p.64).`} Amounts are full department totals; a department can span several state categories, and the SEON does not split department dollars by category.
      </p>
      <ul className="mt-3 divide-y divide-navy-line/70 rounded-lg border border-navy-line bg-navy-800">
        {rows.map((d) => (
          <li key={d.name} className="flex items-baseline gap-3 px-4 py-2.5">
            <span className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere] sm:text-base"><span className="font-semibold">{d.name}</span> <span className="text-sm text-night-muted">(<a href={`${SEON_PDF}#page=${d.page + 9}`} target="_blank" rel="noreferrer" className="text-gold underline-offset-2 hover:underline">p. {d.page}</a>)</span></span>
            <span className="shrink-0 font-mono text-sm tabular-nums text-gold sm:text-base">{usd(d.value)}</span>
            <span className="w-12 shrink-0 text-right font-mono text-xs text-night-muted sm:w-14 sm:text-sm">{d.pct}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-night-muted">Source: FY27 SEON p.20, Budget Summary (Operating column); category links from SEON p.64, Reconciliation of School Funds to State Mandated Categories. Operating fund only; School Nutrition (Food Services) excluded. Page = start of department section, FY27 SEON table of contents.</p>
    </section>
  );
}

const SEON_PDF = "/files/lcps-budget/FY2027-lcps-superintendent-estimate-of-needs.pdf";
// Highlight callouts (Scott-approved wording). page = PDF page index for the #page link.
const CALLOUTS = [
  { title: "Administration", key: ["$57.2M"], text: "$57.2M for administration (2.8% of operating): central office policy, leadership, HR, finance and communications.", page: 82,
    source: "FY27 SEON p.73, Expenditures by State Category, Administration $57,156,692." },
  { title: "Special Education", key: ["$421M Student Services", "2,649 positions"], text: "2,649 special education positions (about 1,024 teachers and 1,150 assistants) inside a $421M Student Services budget (20.4% of operating).", page: 178,
    source: "SEON Dept of Student Services, budget total $421,085,534 (p.169) and Special Education Program staffing of 2,649.0 FTE (p.173)." },
  { title: "English Learner", key: ["515 staff"], text: "515 English learner staff, including 450 teachers, serving about 11,900 students, plus $4.2M in new English learner staffing in FY27.", page: 221,
    source: "SEON Teaching & Learning, English Learner Programs 515.3 FTE / Teacher, EL 450.3 (pp.212–213); 11,890 EL students served 2024-25 (statistics page); FY27 EL enhancements $2,691,158 + $936,443 + $545,439." },
];
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

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {CALLOUTS.map((c) => (
              <section key={c.text} className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-5">
                <h3 className="font-serif text-xl font-semibold tracking-wide text-gold uppercase">{c.title}</h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {c.key.map((k) => <p key={k} className="font-serif text-3xl font-bold tabular-nums text-white">{k}</p>)}
                </div>
                <p className="mt-3 text-base leading-snug text-[#F6F3EA]">{c.text}</p>
                <p className="mt-3 text-xs text-night-muted">
                  <a href={`${SEON_PDF}#page=${c.page}`} target="_blank" rel="noreferrer" className="hover:text-gold hover:underline">Source: {c.source}</a>
                </p>
              </section>
            ))}
          </div>

          <section aria-label="Spending by Virginia state category" className="mt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {CATEGORIES.map((c) => (
                <div key={c.name} className="min-w-0 rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-3">
                  <p className="text-xs font-semibold tracking-wide text-on-dark-muted uppercase">{c.name}</p>
                  <p className="mt-1 font-serif text-2xl font-bold tabular-nums text-gold">{c.short}</p>
                  <p className="font-mono text-xs text-night-muted">{c.pct}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-night-muted">Source: FY27 SEON p.73, Expenditures by State Category (FY27 Budget column), categories required by Code of Virginia §22.1-115.</p>
          </section>

          <DepartmentSection />

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


        </div>
      </V4Main>
    </SiteShell>
  );
}
