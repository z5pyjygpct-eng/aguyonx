import test from "node:test";
import assert from "node:assert/strict";
import {
  alignLongSegments,
  collapseRepeats,
  parseSrt,
  parseWhisperJson,
  tsToSec,
  windowize,
} from "./ftm-transcript-windows.mjs";

test("tsToSec handles SRT and VTT separators", () => {
  assert.equal(tsToSec("01:02:03,500"), 3723.5);
  assert.equal(tsToSec("00:00:10.250"), 10.25);
});

test("parseSrt reads cues and joins multi-line text", () => {
  const srt =
    "1\n00:00:01,000 --> 00:00:03,000\nHello\nthere.\n\n2\n00:00:04,000 --> 00:00:05,000\nNext.\n";
  assert.deepEqual(parseSrt(srt), [
    { start: 1, end: 3, text: "Hello there." },
    { start: 4, end: 5, text: "Next." },
  ]);
});

test("parseWhisperJson reads whisper.cpp offsets", () => {
  const segs = parseWhisperJson({
    transcription: [{ offsets: { from: 1500, to: 2500 }, text: " Good evening. " }],
  });
  assert.deepEqual(segs, [{ start: 1.5, end: 2.5, text: "Good evening." }]);
});

test("collapseRepeats folds 3+ loops but keeps pairs (two Ayes are two votes)", () => {
  const seg = (t, s) => ({ start: s, end: s + 1, text: t });
  const { segs, collapsed } = collapseRepeats([
    seg("Aye.", 0),
    seg("Aye.", 1),
    seg("Loop line.", 2),
    seg("Loop line.", 3),
    seg("loop line.", 4),
    seg("Done.", 5),
  ]);
  assert.equal(collapsed, 2);
  assert.deepEqual(
    segs.map((s) => s.text),
    ["Aye.", "Aye.", "Loop line.", "Done."],
  );
  assert.equal(segs[2].end, 5);
});

test("windowize breaks at sentence ends, silence gaps, and max length", () => {
  const segs = [
    { start: 0, end: 10, text: "First part" },
    { start: 10, end: 16, text: "ends here." },
    { start: 16, end: 20, text: "Second window." },
    { start: 40, end: 42, text: "After a gap." },
  ];
  const w = windowize(segs);
  assert.deepEqual(
    w.map((x) => x.text),
    ["First part ends here.", "Second window.", "After a gap."],
  );
  assert.equal(w[0].start, 0);
  assert.equal(w[2].start, 40);
  const long = Array.from({ length: 20 }, (_, i) => ({
    start: i * 5,
    end: i * 5 + 5,
    text: "no stop",
  }));
  assert.ok(windowize(long).every((x) => x.end - x.start <= 40));
});

test("alignLongSegments re-times sentences inside a long segment from caption cues", () => {
  const segs = [
    {
      start: 100,
      end: 190,
      text: "Okay, thank you. Good evening, everyone. We don't have quorum yet.",
    },
    { start: 190, end: 195, text: "Short one." },
  ];
  const captions = [
    { start: 101, end: 102, text: "you. Okay, thank you." },
    { start: 185, end: 188, text: "Good evening everyone. We don't have porum yet." },
  ];
  const { segs: out, aligned } = alignLongSegments(segs, captions);
  assert.equal(aligned, 2);
  assert.deepEqual(
    out.map((s) => [s.start, s.text]),
    [
      [101, "Okay, thank you."],
      [185, "Good evening, everyone. We don't have quorum yet."],
      [190, "Short one."],
    ],
  );
  // Text is never changed, only start times.
  assert.equal(out.map((s) => s.text).join(" "), segs.map((s) => s.text).join(" "));
});

test("download text keeps the notice, timestamps, and exact window text", async () => {
  const { buildTxt, buildHtml, hms, NOTICE } = await import("./ftm-transcript-download.mjs");
  const meta = {
    title: "T",
    date: "D",
    place: "P",
    length: "L",
    links: [{ label: "Video", href: "https://example.com/v.mp4" }],
    engine: "E",
    generated: "2026-10-08",
  };
  const windows = [{ start: 2113.2, end: 2120, text: "We don't have quorum yet. <ok> & done" }];
  const txt = buildTxt(meta, windows);
  assert.equal(hms(2113.2), "00:35:13");
  assert.ok(txt.includes(NOTICE));
  assert.ok(txt.includes("[00:35:13] We don't have quorum yet. <ok> & done"));
  const html = buildHtml(meta, windows, "data:image/png;base64,");
  assert.ok(html.includes("[00:35:13]</span> We don&#39;t".replace("&#39;", "'")));
  assert.ok(html.includes("&lt;ok&gt; &amp; done"));
});
