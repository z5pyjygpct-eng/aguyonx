/**
 * City of Manassas, City Council budget page (FY2027 Adopted, May 11, 2026).
 * Figures: /workspace/budget-manassas-council/REPORT.md only. Book cites are PRINTED pages; PDF page = printed + 6.
 */
import { Bar, YoyBars, type BudgetPageData } from "@/components/site/budget-page";
import { pctOf, S, vdoc, venueSearch } from "@/lib/budget-pages/shared";

const V = "manassas-council";
const BOOK = "https://www.manassasva.gov/Finance/Budget%20Division/2027/Adopted/FY%202027%20Adopted%20Budget%20-%20Online.pdf";
const at = (printed: number) => `${BOOK}#page=${printed + 6}`;
const P = ({ p, children }: { p: number; children?: React.ReactNode }) => <S href={at(p)}>{children ?? `p.${p}`}</S>;
const GF = 185_365_000;
const GF26 = 158_374_000;

const PSJ = "Public Safety & Judicial", ED = "Public Education", CO = "Capital & Other", GG = "General Government", PW = "Public Works", CED = "Comm. Enhancement & Development", HW = "Health & Welfare", DS = "Debt Service";
const FUNCTIONS: [string, number][] = [[ED, 67_342_000], [PSJ, 37_043_740], [CO, 25_507_000], [GG, 16_417_190], [PW, 13_116_140], [CED, 11_210_930], [HW, 9_536_000], [DS, 5_192_000]];
const short = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${Math.round(n / 1e3)}K`);
const CATEGORIES = FUNCTIONS.map(([name, value]) => ({ name, value, short: short(value), pct: pctOf(value, GF) }));

// General Fund departments, p.70; start pages from the table of contents. Function membership: report §5 (our mapping).
const D: [string, number, number, string[]][] = [
  ["Schools Transfer (Operating)", 280, 67_342_000, [ED]],
  ["Non-Departmental (excl. school operating transfer)", 280, 38_659_000, [DS, CO, HW]],
  ["Police", 230, 27_638_740, [PSJ]],
  ["Shared Services (Prince William County cost-sharing)", 276, 15_017_000, [PSJ, CED, HW]],
  ["Public Works", 248, 11_282_380, [PW]],
  ["Community Development", 260, 8_114_230, [CED]],
  ["Finance", 216, 3_349_830, [GG]],
  ["Human Resources", 226, 2_989_120, [GG]],
  ["Commissioner of the Revenue", 212, 2_163_870, [GG]],
  ["Engineering", 244, 1_833_760, [PW]],
  ["City Manager", 196, 1_515_240, [GG]],
  ["Economic Development", 272, 1_410_700, [CED]],
  ["Treasurer", 208, 1_359_870, [GG]],
  ["City Attorney", 200, 1_053_810, [GG]],
  ["Voter Registration & Elections", 204, 709_670, [GG]],
  ["City Council", 191, 545_940, [GG]],
  ["City Clerk", 192, 379_840, [GG]],
];

const DOCS = [
  vdoc(V, "FY2027-budget-in-brief", { label: "FY2027 Adopted Budget in Brief", kind: "City Adopted", dek: "One-page summary of the adopted budget, tax rates and the average tax bill.", bytes: 240_596, source: "manassasva.gov" }),
  vdoc(V, "FY2027-adopted-budget-complete", { label: "FY2027 Adopted Budget (complete book, 430 pp)", kind: "City Adopted", dek: "The full book: General Fund tables (pp.62–70), rate schedule (p.22), every department. Too big to host (74 MB).", bytes: 74_364_980, official: BOOK, source: "manassasva.gov" }),
  vdoc(V, "R-2026-971-FY2027-budget-adoption", { label: "Resolution R-2026-971: FY2027 budget adoption (signed)", kind: "City Adopted", dek: "The signed resolution adopting the budget.", bytes: 12_250_509, official: "https://www.manassasva.gov/Finance/Budget%20Division/2027/Ord%20Res/R-2026-971%20Budget%20signed.pdf", source: "manassasva.gov" }),
  vdoc(V, "O-2026-966-real-estate-tax-rates", { label: "Ordinance O-2026-966: 2027 real estate tax rates (signed)", kind: "Ordinance", dek: "Real estate, fire & rescue levy and service district rates.", bytes: 518_996, source: "manassasva.gov" }),
  vdoc(V, "O-2026-967-personal-property-tax-rates", { label: "Ordinance O-2026-967: personal property tax rates (signed)", kind: "Ordinance", dek: "Includes the data center computer equipment rate ($4.50).", bytes: 401_481, source: "manassasva.gov" }),
  vdoc(V, "O-2026-974-vehicle-license-fee-repeal", { label: "Ordinance O-2026-974: repeal of the $25 vehicle decal fee (signed)", kind: "Ordinance", dek: "Ends the vehicle license (decal) fee.", bytes: 411_073, source: "manassasva.gov" }),
  vdoc(V, "FY2027-2031-adopted-CIP-complete", { label: "FY2027–2031 Adopted Capital Improvement Program", kind: "City Adopted", dek: "Five-year building and infrastructure plan. Too big to host (93 MB).", bytes: 92_579_668, official: "https://www.manassasva.gov/Finance/CIP/2027/FY%202027%20Adopted%20Five-Year%20CIP%20-%20Online.pdf", source: "manassasva.gov" }),
  vdoc(V, "FY2026-adopted-budget-complete", { label: "FY2026 Adopted Budget (for comparison)", kind: "City Adopted (FY26)", dek: "Last year's book. Linked only; not included in search.", bytes: 24_746_953, official: "https://www.manassasva.gov/Finance/Budget%20Division/2026/Adopted/FY%202026%20Adopted%20Budget%20Online.pdf", source: "manassasva.gov", searchable: false }),
];

export const MANASSAS_COUNCIL_BUDGET_PAGE: BudgetPageData = {
  venue: V,
  hero: {
    label: "FY2027 General Fund · City Council Adopted (May 11, 2026)",
    amountLabel: "$185,365,000",
    body: <>
      One year of City of Manassas General Fund spending, as adopted by City Council.
      Up <span className="font-mono text-gold">+$26,991,000</span> (+17.0%, our calc) from FY2026's $158,374,000. Includes the $67,342,000 operating transfer to Manassas City Public Schools.
    </>,
    note: <>Sources: <P p={13} />, <P p={70} />. All funds, including schools: $597,849,692 (<P p={7} />), up $109,551,837 from $488,297,855 (+22.4%, our calc; <P p={13} />).</>,
  },
  callouts: [
    { title: "City Council", key: ["$545,940"], href: at(191),
      text: "$545,940 for City Council itself, up 15.3% (our calc) from $473,380: 0.3% of the General Fund (our calc). It covers council costs ($318,940), memberships ($127,000) and outside audits ($100,000).",
      source: "FY27 Adopted Budget p.191 (also p.70), City Council $545,940; FY26 $473,380." },
    { title: "City Manager", key: ["$1.5M", "7 positions"], href: at(196),
      text: "$1,515,240 for the City Manager's office, up 7.4% from $1,410,770 (our calc), 0.8% of the General Fund (our calc), with 7 positions.",
      source: "FY27 Adopted Budget p.70, City Manager $1,515,240 (department p.196); 7 positions p.94." },
    { title: "Data Centers", key: ["$3.60 → $4.50"], href: at(22),
      text: "The tax rate on data center computer equipment rises from $3.60 to $4.50 per $100. Industrial assessments are up 76.8%, tied to data center construction, and the Electric Fund grows $34.9M to $87,685,000 to buy more power from Dominion for data centers. The book prints no dollar figure for data center tax revenue.",
      source: "Rate schedule p.22 and Ordinance O-2026-967; industrial assessments p.3; Electric Fund p.4 and p.13." },
  ],
  categories: {
    ariaLabel: "General Fund spending by function",
    items: CATEGORIES,
    gridClass: "lg:grid-cols-4",
    source: <>Source: FY27 Adopted Budget <P p={69} />, General Fund by Function. % of General Fund is our calc (the book's pie on p.69 rounds them to 36, 20, 14, 9, 7, 6, 5 and 3 percent). The p.69 and p.70 tables are footed "All Funds Total," but they are General Fund totals.</>,
  },
  departments: {
    heading: "By Manassas City Department",
    chipGroupLabel: "Filter by function",
    items: D.map(([name, page, value, cats]) => ({ name, page, value, cats, pct: pctOf(value, GF) })),
    allNote: "All 17 General Fund departments and lines.",
    filterNote: (cat) => `Departments that feed ${cat} (our mapping to the book's functions, p.69).`,
    spanNote: "Amounts are full department totals. Some feed more than one function, and the General Government, Community Development and Health & Welfare totals can't be rebuilt exactly from departments: the book doesn't show its split.",
    pageHref: at,
    source: <>Source: FY27 Adopted Budget <P p={70} />, General Fund departments; Non-Departmental detail <P p={280} />; Shared Services <P p={276} />. Page = start of department section, table of contents. % is our calc. Fire and Rescue ($21,010,000, <P p={290} />) and Social Services ($10,940,000, <P p={282} />) are separate funds, not in this list.</>,
  },
  questions: [
    { q: "Where does the money come from?", body: <>
      <Bar parts={[
        { label: "Real estate property taxes", value: 90_200_000, color: "#F5B82E" },
        { label: "Other local taxes", value: 29_595_000, color: "#C8102E" },
        { label: "Other property taxes (personal property, M&T…)", value: 24_375_000, color: "#6E8FC4" },
        { label: "Use of fund balance", value: 17_000_000, color: "#2C4F86" },
        { label: "State", value: 13_884_000, color: "#9AA9C2" },
        { label: "All other (7 smaller lines)", value: 10_311_000, color: "#5B6B85" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">Source: General Fund by Source, <P p={62} />. "All other" is our sum of payments in lieu of taxes, other local revenue, fines, charges, interest, permits and federal money. Each penny of the real estate rate brings in about $850,000 (<P p={8} />).</p>
    </> },
    { q: "Where does it go?", body: <>
      <Bar parts={[
        { label: "Operating transfer to the schools", value: 67_342_000, color: "#F5B82E" },
        { label: "15 city departments (incl. Shared Services)", value: 79_364_000, color: "#6E8FC4" },
        { label: "Other Non-Departmental (capital reserve, transfers, debt…)", value: 38_659_000, color: "#C8102E" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">From the department table, <P p={70} />; the middle bar is our calc ($185,365,000 − $67,342,000 − $38,659,000). Non-Departmental detail is on <P p={280} />, including a one-time $12,000,000 capital reserve for City Hall and a downtown parking garage.</p>
    </> },
    { q: "What's changing year over year?", body: <>
      <YoyBars max={GF} rows={[{ y: "FY2026", v: GF26 }, { y: "FY2027", v: GF, current: true }]} />
      <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">+$26,991,000</p>
      <p className="text-sm text-night-muted">+17.0% General Fund (our calc), mostly Non-Departmental +$20,004,000 (<P p={70} />, <P p={280} />). Real estate rate cut 2 cents to $1.050 per $100 ($1.240 with the fire & rescue levy); the $25 vehicle decal fee is repealed (<P p={22} />). Average bill for an existing home: +$289 (5.03%) (<P p={8} />).</p>
    </> },
  ],
  how: {
    steps: [
      ["Proposed", "City Manager presents the proposed budget and CIP (Feb 23, 2026)"],
      ["Public hearing", "Public hearing on the budget (Apr 27, 2026)"],
      ["Council Adopted", "City Council adopts the budget and CIP (May 11, 2026)"],
    ],
    note: <>The budget system opened to departments on Sep 29, 2025. The School Board adopted the MCPS budget on Mar 24 and met with Council on Mar 25, 2026; the tax rate and fee ordinances had their second reading on Jun 8, 2026 (calendar, <P p={29} />). The transmittal letter (<P p={5} />) mentions a "March 16th Town Hall"; we use the calendar's date.</>,
  },
  search: venueSearch(V, DOCS, {
    chips: [
      { label: "Data centers", query: "data center" }, { label: "Real estate", query: "real estate" }, { label: "Schools", query: "school" },
      { label: "Police", query: "police" }, { label: "Decal fee", query: "decal" }, { label: "Fund balance", query: "fund balance" },
    ],
    srLabel: "Search the City of Manassas budget records", placeholder: "data center, decal, 67,342…", tokens: "decal, CIP, police",
  }),
  files: {
    heading: "Source files",
    docs: DOCS,
    footer: <>Small files are hosted here; the big books link to the City's own copies on manassasva.gov.</>,
  },
  caveats: [
    "The book prints no dollar figure for data center tax revenue, only the rate and assessment growth.",
    "Department pages show spending by category (salaries, benefits…), not line items.",
    "Three function totals (General Government, Community Development, Health & Welfare) can't be rebuilt exactly from department totals; the book doesn't show its split.",
    "Fire and Rescue and Social Services are separate funds, so they aren't in the General Fund department list.",
  ],
};
