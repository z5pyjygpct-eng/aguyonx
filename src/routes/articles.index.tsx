import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { Badge } from "@/components/ui/badge";
import { ARTICLES } from "@/content/articles";

export const Route = createFileRoute("/articles/")({ component: ArticlesIndex });

function ArticlesIndex() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>The desk</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Articles
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Commentary that starts from a file — elections, budgets, school packets — not from a
          clip.
        </p>
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <Link
                to="/articles/$slug"
                params={{ slug: a.slug }}
                className="grid gap-6 py-8 transition-[background-color] duration-150 hover:bg-wash sm:grid-cols-12 sm:items-center"
              >
                <img
                  src={a.image}
                  alt={a.imageAlt}
                  className="aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10 sm:col-span-4"
                />
                <div className="sm:col-span-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{a.kicker}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">{a.displayDate}</span>
                  </div>
                  <h2 className="mt-3 font-serif text-2xl font-medium">{a.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{a.dek}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </SiteShell>
  );
}
