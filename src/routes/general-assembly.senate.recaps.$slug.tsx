import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { FTM_TRANSCRIPT_LABEL, ftmTranscriptFor } from "@/content/ftm-transcripts";
import {
  LIS_SENATE_MINUTES,
  SENATE_MEETING_BY_ID,
  SENATE_RECAP_BY_SLUG,
  SENATE_VOTES_SOURCE,
  senateVideoUrl,
  type SenateRecapIndex,
  type SenateRollCall,
} from "@/content/va-senate";

export const Route = createFileRoute("/general-assembly/senate/recaps/$slug")({
  component: RecapPage,
  loader: ({ params }): { recap: SenateRecapIndex } => {
    const recap = SENATE_RECAP_BY_SLUG[params.slug];
    if (!recap) throw notFound();
    return { recap };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Recap: Senate Floor Session, ${loaderData.recap.dateLabel} · A Guy on X` }]
      : [],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium">Not found</h1>
        <p className="mt-4">
          <Link
            to="/general-assembly/senate"
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            Back to the Senate
          </Link>
        </p>
      </main>
    </SiteShell>
  ),
});

const VOTE_LABEL = { Y: "Yes", N: "No", A: "Abstain", X: "Not voting" } as const;

function RollCall({ rc }: { rc: SenateRollCall }) {
  const first = rc.bills[0];
  return (
    <li className="py-3 text-sm">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <a
          href={first.voteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs font-semibold text-[#1E4B8E] hover:underline"
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
              className="font-mono text-xs font-semibold text-foreground hover:text-[#1E4B8E] hover:underline"
            >
              {b.bill}
            </a>{" "}
            <span className="text-muted-foreground">{b.title}</span> — {b.action}
          </li>
        ))}
      </ul>
      {rc.members ? (
        <details className="mt-1.5">
          <summary className="cursor-pointer text-xs text-[#1E4B8E]">
            How each senator voted
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
            <p className="mt-1 text-xs text-[#6b3a12]">
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
  const meetings = recap.meetingIds.map((id) => SENATE_MEETING_BY_ID[id]).filter(Boolean);
  const [rollCalls, setRollCalls] = useState<SenateRollCall[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!recap.votesUrl) return;
    let live = true;
    fetch(recap.votesUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { rollCalls: SenateRollCall[] }) => live && setRollCalls(d.rollCalls))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [recap.votesUrl]);
  const transcribed = meetings.filter((m) => ftmTranscriptFor(m.id));

  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/general-assembly" className="hover:text-foreground hover:underline">
            General Assembly
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link to="/general-assembly/senate" className="hover:text-foreground hover:underline">
            Senate
          </Link>
          <span className="mx-2 text-border">/</span>
          Meeting recap
        </p>
        <Kicker className="mt-4">Senate of Virginia · Floor session</Kicker>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Senate Floor Session, {recap.dateLabel}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Senate Chamber, State Capitol, Richmond
          {recap.sessions.length ? ` · ${recap.sessions.join(" · ")}` : ""}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
            <Kicker>What was decided · How each member voted</Kicker>
            {!recap.votesUrl ? (
              <aside className="mt-3 rounded-r-md border-l-4 border-[#c47a3a] bg-[#fdf0e6] px-4 py-3 text-sm text-[#6b3a12]">
                <strong className="font-semibold">No official roll-call votes on record.</strong>{" "}
                LIS lists no Senate floor roll calls for this day. See the LIS Senate minutes.
              </aside>
            ) : failed ? (
              <p className="mt-3 text-sm text-[#b42318]">The vote file did not load. Try again.</p>
            ) : !rollCalls ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Loading {recap.rollCallCount} roll calls…
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-border">
                {rollCalls.map((rc) => (
                  <RollCall key={`${rc.session}-${rc.voteId}`} rc={rc} />
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Source: {SENATE_VOTES_SOURCE}. Each vote number opens the official LIS vote record.
              Voice votes are not listed; see the{" "}
              <a
                href={LIS_SENATE_MINUTES}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E4B8E] hover:underline"
              >
                LIS Senate minutes
              </a>
              .
            </p>
          </section>

          <section className="space-y-6">
            <div className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
              <Kicker>Watch</Kicker>
              <ul className="mt-3 space-y-2">
                {meetings.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-sm">
                    <a
                      href={senateVideoUrl(m)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#0d7377] px-2.5 py-1 font-mono text-xs font-semibold text-white hover:bg-[#095456]"
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
                Official stream on the Senate of Virginia YouTube channel. The stream can start
                before the Senate convenes.
              </p>
            </div>
            <div className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
              <Kicker>Moments worth watching</Kicker>
              {transcribed.length ? (
                <p className="mt-3 text-sm">
                  Search every spoken word in{" "}
                  <Link
                    to="/general-assembly/senate"
                    className="text-[#1E4B8E] underline-offset-2 hover:underline"
                  >
                    Find the Moment
                  </Link>
                  . {FTM_TRANSCRIPT_LABEL}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Transcripts in progress. Moments post here once this session is transcribed.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
