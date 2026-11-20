#!/usr/bin/env python3
"""Build the /2027 election data (preview draft) from VPAP + official ballot calendars.

Writes one JSON per office type to src/lib/:
  elections-2027-house.json, elections-2027-senate.json, elections-2027-sb.json, elections-2027-bos.json, elections-2027-co.json

Sources (fetched live; nothing typed in by hand except the ballot-calendar facts in LOCALITIES, each with its URL):
  - VPAP statewide candidate lists:  https://www.vpap.org/elections/{house,senate}/candidates/general/
  - Current member + party: src/lib/ga-members-2026-{house,senate}.json (built from LIS by tools/ga-members)
  - VPAP local seat data (the JSON behind the locality "Local Elections" page): /localities/<slug>/elections/seats.json
    and each seat's elections.json
Rules: a candidate, party or incumbent flag appears only if a fetched source says so; every record keeps its source URL.
Adding a locality = add an entry to LOCALITIES and re-run.
Usage: python3 tools/elections-2027/build.py        (all five files)
       python3 tools/elections-2027/build.py co     (constitutional officers only)
"""
import datetime as dt, html, json, re, subprocess, sys, time
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
ELECT_5YR = "https://www.elections.virginia.gov/media/boardpapers/calendar/Five_year_election_day_calendar-2026_2030.pdf"
VACODE_217 = "https://law.lis.virginia.gov/vacode/title24.2/chapter2/section24.2-217/"
LOUDOUN_CO = "https://www.loudoun.gov/89/Constitutional-Officers"
ALBEMARLE_CO = "https://www.albemarle.org/government/elections/elected-officials"
ALBEMARLE_ACFR = "https://www.albemarle.org/home/showpublisheddocument/16768/638126655293930000"
FAIRFAX_CITY_CO = "https://www.fairfaxva.gov/Government/Council/All-Elected-Officials"
MANASSAS_CO = "https://www.manassasva.gov/voter_registration_and_elections/elected_officials.php"

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
# Constitutional officers (Va. Const. art. VII sec. 4; Va. Code 24.2-217). Counties elect sheriff, commonwealth's attorney, treasurer and
# commissioner of the revenue in 2027 (4-year terms); clerks of the circuit court are 8-year terms (counties 2023 -> 2031). Cities elect the
# four offices in 2025/2029 unless they share the office with a county, in which case city voters vote on the county's 2027 schedule.
# "offices" = races on the Nov. 2, 2027 ballot ("vpap" = the VPAP locality whose race city voters vote in, when shared);
# "off_cycle" = offices in the locality that are NOT on the 2027 ballot, each with the source that says so. Every entry below was checked
# against the locality's own page; anything that couldn't be verified is left out (see the build report).
SHERIFF = ("Sheriff", "sheriff-11")
CA = ("Commonwealth's Attorney", "commonwealths-attorney-15")
TREAS = ("Treasurer", "treasurer-12")
COR = ("Commissioner of the Revenue", "commissioner-of-the-revenue-14")
CLERK_2031 = {"office": "Clerk of the Circuit Court", "next": "Nov. 2031 (8-year term)", "source_url": VACODE_217}
CO = {
    "loudoun": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "ELECT calendar", "vpap": "loudoun-county-va",
                "offices": [SHERIFF, CA, TREAS, COR],
                "off_cycle": [{**CLERK_2031, "source_url": LOUDOUN_CO}],
                "note": "Loudoun elects all four four-year constitutional offices in 2027. The Clerk of the Circuit Court has an eight-year term.",
                "note_source": LOUDOUN_CO},
    "albemarle": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "ELECT calendar", "vpap": "albemarle-county-va",
                  "offices": [SHERIFF, CA],
                  "off_cycle": [{**CLERK_2031, "source_url": ALBEMARLE_CO},
                                {"office": "Treasurer and Commissioner of the Revenue", "next": "not elected in Albemarle (county-executive form; an appointed finance director holds both roles)", "source_url": ALBEMARLE_ACFR}],
                  "note": "Albemarle elects a sheriff and a commonwealth's attorney.", "note_source": ALBEMARLE_CO},
    "fairfax-city": {"on_2027": True, "ballot_source": FAIRFAX_CITY_CO, "ballot_source_label": "City of Fairfax", "vpap": "fairfax-county-va",
                     "offices": [SHERIFF, CA],
                     "off_cycle": [{"office": "Treasurer and Commissioner of the Revenue", "next": "Nov. 2029 (terms expire Dec. 31, 2029)", "source_url": FAIRFAX_CITY_CO},
                                   {**CLERK_2031, "source_url": FAIRFAX_CITY_CO}],
                     "note": "City voters vote in the Fairfax County races for sheriff and commonwealth's attorney (shared offices, terms expire Dec. 31, 2027).",
                     "note_source": FAIRFAX_CITY_CO},
    "manassas": {"on_2027": True, "ballot_source": MANASSAS_CO, "ballot_source_label": "City of Manassas", "vpap": "prince-william-county-va",
                 "offices": [SHERIFF, CA],
                 "off_cycle": [{"office": "Treasurer and Commissioner of the Revenue", "next": "Nov. 2029", "source_url": MANASSAS_CO},
                               {**CLERK_2031, "source_url": MANASSAS_CO}],
                 "note": "City voters vote in the Prince William County races for sheriff and commonwealth's attorney (shared offices, next election 2027).",
                 "note_source": MANASSAS_CO},
}
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
    time.sleep(3)  # VPAP rate-limits bursts (403); pace uncached fetches
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

def constitutional():
    """Constitutional-officer races on the Nov. 2, 2027 ballot, per locality in LOCALITIES (config in CO). Candidates come only from VPAP's
    tracked 2027 elections; a seat VPAP doesn't track yet is a blank seat. VPAP's 'untracked_districts' (old campaign committees) are NOT filings and are ignored."""
    races = []
    for L in LOCALITIES:
        c = CO[L["id"]]
        base = f"{VPAP}/localities/{c['vpap']}/elections/"
        seats = {x["slug"]: x for x in json.loads(get(base + "seats.json", referer=base, accept="application/json"))["seats"]}
        for label, slug in c["offices"]:
            assert slug in seats, (L["id"], slug)
            d = json.loads(get(seats[slug]["data_url"].replace(":443", ""), referer=base, accept="application/json"))
            cands, page = [], base
            for te in d["tracked_elections"]:
                if te["date"] != "2027-11-02":
                    continue
                assert d["selected_year_and_type"] == "2027regular", (L["id"], slug, d["selected_year_and_type"])
                for e in te["elections"]:
                    page = VPAP + e["election_url"]
                    for x in e["candidates"]:
                        m = re.match(r"^(.*?)\s*\((D|R|I|L|G)\)$", x["name"])
                        nm, p = (m.group(1), m.group(2)) if m else (x["name"], None)
                        cands.append({"name": nm, "incumbent": bool(x["is_incumbent"]), "filing_source_url": page,
                                      "party": PARTY.get(p, "Other") if p else None, "party_source_url": page if p else None})
            races.append({"id": f"{L['id']}-{re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')}", "locality": L["name"], "locality_id": L["id"],
                          "body": "Constitutional Officers", "seat": label, "seats": 1, "vpap_url": page, "candidates": cands})
    return races

def main(only=None):
    """only='co' rebuilds just the constitutional-officers file (leaves the other four untouched)."""
    if only is None:
        house = chamber("house", 100, "HD")
        senate = chamber("senate", 40, "SD")
        for name, data in (("house", house), ("senate", senate)):
            (OUT / f"elections-2027-{name}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    for office in (("sb", "bos") if only is None else ()):
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
    co_locs = [{"id": L["id"], "name": L["name"], "kind": L["kind"], "body": "Constitutional Officers", "on_2027": CO[L["id"]]["on_2027"],
                "ballot_source_url": CO[L["id"]]["ballot_source"], "ballot_source_label": CO[L["id"]]["ballot_source_label"],
                "note": CO[L["id"]]["note"], "note_source_url": CO[L["id"]]["note_source"],
                "off_cycle": [{"office": o["office"], "next": o["next"], "source_url": o["source_url"]} for o in CO[L["id"]]["off_cycle"]]} for L in LOCALITIES]
    co = {"office": "co", "election": "2027-11-02", "as_of": AS_OF, "source_url": f"{VPAP}/elections/local/", "ballot_source_url": ELECT_5YR,
          "terms_source_url": VACODE_217, "localities": co_locs, "races": constitutional(), "no_2027": []}
    (OUT / "elections-2027-co.json").write_text(json.dumps(co, indent=1, ensure_ascii=False) + "\n")
    for f in ("house", "senate", "sb", "bos", "co"):
        d = json.loads((OUT / f"elections-2027-{f}.json").read_text())
        c = [x for r in d["races"] for x in r["candidates"]]
        print(f, "races", len(d["races"]), "cands", len(c), {p: sum(1 for x in c if x.get("party") == p) for p in ("D", "R", "Other", None)}, "inc", sum(x["incumbent"] for x in c))

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
