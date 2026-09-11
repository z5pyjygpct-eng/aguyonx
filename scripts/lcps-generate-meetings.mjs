/**
 * Regenerate LCPS_MEETINGS entries from existing lcps.ts + committee ingest meta.
 * Preserves hand-tuned boardDocsUrl for known full-board rows when possible.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const lcpsPath = path.join(root, "src/content/lcps.ts");
const metaPath =
  process.env.LCPS_META || "/workspace/lcps-committee-ingest-meta.json";
const sidePath =
  process.env.LCPS_SIDE || "/workspace/lcps-committee-side.json";
const outDir = path.join(root, "public/files/find-the-moment/loudoun-lcps");

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];

function dateLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function committeeName(title, kind) {
  if (kind === "full_board") return undefined;
  // strip trailing time-ish noise; keep readable name
  return title
    .replace(/\s*\d{1,2}:\d{2}\s*[ap]\.?m\.?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseExisting(ts) {
  const byId = new Map();
  const re =
    /\{\s*id:\s*"([^"]+)",\s*vimeoId:\s*"([^"]+)",\s*title:\s*"([^"]*)",\s*dateLabel:\s*"([^"]*)",\s*duration:\s*"([^"]*)",\s*playerUrl:\s*"([^"]*)",\s*boardDocsUrl:\s*([\s\S]*?),\s*lcpsTvUrl:\s*LCPS_TV,\s*windowsUrl:\s*"([^"]*)",\s*windowCount:\s*(\d+),?\s*\}/g;
  let m;
  while ((m = re.exec(ts)) !== null) {
    byId.set(m[2], {
      id: m[1],
      vimeoId: m[2],
      title: m[3],
      dateLabel: m[4],
      duration: m[5],
      playerUrl: m[6],
      boardDocsUrlExpr: m[7].trim(),
      windowsUrl: m[8],
      windowCount: Number(m[9]),
    });
  }
  return byId;
}

function inferKind(title, forced) {
  if (forced) return forced;
  const t = title.toLowerCase();
  if (
    t.includes("2nd tuesday") ||
    t.includes("4th tuesday") ||
    t.includes("organizational")
  )
    return "full_board";
  if (t.includes("budget adoption") || t.includes("operating budget adoption"))
    return "full_board";
  if (
    (t.includes("special permission") && t.includes("appeal")) ||
    (t.includes("select committee") && t.includes("appeal")) ||
    (t.includes("vhsl") && t.includes("appeal")) ||
    t.includes("closed appeals") ||
    t.includes("appeals hearing") ||
    t.includes("appeals meeting")
  )
    return "appeals";
  if (t.includes("closed session") || t.includes("closed meeting"))
    return "closed";
  if (
    t.includes("committee") ||
    t.includes("sbac") ||
    t.includes("work session") ||
    t.includes("joint")
  )
    return "committee";
  if (t.startsWith("special school board") && !t.includes("appeal"))
    return t.includes("closed") ? "closed" : "full_board";
  return "other";
}

const ts = fs.readFileSync(lcpsPath, "utf8");
const existing = parseExisting(ts);
console.log("parsed existing", existing.size);

const side = JSON.parse(fs.readFileSync(sidePath, "utf8"));
const forcedKind = new Map();
for (const s of side.skipped_full || []) forcedKind.set(s.vimeoId, "full_board");
for (const a of side.already || []) {
  if (a.vimeoId === "1052098361") forcedKind.set(a.vimeoId, "full_board");
  else forcedKind.set(a.vimeoId, a.kind);
}

const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
const meetings = [];

// Existing rows first (keep), with kind annotation
for (const [vid, row] of existing) {
  const kind = inferKind(row.title, forcedKind.get(vid));
  const cName = committeeName(row.title, kind);
  const baseDate = row.id.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || row.id;
  meetings.push({
    ...row,
    id: `${baseDate}-${row.vimeoId}`,
    kind,
    committeeName: cName,
    boardDocsUrlExpr: row.boardDocsUrlExpr,
  });
}

// New from meta (ok only, with windows file)
let added = 0;
for (const m of meta) {
  if (!m.ok) continue;
  if (existing.has(m.vimeoId)) continue;
  const winPath = path.join(outDir, `${m.vimeoId}.json`);
  if (!fs.existsSync(winPath)) continue;
  const windowCount =
    m.windowCount ?? JSON.parse(fs.readFileSync(winPath, "utf8")).length;
  if (!windowCount) continue;
  const kind = m.kind || inferKind(m.title);
  meetings.push({
    id: `${m.date}-${m.vimeoId}`,
    vimeoId: m.vimeoId,
    title: m.title,
    dateLabel: dateLabel(m.date),
    duration: m.duration || "",
    playerUrl: `https://player.vimeo.com/video/${m.vimeoId}?rel=0`,
    boardDocsUrlExpr: "BOARDDOCS_PUBLIC",
    windowsUrl: `/files/find-the-moment/loudoun-lcps/${m.vimeoId}.json`,
    windowCount,
    kind,
    committeeName: committeeName(m.title, kind),
  });
  added += 1;
}

// Sort newest first; stable by title
meetings.sort((a, b) => {
  const d = b.id.localeCompare(a.id);
  if (d) return d;
  return a.title.localeCompare(b.title);
});

// Deduplicate: same date+title keep higher windowCount; same vimeoId keep one
const seen = new Set();
const deduped = [];
for (const m of meetings) {
  if (seen.has(m.vimeoId)) continue;
  seen.add(m.vimeoId);
  deduped.push(m);
}

function emitMeeting(m) {
  const lines = [
    `  {`,
    `    id: "${esc(m.id)}",`,
    `    vimeoId: "${m.vimeoId}",`,
    `    title: "${esc(m.title)}",`,
    `    dateLabel: "${esc(m.dateLabel)}",`,
    `    duration: "${esc(m.duration)}",`,
    `    playerUrl: "${esc(m.playerUrl)}",`,
    `    boardDocsUrl: ${m.boardDocsUrlExpr},`,
    `    lcpsTvUrl: LCPS_TV,`,
    `    windowsUrl: "${esc(m.windowsUrl)}",`,
    `    windowCount: ${m.windowCount},`,
    `    kind: "${m.kind}",`,
  ];
  if (m.committeeName && m.kind !== "full_board") {
    lines.push(`    committeeName: "${esc(m.committeeName)}",`);
  }
  lines.push(`  },`);
  return lines.join("\n");
}

const arrayBody = deduped.map(emitMeeting).join("\n");

// Patch type + array in lcps.ts
let next = ts;

// Update LcpsMeeting type
if (!next.includes('kind?: "full_board"')) {
  next = next.replace(
    `export type LcpsMeeting = {
  id: string;
  vimeoId: string;
  title: string;
  dateLabel: string;
  duration: string;
  playerUrl: string;
  boardDocsUrl: string;
  lcpsTvUrl: string;
  /** Static JSON under /files/find-the-moment/loudoun-lcps/{vimeoId}.json */
  windowsUrl: string;
  windowCount: number;
};`,
    `export type LcpsMeetingKind =
  | "full_board"
  | "committee"
  | "closed"
  | "appeals"
  | "other";

export type LcpsMeeting = {
  id: string;
  vimeoId: string;
  title: string;
  dateLabel: string;
  duration: string;
  playerUrl: string;
  boardDocsUrl: string;
  lcpsTvUrl: string;
  /** Static JSON under /files/find-the-moment/loudoun-lcps/{vimeoId}.json */
  windowsUrl: string;
  windowCount: number;
  /** Meeting class for Find the Moment filters. Default UI shows All. */
  kind: LcpsMeetingKind;
  /** Optional display name for committee / closed / appeals rows. */
  committeeName?: string;
};`,
  );
}

next = next.replace(
  /\/\*\* Full School Board meetings CY2025 \+ 2026 YTD — lean lazy-load index \(not committees\)\. \*\/\nexport const LCPS_MEETINGS: LcpsMeeting\[\] = \[[\s\S]*?\];\n\nexport const LCPS_MEETING_BY_VIMEO/,
  `/** School Board meetings + committees/closed/appeals — CY2025 + 2026 YTD (lean lazy-load). */\nexport const LCPS_MEETINGS: LcpsMeeting[] = [\n${arrayBody}\n];\n\nexport const LCPS_MEETING_BY_VIMEO`,
);

fs.writeFileSync(lcpsPath, next);
console.log(
  JSON.stringify(
    {
      total: deduped.length,
      added,
      byKind: deduped.reduce((a, m) => {
        a[m.kind] = (a[m.kind] || 0) + 1;
        return a;
      }, {}),
    },
    null,
    2,
  ),
);
