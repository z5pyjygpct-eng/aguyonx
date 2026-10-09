# Find the Moment: full machine transcripts and meeting recaps

Find the Moment (FTM) searches county meeting text and jumps the official video to
that second. Two text sources exist per meeting:

| Source | File | Notes |
| --- | --- | --- |
| County auto-captions (index) | `public/files/find-the-moment/loudoun-bos/{meetingId}.json` | Always kept. Not quote-grade. |
| Machine transcript (speech-to-text) | `public/files/find-the-moment/loudoun-bos/transcripts/{meetingId}.json` | Primary search source when listed in the manifest. Not quote-grade either: check the video before quoting. |

Both files use the same shape: an array of `{ "start": seconds, "end": seconds, "text": "..." }`.
Hits jump the video with the meeting's existing jump URL (`loudounMeetingJumpUrl`; eScribe/ISI
MP4 `#t=` or Granicus `?entrytime=`), exactly like caption hits.

The manifest is `src/content/ftm-transcripts.ts` (`FTM_TRANSCRIPTS`). If a meeting is listed
there, both FTM search boxes (Loudoun County page and the County + Schools page) search
the transcript for that meeting, label each hit **Machine transcript**, and show:
"Machine transcript (speech-to-text); check the video before quoting."
The Loudoun County box also has a **Captions only** switch that searches the county captions instead.

## Search packs (fast "All meetings" search)

Searching every meeting used to download every per-meeting file (77 County, 276 Schools)
six at a time and show nothing until the last one arrived. Right after a deploy the CDN
edge is cold, so each file was a cache miss and a first search could take ~50 s.

Now `scripts/ftm-packs.mjs` bundles each venue's files into a few chunks:

| File | Notes |
| --- | --- |
| `public/files/find-the-moment/{venue}/pack/manifest.json` | `{ v: 1, chunks: [{ url, files: [windowsUrl, …] }] }` |
| `public/files/find-the-moment/{venue}/pack/chunks/{sha256-12}.json` | ~1.5 MB raw each; served with `cache-control: public, max-age=31536000, immutable` (hash in the name) |

A chunk is a JSON array with **one file per line**, so the browser streams it and shows
hits as each meeting arrives (newest first):

```
[
{"u":"/files/find-the-moment/loudoun-bos/transcripts/escribe-3a6eea40.json","w":[[start,end,"text"],…]},
{"u":"/files/find-the-moment/loudoun-bos/escribe-3a6eea40.json","w":[…]},
…
]
```

`u` is the exact URL the site would otherwise fetch (a caption `windowsUrl` or a transcript
`url`); `w` holds that file's windows unchanged. Order follows the catalogs
(`ftm-transcripts.ts`, then `loudoun.ts`; `lcps.ts` for Schools).

- **Built automatically** at the start of every `vite build` (`ftmPacksPlugin` in
  `vite.config.ts`), so a deploy always matches the per-meeting files. The `pack/` folders are
  git-ignored. Run `npm run ftm:packs` to build them for local preview.
- **Per-meeting files stay the source of truth** and are still used for single-meeting
  searches and as the fallback when a pack is missing or fails (`src/lib/ftm-pack.ts`).
  Results are identical either way (`scripts/ftm-packs.test.mjs` checks every file round-trips).
- A new meeting or transcript needs nothing extra: add its file and catalog entry as below,
  and the next build packs it.

## Add the next meeting

1. **Index the captions first** (the meeting must already be in `LOUDOUN_MEETINGS` in
   `src/content/loudoun.ts`). See `scripts/loudoun-caption-windows.mjs`.
2. **Transcribe the audio** on the Mac mini (whisper.cpp, model large-v3-turbo). Use
   `-mc 0` (no text context carried between windows) to avoid repeat loops, and write SRT
   and JSON (`-osrt -oj`). Use the same video file the site jumps to (the ISI MP4 for eScribe
   meetings) so timestamps line up.
3. **Spot-check** 3 or 4 places against the video, and look for repeat loops (the same line
   over and over). Re-run any bad stretch with `-mc 0`.
4. **Build the search file**:

   ```bash
   node scripts/ftm-transcript-windows.mjs /path/to/whisper-run.srt escribe-xxxxxxxx \
     loudoun-bos /path/to/county-captions.vtt
   ```

   The captions file is optional but recommended: whisper sometimes stretches one segment
   over a long silence, so a hit would jump too early. For segments 20 s or longer, the script
   re-times each sentence to the county caption cue with the same opening words. Whisper's
   text is never changed, only those start times.

   This writes `public/files/find-the-moment/loudoun-bos/transcripts/escribe-xxxxxxxx.json`
   (segments merged into ~15–40 s windows that end at sentence breaks; runs of 3+ identical
   back-to-back lines collapsed) and prints a manifest snippet.
5. **Add the manifest entry** to `FTM_TRANSCRIPTS` in `src/content/ftm-transcripts.ts`
   (`meetingId`, `url`, `windowCount`, `wordCount`, `engine`, `generated`, `sourceFile`,
   optional `note`).
6. `npm run typecheck && npm run build` (the build also rebuilds the search packs), then
   deploy a preview and search a known phrase.

## Meeting recaps

Recaps live in `src/content/loudoun-recaps.ts` (`LOUDOUN_RECAPS`) and render at
`/counties/loudoun/recaps/{slug}`. Rules:

- **Decisions and votes come only from official county records**: the eScribe minutes or
  the county Action Report (posted to the meeting's folder on the county Laserfiche portal,
  usually a few days after the meeting). Cite and link each one in `decisions[]`.
- Until the record is posted, keep `official.votesPosted: false`. The page then says
  "Official vote record not yet posted" and links the agenda. Never infer an outcome or a
  vote from the video or the transcript.
- `agenda[]` lists items as the county published them, with staff-report links. Label them
  as agenda items, not results.
- `moments[]` (3–5): a neutral one-line topic and the video second. Any `quote` must be
  verbatim from the transcript (the page flags it as machine-transcribed). Do not name a
  speaker unless the agenda, the captions, or the chair's recognition clearly identifies them.
- Neutral wording only; commentary goes in posts, not on this page.

When the Action Report is posted: fill `decisions[]` (item, action as recorded, tally as
recorded, source link), set `votesPosted: true`, and update `checkedLabel`.

## Downloadable transcript (PDF + text) for a recap

Built from the same cleaned windows file the search uses, so wording and timestamps match
the site exactly (no edits, no speaker names added).

1. Copy `scripts/transcript-meta/loudoun-bos-2026-10-06.json` to a new file for the meeting
   and fill in `windowsFile`, `outBase`, `title`, `date`, `place`, `length`, the official
   video/agenda `links`, `engine`, and `generated`.
2. Build both files (Playwright; point `CHROME` at a Chrome binary if Playwright's own
   browser is not installed):

   ```bash
   CHROME=/usr/bin/google-chrome node scripts/ftm-transcript-download.mjs scripts/transcript-meta/<meeting>.json
   ```

   Output: `{outBase}.pdf` (Coraggio Consulting logo on the first and last page, header and
   "Page X of Y" footer on every page, real selectable text) and `{outBase}.txt`. Both carry
   the notice: "Machine transcript (speech-to-text) produced by Coraggio Consulting. Not an
   official county record. Names and numbers may be misspelled; check the video at the
   timestamp before quoting."
3. Add `transcriptDownloads: { pdfUrl, txtUrl, pdfNote }` to the meeting's entry in
   `src/content/loudoun-recaps.ts`. The recap page then shows a "Download full transcript"
   block with PDF and Text links.
4. Rebuild the downloads whenever the transcript windows file is rebuilt.
