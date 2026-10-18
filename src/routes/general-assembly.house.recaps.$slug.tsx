import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { V4Main } from "@/components/site/lcps-v4";
import { Kicker } from "@/components/site/kicker";
import { FTM_TRANSCRIPT_LABEL, ftmTranscriptFor } from "@/content/ftm-transcripts";
import {
  LIS_HOUSE_MINUTES,
  HOUSE_MEETING_BY_ID,
  HOUSE_RECAP_BY_SLUG,
  HOUSE_VOTES_SOURCE,
  houseVideoUrl,
  type HouseRecapIndex,
  type HouseRollCall,
} from "@/content/va-house";

export const Route = createFileRoute("/general-assembly/house/recaps/$slug")({
  component: RecapPage,
  loader: ({ params }): { recap: HouseRecapIndex } => {
    const recap = HOUSE_RECAP_BY_SLUG[params.slug];
    if (!recap) throw notFound();
    return { recap };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Recap: House Floor Session, ${loaderData.recap.dateLabel} · A Guy on X` }]
      : [],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <V4Main>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium">Not found</h1>
        <p className="mt-4">
          <Link
            to="/general-assembly/house"
            className="text-gold underline-offset-2 hover:underline"
          >
            Back to the House
          </Link>
        </p>
        </div>
      </V4Main>
    </SiteShell>
  ),
});

const VOTE_LABEL = { Y: "Yes", N: "No", A: "Abstain", X: "Not voting" } as const;

function RollCall({ rc }: { rc: HouseRollCall }) {
  const first = rc.bills[0];
  return (
    <li className="py-3 text-sm">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <a
          href={first.voteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs font-semibold text-gold hover:underline"
        >
          {rc.voteId}
        </a>
        {rc.tally ? <span className="font-semibold">{rc.tally}</span> : null}
        {rc.bills.length > 1 ? (
          <span className="text-xs text-muted-foreground">
            block vote · {rc.bills.length} bills
          </span>
        ) : null}
        {rc.session !== "20261" ? (
          <span className="text-xs text-muted-foreground">{rc.sessionName}</span>
        ) : null}
      </p>
      <ul className="mt-1 space-y-0.5">
        {rc.bills.map((b) => (
          <li key={b.bill}>
            <a
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-semibold text-foreground hover:text-gold hover:underline"
            >
              {b.bill}
            </a>{" "}
            <span className="text-muted-foreground">{b.title}</span> — {b.action}
          </li>
        ))}
      </ul>
      {rc.members ? (
        <details className="mt-1.5">
          <summary className="cursor-pointer text-xs text-gold">
            How each delegate voted
          </summary>
          <dl className="mt-1 space-y-1 text-xs">
            {(Object.keys(VOTE_LABEL) as (keyof typeof VOTE_LABEL)[])
              .filter((k) => rc.members?.[k]?.length)
              .map((k) => (
                <div key={k}>
                  <dt className="inline font-semibold">
                    {VOTE_LABEL[k]} ({rc.members![k]!.length}):
                  </dt>{" "}
                  <dd className="inline text-muted-foreground">{rc.members![k]!.join(", ")}</dd>
                </div>
              ))}
          </dl>
          {rc.memberTally && rc.tally && rc.memberTally !== rc.tally ? (
            <p className="mt-1 text-xs text-gold">
              The LIS member list totals {rc.memberTally}; the LIS history line reads {rc.tally}.
              Check the LIS vote record.
            </p>
          ) : null}
        </details>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">
          LIS has no member-by-member list for this roll call yet.
        </p>
      )}
    </li>
  );
}

function RecapPage() {
  const { recap } = Route.useLoaderData();
  const meetings = recap.meetingIds.map((id) => HOUSE_MEETING_BY_ID[id]).filter(Boolean);
  const [rollCalls, setRollCalls] = useState<HouseRollCall[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!recap.votesUrl) return;
    let live = true;
    fetch(recap.votesUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { rollCalls: HouseRollCall[] }) => live && setRollCalls(d.rollCalls))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [recap.votesUrl]);
  const transcribed = meetings.filter((m) => ftmTranscriptFor(m.id));

  return (
    <SiteShell>
      <V4Main>
      <HomeSearch />
      <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
        <div className="mx-auto max-w-6xl px-5 pt-6 pb-10 sm:px-8">
            <p className="font-mono text-xs tracking-widest text-night-muted uppercase">
              <Link to="/general-assembly" className="hover:text-white hover:underline">
                General Assembly
              </Link>
              <span className="mx-2 text-gold">/</span>
              <Link to="/general-assembly/house" className="hover:text-white hover:underline">
                House
              </Link>
              <span className="mx-2 text-gold">/</span>
              Meeting recap
            </p>
            <Kicker className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold sm:text-base">Virginia House of Delegates · Floor session</Kicker>
            <h1 className="mt-2 font-serif text-3xl font-bold uppercase leading-[1.08] sm:text-5xl">
              House Floor Session, {recap.dateLabel}
            </h1>
            <p className="mt-3 text-sm text-on-dark-muted sm:text-base">
              House Chamber, State Capitol, Richmond
              {recap.sessions.length ? ` · ${recap.sessions.join(" · ")}` : ""}
            </p>

        </div>
      </section>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            <section className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-5 sm:px-6">
              <Kicker className="text-gold">What was decided · How each member voted</Kicker>
              {!recap.votesUrl ? (
                <aside className="mt-3 rounded-r-md border-l-4 border-gold bg-gold/10 px-4 py-3 text-sm text-[#F6F3EA]">
                  <strong className="font-semibold">No official roll-call votes on record.</strong>{" "}
                  LIS lists no House floor roll calls for this day. See the LIS House minutes.
                </aside>
              ) : failed ? (
                <p className="mt-3 text-sm text-[#FF8A93]">The vote file did not load. Try again.</p>
              ) : !rollCalls ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Loading {recap.rollCallCount} roll call{recap.rollCallCount === 1 ? "" : "s"}…
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-border">
                  {rollCalls.map((rc) => (
                    <RollCall key={`${rc.session}-${rc.voteId}`} rc={rc} />
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Source: {HOUSE_VOTES_SOURCE}. Each vote number opens the official LIS vote record.
                Voice votes are not listed; see the{" "}
                <a
                  href={LIS_HOUSE_MINUTES}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  LIS House minutes
                </a>
                .
              </p>
            </section>

            <section className="space-y-6">
              <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-5 sm:px-6">
                <Kicker className="text-gold">Watch</Kicker>
                <ul className="mt-3 space-y-2">
                  {meetings.map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-sm">
                      <a
                        href={houseVideoUrl(m)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-gold px-2.5 py-1 font-mono text-xs font-semibold text-navy-900 hover:brightness-110"
                      >
                        <PlayCircle className="size-3.5" aria-hidden />
                        Video
                      </a>
                      {m.title} · {m.duration}
                      <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Official video from the House of Delegates archive (YouTube-hosted). The video can start
                  before the House convenes.
                </p>
              </div>
              <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-5 sm:px-6">
                <Kicker className="text-gold">Moments worth watching</Kicker>
                {transcribed.length ? (
                  <p className="mt-3 text-sm">
                    Search every spoken word in{" "}
                    <Link
                      to="/general-assembly/house"
                      className="text-gold underline-offset-2 hover:underline"
                    >
                      Find the Moment
                    </Link>
                    . {FTM_TRANSCRIPT_LABEL}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Full recap after transcript. Official LIS roll calls are below now; key moments post here once this session is transcribed.
                  </p>
                )}
              </div>
            </section>
          </div>
      </div>
      </V4Main>
    </SiteShell>
  );
}
