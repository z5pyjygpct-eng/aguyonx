/**
 * Albemarle County Board of Supervisors budget page (FY2027 Adopted, Apr 22, 2026).
 * Figures: /workspace/budget-albemarle-bos/REPORT.md only. Printed "PAGE N" = PDF page (offset 0).
 * Department → area grouping from the p.122–124 line items; every area reconciles exactly to p.121.
 */
import { Bar, YoyBars, type BudgetPageData } from "@/components/site/budget-page";
import { pctOf, S, Ext, vdoc, venueSearch } from "@/lib/budget-pages/shared";

const V = "albemarle-bos";
const BOOK = "https://www.albemarle.org/home/showpublisheddocument/31734/639222939752930000";
const RES = `/files/${V}-budget/${V}-FY27-budget-resolution-certified.pdf`;
const at = (p: number) => `${BOOK}#page=${p}`;
const P = ({ p, children }: { p: number; children?: React.ReactNode }) => <S href={at(p)}>{children ?? `p.${p}`}</S>;
const GF = 511_958_195;
const GF26 = 474_694_129;

const SCH = "Public Schools", PS = "Public Safety", CAP = "Capital & Debt", HW = "Health & Welfare", ADM = "Administration", RS = "Revenue Sharing",
  CD = "Community Development", PW = "Public Works", PRC = "Parks, Recreation & Culture", JUD = "Judicial", OT = "Other";
const AREAS: [string, string, number][] = [
  [SCH, "$218.3M", 218_283_112], [PS, "$87.3M", 87_316_967], [CAP, "$52.6M", 52_589_198], [HW, "$36.2M", 36_231_438], [ADM, "$31.4M", 31_418_644], [RS, "$21.9M", 21_880_462],
  [CD, "$20.2M", 20_209_015], [PW, "$14.1M", 14_098_823], [PRC, "$13.5M", 13_528_619], [JUD, "$10.2M", 10_226_607], [OT, "$6.2M", 6_175_310],
];
const D: [string, number, number, string][] = [
  ["Transfer to Public Schools (ongoing)", 225, 218_283_112, SCH], ["Transfers to Capital & Debt Service", 225, 52_589_198, CAP],
  ["Fire Rescue Services", 164, 36_838_941, PS], ["Police Department", 162, 35_869_014, PS], ["Health & Human Services", 184, 28_450_559, HW],
  ["Revenue Sharing (City of Charlottesville)", 220, 21_880_462, RS], ["Public Safety agencies (jail, ECC, SPCA, juvenile detention…)", 170, 14_168_285, PS],
  ["Information Technology", 142, 10_867_560, ADM], ["Facilities & Environmental Services", 176, 10_527_656, PW], ["Community Development Department", 210, 10_347_172, CD],
  ["Finance & Budget", 140, 10_324_479, ADM], ["Transit agencies (CAT, Jaunt, micro-transit…)", 214, 8_243_344, CD], ["Health & Welfare agencies + Housing Fund transfer", 188, 7_780_879, HW],
  ["Jefferson-Madison Regional Library", 200, 6_363_158, PRC], ["Parks & Recreation", 198, 5_721_446, PRC], ["Sheriff", 154, 5_434_723, JUD],
  ["Executive Leadership", 135, 4_051_368, ADM], ["Other Uses of Funds (tax relief, reserves, salary lapse)", 228, 3_637_286, OT], ["Public Works agencies (Rivanna Solid Waste…)", 179, 3_571_167, PW],
  ["Commonwealth's Attorney", 152, 2_755_470, JUD], ["Other transfers (Water Resources, EDA)", 227, 2_538_024, OT], ["Human Resources", 137, 2_000_261, ADM],
  ["County Attorney", 139, 1_741_670, ADM], ["Voter Registration & Elections", 144, 1_522_581, ADM], ["Clerk of the Circuit Court", 150, 1_461_928, JUD],
  ["Convention & Visitors Bureau", 201, 1_356_015, PRC], ["Economic Development (office + agencies)", 212, 1_027_018, CD], ["Board of Supervisors", 134, 910_725, ADM],
  ["Other Community Development agencies (TJPDC, VPI Extension)", 216, 591_481, CD], ["Courts (Circuit, GDC, Juvenile, Magistrate, Public Defender)", 156, 574_486, JUD],
  ["Office of Emergency Management (new)", 168, 440_727, PS], ["Cultural agencies & festivals", 202, 88_000, PRC],
];

const DOCS = [
  vdoc(V, "FY27-adopted-budget-full", { label: "FY27 Adopted Budget (complete book, 364 pp)", kind: "BOS Adopted", dek: "General Fund summary (pp.94–127), every department chapter, non-departmental (pp.217–228). Too big to host (33 MB).", bytes: 33_090_488, official: BOOK, source: "albemarle.org" }),
  vdoc(V, "FY27-budget-resolution-certified", { label: "FY2027 Budget Resolution (certified, adopted 6–0 Apr 22, 2026)", kind: "BOS Adopted", dek: "One page: the adopted totals by fund.", bytes: 365_690, source: "albemarle.org" }),
  vdoc(V, "FY27-appropriations-resolution-certified", { label: "FY2027 Appropriation Resolution (certified)", kind: "BOS Adopted", dek: "The legal appropriation of each fund.", bytes: 1_517_266, source: "albemarle.org" }),
  vdoc(V, "FY27-budget-presentation", { label: "FY27 Budget presentation (adoption)", kind: "BOS Adopted", dek: "Slides for the adoption.", bytes: 801_605, source: "albemarle.org" }),
];

export const ALBEMARLE_BOS_BUDGET_PAGE: BudgetPageData = {
  venue: V,
  hero: {
    label: "FY2027 General Fund · BOS Adopted (Apr 22, 2026)",
    amountLabel: "$511,958,195",
    body: <>
      One year of Albemarle County General Fund spending, as adopted by the Board of Supervisors.
      Up <span className="font-mono text-gold">+$37,264,066</span> (+7.9%) from FY2026's $474,694,129. The biggest piece, $218,283,112, goes to Albemarle County Public Schools.
    </>,
    note: <>Sources: <P p={94} />, <P p={102} />, <P p={124} />. Total County budget, operating and capital: $727,690,282, up $89,627,537 (+14.0%) (<P p={7} />, <P p={92} />, <S href={RES}>budget resolution</S>). The summary table on <P p={95} /> and <P p={121} /> prints the General Fund change as $30,864,066 / 6.5%, leaving out a $6.4M one-time capital transfer; we use +$37,264,066 / 7.9%.</>,
  },
  callouts: [
    { title: "Board of Supervisors", key: ["$910,725", "3 positions"], href: at(134),
      text: "$910,725 for the Board of Supervisors itself, up 1.7%, with 3.0 positions: salaries $353,354, benefits $165,421, operating $387,950 and capital $4,000. That's 0.2% of the General Fund (our calc).",
      source: "FY27 Adopted Budget p.122 and p.134." },
    { title: "Administration", key: ["$31.4M"], href: at(121),
      text: "$31,418,644 for Administration, up 3.2%, 6.1% of the General Fund (our calc). The biggest parts: Information Technology $10,867,560, Finance & Budget $10,324,479 and Executive Leadership $4,051,368 (County Executive $1,376,235).",
      source: "FY27 Adopted Budget pp.121–122." },
    { title: "Revenue Sharing", key: ["$21.9M", "+8.5%"], href: at(220),
      text: "$21,880,462 paid to the City of Charlottesville under the 1982 Annexation and Revenue Sharing Agreement, where the County pays the City and the City agrees not to annex County land. Up $1,704,929 (+8.5%).",
      source: "FY27 Adopted Budget p.220 (amount), pp.220–222 (agreement)." },
  ],
  categories: {
    ariaLabel: "General Fund spending by organizational area",
    items: AREAS.map(([name, short, value]) => ({ name, short, value, pct: pctOf(value, GF) })),
    gridClass: "lg:grid-cols-6",
    source: <>Source: FY27 Adopted Budget <P p={121} />, General Fund by organizational area (FY27 Adopted). "Other" is our sum of other transfers ($2,538,024) and other uses ($3,637,286). % is our calc. The boxes add to $511,958,195.</>,
  },
  departments: {
    heading: "By Albemarle County Department",
    chipGroupLabel: "Filter by organizational area",
    items: D.map(([name, page, value, c]) => ({ name, page, value, cats: [c], pct: pctOf(value, GF) })),
    allNote: "All 32 General Fund departments and agency groups.",
    filterNote: (cat) => `Departments and agencies in ${cat}; they add up exactly to the p.121 area total.`,
    spanNote: "Agency groups (for example, transit or public safety agencies) are our groupings of the book's line items.",
    pageHref: at,
    source: <>Source: FY27 Adopted Budget <P p={122}>pp.122–124</P>, General Fund Expenditures by Department and Agency (rows add to $511,958,195). Page = start of the department or agency section. % is our calc. County government positions: 975.20, up 0.68 (<P p={128} />).</>,
  },
  questions: [
    { q: "Where does the money come from?", body: <>
      <Bar parts={[
        { label: "Real estate tax", value: 291_263_851, color: "#F5B82E" },
        { label: "Personal property tax", value: 47_731_485, color: "#C8102E" },
        { label: "State", value: 29_675_673, color: "#6E8FC4" },
        { label: "Local sales tax", value: 27_555_594, color: "#2C4F86" },
        { label: "Business license (BPOL)", value: 20_013_387, color: "#9AA9C2" },
        { label: "Food & beverage tax", value: 19_248_545, color: "#F6F3EA" },
        { label: "All other (6 groups)", value: 76_469_661, color: "#5B6B85" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">Source: General Fund revenue, <P p={102}>pp.102–107</P>. "All other" is our sum of other property taxes, other local taxes, other local revenue, federal, transfers and $4,898,289 of fund balance. The lines add to $1 over the total, because the book prints general property taxes as $351,993,279 on p.102 and $351,993,278 on p.94.</p>
    </> },
    { q: "Where does it go?", body: <>
      <Bar parts={[
        { label: "Public Schools (transfer)", value: 218_283_112, color: "#F5B82E" },
        { label: "County government departments", value: 213_030_113, color: "#6E8FC4" },
        { label: "Capital & debt transfers", value: 52_589_198, color: "#C8102E" },
        { label: "Revenue sharing with Charlottesville", value: 21_880_462, color: "#2C4F86" },
        { label: "Other transfers & uses", value: 6_175_310, color: "#9AA9C2" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">Areas from <P p={121} />; "County government departments" is our calc (the General Fund minus the other four).</p>
    </> },
    { q: "What's changing year over year?", body: <>
      <YoyBars max={GF} rows={[{ y: "FY2026", v: GF26 }, { y: "FY2027", v: GF, current: true }]} />
      <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">+$37,264,066</p>
      <p className="text-sm text-night-muted">+7.9% General Fund (<P p={102} />, <P p={124} />). Tax rates stay the same: real estate $0.894 and personal property $4.28 per $100 (<P p={104}>pp.104–105</P>). Police pay scale +11%, Fire Rescue +5%, and 30 positions once paid by a federal SAFER grant move onto the General Fund (<P p={125} />).</p>
    </> },
  ],
  how: {
    steps: [
      ["Recommended", "County Executive presents the Recommended Budget and CIP (Feb 25, 2026)"],
      ["Board Proposed", "Board proposes the budget and sets the most it may advertise for tax rates (Mar 18, 2026)"],
      ["BOS Adopted", "Board approves and appropriates the budget and sets tax rates, 6–0 (Apr 22, 2026)"],
    ],
    note: <>Along the way: a joint capital meeting with the School Board (Dec 3, 2025), a public hearing on the Recommended Budget (Mar 4), five work sessions in March and April, and hearings on tax rates and the Board's Proposed Budget (Apr 15, 2026). The School Board adopted its final budget the next day, Apr 23 (calendar, <P p={76} />; vote from the <S href={RES}>certified resolution</S>).</>,
  },
  search: venueSearch(V, DOCS, {
    chips: [
      { label: "Revenue sharing", query: "revenue sharing" }, { label: "Schools", query: "public schools" }, { label: "Police", query: "police" },
      { label: "Real estate", query: "real estate" }, { label: "SAFER", query: "SAFER" }, { label: "Fund balance", query: "fund balance" },
    ],
    srLabel: "Search the Albemarle County budget records", placeholder: "revenue sharing, SAFER, 0.894…", tokens: "SAFER, CIP, police",
  }),
  files: {
    heading: "Source files",
    docs: DOCS,
    footer: <>The 33 MB book links to the County's own copy. Official door: <Ext href="https://www.albemarle.org/government/finance-and-budget/budget">albemarle.org budget</Ext></>,
  },
  caveats: [
    <>The book's summary row (<P p={95} />, <P p={121} />) says the General Fund grows $30,864,066 (6.5%); the correct arithmetic, on <P p={94} />, <P p={102} /> and <P p={124} />, is $37,264,066 (7.9%). We use 7.9%.</>,
    <>The <P p={104} /> text says general property taxes total "$346.4 million"; that's the current-taxes subtotal. The table total is $351,993,279.</>,
    <>The <P p={127} /> text says capital and debt transfers grow "2.1%"; the table shows 21.3% ($9,248,225).</>,
    <>The adopted book's County Executive letter still says "This Recommended Budget" (<P p={8} />).</>,
  ],
};
