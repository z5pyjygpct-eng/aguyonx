import { useEffect, useMemo, useState } from "react";
import { searchSite, type SearchHit } from "@/lib/search";
import { ftmSnippet, ftmStats, jumpHref, searchFtm, type FtmMeetingHit, type FtmResult, type FtmSnippet } from "@/lib/ftm-search";

/** Grouped site search results (homepage, hubs, dashboards). Per-group limits with "Show more"; no global cap. */
const FIRST = 5;
const MORE = 10;
const ORDER = ["Investigation", "Article", "Recap", "Page", "2027", "Library", "Book", "Delegate paper", "Senator paper", "Document", "News"];
const LABEL: Record<string, string> = { Recap: "Meeting recaps and votes", Document: "Documents (PDF full text)", Investigation: "Investigations", Article: "Articles", Page: "Pages", "2027": "2027 candidates", Library: "Library", Book: "Books", "Delegate paper": "Delegate papers", "Senator paper": "Senator papers", News: "News" };
const external = (h: string) => /^https?:/.test(h) || /\.(pdf|md|csv|txt)$/i.test(h);
const clock = (s: number) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60); return `${h ? `${h}:${String(m).padStart(2, "0")}` : m}:${String(x).padStart(2, "0")}`; };

function useShown(n: number) {
  const [shown, setShown] = useState(FIRST);
  return { shown: Math.min(shown, n), more: n > shown ? () => setShown(shown + MORE) : null };
}

function MoreBtn({ more, left, dark }: { more: (() => void) | null; left: number; dark: boolean }) {
  if (!more) return null;
  return <button type="button" onClick={more} className={`mt-1 ml-3 mb-2 text-sm font-semibold underline ${dark ? "text-navy-700" : "text-foreground"}`}>Show more ({left} left)</button>;
}

function MeetingRow({ h, terms, q }: { h: FtmMeetingHit; terms: string[]; q: string }) {
  const [sn, setSn] = useState<FtmSnippet | null | undefined>(undefined);
  useEffect(() => { let on = true; ftmSnippet(h, terms, q).then((s) => on && setSn(s)).catch(() => on && setSn(null)); return () => { on = false; }; }, [h, terms, q]);
  const href = sn?.href ?? jumpHref(h, 0, q);
  return (
    <li className="px-3 py-3">
      <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">{h.venue.label} · {h.dateLabel}</p>
      <p className="font-semibold">{h.title}</p>
      {sn === undefined ? <p className="mt-0.5 text-sm text-muted-foreground">Loading snippet…</p> : sn ? <p className="mt-0.5 line-clamp-3 text-sm text-muted-foreground">“{sn.text}”</p> : null}
      <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
        <a href={href} target={h.jumpTpl ? "_blank" : undefined} rel="noreferrer" className="font-semibold underline">{h.jumpTpl && sn ? `Jump to ${clock(sn.start)} in the video` : "Open in Find the Moment"}</a>
        <span className="text-muted-foreground">{h.windows.length} moment{h.windows.length === 1 ? "" : "s"}</span>
        <a href={`${h.venue.page}?q=${encodeURIComponent(q)}`} className="underline">All moments here</a>
      </p>
    </li>
  );
}

function Meetings({ r, q, dark }: { r: FtmResult; q: string; dark: boolean }) {
  const { shown, more } = useShown(r.meetings.length);
  const top = r.byVenue[0];
  return (
    <section>
      <p className="px-3 pt-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">Meetings · what was said ({r.meetings.length} meetings, {r.moments.toLocaleString()} moments)</p>
      <ul className="divide-y divide-border">{r.meetings.slice(0, shown).map((h) => <MeetingRow key={h.idx} h={h} terms={r.terms} q={q} />)}</ul>
      <MoreBtn more={more} left={r.meetings.length - shown} dark={dark} />
      <div className="px-3 pb-3 text-sm">
        <a href={`${top.venue.page}?q=${encodeURIComponent(q)}`} className="font-semibold underline">See all {r.moments.toLocaleString()} in Find the Moment</a>
        <span className="text-muted-foreground"> · by place: </span>
        {r.byVenue.map((v, i) => <span key={v.venue.id}>{i ? " · " : ""}<a href={`${v.venue.page}?q=${encodeURIComponent(q)}`} className="underline">{v.venue.label} ({v.moments})</a></span>)}
      </div>
      <p className="px-3 pb-3 text-xs text-muted-foreground">Machine transcripts: an index, not quotes. Check the video.</p>
    </section>
  );
}

function Group({ shelf, list, dark }: { shelf: string; list: SearchHit[]; dark: boolean }) {
  const { shown, more } = useShown(list.length);
  return (
    <section>
      <p className="px-3 pt-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">{LABEL[shelf] ?? shelf} ({list.length})</p>
      <ul className="divide-y divide-border">{list.slice(0, shown).map((h) => (
        <li key={h.id}><a href={h.href} {...(external(h.href) ? { target: "_blank", rel: "noreferrer" } : {})} className="block px-3 py-3 hover:bg-wash">
          <p className="font-semibold">{h.title}</p>
          {h.snippet ? <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{h.snippet}</p> : null}
        </a></li>
      ))}</ul>
      <MoreBtn more={more} left={list.length - shown} dark={dark} />
    </section>
  );
}

export function SiteSearchResults({ query, dark = false }: { query: string; dark?: boolean }) {
  const base = useMemo(() => searchSite(query, Infinity), [query]);
  const [extra, setExtra] = useState<{ q: string; hits: SearchHit[] } | null>(null);
  useEffect(() => {
    let on = true;
    import("@/lib/search-extra").then((m) => m.searchExtra(query, new Set(base.map((h) => h.href)))).then((h) => on && setExtra({ q: query, hits: h })).catch(() => on && setExtra({ q: query, hits: [] }));
    return () => { on = false; };
  }, [query, base]);
  const hits = useMemo(() => (extra && extra.q === query ? [...base, ...extra.hits] : base), [base, extra, query]);
  const [ftm, setFtm] = useState<{ q: string; r: FtmResult | null; err?: boolean } | null>(null);
  useEffect(() => {
    let on = true;
    searchFtm(query).then((r) => {
      if (!on) return;
      setFtm({ q: query, r });
      if (typeof window !== "undefined") (window as unknown as { __ftmStats: typeof ftmStats }).__ftmStats = ftmStats;
    }).catch(() => on && setFtm({ q: query, r: null, err: true }));
    return () => { on = false; };
  }, [query]);
  const groups = ORDER.map((s) => ({ s, list: hits.filter((h) => h.shelf === s) })).filter((g) => g.list.length);
  const loading = !ftm || ftm.q !== query;
  const r = loading ? null : ftm.r;
  const none = !loading && !hits.length && !r?.meetings.length;
  return (
    <div className={`divide-y divide-border ${dark ? "mt-3 rounded-xl bg-white p-1 text-navy-800 shadow-xl" : "mt-5 border-y border-border"}`} aria-live="polite">
      <p className="px-3 py-2 text-sm text-muted-foreground">
        {hits.length} on our pages · {loading ? "searching meeting transcripts…" : ftm.err ? "meeting transcripts unavailable right now" : `${r?.meetings.length ?? 0} meetings mention it`}
      </p>
      {r && r.meetings.length ? <Meetings r={r} q={query} dark={dark} /> : null}
      {groups.map((g) => <Group key={g.s} shelf={g.s} list={g.list} dark={dark} />)}
      {none ? <p className="p-3 text-sm text-muted-foreground">No matching records on this site or in meeting transcripts.</p> : null}
    </div>
  );
}
