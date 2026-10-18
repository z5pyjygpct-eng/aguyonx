#!/usr/bin/env python3
"""Build src/lib/osint-va.json from /workspace/osint-va/osint-va-list.csv (226 Virginia research sources).

- Groups by the CSV's 22 categories (order of first appearance).
- Paid rule: tagged Paid when the Name contains "(paid)" or the Note says "paid" or "subscription"
  (the "(paid)" suffix is stripped from the display name; the tag shows instead). "Free account"/"free key" is not Paid.
- Dedupes against src/content/library.ts as shown on /library (src/lib/library-overrides.json applied; existing entries win) by normalized URL; close name matches are
  reported in dupes for review but only merged when listed in NAME_MERGES.
Usage: python3 tools/library/build_osint.py [csv]
"""
import csv, difflib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "/workspace/osint-va/osint-va-list.csv")
OUT = ROOT / "src/lib/osint-va.json"

def norm(u: str) -> str:
    u = u.strip().lower()
    u = re.sub(r"^https?://", "", u)
    u = re.sub(r"^www\.", "", u)
    u = re.sub(r"(index\.(html?|php|aspx?))$", "", u)
    return u.rstrip("/")

def nname(s: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", re.sub(r"\(.*?\)", "", s.lower())).strip()

lib = open(ROOT / "src/content/library.ts").read()
existing = re.findall(r'slug: "([^"]+)",\s*title: "([^"]*)",.*?(?:href|file|tool): "([^"]+)"', lib, re.S)
assert len(existing) == 98, len(existing)
# Apply the page-layer overrides (Scott-approved link fixes/removals) so dedupe matches what /library shows.
OV = json.loads((ROOT / "src/lib/library-overrides.json").read_text())
existing = [(slug, t, OV["href"].get(slug, h)) for slug, t, h in existing if slug not in OV["exclude"]]
by_url = {norm(h): (slug, t) for slug, t, h in existing}

# Name matches that point at the same resource via a different URL (reviewed by hand). Empty unless found.
NAME_MERGES: dict[str, str] = {}

rows = list(csv.DictReader(open(SRC, newline="")))
assert len(rows) == 226, len(rows)
cats: dict[str, list] = {}
dupes, near = [], []
for r in rows:
    name, url, note, ver = r["Name"].strip(), r["URL"].strip(), r["Note"].strip(), r["Verification"].strip()
    paid = bool(re.search(r"\(paid\)", name, re.I) or re.search(r"\bpaid\b|subscription", note, re.I))
    disp = re.sub(r"\s*\(paid\)\s*", " ", name, flags=re.I).strip()
    hit = by_url.get(norm(url)) or (NAME_MERGES.get(name) and next((e[:2] for e in existing if e[0] == NAME_MERGES[name]), None))
    if hit:
        dupes.append({"category": r["Category"], "name": name, "url": url, "existingSlug": hit[0], "existingTitle": hit[1]})
        cats.setdefault(r["Category"], [])
        continue
    best = max(existing, key=lambda e: difflib.SequenceMatcher(None, nname(name), nname(e[1])).ratio())
    ratio = difflib.SequenceMatcher(None, nname(name), nname(best[1])).ratio()
    if ratio >= 0.8:
        near.append({"name": name, "url": url, "existing": best[1], "existingUrl": best[2], "ratio": round(ratio, 2)})
    status = "ok" if ver.startswith("Verified 200") else "unconfirmed"
    cats.setdefault(r["Category"], []).append({"name": disp, "url": url, "note": note, "paid": paid, "check": status})

out = {
    "source": "osint-va-list.csv",
    "total": len(rows),
    "shown": sum(len(v) for v in cats.values()),
    "categories": [{"name": k, "items": v, "merged": [d for d in dupes if d["category"] == k]} for k, v in cats.items()],
}
OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(f"categories={len(cats)} shown={out['shown']} dupes={len(dupes)} paid={sum(i['paid'] for v in cats.values() for i in v)}")
for d in dupes: print("DUPE", d["name"], "->", d["existingTitle"], d["url"])
for n in near: print("NEAR", n)
