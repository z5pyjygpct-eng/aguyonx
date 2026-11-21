import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { E27_LIVE, E27_SOON } from "@/lib/election-2027-dashboard";
import BOS from "@/lib/elections-2027-bos.json";
import SB from "@/lib/elections-2027-sb.json";
import CO from "@/lib/elections-2027-co.json";
import HOUSE from "@/lib/elections-2027-house.json";
import SENATE from "@/lib/elections-2027-senate.json";

/**
 * /2027/$locality: "Coming soon" page for a 2027 Election Dashboard locality with no 2027 race data yet.
 * Localities that do have data are sent to the race directory filtered to them. Only facts already in the
 * official data files are shown here; nothing is estimated.
 */
type NoRace = { locality_id: string; body: string; next: string; source_url: string };
type Loc = { id: string; note?: string; note_source_url?: string };
type F = { no_2027?: NoRace[]; localities?: Loc[]; races: { localities?: { locality_id: string }[] }[] };

export const Route = createFileRoute("/2027/$locality")({
  beforeLoad: ({ params }) => {
    const live = E27_LIVE.get(params.locality);
    if (live) throw redirect({ to: "/2027/races", search: live.search as never, hash: live.hash });
    if (!E27_SOON.has(params.locality)) throw notFound();
  },
  head: ({ params }) => ({ meta: [{ title: `${E27_SOON.get(params.locality) ?? "Locality"} · 2027 Election Dashboard · A Guy on X` }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function Page() {
  const { locality } = Route.useParams();
  const name = E27_SOON.get(locality) ?? locality;
  const off = [BOS as F, SB as F].flatMap((f) => (f.no_2027 ?? []).filter((x) => x.locality_id === locality));
  const co = ((CO as F).localities ?? []).find((l) => l.id === locality && l.note);
  const ga = (["house", "senate"] as const).filter((o) => ((o === "house" ? HOUSE : SENATE) as F).races.some((r) => (r.localities ?? []).some((l) => l.locality_id === locality)));
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8 lg:pb-12">
            <Breadcrumbs items={[{ label: "2027 Election", to: "/2027" }, { label: name }]} />
            <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">2027 Election</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
              {name} <span className="text-gold">2027</span>
            </h1>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <div className="max-w-3xl rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7">
            <span className="inline-flex whitespace-nowrap rounded-full bg-on-dark-muted px-3 py-1 text-xs font-bold text-navy-800">Coming soon</span>
            <h2 className="mt-4 font-serif text-2xl font-semibold uppercase">{name} 2027 races</h2>
            <p className="mt-3 text-[#F6F3EA]">We have not posted 2027 race data for {name} yet. This page will fill in once it is built from official records.</p>
            {off.length || co || ga.length ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-on-dark-muted">
                {off.map((x) => (
                  <li key={x.body}>{name} {x.body}: not on the 2027 ballot; next election {x.next}. <a href={x.source_url} {...ext} className="text-gold underline">Official calendar</a></li>
                ))}
                {co ? <li>{co.note} {co.note_source_url ? <a href={co.note_source_url} {...ext} className="text-gold underline">Source</a> : null}</li> : null}
                {ga.map((o) => (
                  <li key={o}>
                    <Link to="/2027/races" search={{ office: o, loc: locality } as never} className="text-gold underline">{o === "house" ? "House of Delegates" : "State Senate"} districts that include {name}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <Link to="/2027" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-gold px-4 font-semibold text-navy-800 hover:bg-gold-hover">
              Back to the 2027 Election Dashboard <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
