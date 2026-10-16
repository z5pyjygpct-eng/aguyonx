/** House / Senate v4 adapters (preview). Floor sessions + LIS-backed recaps, read-only. */
import { HOUSE_MEETINGS, HOUSE_RECAPS, DELEGATES, houseVideoUrl } from "@/content/va-house";
import { SENATE_MEETINGS, SENATE_RECAPS, SENATORS, senateVideoUrl } from "@/content/va-senate";
import type { V4Meeting, V4Recap } from "@/components/site/venue-v4";
import type { MemberData } from "@/lib/members-v4";

const kind = (t: string) => /joint/i.test(t) ? "Joint Assembly" : /special/i.test(t) ? "Special Session" : /reconven/i.test(t) ? "Reconvened" : /pro forma/i.test(t) ? "Pro forma" : "Floor session";
const recapTitle = (r: { billCount: number; rollCallCount: number; sessions: string[] }) =>
  `${r.sessions.join(" · ") || "Floor session"} — ${r.rollCallCount} roll calls, ${r.billCount} bills`;

export const HOUSE_V4_MEETINGS: V4Meeting[] = HOUSE_MEETINGS.map((m) => ({ id: m.id, dateLabel: m.dateLabel, title: m.title, kind: kind(m.title), duration: m.duration, href: houseVideoUrl(m), host: "YouTube", thumb: `/thumbs/va-house-floor/${m.id}.webp` }));
export const SENATE_V4_MEETINGS: V4Meeting[] = SENATE_MEETINGS.map((m) => ({ id: m.id, dateLabel: m.dateLabel, title: m.title, kind: kind(m.title), duration: m.duration, href: senateVideoUrl(m), host: "YouTube", thumb: `/thumbs/va-senate-floor/${m.id}.webp` }));
export const HOUSE_V4_RECAPS: V4Recap[] = HOUSE_RECAPS.map((r) => ({ slug: r.slug, dateLabel: r.dateLabel, title: recapTitle(r), kind: kind(r.sessions.join(" ")), votesPosted: r.votesUrl ? true : null, to: "/general-assembly/house/recaps/$slug", params: { slug: r.slug } }));
export const SENATE_V4_RECAPS: V4Recap[] = SENATE_RECAPS.map((r) => ({ slug: r.slug, dateLabel: r.dateLabel, title: recapTitle(r), kind: kind(r.sessions.join(" ")), votesPosted: r.votesUrl ? true : null, to: "/general-assembly/senate/recaps/$slug", params: { slug: r.slug } }));

const roster = (list: { name: string; district: number; party: string; lisId: string }[], role: string): MemberData[] =>
  list.map((d) => ({ name: d.name, district: `District ${d.district}`, role, party: d.party, id: d.lisId, surname: d.name.split(/\s+/).pop()!, counted: 0, present: 0, attendance: null, motions: [], meetings: [] }));
export const HOUSE_V4_MEMBERS = roster(DELEGATES, "Delegate");
export const SENATE_V4_MEMBERS = roster(SENATORS, "Senator");
