/**
 * City meeting recaps (City of Fairfax, Manassas). Same rules as src/content/loudoun-recaps.ts:
 * decisions and votes ONLY from official minutes (Fairfax: Granicus minutes; Manassas City Council:
 * manassascity.granicus.com minutes; Manassas schools: BoardDocs minutes/motions). Until minutes are
 * posted keep official.votesPosted false. Never infer a vote from video or transcript.
 * Renders at /cities/{city}/recaps/{slug}.
 */
import { sortRecapsNewestFirst } from "./recap-sort";
import type { LoudounRecap } from "./loudoun-recaps";
import type { CityVenueId } from "./cities";

export type CityRecap = Omit<LoudounRecap, "venue"> & { venue: CityVenueId };

const CITY_RECAPS_RAW: CityRecap[] = [
  {
    slug: "fxc-2026-10-06-city-council-work-session",
    meetingId: "fxc-4676",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Oct 6, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 4h 29m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4676" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4676&doc_id=ea4b6320-c25f-11f1-89ef-005056a84798" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4676" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-10-06-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-10-06-city-council-work-session.txt", "pdfNote": "61 pages"},
    shareContext: "Fairfax City City Council, Oct 6, 2026",
    moments: [
      { seconds: 2905, label: "Public comment / public hearing begins." },
      { seconds: 4034, label: "Early agenda business." },
      { seconds: 8013, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-10-05-school-board-regular-meeting",
    meetingId: "fxc-4669",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Monday, Oct 5, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 3h 0m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official vote record not yet posted or linked on the city’s Granicus archive for this meeting. Votes will be added only from the adopted minutes.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4669" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4669" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-10-05-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-10-05-school-board-regular-meeting.txt", "pdfNote": "19 pages"},
    shareContext: "Fairfax City School Board, Oct 5, 2026",
    moments: [
      { seconds: 0, label: "Pledge of Allegiance." },
      { seconds: 1741, label: "Early agenda business." },
      { seconds: 3471, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-09-28-school-board-work-session",
    meetingId: "fxc-4665",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Work Session",
    dateLabel: "Monday, Sep 28, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 1h 53m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4665" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4665&doc_id=733c507a-bc3b-11f1-89ef-005056a84798" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4665" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-09-28-school-board-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-09-28-school-board-work-session.txt", "pdfNote": "27 pages"},
    shareContext: "Fairfax City School Board, Sep 28, 2026",
    moments: [
      { seconds: 1710, label: "Early agenda business." },
      { seconds: 3418, label: "Mid-meeting discussion." },
      { seconds: 5117, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-09-22-city-council-meeting",
    meetingId: "fxc-4655",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Sep 22, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 4h 0m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4655" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4655&doc_id=c2c50ed4-b75d-11f1-a7dc-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4655" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-09-22-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-09-22-city-council-meeting.txt", "pdfNote": "57 pages"},
    shareContext: "Fairfax City City Council, Sep 22, 2026",
    moments: [
      { seconds: 79, label: "Pledge of Allegiance." },
      { seconds: 1471, label: "Consent agenda motion." },
      { seconds: 2174, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2026-09-14-school-board-regular-meeting",
    meetingId: "fxc-4651",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Monday, Sep 14, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 2h 35m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4651" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4651&doc_id=ef46757f-b75e-11f1-a7dc-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4651" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-09-14-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-09-14-school-board-regular-meeting.txt", "pdfNote": "39 pages"},
    shareContext: "Fairfax City School Board, Sep 14, 2026",
    moments: [
      { seconds: 3, label: "Pledge of Allegiance." },
      { seconds: 2341, label: "Early agenda business." },
      { seconds: 9328, label: "Adjournment." },
    ],
  },
  {
    slug: "fxc-2026-09-08-city-council-meeting",
    meetingId: "fxc-4641",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Sep 8, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 1h 28m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4641" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4641&doc_id=c50324c6-ac59-11f1-a183-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4641" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-09-08-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-09-08-city-council-meeting.txt", "pdfNote": "23 pages"},
    shareContext: "Fairfax City City Council, Sep 8, 2026",
    moments: [
      { seconds: 14, label: "Pledge of Allegiance." },
      { seconds: 1252, label: "Consent agenda motion." },
      { seconds: 1687, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2026-09-01-city-council-work-session",
    meetingId: "fxc-4638",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Sep 1, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 5h 8m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4638" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4638&doc_id=41c92143-a6e0-11f1-a028-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4638" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-09-01-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-09-01-city-council-work-session.txt", "pdfNote": "67 pages"},
    shareContext: "Fairfax City City Council, Sep 1, 2026",
    moments: [
      { seconds: 4598, label: "Early agenda business." },
      { seconds: 9238, label: "Mid-meeting discussion." },
      { seconds: 13834, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-07-28-city-council-meeting",
    meetingId: "fxc-4623",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jul 28, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 3h 57m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4623" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4623&doc_id=357d0c09-8b66-11f1-bb61-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4623" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-07-28-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-07-28-city-council-meeting.txt", "pdfNote": "57 pages"},
    shareContext: "Fairfax City City Council, Jul 28, 2026",
    moments: [
      { seconds: 2, label: "Pledge of Allegiance." },
      { seconds: 1009, label: "Consent agenda motion." },
      { seconds: 5222, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2026-07-14-city-council-meeting",
    meetingId: "fxc-4612",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jul 14, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 4h 10m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4612" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4612&doc_id=0181898f-8077-11f1-98fd-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4612" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-07-14-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-07-14-city-council-meeting.txt", "pdfNote": "61 pages"},
    shareContext: "Fairfax City City Council, Jul 14, 2026",
    moments: [
      { seconds: 241, label: "Pledge of Allegiance." },
      { seconds: 718, label: "Consent agenda motion." },
      { seconds: 3752, label: "Early agenda business." },
    ],
  },
  {
    slug: "fxc-2026-07-07-city-council-special-meeting-work-session",
    meetingId: "fxc-4609",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Special Meeting & Work Session",
    dateLabel: "Tuesday, Jul 7, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 3h 15m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4609" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4609&doc_id=e6282fec-7adf-11f1-9494-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4609" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-07-07-city-council-special-meeting-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-07-07-city-council-special-meeting-work-session.txt", "pdfNote": "46 pages"},
    shareContext: "Fairfax City City Council, Jul 7, 2026",
    moments: [
      { seconds: 2936, label: "Early agenda business." },
      { seconds: 5861, label: "Mid-meeting discussion." },
      { seconds: 8764, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-07-01-school-board-regular-meeting",
    meetingId: "fxc-4628",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Wednesday, Jul 1, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 0h 17m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4628" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4628&doc_id=9b8ee366-9015-11f1-bb61-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4628" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-07-01-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-07-01-school-board-regular-meeting.txt", "pdfNote": "5 pages"},
    shareContext: "Fairfax City School Board, Jul 1, 2026",
    moments: [
      { seconds: 1, label: "Pledge of Allegiance." },
      { seconds: 273, label: "Early agenda business." },
      { seconds: 522, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-06-23-city-council-meeting",
    meetingId: "fxc-4588",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jun 23, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 3h 15m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4588" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4588&doc_id=9943173b-6fd3-11f1-9494-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4588" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-06-23-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-06-23-city-council-meeting.txt", "pdfNote": "50 pages"},
    shareContext: "Fairfax City City Council, Jun 23, 2026",
    moments: [
      { seconds: 1820, label: "Consent agenda motion." },
      { seconds: 2996, label: "Public comment / public hearing begins." },
      { seconds: 11677, label: "Motion to enter closed session." },
    ],
  },
  {
    slug: "fxc-2026-06-09-city-council-meeting",
    meetingId: "fxc-4576",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jun 9, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 2h 13m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4576" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4576&doc_id=2eaa1020-64d4-11f1-9494-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4576" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-06-09-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-06-09-city-council-meeting.txt", "pdfNote": "33 pages"},
    shareContext: "Fairfax City City Council, Jun 9, 2026",
    moments: [
      { seconds: 2, label: "Pledge of Allegiance." },
      { seconds: 1267, label: "Consent agenda motion." },
      { seconds: 1379, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2026-06-02-city-council-work-session",
    meetingId: "fxc-4571",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Jun 2, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 2h 4m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4571" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4571&doc_id=0a7493fc-5f4b-11f1-9b4d-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4571" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-06-02-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-06-02-city-council-work-session.txt", "pdfNote": "31 pages"},
    shareContext: "Fairfax City City Council, Jun 2, 2026",
    moments: [
      { seconds: 1859, label: "Early agenda business." },
      { seconds: 3723, label: "Mid-meeting discussion." },
      { seconds: 5574, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-06-01-school-board-regular-meeting",
    meetingId: "fxc-4568",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Monday, Jun 1, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 1h 9m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4568" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4568&doc_id=0aaf3ae3-601c-11f1-9b4d-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4568" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-06-01-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-06-01-school-board-regular-meeting.txt", "pdfNote": "17 pages"},
    shareContext: "Fairfax City School Board, Jun 1, 2026",
    moments: [
      { seconds: 14, label: "Pledge of Allegiance." },
      { seconds: 1042, label: "Early agenda business." },
      { seconds: 2070, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-05-26-city-council-meeting",
    meetingId: "fxc-4565",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, May 26, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 1h 42m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4565" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4565&doc_id=f37de8d6-59cc-11f1-9b4d-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4565" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-05-26-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-05-26-city-council-meeting.txt", "pdfNote": "25 pages"},
    shareContext: "Fairfax City City Council, May 26, 2026",
    moments: [
      { seconds: 9, label: "Pledge of Allegiance." },
      { seconds: 474, label: "Consent agenda motion." },
      { seconds: 756, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2026-05-18-school-board-work-session",
    meetingId: "fxc-4554",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Work Session",
    dateLabel: "Monday, May 18, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 0h 50m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4554" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4554&doc_id=f501cb95-551b-11f1-9b4d-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4554" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-05-18-school-board-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-05-18-school-board-work-session.txt", "pdfNote": "12 pages"},
    shareContext: "Fairfax City School Board, May 18, 2026",
    moments: [
      { seconds: 736, label: "Early agenda business." },
      { seconds: 1480, label: "Mid-meeting discussion." },
      { seconds: 2237, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-05-12-city-council-meeting",
    meetingId: "fxc-4547",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, May 12, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 4h 2m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4547" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4547&doc_id=9b2501f3-4ecd-11f1-9b4d-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4547" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-05-12-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-05-12-city-council-meeting.txt", "pdfNote": "60 pages"},
    shareContext: "Fairfax City City Council, May 12, 2026",
    moments: [
      { seconds: 5, label: "Pledge of Allegiance." },
      { seconds: 2009, label: "Consent agenda motion." },
      { seconds: 2948, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2026-05-05-city-council-special-meeting-budget-adoption",
    meetingId: "fxc-4540",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Special Meeting: Budget Adoption",
    dateLabel: "Tuesday, May 5, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 0h 48m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4540" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4540&doc_id=c2836927-494e-11f1-9b4d-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4540" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-05-05-city-council-special-meeting-budget-adoption.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-05-05-city-council-special-meeting-budget-adoption.txt", "pdfNote": "13 pages"},
    shareContext: "Fairfax City City Council, May 5, 2026",
    moments: [
      { seconds: 101, label: "Public comment / public hearing begins." },
      { seconds: 727, label: "Early agenda business." },
      { seconds: 1451, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-05-04-school-board-regular-meeting",
    meetingId: "fxc-4542",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Monday, May 4, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 2h 8m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4542" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4542&doc_id=0ab31490-4b09-11f1-9b4d-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4542" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-05-04-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-05-04-school-board-regular-meeting.txt", "pdfNote": "32 pages"},
    shareContext: "Fairfax City School Board, May 4, 2026",
    moments: [
      { seconds: 14, label: "Pledge of Allegiance." },
      { seconds: 1909, label: "Early agenda business." },
      { seconds: 3839, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-04-28-city-council-meeting",
    meetingId: "fxc-4535",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Apr 28, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 5h 14m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4535" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4535&doc_id=1d3bddb8-43d5-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4535" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-04-28-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-04-28-city-council-meeting.txt", "pdfNote": "71 pages"},
    shareContext: "Fairfax City City Council, Apr 28, 2026",
    moments: [
      { seconds: 48, label: "Pledge of Allegiance." },
      { seconds: 3721, label: "Consent agenda motion." },
      { seconds: 3925, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2026-04-20-school-board-work-session",
    meetingId: "fxc-4528",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Work Session",
    dateLabel: "Monday, Apr 20, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 2h 49m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4528" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4528&doc_id=0131846c-3e74-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4528" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-04-20-school-board-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-04-20-school-board-work-session.txt", "pdfNote": "42 pages"},
    shareContext: "Fairfax City School Board, Apr 20, 2026",
    moments: [
      { seconds: 2511, label: "Early agenda business." },
      { seconds: 5024, label: "Mid-meeting discussion." },
      { seconds: 7566, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-04-14-city-council-meeting",
    meetingId: "fxc-4519",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Apr 14, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 2h 47m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4519" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4519&doc_id=f8170baa-38d0-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4519" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-04-14-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-04-14-city-council-meeting.txt", "pdfNote": "40 pages"},
    shareContext: "Fairfax City City Council, Apr 14, 2026",
    moments: [
      { seconds: 3, label: "Pledge of Allegiance." },
      { seconds: 2501, label: "Early agenda business." },
      { seconds: 3691, label: "Consent agenda motion." },
    ],
  },
  {
    slug: "fxc-2026-04-13-school-board-special-meeting",
    meetingId: "fxc-4518",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Special Meeting",
    dateLabel: "Monday, Apr 13, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 1h 12m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4518" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4518&doc_id=43edfb04-38d6-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4518" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-04-13-school-board-special-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-04-13-school-board-special-meeting.txt", "pdfNote": "19 pages"},
    shareContext: "Fairfax City School Board, Apr 13, 2026",
    moments: [
      { seconds: 0, label: "Pledge of Allegiance." },
      { seconds: 1101, label: "Early agenda business." },
      { seconds: 2178, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-04-07-city-council-work-session",
    meetingId: "fxc-4513",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Apr 7, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 3h 37m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4513" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4513&doc_id=3c467f53-3351-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4513" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-04-07-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-04-07-city-council-work-session.txt", "pdfNote": "55 pages"},
    shareContext: "Fairfax City City Council, Apr 7, 2026",
    moments: [
      { seconds: 3259, label: "Early agenda business." },
      { seconds: 6488, label: "Mid-meeting discussion." },
      { seconds: 9711, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-04-06-school-board-regular-meeting",
    meetingId: "fxc-4509",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Monday, Apr 6, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 1h 37m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4509" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4509&doc_id=b5d394a9-44c4-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4509" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-04-06-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-04-06-school-board-regular-meeting.txt", "pdfNote": "26 pages"},
    shareContext: "Fairfax City School Board, Apr 6, 2026",
    moments: [
      { seconds: 45, label: "Pledge of Allegiance." },
      { seconds: 1470, label: "Early agenda business." },
      { seconds: 2917, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-03-24-city-council-meeting",
    meetingId: "fxc-4504",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Mar 24, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 4h 44m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4504" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4504&doc_id=e86056bf-2854-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4504" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-03-24-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-03-24-city-council-meeting.txt", "pdfNote": "71 pages"},
    shareContext: "Fairfax City City Council, Mar 24, 2026",
    moments: [
      { seconds: 287, label: "Pledge of Allegiance." },
      { seconds: 2710, label: "Consent agenda motion." },
      { seconds: 2775, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2026-03-10-city-council-meeting",
    meetingId: "fxc-4494",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Mar 10, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 4h 24m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4494" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4494&doc_id=a0a9c169-1d4e-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4494" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-03-10-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-03-10-city-council-meeting.txt", "pdfNote": "63 pages"},
    shareContext: "Fairfax City City Council, Mar 10, 2026",
    moments: [
      { seconds: 111, label: "Pledge of Allegiance." },
      { seconds: 635, label: "Public comment / public hearing begins." },
      { seconds: 1201, label: "Consent agenda motion." },
    ],
  },
  {
    slug: "fxc-2026-03-03-city-council-work-session",
    meetingId: "fxc-4489",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Mar 3, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 3h 3m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4489" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4489&doc_id=0ea5f2c1-17d9-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4489" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-03-03-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-03-03-city-council-work-session.txt", "pdfNote": "44 pages"},
    shareContext: "Fairfax City City Council, Mar 3, 2026",
    moments: [
      { seconds: 55, label: "Meeting called to order." },
      { seconds: 2615, label: "Early agenda business." },
      { seconds: 5247, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-03-02-regular-school-board-meeting",
    meetingId: "fxc-4488",
    venue: "fairfax-city-schools",
    title: "City of Fairfax Regular School Board Meeting",
    dateLabel: "Monday, Mar 2, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 3h 12m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4488" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4488&doc_id=19e93af7-18a1-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4488" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-03-02-regular-school-board-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-03-02-regular-school-board-meeting.txt", "pdfNote": "51 pages"},
    shareContext: "Fairfax City School Board, Mar 2, 2026",
    moments: [
      { seconds: 14, label: "Pledge of Allegiance." },
      { seconds: 2885, label: "Early agenda business." },
      { seconds: 5782, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-02-24-city-council-meeting",
    meetingId: "fxc-4474",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Feb 24, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 4h 18m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4474" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4474&doc_id=2a2b5327-125d-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4474" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-02-24-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-02-24-city-council-meeting.txt", "pdfNote": "62 pages"},
    shareContext: "Fairfax City City Council, Feb 24, 2026",
    moments: [
      { seconds: 26, label: "Pledge of Allegiance." },
      { seconds: 3867, label: "Early agenda business." },
      { seconds: 7732, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-02-17-city-council-special-meeting-and-work-session",
    meetingId: "fxc-4468",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Special Meeting and Work Session",
    dateLabel: "Tuesday, Feb 17, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 3h 30m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4468" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4468&doc_id=d5289f2e-0cdb-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4468" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-02-17-city-council-special-meeting-and-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-02-17-city-council-special-meeting-and-work-session.txt", "pdfNote": "54 pages"},
    shareContext: "Fairfax City City Council, Feb 17, 2026",
    moments: [
      { seconds: 3148, label: "Early agenda business." },
      { seconds: 6282, label: "Mid-meeting discussion." },
      { seconds: 12574, label: "Adjournment." },
    ],
  },
  {
    slug: "fxc-2026-02-10-city-council-meeting",
    meetingId: "fxc-4463",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Feb 10, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 5h 57m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4463" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4463&doc_id=9751bc6e-0762-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4463" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-02-10-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-02-10-city-council-meeting.txt", "pdfNote": "86 pages"},
    shareContext: "Fairfax City City Council, Feb 10, 2026",
    moments: [
      { seconds: 54, label: "Pledge of Allegiance." },
      { seconds: 3920, label: "Public comment / public hearing begins." },
      { seconds: 6550, label: "Consent agenda motion." },
    ],
  },
  {
    slug: "fxc-2026-02-09-school-board-regular-meeting",
    meetingId: "fxc-4461",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Monday, Feb 9, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 0h 36m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4461" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4461&doc_id=325b41f3-0cd8-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4461" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-02-09-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-02-09-school-board-regular-meeting.txt", "pdfNote": "10 pages"},
    shareContext: "Fairfax City School Board, Feb 9, 2026",
    moments: [
      { seconds: 1, label: "Pledge of Allegiance." },
      { seconds: 543, label: "Early agenda business." },
      { seconds: 1070, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2026-02-03-city-council-work-session",
    meetingId: "fxc-4456",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Feb 3, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 3h 36m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4456" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4456&doc_id=6f9c9b11-01fb-11f1-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4456" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-02-03-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-02-03-city-council-work-session.txt", "pdfNote": "53 pages"},
    shareContext: "Fairfax City City Council, Feb 3, 2026",
    moments: [
      { seconds: 3208, label: "Early agenda business." },
      { seconds: 6441, label: "Mid-meeting discussion." },
      { seconds: 12876, label: "Adjournment." },
    ],
  },
  {
    slug: "fxc-2026-01-26-school-board-work-session",
    meetingId: "fxc-4445",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Work Session",
    dateLabel: "Monday, Jan 26, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 0h 35m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4445" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4445&doc_id=6e920228-fe20-11f0-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4445" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-01-26-school-board-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-01-26-school-board-work-session.txt", "pdfNote": "9 pages"},
    shareContext: "Fairfax City School Board, Jan 26, 2026",
    moments: [
      { seconds: 529, label: "Early agenda business." },
      { seconds: 1087, label: "Mid-meeting discussion." },
      { seconds: 1602, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-01-13-city-council-meeting",
    meetingId: "fxc-4436",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jan 13, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 4h 8m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4436" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4436&doc_id=1cc7481d-f16c-11f0-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4436" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-01-13-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-01-13-city-council-meeting.txt", "pdfNote": "58 pages"},
    shareContext: "Fairfax City City Council, Jan 13, 2026",
    moments: [
      { seconds: 170, label: "Pledge of Allegiance." },
      { seconds: 238, label: "Consent agenda motion." },
      { seconds: 405, label: "Public comment / public hearing begins." },
      { seconds: 14862, label: "Adjournment." },
    ],
  },
  {
    slug: "fxc-2026-01-06-city-council-work-session",
    meetingId: "fxc-4432",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Jan 6, 2026",
    whenWhere: "City of Fairfax City Council meeting · video 0h 45m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4432" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4432&doc_id=5956f9d9-ec09-11f0-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4432" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-01-06-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2026-01-06-city-council-work-session.txt", "pdfNote": "11 pages"},
    shareContext: "Fairfax City City Council, Jan 6, 2026",
    moments: [
      { seconds: 681, label: "Early agenda business." },
      { seconds: 1365, label: "Mid-meeting discussion." },
      { seconds: 2058, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2026-01-05-school-board-regular-meeting",
    meetingId: "fxc-4433",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Monday, Jan 5, 2026",
    whenWhere: "City of Fairfax School Board meeting · video 1h 6m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4433" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4433&doc_id=f891f250-eccd-11f0-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4433" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-01-05-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2026-01-05-school-board-regular-meeting.txt", "pdfNote": "17 pages"},
    shareContext: "Fairfax City School Board, Jan 5, 2026",
    moments: [
      { seconds: 998, label: "Early agenda business." },
      { seconds: 1979, label: "Mid-meeting discussion." },
      { seconds: 2981, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2025-12-16-joint-cof-fcps-school-board-meeting",
    meetingId: "fxc-4425",
    venue: "fairfax-city-schools",
    title: "City of Fairfax Joint COF/FCPS School Board Meeting",
    dateLabel: "Tuesday, Dec 16, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 0h 25m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4425" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4425&doc_id=34c549f0-dc5c-11f0-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4425" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-12-16-joint-cof-fcps-school-board-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-12-16-joint-cof-fcps-school-board-meeting.txt", "pdfNote": "7 pages"},
    shareContext: "Fairfax City School Board, Dec 16, 2025",
    moments: [
      { seconds: 384, label: "Early agenda business." },
      { seconds: 731, label: "Mid-meeting discussion." },
      { seconds: 1126, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2025-12-09-city-council-meeting",
    meetingId: "fxc-4421",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Dec 9, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 3h 17m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4421" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4421&doc_id=bb731eb3-d603-11f0-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4421" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-12-09-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-12-09-city-council-meeting.txt", "pdfNote": "48 pages"},
    shareContext: "Fairfax City City Council, Dec 9, 2025",
    moments: [
      { seconds: 123, label: "Pledge of Allegiance." },
      { seconds: 2424, label: "Public comment / public hearing begins." },
      { seconds: 3440, label: "Consent agenda motion." },
    ],
  },
  {
    slug: "fxc-2025-12-02-city-council-work-session",
    meetingId: "fxc-4416",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Dec 2, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 3h 20m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4416" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4416&doc_id=c3e1299a-d057-11f0-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4416" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-12-02-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-12-02-city-council-work-session.txt", "pdfNote": "48 pages"},
    shareContext: "Fairfax City City Council, Dec 2, 2025",
    moments: [
      { seconds: 3020, label: "Early agenda business." },
      { seconds: 6025, label: "Mid-meeting discussion." },
      { seconds: 9036, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2025-12-01-regular-school-board-meeting",
    meetingId: "fxc-4415",
    venue: "fairfax-city-schools",
    title: "City of Fairfax Regular School Board Meeting",
    dateLabel: "Monday, Dec 1, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 1h 30m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4415" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4415&doc_id=34c39007-d45d-11f0-bb28-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4415" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-12-01-regular-school-board-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-12-01-regular-school-board-meeting.txt", "pdfNote": "22 pages"},
    shareContext: "Fairfax City School Board, Dec 1, 2025",
    moments: [
      { seconds: 14, label: "Pledge of Allegiance." },
      { seconds: 1367, label: "Early agenda business." },
      { seconds: 2704, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2025-11-18-city-council-meeting",
    meetingId: "fxc-4400",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Nov 18, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 4h 23m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4400" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4400&doc_id=b6b22fbe-c55d-11f0-a7da-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4400" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-11-18-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-11-18-city-council-meeting.txt", "pdfNote": "60 pages"},
    shareContext: "Fairfax City City Council, Nov 18, 2025",
    moments: [
      { seconds: 46, label: "Pledge of Allegiance." },
      { seconds: 2129, label: "Consent agenda motion." },
      { seconds: 3275, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2025-11-10-school-board-work-session",
    meetingId: "fxc-4393",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Work Session",
    dateLabel: "Monday, Nov 10, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 1h 39m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4393" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4393&doc_id=6485d8f4-c3ee-11f0-a7da-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4393" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-11-10-school-board-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-11-10-school-board-work-session.txt", "pdfNote": "24 pages"},
    shareContext: "Fairfax City School Board, Nov 10, 2025",
    moments: [
      { seconds: 239, label: "Public comment / public hearing begins." },
      { seconds: 1476, label: "Early agenda business." },
      { seconds: 2933, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2025-11-04-city-council-work-session",
    meetingId: "fxc-4374",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Nov 4, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 3h 22m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4374" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4374&doc_id=59d5f9ee-ba79-11f0-a7da-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4374" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-11-04-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-11-04-city-council-work-session.txt", "pdfNote": "48 pages"},
    shareContext: "Fairfax City City Council, Nov 4, 2025",
    moments: [
      { seconds: 3024, label: "Early agenda business." },
      { seconds: 6060, label: "Mid-meeting discussion." },
      { seconds: 9083, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2025-11-03-school-board-regular-meeting",
    meetingId: "fxc-4377",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Regular Meeting",
    dateLabel: "Monday, Nov 3, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 1h 2m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4377" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4377&doc_id=b4d3b00f-be47-11f0-a7da-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4377" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-11-03-school-board-regular-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-11-03-school-board-regular-meeting.txt", "pdfNote": "15 pages"},
    shareContext: "Fairfax City School Board, Nov 3, 2025",
    moments: [
      { seconds: 14, label: "Pledge of Allegiance." },
      { seconds: 952, label: "Early agenda business." },
      { seconds: 1857, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2025-10-28-city-council-meeting",
    meetingId: "fxc-4369",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Oct 28, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 6h 2m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4369" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4369&doc_id=ddb5c43c-b502-11f0-8df7-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4369" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-10-28-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-10-28-city-council-meeting.txt", "pdfNote": "82 pages"},
    shareContext: "Fairfax City City Council, Oct 28, 2025",
    moments: [
      { seconds: 0, label: "Pledge of Allegiance." },
      { seconds: 4110, label: "Consent agenda motion." },
      { seconds: 4366, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2025-10-20-school-board-work-session",
    meetingId: "fxc-4358",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Work Session",
    dateLabel: "Monday, Oct 20, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 1h 21m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4358" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4358&doc_id=e6b47244-af57-11f0-8df7-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4358" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-10-20-school-board-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-10-20-school-board-work-session.txt", "pdfNote": "22 pages"},
    shareContext: "Fairfax City School Board, Oct 20, 2025",
    moments: [
      { seconds: 1204, label: "Early agenda business." },
      { seconds: 2402, label: "Mid-meeting discussion." },
      { seconds: 3622, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2025-10-14-city-council-meeting",
    meetingId: "fxc-4345",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Oct 14, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 2h 46m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4345" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4345&doc_id=081f5a11-a9e6-11f0-8df7-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4345" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-10-14-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-10-14-city-council-meeting.txt", "pdfNote": "40 pages"},
    shareContext: "Fairfax City City Council, Oct 14, 2025",
    moments: [
      { seconds: 46, label: "Pledge of Allegiance." },
      { seconds: 1633, label: "Consent agenda motion." },
      { seconds: 2586, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2025-10-07-city-council-work-session",
    meetingId: "fxc-4341",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Oct 7, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 3h 49m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4341" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4341&doc_id=128590f2-a44c-11f0-8df7-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4341" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-10-07-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-10-07-city-council-work-session.txt", "pdfNote": "57 pages"},
    shareContext: "Fairfax City City Council, Oct 7, 2025",
    moments: [
      { seconds: 3373, label: "Early agenda business." },
      { seconds: 6753, label: "Mid-meeting discussion." },
      { seconds: 13318, label: "Motion to enter closed session." },
    ],
  },
  {
    slug: "fxc-2025-10-06-regular-school-board-meeting",
    meetingId: "fxc-4335",
    venue: "fairfax-city-schools",
    title: "City of Fairfax Regular School Board Meeting",
    dateLabel: "Monday, Oct 6, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 8h 0m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4335" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4335&doc_id=f284a97b-c274-11f1-89ef-005056a84798" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4335" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-10-06-regular-school-board-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-10-06-regular-school-board-meeting.txt", "pdfNote": "37 pages"},
    shareContext: "Fairfax City School Board, Oct 6, 2025",
    moments: [
      { seconds: 1, label: "Pledge of Allegiance." },
      { seconds: 4825, label: "Early agenda business." },
      { seconds: 24569, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2025-09-30-city-council-meeting",
    meetingId: "fxc-4333",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Sep 30, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 3h 21m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4333" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4333&doc_id=47103901-9eed-11f0-8df7-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4333" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-09-30-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-09-30-city-council-meeting.txt", "pdfNote": "49 pages"},
    shareContext: "Fairfax City City Council, Sep 30, 2025",
    moments: [
      { seconds: 62, label: "Pledge of Allegiance." },
      { seconds: 2859, label: "Early agenda business." },
      { seconds: 6066, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2025-09-29-school-board-work-session",
    meetingId: "fxc-4334",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Work Session",
    dateLabel: "Monday, Sep 29, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 0h 30m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4334" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4334&doc_id=06c574d9-9ed4-11f0-8df7-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4334" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-09-29-school-board-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-09-29-school-board-work-session.txt", "pdfNote": "8 pages"},
    shareContext: "Fairfax City School Board, Sep 29, 2025",
    moments: [
      { seconds: 434, label: "Early agenda business." },
      { seconds: 893, label: "Mid-meeting discussion." },
      { seconds: 1325, label: "Later agenda business." },
    ],
  },
  {
    slug: "fxc-2025-09-15-regular-school-board-meeting",
    meetingId: "fxc-4320",
    venue: "fairfax-city-schools",
    title: "City of Fairfax Regular School Board Meeting",
    dateLabel: "Monday, Sep 15, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 1h 32m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4320" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4320&doc_id=82c25ccd-94a7-11f0-8df7-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4320" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-09-15-regular-school-board-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-09-15-regular-school-board-meeting.txt", "pdfNote": "24 pages"},
    shareContext: "Fairfax City School Board, Sep 15, 2025",
    moments: [
      { seconds: 14, label: "Pledge of Allegiance." },
      { seconds: 1393, label: "Early agenda business." },
      { seconds: 2737, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2025-09-09-city-council-meeting",
    meetingId: "fxc-4310",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Sep 9, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 3h 17m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4310" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4310&doc_id=e9f1f1c6-8e47-11f0-a766-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4310" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-09-09-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-09-09-city-council-meeting.txt", "pdfNote": "49 pages"},
    shareContext: "Fairfax City City Council, Sep 9, 2025",
    moments: [
      { seconds: 16, label: "Pledge of Allegiance." },
      { seconds: 852, label: "Consent agenda motion." },
      { seconds: 2942, label: "Early agenda business." },
    ],
  },
  {
    slug: "fxc-2025-09-02-joint-school-board-and-city-council-work-session",
    meetingId: "fxc-4306",
    venue: "fairfax-city-schools",
    title: "City of Fairfax Joint School Board and City Council Work Session",
    dateLabel: "Tuesday, Sep 2, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 1h 59m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4306" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4306&doc_id=274f8cb4-89bc-11f0-a766-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4306" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-09-02-joint-school-board-and-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-09-02-joint-school-board-and-city-council-work-session.txt", "pdfNote": "30 pages"},
    shareContext: "Fairfax City School Board, Sep 2, 2025",
    moments: [
      { seconds: 1788, label: "Early agenda business." },
      { seconds: 3575, label: "Mid-meeting discussion." },
      { seconds: 7135, label: "Motion to enter closed session." },
    ],
  },
  {
    slug: "fxc-2025-09-02-city-council-special-meeting-work-session",
    meetingId: "fxc-4303",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Special Meeting/Work Session",
    dateLabel: "Tuesday, Sep 2, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 1h 59m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4303" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4303&doc_id=301038b1-88dd-11f0-a766-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4303" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-09-02-city-council-special-meeting-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-09-02-city-council-special-meeting-work-session.txt", "pdfNote": "30 pages"},
    shareContext: "Fairfax City City Council, Sep 2, 2025",
    moments: [
      { seconds: 1788, label: "Early agenda business." },
      { seconds: 3575, label: "Mid-meeting discussion." },
      { seconds: 7135, label: "Motion to enter closed session." },
    ],
  },
  {
    slug: "fxc-2025-08-04-school-board-special-meeting",
    meetingId: "fxc-4295",
    venue: "fairfax-city-schools",
    title: "City of Fairfax School Board Special Meeting",
    dateLabel: "Monday, Aug 4, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 0h 30m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4295" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4295&doc_id=f9951c90-72f7-11f0-a766-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4295" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-08-04-school-board-special-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-08-04-school-board-special-meeting.txt", "pdfNote": "8 pages"},
    shareContext: "Fairfax City School Board, Aug 4, 2025",
    moments: [
      { seconds: 14, label: "Pledge of Allegiance." },
      { seconds: 468, label: "Early agenda business." },
      { seconds: 917, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2025-07-22-city-council-meeting",
    meetingId: "fxc-4284",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jul 22, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 5h 15m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4284" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4284&doc_id=060bba47-67de-11f0-b7f5-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4284" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-07-22-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-07-22-city-council-meeting.txt", "pdfNote": "75 pages"},
    shareContext: "Fairfax City City Council, Jul 22, 2025",
    moments: [
      { seconds: 16, label: "Pledge of Allegiance." },
      { seconds: 630, label: "Consent agenda motion." },
      { seconds: 3304, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2025-07-08-city-council-meeting",
    meetingId: "fxc-4273",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jul 8, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 3h 50m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4273" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4273&doc_id=d784ce5b-5cf7-11f0-b7f5-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4273" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-07-08-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-07-08-city-council-meeting.txt", "pdfNote": "59 pages"},
    shareContext: "Fairfax City City Council, Jul 8, 2025",
    moments: [
      { seconds: 58, label: "Pledge of Allegiance." },
      { seconds: 310, label: "Consent agenda motion." },
      { seconds: 11464, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2025-07-01-regular-school-board-meeting",
    meetingId: "fxc-4272",
    venue: "fairfax-city-schools",
    title: "City of Fairfax Regular School Board Meeting",
    dateLabel: "Tuesday, Jul 1, 2025",
    whenWhere: "City of Fairfax School Board meeting · video 0h 14m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4272" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4272&doc_id=1f0b86cf-94a9-11f0-8df7-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4272" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-07-01-regular-school-board-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-schools/transcripts/coraggio-transcript-fairfax-city-schools-2025-07-01-regular-school-board-meeting.txt", "pdfNote": "5 pages"},
    shareContext: "Fairfax City School Board, Jul 1, 2025",
    moments: [
      { seconds: 3, label: "Pledge of Allegiance." },
      { seconds: 225, label: "Early agenda business." },
      { seconds: 446, label: "Mid-meeting discussion." },
    ],
  },
  {
    slug: "fxc-2025-07-01-city-council-work-session",
    meetingId: "fxc-4269",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Work Session",
    dateLabel: "Tuesday, Jul 1, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 3h 23m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4269" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4269&doc_id=c25d79b5-5811-11f0-b7f5-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4269" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-07-01-city-council-work-session.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-07-01-city-council-work-session.txt", "pdfNote": "53 pages"},
    shareContext: "Fairfax City City Council, Jul 1, 2025",
    moments: [
      { seconds: 49, label: "Meeting called to order." },
      { seconds: 3063, label: "Early agenda business." },
      { seconds: 12213, label: "Adjournment." },
    ],
  },
  {
    slug: "fxc-2025-06-24-city-council-meeting",
    meetingId: "fxc-4239",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jun 24, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 4h 7m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, 8:00 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4239" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4239&doc_id=de13f60f-51f1-11f0-b7f5-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4239" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-06-24-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-06-24-city-council-meeting.txt", "pdfNote": "59 pages"},
    shareContext: "Fairfax City City Council, Jun 24, 2025",
    moments: [
      { seconds: 12, label: "Pledge of Allegiance." },
      { seconds: 931, label: "Consent agenda motion." },
      { seconds: 2346, label: "Public comment / public hearing begins." },
    ],
  },
  {
    slug: "fxc-2025-06-10-city-council-meeting",
    meetingId: "fxc-4228",
    venue: "fairfax-city-council",
    title: "City of Fairfax City Council Meeting",
    dateLabel: "Tuesday, Jun 10, 2025",
    whenWhere: "City of Fairfax City Council meeting · video 4h 25m",
    official: {
      votesPosted: false,
      checkedLabel: "Oct 12, 2026, ~8:15 AM ET",
      note: "Official minutes are linked below. Vote tallies will be entered only from those minutes (not yet transcribed into this recap). Until then votesPosted stays false.",
      links: [
        { label: "Agenda (Granicus)", href: "https://fairfax.granicus.com/AgendaViewer.php?view_id=13&clip_id=4228" },
        { label: "Minutes (Granicus)", href: "https://fairfax.granicus.com/MinutesViewer.php?view_id=13&clip_id=4228&doc_id=db48222b-46e0-11f0-b7f5-005056a89546" },
        { label: "Meeting video (Granicus)", href: "https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id=4228" },
      ],
    },
    decisions: [
    ],
    context: [],
    agenda: [
    ],
    transcriptDownloads: {"pdfUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-06-10-city-council-meeting.pdf", "txtUrl": "/files/find-the-moment/fairfax-city-council/transcripts/coraggio-transcript-fairfax-city-council-2025-06-10-city-council-meeting.txt", "pdfNote": "56 pages"},
    shareContext: "Fairfax City City Council, Jun 10, 2025",
    moments: [
      { seconds: 65, label: "Pledge of Allegiance." },
      { seconds: 621, label: "Public comment on the George Snyder Trail." },
      { seconds: 12145, label: "Work session: purchasing resolution update." },
    ],
  },
];

/** Always sorted newest meeting first. */
export const CITY_RECAPS: CityRecap[] = sortRecapsNewestFirst(CITY_RECAPS_RAW);

export const CITY_RECAP_BY_SLUG: Record<string, CityRecap> = Object.fromEntries(
  CITY_RECAPS.map((r) => [r.slug, r]),
);

export const CITY_RECAP_BY_MEETING: Record<string, CityRecap> = Object.fromEntries(
  CITY_RECAPS.map((r) => [r.meetingId, r]),
);
