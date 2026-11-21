import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, List, Users } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HeroSearch } from "@/components/site/hero-search";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { election2027News } from "@/lib/news-2027-elections";
import { E27_GA, E27_LOCAL, E27_NEWS_SHOWN, type E27Button } from "@/lib/election-2027-dashboard";

/**
 * /2027: 2027 Election Dashboard landing page. Same hero, search bar, column cards, tiles and gold News box
 * as the location dashboards (src/components/site/dashboard-template.tsx + location-news.tsx).
 * The full race directory moved to /2027/races; old /2027?office=… links are sent there with their filters.
 */
const OLD_KEYS = ["office", "loc", "f", "q", "seat", "r_office", "r_loc", "r_status", "r_party", "r_q", "r_filed"];

export const Route = createFileRoute("/2027/")({
  beforeLoad: ({ location }) => {
    const s = (location.search ?? {}) as Record<string, unknown>;
    if (OLD_KEYS.some((k) => s[k] !== undefined && s[k] !== "")) throw redirect({ to: "/2027/races", search: s as never, hash: location.hash || undefined });
  },
  head: () => ({ meta: [{ title: "2027 Election Dashboard · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function fmt(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

const TILE = "flex min-h-[72px] items-center gap-4 rounded-xl border border-navy-line bg-navy-800 px-5 py-3";

function Tile({ b, icon: Icon }: { b: E27Button; icon: typeof Users }) {
  return (
    <Link
      to={b.to as never}
      search={b.search as never}
      hash={b.hash}
      data-e27={b.slug}
      className={b.soon ? `${TILE} border-dashed border-l-4 border-l-night-muted/60 transition-colors hover:border-gold hover:bg-navy-600` : `${TILE} border-l-4 border-l-gold transition-colors hover:border-gold hover:bg-navy-600`}
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${b.soon ? "bg-navy-600 text-night-muted" : "bg-gold/15 text-gold"}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold">{b.label}</span>
        {b.soon ? <span className="mt-1 inline-flex whitespace-nowrap rounded-full bg-on-dark-muted px-3 py-0.5 text-xs font-bold text-navy-800">Coming soon</span> : null}
      </span>
      <ArrowRight className={`size-5 shrink-0 ${b.soon ? "text-night-muted" : "text-gold"}`} aria-hidden />
    </Link>
  );
}

const CARD = "min-w-0 scroll-mt-24 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7";

function Page() {
  const all = election2027News();
  const items = all.slice(0, E27_NEWS_SHOWN);
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8 lg:pb-12">
            <Breadcrumbs items={[{ label: "2027 Election" }]} />
            <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">2027 Election</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
              2027 Election <span className="text-gold">Dashboard</span>
            </h1>
            <div className="mt-7"><HeroSearch id="dash-q" placeholder="Search all or choose below" /></div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <div id="general-assembly" className={CARD}>
              <h2 className="font-serif text-2xl font-semibold uppercase">Virginia General Assembly</h2>
              <div className="mt-5 flex flex-col gap-3">
                {E27_GA.map((b) => <Tile key={b.slug} b={b} icon={Users} />)}
              </div>
            </div>
            <div id="local-elections" className={CARD}>
              <h2 className="font-serif text-2xl font-semibold uppercase">Virginia Local Elections</h2>
              <div className="mt-5 grid gap-3 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-5">
                {E27_LOCAL.map((b) => <Tile key={b.slug} b={b} icon={List} />)}
              </div>
            </div>
          </div>

          <section id="news" aria-labelledby="e27-news-h" className="mt-6 scroll-mt-24 rounded-xl bg-[#f5b82e] p-5 text-navy-800 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="e27-news-h" className="font-serif text-2xl font-bold uppercase">News: 2027 Election Related News</h2>
              <Link to="/2027/news" className="inline-flex min-h-11 items-center rounded-md bg-navy-800 px-4 font-semibold text-gold hover:bg-navy-700 sm:ml-auto">
                All 2027 Election Related News <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>
            {items.length === 0 ? (
              <p className="mt-4 font-semibold">No related news yet</p>
            ) : (
              <ul className="mt-4 divide-y divide-navy-800/20">
                {items.map((n) => (
                  <li key={n.id} className="py-3">
                    <a href={n.url} target="_blank" rel="noreferrer" className="group flex items-start gap-3">
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-semibold leading-snug group-hover:underline">{n.headline}</span>
                        <span className="mt-1 block text-sm font-medium text-navy-800/80">{n.outlet} · {fmt(n.date)}</span>
                      </span>
                      <ExternalLink className="mt-1 size-4 shrink-0" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="mt-8 text-sm text-night-muted">
            "Coming soon" means we have no 2027 race data posted for that locality yet. Race data comes only from official records (Virginia Department of Elections and each locality's elections office).
          </p>
        </section>
      </main>
    </SiteShell>
  );
}
