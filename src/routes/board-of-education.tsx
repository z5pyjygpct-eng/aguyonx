import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  const years = [...new Set(VBOE_MEETINGS.map((m) => m.date.slice(0, 4)))].sort().reverse();
  const types = [...new Set(VBOE_MEETINGS.map((m) => vboeMeetingType(m.title)))].sort();
  const [year, setYear] = useState("all");
  const [type, setType] = useState("all");
  const list = useMemo(
    () =>
      VBOE_MEETINGS.filter(
        (m) =>
          (year === "all" || m.date.startsWith(year)) &&
          (type === "all" || vboeMeetingType(m.title) === type),
      ),
    [year, type],
  );
  const searchable = VBOE_MEETINGS.filter((m) => has.has(m.id)).length;
  const sel = "rounded-md border border-border bg-card px-2 py-1.5 text-sm";
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
          <h2 className="font-serif text-2xl font-medium">Meetings</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <label className="text-sm">
              Year{" "}
              <select className={sel} value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="all">All</option>
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Type{" "}
              <select className={sel} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="all">All</option>
                {types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-card">
            {list.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{m.dateLabel}</span>
                <span className="font-medium">{m.title}</span>
                <span className="text-xs text-muted-foreground">{m.duration}</span>
                <span className="ml-auto flex gap-2 text-xs">
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
