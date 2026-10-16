import type { LoudounRecap } from "@/content/loudoun-recaps";

export type Vote = "Yes" | "No" | "Absent" | "Abstain";
export type MemberInput = { name: string; district: string; role: string; party?: string };
export type MotionRow = { date: string; ts: number; action: string; tally: string; vote: Vote; recapSlug: string; jump?: string };
export type MeetingAtt = { date: string; ts: number; title: string; present: boolean; recapSlug: string };
export type MemberData = MemberInput & {
  id: string; surname: string;
  counted: number; present: number; attendance: number | null;
  motions: MotionRow[]; meetings: MeetingAtt[];
};

const surnameOf = (n: string) => n.replace(/^Dr\.\s+/, "").split(/\s+/).pop()!.replace(/[.,]/g, "");

/** Read one member's vote from an official tally string. null = tally doesn't tell us. */
export function voteFromTally(tally: string, surname: string, bosStyle: boolean): Vote | null {
  const inner = tally.match(/\(([^)]*)\)/)?.[1] ?? "";
  const re = new RegExp(`\\b${surname}\\b`);
  for (const seg of inner.split(";")) {
    if (!re.test(seg)) continue;
    const s = seg.toLowerCase();
    if (/opposed/.test(s)) return "No";
    if (/absent|not present/.test(s)) return "Absent";
    if (/abstain/.test(s)) return "Abstain";
    if (/approved/.test(s)) return "Yes";
  }
  // BOS tallies only name exceptions; anyone unnamed voted with the majority.
  if (bosStyle && /^\d+-\d+/.test(tally) && !/Approved:/.test(tally)) return "Yes";
  return null;
}

export function buildMembers(
  roster: MemberInput[], recaps: LoudounRecap[], venue: "loudoun-bos" | "loudoun-lcps",
  parseDate: (s: string) => number, jumpFor: (r: LoudounRecap, seconds: number) => string | undefined,
  now = Date.now(),
): MemberData[] {
  const since = now - 365 * 864e5;
  const mine = recaps.filter((r) => (r.venue ?? "loudoun-bos") === venue);
  return roster.map((m) => {
    const surname = surnameOf(m.name);
    const motions: MotionRow[] = []; const meetings: MeetingAtt[] = [];
    let counted = 0, present = 0;
    for (const r of mine) {
      const ts = parseDate(r.dateLabel); let any = false, here = false;
      for (const d of r.decisions) {
        if (!d.tally) continue;
        const v = voteFromTally(d.tally, surname, venue === "loudoun-bos");
        if (!v) continue;
        any = true; if (v !== "Absent") here = true;
        if (ts >= since) { counted++; if (v !== "Absent") present++; }
        const mo = r.moments.find((x) => x.item && x.item === d.item);
        motions.push({ date: r.dateLabel, ts, action: d.action, tally: d.tally, vote: v, recapSlug: r.slug, jump: mo ? jumpFor(r, mo.seconds) : undefined });
      }
      if (any) meetings.push({ date: r.dateLabel, ts, title: r.title, present: here, recapSlug: r.slug });
    }
    motions.sort((a, b) => b.ts - a.ts); meetings.sort((a, b) => b.ts - a.ts);
    return { ...m, id: surname.toLowerCase(), surname, counted, present, attendance: counted ? (present / counted) * 100 : null, motions, meetings };
  });
}
