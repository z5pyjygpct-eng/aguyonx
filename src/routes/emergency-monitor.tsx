import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import log from "@/content/emergency-log.json";

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
  MONITORING: "border-[#475569] bg-[#64748b] text-white",
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

export const Route = createFileRoute("/emergency-monitor")({
  head: () => ({ meta: [{ title: "Emergency Monitor – Live Log | aguyonx.com" }] }),
  component: EmergencyMonitorPage,
});

const btn = "inline-flex min-h-11 items-center rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900";

type Filter = "All" | Region;
const FILTERS: Filter[] = ["All", ...REGIONS];
function visibleSections(e: LogEntry, f: Filter): [string, LogItem[]][] {
  // Trending and Threats are cross-region, so they show only under "All".
  if (f === "All") return sections(e);
  const items = e.regions?.[f];
  return items?.length ? [[f, items]] : [];
}

function EmergencyMonitorPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const shown = ENTRIES.filter((e) => visibleSections(e, filter).length > 0);
  const stamp = new Date().toISOString().slice(0, 10);
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
  .em-log .em-sev-MONITORING { background: #64748b !important; color: #fff !important; border-color: #475569 !important; }
}`}</style>
        <div className="em-noprint">
          <LegacyHero trail={[{ label: "Emergency Monitor" }]} kicker="Live log" title="Emergency Monitor – Live Log" width="max-w-4xl">
            <p className="max-w-xl text-lg">This is a live log, updated about every 2 hours. Newest entries are at the top.</p>
          </LegacyHero>
        </div>
        <div className="em-log mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
          <h1 className="hidden font-serif text-2xl font-semibold print:block">Emergency Monitor – Live Log</h1>
          <div className="em-noprint flex flex-wrap items-center gap-3" aria-label="Download the log">
            <span className="text-sm font-semibold text-on-dark-muted">Download:</span>
            <button type="button" className={btn} onClick={() => window.print()}>PDF</button>
            <button type="button" className={btn} onClick={() => save(`emergency-log-${stamp}.txt`, toText(), "text/plain;charset=utf-8")}>Text</button>
            <button type="button" className={btn} onClick={() => save(`emergency-log-${stamp}.csv`, toCSV(), "text/csv;charset=utf-8")}>CSV</button>
          </div>
          <p className="em-noprint mt-2 text-xs text-on-dark-muted">PDF opens your browser's print dialog — choose "Save as PDF". Links stay clickable.</p>

          <div className="em-noprint mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by region">
            {FILTERS.map((f) => {
              const on = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f)}
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${on ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-700 text-[#F6F3EA] hover:border-gold"}`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {ENTRIES.length > 0 && shown.length === 0 ? (
            <p className="mt-8 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-[#F6F3EA]">
              No {filter} items in the log right now. <button type="button" className="font-semibold text-gold underline" onClick={() => setFilter("All")}>Show all</button>
            </p>
          ) : ENTRIES.length === 0 ? (
            <p className="mt-8 rounded-xl border border-navy-line bg-navy-700 px-5 py-6 text-[#F6F3EA]">
              No log entries yet. Check back soon — the log is updated about every 2 hours.
            </p>
          ) : (
            <ol className="mt-8 space-y-6">
              {shown.map((e) => (
                <li key={e.datetime} className="em-entry rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-700 px-5 py-5 text-[#F6F3EA]">
                  <h2 className="font-serif text-xl font-semibold text-gold"><time dateTime={e.datetime}>{fmtET(e.datetime)}</time></h2>
                  {visibleSections(e, filter).map(([name, items]) => (
                    <section key={name} className="mt-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide">{name}</h3>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                        {items.map((it, i) => (
                          <li key={i}>
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
      </LegacyV4>
    </SiteShell>
  );
}
