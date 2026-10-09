import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import {
  LOUDOUN_MEETING_BY_ID,
  LOUDOUN_MEETINGS,
  LOUDOUN_TOPIC_CHIPS,
  loudounMeetingJumpUrl,
  loudounProvider,
  type CaptionWindow,
  type LoudounCaptionSlice,
  type LoudounMeeting,
} from "@/content/loudoun";
import { FTM_TRANSCRIPT_LABEL, FTM_TRANSCRIPTS, ftmTranscriptFor } from "@/content/ftm-transcripts";
import { LOUDOUN_RECAP_BY_MEETING } from "@/content/loudoun-recaps";
import { cn } from "@/lib/utils";
import { FTM_PACK_MIN_MEETINGS, FtmFetchError, fetchFtmSlices } from "@/lib/ftm-pack";

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

function HighlightedSnippet({ text, query }: { text: string; query: string }) {
  const parts = query.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return <>{text}</>;
  const re = new RegExp(`(${parts.map(escapeRegExp).join("|")})`, "gi");
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<span key={`t-${i}`}>{text.slice(last, match.index)}</span>);
      i += 1;
    }
    nodes.push(
      <mark key={`m-${i}`} className="rounded-sm bg-[#c8ebe8] px-0.5 text-foreground">
        {match[0]}
      </mark>,
    );
    i += 1;
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(<span key={`t-${i}`}>{text.slice(last)}</span>);
  return <>{nodes}</>;
}

/** Where a search window came from. Transcript = whisper speech-to-text; captions = county auto-captions. */
type WindowSource = "transcript" | "captions";
type SourcedWindow = CaptionWindow & { source: WindowSource };
/** "best" = machine transcript where one exists, captions elsewhere. */
type SourceMode = "best" | "captions";

const TRANSCRIPT_MEETING_COUNT = FTM_TRANSCRIPTS.filter((t) => t.venue === "loudoun-bos").length;

function sourceFor(meeting: LoudounMeeting, mode: SourceMode): WindowSource {
  return mode === "best" && ftmTranscriptFor(meeting.id) ? "transcript" : "captions";
}

function searchWindows(windows: SourcedWindow[], query: string): SourcedWindow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return windows.filter((w) => w.text.toLowerCase().includes(q));
}

type CacheEntry = SourcedWindow[] | "loading" | "error";

function SourceBadge({ source }: { source: WindowSource }) {
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase",
        source === "transcript" ? "bg-[#e8eef6] text-[#1E4B8E]" : "bg-wash text-muted-foreground",
      )}
    >
      {source === "transcript" ? "Machine transcript" : "Captions"}
    </span>
  );
}

export function LoudounMeetingSearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [meetingFilter, setMeetingFilter] = useState<string | "all">("all");
  const [sourceMode, setSourceMode] = useState<SourceMode>("best");
  const [cacheTick, setCacheTick] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** In-memory cache of fetched meeting windows (module-lifetime via ref). */
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const inflightRef = useRef<Map<string, Promise<SourcedWindow[]>>>(new Map());

  /** Batch re-renders while many meetings stream in (one per ~120 ms). */
  const tickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bumpSoon = useCallback(() => {
    if (tickTimerRef.current) return;
    tickTimerRef.current = setTimeout(() => {
      tickTimerRef.current = null;
      setCacheTick((t) => t + 1);
    }, 120);
  }, []);
  useEffect(
    () => () => {
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    },
    [],
  );

  const loadMeeting = useCallback(
    async (
      meeting: LoudounMeeting,
      source: WindowSource,
      pack: boolean,
    ): Promise<SourcedWindow[]> => {
      const key = `${meeting.id}:${source}`;
      const cached = cacheRef.current.get(key);
      if (Array.isArray(cached)) return cached;

      const existing = inflightRef.current.get(key);
      if (existing) return existing;

      cacheRef.current.set(key, "loading");

      const url =
        source === "transcript"
          ? (ftmTranscriptFor(meeting.id)?.url ?? meeting.windowsUrl)
          : meeting.windowsUrl;

      const promise = (async () => {
        let slices: LoudounCaptionSlice[];
        try {
          slices = await fetchFtmSlices(url, { pack });
        } catch (err) {
          if (err instanceof FtmFetchError) {
            throw new Error(`HTTP ${err.status} for meeting ${meeting.id}`);
          }
          throw err;
        }
        const windows: SourcedWindow[] = slices.map((s) => ({
          meetingId: meeting.id,
          start: s.start,
          end: s.end,
          text: s.text,
          source,
        }));
        cacheRef.current.set(key, windows);
        inflightRef.current.delete(key);
        bumpSoon();
        return windows;
      })().catch((err) => {
        cacheRef.current.set(key, "error");
        inflightRef.current.delete(key);
        setCacheTick((t) => t + 1);
        throw err;
      });

      inflightRef.current.set(key, promise);
      return promise;
    },
    [bumpSoon],
  );

  const meetingsToLoad = useMemo(() => {
    if (meetingFilter === "all") return LOUDOUN_MEETINGS;
    const one = LOUDOUN_MEETING_BY_ID[meetingFilter];
    return one ? [one] : [];
  }, [meetingFilter]);

  const query = submitted.trim();

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    (async () => {
      try {
        // Newest meetings first; multi-meeting searches stream from the venue pack.
        const pack = meetingsToLoad.length >= FTM_PACK_MIN_MEETINGS;
        await Promise.all(
          meetingsToLoad.map((m) => loadMeeting(m, sourceFor(m, sourceMode), pack)),
        );
        if (!cancelled) {
          setCacheTick((t) => t + 1);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setLoadError(err instanceof Error ? err.message : "Failed to load caption index");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, meetingsToLoad, loadMeeting, sourceMode]);

  const windowsReady = useMemo(() => {
    // cacheTick forces recompute when cache fills
    void cacheTick;
    const out: SourcedWindow[] = [];
    for (const m of meetingsToLoad) {
      const entry = cacheRef.current.get(`${m.id}:${sourceFor(m, sourceMode)}`);
      if (Array.isArray(entry)) out.push(...entry);
    }
    return out;
  }, [meetingsToLoad, cacheTick, sourceMode]);

  const allLoaded =
    meetingsToLoad.length > 0 &&
    meetingsToLoad.every((m) =>
      Array.isArray(cacheRef.current.get(`${m.id}:${sourceFor(m, sourceMode)}`)),
    );

  const transcriptInScope =
    sourceMode === "best" && meetingsToLoad.some((m) => ftmTranscriptFor(m.id));

  const loadedCount = meetingsToLoad.filter((m) =>
    Array.isArray(cacheRef.current.get(`${m.id}:${sourceFor(m, sourceMode)}`)),
  ).length;
  /** True from submit until every meeting in scope is loaded (no "No hits" flash). */
  const pending = Boolean(query) && !allLoaded && !loadError;

  // Hits show as meetings arrive (newest first); the final list is the same as
  // searching everything at once.
  const hits = useMemo(() => {
    if (!query) return [];
    return searchWindows(windowsReady, query);
  }, [query, windowsReady]);

  const shown = hits.slice(0, HIT_CAP);

  function runSearch(next: string) {
    setQ(next);
    setSubmitted(next.trim());
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(q.trim());
  }

  return (
    <section className="rounded-md border border-border bg-card px-4 py-6 sm:px-6 sm:py-8">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Loudoun · Board meetings
      </p>
      <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl">
        Find the Moment
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Search captions → jump the video · {LOUDOUN_MEETINGS.length} Board meetings indexed
        {TRANSCRIPT_MEETING_COUNT > 0
          ? ` · ${TRANSCRIPT_MEETING_COUNT} with full machine transcript`
          : ""}
      </p>

      <aside className="mt-5 rounded-r-md border-l-4 border-[#c47a3a] bg-[#fdf0e6] px-4 py-3 text-sm text-[#6b3a12]">
        <strong className="font-semibold">Captions are an index, not a transcript.</strong>{" "}
        Auto-captions are not quote-grade — spelling breaks, names drop. Jump to the moment
        (Granicus or eScribe / ISI) and verify by ear. Do not cite captions as quotes.
      </aside>
      {transcriptInScope ? (
        <aside className="mt-3 rounded-r-md border-l-4 border-[#1E4B8E] bg-[#e8eef6] px-4 py-3 text-sm text-[#163a6e]">
          <strong className="font-semibold">Full transcript where marked.</strong>{" "}
          {FTM_TRANSCRIPT_LABEL} Meetings marked “Full transcript” search every spoken word; the
          rest search county captions.
        </aside>
      ) : null}

      <form role="search" onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="loudoun-meeting-q" className="sr-only">
          Find the Moment — search Loudoun meetings
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="loudoun-meeting-q"
            type="search"
            name="q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (!e.target.value.trim()) setSubmitted("");
            }}
            placeholder="Name or phrase…"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-12 w-full rounded-md border border-input bg-paper pr-4 pl-11 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-[#1E4B8E] px-5 font-sans text-sm font-semibold tracking-[0.12em] text-white uppercase transition-[background-color] hover:bg-[#163a6e]"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="loudoun-meeting-filter"
            className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
          >
            Meeting
          </label>
          <select
            id="loudoun-meeting-filter"
            value={meetingFilter}
            onChange={(e) => {
              const v = e.target.value;
              setMeetingFilter(v === "all" ? "all" : v);
            }}
            className="h-9 max-w-full rounded-md border border-input bg-paper px-3 font-sans text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="all">All indexed meetings</option>
            {LOUDOUN_MEETINGS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.dateLabel} · {m.title.replace(/^Loudoun BOS /, "")}
                {loudounProvider(m) === "escribe" ? " · eScribe" : ""}
                {ftmTranscriptFor(m.id) ? " · Full transcript" : ""}
              </option>
            ))}
          </select>
        </div>

        {TRANSCRIPT_MEETING_COUNT > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Search
            </span>
            {(
              [
                { id: "best" as const, label: "Transcript where available" },
                { id: "captions" as const, label: "Captions only" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={sourceMode === opt.id}
                onClick={() => setSourceMode(opt.id)}
                className={cn(
                  "rounded-full border border-border bg-wash px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-[background-color,border-color,color] hover:border-[#1E4B8E] hover:bg-[#e8eef6] hover:text-[#1E4B8E]",
                  sourceMode === opt.id && "border-[#1E4B8E] bg-[#e8eef6] text-[#1E4B8E]",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Topics
          </span>
          {LOUDOUN_TOPIC_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => runSearch(chip.query)}
              className={cn(
                "rounded-full border border-border bg-wash px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-[background-color,border-color,color] hover:border-[#0d7377] hover:bg-[#e4f2f2] hover:text-[#095456]",
                query.toLowerCase() === chip.query.toLowerCase() &&
                  "border-[#0d7377] bg-[#e4f2f2] text-[#095456]",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <p
        className="mt-5 min-h-[1.25rem] font-mono text-xs text-muted-foreground"
        aria-live="polite"
      >
        {!query
          ? "Enter a name or phrase, or tap a topic chip. Jump to the moment on the video."
          : loading || pending
            ? meetingsToLoad.length > 1
              ? hits.length
                ? `${hits.length} window${hits.length === 1 ? "" : "s"} so far · searching ${loadedCount} of ${meetingsToLoad.length} meetings…`
                : `Loading meeting indexes… ${loadedCount} of ${meetingsToLoad.length}`
              : "Loading meeting text…"
            : loadError
              ? `Could not load captions — ${loadError}`
              : hits.length
                ? `${hits.length} window${hits.length === 1 ? "" : "s"}${
                    hits.length > HIT_CAP ? ` · showing first ${HIT_CAP}` : ""
                  } · ${transcriptInScope ? "machine transcript + captions are approximate" : "captions are approximate"}`
                : `No hits for “${query}” — try a shorter stem (e.g. zone, supervis).`}
      </p>

      {query && !loading && !pending && !loadError && hits.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing matched. Auto-captions misspell constantly — shorter tokens work better. Or widen
          the meeting filter to All.
        </p>
      ) : null}

      {shown.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {shown.map((w) => {
            const sec = Math.floor(w.start);
            const meeting = LOUDOUN_MEETING_BY_ID[w.meetingId];
            const href = meeting ? loudounMeetingJumpUrl(meeting, sec) : "#";
            const source =
              meeting && loudounProvider(meeting) === "escribe" ? "eScribe / ISI" : "Granicus";
            const recap = LOUDOUN_RECAP_BY_MEETING[w.meetingId];
            return (
              <li
                key={`${w.meetingId}-${w.start}-${w.end}`}
                className="rounded-md border border-border bg-paper px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold tabular-nums text-[#1E4B8E]">
                        {secToHms(w.start)}
                      </p>
                      <SourceBadge source={w.source} />
                    </div>
                    {meeting ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {meeting.dateLabel} · {meeting.title.replace(/^Loudoun BOS /, "")} ·{" "}
                        {source}
                        {recap ? (
                          <>
                            {" · "}
                            <Link
                              to="/counties/loudoun/recaps/$slug"
                              params={{ slug: recap.slug }}
                              className="text-[#1E4B8E] underline-offset-2 hover:underline"
                            >
                              Meeting recap
                            </Link>
                          </>
                        ) : null}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">{w.meetingId}</p>
                    )}
                  </div>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#0d7377] px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-white uppercase hover:bg-[#095456]"
                  >
                    Jump to the moment
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </div>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-foreground">
                  <HighlightedSnippet text={w.text} query={query} />
                </p>
                {w.source === "transcript" ? (
                  <p className="mt-2 text-xs text-muted-foreground">{FTM_TRANSCRIPT_LABEL}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
