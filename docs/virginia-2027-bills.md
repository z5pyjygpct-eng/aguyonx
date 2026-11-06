# Virginia 2027 bills — data contract

The public page at `/virginia-2027-bills` lists **new 2027 filings**. It does not list measures carried over from 2026. Do not copy raw LIS CSV files into this repo or into `public/`.

The React page, filters, and counts read one file:

`src/content/virginia-2027-bills.json`

Replacing that file with a later capture does **not** require editing components, as long as the fields in this document stay present.

## Refresh (repeatable)

Daily filing updates are a handoff from the CoS watch to Web. The ingestion steps live in the research runbook (daily LIS snapshot, join, categorize from title and official summary only). This website does not download those CSVs. When Web receives a new `bills-new-2027.json`:

```bash
node scripts/install-virginia-2027-bills.mjs path/to/bills-new-2027.json
node --experimental-strip-types --test src/lib/virginia-2027-bills.test.ts
npx vite build
```

The install script:

- Accepts only rows with `filing_class` `new_2027_filing` and `carried_over: false`. Any carryover aborts the write.
- Requires a bill number, official title, chamber, status, introduction date, and `https://lis.virginia.gov/` detail URL on every row.
- Deletes `source_fields` (the raw LIS column echo) before writing.
- Leaves every other sourced field as it arrived, including null summaries and null committees.
- Writes `src/content/virginia-2027-bills.json` and does not edit `src/routes/virginia-2027-bills.tsx`.

Official files the runbook reads (link out; do not vendor them):

- `https://lis.blob.core.windows.net/lisfiles/20271/BILLS.CSV`
- `https://lis.blob.core.windows.net/lisfiles/20271/HISTORY.CSV`
- `https://lis.blob.core.windows.net/lisfiles/20271/Summaries.csv`
- `https://lis.blob.core.windows.net/lisfiles/20271/Sponsors.csv`
- `https://lis.blob.core.windows.net/lisfiles/20271/Members.csv`
- `https://lis.blob.core.windows.net/lisfiles/20271/Committees.csv`

Party is not in those CSVs. The ledger joins it from chamber roster snapshots. This repo does not publish those snapshots.

## Shape the page reads

Top level: `meta`, `taxonomy`, `bills`.

`meta` used on the page: `session_code`, `session_label`, `captured_at`, `source_primary`, `sources_joined`, `counts`, `publish_status`, `subset`, `notes`.

`taxonomy[]`: `id`, `label`. Optional `keywords` are unused by the page. Category names come from this list, then from the bill's own `category_label` if an id is new.

Each `bills[]` row:

| Field | Shown as |
| --- | --- |
| `bill_number` | Card heading |
| `measure_kind` | Under the number (House Bill, Senate Bill, Senate Resolution, …) |
| `title` | Official title, unedited |
| `chamber` | Chamber filter and card |
| `introduction_date` | Introduced date, as written (`M/D/YYYY`) |
| `chief_patron_name`, `chief_patron_id`, `sponsors[]` | Patrons. Role is Delegate if the member id starts with `H`, Senator if it starts with `S`. Anything else is shown without a role word. |
| `sponsors[].patron_type` | Printed as stored (`1 - Chief Patron`, `2 - Chief Co-Patron`, …) |
| `chief_patron_party`, `chief_patron_party_code`, `chief_patron_party_source` | Party line, only when the code is present. Co-patrons get a party only if a future row actually carries one. |
| `house_committee_name` / `house_committee_id`, `senate_committee_*` | Committee line. If both names are null, the card says the committee is not in this LIS capture. |
| `status_label` | Status filter and card |
| `lis_detail_url` | Official LIS link |
| `lis_text_url` | Bill text link when it is a non-empty URL. Otherwise the card says the text link is not in this capture. |
| `summary_type`, `summary_plain` | Official summary when `summary_plain` is non-empty. Otherwise the card says Summaries.csv has no row. |
| `categories[]` | Editorial category, confidence, evidence, evidence source |
| `category_ids`, `primary_category_*` | Counts and the primary mark. A bill counts once per category id even if listed twice. |
| `filing_class`, `carried_over` | Gate. Anything else is withheld and called out. Not shown as a filing. |
| `history_event_count` | Mentioned in the source note only. No invented timeline. |

Not published: `source_fields`, raw CSV snapshots, roster JSON.

## Filters and counts

All filters AND together. An empty filter matches every new filing.

- Search: bill number, official title, patron names (chief and sponsors). `SB837` and `sb 837` both match. Summary text is not searched.
- Category: bill's category ids. Secondary categories count. Counts on the chips are for the full new-filing set, so they do not shrink when another filter is on.
- Patron: chief patron or any sponsor, labeled Delegate or Senator from the member id.
- Chamber: `chamber`.
- Party: chief patron party code. The Republican and Democrat buttons set this same filter and read `chief_patron_party_code`. A co-patron does not change it. `missing` is offered in the party menu only when some chief patron has no code.
- Status: exact `status_label`.

Sort is newest `introduction_date` first, then bill number. Sorting does not drop rows. The default page (no query string) shows every new filing.

## Categories are editorial

They are not LIS subject codes. Confidence stays the value in the file:

- `high` — official summary supports the category
- `medium` — official title only
- `low` — thin title, provisional
- `unsupported` — no category justified

Do not invent a summary, a sponsor, a status, a party, or a subject to fill a hole. Leave the null and let the page say it is missing.

## Page

- The route is public. The sitemap builder includes it.
- Home links to it. Other Resources and the footer Virginia column do too.
- Build check for this page is `npx vite build`.
- Official LIS links, the capture time, editorial categories, and missing-data notes stay on the page. Do not fill a blank with a guessed summary, sponsor, status, or party.
