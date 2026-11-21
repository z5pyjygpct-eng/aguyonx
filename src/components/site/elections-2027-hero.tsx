import { HeroSearch } from "@/components/site/hero-search";
import { Breadcrumbs, type Crumb } from "@/components/site/breadcrumbs";

/**
 * 2027 Election hero, per Scott's mockups: same hero as the location dashboards (dashboard-template.tsx: gradient, red stripe,
 * gold serif kicker, 4xl/6xl serif title) with "2027" white + "Election" gold and an outlined label box (Dashboard, Delegates, Senate).
 */
export function Election2027Hero({ crumbs, label, searchId = "dash-q" }: { crumbs: Crumb[]; label: string; searchId?: string }) {
  return (
    <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
      <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8 lg:pb-12">
        <Breadcrumbs items={crumbs} />
        <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">2027 Election</p>
        <h1 className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
          <span>2027 <span className="text-gold">Election</span></span>
          <span className="inline-flex items-center rounded-md border-2 border-on-dark-muted/60 bg-navy-700/70 px-4 py-1.5 text-xl font-semibold tracking-[0.08em] text-on-dark-muted sm:text-3xl">{label}</span>
        </h1>
        <div className="mt-7"><HeroSearch id={searchId} placeholder="Search all or choose below" /></div>
      </div>
    </section>
  );
}
