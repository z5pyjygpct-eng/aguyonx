/**
 * Emergency Monitor data store. The page bundles only a manifest of every window plus the
 * newest window (virtual:emergency-head, built by scripts/build-emergency-data.mjs). Everything
 * else is fetched on demand from /emergency-data/*.json (compact, content-hashed files).
 * Format: docs/emergency-archive-format.md.
 */
import { useSyncExternalStore } from "react";

export type LogLink = { url: string; label?: string };
export type Severity = "HIGH" | "MEDIUM" | "MONITORING";
export type LogItem = {
  text?: string;
  links?: LogLink[];
  severity?: Severity;
  title?: string;
  location?: string;
  type?: "Cyber" | "Power Outage" | "Unrest" | "Terror" | "Infrastructure" | "Election" | "Other";
  summary?: string;
  status?: string;
};
export type LogEntry = {
  datetime: string; // ISO 8601 with ET offset, e.g. 2026-11-02T14:00:00-05:00
  regions?: Record<string, LogItem[] | undefined>;
  trending?: LogItem[];
  threats?: LogItem[];
};

type CompactSection = [number, ...number[]];
type CompactWindow = [string, ...(CompactSection | { x: number })[]];
export type Compact = { v: 1; s: string[]; l: number[][]; i: number[][]; w: CompactWindow[] };
export type EmergencyHead = {
  v: 1;
  newest: string | null;
  files: { key: string; url: string; bytes: number }[];
  /** [datetime, itemCount, fileIndex], newest first. */
  windows: [string, number, number][];
  head: Compact;
};

const ITEM_FIELDS = ["title", "summary", "location", "type", "severity", "status", "text"] as const;

/** Inverse of encodeCompact in scripts/emergency-format.mjs. Every window gets fresh item objects. */
export function decodeCompact(c: Compact): LogEntry[] {
  const { s, l, i } = c;
  const decItem = (k: number): LogItem => {
    const row = i[k];
    const it: Record<string, unknown> = {};
    for (let n = 0; n < ITEM_FIELDS.length; n++) if (row[n] >= 0) it[ITEM_FIELDS[n]] = s[row[n]];
    if (row[7] >= 0) {
      const flat = l[row[7]];
      const links: LogLink[] = [];
      for (let n = 0; n < flat.length; n += 2) links.push(flat[n + 1] >= 0 ? { url: s[flat[n]], label: s[flat[n + 1]] } : { url: s[flat[n]] });
      it.links = links;
    }
    if (row.length > 8) Object.assign(it, JSON.parse(s[row[8]]));
    return it as LogItem;
  };
  return c.w.map((win) => {
    const e: LogEntry = { datetime: win[0] };
    for (let n = 1; n < win.length; n++) {
      const sec = win[n];
      if (!Array.isArray(sec)) {
        Object.assign(e, JSON.parse(s[(sec as { x: number }).x]));
        continue;
      }
      const name = s[sec[0]];
      const items = sec.slice(1).map(decItem);
      if (name === "#trending") e.trending = items;
      else if (name === "#threats") e.threats = items;
      else (e.regions ??= {})[name] = items;
    }
    return e;
  });
}

export type LoadProgress = { done: number; total: number; bytes: number; totalBytes: number; error?: string };

type Snapshot = { version: number; entries: LogEntry[]; loaded: ReadonlySet<number>; progress: LoadProgress | null };

export class EmergencyStore {
  readonly head: EmergencyHead;
  private byDt = new Map<string, LogEntry>();
  private loaded = new Set<number>();
  private inflight = new Map<number, Promise<void>>();
  private listeners = new Set<() => void>();
  private snap: Snapshot;
  private progress: LoadProgress | null = null;
  private onAdd: (e: LogEntry) => void;

  constructor(head: EmergencyHead, onAdd: (e: LogEntry) => void) {
    this.head = head;
    this.onAdd = onAdd;
    this.add(decodeCompact(head.head));
    // A file whose windows are all in the head counts as loaded.
    head.files.forEach((_, f) => {
      if (head.windows.every(([dt, , fi]) => fi !== f || this.byDt.has(dt))) this.loaded.add(f);
    });
    this.snap = this.makeSnap(0);
  }

  private add(entries: LogEntry[]) {
    for (const e of entries) {
      if (this.byDt.has(e.datetime)) continue;
      this.byDt.set(e.datetime, e);
      this.onAdd(e);
    }
  }

  private makeSnap(version: number): Snapshot {
    const entries = [...this.byDt.values()].sort((a, b) => Date.parse(b.datetime) - Date.parse(a.datetime));
    return { version, entries, loaded: new Set(this.loaded), progress: this.progress ? { ...this.progress } : null };
  }

  private emit() {
    this.snap = this.makeSnap(this.snap.version + 1);
    for (const fn of this.listeners) fn();
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getSnapshot = () => this.snap;

  /** File indexes holding windows that pass `keep`. */
  filesFor(keep: (datetime: string) => boolean): number[] {
    const out = new Set<number>();
    for (const [dt, , f] of this.head.windows) if (keep(dt)) out.add(f);
    return [...out];
  }

  isLoaded(files: number[]) {
    return files.every((f) => this.loaded.has(f));
  }

  /** Fetch the given files (once each), newest first, reporting progress. */
  async load(files: number[]): Promise<void> {
    const todo = files.filter((f) => !this.loaded.has(f));
    if (!todo.length) return;
    const fresh = todo.filter((f) => !this.inflight.has(f));
    if (fresh.length) {
      const p = this.progress && this.progress.done < this.progress.total ? this.progress : { done: 0, total: 0, bytes: 0, totalBytes: 0 };
      p.total += fresh.length;
      p.totalBytes += fresh.reduce((n, f) => n + (this.head.files[f]?.bytes ?? 0), 0);
      delete p.error;
      this.progress = p;
      this.emit();
    }
    for (const f of fresh) {
      const file = this.head.files[f];
      const job = (async () => {
        try {
          const res = await fetch(file.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          this.add(decodeCompact(JSON.parse(text) as Compact));
          this.loaded.add(f);
          if (this.progress) {
            this.progress.done += 1;
            this.progress.bytes += file.bytes;
          }
        } catch (err) {
          if (this.progress) this.progress.error = `Could not load ${file.key} (${err instanceof Error ? err.message : String(err)})`;
          throw err;
        } finally {
          this.inflight.delete(f);
          this.emit();
        }
      })();
      this.inflight.set(f, job);
    }
    // Several at a time; browsers cap per-host concurrency anyway.
    await Promise.allSettled(todo.map((f) => this.inflight.get(f)).filter(Boolean));
  }
}

export function useEmergencyStore(store: EmergencyStore) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
