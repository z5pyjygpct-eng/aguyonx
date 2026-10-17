#!/usr/bin/env python3
"""Copy the light Loudoun County FY2027 budget PDFs into public/files/loudoun-bos-budget/ and build
search extracts (same JSON shape as /files/lcps-budget/extracts: {id,label,kind,href,file,text}).
Source PDFs + pdftotext extracts: /workspace/bos-budget/ (downloaded from loudoun.gov; see SOURCES.tsv).
Not hosted (too heavy): complete book (54 MB), CIP-04 transportation (35 MB), FY26 book — linked to loudoun.gov.
Reused at zero bytes from /files/lcps-budget/: executive summary, CIP school projects, Budget in Brief."""
import json, os, re, shutil, sys
SRC = "/workspace/bos-budget"
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public/files/loudoun-bos-budget")
FILES = [  # (source stem, hosted id, label, kind)
    ("FY2027-adopted-01-intro-toc", "FY2027-loudoun-adopted-01-introduction", "FY2027 Adopted Budget · Introduction & Contents", "BOS Adopted"),
    ("FY2027-adopted-03-general-fund-revenue", "FY2027-loudoun-adopted-03-general-fund-revenue", "FY2027 Adopted Budget · General Fund Revenue", "BOS Adopted"),
    ("FY2027-adopted-04-department-summaries", "FY2027-loudoun-adopted-04-department-summaries", "FY2027 Adopted Budget · Department Summaries", "BOS Adopted"),
    ("FY2027-adopted-05-miscellaneous", "FY2027-loudoun-adopted-05-miscellaneous", "FY2027 Adopted Budget · Miscellaneous", "BOS Adopted"),
    ("FY2027-adopted-06-other-funds", "FY2027-loudoun-adopted-06-other-funds", "FY2027 Adopted Budget · Other Funds", "BOS Adopted"),
    ("FY2027-adopted-07-debt-service", "FY2027-loudoun-adopted-07-debt-service", "FY2027 Adopted Budget · Debt Service", "BOS Adopted"),
    ("FY2027-adopted-08-fiscal-trends", "FY2027-loudoun-adopted-08-fiscal-trends", "FY2027 Adopted Budget · Fiscal Trends & Glossary", "BOS Adopted"),
    ("FY2027-adopted-CIP-01-overview", "FY2027-loudoun-adopted-CIP-01-overview", "FY2027–FY2032 Adopted CIP · Overview", "BOS Adopted"),
    ("FY2027-adopted-CIP-02-previously-authorized", "FY2027-loudoun-adopted-CIP-02-previously-authorized", "FY2027–FY2032 Adopted CIP · Previously Authorized Projects", "BOS Adopted"),
    ("FY2027-adopted-CIP-03-county-projects", "FY2027-loudoun-adopted-CIP-03-county-projects", "FY2027–FY2032 Adopted CIP · County Projects", "BOS Adopted"),
    ("FY2027-proposed-presentation-2026-02-11", "FY2027-loudoun-proposed-presentation-2026-02-11", "FY2027 Proposed Budget Presentation (Feb 11, 2026)", "Proposed"),
    ("FY2027-BOS-2026-04-07-adoption-item", "FY2027-loudoun-bos-2026-04-07-adoption-item", "BOS Action Item, Apr 7, 2026: FY2027 Budget, Appropriations Resolution & Tax Rates", "BOS Action"),
]
def clean(t):
    t = t.replace("\x00", "")
    t = "\n".join(re.sub(r"[ \t]{2,}", "  ", l).strip() for l in t.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", t)
def main():
    os.makedirs(os.path.join(OUT, "extracts"), exist_ok=True)
    total = 0
    for stem, hid, label, kind in FILES:
        pdf = os.path.join(OUT, hid + ".pdf")
        shutil.copyfile(os.path.join(SRC, stem + ".pdf"), pdf)
        text = clean(open(os.path.join(SRC, "txt", stem + ".txt"), encoding="utf-8", errors="replace").read())
        href = f"/files/loudoun-bos-budget/{hid}.pdf"
        ej = os.path.join(OUT, "extracts", hid + ".json")
        json.dump({"id": hid, "label": label, "kind": kind, "href": href, "file": hid + ".pdf", "text": text},
                  open(ej, "w", encoding="utf-8"), ensure_ascii=False)
        total += os.path.getsize(pdf) + os.path.getsize(ej)
        print(f"{hid}: pdf {os.path.getsize(pdf)/1e6:.2f} MB, extract {os.path.getsize(ej)/1e6:.2f} MB")
    print(f"TOTAL {total/1e6:.2f} MB")
if __name__ == "__main__":
    sys.exit(main())
