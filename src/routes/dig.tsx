import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";
import { loadIndex, loadSubject } from "@/components/site/dig/data";
import { LegPanel, legCategories, legYears } from "@/components/site/dig/leg-panel";
import { BoardPanel, PlacePanel, boardYears } from "@/components/site/dig/board-panel";
import { ShareButton } from "@/components/site/dig/ui";
import type { Subject } from "@/components/site/dig/types";

type Search = { a?: string; b?: string; year?: string; cat?: string; topic?: string };
const str = (v: unknown, re: RegExp) => (typeof v === "string" && re.test(v) ? v : undefined);
const ID = /^(leg|board|place)\.[a-z0-9-]{2,60}$/;

export const Route = createFileRoute("/dig")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const o: Search = {};
    const a = str(s.a, ID), b = str(s.b, ID), year = str(String(s.year ?? ""), /^20\d\d$/), cat = typeof s.cat === "string" && s.cat.length < 80 ? s.cat : undefined, topic = str(s.topic, /^[a-z-]{2,40}$/);
    if (a) o.a = a; if (b) o.b = b; if (year) o.year = year; if (cat) o.cat = cat; if (topic) o.topic = topic;
    return o;
  },
  head: () => ({
    meta: [
      { title: "Do your own digging · A Guy on X" },
      { name: "description", content: "Pick a Virginia legislator, a local board or a locality and line up the official record: votes, bills, campaign money, meetings and news. Every number links to its source." },
      ...GA_PREVIEW_ROBOTS,
    ],
  }),
  component: Page,
});

type Loaded = Awaited<ReturnType<typeof loadSubject>>;
function useSubject(id?: string) {
  const [st, setSt] = useState<{ id?: string; data?: Loaded; err?: string }>({});
  useEffect(() => {
    if (!id) { setSt({}); return; }
    let live = true;
    setSt({ id });
    loadSubject(id).then((data) => live && setSt({ id, data }), (e: Error) => live && setSt({ id, err: e.message }));
    return () => { live = false; };
  }, [id]);
  return st.id === id ? st : { id };
}

const EXAMPLES = [
  { a: "leg.dan-i-helmer", label: "Del. Dan Helmer" },
  { a: "leg.l-louise-lucas", label: "Sen. L. Louise Lucas" },
  { a: "place.loudoun", label: "Loudoun County" },
];

function SubjectSelect({ label, value, subjects, onChange, optional }: { label: string; value?: string; subjects: Subject[]; onChange: (v?: string) => void; optional?: boolean }) {
  const groups: [string, Subject[]][] = [
    ["Places", subjects.filter((s) => s.kind === "place")],
    ["Boards", subjects.filter((s) => s.kind === "board")],
    ["House of Delegates", subjects.filter((s) => s.kind === "leg" && s.label.startsWith("Del."))],
    ["Senate of Virginia", subjects.filter((s) => s.kind === "leg" && s.label.startsWith("Sen."))],
  ];
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-bold tracking-[0.14em] text-night-muted uppercase">{label}</span>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)} className="h-11 w-full min-w-0 rounded-lg border border-navy-line bg-navy-900 px-3 text-sm text-white focus:border-gold focus:outline-none">
        <option value="">{optional ? "Nothing (no comparison)" : "Choose a legislator, board or place"}</option>
        {groups.map(([g, list]) => list.length ? (
          <optgroup key={g} label={g}>{list.map((s) => <option key={s.id} value={s.id}>{s.label}{s.kind === "leg" ? ` (${s.sub.replace(" · ", ", ")})` : ""}</option>)}</optgroup>
        ) : null)}
      </select>
    </label>
  );
}

function Select({ label, value, options, onChange, all }: { label: string; value?: string; options: [string, string][]; onChange: (v?: string) => void; all: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-bold tracking-[0.14em] text-night-muted uppercase">{label}</span>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)} className="h-11 w-full min-w-0 rounded-lg border border-navy-line bg-navy-900 px-3 text-sm text-white focus:border-gold focus:outline-none">
        <option value="">{all}</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function Panel({ st, f, wide }: { st: ReturnType<typeof useSubject>; f: Search; wide: boolean }) {
  if (!st.id) return null;
  if (st.err) return <p className="rounded-lg border border-navy-line p-4 text-sm">Could not load this subject ({st.err}). Try reloading the page.</p>;
  if (!st.data) return <p className="rounded-lg border border-navy-line p-4 text-sm text-on-dark-muted" aria-live="polite">Loading the record…</p>;
  const d = st.data;
  if (d.kind === "leg") return <LegPanel leg={d.leg} rc={d.rc} f={f} wide={wide} />;
  if (d.kind === "board") return <BoardPanel b={d.board} f={f} wide={wide} />;
  return <PlacePanel p={d.place} boards={d.boards} f={f} wide={wide} />;
}

function Page() {
  const s = Route.useSearch();
  const nav = useNavigate({ from: "/dig" });
  const set = (patch: Partial<Search>) => nav({ search: (prev: Search) => { const n: Search = { ...prev, ...patch }; (Object.keys(n) as (keyof Search)[]).forEach((k) => n[k] === undefined && delete n[k]); return n; }, replace: true, resetScroll: false });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  useEffect(() => { loadIndex().then((i) => setSubjects(i.subjects), () => setSubjects([])); }, []);
  const A = useSubject(s.a), B = useSubject(s.b);
  const both = [A.data, B.data].filter(Boolean) as Loaded[];

  const { years, cats, topics } = useMemo(() => {
    const y = new Set<string>(), c = new Set<string>(), t = new Map<string, string>();
    for (const d of both) {
      if (d.kind === "leg") { legYears(d.leg).forEach((x) => y.add(x)); legCategories(d.leg, d.rc).forEach((x) => c.add(x)); }
      const bs = d.kind === "board" ? [d.board] : d.kind === "place" ? d.boards : [];
      for (const b of bs) { boardYears(b).forEach((x) => y.add(x)); b.topics.forEach(([id, l]) => t.set(id, `${l} (${b.label.includes("Schools") ? "School Board" : "Supervisors"})`)); }
      if (d.kind === "place") d.place.news.forEach((n) => y.add(n.d.slice(0, 4)));
    }
    return { years: [...y].filter(Boolean).sort().reverse(), cats: [...c].sort(), topics: [...t.entries()] };
  }, [both]);

  const hasLeg = both.some((d) => d.kind === "leg"), hasBoard = both.some((d) => d.kind !== "leg");
  const f = { year: s.year, cat: s.cat, topic: s.topic };

  return (
    <SiteShell>
      <V4Main>
        <section className="relative overflow-hidden bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
            <Breadcrumbs items={[{ label: "Other Resources", to: "/library" }, { label: "Data" }, { label: "Do your own digging" }]} />
          </div>
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
            <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">Data</p>
            <h1 className="mt-2 font-serif text-5xl leading-[1.02] font-bold uppercase sm:text-6xl">Do your own digging</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#F6F3EA]">
              Pick a state legislator, a local board or a locality. Line up what is already on aguyonx.com: floor votes, bills, campaign money, meeting transcripts and recaps, and news clips. Compare two side by side. Every number links to the official record it comes from, and anything we have not collected yet says so.
            </p>
            <p className="mt-4 text-sm text-on-dark-muted">Try: {EXAMPLES.map((e, i) => <span key={e.a}>{i ? " · " : ""}<Link to="/dig" search={{ a: e.a }} className="font-semibold text-gold underline underline-offset-4">{e.label}</Link></span>)}</p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="z-20 -mx-5 border-b border-navy-line/70 bg-navy-800/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 md:sticky md:top-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1.4fr_0.7fr_1fr_1fr_auto] lg:items-end">
              <SubjectSelect label="Dig into" value={s.a} subjects={subjects} onChange={(v) => set({ a: v })} />
              <SubjectSelect label="Compare with (optional)" value={s.b} subjects={subjects} onChange={(v) => set({ b: v })} optional />
              <Select label="Year" value={s.year} options={years.map((y) => [y, y])} onChange={(v) => set({ year: v })} all="All years" />
              <Select label="Topic for legislators (aguyonx categories)" value={s.cat} options={hasLeg ? cats.map((c) => [c, c]) : []} onChange={(v) => set({ cat: v })} all={hasLeg ? "All topics" : "Pick a legislator first"} />
              <Select label="Topic for boards (aguyonx categories)" value={s.topic} options={hasBoard ? topics : []} onChange={(v) => set({ topic: v })} all={hasBoard ? "All topics" : "Pick a board or place first"} />
              <div className="pb-1"><ShareButton label="Copy link to this view" /></div>
            </div>
          </div>

          <div className="py-8 sm:py-10">
            {!s.a && !s.b ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { k: "Legislators", d: `All ${subjects.filter((x) => x.kind === "leg").length || "seated"} members of the Virginia House of Delegates and Senate: bills they carried, how they voted on final passage, campaign gifts reported to the Virginia Department of Elections, floor-session transcripts and news clips.` },
                  { k: "Boards", d: "The Loudoun County Board of Supervisors and the Loudoun County Public Schools (LCPS) School Board: meetings on video, machine transcripts, recaps, official recorded actions and how often a topic came up over time." },
                  { k: "Places", d: "Loudoun County: both boards, Loudoun's members of the General Assembly and Loudoun news in one view." },
                ].map((x) => (
                  <div key={x.k} className="rounded-xl border border-navy-line bg-navy-900/70 p-5">
                    <h2 className="font-serif text-2xl font-bold uppercase">{x.k}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{x.d}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-navy-line bg-navy-900/70 p-5 md:col-span-3">
                  <h2 className="font-serif text-2xl font-bold uppercase">How this page works</h2>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-on-dark-muted">
                    <li>Choose something in “Dig into”. Add a second choice in “Compare with” to see both side by side.</li>
                    <li>Filters for year and topic apply to both sides. The web address keeps every choice, so copying it shares exactly this view.</li>
                    <li>Sources: Legislative Information System (LIS) for bills and votes; Virginia Department of Elections for campaign money; official county and school board records for meetings and votes; public news outlets for clips.</li>
                    <li>Topic groupings are <b className="text-white">aguyonx categories</b>: labels we assign by fixed keyword rules. They are not stances.</li>
                    <li>No opinions, no rankings, and no claims that money and votes are connected. The page shows records next to each other; the reader decides.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className={`grid min-w-0 gap-6 ${s.a && s.b ? "lg:grid-cols-2" : ""}`}>
                {s.a ? <Panel st={A} f={f} wide={!(s.a && s.b)} /> : null}
                {s.b ? <Panel st={B} f={f} wide={!(s.a && s.b)} /> : null}
              </div>
            )}
          </div>
        </div>
      </V4Main>
    </SiteShell>
  );
}
