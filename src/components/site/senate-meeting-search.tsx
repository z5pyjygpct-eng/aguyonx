import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import {
  SENATE_MEETING_BY_ID,
  SENATE_MEETINGS,
  SENATE_RECAP_BY_MEETING,
  SENATE_VENUE,
  senateJumpUrl,
  type SenateMeeting,
} from "@/content/va-senate";
import {
  FTM_TRANSCRIPT_LABEL,
  FTM_TRANSCRIPTS,
  type FtmTranscript,
} from "@/content/ftm-transcripts";
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

type Hit = { meeting: SenateMeeting; slice: FtmSlice };

/**
 * Find the Moment for Senate of Virginia floor sessions (machine transcripts only).
 * Hits jump to the official Senate YouTube stream at that second.
 */
export function SenateMeetingSearch() {
  const transcripts = useMemo(() => FTM_TRANSCRIPTS.filter((t) => t.venue === SENATE_VENUE), []);
  const searchable = useMemo(
    () =>
      transcripts
        .map((t) => ({ t, m: SENATE_MEETING_BY_ID[t.meetingId] }))
        .filter((x): x is { t: FtmTranscript; m: SenateMeeting } => Boolean(x.m))
        .sort((a, b) => b.m.date.localeCompare(a.m.date)),
    [transcripts],
  );
  const allMeetings = useMemo(
    () => [...SENATE_MEETINGS].sort((a, b) => b.date.localeCompare(a.date)),
    [],
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
      <div className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            disabled
            placeholder="Search what was said (e.g. data centers, taxes)"
            aria-label="Search what was said (opens when transcripts post)"
            className="h-11 flex-1 cursor-not-allowed rounded-md border border-border bg-background px-3 text-base opacity-70"
          />
          <button
            type="button"
            disabled
            className="h-11 cursor-not-allowed rounded-md bg-primary px-5 text-sm font-semibold tracking-wide text-primary-foreground uppercase opacity-60"
          >
            Search
          </button>
        </div>
        <p className="mt-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Transcripts in progress
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {allMeetings.length} 2026 Senate floor sessions are queued for machine transcription.
          Search opens here as the first transcripts post.
        </p>
      </div>
    );
  }

  const shown = hits.slice(0, HIT_CAP);
  return (
    <div className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
      <form onSubmit={run} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="senate-ftm-q">
          Search what was said
        </label>
        <input
          id="senate-ftm-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search what was said (e.g. data centers, minimum wage, a senator’s name)"
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
          const recap = SENATE_RECAP_BY_MEETING[meeting.id];
          return (
            <li key={`${meeting.id}-${slice.start}`} className="py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <a
                  href={senateJumpUrl(meeting, slice.start)}
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
                    to="/general-assembly/senate/recaps/$slug"
                    params={{ slug: recap.slug }}
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
