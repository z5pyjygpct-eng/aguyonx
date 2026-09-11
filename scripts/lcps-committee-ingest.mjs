/**
 * Ingest LCPS committee / closed / appeals VTTs → Find the Moment windows.
 *
 * Reads targets from /workspace/lcps-committee-targets.json
 * Saves VTT to /tmp/lcps-vtt/{id}.vtt
 * Emits public/files/find-the-moment/loudoun-lcps/{id}.json
 * Writes progress to /workspace/lcps-committee-ingest-meta.json
 *
 * Usage: node scripts/lcps-committee-ingest.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/files/find-the-moment/loudoun-lcps");
const vttDir = process.env.LCPS_VTT_DIR || "/tmp/lcps-vtt";
const targetsPath =
  process.env.LCPS_TARGETS || "/workspace/lcps-committee-targets.json";
const metaPath =
  process.env.LCPS_META || "/workspace/lcps-committee-ingest-meta.json";
const sleepMs = Number(process.env.LCPS_SLEEP_MS || 400);

const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(vttDir, { recursive: true });

let meta = [];
if (fs.existsSync(metaPath)) {
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch {
    meta = [];
  }
}
const metaById = new Map(meta.map((m) => [m.vimeoId, m]));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseVtt(text) {
  const cues = [];
  const re =
    /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*\n([\s\S]*?)(?=\n\n|\n\d{2}:|\Z)/gm;
  const ts = (h, m, s, ms) => +h * 3600 + +m * 60 + +s + +ms / 1000;
  let match;
  while ((match = re.exec(text)) !== null) {
    const start = ts(match[1], match[2], match[3], match[4]);
    const end = ts(match[5], match[6], match[7], match[8]);
    let body = match[9].trim().replace(/^>>\s*/gm, "");
    body = body.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
    if (body) cues.push({ start, end, text: body });
  }
  return cues;
}

function windowize(cues, target = 30, gapForce = 8) {
  if (!cues.length) return [];
  const out = [];
  let start = cues[0].start;
  let end = cues[0].end;
  let parts = [cues[0].text];
  for (let i = 1; i < cues.length; i++) {
    const c = cues[i];
    const gap = c.start - end;
    const dur = end - start;
    const newDur = c.end - start;
    if ((gap >= gapForce && dur >= 2) || (newDur > target && dur >= 18)) {
      out.push({
        start: Math.round(start * 10) / 10,
        end: Math.round(end * 10) / 10,
        text: parts.join(" "),
      });
      start = c.start;
      end = c.end;
      parts = [c.text];
      continue;
    }
    parts.push(c.text);
    end = c.end;
  }
  out.push({
    start: Math.round(start * 10) / 10,
    end: Math.round(end * 10) / 10,
    text: parts.join(" "),
  });
  return out;
}

function fmtDuration(sec) {
  if (!sec || sec < 0) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return m ? `${h}h ${m}m` : `${h}h`;
  return `${Math.max(1, m)}m`;
}

function saveMeta() {
  const list = [...metaById.values()].sort((a, b) =>
    (b.date || "").localeCompare(a.date || ""),
  );
  fs.writeFileSync(metaPath, JSON.stringify(list, null, 2));
}

async function fetchConfig(vimeoId) {
  const url = `https://player.vimeo.com/video/${vimeoId}/config`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; aguyonx-ftm/1.0)" },
  });
  if (!res.ok) throw new Error(`config HTTP ${res.status}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; aguyonx-ftm/1.0)" },
  });
  if (!res.ok) throw new Error(`vtt HTTP ${res.status}`);
  return res.text();
}

let ok = 0;
let noCaptions = 0;
let failed = 0;
let skipped = 0;

for (let i = 0; i < targets.length; i++) {
  const t = targets[i];
  const id = t.vimeoId;
  const outPath = path.join(outDir, `${id}.json`);
  const vttPath = path.join(vttDir, `${id}.vtt`);
  const prev = metaById.get(id);

  if (prev?.ok && fs.existsSync(outPath)) {
    skipped += 1;
    continue;
  }
  // Resume: if windows exist from prior partial run, record and skip fetch
  if (fs.existsSync(outPath) && fs.existsSync(vttPath) && !prev?.ok) {
    const wins = JSON.parse(fs.readFileSync(outPath, "utf8"));
    metaById.set(id, {
      ...t,
      ok: true,
      durationSec: prev?.durationSec,
      duration: prev?.duration || "",
      vttBytes: fs.statSync(vttPath).size,
      windowCount: wins.length,
      captionLang: prev?.captionLang || "",
    });
    ok += 1;
    if (ok % 10 === 0) saveMeta();
    continue;
  }

  process.stdout.write(`[${i + 1}/${targets.length}] ${id} ${t.date} ${t.kind}… `);

  try {
    const config = await fetchConfig(id);
    const durationSec = config?.video?.duration || 0;
    const tracks = config?.request?.text_tracks || [];
    const track =
      tracks.find((x) => x.lang === "en-US") ||
      tracks.find((x) => (x.lang || "").startsWith("en")) ||
      tracks[0];

    if (!track?.url) {
      console.log("NO_CAPTIONS");
      metaById.set(id, {
        ...t,
        ok: false,
        reason: "no_captions",
        durationSec,
        duration: fmtDuration(durationSec),
        windowCount: 0,
      });
      noCaptions += 1;
      saveMeta();
      await sleep(sleepMs);
      continue;
    }

    let vtt;
    if (fs.existsSync(vttPath) && fs.statSync(vttPath).size > 50) {
      vtt = fs.readFileSync(vttPath, "utf8");
    } else {
      // track.url may be protocol-relative
      const vttUrl = track.url.startsWith("//")
        ? `https:${track.url}`
        : track.url;
      vtt = await fetchText(vttUrl);
      fs.writeFileSync(vttPath, vtt);
    }

    const cues = parseVtt(vtt);
    const wins = windowize(cues);
    fs.writeFileSync(outPath, JSON.stringify(wins));

    metaById.set(id, {
      ...t,
      ok: true,
      durationSec,
      duration: fmtDuration(durationSec),
      vttBytes: Buffer.byteLength(vtt),
      captionLang: track.lang || "",
      windowCount: wins.length,
    });
    console.log(`ok windows=${wins.length} dur=${fmtDuration(durationSec)}`);
    ok += 1;
  } catch (err) {
    console.log(`FAIL ${err.message || err}`);
    metaById.set(id, {
      ...t,
      ok: false,
      reason: String(err.message || err),
      windowCount: 0,
    });
    failed += 1;
  }

  if ((ok + noCaptions + failed) % 5 === 0) saveMeta();
  await sleep(sleepMs);
}

saveMeta();
console.log("\n=== DONE ===");
console.log({ ok, noCaptions, failed, skipped, total: targets.length });
