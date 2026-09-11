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
    featuredOnHome: true,
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
