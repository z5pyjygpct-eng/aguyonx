import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import log from "@/content/emergency-log.json";
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
  regions?: Partial<Record<RawRegion, LogItem[]>>;
  trending?: LogItem[];
  threats?: LogItem[];
};
const RAW_REGIONS = ["America", "Europe", "Russia", "Middle East", "Africa", "South America"] as const;
type RawRegion = (typeof RAW_REGIONS)[number];

const ENTRIES: LogEntry[] = [...((log as { entries: LogEntry[] }).entries ?? [])].sort(
  (a, b) => Date.parse(b.datetime) - Date.parse(a.datetime),
);

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

function displaySection(raw: string, it: LogItem) {
  if (raw !== "America") return raw;
  return AMERICA_PLACE_LABEL[classifyAmericaLocation(it.location)];
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
function displaySections(e: LogEntry): [string, LogItem[]][] {
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
};

const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: "2h", label: "Last 2 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "full", label: "All" },
];

/** Compare each entry window to the newest entry, not wall-clock now, so a given log always yields the same 24h/7d slice (and the same default PDF) until the next 2-hour update. */
const NEWEST_MS = Date.parse(ENTRIES[0]?.datetime ?? "") || 0;
const WINDOW_MS: Record<TimeWindow, number> = { "2h": 2 * 60 * 60 * 1000, "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 60 * 1000, full: Infinity };

function inTimeWindow(e: LogEntry, w: TimeWindow) {
  if (w === "full") return true;
  const t = Date.parse(e.datetime);
  if (Number.isNaN(t) || !NEWEST_MS) return true;
  return NEWEST_MS - t <= WINDOW_MS[w];
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

function statesOf(it: LogItem, section: string) {
  return extractUsStates(it.location, section);
}
function countriesOf(it: LogItem, section: string) {
  return extractCountries(it.location, section);
}

function matchesSearch(it: LogItem, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = [it.title, it.location, it.summary].filter(Boolean).join("\n").toLowerCase();
  return hay.includes(s);
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

const REGION_FILTERS = ["All", "USA", "Canada", "Mexico", "Other North America", "Europe", "Russia", "Middle East", "Africa", "South America"] as const;

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

function FilterChip({ active, onClick, count, children, attr }: { active: boolean; onClick: () => void; count: number; children: ReactNode; attr?: Record<string, string> }) {
  return (
    <button
      type="button"
      {...attr}
      data-count={count}
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold ${active ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-800 text-white hover:border-gold"}`}
    >
      {children}
      <span className={`rounded-full px-1.5 text-xs ${active ? "bg-navy-900/15" : "bg-navy-900/60 text-gold"}`}>{count}</span>
    </button>
  );
}

function FilterGroup({ id, title, hint, activeLabel, defaultOpen, children }: { id: string; title: string; hint?: string; activeLabel?: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details className="mt-4 border-t border-navy-line/80 pt-3" defaultOpen={Boolean(defaultOpen) || Boolean(activeLabel)}>
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

  const setSearch = (patch: Partial<Record<keyof EmSearch, string>>) => {
    const next = { window: windowKey, region, threat, type: typ, status, source, state, country, q, ...patch };
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
    navigate({ search: clean, replace: true, resetScroll: false });
  };

  const [showEarlier, setShowEarlier] = useState(false);
  const [storyMode, setStoryMode] = useState<"latest" | "history">("latest");
  const [moreStates, setMoreStates] = useState(false);
  const [moreCountries, setMoreCountries] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const stamp = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
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
  useEffect(() => {
    setShowEarlier(false);
    setMoreStates(false);
    setMoreCountries(false);
  }, [windowKey, region, threat, typ, status, source, state, country, q]);

  const linked = activeHash ? ALERT_BY_ID.get(activeHash) : undefined;
  const override = Boolean(linked);

  const timedEntries = useMemo(() => ENTRIES.filter((e) => inTimeWindow(e, windowKey)), [windowKey]);

  type Skip = "region" | "threat" | "type" | "status" | "source" | "state" | "country";
  const matchesItem = (section: string, it: LogItem, skip?: Skip) => {
    if (!matchesSearch(it, q)) return false;
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
  }, [filtered, linked]);

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
  const filtersActive = region !== "All" || Boolean(threat) || Boolean(typ) || Boolean(status) || Boolean(source) || Boolean(state) || Boolean(country) || Boolean(q.trim());

  const downloadNote = `Selection: ${windowLabel(windowKey)}${region !== "All" ? `; region ${region}` : ""}${threat ? `; threat ${threat}` : ""}${typ ? `; type ${typ}` : ""}${status ? `; status ${status}` : ""}${source ? `; source ${SOURCE_LABEL[source as SourceClass]}` : ""}${state ? `; state ${state}` : ""}${country ? `; country ${country}` : ""}${q.trim() ? `; search “${q.trim()}”` : ""}; ${storyMode === "latest" ? "latest version of each alert" : "every update (full history)"}.`;
  const fileTag = [windowKey, region !== "All" ? region.toLowerCase().replace(/\s+/g, "-") : "", threat.toLowerCase(), typ.toLowerCase().replace(/\s+/g, "-"), status ? statusParam(status) : "", source, state ? stateSlug(state) : "", country ? countrySlug(country) : "", q.trim() ? "search" : "", storyMode].filter(Boolean).join("-");

  useEffect(() => {
    if (!activeHash) return;
    const meta = ALERT_BY_ID.get(activeHash);
    if (!meta) return;
    const idx = shown.findIndex((e) => e.datetime === meta.datetime);
    if (idx > 0 && !showEarlier) {
      setShowEarlier(true);
      return;
    }
    let cancel = false;
    const run = () => {
      if (cancel) return;
      const el = document.getElementById(activeHash);
      if (!el) return;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
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

  const newest = ENTRIES[0]?.datetime;
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
        </div>
        <div className="em-log mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
          {newest && (
            <p className="em-noprint mb-4 text-sm text-[#F6F3EA]">
              <span className="font-semibold">Last updated:</span> <time dateTime={newest}>{fmtET(newest)}</time>
            </p>
          )}
          {stale && (
            <p role="status" className="em-noprint mb-6 rounded-md border-2 border-[#ff6b7f] bg-[#C8102E] px-4 py-3 text-sm font-semibold text-white">
              Heads up: this log may be stale. The newest entry is more than 3 hours old.
            </p>
          )}
          <div className="em-noprint" data-download-controls>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-3" aria-label="Download the log">
                <span className="text-sm font-semibold text-on-dark-muted">Download:</span>
                <button type="button" className={btn} aria-label="Download PDF (opens your browser's print dialog)" onClick={() => window.print()}>PDF</button>
                <button type="button" className={btn} onClick={() => save(`emergency-log-${fileTag}-${stamp}.txt`, toText(downloadPack, downloadNote), "text/plain;charset=utf-8")}>TXT</button>
                <button type="button" className={btn} onClick={() => save(`emergency-log-${fileTag}-${stamp}.csv`, toCSV(downloadPack), "text/csv;charset=utf-8")}>CSV</button>
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
            <div className="mt-3">
              <p id="em-stories" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Download version</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="em-stories">
                <FilterChip active={storyMode === "latest"} onClick={() => setStoryMode("latest")} count={latestCount} attr={{ "data-stories": "latest" }}>
                  Latest version of each alert
                </FilterChip>
                <FilterChip active={storyMode === "history"} onClick={() => setStoryMode("history")} count={historyCount} attr={{ "data-stories": "history" }}>
                  Every update (full history)
                </FilterChip>
              </div>
              <p className="mt-2 text-xs text-on-dark-muted">Downloads and the PDF use this version (latest is the default). The page still shows every update.</p>
            </div>
            <p className="mt-2 text-xs text-on-dark-muted">PDF opens your browser's print dialog — choose "Save as PDF". Links stay clickable. Downloads follow the time range and filters (default is the last 24 hours, not the full log).</p>
          </div>

          <section className="em-noprint mt-6 rounded-xl border border-navy-line bg-navy-700 p-4 sm:p-5" aria-label="Filters">
            <form role="search" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="em-q" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">
                Search title, location, or summary
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-navy-line bg-navy-800 px-3 focus-within:border-gold">
                <Search className="size-4 shrink-0 text-gold" aria-hidden />
                <input
                  id="em-q"
                  type="search"
                  value={q}
                  onChange={(e) => setSearch({ q: e.target.value })}
                  placeholder="outage, Mexico City, cyber"
                  className="h-12 w-full min-w-0 bg-transparent text-base text-white placeholder:text-night-muted focus:outline-none"
                />
              </div>
            </form>

            <div className="mt-4">
              <p id="em-window" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Time range</p>
              <p className="mt-1 text-xs text-on-dark-muted">Filters the page and the downloads; measured from the newest log entry, not the clock.</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="em-window">
                {TIME_WINDOWS.map((w) => (
                  <FilterChip
                    key={w.value}
                    active={windowKey === w.value}
                    onClick={() => setSearch({ window: w.value })}
                    count={ENTRIES.filter((e) => inTimeWindow(e, w.value)).reduce((n, e) => n + displaySections(e).reduce((m, [, items]) => m + items.length, 0), 0)}
                    attr={{ "data-window": w.value }}
                  >
                    {w.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p id="em-region" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Region</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="em-region">
                {REGION_FILTERS.map((r) => (
                  <FilterChip
                    key={r}
                    active={region === r}
                    onClick={() => setSearch({ region: r })}
                    count={regionCounts[r] ?? 0}
                    attr={{ "data-region": r }}
                  >
                    {r}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p id="em-threat" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Threat level</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="em-threat">
                <FilterChip active={!threat} onClick={() => setSearch({ threat: "" })} count={countIn("threat")} attr={{ "data-threat": "All" }}>
                  All levels
                </FilterChip>
                {THREAT_ORDER.filter((k) => k === "Unspecified" ? (threatCounts[k] ?? 0) > 0 || threat === k : true).map((k) => (
                  <FilterChip
                    key={k}
                    active={threat === k}
                    onClick={() => setSearch({ threat: threat === k ? "" : k })}
                    count={threatCounts[k] ?? 0}
                    attr={{ "data-threat": k }}
                  >
                    {k}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p id="em-type" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Emergency type</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="em-type">
                <FilterChip active={!typ} onClick={() => setSearch({ type: "" })} count={countIn("type")} attr={{ "data-type": "All" }}>
                  All types
                </FilterChip>
                {TYPE_ORDER.filter((k) => k === "Unspecified" ? (typeCounts[k] ?? 0) > 0 || typ === k : true).map((k) => (
                  <FilterChip
                    key={k}
                    active={typ === k}
                    onClick={() => setSearch({ type: typ === k ? "" : k })}
                    count={typeCounts[k] ?? 0}
                    attr={{ "data-type": k }}
                  >
                    {k}
                  </FilterChip>
                ))}
              </div>
            </div>

            <FilterGroup id="em-status" title="Status" hint="From the title prefix (NEW, UPDATE, CONTINUATION, RESOLVED)." activeLabel={status || undefined} defaultOpen={false}>
              <FilterChip active={!status} onClick={() => setSearch({ status: "" })} count={countIn("status")} attr={{ "data-status": "All" }}>
                All statuses
              </FilterChip>
              {STATUS_ORDER.filter((k) => k === "Unspecified" || k === "Resolved" ? (statusCounts[k] ?? 0) > 0 || status === k : true).map((k) => (
                <FilterChip
                  key={k}
                  active={status === k}
                  onClick={() => setSearch({ status: status === k ? "" : k })}
                  count={statusCounts[k] ?? 0}
                  attr={{ "data-status": k }}
                >
                  {k}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup id="em-source" title="Source" hint="From each alert’s X links and a published handle list; unlisted accounts stay under All sources." activeLabel={source ? SOURCE_LABEL[source as SourceClass] : undefined} defaultOpen={false}>
              <FilterChip active={!source} onClick={() => setSearch({ source: "" })} count={countIn("source")} attr={{ "data-source": "All" }}>
                All sources
              </FilterChip>
              {SOURCE_ORDER.map((k) => (
                <FilterChip
                  key={k}
                  active={source === k}
                  onClick={() => setSearch({ source: source === k ? "" : k })}
                  count={sourceCounts[k] ?? 0}
                  attr={{ "data-source": k }}
                >
                  {SOURCE_LABEL[k]}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup id="em-state" title="US state" hint="From Location. Virginia, D.C. and Maryland stay at the top." activeLabel={state || undefined} defaultOpen={false}>
              <FilterChip active={!state} onClick={() => setSearch({ state: "" })} count={countIn("state")} attr={{ "data-state": "All" }}>
                All states
              </FilterChip>
              {shownStates.map((k) => (
                <FilterChip
                  key={k}
                  active={state === k}
                  onClick={() => setSearch({ state: state === k ? "" : k })}
                  count={stateCounts[k] ?? 0}
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

            <FilterGroup id="em-country" title="Country" hint="From Location. Unclear or contested places are left unclassified." activeLabel={country || undefined} defaultOpen={false}>
              <FilterChip active={!country} onClick={() => setSearch({ country: "" })} count={countIn("country")} attr={{ "data-country": "All" }}>
                All countries
              </FilterChip>
              {shownCountries.map((k) => (
                <FilterChip
                  key={k}
                  active={country === k}
                  onClick={() => setSearch({ country: country === k ? "" : k })}
                  count={countryCounts[k] ?? 0}
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

            <p className="mt-4 text-sm text-on-dark-muted" aria-live="polite">
              Showing {visibleItemCount} of {timedItemCount} alerts in the {windowLabel(windowKey).toLowerCase()}.
              {filtersActive ? (
                <button type="button" onClick={() => setSearch({ region: "All", threat: "", type: "", status: "", source: "", state: "", country: "", q: "" })} className="ml-3 font-semibold text-gold underline">
                  Clear filters
                </button>
              ) : null}
            </p>
          </section>

          {override && linked && (
            <p role="status" className="em-noprint mt-4 rounded-md border border-gold bg-navy-700 px-4 py-3 text-sm text-[#F6F3EA]">
              Showing linked alert (filters, search and time window are paused so it stays visible).{" "}
              <button type="button" onClick={clearLinked} className="font-semibold text-gold underline">Clear</button>
            </p>
          )}

          <div aria-live="polite" className="em-screen-log">
          {ENTRIES.length > 0 && shown.length === 0 ? (
            <p className="mt-8 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-[#F6F3EA]">
              No alerts match these filters{q.trim() ? ` for “${q.trim()}”` : ""}.{" "}
              <button type="button" className="font-semibold text-gold underline" onClick={() => setSearch({ region: "All", threat: "", type: "", status: "", source: "", state: "", country: "", q: "", window: "24h" })}>Clear filters</button>
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
                  {e.sections.map(([name, items]) => (
                    <section key={name} className="mt-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide">{name}</h3>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                        {items.map((it, i) => {
                          const id = alertId(it);
                          return (
                          <li key={id || i} id={id || undefined} className="em-alert">
                            {(it.severity || it.title) && (
                              <div className="font-bold">
                                {it.severity && (
                                  <span className={`em-sev em-sev-${it.severity} mr-1 inline-block rounded border-2 px-1.5 text-xs font-bold tracking-wide ${SEV_CLASS[it.severity] ?? ""}`}>{it.severity}</span>
                                )}
                                {it.severity && it.title ? " – " : ""}
                                {it.title}
                              </div>
                            )}
                            {details(it).map(([k, v]) => (
                              <div key={k}><span className="font-semibold">{k}:</span> {v}</div>
                            ))}
                            {it.text}
                            {(it.links ?? []).map((l, j) => (
                              <span key={j}>{" "}<a href={l.url} target="_blank" rel="noreferrer" className="font-semibold text-gold underline">{l.label ?? "on X"}</a></span>
                            ))}
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
