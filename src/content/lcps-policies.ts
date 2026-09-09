/** LCPS BoardDocs — Restructured and Reviewed Policies and Regulations (ACTIVE only). */
export type LcpsPolicy = {
  code: string;
  title: string;
  section: string;
  itemId: string;
  deepLink: string;
  /** Hosted PDF under /public when we ship a local copy; otherwise open BoardDocs. */
  pdfPath?: string;
};

export const LCPS_POLICY_BOOK =
  "Restructured and Reviewed Policies and Regulations";

/** Eight BoardDocs section buckets, in book order. */
export const LCPS_POLICY_SECTIONS = [
  "1000 - FOUNDATIONS",
  "2000 - SCHOOL BOARD BYLAWS",
  "3000 - ADMINISTRATION",
  "4000 - BUSINESS",
  "5000 - INSTRUCTION",
  "6000 - SUPPORT SERVICES",
  "7000 - PERSONNEL",
  "8000 - STUDENTS"
] as const;

export type LcpsPolicySection = (typeof LCPS_POLICY_SECTIONS)[number];

export const LCPS_POLICIES: LcpsPolicy[] = [
  {
    "code": "1010",
    "title": "School Division Legal Status",
    "section": "1000 - FOUNDATIONS",
    "itemId": "A2P2K76D9CE1",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A2P2K76D9CE1",
    "pdfPath": "/files/lcps-policies/pdfs/1010.pdf"
  },
  {
    "code": "1020",
    "title": "Strategic Framework",
    "section": "1000 - FOUNDATIONS",
    "itemId": "A3PNV75A2D13",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PNV75A2D13",
    "pdfPath": "/files/lcps-policies/pdfs/1020.pdf"
  },
  {
    "code": "1030",
    "title": "A Code of Conduct for School Board Members",
    "section": "1000 - FOUNDATIONS",
    "itemId": "A3QNXX57FF4C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3QNXX57FF4C",
    "pdfPath": "/files/lcps-policies/pdfs/1030.pdf"
  },
  {
    "code": "1035",
    "title": "School Board Norms, Protocols and Violations",
    "section": "1000 - FOUNDATIONS",
    "itemId": "C2FJX44ED344",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C2FJX44ED344"
  },
  {
    "code": "1040",
    "title": "Equal Opportunity for Equitable, Safe and Inclusive Environment",
    "section": "1000 - FOUNDATIONS",
    "itemId": "B9SSZ76EBBB3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B9SSZ76EBBB3"
  },
  {
    "code": "2010",
    "title": "Legal Status, Authority, Powers and Duties",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A3PVGG6F950B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PVGG6F950B"
  },
  {
    "code": "2110",
    "title": "Qualifications of School Board Members",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A3PVJD6FCC09",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PVJD6FCC09"
  },
  {
    "code": "2120",
    "title": "Election, Term of Office, and Vacancy in Office",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "ADYSDN6F1510",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ADYSDN6F1510"
  },
  {
    "code": "2130",
    "title": "Oath of Office",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A92UNW65F315",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A92UNW65F315"
  },
  {
    "code": "2140",
    "title": "Orientation and Professional Development for New Board Members",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A9ZLSV56A073",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9ZLSV56A073"
  },
  {
    "code": "2150",
    "title": "Compensation",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "ADYSES6F4C82",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ADYSES6F4C82"
  },
  {
    "code": "2160",
    "title": "Conflict of Interests and Disclosure of Economic Interests",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A92UWK666FF2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A92UWK666FF2"
  },
  {
    "code": "2210",
    "title": "Annual Organizational Meeting and Election, Regular and Other Meetings",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "AASHZN4AAC98",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASHZN4AAC98"
  },
  {
    "code": "2220",
    "title": "Clerk",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A92UZ666A2C0",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A92UZ666A2C0"
  },
  {
    "code": "2230",
    "title": "Office of Division Counsel",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "ADYSF56F6D47",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ADYSF56F6D47"
  },
  {
    "code": "2310",
    "title": "Committees of the School Board",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A3PVQU705B78",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PVQU705B78"
  },
  {
    "code": "2350",
    "title": "Appeal of Administrative Decisions",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "AGP3LL745F90",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AGP3LL745F90"
  },
  {
    "code": "2420",
    "title": "Meeting Procedures",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "AGP3S274CE4F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AGP3S274CE4F"
  },
  {
    "code": "2430",
    "title": "School Board Agenda",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A65QPA5DFC22",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A65QPA5DFC22"
  },
  {
    "code": "2440",
    "title": "Order of Business, Quorum, Rules, Voting",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "ADYSFK6F8495",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ADYSFK6F8495"
  },
  {
    "code": "2450",
    "title": "Board Minutes",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A92V2D66B31B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A92V2D66B31B"
  },
  {
    "code": "2510",
    "title": "School - Community Communications and Community Involvement",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "AF6R8Z6CCA31",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AF6R8Z6CCA31"
  },
  {
    "code": "2510-REG",
    "title": "Distribution of Electronic Flyers - REGULATION",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "BSFRA96B4FB7",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BSFRA96B4FB7"
  },
  {
    "code": "2520",
    "title": "Participation by the Public",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "AF4KZH544C27",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AF4KZH544C27"
  },
  {
    "code": "2530",
    "title": "Board-Staff Communications",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "CR2QF4673D45",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CR2QF4673D45"
  },
  {
    "code": "2540",
    "title": "Policy Manual",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A92V4666CCCA",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A92V4666CCCA"
  },
  {
    "code": "2570",
    "title": "Petition for Court Review",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "A92V5S66E81B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A92V5S66E81B"
  },
  {
    "code": "2610",
    "title": "Loudoun County School Board Staff Aides",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "BRAJMG4DC85D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BRAJMG4DC85D"
  },
  {
    "code": "2620",
    "title": "Recognition of Student and Staff Accomplishments by the School Board",
    "section": "2000 - SCHOOL BOARD BYLAWS",
    "itemId": "D5JR3L6C061C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D5JR3L6C061C"
  },
  {
    "code": "3010",
    "title": "Administrative Goals",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A3RRDL678709",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RRDL678709"
  },
  {
    "code": "3020",
    "title": "Policy Implementation",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A3RRHF679E5D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RRHF679E5D"
  },
  {
    "code": "3030",
    "title": "School Division Administrative Advisory Committee",
    "section": "3000 - ADMINISTRATION",
    "itemId": "DMJN6P5E6EA2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DMJN6P5E6EA2"
  },
  {
    "code": "3030-REG",
    "title": "School Division Administrative Advisory Committee - REGULATION",
    "section": "3000 - ADMINISTRATION",
    "itemId": "DMJNKB60489A",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DMJNKB60489A"
  },
  {
    "code": "3040",
    "title": "School Building Administration",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A3RRJ967AF9E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RRJ967AF9E"
  },
  {
    "code": "3050",
    "title": "Trained Service Animals",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A3RRKL67C46B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RRKL67C46B"
  },
  {
    "code": "3050-REG",
    "title": "Trained Service Animals - REGULATION",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A6RRXJ6616E8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A6RRXJ6616E8"
  },
  {
    "code": "3065",
    "title": "Information Security Protection (ISP)",
    "section": "3000 - ADMINISTRATION",
    "itemId": "AF6RAJ6D0EE9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AF6RAJ6D0EE9"
  },
  {
    "code": "3065-REG",
    "title": "Information Security Protection (ISP) - REGULATION",
    "section": "3000 - ADMINISTRATION",
    "itemId": "AF6RBK6D3327",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AF6RBK6D3327"
  },
  {
    "code": "3070",
    "title": "Safety- and Emergency-Related Communications",
    "section": "3000 - ADMINISTRATION",
    "itemId": "BNFPWJ669DDF",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BNFPWJ669DDF"
  },
  {
    "code": "3070-REG",
    "title": "Safety- and Emergency-Related Communications - REGULATION",
    "section": "3000 - ADMINISTRATION",
    "itemId": "BNFQ27672246",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BNFQ27672246"
  },
  {
    "code": "3080-REG",
    "title": "Gun-Free School Board Buildings and Property - REGULATION",
    "section": "3000 - ADMINISTRATION",
    "itemId": "C4GQNV69532F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C4GQNV69532F"
  },
  {
    "code": "3110",
    "title": "Appointment and Term of the Division Superintendent",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A3RUFF712A17",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RUFF712A17"
  },
  {
    "code": "3120",
    "title": "Powers and Duties of the Division Superintendent",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A54QLH695A3D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A54QLH695A3D"
  },
  {
    "code": "3120-REG",
    "title": "Powers and Duties - REGULATION",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A6RRZ8665940",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A6RRZ8665940"
  },
  {
    "code": "3130",
    "title": "Evaluation",
    "section": "3000 - ADMINISTRATION",
    "itemId": "A3RRNA680D52",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RRNA680D52"
  },
  {
    "code": "3210",
    "title": "Office of the Ombuds",
    "section": "3000 - ADMINISTRATION",
    "itemId": "CPJS5N710852",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CPJS5N710852"
  },
  {
    "code": "3310",
    "title": "Evaluation of New and Established Programs",
    "section": "3000 - ADMINISTRATION",
    "itemId": "CPWL9K5533F3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CPWL9K5533F3"
  },
  {
    "code": "3310-REG",
    "title": "Evaluation of New and Established Programs - REGULATION",
    "section": "3000 - ADMINISTRATION",
    "itemId": "CXBK4K500FCE",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CXBK4K500FCE"
  },
  {
    "code": "3410",
    "title": "Office of the Auditor General",
    "section": "3000 - ADMINISTRATION",
    "itemId": "D83M4P59527A",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D83M4P59527A"
  },
  {
    "code": "4010",
    "title": "Tuition Fees",
    "section": "4000 - BUSINESS",
    "itemId": "AASVDQ6EDD4E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVDQ6EDD4E"
  },
  {
    "code": "4020",
    "title": "Student Fees and Charges",
    "section": "4000 - BUSINESS",
    "itemId": "AKHVHT50248B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AKHVHT50248B"
  },
  {
    "code": "4020-REG",
    "title": "Student Fees and Charges - REGULATION",
    "section": "4000 - BUSINESS",
    "itemId": "AQPPZ8670190",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQPPZ8670190"
  },
  {
    "code": "4030",
    "title": "Non-Locally Funded Programs",
    "section": "4000 - BUSINESS",
    "itemId": "AF6RCM6D5DE5",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AF6RCM6D5DE5"
  },
  {
    "code": "4030-REG",
    "title": "Non-Locally Funded Programs-Grants and Donations - REGULATION",
    "section": "4000 - BUSINESS",
    "itemId": "BFXKSG53414F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BFXKSG53414F"
  },
  {
    "code": "4110",
    "title": "Custody and Disbursement of Loudoun County Public School Funds",
    "section": "4000 - BUSINESS",
    "itemId": "CDAJXA4F467F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CDAJXA4F467F"
  },
  {
    "code": "4115",
    "title": "School Activity Funds",
    "section": "4000 - BUSINESS",
    "itemId": "AASVSK6F7318",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVSK6F7318"
  },
  {
    "code": "4120",
    "title": "Management of Funds",
    "section": "4000 - BUSINESS",
    "itemId": "A3RRQ56831A8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RRQ56831A8"
  },
  {
    "code": "4120-REG",
    "title": "Management of Funds",
    "section": "4000 - BUSINESS",
    "itemId": "BJAQHR696E19",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJAQHR696E19"
  },
  {
    "code": "4125",
    "title": "Fiscal Responsibility",
    "section": "4000 - BUSINESS",
    "itemId": "AASVTA6F88C9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVTA6F88C9"
  },
  {
    "code": "4130",
    "title": "Annual Operating Budget",
    "section": "4000 - BUSINESS",
    "itemId": "A3PVRF709EF9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PVRF709EF9"
  },
  {
    "code": "4130-REG",
    "title": "Annual Operating Budget - REGULATION",
    "section": "4000 - BUSINESS",
    "itemId": "A5UJML4DDE49",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A5UJML4DDE49"
  },
  {
    "code": "4135",
    "title": "Reporting Per Pupil Costs",
    "section": "4000 - BUSINESS",
    "itemId": "A3PVS770BF96",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PVS770BF96"
  },
  {
    "code": "4145",
    "title": "Petty Cash Funds",
    "section": "4000 - BUSINESS",
    "itemId": "AASVUW6F9FEB",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVUW6F9FEB"
  },
  {
    "code": "4150",
    "title": "Financial Accounting and Reporting",
    "section": "4000 - BUSINESS",
    "itemId": "AASVWB6FB921",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVWB6FB921"
  },
  {
    "code": "4150-REG",
    "title": "Financial Accounting and Reporting - REGULATION",
    "section": "4000 - BUSINESS",
    "itemId": "C4ET8C6C5AE7",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C4ET8C6C5AE7"
  },
  {
    "code": "4155",
    "title": "Expense Reimbursements",
    "section": "4000 - BUSINESS",
    "itemId": "AASVWN6FCEDE",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVWN6FCEDE"
  },
  {
    "code": "4155-REG",
    "title": "Expense Reimbursements - REGULATION",
    "section": "4000 - BUSINESS",
    "itemId": "C35HU34A20FA",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C35HU34A20FA"
  },
  {
    "code": "4160",
    "title": "Capital Improvement Program",
    "section": "4000 - BUSINESS",
    "itemId": "ARFJ6A4B9F78",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ARFJ6A4B9F78"
  },
  {
    "code": "4165",
    "title": "Procedures for Reporting and Investigating Fraud, Embezzlement and Fiscal Dishonesty",
    "section": "4000 - BUSINESS",
    "itemId": "AASVWW6FE1C3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVWW6FE1C3"
  },
  {
    "code": "4170",
    "title": "Insurance Management",
    "section": "4000 - BUSINESS",
    "itemId": "A9ZQCJ67395D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9ZQCJ67395D"
  },
  {
    "code": "4175",
    "title": "Fund Balance",
    "section": "4000 - BUSINESS",
    "itemId": "AF6RDA6D7466",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AF6RDA6D7466"
  },
  {
    "code": "4175-REG",
    "title": "Fund Balance - REGULATION",
    "section": "4000 - BUSINESS",
    "itemId": "BGQJQV4E5950",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BGQJQV4E5950"
  },
  {
    "code": "4180",
    "title": "Commercial, Promotional, and Corporate Sponsorships and Partnerships",
    "section": "4000 - BUSINESS",
    "itemId": "DBMTM2778CDD",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DBMTM2778CDD"
  },
  {
    "code": "4190",
    "title": "Other Post Employment Benefit (OPEB) Funding Policy",
    "section": "4000 - BUSINESS",
    "itemId": "DU7Q9N683D61",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DU7Q9N683D61"
  },
  {
    "code": "4210",
    "title": "Inventory and Reporting of Loss or Damage",
    "section": "4000 - BUSINESS",
    "itemId": "AQBSBS71BFBC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQBSBS71BFBC"
  },
  {
    "code": "4310",
    "title": "Purchasing Authority",
    "section": "4000 - BUSINESS",
    "itemId": "A9ZQHR678338",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9ZQHR678338"
  },
  {
    "code": "4320",
    "title": "Methods of Procurement",
    "section": "4000 - BUSINESS",
    "itemId": "A9ZQVK6849D3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9ZQVK6849D3"
  },
  {
    "code": "4330",
    "title": "Remedies in Bids and Awards",
    "section": "4000 - BUSINESS",
    "itemId": "A9ZR6W68ECDC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9ZR6W68ECDC"
  },
  {
    "code": "4340",
    "title": "Procurement Procedures",
    "section": "4000 - BUSINESS",
    "itemId": "A9ZR7W690DF8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9ZR7W690DF8"
  },
  {
    "code": "4340-REG",
    "title": "Contract Terms and Conditions - REGULATION",
    "section": "4000 - BUSINESS",
    "itemId": "CCLLPK571518",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCLLPK571518"
  },
  {
    "code": "4350",
    "title": "Vendor Relations",
    "section": "4000 - BUSINESS",
    "itemId": "A9ZR9C692DB5",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9ZR9C692DB5"
  },
  {
    "code": "4360",
    "title": "Small, Women-Owned, Minority-Owned, and Service-Disabled Veteran-Owned Businesses",
    "section": "4000 - BUSINESS",
    "itemId": "CM9L4H54BD5E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CM9L4H54BD5E"
  },
  {
    "code": "4370",
    "title": "School Board Contract Approval",
    "section": "4000 - BUSINESS",
    "itemId": "A9ZR9M6941D3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9ZR9M6941D3"
  },
  {
    "code": "5010",
    "title": "School Day",
    "section": "5000 - INSTRUCTION",
    "itemId": "C28HGZ488170",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C28HGZ488170"
  },
  {
    "code": "5011",
    "title": "Unstructured Activity Time",
    "section": "5000 - INSTRUCTION",
    "itemId": "B2SUKA6BD201",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B2SUKA6BD201"
  },
  {
    "code": "5011-REG",
    "title": "Elementary Recess Weather Guidelines - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "B2SUL56BEAA4",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B2SUL56BEAA4"
  },
  {
    "code": "5015",
    "title": "Daily Pledge of Allegiance",
    "section": "5000 - INSTRUCTION",
    "itemId": "B52JPY4DD747",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B52JPY4DD747"
  },
  {
    "code": "5020",
    "title": "Moment of Silence",
    "section": "5000 - INSTRUCTION",
    "itemId": "B52JQL4DF845",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B52JQL4DF845"
  },
  {
    "code": "5030",
    "title": "Assessment and Grading",
    "section": "5000 - INSTRUCTION",
    "itemId": "DFQGF3438963",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DFQGF3438963"
  },
  {
    "code": "5030.1-REG",
    "title": "K-12 Assessment and Grading Common Guidelines - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "BQER5L6B1E3C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BQER5L6B1E3C"
  },
  {
    "code": "5030.2-REG",
    "title": "Procedures for Determining Class Rank and Transition to Latin Honors System - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "BV2M6658C516",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BV2M6658C516"
  },
  {
    "code": "5035",
    "title": "Expunging Middle School Student Grades",
    "section": "5000 - INSTRUCTION",
    "itemId": "AZB6ZR6E85A1",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AZB6ZR6E85A1"
  },
  {
    "code": "5040",
    "title": "School Counseling Services - Elementary, Middle, and High Schools",
    "section": "5000 - INSTRUCTION",
    "itemId": "B3UUNF6B12BD",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B3UUNF6B12BD"
  },
  {
    "code": "5040-REG",
    "title": "School Counseling Services - Elementary, Middle, and High School - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "B3UUTW6B83EA",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B3UUTW6B83EA"
  },
  {
    "code": "5045",
    "title": "Criteria and Selection of Supplemental Instructional Materials",
    "section": "5000 - INSTRUCTION",
    "itemId": "BYZTJ5759CC9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BYZTJ5759CC9"
  },
  {
    "code": "5045-REG",
    "title": "Online Resources as Supplemental Instructional Materials - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "D9LND95EFBB4",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D9LND95EFBB4"
  },
  {
    "code": "5046",
    "title": "Criteria and Selection of School and Classroom Library Materials",
    "section": "5000 - INSTRUCTION",
    "itemId": "CTAJ8X4C038D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CTAJ8X4C038D"
  },
  {
    "code": "5047",
    "title": "Review of Challenged Instructional and Library Materials",
    "section": "5000 - INSTRUCTION",
    "itemId": "CTAJAX4C203E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CTAJAX4C203E"
  },
  {
    "code": "5047-REG",
    "title": "Review of Challenged Instructional and Library Materials - NEW REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "DGNLPD5780EB",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DGNLPD5780EB"
  },
  {
    "code": "5048",
    "title": "Family Life Education (FLE)",
    "section": "5000 - INSTRUCTION",
    "itemId": "CTAJAY4C3947",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CTAJAY4C3947"
  },
  {
    "code": "5050",
    "title": "Use of Copyrighted Materials",
    "section": "5000 - INSTRUCTION",
    "itemId": "BL3S24708336",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BL3S24708336"
  },
  {
    "code": "5055",
    "title": "Parental Notification of Instructional Materials with Sexually Explicit Content",
    "section": "5000 - INSTRUCTION",
    "itemId": "CLQM2Q58742E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CLQM2Q58742E"
  },
  {
    "code": "5055-REG",
    "title": "Parental Notification of Instructional Materials with Sexually Explicit Content - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "CLQM6X58EA1F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CLQM6X58EA1F"
  },
  {
    "code": "5060",
    "title": "Textbooks Furnished Free",
    "section": "5000 - INSTRUCTION",
    "itemId": "B52JRH4E138F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B52JRH4E138F"
  },
  {
    "code": "5065",
    "title": "Kindergarten",
    "section": "5000 - INSTRUCTION",
    "itemId": "AWN3ET76446D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AWN3ET76446D"
  },
  {
    "code": "5070",
    "title": "Field Trips",
    "section": "5000 - INSTRUCTION",
    "itemId": "BJQMBS59EA70",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJQMBS59EA70"
  },
  {
    "code": "5070-REG",
    "title": "Field Trips - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "BJQQTC6AD656",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJQQTC6AD656"
  },
  {
    "code": "5080",
    "title": "Class Sizes",
    "section": "5000 - INSTRUCTION",
    "itemId": "AZB78M6F39FE",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AZB78M6F39FE"
  },
  {
    "code": "5090",
    "title": "Graduation: Diplomas and Certificates",
    "section": "5000 - INSTRUCTION",
    "itemId": "B75LZZ551C3B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B75LZZ551C3B"
  },
  {
    "code": "5095",
    "title": "Participation in the Thomas Jefferson High School For Science and Technology",
    "section": "5000 - INSTRUCTION",
    "itemId": "BM7L5L54635F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BM7L5L54635F"
  },
  {
    "code": "5115",
    "title": "Special Programs and Academies",
    "section": "5000 - INSTRUCTION",
    "itemId": "CANQ8W6822EF",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CANQ8W6822EF"
  },
  {
    "code": "5115.1-REG",
    "title": "Special Program or Academy Proposal Development and Approval Process - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "CAVS9L718182",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CAVS9L718182"
  },
  {
    "code": "5115.2-REG",
    "title": "Special Program or Academy Division-Wide Program Placement - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "DFCQND6A1AF4",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DFCQND6A1AF4"
  },
  {
    "code": "5120",
    "title": "Alternative Education Programs",
    "section": "5000 - INSTRUCTION",
    "itemId": "C5ZN2N5A4947",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C5ZN2N5A4947"
  },
  {
    "code": "5125",
    "title": "Alternative Paths to Attaining Standard Units of Credit",
    "section": "5000 - INSTRUCTION",
    "itemId": "CB4PYG657155",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CB4PYG657155"
  },
  {
    "code": "5130",
    "title": "Textbook Adoption",
    "section": "5000 - INSTRUCTION",
    "itemId": "BJQLLR571E78",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJQLLR571E78"
  },
  {
    "code": "5130-REG",
    "title": "Textbook Adoption - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "BKWN745E7926",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BKWN745E7926"
  },
  {
    "code": "5140",
    "title": "Advanced or Accelerated Mathematics",
    "section": "5000 - INSTRUCTION",
    "itemId": "DS5HPZ49880F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DS5HPZ49880F"
  },
  {
    "code": "5150",
    "title": "Adult Education",
    "section": "5000 - INSTRUCTION",
    "itemId": "BJQLMU5741C3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJQLMU5741C3"
  },
  {
    "code": "5170",
    "title": "Substance Use Education",
    "section": "5000 - INSTRUCTION",
    "itemId": "B62V3G6CE7C6",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B62V3G6CE7C6"
  },
  {
    "code": "5210",
    "title": "Classroom Placement of Twins",
    "section": "5000 - INSTRUCTION",
    "itemId": "BM7L6Q54D9A3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BM7L6Q54D9A3"
  },
  {
    "code": "5310",
    "title": "Special Education: Evaluations, Eligibility, and Educational Programming",
    "section": "5000 - INSTRUCTION",
    "itemId": "BBUE4L6D10D1",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BBUE4L6D10D1"
  },
  {
    "code": "5320",
    "title": "Procedures for Location of Self-Contained Special Education Programs",
    "section": "5000 - INSTRUCTION",
    "itemId": "CCDS5770A38E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCDS5770A38E"
  },
  {
    "code": "5320-REG",
    "title": "Procedures for Location of Self-Contained Special Education Programs - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "CCDS7H70E0E2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCDS7H70E0E2"
  },
  {
    "code": "5345",
    "title": "Restraint and Seclusion of Students",
    "section": "5000 - INSTRUCTION",
    "itemId": "B8GUFK6DB6F1",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B8GUFK6DB6F1"
  },
  {
    "code": "5345-REG",
    "title": "Restraint and Seclusion of Students - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "B8UNLV5AAFE2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B8UNLV5AAFE2"
  },
  {
    "code": "5350",
    "title": "Parental Notification for Screening and Assessments",
    "section": "5000 - INSTRUCTION",
    "itemId": "C7BPWV6631A4",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C7BPWV6631A4"
  },
  {
    "code": "5350-REG",
    "title": "Parental Notification for Screening and Assessments - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "C8LQL268EAA9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C8LQL268EAA9"
  },
  {
    "code": "5360",
    "title": "Medical Homebound Instruction",
    "section": "5000 - INSTRUCTION",
    "itemId": "BBUE5U6D3874",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BBUE5U6D3874"
  },
  {
    "code": "5365",
    "title": "Home-Based Instruction",
    "section": "5000 - INSTRUCTION",
    "itemId": "D9WKGS51D58F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D9WKGS51D58F"
  },
  {
    "code": "5410",
    "title": "Charter Schools",
    "section": "5000 - INSTRUCTION",
    "itemId": "BLKKZC542195",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BLKKZC542195"
  },
  {
    "code": "5410-REG",
    "title": "Charter Schools - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "BLKL2E545ECB",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BLKL2E545ECB"
  },
  {
    "code": "5420",
    "title": "Controversial and Sensitive Curriculum Standards",
    "section": "5000 - INSTRUCTION",
    "itemId": "CL9M78591F83",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CL9M78591F83"
  },
  {
    "code": "5420.1-REG",
    "title": "Instructional and Communication Practices for Sensitive and Controversial Standards - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "CM2N7A574D9B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CM2N7A574D9B"
  },
  {
    "code": "5420.2-REG",
    "title": "Instructional Guidance for Use of Role-Play, Simulations and Assuming Different Perspectives - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "CPVLR356BB4E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CPVLR356BB4E"
  },
  {
    "code": "5420.3-REG",
    "title": "Instructional Guidance Using Materials with Racial Slurs, Hate Speech, and Sensitive Content - REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "CPVLSL56FD77",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CPVLSL56FD77"
  },
  {
    "code": "5430",
    "title": "Use of Generative Artificial Intelligence",
    "section": "5000 - INSTRUCTION",
    "itemId": "DJ2GVA459D84",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DJ2GVA459D84"
  },
  {
    "code": "5430.1-REG",
    "title": "Pathways and Citing of Artificial Intelligence - NEW REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "DKJFPX402655",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DKJFPX402655"
  },
  {
    "code": "5430.2-REG",
    "title": "Privacy and Data Protection When Using Artificial Intelligence NEW REGULATION",
    "section": "5000 - INSTRUCTION",
    "itemId": "DKJH4N46B2A6",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DKJH4N46B2A6"
  },
  {
    "code": "5440",
    "title": "Division-Wide Literacy Plan",
    "section": "5000 - INSTRUCTION",
    "itemId": "DN3JY24F657A",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DN3JY24F657A"
  },
  {
    "code": "6120",
    "title": "Wellness",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "BJ6KAR50F7DC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJ6KAR50F7DC"
  },
  {
    "code": "6120-REG",
    "title": "Wellness - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "C7AQ3U666CB5",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C7AQ3U666CB5"
  },
  {
    "code": "6130",
    "title": "Unpaid Meal Debt",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "B8RM54596B99",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B8RM54596B99"
  },
  {
    "code": "6140",
    "title": "Free and Reduced-Price Meal Services",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CESJSV4CB7AF",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CESJSV4CB7AF"
  },
  {
    "code": "6150",
    "title": "Food Service Management",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CESKK54F9EF2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CESKK54F9EF2"
  },
  {
    "code": "6150-REG",
    "title": "Food Service Management - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "DG9GPA44BE09",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DG9GPA44BE09"
  },
  {
    "code": "6160",
    "title": "Food Sanitation Program",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CESKQA50647F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CESKQA50647F"
  },
  {
    "code": "6205",
    "title": "Transportation Policy",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "ALBUTN6414E3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ALBUTN6414E3"
  },
  {
    "code": "6210",
    "title": "Student Transportation",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "ALBV4U6473DA",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ALBV4U6473DA"
  },
  {
    "code": "6210-REG",
    "title": "Student Transportation - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CBGNVQ5D4F3C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CBGNVQ5D4F3C"
  },
  {
    "code": "6215",
    "title": "School Board Owned/Leased Vehicle Operations",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "AZB7386EB5BD",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AZB7386EB5BD"
  },
  {
    "code": "6220",
    "title": "Student Safety and Discipline on Buses",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "AZB74S6ED88F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AZB74S6ED88F"
  },
  {
    "code": "6310",
    "title": "Facility Use",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "B8ATR2678662",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B8ATR2678662"
  },
  {
    "code": "6310-REG",
    "title": "Facility Use - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "BLYQKP69B720",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BLYQKP69B720"
  },
  {
    "code": "6320",
    "title": "Playgrounds",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "B3UUUY6BAFA8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B3UUUY6BAFA8"
  },
  {
    "code": "6320-REG",
    "title": "Playgrounds - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "BLPLA7555ABC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BLPLA7555ABC"
  },
  {
    "code": "6330",
    "title": "Distribution of Information/Materials and Posting within Schools, on School Grounds, or during School-Sponsored Events",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "DT7HSY49F80A",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DT7HSY49F80A"
  },
  {
    "code": "6340",
    "title": "Disposal of Surplus Personal Property",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "BJZQJJ698BA0",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJZQJJ698BA0"
  },
  {
    "code": "6350",
    "title": "Wireless Network Facility Colocation",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "ASJNXK619E2A",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ASJNXK619E2A"
  },
  {
    "code": "6350-REG",
    "title": "Wireless Network Facility Colocation - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "B4SJU74E8252",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B4SJU74E8252"
  },
  {
    "code": "6355",
    "title": "Electric Transmission and Power Line Facilities on LCPS Property",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "DWUPNZ6582E5",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DWUPNZ6582E5"
  },
  {
    "code": "6360",
    "title": "Emergency and Weather-Related Operations",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CYMJTU4CE776",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CYMJTU4CE776"
  },
  {
    "code": "6410",
    "title": "High Performance Building Design, Construction and Operations",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "BJLTE974CD40",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJLTE974CD40"
  },
  {
    "code": "6420",
    "title": "Environmental, Health, and Safety",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CANLRH57CBBA",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CANLRH57CBBA"
  },
  {
    "code": "6430",
    "title": "Design-Build and Construction Management Contracts",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "BJLTEP74F9A6",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJLTEP74F9A6"
  },
  {
    "code": "6460",
    "title": "Buildings and Grounds Management and Maintenance",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "DEPN6U5E7327",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DEPN6U5E7327"
  },
  {
    "code": "6510",
    "title": "Naming School Facilities",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "ARFJAC4C3819",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ARFJAC4C3819"
  },
  {
    "code": "6510-REG",
    "title": "Naming School Facilities - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "BY3KUK534ACF",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BY3KUK534ACF"
  },
  {
    "code": "6530",
    "title": "Changing School Attendance Zones",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "AQCHB547A589",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQCHB547A589"
  },
  {
    "code": "6530-REG",
    "title": "Changing School Attendance Zones - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "AQCHHL485CE9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQCHHL485CE9"
  },
  {
    "code": "6610",
    "title": "Contingency Planning",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "BPTFMJ3FCB4B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BPTFMJ3FCB4B"
  },
  {
    "code": "6620",
    "title": "Access Control on Loudoun County Public Schools (LCPS) Property",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CDVRVF6EB316",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CDVRVF6EB316"
  },
  {
    "code": "6620-REG",
    "title": "Access Control on Loudoun County Public Schools (LCPS) Property - REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CQ5J5R4B25AD",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CQ5J5R4B25AD"
  },
  {
    "code": "6640",
    "title": "Emergency First Aid, CPR, AED and Diabetes Management Trained and Certified Personnel",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "D2HQX66B0C09",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D2HQX66B0C09"
  },
  {
    "code": "6640-REG",
    "title": "Emergency First Aid, CPR, AED and Diabetes Management Trained and Certified Personnel-REGULATION",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "D8HMDM5AAB5B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D8HMDM5AAB5B"
  },
  {
    "code": "6650",
    "title": "Personnel Training – Viral Infections",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "D4UHNH491686",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D4UHNH491686"
  },
  {
    "code": "6720",
    "title": "Safety Drills",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CSYJKY4DA116",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CSYJKY4DA116"
  },
  {
    "code": "6730",
    "title": "School Crisis, Emergency Management, and Medical Emergency Response",
    "section": "6000 - SUPPORT SERVICES",
    "itemId": "CRWQJ2652769",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CRWQJ2652769"
  },
  {
    "code": "7012",
    "title": "Equal Opportunity Employment",
    "section": "7000 - PERSONNEL",
    "itemId": "AHWL2853F374",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AHWL2853F374"
  },
  {
    "code": "7014",
    "title": "Environments Free From Harassment, Discrimination, and Abuse",
    "section": "7000 - PERSONNEL",
    "itemId": "AHYT9D751F0D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AHYT9D751F0D"
  },
  {
    "code": "7014-REG",
    "title": "Environments Free From Harassment, Discrimination, and Abuse - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "AHYTAK7571CA",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AHYTAK7571CA"
  },
  {
    "code": "7016",
    "title": "Employment Complaints",
    "section": "7000 - PERSONNEL",
    "itemId": "AS2S9T6C85B8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AS2S9T6C85B8"
  },
  {
    "code": "7018",
    "title": "Procedure for Adjusting Grievances",
    "section": "7000 - PERSONNEL",
    "itemId": "AS2SBV6CEC6D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AS2SBV6CEC6D"
  },
  {
    "code": "7020",
    "title": "Employment or Supervision of Family Members",
    "section": "7000 - PERSONNEL",
    "itemId": "A3RRRA68497A",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RRRA68497A"
  },
  {
    "code": "7022",
    "title": "Employee Classification",
    "section": "7000 - PERSONNEL",
    "itemId": "ACFR8V6B9B45",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ACFR8V6B9B45"
  },
  {
    "code": "7024",
    "title": "Classified Employee Dismissal and Demotion Grievance Procedures",
    "section": "7000 - PERSONNEL",
    "itemId": "AS2SGF6E5549",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AS2SGF6E5549"
  },
  {
    "code": "7030",
    "title": "Staff Time Schedules",
    "section": "7000 - PERSONNEL",
    "itemId": "A8LTD46FE6C2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A8LTD46FE6C2"
  },
  {
    "code": "7030-REG",
    "title": "Staff Time Schedules - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "BK9QDT68DAD8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BK9QDT68DAD8"
  },
  {
    "code": "7040",
    "title": "Student School Calendar and Staff Calendar",
    "section": "7000 - PERSONNEL",
    "itemId": "A3RRSU686701",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3RRSU686701"
  },
  {
    "code": "7040-REG",
    "title": "School Calendar - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "A59K3M4F870F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A59K3M4F870F"
  },
  {
    "code": "7170",
    "title": "Staff Lactation Support",
    "section": "7000 - PERSONNEL",
    "itemId": "A3PW2V71A51D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PW2V71A51D"
  },
  {
    "code": "7170-REG",
    "title": "Staff Lactation Support - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "A59K754FDCA9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A59K754FDCA9"
  },
  {
    "code": "7301",
    "title": "Licensed Staff",
    "section": "7000 - PERSONNEL",
    "itemId": "A3PVU670FF0C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PVU670FF0C"
  },
  {
    "code": "7302",
    "title": "Appointment and Assignment",
    "section": "7000 - PERSONNEL",
    "itemId": "ACFRG76C3510",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ACFRG76C3510"
  },
  {
    "code": "7304",
    "title": "Licensed Employee Transfers and Involuntary Reassignments",
    "section": "7000 - PERSONNEL",
    "itemId": "CR2JJ74CF718",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CR2JJ74CF718"
  },
  {
    "code": "7304-REG",
    "title": "Licensed Employee Transfers and Involuntary Reassignments - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "CR2JQW4E5ABA",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CR2JQW4E5ABA"
  },
  {
    "code": "7306",
    "title": "Personnel Records and File",
    "section": "7000 - PERSONNEL",
    "itemId": "AGP3S774ECA2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AGP3S774ECA2"
  },
  {
    "code": "7308",
    "title": "Provision of Professional References or Assistance",
    "section": "7000 - PERSONNEL",
    "itemId": "B2SUM46C0B1D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B2SUM46C0B1D"
  },
  {
    "code": "7310",
    "title": "Staff Discipline",
    "section": "7000 - PERSONNEL",
    "itemId": "A54SSF69E0D2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A54SSF69E0D2"
  },
  {
    "code": "7312",
    "title": "Performance Management of Employees",
    "section": "7000 - PERSONNEL",
    "itemId": "AAJUT4722D3E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AAJUT4722D3E"
  },
  {
    "code": "7314",
    "title": "Duties and Responsibilities of Teachers",
    "section": "7000 - PERSONNEL",
    "itemId": "A9NK5N4D6908",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9NK5N4D6908"
  },
  {
    "code": "7316",
    "title": "Supplementary Pay: Athletic Coaches, Sponsors of Virginia High School League Activities, Co-Curricular and Other Stipends",
    "section": "7000 - PERSONNEL",
    "itemId": "A9NKA34DC949",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9NKA34DC949"
  },
  {
    "code": "7318",
    "title": "Separation of Staff Members",
    "section": "7000 - PERSONNEL",
    "itemId": "A9NKM84EAFA3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9NKM84EAFA3"
  },
  {
    "code": "7318-REG",
    "title": "Separation of Staff Members - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "D5HJ8C4BAD40",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D5HJ8C4BAD40"
  },
  {
    "code": "7320",
    "title": "Staff Health",
    "section": "7000 - PERSONNEL",
    "itemId": "A54QMF69F8B4",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A54QMF69F8B4"
  },
  {
    "code": "7320-REG",
    "title": "Procedures for Dealing with Communicable Diseases - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "A59LAV53C6F3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A59LAV53C6F3"
  },
  {
    "code": "7322",
    "title": "Records Required of Commercial Driver's License (CDL) Holders",
    "section": "7000 - PERSONNEL",
    "itemId": "A7M26C730B4F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A7M26C730B4F"
  },
  {
    "code": "7324",
    "title": "Drug and Alcohol Testing for Employees Required to Hold a Commercial Driver's License (CDL)",
    "section": "7000 - PERSONNEL",
    "itemId": "A7M2Y875BB25",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A7M2Y875BB25"
  },
  {
    "code": "7324-REG",
    "title": "Drug and Alcohol Testing for Employees Required to Hold a Commercial Driver's License (CDL) - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "ACFRSN6D97F3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ACFRSN6D97F3"
  },
  {
    "code": "7330",
    "title": "Employment of Temporary Employees",
    "section": "7000 - PERSONNEL",
    "itemId": "AASVXC700101",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVXC700101"
  },
  {
    "code": "7330-REG",
    "title": "Employment of Temporary Employees",
    "section": "7000 - PERSONNEL",
    "itemId": "BESK2G4FC092",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BESK2G4FC092"
  },
  {
    "code": "7520",
    "title": "Outside (Non-LCPS) Employment",
    "section": "7000 - PERSONNEL",
    "itemId": "A54QN66A139E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A54QN66A139E"
  },
  {
    "code": "7522",
    "title": "Absence Without Approved Leave",
    "section": "7000 - PERSONNEL",
    "itemId": "A54RPR6E2108",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A54RPR6E2108"
  },
  {
    "code": "7524",
    "title": "Staff Participation in Political Activities",
    "section": "7000 - PERSONNEL",
    "itemId": "ACFRGL6C4B84",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ACFRGL6C4B84"
  },
  {
    "code": "7530",
    "title": "Duty to Report Child or Student Abuse and Neglect",
    "section": "7000 - PERSONNEL",
    "itemId": "A54QNQ6A27D9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A54QNQ6A27D9"
  },
  {
    "code": "7540",
    "title": "Criminal Conviction or Founded Complaint of Child Abuse or Neglect of Applicants for Employment",
    "section": "7000 - PERSONNEL",
    "itemId": "A54QPK6A4546",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A54QPK6A4546"
  },
  {
    "code": "7540-REG",
    "title": "Criminal Conviction or Founded Complaint of Child Abuse or Neglect - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "A59ND958D81C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A59ND958D81C"
  },
  {
    "code": "7542",
    "title": "Required Notification and Consequences of Criminal Charges, Convictions, and Pleas; and Department of Social Services Investigations or Dispositions for Employees",
    "section": "7000 - PERSONNEL",
    "itemId": "CBYPUW666078",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CBYPUW666078"
  },
  {
    "code": "7550",
    "title": "Drug- and Alcohol-Free Workplace",
    "section": "7000 - PERSONNEL",
    "itemId": "A7M32775E6DF",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A7M32775E6DF"
  },
  {
    "code": "7552",
    "title": "Tobacco- and Smoke-Free Environment",
    "section": "7000 - PERSONNEL",
    "itemId": "A7M32Y76016C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A7M32Y76016C"
  },
  {
    "code": "7554",
    "title": "Employee Responsibility Concerning Student Alcohol and Drug Usage",
    "section": "7000 - PERSONNEL",
    "itemId": "A7M34F761FE9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A7M34F761FE9"
  },
  {
    "code": "7556",
    "title": "Planning Periods",
    "section": "7000 - PERSONNEL",
    "itemId": "A8LTDN7011CD",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A8LTDN7011CD"
  },
  {
    "code": "7560",
    "title": "Professional Conduct",
    "section": "7000 - PERSONNEL",
    "itemId": "A9NKNG4ECE08",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9NKNG4ECE08"
  },
  {
    "code": "7560.1-REG",
    "title": "Professional Conduct - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "CJRK364FDAAC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CJRK364FDAAC"
  },
  {
    "code": "7560.2-REG",
    "title": "Professional Conduct - Professional Use of Email - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "CUPRDF6D7C7C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CUPRDF6D7C7C"
  },
  {
    "code": "7562",
    "title": "Professional Learning",
    "section": "7000 - PERSONNEL",
    "itemId": "ACFRDH6BF0B6",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ACFRDH6BF0B6"
  },
  {
    "code": "7564",
    "title": "Dress Code for Staff",
    "section": "7000 - PERSONNEL",
    "itemId": "AASVXU701AD3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVXU701AD3"
  },
  {
    "code": "7566",
    "title": "Employee Technology Acceptable/Responsible Use",
    "section": "7000 - PERSONNEL",
    "itemId": "B2SUMN6C34D0",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B2SUMN6C34D0"
  },
  {
    "code": "7566-REG",
    "title": "Employee Technology Acceptable/Responsible Use - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "B3UUVF6BCB81",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B3UUVF6BCB81"
  },
  {
    "code": "7610",
    "title": "Salary Scales/Schedules",
    "section": "7000 - PERSONNEL",
    "itemId": "AASVYG703C58",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AASVYG703C58"
  },
  {
    "code": "7612",
    "title": "Experience Credit for Scale A and Scale C New Hires",
    "section": "7000 - PERSONNEL",
    "itemId": "A9722A6ABDC1",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9722A6ABDC1"
  },
  {
    "code": "7614",
    "title": "Classification and Placement of Positions for the Universal Salary Scale",
    "section": "7000 - PERSONNEL",
    "itemId": "AKHVKZ507C91",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AKHVKZ507C91"
  },
  {
    "code": "7620",
    "title": "Payroll Procedures",
    "section": "7000 - PERSONNEL",
    "itemId": "ACFR4A6AA770",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ACFR4A6AA770"
  },
  {
    "code": "7622",
    "title": "Salary Deductions",
    "section": "7000 - PERSONNEL",
    "itemId": "ACFR7W6B68E6",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ACFR7W6B68E6"
  },
  {
    "code": "7624",
    "title": "Supplemental Retirement Plans",
    "section": "7000 - PERSONNEL",
    "itemId": "AFTS5F70B42C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AFTS5F70B42C"
  },
  {
    "code": "7626",
    "title": "Health Insurance",
    "section": "7000 - PERSONNEL",
    "itemId": "AFTS4U70872F",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AFTS4U70872F"
  },
  {
    "code": "7628",
    "title": "Retirement Benefits",
    "section": "7000 - PERSONNEL",
    "itemId": "ACFR8M6B83CC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ACFR8M6B83CC"
  },
  {
    "code": "7630",
    "title": "Tuition Programs",
    "section": "7000 - PERSONNEL",
    "itemId": "AKHVPZ50F667",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AKHVPZ50F667"
  },
  {
    "code": "7630-REG",
    "title": "Tuition Programs - Regulation",
    "section": "7000 - PERSONNEL",
    "itemId": "B75N3Y5E08D9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B75N3Y5E08D9"
  },
  {
    "code": "7640",
    "title": "Workers' Compensation",
    "section": "7000 - PERSONNEL",
    "itemId": "AFTS5U70CFF2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AFTS5U70CFF2"
  },
  {
    "code": "7640-REG",
    "title": "Workers' Compensation - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "AVCK344EA6D5",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AVCK344EA6D5"
  },
  {
    "code": "7650",
    "title": "Licensed Staff Contracts",
    "section": "7000 - PERSONNEL",
    "itemId": "A9NKPV4EE89D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A9NKPV4EE89D"
  },
  {
    "code": "7652",
    "title": "Evaluation Related to Step Increase and One Time Payments Related to Tenure",
    "section": "7000 - PERSONNEL",
    "itemId": "AAJUTP72704C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AAJUTP72704C"
  },
  {
    "code": "7710",
    "title": "Annual Leave",
    "section": "7000 - PERSONNEL",
    "itemId": "ADYSGH6FB6ED",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ADYSGH6FB6ED"
  },
  {
    "code": "7712",
    "title": "Sick Leave",
    "section": "7000 - PERSONNEL",
    "itemId": "AQBSCA71E8FD",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQBSCA71E8FD"
  },
  {
    "code": "7715",
    "title": "Parental and Medical Paid Leave",
    "section": "7000 - PERSONNEL",
    "itemId": "CGRRCJ6D59E8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CGRRCJ6D59E8"
  },
  {
    "code": "7715-REG",
    "title": "Parental and Medical Paid Leave - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "CGRRNM6E7608",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CGRRNM6E7608"
  },
  {
    "code": "7716",
    "title": "Leave for FMLA (Family and Medical Leave Act)",
    "section": "7000 - PERSONNEL",
    "itemId": "AQBSDD722699",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQBSDD722699"
  },
  {
    "code": "7716-REG",
    "title": "Leave for Family & Medical Purposes - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "CUXRUG667050",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CUXRUG667050"
  },
  {
    "code": "7717",
    "title": "Organ and Bone Marrow Donation Leave",
    "section": "7000 - PERSONNEL",
    "itemId": "CSDL32548685",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CSDL32548685"
  },
  {
    "code": "7720",
    "title": "Leave Associated with Legal Proceedings",
    "section": "7000 - PERSONNEL",
    "itemId": "AGP3SC750408",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AGP3SC750408"
  },
  {
    "code": "7722",
    "title": "Leave Without Pay",
    "section": "7000 - PERSONNEL",
    "itemId": "ARFJ8Q4BFBC5",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ARFJ8Q4BFBC5"
  },
  {
    "code": "7722-REG",
    "title": "Leave Without Pay - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "CQVJMZ4C0729",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CQVJMZ4C0729"
  },
  {
    "code": "7724",
    "title": "Public Service Leave",
    "section": "7000 - PERSONNEL",
    "itemId": "AQBSH472B54C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQBSH472B54C"
  },
  {
    "code": "7726",
    "title": "Military Leave",
    "section": "7000 - PERSONNEL",
    "itemId": "AQBSHN72C72B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQBSHN72C72B"
  },
  {
    "code": "7726-REG",
    "title": "Military Leave - REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "AVCK2M4E7717",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AVCK2M4E7717"
  },
  {
    "code": "7730",
    "title": "Religious Accommodation",
    "section": "7000 - PERSONNEL",
    "itemId": "AQBSJA72DF6E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AQBSJA72DF6E"
  },
  {
    "code": "7740",
    "title": "Disability Insurance",
    "section": "7000 - PERSONNEL",
    "itemId": "ARFJ9H4C183E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ARFJ9H4C183E"
  },
  {
    "code": "7910",
    "title": "Reduction In Force",
    "section": "7000 - PERSONNEL",
    "itemId": "AL7LXV55335D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AL7LXV55335D"
  },
  {
    "code": "7910-REG",
    "title": "Reduction in Force- REGULATION",
    "section": "7000 - PERSONNEL",
    "itemId": "D8BJHV4D4E34",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D8BJHV4D4E34"
  },
  {
    "code": "8010",
    "title": "Fundraising",
    "section": "8000 - STUDENTS",
    "itemId": "BDQK4U4D5B36",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BDQK4U4D5B36"
  },
  {
    "code": "8010-REG",
    "title": "Fundraising - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CV6KRT532C8C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CV6KRT532C8C"
  },
  {
    "code": "8020",
    "title": "Relations with School Support Organizations",
    "section": "8000 - STUDENTS",
    "itemId": "CCUQJK698B1C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCUQJK698B1C"
  },
  {
    "code": "8025",
    "title": "Rights of Adult/Eligible Students",
    "section": "8000 - STUDENTS",
    "itemId": "CWAGTT4567CD",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CWAGTT4567CD"
  },
  {
    "code": "8030",
    "title": "Student Discrimination and Harassment",
    "section": "8000 - STUDENTS",
    "itemId": "CCDKYJ5427CF",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCDKYJ5427CF"
  },
  {
    "code": "8030.1-REG",
    "title": "Non-Discrimination on the Basis of a Disability for School-Age Students - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CCDL3T54A376",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCDL3T54A376"
  },
  {
    "code": "8030.2-REG",
    "title": "Non-Discrimination on the Basis of a Disability for Students Enrolled in an Adult Education Program - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CCDL9S557BF2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCDL9S557BF2"
  },
  {
    "code": "8030.3-REG",
    "title": "Discrimination and Harassment Based on Racism and Hate Speech - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CCDLB355B373",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCDLB355B373"
  },
  {
    "code": "8030.4-REG",
    "title": "Hazing - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CCUJJ34D4491",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCUJJ34D4491"
  },
  {
    "code": "8035",
    "title": "Title IX, Sex-Based Discrimination, Sexual Harassment",
    "section": "8000 - STUDENTS",
    "itemId": "CCDKZM544ED2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCDKZM544ED2"
  },
  {
    "code": "8035-REG",
    "title": "Title IX, Sex-Based Discrimination, Sexual Harassment - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CCDLCG55E7B7",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CCDLCG55E7B7"
  },
  {
    "code": "8040",
    "title": "Rights of Transgender and Gender-Expansive Students",
    "section": "8000 - STUDENTS",
    "itemId": "C5ZMZ65A0657",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C5ZMZ65A0657"
  },
  {
    "code": "8040-REG",
    "title": "Rights of Transgender and Gender-Expansive Students - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "C6TT2P6DEA5E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C6TT2P6DEA5E"
  },
  {
    "code": "8060",
    "title": "Parking",
    "section": "8000 - STUDENTS",
    "itemId": "CUYHA6476ED0",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CUYHA6476ED0"
  },
  {
    "code": "8070",
    "title": "Written Comments and Complaints",
    "section": "8000 - STUDENTS",
    "itemId": "CESR8J69C3BE",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CESR8J69C3BE"
  },
  {
    "code": "8080",
    "title": "Home Instruction (Home Schooling)",
    "section": "8000 - STUDENTS",
    "itemId": "C2ZJ8X4BA8F7",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C2ZJ8X4BA8F7"
  },
  {
    "code": "8115",
    "title": "Individuals Who May Be Admitted Free",
    "section": "8000 - STUDENTS",
    "itemId": "B2SUP56C9B85",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B2SUP56C9B85"
  },
  {
    "code": "8115-REG",
    "title": "Individuals Who May Be Admitted Free - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "B2SUPT6CD47E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B2SUPT6CD47E"
  },
  {
    "code": "8120",
    "title": "Compulsory Attendance",
    "section": "8000 - STUDENTS",
    "itemId": "BDQK5X4D86A3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BDQK5X4D86A3"
  },
  {
    "code": "8125",
    "title": "Admission Requirements",
    "section": "8000 - STUDENTS",
    "itemId": "BDGPSE6602FB",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BDGPSE6602FB"
  },
  {
    "code": "8140",
    "title": "Student Attendance Requirements and Procedures",
    "section": "8000 - STUDENTS",
    "itemId": "C8VQ4E6779CF",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C8VQ4E6779CF"
  },
  {
    "code": "8140-REG",
    "title": "Student Attendance Requirements and Procedures - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "C9CK6M5051E0",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C9CK6M5051E0"
  },
  {
    "code": "8155",
    "title": "School Assignment",
    "section": "8000 - STUDENTS",
    "itemId": "BLHLFL56563E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BLHLFL56563E"
  },
  {
    "code": "8155-REG",
    "title": "School Assignment - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CR2K9750882A",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CR2K9750882A"
  },
  {
    "code": "8160",
    "title": "Exceptions to School Assignment Due to Attendance Zone Change",
    "section": "8000 - STUDENTS",
    "itemId": "AVBN7M5E91AE",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AVBN7M5E91AE"
  },
  {
    "code": "8205",
    "title": "Authority to Take Disciplinary and other Action Against Students",
    "section": "8000 - STUDENTS",
    "itemId": "AZB6VZ6E5D08",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AZB6VZ6E5D08"
  },
  {
    "code": "8210",
    "title": "Student Discipline",
    "section": "8000 - STUDENTS",
    "itemId": "BD8LML55B4C8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BD8LML55B4C8"
  },
  {
    "code": "8215",
    "title": "In-School Disciplinary Measures",
    "section": "8000 - STUDENTS",
    "itemId": "AWCVET71AEA1",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AWCVET71AEA1"
  },
  {
    "code": "8215-REG",
    "title": "In-School Disciplinary Measures - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "AWCVGC720F82",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AWCVGC720F82"
  },
  {
    "code": "8220",
    "title": "Student Disciplinary Sanctions",
    "section": "8000 - STUDENTS",
    "itemId": "BGCLL356F529",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BGCLL356F529"
  },
  {
    "code": "8220.1-REG",
    "title": "Implementing Student Disciplinary Sanctions - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CJML4C532C48",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CJML4C532C48"
  },
  {
    "code": "8220.2-REG",
    "title": "Expulsion by School Board - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CJML5E535CE6",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CJML5E535CE6"
  },
  {
    "code": "8220.3-REG",
    "title": "Disciplinary Procedures for Students with Disabilities - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CVMGXS45FC93",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CVMGXS45FC93"
  },
  {
    "code": "8225",
    "title": "Admission, Exclusion or Reassignment of a Student Previously Expelled, Long-Term Suspended or Reassigned to an Alternative Education Program",
    "section": "8000 - STUDENTS",
    "itemId": "BQVS7S6C209B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BQVS7S6C209B"
  },
  {
    "code": "8225-REG",
    "title": "Admission, Exclusion or Reassignment of a Student Previously Expelled, Long-Term Suspended or Reassigned to an Alternative Education Program - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CNVP525FEF51",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CNVP525FEF51"
  },
  {
    "code": "8230",
    "title": "Procedures for Student Disciplinary Appeals to School Board",
    "section": "8000 - STUDENTS",
    "itemId": "BJQQQT6A69C6",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJQQQT6A69C6"
  },
  {
    "code": "8235",
    "title": "Weapons",
    "section": "8000 - STUDENTS",
    "itemId": "BJLTGJ7546B8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJLTGJ7546B8"
  },
  {
    "code": "8240",
    "title": "Alcohol, Drug, Tobacco and Electronic Cigarettes",
    "section": "8000 - STUDENTS",
    "itemId": "ASUT98736711",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ASUT98736711"
  },
  {
    "code": "8240-REG",
    "title": "Alcohol, Drug, Tobacco and Electronic Cigarettes - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "ASUTQQ747385",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ASUTQQ747385"
  },
  {
    "code": "8250",
    "title": "Bullying Prevention and Education",
    "section": "8000 - STUDENTS",
    "itemId": "BJQMCG5A212D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BJQMCG5A212D"
  },
  {
    "code": "8255",
    "title": "LCPS Guidelines for Protective Orders",
    "section": "8000 - STUDENTS",
    "itemId": "CS7HXT4AADB9",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CS7HXT4AADB9"
  },
  {
    "code": "8260",
    "title": "Reporting of Student Conduct",
    "section": "8000 - STUDENTS",
    "itemId": "CPJRVJ6F5EA0",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CPJRVJ6F5EA0"
  },
  {
    "code": "8265",
    "title": "Searches Involving Students and Seizure of Contraband",
    "section": "8000 - STUDENTS",
    "itemId": "C3RPQG657A91",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C3RPQG657A91"
  },
  {
    "code": "8265-REG",
    "title": "Searches Involving Students and Seizure of Contraband - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "C4NHTN4A1194",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=C4NHTN4A1194"
  },
  {
    "code": "8270",
    "title": "Student Dress Code",
    "section": "8000 - STUDENTS",
    "itemId": "ANS2SV6DD33E",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ANS2SV6DD33E"
  },
  {
    "code": "8273",
    "title": "Student Speech and Expression",
    "section": "8000 - STUDENTS",
    "itemId": "D8ZK7T5085C8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D8ZK7T5085C8"
  },
  {
    "code": "8273-REG",
    "title": "Student Demonstrations",
    "section": "8000 - STUDENTS",
    "itemId": "DAGKKM52441D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DAGKKM52441D"
  },
  {
    "code": "8280",
    "title": "Corporal Punishment Prohibited",
    "section": "8000 - STUDENTS",
    "itemId": "BM7L97556D57",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BM7L97556D57"
  },
  {
    "code": "8290",
    "title": "Threat Assessment for the Protection of Schools",
    "section": "8000 - STUDENTS",
    "itemId": "B2ERFC66B2EC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B2ERFC66B2EC"
  },
  {
    "code": "8290-REG",
    "title": "Threat Assessment for the Protection of Schools - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CR2J5S4B8CB3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CR2J5S4B8CB3"
  },
  {
    "code": "8310",
    "title": "Theatrical Presentations",
    "section": "8000 - STUDENTS",
    "itemId": "B75M2S554C30",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B75M2S554C30"
  },
  {
    "code": "8310-REG",
    "title": "Theatrical Presentations - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "B7BL7N541B66",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B7BL7N541B66"
  },
  {
    "code": "8350",
    "title": "Student Activities",
    "section": "8000 - STUDENTS",
    "itemId": "B8RM52598154",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B8RM52598154"
  },
  {
    "code": "8350-REG",
    "title": "Student Activities-REG",
    "section": "8000 - STUDENTS",
    "itemId": "DVJQWB6B44F3",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DVJQWB6B44F3"
  },
  {
    "code": "8360",
    "title": "School Publications - Digital and/or Print",
    "section": "8000 - STUDENTS",
    "itemId": "AZWLTY4B7937",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=AZWLTY4B7937"
  },
  {
    "code": "8410",
    "title": "Immunization Requirements",
    "section": "8000 - STUDENTS",
    "itemId": "BYPTDK72CD6D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BYPTDK72CD6D"
  },
  {
    "code": "8415",
    "title": "Bloodborne, Contagious, Communicable or Infectious Diseases",
    "section": "8000 - STUDENTS",
    "itemId": "BK9JH44D0584",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BK9JH44D0584"
  },
  {
    "code": "8415-REG",
    "title": "Procedures for Dealing with Bloodborne Diseases - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "BK9JH84D364B",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BK9JH84D364B"
  },
  {
    "code": "8420",
    "title": "Student Medication",
    "section": "8000 - STUDENTS",
    "itemId": "BAX2ZD6D1142",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BAX2ZD6D1142"
  },
  {
    "code": "8420-REG",
    "title": "Student Medication - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "BF9QBM6836CC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BF9QBM6836CC"
  },
  {
    "code": "8425",
    "title": "Student-Athlete Extreme Heat and protection",
    "section": "8000 - STUDENTS",
    "itemId": "DVQSLQ733D21",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DVQSLQ733D21"
  },
  {
    "code": "8435",
    "title": "Reports of Missing Children",
    "section": "8000 - STUDENTS",
    "itemId": "CWAGPK44C791",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CWAGPK44C791"
  },
  {
    "code": "8440",
    "title": "Student-Athlete Sudden Cardiac Arrest",
    "section": "8000 - STUDENTS",
    "itemId": "CRUL7A4C6F3A",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CRUL7A4C6F3A"
  },
  {
    "code": "8440-REG",
    "title": "Student-Athlete Sudden Cardiac Arrest - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CRUJJX4D7A04",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CRUJJX4D7A04"
  },
  {
    "code": "8445",
    "title": "Concussions in Students and Student-Athletes",
    "section": "8000 - STUDENTS",
    "itemId": "CG8KCP5140BE",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CG8KCP5140BE"
  },
  {
    "code": "8445-REG",
    "title": "Concussions in Students and Student-Athletes - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CK6SEL723E55",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CK6SEL723E55"
  },
  {
    "code": "8450",
    "title": "Student Lactation Support",
    "section": "8000 - STUDENTS",
    "itemId": "A3PW5P71D253",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=A3PW5P71D253"
  },
  {
    "code": "8450-REG",
    "title": "Student Lactation Support - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "BCCSR56A6FF5",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=BCCSR56A6FF5"
  },
  {
    "code": "8455",
    "title": "Supporting Pregnant Students",
    "section": "8000 - STUDENTS",
    "itemId": "DTMN8H5EB2D0",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DTMN8H5EB2D0"
  },
  {
    "code": "8540",
    "title": "Questionnaires and Surveys of Students",
    "section": "8000 - STUDENTS",
    "itemId": "CK7JRT4E7CD8",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CK7JRT4E7CD8"
  },
  {
    "code": "8550",
    "title": "Parental Notification Concerning Sex Offender and Crimes Against Minors Registry",
    "section": "8000 - STUDENTS",
    "itemId": "D87H3H466B63",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D87H3H466B63"
  },
  {
    "code": "8610",
    "title": "Student Records",
    "section": "8000 - STUDENTS",
    "itemId": "ARVJQR4E54CF",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ARVJQR4E54CF"
  },
  {
    "code": "8610-REG",
    "title": "Student Records - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "ASUT2W7164FC",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ASUT2W7164FC"
  },
  {
    "code": "8620",
    "title": "Acceptance of Electronic Signatures and Records",
    "section": "8000 - STUDENTS",
    "itemId": "ARVJS94E771C",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ARVJS94E771C"
  },
  {
    "code": "8630",
    "title": "Inspection and Review of Education Records",
    "section": "8000 - STUDENTS",
    "itemId": "B3P25F6EB09D",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=B3P25F6EB09D"
  },
  {
    "code": "8630-REG",
    "title": "Inspection and Review of Education Records - REGULATION",
    "section": "8000 - STUDENTS",
    "itemId": "CYMN345CB934",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CYMN345CB934"
  },
  {
    "code": "8640",
    "title": "Disclosure of Student Personally Identifiable Information and Other Educational Records",
    "section": "8000 - STUDENTS",
    "itemId": "ANS2RR6D99B5",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=ANS2RR6D99B5"
  },
  {
    "code": "8650",
    "title": "Student Technology Acceptable/Responsible Use Policy",
    "section": "8000 - STUDENTS",
    "itemId": "CR2KP952CBE7",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CR2KP952CBE7"
  },
  {
    "code": "8655",
    "title": "Student Personal Device Use",
    "section": "8000 - STUDENTS",
    "itemId": "D6MGYN461D01",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=D6MGYN461D01"
  },
  {
    "code": "8705",
    "title": "Students Not Required to Convey Certain Materials",
    "section": "8000 - STUDENTS",
    "itemId": "CJRJ434B24E2",
    "deepLink": "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=CJRJ434B24E2"
  }
];

export function lcpsPolicyCount(): number {
  return LCPS_POLICIES.length;
}

export function lcpsPolicyHref(p: LcpsPolicy): string {
  return p.pdfPath ?? p.deepLink;
}

export function lcpsPolicyIsHosted(p: LcpsPolicy): boolean {
  return Boolean(p.pdfPath);
}
