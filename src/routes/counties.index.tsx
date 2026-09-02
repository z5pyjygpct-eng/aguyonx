import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { COUNTIES } from "@/content/counties";

export const Route = createFileRoute("/counties/")({ component: CountiesIndex });

function CountiesIndex() {
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Virginia</Kicker>
        <p className="mt-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Local meetings · public record
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          VA Counties
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          County doors for meetings and the official record. Taste, not the shop — no dossiers, no
          finance tabs, no findings.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COUNTIES.map((county) => (
            <li key={county.slug}>
              {county.live && county.slug === "loudoun" ? (
                <Link
                  to="/counties/loudoun"
                  className="block h-full rounded-md border border-border bg-card px-5 py-5 transition-[background-color] duration-150 hover:bg-wash"
                >
                  <p className="font-mono text-xs tracking-widest text-[#0d7377] uppercase">Live</p>
                  <p className="mt-2 font-serif text-2xl font-medium">{county.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{county.dek}</p>
                </Link>
              ) : county.live ? (
                <div className="block h-full rounded-md border border-border bg-card px-5 py-5">
                  <p className="font-mono text-xs tracking-widest text-[#0d7377] uppercase">Live</p>
                  <p className="mt-2 font-serif text-2xl font-medium">{county.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{county.dek}</p>
                </div>
              ) : (
                <div className="block h-full rounded-md border border-dashed border-border bg-card/60 px-5 py-5">
                  <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    Coming soon
                  </p>
                  <p className="mt-2 font-serif text-2xl font-medium text-muted-foreground">
                    {county.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{county.dek}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </SiteShell>
  );
}
