import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { Button } from "@/components/ui/button";
import { SITE } from "@/content/site";
import { HomeBooks } from "@/components/site/home-books";
import { DARK_VARS } from "@/components/site/lcps-v4";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>The desk</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          A Guy on X
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          I&apos;m A Guy on X trying to be the {SITE.handle}.
        </p>

        <div className="mt-10 space-y-5 leading-relaxed">
          <p>
            That line is not branding. It is how this started. A researcher on the platform, watching
            Virginia publish an enormous public record and then bury it across county sites,
            legislative systems, campaign-finance databases, meeting videos, and newsrooms that never
            talk to each other. &ldquo;It&apos;s public&rdquo; has been the official answer for years.
            &ldquo;You can actually find it&rdquo; was never the same sentence.
          </p>
          <p>
            For a long time, the people who could find it were not ordinary voters. Campaigns, firms,
            and operatives paid tens or hundreds of thousands of dollars for opposition research,
            influence maps, and background files. Citizens and local advocates were locked out — not
            because the documents were secret, but because nobody had built a way to use them that
            did not require a staff and a retainer.
          </p>
          <p>
            <a
              href={SITE.bookUrl}
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              A book came first
            </a>: how to file the request, read the dump, follow the money, and stop
            treating aggregation sites as gospel. The book was the argument. The portal was the
            instrument. Same problem, built instead of described.
          </p>
          <p>
            Then the record itself started moving. Systems changed and whole sessions disappeared
            from the modern lookup with no error message. Bill numbers recycled. Floor votes got
            flattened into committee votes. Money and votes stayed in separate buildings. Media piled
            up in another pile. That is not a 2026 discovery. It is what Virginia&apos;s transparency
            architecture has been doing for a decade while calling itself open.
          </p>
          <p>
            So the work here is commissioned political intelligence, not a public login. Northern
            Virginia is home base. The Commonwealth is the file. Primary sources, coverage stated
            when it is incomplete, correlation when two records actually belong in the same sentence.
          </p>
          <p>
            Traditional grassroots was doors, flyers, and yard signs. That still matters. It is not
            the same as being able to read the official record before you knock.
          </p>
          <p>If you want spin, this is the wrong site.</p>
          <p>If you want the record, with the receipts, you know where to find me.</p>
          <p className="text-muted-foreground">
            VA Change Agent
            <br />
            <a href={SITE.xUrl} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {SITE.handle}
            </a>
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/contact">Contact</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={SITE.xUrl} target="_blank" rel="noreferrer">
              {SITE.handle}
            </a>
          </Button>
        </div>
      </main>
      <GetInTouch />
      <div id="books" className="border-t border-border">
        <HomeBooks />
      </div>
    </SiteShell>
  );
}

const CONTACT_EMAIL = "scottmineo@mail.grokbot.com";

const CONTACT_CARDS = [
  {
    kicker: "Just curious",
    line: "Spotted something on the site, got a question, or just want to say hi? Send me a note. A real person reads every one.",
    label: "GENERAL QUESTIONS?",
    href: `mailto:${CONTACT_EMAIL}?subject=General%20question`,
  },
  {
    kicker: "Need a hand",
    line: "Need someone to dig through the public record for you? Tell me what you're working on, and we'll talk it through.",
    label: "CUSTOM: RESEARCH, REPORTS, ANALYSIS, OR CAMPAIGN ASSISTANCE?",
    href: `mailto:${CONTACT_EMAIL}?subject=Custom%20request%3A%20research%2C%20reports%2C%20analysis%20or%20campaign%20assistance`,
  },
] as const;

function GetInTouch() {
  return (
    <section
      id="get-in-touch"
      aria-labelledby="get-in-touch-title"
      className="agx-dark border-t border-navy-line bg-navy-800 text-white"
      style={DARK_VARS}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Get in touch</p>
        <h2
          id="get-in-touch-title"
          className="mt-3 font-serif text-3xl font-medium tracking-tight sm:text-4xl"
        >
          Got a question? I&apos;d love to hear it.
        </h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Pick the one that fits. Both open an email to me.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {CONTACT_CARDS.map((c) => (
            <div
              key={c.label}
              className="flex flex-col rounded-lg border border-navy-line bg-navy-700/60 p-6 sm:p-7"
            >
              <span aria-hidden className="block h-1 w-10 rounded-full bg-gold" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                {c.kicker}
              </p>
              <p className="mt-2 flex-1 text-base leading-relaxed text-white/85">{c.line}</p>
              <a
                href={c.href}
                className="mt-6 inline-flex w-full items-center justify-center whitespace-normal break-words rounded-md border-2 border-slate-400/80 bg-slate-800/60 px-4 py-3 text-center text-sm font-medium uppercase leading-snug tracking-wide text-slate-200 transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 sm:text-[0.95rem]"
              >
                {c.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
