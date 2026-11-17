# Emergency Monitor storage format (v1)

Status: preview (`preview/emergency-archive`). Nothing here is live until Scott approves.

## Why

`src/content/emergency-log.json` held every window ever written (53 MB on Nov 17, ~+0.6–0.9 MB per
hourly window) and the whole file was bundled into `/emergency-monitor`, so the page shipped ~77 MB and
the file would pass GitHub's 100 MB per-file limit around Nov 19. Each hourly window re-lists every
active alert, so ~70–85% of the bytes are carry-forward repeats.

## Layout

| Path | Committed? | Written by | Contents |
|---|---|---|---|
| `src/content/emergency-log.json` | yes | Emergency bot, then the split script | Windows within **48 h of the newest window**. Same schema as before: `{"entries":[...]}`, newest first. Minified. |
| `data/emergency-archive/YYYY-MM-DD.json` | yes | split script only | Every older window, grouped by **America/New_York** calendar date: `{"date":"YYYY-MM-DD","entries":[...]}`, newest first, minified. Entry objects are copied byte-for-byte. A day over 40 MB becomes `YYYY-MM-DD-1.json`, `-2.json`, … |
| `data/emergency-archive/index.json` | yes | split script only | `{"days":[{"date","files":[...],"count","items","first","last"}]}`, newest first. `count` = windows, `items` = alert rows, `first`/`last` = oldest/newest window datetime. |
| `public/emergency-data/*.json` | **no** (git-ignored) | `vite build` (scripts/build-emergency-data.mjs) | Compact runtime files the page fetches. |
| `virtual:emergency-head` | no | `vite build` | Bundled into the page: manifest of every window + the newest window. |

Rules:
- A window (keyed by its `datetime`) lives in exactly one canonical place: the main file **or** one archive file. Never both.
- The main file wins if the same `datetime` appears in both (so correcting a recent window is just editing the main file).
- The archive sits in `data/`, not `public/`: the raw days are never served or deployed; the page uses the much smaller compact copies. (Emergency's original proposal put them in `public/`; moved so every deploy doesn't ship hundreds of MB of raw JSON that nothing fetches.)
- Every file stays under 45 MB (the split script refuses to write a bigger one).

## Writer steps (Emergency bot), each hourly run

1. Prepend the new window to `src/content/emergency-log.json` exactly as today (same entry schema;
   any formatting is fine).
2. Run `node scripts/split-emergency-archive.mjs` from the repo root. It is idempotent: it merges the
   main file with `data/emergency-archive/`, keeps the newest 48 h in the main file (minified), moves
   older windows into their ET day file, rewrites `index.json`, and only touches files whose bytes change.
3. `git add src/content/emergency-log.json data/emergency-archive/` and commit/push as today.
   (Do not add `public/emergency-data/`; it is generated at build.)
4. Optional guard: `node scripts/split-emergency-archive.mjs --check` exits 1 if a split is pending.

Edits to an archived window: edit it in its day file (or put the corrected window in the main file;
the main file wins and the next split moves it back). Never change an existing window's `datetime`
or its item titles: the per-alert anchors are built from them.

If the main file ever approaches ~30 MB (it was 16.6 MB for 48 h on Nov 17), run with `--hours 24`.
The page does not depend on how many hours the main file keeps.

## Runtime (compact) format, generated at build

`scripts/build-emergency-data.mjs` reads all canonical windows and writes:
- `recent.<sha12>.json`: windows within 24 h of the newest window (what *Last 2 hours* and *Last 24 hours* need);
- `day-YYYY-MM-DD.<sha12>.json`: each older ET day (only windows older than 24 h);
- a group over 8 MB compact is split into parts `recent-1`, `recent-2`, … / `day-YYYY-MM-DD-1`, …
Names are content-hashed, so files are immutable and cacheable.

Each file is `encodeCompact(entries)` (scripts/emergency-format.mjs; decoder in src/lib/emergency-data.ts):

```
{ "v": 1,
  "s": [string, ...],          every distinct string once (titles, summaries, status notes, URLs, labels, region names)
  "l": [[url, label, ...], ...] distinct link lists (s indexes; label -1 if absent)
  "i": [[title, summary, location, type, severity, status, text, links(, extra)], ...]
                                distinct alert snapshots (s indexes or -1; links = l index or -1;
                                extra = s index of a JSON object for any other key or non-string value)
  "w": [[datetime, [section, item, item, ...], ...], ...]
                                windows newest first; section = s index of a region key or
                                "#trending" / "#threats"; items in original order; unknown top-level
                                entry keys kept as a trailing {"x": sIdx}
}
```

Per-window text is preserved exactly: each window references its own snapshot, and a snapshot changes
whenever its status note, summary or links change; only the changed strings are new, the stable ones
(title, location, links, type, severity) are shared. Decoding returns the original entries exactly
(verified: deep-equal on all 191 windows / 29,089 rows on Nov 17).

The bundled head is `{v, newest, files:[{key,url,bytes}], windows:[[datetime,itemCount,fileIndex]], head: compact(newest window)}`.

## Anchors

Per-alert ids are unchanged: `em-<compact window datetime>-<title slug ≤72>`, with `-2`, `-3` only for
collisions inside one window. They are computed per window as windows load, so they are byte-identical to
the ids computed over the full log. A deep link to an archived window is resolved by parsing the datetime
from the id, looking it up in the manifest and fetching just that file.
