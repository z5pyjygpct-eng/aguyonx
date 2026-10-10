import { sortRecapsNewestFirst } from "./recap-sort";
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
      checkedLabel: "Oct 10, 2026, 12:40 PM ET",
      note: "Official vote record not yet posted. BoardDocs meeting page has agenda only (no View Minutes control). Decisions will be filled from BoardDocs minutes when available. Do not infer votes from the video or machine transcript.",
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
      votesPosted: false,
      checkedLabel: "Oct 10, 2026, 12:40 PM ET",
      note: "Official vote record not yet posted. BoardDocs retreat meeting page has agenda only (no View Minutes control). Do not infer votes from the video or machine transcript.",
      links: [
        { label: "BoardDocs meeting", href: boarddocsMeeting("DTRGE7436104") },
        { label: "BoardDocs (School Board)", href: BOARDDOCS_LCPS },
        { label: "Meeting video (Vimeo / LCPS-TV)", href: "https://player.vimeo.com/video/1227257661?rel=0" },
      ],
    },
    decisions: [],
    context: [],
    agenda: [
      {
        heading: "Retreat topics (navigation markers)",
        dek: "Neutral labels from the retreat video — confirm against BoardDocs for the official agenda.",
        items: [
          { num: "—", title: "Call to order and disclosures" },
          { num: "—", title: "Strategic / planning discussion" },
          { num: "—", title: "Budget-related discussion" },
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
export const LOUDOUN_RECAPS: LoudounRecap[] = sortRecapsNewestFirst(LOUDOUN_RECAPS_RAW);

export const LOUDOUN_RECAP_BY_SLUG: Record<string, LoudounRecap> = Object.fromEntries(
  LOUDOUN_RECAPS.map((r) => [r.slug, r]),
);

export const LOUDOUN_RECAP_BY_MEETING: Record<string, LoudounRecap> = Object.fromEntries(
  LOUDOUN_RECAPS.map((r) => [r.meetingId, r]),
);
