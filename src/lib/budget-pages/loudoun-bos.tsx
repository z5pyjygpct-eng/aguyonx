/**
 * Loudoun County Board of Supervisors budget page data (FY2027 Adopted Budget, adopted Apr 7, 2026).
 * Every figure checked against the FY2027 Adopted Budget complete document (862 pp; printed page = PDF page):
 * https://www.loudoun.gov/DocumentCenter/View/221475/FY-2027-Adopted-Budget-Document
 * Department links open the hosted section PDFs (04 Department Summaries starts at printed p.159; 05 Misc at p.359).
 */
import { ExternalLink } from "lucide-react";
import { Bar, YoyBars, type BudgetPageData, type BudgetFileDoc } from "@/components/site/budget-page";
import { BudgetDocSearch, type BudgetSearchConfig } from "@/components/site/budget-page/budget-search";

const GF = 3_218_218_368; // p.41, p.50, p.106
const GF_FY26 = 2_994_027_999; // p.106
const pct2 = (n: number) => `${((n / GF) * 100).toFixed(2)}%`;
const BOS = "/files/loudoun-bos-budget";
const LC = "/files/lcps-budget"; // byte-identical county files already hosted for the LCPS page (no extra bytes)
const BOOK = "https://www.loudoun.gov/DocumentCenter/View/221475/FY-2027-Adopted-Budget-Document";
const SEC = {
  exec: { href: `${LC}/FY2027-loudoun-adopted-executive-summary.pdf`, first: 12 },
  rev: { href: `${BOS}/FY2027-loudoun-adopted-03-general-fund-revenue.pdf`, first: 104 },
  dept: { href: `${BOS}/FY2027-loudoun-adopted-04-department-summaries.pdf`, first: 159 },
  misc: { href: `${BOS}/FY2027-loudoun-adopted-05-miscellaneous.pdf`, first: 359 },
  trends: { href: `${BOS}/FY2027-loudoun-adopted-08-fiscal-trends.pdf`, first: 825 },
};
/** Printed page of the complete book → hosted section PDF #page. */
const at = (s: keyof typeof SEC, printed: number) => `${SEC[s].href}#page=${printed - SEC[s].first + 1}`;

// Functional areas: department grouping from the Fund–Department Relationship table (pp.80–81).
const GG = "General Government", PS = "Public Safety & Judicial", HW = "Health & Welfare", PRC = "Parks, Recreation & Culture", CD = "Community Development", ND = "Non-Departmental";
const CATEGORIES = [
  { name: ND, short: "$2.08B", pct: "64.7%", value: 2_081_874_858 },
  { name: PS, short: "$419.1M", pct: "13.0%", value: 419_096_792 },
  { name: GG, short: "$332.6M", pct: "10.3%", value: 332_602_126 },
  { name: HW, short: "$170.0M", pct: "5.3%", value: 169_997_369 },
  { name: PRC, short: "$130.0M", pct: "4.0%", value: 130_038_040 },
  { name: CD, short: "$84.6M", pct: "2.6%", value: 84_609_184 },
];
// FY27 Adopted General Fund expenditures by department, p.50. page = department start, table of contents.
const D: [string, number, number, string][] = [
  ["Non-Departmental", 359, 2_081_874_858, ND],
  ["Fire and Rescue", 245, 188_602_715, PS],
  ["Sheriff's Office", 333, 182_380_430, PS],
  ["General Services", 259, 148_295_833, GG],
  ["Parks, Recreation, and Community Services", 316, 100_840_751, PRC],
  ["Mental Health, Substance Abuse, and Developmental Services", 309, 93_678_264, HW],
  ["Information Technology", 294, 89_375_508, GG],
  ["Family Services", 231, 54_336_288, HW],
  ["Building and Development", 167, 34_812_387, CD],
  ["Library Services", 300, 29_197_289, PRC],
  ["County Administration", 197, 26_347_754, GG],
  ["Health", 271, 20_880_102, HW],
  ["Planning and Zoning", 325, 19_052_541, CD],
  ["Commissioner of the Revenue", 182, 15_699_776, GG],
  ["Human Resources", 287, 14_685_929, GG],
  ["Transportation and Capital Infrastructure", 343, 12_336_575, CD],
  ["Finance and Procurement", 238, 11_954_918, GG],
  ["Commonwealth's Attorney", 187, 10_672_316, PS],
  ["Youth Services", 355, 10_346_798, PS],
  ["Treasurer's Office", 351, 9_938_934, GG],
  ["Community Corrections", 191, 8_352_765, PS],
  ["Clerk of the Circuit Court", 174, 7_892_176, PS],
  ["Animal Services", 159, 7_633_006, PS],
  ["Economic Development", 218, 7_624_146, CD],
  ["Housing and Community Development", 280, 6_179_044, CD],
  ["Board of Supervisors", 163, 6_135_007, GG],
  ["County Attorney", 208, 5_524_724, GG],
  ["Elections & Voter Registration", 222, 4_643_743, GG],
  ["Mapping and Geographic Information", 305, 4_604_491, CD],
  ["Courts", 212, 3_216_586, PS],
  ["Extension Services", 226, 1_102_715, HW],
];
const DEPARTMENTS = D.map(([name, page, value, cat]) => ({ name, page, value, pct: pct2(value), cats: [cat] }));

const MB = (b: number) => `${(b / 1e6).toFixed(1)} MB`;
const doc = (dir: string, id: string, bytes: number, label: string, kind: string, dek: string, source = "loudoun.gov"): BudgetFileDoc =>
  ({ label, dek, href: `${dir}/${id}.pdf`, sizeLabel: MB(bytes), source, kind, extractId: id });
const DOCS: BudgetFileDoc[] = [
  doc(LC, "FY2027-loudoun-budget-in-brief", 14_821_821, "FY2027 Budget in Brief", "BOS Adopted", "12-page plain-language overview of the $5.4 billion adopted budget, including the budget cycle (p.2)."),
  doc(BOS, "FY2027-loudoun-adopted-01-introduction", 851_872, "FY2027 Adopted Budget · Introduction & Contents", "BOS Adopted", "Cover, Board members and table of contents (pp.1–11)."),
  doc(LC, "FY2027-loudoun-adopted-executive-summary", 2_611_149, "FY2027 Adopted Budget · Executive Summary", "BOS Adopted", "Adoption summary, calendar, tax rates, schedule of appropriations, department totals (pp.12–103)."),
  doc(BOS, "FY2027-loudoun-adopted-03-general-fund-revenue", 917_268, "FY2027 Adopted Budget · General Fund Revenue", "BOS Adopted", "Revenue summary and detail, including data center property taxes (pp.104–158)."),
  doc(BOS, "FY2027-loudoun-adopted-04-department-summaries", 3_035_672, "FY2027 Adopted Budget · Department Summaries", "BOS Adopted", "Every General Fund department: budget, revenue, FTE, programs (pp.159–358)."),
  doc(BOS, "FY2027-loudoun-adopted-05-miscellaneous", 742_299, "FY2027 Adopted Budget · Miscellaneous", "BOS Adopted", "Non-Departmental expenditures, including the payment to LCPS (pp.359–386)."),
  doc(BOS, "FY2027-loudoun-adopted-06-other-funds", 2_637_468, "FY2027 Adopted Budget · Other Funds", "BOS Adopted", "Special revenue, enterprise and internal service funds."),
  doc(BOS, "FY2027-loudoun-adopted-07-debt-service", 1_051_847, "FY2027 Adopted Budget · Debt Service", "BOS Adopted", "County and school debt service."),
  doc(BOS, "FY2027-loudoun-adopted-08-fiscal-trends", 887_829, "FY2027 Adopted Budget · Fiscal Trends & Glossary", "BOS Adopted", "Long-run revenue and expenditure trends, including data center revenue (p.846)."),
  doc(BOS, "FY2027-loudoun-adopted-CIP-01-overview", 2_973_056, "FY2027–FY2032 Adopted CIP · Overview", "BOS Adopted", "Six-year Capital Improvement Program summary and funding sources."),
  doc(BOS, "FY2027-loudoun-adopted-CIP-02-previously-authorized", 886_472, "FY2027–FY2032 Adopted CIP · Previously Authorized Projects", "BOS Adopted", "Projects authorized in earlier CIPs."),
  doc(BOS, "FY2027-loudoun-adopted-CIP-03-county-projects", 3_313_146, "FY2027–FY2032 Adopted CIP · County Projects", "BOS Adopted", "General government capital projects."),
  doc(LC, "FY2027-loudoun-adopted-school-projects-CIP", 976_847, "FY2027–FY2032 Adopted CIP · School Projects", "BOS Adopted", "LCPS capital projects in the county CIP."),
  doc(BOS, "FY2027-loudoun-proposed-presentation-2026-02-11", 3_337_547, "FY2027 Proposed Budget Presentation (Feb 11, 2026)", "Proposed", "County Administrator's presentation of the proposed budget to the Board."),
  doc(BOS, "FY2027-loudoun-bos-2026-04-07-adoption-item", 1_864_813, "BOS Action Item, Apr 7, 2026: FY2027 Budget, Appropriations Resolution & Tax Rates", "BOS Action", "The adoption item: budget amendments, appropriations resolution, TY2026 tax rates, CIP.", "loudoun.granicus.com"),
];

const SEARCH: BudgetSearchConfig = {
  docs: DOCS,
  extractHref: (d) => d.href.replace(/\/([^/]+)\.pdf$/, "/extracts/$1.json"),
  chips: [
    { label: "Data centers", query: "data centers" },
    { label: "Real property", query: "real property" },
    { label: "Payment to LCPS", query: "Loudoun County Public Schools" },
    { label: "FTE", query: "FTE" },
    { label: "Board of Supervisors", query: "Board of Supervisors" },
    { label: "CIP", query: "capital improvement" },
    { label: "Fund balance", query: "fund balance" },
  ],
  inputId: "loudoun-bos-budget-q",
  srLabel: "Search the Loudoun County budget records",
  intro: <>
        Looks inside the hosted PDFs — department budgets, revenue lines, tax rates, CIP projects, the
        adoption item — not just filenames. Proposed ≠ adopted stays labeled on each hit.
  </>,
  placeholder: "data centers, 879, FTE, Sheriff…",
  emptyHint: <>
              Nothing matched in the hosted budget records. Try a shorter token (FTE, CIP, LTF) or a
              dollar fragment (879). This shelf only searches the files listed below — not the whole
              site, the full 862-page book or the transportation CIP.
  </>,
};

const ext = (href: string, label: string) => <a className="text-gold hover:underline" href={href} target="_blank" rel="noreferrer">{label} <ExternalLink className="inline size-3" /></a>;

export const LOUDOUN_BOS_BUDGET_PAGE: BudgetPageData = {
  venue: "loudoun-bos",
  hero: {
    label: "FY2027 General Fund · BOS Adopted",
    amountLabel: "$3,218,218,368",
    body: <>
      One year of county General Fund spending (July 1, 2026 – June 30, 2027), as adopted by the Board of Supervisors.
      Up <span className="font-mono text-gold">+$224,190,369</span> (+7.5%) from FY2026's $2,994,027,999. Includes $1,538,079,364 paid to LCPS ($1,484,949,364 operating + $71.17M school capital + $53.13M CAPP).
    </>,
    note: "All appropriations, every county and school fund: $5,423,850,697 (p.36). The FY26→FY27 change is our arithmetic from p.106; the book does not print it.",
  },
  callouts: [
    { title: "Board of Supervisors", key: ["$6.1M"], href: at("dept", 164),
      text: "$6.1M for the Board of Supervisors itself, up 5.3% from $5,825,950: 0.19% of the General Fund, paid 100% from local taxes. 0 FTE: district budgets are appropriated as operating funds, though staff aides' pay is recorded as personnel expenses.",
      source: "FY27 Adopted Budget p.164, Board of Supervisors $6,135,007 (FY26 $5,825,950), 100% local tax funding; 0.00 FTE (p.51)." },
    { title: "County Administration", key: ["$26.3M", "153.13 FTE"], href: at("dept", 199),
      text: "$26.3M for the County Administrator's office, up 15.0% from $22,902,218, with 153.13 full-time-equivalent positions.",
      source: "FY27 Adopted Budget p.199 (department starts p.197), County Administration $26,347,754 (also p.50); 153.13 FTE (p.51)." },
    { title: "Data Centers", key: ["~$1.3B", "~40%"], href: at("rev", 106),
      text: "About $1.3B in FY27 General Fund taxes from data centers, roughly 40% of General Fund revenue (our calculation). Data center computer equipment alone is about 77% of personal property tax revenue.",
      source: "Real property, data centers $417,666,456 (p.106) + computer equipment, data centers $879,094,354 (p.107) = $1,296,760,810 ÷ $3,218,218,368 (our calculation); ~77% per p.846 (excluding the state reimbursement)." },
  ],
  categories: {
    ariaLabel: "Spending by functional area",
    items: CATEGORIES,
    gridClass: "lg:grid-cols-6",
    source: "Source: FY27 Adopted Budget p.50, General Fund expenditures by department, grouped by functional area per the Fund–Department Relationship table (pp.80–81). Area totals are our sums of the official department figures; they add to $3,218,218,369, $1 over the printed total (rounding).",
  },
  departments: {
    heading: "By Loudoun County Department",
    chipGroupLabel: "Filter by functional area",
    items: DEPARTMENTS,
    allNote: "All 31 General Fund departments.",
    filterNote: (cat) => `Departments in ${cat}, per the Fund–Department Relationship table (pp.80–81).`,
    spanNote: "Amounts are General Fund department totals; several departments also spend from other funds, which are not shown here.",
    pageHref: (p) => (p >= SEC.misc.first ? at("misc", p) : at("dept", p)),
    source: <>Source: FY27 Adopted Budget p.50, General Fund Expenditures by Department (FY 2027 Adopted). Page = start of department section, table of contents. Note: the Non-Departmental chapter (p.360) prints a $2,103,699,496 total, $21,824,638 more than the p.50 figure used here; the book does not reconcile the two. Non-Departmental includes the $1,538,079,364 payment to LCPS (p.359).</>,
  },
  questions: [
    { q: "Where does the money come from?", body: <>
      <Bar parts={[
        { label: "Real property tax", value: 1_558_951_787, color: "#F5B82E" },
        { label: "Personal property tax", value: 1_100_009_014, color: "#C8102E" },
        { label: "Other local taxes (sales, BPOL, utility…)", value: 229_258_300, color: "#6E8FC4" },
        { label: "Other local revenue (fees, interest, transfers)", value: 186_795_244, color: "#2C4F86" },
        { label: "State aid", value: 111_496_240, color: "#9AA9C2" },
        { label: "Penalties & interest", value: 18_775_300, color: "#F6F3EA" },
        { label: "Federal aid", value: 12_932_483, color: "#5B6B85" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">About 83% is property tax. Lines from the General Fund Revenue Summary (pp.105–106); they add to the $3,218,218,368 total.</p>
    </> },
    { q: "Where does it go?", body: <>
      <Bar parts={[
        { label: "Payment to LCPS (operating, capital, CAPP)", value: 1_538_079_364, color: "#F5B82E" },
        { label: "Other Non-Departmental (debt, capital, reserves…)", value: 543_795_494, color: "#C8102E" },
        { label: "30 county departments", value: 1_136_343_511, color: "#6E8FC4" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">Schools take about 48% of the General Fund. LCPS payment from p.359; the other two parts are our arithmetic from the p.50 department totals.</p>
    </> },
    { q: "What's changing year over year?", body: <>
      <YoyBars max={GF} rows={[{ y: "FY2026", v: GF_FY26 }, { y: "FY2027", v: GF, current: true }]} />
      <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">+$224,190,369</p>
      <p className="text-sm text-night-muted">+7.5% General Fund, adopted to adopted (our calculation, p.106). Real property rate held at $0.805; vehicle rate $3.09 → $2.94 (spring levy; fall $4.15 → $3.09); general personal property $4.15 (p.34). Average homeowner tax bill $6,280 → $6,421, +$141 (p.35).</p>
    </> },
  ],
  how: {
    steps: [
      ["Proposed", "County Administrator presents the FY2027 Proposed Budget (Feb 11, 2026)"],
      ["Work sessions", "Board holds work sessions on the proposed budget (Mar 2026)"],
      ["BOS Adopted", "Board of Supervisors adopts the budget and tax rates (Apr 7, 2026)"],
    ],
    note: <>The Board of Supervisors sets the county's tax rates and appropriates the schools' local dollars; the vote on April 7, 2026 was 8-0-1 (p.12). The cycle starts in summer, when departments evaluate needs; revenue forecasts and Board guidance follow in fall and winter (Budget Development Calendar, p.17; Budget in Brief p.2). The fiscal year begins July 1.</>,
  },
  search: <BudgetDocSearch cfg={SEARCH} />,
  files: {
    docs: DOCS,
    footer: <>
      Not hosted (too large), on loudoun.gov: {ext(BOOK, "FY2027 Adopted Budget, complete (862 pp)")} · {ext("https://www.loudoun.gov/DocumentCenter/View/221485", "FY2027 CIP · Transportation Projects")} · {ext("https://www.loudoun.gov/DocumentCenter/View/216033/FY-2026-Adopted-Budget", "FY2026 Adopted Budget")}. Official door: {ext("https://www.loudoun.gov/budget", "loudoun.gov/budget")}
    </>,
  },
};
