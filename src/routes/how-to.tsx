import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { SearchExamples, StartHere, Walkthrough } from "@/components/site/howto";

export const Route = createFileRoute("/how-to")({
  head: () => ({ meta: [{ title: "How to use this website · A Guy on X" }, { name: "description", content: "A plain guide: how to search, read a meeting's votes, and start from an issue you care about." }] }),
  component: Page,
});

const card = "rounded-xl border border-navy-line bg-navy-700 p-5 sm:p-6";
const h2 = "font-serif text-2xl font-semibold uppercase sm:text-3xl";

function Page() {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
            <Breadcrumbs items={[{ label: "How to use this website" }]} />
            <h1 className="mt-6 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">How to use <span className="text-gold">this website</span></h1>
            <p className="mt-4 max-w-2xl text-lg text-on-dark-muted">This site keeps track of what your local leaders say and how they vote. Here is how to find it, one step at a time.</p>
          </div>
        </section>
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-8">
          <section className={card}>
            <h2 className={h2}>1. Search for anything</h2>
            <p className="mt-2 text-on-dark-muted">Type one or two everyday words in the search box on the home page. You don’t need the exact words. Not sure what to type? Tap one of these.</p>
            <div className="mt-4"><SearchExamples /></div>
          </section>
          <Walkthrough />
          <section className="space-y-3">
            <h2 className={h2}>2. Look at a meeting</h2>
            <p className="text-on-dark-muted">Every meeting page shows what the board voted on. Here’s the easy way to read one.</p>
            <StartHere />
          </section>
          <section className={card}>
            <h2 className={h2}>3. Start from something you care about</h2>
            <p className="mt-2 text-on-dark-muted">Pick a topic like taxes, data centers, schools or public safety, and see the real votes on it.</p>
            <a href="/mockups/voter-guide" className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-gold px-5 font-serif font-bold tracking-[0.06em] text-navy-900 uppercase hover:bg-gold-hover">Open the voter guide by issue →</a>
          </section>
          <p className="text-sm text-night-muted">One tip: the meeting words come from a computer listening to the video. It can mishear. Always check the video before you repeat a quote.</p>
        </div>
      </V4Main>
    </SiteShell>
  );
}
