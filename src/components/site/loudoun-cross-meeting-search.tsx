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
  LOUDOUN_MEETINGS,
  loudounJumpUrl,
  type LoudounCaptionSlice,
  type LoudounMeeting,
} from "@/content/loudoun";
import {
  LCPS_MEETINGS,
  lcpsJumpUrl,
  type LcpsCaptionSlice,
  type LcpsMeeting,
} from "@/content/lcps";
import { cn } from "@/lib/utils";

const HIT_CAP = 80;
/** Parallel fetches across venues (Hobby-safe lazy-load). */
const ALL_FETCH_CONCURRENCY = 6;

type Venue = "county" | "schools";
type VenueFilter = "all" | Venue;

type CrossHit = {
  venue: Venue;
  cacheKey: string;
  start: number;
  end: number;
  text: string;
  jumpUrl: string;
  dateLabel: string;
  title: string;
  meetingKey: string;
};

type TopicChip = { label: string; query: string };

/** Cross-venue chips that usually hit both indexes. */
const CROSS_TOPIC_CHIPS: TopicChip[] = [
  { label: "Budget", query: "budget" },
  { label: "School", query: "school" },
  { label: "Tax", query: "tax" },
  { label: "Student", query: "student" },
  { label: "Data Centers", query: "data center" },
  { label: "Staff", query: "staff" },
];

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

type LoadTarget =
  | { venue: "county"; meeting: LoudounMeeting; cacheKey: string }
  | { venue: "schools"; meeting: LcpsMeeting; cacheKey: string };

type CacheEntry = CrossHit[] | "loading" | "error";

const TOTAL_MEETINGS = LOUDOUN_MEETINGS.length + LCPS_MEETINGS.length;

export function LoudounCrossMeetingSearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [venueFilter, setVenueFilter] = useState<VenueFilter>("all");
  const [cacheTick, setCacheTick] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const inflightRef = useRef<Map<string, Promise<CrossHit[]>>>(new Map());

  const targets = useMemo((): LoadTarget[] => {
    const county: LoadTarget[] = LOUDOUN_MEETINGS.map((meeting) => ({
      venue: "county" as const,
      meeting,
      cacheKey: `county:${meeting.clipId}`,
    }));
    const schools: LoadTarget[] = LCPS_MEETINGS.map((meeting) => ({
      venue: "schools" as const,
      meeting,
      cacheKey: `schools:${meeting.vimeoId}`,
    }));
    if (venueFilter === "county") return county;
    if (venueFilter === "schools") return schools;
    return [...county, ...schools];
  }, [venueFilter]);

  const loadTarget = useCallback(async (target: LoadTarget): Promise<CrossHit[]> => {
    const cached = cacheRef.current.get(target.cacheKey);
    if (Array.isArray(cached)) return cached;

    const existing = inflightRef.current.get(target.cacheKey);
    if (existing) return existing;

    cacheRef.current.set(target.cacheKey, "loading");
    setCacheTick((t) => t + 1);

    const promise = (async () => {
      const res = await fetch(target.meeting.windowsUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${target.cacheKey}`);
      }
      const slices = (await res.json()) as LoudounCaptionSlice[] | LcpsCaptionSlice[];
      let hits: CrossHit[];
      if (target.venue === "county") {
        const m = target.meeting;
        hits = slices.map((s) => ({
          venue: "county" as const,
          cacheKey: target.cacheKey,
          start: s.start,
          end: s.end,
          text: s.text,
          jumpUrl: loudounJumpUrl(m.clipId, s.start),
          dateLabel: m.dateLabel,
          title: m.title.replace(/^Loudoun BOS /, ""),
          meetingKey: String(m.clipId),
        }));
      } else {
        const m = target.meeting;
        hits = slices.map((s) => ({
          venue: "schools" as const,
          cacheKey: target.cacheKey,
          start: s.start,
          end: s.end,
          text: s.text,
          jumpUrl: lcpsJumpUrl(m.vimeoId, s.start),
          dateLabel: m.dateLabel,
          title: m.title,
          meetingKey: m.vimeoId,
        }));
      }
      cacheRef.current.set(target.cacheKey, hits);
      inflightRef.current.delete(target.cacheKey);
      setCacheTick((t) => t + 1);
      return hits;
    })().catch((err) => {
      cacheRef.current.set(target.cacheKey, "error");
      inflightRef.current.delete(target.cacheKey);
      setCacheTick((t) => t + 1);
      throw err;
    });

    inflightRef.current.set(target.cacheKey, promise);
    return promise;
  }, []);

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
        await mapPool(targets, ALL_FETCH_CONCURRENCY, (t) => loadTarget(t));
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
  }, [query, targets, loadTarget]);

  const windowsReady = useMemo(() => {
    void cacheTick;
    const out: CrossHit[] = [];
    for (const t of targets) {
      const entry = cacheRef.current.get(t.cacheKey);
      if (Array.isArray(entry)) out.push(...entry);
    }
    return out;
  }, [targets, cacheTick]);

  const allLoaded =
    targets.length > 0 && targets.every((t) => Array.isArray(cacheRef.current.get(t.cacheKey)));

  const hits = useMemo(() => {
    if (!query || !allLoaded) return [];
    const qLower = query.toLowerCase();
    return windowsReady.filter((w) => w.text.toLowerCase().includes(qLower));
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
        Loudoun · County + Schools
      </p>
      <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl">
        Find the Moment — both venues
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        One box across {LOUDOUN_MEETINGS.length} Board of Supervisors meetings and{" "}
        {LCPS_MEETINGS.length} School Board meetings — captions → jump the video.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        This is the kind of coverage funded work unlocks at scale.
      </p>

      <aside className="mt-5 rounded-r-md border-l-4 border-[#c47a3a] bg-[#fdf0e6] px-4 py-3 text-sm text-[#6b3a12]">
        <strong className="font-semibold">Captions are an index, not a transcript.</strong>{" "}
        Auto-captions are not quote-grade — spelling breaks, names drop. Jump to the moment and
        verify by ear. Do not cite captions as quotes.
      </aside>

      <form role="search" onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="loudoun-cross-meeting-q" className="sr-only">
          Find the Moment — search Loudoun County and Schools meetings
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="loudoun-cross-meeting-q"
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
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Venue
          </span>
          {(
            [
              { id: "all" as const, label: `All (${TOTAL_MEETINGS})` },
              { id: "county" as const, label: `County (${LOUDOUN_MEETINGS.length})` },
              { id: "schools" as const, label: `Schools (${LCPS_MEETINGS.length})` },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setVenueFilter(opt.id)}
              className={cn(
                "rounded-full border border-border bg-wash px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-[background-color,border-color,color] hover:border-[#1E4B8E] hover:bg-[#e8eef6] hover:text-[#1E4B8E]",
                venueFilter === opt.id && "border-[#1E4B8E] bg-[#e8eef6] text-[#1E4B8E]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Topics
          </span>
          {CROSS_TOPIC_CHIPS.map((chip) => (
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
          ? "Enter a name or phrase, or tap a topic. Results load meeting captions on demand."
          : loading
            ? `Loading caption indexes across ${targets.length} meetings…`
            : loadError
              ? `Could not load captions — ${loadError}`
              : hits.length
                ? `${hits.length} window${hits.length === 1 ? "" : "s"}${
                    hits.length > HIT_CAP ? ` · showing first ${HIT_CAP}` : ""
                  } · captions are approximate`
                : `No hits for “${query}” — try a shorter stem (e.g. zone, supervis).`}
      </p>

      {query && !loading && !loadError && hits.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing matched across the indexed meetings. Auto-captions misspell constantly — shorter
          tokens work better. Or switch venue and try again.
        </p>
      ) : null}

      {shown.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {shown.map((w) => (
            <li
              key={`${w.cacheKey}-${w.start}-${w.end}`}
              className="rounded-md border border-border bg-paper px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-semibold tabular-nums text-[#1E4B8E]">
                      {secToHms(w.start)}
                    </p>
                    <span
                      className={cn(
                        "rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase",
                        w.venue === "county"
                          ? "bg-[#e8eef6] text-[#1E4B8E]"
                          : "bg-[#e4f2f2] text-[#095456]",
                      )}
                    >
                      {w.venue === "county" ? "County" : "Schools"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {w.dateLabel} · {w.title}
                  </p>
                </div>
                <a
                  href={w.jumpUrl}
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
          ))}
        </ul>
      ) : null}
    </section>
  );
}
