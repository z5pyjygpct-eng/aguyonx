import { AllFtmLink } from "@/components/site/all-ftm-link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import {
  CITY_MEETING_BY_ID,
  CITY_VENUES,
  cityJumpUrl,
  cityMeetingsFor,
  type CityMeeting,
  type CityVenueId,
} from "@/content/cities";
import {
  FTM_TRANSCRIPT_LABEL,
  FTM_TRANSCRIPTS,
  type FtmTranscript,
} from "@/content/ftm-transcripts";
import { CITY_RECAP_BY_MEETING } from "@/content/city-recaps";
import { FTM_PACK_MIN_MEETINGS, fetchFtmSlices, type FtmSlice } from "@/lib/ftm-pack";

const HIT_CAP = 60;

function secToHms(raw: number): string {
  const s = Math.floor(raw);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = query.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return <>{text}</>;
  const re = new RegExp(`(${parts.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-[#c8ebe8] px-0.5 text-foreground">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

type Hit = { meeting: CityMeeting; slice: FtmSlice };

/**
 * Find the Moment for one or more city venues. Searches machine transcripts only
 * (cities have no caption index). Meetings without a transcript are listed but not searchable yet.
 */
export function CityMeetingSearch({ venues }: { venues: CityVenueId[] }) {
  const transcripts = useMemo(
    () => FTM_TRANSCRIPTS.filter((t) => (venues as string[]).includes(t.venue)),
    [venues],
  );
  const searchable = useMemo(
    () =>
      transcripts
        .map((t) => ({ t, m: CITY_MEETING_BY_ID[t.meetingId] }))
        .filter((x): x is { t: FtmTranscript; m: CityMeeting } => Boolean(x.m))
        .sort((a, b) => b.m.date.localeCompare(a.m.date)),
    [transcripts],
  );
  const allMeetings = useMemo(
    () => venues.flatMap((v) => cityMeetingsFor(v)).sort((a, b) => b.date.localeCompare(a.date)),
    [venues],
  );
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runRef = useRef(0);

  async function run(e?: FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    setSubmitted(query);
    if (!query) return setHits([]);
    const run = ++runRef.current;
    const targets = filter === "all" ? searchable : searchable.filter((x) => x.m.id === filter);
    setLoading(true);
    setError(null);
    const found: Hit[] = [];
    const needle = query.toLowerCase();
    const pack = targets.length >= FTM_PACK_MIN_MEETINGS;
    let failed = 0;
    await Promise.all(
      targets.map(async ({ t, m }) => {
        try {
          const slices = await fetchFtmSlices(t.url, { pack });
          for (const s of slices)
            if (s.text.toLowerCase().includes(needle)) found.push({ meeting: m, slice: s });
        } catch {
          failed += 1;
        }
        if (run === runRef.current) {
          setHits(
            [...found].sort(
              (a, b) =>
                b.meeting.date.localeCompare(a.meeting.date) || a.slice.start - b.slice.start,
            ),
          );
        }
      }),
    );
    if (run !== runRef.current) return;
    if (failed) setError(`${failed} meeting file(s) did not load. Try again.`);
    setLoading(false);
  }

  if (!searchable.length) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card/60 px-5 py-6">
        <AllFtmLink className="mb-3 text-right" />
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Transcripts in progress
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {allMeetings.length} meetings since January 2025 are queued for machine transcription.
          Search opens here as the first transcripts post.
        </p>
      </div>
    );
  }

  const shown = hits.slice(0, HIT_CAP);
  return (
    <div className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
      <AllFtmLink className="mb-3 text-right" />
      <form onSubmit={run} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="city-ftm-q">
          Search what was said
        </label>
        <input
          id="city-ftm-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search what was said (e.g. budget, zoning, police)"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          aria-label="Meeting"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-2 text-sm sm:max-w-xs"
        >
          <option value="all">All meetings ({searchable.length})</option>
          {searchable.map(({ m }) => (
            <option key={m.id} value={m.id}>
              {m.dateLabel} · {m.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#1E4B8E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a6e]"
        >
          <Search className="size-4" aria-hidden />
          Search
        </button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        {searchable.length} of {allMeetings.length} meetings transcribed so far.{" "}
        {FTM_TRANSCRIPT_LABEL}
      </p>
      {error ? <p className="mt-2 text-sm text-[#b42318]">{error}</p> : null}
      {submitted ? (
        <p className="mt-4 text-sm" aria-live="polite">
          {loading ? "Searching… " : ""}
          {hits.length} {hits.length === 1 ? "moment" : "moments"} for “{submitted}”
          {hits.length > HIT_CAP ? ` (showing first ${HIT_CAP})` : ""}
        </p>
      ) : null}
      <ul className="mt-3 divide-y divide-border">
        {shown.map(({ meeting, slice }) => {
          const recap = CITY_RECAP_BY_MEETING[meeting.id];
          return (
            <li key={`${meeting.id}-${slice.start}`} className="py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <a
                  href={cityJumpUrl(meeting, slice.start)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-[#0d7377] px-2 py-0.5 font-mono font-semibold text-white tabular-nums hover:bg-[#095456]"
                >
                  {secToHms(slice.start)}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
                <span>
                  {meeting.dateLabel} · {meeting.title}
                </span>
                <span className="rounded-sm bg-[#e8eef6] px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[#1E4B8E] uppercase">
                  Machine transcript
                </span>
                {recap ? (
                  <Link
                    to="/cities/$city/recaps/$slug"
                    params={{ city: CITY_VENUES[meeting.venue].city, slug: recap.slug }}
                    className="text-[#1E4B8E] underline-offset-2 hover:underline"
                  >
                    Recap
                  </Link>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed">
                <Highlighted text={slice.text} query={submitted} />
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Plain meeting list with official links (all meetings in scope, transcribed or not). */
export function CityMeetingList({ venues }: { venues: CityVenueId[] }) {
  const meetings = venues
    .flatMap((v) => cityMeetingsFor(v))
    .sort((a, b) => b.date.localeCompare(a.date));
  const has = new Set(FTM_TRANSCRIPTS.map((t) => t.meetingId));
  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-card">
      {meetings.map((m) => {
        const recap = CITY_RECAP_BY_MEETING[m.id];
        return (
          <li
            key={m.id}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5 text-sm"
          >
            <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
              {m.dateLabel}
            </span>
            <a
              href={m.playerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline-offset-2 hover:text-[#1E4B8E] hover:underline"
            >
              {m.title}
            </a>
            {m.duration ? (
              <span className="text-xs text-muted-foreground">{m.duration}</span>
            ) : null}
            {m.agendaUrl ? (
              <a
                href={m.agendaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1E4B8E] hover:underline"
              >
                Agenda
              </a>
            ) : null}
            {m.minutesUrl ? (
              <a
                href={m.minutesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1E4B8E] hover:underline"
              >
                Minutes
              </a>
            ) : null}
            {recap ? (
              <Link
                to="/cities/$city/recaps/$slug"
                params={{ city: CITY_VENUES[m.venue].city, slug: recap.slug }}
                className="text-xs text-[#1E4B8E] hover:underline"
              >
                Recap
              </Link>
            ) : null}
            <span className="ml-auto font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              {has.has(m.id) ? "Transcribed" : "Queued"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
