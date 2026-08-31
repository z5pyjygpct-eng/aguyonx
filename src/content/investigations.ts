import type { Story } from "@/content/types";

export const INVESTIGATIONS: Story[] = [
  {
    slug: "va-energy-legislative-intelligence-2026",
    kind: "investigation",
    title: "Virginia Energy Legislative Intelligence Analysis",
    dek: "2025–2026 corpus, 2026 session snapshot. 195 energy-policy bills after incidental keyword matches were removed.",
    date: "2026-01-24",
    displayDate: "January 2026",
    topic: "Energy",
    kicker: "Energy",
    image: "/images/investigations/va-energy-legislative-intelligence-2026.png",
    imageAlt: "Cover of the Virginia Energy Legislative Intelligence Analysis",
    access: "public",
    readMinutes: 22,
    body: [
      { type: "p", text: "A political and policy intelligence review of Virginia energy legislation, grid policy, data-center demand, generation, utility regulation, and consumer impacts." },
      { type: "p", text: "The source corpus is 378 broad energy-keyword bill records. The analytic set is 195 direct or materially related energy-policy bills: 114 House measures and 81 Senate measures. Bill numbers in the paper link to the official Virginia LIS record." },
    ],
    citations: [
      { id: "lis", label: "Virginia Legislative Information System", href: "https://lis.virginia.gov" },
    ],
    documents: [
      {
        id: "pdf",
        title: "Virginia Energy Legislative Intelligence Analysis (PDF)",
        href: "/files/investigations/va-energy-legislative-intelligence-2026.pdf",
        kind: "pdf",
      },
    ],
  },
  {
    slug: "loudoun-delegation-taxpayer-burden-2026",
    kind: "investigation",
    title: "Loudoun Delegate Delegation: 2026 Expanded Taxpayer Burden",
    dek: "Singh, Reaser, Reid, Martinez, and McAuliff. 287 potentially tax and taxpayer-burden bills. 13 delegation splits.",
    date: "2026-01-01",
    displayDate: "2026",
    topic: "Taxes",
    kicker: "Taxes",
    image: "/images/investigations/loudoun-delegation-taxpayer-burden-2026.png",
    imageAlt: "Cover of the Loudoun delegation taxpayer-burden analysis",
    access: "public",
    readMinutes: 11,
    body: [
      { type: "p", text: "Five Loudoun House Democrats on one expanded taxpayer-burden universe: taxes, taxing authority, levies, assessments, fees, charges, surcharges, tolls, revenue mechanisms, relief, credits, and exemptions." },
      { type: "p", text: "The cover count is 287 expanded bills, 161 newly discovered against the prior screen, 121 common Yea/Nay events, and 13 delegation splits. High Yea is not an ideology label." },
    ],
    citations: [
      { id: "lis", label: "Virginia Legislative Information System", href: "https://lis.virginia.gov" },
    ],
    documents: [
      {
        id: "pdf",
        title: "Loudoun Delegate Delegation taxpayer-burden analysis (PDF)",
        href: "/files/investigations/loudoun-delegation-taxpayer-burden-2026.pdf",
        kind: "pdf",
      },
    ],
  },
  {
    slug: "va-green-energy-architecture-2020-2026",
    kind: "investigation",
    title: "Virginia's Green-Energy Architecture, 2020–2026",
    dek: "How a 2020 statutory framework became a larger, more complicated energy system.",
    date: "2026-08-23",
    displayDate: "August 23, 2026",
    topic: "Energy",
    kicker: "Energy",
    image: "/images/investigations/va-green-energy-architecture-2020-2026.png",
    imageAlt: "Cover of Virginia's Green-Energy Architecture, 2020\u20132026",
    access: "public",
    readMinutes: 8,
    body: [
      { type: "p", text: "Virginia did not enact one green-energy law and move on. In 2020 it created a statutory architecture — renewable mandates, generation retirements, offshore wind, storage, and carbon-market policy — and the years since have repeatedly modified, financed, challenged, accelerated, and expanded pieces of that architecture." },
      { type: "p", text: "Independent VPIP analysis from Virginia Code, LIS, SCC, JLARC, and EIA. Data centers are load on that architecture. They are not treated here as the cause of it." },
    ],
    citations: [
      { id: "lis", label: "Virginia Legislative Information System", href: "https://lis.virginia.gov" },
    ],
    documents: [
      {
        id: "pdf",
        title: "Virginia's Green-Energy Architecture, 2020–2026 (PDF)",
        href: "/files/investigations/va-green-energy-architecture-2020-2026.pdf",
        kind: "pdf",
      },
    ],
  },
];

export function investigationBySlug(slug: string) {
  return INVESTIGATIONS.find((s) => s.slug === slug);
}
