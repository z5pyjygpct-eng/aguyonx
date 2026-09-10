/**
 * Build per-meeting Find the Moment caption files for Loudoun BOS.
 *
 * Usage: node scripts/loudoun-caption-windows.mjs
 * Expects /tmp/loudoun-vtt/{clipId}.vtt (or set LOUDOUN_VTT_DIR).
 *
 * eScribe (non-numeric keys), e.g. Sep 1 2026 Business:
 *   curl -o /tmp/loudoun-vtt/escribe-929244b6.vtt \
 *     'https://video.isilive.ca/loudouncty/83-Board-of-Supervisors-Business-Meeting-2026-9-1-19-51.mp4.vtt'
 *   LOUDOUN_ESCRIBE_ONLY=1 node scripts/loudoun-caption-windows.mjs
 *   # or LOUDOUN_ESCRIBE_KEYS=escribe-929244b6
 *
 * Emits:
 *   public/files/find-the-moment/loudoun-bos/{clipId|escribe-slug}.json
 *     — array of {start,end,text} only (no meeting id; saves bytes)
 *   stdout summary with windowCount (paste into src/content/loudoun.ts)
 *
 * Does NOT bake a multi-MB JSON into src/content (Hobby-safe lazy load).
 * Optional shop source: set LOUDOUN_SHOP_JSON to also write a combined archive
 * for offline re-split (not imported by the client).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/files/find-the-moment/loudoun-bos");
const vttDir = process.env.LOUDOUN_VTT_DIR || "/tmp/loudoun-vtt";
const shopJson = process.env.LOUDOUN_SHOP_JSON || "";
/** Prior single-meeting POC windows (clip 8178) if regenerating from VTTs. */
const legacyShop = path.join(root, "src/content/loudoun-caption-windows.json");

const MEETINGS = [
  8216, 8214, 8213, 8208, 8199, 8198, 8191, 8185, 8179, 8178, 8174, 8173, 8161,
  8158, 8154, 8143, 8139, 8138, 8135, 8134, 8130, 8129, 8128, 8127, 8126, 8120,
  8113, 8112, 8107, 8096, 8093, 8085, 8077, 8074, 8070, 8066, 8060, 8057, 8042,
  8041, 8034, 8024, 8015, 8008, 7984, 7980, 7977, 7968, 7963, 7960, 7952, 7948,
  7942, 7931, 7925, 7919, 7909, 7905, 7903, 7891, 7889, 7887, 7886, 7884, 7883,
  7878, 7876, 7870, 7868, 7863, 7852, 7851, 7847,
];

/** Non-numeric eScribe keys — never invent fake Granicus clipIds. */
const ESCRIBE_MEETINGS = (process.env.LOUDOUN_ESCRIBE_KEYS || "escribe-929244b6")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ESCRIBE_ONLY = process.env.LOUDOUN_ESCRIBE_ONLY === "1";

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

function loadPrior8178() {
  const candidates = [shopJson, legacyShop].filter(Boolean);
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    try {
      const prior = JSON.parse(fs.readFileSync(p, "utf8"));
      if (!Array.isArray(prior) || !prior.length) continue;
      if (!("clipId" in prior[0])) {
        return prior.map((w) => ({
          start: w.start,
          end: w.end,
          text: w.text,
        }));
      }
      return prior
        .filter((w) => w.clipId === 8178)
        .map((w) => ({ start: w.start, end: w.end, text: w.text }));
    } catch {
      /* try next */
    }
  }
  return [];
}

/**
 * Also accept splitting an existing combined shop JSON without VTTs:
 *   LOUDOUN_SPLIT_FROM=src/content/loudoun-caption-windows.json node scripts/loudoun-caption-windows.mjs
 */
const splitFrom = process.env.LOUDOUN_SPLIT_FROM || "";

fs.mkdirSync(outDir, { recursive: true });

const counts = {};
const combined = [];

if (!ESCRIBE_ONLY && splitFrom) {
  const srcPath = path.isAbsolute(splitFrom) ? splitFrom : path.join(root, splitFrom);
  const all = JSON.parse(fs.readFileSync(srcPath, "utf8"));
  const by = new Map();
  for (const w of all) {
    if (!by.has(w.clipId)) by.set(w.clipId, []);
    by.get(w.clipId).push({ start: w.start, end: w.end, text: w.text });
  }
  for (const clipId of MEETINGS) {
    const wins = by.get(clipId) || [];
    const outPath = path.join(outDir, `${clipId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(wins));
    counts[clipId] = wins.length;
    console.log(`${clipId}: ${wins.length} windows -> ${outPath}`);
    for (const w of wins) combined.push({ clipId, ...w });
  }
} else if (!ESCRIBE_ONLY) {
  const prior8178 = loadPrior8178();
  for (const clipId of MEETINGS) {
    const vttPath = path.join(vttDir, `${clipId}.vtt`);
    if (!fs.existsSync(vttPath)) {
      console.warn(`skip ${clipId}: missing ${vttPath}`);
      continue;
    }
    let wins;
    if (clipId === 8178 && prior8178.length) {
      wins = prior8178;
    } else {
      const cues = parseVtt(fs.readFileSync(vttPath, "utf8"));
      wins = windowize(cues);
    }
    const outPath = path.join(outDir, `${clipId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(wins));
    counts[clipId] = wins.length;
    console.log(`${clipId}: ${wins.length} windows -> ${outPath}`);
    for (const w of wins) combined.push({ clipId, ...w });
  }
}

if (!splitFrom || ESCRIBE_ONLY) {
  const keys = ESCRIBE_ONLY || !splitFrom ? ESCRIBE_MEETINGS : [];
  for (const key of keys) {
    const vttPath = path.join(vttDir, `${key}.vtt`);
    if (!fs.existsSync(vttPath)) {
      console.warn(`skip eScribe ${key}: missing ${vttPath}`);
      continue;
    }
    const cues = parseVtt(fs.readFileSync(vttPath, "utf8"));
    const wins = windowize(cues);
    const outPath = path.join(outDir, `${key}.json`);
    fs.writeFileSync(outPath, JSON.stringify(wins));
    counts[key] = wins.length;
    console.log(`eScribe ${key}: ${wins.length} windows -> ${outPath}`);
    for (const w of wins) combined.push({ id: key, ...w });
  }
}

if (shopJson) {
  fs.mkdirSync(path.dirname(path.resolve(shopJson)), { recursive: true });
  fs.writeFileSync(shopJson, JSON.stringify(combined));
  console.log(`shop archive ${combined.length} windows -> ${shopJson}`);
}

console.log("\n--- windowCount manifest (for src/content/loudoun.ts) ---");
console.log(JSON.stringify(counts, null, 2));
console.log(
  `\nwrote ${Object.keys(counts).length} meeting files under ${outDir} (${combined.length || Object.values(counts).reduce((a, b) => a + b, 0)} windows)`,
);
