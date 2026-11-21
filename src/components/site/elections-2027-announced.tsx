import { cn } from "@/lib/utils";
import { announcedLine, type Announced } from "@/lib/elections-2027";
import { FinanceLink } from "@/components/site/finance-link";

/**
 * Announced 2027 candidates (race.announced): public announcements or VPAP listings with no counted 2027 committee in the state
 * campaign finance data. Shown in the Challenger slot next to filed candidates, always with an asterisk and the plain note
 * "* Announced, not yet officially filed with the state" plus a named source link. Never counted in seat totals, statuses or colors.
 */
export const ASTERISK_NOTE = "A name with * announced a run but has not officially filed with the state; it is not counted in the totals.";
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export function AnnouncedBadge({ party, label }: { party: string | null; label?: string | null }) {
  if (!party) return null;
  const word = party === "D" ? "Democrat" : party === "R" ? "Republican" : label && label !== "Other" ? label : "Independent / Other";
  const cls = party === "D" ? "bg-[#2563c9] text-white" : party === "R" ? "bg-flag text-white" : "bg-slate-500 text-white";
  return <span className={cn("inline-flex rounded-sm px-1.5 py-px text-[11px] font-bold whitespace-nowrap", cls)} title="Party the source gives for this announced candidate">{word}</span>;
}

/** The asterisk note with the named source (never a raw URL) and, when we have it, the official record link. */
export function AnnouncedNote({ a }: { a: Announced }) {
  return (
    <p className="mt-0.5 text-xs text-on-dark-muted" data-announced-note={a.name}>
      {announcedLine(a)}
      {a.source_url ? <>{" · "}<a href={a.source_url} {...ext} className="text-gold underline">{a.source_label ?? "Source"}</a></> : null}
      {a.record_url ? <>{" · "}<a href={a.record_url} {...ext} className="text-gold underline">State record</a></> : null}
    </p>
  );
}

/** One announced candidate in a challenger list: name*, party badge (when shown), and the asterisk note. */
export function AnnouncedName({ a, badge = true, sameParty = false }: { a: Announced; badge?: boolean; sameParty?: boolean }) {
  return (
    <div data-announced={a.name}>
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold text-white">{a.name}<span className="text-gold" aria-label="announced, not yet officially filed">*</span></span>
        {badge ? <AnnouncedBadge party={a.party} label={a.party_label} /> : null}
        {sameParty ? <span className="text-xs text-on-dark-muted">same party (possible primary)</span> : null}
        <FinanceLink url={a.finance_committee_url} name={a.name} />
      </span>
      <AnnouncedNote a={a} />
    </div>
  );
}

/** Card version for the seat panel and the all-races list (same box as a registered committee). */
export function AnnouncedCard({ a, badge = true }: { a: Announced; badge?: boolean }) {
  return (
    <li className="rounded-md border border-dashed border-gold/50 bg-navy-800 px-3 py-2 text-sm" data-announced={a.name}>
      <p className="flex flex-wrap items-center gap-2 font-semibold text-white">
        <span>{a.name}<span className="text-gold" aria-label="announced, not yet officially filed">*</span></span>
        {badge ? <AnnouncedBadge party={a.party} label={a.party_label} /> : null}
        <span className="text-xs font-normal text-on-dark-muted">Challenger</span>
      </p>
      <AnnouncedNote a={a} />
    </li>
  );
}
