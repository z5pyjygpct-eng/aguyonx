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
  /** LOUDOUN_MEETINGS id — used for the video jump + transcript search. */
  meetingId: string;
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

const OCT6_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=3a6eea40-36a8-49b2-9488-cedd456be4d9&Agenda=Agenda&lang=English`;
const SEP15_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=79595442-81c5-4c63-add5-9a91a8d6300b&Agenda=Agenda&lang=English`;
const SEP9_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=be4b3b17-ccfc-40f8-9ed4-0f8e705e0928&Agenda=Agenda&lang=English`;
const SEP1_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=929244b6-a7bd-4399-b2dc-47491ce17657&Agenda=Agenda&lang=English`;
const LASERFICHE_BOS =
  "https://lfportal.loudoun.gov/LFPortalInternet/Browse.aspx?startid=1975792&dbid=0";

export const LOUDOUN_RECAPS: LoudounRecap[] = [
  {
    slug: "bos-2026-10-06-business",
    meetingId: "escribe-3a6eea40",
    title: "Board of Supervisors Business Meeting",
    dateLabel: "Tuesday, Oct 6, 2026",
    whenWhere: "4:00 PM · Board Room, Government Center, Leesburg · video 6h 36m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 8, 2026, 6 PM ET",
      note: "Official vote record not yet posted. The county has posted the agenda for this meeting, but not the minutes or the Action Report that lists each motion and vote. Outcomes below are left blank on purpose until it is posted.",
      links: [
        { label: "Agenda (eScribe)", href: OCT6_AGENDA_HTML },
        { label: "Agenda (PDF)", href: doc(1718) },
        {
          label: "County document folder for this meeting (Action Report is posted here)",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [],
    context: [
      {
        text: "Two items on this agenda were deferred from the Sept 15, 2026 meeting: 14.e (Farmwell Road eminent domain) and the Tuscarora Crossing Landbay 4 special exception (now 14.f).",
        source: {
          label: "Sept 15, 2026 Action Report",
          href: ACTION_SEP15,
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
        dek: "Listed on the agenda for one combined vote. The official record will confirm what passed.",
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
      votesPosted: false,
      checkedLabel: "Oct 9, 2026, 8 AM ET",
      note: "Official vote record not yet located in the county Action Report / minutes posting checked this morning. The agenda is posted on eScribe. Outcomes are left blank on purpose until the official record is posted.",
      links: [
        { label: "Agenda (eScribe)", href: SEP9_AGENDA_HTML },
        {
          label: "County document folder for Board meetings",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [],
    context: [],
    agenda: [
      {
        heading: "Hearing items (as listed on the eScribe agenda)",
        dek: "Items 3a–3j were proposed on the consolidated agenda.",
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
          { num: "3.c–3.j", title: "Additional hearing items on the consolidated / hearing agenda (see eScribe)" },
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
      votesPosted: false,
      checkedLabel: "Oct 9, 2026, 8 AM ET",
      note: "Official vote record (Action Report / minutes) was not located in the county posting checked this morning. The agenda is posted on eScribe. Outcomes are left blank on purpose until the official record is posted.",
      links: [
        { label: "Agenda (eScribe)", href: SEP1_AGENDA_HTML },
        {
          label: "County document folder for Board meetings",
          href: LASERFICHE_BOS,
        },
      ],
    },
    decisions: [],
    context: [],
    agenda: [
      {
        heading: "Ceremonial resolutions (proposed on consent include 7a–7f)",
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
        ],
      },
      {
        heading: "Action items highlighted on the agenda",
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
        item: "14.e",
        label: "Data center grandfathering resolution amendment discussed.",
      },
    ],
  },
];

export const LOUDOUN_RECAP_BY_SLUG: Record<string, LoudounRecap> = Object.fromEntries(
  LOUDOUN_RECAPS.map((r) => [r.slug, r]),
);

export const LOUDOUN_RECAP_BY_MEETING: Record<string, LoudounRecap> = Object.fromEntries(
  LOUDOUN_RECAPS.map((r) => [r.meetingId, r]),
);
