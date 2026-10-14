import { createFileRoute } from "@tanstack/react-router";
import { FtmThumb } from "@/components/site/ftm-thumb";
import { isoMeta, useMeetingFilters } from "@/components/site/meeting-filters";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { VenueStats } from "@/components/site/loudoun-stats";
import { FTM_TRANSCRIPTS } from "@/content/ftm-transcripts";
import {
  VBOE_AGENDAS,
  VBOE_MEETINGS,
  VBOE_VENUE,
  VBOE_YOUTUBE,
  vboeMeetingType,
  vboeVideoUrl,
} from "@/content/va-boe";

export const Route = createFileRoute("/board-of-education")({
  component: VboePage,
  head: () => ({
    meta: [{ title: "Virginia Board of Education meetings · Find the Moment · A Guy on X" }],
  }),
});

function VboePage() {
  const has = new Set(FTM_TRANSCRIPTS.filter((t) => t.venue === VBOE_VENUE).map((t) => t.meetingId));
  const { filtered: list, controls } = useMeetingFilters(VBOE_MEETINGS, (m) => isoMeta(m.date, vboeMeetingType(m.title)), "meetings");
  const searchable = VBOE_MEETINGS.filter((m) => has.has(m.id)).length;
  return (
    <SiteShell location="Virginia">
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Virginia · Statewide</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Virginia Board of Education
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Find the Moment: search what the state Board of Education said in its work sessions and
          business meetings, and jump straight to the official VDOE video.
        </p>
        <p className="mt-3 font-mono text-xs tracking-wide text-muted-foreground">
          {VBOE_MEETINGS.length} meeting videos · {searchable} searchable now ·{" "}
          {VBOE_MEETINGS.length - searchable} in queue
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-medium">Find the Moment</h2>
          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
            <div className="rounded-md border border-border bg-card px-5 py-5 text-sm text-muted-foreground">
              {searchable > 0
                ? `${searchable} Board of Education meetings are transcribed. Open a meeting below to jump to its video.`
                : "Board of Education meetings are queued for transcription. Search opens here as transcripts post."}
            </div>
            <VenueStats
              heading="By the numbers · Virginia Board of Education"
              meetings={VBOE_MEETINGS}
              recapCount={0}
              note={
                searchable
                  ? undefined
                  : "No Board of Education transcripts have posted yet; every meeting is queued. Counts fill in as they post."
              }
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">Meeting videos</h2>
          {controls}
          <ul className="mt-4 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {list.map((m) => (
              <li key={m.id} className="flex h-full flex-col gap-1.5 rounded-md border border-border bg-card px-4 py-4 text-sm">
                <FtmThumb top venue="va-boe" meetingId={m.id} href={vboeVideoUrl(m)} />
                <span className="font-mono text-xs text-muted-foreground">{m.dateLabel}</span>
                <span className="font-serif text-lg font-medium leading-snug">{m.title}</span>
                <span className="text-xs text-muted-foreground">{m.duration}</span>
                <span className="mt-auto flex flex-wrap gap-2 pt-1 text-xs">
                  <a href={vboeVideoUrl(m)} target="_blank" rel="noopener noreferrer" className="rounded border border-border px-2 py-0.5 hover:bg-wash">
                    Video
                  </a>
                  <span className="rounded border border-border px-2 py-0.5 text-muted-foreground">
                    {has.has(m.id) ? "Transcript" : "Queued"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <details className="mt-10 rounded-md border border-border bg-card px-5 py-4 text-sm">
          <summary className="cursor-pointer font-medium">Sources & downloads</summary>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <a href={VBOE_YOUTUBE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                VDOE official YouTube channel (live streams) <ExternalLink className="size-3" />
              </a>
            </li>
            <li>
              <a href={VBOE_AGENDAS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                Board of Education agendas, minutes and materials (VDOE) <ExternalLink className="size-3" />
              </a>
            </li>
            <li>Closed sessions are not streamed. Transcripts are machine-generated; check the video before quoting.</li>
          </ul>
        </details>
      </main>
    </SiteShell>
  );
}
