import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ExternalLink, FileText, Search } from "lucide-react";
import {
  LCPS_BUDGET_SEARCH_DOCS,
  lcpsBudgetExtractHref,
  type LcpsBudgetDoc,
  type LcpsBudgetKind,
} from "@/content/lcps-budget";
import { cn } from "@/lib/utils";

const HIT_CAP = 24;
const FETCH_CONCURRENCY = 4;
const SNIPPET_RADIUS = 90;

type ExtractPayload = {
  id: string;
  label: string;
  kind: LcpsBudgetKind;
  href: string;
  text: string;
};

type CacheEntry = ExtractPayload | "loading" | "error";

type BudgetHit = {
  doc: LcpsBudgetDoc;
  snippet: string;
  score: number;
};

type TopicChip = { label: string; query: string };

const TOPIC_CHIPS: TopicChip[] = [
  { label: "Local tax", query: "local tax" },
  { label: "Operating fund", query: "operating fund" },
  { label: "CAPP", query: "CAPP" },
  { label: "CIP", query: "capital projects" },
  { label: "2,066", query: "2,066" },
  { label: "SEON", query: "SEON" },
  { label: "May 12", query: "May 12" },
];

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Digits stay searchable whether parents type commas or not. */
function searchNorm(s: string): string {
  return fold(s).replace(/,/g, "");
}

function phraseNorm(query: string): string {
  return searchNorm(query).replace(/\s+/g, " ").trim();
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

function snippetAround(hay: string, phrase: string): string {
  const normHay = phraseNorm(hay);
  let best = phrase ? normHay.indexOf(phrase) : -1;
  if (best < 0) {
    const trimmed = hay.replace(/\s+/g, " ").trim();
    return trimmed.length > SNIPPET_RADIUS * 2
      ? `${trimmed.slice(0, SNIPPET_RADIUS * 2)}…`
      : trimmed;
  }
  const ratio = hay.length / Math.max(normHay.length, 1);
  const center = Math.min(hay.length, Math.max(0, Math.floor(best * ratio)));
  const start = Math.max(0, center - SNIPPET_RADIUS);
  const end = Math.min(hay.length, center + SNIPPET_RADIUS);
  let slice = hay.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) slice = `…${slice}`;
  if (end < hay.length) slice = `${slice}…`;
  return slice;
}

function scoreDoc(doc: LcpsBudgetDoc, text: string, phrase: string): BudgetHit | null {
  if (!phrase) return null;
  const metaRaw = `${doc.label} ${doc.dek} ${doc.kind} ${doc.source}`;
  const meta = phraseNorm(metaRaw);
  const body = phraseNorm(text);
  const inMeta = meta.includes(phrase);
  const inBody = body.includes(phrase);
  if (!inMeta && !inBody) return null;

  let score = 0;
  if (inMeta) score += 10;
  if (inBody) score += 3;
  if (doc.kind.startsWith("BOS")) score += 1;
  if (doc.kind === "Amendment" || doc.kind === "Guide") score += 0.5;

  return {
    doc,
    snippet: snippetAround(text || doc.dek, phrase),
    score,
  };
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

function kindBadgeClass(kind: LcpsBudgetKind): string {
  if (kind.startsWith("Proposed")) return "border-[#c47a3a]/40 bg-[#fdf0e6] text-[#6b3a12]";
  if (kind.startsWith("School Board")) return "border-[#1E4B8E]/30 bg-[#e8eef7] text-[#1E4B8E]";
  if (kind.startsWith("BOS")) return "border-[#0d7377]/35 bg-[#e4f2f2] text-[#095456]";
  if (kind === "Amendment") return "border-[#8B4513]/35 bg-[#f5ebe0] text-[#5c3310]";
  return "border-border bg-wash text-muted-foreground";
}

export function LcpsBudgetSearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [cacheTick, setCacheTick] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const inflightRef = useRef<Map<string, Promise<ExtractPayload>>>(new Map());

  const loadExtract = useCallback(async (doc: LcpsBudgetDoc): Promise<ExtractPayload> => {
    const cached = cacheRef.current.get(doc.extractId);
    if (cached && typeof cached === "object") return cached;

    const existing = inflightRef.current.get(doc.extractId);
    if (existing) return existing;

    cacheRef.current.set(doc.extractId, "loading");
    setCacheTick((t) => t + 1);

    const promise = (async () => {
      const res = await fetch(lcpsBudgetExtractHref(doc.extractId));
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${doc.extractId}`);
      const payload = (await res.json()) as ExtractPayload;
      if (!payload?.text) throw new Error(`Empty extract for ${doc.extractId}`);
      cacheRef.current.set(doc.extractId, payload);
      inflightRef.current.delete(doc.extractId);
      setCacheTick((t) => t + 1);
      return payload;
    })().catch((err) => {
      cacheRef.current.set(doc.extractId, "error");
      inflightRef.current.delete(doc.extractId);
      setCacheTick((t) => t + 1);
      throw err;
    });

    inflightRef.current.set(doc.extractId, promise);
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
        await mapPool(LCPS_BUDGET_SEARCH_DOCS, FETCH_CONCURRENCY, (d) => loadExtract(d));
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setLoadError(err instanceof Error ? err.message : "Failed to load budget extracts");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, loadExtract]);

  const allLoaded =
    LCPS_BUDGET_SEARCH_DOCS.length > 0 &&
    LCPS_BUDGET_SEARCH_DOCS.every((d) => {
      void cacheTick;
      return typeof cacheRef.current.get(d.extractId) === "object";
    });

  const hits = useMemo(() => {
    void cacheTick;
    if (!query || !allLoaded) return [];
    const phrase = phraseNorm(query);
    if (!phrase) return [];
    const out: BudgetHit[] = [];
    for (const doc of LCPS_BUDGET_SEARCH_DOCS) {
      const entry = cacheRef.current.get(doc.extractId);
      if (typeof entry !== "object") continue;
      const hit = scoreDoc(doc, entry.text, phrase);
      if (hit) out.push(hit);
    }
    out.sort((a, b) => b.score - a.score || a.doc.label.localeCompare(b.doc.label));
    return out;
  }, [query, allLoaded, cacheTick]);

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
    <div className="rounded-md border border-border bg-card px-4 py-5 sm:px-5 sm:py-6">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Search the budget records
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Looks inside the hosted PDFs — operating totals, LTF, CIP/CAPP, fund names, amendment
        language — not just filenames. Proposed ≠ adopted stays labeled on each hit.
      </p>

      <form role="search" onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="lcps-budget-q" className="sr-only">
          Search the Loudoun schools budget records
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="lcps-budget-q"
            type="search"
            name="q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (!e.target.value.trim()) setSubmitted("");
            }}
            placeholder="local tax, 2,066, CAPP, May 12…"
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

      <div className="mt-3 flex flex-wrap gap-2">
        {TOPIC_CHIPS.map((chip) => (
          <button
            key={chip.query}
            type="button"
            onClick={() => runSearch(chip.query)}
            className={cn(
              "rounded-full border border-border bg-wash px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-[background-color,border-color,color] hover:border-[#0d7377] hover:bg-[#e4f2f2] hover:text-[#095456]",
              searchNorm(submitted) === searchNorm(chip.query) &&
                "border-[#0d7377] bg-[#e4f2f2] text-[#095456]",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {query ? (
        <div className="mt-5" aria-live="polite">
          {loading || !allLoaded ? (
            <p className="text-sm text-muted-foreground">Loading budget extracts…</p>
          ) : loadError ? (
            <p className="text-sm text-[#8B4513]">Couldn’t load extracts: {loadError}</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing matched in the hosted budget records. Try a shorter token (CAPP, LTF, SEON)
              or a dollar fragment (2,066). This shelf only searches the files listed below — not
              the whole site.
            </p>
          ) : (
            <>
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {hits.length} hit{hits.length === 1 ? "" : "s"}
                {hits.length > HIT_CAP ? ` · showing ${HIT_CAP}` : ""}
              </p>
              <ul className="mt-3 space-y-2">
                {shown.map((hit) => (
                  <li key={hit.doc.extractId}>
                    <a
                      href={hit.doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-md border border-border bg-paper px-4 py-3 transition-[background-color] duration-150 hover:bg-wash"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#1E4B8E]/30 text-[#1E4B8E]">
                        <FileText className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-sans text-base font-semibold text-foreground">
                            {hit.doc.label}
                          </span>
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
                              kindBadgeClass(hit.doc.kind),
                            )}
                          >
                            {hit.doc.kind}
                          </span>
                          <ExternalLink
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          <HighlightedSnippet text={hit.snippet} query={query} />
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
