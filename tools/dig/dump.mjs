// Dumps the site content modules this page draws on into tools/dig/.content.json (intermediate, not committed).
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "../..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(ROOT, "src") } });
const L = await jiti.import(path.join(ROOT, "src/content/loudoun.ts"));
const C = await jiti.import(path.join(ROOT, "src/content/lcps.ts"));
const R = await jiti.import(path.join(ROOT, "src/content/loudoun-recaps.ts"));
const T = await jiti.import(path.join(ROOT, "src/content/ftm-transcripts.ts"));
const N = await jiti.import(path.join(ROOT, "src/content/news.ts"));
const NL = await jiti.import(path.join(ROOT, "src/lib/news-locations.ts"));
const H = await jiti.import(path.join(ROOT, "src/content/va-house.ts"));
const S = await jiti.import(path.join(ROOT, "src/content/va-senate.ts"));
const out = {
  bos: L.LOUDOUN_MEETINGS, bosMembers: L.LOUDOUN_BOS, bosDoors: L.LOUDOUN_OFFICIAL_DOORS,
  lcps: C.LCPS_MEETINGS, lcpsMembers: C.LCPS_SCHOOL_BOARD, lcpsDoors: C.LCPS_OFFICIAL_DOORS,
  recaps: R.LOUDOUN_RECAPS,
  transcripts: T.FTM_TRANSCRIPTS.map((t) => ({ meetingId: t.meetingId, venue: t.venue })),
  news: N.NEWS.map((n) => ({ ...n, loc: NL.newsLocations(n) })),
  houseTranscripts: H.houseTranscriptCount?.(), senateTranscripts: S.senateTranscriptCount?.(),
};
fs.writeFileSync(path.join(ROOT, "tools/dig/.content.json"), JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Array.isArray(v) ? v.length : v])));
