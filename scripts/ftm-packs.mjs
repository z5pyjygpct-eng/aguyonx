/**
 * Find the Moment: build search "packs" — the per-meeting window files for a
 * venue bundled into a few content-hashed chunks, so an "All meetings" search
 * makes ~10 requests instead of 77 (BOS) or 276 (School Board).
 *
 * Why: each per-meeting file is a separate request. On a cold CDN edge (right
 * after every deploy) each one is a cache miss, and the search waited for ALL
 * of them before showing anything. Chunks are fewer, compress better, and are
 * immutable (hash in the name), so they can be cached for a year.
 *
 * Usage:
 *   node scripts/ftm-packs.mjs            # writes public/files/find-the-moment/{venue}/pack/
 *
 * Also runs automatically at the start of every `vite build` (see vite.config.ts),
 * so deploys never ship a stale pack. The pack folders are git-ignored.
 *
 * Output per venue:
 *   pack/manifest.json  { v: 1, chunks: [{ url, files: [windowsUrl, ...] }] }
 *   pack/chunks/{sha256-12}.json
 *     A JSON array with ONE FILE PER LINE so the browser can stream it:
 *       [
 *       {"u":"/files/find-the-moment/loudoun-bos/7909.json","w":[[start,end,"text"],...]},
 *       ...
 *       ]
 *     `u` is the exact windowsUrl (or transcript url) the site would otherwise
 *     fetch; `w` is that file's {start,end,text} windows as [start,end,text],
 *     values copied unchanged.
 *
 * Files are ordered as they appear in the catalogs (newest meetings first),
 * machine transcripts first, so streamed results arrive newest-first.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

export const FTM_PUBLIC_PREFIX = "/files/find-the-moment/";
/** Target raw (uncompressed) bytes per chunk. */
export const CHUNK_TARGET_BYTES = 1_500_000;

/** Venues and the catalog files whose window URLs go into each pack, in order. */
export const FTM_PACK_VENUES = [
  {
    venue: "loudoun-bos",
    catalogs: ["src/content/ftm-transcripts.ts", "src/content/loudoun.ts"],
  },
  {
    venue: "loudoun-lcps",
    catalogs: ["src/content/lcps.ts"],
  },
];

/** Window-file URLs for a venue, in catalog order, deduped. */
export function catalogUrls(sources, venue) {
  const re = new RegExp(
    `["'\`](${FTM_PUBLIC_PREFIX}${venue}/(?!pack/)[^"'\`$]+\\.json)["'\`]`,
    "g",
  );
  const seen = new Set();
  const out = [];
  for (const src of sources) {
    for (const m of src.matchAll(re)) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        out.push(m[1]);
      }
    }
  }
  return out;
}

/** One pack line for a windows file. */
export function packLine(url, windows) {
  if (!Array.isArray(windows)) throw new Error(`${url}: not an array`);
  const w = windows.map((s, i) => {
    if (typeof s?.start !== "number" || typeof s?.end !== "number" || typeof s?.text !== "string") {
      throw new Error(`${url}: window ${i} is not {start,end,text}`);
    }
    return [s.start, s.end, s.text];
  });
  return JSON.stringify({ u: url, w });
}

/** Group lines into chunks of ~targetBytes, keeping order. */
export function chunkLines(entries, targetBytes = CHUNK_TARGET_BYTES) {
  const chunks = [];
  let cur = null;
  for (const e of entries) {
    if (!cur || cur.bytes >= targetBytes) {
      cur = { lines: [], files: [], bytes: 0 };
      chunks.push(cur);
    }
    cur.lines.push(e.line);
    cur.files.push(e.url);
    cur.bytes += e.line.length;
  }
  return chunks.map((c) => {
    const body = `[\n${c.lines.join(",\n")}\n]\n`;
    const hash = crypto.createHash("sha256").update(body).digest("hex").slice(0, 12);
    return { body, hash, files: c.files };
  });
}

/** Build packs for every venue under `publicDir`. Returns a summary. */
export function buildFtmPacks({
  root = ROOT,
  publicDir = path.join(root, "public"),
  outDir = publicDir,
  log = console.log,
} = {}) {
  const summary = [];
  for (const { venue, catalogs } of FTM_PACK_VENUES) {
    const sources = catalogs.map((c) => fs.readFileSync(path.join(root, c), "utf8"));
    const urls = catalogUrls(sources, venue);
    const entries = [];
    const missing = [];
    for (const url of urls) {
      const file = path.join(publicDir, url);
      if (!fs.existsSync(file)) {
        missing.push(url);
        continue;
      }
      entries.push({ url, line: packLine(url, JSON.parse(fs.readFileSync(file, "utf8"))) });
    }
    const chunks = chunkLines(entries);
    const packDir = path.join(outDir, FTM_PUBLIC_PREFIX, venue, "pack");
    const chunkDir = path.join(packDir, "chunks");
    fs.rmSync(packDir, { recursive: true, force: true });
    fs.mkdirSync(chunkDir, { recursive: true });
    for (const c of chunks) fs.writeFileSync(path.join(chunkDir, `${c.hash}.json`), c.body);
    const manifest = {
      v: 1,
      chunks: chunks.map((c) => ({
        url: `${FTM_PUBLIC_PREFIX}${venue}/pack/chunks/${c.hash}.json`,
        files: c.files,
      })),
    };
    fs.writeFileSync(path.join(packDir, "manifest.json"), `${JSON.stringify(manifest)}\n`);
    const bytes = chunks.reduce((n, c) => n + c.body.length, 0);
    summary.push({ venue, files: entries.length, chunks: chunks.length, bytes, missing });
    log(
      `[ftm-packs] ${venue}: ${entries.length} files → ${chunks.length} chunks (${(bytes / 1e6).toFixed(1)} MB raw)` +
        (missing.length ? `; ${missing.length} listed but missing: ${missing.join(", ")}` : ""),
    );
  }
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildFtmPacks();
}
