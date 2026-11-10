import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import {
  UNITY_BUCKETS, type BillAgg, type BillMode, type CategoryTally, type Chamber, type KeyVoteRow, type OutcomeTally, type Party, type PartyCompare,
} from "@/lib/ga-party-compare";

/* ---------- shared look ---------- */
export const P_COLOR: Record<Party, string> = { R: "#FF7A85", D: "#7FA7FF" };
export const P_NAME: Record<Party, string> = { R: "Republicans", D: "Democrats" };
// Outcome and vote colours are deliberately NOT the party colours, so a colour never means "good" or "bad" for a party.
export const OUT_COLOR = { signed: "#7EE0A0", vetoed: "#C9A6FF", passed: "#3FB5A5", failed: "#E8E1D0", tabled: "#6D86B0" } as const;
export const OUT_LABEL = { signed: "Signed into law", vetoed: "Vetoed", passed: "Passed (no governor action)", failed: "Did not pass", tabled: "Left in committee or continued" } as const;
export const VOTE_COLOR = { Y: "#7EE0A0", N: "#F5B82E", A: "#C9A6FF", X: "#4A5F86" } as const;
const VOTE_LABEL = { Y: "Yea", N: "Nay", A: "Abstain", X: "Not voting" } as const;

export type ChamberSel = "both" | Chamber;
const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (n: number, d: number, dp = 1) => (d > 0 ? `${((100 * n) / d).toFixed(dp)}%` : "—");
const ratio = (n: number, d: number) => (d > 0 ? (100 * n) / d : null);

/* ---------- selection helpers: same method for both chambers and both parties ---------- */
function chambersOf(sel: ChamberSel): Chamber[] { return sel === "both" ? ["house", "senate"] : [sel]; }

export function pooled(c: PartyCompare, sel: ChamberSel, p: Party, mode: BillMode) {
  const out = { members: 0, coPatron: 0, tally: { total: 0, signed: 0, vetoed: 0, passed: 0, failed: 0, tabled: 0 } as OutcomeTally, categorized: 0, official: 0, uncategorized: 0, categories: {} as Record<string, CategoryTally>,
    pv: { Y: 0, N: 0, A: 0, X: 0, withMajority: 0, yeaNay: 0 }, passageCalls: 0, agreement: { unanimous: 0, sameSide: 0, opposite: 0, noMajority: 0 }, passageUnmatched: 0, passageMatched: 0,
    votes: { total: 0, yea: 0, nay: 0, abstain: 0, notVoting: 0, withParty: 0, againstParty: 0 }, unityHist: UNITY_BUCKETS.map(() => 0), unityMembers: 0, partial: 0, honor: 0 };
  for (const ch of chambersOf(sel)) {
    const a = c.data[ch][p];
    out.members += a.members; out.coPatron += a.coPatron; out.unityMembers += a.unityMembers; out.partial += a.partialTermMembers; out.honor += c.excludedHonor[ch][p];
    const b: BillAgg = a.bills[mode];
    (Object.keys(out.tally) as (keyof OutcomeTally)[]).forEach((k) => { out.tally[k] += b.tally[k]; });
    out.categorized += b.categorized; out.official += b.official; out.uncategorized += b.uncategorized;
    const pc = c.passage.chambers[ch], pp = pc.party[p];
    out.pv.Y += pp.Y; out.pv.N += pp.N; out.pv.A += pp.A; out.pv.X += pp.X; out.pv.withMajority += pp.withMajority; out.pv.yeaNay += pp.yeaNay;
    out.passageCalls += pc.rollCallsCounted; out.passageUnmatched += pc.unmatchedMemberVotes; out.passageMatched += pc.matchedMemberVotes;
    (Object.keys(out.agreement) as (keyof typeof out.agreement)[]).forEach((k) => { out.agreement[k] += pc.agreement[k]; });
    for (const [k, v] of Object.entries(b.categories)) {
      const e = (out.categories[k] ??= { n: 0, signed: 0, passed: 0, failed: 0, tabled: 0 });
      e.n += v.n; e.signed += v.signed; e.passed += v.passed; e.failed += v.failed; e.tabled += v.tabled;
    }
    (Object.keys(out.votes) as (keyof typeof out.votes)[]).forEach((k) => { out.votes[k] += a.votes[k]; });
    a.unityHist.forEach((n, i) => { out.unityHist[i] += n; });
  }
  return out;
}
export type Pooled = ReturnType<typeof pooled>;

/* ---------- tooltip that works on hover, keyboard focus and tap ---------- */
type Tip = { x: number; y: number; node: ReactNode } | null;
export function useTip() {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  const at = (clientX: number, clientY: number, node: ReactNode) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ x: clientX - r.left, y: clientY - r.top, node });
  };
  /** Spread onto any hover target. */
  const bind = (node: ReactNode) => ({
    "data-tip": "",
    onPointerEnter: (e: React.PointerEvent) => at(e.clientX, e.clientY, node),
    onPointerMove: (e: React.PointerEvent) => at(e.clientX, e.clientY, node),
    onPointerDown: (e: React.PointerEvent) => at(e.clientX, e.clientY, node),
    onFocus: (e: React.FocusEvent<HTMLElement>) => { const b = e.currentTarget.getBoundingClientRect(); at(b.left + b.width / 2, b.top, node); },
    onBlur: () => setTip(null),
    tabIndex: 0,
  });
  const width = ref.current?.clientWidth ?? 320;
  const half = Math.min(120, width / 2 - 4);
  const layer = (
    <>
      {tip ? (
        <div role="status" className="pointer-events-none absolute z-30 w-max max-w-[240px] rounded-lg border border-gold/60 bg-navy-900/95 px-3 py-2 text-xs leading-snug text-white shadow-2xl backdrop-blur" style={{ left: Math.min(Math.max(tip.x, half), width - half), top: Math.max(tip.y - 14, 4), transform: "translate(-50%,-100%)" }}>
          {tip.node}
        </div>
      ) : null}
    </>
  );
  const container = {
    ref,
    onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType === "mouse") setTip(null); },
    onPointerDown: (e: React.PointerEvent) => { if (!(e.target as HTMLElement).closest("[data-tip]")) setTip(null); },
  };
  return { bind, layer, container };
}

export const TipLine = ({ p, children }: { p?: Party; children: ReactNode }) => (
  <div className="flex items-center gap-1.5">{p ? <span aria-hidden className="inline-block size-2 shrink-0 rounded-full" style={{ background: P_COLOR[p] }} /> : null}<span>{children}</span></div>
);

/** Flip to true one frame after mount so bars animate in. */
function useGrow() {
  const [on, set] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => set(true)); return () => cancelAnimationFrame(t); }, []);
  return on;
}

/* ---------- section frame ---------- */
export function Section({ id, kicker, title, lead, children, note }: { id: string; kicker: string; title: string; lead?: ReactNode; children: ReactNode; note?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-navy-line/60 py-12 first:border-t-0 sm:py-16">
      <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">{kicker}</p>
      <h2 id={`${id}-h`} className="mt-1 font-serif text-3xl leading-tight font-bold uppercase sm:text-4xl">{title}</h2>
      {lead ? <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#F6F3EA]">{lead}</p> : null}
      <div className="mt-8">{children}</div>
      {note ? <div className="mt-6 max-w-3xl border-l-2 border-gold/60 pl-4 text-xs leading-relaxed text-night-muted">{note}</div> : null}
    </section>
  );
}

export function Segmented<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-labelledby={id} className="min-w-0">
      <div id={id} className="mb-1 text-[11px] font-bold tracking-[0.14em] text-night-muted uppercase">{label}</div>
      <div className="inline-flex max-w-full flex-wrap rounded-lg border border-navy-line bg-navy-900 p-1">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={`min-h-10 rounded-md px-3.5 text-sm font-semibold transition-colors ${value === o.value ? "bg-gold text-navy-900" : "text-on-dark-muted hover:text-white"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PartyKey() {
  return (
    <div className="flex items-center gap-4 text-sm font-semibold">
      {(["R", "D"] as Party[]).map((p) => (
        <span key={p} className="inline-flex items-center gap-2"><span aria-hidden className="size-3 rounded-sm" style={{ background: P_COLOR[p] }} />{P_NAME[p]}</span>
      ))}
    </div>
  );
}

/* ---------- HERO: seat dots ---------- */
export function SeatDots({ c }: { c: PartyCompare }) {
  const { bind, layer, container } = useTip();
  const on = useGrow();
  return (
    <div {...container} className="relative rounded-xl border border-navy-line bg-navy-900/70 p-4 sm:p-5">
      <div className="mb-3 text-[11px] font-bold tracking-[0.14em] text-night-muted uppercase">Members in the LIS data · one dot per member</div>
      {(["house", "senate"] as Chamber[]).map((ch) => {
        const r = c.data[ch].R.members, d = c.data[ch].D.members;
        const dots: Party[] = [...Array<Party>(r).fill("R"), ...Array<Party>(d).fill("D")];
        return (
          <div key={ch} className="mb-4 last:mb-0">
            <div className="mb-1.5 flex items-baseline justify-between text-sm"><span className="font-serif font-semibold uppercase">{ch === "house" ? "House of Delegates" : "Senate of Virginia"}</span><span className="text-night-muted">{r + d} members</span></div>
            <div className="flex flex-wrap gap-1.5">
              {dots.map((p, i) => (
                <span key={i} {...bind(<TipLine p={p}>{ch === "house" ? "House" : "Senate"} · {P_NAME[p]}: {ch === "house" ? (p === "R" ? r : d) : p === "R" ? r : d} members</TipLine>)}
                  className="size-3.5 rounded-full transition-all duration-500 hover:scale-150 focus-visible:scale-150 sm:size-4" style={{ background: P_COLOR[p], opacity: on ? 1 : 0, transform: on ? undefined : "scale(0.2)", transitionDelay: `${Math.min(i, 120) * 6}ms` }} />
              ))}
            </div>
            <div className="mt-1.5 flex gap-4 text-xs text-on-dark-muted"><span style={{ color: P_COLOR.R }}>R {r}</span><span style={{ color: P_COLOR.D }}>D {d}</span></div>
          </div>
        );
      })}
      {layer}
    </div>
  );
}

/* ---------- FACE-OFF: mirrored bars ---------- */
type Metric = { key: string; label: string; method: string; kind: "pct" | "num"; value: (x: Pooled) => number | null; detail: (x: Pooled, p: Party) => string; unit?: string };
export const METRICS: Metric[] = [
  { key: "members", label: "Members", method: "Count of members of the party in the selected chamber(s) in the LIS roster data.", kind: "num", value: (x) => x.members, detail: (x) => `${fmt(x.members)} members` },
  { key: "bills", label: "Bills & resolutions per member", method: "Measures a member is chief patron of in the 2026 Regular and Special I sessions, divided by the party's members.", kind: "num", value: (x) => (x.members ? x.tally.total / x.members : null), detail: (x) => `${fmt(x.tally.total)} measures ÷ ${fmt(x.members)} members` },
  { key: "co", label: "Co-patron signatures per member", method: "Times a member is listed as a co-patron on someone else's measure (2026 sessions), divided by the party's members.", kind: "num", value: (x) => (x.members ? x.coPatron / x.members : null), detail: (x) => `${fmt(x.coPatron)} co-patron listings ÷ ${fmt(x.members)} members` },
  { key: "passed", label: "Passed the General Assembly", method: "Share of the party's chief-patron measures that passed both chambers (signed, vetoed after passage, or resolutions passed).", kind: "pct", value: (x) => ratio(x.tally.signed + x.tally.vetoed + x.tally.passed, x.tally.total), detail: (x) => `${fmt(x.tally.signed + x.tally.vetoed + x.tally.passed)} of ${fmt(x.tally.total)} measures` },
  { key: "signed", label: "Signed into law", method: "Share of the party's chief-patron measures whose LIS status is signed by the governor. Resolutions never go to the governor.", kind: "pct", value: (x) => ratio(x.tally.signed, x.tally.total), detail: (x) => `${fmt(x.tally.signed)} of ${fmt(x.tally.total)} measures` },
  { key: "failed", label: "Did not pass", method: "Share defeated, stricken or folded into another measure.", kind: "pct", value: (x) => ratio(x.tally.failed, x.tally.total), detail: (x) => `${fmt(x.tally.failed)} of ${fmt(x.tally.total)} measures` },
  { key: "tabled", label: "Left in committee or continued", method: "Share left in committee or continued to 2027 per LIS status.", kind: "pct", value: (x) => ratio(x.tally.tabled, x.tally.total), detail: (x) => `${fmt(x.tally.tabled)} of ${fmt(x.tally.total)} measures` },
  { key: "yea", label: "Yea on final-passage votes", method: "Of the party's member votes on final-passage and third-reading roll calls (rule in Method below), the share recorded Yea.", kind: "pct", value: (x) => ratio(x.pv.Y, x.pv.Y + x.pv.N + x.pv.A + x.pv.X), detail: (x) => `${fmt(x.pv.Y)} of ${fmt(x.pv.Y + x.pv.N + x.pv.A + x.pv.X)} member votes` },
  { key: "nay", label: "Nay on final-passage votes", method: "Same denominator: the share recorded Nay.", kind: "pct", value: (x) => ratio(x.pv.N, x.pv.Y + x.pv.N + x.pv.A + x.pv.X), detail: (x) => `${fmt(x.pv.N)} of ${fmt(x.pv.Y + x.pv.N + x.pv.A + x.pv.X)} member votes` },
  { key: "missed", label: "Not voting on final-passage votes", method: "Same denominator: the share recorded as not voting (a small number also abstained).", kind: "pct", value: (x) => ratio(x.pv.X, x.pv.Y + x.pv.N + x.pv.A + x.pv.X), detail: (x) => `${fmt(x.pv.X)} of ${fmt(x.pv.Y + x.pv.N + x.pv.A + x.pv.X)} member votes (${fmt(x.pv.A)} abstained)` },
  { key: "unityPass", label: "With own party's majority, final-passage votes", method: "On final-passage votes where the party's majority voted one way, the share of that party's yea/nay votes that matched the majority.", kind: "pct", value: (x) => ratio(x.pv.withMajority, x.pv.yeaNay), detail: (x) => `${fmt(x.pv.withMajority)} of ${fmt(x.pv.yeaNay)} yea/nay votes` },
  { key: "unity", label: "With own party's majority, all floor roll calls", method: "On every floor roll call (passage, amendments and motions alike; LIS descriptions are not in the member summary) where a party's majority voted one way, the share of yea/nay votes that matched the majority.", kind: "pct", value: (x) => ratio(x.votes.withParty, x.votes.withParty + x.votes.againstParty), detail: (x) => `${fmt(x.votes.withParty)} of ${fmt(x.votes.withParty + x.votes.againstParty)} yea/nay votes` },
];
export const METRIC_GROUPS: { title: string; keys: string[] }[] = [
  { title: "Who is in the room", keys: ["members"] },
  { title: "Bill activity (chief patron)", keys: ["bills", "co", "passed", "signed", "failed", "tabled"] },
  { title: "Floor voting record: final-passage votes", keys: ["yea", "nay", "missed", "unityPass"] },
  { title: "Floor voting record: all roll calls", keys: ["unity"] },
];

export function FaceOff({ c, sel, mode }: { c: PartyCompare; sel: ChamberSel; mode: BillMode }) {
  const R = useMemo(() => pooled(c, sel, "R", mode), [c, sel, mode]);
  const D = useMemo(() => pooled(c, sel, "D", mode), [c, sel, mode]);
  const { bind, layer, container } = useTip();
  const on = useGrow();
  return (
    <div {...container} className="relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="font-serif text-lg font-bold uppercase" style={{ color: P_COLOR.R }}>← Republicans</span>
        <span className="font-serif text-lg font-bold uppercase text-right" style={{ color: P_COLOR.D }}>Democrats →</span>
      </div>
      {METRIC_GROUPS.map((g) => (
        <div key={g.title} className="mb-6 last:mb-0">
          <h3 className="mb-2 border-b border-navy-line/70 pb-1 text-xs font-bold tracking-[0.14em] text-gold uppercase">{g.title}</h3>
          {g.keys.map((k) => {
            const m = METRICS.find((x) => x.key === k)!;
            const vr = m.value(R), vd = m.value(D);
            const max = m.kind === "pct" ? Math.max(vr ?? 0, vd ?? 0, 1) * 1.15 : Math.max(vr ?? 0, vd ?? 0, 1);
            const show = (v: number | null) => (v === null ? "—" : m.kind === "pct" ? `${v.toFixed(1)}%` : v >= 100 ? fmt(Math.round(v)) : v.toFixed(v % 1 ? 1 : 0));
            const tip = (p: Party, x: Pooled, v: number | null) => <><TipLine p={p}><b>{P_NAME[p]}</b>: {show(v)}</TipLine><div className="mt-0.5 text-on-dark-muted">{m.detail(x, p)}</div></>;
            return (
              <div key={k} className="py-2">
                <div className="mb-1 text-center text-sm font-semibold sm:text-[15px]">{m.label}</div>
                <div className="grid grid-cols-[1fr_1fr] gap-x-1">
                  {([["R", R, vr], ["D", D, vd]] as const).map(([p, x, v]) => (
                    <div key={p} className={`flex h-9 items-center gap-2 ${p === "R" ? "flex-row-reverse" : ""}`}>
                      <div className={`flex h-full min-w-0 flex-1 items-center ${p === "R" ? "justify-end" : "justify-start"}`}>
                        <div {...bind(tip(p, x, v))} className="h-7 rounded-sm outline-offset-2 transition-[width,filter] duration-700 ease-out hover:brightness-125 focus-visible:brightness-125 motion-reduce:transition-none"
                          style={{ width: on && v !== null ? `${Math.max((v / max) * 100, 1.5)}%` : "0%", background: `linear-gradient(${p === "R" ? "270deg" : "90deg"}, ${P_COLOR[p]}, ${P_COLOR[p]}99)` }} />
                      </div>
                      <span className="w-14 shrink-0 text-sm font-bold tabular-nums sm:w-16 sm:text-base" style={{ color: P_COLOR[p], textAlign: p === "R" ? "right" : "left" }}>{show(v)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-0.5 text-center text-[11px] leading-snug text-night-muted">{m.method}</p>
              </div>
            );
          })}
        </div>
      ))}
      {layer}
    </div>
  );
}

/* ---------- DONUTS: what happened to each party's bills ---------- */
const OUT_KEYS = ["signed", "passed", "vetoed", "failed", "tabled"] as const;
export function OutcomeDonuts({ c, sel, mode }: { c: PartyCompare; sel: ChamberSel; mode: BillMode }) {
  const [hot, setHot] = useState<(typeof OUT_KEYS)[number] | null>(null);
  const on = useGrow();
  const data = { R: pooled(c, sel, "R", mode), D: pooled(c, sel, "D", mode) };
  return (
    <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-7">
      <div className="grid gap-8 sm:grid-cols-2">
        {(["R", "D"] as Party[]).map((p) => {
          const t = data[p].tally;
          const R_ = 46, C = 2 * Math.PI * R_;
          let off = 0;
          const active = hot ?? null;
          return (
            <figure key={p} className="flex min-w-0 flex-col items-center" aria-label={`${P_NAME[p]} measure outcomes`}>
              <figcaption className="mb-2 font-serif text-xl font-bold uppercase" style={{ color: P_COLOR[p] }}>{P_NAME[p]}</figcaption>
              <div className="relative size-56 max-w-full sm:size-60">
                <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                  <circle cx="60" cy="60" r={R_} fill="none" stroke="#08142d" strokeWidth="16" />
                  {OUT_KEYS.map((k) => {
                    const n = t[k];
                    if (!n) return null;
                    const len = (n / t.total) * C;
                    const seg = (
                      <circle key={k} cx="60" cy="60" r={R_} fill="none" stroke={OUT_COLOR[k]} strokeWidth={active === k ? 21 : 16}
                        strokeDasharray={`${on ? Math.max(len - 0.8, 0.1) : 0} ${C}`} strokeDashoffset={-off} tabIndex={0} role="img"
                        aria-label={`${P_NAME[p]}: ${OUT_LABEL[k]}, ${fmt(n)} of ${fmt(t.total)} (${pct(n, t.total)})`}
                        className="cursor-pointer outline-none transition-[stroke-dasharray,stroke-width,opacity] duration-700 ease-out motion-reduce:transition-none"
                        style={{ opacity: active && active !== k ? 0.35 : 1 }}
                        onPointerEnter={() => setHot(k)} onPointerLeave={() => setHot(null)} onPointerDown={() => setHot(k)} onFocus={() => setHot(k)} onBlur={() => setHot(null)} />
                    );
                    off += len;
                    return seg;
                  })}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                  {active ? (
                    <>
                      <span className="font-serif text-3xl font-bold tabular-nums">{pct(t[active], t.total)}</span>
                      <span className="text-[11px] leading-tight text-on-dark-muted">{OUT_LABEL[active]}</span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: OUT_COLOR[active] }}>{fmt(t[active])} of {fmt(t.total)}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-serif text-4xl font-bold tabular-nums">{fmt(t.total)}</span>
                      <span className="text-[11px] leading-tight text-on-dark-muted">measures as chief patron</span>
                    </>
                  )}
                </div>
              </div>
            </figure>
          );
        })}
      </div>
      <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Outcome legend">
        {OUT_KEYS.map((k) => (
          <li key={k}>
            <button type="button" onPointerEnter={() => setHot(k)} onPointerLeave={() => setHot(null)} onFocus={() => setHot(k)} onBlur={() => setHot(null)} onClick={() => setHot(hot === k ? null : k)}
              className={`inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm ${hot === k ? "bg-navy-600 text-white" : "text-on-dark-muted"}`}>
              <span aria-hidden className="size-3 rounded-sm" style={{ background: OUT_COLOR[k] }} />{OUT_LABEL[k]}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-xs text-night-muted">Hover, tap or focus a slice or a legend item to compare the same outcome in both rings.</p>
    </div>
  );
}

/* ---------- UNITY HISTOGRAM ---------- */
export function UnityHistogram({ c, sel }: { c: PartyCompare; sel: ChamberSel }) {
  const R = pooled(c, sel, "R", "all"), D = pooled(c, sel, "D", "all");
  const { bind, layer, container } = useTip();
  const on = useGrow();
  const max = Math.max(...R.unityHist, ...D.unityHist, 1);
  return (
    <div {...container} className="relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><PartyKey /><span className="text-xs text-night-muted">Each bar counts members. No names are shown.</span></div>
      <div className="flex h-56 items-end gap-1 sm:gap-2" role="group" aria-label="Distribution of members by share of votes with their party's majority">
        {UNITY_BUCKETS.map((b, i) => (
          <div key={b} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="flex flex-1 items-end justify-center gap-0.5">
              {([["R", R], ["D", D]] as const).map(([p, x]) => {
                const n = x.unityHist[i];
                return (
                  <div key={p} {...bind(<><TipLine p={p}><b>{P_NAME[p]}</b>: {n} {n === 1 ? "member" : "members"}</TipLine><div className="mt-0.5 text-on-dark-muted">voted with their party's majority on {b === "<80" ? "under 80" : b}% of yea/nay votes · {pct(n, x.unityMembers, 0)} of {x.unityMembers} {P_NAME[p]}</div></>)}
                    className="w-full max-w-[22px] sm:max-w-[44px] rounded-t-sm outline-offset-2 transition-[height,filter] duration-700 ease-out hover:brightness-125 focus-visible:brightness-125 motion-reduce:transition-none"
                    style={{ height: on ? `${(n / max) * 100}%` : "0%", minHeight: n ? 3 : 0, background: P_COLOR[p], transitionDelay: `${i * 40}ms` }} />
                );
              })}
            </div>
            <div className="mt-1.5 h-4 text-center text-[9px] leading-4 text-night-muted sm:text-[11px]">{b.split("–")[0]}</div>
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-xs text-night-muted">% of a member's yea/nay votes that matched their own party's majority (buckets start at the number shown, 2 points wide; last bucket is 98–100)</p>
      {layer}
    </div>
  );
}

/* ---------- FINAL-PASSAGE AGREEMENT ---------- */
const AGREE = [
  { k: "unanimous", label: "No dissent", color: "#7EE0A0", note: "Every recorded Yea/Nay vote went the same way" },
  { k: "sameSide", label: "Both party majorities on the same side", color: "#3FB5A5", note: "Some members dissented, but a majority of each party voted the same way" },
  { k: "opposite", label: "Party majorities on opposite sides", color: "#F5B82E", note: "A majority of Republicans and a majority of Democrats voted opposite ways" },
  { k: "noMajority", label: "A party split evenly", color: "#6D86B0", note: "At least one party had no Yea/Nay majority" },
] as const;
export function PassageAgreement({ c, sel }: { c: PartyCompare; sel: ChamberSel }) {
  const { bind, layer, container } = useTip();
  const on = useGrow();
  const rows = chambersOf(sel).map((ch) => ({ ch, p: c.passage.chambers[ch] }));
  return (
    <div {...container} className="relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-7">
      <ul className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">{AGREE.map((a) => <li key={a.k} className="inline-flex items-center gap-2"><span aria-hidden className="size-3 rounded-sm" style={{ background: a.color }} />{a.label}</li>)}</ul>
      <div className="space-y-6">
        {rows.map(({ ch, p }) => (
          <div key={ch}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-serif text-xl font-bold uppercase">{ch === "house" ? "House of Delegates" : "Senate of Virginia"}</h3><span className="text-sm text-on-dark-muted">{fmt(p.rollCallsCounted)} final-passage roll calls</span></div>
            <div className="flex h-11 overflow-hidden rounded-md bg-navy-900">
              {AGREE.map((a) => p.agreement[a.k] ? (
                <div key={a.k} {...bind(<><TipLine><b>{a.label}</b>: {fmt(p.agreement[a.k])} of {fmt(p.rollCallsCounted)} ({pct(p.agreement[a.k], p.rollCallsCounted)})</TipLine><div className="mt-0.5 text-on-dark-muted">{a.note}</div></>)}
                  className="flex h-full items-center justify-center text-xs font-bold text-navy-900 outline-offset-[-2px] transition-[width,filter] duration-700 ease-out hover:brightness-125 focus-visible:brightness-125 motion-reduce:transition-none"
                  style={{ width: on ? `${(p.agreement[a.k] / p.rollCallsCounted) * 100}%` : "0%", background: a.color }}>{p.agreement[a.k] / p.rollCallsCounted > 0.07 ? pct(p.agreement[a.k], p.rollCallsCounted, 0) : ""}</div>
              ) : null)}
            </div>
            <p className="mt-1 text-xs tabular-nums text-night-muted">{AGREE.map((a) => `${a.label}: ${fmt(p.agreement[a.k])}`).join(" · ")}</p>
          </div>
        ))}
      </div>
      {layer}
    </div>
  );
}

/* ---------- KEY VOTES ---------- */
function recLabel(a: string) {
  const m = a.match(/recommendation No\.?\s*(.+?)\s*\(/i);
  return m ? `Governor's rec. No. ${m[1].trim()}` : a.length > 48 ? `${a.slice(0, 46)}…` : a;
}
function majority(t: { Y: number; N: number }): "Yea" | "Nay" | "Tied" { return t.Y > t.N ? "Yea" : t.N > t.Y ? "Nay" : "Tied"; }

export function KeyVotes({ c, sel }: { c: PartyCompare; sel: ChamberSel }) {
  const { bind, layer, container } = useTip();
  const on = useGrow();
  return (
    <div {...container} className="relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {(["Y", "N", "A", "X"] as const).map((k) => <span key={k} className="inline-flex items-center gap-2"><span aria-hidden className="size-3 rounded-sm" style={{ background: VOTE_COLOR[k] }} />{VOTE_LABEL[k]}</span>)}
      </div>
      {chambersOf(sel).map((ch) => {
        const recNo = (a: string) => parseFloat(a.match(/No\.?\s*([\d.]+)/i)?.[1] ?? "0");
        const rows: KeyVoteRow[] = [...c.keyVotes[ch]].sort((a, b) => recNo(a.action) - recNo(b.action));
        const same = rows.filter((r) => majority(r.tallies.R) === majority(r.tallies.D) && majority(r.tallies.R) !== "Tied").length;
        return (
          <div key={ch} className="mb-8 last:mb-0">
            <h3 className="font-serif text-xl font-bold uppercase">{ch === "house" ? "House of Delegates" : "Senate of Virginia"}</h3>
            <p className="mb-3 text-sm text-on-dark-muted">{rows.length} most recent floor roll calls on record, all on the 2026 Budget Bill (HB30). A majority of each party voted the same way on <b className="text-white">{same} of {rows.length}</b>.</p>
            <ul>
              {rows.map((r, ri) => {
                const mr = majority(r.tallies.R), md = majority(r.tallies.D);
                return (
                  <li key={r.href} className="border-t border-navy-line/50 py-3 first:border-t-0">
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-sm font-semibold">{recLabel(r.action)} <span className="font-normal text-night-muted">· {r.passedTally?.replace(/[()]/g, "")}</span></span>
                      <span className="flex items-center gap-3 text-xs">
                        <span className={mr === md && mr !== "Tied" ? "text-[#7EE0A0]" : "text-gold"}>{mr === md && mr !== "Tied" ? `Party majorities both ${mr}` : `Majorities: R ${mr}, D ${md}`}</span>
                        <a href={r.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">LIS <ExternalLink className="size-3" aria-hidden /><span className="sr-only">roll call (opens in a new tab)</span></a>
                      </span>
                    </div>
                    {(["R", "D"] as Party[]).map((p) => {
                      const t = r.tallies[p], total = t.Y + t.N + t.A + t.X;
                      return (
                        <div key={p} className="flex items-center gap-2 py-0.5">
                          <span className="w-4 shrink-0 text-xs font-bold" style={{ color: P_COLOR[p] }}>{p}</span>
                          <div className="flex h-5 min-w-0 flex-1 overflow-hidden rounded-sm bg-navy-900">
                            {(["Y", "N", "A", "X"] as const).map((k) => t[k] ? (
                              <div key={k} {...bind(<><TipLine p={p}><b>{P_NAME[p]}</b> · {VOTE_LABEL[k]}: {t[k]} of {total}</TipLine><div className="mt-0.5 text-on-dark-muted">{r.action}</div></>)}
                                className="h-full outline-offset-[-2px] transition-[width,filter] duration-700 ease-out hover:brightness-125 focus-visible:brightness-125 motion-reduce:transition-none"
                                style={{ width: on ? `${(t[k] / total) * 100}%` : "0%", background: VOTE_COLOR[k], transitionDelay: `${ri * 30}ms` }} />
                            ) : null)}
                          </div>
                          <span className="w-24 shrink-0 text-right text-[11px] tabular-nums text-on-dark-muted sm:w-28">{t.Y}Y · {t.N}N{t.X ? ` · ${t.X} NV` : ""}</span>
                        </div>
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {layer}
    </div>
  );
}

/* ---------- POLICY CATEGORIES ---------- */
type CatMetric = "share" | "perMember" | "count";
export function CategoryChart({ c, sel, mode }: { c: PartyCompare; sel: ChamberSel; mode: BillMode }) {
  const [metric, setMetric] = useState<CatMetric>("share");
  const [all, setAll] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const { bind, layer, container } = useTip();
  const on = useGrow();
  const R = useMemo(() => pooled(c, sel, "R", mode), [c, sel, mode]);
  const D = useMemo(() => pooled(c, sel, "D", mode), [c, sel, mode]);
  const names = useMemo(() => {
    const s = new Set([...Object.keys(R.categories), ...Object.keys(D.categories)]);
    return [...s].sort((a, b) => (R.categories[b]?.n ?? 0) + (D.categories[b]?.n ?? 0) - ((R.categories[a]?.n ?? 0) + (D.categories[a]?.n ?? 0)) || a.localeCompare(b));
  }, [R, D]);
  const shown = all ? names : names.slice(0, 12);
  const val = (x: Pooled, name: string) => {
    const n = x.categories[name]?.n ?? 0;
    return metric === "share" ? (x.categorized ? (100 * n) / x.categorized : 0) : metric === "perMember" ? (x.members ? n / x.members : 0) : n;
  };
  const show = (v: number) => (metric === "share" ? `${v.toFixed(1)}%` : metric === "perMember" ? v.toFixed(2) : fmt(v));
  const max = Math.max(...shown.flatMap((n) => [val(R, n), val(D, n)]), 0.0001);
  const sum = (x: Pooled, name: string): CategoryTally => x.categories[name] ?? { n: 0, signed: 0, passed: 0, failed: 0, tabled: 0 };
  return (
    <div {...container} className="relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <Segmented label="Bar shows" value={metric} onChange={setMetric} options={[{ value: "share", label: "Share of party's categorized bills" }, { value: "perMember", label: "Bills per member" }, { value: "count", label: "Bill count" }]} />
        <div className="inline-flex items-center gap-2 rounded border border-gold/60 px-2 py-1 text-[11px] font-bold tracking-wide text-gold">aguyonx categories · editorial, not official LIS subjects</div>
      </div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-serif text-lg font-bold uppercase" style={{ color: P_COLOR.R }}>← Republicans</span>
        <span className="font-serif text-lg font-bold uppercase" style={{ color: P_COLOR.D }}>Democrats →</span>
      </div>
      <ul>
        {shown.map((name, i) => {
          const vr = val(R, name), vd = val(D, name);
          const isPick = pick === name;
          return (
            <li key={name} className={`rounded-md py-1.5 ${isPick ? "bg-navy-600/70" : ""}`}>
              <button type="button" onClick={() => setPick(isPick ? null : name)} aria-pressed={isPick} className="mb-0.5 block w-full rounded px-1 text-center text-sm font-semibold hover:text-gold focus-visible:outline-gold">{name}</button>
              <div className="grid grid-cols-2 gap-x-1">
                {([["R", R, vr], ["D", D, vd]] as const).map(([p, x, v]) => {
                  const t = sum(x, name);
                  return (
                    <div key={p} className={`flex h-7 items-center gap-1.5 ${p === "R" ? "flex-row-reverse" : ""}`}>
                      <div className={`flex min-w-0 flex-1 ${p === "R" ? "justify-end" : "justify-start"}`}>
                        <div {...bind(<><TipLine p={p}><b>{P_NAME[p]}</b> · {name}</TipLine><div className="mt-0.5">{fmt(t.n)} bills · {pct(t.n, x.categorized)} of {fmt(x.categorized)} categorized · {x.members ? (t.n / x.members).toFixed(2) : "—"} per member</div><div className="text-on-dark-muted">{t.signed} signed · {t.passed} passed GA · {t.failed} failed · {t.tabled} in committee/continued</div></>)}
                          onClick={() => setPick(name)} className="h-5 rounded-sm outline-offset-2 transition-[width,filter] duration-700 ease-out hover:brightness-125 focus-visible:brightness-125 motion-reduce:transition-none"
                          style={{ width: on ? `${v > 0 ? Math.max((v / max) * 100, 1.5) : 0}%` : "0%", transitionDelay: `${i * 25}ms`, background: `linear-gradient(${p === "R" ? "270deg" : "90deg"}, ${P_COLOR[p]}, ${P_COLOR[p]}99)` }} />
                      </div>
                      <span className="w-12 shrink-0 text-xs font-bold tabular-nums" style={{ color: P_COLOR[p], textAlign: p === "R" ? "right" : "left" }}>{show(v)}</span>
                    </div>
                  );
                })}
              </div>
              {isPick ? (
                <div className="mt-2 grid gap-2 px-1 sm:grid-cols-2">
                  {(["R", "D"] as Party[]).map((p) => {
                    const t = sum(p === "R" ? R : D, name);
                    return (
                      <div key={p} className="rounded-lg border border-navy-line bg-navy-900 p-3 text-xs">
                        <div className="mb-1 font-bold" style={{ color: P_COLOR[p] }}>{P_NAME[p]} · {fmt(t.n)} {t.n === 1 ? "bill" : "bills"}</div>
                        <div className="text-on-dark-muted">{t.signed} signed into law · {t.passed} passed the General Assembly (includes signed) · {t.failed} did not pass · {t.tabled} left in committee or continued</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {names.length > 12 ? (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-4 min-h-10 rounded-lg border border-navy-line px-4 text-sm font-semibold text-gold hover:bg-navy-600">{all ? "Show top 12 only" : `Show all ${names.length} categories`}</button>
      ) : null}
      <div className="mt-6 grid gap-3 border-t border-navy-line/60 pt-4 text-xs text-night-muted sm:grid-cols-2">
        {([["R", R], ["D", D]] as const).map(([p, x]) => (
          <div key={p}>
            <div className="mb-1 flex justify-between"><span className="font-semibold" style={{ color: P_COLOR[p] }}>{P_NAME[p]}: categorized</span><span className="tabular-nums">{fmt(x.categorized)} of {fmt(x.tally.total)} ({pct(x.categorized, x.tally.total, 0)}){x.official ? ` · ${fmt(x.official)} from official LIS subjects` : ""}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-navy-900"><div className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none" style={{ width: on ? pct(x.categorized, x.tally.total, 1) : "0%", background: P_COLOR[p] }} /></div>
          </div>
        ))}
      </div>
      {layer}
    </div>
  );
}

/* ---------- 2027 TRACKER ---------- */
export function TrackerPanel({ c }: { c: PartyCompare }) {
  const { bind, layer, container } = useTip();
  const on = useGrow();
  const t = c.tracker;
  const rows = [
    { label: "New 2027 filings · House", d: t.byParty.new.house }, { label: "New 2027 filings · Senate", d: t.byParty.new.senate },
    { label: "Continued from 2026 · House", d: t.byParty.continued.house }, { label: "Continued from 2026 · Senate", d: t.byParty.continued.senate },
  ];
  const maxCat = Math.max(...t.newCategories.map((x) => Math.max(x.R, x.D)), 1);
  return (
    <div {...container} className="relative grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-7">
        <h3 className="mb-1 font-serif text-xl font-bold uppercase">By chief patron's party</h3>
        <p className="mb-4 text-xs text-night-muted">Party is not in the LIS bill files; it is joined from official chamber rosters. Measures without a roster match show as “not matched”.</p>
        <PartyKey />
        <ul className="mt-4 space-y-4">
          {rows.map((r, i) => {
            const tot = r.d.R + r.d.D + r.d["?"];
            return (
              <li key={r.label}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{r.label}</span><span className="tabular-nums text-night-muted">{fmt(tot)} measures</span></div>
                <div className="flex h-7 overflow-hidden rounded-sm bg-navy-900">
                  {(["R", "D", "?"] as const).map((k) => r.d[k] ? (
                    <div key={k} {...bind(<TipLine p={k === "?" ? undefined : k}><b>{k === "?" ? "Party not matched" : P_NAME[k]}</b>: {fmt(r.d[k])} of {fmt(tot)} ({pct(r.d[k], tot)})</TipLine>)}
                      className="flex h-full items-center justify-center text-[11px] font-bold text-navy-900 outline-offset-[-2px] transition-[width,filter] duration-700 hover:brightness-125 focus-visible:brightness-125 motion-reduce:transition-none"
                      style={{ width: on ? `${(r.d[k] / tot) * 100}%` : "0%", background: k === "?" ? "#9fb0cc" : P_COLOR[k], transitionDelay: `${i * 60}ms` }}>{r.d[k] >= 8 ? r.d[k] : ""}</div>
                  ) : null)}
                </div>
                <div className="mt-0.5 text-[11px] text-night-muted tabular-nums">R {r.d.R} · D {r.d.D}{r.d["?"] ? ` · not matched ${r.d["?"]}` : ""}</div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-7">
        <h3 className="mb-1 font-serif text-xl font-bold uppercase">New 2027 filings by category</h3>
        <div className="mb-3 inline-flex rounded border border-gold/60 px-2 py-0.5 text-[11px] font-bold tracking-wide text-gold">aguyonx categories · editorial</div>
        <p className="mb-3 text-xs text-night-muted">{t.newTotal} new filings; a filing can carry more than one category. Counts are small, so exact numbers are shown. Continued bills are not categorized in the tracker.</p>
        <ul className="space-y-1.5">
          {t.newCategories.map((x, i) => (
            <li key={x.id}>
              <div className="text-center text-xs font-semibold">{x.label}</div>
              <div className="grid grid-cols-2 gap-x-1">
                {(["R", "D"] as Party[]).map((p) => (
                  <div key={p} className={`flex h-5 items-center gap-1.5 ${p === "R" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex min-w-0 flex-1 ${p === "R" ? "justify-end" : ""}`}>
                      <div {...bind(<TipLine p={p}><b>{P_NAME[p]}</b> · {x.label}: {x[p]} of {x.total} filings</TipLine>)} className="h-3.5 rounded-sm transition-[width,filter] duration-700 hover:brightness-125 focus-visible:brightness-125 motion-reduce:transition-none"
                        style={{ width: on && x[p] ? `${(x[p] / maxCat) * 100}%` : "0%", background: P_COLOR[p], transitionDelay: `${i * 30}ms` }} />
                    </div>
                    <span className="w-4 shrink-0 text-[11px] font-bold tabular-nums" style={{ color: P_COLOR[p], textAlign: p === "R" ? "right" : "left" }}>{x[p]}</span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {layer}
    </div>
  );
}
