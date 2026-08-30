import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { Button } from "@/components/ui/button";
import { SITE } from "@/content/site";

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
    </SiteShell>
  );
}
