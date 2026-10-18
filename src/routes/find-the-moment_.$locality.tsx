import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { V4Main } from "@/components/site/lcps-v4";
import { ftmLocalities } from "@/content/ftm-localities";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

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
      <V4Main>
        <HomeSearch />
        {!l ? (
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
            <Breadcrumbs items={[{ label: "Find the Moment", to: "/find-the-moment" }, { label: "Locality not found" }]} className="mb-6" />
            <p>
              Locality not found. <Link to="/find-the-moment" className="text-gold underline">All venues →</Link>
            </p>
          </div>
        ) : (
          <>
            <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
              <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
              <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
                <Breadcrumbs items={[{ label: "Find the Moment", to: "/find-the-moment" }, { label: l.title }]} className="mb-6" />
                <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase sm:text-base">{l.region} · Find the Moment</p>
                <h1 className="mt-2 font-serif text-5xl font-bold uppercase leading-[1.05] sm:text-6xl">{l.title}</h1>
                <p className="mt-4 max-w-2xl text-lg text-[#F6F3EA]">
                  Pick a venue: search what was said and jump to the official video.
                </p>
              </div>
            </section>
            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 sm:py-12">
              <ul className="grid gap-5 sm:grid-cols-2">
                {l.venues.map((v) => (
                  <li key={v.href + v.name}>
                    {v.live ? (
                      <a href={v.href} className="group relative flex flex-col rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 pr-12 text-white transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:p-6 sm:pr-14 h-full">
                        <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
                        <p className="w-fit rounded bg-gold px-1.5 py-0.5 font-mono text-xs font-bold tracking-widest text-navy-900 uppercase">Live</p>
                        <p className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">{v.name}</p>
                        <p className="mt-2 text-sm text-on-dark-muted">{v.note}</p>
                      </a>
                    ) : (
                      <div className="block h-full rounded-xl border border-dashed border-navy-line bg-navy-800 p-5 text-white/80 sm:p-6">
                        <p className="w-fit rounded border border-on-dark-muted/50 px-1.5 py-0.5 font-mono text-xs tracking-widest text-on-dark-muted uppercase">Coming soon</p>
                        <p className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">{v.name}</p>
                        <p className="mt-2 text-sm text-on-dark-muted">{v.note}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {l.extra ? (
                <p className="mt-8">
                  <a href={l.extra.href} className="text-sm font-semibold text-gold underline-offset-4 hover:underline">{l.extra.label}</a>
                </p>
              ) : null}
              <p className="mt-6">
                <Link to="/find-the-moment" className="text-sm text-on-dark-muted underline-offset-4 hover:text-gold hover:underline">
                  All Find the Moment venues →
                </Link>
              </p>
            </div>
          </>
        )}
      </V4Main>
    </SiteShell>
  );
}
