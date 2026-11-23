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
    id: "glen-pine",
    name: "Glen Pine",
    officeSought: "House of Delegates, District 5 (Democratic primary vs. Del. Kirk McPike)",
    locality: "Alexandria",
    status: "declared",
  },
  {
    id: "john-michael-forrest",
    name: "John Michael Forrest",
    officeSought: "House of Delegates, District 14 (Democratic primary vs. Del. Vivian Watts)",
    locality: "Fairfax County",
    status: "declared",
  },
  {
    id: "brittany-dunn-pirio",
    name: "Brittany Dunn-Pirio",
    officeSought: "Fairfax Commonwealth's Attorney",
    locality: "Fairfax County",
    status: "declared",
  },
  {
    id: "lisa-zargarpur",
    name: "Lisa Zargarpur",
    officeSought: "Prince William Coles District Supervisor",
    locality: "Prince William County",
    status: "declared",
  },
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
  {
    id: "rachna-sizemore-heizer",
    name: "Rachna Sizemore Heizer",
    officeSought: "Fairfax Braddock District Supervisor (reelection)",
    locality: "Fairfax County",
    status: "declared",
  },  {
    id: "rodney-willett",
    name: "Rodney Willett",
    officeSought: "House of Delegates, District 58 (reelection)",
    locality: "Henrico",
    status: "declared",
  },
  {
    id: "schuyler-vanvalkenburg",
    name: "Schuyler VanValkenburg",
    officeSought: "Virginia Senate, District 16 (reelection)",
    locality: "Henrico",
    status: "declared",
  },
  {
    id: "kimberly-pope-adams",
    name: "Kimberly Pope Adams",
    officeSought: "House of Delegates, District 82 (reelection)",
    locality: "Petersburg, Surry, Dinwiddie, Prince George",
    status: "declared",
  },
  {
    id: "phyllis-randall",
    name: "Phyllis Randall",
    officeSought: "Loudoun Chair (reelection)",
    locality: "Loudoun County",
    status: "declared",
  },
  {
    id: "andres-jimenez",
    name: "Andres Jimenez",
    officeSought: "Fairfax Mason District Supervisor (reelection)",
    locality: "Fairfax County",
    status: "declared",
  },
  {
    id: "melanie-meren",
    name: "Melanie Meren",
    officeSought: "Fairfax Board of Supervisors Chair (Democratic primary)",
    locality: "Fairfax County",
    status: "declared",
  },
  {
    id: "bryan-graham",
    name: "Bryan Graham",
    officeSought: "Fairfax Providence District Supervisor",
    locality: "Fairfax County",
    status: "declared",
  },
  {
    id: "kathy-smith",
    name: "Kathy Smith",
    officeSought: "Fairfax Sully District Supervisor (reelection)",
    locality: "Fairfax County",
    status: "declared",
  },
  {
    id: "walter-alcorn",
    name: "Walter Alcorn",
    officeSought: "Fairfax Hunter Mill District Supervisor (reelection)",
    locality: "Fairfax County",
    status: "declared",
  },
  {
    id: "dan-storck",
    name: "Dan Storck",
    officeSought: "Fairfax Mount Vernon District Supervisor (reelection)",
    locality: "Fairfax County",
    status: "declared",
  },
  {
    id: "natalie-nguyen-woodruff",
    name: "Natalie Nguyen Woodruff",
    officeSought: "Fairfax Springfield District Supervisor (planning to run)",
    locality: "Fairfax County",
    status: "potential",
  },
];

export function newsForCandidate(name: string): NewsItem[] {
  const needle = name.trim().toLowerCase();
  if (!needle) return [];
  return NEWS.filter((item) => item.people.some((p) => p.name.toLowerCase() === needle));
}
