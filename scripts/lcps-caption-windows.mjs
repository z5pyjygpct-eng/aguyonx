/**
 * Build lcps-caption-windows.json from a School Board VTT.
 * Usage: node scripts/lcps-caption-windows.mjs [path/to.vtt]
 * Default VTT: /workspace/briefs/lcps-boarddocs/lcps-2026-08-11-captions.vtt
 * Same windowing style as scripts/loudoun-caption-windows.mjs (no clipId).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "src/content/lcps-caption-windows.json");
const defaultVtt =
  "/workspace/briefs/lcps-boarddocs/lcps-2026-08-11-captions.vtt";
const vttPath = process.argv[2] || defaultVtt;

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

if (!fs.existsSync(vttPath)) {
  console.error(`missing VTT: ${vttPath}`);
  process.exit(1);
}

const cues = parseVtt(fs.readFileSync(vttPath, "utf8"));
const wins = windowize(cues);
fs.writeFileSync(outPath, JSON.stringify(wins));
console.log(`cues=${cues.length} windows=${wins.length} -> ${outPath}`);
