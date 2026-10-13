import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { ftmLocalities } from "@/content/ftm-localities";

export const Route = createFileRoute("/find-the-moment_/$locality")({
  component: LocalityHub,
  head: ({ params }) => {
    const l = ftmLocalities().find((x) => x.id === params.locality);
    return { meta: [{ title: `${l?.title ?? "Locality"} · Find the Moment · A Guy on X` }] };
  },
});

function LocalityHub() {
  const { locality } = Route.useParams();
  const l = ftmLocalities().find((x) => x.id === locality);
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        {!l ? (
          <p>
            Locality not found. <Link to="/find-the-moment" className="underline">All venues →</Link>
          </p>
        ) : (
          <>
            <Kicker>{l.region} · Find the Moment</Kicker>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">{l.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Pick a venue: search what was said and jump to the official video.
            </p>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {l.venues.map((v) => (
                <li key={v.href + v.name}>
                  {v.live ? (
                    <a href={v.href} className="block h-full rounded-md border border-border bg-card px-5 py-5 hover:bg-wash">
                      <p className="font-mono text-xs tracking-widest text-[#0d7377] uppercase">Live</p>
                      <p className="mt-2 font-serif text-2xl font-medium">{v.name}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{v.note}</p>
                    </a>
                  ) : (
                    <div className="block h-full rounded-md border border-dashed border-border bg-card px-5 py-5 opacity-80">
                      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Coming soon</p>
                      <p className="mt-2 font-serif text-2xl font-medium">{v.name}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{v.note}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {l.extra ? (
              <p className="mt-8">
                <a href={l.extra.href} className="text-sm underline-offset-2 hover:underline">{l.extra.label}</a>
              </p>
            ) : null}
            <p className="mt-6">
              <Link to="/find-the-moment" className="text-sm text-muted-foreground underline-offset-2 hover:underline">
                All Find the Moment venues →
              </Link>
            </p>
          </>
        )}
      </main>
    </SiteShell>
  );
}
