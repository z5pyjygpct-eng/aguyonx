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
import { OFFICE_DOORS } from "@/content/offices";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const lead = INVESTIGATIONS[0];
  const moreInvestigations = INVESTIGATIONS.slice(1);
  const latestArticles = ARTICLES.slice(0, 3);

  return (
    <SiteShell hideHeader>
      <main>
        <section className="relative isolate bg-night">
          <img
            src="/images/va-change-hero.png"
            alt="VA Change Agent: a figure on the X, Virginia behind"
            className="block h-auto w-full"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night/80 to-transparent" />
          <h1 className="absolute inset-x-0 top-6 z-10 px-4 text-center font-sans text-4xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:top-10 sm:text-6xl lg:text-7xl">
            The Public Record Is The Story.
          </h1>
          <nav
            aria-label="Primary"
            className="absolute inset-x-0 bottom-6 z-10 flex flex-wrap justify-center gap-3 px-4 sm:bottom-10 sm:gap-4"
          >
            {(
              [
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
                { to: "/investigations", label: "Investigations" },
                { to: "/articles", label: "Articles" },
                { to: "/library", label: "Library" },
              ] as const
            ).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex items-center rounded-md bg-[#E6E1D4] px-6 py-3 font-sans text-sm font-semibold tracking-[0.16em] text-night uppercase sm:px-8 sm:py-3.5 sm:text-base md:px-10 md:py-4 md:text-lg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </section>

        <nav
          aria-label="Virginia offices"
          className="flex flex-wrap justify-center gap-3 border-b border-border px-4 py-6 sm:gap-4 sm:py-8"
        >
          {OFFICE_DOORS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="inline-flex items-center rounded-md bg-[#1E4B8E] px-6 py-3 font-sans text-sm font-semibold tracking-[0.16em] text-white uppercase sm:px-8 sm:py-3.5 sm:text-base md:px-10 md:py-4 md:text-lg"
            >
              {item.title}
            </Link>
          ))}
        </nav>

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
                <h2 className="mt-2 font-serif text-3xl font-medium">X Articles from @VaChangeAgent</h2>
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
                  {a.dek !== "Published as an X Article." ? (
                    <p className="mt-2 text-sm text-muted-foreground">{a.dek}</p>
                  ) : null}
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
                Author of Grassroots Intelligence. A publication of {SITE.firm}. {SITE.product} is
                the commissioned desk. This site is the public folder.
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
