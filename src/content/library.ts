import type { LibraryItem } from "@/content/types";

export const LIBRARY_KINDS: { id: LibraryItem["kind"]; label: string }[] = [
  { id: "government", label: "Government" },
  { id: "foia", label: "FOIA" },
  { id: "dataset", label: "Datasets" },
  { id: "campaign-finance", label: "Campaign finance" },
  { id: "report", label: "Reports" },
  { id: "tool", label: "Tools" },
];

export const LIBRARY: LibraryItem[] = [
  {
    slug: "foia-desk",
    title: "Virginia FOIA desk",
    summary:
      "Draft a VFOIA letter against a named public body. Stored on this device. It does not file anything.",
    date: "2026-08-01",
    displayDate: "August 2026",
    kind: "tool",
    source: "A Guy on X",
    access: "public",
    tool: "/library/foia",
  },
  {
    slug: "loudoun-data-center-file-index",
    title: "Working index — Loudoun data-center file",
    summary:
      "How this desk files an application number: justification, concept plan, referrals, conditions, missing exhibits.",
    date: "2026-08-18",
    displayDate: "August 18, 2026",
    kind: "government",
    source: "Desk file (sample method)",
    access: "public",
    file: "/library/loudoun-data-center-file-index.md",
  },
  {
    slug: "data-center-hearings-sample",
    title: "Data-center hearing counts (sample series)",
    summary:
      "Illustrative monthly counts compiled to demonstrate a hearing calendar as a dataset. Not an official extract.",
    date: "2026-08-18",
    displayDate: "August 18, 2026",
    kind: "dataset",
    source: "Public hearing calendars (sample)",
    access: "public",
    file: "/library/data-center-hearings-sample.csv",
  },
  {
    slug: "vfoia-request-template",
    title: "VFOIA request template",
    summary: "Plain-text letter under Va. Code § 2.2-3700 et seq. Copy, fill, send from your own mail.",
    date: "2026-08-12",
    displayDate: "August 12, 2026",
    kind: "foia",
    source: "Virginia FOIA",
    access: "public",
    file: "/library/vfoia-request-template.txt",
  },
  {
    slug: "campaign-finance-sample",
    title: "Campaign-finance notes (sample)",
    summary:
      "A starter sheet for filing periodic reports by committee, date, and source URL. Fill it from VPAP and the state reports.",
    date: "2026-08-08",
    displayDate: "August 8, 2026",
    kind: "campaign-finance",
    source: "VPAP / state reports (method sample)",
    access: "public",
    file: "/library/campaign-finance-sample.csv",
  },
  {
    slug: "grassroots-intelligence",
    title: "Grassroots Intelligence (the book)",
    summary:
      "A blueprint for citizen political research: FOIA, document analysis, and public records.",
    date: "2026-01-01",
    displayDate: "2026",
    kind: "report",
    source: "Grassroots Intelligence",
    access: "public",
    href: "https://www.amazon.com/Grassroots-Intelligence-Citizen-Political-Research/dp/B0GV9FDS5H",
  },
  {
    slug: "loudoun-land-use",
    title: "Loudoun land-development applications",
    summary: "Official county portal for legislative applications, commission permits, and related files.",
    date: "2026-08-01",
    displayDate: "Standing source",
    kind: "government",
    source: "Loudoun County",
    access: "public",
    href: "https://www.loudoun.gov/1914/Land-Development-Applications",
  },
  {
    slug: "vpap",
    title: "Virginia Public Access Project",
    summary: "Campaign finance, elections, and public-affairs data for the Commonwealth.",
    date: "2026-08-01",
    displayDate: "Standing source",
    kind: "campaign-finance",
    source: "VPAP",
    access: "public",
    href: "https://www.vpap.org/",
  },
];

export function libraryBySlug(slug: string) {
  return LIBRARY.find((i) => i.slug === slug);
}
