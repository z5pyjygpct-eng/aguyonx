import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/tips")({
  head: () => ({ meta: [{ title: "Got Tips? · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-10 pb-14 sm:px-8">
            <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">VA Change Agent</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">Got <span className="text-gold">Tips?</span></h1>
            <span className="mt-6 inline-block whitespace-nowrap rounded-full bg-on-dark-muted px-4 py-1.5 text-sm font-bold text-navy-800">Coming soon</span>
          </div>
        </section>
      </main>
    </SiteShell>
  ),
});
