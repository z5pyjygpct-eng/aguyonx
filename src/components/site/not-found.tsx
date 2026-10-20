import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { HeroSearch } from "@/components/site/hero-search";

const POPULAR: { to: string; label: string; dek: string }[] = [
  { to: "/", label: "Home", dek: "Start over from the front page." },
  { to: "/how-to", label: "How to use this website", dek: "A quick, plain guide." },
  { to: "/find-the-moment", label: "Find the Moment", dek: "Search what was said at meetings." },
  { to: "/investigations", label: "Investigations", dek: "Our long-form reporting." },
  { to: "/news", label: "News", dek: "Today’s Virginia headlines." },
  { to: "/sitemap", label: "Site map", dek: "Every page, in one list." },
];

/** Site-wide 404 (any unmatched URL). */
export function NotFoundPage() {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-12 sm:px-8">
            <Breadcrumbs items={[{ label: "Page not found" }]} className="mb-6" />
            <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">404</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">We couldn’t find <span className="text-gold">that page</span></h1>
            <p className="mt-4 max-w-2xl text-lg text-[#F6F3EA]">Sorry about that. The link may be old, or the page may have moved. Try a search, or pick one of the pages below.</p>
            <div className="mt-6"><HeroSearch id="nf-q" placeholder="Search for a topic, a name or a meeting" placeholderNarrow="Search the site" /></div>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <h2 className="font-serif text-2xl font-semibold uppercase">Popular pages</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR.map((p) => (
              <li key={p.to}><Link to={p.to} className="block rounded-xl border border-navy-line bg-navy-700 p-4 hover:border-gold"><span className="block font-semibold text-gold">{p.label} →</span><span className="mt-1 block text-sm text-on-dark-muted">{p.dek}</span></Link></li>
            ))}
          </ul>
        </div>
      </V4Main>
    </SiteShell>
  );
}
