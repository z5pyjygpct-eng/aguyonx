/** Helpers for the per-venue budget page data files (Manassas, Fairfax City, Albemarle). */
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { BudgetFileDoc } from "@/components/site/budget-page";
import { BudgetDocSearch, type BudgetSearchConfig, type TopicChip } from "@/components/site/budget-page/budget-search";

export const pctOf = (n: number, total: number, digits = 1) => `${((n / total) * 100).toFixed(digits)}%`;

/** Inline source link (every figure on these pages points at its page). */
export function S({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" className="text-gold underline-offset-2 hover:underline">{children}</a>;
}
export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return <a className="text-gold hover:underline" href={href} target="_blank" rel="noreferrer">{children} <ExternalLink className="inline size-3" /></a>;
}

export type VenueDoc = BudgetFileDoc & { searchable: boolean };
/** A source document: hosted under /files/<venue>-budget/ when small, otherwise linked to the official URL. */
export function vdoc(venue: string, stem: string, o: { label: string; kind: string; dek: string; bytes: number; official?: string; source: string; searchable?: boolean }): VenueDoc {
  const hosted = !o.official;
  return {
    label: o.label, dek: o.dek, kind: o.kind, source: o.source, extractId: `${venue}-${stem}`,
    href: hosted ? `/files/${venue}-budget/${venue}-${stem}.pdf` : o.official!,
    sizeLabel: hosted ? `${(o.bytes / 1e6).toFixed(1)} MB` : `${(o.bytes / 1e6).toFixed(1)} MB · official link`,
    searchable: o.searchable ?? true,
  };
}

export function venueSearch(venue: string, docs: VenueDoc[], o: { chips: TopicChip[]; srLabel: string; placeholder: string; tokens: string }): ReactNode {
  const cfg: BudgetSearchConfig = {
    docs: docs.filter((d) => d.searchable),
    extractHref: (d) => `/files/${venue}-budget/extracts/${d.extractId}.json`,
    chips: o.chips,
    inputId: `${venue}-budget-q`,
    srLabel: o.srLabel,
    intro: <>Looks inside the budget documents listed below, including the big books we link to rather than host, not just filenames. Proposed ≠ adopted stays labeled on each hit.</>,
    placeholder: o.placeholder,
    emptyHint: <>Nothing matched in these budget records. Try a shorter word ({o.tokens}) or part of a dollar figure. This only searches the files listed below, not the whole site.</>,
  };
  return <BudgetDocSearch cfg={cfg} />;
}
