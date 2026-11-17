import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import log from "@/content/emergency-log.json";
import { AMERICA_PLACE_LABEL, classifyAmericaLocation } from "@/lib/emergency-place";

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

export type TimeWindow = "24h" | "7d" | "full";
export type EmSearch = {
  window?: TimeWindow;
  region?: string;
  threat?: string;
  type?: string;
  q?: string;
};

const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "full", label: "Full log" },
];

/** Compare each entry window to the newest entry, not wall-clock now, so a given log always yields the same 24h/7d slice (and the same default PDF) until the next 2-hour update. */
const NEWEST_MS = Date.parse(ENTRIES[0]?.datetime ?? "") || 0;
const WINDOW_MS: Record<TimeWindow, number> = { "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 60 * 1000, full: Infinity };

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
function matchesRegion(section: string, region: string) {
  if (!region || region === "All") return true;
  return section === region;
}

export const Route = createFileRoute("/emergency-monitor")({
  validateSearch: (s: Record<string, unknown>): EmSearch => {
    const w = s.window;
    const window: TimeWindow | undefined = w === "7d" || w === "full" || w === "24h" ? w : undefined;
    return {
      ...(window && window !== "24h" ? { window } : {}),
      ...(typeof s.region === "string" && s.region && s.region !== "All" ? { region: s.region } : {}),
      ...(typeof s.threat === "string" && s.threat ? { threat: s.threat } : {}),
      ...(typeof s.type === "string" && s.type ? { type: s.type } : {}),
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

function EmergencyMonitorPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const windowKey: TimeWindow = search.window ?? "24h";
  const region = search.region && search.region !== "All" ? search.region : "All";
  const threat = search.threat ?? "";
  const typ = search.type ?? "";
  const q = search.q ?? "";

  const setSearch = (patch: Partial<Record<keyof EmSearch, string>>) => {
    const next = { window: windowKey, region, threat, type: typ, q, ...patch };
    const clean: EmSearch = {};
    if (next.window && next.window !== "24h") clean.window = next.window as TimeWindow;
    if (next.region && next.region !== "All") clean.region = next.region;
    if (next.threat) clean.threat = next.threat;
    if (next.type) clean.type = next.type;
    if (next.q?.trim()) clean.q = next.q.trim().slice(0, 120);
    navigate({ search: clean, replace: true, resetScroll: false });
  };

  const [showEarlier, setShowEarlier] = useState(false);
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
  }, [windowKey, region, threat, typ, q]);

  const linked = activeHash ? ALERT_BY_ID.get(activeHash) : undefined;
  const override = Boolean(linked);

  const timedEntries = useMemo(() => ENTRIES.filter((e) => inTimeWindow(e, windowKey)), [windowKey]);

  const matchesItem = (section: string, it: LogItem, skip?: "region" | "threat" | "type") => {
    if (!matchesSearch(it, q)) return false;
    if (skip !== "region" && !matchesRegion(section, region)) return false;
    if (skip !== "threat" && !matchesThreat(it, threat)) return false;
    if (skip !== "type" && !matchesType(it, typ)) return false;
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
    [timedEntries, region, threat, typ, q],
  );

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

  const countIn = (skip?: "region" | "threat" | "type") =>
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
  }, [timedEntries, threat, typ, q]);

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
  }, [timedEntries, region, typ, q]);

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
  }, [timedEntries, region, threat, q]);

  const visibleItemCount = filtered.reduce((n, e) => n + e.sections.reduce((m, [, items]) => m + items.length, 0), 0);
  const timedItemCount = timedEntries.reduce((n, e) => n + displaySections(e).reduce((m, [, items]) => m + items.length, 0), 0);
  const filtersActive = region !== "All" || Boolean(threat) || Boolean(typ) || Boolean(q.trim());

  const downloadNote = `Selection: ${windowLabel(windowKey)}${region !== "All" ? `; region ${region}` : ""}${threat ? `; threat ${threat}` : ""}${typ ? `; type ${typ}` : ""}${q.trim() ? `; search “${q.trim()}”` : ""}.`;
  const fileTag = [windowKey, region !== "All" ? region.toLowerCase().replace(/\s+/g, "-") : "", threat.toLowerCase(), typ.toLowerCase().replace(/\s+/g, "-"), q.trim() ? "search" : ""].filter(Boolean).join("-");

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
          <p aria-hidden="true" className="hidden font-serif text-2xl font-semibold print:block">Emergency Monitor – Live Log</p>
          <p aria-hidden="true" className="hidden text-sm print:block">{downloadNote}</p>
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
              <button type="button" className={btn} onClick={() => save(`emergency-log-${fileTag}-${stamp}.txt`, toText(filtered, downloadNote), "text/plain;charset=utf-8")}>TXT</button>
              <button type="button" className={btn} onClick={() => save(`emergency-log-${fileTag}-${stamp}.csv`, toCSV(filtered), "text/csv;charset=utf-8")}>CSV</button>
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
          <p className="em-noprint mt-2 text-xs text-on-dark-muted">PDF opens your browser's print dialog — choose "Save as PDF". Links stay clickable. Downloads use the time window, filters and search below (default is the last 24 hours, not the full log).</p>

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
              <p id="em-window" className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Time window</p>
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

            <p className="mt-4 text-sm text-on-dark-muted" aria-live="polite">
              Showing {visibleItemCount} of {timedItemCount} alerts in the {windowLabel(windowKey).toLowerCase()}.
              {filtersActive ? (
                <button type="button" onClick={() => setSearch({ region: "All", threat: "", type: "", q: "" })} className="ml-3 font-semibold text-gold underline">
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

          <div aria-live="polite">
          {ENTRIES.length > 0 && shown.length === 0 ? (
            <p className="mt-8 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-[#F6F3EA]">
              No alerts match these filters{q.trim() ? ` for “${q.trim()}”` : ""}.{" "}
              <button type="button" className="font-semibold text-gold underline" onClick={() => setSearch({ region: "All", threat: "", type: "", q: "", window: "24h" })}>Clear filters</button>
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
        </div>
      </LegacyV4>
    </SiteShell>
  );
}
