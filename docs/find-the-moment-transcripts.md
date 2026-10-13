# Find the Moment: full machine transcripts and meeting recaps

Find the Moment (FTM) searches county meeting text and jumps the official video to
that second. Two text sources exist per meeting:

| Source | File | Notes |
| --- | --- | --- |
| County auto-captions (index) | `public/files/find-the-moment/loudoun-bos/{meetingId}.json` | Always kept. Not quote-grade. |
| Machine transcript (speech-to-text) | `public/files/find-the-moment/loudoun-bos/transcripts/{meetingId}.json` | Primary search source when listed in the manifest. Not quote-grade either: check the video before quoting. |
| Machine transcript — School Board | `public/files/find-the-moment/loudoun-lcps/transcripts/{meetingId}.json` | Same shape. `meetingId` is the site id (e.g. `2026-09-22-1229286967`), not the Vimeo id. Captions stay at `loudoun-lcps/{vimeoId}.json`. |

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

## Cities: City of Fairfax and City of Manassas (added Oct 10, 2026)

Scope: meetings from 2025-01-01 to present only. Same Mac mini queue, placed after the 2025–26
Loudoun backlog and before the 2023–24 Loudoun rows.

| Venue (`body` / transcript `venue`) | Site page | Source video | mini `provider` | file_key = meetingId | Votes source |
| --- | --- | --- | --- | --- | --- |
| `fairfax-city-council` | `/cities/fairfax-city` | fairfax.granicus.com view_id=13 MediaPlayer page | `granicus-page` | `fxc-{clipId}` | Granicus minutes (`minutesUrl` in the catalog) |
| `fairfax-city-schools` | `/cities/fairfax-city/schools` | same Granicus view | `granicus-page` | `fxc-{clipId}` | Granicus minutes / MetaViewer packet |
| `manassas-schools` | `/cities/manassas/schools` | YouTube (user/manassascityschools) | `youtube` (needs `bin/deno`) | `mcps-{youtubeId}` | BoardDocs go.boarddocs.com/va/mcpsva minutes + motions |
| `manassas-council` | `/cities/manassas` | Wistia channel 8kv434o41i (embedded on regionalwebtv.com/manassascc) | `wistia` | `mcc-{wistiaId}` | manassascity.granicus.com view_id=1 minutes |

Catalog: `src/content/cities-meetings.ts` (`CITY_MEETINGS`, generated by
`/workspace/research/ftm-expansion/build/build_cities.py`); venues/jump URLs in `src/content/cities.ts`;
recaps in `src/content/city-recaps.ts` (`CITY_RECAPS`, renders at `/cities/{city}/recaps/{slug}`,
same rules as Loudoun: votes only from official minutes). Cities have **no caption index**, so
search is transcript-only; meetings without a transcript show as "Queued".

Morning ingest for a city meeting (mini outputs land in `transcripts/{body}/{file_key}.*`):

```bash
node scripts/ftm-transcript-windows.mjs {file_key}.srt {file_key} {body}
```

(no captions file). Then add an `FTM_TRANSCRIPTS` entry with `meetingId: "{file_key}"`,
`venue: "{body}"`, `url: "/files/find-the-moment/{body}/transcripts/{file_key}.json"`. The pack
for that venue is built automatically once it has at least one entry.

**Homepage buttons:** the Find the Moment box shows FAIRFAX CITY COUNCIL / FAIRFAX CITY SCHOOLS /
MANASSAS CITY COUNCIL / MANASSAS SCHOOLS / ALBEMARLE SCHOOLS / ALBEMARLE SUPERVISORS under the Loudoun buttons, but each one appears only when
its venue has at least one `FTM_TRANSCRIPTS` entry (`cityVenueLive` in `src/content/cities.ts`,
used by `src/components/site/home-find-the-moment.tsx`). So the morning routine adds a venue's
button simply by posting that venue's first transcript; mention it in the morning recap the day it
first appears, and check the homepage after deploy.

## Albemarle County (launched Oct 13, 2026; moved up from the Nov 1 plan)

Scope: meetings from **2024-01-01** to present (Scott's commitment to the Albemarle GOP). Same
city/venue template (`CITIES` entry `albemarle`, region "Central Virginia", `since: "January 2024"`).
Mini queue: placed at the FRONT (right after the meeting that was mid-transcription on Oct 13):
all 61 `alb-sb-` School Board meetings newest first, then all 97 `alb-bos-` BOS meetings newest
first, then the rest of the existing queue. Catalog built by
`/workspace/research/ftm-expansion/build/build_albemarle.py` → `queue_albemarle.json`, appended to
`CITY_MEETINGS`.

| Venue (`body` / transcript `venue`) | Site page | Source video | mini `provider` | file_key = meetingId | Votes source |
| --- | --- | --- | --- | --- | --- |
| `albemarle-schools` | `/cities/albemarle/schools` | YouTube @k12albemarle (links from k12albemarle.org/school-board/school-board-meeting-videos) | `youtube` (needs `bin/deno`) | `alb-sb-{youtubeId}` | ACPS adopted minutes (BoardDocs) |
| `albemarle-bos` | `/cities/albemarle` | albemarle.granicus.com view_id=1 MediaPlayer page | `granicus-page` | `alb-bos-{clipId}` | adopted BOS minutes / action letters |

Raw Zoom/"file swap" duplicate uploads on the BOS Granicus list (e.g. `BOS_9_16_16`,
`GMT2026...Recording`, `Zoom Swap`) and 0-minute stubs are excluded. Morning ingest is identical
to Fairfax (`fxc-`): `node scripts/ftm-transcript-windows.mjs {file_key}.srt {file_key} {body}`,
then an `FTM_TRANSCRIPTS` entry with `venue: "{body}"` and a recap in `CITY_RECAPS`
(slug `{file_key}`, date-first listing). Packs: both venues are in `FTM_PACK_VENUES`.

## Virginia Senate floor (added Oct 10, 2026)

Scope: 2026 Senate **floor** sessions only (Regular Session Jan 14–Mar 14, Reconvened Apr 22–23,
Special Session I Jun 22/29). 51 streams, queued on the mini after Manassas council, before the
2023–24 Loudoun rows. No committees, no House yet.

| Venue (`body` / transcript `venue`) | Site page | Source video | mini `provider` | file_key = meetingId | Votes source |
| --- | --- | --- | --- | --- | --- |
| `va-senate-floor` | `/general-assembly/senate` | Senate of Virginia YouTube (@SenateofVirginia) "Senate Chamber on YYYY-MM-DD" streams | `youtube` | `vas-{youtubeId}` | LIS roll calls (HISTORY.CSV + VOTE.CSV) |

The Senate Granicus archive (view_id=3) ends Dec 2025, so 2026 video comes from the official
YouTube channel; jump links are `youtube.com/watch?v={id}&t={s}s`.

Files: `src/content/va-senate.ts` (types, helpers, jump URLs, LIS links), `src/content/va-senate-data.ts`
(GENERATED: `SENATE_MEETINGS`, `SENATORS`, `SENATE_RECAPS`), `public/files/va-senate/votes/{date}.json`
(GENERATED: that day's Senate floor roll calls with member-by-member votes). Pages:
`/general-assembly` (index), `/general-assembly/senate` (Find the Moment at top → 40 senators with
LIS member links → Meeting recaps → floor-session list → official doors),
`/general-assembly/senate/recaps/{yyyy-mm-dd}` (one recap per floor day).

**Votes rule:** recap votes come ONLY from LIS public data files
(`https://lis.blob.core.windows.net/lisfiles/{20261|20262}/HISTORY.CSV`, `VOTE.CSV`, `BILLS.CSV`,
`Members.csv`): every Senate history line dated that day with a roll-call ref `SV####`, grouped by
vote (block votes list all bills), linked to `lis.virginia.gov/vote-details/{bill}/{session}/{SV}`.
The tally shown is the one LIS prints in the history line; when the VOTE.CSV member list totals
differently the page says so. 20261 HISTORY also logs June Special Session I votes with 20262 vote
numbers; the script keeps the 20262 copy. Never infer a vote from video or transcript. A day with no
LIS roll call says "No official roll-call votes on record".

Senators: `data/va-senate/senators-lis.json` — name/district/party from the Senate's directory
(apps.senate.virginia.gov/Senator), member numbers matched to LIS `Members.csv` (all 40 match);
links go to `lis.virginia.gov/session-details/20262/member-information/{S0nnn}/member-details`.

Regenerate (box): `python3 scripts/va-senate-build.py` (downloads LIS files to /tmp/lis-cache;
delete the cache to refresh). Re-run it when LIS posts new votes or a new floor stream is added to
`data/va-senate/chamber-2026.tsv`.

Morning ingest for a Senate floor transcript (mini output `transcripts/va-senate-floor/{file_key}.*`):

```bash
node scripts/ftm-transcript-windows.mjs {file_key}.srt {file_key} va-senate-floor
```

Then add an `FTM_TRANSCRIPTS` entry: `meetingId: "{file_key}"`, `venue: "va-senate-floor"`,
`url: "/files/find-the-moment/va-senate-floor/transcripts/{file_key}.json"`. The recap for that
date already exists (votes from LIS); once its transcript is live it shows the Find the Moment link
instead of "Transcripts in progress". Optional: add hand-picked moments only with timestamps from the
transcript, labelled machine-transcribed. The pack for `va-senate-floor` builds automatically.

**Homepage button:** VA SENATE appears in the Find the Moment box (above the city buttons) only once
`va-senate-floor` has at least one `FTM_TRANSCRIPTS` entry (`senateLive()`); mention it in the
morning recap the day it first appears and check the homepage after deploy.

## Standard: per-venue "By the numbers" panel (added 2026-10-12)

Every venue page shows a right-hand "By the numbers" panel beside Find the Moment
(meeting videos, searchable, full transcripts, recaps, hours), counting ONLY that venue.
- City venues (Fairfax, Manassas, Albemarle, ...): automatic via `CityVenuePage` →
  `VenueStats` with `cityMeetingsFor(venue)`. Adding a venue to `CITY_VENUES` + meetings is enough.
- Any new non-city venue page (House delegates, etc.): render
  `<VenueStats heading="By the numbers · {venue}" meetings={VENUE_MEETINGS} recapCount={VENUE_RECAPS.length} />`
  in the same `lg:grid-cols-[minmax(0,1fr)_15rem]` grid. Never a locality-wide total.
- Recap listings are date-first: `{dateLabel} · {title}` (same as Loudoun).

## Standard: city venue page layout (2026-10-13)
- One meeting list (`CityMeetingList`): one-line cards with Year + Type dropdowns; short type from `cityMeetingType()`; badges Recap / Video / Agenda / Minutes / Transcript|Queued. No separate recap list.
- Intro counts line: "N meetings · X searchable now · Y in queue · Next meeting" (if a future-dated meeting exists).
- Recap pages: official links + transcript disclaimer sit in "Sources & downloads" / "About this transcript" expanders.
- Region kicker from `City.region`; footer location from `SiteShell location`.

## Fairfax City recaps: fill from official records (2026-10-13)
After adding/refreshing any Fairfax recap in `src/content/city-recaps.ts`, run:
`python3 scripts/fairfax-recap-fill.py` (or `--only fxc-...,fxc-...`), then build/commit/push.
It writes `src/content/city-recap-fill.json`, merged at load:
- decisions/tallies ONLY from the linked official minutes (council: Granicus Council Actions; schools: minutes PDF);
  work sessions whose minutes record no votes show "No votes recorded"; no minutes yet -> "not yet posted".
- agenda from the Granicus AgendaViewer (empty -> section hidden);
- moments from the official Granicus video index (cuepoints); schools (no index) get vote moments
  paired to the transcript's "all in favor" calls only when counts match exactly. Filler moments
  ("Early agenda business" etc.) are dropped only when real moments exist.
Re-run on recaps still missing minutes (votes-watch) so late-posted minutes fill in.
