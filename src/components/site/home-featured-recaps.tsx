/**
 * Featured recaps — self-contained homepage section. Picks the 2 newest recaps by meeting date
 * across Loudoun (BOS + School Board), cities, and Senate. To remove: delete this file and its
 * one import + one <HomeFeaturedRecaps /> line in home-layout.tsx.
 */
import { LOUDOUN_RECAPS } from "@/content/loudoun-recaps";
import { CITY_RECAPS } from "@/content/city-recaps";
import { CITIES, CITY_VENUES } from "@/content/cities";
import { SENATE_RECAPS } from "@/content/va-senate";
import { recapDateKey, sortRecapsNewestFirst } from "@/content/recap-sort";

type Card = { key: string; slug: string; date?: string; dateLabel: string; title: string; board: string; summary?: string; href: string };

function cards(): Card[] {
  const out: Card[] = [];
  for (const r of LOUDOUN_RECAPS)
    out.push({
      key: `l-${r.slug}`, slug: r.slug, dateLabel: r.dateLabel, title: r.title,
      board: r.venue === "loudoun-lcps" ? "Loudoun School Board" : "Loudoun Board of Supervisors",
      summary: r.decisions[0]?.action ?? r.moments[0]?.label,
      href: `/counties/loudoun/recaps/${r.slug}`,
    });
  for (const r of CITY_RECAPS) {
    const city = CITIES.find((c) => c.venues.includes(r.venue));
    if (!city) continue;
    out.push({
      key: `c-${r.slug}`, slug: r.slug, dateLabel: r.dateLabel, title: r.title,
      board: CITY_VENUES[r.venue].name,
      summary: r.decisions[0]?.action ?? r.moments[0]?.label,
      href: `/cities/${city.id}/recaps/${r.slug}`,
    });
  }
  for (const r of SENATE_RECAPS)
    out.push({
      key: `s-${r.slug}`, slug: r.slug, date: r.date, dateLabel: r.dateLabel, title: "Senate floor session",
      board: "Senate of Virginia",
      summary: `${r.rollCallCount} roll calls on ${r.billCount} bills`,
      href: `/general-assembly/senate/recaps/${r.slug}`,
    });
  return sortRecapsNewestFirst(out).filter((c) => recapDateKey(c) !== "0000-00-00").slice(0, 2);
}

export function HomeFeaturedRecaps() {
  const list = cards();
  if (!list.length) return null;
  return (
    <section className="mt-8">
      <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Featured recaps</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {list.map((c) => (
          <a key={c.key} href={c.href} className="group flex flex-col rounded-md border border-border bg-card px-5 py-5 transition-colors hover:border-[#1E4B8E]">
            <span className="font-mono text-[11px] tracking-widest text-[#0d7377] uppercase">{c.dateLabel} · {c.board}</span>
            <span className="mt-1 font-serif text-xl font-medium tracking-tight group-hover:text-[#1E4B8E]">{c.title}</span>
            {c.summary ? <span className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.summary}</span> : null}
            <span className="mt-4 font-sans text-sm font-semibold tracking-[0.14em] text-[#1E4B8E] uppercase">Read recap →</span>
          </a>
        ))}
      </div>
    </section>
  );
}
