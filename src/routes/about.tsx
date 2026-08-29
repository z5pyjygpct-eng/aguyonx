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
        <p className="mt-4 text-lg text-muted-foreground">{SITE.tagline}</p>

        <div className="mt-10 space-y-5 leading-relaxed">
          <p>
            {SITE.author} is a citizen researcher in {SITE.location}, writing as {SITE.handle}.
            This site — {SITE.domain} — is the public folder: investigations, articles, and a
            research library of primary sources.
          </p>
          <p>
            The method is in the book{" "}
            <a href={SITE.bookUrl} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              Grassroots Intelligence: The New Age of Citizen Political Research
            </a>
            : name the record, date the trail, ask for what is missing. VPIP — the Virginia
            Political Intelligence Portal — is the machine being built from that blueprint.
          </p>
          <p>
            This is not a party committee, a consultancy, or a newspaper. It is independent
            investigative research. Claims that cannot survive contact with a document do not
            ship.
          </p>
        </div>

        <ol className="mt-12 divide-y divide-border border-y border-border">
          {[
            {
              n: "01",
              t: "Name the record",
              d: "Application numbers, ordinance IDs, meeting dates. If you cannot cite it, you do not have it.",
            },
            {
              n: "02",
              t: "Date the trail",
              d: "A clip without a date is a rumor. File every public appearance by day, outlet, and subject.",
            },
            {
              n: "03",
              t: "Ask for what is missing",
              d: "The useful FOIA points at a gap in an already-public file.",
            },
            {
              n: "04",
              t: "Publish the folder",
              d: "Primary sources, offered. If a claim only works when a page is withheld, it is not research.",
            },
          ].map((m) => (
            <li key={m.n} className="grid gap-2 py-6 sm:grid-cols-12">
              <p className="font-mono text-xs tracking-widest text-muted-foreground sm:col-span-2">
                {m.n}
              </p>
              <div className="sm:col-span-10">
                <h2 className="font-serif text-xl font-medium">{m.t}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{m.d}</p>
              </div>
            </li>
          ))}
        </ol>

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
