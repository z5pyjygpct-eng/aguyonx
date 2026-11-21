/**
 * County / city filter for the 2027 Delegates and Senate pages. Pure functions over each chamber's
 * official coverage data (race.localities from the ELECT registrant-count files).
 */
import type { Coverage, Race } from "./elections-2027.ts";

export type LocalityOption = { id: string; name: string; displayName: string };

const CITY_IDS = new Set(["fairfax-city", "manassas"]);

/** Official coverage names often omit "County" / "City"; add them for display only. */
export function displayLocalityName(id: string, name: string): string {
  const n = name.trim();
  if (/\b(County|City)\b/i.test(n)) return n;
  if (CITY_IDS.has(id) || /city$/i.test(id)) return n.toLowerCase().startsWith("city of ") ? n : `City of ${n}`;
  return `${n} County`;
}

/** Unique localities in a chamber's coverage data, alphabetical by display name. */
export function chamberLocalityOptions(races: Race[]): LocalityOption[] {
  const seen = new Map<string, LocalityOption>();
  for (const r of races) {
    for (const l of r.localities ?? []) {
      if (seen.has(l.locality_id)) continue;
      seen.set(l.locality_id, { id: l.locality_id, name: l.locality, displayName: displayLocalityName(l.locality_id, l.locality) });
    }
  }
  return [...seen.values()].sort((a, b) => a.displayName.localeCompare(b.displayName, "en"));
}

/** Districts in this chamber that include all or part of a locality, in district order. */
export function racesForChamberLocality(races: Race[], localityId: string): { race: Race; cov: Coverage }[] {
  return races
    .flatMap((race) => (race.localities ?? []).filter((l) => l.locality_id === localityId).map((cov) => ({ race, cov })))
    .sort((a, b) => (a.race.district ?? 0) - (b.race.district ?? 0));
}

/** Keep a non-empty ?county= value (lowercased). Unknown ids are left for the page to message. */
export function parseCountySearch(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const v = raw.trim().toLowerCase();
  return v || undefined;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export type CountyResolve =
  | { kind: "none" }
  | { kind: "known"; option: LocalityOption }
  | { kind: "unknown"; raw: string };

/** Resolve a ?county= value against a chamber's locality list (id, official name, or display name). */
export function resolveCountyParam(raw: string | undefined, options: LocalityOption[]): CountyResolve {
  if (!raw) return { kind: "none" };
  const q = raw.trim().toLowerCase();
  if (!q) return { kind: "none" };
  const byId = options.find((o) => o.id === q);
  if (byId) return { kind: "known", option: byId };
  const byName = options.filter((o) => {
    const name = o.name.toLowerCase();
    const display = o.displayName.toLowerCase();
    return name === q || display === q || slug(o.displayName) === q || slug(o.name) === q;
  });
  if (byName.length === 1) return { kind: "known", option: byName[0] };
  return { kind: "unknown", raw: raw.trim() };
}

/** Localities whose id, official name or display name contains the typed query. Empty query returns all. */
export function matchLocalityQuery(q: string, options: LocalityOption[]): LocalityOption[] {
  const n = q.trim().toLowerCase();
  if (!n) return options;
  const slugQ = n.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return options.filter((o) =>
    o.displayName.toLowerCase().includes(n) || o.name.toLowerCase().includes(n) || o.id.includes(slugQ) || slug(o.displayName).includes(slugQ),
  );
}

/** Per-district coverage line: "whole" or "part", plus precincts X of Y from the official record. */
export function districtCoverageText(cov: Coverage): string {
  const share = cov.coverage === "all" ? "whole" : "part";
  return `${share} (${cov.precincts} of ${cov.locality_precincts} precincts)`;
}

export type LocalitySummary = {
  line: string;
  consistent: boolean;
  precincts: number;
  localityPrecincts: number;
  count: number;
};

/**
 * Summary under the county filter. The precinct-total ("X of Y precincts covered") is included only when
 * every district reports the same locality_precincts and the precincts sum to that number. Split-precinct
 * mismatches (for example Senate Loudoun 108 vs 107) are described as "part" coverage with no claimed total.
 */
export function localityCoverageSummary(
  matches: { cov: Coverage }[],
  chamber: "house" | "senate",
  displayName: string,
): LocalitySummary {
  const n = matches.length;
  const noun = chamber === "house" ? "House" : "Senate";
  const unit = n === 1 ? "district" : "districts";
  const verb = n === 1 ? "includes" : "include";
  const precincts = matches.reduce((s, m) => s + m.cov.precincts, 0);
  const localityPrecincts = matches[0]?.cov.locality_precincts ?? 0;
  const sameTotal = n > 0 && matches.every((m) => m.cov.locality_precincts === localityPrecincts);
  const consistent = sameTotal && precincts === localityPrecincts;
  const allWhole = n > 0 && matches.every((m) => m.cov.coverage === "all");
  let line: string;
  if (!n) line = `No ${noun} districts include ${displayName} in this data.`;
  else if (consistent) {
    const place = allWhole ? `all of ${displayName}` : displayName;
    line = `${n} ${noun} ${unit} ${verb} ${place} (${precincts} of ${localityPrecincts} precincts covered)`;
  } else {
    line = `${n} ${noun} ${unit} ${verb} part of ${displayName}`;
  }
  return { line, consistent, precincts, localityPrecincts, count: n };
}

export function unknownCountyMessage(raw: string): string {
  return `No county or city in this chamber’s data matches “${raw}”.`;
}
