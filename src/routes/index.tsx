import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/content/site";
import { ARTICLES } from "@/content/articles";
import { LIBRARY } from "@/content/library";
import { OFFICE_DOORS } from "@/content/offices";
import { HomeSearch } from "@/components/site/home-search";
import { HomeBooks } from "@/components/site/home-books";
import { NewsPeople } from "@/components/site/news-people";
import { NEWS_DEK, NEWS_EMPTY, formatNewsDate, newsFiledLine, newsNewestFirst } from "@/content/news";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const latestArticles = ARTICLES.slice(0, 3);
  const latestNews = newsNewestFirst().slice(0, 4);

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

        <HomeSearch />

        <HomeBooks />

        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Kicker>News</Kicker>
                <h2 className="mt-2 font-serif text-3xl font-medium">The clip file</h2>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{NEWS_DEK}</p>
              </div>
              <Button asChild variant="link" className="px-0">
                <Link to="/news">
                  All news
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {latestNews.length === 0 ? (
              <p className="mt-10 max-w-2xl text-muted-foreground">{NEWS_EMPTY}</p>
            ) : (
              <ul className="mt-10 divide-y divide-border border-y border-border">
                {latestNews.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="grid gap-2 py-5 transition-[background-color] duration-150 hover:bg-wash sm:grid-cols-12 sm:items-baseline sm:gap-6"
                    >
                      <span className="font-mono text-xs text-muted-foreground sm:col-span-2">
                        {formatNewsDate(item.date)}
                        {newsFiledLine(item) ? (
                          <span className="mt-1 block font-normal">{newsFiledLine(item)}</span>
                        ) : null}
                      </span>
                      <span className="sm:col-span-3">
                        <NewsPeople people={item.people} />
                      </span>
                      <span className="sm:col-span-7">
                        <h3 className="font-serif text-xl font-medium">{item.headline}</h3>
                        <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                          {item.outlet}
                        </p>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
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
