export const SITE = {
  name: "A Guy on X",
  short: "AGX",
  domain: "aguyonx.com",
  url: "https://aguyonx.com",
  handle: "@VaChangeAgent",
  xUrl: "https://x.com/VaChangeAgent",
  bookUrl:
    "https://www.amazon.com/Grassroots-Intelligence-Citizen-Political-Research/dp/B0GV9FDS5H",
  location: "Loudoun County, Virginia",
  author: "A Guy on X",
  email: "contact@aguyonx.com",
  firm: "Coraggio Consulting",
  product: "VPIP",
  productLong: "Virginia Political Intelligence Portal",
  tagline: "Independent political intelligence.",
  credit:
    "A publication of Coraggio Consulting. VPIP is the commissioned intelligence desk. Contact is the door.",
  description:
    "A Guy on X is an independent investigative research desk covering Loudoun County and Virginia — FOIA, filings, campaign finance, and the public media trail.",
} as const;

export type FoiaAgency = {
  id: string;
  name: string;
  address: string;
  notes: string;
};

export const FOIA_AGENCIES: FoiaAgency[] = [
  {
    id: "loudoun-county",
    name: "Loudoun County Government",
    address: "FOIA Officer, P.O. Box 7000, Leesburg, VA 20177",
    notes: "County administration, departments, and most Board-related records.",
  },
  {
    id: "loudoun-bos",
    name: "Loudoun County Board of Supervisors",
    address: "Office of the County Administrator / FOIA, Leesburg, VA 20175",
    notes: "Packets, correspondence of the public body, work-session materials.",
  },
  {
    id: "lcps",
    name: "Loudoun County Public Schools",
    address: "LCPS FOIA Officer, 21000 Education Court, Ashburn, VA 20148",
    notes: "Board packets, contracts, and policies. Personnel files are exempt.",
  },
  {
    id: "vaelections",
    name: "Virginia Department of Elections",
    address: "FOIA Officer, 1100 Bank Street, Richmond, VA 23219",
    notes: "Statewide election administration records.",
  },
  {
    id: "scc",
    name: "Virginia State Corporation Commission",
    address: "Clerk of the Commission, Tyler Building, Richmond, VA 23219",
    notes: "Utility dockets and related public filings.",
  },
  {
    id: "governor",
    name: "Office of the Governor of Virginia",
    address: "FOIA Officer, Patrick Henry Building, Richmond, VA 23219",
    notes: "Executive records subject to VFOIA exemptions.",
  },
];
