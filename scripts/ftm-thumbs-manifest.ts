/**
 * Find the Moment thumbnail manifest. Run: npx tsx scripts/ftm-thumbs-manifest.ts > /tmp/ftm-thumbs.json
 * One entry per meeting video card across all live FTM venues. Text comes ONLY from the official
 * record already on the site (recap decisions from Action Reports / minutes / LIS roll calls),
 * or data/ftm-thumb-overrides.json (hand-written, same rule). No record -> name + date only.
 * Consumed by scripts/ftm-thumbs.py (renders public/thumbs/<venue>/<id>.webp).
 */
import fs from "node:fs";
import { LOUDOUN_MEETINGS } from "../src/content/loudoun";
import { LOUDOUN_RECAPS } from "../src/content/loudoun-recaps";
import { LCPS_MEETINGS } from "../src/content/lcps";
import { CITY_MEETINGS } from "../src/content/cities-meetings";
import { CITY_RECAPS } from "../src/content/city-recaps";
import { HOUSE_MEETINGS, HOUSE_RECAPS } from "../src/content/va-house";
import { SENATE_MEETINGS, SENATE_RECAPS } from "../src/content/va-senate";
import { VBOE_MEETINGS } from "../src/content/va-boe";

const OVR = JSON.parse(fs.readFileSync("data/ftm-thumb-overrides.json", "utf8"));
const LIVE_CITY = ["fairfax-city-council", "fairfax-city-schools", "albemarle-schools", "albemarle-bos", "manassas-council", "manassas-schools"];
const SKIP = /consent agenda|on consent|Suspend the Rules|Reconsider|minutes|agenda approved|approval of the agenda|adopt(ed)? the agenda|Proclamation|Resolution to Recognize|appointment|nomination|Rules of Order|postponed|adjourn|closed session|Administrative Items|remote participation|adoption of the agenda|agenda adoption|electronic participation|call to order|meeting opening/i;

type Entry = { venue: string; id: string; date: string; type: string; headline?: string; result?: string; duration: string; source?: string; youtubeId?: string; vimeoId?: string; out: string };

/** Shorten an official action sentence to a thumbnail headline (no new facts, just trimming). */
function shorten(action: string, keepDots = false): string {
  let t = action.replace(/^(Passed|Failed|Approved|Adopted):\s*/i, "").replace(/^[^:]{3,80}:\s*(Passed|Failed):\s*/i, "");
  t = t.replace(/^(Motion to|Board directed staff to|Direct(ed)? staff to|Approve|Adopt|Authorize|Forward)\s+(the\s+)?/i, "");
  t = t.split(keepDots ? /\s[(\[]|[,;:]\s|\s—\s|\s–\s/ : /\s[(\[]|[,;:]\s|\s—\s|\s–\s|\.\s/)[0];
  const words = t.split(/\s+/);
  let out = "";
  for (const w of words) { if ((out + " " + w).trim().length > 34) break; out = (out + " " + w).trim(); }
  for (let i = 0; i < 3; i++) out = out.replace(/\s+(of|the|and|to|for|a|an|in|on|with|at|by|that|from|be|is)$/i, "").trim();
  if (/^(Resolution|Ordinance|An ordinance|Request|Resolution requesting)$/i.test(out)) return "";
  if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(out) && !/\b(Plan|Budget|Program|Policy|Code|Contract|Tax|Park|Road|School|Board)\b/.test(out)) return ""; // bare person name (appointment)
  return out ? out[0].toUpperCase() + out.slice(1) : "";
}
function resultOf(d: { action: string; tally?: string }): string {
  const tally = d.tally?.match(/^\d+(-\d+){1,3}/)?.[0] ?? (/^unanimous/i.test(d.tally ?? "") ? "unanimous" : undefined);
  const verb0 = /^Failed|\bfailed\b|died for lack|tabled/i.test(d.action) ? (/tabled/i.test(d.action) ? "tabled" : "failed")
    : /deferred/i.test(d.action) ? "deferred" : /denied|Deny/i.test(d.action) ? "denied" : tally ? "passed" : "";
  const verb = tally === "unanimous" && verb0 === "passed" ? "approved" : verb0;
  return [verb, tally].filter(Boolean).join(" ");
}
function topDecision(decisions: { action: string; tally?: string; item?: string }[] | undefined, agenda?: any[]) {
  // Agenda titles (official agenda) keyed by item number, used as the headline when present.
  const titles: Record<string, string> = {};
  for (const a of agenda ?? []) {
    const hm = String(a.heading ?? "").match(/^(\d+)\.\s*(.+)$/);
    if (hm) titles[hm[1]] = hm[2];
    for (const it of a.items ?? []) if (it.num) titles[it.num] = it.title;
  }
  const title = (d: any) => (d.item ? titles[d.item] ?? titles[String(d.item).split(".")[0]] : undefined);
  const ds = (decisions ?? []).filter((d) => !SKIP.test(d.action) && !SKIP.test(title(d) ?? ""));
  const split = (d: any) => /^\d+-[1-9]/.test(d.tally ?? "");
  const d = ds.find(split) ?? ds.find((x) => x.tally) ?? ds[0];
  if (!d) return {};
  const t = title(d);
  const headline = t ? shorten(t.replace(/^(Public hearing and Council action on a request from|Public hearing and Council action on|Presentation of|Public hearing (on|for)|Consideration (of|on)|Request for|Approval of)\s+(?:(?:a|an|the)\s+)?/i, "")) : shorten(d.action);
  return headline.length >= 6 ? { headline, result: resultOf(d) } : {};
}
const ovr = (venue: string, id: string) => OVR[venue]?.[id];
const entries: Entry[] = [];
const push = (e: Omit<Entry, "out">) => {
  const o = ovr(e.venue, e.id);
  entries.push({ ...e, ...(o ? { headline: o.headline, result: o.result } : {}), out: `public/thumbs/${e.venue}/${e.id}.webp` });
};

// Loudoun BOS
const lr = Object.fromEntries(LOUDOUN_RECAPS.map((r) => [r.meetingId, r]));
for (const m of LOUDOUN_MEETINGS) push({ venue: "loudoun-bos", id: m.id, date: m.dateLabel, type: m.title.replace(/^Loudoun BOS /, "").replace(/\s*\(.*\)$/, "").replace(/^Business$/, "Business Meeting"), duration: m.duration, source: m.videoUrl ?? (m.clipId ? `granicus-loudoun:${m.clipId}` : undefined), ...topDecision(lr[m.id]?.decisions) });

// Loudoun County Public Schools (Vimeo / LCPS-TV)
for (const m of LCPS_MEETINGS as any[]) push({ venue: "loudoun-lcps", id: m.id, date: m.dateLabel, type: m.title.replace(/\s*\(.*\)$/, ""), duration: m.duration, vimeoId: m.vimeoId, ...topDecision(lr[m.id]?.decisions, lr[m.id]?.agenda) });

// City venues (Fairfax City council + schools, Albemarle schools + BOS)
const cr = Object.fromEntries(CITY_RECAPS.map((r) => [r.meetingId, r]));
for (const m of CITY_MEETINGS.filter((x) => LIVE_CITY.includes(x.venue))) {
  const yt = m.provider === "youtube" ? m.playerUrl.match(/[?&]v=([\w-]{11})/)?.[1] : undefined;
  const type = m.title.replace(/^(City of Fairfax|Fairfax City|Albemarle County|City of Fairfax Schools)\s*/i, "").replace(/\s*\(.*\)$/, "");
  push({ venue: m.venue, id: m.id, date: m.dateLabel, type, duration: m.duration, youtubeId: yt, source: yt ? undefined : m.playerUrl, ...topDecision(cr[m.id]?.decisions, cr[m.id]?.agenda) });
}

// General Assembly floor (top bill from that day's LIS roll calls)
function lisTop(votesUrl: string | null | undefined) {
  if (!votesUrl) return {};
  try {
    const j = JSON.parse(fs.readFileSync(`public${votesUrl}`, "utf8"));
    const all = j.rollCalls?.flatMap((r: any) => r.bills ?? []) ?? [];
    const b = all.find((x: any) => /^(HB|SB)/.test(x.bill)) ?? all[0];
    if (!b) return {};
    const tally = b.action.match(/\((\d+)-Y (\d+)-N/);
    const head = shorten(`${b.bill} ${b.title.split(/;/)[0].replace(/\.$/, "")}`, true);
    const verb = /fail|defeat|rejected/i.test(b.action) ? "failed" : /passed|agreed to/i.test(b.action) ? "passed" : "vote";
    return { headline: head, result: tally ? `${verb} ${tally[1]}-${tally[2]}` : undefined };
  } catch { return {}; }
}
const byMeeting = (recaps: any[]) => Object.fromEntries(recaps.flatMap((r) => r.meetingIds.map((id: string) => [id, r])));
const hr = byMeeting(HOUSE_RECAPS), sr = byMeeting(SENATE_RECAPS);
for (const m of HOUSE_MEETINGS) push({ venue: "va-house-floor", id: m.id, date: m.dateLabel, type: `House · ${m.title}`, duration: m.duration, youtubeId: m.youtubeId, ...lisTop(hr[m.id]?.votesUrl) });
for (const m of SENATE_MEETINGS) push({ venue: "va-senate-floor", id: m.id, date: m.dateLabel, type: `Senate · ${m.title.replace(/^Senate /, "")}`, duration: m.duration, youtubeId: m.youtubeId, ...lisTop(sr[m.id]?.votesUrl) });

// Virginia Board of Education (no official-record recaps yet -> name + date)
for (const m of VBOE_MEETINGS) push({ venue: "va-boe", id: m.id, date: m.dateLabel, type: `Board of Ed · ${m.title.replace(/\s*\(.*\)$/, "")}`, duration: m.duration, youtubeId: m.youtubeId });

process.stdout.write(JSON.stringify(entries, null, 1));
