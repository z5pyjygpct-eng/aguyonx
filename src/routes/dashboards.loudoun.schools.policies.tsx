import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { V4VenueHero, FoiaButton } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { LcpsPolicySearch } from "@/components/site/lcps-policy-search";
import { LCPS_POLICIES, LCPS_POLICY_BOOK, LCPS_POLICY_SECTIONS, lcpsPolicyCount, lcpsPolicyHostedCount, lcpsPolicyHref, type LcpsPolicy } from "@/content/lcps-policies";

export const Route = createFileRoute("/dashboards/loudoun/schools/policies")({
  head: () => ({ meta: [{ title: "LCPS Policies · A Guy on X" }] }),
  component: Page,
});

/** Editor's picks: high-interest topics for parents. Not based on traffic data. */
const PICKS: { topic: string; codes: string[] }[] = [
  { topic: "Phones & devices", codes: ["8655", "8650"] },
  { topic: "Attendance", codes: ["8140", "8120"] },
  { topic: "Discipline", codes: ["8210", "8220"] },
  { topic: "Bullying & harassment", codes: ["8250", "8030"] },
  { topic: "Library & class materials", codes: ["5046", "5047"] },
  { topic: "Title IX & gender", codes: ["8035", "8040"] },
  { topic: "Grading", codes: ["5030"] },
  { topic: "School assignment & boundaries", codes: ["8155", "6530"] },
  { topic: "Safety & threats", codes: ["8290", "8235"] },
  { topic: "Dress code", codes: ["8270"] },
  { topic: "Speaking at Board meetings", codes: ["2520"] },
  { topic: "Complaints", codes: ["8070"] },
];
const BY = Object.fromEntries(LCPS_POLICIES.map((p) => [p.code, p]));
const SECTION_DEK: Record<string, string> = {
  "1000 - FOUNDATIONS": "Mission, ethics, equal opportunity",
  "2000 - SCHOOL BOARD BYLAWS": "Meetings, voting, public comment",
  "3000 - ADMINISTRATION": "Superintendent, communications",
  "4000 - BUSINESS": "Budget, purchasing, contracts",
  "5000 - INSTRUCTION": "Curriculum, grading, materials",
  "6000 - SUPPORT SERVICES": "Buses, buildings, boundaries",
  "7000 - PERSONNEL": "Hiring, conduct, leave",
  "8000 - STUDENTS": "Attendance, discipline, rights",
};
const ts = (p: LcpsPolicy) => (p.lastRevised ? Date.parse(p.lastRevised) || 0 : 0);
const RECENT = [...LCPS_POLICIES].filter((p) => ts(p) > 0).sort((a, b) => ts(b) - ts(a)).slice(0, 12);
const lab = "font-mono text-xs tracking-widest text-gold uppercase";

function Row({ p }: { p: LcpsPolicy }) {
  return (
    <a href={lcpsPolicyHref(p)} target="_blank" rel="noopener noreferrer" className="flex items-baseline gap-3 rounded px-2 py-1.5 hover:bg-navy-800">
      <span className="w-20 shrink-0 font-mono text-xs text-gold">{p.code}</span>
      <span className="flex-1 text-sm">{p.title}</span>
      {p.lastRevised ? <span className="hidden font-mono text-[11px] text-night-muted sm:inline">{p.lastRevised}</span> : null}
    </a>
  );
}

function Page() {
  const v = V4_VENUES["loudoun-lcps"];
  return (
    <SiteShell>
      <V4Main>
        <V4VenueHero venue={v} kicker="Policies" />
        <div role="status" className="bg-gold text-navy-900"><p className="mx-auto max-w-7xl px-4 py-3 text-center font-serif text-lg font-bold tracking-[0.14em] uppercase sm:px-8">Coming soon · Preview mockup — not yet live</p></div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-3xl text-[#F6F3EA]">
              The School Board's rulebook: <span className="font-mono text-gold">{lcpsPolicyCount()}</span> active policies and regulations from BoardDocs ({LCPS_POLICY_BOOK}), <span className="font-mono text-gold">{lcpsPolicyHostedCount()}</span> with hosted PDFs.
            </p>
            <FoiaButton foia={v.foia} />
          </div>

          <section className="mt-8">
            <h2 className="font-serif text-3xl font-semibold uppercase">What parents ask about</h2>
            <p className="text-xs text-night-muted">Editor's picks of high-interest topics, not ranked by traffic data.</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PICKS.map((k) => (
                <li key={k.topic} className="rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4">
                  <p className="font-serif text-lg font-semibold uppercase">{k.topic}</p>
                  <ul className="mt-2 space-y-1">
                    {k.codes.map((c) => BY[c]).filter(Boolean).map((p) => (
                      <li key={p.code}>
                        <a href={lcpsPolicyHref(p)} target="_blank" rel="noopener noreferrer" className="group flex gap-2 text-sm hover:text-gold">
                          <FileText className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                          <span><span className="font-mono text-xs text-gold">{p.code}</span> {p.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-[10px] border border-navy-line border-l-4 border-l-red bg-navy-700 p-5" style={{ borderLeftColor: "#C8102E" }}>
            <h2 className="font-serif text-2xl font-semibold uppercase">Recently changed</h2>
            <p className="text-xs text-night-muted">Newest BoardDocs "last revised" dates. Dates are known for {LCPS_POLICIES.filter((p) => p.lastRevised).length} of {lcpsPolicyCount()} items.</p>
            <ul className="mt-3 grid gap-x-6 md:grid-cols-2">{RECENT.map((p) => <li key={p.code}><Row p={p} /></li>)}</ul>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">Browse by category</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {LCPS_POLICY_SECTIONS.map((s) => {
                const items = LCPS_POLICIES.filter((p) => p.section === s);
                const [num, name] = s.split(" - ");
                return (
                  <li key={s} className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-4">
                    <details>
                      <summary className="cursor-pointer list-none">
                        <span className="font-mono text-xs text-gold">{num}s</span>
                        <span className="block font-serif text-xl font-semibold uppercase">{name}</span>
                        <span className="block text-sm text-night-muted">{SECTION_DEK[s]}</span>
                        <span className="mt-2 block font-mono text-sm"><span className="text-gold">{items.length}</span> items · <span className="underline">show all</span></span>
                      </summary>
                      <ul className="mt-3 max-h-96 overflow-auto border-t border-navy-line pt-2">{items.map((p) => <li key={p.code}><Row p={p} /></li>)}</ul>
                    </details>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">Search every policy</h2>
            <div className="mt-4 rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-2"><LcpsPolicySearch /></div>
            <p className="mt-4 text-sm"><Link to="/dashboards/loudoun/schools/budget" className="text-gold hover:underline">LCPS budget & finance →</Link></p>
          </section>
        </div>
      </V4Main>
    </SiteShell>
  );
}
