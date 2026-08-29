import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/content/site";
import { ARTICLES } from "@/content/articles";
import { INVESTIGATIONS } from "@/content/investigations";
import { LIBRARY } from "@/content/library";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const lead = INVESTIGATIONS[0];
  const moreInvestigations = INVESTIGATIONS.slice(1);
  const latestArticles = ARTICLES.slice(0, 3);

  return (
    <SiteShell>
      <main>
        <section className="relative isolate min-h-[72vh] overflow-hidden bg-night text-night-fg">
          <img
            src="/images/piedmont.jpg"
            alt="Virginia Piedmont at first light"
            className="absolute inset-0 size-full object-cover opacity-55 outline outline-1 -outline-offset-1 outline-night-fg/10"
          />
          <div className="absolute inset-0 bg-night/55" />
          <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 py-16 sm:px-6 sm:py-20">
            <Kicker className="text-night-muted">
              {SITE.domain} · {SITE.location}
            </Kicker>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] font-medium tracking-tight sm:text-6xl">
              The public record is the story.
            </h1>
            <p className="mt-5 max-w-xl text-base text-night-muted sm:text-lg">
              Independent investigative research and political intelligence — FOIA, filings, and
              the media trail, assembled for citizens who want the primary source.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary" size="lg">
                <Link to="/investigations">
                  Read investigations
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-night-fg/60 bg-transparent text-night-fg hover:bg-night-fg/10 hover:text-night-fg"
              >
                <Link to="/library">Open the library</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-20">
            <div className="lg:col-span-7">
              <Kicker>Lead investigation</Kicker>
              <Link
                to="/investigations/$slug"
                params={{ slug: lead.slug }}
                className="group mt-4 block"
              >
                <img
                  src={lead.image}
                  alt={lead.imageAlt}
                  className="aspect-feature w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10"
                />
                <p className="mt-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  {lead.kicker}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-medium group-hover:underline">
                  {lead.title}
                </h2>
                <p className="mt-2 text-muted-foreground">{lead.dek}</p>
              </Link>
            </div>
            <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
              <Kicker>Also on the desk</Kicker>
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {moreInvestigations.map((s) => (
                  <li key={s.slug} className="py-5">
                    <Link
                      to="/investigations/$slug"
                      params={{ slug: s.slug }}
                      className="block hover:underline"
                    >
                      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                        {s.kicker}
                      </p>
                      <h3 className="mt-1 font-serif text-xl font-medium">{s.title}</h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Kicker>Articles</Kicker>
                <h2 className="mt-2 font-serif text-3xl font-medium">Commentary from the file</h2>
              </div>
              <Button asChild variant="link" className="px-0">
                <Link to="/articles">
                  All articles
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {latestArticles.map((a) => (
                <Link
                  key={a.slug}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="group"
                >
                  <img
                    src={a.image}
                    alt={a.imageAlt}
                    className="aspect-feature w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10"
                  />
                  <p className="mt-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    {a.kicker}
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-medium group-hover:underline">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.dek}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-wash">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
            <div>
              <Badge>Research library</Badge>
              <h2 className="mt-4 font-serif text-3xl font-medium sm:text-4xl">
                Reports, packets, datasets, FOIA.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Built to hold government documents, campaign-finance material, and working files —
                with a VFOIA desk you can run today. {LIBRARY.length} records on the shelf.
              </p>
              <Button asChild className="mt-6">
                <Link to="/library">
                  Browse the library
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <img
              src="/images/records.jpg"
              alt="County records room"
              className="aspect-photo w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10"
            />
          </div>
        </section>

        <section className="bg-night text-night-fg">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div>
              <Kicker className="text-night-muted">The desk</Kicker>
              <h2 className="mt-3 font-serif text-3xl font-medium">
                {SITE.author}. Loudoun County. Primary sources.
              </h2>
              <p className="mt-4 text-night-muted">
                Author of Grassroots Intelligence. Building VPIP for Virginia. This site is the
                public folder.
              </p>
            </div>
            <div className="flex flex-col justify-end gap-3 sm:flex-row lg:items-end lg:justify-end">
              <Button asChild variant="secondary">
                <Link to="/about">About</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-night-fg/60 bg-transparent text-night-fg hover:bg-night-fg/10 hover:text-night-fg"
              >
                <Link to="/contact">Contact</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
