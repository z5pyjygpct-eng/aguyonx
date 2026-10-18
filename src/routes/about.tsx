import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { SITE } from "@/content/site";
import { BOOKS } from "@/content/books";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-12 sm:px-8">
            <Breadcrumbs items={[{ label: "About" }]} className="mb-6" />
            <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">The desk</p>
            <h1 className="mt-2 font-serif text-5xl font-bold uppercase leading-[1.05] sm:text-6xl">
              A Guy on <span className="text-gold">X</span>
            </h1>
            <p className="mt-4 max-w-2xl font-serif text-2xl font-semibold leading-snug sm:text-3xl">
              I&apos;m A Guy on X trying to be the {SITE.handle}.
            </p>
          </div>
        </section>

        <GetInTouch />

        <section aria-label="About the desk" className="border-t border-navy-line">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
            <div className="space-y-6 text-lg leading-relaxed text-[#F6F3EA]">
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
                  className="font-semibold text-gold underline underline-offset-4 hover:text-white"
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
              <div className="space-y-2 border-l-4 border-gold pl-5 font-serif text-2xl font-semibold leading-snug text-white sm:text-3xl">
                <p>If you want spin, this is the wrong site.</p>
                <p>If you want the record, with the receipts, you know where to find me.</p>
              </div>
              <p className="font-serif text-base font-semibold tracking-[0.14em] text-gold uppercase">
                VA Change Agent
                <br />
                <a href={SITE.xUrl} className="font-semibold text-gold underline underline-offset-4 hover:text-white" target="_blank" rel="noreferrer">
                  {SITE.handle}
                </a>
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center rounded-lg bg-gold px-5 font-serif text-base font-bold tracking-[0.06em] text-navy-900 uppercase hover:brightness-110"
              >
                Contact
              </Link>
              <a
                href={SITE.xUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border-2 border-gold px-5 font-serif text-base font-bold tracking-[0.06em] text-gold hover:bg-gold/10"
              >
                {SITE.handle}
              </a>
            </div>
          </div>
        </section>

        <AboutBooks />
      </V4Main>
    </SiteShell>
  );
}

/** Books shelf in v4 tiles (same BOOKS data and wording as the old HomeBooks block). */
function AboutBooks() {
  return (
    <section id="books" aria-labelledby="books-title" className="border-t border-navy-line bg-navy-900/40">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">Books</p>
        <h2 id="books-title" className="mt-2 font-serif text-3xl font-semibold uppercase sm:text-4xl">From the desk</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {BOOKS.map((book) => (
            <li key={book.slug}>
              <a href={book.href} target="_blank" rel="noreferrer" className={`${TILE} grid h-full gap-5 sm:grid-cols-[8rem_1fr] sm:items-start`}>
                <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
                <img src={book.image} alt={book.imageAlt} className="aspect-[2/3] w-32 rounded object-cover outline outline-1 -outline-offset-1 outline-white/10 sm:w-full" />
                <div>
                  <p className="font-mono text-xs tracking-widest text-gold uppercase">Book</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">{book.title}</h3>
                  <p className="mt-1 text-sm italic text-on-dark-muted">{book.subtitle}</p>
                  <p className="mt-3 text-sm text-[#F6F3EA]">{book.dek}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Shared v4 tile (By the Numbers / Tips / dashboards): navy card, gold top edge, gold arrow top right. */
const TILE =
  "group relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 pr-12 text-white transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 sm:p-6 sm:pr-14";

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
    <section id="get-in-touch" aria-labelledby="get-in-touch-title" className="border-t-4 border-gold bg-navy-700/60">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">Get in touch</p>
        <h2 id="get-in-touch-title" className="mt-2 font-serif text-3xl font-semibold uppercase sm:text-4xl">
          Got a question? I&apos;d love to hear it.
        </h2>
        <p className="mt-2 max-w-2xl text-base text-on-dark-muted">Pick the one that fits. Both open an email to me.</p>
        {/* Tile row: auto-fit grid, so a third or fourth tile can be added to CONTACT_CARDS later with no layout change. */}
        <div className="mt-6 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
          {CONTACT_CARDS.map((c) => (
            <a key={c.label} href={c.href} className={`${TILE} flex flex-col shadow-[0_10px_30px_-12px_rgba(245,184,46,0.45)] sm:p-7 sm:pr-16`}>
              <ArrowRight className="absolute top-5 right-5 size-6 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
              <span className="flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.18em] text-gold uppercase">
                <Mail className="size-4" aria-hidden />
                {c.kicker}
              </span>
              <span className="mt-3 block font-serif text-3xl font-bold uppercase leading-tight break-words sm:text-4xl">{c.label}</span>
              <span className="mt-3 block text-base leading-relaxed text-on-dark-muted">{c.line}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
