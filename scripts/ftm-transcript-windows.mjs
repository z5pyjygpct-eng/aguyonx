/**
 * Find the Moment: build a per-meeting MACHINE TRANSCRIPT search file from a
 * whisper.cpp run (speech-to-text), so FTM can search full spoken words
 * instead of (or alongside) the county's auto-captions.
 *
 * Usage:
 *   node scripts/ftm-transcript-windows.mjs <input.srt|input.json> <meetingId> [venue]
 *
 *   venue defaults to "loudoun-bos" (output folder under public/files/find-the-moment/).
 *
 * Example (Loudoun BOS Business Meeting, Oct 6 2026):
 *   node scripts/ftm-transcript-windows.mjs \
 *     /workspace/research/ftm-whisper/whisper-loudoun-bos-2026-10-06-business.srt \
 *     escribe-3a6eea40
 *
 * Emits:
 *   public/files/find-the-moment/{venue}/transcripts/{meetingId}.json
 *     — array of {start,end,text} (same shape as caption windows), merged from
 *       whisper segments into ~25 s windows that break at sentence ends.
 *   stdout: a ready-to-paste manifest entry for src/content/ftm-transcripts.ts
 *
 * Text is kept exactly as whisper produced it, with one cleanup: runs of 3+
 * back-to-back segments with the SAME text (a known whisper "loop" failure) are
 * collapsed to one copy. The count is printed so it can be noted in the manifest.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** "HH:MM:SS,mmm" or "HH:MM:SS.mmm" → seconds */
export function tsToSec(ts) {
  const m = /^(\d+):(\d{2}):(\d{2})[.,](\d{1,3})$/.exec(ts.trim());
  if (!m) throw new Error(`Bad timestamp: ${ts}`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4].padEnd(3, "0") / 1000;
}

/** Parse SRT text → [{start,end,text}] */
export function parseSrt(text) {
  const out = [];
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/);
  for (const b of blocks) {
    const lines = b.split("\n").filter((l) => l.trim() !== "");
    const tIdx = lines.findIndex((l) => l.includes("-->"));
    if (tIdx < 0) continue;
    const [a, z] = lines[tIdx].split("-->");
    const body = lines
      .slice(tIdx + 1)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (body) out.push({ start: tsToSec(a), end: tsToSec(z), text: body });
  }
  return out;
}

/** Parse whisper.cpp `-oj` JSON → [{start,end,text}] */
export function parseWhisperJson(obj) {
  const segs = Array.isArray(obj) ? obj : obj.transcription;
  if (!Array.isArray(segs)) throw new Error("No transcription[] in whisper JSON");
  return segs
    .map((s) => ({
      start: s.offsets ? s.offsets.from / 1000 : tsToSec(s.timestamps.from),
      end: s.offsets ? s.offsets.to / 1000 : tsToSec(s.timestamps.to),
      text: String(s.text ?? "")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((s) => s.text);
}

/**
 * Collapse whisper "loop" artifacts: a run of MIN_LOOP or more back-to-back
 * segments with identical text becomes one segment. Pairs are left alone on
 * purpose ("Aye." "Aye." can be two members voting).
 */
export const MIN_LOOP = 3;
export function collapseRepeats(segs, minLoop = MIN_LOOP) {
  const out = [];
  let collapsed = 0;
  let i = 0;
  while (i < segs.length) {
    let j = i + 1;
    const key = segs[i].text.toLowerCase();
    while (j < segs.length && segs[j].text.toLowerCase() === key) j += 1;
    const run = j - i;
    if (run >= minLoop) {
      out.push({ ...segs[i], end: Math.max(...segs.slice(i, j).map((s) => s.end)) });
      collapsed += run - 1;
    } else {
      for (let k = i; k < j; k += 1) out.push({ ...segs[k] });
    }
    i = j;
  }
  return { segs: out, collapsed };
}

const r1 = (n) => Math.round(n * 10) / 10;

const norm = (t) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Long whisper segments (>= 20 s; sometimes one cue spans minutes of silence)
 * can start well before the words a search hits. For those only, split the
 * segment into sentences and give each sentence the start time of the county
 * caption cue that contains its opening words (searching two adjacent cues so
 * cue breaks don't hide a match). Sentences with no caption match inherit the
 * previous start. Whisper text is not changed — only start times.
 */
export function alignLongSegments(segs, captions, { longSeg = 20, minWords = 3, slack = 5 } = {}) {
  if (!captions?.length) return { segs, aligned: 0 };
  // Each cue is searched together with the next one; a match that begins inside
  // the next cue takes that cue's start time.
  const cues = captions.map((c, i) => {
    const own = norm(c.text);
    const next = captions[i + 1];
    return {
      start: c.start,
      ownLen: own.length,
      nextStart: next ? next.start : c.start,
      text: next ? `${own} ${norm(next.text)}` : own,
    };
  });
  const out = [];
  let aligned = 0;
  for (const seg of segs) {
    if (seg.end - seg.start < longSeg) {
      out.push(seg);
      continue;
    }
    const sentences = seg.text
      .match(/[^.?!]+[.?!]*["')\]]?\s*/g)
      ?.map((x) => x.trim())
      .filter(Boolean) ?? [seg.text];
    let cursor = seg.start;
    const parts = [];
    for (const sentence of sentences) {
      const needle = norm(sentence).split(" ").slice(0, minWords).join(" ");
      let start = cursor;
      if (needle.length >= 8) {
        const hit = cues.find(
          (c) => c.start >= cursor - slack && c.start <= seg.end && c.text.includes(needle),
        );
        const hitStart = hit
          ? hit.text.indexOf(needle) > hit.ownLen
            ? hit.nextStart
            : hit.start
          : 0;
        if (hit && hitStart > cursor && hitStart <= seg.end) {
          start = hitStart;
          aligned += 1;
        }
      }
      const prev = parts[parts.length - 1];
      if (prev && start === prev.start) prev.text += ` ${sentence}`;
      else parts.push({ start, text: sentence });
      cursor = start;
    }
    parts.forEach((p, i) =>
      out.push({
        start: p.start,
        end: i + 1 < parts.length ? parts[i + 1].start : seg.end,
        text: p.text,
      }),
    );
  }
  return { segs: out, aligned };
}

/**
 * Merge segments into search windows. A window closes when:
 *  - the next segment starts after a silence gap >= gapForce seconds, or
 *  - it is >= minSentence seconds long and the last segment ends a sentence, or
 *  - adding the next segment would push it past maxLen seconds.
 */
export function windowize(segs, { minSentence = 15, maxLen = 40, gapForce = 8 } = {}) {
  const out = [];
  let cur = null;
  const flush = () => {
    if (cur) out.push({ start: r1(cur.start), end: r1(cur.end), text: cur.parts.join(" ") });
    cur = null;
  };
  for (const s of segs) {
    if (cur) {
      const gap = s.start - cur.end;
      const len = cur.end - cur.start;
      const endsSentence = /[.?!]["')\]]?$/.test(cur.parts[cur.parts.length - 1]);
      if (gap >= gapForce || (len >= minSentence && endsSentence) || s.end - cur.start > maxLen) {
        flush();
      }
    }
    if (!cur) cur = { start: s.start, end: s.end, parts: [s.text] };
    else {
      cur.end = Math.max(cur.end, s.end);
      cur.parts.push(s.text);
    }
  }
  flush();
  return out;
}

function main() {
  const [input, meetingId, venue = "loudoun-bos", captionsFile] = process.argv.slice(2);
  if (!input || !meetingId) {
    console.error(
      "Usage: node scripts/ftm-transcript-windows.mjs <input.srt|input.json> <meetingId> [venue] [captions.vtt]",
    );
    process.exit(2);
  }
  const raw = fs.readFileSync(input, "utf8");
  const segs = input.endsWith(".json") ? parseWhisperJson(JSON.parse(raw)) : parseSrt(raw);
  segs.sort((a, b) => a.start - b.start);
  const { segs: clean, collapsed } = collapseRepeats(segs);
  const captions = captionsFile ? parseSrt(fs.readFileSync(captionsFile, "utf8")) : [];
  const { segs: aligned, aligned: shifted } = alignLongSegments(clean, captions);
  const windows = windowize(aligned);
  const outDir = path.join(root, "public/files/find-the-moment", venue, "transcripts");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${meetingId}.json`);
  fs.writeFileSync(outFile, JSON.stringify(windows));
  const words = windows.reduce((n, w) => n + w.text.split(/\s+/).length, 0);
  const url = `/files/find-the-moment/${venue}/transcripts/${meetingId}.json`;
  console.error(
    `${path.basename(input)}: ${segs.length} segments, ${collapsed} repeated segments collapsed, ` +
      `${shifted} long-segment sentences re-timed from captions, ${windows.length} windows, ${words} words → ` +
      `${path.relative(root, outFile)} (${(fs.statSync(outFile).size / 1024).toFixed(0)} KB)`,
  );
  console.log(
    JSON.stringify(
      {
        meetingId,
        url,
        windowCount: windows.length,
        wordCount: words,
        sourceFile: path.basename(input),
        repeatsCollapsed: collapsed,
        sentencesAlignedToCaptions: shifted,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
