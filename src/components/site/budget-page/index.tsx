/**
 * Standard v4 budget page (template from the LCPS budget page). Every location's budget page renders
 * <BudgetPage data={...} /> with a per-venue data object; only the data differs.
 * Order: hero total → highlight boxes → category boxes → departments → 3 questions → how it gets made →
 * search → hosted source files.
 */
import { useState, type ReactNode } from "react";
import { FileText } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { V4VenueHero, FoiaButton } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";

export const usd = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US")}`;

export type BudgetCallout = { title: string; key: string[]; text: string; source: string; href?: string };
export type BudgetCategory = { name: string; short: string; pct: string; value: number };
export type BudgetDepartment = { name: string; page: number; value: number; pct: string; cats: string[]; pageLabel?: string };
export type BudgetFileDoc = { label: string; dek: string; href: string; sizeLabel: string; source: string; kind: string; extractId: string };

export type BudgetPageData = {
  venue: keyof typeof V4_VENUES;
  hero: { label: string; amountLabel: string; body: ReactNode; note?: ReactNode };
  callouts: BudgetCallout[];
  categories: { ariaLabel: string; items: BudgetCategory[]; source: ReactNode; gridClass?: string };
  departments: {
    heading: string;
    /** Chip labels; defaults to the category box names. Empty array hides the chips. */
    chips?: string[];
    chipGroupLabel: string;
    items: BudgetDepartment[];
    allNote: string;
    filterNote: (cat: string) => string;
    spanNote: string;
    pageHref: (page: number) => string;
    source: ReactNode;
  };
  questions: { q: string; body: ReactNode }[];
  how: { steps: [string, string][]; note: ReactNode };
  search: ReactNode;
  files: { docs: BudgetFileDoc[]; footer: ReactNode; heading?: string };
  /** Optional plain-language caveats, shown last. */
  caveats?: ReactNode[];
};

const card = "rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6";
const lab = "font-mono text-xs tracking-widest text-gold uppercase";

function Q({ n, q, children }: { n: string; q: string; children: ReactNode }) {
  return (
    <section className={card}>
      <p className={lab}>Question {n}</p>
      <h2 className="mt-1 font-serif text-2xl font-semibold uppercase">{q}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Bar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
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

/** Two-year comparison bars (the "What's changing year over year?" card). */
export function YoyBars({ rows, max }: { rows: { y: string; v: number; current?: boolean }[]; max: number }) {
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.y}>
          <div className="flex justify-between text-sm"><span className="font-mono">{r.y}</span><span className="font-mono tabular-nums">{usd(r.v)}</span></div>
          <div className="mt-1 h-6 rounded bg-navy-800"><div className="h-6 rounded" style={{ width: `${(r.v / max) * 100}%`, background: r.current ? "#F5B82E" : "#2C4F86" }} /></div>
        </div>
      ))}
    </div>
  );
}

function DepartmentSection({ d, chips }: { d: BudgetPageData["departments"]; chips: string[] }) {
  const [cat, setCat] = useState("All");
  const rows = cat === "All" ? d.items : d.items.filter((x) => x.cats.includes(cat));
  return (
    <section className="mt-8 rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6">
      <h2 className="font-serif text-2xl font-semibold uppercase">{d.heading}</h2>
      {chips.length ? <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={d.chipGroupLabel}>
        {["All", ...chips].map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-sm ${cat === c ? "border-gold bg-gold font-semibold text-navy-900" : "border-navy-line text-on-dark-muted hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div> : null}
      <p className="mt-3 text-xs text-night-muted">
        {cat === "All" ? d.allNote : d.filterNote(cat)} {d.spanNote}
      </p>
      <ul className="mt-3 divide-y divide-navy-line/70 rounded-lg border border-navy-line bg-navy-800">
        {rows.map((x) => (
          <li key={x.name} className="flex items-baseline gap-3 px-4 py-2.5">
            <span className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere] sm:text-base"><span className="font-semibold">{x.name}</span> <span className="whitespace-nowrap text-sm text-night-muted">(<a href={d.pageHref(x.page)} target="_blank" rel="noreferrer" className="text-gold underline-offset-2 hover:underline">{x.pageLabel ?? <>p. {x.page}</>}</a>)</span></span>
            <span className="shrink-0 font-mono text-sm tabular-nums text-gold sm:text-base">{usd(x.value)}</span>
            <span className="w-12 shrink-0 text-right font-mono text-xs text-night-muted sm:w-14 sm:text-sm">{x.pct}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-night-muted">{d.source}</p>
    </section>
  );
}

export function BudgetPage({ data }: { data: BudgetPageData }) {
  const v = V4_VENUES[data.venue];
  const { hero, callouts, categories, departments, questions, how, search, files, caveats } = data;
  return (
    <SiteShell>
      <V4Main>
        <V4VenueHero venue={v} kicker="Budget & Finance" />
        <div role="status" className="bg-gold text-navy-900"><p className="mx-auto max-w-7xl px-4 py-3 text-center font-serif text-lg font-bold tracking-[0.14em] uppercase sm:px-8">Coming soon · Preview mockup — not yet live</p></div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <section className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-6 sm:p-8">
            <p className={lab}>{hero.label}</p>
            <p className="mt-2 font-serif text-5xl font-bold tabular-nums text-gold sm:text-7xl">{hero.amountLabel}</p>
            <p className="mt-3 max-w-3xl text-base text-[#F6F3EA]">{hero.body}</p>
            {hero.note ? <p className="mt-3 text-xs text-night-muted">{hero.note}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3"><FoiaButton foia={v.foia} /></div>
          </section>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {callouts.map((c) => (
              <section key={c.text} className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-5">
                <h3 className="font-serif text-xl font-semibold tracking-wide text-gold uppercase">{c.title}</h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {c.key.map((k) => <p key={k} className="font-serif text-3xl font-bold tabular-nums text-white">{k}</p>)}
                </div>
                <p className="mt-3 text-base leading-snug text-[#F6F3EA]">{c.text}</p>
                <p className="mt-3 text-xs text-night-muted">
                  {c.href ? <a href={c.href} target="_blank" rel="noreferrer" className="hover:text-gold hover:underline">Source: {c.source}</a> : <>Source: {c.source}</>}
                </p>
              </section>
            ))}
          </div>

          <section aria-label={categories.ariaLabel} className="mt-6">
            <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${categories.gridClass ?? "lg:grid-cols-7"}`}>
              {categories.items.map((c) => (
                <div key={c.name} className="min-w-0 rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-3">
                  <p className="text-xs font-semibold tracking-wide text-on-dark-muted uppercase">{c.name}</p>
                  <p className="mt-1 font-serif text-2xl font-bold tabular-nums text-gold">{c.short}</p>
                  <p className="font-mono text-xs text-night-muted">{c.pct}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-night-muted">{categories.source}</p>
          </section>

          <DepartmentSection d={departments} chips={departments.chips ?? categories.items.map((c) => c.name)} />

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {questions.map((x, i) => <Q key={x.q} n={String(i + 1)} q={x.q}>{x.body}</Q>)}
          </div>

          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">How the budget gets made</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {how.steps.map(([t, d], i) => (
                <li key={t} className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-4">
                  <p className="font-mono text-xs text-gold">STEP {i + 1}</p>
                  <p className="font-serif text-xl font-semibold uppercase">{t}</p>
                  <p className="text-sm text-night-muted">{d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 max-w-3xl text-sm text-night-muted">{how.note}</p>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-3xl font-semibold uppercase">Search the budget papers</h2>
            <div className="mt-4 rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-2">{search}</div>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">{files.heading ?? "Hosted source files"} <span className="font-mono text-base text-night-muted">({files.docs.length})</span></h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {files.docs.map((doc) => (
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
            <p className="mt-4 text-sm text-night-muted">{files.footer}</p>
          </section>

          {caveats?.length ? (
            <section className="mt-10">
              <h2 className="font-serif text-3xl font-semibold uppercase">Caveats &amp; notes</h2>
              <ul className="mt-4 space-y-2 rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-5 text-sm text-[#F6F3EA]">
                {caveats.map((c, i) => <li key={i} className="flex gap-2"><span className="text-gold">•</span><span>{c}</span></li>)}
              </ul>
            </section>
          ) : null}


        </div>
      </V4Main>
    </SiteShell>
  );
}
