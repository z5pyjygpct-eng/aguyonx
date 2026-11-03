/** Venue labels and issue list for the /mockups voter pages, split out so route search validation stays light. */
export type VenueKey =
  | "loudoun-bos" | "loudoun-lcps" | "albemarle-bos" | "albemarle-schools" | "fairfax-city-council"
  | "fairfax-city-schools" | "manassas-council" | "manassas-schools" | "va-house" | "va-senate" | "va-boe";

export const VENUE_LABEL: Record<VenueKey, string> = {
  "loudoun-bos": "Loudoun Board of Supervisors",
  "loudoun-lcps": "Loudoun School Board",
  "albemarle-bos": "Albemarle Board of Supervisors",
  "albemarle-schools": "Albemarle School Board",
  "fairfax-city-council": "City of Fairfax City Council",
  "fairfax-city-schools": "City of Fairfax School Board",
  "manassas-council": "Manassas City Council",
  "manassas-schools": "Manassas City School Board",
  "va-house": "Virginia House of Delegates (floor)",
  "va-senate": "Senate of Virginia (floor)",
  "va-boe": "Virginia Board of Education",
};

export type Issue = { id: string; label: string; plain: string; re: RegExp; searchTerms: string[]; ftmQuery: string };
export const ISSUES: Issue[] = [
  { id: "taxes", label: "Taxes and the budget", plain: "What your local boards decided about tax rates, budgets and spending.", re: /\b(tax(es)?|budget|appropriat\w*|levy|fiscal|real estate rate)\b/i, searchTerms: ["taxes", "budget"], ftmQuery: "budget" },
  { id: "data-centers", label: "Data centers", plain: "Votes and meeting moments about data centers, power lines and zoning for them.", re: /\b(data ?cent(er|re)s?|transmission line|substation)\b/i, searchTerms: ["data centers"], ftmQuery: "data centers" },
  { id: "schools", label: "Schools", plain: "School budgets, policies and other school decisions, on school boards and county boards.", re: /\b(school|schools|student|students|teacher|teachers|curriculum|LCPS|ACPS)\b/i, searchTerms: ["schools"], ftmQuery: "schools" },
  { id: "safety", label: "Public safety", plain: "Police, sheriff, fire and rescue, emergency services and school safety.", re: /\b(police|sheriff\w*|fire|rescue|public safety|safety|emergency|crime|SRO|law enforcement)\b/i, searchTerms: ["safety", "police"], ftmQuery: "public safety" },
];
