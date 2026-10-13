#!/usr/bin/env bash
# FTM thumbnails for every venue: new meetings get one, changed recap text re-renders. Safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."
npx tsx scripts/ftm-thumbs-manifest.ts > /tmp/ftm-thumbs.json
python3 scripts/ftm-thumbs.py /tmp/ftm-thumbs.json "$@"
