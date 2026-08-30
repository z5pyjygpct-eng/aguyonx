import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { Badge } from "@/components/ui/badge";
import { INVESTIGATIONS } from "@/content/investigations";

export const Route = createFileRoute("/investigations/")({ component: InvestigationsIndex });

function InvestigationsIndex() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>The file</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Investigations
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Long-form research with citations, source documents, and the public trail. Method first.
        </p>
        {INVESTIGATIONS.length === 0 ? (
          <p className="mt-10 text-muted-foreground">Nothing on this shelf yet.</p>
        ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {INVESTIGATIONS.map((a) => (
            <li key={a.slug}>
              <Link
                to="/investigations/$slug"
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
        )}
      </main>
    </SiteShell>
  );
}
