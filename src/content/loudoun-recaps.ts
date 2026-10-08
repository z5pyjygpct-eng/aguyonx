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

const OCT6_AGENDA_HTML = `${ESCRIBE}/Meeting.aspx?Id=3a6eea40-36a8-49b2-9488-cedd456be4d9&Agenda=Agenda&lang=English`;

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
          href: "https://lfportal.loudoun.gov/LFPortalInternet/Browse.aspx?startid=1975792&dbid=0",
        },
      ],
    },
    decisions: [],
    context: [
      {
        text: "Two items on this agenda were deferred from the Sept 15, 2026 meeting: 14.e (Farmwell Road eminent domain) and the Tuscarora Crossing Landbay 4 special exception (now 14.f).",
        source: {
          label: "Sept 15, 2026 Action Report",
          href: "https://lfportal.loudoun.gov/LFPortalinternet/0/edoc/1975550/09-15-26%20Business%20Meeting%20Action%20Report.pdf",
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
];

export const LOUDOUN_RECAP_BY_SLUG: Record<string, LoudounRecap> = Object.fromEntries(
  LOUDOUN_RECAPS.map((r) => [r.slug, r]),
);

export const LOUDOUN_RECAP_BY_MEETING: Record<string, LoudounRecap> = Object.fromEntries(
  LOUDOUN_RECAPS.map((r) => [r.meetingId, r]),
);
