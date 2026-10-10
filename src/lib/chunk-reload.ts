/**
 * Stale-deploy recovery. After a new deploy, an already-open tab still points
 * at the previous build's hashed /assets/*.js chunks, which the production
 * domain no longer serves (404). Navigating then fails with "Importing a module
 * script failed" (Safari) / "Failed to fetch dynamically imported module"
 * (Chrome) / "error loading dynamically imported module" (Firefox). A single
 * full reload fetches fresh HTML + the new chunk names and fixes it.
 */
const KEY = "aguyonx:chunk-reload-at";
const WINDOW_MS = 30_000;

const PATTERNS = [
  /importing a module script failed/i,
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /unable to preload css/i,
  /chunkloaderror/i,
  /loading (css )?chunk [\w-]+ failed/i,
];

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const e = error as { name?: unknown; message?: unknown };
  const text = `${typeof e.name === "string" ? e.name : ""} ${
    typeof e.message === "string" ? e.message : typeof error === "string" ? error : ""
  }`;
  return PATTERNS.some((p) => p.test(text));
}

/** Reload once; returns false if we already reloaded recently (avoid loops). */
export function reloadForStaleChunk(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (last && Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* storage blocked: still reload once per page life */
  }
  window.location.reload();
  return true;
}

/** Inline <head> script: runs before any module so it catches early failures. */
export const CHUNK_RELOAD_INLINE_SCRIPT = `(function(){var K=${JSON.stringify(KEY)},W=${WINDOW_MS};var P=${JSON.stringify(PATTERNS.map((p) => p.source))}.map(function(s){return new RegExp(s,"i")});function m(e){if(!e)return false;var t=(e.name||"")+" "+(e.message||(typeof e==="string"?e:""));return P.some(function(r){return r.test(t)})}function r(){try{var l=+sessionStorage.getItem(K)||0;if(l&&Date.now()-l<W)return false;sessionStorage.setItem(K,String(Date.now()))}catch(_){}location.reload();return true}window.addEventListener("vite:preloadError",function(ev){if(r())ev.preventDefault()});window.addEventListener("unhandledrejection",function(ev){if(m(ev.reason))r()});window.addEventListener("error",function(ev){if(m(ev.error||ev.message))r()})})();`;
