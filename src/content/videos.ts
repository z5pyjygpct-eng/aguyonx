export type SiteVideo = {
  id: string;
  /** Outlet / publish-related date YYYY-MM-DD */
  date: string;
  title: string;
  byline: string;
  /** Public path under /videos/ */
  src: string;
  poster?: string;
  dek: string;
  /** Optional outbound source */
  sourceLabel?: string;
  sourceUrl?: string;
  /** Keep on home beside FTM */
  featuredOnHome?: boolean;
};

export const VIDEOS_DEK =
  "Short proof cuts from the public record and local reporting. Captions and clips are an index — watch the source.";

/** Newest first. */
export const VIDEOS: SiteVideo[] = [
  {
    id: "aguyonx-va-constitution-conflicts-2026-10-27",
    date: "2026-10-27",
    title: "2026 Democratic Agenda: Conflicts with the Virginia Constitution",
    byline: "",
    src: "/videos/aguyonx-va-constitution-conflicts-2026-10-27.mp4",
    poster: "/images/aguyonx-va-constitution-conflicts-2026-10-27-poster2.jpg",
    dek: "What the investigation finds about the 2026 agenda's conflicts with the Virginia Constitution, and why they matter.",
    sourceLabel: "Read the full investigation",
    sourceUrl: "/files/investigations/2026-dem-va-constitution-conflicts.pdf",
  },
  {
    id: "aguyonx-ga-members-walkthrough-2026-10-27",
    date: "2026-10-27",
    title: "How to look up your legislators",
    byline: "",
    src: "/videos/aguyonx-ga-members-walkthrough-2026-10-27.mp4",
    poster: "/images/aguyonx-ga-members-walkthrough-2026-10-27-poster.jpg",
    dek: "A walkthrough of finding a delegate or senator from the House and Senate members pages on aguyonx.com. Bills, financials and scorecards for every member are coming soon.",
  },
  {
    id: "aguyonx-features-tour-2026-10-27",
    date: "2026-10-27",
    title: "More than Find the Moment: a tour of aguyonx.com",
    byline: "",
    src: "/videos/aguyonx-features-tour-2026-10-27.mp4",
    poster: "/images/aguyonx-features-tour-2026-10-27-poster.jpg",
    dek: "A quick tour of News, Articles, Investigations, the FOIA desk, Videos and the Research Library.",
  },
  {
    id: "aguyonx-mission-2026-10-27",
    date: "2026-10-27",
    title: "All in one place",
    byline: "",
    src: "/videos/aguyonx-mission-2026-10-27.mp4",
    poster: "/images/aguyonx-mission-2026-10-27-poster.jpg",
    dek: "Virginia's public record is scattered across many sites. aguyonx.com brings meetings, dashboards and official sources together in one place.",
  },
  {
    id: "aguyonx-fairfax-pw-announce-2026-10-27",
    date: "2026-10-27",
    title: "Fairfax & Prince William County are coming to aguyonx.com",
    byline: "",
    src: "/videos/aguyonx-fairfax-pw-announce-2026-10-27.mp4",
    poster: "/images/aguyonx-fairfax-pw-announce-2026-10-27-poster.jpg",
    dek: "Fairfax County and Prince William County dashboards are now on aguyonx.com.",
  },
  {
    id: "aguyonx-story-2026-10-27",
    date: "2026-10-27",
    title: "Why aguyonx.com? Dale's Story",
    byline: "",
    src: "/videos/aguyonx-story-2026-10-27.mp4",
    poster: "/images/aguyonx-story-2026-10-27-poster.jpg",
    dek: "About a minute on why this site exists: the public record, made easy to find.",
  },
  {
    id: "vdoe-911-rewrite-proof",
    date: "2026-09-02",
    title:
      "Virginia Public School Rewrite of 9/11: The Hijackers Weren't Terrorists",
    byline: "by: Virginia Democrats",
    src: "/videos/vdoe-911-rewrite-proof.mp4",
    poster: "/images/vdoe-911-rewrite-poster.jpg",
    dek: "Proof cuts from the VDOE teacher training webinar on culturally responsive 9/11 commemorations.",
    sourceLabel: "Restoration News",
    sourceUrl:
      "https://restoration-news.com/the-public-school-rewrite-of-9-11-the-hijackers-weren-t-terrorists",
  },
  {
    id: "lcps-public-comment-once-a-month",
    date: "2025-07-15",
    title: "Once a Month: Loudoun School Board Moves to Limit Public Comment",
    byline: "",
    src: "/videos/lcps-public-comment-once-a-month.mp4",
    poster: "/images/lcps-public-comment-once-a-month-poster.jpg",
    dek: "School Board member Anne Donohue on cutting public-comment nights from two a month to one (WJLA).",
    sourceLabel: "WJLA",
    sourceUrl:
      "https://wjla.com/news/local/loudoun-school-parents-board-student-public-comment-virginia-meeting-limit-policy-members-county-locker-room-gang-ms13-assault-teen-budget",
  },
];
