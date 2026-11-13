import { useState, type ReactNode } from "react";
import { ExternalLink, Link2 } from "lucide-react";

export const PARTY_NAME: Record<string, string> = { D: "Democrat", R: "Republican", I: "Independent" };
export const PARTY_COLOR: Record<string, string> = { R: "#FF7A85", D: "#7FA7FF" };
export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export function dateLabel(iso: string | null | undefined) {
  if (!iso) return "Date not listed";
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
export const yearOf = (iso: string | null | undefined) => (iso ? iso.slice(0, 4) : "");

export function Card({ id, title, kicker, children, source, share }: { id?: string; title: string; kicker?: string; children: ReactNode; source?: ReactNode; share?: boolean }) {
  return (
    <section id={id} className="min-w-0 scroll-mt-28 rounded-xl border border-navy-line bg-navy-900/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {kicker ? <p className="text-[11px] font-bold tracking-[0.14em] text-gold uppercase">{kicker}</p> : null}
          <h3 className="font-serif text-xl leading-tight font-bold uppercase">{title}</h3>
        </div>
        {share && id ? <ShareButton hash={id} /> : null}
      </div>
      <div className="mt-4 min-w-0">{children}</div>
      {source ? <div className="mt-4 border-l-2 border-gold/60 pl-3 text-xs leading-relaxed text-night-muted">{source}</div> : null}
    </section>
  );
}

export function ShareButton({ hash, label = "Copy link to this chart" }: { hash?: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={() => {
      const u = new URL(window.location.href);
      if (hash) u.hash = hash;
      void navigator.clipboard?.writeText(u.toString()).then(() => { setDone(true); setTimeout(() => setDone(false), 1800); });
    }} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-navy-line px-2.5 text-xs font-semibold text-on-dark-muted hover:border-gold hover:text-white">
      <Link2 aria-hidden className="size-3.5" />{done ? "Link copied" : label}
    </button>
  );
}

export function Ext({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold ${className}`}>
      {children}<ExternalLink aria-hidden className="ml-0.5 inline size-3 align-[-1px]" />
    </a>
  );
}

export function NotCollected({ what, why }: { what: string; why: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-navy-line bg-navy-800/60 p-4 text-sm">
      <p className="font-bold tracking-wide text-white uppercase">Not collected yet</p>
      <p className="mt-1 text-on-dark-muted"><span className="font-semibold text-white">{what}.</span> {why}</p>
    </div>
  );
}

export function Stat({ k, v, sub }: { k: string; v: ReactNode; sub?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-navy-line bg-navy-800/70 px-3 py-2.5">
      <dt className="text-[11px] leading-tight font-bold tracking-wide text-night-muted uppercase">{k}</dt>
      <dd className="mt-1 font-serif text-2xl leading-tight font-bold tabular-nums">{v}</dd>
      {sub ? <dd className="text-xs text-on-dark-muted">{sub}</dd> : null}
    </div>
  );
}

/** Horizontal bars. Each row can carry its own source link. */
export function BarList({ rows, color = "#F5B82E", format = (n: number) => n.toLocaleString("en-US"), empty = "Nothing in this view." }: {
  rows: { label: ReactNode; value: number; note?: ReactNode; href?: string; key: string }[]; color?: string; format?: (n: number) => string; empty?: string;
}) {
  if (!rows.length) return <p className="text-sm text-on-dark-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{r.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{r.href ? <Ext href={r.href}>{format(r.value)}</Ext> : format(r.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-navy-800"><div className="h-2 rounded-full" style={{ width: `${(100 * r.value) / max}%`, background: color }} /></div>
          {r.note ? <div className="mt-0.5 text-xs text-night-muted">{r.note}</div> : null}
        </li>
      ))}
    </ul>
  );
}

/** Stacked horizontal bars (e.g. Yea / Nay per category). */
export function StackBars({ rows, keys }: { rows: { label: string; key: string; parts: Record<string, number> }[]; keys: { k: string; label: string; color: string }[] }) {
  if (!rows.length) return <p className="text-sm text-on-dark-muted">Nothing in this view.</p>;
  const max = Math.max(...rows.map((r) => keys.reduce((s, k) => s + (r.parts[k.k] ?? 0), 0)), 1);
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-on-dark-muted">
        {keys.map((k) => <span key={k.k} className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-sm" style={{ background: k.color }} />{k.label}</span>)}
      </div>
      <ul className="space-y-2">
        {rows.map((r) => {
          const tot = keys.reduce((s, k) => s + (r.parts[k.k] ?? 0), 0);
          return (
            <li key={r.key} className="min-w-0">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{r.label}</span>
                <span className="shrink-0 text-xs tabular-nums text-on-dark-muted">{keys.map((k) => `${(r.parts[k.k] ?? 0).toLocaleString("en-US")} ${k.label}`).join(" · ")}</span>
              </div>
              <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-navy-800" style={{ width: `${Math.max(4, (100 * tot) / max)}%` }} role="img" aria-label={`${r.label}: ${keys.map((k) => `${r.parts[k.k] ?? 0} ${k.label}`).join(", ")}`}>
                {keys.map((k) => (r.parts[k.k] ? <div key={k.k} style={{ width: `${(100 * r.parts[k.k]) / tot}%`, background: k.color }} /> : null))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Vertical columns over time. Labels are short (year or month). */
export function Columns({ cols, color = "#F5B82E", format = (n: number) => n.toLocaleString("en-US"), highlight }: { cols: { key: string; label: string; value: number; title: string }[]; color?: string; format?: (n: number) => string; highlight?: string }) {
  if (!cols.length) return <p className="text-sm text-on-dark-muted">Nothing in this view.</p>;
  const max = Math.max(...cols.map((c) => c.value), 1);
  const every = cols.length > 24 ? 6 : cols.length > 12 ? 3 : 1;
  return (
    <div className="min-w-0">
      <div className="flex h-36 items-end gap-[2px] border-b border-navy-line sm:gap-1" role="img" aria-label={cols.map((c) => `${c.title}: ${format(c.value)}`).join("; ")}>
        {cols.map((c) => (
          <div key={c.key} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end" title={`${c.title}: ${format(c.value)}`}>
            {cols.length <= 12 && c.value > 0 ? <span className="mb-0.5 truncate text-center text-[10px] tabular-nums text-on-dark-muted">{format(c.value)}</span> : null}
            <div className="w-full rounded-t-sm" style={{ height: `${(100 * c.value) / max}%`, minHeight: c.value > 0 ? 2 : 0, background: color, opacity: highlight && highlight !== c.key ? 0.35 : 1 }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px] sm:gap-1">
        {cols.map((c, i) => <div key={c.key} className="min-w-0 flex-1 overflow-visible text-center text-[10px] whitespace-nowrap text-night-muted">{i % every === 0 ? c.label : ""}</div>)}
      </div>
    </div>
  );
}

export function MoreList<T>({ items, first = 8, render, empty }: { items: T[]; first?: number; render: (x: T, i: number) => ReactNode; empty: ReactNode }) {
  const [all, setAll] = useState(false);
  if (!items.length) return <>{empty}</>;
  const shown = all ? items : items.slice(0, first);
  return (
    <div>
      <ul className="divide-y divide-navy-line/60">{shown.map((x, i) => <li key={i} className="py-2.5 first:pt-0">{render(x, i)}</li>)}</ul>
      {items.length > first ? (
        <button type="button" onClick={() => setAll(!all)} className="mt-2 min-h-9 text-sm font-semibold text-gold underline underline-offset-4">
          {all ? "Show fewer" : `Show all ${items.length.toLocaleString("en-US")}`}
        </button>
      ) : null}
    </div>
  );
}
