/**
 * Build loudoun-caption-windows.json from Granicus VTTs.
 * Usage: node scripts/loudoun-caption-windows.mjs
 * Expects /tmp/loudoun-vtt/{clipId}.vtt (or set LOUDOUN_VTT_DIR).
 * Preserves existing windows for clip 8178 when present in the prior JSON.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "src/content/loudoun-caption-windows.json");
const vttDir = process.env.LOUDOUN_VTT_DIR || "/tmp/loudoun-vtt";

const MEETINGS = [8213, 8208, 8198, 8178, 8179, 8174, 8158];

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
      out.push({ start: Math.round(start * 10) / 10, end: Math.round(end * 10) / 10, text: parts.join(" ") });
      start = c.start;
      end = c.end;
      parts = [c.text];
      continue;
    }
    parts.push(c.text);
    end = c.end;
  }
  out.push({ start: Math.round(start * 10) / 10, end: Math.round(end * 10) / 10, text: parts.join(" ") });
  return out;
}

let prior8178 = [];
if (fs.existsSync(outPath)) {
  try {
    const prior = JSON.parse(fs.readFileSync(outPath, "utf8"));
    prior8178 = prior.filter((w) => w.clipId === 8178 || (!("clipId" in w) && prior.every((x) => !("clipId" in x))));
    // If old untagged single-meeting file, treat all as 8178
    if (prior.length && !("clipId" in prior[0])) {
      prior8178 = prior.map((w) => ({ clipId: 8178, ...w }));
    } else {
      prior8178 = prior.filter((w) => w.clipId === 8178);
    }
  } catch {
    prior8178 = [];
  }
}

const all = [];
for (const clipId of MEETINGS) {
  const vttPath = path.join(vttDir, `${clipId}.vtt`);
  if (!fs.existsSync(vttPath)) {
    console.warn(`skip ${clipId}: missing ${vttPath}`);
    continue;
  }
  let wins;
  if (clipId === 8178 && prior8178.length) {
    wins = prior8178.map((w) => ({ clipId: 8178, start: w.start, end: w.end, text: w.text }));
  } else {
    const cues = parseVtt(fs.readFileSync(vttPath, "utf8"));
    wins = windowize(cues).map((w) => ({ clipId, ...w }));
  }
  console.log(`${clipId}: ${wins.length} windows`);
  all.push(...wins);
}

fs.writeFileSync(outPath, JSON.stringify(all));
console.log(`wrote ${all.length} windows -> ${outPath}`);
