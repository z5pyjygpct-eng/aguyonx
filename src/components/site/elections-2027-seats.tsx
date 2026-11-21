import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import HOUSE from "@/lib/elections-2027-house.json";
import SENATE from "@/lib/elections-2027-senate.json";
import SB from "@/lib/elections-2027-sb.json";
import BOS from "@/lib/elections-2027-bos.json";
import CO from "@/lib/elections-2027-co.json";
import { cn } from "@/lib/utils";
import { isNewCandidate, todayET, flatten, isCheck, localityOptions, MEMBER_NOT_FILED_NOTE, memberNotFiled, partyCount, PARTY_LABEL, statusOf, type Cand, type Entry, type Member, type OfficeFile, type PartyFilter, type Race, type Status } from "@/lib/elections-2027";
import { highlight, type Term } from "@/lib/elections-2027-search";

/** Shared 2027 seat grid pieces (status tiles, legend, district panel) used by /2027/races, /2027/delegates and /2027/senate. Moved unchanged from the /2027 route. */

type Office = "house" | "senate" | "sb" | "bos" | "co";

export const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const TILE: Record<Status, { cls: string; letter: string; label: string }> = {
  contested: { cls: "bg-gold text-navy-900 border-gold", letter: "C", label: "Contested (registrations)" },
  D: { cls: "bg-[#2563c9] text-white border-[#5b8fe6]", letter: "D", label: "Democrat only" },
  R: { cls: "bg-flag text-white border-[#e8566c]", letter: "R", label: "Republican only" },
  Other: { cls: "bg-slate-500 text-white border-slate-300", letter: "O", label: "Other party only" },
  unopposed: { cls: "bg-[#3d7f73] text-white border-[#6fb3a6]", letter: "U", label: "One registered committee" },
  none: { cls: "bg-navy-800 text-on-dark-muted border-dashed border-navy-line", letter: "–", label: "No registered committee yet" },
};

export function Tile({ r, office, dim, selected, onPick, wide }: { r: Race; office: Office; dim: boolean; selected: boolean; onPick: () => void; wide?: boolean }) {
  const st = statusOf(r, office);
  const t = TILE[st];
  const mnf = memberNotFiled(r);
  const chk = isCheck(r);
  const label = `${r.locality ? r.locality + " " : ""}${r.seat}${r.seats > 1 ? ` (${r.seats} seats)` : ""}: ${t.label}${mnf ? ", member not filed yet" : chk ? ", check record" : ""}, ${r.candidates.length} counted committees`;
  return (
    <button type="button" onClick={onPick} aria-label={label} aria-pressed={selected}
      className={cn("relative flex flex-col items-center justify-center rounded-md border-2 font-serif font-bold transition",
        wide ? "min-h-16 px-2 py-2 text-base leading-tight" : "aspect-square min-h-8 min-w-8 text-sm leading-none sm:text-base lg:text-lg",
        t.cls, dim && "opacity-20", selected && (wide ? "ring-4 ring-white ring-offset-2 ring-offset-navy-800" : "ring-2 ring-white ring-offset-2 ring-offset-navy-800"))}>
      <span className={wide ? "text-center" : ""}>{wide ? r.seat : r.district}</span>
      {wide && r.seats > 1 ? <span className="font-sans text-[11px] font-semibold">{r.seats} seats</span> : null}
      <span aria-hidden className={cn("absolute font-sans font-bold opacity-80", wide ? "top-0.5 right-1 text-[10px]" : "top-px right-0.5 text-[8px] lg:text-[10px]")}>{t.letter}</span>
      {mnf ? <span aria-hidden className={cn("absolute rounded-full bg-[#c7d2fe] ring-1 ring-navy-900", wide ? "bottom-1 left-1 size-2" : "bottom-0.5 left-0.5 size-1.5 lg:size-2")} /> : null}
      {chk ? <span aria-hidden className={cn("absolute font-sans font-bold text-[#fcd34d]", wide ? "bottom-0 left-1 text-[11px]" : "bottom-0 left-0.5 text-[9px] lg:text-[11px]")}>!</span> : null}
    </button>
  );
}

export function Legend({ office }: { office: Office }) {
  const keys: Status[] = office === "sb" ? ["contested", "unopposed", "none"] : ["contested", "D", "R", "Other", "none"];
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-dark-muted" aria-label="Tile legend">
      {keys.map((k) => (
        <li key={k} className="flex items-center gap-1.5"><span className={cn("inline-flex size-4 items-center justify-center rounded-sm border text-[9px] font-bold", TILE[k].cls)}>{TILE[k].letter}</span>{TILE[k].label}</li>
      ))}
      <li className="flex items-center gap-1.5"><span className="inline-block size-2 rounded-full bg-[#c7d2fe]" aria-hidden /> = Member not filed yet (the current member has no counted 2027 committee; the seat is not vacant)</li>
      <li className="flex items-center gap-1.5"><span className="text-[11px] font-bold text-[#fcd34d]" aria-hidden>!</span> = Check (the member's committee has a Virginia Department of Elections record flag)</li>
    </ul>
  );
}

export const MEMBER_ROUTE = { house: "/dashboards/house/members", senate: "/dashboards/senate/members" } as const;
export const PARTY_WORD = (p: string | null | undefined) => (p === "D" ? "Democrat" : p === "R" ? "Republican" : p === "Other" ? "Other party" : "Party not listed");
export const PARTY_BADGE: Record<string, string> = { D: "bg-[#2563c9]", R: "bg-flag", Other: "bg-[#7c4dbd]", none: "bg-[#5d667a]" };
export const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Text with the matched search words highlighted. */
export function Hi({ text, terms }: { text: string; terms?: Term[] }) {
  if (!terms?.length) return <>{text}</>;
  return <span>{highlight(text, terms).map((p, i) => (p.hit ? <mark key={i} className="rounded-sm bg-gold px-0.5 text-navy-900">{p.t}</mark> : p.t))}</span>;
}
export const membersOf = (r: Race): Member[] => r.current_members ?? (r.current_member ? [r.current_member] : []);

export function MemberLine({ r, office, terms }: { r: Race; office: Office; terms?: Term[] }) {
  const ms = membersOf(r);
  if (!ms.length) {
    return <p className="text-xs text-on-dark-muted">Current member: {office === "house" || office === "senate" ? "seat vacant on the official member list" : "not shown (no official roster the page can read for this board yet)"}.</p>;
  }
  return (
    <p className="text-xs text-on-dark-muted">
      Current {ms.length > 1 ? "members" : "member"}:{" "}
      {ms.map((m, i) => (
        <span key={m.name}>
          {i ? ", " : ""}<span className="font-semibold text-white"><Hi text={m.name} terms={terms} /></span>
          {m.party ? ` (${PARTY_WORD(m.party)})` : ""}
          {m.slug && (office === "house" || office === "senate") ? <> <Link to={`${MEMBER_ROUTE[office]}/${m.slug}` as never} className="text-gold underline">member file</Link></> : null}
        </span>
      ))}
      {" · "}<a href={ms[0].source_url} {...ext} className="text-gold underline">{office === "house" ? "House of Delegates member list" : office === "senate" ? "Senate of Virginia member list" : "official board page"}</a>
    </p>
  );
}

/** One registered committee (or, once posted, a ballot listing). */
export function RegCandidate({ c, e, today, terms }: { c: Cand; e: Entry; today: ReturnType<typeof todayET>; terms?: Term[] }) {
  const pk = c.party ?? "none";
  return (
    <li className="rounded-md border border-navy-line bg-navy-800 px-3 py-2 text-sm">
      <p className="flex flex-wrap items-center gap-2 font-semibold text-white">
        <Hi text={c.name} terms={terms} />
        <span className={cn("rounded-sm px-1.5 text-[11px] font-bold text-white", PARTY_BADGE[pk] ?? PARTY_BADGE.Other)} title="Party as listed in the official committee record">
          {c.party === "Other" && c.party_label ? c.party_label : PARTY_WORD(c.party)}
        </span>
        <span className="text-xs font-normal text-on-dark-muted">{c.incumbent ? "Current member" : e.race.members_known ? "Challenger" : ""}</span>
        {isNewCandidate(c, today) ? <span className="inline-flex min-h-5 items-center rounded-full bg-gold px-2 text-[10px] font-bold tracking-[0.14em] text-navy-900 uppercase" title="Registered in the last 7 days, by the official date">New</span> : null}
      </p>
      <p className="text-xs text-[#F6F3EA]">{c.label ?? "Registered campaign committee, not yet on the ballot"}</p>
      <p className="text-xs text-on-dark-muted">
        {c.committee_name ? <><Hi text={c.committee_name} terms={terms} /> · </> : null}
        {c.filed_date && c.filed_date_source_url ? <>Registered {c.filed_date} · </> : "Registration date not in the official record · "}
        {c.latest_report_filed ? <>latest report filed {c.latest_report_filed} · </> : null}
        <a href={c.committee_url ?? c.filing_source_url} {...ext} className="text-gold underline">Official committee record</a>
      </p>
    </li>
  );
}

export function rdLine(r: Race, office: Office) {
  const c = partyCount({ office, race: r, status: statusOf(r, office), localityIds: [], localityName: null });
  return `${c.R} Republican · ${c.D} Democrat${c.Other ? ` · ${c.Other} other party` : ""}${c.notListed ? ` · ${c.notListed} party not listed` : ""}`;
}
export function seatSuffix(r: Race) {
  return isCheck(r) ? " · check record" : memberNotFiled(r) ? " · member not filed yet" : "";
}
/** Plain explanation under a seat whose member has not filed, or whose member's record is flagged. */
export function SeatNote({ r }: { r: Race }) {
  if (isCheck(r)) return <p className="mt-1 text-xs text-[#fcd34d]">Check: {r.check!.note} <a href={r.check!.committee_url} {...ext} className="text-gold underline">Committee record</a></p>;
  if (memberNotFiled(r)) return <p className="mt-1 text-xs text-on-dark-muted">Member not filed yet: {MEMBER_NOT_FILED_NOTE}</p>;
  return null;
}
export function statusWord(st: Status) {
  return st === "none" ? "No registered committee yet" : st === "contested" ? "Contested (registrations)" : st === "unopposed" ? "One registered committee" : `${PARTY_LABEL[st as PartyFilter]} only (registrations)`;
}

/** inline: render as a panel in the page flow (House / Senate: below the full-width grid), with no backdrop or bottom sheet. */
export function Card({ r, office, asOf, onClose, inline }: { r: Race; office: Office; asOf: string; onClose: () => void; inline?: boolean }) {
  const e = ENTRY_BY_KEY.get(`${office}:${r.id}`)!;
  const st = statusOf(r, office);
  const title = `${r.locality ? `${r.locality} ${r.body} · ` : ""}${office === "house" ? "House District " + r.district : office === "senate" ? "Senate District " + r.district : r.seat}`;
  const today = todayET();
  return (
    <>
      {inline ? null : <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}
      <section role={inline ? "region" : "dialog"} aria-label={title} id={inline ? "seat-panel" : undefined}
        className={inline ? "scroll-mt-24 rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5"
          : "fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t-4 border-gold bg-navy-700 p-5 shadow-2xl lg:static lg:z-auto lg:max-h-none lg:rounded-[10px] lg:border lg:border-navy-line lg:border-t-4 lg:border-t-gold lg:shadow-none"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-widest text-gold uppercase">{statusWord(st)}{seatSuffix(r)}</p>
            <h3 className="mt-1 font-serif text-2xl font-bold uppercase">{title}</h3>
            <p className="text-sm text-on-dark-muted">{rdLine(r, office)}{r.seats > 1 ? ` · ${r.seats} seats, top ${r.seats} win` : ""}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close district card" className="rounded-md p-1 text-gold hover:bg-navy-600"><X className="size-5" /></button>
        </div>
        <div className="mt-2"><MemberLine r={r} office={office} /></div>
        <SeatNote r={r} />
        {r.localities?.length ? <p className="mt-1 text-xs text-on-dark-muted">Covers {r.localities.map((l) => `${l.coverage === "all" ? "all" : "part"} of ${l.locality}`).join(", ")} (among the localities this page tracks).</p> : null}
        {r.candidates.length ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">{r.candidates.map((c) => <RegCandidate key={c.committee_code ?? c.name} c={c} e={e} today={today} />)}</ul>
        ) : <p className="mt-3 rounded-md border border-dashed border-navy-line px-3 py-3 text-sm text-on-dark-muted">No registered 2027 campaign committee for this seat in the official state record as of {fmtDate(asOf)}, and no official ballot list yet.</p>}
        {r.shared_with?.length ? (
          <p className="mt-2 text-xs text-on-dark-muted">Shared office: voters in {r.shared_with.map((x, i) => (
            <span key={x.locality}>{i ? (i === r.shared_with!.length - 1 ? " and " : ", ") : ""}{x.locality} <a href={x.source_url} {...ext} className="text-gold underline">(source)</a></span>
          ))} also vote in this race.</p>
        ) : null}
        {r.note ? <p className="mt-2 text-xs text-[#F6F3EA]">Note: {r.note} {r.note_source_url ? <a href={r.note_source_url} {...ext} className="text-gold underline">Source</a> : null}</p> : null}
        <p className="mt-3 border-t border-navy-line pt-2 text-xs text-on-dark-muted">
          Seat on the ballot: <a href={r.source_url} {...ext} className="text-gold underline">{office === "co" ? "official source" : "Department of Elections calendar"}</a>. Registrations: <a href={REG_SOURCE} {...ext} className="text-gold underline">Department of Elections campaign finance reports</a>. Ballot lists: <a href={r.filing_source_url} {...ext} className="text-gold underline">Department of Elections candidate lists</a>
          {r.local_filing_source_url ? <>, <a href={r.local_filing_source_url} {...ext} className="text-gold underline">{r.locality} elections office</a></> : null} (none posted yet), as of {fmtDate(asOf)}.
        </p>
      </section>
    </>
  );
}

export const DIR_FILES = { house: HOUSE, senate: SENATE, sb: SB, bos: BOS, co: CO } as unknown as Record<Office, OfficeFile>;
export const ENTRIES = flatten(DIR_FILES);
export const ENTRY_BY_KEY = new Map(ENTRIES.map((e) => [`${e.office}:${e.race.id}`, e]));
export const LOC_OPTIONS = localityOptions(DIR_FILES);
export const REG_SOURCE = (HOUSE as { registrations_source_url?: string }).registrations_source_url ?? "https://apps.elections.virginia.gov/SBE_CSV/CF/";
