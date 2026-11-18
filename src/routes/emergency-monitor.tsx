import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Search, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { SiteShell } from "@/components/site/shell";
import { LegacyV4 } from "@/components/site/legacy-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import emergencyHead from "virtual:emergency-head";
import { EmergencyStore, useEmergencyStore, type LogEntry, type LogItem, type LoadProgress } from "@/lib/emergency-data";
import {
  AMERICA_PLACE_LABEL,
  PINNED_US_STATES,
  classifyAmericaLocation,
  countryFromParam,
  countrySlug,
  extractCountries,
  extractUsStates,
  stateFromParam,
  stateSlug,
} from "@/lib/emergency-place";
import { SOURCE_LABEL, matchesSource, sourceClassesOf, type SourceClass } from "@/lib/emergency-source";
import { collapseLatest, countPackedItems } from "@/lib/emergency-stories";
import { compileQuery, highlightNeedles, itemMatchesQuery, linkMatchesTerms, quickQueryActive, QUICK_SEARCH_CANDIDATES, countQueries, splitHighlights, type HighlightNeedle } from "@/lib/emergency-search";
import { ACRONYM_GLOSSARY } from "@/lib/emergency-acronyms";

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
const RAW_REGIONS = ["America", "Europe", "Russia", "Middle East", "Africa", "South America"] as const;
type RawRegion = (typeof RAW_REGIONS)[number];


function fmtET(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
}

/** Raw log sections, including a single America bucket. */
function rawSections(e: LogEntry): [string, LogItem[]][] {
  const out: [string, LogItem[]][] = [];
  for (const r of RAW_REGIONS) if (e.regions?.[r]?.length) out.push([r, e.regions[r]!]);
  if (e.trending?.length) out.push(["Trending", e.trending]);
  if (e.threats?.length) out.push(["Threats", e.threats]);
  return out;
}

/** Place classification is pure per location string; cache it (it ran ~10x per item per render). */
const AMERICA_LABEL_CACHE = new Map<string, string>();
function displaySection(raw: string, it: LogItem) {
  if (raw !== "America") return raw;
  const key = it.location ?? "";
  let label = AMERICA_LABEL_CACHE.get(key);
  if (label === undefined) {
    label = AMERICA_PLACE_LABEL[classifyAmericaLocation(it.location)];
    AMERICA_LABEL_CACHE.set(key, label);
  }
  return label;
}

const DISPLAY_SECTION_ORDER = [
  "USA",
  "Canada",
  "Mexico",
  "Other North America",
  "Europe",
  "Russia",
  "Middle East",
  "Africa",
  "South America",
  "Trending",
  "Threats",
] as const;

/** America split into USA / Canada / Mexico / Other North America; other regions unchanged. */
const DISPLAY_SECTIONS_CACHE = new WeakMap<LogEntry, [string, LogItem[]][]>();
function displaySections(e: LogEntry): [string, LogItem[]][] {
  let hit = DISPLAY_SECTIONS_CACHE.get(e);
  if (!hit) {
    hit = computeDisplaySections(e);
    DISPLAY_SECTIONS_CACHE.set(e, hit);
  }
  return hit;
}
function computeDisplaySections(e: LogEntry): [string, LogItem[]][] {
  const buckets = new Map<string, LogItem[]>();
  for (const [raw, items] of rawSections(e)) {
    for (const it of items) {
      const name = displaySection(raw, it);
      const list = buckets.get(name);
      if (list) list.push(it);
      else buckets.set(name, [it]);
    }
  }
  const out: [string, LogItem[]][] = [];
  for (const name of DISPLAY_SECTION_ORDER) {
    const items = buckets.get(name);
    if (items?.length) out.push([name, items]);
  }
  return out;
}

function save(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type PackedEntry = { datetime: string; sections: [string, LogItem[]][] };

function toText(rows: PackedEntry[], note: string) {
  const lines = ["EMERGENCY MONITOR – LIVE LOG", "aguyonx.com/emergency-monitor", note, ""];
  if (!rows.length) lines.push("No entries in this selection.");
  for (const e of rows) {
    lines.push("=".repeat(40), fmtET(e.datetime), "=".repeat(40));
    for (const [name, items] of e.sections) {
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

function toCSV(rows: PackedEntry[]) {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const out = [["datetime_iso", "datetime_et", "section", "severity", "title", "location", "type", "summary", "status", "text", "x_links"].join(",")];
  for (const e of rows)
    for (const [name, items] of e.sections)
      for (const it of items)
        out.push([e.datetime, fmtET(e.datetime), name, it.severity ?? "", it.title ?? "", it.location ?? "", it.type ?? "", it.summary ?? "", it.status ?? "", it.text ?? "", (it.links ?? []).map((l) => l.url).join(" ")].map(q).join(","));
  return "\uFEFF" + out.join("\r\n");
}

const EM_TITLE = "Emergency Monitor – Live Log | aguyonx.com";
const EM_DESC = "A live log of emergencies and threats worldwide — cyber, power outages, unrest, terror, infrastructure and elections — sorted by region and updated regularly, with sources on X.";
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
 * Stable per-alert anchors (assigned per window as windows load; a window's ids never depend on other windows). The bot appends a new 2-hour window; it does not
 * change an earlier window's datetime or the title on that snapshot. Ids are
 * em-<window>-<title-slug>, with -2, -3… only if two items in the same window
 * slug to the same string. Status, severity and links can change on later
 * windows and are not used.
 */
function assignAlertIds(e: LogEntry) {
  const used = new Map<string, number>();
  {
    for (const [section, items] of rawSections(e)) {
      for (const it of items) {
        const label = (it.title ?? it.text ?? "").trim();
        const base = `em-${compactDatetime(e.datetime)}-${slugify(label)}`;
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n + 1}`;
        ALERT_ID.set(it, id);
        ALERT_BY_ID.set(id, { id, datetime: e.datetime, section: displaySection(section, it) });
      }
    }
  }
}

/** Manifest + newest window are bundled; every other window loads on demand. */
const STORE = new EmergencyStore(emergencyHead, assignAlertIds);
const HEAD = STORE.head;

/** Compact window datetime -> that window's datetime (for deep links to windows not loaded yet). */
const WINDOW_BY_COMPACT = new Map<string, string>(HEAD.windows.map(([dt]) => [compactDatetime(dt), dt]));
function windowOfAlertId(id: string): string | undefined {
  const m = id.match(/^em-(\d{8}t\d{6}(?:[mp]\d{4}|z))-/);
  return m ? WINDOW_BY_COMPACT.get(m[1]) : undefined;
}

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

export type TimeWindow = "2h" | "24h" | "7d" | "full";
export type EmSearch = {
  window?: TimeWindow;
  region?: string;
  threat?: string;
  type?: string;
  status?: string;
  source?: string;
  state?: string;
  country?: string;
  q?: string;
  view?: "top";
};

const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: "2h", label: "Last 2 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "full", label: "All" },
];

/** Compare each entry window to the newest entry, not wall-clock now, so a given log always yields the same 24h/7d slice (and the same default PDF) until the next 2-hour update. */
const NEWEST_MS = Date.parse(HEAD.newest ?? "") || 0;
const WINDOW_MS: Record<TimeWindow, number> = { "2h": 2 * 60 * 60 * 1000, "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 60 * 1000, full: Infinity };

function inTimeWindow(e: { datetime: string }, w: TimeWindow) {
  if (w === "full") return true;
  const t = Date.parse(e.datetime);
  if (Number.isNaN(t) || !NEWEST_MS) return true;
  return NEWEST_MS - t <= WINDOW_MS[w];
}

/** Item counts per time button, from the manifest (no archive download needed). */
const WINDOW_ITEM_COUNTS: Record<TimeWindow, number> = (() => {
  const c: Record<TimeWindow, number> = { "2h": 0, "24h": 0, "7d": 0, full: 0 };
  for (const [datetime, n] of HEAD.windows) for (const w of TIME_WINDOWS) if (inTimeWindow({ datetime }, w.value)) c[w.value] += n;
  return c;
})();
const FILES_FOR_WINDOW: Record<TimeWindow, number[]> = {
  "2h": STORE.filesFor((datetime) => inTimeWindow({ datetime }, "2h")),
  "24h": STORE.filesFor((datetime) => inTimeWindow({ datetime }, "24h")),
  "7d": STORE.filesFor((datetime) => inTimeWindow({ datetime }, "7d")),
  full: STORE.filesFor(() => true),
};

function fmtMB(bytes: number) {
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

function windowLabel(w: TimeWindow) {
  return TIME_WINDOWS.find((x) => x.value === w)?.label ?? w;
}

const THREAT_ORDER = ["HIGH", "MEDIUM", "MONITORING", "Unspecified"] as const;
const TYPE_ORDER = ["Cyber", "Power Outage", "Unrest", "Terror", "Infrastructure", "Election", "Other", "Unspecified"] as const;

function threatOf(it: LogItem) {
  return it.severity ?? "Unspecified";
}
function typeOf(it: LogItem) {
  return it.type ?? "Unspecified";
}

const STATUS_ORDER = ["New", "Update", "Continuation", "Resolved", "Unspecified"] as const;
const SOURCE_ORDER: SourceClass[] = ["official", "news", "other"];

/** Title prefix only. The Status field is free-text and is not reliable enough to filter on. MONITORING as a title prefix is omitted (two items; it collides with threat-level MONITORING). */
function statusOf(it: LogItem) {
  const t = (it.title ?? it.text ?? "").trim();
  const m = t.match(/^(NEW|UPDATE|CONTINUATION|RESOLVED)\b/i);
  if (!m) return "Unspecified";
  switch (m[1].toUpperCase()) {
    case "NEW": return "New";
    case "UPDATE": return "Update";
    case "CONTINUATION": return "Continuation";
    case "RESOLVED": return "Resolved";
    default: return "Unspecified";
  }
}

function statusParam(s: string) {
  return s.toLowerCase();
}
function statusFromParam(s: string | undefined) {
  if (!s) return "";
  const hit = STATUS_ORDER.find((k) => k.toLowerCase() === s.toLowerCase());
  return hit ?? "";
}

const PLACE_CACHE = new Map<string, string[]>();
function cachedPlaces(kind: "s" | "c", it: LogItem, section: string) {
  const key = `${kind}\u0000${section}\u0000${it.location ?? ""}`;
  let v = PLACE_CACHE.get(key);
  if (!v) {
    v = kind === "s" ? extractUsStates(it.location, section) : extractCountries(it.location, section);
    PLACE_CACHE.set(key, v);
  }
  return v;
}
function statesOf(it: LogItem, section: string) {
  return cachedPlaces("s", it, section);
}
function countriesOf(it: LogItem, section: string) {
  return cachedPlaces("c", it, section);
}

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

function matchesThreat(it: LogItem, threat: string) {
  return !threat || threatOf(it) === threat;
}
function matchesType(it: LogItem, typ: string) {
  return !typ || typeOf(it) === typ;
}
function matchesStatus(it: LogItem, status: string) {
  return !status || statusOf(it) === status;
}
function matchesRegion(section: string, region: string) {
  if (!region || region === "All") return true;
  return section === region;
}
function matchesState(it: LogItem, section: string, state: string) {
  return !state || statesOf(it, section).includes(state);
}
function matchesCountry(it: LogItem, section: string, country: string) {
  return !country || countriesOf(it, section).includes(country);
}

/** Highest severity levels in the log: HIGH, plus CRITICAL if it appears later. */
const TOP_SEVERITIES = new Set(["HIGH", "CRITICAL"]);
const TOP_ALERTS_LIMIT = 10;
function isTopSeverity(it: LogItem) {
  return TOP_SEVERITIES.has((it.severity ?? "").toUpperCase());
}
type TopAlertRow = { datetime: string; section: string; item: LogItem };
/** Newest unique HIGH/CRITICAL stories from every region, newest version only. */
function collectTopAlerts(entries: LogEntry[], limit = TOP_ALERTS_LIMIT): TopAlertRow[] {
  const packed = entries.map((e) => ({
    datetime: e.datetime,
    sections: displaySections(e).filter(([name]) => name !== "Trending" && name !== "Threats"),
  }));
  const out: TopAlertRow[] = [];
  for (const e of collapseLatest(packed)) {
    for (const [section, items] of e.sections) {
      for (const it of items) {
        if (!isTopSeverity(it)) continue;
        out.push({ datetime: e.datetime, section, item: it });
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

export const Route = createFileRoute("/emergency-monitor")({
  validateSearch: (s: Record<string, unknown>): EmSearch => {
    const w = s.window;
    const window: TimeWindow | undefined = w === "2h" || w === "7d" || w === "full" || w === "24h" ? w : undefined;
    const status = typeof s.status === "string" ? statusFromParam(s.status) : "";
    const source = typeof s.source === "string" && (SOURCE_ORDER as string[]).includes(s.source) ? s.source : "";
    const state = typeof s.state === "string" ? stateFromParam(s.state) : "";
    const country = typeof s.country === "string" ? countryFromParam(s.country) : "";
    return {
      ...(window && window !== "24h" ? { window } : {}),
      ...(typeof s.region === "string" && s.region && s.region !== "All" ? { region: s.region } : {}),
      ...(typeof s.threat === "string" && s.threat ? { threat: s.threat } : {}),
      ...(typeof s.type === "string" && s.type ? { type: s.type } : {}),
      ...(status ? { status: statusParam(status) } : {}),
      ...(source ? { source } : {}),
      ...(state ? { state: stateSlug(state) } : {}),
      ...(country ? { country: countrySlug(country) } : {}),
      ...(typeof s.q === "string" && s.q.trim() ? { q: s.q.slice(0, 120) } : {}),
      ...(s.view === "top" ? { view: "top" as const } : {}),
    };
  },
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
const btnSm = "inline-flex min-h-9 items-center rounded-md border border-gold px-3 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900";

const emptySearchTerms: HighlightNeedle[] = [];

const REGION_FILTERS = ["All", "USA", "Canada", "Mexico", "Other North America", "Europe", "Russia", "Middle East", "Africa", "South America", "Trending", "Threats"] as const;

/** Visible place chips besides All, before the More toggle. Pins are always included. */
const PLACE_CHIP_LIMIT = 10;

function splitPlaceChips(all: string[], selected: string, pinned: readonly string[] = []) {
  const pinSet = new Set<string>(pinned);
  const visible: string[] = [...pinned];
  for (const k of all) {
    if (pinSet.has(k)) continue;
    if (visible.length >= PLACE_CHIP_LIMIT) break;
    visible.push(k);
  }
  if (selected && all.includes(selected) && !visible.includes(selected)) visible.push(selected);
  const vis = new Set(visible);
  const hidden = all.filter((k) => !vis.has(k));
  return { visible, hidden };
}

function FilterChip({ active, onClick, count, children, attr, compact }: { active: boolean; onClick: () => void; count: number | null; children: ReactNode; attr?: Record<string, string>; compact?: boolean }) {
  return (
    <button
      type="button"
      {...attr}
      data-count={count ?? "loading"}
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-0.5 rounded-full border font-semibold ${compact ? "min-h-9 px-2.5 text-[13px]" : "min-h-11 px-3 text-sm"} ${active ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-800 text-white hover:border-gold"}`}
    >
      {children}
      <span className={`rounded-full px-1 text-xs ${active ? "bg-navy-900/15" : "bg-navy-900/60 text-gold"}`} aria-label={count == null ? "count loading" : undefined}>{count ?? "…"}</span>
    </button>
  );
}


const DOTS_TITLE = "Connect the Dots. Don't Connect the Panic.";
const DOTS_THUMB = "/images/emergency-monitor/connect-the-dots-thumb.webp";
const DOTS_FULL = "/images/emergency-monitor/connect-the-dots.webp";
const DOTS_PNG = "/images/emergency-monitor/connect-the-dots.png";
const DOTS_ALT = "Infographic titled Connect the Dots. Don't Connect the Panic, with the subtitle An example. The real skill is knowing which ones matter. A solid line labeled connected: one caused the other links Weather (ice storm warning issued) to Infrastructure (road closed for icy bridge). A dashed red line labeled possible, not proven links Wild Card (viral post, no clear source) to FBI (official statement, hours later). Unconnected dots are labeled Health (flu cases tick up), Cyber Attack (a company's site goes down), Energy (planned power plant repairs), Transportation (flight delays at one airport), Border (monthly crossing numbers out), and Finance (bank app down for an hour). The footer says Most dots never connect. When they do, you'll see it. Train your eye for that, not for the noise, and notes this is an example only, made to train critical thinking and awareness, not to cause panic.";
const DOTS_BULLETS = [
  "Most alerts have nothing to do with each other.",
  "Sometimes one really causes another, like an ice storm warning that leads to a closed road.",
  "Sometimes two only look linked, like a viral post and an official statement hours later. That's possible, not proven.",
  "Most dots never connect. When they do, you'll see it. Train your eye for that, not for the noise.",
  "This is an example to build critical thinking and awareness, not to cause panic.",
] as const;

function ConnectDotsLightbox({
  open,
  onOpenChange,
  triggerRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: { current: HTMLButtonElement | null };
}) {
  const titleId = useId();
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.removeProperty("overflow");
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [open]);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="em-noprint fixed inset-0 z-50 bg-navy-900/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-connect-dots-dialog
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            triggerRef.current?.focus();
          }}
          className="em-noprint fixed top-1/2 left-1/2 z-50 flex max-h-[min(92vh,56rem)] w-[min(calc(100vw-1.25rem),52rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-gold/70 bg-navy-700 shadow-2xl focus:outline-none"
        >
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
            <Dialog.Title id={titleId} className="min-w-0 font-serif text-lg font-bold leading-tight text-white sm:text-2xl">
              {DOTS_TITLE}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close Connect the Dots graphic"
              data-connect-dots-close
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-gold hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-5">
            <div className="mt-3 flex flex-col">
              <p className="mb-2 md:order-2 md:mt-2 md:mb-0">
                <a
                  href={DOTS_PNG}
                  target="_blank"
                  rel="noopener"
                  data-connect-dots-fullsize
                  className="text-sm font-semibold text-gold underline decoration-gold/70 underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Open full size
                </a>
              </p>
              <div className="overflow-auto overscroll-contain touch-auto rounded-lg bg-white md:order-1">
                <img
                  src={DOTS_FULL}
                  alt={DOTS_ALT}
                  width={1600}
                  height={1200}
                  className="h-auto w-[1600px] max-w-none sm:h-auto sm:w-full sm:max-w-full"
                />
              </div>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#F6F3EA] sm:text-base">
              {DOTS_BULLETS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Groups start closed (as they render today); the summary shows the active choice. */
function FilterGroup({ id, title, hint, activeLabel, children }: { id: string; title: string; hint?: string; activeLabel?: string; children: ReactNode }) {
  return (
    <details className="mt-4 border-t border-navy-line/80 pt-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase [&::-webkit-details-marker]:hidden">
        <span>{title}{activeLabel ? <span className="ml-2 normal-case tracking-normal text-gold">· {activeLabel}</span> : null}</span>
        <span className="text-gold" aria-hidden="true">▾</span>
      </summary>
      {hint ? <p className="mt-1 text-xs font-sans font-normal normal-case tracking-normal text-on-dark-muted">{hint}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby={id}>
        {children}
      </div>
    </details>
  );
}

function EmergencyMonitorPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const windowKey: TimeWindow = search.window ?? "24h";
  const region = search.region && search.region !== "All" ? search.region : "All";
  const threat = search.threat ?? "";
  const typ = search.type ?? "";
  const status = statusFromParam(search.status);
  const source = search.source ?? "";
  const state = stateFromParam(search.state);
  const country = countryFromParam(search.country);
  const q = search.q ?? "";
  const viewTop = search.view === "top";

  const setSearch = (patch: Partial<Record<keyof EmSearch, string>>) => {
    const next = { window: windowKey, region, threat, type: typ, status, source, state, country, q, view: viewTop ? "top" : "", ...patch };
    const clean: EmSearch = {};
    if (next.window && next.window !== "24h") clean.window = next.window as TimeWindow;
    if (next.region && next.region !== "All") clean.region = next.region;
    if (next.threat) clean.threat = next.threat;
    if (next.type) clean.type = next.type;
    const nextStatus = statusFromParam(next.status);
    const nextSource = (SOURCE_ORDER as string[]).includes(next.source) ? next.source : "";
    const stateVal = !next.state || next.state === "All" ? "" : (stateFromParam(next.state) || (next.state === state ? state : ""));
    const countryVal = !next.country || next.country === "All" ? "" : (countryFromParam(next.country) || (next.country === country ? country : ""));
    if (nextStatus) clean.status = statusParam(nextStatus);
    if (nextSource) clean.source = nextSource;
    if (stateVal) clean.state = stateSlug(stateVal);
    if (countryVal) clean.country = countrySlug(countryVal);
    if (next.q?.trim()) clean.q = next.q.trim().slice(0, 120);
    if (next.view === "top") clean.view = "top";
    navigate({ search: clean, replace: true, resetScroll: false });
  };

  const query = useMemo(() => compileQuery(q), [q]);
  const searchTerms = useMemo(() => highlightNeedles(query), [query]);
  const [qInput, setQInput] = useState(q);
  const qTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setQInput(q);
  }, [q]);
  useEffect(() => () => {
    if (qTimer.current) clearTimeout(qTimer.current);
  }, []);
  const commitQ = (value: string) => {
    if (qTimer.current) {
      clearTimeout(qTimer.current);
      qTimer.current = null;
    }
    setSearch({ q: value, ...(value.trim() ? { view: "" } : {}) });
  };
  const typeQ = (value: string) => {
    setQInput(value);
    if (qTimer.current) clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => setSearch({ q: value, ...(value.trim() ? { view: "" } : {}) }), 200);
  };

  const [showEarlier, setShowEarlier] = useState(false);
  const [storyMode, setStoryMode] = useState<"latest" | "history">("latest");
  const [moreStates, setMoreStates] = useState(false);
  const [moreCountries, setMoreCountries] = useState(false);
  const moreFromUrl = Boolean(threat || typ || status || source || state || country);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(moreFromUrl);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [acronymsOpen, setAcronymsOpen] = useState(false);
  const dotsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const openDots = (el: HTMLButtonElement | null) => {
    dotsTriggerRef.current = el;
    setDotsOpen(true);
  };
  const [activeHash, setActiveHash] = useState("");
  const stamp = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, []);
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
  useEffect(() => {
    setShowEarlier(false);
    setMoreStates(false);
    setMoreCountries(false);
  }, [windowKey, region, threat, typ, status, source, state, country, q, viewTop]);
  useEffect(() => {
    if (moreFromUrl) setMoreFiltersOpen(true);
  }, [moreFromUrl]);
  useEffect(() => {
    if (!downloadOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) setDownloadOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDownloadOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [downloadOpen]);

  const linked = activeHash ? ALERT_BY_ID.get(activeHash) : undefined;
  const override = Boolean(linked);

  const snap = useEmergencyStore(STORE);
  const ENTRIES = snap.entries;
  const neededFiles = FILES_FOR_WINDOW[windowKey];
  const rangeReady = neededFiles.every((f) => snap.loaded.has(f));
  const allLoaded = FILES_FOR_WINDOW.full.every((f) => snap.loaded.has(f));
  const progress: LoadProgress | null = snap.progress;
  const loadingRange = !rangeReady;
  // Load what the selected range needs, after first paint. 2h/24h use only the newest-24h file.
  useEffect(() => {
    if (!rangeReady) void STORE.load(neededFiles).catch(() => {});
  }, [windowKey, rangeReady]);
  // Deep link to a window that is not loaded yet: fetch the file holding it.
  const linkedWindow = activeHash ? windowOfAlertId(activeHash) : undefined;
  useEffect(() => {
    if (!linkedWindow) return;
    const files = STORE.filesFor((dt) => dt === linkedWindow);
    if (!STORE.isLoaded(files)) void STORE.load(files).catch(() => {});
  }, [linkedWindow]);
  const linkLoading = Boolean(linkedWindow && !ALERT_BY_ID.has(activeHash) && !STORE.isLoaded(STORE.filesFor((dt) => dt === linkedWindow)));

  const timedEntries = useMemo(() => ENTRIES.filter((e) => inTimeWindow(e, windowKey)), [windowKey, ENTRIES]);
  const topAlerts = useMemo(() => collectTopAlerts(ENTRIES), [ENTRIES]);

  type Skip = "region" | "threat" | "type" | "status" | "source" | "state" | "country" | "search";
  const matchesItem = (section: string, it: LogItem, skip?: Skip) => {
    if (skip !== "search" && !itemMatchesQuery(it, query, section)) return false;
    if (skip !== "region" && !matchesRegion(section, region)) return false;
    if (skip !== "threat" && !matchesThreat(it, threat)) return false;
    if (skip !== "type" && !matchesType(it, typ)) return false;
    if (skip !== "status" && !matchesStatus(it, status)) return false;
    if (skip !== "source" && !matchesSource(it.links, source)) return false;
    if (skip !== "state" && !matchesState(it, section, state)) return false;
    if (skip !== "country" && !matchesCountry(it, section, country)) return false;
    return true;
  };

  const pack = (entries: LogEntry[], filterFn: (section: string, it: LogItem) => boolean): PackedEntry[] => {
    const out: PackedEntry[] = [];
    for (const e of entries) {
      const sections = displaySections(e)
        .map(([name, items]): [string, LogItem[]] => [name, items.filter((it) => filterFn(name, it))])
        .filter(([, items]) => items.length > 0);
      if (sections.length) out.push({ datetime: e.datetime, sections });
    }
    return out;
  };

  const filtered = useMemo(
    () => pack(timedEntries, (section, it) => matchesItem(section, it)),
    [timedEntries, region, threat, typ, status, source, state, country, q],
  );
  const downloadPack = useMemo(
    () => (storyMode === "latest" ? collapseLatest(filtered) : filtered),
    [filtered, storyMode],
  );
  const latestCount = useMemo(() => countPackedItems(collapseLatest(filtered)), [filtered]);
  const historyCount = useMemo(() => countPackedItems(filtered), [filtered]);

  const displayed = useMemo(() => {
    if (!linked) return filtered;
    const already = filtered.some((e) => e.datetime === linked.datetime && e.sections.some(([, items]) => items.some((it) => alertId(it) === linked.id)));
    if (already) return filtered;
    const entry = ENTRIES.find((e) => e.datetime === linked.datetime);
    if (!entry) return filtered;
    // Show the linked alert (and its section) even if it is outside the time window or filters.
    const sections = displaySections(entry)
      .map(([name, items]): [string, LogItem[]] => [name, items.filter((it) => alertId(it) === linked.id)])
      .filter(([, items]) => items.length > 0);
    if (!sections.length) return filtered;
    const extra: PackedEntry = { datetime: entry.datetime, sections };
    const next = filtered.filter((e) => e.datetime !== extra.datetime).concat(extra);
    next.sort((a, b) => Date.parse(b.datetime) - Date.parse(a.datetime));
    return next;
  }, [filtered, linked, ENTRIES]);

  const shown = displayed;
  const earlierCount = Math.max(0, shown.length - 1);

  const countIn = (skip?: Skip) =>
    timedEntries.reduce((n, e) => n + displaySections(e).reduce((m, [name, items]) => m + items.filter((it) => matchesItem(name, it, skip)).length, 0), 0);

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = { All: countIn("region") };
    for (const r of REGION_FILTERS) if (r !== "All") c[r] = 0;
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (!matchesItem(name, it, "region")) continue;
          c[name] = (c[name] ?? 0) + 1;
        }
      }
    }
    return c;
  }, [timedEntries, threat, typ, status, source, state, country, q]);

  const threatCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (!matchesItem(name, it, "threat")) continue;
          const k = threatOf(it);
          c[k] = (c[k] ?? 0) + 1;
        }
      }
    }
    return c;
  }, [timedEntries, region, typ, status, source, state, country, q]);

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (!matchesItem(name, it, "type")) continue;
          const k = typeOf(it);
          c[k] = (c[k] ?? 0) + 1;
        }
      }
    }
    return c;
  }, [timedEntries, region, threat, status, source, state, country, q]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (!matchesItem(name, it, "status")) continue;
          const k = statusOf(it);
          c[k] = (c[k] ?? 0) + 1;
        }
      }
    }
    return c;
  }, [timedEntries, region, threat, typ, source, state, country, q]);

  const sourceCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (!matchesItem(name, it, "source")) continue;
          for (const k of sourceClassesOf(it.links)) c[k] = (c[k] ?? 0) + 1;
        }
      }
    }
    return c;
  }, [timedEntries, region, threat, typ, status, state, country, q]);

  const stateCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (!matchesItem(name, it, "state")) continue;
          for (const k of statesOf(it, name)) c[k] = (c[k] ?? 0) + 1;
        }
      }
    }
    return c;
  }, [timedEntries, region, threat, typ, status, source, country, q]);

  const countryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (!matchesItem(name, it, "country")) continue;
          for (const k of countriesOf(it, name)) c[k] = (c[k] ?? 0) + 1;
        }
      }
    }
    return c;
  }, [timedEntries, region, threat, typ, status, source, state, q]);

  const stateList = useMemo(() => {
    const rest = Object.keys(stateCounts)
      .filter((k) => !PINNED_US_STATES.includes(k as (typeof PINNED_US_STATES)[number]) && ((stateCounts[k] ?? 0) > 0 || k === state))
      .sort((a, b) => (stateCounts[b] ?? 0) - (stateCounts[a] ?? 0) || a.localeCompare(b));
    const pinned = PINNED_US_STATES.filter((k) => (stateCounts[k] ?? 0) > 0 || k === state || true);
    return [...pinned, ...rest];
  }, [stateCounts, state]);

  const countryList = useMemo(() => {
    return Object.keys(countryCounts)
      .filter((k) => (countryCounts[k] ?? 0) > 0 || k === country)
      .sort((a, b) => (countryCounts[b] ?? 0) - (countryCounts[a] ?? 0) || a.localeCompare(b));
  }, [countryCounts, country]);

  const stateSplit = useMemo(() => splitPlaceChips(stateList, state, PINNED_US_STATES), [stateList, state]);
  const countrySplit = useMemo(() => splitPlaceChips(countryList, country), [countryList, country]);
  const shownStates = moreStates ? stateList : stateSplit.visible;
  const hiddenStateCount = stateSplit.hidden.length;
  const shownCountries = moreCountries ? countryList : countrySplit.visible;
  const hiddenCountryCount = countrySplit.hidden.length;

  const visibleItemCount = filtered.reduce((n, e) => n + e.sections.reduce((m, [, items]) => m + items.length, 0), 0);
  const timedItemCount = timedEntries.reduce((n, e) => n + displaySections(e).reduce((m, [, items]) => m + items.length, 0), 0);
  const allTimeMatchCount = useMemo(() => {
    if (!query.and.length || windowKey === "full" || visibleItemCount > 5 || !allLoaded) return null;
    let n = 0;
    for (const e of ENTRIES) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (matchesItem(name, it)) n++;
        }
      }
    }
    return n;
  }, [query, windowKey, visibleItemCount, region, threat, typ, status, source, state, country, q, ENTRIES, allLoaded]);

  const timedItems = useMemo(() => {
    const rows: { it: LogItem; section: string }[] = [];
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) rows.push({ it, section: name });
      }
    }
    return rows;
  }, [timedEntries]);
  const quickButtons = QUICK_SEARCH_CANDIDATES;
  // Items in the selected time range and board filters (not the search box), so chip
  // counts move with 2h vs 24h the same way the region totals do.
  const quickCountItems = useMemo(() => {
    const rows: { it: LogItem; section: string }[] = [];
    for (const e of timedEntries) {
      for (const [name, items] of displaySections(e)) {
        for (const it of items) {
          if (!matchesItem(name, it, "search")) continue;
          rows.push({ it, section: name });
        }
      }
    }
    return rows;
  }, [timedEntries, region, threat, typ, status, source, state, country]);
  const quickCounts = useMemo(
    () => countQueries(quickCountItems, quickButtons.map((b) => b.q)),
    [quickCountItems],
  );
  const filtersActive = viewTop || region !== "All" || Boolean(threat) || Boolean(typ) || Boolean(status) || Boolean(source) || Boolean(state) || Boolean(country) || Boolean(q.trim());
  const moreFilterCount = [threat, typ, status, source, state, country].filter(Boolean).length;

  const downloadNote = `Selection: ${windowLabel(windowKey)}${region !== "All" ? `; region ${region}` : ""}${threat ? `; threat ${threat}` : ""}${typ ? `; type ${typ}` : ""}${status ? `; status ${status}` : ""}${source ? `; source ${SOURCE_LABEL[source as SourceClass]}` : ""}${state ? `; state ${state}` : ""}${country ? `; country ${country}` : ""}${q.trim() ? `; search “${q.trim()}”` : ""}; ${storyMode === "latest" ? "latest version of each alert" : "every update (full history)"}.`;
  const fileTag = [windowKey, region !== "All" ? region.toLowerCase().replace(/\s+/g, "-") : "", threat.toLowerCase(), typ.toLowerCase().replace(/\s+/g, "-"), status ? statusParam(status) : "", source, state ? stateSlug(state) : "", country ? countrySlug(country) : "", q.trim() ? "search" : "", storyMode].filter(Boolean).join("-");

  useEffect(() => {
    if (!activeHash) return;
    const meta = ALERT_BY_ID.get(activeHash);
    if (!meta) return;
    const idx = shown.findIndex((e) => e.datetime === meta.datetime);
    if (idx > 0 && !showEarlier) {
      setShowEarlier(true);
      // Do not return: the linked entry is visible even before "Show earlier" expands.
    }
    let cancel = false;
    const run = () => {
      if (cancel) return;
      const el = document.getElementById(activeHash);
      if (!el) return;
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
  }, [activeHash, showEarlier, shown]);

  const clearLinked = () => {
    const url = window.location.pathname + window.location.search;
    history.replaceState(null, "", url);
    setActiveHash("");
  };

  const newest = HEAD.newest ?? ENTRIES[0]?.datetime;
  const loadingNote = loadingRange ? (
    <span data-em-loading className="inline-flex flex-wrap items-center gap-2">
      <span>
        {progress?.error
          ? `${progress.error}. `
          : `Loading ${windowKey === "full" ? "the full archive" : windowLabel(windowKey).toLowerCase()}… `}
        {progress && progress.total > 0 ? `${progress.done} of ${progress.total} files (${fmtMB(progress.bytes)} of ${fmtMB(progress.totalBytes)})` : null}
      </span>
      {progress && progress.total > 0 && !progress.error ? (
        <span className="inline-block h-1.5 w-28 overflow-hidden rounded-full bg-navy-900/70" role="progressbar" aria-label="Loading archive" aria-valuemin={0} aria-valuemax={progress.totalBytes} aria-valuenow={progress.bytes}>
          <span className="block h-full bg-gold transition-[width]" style={{ width: `${progress.totalBytes ? Math.round((progress.bytes / progress.totalBytes) * 100) : 0}%` }} />
        </span>
      ) : null}
      {progress?.error ? (
        <button type="button" className="font-semibold text-gold underline" onClick={() => void STORE.load(neededFiles).catch(() => {})}>Retry</button>
      ) : null}
    </span>
  ) : null;
  const stale = newest != null && now != null && now - Date.parse(newest) > STALE_MS;
  return (
    <SiteShell>
      <LegacyV4>
        <style>{`@media screen {
  .em-print-log { display: none !important; }
}
@media print {
  header, footer, nav, .em-noprint, .em-screen-log { display: none !important; }
  .em-print-log { display: block !important; }
  body, .em-log, .em-print-log, .em-print-log * { background: #fff !important; color: #000 !important; }
  .em-print-log { font-size: 9pt; line-height: 1.3; }
  .em-print-log .em-print-title { font-family: Georgia, "Times New Roman", serif; font-size: 14pt; font-weight: 600; margin: 0 0 0.3em; }
  .em-print-log .em-print-note { font-size: 8pt; margin: 0 0 0.8em; }
  .em-print-log h2 { font-size: 11pt; margin: 0.7em 0 0.2em; font-weight: 700; }
  .em-print-log h3 { font-size: 9pt; margin: 0.45em 0 0.1em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .em-print-log ol, .em-print-log ul { margin: 0; padding-left: 1.1em; }
  .em-print-log .em-print-window { margin: 0 0 0.5em; padding: 0; }
  .em-print-log li { margin: 0 0 0.35em; padding: 0; break-inside: auto; page-break-inside: auto; }
  .em-print-log a { color: #0645ad !important; text-decoration: underline; font-size: 8pt; }
  .em-print-log .em-print-meta { font-size: 8pt; }
  .em-print-log .em-sev { -webkit-print-color-adjust: exact; print-color-adjust: exact; border-width: 1px; font-size: 7pt; }
  .em-print-log .em-sev-HIGH { background: #b91c1c !important; color: #fff !important; border-color: #b91c1c !important; }
  .em-print-log .em-sev-MEDIUM { background: #f59e0b !important; color: #000 !important; border-color: #b45309 !important; }
  .em-print-log .em-sev-MONITORING { background: #556274 !important; color: #fff !important; border-color: #475569 !important; }
}
.em-mark { background: rgba(245, 184, 46, 0.38); color: inherit; padding: 0 0.12em; border-radius: 0.15em; text-decoration: none; box-shadow: none; cursor: text; }
a .em-mark { cursor: inherit; color: inherit; text-decoration: none; }
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
        <div className="em-noprint relative">
          <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
            <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
            <div className="mx-auto flex w-full max-w-4xl flex-wrap items-end justify-between gap-x-4 gap-y-1.5 px-5 py-2.5 sm:px-8 sm:py-3.5">
              <div className="min-w-0">
                <Breadcrumbs items={[{ label: "Emergency Monitor" }]} className="mb-1" />
                <p className="font-serif text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">Live log</p>
                <h1 className="mt-0.5 font-serif text-2xl font-bold uppercase leading-tight sm:text-3xl">Emergency Monitor – Live Log</h1>
                <p className="mt-1 text-xs text-[#F6F3EA]/80">
                  Updated regularly. Newest entries are at the top.
                  {newest ? (
                    <span className="text-[#F6F3EA] sm:hidden">
                      {" "}
                      <span className="font-semibold">Last updated:</span>{" "}
                      <time dateTime={newest}>{fmtET(newest)}</time>
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-nowrap items-center gap-2 pb-0.5" data-download-controls ref={downloadRef}>
                {newest && (
                  <p className="mr-1 hidden text-xs text-[#F6F3EA] sm:block">
                    <span className="font-semibold">Last updated:</span>{" "}
                    <time dateTime={newest}>{fmtET(newest)}</time>
                  </p>
                )}
                <button
                  type="button"
                  data-connect-dots-card
                  data-connect-dots-chip
                  aria-haspopup="dialog"
                  aria-expanded={dotsOpen}
                  aria-label="Connect the Dots. Don't Connect the Panic. Tap to enlarge"
                  onClick={(e) => openDots(e.currentTarget)}
                  className={`${btnSm} max-md:hidden max-w-[13.5rem] gap-1.5 text-left`}
                >
                  <img
                    src={DOTS_THUMB}
                    alt=""
                    width={480}
                    height={360}
                    className="h-6 w-8 shrink-0 rounded-sm bg-white object-cover"
                  />
                  <span className="truncate">Connect the Dots</span>
                </button>
                <div className="relative">
                  <button
                    type="button"
                    className={btnSm}
                    aria-expanded={downloadOpen}
                    aria-haspopup="dialog"
                    data-download-toggle
                    onClick={() => setDownloadOpen((v) => !v)}
                  >
                    Download
                  </button>
                  {downloadOpen ? (
                    <div
                      role="dialog"
                      aria-label="Download the log"
                      data-download-popover
                      className="absolute left-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-navy-line bg-navy-700 p-3 shadow-xl sm:left-auto sm:right-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className={`${btnSm} disabled:cursor-wait disabled:opacity-50`} disabled={loadingRange} aria-label="Download PDF (opens your browser's print dialog)" onClick={() => window.print()}>PDF</button>
                        <button type="button" className={`${btnSm} disabled:cursor-wait disabled:opacity-50`} disabled={loadingRange} onClick={() => save(`emergency-log-${fileTag}-${stamp}.txt`, toText(downloadPack, downloadNote), "text/plain;charset=utf-8")}>TXT</button>
                        <button type="button" className={`${btnSm} disabled:cursor-wait disabled:opacity-50`} disabled={loadingRange} onClick={() => save(`emergency-log-${fileTag}-${stamp}.csv`, toCSV(downloadPack), "text/csv;charset=utf-8")}>CSV</button>
                      </div>
                      {loadingRange ? <p className="mt-2 text-[11px] text-[#F6F3EA]" data-download-loading>{loadingNote}</p> : null}
                      <p id="em-stories" className="mt-3 font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Version</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-labelledby="em-stories">
                        <FilterChip compact active={storyMode === "latest"} onClick={() => setStoryMode("latest")} count={rangeReady ? latestCount : null} attr={{ "data-stories": "latest" }}>
                          Latest version of each alert
                        </FilterChip>
                        <FilterChip compact active={storyMode === "history"} onClick={() => setStoryMode("history")} count={rangeReady ? historyCount : null} attr={{ "data-stories": "history" }}>
                          Every update (full history)
                        </FilterChip>
                      </div>
                      <p className="mt-2 text-[11px] text-on-dark-muted">Downloads and the PDF use this version (latest is the default). The page still shows every update. PDF opens your print dialog — choose “Save as PDF”. Links stay clickable. Follows the time range and filters (default is the last 24 hours).</p>
                    </div>
                  ) : null}
                </div>
                <a
                  href={xIntentUrl(PAGE_SHARE_TEXT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnSm}
                  aria-label="Share this page on X"
                >
                  Share on X
                </a>
              </div>
            </div>
          </section>
          <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700" data-deep-search aria-label="Deep search">
            <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
            <div className="mx-auto w-full max-w-4xl px-5 pt-1 sm:px-8 md:hidden">
              <button
                type="button"
                data-connect-dots-card
                aria-haspopup="dialog"
                aria-expanded={dotsOpen}
                aria-label="Connect the Dots. Don't Connect the Panic. Tap to enlarge"
                className="flex h-11 w-full items-center gap-2 rounded-xl border border-navy-line bg-navy-700 px-2 text-left hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:h-20 sm:gap-3 sm:p-2"
                onClick={(e) => openDots(e.currentTarget)}
              >
                <img
                  src={DOTS_THUMB}
                  alt=""
                  width={480}
                  height={360}
                  className="h-8 w-10 shrink-0 rounded-md bg-white object-cover sm:h-16 sm:w-24"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-sm font-bold leading-snug text-white sm:hidden">Connect the dots, not the panic</span>
                  <span className="hidden font-serif text-base font-bold leading-snug text-white sm:block">{DOTS_TITLE}</span>
                  <span className="mt-0.5 hidden text-[11px] text-on-dark-muted sm:block">Tap to enlarge</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-gold sm:size-5" aria-hidden />
              </button>
            </div>
            <form role="search" className="mx-auto w-full max-w-4xl px-5 pb-3 pt-2 sm:px-8 sm:pb-4 sm:pt-2.5" onSubmit={(e) => { e.preventDefault(); commitQ(qInput); }}>
              <label htmlFor="em-q" className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">
                Deep search
              </label>
              <div className="mt-1.5 flex w-full items-center gap-3 rounded-xl border-2 border-gold bg-navy-800 px-3.5 shadow-[0_0_0_1px_rgba(245,184,46,0.25)] focus-within:bg-navy-700">
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
              <p className="mt-1.5 text-xs text-[#F6F3EA]/80">
                Searches titles, details, places, and sources. Put a phrase in quotes to match it exactly. With several words, results must contain all of them.
              </p>
              {query.and.length ? (
                <p className="mt-1.5 text-sm text-[#F6F3EA]" data-search-count aria-live="polite">
                  {loadingRange ? <>{loadingNote}{" "}So far, </> : null}
                  {visibleItemCount} {visibleItemCount === 1 ? "alert matches" : "alerts match"} across the current range and filters.
                  {windowKey !== "full" && visibleItemCount <= 5 && !loadingRange ? (
                    <>
                      {" "}
                      {allTimeMatchCount != null ? (
                        <>{allTimeMatchCount} {allTimeMatchCount === 1 ? "match" : "matches"} in all time.{" "}</>
                      ) : null}
                      <button type="button" className="font-semibold text-gold underline" data-search-all-time onClick={() => setSearch({ window: "full" })}>
                        Search all time
                      </button>
                    </>
                  ) : null}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1.5" data-quick-searches role="group" aria-label="Quick searches">
                {quickButtons.map((b, i) => {
                  const active = quickQueryActive(q, b.q);
                  const count = rangeReady ? quickCounts[i] ?? 0 : null;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      data-quick={b.id}
                      aria-pressed={active}
                      onClick={() => commitQ(active ? "" : b.q)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[13px] font-semibold ${active ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-800 text-white hover:border-gold"}`}
                    >
                      {b.label}
                      <span className={`rounded-full px-1 text-[11px] ${active ? "bg-navy-900/15" : "bg-navy-900/60 text-gold"}`} aria-label={count == null ? "count loading" : undefined}>{count ?? "…"}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[11px] text-on-dark-muted">Counts follow the selected time range and filters.</p>
              <p className="mt-1">
                <button
                  type="button"
                  data-acronym-key
                  onClick={() => setAcronymsOpen(true)}
                  className="text-[15px] font-semibold text-gold underline decoration-gold/70 underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-sm"
                >
                  What do these acronyms mean?
                </button>
              </p>
            </form>
          </section>
          <ConnectDotsLightbox open={dotsOpen} onOpenChange={setDotsOpen} triggerRef={dotsTriggerRef} />
          <Dialog.Root open={acronymsOpen} onOpenChange={setAcronymsOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="em-noprint fixed inset-0 z-50 bg-navy-900/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content
                role="dialog"
                aria-modal="true"
                aria-labelledby="em-acronym-title"
                data-acronym-dialog
                className="em-noprint fixed top-1/2 left-1/2 z-50 max-h-[min(92vh,40rem)] w-[min(calc(100vw-1.25rem),36rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-gold/70 bg-navy-700 shadow-2xl focus:outline-none"
              >
                <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
                  <Dialog.Title id="em-acronym-title" className="font-serif text-lg font-bold leading-tight text-white sm:text-xl">
                    What do these acronyms mean?
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label="Close abbreviation list"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-gold hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X className="size-5" aria-hidden />
                  </Dialog.Close>
                </div>
                <div className="overflow-y-auto px-4 pb-5 pt-3 sm:px-5">
                  <p className="mb-3 text-[15px] text-[#F6F3EA]/80 sm:text-sm">Abbreviations used on this page and in the current log.</p>
                  <ul className="space-y-2 text-[15px] leading-relaxed text-[#F6F3EA] sm:text-sm">
                    {ACRONYM_GLOSSARY.map((row) => (
                      <li key={row.abbr}>
                        <span className="font-semibold">{row.name}</span>
                        {" "}({row.abbr})
                      </li>
                    ))}
                  </ul>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <div className="em-log mx-auto w-full max-w-4xl px-5 py-2 sm:px-8 sm:py-4">
          {stale && (
            <p role="status" className="em-noprint mb-3 rounded-md border-2 border-[#ff6b7f] bg-[#C8102E] px-4 py-2 text-sm font-semibold text-white">
              Heads up: this log may be stale. The newest entry is more than 3 hours old.
            </p>
          )}

          <p className="em-noprint mb-2 text-[15px] leading-snug text-on-dark-muted sm:text-sm">Search narrows the alerts below together with these filters.</p>
          <section className="em-noprint rounded-xl border border-navy-line bg-navy-700 p-2.5 sm:p-3" aria-label="Filters">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <div>
                  <p id="em-window" className="font-serif text-[10px] tracking-[0.14em] text-night-muted uppercase">Time</p>
                  <div className="mt-1 flex flex-wrap gap-1.5" role="group" aria-labelledby="em-window">
                    {TIME_WINDOWS.map((w) => (
                      <FilterChip
                        compact
                        key={w.value}
                        active={windowKey === w.value}
                        onClick={() => setSearch({ window: w.value })}
                        count={WINDOW_ITEM_COUNTS[w.value]}
                        attr={{ "data-window": w.value }}
                      >
                        {w.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    data-top-alerts
                    aria-pressed={viewTop}
                    aria-label="Top Alerts, the 10 most recent HIGH alerts from every region"
                    onClick={() => setSearch({ view: viewTop ? "" : "top", region: "All" })}
                    className={`inline-flex min-h-9 items-center gap-1 rounded-full border border-flag bg-flag px-2.5 text-[13px] font-semibold text-white hover:bg-[#a30d25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 ${viewTop ? "ring-2 ring-white ring-offset-2 ring-offset-navy-700" : ""}`}
                  >
                    Top Alerts
                    <span className={`rounded-full px-1.5 text-xs font-bold ${viewTop ? "bg-white text-flag" : "bg-navy-900/40 text-white"}`}>{topAlerts.length}</span>
                  </button>
                </div>
                <div>
                  <p id="em-region" className="font-serif text-[10px] tracking-[0.14em] text-night-muted uppercase">Region</p>
                  <div className="mt-1 flex flex-wrap gap-1.5" role="group" aria-labelledby="em-region">
                    {REGION_FILTERS.map((r) => (
                      <FilterChip
                        compact
                        key={r}
                        active={!viewTop && region === r}
                        onClick={() => setSearch({ region: r, view: "" })}
                        count={rangeReady ? regionCounts[r] ?? 0 : null}
                        attr={{ "data-region": r }}
                      >
                        {r}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-navy-line bg-navy-800 px-3 text-sm font-semibold text-white hover:border-gold"
                  data-more-filters
                  aria-expanded={moreFiltersOpen}
                  onClick={() => setMoreFiltersOpen((v) => !v)}
                >
                  More filters{moreFilterCount ? ` (${moreFilterCount})` : ""}
                  <span className="text-gold" aria-hidden="true">{moreFiltersOpen ? "▴" : "▾"}</span>
                </button>
                <p className="text-xs text-on-dark-muted" aria-live="polite">
                  {viewTop ? (
                    <>The {topAlerts.length} most recent {topAlerts.some((r) => (r.item.severity ?? "").toUpperCase() === "CRITICAL") ? "HIGH and CRITICAL" : "HIGH"} alerts from every region.</>
                  ) : loadingRange ? loadingNote : <>Showing {visibleItemCount} of {timedItemCount} in the {windowLabel(windowKey).toLowerCase()}.</>}
                  {filtersActive ? (
                    <button type="button" onClick={() => setSearch({ region: "All", threat: "", type: "", status: "", source: "", state: "", country: "", q: "", view: "" })} className="ml-2 font-semibold text-gold underline">
                      Clear filters
                    </button>
                  ) : null}
                </p>
              </div>
            </div>

            {moreFiltersOpen ? (
              <div className="mt-3 border-t border-navy-line/80 pt-3" data-more-filters-panel>
                <p className="mb-2 text-[11px] text-on-dark-muted">Time range filters the page and the downloads, and is measured from the newest log entry, not the clock.</p>

                <div>
                  <p id="em-threat" className="font-serif text-[10px] tracking-[0.14em] text-night-muted uppercase">Threat level</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-labelledby="em-threat">
                    <FilterChip compact active={!threat} onClick={() => setSearch({ threat: "" })} count={rangeReady ? countIn("threat") : null} attr={{ "data-threat": "All" }}>
                      All levels
                    </FilterChip>
                    {THREAT_ORDER.filter((k) => k === "Unspecified" ? (threatCounts[k] ?? 0) > 0 || threat === k : true).map((k) => (
                      <FilterChip
                        compact
                        key={k}
                        active={threat === k}
                        onClick={() => setSearch({ threat: threat === k ? "" : k })}
                        count={rangeReady ? threatCounts[k] ?? 0 : null}
                        attr={{ "data-threat": k }}
                      >
                        {k}
                      </FilterChip>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <p id="em-type" className="font-serif text-[10px] tracking-[0.14em] text-night-muted uppercase">Emergency type</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-labelledby="em-type">
                    <FilterChip compact active={!typ} onClick={() => setSearch({ type: "" })} count={rangeReady ? countIn("type") : null} attr={{ "data-type": "All" }}>
                      All types
                    </FilterChip>
                    {TYPE_ORDER.filter((k) => k === "Unspecified" ? (typeCounts[k] ?? 0) > 0 || typ === k : true).map((k) => (
                      <FilterChip
                        compact
                        key={k}
                        active={typ === k}
                        onClick={() => setSearch({ type: typ === k ? "" : k })}
                        count={rangeReady ? typeCounts[k] ?? 0 : null}
                        attr={{ "data-type": k }}
                      >
                        {k}
                      </FilterChip>
                    ))}
                  </div>
                </div>

                <FilterGroup id="em-status" title="Status" hint="From the title prefix (NEW, UPDATE, CONTINUATION, RESOLVED)." activeLabel={status || undefined}>
                  <FilterChip active={!status} onClick={() => setSearch({ status: "" })} count={rangeReady ? countIn("status") : null} attr={{ "data-status": "All" }}>
                    All statuses
                  </FilterChip>
                  {STATUS_ORDER.filter((k) => k === "Unspecified" || k === "Resolved" ? (statusCounts[k] ?? 0) > 0 || status === k : true).map((k) => (
                    <FilterChip
                      key={k}
                      active={status === k}
                      onClick={() => setSearch({ status: status === k ? "" : k })}
                      count={rangeReady ? statusCounts[k] ?? 0 : null}
                      attr={{ "data-status": k }}
                    >
                      {k}
                    </FilterChip>
                  ))}
                </FilterGroup>

                <FilterGroup id="em-source" title="Source" hint="From each alert’s X links and a published handle list; unlisted accounts stay under All sources." activeLabel={source ? SOURCE_LABEL[source as SourceClass] : undefined}>
                  <FilterChip active={!source} onClick={() => setSearch({ source: "" })} count={rangeReady ? countIn("source") : null} attr={{ "data-source": "All" }}>
                    All sources
                  </FilterChip>
                  {SOURCE_ORDER.map((k) => (
                    <FilterChip
                      key={k}
                      active={source === k}
                      onClick={() => setSearch({ source: source === k ? "" : k })}
                      count={rangeReady ? sourceCounts[k] ?? 0 : null}
                      attr={{ "data-source": k }}
                    >
                      {SOURCE_LABEL[k]}
                    </FilterChip>
                  ))}
                </FilterGroup>

                <FilterGroup id="em-state" title="US state" hint="From Location. Virginia, D.C. and Maryland stay at the top." activeLabel={state || undefined}>
                  <FilterChip active={!state} onClick={() => setSearch({ state: "" })} count={rangeReady ? countIn("state") : null} attr={{ "data-state": "All" }}>
                    All states
                  </FilterChip>
                  {shownStates.map((k) => (
                    <FilterChip
                      key={k}
                      active={state === k}
                      onClick={() => setSearch({ state: state === k ? "" : k })}
                      count={rangeReady ? stateCounts[k] ?? 0 : null}
                      attr={{ "data-state": stateSlug(k) }}
                    >
                      {k}
                    </FilterChip>
                  ))}
                  {hiddenStateCount > 0 ? (
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center rounded-full border border-navy-line px-3 text-sm font-semibold text-gold hover:border-gold"
                      data-more="state"
                      aria-expanded={moreStates}
                      onClick={() => setMoreStates((v) => !v)}
                    >
                      {moreStates ? "Less" : `More (${hiddenStateCount})`}
                    </button>
                  ) : null}
                </FilterGroup>

                <FilterGroup id="em-country" title="Country" hint="From Location. Unclear or contested places are left unclassified." activeLabel={country || undefined}>
                  <FilterChip active={!country} onClick={() => setSearch({ country: "" })} count={rangeReady ? countIn("country") : null} attr={{ "data-country": "All" }}>
                    All countries
                  </FilterChip>
                  {shownCountries.map((k) => (
                    <FilterChip
                      key={k}
                      active={country === k}
                      onClick={() => setSearch({ country: country === k ? "" : k })}
                      count={rangeReady ? countryCounts[k] ?? 0 : null}
                      attr={{ "data-country": countrySlug(k) }}
                    >
                      {k}
                    </FilterChip>
                  ))}
                  {hiddenCountryCount > 0 ? (
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center rounded-full border border-navy-line px-3 text-sm font-semibold text-gold hover:border-gold"
                      data-more="country"
                      aria-expanded={moreCountries}
                      onClick={() => setMoreCountries((v) => !v)}
                    >
                      {moreCountries ? "Less" : `More (${hiddenCountryCount})`}
                    </button>
                  ) : null}
                </FilterGroup>
              </div>
            ) : null}
          </section>

          {override && linked && (
            <p role="status" className="em-noprint mt-3 rounded-md border border-gold bg-navy-700 px-4 py-2.5 text-sm text-[#F6F3EA]">
              Showing linked alert (filters, search and time window are paused so it stays visible).{" "}
              <button type="button" onClick={clearLinked} className="font-semibold text-gold underline">Clear</button>
            </p>
          )}

          {linkLoading ? (
            <p role="status" className="em-noprint mt-3 rounded-md border border-gold bg-navy-700 px-4 py-2.5 text-sm text-[#F6F3EA]" data-em-link-loading>
              Loading the linked alert from the archive…
            </p>
          ) : null}

          <div aria-live="polite" className="em-screen-log">
          {loadingRange && shown.length === 0 ? (
            <p className="mt-3 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-sm text-[#F6F3EA]">{loadingNote}</p>
          ) : ENTRIES.length > 0 && shown.length === 0 ? (
            <p className="mt-3 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-[#F6F3EA]">
              No alerts match these filters{q.trim() ? ` for “${q.trim()}”` : ""}.{" "}
              {q.trim() && windowKey !== "full" ? (
                <button type="button" className="font-semibold text-gold underline" data-search-all-time onClick={() => setSearch({ window: "full" })}>Search all time</button>
              ) : (
                <button type="button" className="font-semibold text-gold underline" onClick={() => setSearch({ region: "All", threat: "", type: "", status: "", source: "", state: "", country: "", q: "", window: "24h", view: "" })}>Clear filters</button>
              )}
            </p>
          ) : ENTRIES.length === 0 ? (
            <p className="mt-3 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-[#F6F3EA]">
              No log entries yet. Check back soon — the log is updated regularly.
            </p>
          ) : viewTop ? (
            <ol className="mt-3 space-y-6">
              <li className="em-entry rounded-xl border border-navy-line border-l-4 border-l-flag bg-navy-700 px-5 py-5 text-[#F6F3EA]">
                <h2 className="font-serif text-xl font-semibold text-gold">Top Alerts</h2>
                <p className="mt-1 text-sm text-on-dark-muted">The {topAlerts.length} most recent {topAlerts.some((r) => (r.item.severity ?? "").toUpperCase() === "CRITICAL") ? "HIGH and CRITICAL" : "HIGH"} alerts from every region.</p>
                {topAlerts.length === 0 ? (
                  <p className="mt-4 text-sm">No HIGH alerts in the current log.</p>
                ) : (
                  <ul className="mt-4 list-disc space-y-4 pl-5 text-sm leading-relaxed">
                    {topAlerts.map(({ datetime, section, item: it }, i) => {
                      const id = alertId(it);
                      return (
                        <li key={id || i} id={id || undefined} className="em-alert" data-top-alert-item>
                          {(it.severity || it.title) && (
                            <div className="font-bold">
                              {it.severity && (
                                <span className={`em-sev em-sev-${it.severity} mr-1 inline-block rounded border-2 px-1.5 text-xs font-bold tracking-wide ${SEV_CLASS[it.severity] ?? ""}`}>{it.severity}</span>
                              )}
                              {it.severity && it.title ? " – " : ""}
                              {it.title}
                            </div>
                          )}
                          <div className="text-xs font-semibold uppercase tracking-wide text-on-dark-muted">
                            {section} · <time dateTime={datetime}>{fmtET(datetime)}</time>
                          </div>
                          {details(it).map(([k, v]) => (
                            <div key={k}><span className="font-semibold">{k}:</span> {v}</div>
                          ))}
                          {it.text ? <div>{it.text}</div> : null}
                          {(it.links ?? []).map((l, j) => {
                            const label = l.label ?? "on X";
                            return (
                              <span key={j}>{" "}<a href={l.url} target="_blank" rel="noreferrer" className="font-semibold text-gold underline">{label}</a></span>
                            );
                          })}
                          {(it.title ?? it.text)?.trim() ? (
                            <div className="em-noprint mt-1">
                              <a
                                href={xIntentUrl(alertShareText(it, section), alertShareUrl(it))}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-gold underline"
                                aria-label={`Share on X: ${alertShareText(it, section)}`}
                              >
                                Share on X
                              </a>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            </ol>
          ) : (
            <ol className="mt-3 space-y-6">
              {shown.map((e, idx) => (
                <li key={e.datetime} className={`em-entry ${idx > 0 && !showEarlier && e.datetime !== linked?.datetime ? "hidden print:block" : ""} rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-700 px-5 py-5 text-[#F6F3EA]`}>
                  <h2 className="font-serif text-xl font-semibold text-gold"><time dateTime={e.datetime}>{fmtET(e.datetime)}</time></h2>
                  {/* Hidden earlier windows are not rendered until "Show earlier updates" (they were display:none before; print uses .em-print-log). */}
                  {(idx === 0 || showEarlier || e.datetime === linked?.datetime) && e.sections.map(([name, items]) => (
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
                            <div className="text-xs font-semibold uppercase tracking-wide text-on-dark-muted">
                              <time dateTime={e.datetime}>{fmtET(e.datetime)}</time>
                            </div>
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
          {earlierCount > 0 && !viewTop && (
            <div className="em-noprint mt-6">
              <button type="button" aria-expanded={showEarlier} onClick={() => setShowEarlier((v) => !v)} className={btn}>
                {showEarlier ? "Hide earlier updates" : `Show earlier updates (${earlierCount})`}
              </button>
            </div>
          )}
          </div>

          <div className="em-print-log" aria-hidden="true">
            <p className="em-print-title">Emergency Monitor – Live Log</p>
            <p className="em-print-note">{downloadNote}{newest ? ` Last updated ${fmtET(newest)}.` : ""} {countPackedItems(downloadPack)} alerts.</p>
            {downloadPack.length === 0 ? (
              <p>No alerts in this selection.</p>
            ) : (
              <ol>
                {downloadPack.map((e) => (
                  <li key={e.datetime} className="em-print-window">
                    <h2><time dateTime={e.datetime}>{fmtET(e.datetime)}</time></h2>
                    {e.sections.map(([name, items]) => (
                      <section key={name}>
                        <h3>{name}</h3>
                        <ul>
                          {items.map((it, i) => (
                            <li key={alertId(it) || i}>
                              {(it.severity || it.title) && (
                                <div>
                                  {it.severity && (
                                    <span className={`em-sev em-sev-${it.severity} mr-1 inline-block rounded border px-1 text-[7pt] font-bold tracking-wide ${SEV_CLASS[it.severity] ?? ""}`}>{it.severity}</span>
                                  )}
                                  {it.severity && it.title ? " – " : ""}
                                  {it.title}
                                </div>
                              )}
                              {details(it).map(([k, v]) => (
                                <div key={k} className="em-print-meta"><span className="font-semibold">{k}:</span> {v}</div>
                              ))}
                              {it.text ? <div className="em-print-meta">{it.text}</div> : null}
                              {(it.links ?? []).length ? (
                                <div className="em-print-meta">
                                  {(it.links ?? []).map((l, j) => (
                                    <span key={j}>{j > 0 ? " · " : ""}<a href={l.url}>{l.label ?? "on X"}</a></span>
                                  ))}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </LegacyV4>
    </SiteShell>
  );
}
