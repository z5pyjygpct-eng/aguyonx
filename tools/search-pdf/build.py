"""Full-text words for site search from the PDFs we host (investigations, delegate/senator papers, budget books).
Run locally (needs poppler pdftotext): python3 tools/search-pdf/build.py → public/files/search/pdf-words.json
Stores each PDF's distinct words (3+ letters), not its text. Re-run when PDFs change."""
import json, os, re, subprocess, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DIRS = ["investigations", "delegates", "senators", "lcps-budget", "loudoun-bos-budget", "albemarle-bos-budget", "albemarle-schools-budget", "manassas-council-budget", "manassas-schools-budget"]
out = {}
for d in DIRS:
    p = os.path.join(ROOT, "public/files", d)
    if not os.path.isdir(p): continue
    for f in sorted(os.listdir(p)):
        if not f.endswith(".pdf"): continue
        t = subprocess.run(["pdftotext", "-q", os.path.join(p, f), "-"], capture_output=True, text=True).stdout
        t = unicodedata.normalize("NFKD", t.lower())
        words = sorted({w for w in re.findall(r"[a-z0-9]+", t) if len(w) >= 3 and not w.isdigit()})
        out[f"/files/{d}/{f}"] = " ".join(words)
json.dump(out, open(os.path.join(ROOT, "public/files/search/pdf-words.json"), "w"), separators=(",", ":"))
print(len(out), "pdfs", os.path.getsize(os.path.join(ROOT, "public/files/search/pdf-words.json")) // 1000, "KB")
