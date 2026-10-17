#!/usr/bin/env python3
"""Budget pages (Manassas, Fairfax City, Albemarle): copy the SMALL source PDFs into public/files/<venue>-budget/
and write search extracts ({id,label,kind,href,file,text}) for every document, hosted or not.
Big books are NOT copied; their extract href points to the official URL (MANIFEST.tsv).
Sources: /workspace/budget-<venue>/ (PDFs, MANIFEST.tsv, txt/ pdftotext extracts)."""
import csv, json, os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HOST_MAX = 2_200_000  # bytes; anything larger is linked, not hosted
SKIP = {"FY2026-adopted-budget-complete"}  # comparison book: linked only, not searched
def clean(t):
    t = t.replace("\x00", "")
    t = "\n".join(re.sub(r"[ \t]{2,}", "  ", l).strip() for l in t.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", t)
total = 0
for venue in ["manassas-council", "manassas-schools", "fairfax-city-council", "fairfax-city-schools", "albemarle-bos", "albemarle-schools"]:
    src = f"/workspace/budget-{venue}"
    out = os.path.join(ROOT, "public/files", f"{venue}-budget")
    os.makedirs(os.path.join(out, "extracts"), exist_ok=True)
    rows = list(csv.DictReader(open(f"{src}/MANIFEST.tsv"), delimiter="\t"))
    vt = 0
    for r in rows:
        stem = r["file"][:-4]
        if stem in SKIP: continue
        hid = f"{venue}-{stem}"
        size = os.path.getsize(f"{src}/{r['file']}")
        if size <= HOST_MAX:
            shutil.copyfile(f"{src}/{r['file']}", f"{out}/{hid}.pdf"); href = f"/files/{venue}-budget/{hid}.pdf"; vt += size
        else:
            href = r["url"]
        text = clean(open(f"{src}/txt/{stem}.txt", encoding="utf-8", errors="replace").read())
        ej = f"{out}/extracts/{hid}.json"
        json.dump({"id": hid, "label": stem, "kind": "", "href": href, "file": r["file"], "text": text}, open(ej, "w", encoding="utf-8"), ensure_ascii=False)
        vt += os.path.getsize(ej)
        print(f"{venue}\t{hid}\t{'HOST' if href.startswith('/') else 'LINK'}\t{size/1e6:.2f}MB pdf\t{os.path.getsize(ej)/1e6:.2f}MB extract")
    print(f"{venue} TOTAL {vt/1e6:.2f} MB"); total += vt
print(f"ALL {total/1e6:.2f} MB")
