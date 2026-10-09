/**
 * Find the Moment — window-file loader with "pack" support.
 *
 * Every meeting has its own windows file ({start,end,text}[]). Searching "All
 * meetings" used to fetch every file (77 BOS, 276 School Board) six at a time and
 * wait for all of them. On a cold CDN edge (after each deploy) that took up to
 * ~50 s. `scripts/ftm-packs.mjs` now bundles each venue's files into a few
 * content-hashed chunks (pack/manifest.json → pack/chunks/{hash}.json), one
 * file per line, which this loader streams so results can show as each meeting
 * arrives.
 *
 * `fetchFtmSlices(url, { pack: true })` resolves with exactly the same windows as
 * `fetch(url).json()`: from the pack when the venue manifest lists that URL,
 * otherwise (or on any pack error) from the per-meeting file itself.
 */

export type FtmSlice = { start: number; end: number; text: string };

type PackLine = { u: string; w: [number, number, string][] };
type Manifest = Map<string, string>; // windows file URL → chunk URL

const PREFIX = "/files/find-the-moment/";
/** Max parallel per-meeting (non-pack) fetches. */
const DIRECT_CONCURRENCY = 12;

const packed = new Map<string, FtmSlice[]>();
const waiters = new Map<string, Array<(v: FtmSlice[] | null) => void>>();
const manifests = new Map<string, Promise<Manifest | null>>();
const chunks = new Map<string, Promise<void>>();
const direct = new Map<string, Promise<FtmSlice[]>>();

export class FtmFetchError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
  ) {
    super(`HTTP ${status} for ${url}`);
  }
}

function venueOf(url: string): string | null {
  if (!url.startsWith(PREFIX)) return null;
  const venue = url.slice(PREFIX.length).split("/")[0];
  return venue || null;
}

function getManifest(venue: string): Promise<Manifest | null> {
  let p = manifests.get(venue);
  if (!p) {
    p = fetch(`${PREFIX}${venue}/pack/manifest.json`)
      .then(async (res) => {
        if (!res.ok) return null;
        const body = (await res.json()) as {
          v: number;
          chunks: { url: string; files: string[] }[];
        };
        if (body?.v !== 1 || !Array.isArray(body.chunks)) return null;
        const map: Manifest = new Map();
        for (const c of body.chunks) for (const f of c.files) map.set(f, c.url);
        return map;
      })
      .catch(() => null);
    manifests.set(venue, p);
  }
  return p;
}

function deliver(line: PackLine) {
  if (!line || typeof line.u !== "string" || !Array.isArray(line.w)) return;
  const slices: FtmSlice[] = line.w.map(([start, end, text]) => ({ start, end, text }));
  packed.set(line.u, slices);
  const list = waiters.get(line.u);
  if (list) {
    waiters.delete(line.u);
    for (const resolve of list) resolve(slices);
  }
}

function handleLine(raw: string) {
  const t = raw.trim();
  if (!t.startsWith("{")) return; // "[" / "]" lines
  deliver(JSON.parse(t.endsWith(",") ? t.slice(0, -1) : t) as PackLine);
}

/** Stream one chunk, delivering each meeting's windows as its line arrives. */
function ensureChunk(chunkUrl: string): Promise<void> {
  let p = chunks.get(chunkUrl);
  if (!p) {
    p = (async () => {
      const res = await fetch(chunkUrl);
      if (!res.ok) throw new FtmFetchError(res.status, chunkUrl);
      if (res.body && typeof TextDecoderStream !== "undefined") {
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += value;
          let nl = buf.indexOf("\n");
          while (nl !== -1) {
            handleLine(buf.slice(0, nl));
            buf = buf.slice(nl + 1);
            nl = buf.indexOf("\n");
          }
        }
        if (buf) handleLine(buf);
      } else {
        for (const line of (await res.text()).split("\n")) handleLine(line);
      }
    })();
    // A failed chunk can be retried by a later search.
    p.catch(() => chunks.delete(chunkUrl));
    chunks.set(chunkUrl, p);
  }
  return p;
}

let directActive = 0;
const directQueue: Array<() => void> = [];

async function withDirectSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (directActive >= DIRECT_CONCURRENCY) {
    await new Promise<void>((resolve) => directQueue.push(resolve));
  }
  directActive += 1;
  try {
    return await fn();
  } finally {
    directActive -= 1;
    directQueue.shift()?.();
  }
}

function fetchDirect(url: string): Promise<FtmSlice[]> {
  let p = direct.get(url);
  if (!p) {
    p = withDirectSlot(async () => {
      const res = await fetch(url);
      if (!res.ok) throw new FtmFetchError(res.status, url);
      return (await res.json()) as FtmSlice[];
    });
    p.catch(() => direct.delete(url));
    direct.set(url, p);
  }
  return p;
}

async function fetchViaPack(url: string): Promise<FtmSlice[] | null> {
  const venue = venueOf(url);
  if (!venue) return null;
  const manifest = await getManifest(venue);
  const chunkUrl = manifest?.get(url);
  if (!chunkUrl) return null;
  const hit = packed.get(url);
  if (hit) return hit;
  return new Promise<FtmSlice[] | null>((resolve) => {
    const list = waiters.get(url) ?? [];
    list.push(resolve);
    waiters.set(url, list);
    const settle = () => {
      // Chunk finished (or failed) without this file: fall back to the direct file.
      const current = waiters.get(url);
      if (!current) return;
      const rest = current.filter((r) => r !== resolve);
      if (rest.length) waiters.set(url, rest);
      else waiters.delete(url);
      resolve(packed.get(url) ?? null);
    };
    ensureChunk(chunkUrl).then(settle, settle);
  });
}

/**
 * Windows for one meeting file. With `pack: true` (use for multi-meeting
 * searches) the venue pack is used when it lists the URL; the per-meeting file
 * is the fallback either way, so results are the same.
 */
export async function fetchFtmSlices(
  url: string,
  opts: { pack?: boolean } = {},
): Promise<FtmSlice[]> {
  const hit = packed.get(url);
  if (hit) return hit;
  if (opts.pack) {
    try {
      const viaPack = await fetchViaPack(url);
      if (viaPack) return viaPack;
    } catch {
      // fall through to the per-meeting file
    }
  }
  return fetchDirect(url);
}

/** Use the pack once a search spans more than this many meetings. */
export const FTM_PACK_MIN_MEETINGS = 4;
