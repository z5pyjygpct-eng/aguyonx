#!/usr/bin/env bash
# Standard recap enrichment for every non-Loudoun venue (run by the morning ingest, the
# recap/transcript routines and the Official votes watch AFTER new recaps/transcripts land,
# BEFORE build/commit). Official records only; transcript is used for timing only.
#   Fairfax City council + schools -> scripts/fairfax-recap-fill.py (Granicus agenda/minutes/index)
#   Fairfax County BOS/FCPS + PWC BOCS/PWCS -> scripts/ffx-pw-votes.py (Clerk's Board Summary, BoardDocs
#                                     minutes, PWC Board Brief); votes only, each with its source link
#   Albemarle schools              -> scripts/albemarle-recap-fill.py (ESB agenda + adopted minutes)
#   House / Senate                 -> LIS roll calls already built by va-house-build.py / va-senate-build.py;
#                                     key moments wait for transcripts ("Full recap after transcript").
#   Board of Ed / Albemarle BOS    -> no recaps yet (no transcripts); nothing to enrich.
# Both fill scripts merge and never remove previously published moments/agenda/decisions.
set -u
cd "$(dirname "$0")/.."
python3 - <<'PY' || echo "fairfax-recap-fill failed (left previous fill)"
import runpy
runpy.run_path("scripts/fairfax-recap-fill.py", run_name="enrich")["main"]()
PY
python3 scripts/ffx-pw-votes.py || echo "ffx-pw-votes failed (left previous fill)"
python3 scripts/albemarle-recap-fill.py || echo "albemarle-recap-fill failed (left previous fill)"
bash scripts/ftm-thumbs.sh || true
