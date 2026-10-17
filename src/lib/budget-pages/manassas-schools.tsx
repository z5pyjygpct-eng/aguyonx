/**
 * Manassas City Public Schools budget page (FY2027). Figures: /workspace/budget-manassas-schools/REPORT.md only.
 * MCPS has posted no adopted budget book: totals from the 1-page adopted summary; unit detail from the
 * Superintendent's Proposed book (printed page = PDF page). The Operating Fund is identical in both.
 */
import { Bar, YoyBars, type BudgetPageData } from "@/components/site/budget-page";
import { pctOf, S, Ext, vdoc, venueSearch } from "@/lib/budget-pages/shared";

const V = "manassas-schools";
const BOOK = "https://files-backend.assets.thrillshare.com/documents/asset/uploaded_file/4530/Mcps/9bf1e1a3-b43f-4110-9af3-a4e910c6970f/MCPS-Superintendents-Proposed-Budget_final.pdf";
const SUMMARY = `/files/${V}-budget/${V}-FY2027-MCPS-summary-budgeted-revenues-expenditures.pdf`;
const at = (p: number) => `${BOOK}#page=${p}`;
const P = ({ p, children }: { p: number; children?: React.ReactNode }) => <S href={at(p)}>{children ?? `p.${p}`}</S>;
const Sum = () => <S href={SUMMARY}>adopted summary p.1</S>;
const OP = 161_103_583;
const OP26 = 147_634_366;
const ALL = 175_802_692;

const CATS: [string, string, number][] = [
  ["Instruction", "$123.1M", 123_101_460], ["Administration, Attendance & Health", "$10.9M", 10_877_173], ["Operations & Maintenance", "$10.9M", 10_855_579],
  ["Technology", "$9.3M", 9_341_124], ["Pupil Transportation", "$6.4M", 6_359_727], ["Contingency", "$458K", 457_898], ["Facilities", "$111K", 110_622],
];
const SCH = "Schools", DEP = "Central departments";
const UNITS: [string, number, number, string][] = [
  ["Osbourn High", 116, 34_980_907, SCH], ["Grace E. Metz Middle", 112, 17_465_864, SCH], ["Mayfield Intermediate", 108, 12_692_305, SCH],
  ["Curriculum and Instruction", 130, 12_049_760, DEP], ["Baldwin Elementary", 84, 10_054_385, SCH], ["Jennie Dean Elementary", 88, 9_730_582, SCH],
  ["R.C. Haydon Elementary", 92, 9_552_563, SCH], ["George C. Round Elementary", 96, 9_261_675, SCH], ["Weems Elementary", 100, 9_138_418, SCH],
  ["Transportation", 140, 6_424_111, DEP], ["Information Technology", 144, 5_145_586, DEP], ["Baldwin Intermediate", 104, 4_285_644, SCH],
  ["School Administration", 128, 4_155_314, DEP], ["Special Education (central)", 132, 3_923_714, DEP], ["Maintenance and Operations", 150, 2_304_181, DEP],
  ["Human Resources", 142, 1_907_954, DEP], ["Financial Services", 156, 1_848_749, DEP], ["Strategic Improvement & Accountability", 152, 1_415_984, DEP],
  ["Superintendent", 127, 1_395_902, DEP], ["Professional Learning", 136, 1_294_912, DEP], ["Communications & Community Relations", 146, 667_376, DEP],
  ["Student Health Services", 138, 595_872, DEP], ["ESOL (central)", 134, 562_189, DEP], ["Procurement", 154, 439_543, DEP],
  ["Facilities", 148, 402_453, DEP], ["School Board", 126, 257_639, DEP], ["Divisionwide (savings line)", 158, -849_999, DEP],
];

const DOCS = [
  vdoc(V, "FY2027-MCPS-summary-budgeted-revenues-expenditures", { label: "FY2026-2027 Adopted Budget: Summary of Budgeted Revenue & Expenditures by Fund", kind: "School Board Adopted", dek: "The only adopted FY2027 document MCPS has posted: one page of totals by fund, revenue source and state category.", bytes: 66_140, source: "mcpsva.org" }),
  vdoc(V, "FY2027-MCPS-superintendent-proposed-budget-book", { label: "FY2027 Superintendent's Proposed Budget (book, 202 pp)", kind: "Proposed", dek: "Every school and central department, staffing, revenue detail. Operating Fund unchanged at adoption.", bytes: 21_155_153, official: BOOK, source: "mcpsva.org" }),
  vdoc(V, "FY2027-MCPS-proposed-budget-presentation", { label: "FY2027 Superintendent's Proposed Budget presentation (Feb 24, 2026)", kind: "Proposed", dek: "Slides presented to the School Board.", bytes: 4_781_610, official: "https://files-backend.assets.thrillshare.com/documents/asset/uploaded_file/4530/Mcps/71077922-53c1-4f57-b489-62a94145c42b/FY-2027-MCPS-Superintendents-Proposed-Budget-Presentation.pdf", source: "mcpsva.org" }),
  vdoc(V, "FY2027-31-MCPS-CIP", { label: "MCPS Capital Improvement Plan FY2027–2031", kind: "School Board", dek: "Five-year school building plan.", bytes: 9_057_551, official: "https://files-backend.assets.thrillshare.com/documents/asset/uploaded_file/4530/Mcps/aeda129c-b9e3-421a-8b89-1c7b2e17b9b5/MCPS-Capital-Improvement-Plan_final.pdf", source: "mcpsva.org" }),
];

export const MANASSAS_SCHOOLS_BUDGET_PAGE: BudgetPageData = {
  venue: V,
  hero: {
    label: "FY2027 School Operating Fund · School Board Adopted (Mar 24, 2026)",
    amountLabel: "$161,103,583",
    body: <>
      One year of day-to-day spending for Manassas City Public Schools. Up <span className="font-mono text-gold">+$13,469,217</span> (+9.1%) from FY2026's $147,634,366.
      City Council adopted the City budget, including the school funds, on May 11, 2026.
    </>,
    note: <>MCPS has not posted an adopted FY2027 budget book. The adopted totals here come from its one-page adopted summary (<Sum />); school and department figures come from the Superintendent's Proposed book (<P p={20} />), and the Operating Fund didn't change at adoption. All funds adopted: $175,802,692, up $15,277,837 (+9.5%, our calc) from $160,524,855 (<P p={20} />).</>,
  },
  callouts: [
    { title: "Administration", key: ["$10.9M"], href: SUMMARY,
      text: "$10,877,173 in the state category Administration, Attendance & Health: 6.8% of the operating fund (our calc). It includes the Superintendent's office ($1,395,902), School Administration ($4,155,314) and the School Board ($257,639).",
      source: "Adopted summary p.1; Proposed book p.127, p.128 and p.126." },
    { title: "Special Education", key: ["722 students", "$3.9M department"], href: at(132),
      text: "Nearly 10% of students, 722 in all, get special education. The central Special Education department has $3,923,714 and 10 positions; special education teachers in schools are in school budgets, so MCPS publishes no single total. State special education aid: $3,449,000 plus a new $279,000 add-on.",
      source: "Proposed book p.30 (Sept 30, 2025 count), p.122 and pp.132–133 (department), p.68 (state aid)." },
    { title: "English Learners", key: ["39.8% of students", "2,953"], href: at(30),
      text: "About 4 in 10 MCPS students (39.8%, or 2,953) are English learners. The state sends $6,277,000 for English learner teachers. The central ESOL department has $562,189 and 4 positions; most EL teachers are in school budgets, so there's no single total.",
      source: "Proposed book p.30 (Sept 30, 2025 count), p.68 (state EL teacher funding), pp.134–135 (ESOL department)." },
  ],
  categories: {
    ariaLabel: "Operating spending by Virginia state category",
    items: CATS.map(([name, short, value]) => ({ name, short, value, pct: pctOf(value, OP) })),
    source: <>Source: <Sum />, Operating Fund by state expenditure category (sums to $161,103,583). % of operating is our calc. Food Services ($5,088,588) and Debt Service ($723,617) are outside the Operating Fund.</>,
  },
  departments: {
    heading: "By MCPS School & Department",
    chips: [SCH, DEP],
    chipGroupLabel: "Filter schools or central departments",
    items: UNITS.map(([name, page, value, c]) => ({ name, page, value, cats: [c], pct: pctOf(value, OP) })),
    allNote: "All 9 schools and 18 central departments and lines (Operating Fund).",
    filterNote: (cat) => (cat === SCH ? "Schools: $117,162,343, 72.7% of the Operating Fund (p.80–81)." : "Central departments: $43,941,240, 27.3% of the Operating Fund (p.122–123)."),
    spanNote: "Figures are from the Superintendent's Proposed book; the Operating Fund total was unchanged at adoption. The book doesn't split each school or department by state category, so the filter uses its own schools / departments split.",
    pageHref: at,
    source: <>Source: Superintendent's Proposed book, schools <P p={80}>pp.80–81</P>, departments <P p={122}>pp.122–123</P>. Page = start of each unit's section (table of contents, <P p={5} />). % is our calc.</>,
  },
  questions: [
    { q: "Where does the money come from?", body: <>
      <Bar parts={[
        { label: "State", value: 95_521_000, color: "#F5B82E" },
        { label: "City of Manassas", value: 67_342_000, color: "#C8102E" },
        { label: "Federal", value: 10_241_104, color: "#6E8FC4" },
        { label: "Other local", value: 1_781_600, color: "#2C4F86" },
        { label: "Use of fund balance", value: 916_988, color: "#9AA9C2" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">All funds, <Sum />. In the Operating Fund alone the state pays $95,374,000, 59.2% (<P p={64} />).</p>
    </> },
    { q: "Where does it go?", body: <>
      <Bar parts={[
        { label: "Schools (operating)", value: 117_162_343, color: "#F5B82E" },
        { label: "Central departments (operating)", value: 43_941_240, color: "#6E8FC4" },
        { label: "Other funds (food, grants, capital, debt)", value: ALL - OP, color: "#C8102E" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">Schools and departments from <P p={80}>p.80</P> and <P p={122}>p.122</P>; "other funds" is our calc ($175,802,692 − $161,103,583, <Sum />).</p>
    </> },
    { q: "What's changing year over year?", body: <>
      <YoyBars max={OP} rows={[{ y: "FY2026", v: OP26 }, { y: "FY2027", v: OP, current: true }]} />
      <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">+$13,469,217</p>
      <p className="text-sm text-night-muted">+9.1% operating (<P p={20} />). Drivers on <P p={21} /> include pay adjustments (+$6,856,182) and the Virginia Virtual Academy partnership (+$6,800,000). State revenue +$11,178,753; City +$1,962,000 (+3.0%) (<P p={22} />).</p>
    </> },
  ],
  how: {
    steps: [
      ["Proposed", "Superintendent presents the proposed budget and CIP (Feb 24, 2026)"],
      ["School Board Adopted", "School Board adopts the FY2026-27 budget and CIP (Mar 24, 2026)"],
      ["City Council Adopted", "City Council adopts the City budget, including school funds (May 11, 2026)"],
    ],
    note: <>Manassas schools get their local money from the City; the School Board doesn't set tax rates. Along the way: work sessions Dec 4, 2025, Jan 20 and Mar 16, 2026; a public hearing Mar 10; and a joint session with City Council Mar 25 (calendar, <P p={17} />).</>,
  },
  search: venueSearch(V, DOCS, {
    chips: [
      { label: "ESOL", query: "ESOL" }, { label: "Special education", query: "special education" }, { label: "VAVA", query: "Virtual Academy" },
      { label: "City transfer", query: "city" }, { label: "Osbourn", query: "Osbourn" }, { label: "CIP", query: "capital" },
    ],
    srLabel: "Search the Manassas City Public Schools budget records", placeholder: "ESOL, Osbourn, VAVA…", tokens: "ESOL, CIP, SPED",
  }),
  files: {
    heading: "Source files",
    docs: DOCS,
    footer: <>No adopted FY2027 budget book has been posted. Official folder: <Ext href="https://www.mcpsva.org/documents/departments/budget/fy-2027%3A-next-year's-budget/25965591">mcpsva.org FY2027 budget</Ext></>,
  },
  caveats: [
    "MCPS hasn't posted an adopted budget book. Adopted totals come from the one-page summary; everything by school or department comes from the proposed book. The only change at adoption was +$330,000 in the School Capital Projects Fund; the Operating Fund is the same.",
    "There's no division-wide dollar total for special education or English learners: those teachers are inside each school's budget.",
    "Student counts on p.30 were checked against the page image (722 special education, 2,953 ESOL for 2025-26).",
    "Typos in the proposed book: p.81 prints \"$5,1,82,838\" (meaning $5,182,838) and p.68 says \"$82,570,000 million.\"",
  ],
};
