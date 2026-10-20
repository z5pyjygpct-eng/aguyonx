// Site search ↔ Find the Moment: build a sharded word index over every FTM transcript.
// node tools/search-ftm/build.mjs → public/files/search/ftm/{meta.json, s/<xx>.json}  (git-ignored, rebuilt each build)
// Reads only repo data (FTM_TRANSCRIPTS + the venue meeting catalogs + transcript window files). Nothing invented.
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const OUT = path.join(root, "public/files/search/ftm");
const t0 = Date.now();
const vite = await createServer({ root, configFile: false, logLevel: "error", resolve: { alias: { "@": path.join(root, "src") } }, server: { middlewareMode: true, hmr: false }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] } });
const L = (m) => vite.ssrLoadModule(m);
const { FTM_TRANSCRIPTS } = await L("/src/content/ftm-transcripts.ts");
const lou = await L("/src/content/loudoun.ts");
const lcps = await L("/src/content/lcps.ts");
const city = await L("/src/content/cities.ts");
const { CITY_MEETINGS } = await L("/src/content/cities-meetings.ts");
const house = await L("/src/content/va-house.ts");
const senate = await L("/src/content/va-senate.ts");
await vite.close();

const S = 987654321; // sentinel seconds → "{s}" template
const tpl = (u) => (u && u.includes(String(S)) ? u.replace(String(S), "{s}") : null);
const by = (list) => new Map(list.map((m) => [m.id, m]));
const CAT = {
  "loudoun-bos": [by(lou.LOUDOUN_MEETINGS), (m) => lou.loudounMeetingJumpUrl(m, S), "Loudoun Board of Supervisors", "/dashboards/loudoun/bos/find-the-moment"],
  "loudoun-lcps": [by(lcps.LCPS_MEETINGS), (m) => lcps.lcpsJumpUrl(m.vimeoId, S), "Loudoun School Board", "/dashboards/loudoun/schools/find-the-moment"],
  "va-house-floor": [by(house.HOUSE_MEETINGS), (m) => house.houseJumpUrl(m, S), "House of Delegates floor", "/dashboards/house/find-the-moment"],
  "va-senate-floor": [by(senate.SENATE_MEETINGS), (m) => senate.senateJumpUrl(m, S), "Senate floor", "/dashboards/senate/find-the-moment"],
};
const CITY_LABEL = { "fairfax-city-council": ["City of Fairfax City Council", "/dashboards/fairfax-city/council/find-the-moment"], "fairfax-city-schools": ["City of Fairfax Schools", "/dashboards/fairfax-city/schools/find-the-moment"], "manassas-council": ["Manassas City Council", "/dashboards/manassas/council/find-the-moment"], "manassas-schools": ["Manassas City Schools", "/dashboards/manassas/schools/find-the-moment"], "albemarle-bos": ["Albemarle Board of Supervisors", "/dashboards/albemarle/bos/find-the-moment"], "albemarle-schools": ["Albemarle School Board", "/dashboards/albemarle/schools/find-the-moment"] };
const cityBy = by(CITY_MEETINGS);
for (const [v, [label, page]] of Object.entries(CITY_LABEL)) CAT[v] = [cityBy, (m) => city.cityJumpUrl(m, S), label, page];

const venues = Object.keys(CAT);
const STOP = new Set("the and for that this with you are was have not but they all can our from his her its she him had has were will would there their what when who which about into been one out just also them then than your yes okay thank thanks very well know like going get got need want said say see did does here how why way may any some more most much now only other over such these those through too two three four five six seven eight nine ten use used make made let lets yeah uh um mrs mr ms".split(" "));
const fold = (s) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
const meta = []; // [venueIdx, dateLabel, title, jumpTpl|null, windowsUrl, windowCount]
const index = new Map(); // token → Map(meetingIdx → windowIdx[])
const skipped = {};
let bytesIn = 0;
for (const t of FTM_TRANSCRIPTS) {
  const c = CAT[t.venue];
  const file = path.join(root, "public", t.url);
  if (!c || !fs.existsSync(file)) { skipped[t.venue] = (skipped[t.venue] ?? 0) + 1; continue; }
  const m = c[0].get(t.meetingId);
  if (!m) { skipped[`${t.venue} (no catalog row)`] = (skipped[`${t.venue} (no catalog row)`] ?? 0) + 1; continue; }
  const raw = fs.readFileSync(file, "utf8"); bytesIn += raw.length;
  const wins = JSON.parse(raw);
  let j = null; try { j = tpl(c[1](m)); } catch {}
  const mi = meta.length;
  meta.push([venues.indexOf(t.venue), m.dateLabel, m.title, j, t.url, wins.length]);
  wins.forEach((w, wi) => {
    const seen = new Set();
    for (const tok of fold(w.text).split(/[^a-z0-9]+/)) {
      if (tok.length < 3 || STOP.has(tok) || seen.has(tok)) continue;
      seen.add(tok);
      let pm = index.get(tok); if (!pm) index.set(tok, (pm = new Map()));
      let arr = pm.get(mi); if (!arr) pm.set(mi, (arr = []));
      arr.push(wi);
    }
  });
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "s"), { recursive: true });
const enc = (pm) => [...pm].map(([mi, ws]) => [mi, ...ws.map((w, i) => (i ? w - ws[i - 1] : w))]);
// 2-letter shards; any shard over SPLIT bytes is split into 3-letter shards (keeps file count and per-query payload small).
const SPLIT = 250_000;
const two = new Map();
for (const [tok, pm] of index) { const k = tok.slice(0, 2); (two.get(k) ?? two.set(k, []).get(k)).push([tok, pm]); }
const files = new Map(); const split = [];
for (const [k, list] of two) {
  const whole = JSON.stringify(Object.fromEntries(list.map(([t, pm]) => [t, enc(pm)])));
  if (whole.length <= SPLIT) { files.set(k, whole); continue; }
  split.push(k);
  const three = new Map();
  for (const [t, pm] of list) { const k3 = t.slice(0, 3); (three.get(k3) ?? three.set(k3, {}).get(k3))[t] = enc(pm); }
  for (const [k3, o] of three) files.set(k3, JSON.stringify(o));
}
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify({ v: 1, split, venues: venues.map((v) => ({ id: v, label: CAT[v][2], page: CAT[v][3] })), m: meta }));
let outBytes = 0, biggest = 0;
for (const [k, b] of files) { outBytes += b.length; biggest = Math.max(biggest, b.length); fs.writeFileSync(path.join(OUT, "s", `${k}.json`), b); }
const shards = files;
console.log(JSON.stringify({ meetings: meta.length, tokens: index.size, shards: shards.size, inMB: +(bytesIn / 1e6).toFixed(1), outMB: +(outBytes / 1e6).toFixed(1), biggestShardKB: Math.round(biggest / 1e3), metaKB: Math.round(fs.statSync(path.join(OUT, "meta.json")).size / 1e3), skipped, ms: Date.now() - t0 }));
