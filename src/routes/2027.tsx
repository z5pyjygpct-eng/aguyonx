import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { SITE } from "@/content/site";
import {
  CANDIDATES_2027,
  CANDIDATES_2027_DEK,
  CANDIDATES_2027_EMPTY,
  newsForCandidate,
} from "@/content/candidates-2027";
import { formatNewsDate } from "@/content/news";

export const Route = createFileRoute("/2027")({ component: Democrats2027Page });

function Democrats2027Page() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Virginia</Kicker>
        <p className="mt-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          2027 cycle
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          2027 Democrats
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{CANDIDATES_2027_DEK}</p>
        {CANDIDATES_2027.length === 0 ? (
          <p className="mt-10 max-w-2xl text-muted-foreground">{CANDIDATES_2027_EMPTY}</p>
        ) : (
          <ul className="mt-10 grid gap-4">
            {CANDIDATES_2027.map((c) => {
              const clips = newsForCandidate(c.name);
              return (
                <li
                  key={c.id}
                  className="rounded-md border border-border bg-card px-4 py-5 sm:px-6"
                >
                  <p className="flex flex-wrap items-center gap-2 font-sans text-lg font-semibold">
                    {c.name}
                    <span className="inline-flex size-5 items-center justify-center rounded-sm bg-[#1E4B8E] text-[11px] font-bold text-white">
                      D
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.officeSought}
                    {c.locality ? ` · ${c.locality}` : ""}
                    {c.status ? ` · ${c.status}` : ""}
                  </p>
                  {clips.length > 0 ? (
                    <ul className="mt-4 space-y-2 border-t border-border pt-3">
                      {clips.map((item) => (
                        <li key={item.id}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm hover:underline"
                          >
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatNewsDate(item.date)}
                            </span>
                            <span className="mx-2 text-muted-foreground">·</span>
                            {item.headline}
                            <span className="ml-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                              {item.outlet}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-10 text-sm">
          <a href={SITE.xUrl} className="hover:underline" target="_blank" rel="noreferrer">
            {SITE.handle} on X
          </a>
        </p>
        <p className="mt-8">
          <Link to="/news" className="font-mono text-xs tracking-widest uppercase hover:underline">
            News shelf
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
