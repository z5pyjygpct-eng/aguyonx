import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { HomeSearch } from "@/components/site/home-search";
import { NewsPeople } from "@/components/site/news-people";
import { SITE } from "@/content/site";
import { NEWS_DEK, NEWS_EMPTY, formatNewsDate, newsNewestFirst } from "@/content/news";

export const Route = createFileRoute("/news")({ component: NewsIndex });

function NewsIndex() {
  const items = newsNewestFirst();

  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>The clip file</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">News</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{NEWS_DEK}</p>
        {items.length === 0 ? (
          <p className="mt-10 max-w-2xl text-muted-foreground">{NEWS_EMPTY}</p>
        ) : (
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid gap-2 py-6 transition-[background-color] duration-150 hover:bg-wash sm:grid-cols-12 sm:items-baseline sm:gap-6"
                >
                  <span className="font-mono text-xs text-muted-foreground sm:col-span-2">
                    {formatNewsDate(item.date)}
                  </span>
                  <span className="sm:col-span-3">
                    <NewsPeople people={item.people} />
                  </span>
                  <span className="sm:col-span-7">
                    <h2 className="font-serif text-xl font-medium">{item.headline}</h2>
                    <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                      {item.outlet}
                    </p>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-10 text-sm">
          <a href={SITE.xUrl} className="hover:underline" target="_blank" rel="noreferrer">
            {SITE.handle} on X
          </a>
        </p>
      </main>
    </SiteShell>
  );
}
