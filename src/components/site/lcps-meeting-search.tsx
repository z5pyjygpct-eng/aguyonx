import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ExternalLink, Search } from "lucide-react";
import {
  LCPS_CAPTION_WINDOWS,
  LCPS_MEETING,
  LCPS_TOPIC_CHIPS,
  lcpsJumpUrl,
  type LcpsCaptionWindow,
} from "@/content/lcps";
import { cn } from "@/lib/utils";

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

function searchWindows(query: string): LcpsCaptionWindow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return LCPS_CAPTION_WINDOWS.filter((w) => w.text.toLowerCase().includes(q));
}

export function LcpsMeetingSearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  function runSearch(next: string) {
    setQ(next);
    setSubmitted(next.trim());
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(q.trim());
  }

  const query = submitted.trim();
  const hits = useMemo(() => (query ? searchWindows(query) : []), [query]);
  const shown = hits.slice(0, HIT_CAP);

  return (
    <section className="rounded-md border border-border bg-card px-4 py-6 sm:px-6 sm:py-8">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Loudoun · School Board
      </p>
      <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl">
        Find the Moment — Loudoun School Board
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        One meeting POC · BoardDocs + Vimeo · captions auto — verify by ear ·{" "}
        {LCPS_MEETING.dateLabel} · {LCPS_MEETING.title}
      </p>

      <aside className="mt-5 rounded-r-md border-l-4 border-[#c47a3a] bg-[#fdf0e6] px-4 py-3 text-sm text-[#6b3a12]">
        <strong className="font-semibold">Captions are an index, not a transcript.</strong>{" "}
        Auto-captions are not quote-grade — spelling breaks, names drop. Jump to the moment on
        Vimeo and verify by ear. Do not cite captions as quotes.
      </aside>

      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a
          href={LCPS_MEETING.boardDocsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#1E4B8E] underline-offset-2 hover:underline"
        >
          BoardDocs meeting
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
        <a
          href={LCPS_MEETING.lcpsTvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#1E4B8E] underline-offset-2 hover:underline"
        >
          LCPS-TV / webcast
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </p>

      <form role="search" onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="lcps-meeting-q" className="sr-only">
          Find the Moment — search Loudoun School Board meeting
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
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

      <p className="mt-5 min-h-[1.25rem] font-mono text-xs text-muted-foreground" aria-live="polite">
        {!query
          ? "Enter a name or phrase, or tap a topic chip. Jump to the moment on Vimeo."
          : hits.length
            ? `${hits.length} window${hits.length === 1 ? "" : "s"}${
                hits.length > HIT_CAP ? ` · showing first ${HIT_CAP}` : ""
              } · captions are approximate`
            : `No hits for “${query}” — try a shorter stem (e.g. budget, policy).`}
      </p>

      {query && hits.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing matched. Auto-captions misspell constantly — shorter tokens work better.
        </p>
      ) : null}

      {shown.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {shown.map((w) => {
            const sec = Math.floor(w.start);
            const href = lcpsJumpUrl(sec);
            return (
              <li
                key={`${w.start}-${w.end}`}
                className="rounded-md border border-border bg-paper px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold tabular-nums text-[#1E4B8E]">
                      {secToHms(w.start)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {LCPS_MEETING.dateLabel} · {LCPS_MEETING.title}
                    </p>
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
