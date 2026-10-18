#!/usr/bin/env python3
"""Build the /2027 election data (preview draft) from VPAP + official ballot calendars.

Writes one JSON per office type to src/lib/:
  elections-2027-house.json, elections-2027-senate.json, elections-2027-sb.json, elections-2027-bos.json

Sources (fetched live; nothing typed in by hand except the ballot-calendar facts in LOCALITIES, each with its URL):
  - VPAP statewide candidate lists:  https://www.vpap.org/elections/{house,senate}/candidates/general/
  - Current member + party: src/lib/ga-members-2026-{house,senate}.json (built from LIS by tools/ga-members)
  - VPAP local seat data (the JSON behind the locality "Local Elections" page): /localities/<slug>/elections/seats.json
    and each seat's elections.json
Rules: a candidate, party or incumbent flag appears only if a fetched source says so; every record keeps its source URL.
Adding a locality = add an entry to LOCALITIES and re-run.
Usage: python3 tools/elections-2027/build.py
"""
import datetime as dt, html, json, re, subprocess, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "src/lib"
VPAP = "https://www.vpap.org"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
AS_OF = dt.date.today().isoformat()
ELECT_BOS = "https://www.elections.virginia.gov/media/boardpapers/calendar/2027_2031CountyBOS.pdf"
ELECT_CSB = "https://www.elections.virginia.gov/media/boardpapers/calendar/2027_2031CountySchoolBoard.pdf"
ELECT_CC = "https://www.elections.virginia.gov/media/boardpapers/calendar/CityCncl26-31-November.pdf"
ELECT_CITYSB = "https://www.elections.virginia.gov/media/boardpapers/calendar/CITY-SCHOOL-BOARD-ELECTIONS.pdf"

# Ballot facts per locality (from the official calendars above). VPAP supplies the seats and filings.
LOCALITIES = [
    {"id": "loudoun", "name": "Loudoun", "kind": "county", "vpap": "loudoun-county-va",
     "bos": {"label": "Board of Supervisors", "on_2027": True, "ballot_source": ELECT_BOS,
             "seats": ["supervisor-chairperson-10", "supervisor-9"]},
     "sb": {"label": "School Board", "on_2027": True, "ballot_source": ELECT_CSB, "seats": ["school-board-19"],
            "note": "Staggered terms: At-Large, Ashburn, Catoctin and Little River are up in 2027; the other five seats in 2029.",
            "note_source": "https://www.loudoun.gov/CivicAlerts.aspx?AID=8150&ARC=15798"}},
    {"id": "fairfax-city", "name": "Fairfax City", "kind": "city", "vpap": "fairfax-city-va",
     "bos": {"label": "City Council", "on_2027": False, "next": "Nov. 3, 2026, then 2028", "ballot_source": ELECT_CC},
     "sb": {"label": "School Board", "on_2027": False, "next": "Nov. 3, 2026, then 2028", "ballot_source": ELECT_CITYSB}},
    {"id": "manassas", "name": "Manassas", "kind": "city", "vpap": "manassas-city-va",
     "bos": {"label": "City Council", "on_2027": False, "next": "Nov. 3, 2026, then 2028", "ballot_source": ELECT_CC},
     "sb": {"label": "School Board", "on_2027": False, "next": "Nov. 3, 2026, then 2028", "ballot_source": ELECT_CITYSB}},
    {"id": "albemarle", "name": "Albemarle", "kind": "county", "vpap": "albemarle-county-va",
     "bos": {"label": "Board of Supervisors", "on_2027": True, "ballot_source": ELECT_BOS, "seats": ["supervisor-9"],
             "note": "Staggered terms: Rivanna, Scottsville and White Hall are up in 2027; Jack Jouett, Rio and Samuel Miller in 2029."},
     "sb": {"label": "School Board", "on_2027": True, "ballot_source": ELECT_CSB, "seats": ["school-board-19"],
            "note": "Staggered terms: At-Large, Rivanna, Scottsville and White Hall are up in 2027; Jack Jouett, Rio and Samuel Miller in 2029."}},
]
PARTY = {"D": "D", "R": "R"}
# Sourced corrections layered on VPAP (race id -> note, source, and names whose VPAP incumbent flag is out of date).
RACE_NOTES = {
    "albemarle-at-large": {
        "note": "VPAP still marks Allison Spillman as the incumbent. She resigned in August 2026 and the School Board appointed David Storm to the seat until the next election.",
        "source_url": "https://www.29news.com/2026/09/25/albemarle-school-board-appoints-david-storm-at-large-seat/",
        "not_incumbent": ["Allison Spillman"],
    },
}
LIS_SRC = "https://lis.virginia.gov/"
MEMBERS = {c: {m["district"]: m for m in json.loads((ROOT / f"src/lib/ga-members-2026-{c}.json").read_text())["members"]} for c in ("house", "senate")}

CACHE = Path.home() / ".cache/aguyonx-elections-2027"  # same-day cache so a re-run doesn't re-hit VPAP

def get(url, referer=VPAP + "/", accept="text/html"):
    CACHE.mkdir(parents=True, exist_ok=True)
    key = CACHE / (AS_OF + "-" + re.sub(r"[^A-Za-z0-9]+", "_", url)[-150:])
    if key.exists():
        return key.read_text()
    body = _fetch(url, referer, accept)
    key.write_text(body)
    return body

def _fetch(url, referer, accept):
    for i in range(6):
        r = subprocess.run(["curl", "-s", "-L", "--max-time", "40", "-A", UA, "-e", referer, "-H", f"Accept: {accept}", "-w", "\n%{http_code}", url],
                           capture_output=True, text=True)
        body, _, code = r.stdout.rpartition("\n")
        if code == "200":
            return body
        time.sleep(5 + i * 10)
    raise SystemExit(f"fetch failed {code}: {url}")

def text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

def names(cell):
    out = []
    for raw in re.split(r"<br\s*/?>", cell):
        n = text(raw)
        if n:
            out.append({"name": n.rstrip("*").strip(), "incumbent": n.endswith("*")})
    return out

def chamber(kind, n_districts, prefix):
    url = f"{VPAP}/elections/{kind}/candidates/general/"
    page = get(url)
    assert "Election Date: Nov. 2, 2027" in page, f"{kind}: VPAP page is not the 2027 general"
    rows = re.findall(r"<tr>\s*<td class=\"text-center\">(.*?)</tr>", page, re.S)
    assert len(rows) == n_districts, (kind, len(rows))
    races = []
    for row in rows:
        cells = re.findall(r"<td class=\"text-center\">(.*?)</td>", "<td class=\"text-center\">" + row, re.S)
        m = re.search(rf">\s*{prefix}(\d+)\s*</a>", cells[0])
        num = int(m.group(1))
        href = html.unescape(re.search(r'href="([^"]+)"', cells[0]).group(1))
        # Current member + party from our LIS-built GA member data (VPAP district pages sit behind a bot challenge,
        # so we don't crawl them). HD20 is vacant in that data.
        mem = MEMBERS[kind].get(num)
        cands = []
        for col, party in ((1, "D"), (2, "R"), (3, "Other")):
            for c in names(cells[col]):
                cands.append({**c, "party": party, "party_source_url": url, "filing_source_url": url})
        races.append({
            "id": f"{prefix.lower()}{num}", "district": num, "seat": f"{prefix}{num}", "seats": 1,
            "current_member": ({"name": mem["name"], "party": mem["party"], "slug": mem["slug"], "source_url": LIS_SRC} if mem else None),
            "vpap_url": VPAP + href, "candidates": cands,
        })
    return {"office": kind, "election": "2027-11-02", "as_of": AS_OF, "source_url": url, "races": races}

def local(office):
    races, none = [], []
    for L in LOCALITIES:
        b = L[office]
        if not b["on_2027"]:
            none.append({"locality": L["name"], "locality_id": L["id"], "body": b["label"], "next": b["next"], "source_url": b["ballot_source"]})
            continue
        base = f"{VPAP}/localities/{L['vpap']}/elections/"
        seats = json.loads(get(base + "seats.json", referer=base, accept="application/json"))["seats"]
        for s in seats:
            if s["slug"] not in b["seats"]:
                continue
            data_url = s["data_url"].replace(":443", "")
            d = json.loads(get(data_url, referer=base, accept="application/json"))
            assert d["selected_year_and_type"] == "2027regular", (L["id"], s["slug"], d["selected_year_and_type"])
            for te in d["tracked_elections"]:
                if te["date"] != "2027-11-02":
                    continue
                for e in te["elections"]:
                    seat = re.sub(r"\s*(Supervisor Chairperson|Supervisor|School Board|City Council)$", "", e["name"]).strip()
                    if "Chairperson" in e["name"]:
                        seat = "Chair"
                    if seat == "At Large":
                        seat = "At-Large"
                    page = VPAP + e["election_url"]
                    cands = []
                    for c in e["candidates"]:
                        m = re.match(r"^(.*?)\s*\((D|R|I|L|G)\)$", c["name"])
                        nm, p = (m.group(1), m.group(2)) if m else (c["name"], None)
                        rec = {"name": nm, "incumbent": bool(c["is_incumbent"]), "filing_source_url": page}
                        if office == "sb":
                            rec.update({"party": None, "endorsement": None, "party_source_url": None})
                        else:
                            rec.update({"party": PARTY.get(p, "Other") if p else None, "party_source_url": page if p else None})
                        cands.append(rec)
                    rid = f"{L['id']}-{re.sub(r'[^a-z0-9]+', '-', seat.lower())}"
                    extra = {}
                    if rid in RACE_NOTES:
                        n = RACE_NOTES[rid]
                        for c in cands:
                            if c["name"] in n.get("not_incumbent", []):
                                c["incumbent"] = False
                        extra = {"note": n["note"], "note_source_url": n["source_url"]}
                    races.append({"id": rid, **extra, "locality": L["name"], "locality_id": L["id"],
                                  "body": b["label"], "seat": seat, "seats": e["number_of_seats"], "vpap_url": page, "candidates": cands})
    return races, none

def main():
    house = chamber("house", 100, "HD")
    senate = chamber("senate", 40, "SD")
    for name, data in (("house", house), ("senate", senate)):
        (OUT / f"elections-2027-{name}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    for office in ("sb", "bos"):
        races, none = local(office)
        locs = [{"id": L["id"], "name": L["name"], "kind": L["kind"], "body": L[office]["label"], "on_2027": L[office]["on_2027"],
                 "ballot_source_url": L[office]["ballot_source"], **({"note": L[office]["note"]} if L[office].get("note") else {}),
                 **({"note_source_url": L[office]["note_source"]} if L[office].get("note_source") else {})} for L in LOCALITIES]
        data = {"office": office, "election": "2027-11-02", "as_of": AS_OF,
                "source_url": f"{VPAP}/elections/local/", "localities": locs, "races": races, "no_2027": none}
        if office == "sb":
            data["nonpartisan_note"] = "VPAP does not display party identification for school board elections; Virginia law (§ 22.1-57.3(E)) has no party nomination process for school board."
            data["nonpartisan_source_url"] = "https://law.lis.virginia.gov/vacode/title22.1/chapter5/section22.1-57.3/"
        (OUT / f"elections-2027-{office}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    for f in ("house", "senate", "sb", "bos"):
        d = json.loads((OUT / f"elections-2027-{f}.json").read_text())
        c = [x for r in d["races"] for x in r["candidates"]]
        print(f, "races", len(d["races"]), "cands", len(c), {p: sum(1 for x in c if x.get("party") == p) for p in ("D", "R", "Other", None)}, "inc", sum(x["incumbent"] for x in c))

if __name__ == "__main__":
    main()
