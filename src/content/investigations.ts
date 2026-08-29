import type { Story } from "@/content/types";

export const INVESTIGATIONS: Story[] = [
  {
    slug: "loudoun-data-center-file",
    kind: "investigation",
    title: "How to read a Loudoun data-center file",
    dek: "Special exceptions, commission permits, and the exhibits staff actually attach — a working method, not a rumor mill.",
    date: "2026-08-18",
    displayDate: "August 18, 2026",
    topic: "Data centers",
    kicker: "Investigation · Land use",
    image: "/images/data-centers.jpg",
    imageAlt: "Northern Virginia data center campus at dusk",
    access: "public",
    readMinutes: 12,
    body: [
      {
        type: "p",
        text: "Loudoun County is the densest data-center market on earth. That fact is not a talking point. It is a paper trail: legislative applications, commission permits, proffer statements, traffic studies, and the energy-and-water exhibits that rarely make the first paragraph of a news story.",
        cites: ["c1"],
      },
      {
        type: "p",
        text: "A citizen researcher does not start with a town hall. They start with the application number. From there the file is public: the statement of justification, the concept plan, the referral comments from planning staff, and the conditions the Board of Supervisors actually voted on.",
        cites: ["c2"],
      },
      {
        type: "x",
        url: "https://x.com/VaChangeAgent/status/2093039470664720468",
        handle: "VaChangeAgent",
        name: "A Guy on X",
        date: "Aug 27, 2026",
        text: "Loudoun County Democrat BOS Members to hold TWO more data center and energy town-halls.",
      },
      {
        type: "h2",
        text: "The file, in order",
      },
      {
        type: "p",
        text: "Name the record. Date it. Quote it. Then ask what is missing. If a hearing packet cites a load letter from the utility and the letter is not attached, that gap is the next request — not a thread.",
        cites: ["c3"],
      },
      {
        type: "chart",
        chart: "hearings",
      },
      {
        type: "p",
        text: "The series above is a working sample compiled from public hearing calendars to show the method: count the items, then open the packet. It is not a substitute for the application file.",
      },
      {
        type: "quote",
        text: "The argument, if you want one, belongs after the documents.",
        attrib: "Desk rule",
      },
      {
        type: "callout",
        title: "What to FOIA next",
        text: "When a staff item cites an exhibit that is not in the public packet — a load letter, a traffic addendum, a closed-session certification — name that exhibit in the request. Precision beats volume.",
      },
    ],
    citations: [
      {
        id: "c1",
        label: "Loudoun County Department of Planning & Zoning — Land Development Applications",
        href: "https://www.loudoun.gov/1914/Land-Development-Applications",
      },
      {
        id: "c2",
        label: "Loudoun County Board of Supervisors — meeting packets and actions",
        href: "https://www.loudoun.gov/bos",
      },
      {
        id: "c3",
        label: "Virginia Freedom of Information Act, Va. Code § 2.2-3700 et seq.",
        href: "https://law.lis.virginia.gov/vacode/title2.2/chapter37/",
      },
      {
        id: "c4",
        label: "Virginia State Corporation Commission — utility dockets",
        href: "https://www.scc.virginia.gov/",
      },
    ],
    documents: [
      {
        id: "d1",
        title: "Working index — Loudoun data-center file (sample)",
        href: "/library/loudoun-data-center-file-index.md",
        kind: "md",
        note: "How this desk files an application number.",
      },
      {
        id: "d2",
        title: "Sample hearing-count series (CSV)",
        href: "/library/data-center-hearings-sample.csv",
        kind: "csv",
      },
    ],
  },
  {
    slug: "foia-a-work-session",
    kind: "investigation",
    title: "FOIA a Board of Supervisors work session",
    dek: "The public meeting is the performance. The packet, the emails, and the markup are the record. Here is how to ask for them.",
    date: "2026-08-12",
    displayDate: "August 12, 2026",
    topic: "Public records",
    kicker: "Investigation · VFOIA",
    image: "/images/records.jpg",
    imageAlt: "County records room with filing cabinets and ledgers",
    access: "public",
    readMinutes: 9,
    body: [
      {
        type: "p",
        text: "Virginia’s Freedom of Information Act is not a slogan. It is a five-day clock, a set of exemptions, and a duty on the public body to produce records in the form they exist.",
        cites: ["f1"],
      },
      {
        type: "p",
        text: "Work sessions are where boards think out loud. The video is useful. The staff memorandum is better. The email thread that produced the memorandum is often the thing that was never supposed to be the story.",
      },
      {
        type: "h2",
        text: "Write a request that can be answered",
      },
      {
        type: "p",
        text: "A precise request beats a fishing expedition. Name the meeting date, the item number, and the record types: packets, presentations, draft motions, and correspondence among staff and members about that item in a defined window.",
        cites: ["f2"],
      },
      {
        type: "p",
        text: "Use the FOIA desk in the Research Library to draft the letter. Send it from your own email. Calendar the five business days. If you get a cost estimate, ask for a sample page before you pay. That is not aggression. That is literacy.",
      },
      {
        type: "image",
        src: "/images/desk.jpg",
        alt: "Research desk with FOIA envelopes and stacked public records",
        caption: "The useful request names a meeting, an application number, or a date range.",
      },
    ],
    citations: [
      {
        id: "f1",
        label: "Virginia FOIA Advisory Council",
        href: "https://foiacouncil.dls.virginia.gov/",
      },
      {
        id: "f2",
        label: "Loudoun County FOIA",
        href: "https://www.loudoun.gov/foia",
      },
      {
        id: "f3",
        label: "Va. Code § 2.2-3704 — procedures for requesting records",
        href: "https://law.lis.virginia.gov/vacode/title2.2/chapter37/section2.2-3704/",
      },
    ],
    documents: [
      {
        id: "fd1",
        title: "VFOIA request template (plain text)",
        href: "/library/vfoia-request-template.txt",
        kind: "txt",
      },
    ],
  },
  {
    slug: "vpip-media-trail",
    kind: "investigation",
    title: "Building a subject dossier from the media trail",
    dek: "Clips are not evidence. A dated, sourced trail of public appearances is. This is the working loop behind VPIP.",
    date: "2026-07-22",
    displayDate: "July 22, 2026",
    topic: "Method",
    kicker: "Investigation · VPIP",
    image: "/images/desk.jpg",
    imageAlt: "Citizen researcher's desk with FOIA envelopes and public records",
    access: "public",
    readMinutes: 8,
    body: [
      {
        type: "p",
        text: "A freshman in Congress, a supervisor, a school-board member — each leaves a public wake: interviews, press releases, votes, and the donors who appear on the same day’s report. The work is not to have a take. The work is to put the wake in order.",
      },
      {
        type: "x",
        url: "https://x.com/VaChangeAgent/status/2093426241542197435",
        handle: "VaChangeAgent",
        name: "A Guy on X",
        date: "Aug 28, 2026",
        text: "VPIP, a custom built tool for Virginia politics, aggregated all of the public media trail on VA-10’s freshman, just since he got to Congress. Subject matter, dates, links, etc.",
      },
      {
        type: "h2",
        text: "Collect. File. Correlate.",
      },
      {
        type: "p",
        text: "VPIP — the Virginia Political Intelligence Portal — is the machine for that order. Subject. Date. Outlet. Link. Then the correlation: committee assignments, votes, and money. The narrative, if there is one, is what survives contact with the file.",
      },
      {
        type: "p",
        text: "Grassroots Intelligence was the blueprint. Citizens can run a professional research desk with public records, FOIA, and document hygiene — the same craft newsrooms used to teach as a matter of course.",
        cites: ["v1"],
      },
      {
        type: "callout",
        title: "Desk rule",
        text: "Never cite a clip you have not opened, and never cite a document you have not saved. The internet forgets. Your folder should not.",
      },
    ],
    citations: [
      {
        id: "v1",
        label: "Scott Mineo, Grassroots Intelligence: The New Age of Citizen Political Research",
        href: "https://www.amazon.com/Grassroots-Intelligence-Citizen-Political-Research/dp/B0GV9FDS5H",
      },
      {
        id: "v2",
        label: "X — @VaChangeAgent",
        href: "https://x.com/VaChangeAgent",
      },
    ],
    documents: [],
  },
];

export function investigationBySlug(slug: string) {
  return INVESTIGATIONS.find((s) => s.slug === slug);
}
