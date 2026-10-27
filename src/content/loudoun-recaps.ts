import { sortRecapsNewestFirst } from "./recap-sort";
import { LOUDOUN_RECAPS_BACKFILL } from "./loudoun-recaps-backfill";
/**
 * Loudoun BOS meeting recaps — one short page per meeting.
 *
 * HARD RULES (do not relax):
 *  - Decisions and votes come ONLY from official county records (eScribe
 *    minutes / Action Report / county-posted results). Cite and link each.
 *  - If the official record is not posted yet, say so and link the agenda.
 *    Never infer outcomes or votes from the video or the machine transcript.
 *  - "Moments" are neutral one-line topic labels + a video jump. Quotes, if
 *    any, must be verbatim from the transcript and flagged machine-transcribed;
 *    no speaker attribution unless the record clearly identifies the speaker.
 *  - Neutral tone. No commentary.
 */

export type RecapLink = { label: string; href: string };

export type RecapDecision = {
  /** Agenda item number, e.g. "14.g". */
  item: string;
  /** Plain description of the official action as recorded. */
  action: string;
  /** Official tally as recorded, e.g. "9-0" or "7-2 (Kershner, Letourneau opposed)". */
  tally?: string;
  source: RecapLink;
};

export type RecapAgendaItem = {
  num: string;
  title: string;
  /** Staff report on eScribe. */
  href?: string;
};

export type RecapAgendaGroup = {
  heading: string;
  dek?: string;
  items: RecapAgendaItem[];
};

export type RecapMoment = {
  /** Seconds into the meeting video. */
  seconds: number;
  /** Agenda item, when the moment maps to one. */
  item?: string;
  /** Neutral one-line description of the topic. */
  label: string;
  /** Optional verbatim machine-transcript quote (flagged on the page). */
  quote?: string;
};

export type RecapContextNote = { text: string; source: RecapLink };

export type LoudounRecap = {
  slug: string;
  /** Catalog meeting id (BOS LOUDOUN_MEETINGS or LCPS_MEETINGS). */
  meetingId: string;
  /** Venue for kicker / jump URL. Defaults to Board of Supervisors. */
  venue?: "loudoun-bos" | "loudoun-lcps";
  title: string;
  dateLabel: string;
  whenWhere: string;
  official: {
    /** True once minutes / Action Report with votes are posted and entered below. */
    votesPosted: boolean;
    /** When we last checked the county's posting (ET). */
    checkedLabel: string;
    note: string;
    links: RecapLink[];
  };
  decisions: RecapDecision[];
  context: RecapContextNote[];
  agenda: RecapAgendaGroup[];
  moments: RecapMoment[];
  /** Pilot: show Share controls (copy link / post on X) on each moment. */
  shareEnabled?: boolean;
  /** Short context for share text, e.g. "Loudoun BOS, Oct 6, 2026". */
  shareContext?: string;
  /**
   * Downloadable full machine transcript (built by scripts/ftm-transcript-download.mjs).
   * Omit until the files exist under public/.
   */
  transcriptDownloads?: {
    pdfUrl: string;
    txtUrl: string;
    /** Short size hint shown next to the PDF link, e.g. "76 pages". */
    pdfNote?: string;
  };
};

const ESCRIBE = "https://pub-loudoun.escribemeetings.com";
const doc = (id: number) => `${ESCRIBE}/FileStream.ashx?DocumentId=${id}`;
const ACTION_SEP15 =
  "https://lfportal.loudoun.gov/LFPortalinternet/0/edoc/1975550/09-15-26%20Business%20Meeting%20Action%20Report.pdf";
const ACTION_OCT6 =
  "https://lfportal.loudoun.gov/LFPortalInternet/0/edoc/1975929/Action%20Report%2010-06-26%20Business%20Meeting.pdf";
const ACTION_SEP9 =
  "https://lfportal.loudoun.gov/LFPortalinternet/0/edoc/1975535/09-09-26%20Public%20Hearing%20Action%20Report.pdf";
const ACTION_SEP1 =
  "https://lfportal.loudoun.gov/LFPortalinternet/0/edoc/1975185/09-01-26%20Business%20Meeting%20Action%20Report.pdf";

const ACTION_OCT14 =
  "https://lfportal.loudoun.gov/LFPortalinternet/0/edoc/1976056/10-14-26%20Public%20Hearing%20Action%20Report.pdf";
const ACTION_OCT20 =
  "https://lfportal.loudoun.gov/LFPortalinternet/0/edoc/1976200/10-20-26%20Business%20Meeting%20Action%20Report.pdf";
const OCT20_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=22e65f92-8862-46da-afba-f594bd09768a&Agenda=Agenda&lang=English`;
const OCT14_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=7960f118-c668-45ef-a975-2362de95de1c&Agenda=Agenda&lang=English`;
const OCT6_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=3a6eea40-36a8-49b2-9488-cedd456be4d9&Agenda=Agenda&lang=English`;
const SEP15_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=79595442-81c5-4c63-add5-9a91a8d6300b&Agenda=Agenda&lang=English`;
const SEP9_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=be4b3b17-ccfc-40f8-9ed4-0f8e705e0928&Agenda=Agenda&lang=English`;
const SEP1_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=929244b6-a7bd-4399-b2dc-47491ce17657&Agenda=Agenda&lang=English`;
const LASERFICHE_BOS =
  "https://lfportal.loudoun.gov/LFPortalInternet/Browse.aspx?startid=1975792&dbid=0";

const granicusAgenda = (clipId: number) =>
  `https://loudoun.granicus.com/AgendaViewer.php?view_id=73&clip_id=${clipId}`;
const granicusAction = (clipId: number, metaId: number) =>
  `https://loudoun.granicus.com/MetaViewer.php?view_id=73&clip_id=${clipId}&meta_id=${metaId}`;
const BOARDDOCS_LCPS = "https://go.boarddocs.com/vsba/loudoun/Board.nsf/Public";
const boarddocsMeeting = (id: string) =>
  `https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=${id}`;

const LOUDOUN_RECAPS_RAW: LoudounRecap[] = [

  // --- 2026-10-23 morning: Oct 20 BOS Business Meeting (Whisper transcript + Action Report memo dated Oct 22, Laserfiche edoc 1976200) ---
  {
    slug: "bos-2026-10-20-business",
    shareEnabled: true,
    shareContext: "Loudoun BOS, Oct 20, 2026",
    meetingId: "escribe-22e65f92",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Oct 20, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 8h 1m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 23, 2026, 8:00 AM ET",
      note: "Votes and deferrals below are taken from the county Action Report (memo dated Oct 22, 2026).",
      links: [
        { label: "Agenda (eScribe)", href: OCT20_AGENDA_HTML },
        { label: "Action Report (PDF)", href: ACTION_OCT20 },
        {
          label: "County document folder for Board meetings",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [
      {
        item: "4",
        action:
          "Consent agenda approved (7a–7f, 11a–11i, 14a, 14c, 14e, 14f, 14g, 14i, 14k, and 14m). Consent items include the Finance/GOED Committee contract items, the Administrative Items Report (among them a $5 million County grant to The Conservation Fund toward establishing Oak Hill as a future Virginia State Park), the Rivana at Innovation Station CDA revenue bond resolution, and the Mooreview Parkway renaming to Ashburn Village Boulevard ($275,000 budget adjustment).",
        tally: "7-0-2 (Supervisors Kershner and Saines absent)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "11.i",
        action:
          "St. Louis Deferred Forgivable Loan Program established and Program Manual approved; exception to the Water and Wastewater Projects Funding Policy approved, moving $1,000,000 from the Water and Wastewater Fund to the program. Consent item.",
        tally: "7-0-2 (Supervisors Kershner and Saines absent)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "14.d",
        action:
          "Discussion of a County-funded limited rent supplement program for cost-burdened renters sent to the FY 2028 budget process; as amended, staff will also analyze funding scenarios from $5 million to $10 million, in addition to the $1 million–$3 million scenarios already proposed.",
        tally: "6-3 (Supervisors Kershner, Letourneau, and Umstattd opposed)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "14.h (Motion 1)",
        action: "Department of Planning and Zoning Work Plan (Tables 1, 2, and 3) approved.",
        tally: "9-0",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "14.h (Motion 2)",
        action:
          "Motion to direct staff to require gas-insulated substations to be at least 500 feet from a residential use in the Data Center Standards and Locations Phase 2 zoning amendment (ZOAM-2025-0002), and to state a County preference for substations co-located on data center sites in the Phase 2 Comprehensive Plan Amendment (CPAM-2025-0001), failed.",
        tally: "3-6 (Supervisors Glass, Kershner, Letourneau, Saines, Turner, and Umstattd opposed)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "14.j",
        action:
          "LEGI-2023-0097, Quantum Park (ZCPA-2023-0008) denied, based on four findings for denial (substation compatibility and visual impacts, inconsistency with the original office-park vision and the Suburban Employment Place Type, need for added proffers, and strain on the electrical grid).",
        tally: "7-2 (Supervisors Kershner and Umstattd opposed)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "14.l",
        action:
          "LEGI-2025-0020, Tuscarora Crossing Landbay 4 (SPEX-2025-0036) approved, subject to the Conditions of Approval dated Oct 13, 2026 and the Findings for Approval.",
        tally: "5-4 (Supervisors Glass, Letourneau, Randall, and TeKrony opposed)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "14.n",
        action:
          "Board Member Initiative on Flock and ALPR camera data (research camera counts, data use/sharing, and retention, and invite local law enforcement agencies to a future meeting) tabled to the Nov 17, 2026 Business Meeting, while the Board works toward receiving surveillance-camera information from law enforcement agencies.",
        tally: "7-1-1 (Vice Chair Turner opposed; Supervisor Briskman absent)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "14.o",
        action:
          "LEGI-2025-0012, Golden Substation (SPEX-2025-0032, -0033, and -0137) moved up for action at the Nov 5, 2026 Business Meeting instead of Dec 1, 2026.",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "14.p",
        action:
          "Resolution to pause Board consideration of legislative applications for data centers and substations deferred to the Nov 17, 2026 Business Meeting (announced at the start of the meeting).",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "15 (closed session, Part 1)",
        action:
          "After the closed session on real property in the Algonkian District: County Administrator directed to continue discussions with Amazon Data Services, Inc. on the County acquiring about 25 acres on the Loudoun campus of George Washington University (valued at $65 million), and to accept a $5 million Amazon Data Services donation to the County housing trust.",
        tally: "9-0",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
      {
        item: "15 (closed session, Part 1)",
        action:
          "County Administrator directed to expeditiously process a rezoning application to include residential development and no data centers, with the 25 acres dedicated as a proffered contribution.",
        tally: "8-1 (Supervisor Umstattd opposed)",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
    ],
    context: [
      {
        text: "Item 14.l (Tuscarora Crossing Landbay 4) had been deferred from the Sept 15 and Oct 6, 2026 Business Meetings before this approval.",
        source: { label: "Oct 6, 2026 Action Report", href: ACTION_OCT6 },
      },
      {
        text: "A deferred closed-session item (legal advice on the data center grandfathering resolution) was moved to the Nov 5, 2026 Business Meeting.",
        source: { label: "Oct 20, 2026 Action Report", href: ACTION_OCT20 },
      },
    ],
    agenda: [
      {
        heading: "Information items",
        items: [
          { num: "10.a", title: "Youth in Government Day 2026", href: doc(1960) },
          { num: "10.b", title: "Advisory Commission on Youth Report – State of Youth of Loudoun County, 2026", href: doc(1956) },
          { num: "10.c", title: "Broadband Implementation Plan – Update", href: doc(1958) },
        ],
      },
      {
        heading: "Finance/GOED Committee reports (all on consent)",
        items: [
          { num: "11.a", title: "Award authority increase: Overhead Door and Security Gate Repair and Maintenance", href: doc(2012) },
          { num: "11.b", title: "Award authority increase: Advanced Technology Solutions Aggregator", href: doc(2000) },
          { num: "11.c", title: "Award authority increase: Software Solutions and Services", href: doc(2001) },
          { num: "11.d", title: "Contract award: Program Management and Governance Support Services", href: doc(2013) },
          { num: "11.e", title: "Contract renewal: Sidewalk and Trail Design Services", href: doc(2014) },
          { num: "11.f", title: "Loudoun Health Commission FY 2026 Annual Report", href: doc(2020) },
          { num: "11.g", title: "Proposed ordinance: real property owned by surviving spouses of certain persons killed in the line of duty", href: doc(2015) },
          { num: "11.h", title: "Reallocation of unspent Community Development Block Grant funds", href: doc(2026) },
          { num: "11.i", title: "St. Louis Deferred Forgivable Loan Program (Little River)", href: doc(2017) },
        ],
      },
      {
        heading: "Action items not proposed on consent",
        items: [
          { num: "14.b", title: "Appointments: nominations", href: doc(1934) },
          { num: "14.d", title: "BMI response: Limited Rent Supplement Program to Promote Housing Stability", href: doc(1993) },
          { num: "14.h", title: "Department of Planning and Zoning Work Plan", href: doc(1963) },
          { num: "14.j", title: "LEGI-2023-0097, Quantum Park: ZCPA-2023-0008 (Broad Run)", href: doc(1948) },
          { num: "14.l", title: "LEGI-2025-0020, Tuscarora Crossing Landbay 4: SPEX-2025-0036 (Leesburg)", href: doc(2004) },
          { num: "14.n", title: "BMI: Flock camera data collection from Loudoun County law enforcement departments", href: doc(2030) },
          { num: "14.o", title: "BMI: Golden Substation application scheduling (Sterling)", href: doc(2022) },
          { num: "14.p", title: "DEFERRED: Resolution to pause Board consideration of legislative applications for data centers and substations", href: doc(2023) },
          { num: "15", title: "Closed sessions (real property, Algonkian District; collective bargaining legal advice)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-10-20-board-of-supervisors-business-meeting.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-10-20-board-of-supervisors-business-meeting.txt",
      pdfNote: "84 pages",
    },
    moments: [
      { seconds: 783, label: "Meeting called to order." },
      { seconds: 923, item: "3", label: "Item 14.p deferral announced; consent agenda items read." },
      { seconds: 1501, item: "4", label: "Consent agenda vote." },
      { seconds: 10663, item: "15", label: "Board returns from closed session; certification vote." },
      { seconds: 11728, item: "8", label: "Public input session opens." },
      { seconds: 17619, item: "14.d", label: "Limited rent supplement initiative taken up." },
      { seconds: 19227, item: "14.h", label: "Planning and Zoning work plan presentation." },
      { seconds: 20832, item: "14.h", label: "Motion on gas-insulated substation setbacks and co-location read." },
      { seconds: 22095, item: "14.j", label: "Quantum Park application taken up." },
      { seconds: 23137, item: "14.l", label: "Tuscarora Crossing Landbay 4 application taken up." },
      { seconds: 24869, item: "14.n", label: "Flock camera data initiative taken up." },
      { seconds: 25788, item: "14.o", label: "Golden Substation scheduling motion read." },
    ],
  },

  // --- 2026-10-17 morning: Oct 14 BOS public hearing (Whisper transcript + Action Report posted Oct 16) ---
  {
    slug: "bos-2026-10-14-public-hearing",
    shareEnabled: true,
    shareContext: "Loudoun BOS, Oct 14, 2026",
    meetingId: "escribe-7960f118",
    title: "Board of Supervisors Public Hearing",
    dateLabel: "Wednesday, Oct 14, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 1h 8m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 17, 2026, 8:00 AM ET",
      note: "Votes below are taken from the county Action Report (memo dated Oct 16, 2026).",
      links: [
        { label: "Agenda (eScribe)", href: OCT14_AGENDA_HTML },
        { label: "Action Report (PDF)", href: ACTION_OCT14 },
        {
          label: "County document folder for Board meetings",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [
      {
        item: "3.a",
        action:
          "2028–2031 Board of Supervisors Term Compensation Structure forwarded to the Nov 5, 2026 Business Meeting for action, referring to Table 1 (Chair Randall’s substitute motion, seconded by Vice Chair Turner). Supervisor Glass’s original motion to forward the item (seconded by Supervisor Briskman) was replaced after the seconder did not accept a friendly amendment adding the Table 1 reference.",
        tally: "5-3-1 (Supervisors Kershner, Letourneau, and Umstattd opposed; Supervisor TeKrony absent)",
        source: { label: "Oct 14, 2026 Action Report", href: ACTION_OCT14 },
      },
      {
        item: "3.b",
        action:
          "Resolution approving the public use and necessity of acquiring real property interests by eminent domain for the Route 15 / Spinks Ferry Road / Newvalley Church Road Roundabout Project approved; County Attorney authorized to institute proceedings for the interests in Table 1 (Exhibits A–F). Consolidated hearing item.",
        tally: "7-0-2 (Supervisors Letourneau and TeKrony absent)",
        source: { label: "Oct 14, 2026 Action Report", href: ACTION_OCT14 },
      },
      {
        item: "3.c",
        action:
          "Resolution approving the public use and necessity of acquiring real property interests by eminent domain for Dulles West Boulevard (Northstar Boulevard to Arcola Boulevard) approved; County Attorney authorized to institute proceedings for the interests in Table 1 (Exhibits A–E). Consolidated hearing item.",
        tally: "7-0-2 (Supervisors Letourneau and TeKrony absent)",
        source: { label: "Oct 14, 2026 Action Report", href: ACTION_OCT14 },
      },
      {
        item: "3.d",
        action:
          "Resolution approving the public use and necessity of acquiring real property interests by eminent domain for the Sterling Boulevard and Glenn Drive intersection improvements approved; County Attorney authorized to institute proceedings for the interests in Table 1 (Exhibit A). Consolidated hearing item.",
        tally: "7-0-2 (Supervisors Letourneau and TeKrony absent)",
        source: { label: "Oct 14, 2026 Action Report", href: ACTION_OCT14 },
      },
      {
        item: "3.e",
        action:
          "Resolution approving the public use and necessity of acquiring real property interests by eminent domain for the Waxpool Road and Ashburn Road/Ryan Corner Place intersection improvements approved; County Attorney authorized to institute proceedings for the interests in Table 1 (Exhibits A and B). Consolidated hearing item.",
        tally: "7-0-2 (Supervisors Letourneau and TeKrony absent)",
        source: { label: "Oct 14, 2026 Action Report", href: ACTION_OCT14 },
      },
      {
        item: "3.f",
        action:
          "LEGI-2026-0001, Dulles Logistics: ZCPA-2026-0002 approved, subject to the Proffer Statement dated Sept 22, 2026 and the Findings for Approval (Attachments 1 and 2). Consolidated hearing item.",
        tally: "8-0-1 (Supervisor TeKrony absent)",
        source: { label: "Oct 14, 2026 Action Report", href: ACTION_OCT14 },
      },
    ],
    context: [],
    agenda: [
      {
        heading: "Hearing items (as published on the eScribe agenda)",
        dek: "Consolidated Hearing Agenda covered 3.b–3.f (per the Action Report); 3.a was heard separately; 3.g was advertised as deferred.",
        items: [
          { num: "3.a", title: "2028-2031 Board of Supervisors Term Compensation Structure (Countywide)", href: doc(1705) },
          { num: "3.b", title: "Eminent domain resolution: Route 15 / Spinks Ferry Road / Newvalley Church Road Roundabout Project (Catoctin)", href: doc(1695) },
          { num: "3.c", title: "Eminent domain resolution: Dulles West Boulevard, Northstar Boulevard to Arcola Boulevard (Dulles)", href: doc(1703) },
          { num: "3.d", title: "Eminent domain resolution: Sterling Boulevard and Glenn Drive Intersection Improvements (Sterling)", href: doc(1701) },
          { num: "3.e", title: "Eminent domain resolution: Waxpool Road and Ashburn Road/Ryan Corner Place Intersection Improvements (Ashburn and Broad Run)", href: doc(1698) },
          { num: "3.f", title: "LEGI-2026-0001, Dulles Logistics: ZCPA-2026-0002 (Dulles)", href: doc(1706) },
          { num: "3.g", title: "DEFERRED: LEGI-2024-0074, Spring Valley Technology Park: ZMAP-2025-0008, SPEX-2025-0009, SPEX-2025-0011, SPEX-2025-0136 & SPEX-2026-0004 (Ashburn)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-10-14-board-of-supervisors-public-hearing.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-10-14-board-of-supervisors-public-hearing.txt",
      pdfNote: "15 pages",
    },
    moments: [
      { seconds: 848, label: "Meeting called to order." },
      { seconds: 988, label: "Consolidated hearing agenda (3.b–3.f) read; Spring Valley Technology Park noted as deferred." },
      { seconds: 1678, item: "3.a", label: "2028–2031 Board compensation structure taken up." },
      { seconds: 2188, item: "3.a", label: "Public input on the compensation item." },
      { seconds: 3993, item: "3.a", label: "Substitute motion referencing Table 1 put to a vote." },
    ],
  },
  // --- 2026-10-11 morning: newest pending BOS + LCPS (interleaved) ---
  {
    slug: "lcps-2026-07-13-special",
    meetingId: "2026-07-13-1209536330",
    venue: "loudoun-lcps",
    title: "School Board Special Meeting",
    dateLabel: "Monday, Jul 13, 2026",
    whenWhere: "School Board meeting · video 2h 49m",
        official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:40 AM ET",
      note: "Votes below are taken from the BoardDocs minutes for this special meeting (adopted record). Tallies list members as the minutes record them.",
      links: [
        { label: "BoardDocs meeting / minutes", href: boarddocsMeeting("DVQRL36E74A2") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1209536330?rel=0" },
      ],
    },
    decisions: [
      {
        item: "1.02",
        action: "Granted Chair April Chandler's request to participate remotely using a personal exemption.",
        tally: "8-0 (Approved: LaBell, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "Jul 13, 2026 BoardDocs minutes", href: boarddocsMeeting("DVQRL36E74A2") },
      },
      {
        item: "3.01",
        action: "Suspended the rules (2/3 required) to permit the School Board to consider and act upon Policy 6355.",
        tally: "8-1 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Opposed: Donohue)",
        source: { label: "Jul 13, 2026 BoardDocs minutes", href: boarddocsMeeting("DVQRL36E74A2") },
      },
      {
        item: "3.01",
        action: "Adopted Policy 6355, Electric Transmission and Power Line Facilities on LCPS Property, as presented. A substitute motion to send the item to the Finance & Operations Committee for review failed.",
        tally: "Base motion 8-0-1 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Abstained: Donohue). Substitute failed 3-6 (Approved: Donohue, Pepper, Shernoff; Opposed: Chandler, Griffiths, LaBell, Rashid, Riccardi, Svenson).",
        source: { label: "Jul 13, 2026 BoardDocs minutes", href: boarddocsMeeting("DVQRL36E74A2") },
      },
      {
        item: "3.01",
        action: "Authorized counsel to file a reconsideration/clarification petition in PUR-2025-00056 before the Virginia State Corporation Commission, along with other pleadings including a notice of appeal as may be required to safeguard the School Board's interests; and authorized a without-prejudice negotiation regarding the proposed transmission line routes with Dominion focused on safeguarding student safety and school operations (as amended by friendly amendment).",
        tally: "9-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "Jul 13, 2026 BoardDocs minutes", href: boarddocsMeeting("DVQRL36E74A2") },
      },
    ],
    context: [
      {
        text: "Special meeting held at Rock Ridge High School (boardroom renovations). Agenda limited to Dominion Energy Golden to Mars transmission line / Policy 6355. Adjournment recorded at 8:19 p.m.",
        source: { label: "Jul 13, 2026 BoardDocs minutes", href: boarddocsMeeting("DVQRL36E74A2") },
      },
    ],
        agenda: [
      {
        heading: "Action items",
        items: [
          { num: "1.02", title: "Remote participation (Chandler)" },
          { num: "3.01", title: "Dominion Energy – Golden to Mars / Policy 6355" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-07-13-special-school-board-meeting.pdf",
      txtUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-07-13-special-school-board-meeting.txt",
      pdfNote: "36 pages",
    },
    moments: [
      { seconds: 64, label: "Public comment." },
      { seconds: 1284, label: "Early agenda business." },
      { seconds: 3885, label: "Mid-meeting discussion." },
      { seconds: 7535, label: "Later agenda business." },
      { seconds: 10103, label: "Adjournment." },
    ],
  },
  {
    slug: "lcps-2026-06-23-4th-tuesday",
    meetingId: "2026-06-23-1203915618",
    venue: "loudoun-lcps",
    title: "School Board 4th Tuesday Meeting",
    dateLabel: "Tuesday, Jun 23, 2026",
    whenWhere: "School Board meeting · video 7h",
        official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:40 AM ET",
      note: "Votes below are taken from the BoardDocs minutes for this meeting (adopted record). Tallies list members as the minutes record them.",
      links: [
        { label: "BoardDocs meeting / minutes", href: boarddocsMeeting("DUGNPZ60F897") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1203915618?rel=0" },
      ],
    },
    decisions: [
      {
        item: "3",
        action: "Consent agenda adopted (3.01–3.16 as recorded): minutes of June 8 special and June 9 meetings; personnel actions; Consolidated Grant Application; Policy 8655 revisions; Elaine E. Thompson ES easement authorization; RFP renewals/awards (property/casualty insurance, lease/purchase financing, pest management, elevators, agency nursing, groceries); Policy 4370 revision; charter school technology/support contracts; Disability Pride Month and America 250 proclamations.",
        tally: "7-0-0 (Approved: LaBell, Chandler, Donohue, Rashid, Riccardi, Pepper, Svenson; Not present at vote: Griffiths, Shernoff)",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
      {
        item: "11.01",
        action: "FY26 Year-End Budget Alignment: approved a $2,300,000 transfer within the School Operating Fund; supplemental increases of $900,000 (VLDP), $200,000 (WC), and $50,000 (STD) funded by transfers from the School Operating Fund; and a $33,000,000 supplemental increase for the Health Self Insurance Fund recognizing FY25 County Year-End support and above-budget revenues.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Riccardi, Pepper, Svenson; Not present at vote: Shernoff)",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
      {
        item: "11.02",
        action: "Adopted revised Policy 4310 (Purchasing Authority) as amended. Amendment struck section C.4 and D.3.b (with renumbering) as recorded.",
        tally: "Policy as amended 6-2-0 (Approved: LaBell, Chandler, Donohue, Rashid, Pepper, Svenson; Opposed: Griffiths, Riccardi; Not present at vote: Shernoff). Amendment 5-3-0 (Approved: Chandler, Donohue, Rashid, Pepper, Svenson; Opposed: LaBell, Griffiths, Riccardi; Not present at vote: Shernoff).",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
      {
        item: "11.03",
        action: "Approved LCPS Head Start Preschool Grant Continuation Application–Year 3 of 5 and Annual Governing Body Overview and Approvals; directed staff to consider expansion of STEP classrooms in staff plans for the upcoming Eastern Loudoun Elementary Boundary process.",
        tally: "7-0-1 (Approved: LaBell, Chandler, Donohue, Rashid, Riccardi, Pepper, Svenson; Abstained: Griffiths; Not present at vote: Shernoff)",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
      {
        item: "11.04",
        action: "Named the new high school at 41634 Steeplechase Loop Drive, Leesburg, Thornton Summit High School. A substitute motion to name it Red Hill High School failed; a motion to call the question also failed.",
        tally: "6-2-0 (Approved: LaBell, Chandler, Donohue, Rashid, Pepper, Svenson; Opposed: Griffiths, Riccardi; Not present at vote: Shernoff). Red Hill substitute failed 2-6; call the question failed 5-3.",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
      {
        item: "11.05",
        action: "Approved Policy 8210, Introduction to Student Discipline.",
        tally: "7-0-1 (Approved: LaBell, Chandler, Griffiths, Rashid, Riccardi, Pepper, Svenson; Abstained: Donohue; Not present at vote: Shernoff)",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
      {
        item: "11.06",
        action: "Approved Policy 8270, Student Dress Code, as amended (multiple amendments recorded in the minutes, including neckline language changes; a motion to return the policy to committee failed).",
        tally: "5-2-1 (Approved: LaBell, Chandler, Donohue, Riccardi, Svenson; Opposed: Griffiths, Rashid; Abstained: Pepper; Not present at vote: Shernoff)",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
      {
        item: "11.07",
        action: "Approved and adopted Revised Policy 8250, Bullying Prevention and Education, as amended.",
        tally: "7-1-0 (Approved: Chandler, Donohue, Griffiths, Rashid, Riccardi, Pepper, Svenson; Opposed: LaBell; Not present at vote: Shernoff)",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
      {
        item: "16.04",
        action: "Closed-meeting follow-on authorizations (as recorded): counsel actions on a former-employee legal matter (including filing an appeal); Chair/counsel resolution of a former-employee matter; staff/counsel actions on Loudoun County Circuit Court matter CL22-2964; and Chair/counsel/staff actions on real-property acquisition and PUR-2025-00056.",
        tally: "Each 7-0-0 (Approved: LaBell, Chandler, Donohue, Rashid, Riccardi, Pepper, Svenson; Not present at vote: Griffiths, Shernoff)",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
    ],
    context: [
      {
        text: "Griffiths and Shernoff not present for the consent vote; Shernoff not present for most evening Action Items. Adjournment recorded at 11:32 p.m.",
        source: { label: "Jun 23, 2026 BoardDocs minutes", href: boarddocsMeeting("DUGNPZ60F897") },
      },
    ],
        agenda: [
      {
        heading: "On consent (passed as recorded)",
        items: [
          { num: "3.01–3.03", title: "Prior minutes and personnel actions" },
          { num: "3.04–3.05", title: "Consolidated Grant Application; Policy 8655 revisions" },
          { num: "3.06–3.13", title: "Easement authorization, RFP renewals/awards, Policy 4370" },
          { num: "3.14–3.16", title: "Charter school contracts; Disability Pride Month and America 250 proclamations" },
        ],
      },
      {
        heading: "Action items (selected)",
        items: [
          { num: "11.01", title: "FY26 Year-End Budget Alignment" },
          { num: "11.02", title: "Policy 4310 – Purchasing Authority" },
          { num: "11.03", title: "Head Start grant continuation / STEP classrooms" },
          { num: "11.04", title: "HS-14 name (Thornton Summit High School)" },
          { num: "11.05–11.07", title: "Policies 8210, 8270, 8250" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-06-23-4th-tuesday-school-board-meeting.pdf",
      txtUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-06-23-4th-tuesday-school-board-meeting.txt",
      pdfNote: "68 pages",
    },
    moments: [
      { seconds: 36, label: "Meeting called to order." },
      { seconds: 321, label: "Consent agenda taken up." },
      { seconds: 8599, label: "Public comment." },
      { seconds: 19836, label: "Closed session." },
      { seconds: 24812, label: "Adjournment." },
    ],
  },
  {
    slug: "bos-2026-06-16-business",
    meetingId: "8199",
    venue: "loudoun-bos",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Jun 16, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 8h 51m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:15 AM ET",
      note: "Votes below are taken from the county Action Report (Granicus MetaViewer meta_id 284488).",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8199) },
        { label: "Action Report (PDF)", href: granicusAction(8199, 284488) },
      ],
    },
    decisions: [
      {
        item: "Consent",
        action: "Consent agenda approved (R-1, R-2, 1b–1n, 1p, 1q, 1s, 2a, 3, 4, 5, 9, 10, 11, and 14).",
        tally: "7-0-2 (Supervisors Kershner and Saines absent)",
        source: { label: "Jun 16, 2026 Action Report", href: granicusAction(8199, 284488) },
      },
      {
        item: "1a",
        action: "2025 Capital Intensity Factors advertised for a future public hearing; implementation of the 100 percent phase of the 2023 CIFs paused until a future effective date (as recorded).",
        tally: "8-0-1 (Vice Chair Turner absent)",
        source: { label: "Jun 16, 2026 Action Report", href: granicusAction(8199, 284488) },
      },
    ],
    context: [],
    agenda: [
      {
        heading: "Agenda (see Granicus for official item list)",
        dek: "Item labels below are neutral topic markers from the meeting video for navigation only — not an official agenda reprint.",
        items: [
          { num: "—", title: "Call to order / procedural opening" },
          { num: "—", title: "Consent and/or hearing items (see Action Report when posted)" },
          { num: "—", title: "Public input / comment (when taken)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-06-16-business.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-06-16-business.txt",
      pdfNote: "101 pages",
    },
    moments: [
      { seconds: 421, label: "Meeting called to order." },
      { seconds: 576, label: "Consent agenda taken up." },
      { seconds: 647, label: "Closed session." },
      { seconds: 2040, label: "Public hearing item." },
      { seconds: 8591, label: "Adjournment." },
    ],
  },
  {
    slug: "bos-2026-06-10-public-hearing",
    meetingId: "8198",
    venue: "loudoun-bos",
    title: "Board of Supervisors Public Hearing",
    dateLabel: "Wednesday, Jun 10, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 3h 10m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:15 AM ET",
      note: "Votes below are taken from the county Action Report (Granicus MetaViewer meta_id 285182).",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8198) },
        { label: "Action Report (PDF)", href: granicusAction(8198, 285182) },
      ],
    },
    decisions: [
      {
        item: "1",
        action: "FY 2027–FY 2032 Secondary Road Six-Year Plan forwarded to the July 7, 2026 Business Meeting for action; staff directed to bring the VDOT Secondary Road Program matter back after decision-making criteria are developed.",
        tally: "8-0-1 (Supervisor Letourneau absent)",
        source: { label: "Jun 10, 2026 Action Report", href: granicusAction(8198, 285182) },
      },
      {
        item: "2",
        action: "LEGI-2025-0012, Golden Substation — removed from the agenda.",
        source: { label: "Jun 10, 2026 Action Report", href: granicusAction(8198, 285182) },
      },
      {
        item: "3",
        action: "LEGI-2024-0012, Happy Paws K-9 forwarded to the July 21, 2026 Business Meeting for action (as amended in the Action Report).",
        tally: "7-0-2 (Supervisors Letourneau and Umstattd absent)",
        source: { label: "Jun 10, 2026 Action Report", href: granicusAction(8198, 285182) },
      },
      {
        item: "4",
        action: "LEGI-2025-0052, R&D Hamilton Academy deferred to the July 15, 2026 Public Hearing.",
        source: { label: "Jun 10, 2026 Action Report", href: granicusAction(8198, 285182) },
      },
    ],
    context: [],
    agenda: [
      {
        heading: "Agenda (see Granicus for official item list)",
        dek: "Item labels below are neutral topic markers from the meeting video for navigation only — not an official agenda reprint.",
        items: [
          { num: "—", title: "Call to order / procedural opening" },
          { num: "—", title: "Consent and/or hearing items (see Action Report when posted)" },
          { num: "—", title: "Public input / comment (when taken)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-06-10-public-hearing.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-06-10-public-hearing.txt",
      pdfNote: "48 pages",
    },
    moments: [
      { seconds: 668, label: "Meeting called to order." },
      { seconds: 3640, label: "Public comment." },
      { seconds: 3176, label: "Adjournment." },
    ],
  },
  {
    slug: "lcps-2026-06-09-2nd-tuesday",
    meetingId: "2026-06-09-1199853132",
    venue: "loudoun-lcps",
    title: "School Board 2nd Tuesday Meeting",
    dateLabel: "Tuesday, Jun 9, 2026",
    whenWhere: "School Board meeting · video 6h 28m",
        official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:40 AM ET",
      note: "Votes below are taken from the BoardDocs minutes for this meeting (adopted record). Tallies list members as the minutes record them.",
      links: [
        { label: "BoardDocs meeting / minutes", href: boarddocsMeeting("DU2GDH431BE9") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1199853132?rel=0" },
      ],
    },
    decisions: [
      {
        item: "3",
        action: "Consent agenda adopted (3.01–3.07 as recorded): minutes of May 26 meeting; personnel actions; RFP #R23260 turf maintenance renewal; RFP #R26022 EAP award; IFB #I26214 cafeteria paper supplies; religious attendance exemption; School Board Advisory Committee membership.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "Jun 9, 2026 BoardDocs minutes", href: boarddocsMeeting("DU2GDH431BE9") },
      },
      {
        item: "13.01",
        action: "Approved the resolution requesting financing for approved CIP projects not to exceed $91,160,000 for school purposes.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "Jun 9, 2026 BoardDocs minutes", href: boarddocsMeeting("DU2GDH431BE9") },
      },
      {
        item: "13.02",
        action: "Approved proposed changes to Policy 2350 (Appeal of Administrative Decisions) as amended (cross-reference to Policy 8160 added).",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "Jun 9, 2026 BoardDocs minutes", href: boarddocsMeeting("DU2GDH431BE9") },
      },
      {
        item: "13.03",
        action: "Approved proposed changes to Policy 3040 (School Building Administration) as amended (Virginia Code §22.1-293 preface and principal/assistant-principal supervision language added).",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "Jun 9, 2026 BoardDocs minutes", href: boarddocsMeeting("DU2GDH431BE9") },
      },
      {
        item: "13.04",
        action: "Approved Policy 8265, Student Searches Involving Students and Seizure of Contraband.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "Jun 9, 2026 BoardDocs minutes", href: boarddocsMeeting("DU2GDH431BE9") },
      },
    ],
    context: [
      {
        text: "Vice Chair Anne Donohue not present at vote for consent and Action Items recorded above. Adjournment recorded at 10:53 p.m.",
        source: { label: "Jun 9, 2026 BoardDocs minutes", href: boarddocsMeeting("DU2GDH431BE9") },
      },
    ],
        agenda: [
      {
        heading: "On consent (passed as recorded)",
        items: [
          { num: "3.01–3.02", title: "May 26 minutes; personnel actions" },
          { num: "3.03–3.05", title: "Turf maintenance renewal; EAP award; cafeteria paper IFB" },
          { num: "3.06–3.07", title: "Religious attendance exemption; advisory committee membership" },
        ],
      },
      {
        heading: "Action items",
        items: [
          { num: "13.01", title: "CIP financing request (not to exceed $91,160,000)" },
          { num: "13.02", title: "Policy 2350 – Appeal of Administrative Decisions" },
          { num: "13.03", title: "Policy 3040 – School Building Administration" },
          { num: "13.04", title: "Policy 8265 – Student Searches" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-06-09-2nd-tuesday-school-board-meeting.pdf",
      txtUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-06-09-2nd-tuesday-school-board-meeting.txt",
      pdfNote: "81 pages",
    },
    moments: [
      { seconds: 313, label: "Meeting called to order." },
      { seconds: 613, label: "Consent agenda taken up." },
      { seconds: 872, label: "Public hearing item." },
      { seconds: 4618, label: "Closed session." },
      { seconds: 7658, label: "Adjournment." },
    ],
  },
  {
    slug: "bos-2026-06-02-business",
    meetingId: "8191",
    venue: "loudoun-bos",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Jun 2, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 7h 13m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:15 AM ET",
      note: "Votes below are taken from the county Action Report (Granicus MetaViewer meta_id 283227).",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8191) },
        { label: "Action Report (PDF)", href: granicusAction(8191, 283227) },
      ],
    },
    decisions: [
      {
        item: "Consent",
        action: "Consent agenda approved (R-1–R-6, 2a, 3, 4, 5, 7, 9, and 11).",
        tally: "6-0-3 (Supervisors Kershner, Letourneau, and Saines absent)",
        source: { label: "Jun 2, 2026 Action Report", href: granicusAction(8191, 283227) },
      },
      {
        item: "1a",
        action: "Algonkian Parkway Multimodal Feasibility Study — Board directed staff not to pursue further evaluation of long-term improvements associated with Concept C (as recorded).",
        source: { label: "Jun 2, 2026 Action Report", href: granicusAction(8191, 283227) },
      },
      {
        item: "5",
        action: "High Voltage Direct Current Transmission Infrastructure Study Proposal initiated; Scope of Work approved (as recorded).",
        source: { label: "Jun 2, 2026 Action Report", href: granicusAction(8191, 283227) },
      },
      {
        item: "8",
        action: "LEGI-2023-0080, Valley Commerce Center approved subject to the Proffer Statement dated May 28, 2026 (as recorded).",
        source: { label: "Jun 2, 2026 Action Report", href: granicusAction(8191, 283227) },
      },
    ],
    context: [],
    agenda: [
      {
        heading: "Agenda (see Granicus for official item list)",
        dek: "Item labels below are neutral topic markers from the meeting video for navigation only — not an official agenda reprint.",
        items: [
          { num: "—", title: "Call to order / procedural opening" },
          { num: "—", title: "Consent and/or hearing items (see Action Report when posted)" },
          { num: "—", title: "Public input / comment (when taken)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-06-02-business.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-06-02-business.txt",
      pdfNote: "77 pages",
    },
    moments: [
      { seconds: 455, label: "Meeting called to order." },
      { seconds: 642, label: "Consent agenda taken up." },
      { seconds: 1239, label: "Closed session." },
      { seconds: 3540, label: "Adjournment." },
      { seconds: 8622, label: "Public comment." },
    ],
  },
  {
    slug: "lcps-2026-05-26-4th-tuesday",
    meetingId: "2026-05-26-1195679789",
    venue: "loudoun-lcps",
    title: "School Board 4th Tuesday Meeting",
    dateLabel: "Tuesday, May 26, 2026",
    whenWhere: "School Board meeting · video 6h 59m",
        official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:40 AM ET",
      note: "Votes below are taken from the BoardDocs minutes for this meeting (adopted June 9, 2026). Tallies list members as the minutes record them.",
      links: [
        { label: "BoardDocs meeting / minutes", href: boarddocsMeeting("DTMGXL45D585") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1195679789?rel=0" },
      ],
    },
    decisions: [
      {
        item: "2",
        action: "Consent agenda adopted (2.01–2.10 as recorded): minutes of April 28, May 11 special, and May 12 meetings; personnel actions; IFB athletic equipment and toner/ink; Caribbean American Heritage Month, Gun Violence Awareness Day, LGBTQ+ Pride Month, and Juneteenth proclamations.",
        tally: "3-0-4 (Approved: Chandler, Pepper, Rashid; Abstained: Griffiths, LaBell, Riccardi, Shernoff; Not present at vote: Donohue, Svenson)",
        source: { label: "May 26, 2026 BoardDocs minutes", href: boarddocsMeeting("DTMGXL45D585") },
      },
      {
        item: "11.01",
        action: "Adopted the proposed meeting calendar for the FY 2028–FY 2033 Capital Budget and an Eastern Loudoun Planning District elementary school attendance zone change process; directed notification of the listed elementary school communities (notification does not indicate a zone will change).",
        tally: "9-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "May 26, 2026 BoardDocs minutes", href: boarddocsMeeting("DTMGXL45D585") },
      },
      {
        item: "15.04",
        action: "Following the School Board's October 28, 2025 vote under Policy 7014, upheld the superintendent's September 30, 2025 decision pertaining to this employee matter.",
        tally: "7-0-1 (Approved: LaBell, Chandler, Griffiths, Rashid, Riccardi, Pepper, Svenson; Abstained: Shernoff; Not present at vote: Donohue)",
        source: { label: "May 26, 2026 BoardDocs minutes", href: boarddocsMeeting("DTMGXL45D585") },
      },
      {
        item: "15.04",
        action: "Directed staff to take the actions as discussed in closed regarding the specific public officer and matter pertaining to litigation, and reaffirmed the confidentiality and claim of privilege of the matters discussed in closed.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "May 26, 2026 BoardDocs minutes", href: boarddocsMeeting("DTMGXL45D585") },
      },
    ],
    context: [
      {
        text: "Gap / note: consent passed 3-0-4 with Donohue and Svenson not present at that vote (both had been approved for remote participation earlier). Work-session items 3.01–3.03 (Title I / after-school / summer programs) were not recorded as Action Item votes. Adjournment recorded at 11:25 p.m.",
        source: { label: "May 26, 2026 BoardDocs minutes", href: boarddocsMeeting("DTMGXL45D585") },
      },
    ],
        agenda: [
      {
        heading: "On consent (passed as recorded)",
        items: [
          { num: "2.01–2.04", title: "Prior minutes and personnel actions" },
          { num: "2.05–2.06", title: "Athletic equipment IFB; toner/ink IFB" },
          { num: "2.07–2.10", title: "Heritage Month / Awareness Day / Pride Month / Juneteenth proclamations" },
        ],
      },
      {
        heading: "Action items",
        items: [
          { num: "11.01", title: "Capital budget / Eastern Loudoun elementary attendance zone process calendar" },
          { num: "15.04", title: "Closed-meeting follow-on (employee matter; litigation privilege)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-05-26-4th-tuesday-school-board-meeting.pdf",
      txtUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-05-26-4th-tuesday-school-board-meeting.txt",
      pdfNote: "65 pages",
    },
    moments: [
      { seconds: 323, label: "Meeting called to order." },
      { seconds: 414, label: "Consent agenda taken up." },
      { seconds: 9987, label: "Public comment." },
      { seconds: 10899, label: "Public hearing item." },
      { seconds: 17891, label: "Closed session." },
    ],
  },
  {
    slug: "bos-2026-05-19-business",
    meetingId: "8185",
    venue: "loudoun-bos",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, May 19, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 8h 53m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:15 AM ET",
      note: "Votes below are taken from the county Action Report (Granicus MetaViewer meta_id 282415).",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8185) },
        { label: "Action Report (PDF)", href: granicusAction(8185, 282415) },
      ],
    },
    decisions: [
      {
        item: "Consent",
        action: "Consent agenda approved (R-1–R-6, 1b, 1c, 1e, 1f, 1h, 2a, 3a, 4, 5, 6, 7, 8, 9, 13, and 15).",
        tally: "8-0-1 (Supervisor Saines absent)",
        source: { label: "May 19, 2026 Action Report", href: granicusAction(8185, 282415) },
      },
      {
        item: "—",
        action: "Items 11 (Valley Commerce Center) and 16 (Juneteenth Celebration – Loudoun Freedom Center) deferred to the June 2, 2026 Business Meeting (announced at the meeting; recorded in the Action Report).",
        source: { label: "May 19, 2026 Action Report", href: granicusAction(8185, 282415) },
      },
    ],
    context: [],
    agenda: [
      {
        heading: "Agenda (see Granicus for official item list)",
        dek: "Item labels below are neutral topic markers from the meeting video for navigation only — not an official agenda reprint.",
        items: [
          { num: "—", title: "Call to order / procedural opening" },
          { num: "—", title: "Consent and/or hearing items (see Action Report when posted)" },
          { num: "—", title: "Public input / comment (when taken)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-05-19-business.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-05-19-business.txt",
      pdfNote: "84 pages",
    },
    moments: [
      { seconds: 380, label: "Meeting called to order." },
      { seconds: 570, label: "Closed session." },
      { seconds: 631, label: "Consent agenda taken up." },
      { seconds: 2026, label: "Public comment." },
      { seconds: 4948, label: "Adjournment." },
    ],
  },
  {
    slug: "bos-2026-05-13-business-reconvened",
    meetingId: "8179",
    venue: "loudoun-bos",
    title: "Board of Supervisors Business Meeting (reconvened May 5)",
    dateLabel: "Wednesday, May 13, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 34m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 27, 2026, 4:40 PM ET",
      note: "Official vote record not yet posted on Granicus for this clip (Action Report section present but no Action Report document linked). Decisions will be filled from the county Action Report when available. Do not infer votes from the video or machine transcript.",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8179) },
        { label: "Meeting video (Granicus)", href: "https://loudoun.granicus.com/player/clip/8179" },
      ],
    },
    decisions: [],
    context: [],
    agenda: [
      {
        heading: "Agenda (see Granicus for official item list)",
        dek: "Item labels below are neutral topic markers from the meeting video for navigation only — not an official agenda reprint.",
        items: [
          { num: "—", title: "Call to order / procedural opening" },
          { num: "—", title: "Consent and/or hearing items (see Action Report when posted)" },
          { num: "—", title: "Public input / comment (when taken)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-05-13-business-reconvened.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-05-13-business-reconvened.txt",
      pdfNote: "2 pages",
    },
    moments: [
      { seconds: 0, label: "Early agenda business." },
      { seconds: 25, label: "Closed session." },
      { seconds: 55, label: "Mid-meeting discussion." },
      { seconds: 2048, label: "Later agenda business." },
    ],
  },
  {
    slug: "bos-2026-05-13-public-hearing",
    meetingId: "8178",
    venue: "loudoun-bos",
    title: "Board of Supervisors Public Hearing",
    dateLabel: "Wednesday, May 13, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 1h 48m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 27, 2026, 4:40 PM ET",
      note: "Official vote record not yet posted on Granicus for this clip (Action Report section present but no Action Report document linked). Decisions will be filled from the county Action Report when available. Do not infer votes from the video or machine transcript.",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8178) },
        { label: "Meeting video (Granicus)", href: "https://loudoun.granicus.com/player/clip/8178" },
      ],
    },
    decisions: [],
    context: [],
    agenda: [
      {
        heading: "Agenda (see Granicus for official item list)",
        dek: "Item labels below are neutral topic markers from the meeting video for navigation only — not an official agenda reprint.",
        items: [
          { num: "—", title: "Call to order / procedural opening" },
          { num: "—", title: "Consent and/or hearing items (see Action Report when posted)" },
          { num: "—", title: "Public input / comment (when taken)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-05-13-public-hearing.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-05-13-public-hearing.txt",
      pdfNote: "27 pages",
    },
    moments: [
      { seconds: 265, label: "Meeting called to order." },
      { seconds: 1105, label: "Early agenda business." },
      { seconds: 1252, label: "Public input." },
      { seconds: 3066, label: "Mid-meeting discussion." },
      { seconds: 4837, label: "Later agenda business." },
    ],
  },
  {
    slug: "lcps-2026-05-12-2nd-tuesday",
    meetingId: "2026-05-12-1191636709",
    venue: "loudoun-lcps",
    title: "School Board 2nd Tuesday Meeting",
    dateLabel: "Tuesday, May 12, 2026",
    whenWhere: "School Board meeting · video 6h 33m",
        official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:40 AM ET",
      note: "Votes below are taken from the BoardDocs minutes for this meeting (adopted record). Tallies list members as the minutes record them.",
      links: [
        { label: "BoardDocs meeting / minutes", href: boarddocsMeeting("DT6HMP4919FD") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1191636709?rel=0" },
      ],
    },
    decisions: [
      {
        item: "3",
        action: "Consent agenda adopted (3.01–3.11 as recorded): personnel actions; renewals (fresh produce, ice cream, milk, vehicle repair, petroleum); revised Policies 5310/5330 deletion, 6640, and 8080; VSBA Excellence in Workforce Readiness Award application; ratification of April 28 closed-meeting certification motion.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
      {
        item: "13.01",
        action: "Approved a $6,200,000 budget increase for the FY27 School Operating Fund and requested the Loudoun County Board of Supervisors appropriate the corresponding increase (as recorded).",
        tally: "7-1-0 (Approved: LaBell, Chandler, Rashid, Shernoff, Riccardi, Pepper, Svenson; Opposed: Griffiths; Not present at vote: Donohue)",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
      {
        item: "13.02",
        action: "Adopted new Policy 4190, Other Post Employment Benefits (OPEB) Funding. Two Riccardi amendments failed (C.7 annual OPEB reporting language failed 4-4; a further amendment failed 3-5).",
        tally: "Policy adopted 7-1-0 (Approved: LaBell, Chandler, Rashid, Shernoff, Riccardi, Pepper, Svenson; Opposed: Griffiths; Not present at vote: Donohue). C.7 amendment failed 4-4; second amendment failed 3-5.",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
      {
        item: "13.03",
        action: "Approved renewal of the LCPS contract with Fairfax County Public Schools to continue sending students to Thomas Jefferson High School for Science and Technology for SY2027-2028 (as recorded).",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
      {
        item: "13.04",
        action: "Approved and adopted Revised Policy 8115, Individuals Who May Be Admitted Free.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
      {
        item: "13.05",
        action: "Accepted and adopted New Policy 8425, Student-Athlete Extreme Heat Safety and Protection.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
      {
        item: "13.06",
        action: "Approved the 2026-2027 Local Plan for Career and Technical Education (CTE) Perkins Funds and endorsed the Chair and Superintendent to sign the local plan.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
      {
        item: "17.04",
        action: "Authorized the School Board Chair to take action as discussed in the closed session.",
        tally: "8-0-0 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Not present at vote: Donohue)",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
    ],
    context: [
      {
        text: "Vice Chair Anne Donohue absent (minutes attendance). Gap note: minutes narrative describes the Policy 4190 C.7 amendment failing on a 4-4 tie before listing the base adoption vote; both outcomes are recorded as above. Adjournment follows closed-meeting items.",
        source: { label: "May 12, 2026 BoardDocs minutes", href: boarddocsMeeting("DT6HMP4919FD") },
      },
    ],
        agenda: [
      {
        heading: "On consent (passed as recorded)",
        items: [
          { num: "3.01–3.06", title: "Personnel actions; produce/ice cream/milk/vehicle/petroleum renewals" },
          { num: "3.07–3.09", title: "Policies 5310/5330, 6640, 8080" },
          { num: "3.10–3.11", title: "VSBA workforce readiness award; April 28 certification ratification" },
        ],
      },
      {
        heading: "Action items",
        items: [
          { num: "13.01", title: "FY27 budget supplemental ($6.2M state funding)" },
          { num: "13.02", title: "Policy 4190 – OPEB Funding" },
          { num: "13.03", title: "TJHSST / FCPS agreement renewal" },
          { num: "13.04–13.06", title: "Policies 8115, 8425; CTE Perkins local plan" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-05-12-2nd-tuesday-school-board-meeting.pdf",
      txtUrl: "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-05-12-2nd-tuesday-school-board-meeting.txt",
      pdfNote: "68 pages",
    },
    moments: [
      { seconds: 125, label: "Meeting called to order." },
      { seconds: 366, label: "Consent agenda taken up." },
      { seconds: 10731, label: "Public comment." },
      { seconds: 15022, label: "Public hearing item." },
    ],
  },
  {
    slug: "bos-2026-05-05-business",
    meetingId: "8174",
    venue: "loudoun-bos",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, May 5, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 6h 26m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 11, 2026, 8:15 AM ET",
      note: "Votes below are taken from the county Action Report (Granicus MetaViewer meta_id 281233).",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8174) },
        { label: "Action Report (PDF)", href: granicusAction(8174, 281233) },
      ],
    },
    decisions: [
      {
        item: "Consent",
        action: "Consent agenda approved (R-1–R-8, 1a, 2, 5, 10, and 13).",
        tally: "6-0-3 (Supervisors Kershner, Letourneau, and Turner absent)",
        source: { label: "May 5, 2026 Action Report", href: granicusAction(8174, 281233) },
      },
      {
        item: "3",
        action: "Banshee Reeks Nature Preserve equestrian-use amendments adopted (as recorded).",
        source: { label: "May 5, 2026 Action Report", href: granicusAction(8174, 281233) },
      },
      {
        item: "4",
        action: "High Voltage Direct Current Transmission Infrastructure Study Proposal deferred to the June 2, 2026 Business Meeting.",
        source: { label: "May 5, 2026 Action Report", href: granicusAction(8174, 281233) },
      },
      {
        item: "6",
        action: "Staff directed to draft a Human Rights Ordinance and return to a future Business Meeting (as recorded).",
        source: { label: "May 5, 2026 Action Report", href: granicusAction(8174, 281233) },
      },
      {
        item: "8",
        action: "Route 50 Safety and Operational Study forwarded to the Transportation and Land Use Committee.",
        tally: "8-0-1 (Vice Chair Turner absent)",
        source: { label: "May 5, 2026 Action Report", href: granicusAction(8174, 281233) },
      },
    ],
    context: [],
    agenda: [
      {
        heading: "Agenda (see Granicus for official item list)",
        dek: "Item labels below are neutral topic markers from the meeting video for navigation only — not an official agenda reprint.",
        items: [
          { num: "—", title: "Call to order / procedural opening" },
          { num: "—", title: "Consent and/or hearing items (see Action Report when posted)" },
          { num: "—", title: "Public input / comment (when taken)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-05-05-business.pdf",
      txtUrl: "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-05-05-business.txt",
      pdfNote: "73 pages",
    },
    moments: [
      { seconds: 632, label: "Closed session." },
      { seconds: 684, label: "Consent agenda taken up." },
      { seconds: 3684, label: "Public comment." },
      { seconds: 4261, label: "Public hearing item." },
      { seconds: 18725, label: "Adjournment." },
    ],
  },

  // --- 2026-10-10 morning: newest pending BOS + LCPS (interleaved) ---
  {
    slug: "lcps-2026-09-22-4th-tuesday",
    meetingId: "2026-09-22-1229286967",
    venue: "loudoun-lcps",
    title: "School Board 4th Tuesday Meeting",
    dateLabel: "Tuesday, Sep 22, 2026",
    whenWhere: "School Board meeting · video 7h 5m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 27, 2026, 4:40 PM ET",
      note: "Official vote record not yet posted. BoardDocs meeting page has agenda only (BD-GetMinutes returns empty / no View Minutes content). Decisions will be filled from BoardDocs minutes when available. Do not infer votes from the video or machine transcript.",
      links: [
        { label: "BoardDocs meeting", href: boarddocsMeeting("DXGKG851ACED") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1229286967?rel=0" },
      ],
    },
    decisions: [],
    context: [],
    agenda: [
      {
        heading: "Agenda (see BoardDocs for official item list)",
        dek: "Item labels below are neutral topic markers from the meeting video for navigation only — not an official BoardDocs agenda reprint.",
        items: [
          { num: "—", title: "Call to order and disclosures" },
          { num: "—", title: "Business consent agenda" },
          { num: "—", title: "Discussion of instructional / AI-related policy topics" },
          { num: "11", title: "Public comment" },
          { num: "12+", title: "Action items (including business and financial services)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-09-22-4th-tuesday-school-board-meeting.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-09-22-4th-tuesday-school-board-meeting.txt",
      pdfNote: "95 pages",
    },
    moments: [
      { seconds: 239, label: "Meeting called to order." },
      { seconds: 540, label: "Business consent agenda taken up." },
      { seconds: 2310, label: "Instructional technology / AI policy discussion." },
      { seconds: 8420, item: "11", label: "Public comment opens." },
      { seconds: 11857, item: "12", label: "Action items begin after recess." },
    ],
  },
  {
    slug: "bos-2026-07-22-business-reconvened",
    meetingId: "8216",
    venue: "loudoun-bos",
    title: "Board of Supervisors Business Meeting (reconvened Jul 21)",
    dateLabel: "Wednesday, Jul 22, 2026",
    whenWhere: "6:00 PM · Board Room, Government Center, Leesburg · video 5h 39m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 10, 2026, 8:00 AM ET",
      note: "Votes below are taken from the county Action Report (memo dated July 24, 2026).",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8216) },
        {
          label: "Action Report (PDF)",
          href: granicusAction(8216, 286131),
        },
      ],
    },
    decisions: [
      {
        item: "Consent",
        action:
          "Consent agenda approved (R-1–R-7, 1a–1g, 2a–2c, 3a, 4, 5, 6, 9, 10, 12 Motion 2, and 13).",
        tally: "7-0-2 (Supervisors Kershner and Letourneau absent)",
        source: { label: "Jul 22, 2026 Action Report", href: granicusAction(8216, 286131) },
      },
      {
        item: "Point of Privilege",
        action:
          "Supervisor Briskman changed her vote to No on Item 5 (Barrister Substation, LEGI-2025-0010) from the July 7 meeting, resulting in approval 7-2 (Supervisors Briskman and Randall opposed).",
        source: { label: "Jul 22, 2026 Action Report", href: granicusAction(8216, 286131) },
      },
      {
        item: "I-1",
        action: "Legislative Report, 2026 General Assembly Session deferred to September 1, 2026 Business Meeting.",
        source: { label: "Jul 22, 2026 Action Report", href: granicusAction(8216, 286131) },
      },
      {
        item: "8",
        action:
          "Department of Planning and Zoning Work Plan motions (as amended in the Action Report), including related sewer-system deferral language.",
        tally: "See Action Report (multiple tallies, including 6-1-2 and 7-0-2)",
        source: { label: "Jul 22, 2026 Action Report", href: granicusAction(8216, 286131) },
      },
      {
        item: "11",
        action: "Happy Paws K-9 (LEGI-2024-0012) approved.",
        tally: "7-0-2 (Supervisors Kershner and Letourneau absent)",
        source: { label: "Jul 22, 2026 Action Report", href: granicusAction(8216, 286131) },
      },
      {
        item: "13",
        action: "BMI: Loudoun County Veterans Memorial redesign and reconstruction (as recorded).",
        tally: "7-0-2 (Supervisors Kershner and Letourneau absent)",
        source: { label: "Jul 22, 2026 Action Report", href: granicusAction(8216, 286131) },
      },
      {
        item: "14",
        action: "BMI: Operational regulations on existing data center backup generators (as amended).",
        tally: "7-0-2 (Supervisors Kershner and Letourneau absent)",
        source: { label: "Jul 22, 2026 Action Report", href: granicusAction(8216, 286131) },
      },
    ],
    context: [
      {
        text: "July 21 Business Meeting was postponed for lack of quorum (hazardous weather) and reconvened July 22 at 6:00 PM.",
        source: { label: "Jul 21, 2026 Action Report", href: granicusAction(8214, 286129) },
      },
    ],
    agenda: [
      {
        heading: "Information items",
        items: [
          { num: "I-1", title: "Legislative Report, 2026 General Assembly Session (deferred)" },
          { num: "I-2", title: "Reliability Standards and Electrical Transmission Planning — White Paper" },
        ],
      },
      {
        heading: "Action items (selected)",
        items: [
          { num: "8", title: "Department of Planning and Zoning Work Plan" },
          { num: "11", title: "Happy Paws K-9 special exceptions" },
          { num: "13", title: "BMI: Veterans Memorial redesign and reconstruction" },
          { num: "14", title: "BMI: Data center backup generator operational regulations" },
        ],
      },
      {
        heading: "On consent (passed as recorded)",
        items: [
          { num: "R-1–R-7", title: "Ceremonial resolutions and proclamations" },
          { num: "1a–1g", title: "Finance/Government Operations and Economic Development Committee items" },
          { num: "2a–2c", title: "Transportation and Land Use Committee items" },
          { num: "3a / 4–6 / 9–10 / 12", title: "Appointments, administrative items, and related actions on consent" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-07-22-business-reconvened.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-07-22-business-reconvened.txt",
      pdfNote: "73 pages",
    },
    moments: [
      { seconds: 725, label: "Consent agenda is read." },
      { seconds: 1180, item: "13", label: "Veterans Memorial BMI discussed on consent." },
      { seconds: 4120, item: "I-2", label: "Transmission planning white paper taken up." },
      { seconds: 8936, item: "14", label: "Data center backup generator BMI discussed." },
      { seconds: 14513, item: "8", label: "DPZ Work Plan reached." },
    ],
  },
  {
    slug: "lcps-2026-09-15-retreat",
    meetingId: "2026-09-15-1227257661",
    venue: "loudoun-lcps",
    title: "School Board Retreat",
    dateLabel: "Monday, Sep 15, 2026",
    whenWhere: "School Board retreat · video 5h 53m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 15, 2026, 12:33 PM ET",
      note: "The BoardDocs minutes for this retreat (adopted Oct 13, 2026) are linked below; they record no motions or votes. The minutes list an FY28 budget discussion (morning and afternoon) and a work session on scheduling select committees for appeals, the weekly Board inquiries report, meals at Board meetings, proclamations, public comment, and invitations to school-level events. Called to order 9:00 a.m.; Vice Chair Donohue arrived at 12:15 p.m.; adjourned 3:30 p.m.",
      links: [
        { label: "Sep 15, 2026 BoardDocs minutes", href: boarddocsMeeting("DTRGE7436104") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1227257661?rel=0" },
      ],
    },
    decisions: [],
    context: [],
    agenda: [
      {
        heading: "Official agenda (from BoardDocs minutes)",
        dek: "Items as listed in the adopted Sep 15, 2026 minutes. No motions or votes are recorded.",
        items: [
          { num: "1", title: "Call to Order (9:00 a.m.): attendance and disclosures" },
          { num: "2.01", title: "Budget Discussion (FY28 budget retreat)" },
          { num: "3", title: "Lunch Break 12:00–12:30" },
          { num: "4.01", title: "Budget Discussion (continued)" },
          { num: "5.01", title: "Work Session: Scheduling of Select Committees for Appeals" },
          { num: "5.02", title: "Work Session: Weekly Board Inquiries Report" },
          { num: "5.03", title: "Work Session: Meals at Board Meetings" },
          { num: "5.04", title: "Work Session: Proclamations" },
          { num: "5.05", title: "Work Session: Public Comment" },
          { num: "5.06", title: "Work Session: Invitations for Board Members to Significant School Level Events" },
          { num: "6", title: "Adjournment (3:30 p.m.)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-09-15-school-board-retreat.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-09-15-school-board-retreat.txt",
      pdfNote: "79 pages",
    },
    moments: [
      { seconds: 21, label: "Retreat called to order." },
      { seconds: 480, label: "Strategic discussion underway." },
      { seconds: 21075, label: "Retreat adjourned." },
    ],
  },
  {
    slug: "bos-2026-07-21-business",
    meetingId: "8214",
    venue: "loudoun-bos",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Jul 21, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video ~5m (postponed; no quorum)",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 10, 2026, 8:00 AM ET",
      note: "This sitting was postponed for lack of quorum (hazardous weather). Action recorded in the July 21 Action Report; business was taken up at the July 22 reconvened meeting.",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8214) },
        { label: "Action Report (PDF)", href: granicusAction(8214, 286129) },
        { label: "Reconvened meeting recap (Jul 22)", href: "/counties/loudoun/recaps/bos-2026-07-22-business-reconvened" },
      ],
    },
    decisions: [
      {
        item: "Call to order",
        action:
          "Meeting postponed to Wednesday, July 22, 2026, at 6:00 PM under Rule 1.H (hazardous weather; no quorum in the Board Room).",
        source: { label: "Jul 21, 2026 Action Report", href: granicusAction(8214, 286129) },
      },
    ],
    context: [],
    agenda: [
      {
        heading: "As recorded",
        items: [
          { num: "—", title: "Call to order; meeting postponed (see Action Report)" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-07-21-business.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-07-21-business.txt",
      pdfNote: "2 pages",
    },
    moments: [
      { seconds: 239, label: "Meeting called to order; postponement announced." },
      { seconds: 316, label: "Sitting ends after postponement announcement." },
    ],
  },
  {
    slug: "lcps-2026-09-08-2nd-tuesday",
    meetingId: "2026-09-08-1225039248",
    venue: "loudoun-lcps",
    title: "School Board 2nd Tuesday Meeting",
    dateLabel: "Tuesday, Sep 8, 2026",
    whenWhere: "School Board meeting · video ~6h+",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 10, 2026, 8:40 AM ET",
      note: "Votes below are taken from the BoardDocs minutes for this meeting (adopted record). Tallies list members as the minutes record them.",
      links: [
        { label: "BoardDocs meeting / minutes", href: boarddocsMeeting("DWNJY54F612D") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1225039248?rel=0" },
      ],
    },
    decisions: [
      {
        item: "3",
        action:
          "Consent agenda adopted as amended. Minutes record that Items 3.09 through 3.15 were removed from consent (Riccardi), with Item 3.13 (LGBTQ+ History Month Proclamation) and the Constitution Week Proclamation set for separate consideration (Griffiths; LaBell). Remaining consent items as recorded under 3.01–3.08 include prior meeting minutes, personnel actions, Fiscal Impact Committee appointee (Adnan Mamoon), RFP awards, easement authorizations, and religious attendance exemption.",
        tally:
          "7-0-1 (Approved: Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Abstained: LaBell; Not present at vote: Donohue)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.01",
        action:
          "Adopted National Arts in Education Week, High School Voter Registration Week, National Hispanic Heritage Month, Dyslexia Awareness Month, and Bullying Prevention Month proclamations.",
        tally:
          "6-0-3 (Approved: LaBell, Chandler, Donohue, Rashid, Pepper, Svenson; Abstained: Griffiths, Shernoff, Riccardi)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.02",
        action:
          "Adopted the proclamation recognizing September 17–23, 2026 as Constitution Week.",
        tally:
          "7-0-2 (Approved: LaBell, Chandler, Donohue, Rashid, Riccardi, Pepper, Svenson; Abstained: Griffiths, Shernoff)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.03",
        action:
          "Adopted the LGBTQ+ History Month Proclamation recognizing October 2026 as LGBTQ+ History Month in Loudoun County Public Schools.",
        tally:
          "5-1-3 (Approved: Chandler, Donohue, Rashid, Pepper, Svenson; Opposed: Griffiths; Abstained: LaBell, Shernoff, Riccardi)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.04",
        action:
          "FY27 Budget Final Alignment: aligned the FY27 Adopted Budget with the state’s final FY26–28 biennium budget, recognizing an additional $14,000,000 of state revenue in the School Operating Fund and corresponding expenses as outlined in the staff plan as amended; further requested the Board of Supervisors appropriate and increase the FY27 School Operating Fund accordingly.",
        tally:
          "9-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.04 (amendment)",
        action:
          "Amended the recommended action to strike $1,880,000 for Delayed Procurement of Panic Buttons and $120,000 for Unanticipated budget needs or overages from the staff plan, and to reallocate that $2,000,000 to Title I and English Learner purposes set forth in the schedule in the minutes. Total appropriation of $14,000,000 unchanged.",
        tally:
          "8-0-1 (Approved: LaBell, Chandler, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson; Abstained: Donohue)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.05",
        action: "Approved the proposed changes to Policy 2420 (Meeting Procedures) as amended.",
        tally:
          "9-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.05 (amendment)",
        action:
          "Amended the proposed redline of Policy 2420 to replace \"shall\" on Line 72 with \"may\", and to strike the sentence on Lines 73–75 that reads: \"If a member's remote participation is challenged, the School Board shall vote on whether to allow such participation.\"",
        tally:
          "9-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.06",
        action:
          "Adopted new Policy 5340, Safe and Supportive Removal of Students in the Educational Setting, as amended.",
        tally:
          "9-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        item: "12.06 (amendment)",
        action:
          "Amended proposed Policy 5340, Section B(1), by inserting after \"designated supportive area\" on line 17 (clean version): \", or the removal of other students from the instructional setting to allow a student to remain in the instructional setting, for the purpose of de-escalation or regulation of a student or students.\"",
        tally:
          "9-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
    ],
    context: [
      {
        text: "Gap: minutes state Items 3.09–3.15 were removed from consent for separate action; Item 3.09 (School Board Advisory Committee Membership) has no separate Action Item vote recorded after the amendment. Proclamation items appear as 12.01–12.03.",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
      {
        text: "Vice Chair Anne Donohue arrived at 6:30 p.m. (minutes attendance).",
        source: { label: "Sep 8, 2026 BoardDocs minutes", href: boarddocsMeeting("DWNJY54F612D") },
      },
    ],
    agenda: [
      {
        heading: "On consent (as amended)",
        items: [
          { num: "3.01", title: "Minutes of the August 11, 2026, 2nd Tuesday School Board Meeting" },
          { num: "3.02", title: "Personnel Actions" },
          { num: "3.03", title: "Fiscal Impact Committee appointee (Adnan Mamoon)" },
          { num: "3.04", title: "Award of RFP #R23250 Printing Graphic Design, Mailing, and Related Services" },
          { num: "3.05", title: "Award of RFP #R26024 Dental Insurance Services" },
          { num: "3.06", title: "Chair authorization to sign Waterford ES easement documents" },
          { num: "3.07", title: "Easements for Evergreen Mills Rd widening at Heritage HS, Simpson MS, Evergreen ES" },
          { num: "3.08", title: "Exemption from school attendance for religious reasons" },
        ],
      },
      {
        heading: "Action items",
        items: [
          { num: "12.01", title: "Proclamations (Arts in Education Week; High School Voter Registration Week; Hispanic Heritage Month; Dyslexia Awareness Month; Bullying Prevention Month)" },
          { num: "12.02", title: "Constitution Week Proclamation" },
          { num: "12.03", title: "LGBTQ+ History Month Proclamation" },
          { num: "12.04", title: "FY27 Budget Final Alignment" },
          { num: "12.05", title: "Revised Policy 2420, Meeting Procedures" },
          { num: "12.06", title: "New Policy 5340, Safe and Supportive Removal of Students in the Educational Setting" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-09-08-2nd-tuesday-school-board-meeting.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-09-08-2nd-tuesday-school-board-meeting.txt",
      pdfNote: "82 pages",
    },
    moments: [
      { seconds: 194, label: "Meeting called to order." },
      { seconds: 436, label: "Consent / disclosure portion." },
      { seconds: 8902, label: "Public comment / recognition portion." },
      { seconds: 22853, item: "16", label: "New business; meeting winding down." },
    ],
  },
  {
    slug: "bos-2026-07-15-public-hearing",
    meetingId: "8213",
    venue: "loudoun-bos",
    title: "Board of Supervisors Public Hearing",
    dateLabel: "Wednesday, Jul 15, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video 5h 30m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 10, 2026, 8:00 AM ET",
      note: "Votes and forwards below are taken from the county Action Report (memo dated July 17, 2026).",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8213) },
        { label: "Action Report (PDF)", href: granicusAction(8213, 285586) },
      ],
    },
    decisions: [
      {
        item: "4",
        action: "Tuscarora Landbay 4 (LEGI-2025-0020 / SPEX-2025-0036) forwarded to a Business Meeting for action.",
        tally: "9-0",
        source: { label: "Jul 15, 2026 Action Report", href: granicusAction(8213, 285586) },
      },
      {
        item: "5",
        action: "Loudoun School for Advanced Studies (LEGI-2025-0063) approved.",
        tally: "9-0",
        source: { label: "Jul 15, 2026 Action Report", href: granicusAction(8213, 285586) },
      },
      {
        item: "6",
        action:
          "Tech Park at Dulles Substation (LEGI-2025-0007): ratification and forward motions as recorded (see Action Report for Motion 1 and Motion 2 tallies).",
        source: { label: "Jul 15, 2026 Action Report", href: granicusAction(8213, 285586) },
      },
      {
        item: "7",
        action: "Golden Substation (LEGI-2025-0012) forwarded (as amended) to a future meeting.",
        tally: "7-1-1 (Supervisor Turner opposed; Supervisor Briskman absent)",
        source: { label: "Jul 15, 2026 Action Report", href: granicusAction(8213, 285586) },
      },
      {
        item: "8",
        action: "R&D Hamilton Academy (LEGI-2025-0052) forwarded.",
        tally: "9-0",
        source: { label: "Jul 15, 2026 Action Report", href: granicusAction(8213, 285586) },
      },
    ],
    context: [],
    agenda: [
      {
        heading: "Public hearing items (selected)",
        items: [
          { num: "4", title: "Tuscarora Landbay 4 special exception" },
          { num: "5", title: "Loudoun School for Advanced Studies" },
          { num: "6", title: "Tech Park at Dulles Substation" },
          { num: "7", title: "Golden Substation" },
          { num: "8", title: "R&D Hamilton Academy" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-07-15-public-hearing.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-07-15-public-hearing.txt",
      pdfNote: "73 pages",
    },
    moments: [
      { seconds: 607, label: "Public hearing called to order." },
      { seconds: 1731, item: "4", label: "Tuscarora Landbay 4 taken up." },
      { seconds: 1502, item: "5", label: "Loudoun School for Advanced Studies discussed." },
      { seconds: 16281, item: "7", label: "Golden Substation staff presentation." },
      { seconds: 19842, label: "Public hearing adjourned." },
    ],
  },
  {
    slug: "lcps-2026-08-11-2nd-tuesday",
    meetingId: "2026-08-11-1217434020",
    venue: "loudoun-lcps",
    title: "School Board 2nd Tuesday Meeting",
    dateLabel: "Tuesday, Aug 11, 2026",
    whenWhere: "School Board meeting · video ~8h+",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 10, 2026, 8:40 AM ET",
      note: "Votes below are taken from the BoardDocs minutes for this meeting (adopted September 8, 2026). Tallies list members as the minutes record them.",
      links: [
        { label: "BoardDocs meeting / minutes", href: boarddocsMeeting("DV3GCL432C63") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1217434020?rel=0" },
      ],
    },
    decisions: [
      {
        item: "3",
        action:
          "Consent agenda adopted (3.01–3.08 as recorded): minutes of June 23 and July 13 meetings; personnel actions; Lucketts sanitary sewer/treatment facility easement adjustment; revised Policy 8160; Attendance Awareness Month and Suicide Prevention Awareness Month proclamations; School Board Advisory Committee membership.",
        tally:
          "7-0-1 (Approved: LaBell, Chandler, Rashid, Shernoff, Riccardi, Pepper, Svenson; Abstained: Griffiths; Not present at vote: Donohue)",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
      {
        item: "15.01",
        action: "Motion to convene closed meeting approved.",
        tally:
          "9-0 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Riccardi, Pepper, Svenson)",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
      {
        item: "15.02",
        action: "Motion to adjourn closed meeting approved.",
        tally:
          "8-0-1 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Pepper, Svenson; Abstained: Riccardi)",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
      {
        item: "15.03",
        action:
          "Closed-meeting certification (Resolution #02-26/27) approved. Minutes record Riccardi’s statement alleging a departure from the closed-meeting exemption (including reference to informal votes in closed session) and a repeated certification vote after clarification.",
        tally:
          "First certification 7-2 (Opposed: Griffiths, Riccardi); repeated certification 8-1 (Opposed: Riccardi)",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
      {
        item: "15.04",
        action:
          "Authorized execution of documents necessary and appropriate pertaining to the respective student matter considered in closed meeting.",
        tally:
          "8-0-1 (Approved: LaBell, Chandler, Donohue, Griffiths, Rashid, Shernoff, Pepper, Svenson; Abstained: Riccardi)",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
      {
        item: "15.04",
        action:
          "Approved a limited waiver of closed-session confidentiality and associated attorney-client privilege regarding board-member behavior discussions, strictly limited to closed sessions on June 17, 2024; November 26, 2024; December 2, 2024; May 26, 2026; and August 11, 2026.",
        tally:
          "7-1-1 (Approved: LaBell, Chandler, Donohue, Rashid, Shernoff, Pepper, Svenson; Opposed: Riccardi; Abstained: Griffiths)",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
      {
        item: "15.04",
        action:
          "Found that School Board member Deana Griffiths violated Policy 1030(B)(9) and (B)(10) (and further Policy 1030(B)(4) and Policy 1035(A)(6) as stated), referencing a prior Private Warning (June 17, 2024) and Private Letter of Reprimand (on or around December 6, 2024), and publicly censured her.",
        tally:
          "6-1-2 (Approved: Chandler, Donohue, Rashid, Shernoff, Pepper, Svenson; Opposed: Riccardi; Abstained: LaBell, Griffiths)",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
    ],
    context: [
      {
        text: "Items 12.01–12.04 were Information Items only (including FY27 Budget Final Alignment, FY27 Audit Plan, Policy 2420, and Policy 5340); no action votes on those items at this meeting. Adjournment recorded at 12:42 a.m.",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
      {
        text: "Vice Chair Anne Donohue arrived at 5:00 p.m. (minutes attendance).",
        source: { label: "Aug 11, 2026 BoardDocs minutes", href: boarddocsMeeting("DV3GCL432C63") },
      },
    ],
    agenda: [
      {
        heading: "On consent",
        items: [
          { num: "3.01", title: "Minutes of the June 23, 2026, 4th Tuesday School Board Meeting" },
          { num: "3.02", title: "Minutes of the July 13, 2026, Special School Board Meeting" },
          { num: "3.03", title: "Personnel Actions" },
          { num: "3.04", title: "Lucketts ES sanitary sewer / treatment facility easement adjustment" },
          { num: "3.05", title: "Revised Policy 8160, Exception to School Assignment Due to Attendance Zone Change" },
          { num: "3.06", title: "Attendance Awareness Month Proclamation" },
          { num: "3.07", title: "Suicide Prevention Awareness Month Proclamation" },
          { num: "3.08", title: "School Board Advisory Committee Membership" },
        ],
      },
      {
        heading: "Information items (no vote)",
        items: [
          { num: "12.01", title: "FY27 Budget Final Alignment" },
          { num: "12.02", title: "FY27 Audit Plan" },
          { num: "12.03", title: "Revised Policy 2420, Meeting Procedures" },
          { num: "12.04", title: "New Policy 5340 (information; action on Sep 8)" },
        ],
      },
      {
        heading: "Closed meeting",
        items: [
          { num: "15.01–15.04", title: "Convene, adjourn, certify, and motions required by closed meeting" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-08-11-2nd-tuesday-school-board-meeting.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-lcps/transcripts/coraggio-transcript-loudoun-lcps-2026-08-11-2nd-tuesday-school-board-meeting.txt",
      pdfNote: "62 pages",
    },
    moments: [
      { seconds: 147, label: "Meeting called to order." },
      { seconds: 360, label: "Consent / disclosure portion." },
      { seconds: 8928, label: "Public comment portion." },
      { seconds: 28606, label: "Closed meeting adjournment motion." },
    ],
  },
  {
    slug: "bos-2026-07-07-business",
    meetingId: "8208",
    venue: "loudoun-bos",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Jul 7, 2026",
    whenWhere: "Board Room, Government Center, Leesburg · video ~6h+",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 10, 2026, 8:00 AM ET",
      note: "Votes below are taken from the county Action Report (memo dated July 9, 2026).",
      links: [
        { label: "Agenda (Granicus)", href: granicusAgenda(8208) },
        { label: "Action Report (PDF)", href: granicusAction(8208, 285185) },
      ],
    },
    decisions: [
      {
        item: "Consent",
        action: "Consent agenda approved (1a, 1b, 1c, 1d, 2a, and 3).",
        tally: "7-0-2 (Supervisors Kershner and Saines absent)",
        source: { label: "Jul 7, 2026 Action Report", href: granicusAction(8208, 285185) },
      },
      {
        item: "1d",
        action: "Loudoun County Natural Resources Strategy adopted (draft in Attachment 2; staff directed to finalize).",
        tally: "7-0-2 (Supervisors Kershner and Saines absent)",
        source: { label: "Jul 7, 2026 Action Report", href: granicusAction(8208, 285185) },
      },
      {
        item: "5",
        action: "Barrister Substation (LEGI-2025-0010) approved subject to Conditions of Approval.",
        tally: "8-1 (Chair Randall opposed)",
        source: { label: "Jul 7, 2026 Action Report", href: granicusAction(8208, 285185) },
      },
      {
        item: "6",
        action: "Aspen Substation (LEGI-2024-0038) approved as amended.",
        tally: "8-1 (Supervisor Briskman opposed)",
        source: { label: "Jul 7, 2026 Action Report", href: granicusAction(8208, 285185) },
      },
    ],
    context: [
      {
        text: "On July 22, Supervisor Briskman changed her July 7 vote on Item 5 (Barrister) to No, yielding a recorded 7-2 outcome (Briskman and Randall opposed) as noted in the July 22 Action Report.",
        source: { label: "Jul 22, 2026 Action Report", href: granicusAction(8216, 286131) },
      },
    ],
    agenda: [
      {
        heading: "Information items",
        items: [
          { num: "I-1", title: "VACo Achievement Awards presentation" },
          { num: "I-2", title: "Electrical Substations White Paper" },
        ],
      },
      {
        heading: "Action items (selected)",
        items: [
          { num: "1d", title: "Loudoun County Natural Resources Strategy" },
          { num: "5", title: "Barrister Substation special exceptions" },
          { num: "6", title: "Aspen Substation special exceptions" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-07-07-business.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-07-07-business.txt",
      pdfNote: "59 pages",
    },
    moments: [
      { seconds: 589, label: "Meeting called to order." },
      { seconds: 695, label: "Consent agenda discussion begins." },
      { seconds: 10551, item: "6", label: "Aspen Substation discussion." },
      { seconds: 16528, item: "5", label: "Barrister Substation taken up." },
      { seconds: 9561, label: "Closed session language read." },
    ],
  },

  {
    slug: "bos-2026-10-06-business",
    shareEnabled: true,
    shareContext: "Loudoun BOS, Oct 6, 2026",
    meetingId: "escribe-3a6eea40",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Oct 6, 2026",
    whenWhere: "4:00 PM · Board Room, Government Center, Leesburg · video 6h 36m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 9, 2026, 10:30 AM ET",
      note: "Votes and deferrals below are taken from the county Action Report (posted Oct 9, 2026).",
      links: [
        { label: "Agenda (eScribe)", href: OCT6_AGENDA_HTML },
        { label: "Agenda (PDF)", href: doc(1718) },
        { label: "Action Report (PDF)", href: ACTION_OCT6 },
        {
          label: "County document folder for this meeting",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [
      {
        item: "4",
        action:
          "Consent agenda approved (7a–7j, 11a–11c, 12a, 14a, 14c, 14d, and 14e).",
        tally:
          "6-0-2-1 (Supervisors Glass and Letourneau absent; Supervisor Briskman abstained)",
        source: { label: "Oct 6, 2026 Action Report", href: ACTION_OCT6 },
      },
      {
        item: "10.a",
        action:
          "Motion to retain an independent third party to audit listed grandfathered data-center applications (up to $200,000; interim report Jan 20, 2027; final by April 20, 2027), as amended to include Tables 1 and 2 of Attachment 2, was tabled indefinitely.",
        tally: "7-2 (Supervisors Briskman and TeKrony opposed)",
        source: { label: "Oct 6, 2026 Action Report", href: ACTION_OCT6 },
      },
      {
        item: "14.f",
        action:
          "LEGI-2025-0020, Tuscarora Crossing Landbay 4 (SPEX-2025-0036) deferred to the October 20, 2026 Board of Supervisors Business Meeting.",
        source: { label: "Oct 6, 2026 Action Report", href: ACTION_OCT6 },
      },
      {
        item: "14.g",
        action:
          "Board directed staff to form a partnership via draft Memorandum of Agreement with the Loudoun Coalition to Prevent and End Homelessness (return draft for first Business Meeting in January 2027; hire consultant for Homelessness and Housing Instability Initiative; return Nov 5, 2026 with funding source and cost estimate).",
        tally: "6-0-3 (Supervisors Kershner, Letourneau, and Saines absent)",
        source: { label: "Oct 6, 2026 Action Report", href: ACTION_OCT6 },
      },
      {
        item: "14.h (Motion 1)",
        action:
          "Board directed staff to research, develop, and return with findings and recommendations for a Loudoun County Community Trust Policy, and to review County procurement/contracting for systems that collect or share resident/visitor data (including ALPRs from firms such as Elsag, Flock, and Vigilant) and gather law-enforcement deployment/retention/access/sharing info, returning as soon as practicable.",
        tally: "6-0-3 (Supervisors Kershner, Letourneau, and Saines absent)",
        source: { label: "Oct 6, 2026 Action Report", href: ACTION_OCT6 },
      },
      {
        item: "14.h (Motion 2)",
        action:
          "Motion to waive attorney-client privilege for the confidential County Attorney memorandum on prohibiting federal civil immigration enforcement in/on County facilities/properties and authorize public release died due to lack of second (Chair Randall withdrew her second).",
        source: { label: "Oct 6, 2026 Action Report", href: ACTION_OCT6 },
      },
      {
        item: "14.i",
        action:
          "Board directed staff to research and identify funding sources (including state and federal grants) to reduce the financial burden on Broad Run Farms residents from the Broad Run Farms Waterline Extension Project and return with an update at a future Business Meeting.",
        tally: "8-0-1 (Supervisor Letourneau absent)",
        source: { label: "Oct 6, 2026 Action Report", href: ACTION_OCT6 },
      },
    ],
    context: [
      {
        text: "Two items on this agenda were deferred from the Sept 15, 2026 meeting: 14.e (Farmwell Road eminent domain) and the Tuscarora Crossing Landbay 4 special exception (now 14.f).",
        source: {
          label: "Sept 15, 2026 Action Report",
          href: ACTION_SEP15,
        },
      },
      {
        text: "The Oct 6 Action Report confirms item 14.f (Tuscarora Crossing Landbay 4) was deferred again, to the October 20, 2026 Board of Supervisors Business Meeting.",
        source: {
          label: "Oct 6, 2026 Action Report",
          href: ACTION_OCT6,
        },
      },
    ],
    agenda: [
      {
        heading: "Information items",
        dek: "Staff responses to Board Member Initiatives",
        items: [
          {
            num: "10.a",
            title: "Amendment to the 2025 Data Center Grandfathering Resolution",
            href: doc(1812),
          },
          { num: "10.b", title: "Microgrid white paper", href: doc(1797) },
          {
            num: "10.c",
            title: "Transmission line routing, Algonkian (former GWU campus)",
            href: doc(1818),
          },
        ],
      },
      {
        heading: "Action items not proposed on consent",
        items: [
          { num: "14.b", title: "Appointments: nominations", href: doc(1785) },
          {
            num: "14.f",
            title:
              "Tuscarora Crossing Landbay 4 special exception (130,000 sq ft government building), Leesburg District",
            href: doc(1823),
          },
          {
            num: "14.g",
            title: "BMI: Addressing homelessness and housing instability",
            href: doc(1801),
          },
          { num: "14.h", title: "BMI: Community Trust Policy", href: doc(1800) },
          {
            num: "14.i",
            title: "BMI: Offsetting the cost of the Broad Run Farms waterline extension",
            href: doc(1805),
          },
          { num: "15.a", title: "Closed session (business expansion, Leesburg District)" },
        ],
      },
      {
        heading: "Proposed on consent",
        dek: "Passed on consent as recorded in item 4 of the Action Report (7a–7j, 11a–11c, 12a, 14a, 14c, 14d, and 14e).",
        items: [
          { num: "7.a–7.j", title: "Ten proclamations and ceremonial resolutions" },
          {
            num: "11.a",
            title:
              "Safe Passage to Schools pilot; appropriate $924,795 in federal TAP funds, move $231,199 local match",
            href: doc(1806),
          },
          {
            num: "11.b",
            title:
              "Route 7 and Countryside Blvd shared-use paths and sidewalks: design endorsement",
            href: doc(1789),
          },
          {
            num: "11.c",
            title:
              "Route 7 eastbound widening, Loudoun County Pkwy to Route 28: design endorsement",
            href: doc(1793),
          },
          {
            num: "12.a",
            title: "Affordable Dwelling Unit covenant recordation updates (Chapter 1450)",
            href: doc(1810),
          },
          { num: "14.a", title: "Appointments: confirmations", href: doc(1783) },
          {
            num: "14.c",
            title:
              "Administrative items: FY2026 and FY2027 budget adjustments; VACo voting delegate",
            href: doc(1837),
          },
          {
            num: "14.d",
            title:
              "Resolution of intent to amend the noise ordinance (Chapter 654), commercial/industrial noise",
            href: doc(1842),
          },
          {
            num: "14.e",
            title: "Eminent domain for the Farmwell Road (Smith Switch Rd to Ashburn Rd) project",
            href: doc(1830),
          },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-10-06.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-10-06.txt",
      pdfNote: "76 pages",
    },
    moments: [
      { seconds: 2672, item: "4", label: "The proposed consent agenda is read and discussed." },
      { seconds: 9441, item: "8", label: "Public input session opens (two minutes per speaker)." },
      {
        seconds: 15034,
        item: "10.a",
        label: "Data center grandfathering: staff presentation, then Board discussion.",
      },
      {
        seconds: 21003,
        item: "14.g",
        label: "Homelessness and housing instability initiative taken up.",
      },
      { seconds: 21879, item: "14.h", label: "Community Trust Policy initiative taken up." },
    ],
  },
  {
    slug: "bos-2026-09-15-business",
    meetingId: "escribe-79595442",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Sep 15, 2026",
    whenWhere: "4:00 PM · Board Room, Government Center, Leesburg · video 9h 1m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 9, 2026, 8 AM ET",
      note: "Votes and deferrals below are taken from the county Action Report (posted Sept 17, 2026).",
      links: [
        { label: "Agenda (eScribe)", href: SEP15_AGENDA_HTML },
        { label: "Action Report (PDF)", href: ACTION_SEP15 },
        {
          label: "County document folder for Board meetings",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [
      {
        item: "4",
        action:
          "Consent agenda approved (7a–7h, 11a–11j, 11l–11r, 12a–12c, 14a, 14c, 14d, 14g, 14i).",
        tally: "8-0-1 (Supervisor Saines absent)",
        source: { label: "Sept 15, 2026 Action Report", href: ACTION_SEP15 },
      },
      {
        item: "14.e",
        action:
          "Farmwell Road eminent-domain resolution deferred to the Oct 6, 2026 Business Meeting.",
        source: { label: "Sept 15, 2026 Action Report", href: ACTION_SEP15 },
      },
      {
        item: "14.j",
        action:
          "LEGI-2025-0007, Tech Park at Dulles Substation (SPEX-2025-0016 & SPEX-2025-0020) denied on findings for denial in the Action Report.",
        tally: "6-3 (Supervisors Glass, Kershner, and Umstattd opposed)",
        source: { label: "Sept 15, 2026 Action Report", href: ACTION_SEP15 },
      },
      {
        item: "14.k",
        action:
          "LEGI-2025-0020, Tuscarora Crossing Landbay 4 (SPEX-2025-0036) deferred to the Oct 6, 2026 Business Meeting.",
        source: { label: "Sept 15, 2026 Action Report", href: ACTION_SEP15 },
      },
      {
        item: "14.l",
        action:
          "Board directed staff to prepare a resolution pausing consideration of legislative applications for data centers and substations (not to exceed 12 months from Planning Commission submission; effective Sept 15, 2026; pause shall not cause an application to become inactive), and to identify applications that will hit the 12-month deadline during the pause.",
        tally: "7-1-0-1 (Supervisor Umstattd opposed; Supervisor Kershner abstained)",
        source: { label: "Sept 15, 2026 Action Report", href: ACTION_SEP15 },
      },
      {
        item: "14.m",
        action:
          "Resolution Opposing the Valley North 765 kV Transmission Line approved (Attachment 1 to the Action Item).",
        tally: "9-0",
        source: { label: "Sept 15, 2026 Action Report", href: ACTION_SEP15 },
      },
      {
        item: "14.n",
        action: "Letter to the Loudoun County Sheriff endorsed (Attachment 1 to the Action Item).",
        tally:
          "5-3-1 (Supervisors Kershner, Letourneau, and Umstattd opposed; Supervisor Saines absent)",
        source: { label: "Sept 15, 2026 Action Report", href: ACTION_SEP15 },
      },
    ],
    context: [
      {
        text: "Items 14.e (Farmwell Road eminent domain) and 14.k (Tuscarora Crossing Landbay 4) were deferred from this meeting to Oct 6, 2026.",
        source: { label: "Sept 15, 2026 Action Report", href: ACTION_SEP15 },
      },
    ],
    agenda: [
      {
        heading: "Information / study",
        items: [
          {
            num: "9",
            title: "Redevelopment and Housing Authority Feasibility Study",
            href: doc(1589),
          },
        ],
      },
      {
        heading: "Action items highlighted in the Action Report",
        items: [
          {
            num: "14.e",
            title: "Farmwell Road eminent domain (deferred to Oct 6)",
            href: doc(1580),
          },
          {
            num: "14.f",
            title: "Cascades Library and Senior Center Complex — reconfigure for attainable housing",
            href: doc(1564),
          },
          {
            num: "14.j",
            title: "Tech Park at Dulles Substation (LEGI-2025-0007)",
            href: doc(1582),
          },
          {
            num: "14.k",
            title: "Tuscarora Crossing Landbay 4 (LEGI-2025-0020) (deferred to Oct 6)",
            href: doc(1620),
          },
          {
            num: "14.l",
            title: "Response to Board motion on data center / substation applications",
            href: doc(1672),
          },
          {
            num: "14.m",
            title: "BMI: Valley North Transmission Line Proposal",
            href: doc(1612),
          },
          {
            num: "14.n",
            title: "BMI: Letter to the Loudoun County Sheriff",
          },
        ],
      },
      {
        heading: "Proposed on consent (as listed on the agenda)",
        dek: "Consent list from the eScribe agenda; Action Report confirms the set that passed.",
        items: [
          { num: "7.a–7.h", title: "Ceremonial proclamations and resolutions" },
          { num: "11.a–11.r", title: "Finance / contract awards and renewals (as listed)" },
          { num: "12.a–12.c", title: "Committee annual reports and Route 50 study" },
          { num: "14.a, 14.c, 14.d, 14.g, 14.i", title: "Appointments, AIR, and consent action items" },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-09-15-business.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-09-15-business.txt",
      pdfNote: "95 pages",
    },
    moments: [
      { seconds: 787, item: "1", label: "Meeting called to order." },
      {
        seconds: 1835,
        item: "9",
        label: "Redevelopment and Housing Authority Feasibility Study presentation begins.",
      },
      {
        seconds: 14942,
        item: "14.l",
        label: "Data center / substation applications: attorney-client privilege waiver and Board motions begin.",
      },
      {
        seconds: 24432,
        item: "14.m",
        label: "Valley North transmission-line resolution taken up.",
      },
      {
        seconds: 26644,
        item: "14.j",
        label: "Tech Park at Dulles Substation special exception taken up.",
      },
    ],
  },
  {
    slug: "bos-2026-09-09-public-hearing",
    meetingId: "escribe-be4b3b17",
    title: "Board of Supervisors Public Hearing",
    dateLabel: "Wednesday, Sep 9, 2026",
    whenWhere: "6:00 PM · Board Room, Government Center, Leesburg · video 1h 35m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 9, 2026, 8:44 PM ET",
      note: "Votes below are taken from the county Action Report (posted Sept 11, 2026).",
      links: [
        { label: "Agenda (eScribe)", href: SEP9_AGENDA_HTML },
        { label: "Action Report (PDF)", href: ACTION_SEP9 },
        {
          label: "County document folder for Board meetings",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [
      {
        item: "3.a",
        action:
          "Revised Housing Choice Voucher Program Administrative Plan (effective Jan 1, 2027) and Streamlined Annual PHA Plan adopted; execution of 50077-SL and 50077-ST-HCV-HP certifications approved (Attachments 1–4).",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.b",
        action:
          "Conveyance of county-owned property at 43745 Marquis Square, Ashburn, to CLS Parking LC approved; County Administrator authorized to execute required documents (Attachments 1–6).",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.c",
        action:
          "Amendments to Chapter 838 (Swimming Pool and Water Recreation Facilities) approved as shown in Attachment 1.",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.d",
        action:
          "Amendment of Chapter 1066 and repeal of Chapter 1067 approved (Attachment 1).",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.e",
        action:
          "New Featherbed Agricultural and Forestal District renewed and readopted (parcels 1–9 in Attachment 1; four-year review period; 40-acre / zoning minimum; no cluster subdivision), based on ADAC and Planning Commission findings.",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.f",
        action:
          "Motion under ALEGI-2026-0002 (Hillbrook Agricultural and Forestal District) recorded in the Action Report as renewing and readopting the New Featherbed Agricultural and Forestal District Ordinance on the same terms as item 3.e (see context note).",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.g",
        action:
          "LEGI-2023-0115, Joint LCPS/County Central Loudoun Center and Storage (SPEX-2024-0006 & SPEX-2024-0007) approved subject to Conditions of Approval dated Aug 17, 2026, and Findings for Approval (Attachments 1–2).",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.h",
        action:
          "LEGI-2025-0026, Loudoun Panel Wiring Shop (SPEX-2025-0049 & SPEX-2025-0138) forwarded to the October 20, 2026 Board of Supervisors Business Meeting for action.",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.i",
        action:
          "LEGI-2025-0048, Waterford Elementary School Renovation and Addition (SPEX-2025-0121) approved subject to Conditions of Approval dated Sept 2, 2026, and Findings for Approval (Attachments 1–2).",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.j",
        action:
          "ZOAM-2026-0003, Chapter 10 Procedures – Placards, approved (Attachment 1).",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.k",
        action:
          "Amendments to Chapter 480.11 (Enforcement) approved to extend parking-restriction enforcement to Metro Transit Police on WMATA-owned property, effective immediately (Attachment 1).",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.l",
        action:
          "LEGI-2024-0008, Dulles South Community Park (SPEX-2024-0017 & SPEX-2026-0034) forwarded to the October 20, 2026 Board of Supervisors Business Meeting for action.",
        tally: "8-0-1 (Supervisor Briskman absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        item: "3.m",
        action:
          "LEGI-2025-0054, Village at Clear Springs Landbay 2C (ZCPA-2025-0008) approved subject to the Proffer Statement dated Sept 3, 2026, and Findings for Approval (Attachments 1–2).",
        tally: "7-0-2 (Supervisors Briskman and Saines absent)",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
    ],
    context: [
      {
        text: "Chair Randall announced the Consolidated Hearing Agenda as items 3a–3k and 3m. Item 3.l (Dulles South Community Park) was taken separately and forwarded to Oct 20, 2026.",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
      {
        text: "Under item 3.f (ALEGI-2026-0002, Hillbrook Agricultural and Forestal District), the Action Report’s motion text names the New Featherbed Agricultural and Forestal District Ordinance and New Featherbed parcels/findings—the same wording as item 3.e—while the item heading is Hillbrook. Recorded here as written in the Action Report.",
        source: { label: "Sept 9, 2026 Action Report", href: ACTION_SEP9 },
      },
    ],
    agenda: [
      {
        heading: "Hearing items (as recorded in the Action Report)",
        dek: "Consolidated Hearing Agenda covered 3a–3k and 3m; 3.l was taken separately.",
        items: [
          {
            num: "3.a",
            title:
              "Adoption of the Revised Housing Choice Voucher Program Administrative Plan (effective Jan 1, 2027) and Streamlined Annual PHA Plan",
            href: doc(769),
          },
          {
            num: "3.b",
            title: "Proposed conveyance of county-owned property at 43745 Marquis Square, Ashburn",
            href: doc(777),
          },
          {
            num: "3.c",
            title: "Rewrite of Chapter 838 – Swimming Pool and Water Recreation Facilities",
          },
          {
            num: "3.d",
            title: "Amendment of Chapter 1066 and repeal of Chapter 1067",
          },
          {
            num: "3.e",
            title: "ALEGI-2026-0001, New Featherbed Agricultural and Forestal District",
          },
          {
            num: "3.f",
            title: "ALEGI-2026-0002, Hillbrook Agricultural and Forestal District",
          },
          {
            num: "3.g",
            title: "LEGI-2023-0115, Joint LCPS/COL Central Loudoun Service Center and Storage",
          },
          {
            num: "3.h",
            title: "LEGI-2025-0026, Loudoun Panel Wiring Shop (forwarded to Oct 20)",
          },
          {
            num: "3.i",
            title: "LEGI-2025-0048, Waterford Elementary School Renovation and Addition",
          },
          {
            num: "3.j",
            title: "ZOAM-2026-0003, Chapter 10 Procedures – Placards",
          },
          {
            num: "3.k",
            title: "Chapter 480.11 – Metro Transit Police parking enforcement on WMATA property",
          },
          {
            num: "3.l",
            title: "LEGI-2024-0008, Dulles South Community Park (forwarded to Oct 20)",
          },
          {
            num: "3.m",
            title: "LEGI-2025-0054, Village at Clear Springs Landbay 2C",
          },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-09-09-public-hearing.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-09-09-public-hearing.txt",
      pdfNote: "22 pages",
    },
    moments: [
      { seconds: 1154, item: "1", label: "Public hearing called to order." },
      {
        seconds: 1298,
        item: "2",
        label: "Consolidated agenda items are announced.",
      },
      {
        seconds: 1619,
        item: "3.a",
        label: "Housing Choice Voucher Program Administrative Plan / PHA Plan taken up.",
      },
    ],
  },
  {
    slug: "bos-2026-09-01-business",
    meetingId: "escribe-929244b6",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Sep 1, 2026",
    whenWhere: "4:00 PM · Board Room, Government Center, Leesburg · video 7h 51m",
    official: {
      votesPosted: true,
      checkedLabel: "Oct 9, 2026, 8:44 PM ET",
      note: "Votes below are taken from the county Action Report (posted Sept 3, 2026).",
      links: [
        { label: "Agenda (eScribe)", href: SEP1_AGENDA_HTML },
        { label: "Action Report (PDF)", href: ACTION_SEP1 },
        {
          label: "County document folder for Board meetings",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [
      {
        item: "4",
        action: "Consent agenda approved (7a–7f, 14a, and 14c).",
        tally: "8-0-1 (Supervisor Saines absent)",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "10.a",
        action:
          "Motion to direct staff to prepare and return with proposed ordinances implementing local authority from House Bills 4 and 854 (2026 General Assembly) died due to lack of second.",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "11.a",
        action:
          "Board directed staff to include conversations and considerations regarding locating one remaining Regional Park called for in the FY 2029–FY 2040 Capital Needs Assessment south of Route 50 as part of a future budget development process (FGOEDC recommendation).",
        tally: "8-0-1 (Supervisor Saines absent)",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "12.a",
        action:
          "Environmental Commission 2026 Annual Report endorsed (Attachment 1) (TLUC recommendation).",
        tally: "9-0",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "14.d",
        action:
          "2025 Standard CIF, Urban MFA CIF, and By-Size Differential Option adopted as recommended by staff, along with Age-Restricted/CCRC CIF and Roads CIF as recommended by the Fiscal Impact Committee (Attachments 2, 5, and 7), effective on adoption and applying to legislative applications not yet to a Planning Commission Public Hearing.",
        tally: "8-0-1 (Supervisor Saines absent)",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "14.e (Motion 1)",
        action:
          "LEGI-2025-0012, Golden Substation: CMPT-2025-0005 ratified subject to the Commission Permit Plat dated July 2, 2026, and Findings for Approval (Attachments 1 and 3).",
        tally: "8-1 (Supervisor Briskman opposed)",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "14.e (Motion 2)",
        action:
          "LEGI-2025-0012, Golden Substation: SPEX-2025-0032, SPEX-2025-0033, & SPEX-2025-0137 forwarded to the December 1, 2026 Board of Supervisors Business Meeting for action.",
        tally:
          "5-4 (Supervisors Kershner, Letourneau, Turner, and Umstattd opposed)",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "14.f",
        action:
          "LEGI-2025-0052, R&D Hamilton Academy: SPEX-2026-0005, SPEX-2026-0006, & SPEX-2026-0007 approved subject to Conditions of Approval dated July 15, 2026, and Findings for Approval (Attachments 1 and 2).",
        tally: "6-3 (Supervisors Briskman, Saines, and TeKrony opposed)",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "14.g",
        action:
          "Proposed 2028–2031 Board term annual compensation structure (Table 4) advertised for the October 14, 2026 Board of Supervisors Public Hearing.",
        tally: "6-3 (Supervisors Kershner, Letourneau, and Umstattd opposed)",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "14.h",
        action:
          "Substitute motion: County Attorney directed to prepare a memorandum for the October 6, 2026 Business Meeting with a legal opinion on amending the March 18, 2025 data-center grandfathering resolution to add immediate loss of grandfathered status for administrative applications upon adoption; staff directed to bring back a public inventory of every remaining administrative application claimed under the 2025 resolution (location, status, square footage, number of buildings, and whether already grandfathered or still in process).",
        tally: "9-0",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        item: "15.b (from closed session)",
        action:
          "Staff directed to prepare a resolution to initiate condemnation and “quick take” proceedings for acquisition of property in the Dulles Election District for construction of Dulles West Boulevard (Northstar Boulevard to Arcola Boulevard), and to advertise the resolution for the October 14, 2026 Public Hearing.",
        tally: "9-0",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
    ],
    context: [
      {
        text: "Item 14.h’s original motion (direct staff to prepare an amending resolution for Oct 6) was replaced by Chair Randall’s substitute motion (legal opinion memorandum plus application inventory), which passed 9-0 as amended.",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
      {
        text: "The Action Report’s closed-session section lists two identical Dulles Election District property-acquisition motions under Part 1 before the certification and the Dulles West Boulevard condemnation follow-up (15.b).",
        source: { label: "Sept 1, 2026 Action Report", href: ACTION_SEP1 },
      },
    ],
    agenda: [
      {
        heading: "Ceremonial resolutions (on consent: 7a–7f)",
        items: [
          {
            num: "7.a",
            title: "Resolution recognizing Dr. Elahe Hessamfar (Community Services Board)",
            href: doc(748),
          },
          {
            num: "7.b",
            title: "Proclamation: Hunger Action Month (September 2026)",
            href: doc(747),
          },
          {
            num: "7.c",
            title: "Proclamation: Prostate Cancer Awareness Month (September 2026)",
            href: doc(728),
          },
          {
            num: "7.d",
            title: "Proclamation: Sickle Cell Awareness Month (September 2026)",
            href: doc(702),
          },
          {
            num: "7.e",
            title: "Proclamation: Suicide Prevention Month (September 2026)",
          },
          {
            num: "7.f",
            title: "Proclamation: Find the Good Day (September 17, 2026)",
          },
        ],
      },
      {
        heading: "Action items highlighted in the Action Report",
        items: [
          { num: "14.a", title: "Appointments: confirmations", href: doc(696) },
          { num: "14.c", title: "Administrative Items Report", href: doc(698) },
          {
            num: "14.d",
            title: "2025 Capital Intensity Factors",
            href: doc(717),
          },
          {
            num: "14.e",
            title: "LEGI-2025-0012, Golden Substation",
          },
          {
            num: "14.f",
            title: "LEGI-2025-0052, R&D Hamilton Academy",
          },
          {
            num: "14.g",
            title: "BMI: 2028–2031 Board term compensation structure",
          },
          {
            num: "14.h",
            title: "BMI: Amendment to the 2025 Data Center Grandfathering Resolution",
            href: doc(744),
          },
        ],
      },
    ],
    transcriptDownloads: {
      pdfUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-09-01-business.pdf",
      txtUrl:
        "/files/find-the-moment/loudoun-bos/transcripts/coraggio-transcript-loudoun-bos-2026-09-01-business.txt",
      pdfNote: "91 pages",
    },
    moments: [
      { seconds: 950, item: "1", label: "Meeting called to order." },
      { seconds: 1188, item: "4", label: "Consent agenda is moved." },
      {
        seconds: 3812,
        item: "14.d",
        label: "2025 Capital Intensity Factors taken up.",
      },
      {
        seconds: 3961,
        item: "14.h",
        label: "Data center grandfathering resolution amendment discussed.",
      },
    ],
  },

];

/** Always sorted newest meeting first (see recap-sort.ts). */
const RAW_IDS = new Set(LOUDOUN_RECAPS_RAW.map((r) => r.meetingId));
export const LOUDOUN_RECAPS: LoudounRecap[] = sortRecapsNewestFirst([
  ...LOUDOUN_RECAPS_RAW,
  // Backfill entries yield to any hand-written recap for the same meeting.
  ...LOUDOUN_RECAPS_BACKFILL.filter((r) => !RAW_IDS.has(r.meetingId)),
]);

export const LOUDOUN_RECAP_BY_SLUG: Record<string, LoudounRecap> = Object.fromEntries(
  LOUDOUN_RECAPS.map((r) => [r.slug, r]),
);

export const LOUDOUN_RECAP_BY_MEETING: Record<string, LoudounRecap> = Object.fromEntries(
  LOUDOUN_RECAPS.map((r) => [r.meetingId, r]),
);
