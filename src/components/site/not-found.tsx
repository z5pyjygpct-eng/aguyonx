import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

/** Site-wide 404 (any unmatched URL). */
export function NotFoundPage() {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-16 sm:px-8">
            <Breadcrumbs items={[{ label: "Page not found" }]} className="mb-6" />
            <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">404</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">Page not found</h1>
            <p className="mt-4 max-w-2xl text-[#F6F3EA]">That page isn&apos;t on the shelf. Try the search, or start from home.</p>
            <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-gold px-5 text-sm font-semibold text-navy-900 hover:bg-gold-hover">Back to home</Link>
          </div>
        </section>
      </V4Main>
    </SiteShell>
  );
}
