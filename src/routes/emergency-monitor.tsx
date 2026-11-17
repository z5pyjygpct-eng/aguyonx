import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import log from "@/content/emergency-log.json";
import { compileQuery, countQueries, highlightNeedles, itemMatchesQuery, linkMatchesTerms, quickQueryActive, QUICK_SEARCH_CANDIDATES, splitHighlights, type HighlightNeedle } from "@/lib/emergency-search";

type LogLink = { url: string; label?: string };
type Severity = "HIGH" | "MEDIUM" | "MONITORING";
type LogItem = {
  text?: string;
  links?: LogLink[];
  severity?: Severity;
  title?: string;
  location?: string;
  type?: "Cyber" | "Power Outage" | "Unrest" | "Terror" | "Infrastructure" | "Election" | "Other";
  summary?: string;
  status?: string;
};
const SEV_CLASS: Record<string, string> = {
  HIGH: "border-[#b91c1c] bg-[#b91c1c] text-white",
  MEDIUM: "border-[#b45309] bg-[#f59e0b] text-[#1f1300]",
  MONITORING: "border-[#475569] bg-[#556274] text-white",
};
function headline(it: LogItem) {
  return [it.severity ? `[${it.severity}]` : "", it.title ?? ""].filter(Boolean).join(" – ");
}
function details(it: LogItem): [string, string][] {
  return ([["Location", it.location], ["Type", it.type], ["Summary", it.summary], ["Status", it.status]] as [string, string | undefined][])
    .filter((x): x is [string, string] => !!x[1]);
}
type LogEntry = {
  datetime: string; // ISO 8601 with ET offset, e.g. 2026-11-02T14:00:00-05:00
  regions?: Partial<Record<Region, LogItem[]>>;
  trending?: LogItem[];
  threats?: LogItem[];
};
const REGIONS = ["America", "Europe", "Russia", "Middle East", "Africa", "South America"] as const;
type Region = (typeof REGIONS)[number];

const ENTRIES: LogEntry[] = [...((log as { entries: LogEntry[] }).entries ?? [])].sort(
  (a, b) => Date.parse(b.datetime) - Date.parse(a.datetime),
);

function fmtET(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
}

function sections(e: LogEntry): [string, LogItem[]][] {
  const out: [string, LogItem[]][] = [];
  for (const r of REGIONS) if (e.regions?.[r]?.length) out.push([r, e.regions[r]!]);
  if (e.trending?.length) out.push(["Trending", e.trending]);
  if (e.threats?.length) out.push(["Threats", e.threats]);
  return out;
}

function save(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toText() {
  const lines = ["EMERGENCY MONITOR – LIVE LOG", "aguyonx.com/emergency-monitor", ""];
  if (!ENTRIES.length) lines.push("No entries yet.");
  for (const e of ENTRIES) {
    lines.push("=".repeat(40), fmtET(e.datetime), "=".repeat(40));
    for (const [name, items] of sections(e)) {
      lines.push("", name.toUpperCase());
      for (const it of items) {
        const h = headline(it);
        if (h) lines.push(`- ${h}`);
        for (const [k, v] of details(it)) lines.push(`    ${k}: ${v}`);
        if (it.text) lines.push(h ? `    ${it.text}` : `- ${it.text}`);
        for (const l of it.links ?? []) lines.push(`    ${l.label ? l.label + ": " : ""}${l.url}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

function toCSV() {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = [["datetime_iso", "datetime_et", "section", "severity", "title", "location", "type", "summary", "status", "text", "x_links"].join(",")];
  for (const e of ENTRIES)
    for (const [name, items] of sections(e))
      for (const it of items)
        rows.push([e.datetime, fmtET(e.datetime), name, it.severity ?? "", it.title ?? "", it.location ?? "", it.type ?? "", it.summary ?? "", it.status ?? "", it.text ?? "", (it.links ?? []).map((l) => l.url).join(" ")].map(q).join(","));
  return "\uFEFF" + rows.join("\r\n");
}

const EM_TITLE = "Emergency Monitor – Live Log | aguyonx.com";
const EM_DESC = "A live log of emergencies and threats worldwide — cyber, power outages, unrest, terror, infrastructure and elections — sorted by region and updated about every 2 hours, with sources on X.";
const EM_URL = "https://aguyonx.com/emergency-monitor";
const PAGE_SHARE_TEXT = "Emergency Monitor: current alerts in one place.";
const STALE_MS = 3 * 60 * 60 * 1000;

function xIntentUrl(text: string, url = EM_URL) {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

function alertShareText(it: LogItem, region: string) {
  const title = (it.title ?? it.text ?? "").trim();
  if (!title) return `Emergency Monitor (${region})`;
  return `${title} (${region}) — Emergency Monitor`;
}

/** Compact a window timestamp (e.g. 2026-11-16T18:15:00-05:00 -> 20261116t181500m0500). */
function compactDatetime(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:([+-])(\d{2}):?(\d{2})|Z)?/);
  if (!m) return iso.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "t";
  const [, Y, Mo, D, h, mi, sec, sign, oh, om] = m;
  const off = sign && oh ? `${sign === "-" ? "m" : "p"}${oh}${om ?? "00"}` : "z";
  return `${Y}${Mo}${D}t${h}${mi}${sec ?? "00"}${off}`;
}

function slugify(s: string, max = 72) {
  const slug = s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return slug || "alert";
}

type AlertMeta = { id: string; datetime: string; section: string };
const ALERT_ID = new WeakMap<LogItem, string>();
const ALERT_BY_ID = new Map<string, AlertMeta>();

/**
 * Stable per-alert anchors. The bot appends a new 2-hour window; it does not
 * change an earlier window's datetime or the title on that snapshot. Ids are
 * em-<window>-<title-slug>, with -2, -3… only if two items in the same window
 * slug to the same string. Status, severity and links can change on later
 * windows and are not used.
 */
function assignAlertIds() {
  const used = new Map<string, number>();
  for (const e of ENTRIES) {
    for (const [section, items] of sections(e)) {
      for (const it of items) {
        const label = (it.title ?? it.text ?? "").trim();
        const base = `em-${compactDatetime(e.datetime)}-${slugify(label)}`;
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n + 1}`;
        ALERT_ID.set(it, id);
        ALERT_BY_ID.set(id, { id, datetime: e.datetime, section });
      }
    }
  }
}
assignAlertIds();

function alertId(it: LogItem) {
  return ALERT_ID.get(it) ?? "";
}

function alertShareUrl(it: LogItem) {
  const id = alertId(it);
  return id ? `${EM_URL}#${id}` : EM_URL;
}

function readHash() {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#/, ""));
  } catch {
    return window.location.hash.replace(/^#/, "");
  }
}

export type EmSearch = { q?: string };

export const Route = createFileRoute("/emergency-monitor")({
  validateSearch: (s: Record<string, unknown>): EmSearch => (
    typeof s.q === "string" && s.q.trim() ? { q: s.q.slice(0, 120) } : {}
  ),
  head: () => ({
    meta: [
      { title: EM_TITLE },
      { name: "description", content: EM_DESC },
      { property: "og:title", content: EM_TITLE },
      { property: "og:description", content: EM_DESC },
      { property: "og:url", content: EM_URL },
      { name: "twitter:title", content: EM_TITLE },
      { name: "twitter:description", content: EM_DESC },
    ],
    links: [{ rel: "canonical", href: EM_URL }],
  }),
  component: EmergencyMonitorPage,
});

const btn = "inline-flex min-h-11 items-center rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900";

type Filter = "All" | Region;
const FILTERS: Filter[] = ["All", ...REGIONS];
function filterForAlert(current: Filter, section: string): Filter {
  if (current === "All" || current === section) return current;
  return "All";
}
function visibleSections(e: LogEntry, f: Filter): [string, LogItem[]][] {
  // Trending and Threats are cross-region, so they show only under "All".
  if (f === "All") return sections(e);
  const items = e.regions?.[f];
  return items?.length ? [[f, items]] : [];
}

function countItems(f: Filter) {
  return ENTRIES.reduce((n, e) => n + visibleSections(e, f).reduce((m, [, items]) => m + items.length, 0), 0);
}
const COUNTS = Object.fromEntries(FILTERS.map((f) => [f, countItems(f)])) as Record<Filter, number>;

const emptySearchTerms: HighlightNeedle[] = [];

function Marked({ text, terms }: { text?: string; terms: HighlightNeedle[] }) {
  if (!text) return null;
  if (!terms.length) return <>{text}</>;
  return (
    <>
      {splitHighlights(text, terms).map((part, i) =>
        part.hit ? <mark key={i} className="em-mark">{part.t}</mark> : <span key={i}>{part.t}</span>,
      )}
    </>
  );
}

function EmergencyMonitorPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const q = search.q ?? "";
  const query = useMemo(() => compileQuery(q), [q]);
  const searchTerms = useMemo(() => highlightNeedles(query), [query]);
  const [qInput, setQInput] = useState(q);
  const qTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setQInput(q); }, [q]);
  useEffect(() => () => { if (qTimer.current) clearTimeout(qTimer.current); }, []);
  const setQ = (value: string) => {
    const next = value.trim() ? { q: value.trim().slice(0, 120) } : {};
    navigate({ search: next, replace: true, resetScroll: false });
  };
  const commitQ = (value: string) => {
    if (qTimer.current) { clearTimeout(qTimer.current); qTimer.current = null; }
    setQ(value);
  };
  const typeQ = (value: string) => {
    setQInput(value);
    if (qTimer.current) clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => setQ(value), 200);
  };

  const [filter, setFilter] = useState<Filter>("All");
  const [showEarlier, setShowEarlier] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const linked = activeHash ? ALERT_BY_ID.get(activeHash) : undefined;
  const matchesItem = (section: string, it: LogItem) => {
    if (!query.and.length) return true;
    if (linked && alertId(it) === linked.id) return true;
    return itemMatchesQuery(it, query, section);
  };
  const sectionsFor = (e: LogEntry) =>
    visibleSections(e, filter)
      .map(([name, items]): [string, LogItem[]] => [name, items.filter((it) => matchesItem(name, it))])
      .filter(([, items]) => items.length > 0);
  const shown = ENTRIES.filter((e) => sectionsFor(e).length > 0);
  const earlierCount = Math.max(0, shown.length - 1);
  const visibleItemCount = shown.reduce((n, e) => n + sectionsFor(e).reduce((m, [, items]) => m + items.length, 0), 0);
  const filteredRows = useMemo(() => {
    const rows: { it: LogItem; section: string }[] = [];
    for (const e of ENTRIES) {
      for (const [name, items] of visibleSections(e, filter)) {
        for (const it of items) rows.push({ it, section: name });
      }
    }
    return rows;
  }, [filter]);
  const quickButtons = QUICK_SEARCH_CANDIDATES;
  const quickCounts = useMemo(() => countQueries(filteredRows, quickButtons.map((b) => b.q)), [filteredRows]);
  const stamp = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD in ET
  // Computed in the browser after load (the page is prebuilt), re-checked every minute.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const read = () => setActiveHash(readHash());
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  useEffect(() => { setShowEarlier(false); }, [q, filter]);
  useEffect(() => {
    if (!activeHash) return;
    const meta = ALERT_BY_ID.get(activeHash);
    if (!meta) return;
    const nextFilter = filterForAlert(filter, meta.section);
    const shown = ENTRIES.filter((e) => visibleSections(e, nextFilter).length > 0);
    const idx = shown.findIndex((e) => e.datetime === meta.datetime);
    const needsEarlier = idx > 0 && !showEarlier;
    if (nextFilter !== filter) setFilter(nextFilter);
    if (needsEarlier) setShowEarlier(true);
    // Do not return early: the linked entry is visible even before
    // "Show earlier" expands, so we can scroll on this pass.
    let cancel = false;
    const run = () => {
      if (cancel) return;
      const el = document.getElementById(activeHash);
      if (!el) return;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "start", behavior: "auto" });
      el.classList.remove("em-alert-flash");
      void el.offsetWidth;
      el.classList.add("em-alert-flash");
    };
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(run);
    });
    return () => {
      cancel = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [activeHash, filter, showEarlier]);
  const newest = ENTRIES[0]?.datetime;
  const stale = newest != null && now != null && now - Date.parse(newest) > STALE_MS;
  return (
    <SiteShell>
      <LegacyV4>
        <style>{`@media print {
  header, footer, nav, .em-noprint { display: none !important; }
  body, .em-log, .em-log * { background: #fff !important; color: #000 !important; }
  .em-log a { color: #0645ad !important; text-decoration: underline; }
  .em-entry { break-inside: avoid-page; }
  .em-log .em-sev { -webkit-print-color-adjust: exact; print-color-adjust: exact; border-width: 2px; }
  .em-log .em-sev-HIGH { background: #b91c1c !important; color: #fff !important; border-color: #b91c1c !important; }
  .em-log .em-sev-MEDIUM { background: #f59e0b !important; color: #000 !important; border-color: #b45309 !important; }
  .em-log .em-sev-MONITORING { background: #556274 !important; color: #fff !important; border-color: #475569 !important; }
}
.em-mark { background: #f5b82e; color: #0b1c2c; padding: 0 0.12em; border-radius: 0.15em; }
@keyframes em-alert-flash {
  0% { background-color: rgba(245, 184, 46, 0.45); box-shadow: 0 0 0 3px #f5b82e; }
  100% { background-color: transparent; box-shadow: 0 0 0 3px transparent; }
}
.em-alert-flash { animation: em-alert-flash 2s ease-out; border-radius: 0.25rem; }
@media (prefers-reduced-motion: reduce) {
  .em-alert-flash { animation: none; background-color: rgba(245, 184, 46, 0.25); box-shadow: 0 0 0 3px #f5b82e; }
}
.em-alert { scroll-margin-top: 9.5rem; }
@media (min-width: 640px) { .em-alert { scroll-margin-top: 6rem; } }
`}</style>
        <div className="em-noprint">
          <LegacyHero trail={[{ label: "Emergency Monitor" }]} kicker="Live log" title="Emergency Monitor – Live Log" width="max-w-4xl">
            <p className="max-w-xl text-lg">This is a live log, updated about every 2 hours. Newest entries are at the top.</p>
          </LegacyHero>
          <section className="relative -mt-2 bg-gradient-to-r from-navy-900 from-40% to-navy-700 sm:-mt-4" data-deep-search aria-label="Deep search">
            <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
            <form role="search" className="mx-auto w-full max-w-4xl px-5 pb-5 sm:px-8 sm:pb-6" onSubmit={(e) => { e.preventDefault(); commitQ(qInput); }}>
              <label htmlFor="em-q" className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">
                Deep search
              </label>
              <div className="mt-2 flex w-full items-center gap-3 rounded-xl border-2 border-gold bg-navy-800 px-3.5 shadow-[0_0_0_1px_rgba(245,184,46,0.25)] focus-within:bg-navy-700">
                <Search className="size-5 shrink-0 text-gold" aria-hidden />
                <input
                  id="em-q"
                  type="search"
                  value={qInput}
                  onChange={(e) => typeQ(e.target.value)}
                  onBlur={() => commitQ(qInput)}
                  placeholder='NationalRailEnq, "quoted phrase", or several words'
                  className="h-14 w-full min-w-0 bg-transparent text-base text-white placeholder:text-night-muted focus:outline-none sm:text-lg"
                />
              </div>
              <p className="mt-2 text-xs text-[#F6F3EA]/80">
                Matches title, summary, body, location, status, type, threat level, and source handles or labels. Use quotes to keep a phrase together. Words are ANDed.
              </p>
              {query.and.length ? (
                <p className="mt-2 text-sm text-[#F6F3EA]" data-search-count aria-live="polite">
                  {visibleItemCount} {visibleItemCount === 1 ? "alert matches" : "alerts match"}{filter !== "All" ? ` in ${filter}` : ""}.
                </p>
              ) : null}
              <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-quick-searches role="group" aria-label="Quick searches">
                {quickButtons.map((b, i) => {
                  const active = quickQueryActive(q, b.q);
                  const count = quickCounts[i] ?? 0;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      data-quick={b.id}
                      aria-pressed={active}
                      onClick={() => commitQ(active ? "" : b.q)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-semibold ${active ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-800 text-white hover:border-gold"}`}
                    >
                      {b.label}
                      <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-navy-900/15" : "bg-navy-900/60 text-gold"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </form>
          </section>
        </div>
        <div className="em-log mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-8">
          <p aria-hidden="true" className="hidden font-serif text-2xl font-semibold print:block">Emergency Monitor – Live Log</p>
          {newest && (
            <p className="mb-4 text-sm text-[#F6F3EA]">
              <span className="font-semibold">Last updated:</span> <time dateTime={newest}>{fmtET(newest)}</time>
            </p>
          )}
          {stale && (
            <p role="status" className="em-noprint mb-6 rounded-md border-2 border-[#ff6b7f] bg-[#C8102E] px-4 py-3 text-sm font-semibold text-white">
              Heads up: this log may be stale. The newest entry is more than 3 hours old.
            </p>
          )}
          <div className="em-noprint flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-3" aria-label="Download the log">
              <span className="text-sm font-semibold text-on-dark-muted">Download:</span>
              <button type="button" className={btn} aria-label="Download PDF (opens your browser's print dialog)" onClick={() => window.print()}>PDF</button>
              <button type="button" className={btn} onClick={() => save(`emergency-log-${stamp}.txt`, toText(), "text/plain;charset=utf-8")}>TXT</button>
              <button type="button" className={btn} onClick={() => save(`emergency-log-${stamp}.csv`, toCSV(), "text/csv;charset=utf-8")}>CSV</button>
            </div>
            <a
              href={xIntentUrl(PAGE_SHARE_TEXT)}
              target="_blank"
              rel="noopener noreferrer"
              className={btn}
              aria-label="Share this page on X"
            >
              Share on X
            </a>
          </div>
          <p className="em-noprint mt-2 text-xs text-on-dark-muted">PDF opens your browser's print dialog — choose "Save as PDF". Links stay clickable.</p>

          <div className="em-noprint sticky top-[65px] z-30 -mx-5 mt-6 flex gap-2 overflow-x-auto bg-navy-900 px-5 py-2 sm:static sm:mx-0 sm:flex-wrap sm:overflow-visible sm:bg-transparent sm:px-0 sm:py-0" role="group" aria-label="Filter by region">
            {FILTERS.map((f) => {
              const on = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f)}
                  aria-label={`${f}, ${COUNTS[f]} item${COUNTS[f] === 1 ? "" : "s"}`}
                  className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition ${on ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-700 text-[#F6F3EA] hover:border-gold"}`}
                >
                  {f} <span className={on ? "font-normal" : "font-normal text-on-dark-muted"}>({COUNTS[f]})</span>
                </button>
              );
            })}
          </div>

          <div aria-live="polite">
          {ENTRIES.length > 0 && shown.length === 0 ? (
            <p className="mt-8 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-[#F6F3EA]">
              {q.trim() ? <>No alerts match for “{q.trim()}”. <button type="button" className="font-semibold text-gold underline" onClick={() => commitQ("")}>Clear search</button></> : <>No {filter} items in the log right now. <button type="button" className="font-semibold text-gold underline" onClick={() => setFilter("All")}>Show all</button></>}
            </p>
          ) : ENTRIES.length === 0 ? (
            <p className="mt-8 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-[#F6F3EA]">
              No log entries yet. Check back soon — the log is updated about every 2 hours.
            </p>
          ) : (
            <ol className="mt-8 space-y-6">
              {shown.map((e, idx) => (
                <li key={e.datetime} className={`em-entry ${idx > 0 && !showEarlier && e.datetime !== linked?.datetime ? "hidden print:block" : ""} rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-700 px-5 py-5 text-[#F6F3EA]`}>
                  <h2 className="font-serif text-xl font-semibold text-gold"><time dateTime={e.datetime}>{fmtET(e.datetime)}</time></h2>
                  {sectionsFor(e).map(([name, items]) => (
                    <section key={name} className="mt-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide">{name}</h3>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                        {items.map((it, i) => {
                          const id = alertId(it);
                          const markOn = Boolean(query.and.length && (idx === 0 || showEarlier || e.datetime === linked?.datetime));
                          const mark = markOn ? searchTerms : emptySearchTerms;
                          return (
                          <li key={id || i} id={id || undefined} className="em-alert">
                            {(it.severity || it.title) && (
                              <div className="font-bold">
                                {it.severity && (
                                  <span className={`em-sev em-sev-${it.severity} mr-1 inline-block rounded border-2 px-1.5 text-xs font-bold tracking-wide ${SEV_CLASS[it.severity] ?? ""}`}><Marked text={it.severity} terms={mark} /></span>
                                )}
                                {it.severity && it.title ? " – " : ""}
                                <Marked text={it.title} terms={mark} />
                              </div>
                            )}
                            {details(it).map(([k, v]) => (
                              <div key={k}><span className="font-semibold">{k}:</span> <Marked text={v} terms={mark} /></div>
                            ))}
                            <Marked text={it.text} terms={mark} />
                            {(it.links ?? []).map((l, j) => {
                              const label = l.label ?? "on X";
                              const handleHit = Boolean(markOn && linkMatchesTerms(l, query) && !splitHighlights(label, mark).some((part) => part.hit));
                              return (
                                <span key={j}>{" "}<a href={l.url} target="_blank" rel="noreferrer" className="font-semibold text-gold underline">{handleHit ? <mark className="em-mark">{label}</mark> : <Marked text={label} terms={mark} />}</a></span>
                              );
                            })}
                            {(it.title ?? it.text)?.trim() ? (
                              <div className="em-noprint mt-1">
                                <a
                                  href={xIntentUrl(alertShareText(it, name), alertShareUrl(it))}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-gold underline"
                                  aria-label={`Share on X: ${alertShareText(it, name)}`}
                                >
                                  Share on X
                                </a>
                              </div>
                            ) : null}
                          </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </li>
              ))}
            </ol>
          )}
          {earlierCount > 0 && (
            <div className="em-noprint mt-6">
              <button type="button" aria-expanded={showEarlier} onClick={() => setShowEarlier((v) => !v)} className={btn}>
                {showEarlier ? "Hide earlier updates" : `Show earlier updates (${earlierCount})`}
              </button>
            </div>
          )}
          </div>
        </div>
      </LegacyV4>
    </SiteShell>
  );
}
