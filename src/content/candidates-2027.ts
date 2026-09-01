import { NEWS, type NewsItem } from "@/content/news";

/** Public taste only: name, office sought, locality, sourced status. No shop files. */
export type CandidateStatus = "declared" | "potential";

export type Candidate2027 = {
  id: string;
  name: string;
  officeSought: string;
  locality?: string;
  /** Only when a public news clip or filing supports it. */
  status?: CandidateStatus;
};

export const CANDIDATES_2027_DEK =
  "Declared and potential Democratic candidates for 2027 (House, Senate, local). 2027 also covers constitutional officers (Commonwealth's Attorney, Commissioner of Revenue, Treasurer, Sheriff) when a Democrat is sitting or declared. This is a name file, not the shop. Links to already-public news when we have them.";

export const CANDIDATES_2027_EMPTY =
  "No sourced 2027 Democratic candidates on this roster yet. Tips and corrections: @VaChangeAgent on X.";

/** Seed only people with a public source. Do not invent a caucus-wide list. */
export const CANDIDATES_2027: Candidate2027[] = [
  {
    id: "juli-briskman",
    name: "Juli Briskman",
    officeSought: "Loudoun Chair",
    locality: "Loudoun County",
    status: "declared",
  },
  {
    id: "ryan-ruzic",
    name: "Ryan Ruzic",
    officeSought: "Loudoun Commonwealth's Attorney",
    locality: "Loudoun County",
    status: "declared",
  },
];

export function newsForCandidate(name: string): NewsItem[] {
  const needle = name.trim().toLowerCase();
  if (!needle) return [];
  return NEWS.filter((item) => item.people.some((p) => p.name.toLowerCase() === needle));
}
