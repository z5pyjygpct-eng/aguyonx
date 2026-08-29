import type { Story } from "@/content/types";

export const ARTICLES: Story[] = [
  {
    slug: "the-2027-collection",
    kind: "article",
    title: "The 2027 collection: what to file now",
    dek: "Campaign finance, absentee procedures, and the media trail do not start in October. A researcher’s calendar starts eighteen months out.",
    date: "2026-08-08",
    displayDate: "August 8, 2026",
    topic: "Elections",
    kicker: "Elections · 2027",
    image: "/images/courthouse.jpg",
    imageAlt: "Virginia county courthouse on an overcast morning",
    access: "public",
    readMinutes: 6,
    body: [
      {
        type: "p",
        text: "Off-year Virginia is not off. Municipal and county races, party nominations, and the early money reports are already a public record. Waiting for a mailer is how you get surprised.",
        cites: ["a1"],
      },
      {
        type: "p",
        text: "The 2027 file should already contain: incumbent finance reports, Board of Supervisors hearing attendance on the issues they campaign on, and a running log of public comments they have entered into the record.",
        cites: ["a2"],
      },
      {
        type: "quote",
        text: "If the story only works when you hide a document, it is not a story. It is a flyer.",
      },
      {
        type: "p",
        text: "Citizen research is not opposition research dressed up. It is the same primary sources, offered to anyone. VPIP exists because the media trail is scattered. Aggregate it by subject, date it, and you can see what a candidate wants photographed — and what they never mention.",
      },
    ],
    citations: [
      {
        id: "a1",
        label: "Virginia Public Access Project (VPAP)",
        href: "https://www.vpap.org/",
      },
      {
        id: "a2",
        label: "Virginia Department of Elections",
        href: "https://www.elections.virginia.gov/",
      },
    ],
    documents: [
      {
        id: "ad1",
        title: "Sample campaign-finance notes (CSV)",
        href: "/library/campaign-finance-sample.csv",
        kind: "csv",
      },
    ],
  },
  {
    slug: "reading-a-county-budget",
    kind: "article",
    title: "Reading a county budget like an investigator",
    dek: "The adopted book is a map. The amendments, transfers, and capital overlay are where the decisions hide.",
    date: "2026-07-29",
    displayDate: "July 29, 2026",
    topic: "Budget",
    kicker: "Loudoun · Budget",
    image: "/images/records.jpg",
    imageAlt: "Bound ledgers on a wooden table in a records office",
    access: "public",
    readMinutes: 7,
    body: [
      {
        type: "p",
        text: "A budget hearing is theater with a spreadsheet. The useful questions are smaller: which line grew, which capital project moved a year, which transfer happened after adoption without a headline.",
        cites: ["b1"],
      },
      {
        type: "p",
        text: "Start with the adopted budget, then the quarterly reports, then the staff item that moved money. Write down the ordinance number. If a project is “fully funded” in a press release and “outyear” in the CIP, that contradiction is the briefing.",
      },
      {
        type: "p",
        text: "Data-center tax revenue is the gravitational field of Loudoun finance. That does not make every appropriation a scandal. It does mean every claim about what the county can afford has a number attached. Find the number.",
      },
    ],
    citations: [
      {
        id: "b1",
        label: "Loudoun County Budget",
        href: "https://www.loudoun.gov/budget",
      },
    ],
    documents: [],
  },
  {
    slug: "school-board-packets",
    kind: "article",
    title: "School board packets without the spin",
    dek: "Policies, contracts, and closed-session certifications are public even when the comment thread is not.",
    date: "2026-06-18",
    displayDate: "June 18, 2026",
    topic: "Schools",
    kicker: "Schools · Records",
    image: "/images/courthouse.jpg",
    imageAlt: "Brick civic building behind mature oaks",
    access: "public",
    readMinutes: 5,
    body: [
      {
        type: "p",
        text: "School governance is a records problem wearing a culture-war costume. The costume is loud. The contract, the policy draft, and the closed-session certification are quiet, dated, and usually downloadable.",
        cites: ["s1"],
      },
      {
        type: "p",
        text: "Ask for the packet. Ask for the legal opinion if one was cited. Ask for the vendor agreement if a curriculum or security product is on the agenda. You will not get personnel files. You will get the action the board actually took.",
      },
      {
        type: "p",
        text: "Parents and taxpayers do not need a newsroom to do this. They need a folder, a FOIA letter, and the patience to read past the first page.",
      },
    ],
    citations: [
      {
        id: "s1",
        label: "Loudoun County Public Schools",
        href: "https://www.lcps.org/",
      },
    ],
    documents: [],
  },
];

export function articleBySlug(slug: string) {
  return ARTICLES.find((s) => s.slug === slug);
}
