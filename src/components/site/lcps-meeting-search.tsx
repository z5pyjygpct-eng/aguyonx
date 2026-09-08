import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ExternalLink, Search } from "lucide-react";
import {
  LCPS_MEETING_BY_VIMEO,
  LCPS_MEETINGS,
  LCPS_TOPIC_CHIPS,
  lcpsJumpUrl,
  type LcpsCaptionSlice,
  type LcpsCaptionWindow,
  type LcpsMeeting,
} from "@/content/lcps";
import { cn } from "@/lib/utils";

const HIT_CAP = 60;
/** Parallel fetches when searching All indexed meetings (Hobby-safe). */
const ALL_FETCH_CONCURRENCY = 6;

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

function searchWindows(windows: LcpsCaptionWindow[], query: string): LcpsCaptionWindow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return windows.filter((w) => w.text.toLowerCase().includes(q));
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i]!);
    }
  }
  const n = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

type CacheEntry = LcpsCaptionWindow[] | "loading" | "error";

export function LcpsMeetingSearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [meetingFilter, setMeetingFilter] = useState<string | "all">("all");
  const [cacheTick, setCacheTick] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** In-memory cache of fetched meeting windows (module-lifetime via ref). */
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const inflightRef = useRef<Map<string, Promise<LcpsCaptionWindow[]>>>(new Map());

  const loadMeeting = useCallback(async (meeting: LcpsMeeting): Promise<LcpsCaptionWindow[]> => {
    const cached = cacheRef.current.get(meeting.vimeoId);
    if (Array.isArray(cached)) return cached;

    const existing = inflightRef.current.get(meeting.vimeoId);
    if (existing) return existing;

    cacheRef.current.set(meeting.vimeoId, "loading");
    setCacheTick((t) => t + 1);

    const promise = (async () => {
      const res = await fetch(meeting.windowsUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} for Vimeo ${meeting.vimeoId}`);
      const slices = (await res.json()) as LcpsCaptionSlice[];
      const windows: LcpsCaptionWindow[] = slices.map((s) => ({
        vimeoId: meeting.vimeoId,
        start: s.start,
        end: s.end,
        text: s.text,
      }));
      cacheRef.current.set(meeting.vimeoId, windows);
      inflightRef.current.delete(meeting.vimeoId);
      setCacheTick((t) => t + 1);
      return windows;
    })().catch((err) => {
      cacheRef.current.set(meeting.vimeoId, "error");
      inflightRef.current.delete(meeting.vimeoId);
      setCacheTick((t) => t + 1);
      throw err;
    });

    inflightRef.current.set(meeting.vimeoId, promise);
    return promise;
  }, []);

  const meetingsToLoad = useMemo(() => {
    if (meetingFilter === "all") return LCPS_MEETINGS;
    const one = LCPS_MEETING_BY_VIMEO[meetingFilter];
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
        await mapPool(meetingsToLoad, ALL_FETCH_CONCURRENCY, (m) => loadMeeting(m));
        if (!cancelled) setLoading(false);
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
  }, [query, meetingsToLoad, loadMeeting]);

  const windowsReady = useMemo(() => {
    void cacheTick;
    const out: LcpsCaptionWindow[] = [];
    for (const m of meetingsToLoad) {
      const entry = cacheRef.current.get(m.vimeoId);
      if (Array.isArray(entry)) out.push(...entry);
    }
    return out;
  }, [meetingsToLoad, cacheTick]);

  const allLoaded =
    meetingsToLoad.length > 0 &&
    meetingsToLoad.every((m) => Array.isArray(cacheRef.current.get(m.vimeoId)));

  const hits = useMemo(() => {
    if (!query || !allLoaded) return [];
    return searchWindows(windowsReady, query);
  }, [query, allLoaded, windowsReady]);

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
        Loudoun · School Board
      </p>
      <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl">
        Find the Moment — Loudoun School Board
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Search captions → jump the video · {LCPS_MEETINGS.length} School Board meetings indexed
        (2026 YTD)
      </p>

      <aside className="mt-5 rounded-r-md border-l-4 border-[#c47a3a] bg-[#fdf0e6] px-4 py-3 text-sm text-[#6b3a12]">
        <strong className="font-semibold">Captions are an index, not a transcript.</strong>{" "}
        Auto-captions are not quote-grade — spelling breaks, names drop. Jump to the moment on
        Vimeo and verify by ear. Do not cite captions as quotes.
      </aside>

      <form role="search" onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="lcps-meeting-q" className="sr-only">
          Find the Moment — search Loudoun School Board meetings
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="lcps-meeting-q"
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
            htmlFor="lcps-meeting-filter"
            className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
          >
            Meeting
          </label>
          <select
            id="lcps-meeting-filter"
            value={meetingFilter === "all" ? "all" : meetingFilter}
            onChange={(e) => {
              const v = e.target.value;
              setMeetingFilter(v === "all" ? "all" : v);
            }}
            className="h-9 max-w-full rounded-md border border-input bg-paper px-3 font-sans text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="all">All indexed meetings</option>
            {LCPS_MEETINGS.map((m) => (
              <option key={m.vimeoId} value={m.vimeoId}>
                {m.dateLabel} · {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Topics
          </span>
          {LCPS_TOPIC_CHIPS.map((chip) => (
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
          ? "Enter a name or phrase, or tap a topic chip. Jump to the moment on Vimeo."
          : loading
            ? meetingFilter === "all"
              ? "Loading caption indexes…"
              : "Loading meeting captions…"
            : loadError
              ? `Could not load captions — ${loadError}`
              : hits.length
                ? `${hits.length} window${hits.length === 1 ? "" : "s"}${
                    hits.length > HIT_CAP ? ` · showing first ${HIT_CAP}` : ""
                  } · captions are approximate`
                : `No hits for “${query}” — try a shorter stem (e.g. budget, policy).`}
      </p>

      {query && !loading && !loadError && hits.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing matched. Auto-captions misspell constantly — shorter tokens work better. Or widen
          the meeting filter to All.
        </p>
      ) : null}

      {shown.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {shown.map((w) => {
            const sec = Math.floor(w.start);
            const href = lcpsJumpUrl(w.vimeoId, sec);
            const meeting = LCPS_MEETING_BY_VIMEO[w.vimeoId];
            return (
              <li
                key={`${w.vimeoId}-${w.start}-${w.end}`}
                className="rounded-md border border-border bg-paper px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold tabular-nums text-[#1E4B8E]">
                      {secToHms(w.start)}
                    </p>
                    {meeting ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {meeting.dateLabel} · {meeting.title}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">Vimeo {w.vimeoId}</p>
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
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
