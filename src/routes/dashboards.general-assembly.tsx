import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { HOUSE_MEETINGS, HOUSE_RECAPS, DELEGATES } from "@/content/va-house";
import { SENATE_MEETINGS, SENATE_RECAPS, SENATORS } from "@/content/va-senate";

export const Route = createFileRoute("/dashboards/general-assembly")({
  head: () => ({ meta: [{ title: "Virginia General Assembly · A Guy on X" }] }),
  component: Page,
});

const CARDS = [
  { body: "house", name: "House of Delegates", dek: `${DELEGATES.length} delegates`, n: HOUSE_MEETINGS.length, r: HOUSE_RECAPS.length },
  { body: "senate", name: "Senate of Virginia", dek: `${SENATORS.length} senators`, n: SENATE_MEETINGS.length, r: SENATE_RECAPS.length },
];

function Page() {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
            <nav aria-label="Breadcrumb" className="text-sm text-night-muted">
              <Link to="/" className="hover:text-white">Home</Link><span className="mx-2 text-gold">›</span><span className="font-semibold text-white">General Assembly</span>
            </nav>
            <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">VA Change Agent · Dashboard</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">Virginia <span className="text-gold">General Assembly</span></h1>
            <p className="mt-3 max-w-2xl text-on-dark-muted">Floor sessions, recaps and members for both chambers.</p>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-8 lg:grid-cols-2">
          {CARDS.map((c) => (
            <Link key={c.body} to="/dashboards/$body" params={{ body: c.body }} className="group min-w-0 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-6 hover:bg-navy-600 sm:p-8">
              <h2 className="flex items-center justify-between font-serif text-3xl font-semibold uppercase">{c.name}<ArrowRight className="size-6 text-gold" aria-hidden /></h2>
              <p className="mt-2 text-on-dark-muted">{c.dek}</p>
              <p className="mt-4 font-mono text-sm"><span className="text-gold">{c.n}</span> floor-session videos · <span className="text-gold">{c.r}</span> daily recaps</p>
            </Link>
          ))}
        </section>
      </V4Main>
    </SiteShell>
  );
}
