/**
 * Build per-meeting Find the Moment caption files for LCPS School Board.
 *
 * Usage:
 *   LCPS_VTT_DIR=/tmp/lcps-vtt node scripts/lcps-caption-windows.mjs
 *
 * Emits:
 *   public/files/find-the-moment/loudoun-lcps/{vimeoId}.json
 *     — array of {start,end,text} only (Hobby-safe lazy load)
 *   stdout summary with windowCount per meeting (paste into src/content/lcps.ts)
 *
 * Optional: LCPS_SPLIT_FROM=src/content/lcps-caption-windows.json migrates the
 * Aug 11 POC single-file windows into the multi-meeting layout for that id.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/files/find-the-moment/loudoun-lcps");
const vttDir = process.env.LCPS_VTT_DIR || "/tmp/lcps-vtt";
const legacyPoc = path.join(root, "src/content/lcps-caption-windows.json");
const splitFrom = process.env.LCPS_SPLIT_FROM || "";
/** Prefer prior Aug 11 POC windows when regenerating from VTTs. */
const AUG11 = "1217434020";

/** Full School Board meetings (not committees) — CY2025 + 2026 YTD. */
const MEETINGS = [
  "1045703767", // 2025-01-09 School Board Organizational Meeting
  "1047051714", // 2025-01-14 2nd Tuesday School Board Meeting
  "1052098361", // 2025-02-04 Special School Board Meeting — FY26 Operating Budget Adoption
  "1053570466", // 2025-02-13 2nd Tuesday School Board Meeting (Rescheduled due to incle...
  "1059923212", // 2025-02-25 4th Tuesday School Board Meeting
  "1063013914", // 2025-03-11 2nd Tuesday School Board Meeting
  "1069012335", // 2025-03-25 4th Tuesday School Board Meeting
  "1069432152", // 2025-04-01 4th Tuesday School Board Meeting (Reconvened from March 25...
  "1071992637", // 2025-04-08 2nd Tuesday School Board Meeting
  "1074117923", // 2025-04-22 4th Tuesday School Board Meeting
  "1081666340", // 2025-05-06 2nd Tuesday School Board Meeting
  "1086546653", // 2025-05-20 4th Tuesday School Board Meeting
  "1089915351", // 2025-06-10 2nd Tuesday School Board Meeting
  "1092321196", // 2025-06-17 2nd Tuesday School Board Meeting (Reconvened from June 10,...
  "1094251148", // 2025-06-23 Special School Board Meeting – Closed Session
  "1095784143", // 2025-06-24 4th Tuesday School Board Meeting
  "1096116661", // 2025-07-09 Special School Board Meeting – Closed Session
  "1100127951", // 2025-08-04 Special School Board Meeting – Closed Session
  "1107105070", // 2025-08-12 2nd Tuesday School Board Meeting
  "1110982340", // 2025-09-02 2nd Tuesday School Board Meeting (Reconvened from August 1...
  "1115339243", // 2025-09-08 Special School Board Meeting – Closed Session
  "1116938106", // 2025-09-09 2nd Tuesday School Board Meeting
  "1123768746", // 2025-09-30 4th Tuesday School Board Meeting (Moved due to Rosh Hashanah)
  "1123751318", // 2025-10-14 2nd Tuesday School Board Meeting
  "1127365931", // 2025-10-28 4th Tuesday School Board Meeting
  "1135569519", // 2025-11-11 2nd Tuesday School Board Meeting
  "1142554279", // 2025-12-02 4th Tuesday School Board Meeting (Moved due to Thanksgivin...
  "1147068947", // 2025-12-16 2nd Tuesday School Board Meeting (Moved due to Winter Break)
  // --- 2026 YTD ---
  "1151982673", // 2026-01-06 Organizational
  "1154062783", // 2026-01-13 2nd Tuesday
  "1159386579", // 2026-01-28 2nd Tuesday (rescheduled)
  "1161547575", // 2026-02-03 Special — FY27 Budget Adoption
  "1163723566", // 2026-02-10 2nd Tuesday
  "1167853411", // 2026-02-24 4th Tuesday
  "1170500663", // 2026-03-05 Special
  "1172260639", // 2026-03-10 2nd Tuesday
  "1176756919", // 2026-03-23 Special Permission Appeals
  "1176666991", // 2026-03-24 4th Tuesday
  "1182826368", // 2026-04-13 Special Permission Appeals
  "1183118445", // 2026-04-14 2nd Tuesday
  "1187409570", // 2026-04-28 4th Tuesday
  "1188295564", // 2026-04-30 Special Permission Appeals
  "1191494055", // 2026-05-11 Special — Closed Session
  "1191636709", // 2026-05-12 2nd Tuesday
  "1195679789", // 2026-05-26 4th Tuesday
  "1199544093", // 2026-06-08 Special — Closed Session
  "1199853132", // 2026-06-09 2nd Tuesday
  "1203915618", // 2026-06-23 4th Tuesday
  "1209536330", // 2026-07-13 Special
  "1215666664", // 2026-08-04 Special Permission Appeals
  "1217434020", // 2026-08-11 2nd Tuesday (POC)
  "1225039248", // 2026-09-08 2nd Tuesday
];

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

function loadPriorAug11() {
  if (!fs.existsSync(legacyPoc)) return [];
  try {
    const prior = JSON.parse(fs.readFileSync(legacyPoc, "utf8"));
    if (!Array.isArray(prior) || !prior.length) return [];
    return prior.map((w) => ({
      start: w.start,
      end: w.end,
      text: w.text,
    }));
  } catch {
    return [];
  }
}

fs.mkdirSync(outDir, { recursive: true });

const counts = {};

if (splitFrom) {
  const srcPath = path.isAbsolute(splitFrom)
    ? splitFrom
    : path.join(root, splitFrom);
  const all = JSON.parse(fs.readFileSync(srcPath, "utf8"));
  // Single-meeting POC array → Aug 11 only
  const wins = Array.isArray(all)
    ? all.map((w) => ({ start: w.start, end: w.end, text: w.text }))
    : [];
  const outPath = path.join(outDir, `${AUG11}.json`);
  fs.writeFileSync(outPath, JSON.stringify(wins));
  counts[AUG11] = wins.length;
  console.log(`${AUG11}: ${wins.length} windows -> ${outPath}`);
} else {
  const priorAug11 = loadPriorAug11();
  for (const vimeoId of MEETINGS) {
    const vttPath = path.join(vttDir, `${vimeoId}.vtt`);
    if (!fs.existsSync(vttPath)) {
      console.warn(`skip ${vimeoId}: missing ${vttPath}`);
      continue;
    }
    let wins;
    if (vimeoId === AUG11 && priorAug11.length) {
      wins = priorAug11;
    } else {
      const cues = parseVtt(fs.readFileSync(vttPath, "utf8"));
      wins = windowize(cues);
    }
    const outPath = path.join(outDir, `${vimeoId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(wins));
    counts[vimeoId] = wins.length;
    console.log(`${vimeoId}: ${wins.length} windows -> ${outPath}`);
  }
}

console.log("\n--- windowCount manifest (for src/content/lcps.ts) ---");
console.log(JSON.stringify(counts, null, 2));
const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(
  `\nwrote ${Object.keys(counts).length} meeting files under ${outDir} (${total} windows)`,
);
