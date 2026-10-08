/**
 * Find the Moment: build the downloadable transcript (PDF + plain text) for a
 * meeting recap, from the SAME cleaned windows the site search uses
 * (public/files/find-the-moment/{venue}/transcripts/{meetingId}.json).
 *
 * Usage:
 *   node scripts/ftm-transcript-download.mjs scripts/transcript-meta/<meeting>.json
 *
 * Writes {outBase}.txt and {outBase}.pdf (Coraggio Consulting house look, real
 * selectable text, page header/footer with "Page X of Y"). Wording is not
 * edited and no speaker names are added. PDF uses Playwright; set CHROME to a
 * Chrome binary if Playwright's own browser is not installed
 * (e.g. CHROME=/usr/bin/google-chrome).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

export const NOTICE =
  "Machine transcript (speech-to-text) produced by Coraggio Consulting. Not an official county record. " +
  "Names and numbers may be misspelled; check the video at the timestamp before quoting.";

export function hms(sec) {
  const s = Math.floor(sec);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

const esc = (t) =>
  String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildTxt(meta, windows) {
  const lines = [
    "Coraggio Consulting",
    meta.title,
    "",
    `Date: ${meta.date}`,
    `Place: ${meta.place}`,
    `Length: ${meta.length}`,
    ...meta.links.map((l) => `${l.label}: ${l.href}`),
    "",
    NOTICE,
    `Speech-to-text: ${meta.engine}. Produced ${meta.generated}. Timestamps are [HH:MM:SS] into the meeting video.`,
    "",
    "----------------------------------------------------------------------",
    "",
  ];
  for (const w of windows) lines.push(`[${hms(w.start)}] ${w.text}`, "");
  lines.push(
    "----------------------------------------------------------------------",
    "Coraggio Consulting · aguyonx.com",
    "",
  );
  return lines.join("\n");
}

export function buildHtml(meta, windows, logoDataUri) {
  const paras = windows
    .map((w) => `<p class="seg"><span class="ts">[${hms(w.start)}]</span> ${esc(w.text)}</p>`)
    .join("\n");
  const links = meta.links
    .map((l) => `<li>${esc(l.label)}: <a href="${esc(l.href)}">${esc(l.href)}</a></li>`)
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(meta.title)} — Machine transcript</title>
<style>
  @page { size: Letter; margin: 0.85in 0.8in 0.8in 0.8in; }
  body { font-family: "Source Serif Pro", "IBM Plex Serif", Georgia, serif; font-size: 10.5pt; line-height: 1.45; color: #1c1b19; margin: 0; }
  .cover { text-align: center; padding-top: 4pt; }
  .cover img { width: 2.6in; }
  .kicker { font-family: "IBM Plex Mono", monospace; font-size: 7.5pt; letter-spacing: 0.14em; text-transform: uppercase; color: #6b6a66; margin: 10pt 0 2pt; }
  h1 { font-family: "Newsreader", "Source Serif Pro", serif; font-weight: 500; font-size: 20pt; line-height: 1.2; margin: 2pt 0 12pt; }
  .meta { text-align: left; border-top: 1px solid #d9d4c7; border-bottom: 1px solid #d9d4c7; padding: 8pt 0; margin: 6pt 0 10pt; font-family: "IBM Plex Sans", sans-serif; font-size: 9pt; }
  .meta dl { display: grid; grid-template-columns: 0.8in 1fr; gap: 2pt 8pt; margin: 0 0 6pt; }
  .meta dt { color: #6b6a66; } .meta dd { margin: 0; }
  .meta ul { margin: 0; padding-left: 14pt; } .meta a { color: #1E4B8E; word-break: break-all; }
  .notice { text-align: left; border-left: 3pt solid #c47a3a; background: #fdf0e6; color: #6b3a12; padding: 7pt 10pt; font-family: "IBM Plex Sans", sans-serif; font-size: 9pt; margin: 0 0 6pt; }
  .engine { text-align: left; font-family: "IBM Plex Sans", sans-serif; font-size: 8pt; color: #6b6a66; margin: 0 0 14pt; }
  .seg { margin: 0 0 6.5pt; text-align: left; orphans: 2; widows: 2; }
  .ts { font-family: "IBM Plex Mono", monospace; font-size: 8.5pt; color: #1E4B8E; font-weight: 600; }
  .end { text-align: center; margin-top: 24pt; page-break-inside: avoid; }
  .end img { width: 1.8in; }
  .end p { font-family: "IBM Plex Sans", sans-serif; font-size: 8.5pt; color: #6b6a66; }
</style></head><body>
<section class="cover">
  <img src="${logoDataUri}" alt="Coraggio Consulting">
  <p class="kicker">Machine transcript · Coraggio Consulting</p>
  <h1>${esc(meta.title)}</h1>
  <div class="meta">
    <dl><dt>Date</dt><dd>${esc(meta.date)}</dd><dt>Place</dt><dd>${esc(meta.place)}</dd><dt>Length</dt><dd>${esc(meta.length)}</dd></dl>
    <ul>${links}</ul>
  </div>
  <p class="notice">${esc(NOTICE)}</p>
  <p class="engine">Speech-to-text: ${esc(meta.engine)}. Produced ${esc(meta.generated)}. Each paragraph starts with its time [HH:MM:SS] in the meeting video.</p>
</section>
${paras}
<section class="end"><img src="${logoDataUri}" alt="Coraggio Consulting"><p>Coraggio Consulting · aguyonx.com</p></section>
</body></html>`;
}

const HEADER = (
  meta,
) => `<div style="width:100%;font-family:'IBM Plex Sans',sans-serif;font-size:7.5pt;color:#6b6a66;padding:0 0.8in;display:flex;justify-content:space-between;">
<span style="color:#7a1f2b;font-weight:600;letter-spacing:0.04em;">Coraggio Consulting</span><span>${esc(meta.title)}</span></div>`;
const FOOTER = `<div style="width:100%;font-family:'IBM Plex Sans',sans-serif;font-size:7.5pt;color:#6b6a66;padding:0 0.8in;display:flex;justify-content:space-between;">
<span>Coraggio Consulting · aguyonx.com</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`;

async function main() {
  const metaPath = process.argv[2];
  if (!metaPath) {
    console.error("Usage: node scripts/ftm-transcript-download.mjs <meta.json>");
    process.exit(2);
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const windows = JSON.parse(fs.readFileSync(path.join(root, meta.windowsFile), "utf8"));
  const outBase = path.join(root, meta.outBase);
  fs.writeFileSync(`${outBase}.txt`, buildTxt(meta, windows));
  const logo = fs.readFileSync(path.join(__dirname, "assets/coraggio-logo.png")).toString("base64");
  const html = buildHtml(meta, windows, `data:image/png;base64,${logo}`);
  const { chromium } = await import("playwright");
  const browser = await chromium.launch(
    process.env.CHROME ? { executablePath: process.env.CHROME } : {},
  );
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: `${outBase}.pdf`,
    format: "Letter",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: HEADER(meta),
    footerTemplate: FOOTER,
    margin: { top: "0.85in", bottom: "0.8in", left: "0.8in", right: "0.8in" },
  });
  await browser.close();
  for (const ext of ["pdf", "txt"]) {
    const f = `${outBase}.${ext}`;
    console.error(`${path.relative(root, f)}: ${(fs.statSync(f).size / 1024).toFixed(0)} KB`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
