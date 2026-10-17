/**
 * City of Fairfax, City Council budget page (FY2027 Adopted, May 5, 2026).
 * Figures: /workspace/budget-fairfax-city-council/REPORT.md only. Printed page = PDF page (offset 0).
 */
import { Bar, YoyBars, type BudgetPageData } from "@/components/site/budget-page";
import { pctOf, S, Ext, vdoc, venueSearch } from "@/lib/budget-pages/shared";

const V = "fairfax-city-council";
const BOOK = "https://opendatastorageprodus.blob.core.windows.net/fairfaxva-pdf-9e6056fe-8306-4878-8c83-a29d45ce3c8d/fy-2027-adopted-budget---city-of-fairfax.pdf";
const WEB = "https://www.fairfaxva.gov/Government/Finance/Budget";
const at = (p: number) => `${BOOK}#page=${p}`;
const P = ({ p, children }: { p: number; children?: React.ReactNode }) => <S href={at(p)}>{children ?? `p.${p}`}</S>;
const GF = 207_912_496;
const GF26 = 198_691_789;

const ED = "Education", PS = "Public Safety", PW = "Public Works", GG = "General Government", HS = "Human Services", PC = "Parks & Culture", CD = "Community Development", DO = "Debt & Other";
const CATS: [string, string, number][] = [
  [ED, "$77.7M", 77_684_433], [PS, "$40.0M", 39_997_973], [GG, "$24.8M", 24_842_557], [PW, "$21.0M", 21_026_935],
  [DO, "$19.0M", 18_953_460], [HS, "$12.7M", 12_692_496], [PC, "$9.3M", 9_259_785], [CD, "$3.5M", 3_454_857],
];
// General Fund Expense Summary by Organization, pp.64–66; section start pages from the table of contents.
const D: [string, number, number, string][] = [
  ["School Board (operations, FCPS tuition, repairs)", 314, 77_684_433, ED], ["Public Works", 218, 21_026_935, PW], ["Fire", 185, 20_252_617, PS],
  ["Police", 196, 19_745_356, PS], ["Non-Departmental (debt, transfers, other)", 325, 18_953_460, DO], ["Human Services", 253, 12_692_496, HS],
  ["Parks and Recreation", 274, 9_259_785, PC], ["Information Technology", 141, 4_894_967, GG], ["Courts", 100, 3_728_787, GG],
  ["Community Development and Planning", 303, 3_454_857, CD], ["City Manager (incl. City Attorney)", 119, 3_227_867, GG], ["Human Resources", 148, 2_912_548, GG],
  ["Finance", 126, 2_807_043, GG], ["Economic Development", 170, 2_157_066, GG], ["Treasurer", 180, 1_380_292, GG],
  ["Commissioner of the Revenue", 176, 1_342_219, GG], ["Communications", 159, 1_101_714, GG], ["Electoral Board", 114, 632_734, GG],
  ["Mayor and City Council (incl. City Clerk)", 93, 496_339, GG], ["Performance and Innovation (new)", 167, 160_981, GG],
];

const DOCS = [
  vdoc(V, "FY2027-adopted-budget-city-of-fairfax", { label: "FY2027 Adopted Budget, City of Fairfax (complete book, 585 pp)", kind: "City Adopted", dek: "The whole adopted budget: General Fund tables (pp.62–66), every department, schedule of rates (pp.550–553). Too big to host (105 MB).", bytes: 105_316_284, official: BOOK, source: "fairfaxva.gov OpenBook" }),
];

export const FAIRFAX_CITY_COUNCIL_BUDGET_PAGE: BudgetPageData = {
  venue: V,
  hero: {
    label: "FY2027 General Fund · City Council Adopted (May 5, 2026)",
    amountLabel: "$207,912,496",
    body: <>
      One year of City of Fairfax General Fund spending, as adopted by City Council.
      Up <span className="font-mono text-gold">+$9,220,707</span> (+4.6%) from FY2026's $198,691,789. More than a third pays for the City's schools, which Fairfax County Public Schools runs under contract.
    </>,
    note: <>Sources: <P p={15} />, <P p={39} />, <P p={64} />. Net all funds: $300,033,503, up 3.3% (<P p={35} />, <P p={55} />): $328,672,626 gross, less $28,639,123 moved between funds. The City's budget web page says $299,568,503 (+3.2%); we use the book.</>,
  },
  callouts: [
    { title: "Mayor & City Council", key: ["$496,339"], href: at(95),
      text: "$496,339 for the Mayor and City Council's own budget, 0.2% of the General Fund (our calc). That's Mayor & Council $157,853 (up 17.7%) plus the City Clerk's office $338,486.",
      source: "FY27 Adopted Budget p.64 (section p.93); Mayor & Council p.95; City Clerk p.96. The p.94 text says \"no notable changes,\" but the p.95 table shows +$23,773 (+17.7%), all in Other Charges; we use the table." },
    { title: "Administration", key: ["$20.0M", "+23.0%"], href: at(62),
      text: "$19,984,697 for General & Financial Administration, up 23.0% (our calc) from $16,246,199. The City Manager's office (with the City Attorney) is $3,227,867, up 35.2%. Much of the jump is 41 maintenance and software projects ($6,834,263) moved from the capital plan into department budgets.",
      source: "FY27 Adopted Budget p.62 (function), p.64 and section p.119 (City Manager), p.15 item 3 and p.39 (reclassification)." },
    { title: "School Tuition to FCPS", key: ["$76.4M", "+7.0%"], href: at(46),
      text: "$76,429,791 for the tuition contract with Fairfax County Public Schools, which runs the City's four schools: up $5,002,244 (+7.0%). It's nearly all of the $77.7M Education budget. Voters approved a $220M school bond in November 2024, and this year's capital plan adds $22M.",
      source: "FY27 Adopted Budget p.46 and p.54 (tuition), p.314 (School Board department)." },
  ],
  categories: {
    ariaLabel: "General Fund spending by function",
    items: CATS.map(([name, short, value]) => ({ name, short, value, pct: pctOf(value, GF) })),
    gridClass: "lg:grid-cols-4",
    source: <>Source: FY27 Adopted Budget <P p={62} />, General Fund by function. General Government (General & Financial Administration + Legislative + Electoral + Judicial), Public Safety (Police + Fire) and Debt & Other (Debt Service + Transfers + other Non-Departmental) are our sums of the book's rows; all % are our calc. The boxes add to $207,912,496.</>,
  },
  departments: {
    heading: "By City of Fairfax Department",
    chipGroupLabel: "Filter by function",
    items: D.map(([name, page, value, c]) => ({ name, page, value, cats: [c], pct: pctOf(value, GF) })),
    allNote: "All 20 General Fund departments.",
    filterNote: (cat) => `Departments under ${cat}, following the function headers in the book's General Fund by Function & Program (p.91 on).`,
    spanNote: "Amounts are full department totals.",
    pageHref: at,
    source: <>Source: FY27 Adopted Budget <P p={64}>pp.64–66</P>, General Fund Expense Summary by Organization (the 20 departments add to $207,912,496). Page = start of department section, table of contents. % is our calc. School debt ($4,904,843) is in Non-Departmental, not School Board (<P p={66} />).</>,
  },
  questions: [
    { q: "Where does the money come from?", body: <>
      <Bar parts={[
        { label: "Real estate taxes", value: 100_321_100, color: "#F5B82E" },
        { label: "Other local taxes (sales, BPOL, meals…)", value: 49_930_339, color: "#C8102E" },
        { label: "State", value: 23_422_280, color: "#6E8FC4" },
        { label: "Personal property tax", value: 13_605_995, color: "#2C4F86" },
        { label: "Use of money & property", value: 7_364_655, color: "#9AA9C2" },
        { label: "All other (7 smaller lines)", value: 13_268_127, color: "#5B6B85" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">Source: Budget Allocation, <P p={63} />. "All other" is our sum of charges, fund balance, permits, fines, other financing, miscellaneous and federal. Note: <P p={62} /> moves $155,000 between Use of Money and Miscellaneous; totals agree, and we use p.63.</p>
    </> },
    { q: "Where does it go?", body: <>
      <Bar parts={[
        { label: "Schools (School Board department)", value: 77_684_433, color: "#F5B82E" },
        { label: "18 city departments", value: 111_274_603, color: "#6E8FC4" },
        { label: "Non-Departmental (debt, transfers, other)", value: 18_953_460, color: "#C8102E" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">From <P p={64}>pp.64–66</P>; the middle bar is our calc ($207,912,496 − $77,684,433 − $18,953,460).</p>
    </> },
    { q: "What's changing year over year?", body: <>
      <YoyBars max={GF} rows={[{ y: "FY2026", v: GF26 }, { y: "FY2027", v: GF, current: true }]} />
      <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">+$9,220,707</p>
      <p className="text-sm text-night-muted">+4.6% General Fund (<P p={39} />, <P p={64} />). The real estate rate goes up 1.75 cents to $1.0725 per $100, about $462.50 a year more for the average home (<P p={16} />). The meals tax goes from 4.0% to 4.5% (<P p={39} />, <P p={86} />).</p>
    </> },
  ],
  how: {
    steps: [
      ["Proposed", "City Manager presents the proposed budget (Feb 24, 2026)"],
      ["Public hearings", "Hearings Mar 10, Mar 24 and Apr 28, 2026 (rate advertised Mar 10)"],
      ["Council Adopted", "City Council adopts the budget at a special meeting (May 5, 2026)"],
    ],
    note: <>Departments make requests July–October; the City Manager reviews them November–February; Council reviews and adopts March–June with at least two public hearings (<P p={17}>pp.17–18</P>). The FY2027 dates come from the <Ext href={WEB}>City's budget page</Ext>, not the book; the City Manager's letter is dated May 5, 2026 (<P p={11} />).</>,
  },
  search: venueSearch(V, DOCS, {
    chips: [
      { label: "Tuition", query: "tuition" }, { label: "Meals tax", query: "meals" }, { label: "Real estate", query: "real estate" },
      { label: "Police", query: "police" }, { label: "CIP", query: "capital improvement" }, { label: "Fund balance", query: "fund balance" },
    ],
    srLabel: "Search the City of Fairfax budget records", placeholder: "tuition, meals tax, 1.0725…", tokens: "tuition, CIP, meals",
  }),
  files: {
    heading: "Source files",
    docs: DOCS,
    footer: <>The 105 MB book links to the City's own copy. Also: <Ext href="https://fairfaxva.openbook.questica.com/#/budget-book/9E6056FE-8306-4878-8C83-A29D45CE3C8D">interactive OpenBook</Ext> · <Ext href={WEB}>fairfaxva.gov budget page</Ext> · <Ext href="https://fairfax.granicus.com/MinutesViewer.php?clip_id=4540&doc_id=c2836927-494e-11f1-9b4d-005056a89546&view_id=13">May 5, 2026 adoption minutes</Ext></>,
  },
  caveats: [
    <>Fund balance: <P p={35} /> says the unassigned General Fund balance is "10.9%" of revenues; the table there and <P p={16} /> and <P p={70} /> say 17.7% ($33,022,763). 10.9% looks like a typo.</>,
    <>Average tax bill: the <P p={80} /> text says bills rise "4.6 percent," but the sample table on the same page shows +6.32% at every value, matching the $462.50 on <P p={16} />.</>,
    <>Last year's Public Works and Human Services budgets differ by about $94,000 between <P p={62} /> and <P p={64} />, probably because one line was classified differently (our inference). FY2027 figures agree.</>,
    <>The court services contract is $1,885,687 on <P p={54} /> but $1,855,687 on <P p={66} />, a $30,000 gap.</>,
    "No separate Budget in Brief was found.",
  ],
};
