import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { formatNewsDate } from "@/content/news";
import data from "@/content/nova-briefing.json";

type BriefingItem = {
  id: string;
  county: string;
  headline: string;
  outlet: string;
  url: string;
  published: string;
  tier?: string;
};
type Edition = {
  date: string;
  status: "ok" | "gap" | "failed";
  note?: string;
  items: BriefingItem[];
  gaps: string[];
};

const EDITIONS = ([...(data.editions as Edition[])]).sort((a, b) => b.date.localeCompare(a.date));

export const Route = createFileRoute("/nova-briefing")({
  head: () => ({
    meta: [
      { title: "Daily NoVA Briefing | A Guy on X" },
      {
        name: "description",
        content:
          "Every morning: the local Northern Virginia record from Loudoun, Fairfax, Prince William and Arlington, linked to the outlet that reported it.",
      },
    ],
  }),
  component: NovaBriefing,
});

function NovaBriefing() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Every morning</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Daily NoVA Briefing
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          What happened yesterday in {data.counties.join(", ").replace(/, ([^,]*)$/, " and $1")}.
          Every item links to the outlet or government record that reported it. Newest first. A day
          with nothing verified is shown as a gap, not filled in.
        </p>
        <p className="mt-3 text-sm">
          <Link to="/news" className="hover:underline">
            ← All clips on the News shelf
          </Link>
        </p>
        {EDITIONS.length === 0 ? (
          <p className="mt-10 max-w-2xl text-muted-foreground">
            The first briefing is coming. Check back tomorrow morning.
          </p>
        ) : (
          <div className="mt-10 space-y-12">
            {EDITIONS.map((ed) => (
              <section key={ed.date} id={ed.date}>
                <h2 className="border-b border-border pb-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  {formatNewsDate(ed.date)} · {ed.items.length}{" "}
                  {ed.items.length === 1 ? "item" : "items"}
                </h2>
                {ed.items.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Gap: {ed.gaps[0] ?? ed.note ?? "Nothing verified for this day."}
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {ed.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="grid gap-2 py-5 transition-[background-color] duration-150 hover:bg-wash sm:grid-cols-12 sm:items-baseline sm:gap-6"
                        >
                          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase sm:col-span-2">
                            {item.county}
                          </span>
                          <span className="sm:col-span-10">
                            <h3 className="font-serif text-xl font-medium">{item.headline}</h3>
                            <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                              {item.outlet} · {formatNewsDate(item.published)}
                            </p>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </SiteShell>
  );
}
