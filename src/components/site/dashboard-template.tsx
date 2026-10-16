import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, DollarSign, ExternalLink, List, Mail, Play, Users } from "lucide-react";
import type { Dashboard, DashTile } from "@/lib/dashboards";
import { HeroSearch } from "@/components/site/hero-search";

const ICON = { play: Play, list: List, money: DollarSign, people: Users, book: BookOpen } as const;

function Tile({ t }: { t: DashTile }) {
  const Icon = ICON[t.icon];
  const inner = (
    <>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${t.to ? "bg-gold/15 text-gold" : "bg-navy-600 text-night-muted"}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex-1 text-lg font-semibold">{t.label}</span>
      {t.to ? (
        <ArrowRight className="size-5 text-gold" aria-hidden />
      ) : (
        <span className="rounded-full bg-on-dark-muted px-3 py-1 text-xs font-bold text-navy-800">Coming soon</span>
      )}
    </>
  );
  const cls = "flex min-h-[72px] items-center gap-4 rounded-xl border border-navy-line bg-navy-800 px-5 py-3";
  if (!t.to)
    return (
      <div className={`${cls} border-dashed border-l-4 border-l-night-muted/60 opacity-80`} aria-disabled="true">
        {inner}
      </div>
    );
  return (
    <Link to={t.to} hash={t.hash} className={`${cls} border-l-4 border-l-gold transition-colors hover:border-gold hover:bg-navy-600`}>
      {inner}
    </Link>
  );
}

export function DashboardTemplate({ d }: { d: Dashboard }) {
  const two = d.columns.length > 1;
  return (
    <main className="agx-dark flex-1 bg-navy-800 text-white">
      <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
        <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8 lg:pb-12">
          <nav aria-label="Breadcrumb" className="text-sm text-night-muted">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2 text-gold">›</span>
            {d.group === "local" ? <span>Virginia localities</span> : d.slug === "board-of-education" ? <span>Virginia Department of Education</span> : <Link to="/dashboards/general-assembly" className="hover:text-white">General Assembly</Link>}
            <span className="mx-2 text-gold">›</span>
            <span className="font-semibold text-white">{d.short}</span>
          </nav>
          <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">VA Change Agent · Dashboard</p>
          <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
            {d.title} <span className="text-gold">Dashboard</span>
          </h1>
          <div className="mt-7"><HeroSearch id="dash-q" placeholder="Search all or choose below" /></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className={`grid min-w-0 gap-6 ${two ? "lg:grid-cols-2" : "max-w-3xl"}`}>
          {d.columns.map((c) => (
            <div key={c.name} className="min-w-0 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7">
              <h2 className="font-serif text-2xl font-semibold uppercase">{c.name}</h2>
              <div className="mt-5 flex flex-col gap-3">
                {c.tiles.map((t) => (
                  <Tile key={t.label} t={t} />
                ))}
                <a href={c.foia.href} target="_blank" rel="noreferrer" className="flex min-h-[72px] items-center gap-4 rounded-xl border border-navy-line border-l-4 border-l-flag bg-[#1b1a2e] px-5 py-3 hover:border-gold">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold"><Mail className="size-5" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold">{c.foia.label}</span>
                    <span className="block truncate font-mono text-xs text-night-muted">{c.foia.href.replace(/^https:\/\//, "")} · official request page</span>
                  </span>
                  <ExternalLink className="size-5 text-gold" aria-hidden />
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-night-muted">
          "Coming soon" means we have no published data for that section yet. FOIA buttons open each body's official records-request page.
        </p>
      </section>
    </main>
  );
}
