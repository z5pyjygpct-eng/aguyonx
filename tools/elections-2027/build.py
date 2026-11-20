#!/usr/bin/env python3
"""Build the /2027 election data (preview draft) from official sources only.

Writes one JSON per office type to src/lib/:
  elections-2027-house.json, elections-2027-senate.json, elections-2027-sb.json, elections-2027-bos.json, elections-2027-co.json

Sources (official only; nothing from VPAP or the news):
  - Which seats are on the Nov. 2, 2027 ballot: Virginia Department of Elections (ELECT) ballot calendars (PDFs below), parsed
    live for every county in LOCALITIES; constitutional offices from Va. Code 24.2-217 plus each locality's own government pages.
  - Candidate filings: ELECT candidate lists (https://www.elections.virginia.gov/casting-a-ballot/candidate-list/) and each
    county's general registrar / elections office pages (FILING_PAGES). The builder checks them on every run. As long as no
    official Nov. 2027 list is posted, every seat is built with no candidates ("No filing yet"). If an official 2027 list appears,
    the build stops so a parser for that list can be added; it never falls back to another source.
  - Current General Assembly member + party: src/lib/ga-members-2026-{house,senate}.json (built from LIS by tools/ga-members).
Rules: a seat, candidate or party appears only if an official source says so; every record keeps its source URL.
Adding a county = add it to LOCALITIES (its seats are read from the ELECT calendars) and CO, then re-run.
Usage: python3 tools/elections-2027/build.py
"""
import datetime as dt, html, json, re, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "src/lib"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
AS_OF = dt.date.today().isoformat()
ELECT = "https://www.elections.virginia.gov"
ELECT_CANDS = f"{ELECT}/casting-a-ballot/candidate-list/"
ELECT_BOS = f"{ELECT}/media/boardpapers/calendar/2027_2031CountyBOS.pdf"
ELECT_CSB = f"{ELECT}/media/boardpapers/calendar/2027_2031CountySchoolBoard.pdf"
ELECT_CC = f"{ELECT}/media/boardpapers/calendar/CityCncl26-31-November.pdf"
ELECT_CITYSB = f"{ELECT}/media/boardpapers/calendar/CITY-SCHOOL-BOARD-ELECTIONS.pdf"
ELECT_5YR = f"{ELECT}/media/boardpapers/calendar/Five_year_election_day_calendar-2026_2030.pdf"
VACODE_217 = "https://law.lis.virginia.gov/vacode/title24.2/chapter2/section24.2-217/"
LOUDOUN_CO = "https://www.loudoun.gov/89/Constitutional-Officers"
ALBEMARLE_CO = "https://www.albemarle.org/government/elections/elected-officials"
ALBEMARLE_ACFR = "https://www.albemarle.org/home/showpublisheddocument/16768/638126655293930000"
FAIRFAX_CITY_CO = "https://www.fairfaxva.gov/Government/Council/All-Elected-Officials"
FAIRFAX_CITY_SHARED = "https://www.fairfaxva.gov/Government/About-the-City/Shared-City-and-County-Officials"
MANASSAS_CO = "https://www.manassasva.gov/voter_registration_and_elections/elected_officials.php"
MANASSAS_PARK_CO = "https://www.manassasparkva.gov/government/local___state_elected_officials.php"
FFX_CANDIDATES = "https://www.fairfaxcounty.gov/elections/information-candidates"  # "Commonwealth's Attorney and Sheriff are shared with the City of Fairfax"
FFX_TERMS = "https://www.fairfaxcounty.gov/news/2023-inauguration"  # Board + constitutional officers' terms Jan. 1, 2024 - Dec. 31, 2027
FFX_DIRECTORY = "https://www.fairfaxcounty.gov/elections/sites/elections/files/Assets/Documents/PDF/Elected%20Officials%20Jan%202024%20rev.pdf"
FFX_CLERK = "https://www.fairfaxcounty.gov/circuit/more-about-circuit-court"
FFX_FINANCE = "https://www.fairfaxcounty.gov/boardofsupervisors/sites/boardofsupervisors/files/Assets/Items%20for%20Consideration_October%2017%2C%202023%20FINAL.pdf"
PWC_OFFICIALS = "https://www.pwcvotes.org/elected-officials"
PWC_SHERIFF = "https://www.pwcva.gov/department/sheriffs-office"
PWC_CA = "https://www.pwcva.gov/department/commonwealth-attorney/"
PWC_CLERK = "https://www.pwcva.gov/department/circuit-court/circuit-court-clerks-role/"
PWC_OFFICIAL_STATEMENT = "https://emma.msrb.org/P11911146-P11459990-.pdf"  # county's own disclosure: no elected treasurer / commissioner of the revenue

# County general registrar / elections office pages checked for an official Nov. 2027 candidate list.
FILING_PAGES = {
    "loudoun": ("Loudoun County Office of Elections", "https://www.loudoun.gov/4150/Candidates-Campaigns"),
    "fairfax-county": ("Fairfax County Office of Elections", "https://www.fairfaxcounty.gov/elections/sample-ballots"),
    "prince-william": ("Prince William County Office of Elections", "https://www.pwcvotes.org/ontheballot"),
    "albemarle": ("Albemarle County Voter Registration and Elections", "https://www.albemarle.org/government/elections"),
}

# Seats come from the ELECT calendar PDFs ("elect" = the county's name there). Cities have no county board/school board
# race in 2027 (ELECT city council and city school board calendars).
LOCALITIES = [
    {"id": "loudoun", "name": "Loudoun", "kind": "county", "elect": "Loudoun",
     "bos": {"label": "Board of Supervisors", "on_2027": True, "ballot_source": ELECT_BOS},
     "sb": {"label": "School Board", "on_2027": True, "ballot_source": ELECT_CSB,
            "note": "Staggered terms: At-Large, Ashburn, Catoctin and Little River are up in 2027; the other five seats in 2029.",
            "note_source": "https://www.loudoun.gov/CivicAlerts.aspx?AID=8150&ARC=15798"}},
    {"id": "fairfax-county", "name": "Fairfax County", "kind": "county", "elect": "Fairfax",
     "bos": {"label": "Board of Supervisors", "on_2027": True, "ballot_source": ELECT_BOS,
             "note": "The chairman (elected countywide) and all nine district supervisors are up in 2027; current terms end Dec. 31, 2027.",
             "note_source": FFX_TERMS},
     "sb": {"label": "School Board", "on_2027": True, "ballot_source": ELECT_CSB,
            "note": "All 12 seats are up in 2027: three at-large seats (elected countywide, top three win) and one seat for each of the nine districts.",
            "note_source": ELECT_CSB}},
    {"id": "fairfax-city", "name": "Fairfax City", "kind": "city",
     "bos": {"label": "City Council", "on_2027": False, "next": "Nov. 7, 2028", "ballot_source": ELECT_CC},
     "sb": {"label": "School Board", "on_2027": False, "next": "Nov. 7, 2028", "ballot_source": ELECT_CITYSB}},
    {"id": "prince-william", "name": "Prince William", "kind": "county", "elect": "Prince William",
     "bos": {"label": "Board of County Supervisors", "on_2027": True, "ballot_source": ELECT_BOS,
             "note": "The chairman at-large and all seven district supervisors are up in 2027.", "note_source": ELECT_BOS},
     "sb": {"label": "School Board", "on_2027": True, "ballot_source": ELECT_CSB,
            "note": "The chairman at-large and all seven district seats are up in 2027.", "note_source": ELECT_CSB}},
    {"id": "manassas", "name": "Manassas", "kind": "city",
     "bos": {"label": "City Council", "on_2027": False, "next": "Nov. 7, 2028", "ballot_source": ELECT_CC},
     "sb": {"label": "School Board", "on_2027": False, "next": "Nov. 7, 2028", "ballot_source": ELECT_CITYSB}},
    {"id": "albemarle", "name": "Albemarle", "kind": "county", "elect": "Albemarle",
     "bos": {"label": "Board of Supervisors", "on_2027": True, "ballot_source": ELECT_BOS,
             "note": "Staggered terms: Rivanna, Scottsville and White Hall are up in 2027; Jack Jouett, Rio and Samuel Miller in 2029.",
             "note_source": ELECT_BOS},
     "sb": {"label": "School Board", "on_2027": True, "ballot_source": ELECT_CSB,
            "note": "Staggered terms: At-Large, Rivanna, Scottsville and White Hall are up in 2027; Jack Jouett, Rio and Samuel Miller in 2029.",
            "note_source": ELECT_CSB}},
]
# Constitutional officers (Va. Const. art. VII sec. 4; Va. Code 24.2-217). Counties elect sheriff, commonwealth's attorney, treasurer and
# commissioner of the revenue in 2027 (4-year terms) unless an optional form of government abolished the office; county clerks of the
# circuit court have 8-year terms (2023 -> 2031). A city that shares an office with a county votes in the county's race ("linked").
# "offices" = races on the Nov. 2, 2027 ballot, each with the official page that says the office is elected (and shared, if so);
# "off_cycle" = offices NOT on the 2027 ballot, each with its source. Anything not verified on an official page is left out.
SHERIFF, CA, TREAS, COR = "Sheriff", "Commonwealth's Attorney", "Treasurer", "Commissioner of the Revenue"
CLERK_2031 = {"office": "Clerk of the Circuit Court", "next": "Nov. 2031 (8-year term)", "source_url": VACODE_217}
CO = {
    "loudoun": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "ELECT calendar",
                "offices": [(SHERIFF, LOUDOUN_CO, []), (CA, LOUDOUN_CO, []), (TREAS, LOUDOUN_CO, []), (COR, LOUDOUN_CO, [])],
                "off_cycle": [{**CLERK_2031, "source_url": LOUDOUN_CO}],
                "note": "Loudoun elects all four four-year constitutional offices in 2027. The Clerk of the Circuit Court has an eight-year term.",
                "note_source": LOUDOUN_CO},
    "fairfax-county": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "ELECT calendar",
                       "offices": [(SHERIFF, FFX_TERMS, [("fairfax-city", "Fairfax City", FFX_CANDIDATES)]),
                                   (CA, FFX_TERMS, [("fairfax-city", "Fairfax City", FFX_CANDIDATES)])],
                       "off_cycle": [{**CLERK_2031, "source_url": FFX_CLERK},
                                     {"office": "Treasurer and Commissioner of the Revenue", "next": "not elected in Fairfax County (the county's Department of Tax Administration and Department of Finance carry out both offices' duties)", "source_url": FFX_FINANCE}],
                       "note": "Fairfax County elects a sheriff and a commonwealth's attorney in 2027 (terms end Dec. 31, 2027). City of Fairfax voters vote in both races.",
                       "note_source": FFX_CANDIDATES},
    "fairfax-city": {"on_2027": True, "ballot_source": FAIRFAX_CITY_CO, "ballot_source_label": "City of Fairfax",
                     "offices": [], "linked": [(SHERIFF, "fairfax-county"), (CA, "fairfax-county")],
                     "off_cycle": [{"office": "Treasurer and Commissioner of the Revenue", "next": "Nov. 2029 (terms expire Dec. 31, 2029)", "source_url": FAIRFAX_CITY_CO},
                                   {**CLERK_2031, "source_url": FAIRFAX_CITY_SHARED}],
                     "note": "City voters vote in the Fairfax County races for sheriff and commonwealth's attorney (shared offices, terms expire Dec. 31, 2027).",
                     "note_source": FAIRFAX_CITY_SHARED},
    "prince-william": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "ELECT calendar",
                       "offices": [(SHERIFF, PWC_OFFICIALS, [("manassas", "Manassas", MANASSAS_CO), (None, "Manassas Park", MANASSAS_PARK_CO)]),
                                   (CA, PWC_OFFICIALS, [("manassas", "Manassas", MANASSAS_CO), (None, "Manassas Park", MANASSAS_PARK_CO)])],
                       "off_cycle": [{**CLERK_2031, "source_url": PWC_CLERK},
                                     {"office": "Treasurer and Commissioner of the Revenue", "next": "not elected in Prince William (the county's appointed chief financial officer carries out both offices' duties)", "source_url": PWC_OFFICIAL_STATEMENT}],
                       "note": "Prince William elects a sheriff and a commonwealth's attorney in 2027. Both offices also serve the cities of Manassas and Manassas Park, whose voters vote in these races.",
                       "note_source": PWC_SHERIFF},
    "manassas": {"on_2027": True, "ballot_source": MANASSAS_CO, "ballot_source_label": "City of Manassas",
                 "offices": [], "linked": [(SHERIFF, "prince-william"), (CA, "prince-william")],
                 "off_cycle": [{"office": "Treasurer and Commissioner of the Revenue", "next": "Nov. 2029", "source_url": MANASSAS_CO},
                               {**CLERK_2031, "source_url": MANASSAS_CO}],
                 "note": "City voters vote in the Prince William County races for sheriff and commonwealth's attorney (shared offices, next election 2027).",
                 "note_source": MANASSAS_CO},
    "albemarle": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "ELECT calendar",
                  "offices": [(SHERIFF, ALBEMARLE_CO, []), (CA, ALBEMARLE_CO, [])],
                  "off_cycle": [{**CLERK_2031, "source_url": ALBEMARLE_CO},
                                {"office": "Treasurer and Commissioner of the Revenue", "next": "not elected in Albemarle (county-executive form; an appointed finance director holds both roles)", "source_url": ALBEMARLE_ACFR}],
                  "note": "Albemarle elects a sheriff and a commonwealth's attorney.", "note_source": ALBEMARLE_CO},
}
LIS_SRC = "https://lis.virginia.gov/"
MEMBERS = {c: {m["district"]: m for m in json.loads((ROOT / f"src/lib/ga-members-2026-{c}.json").read_text())["members"]} for c in ("house", "senate")}
CACHE = Path.home() / ".cache/aguyonx-elections-2027"

def fetch(url, binary=False):
    CACHE.mkdir(parents=True, exist_ok=True)
    key = CACHE / ("official-" + AS_OF + "-" + re.sub(r"[^A-Za-z0-9]+", "_", url)[-150:])
    if not key.exists():
        for i in range(4):
            r = subprocess.run(["curl", "-s", "-L", "--max-time", "60", "-A", UA, "-o", str(key), "-w", "%{http_code}", url], capture_output=True, text=True)
            if r.stdout == "200":
                break
            key.unlink(missing_ok=True)
            time.sleep(3 + i * 5)
        else:
            return None
    return key if binary else key.read_text(errors="ignore")

def text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"(?s)<script.*?</script>|<style.*?</style>", " ", s)))).strip()

def check_filings():
    """Confirm no official Nov. 2027 candidate list exists. Returns the list of pages checked (label, url, status)."""
    page = fetch(ELECT_CANDS)
    if page is None:
        raise SystemExit(f"could not read {ELECT_CANDS}")
    lists = [(h, text(t)) for h, t in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', page, re.S) if "candidate-list" in h or "candidatelist" in h]
    assert any("2026" in t for _, t in lists), "ELECT candidate-list page changed shape"
    hits = [(h, t) for h, t in lists if "2027" in h + t]
    if hits:
        raise SystemExit(f"ELECT has posted a 2027 candidate list {hits}: add a parser for it before rebuilding")
    checked = [{"label": "Virginia Department of Elections candidate lists", "url": ELECT_CANDS, "status": "no Nov. 2027 list posted"}]
    for lid, (label, url) in FILING_PAGES.items():
        p = fetch(url)
        if p is None:
            print(f"note: {label} page not reachable from the build box ({url}); ELECT list is the controlling source", file=sys.stderr)
            checked.append({"label": label, "url": url, "status": "not reachable at build time", "locality_id": lid})
            continue
        t = text(p)
        if re.search(r"2027[^.]{0,200}candidate|candidate[^.]{0,200}2027", t, re.I):
            raise SystemExit(f"{label} may list 2027 candidates ({url}): review and add a parser before rebuilding")
        checked.append({"label": label, "url": url, "status": "no Nov. 2027 list posted", "locality_id": lid})
    return checked

def elect_seats(pdf_url):
    """Parse an ELECT county calendar PDF -> {county: [(district, seats_in_2027)]} (only districts with a 2027 seat)."""
    path = fetch(pdf_url, binary=True)
    if path is None:
        raise SystemExit(f"could not read {pdf_url}")
    lay = subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True, check=True).stdout
    out, county, cols, dcol = {}, None, None, None
    for line in lay.splitlines():
        if "District Name" in line and "2027" in line:
            dcol = line.index("District Name")
            cols = {y: line.index(y) + 2 for y in ("2027", "2029", "2031")}
            continue
        if cols is None or not line.strip():
            continue
        nums = [(m.start(), int(m.group())) for m in re.finditer(r"(?<!\S)\d+(?!\S)", line) if m.start() > dcol + 8]
        head = line[:dcol + 8]
        label_part = re.sub(r"(?<!\S)\d+(?!\S)", "", line[:min([p for p, _ in nums], default=len(line))]).rstrip()
        if not nums:
            continue
        cty, dist = label_part[:dcol].strip(), label_part[dcol - 2:].strip() if len(label_part) > dcol - 2 else ""
        if not dist and not cty:
            continue
        if cty:
            county = cty
        if not dist:
            continue
        for p, n in nums:
            year = min(cols, key=lambda y: abs(cols[y] - p))
            if year == "2027":
                out.setdefault(county, []).append((dist, n))
    return out

def seat_label(dist):
    d = re.sub(r"\s+", " ", dist).strip()
    if re.match(r"^Chair", d, re.I):
        return "Chair"
    if d.lower() == "at large":
        return "At-Large"
    return d

def chamber(kind, n_districts, prefix):
    races = []
    for num in range(1, n_districts + 1):
        mem = MEMBERS[kind].get(num)
        races.append({
            "id": f"{prefix.lower()}{num}", "district": num, "seat": f"{prefix}{num}", "seats": 1,
            "current_member": ({"name": mem["name"], "party": mem["party"], "slug": mem["slug"], "source_url": LIS_SRC} if mem else None),
            "source_url": ELECT_5YR, "filing_source_url": ELECT_CANDS, "candidates": [],
        })
    return races

def local(office, cal):
    races, none = [], []
    for L in LOCALITIES:
        b = L[office]
        if not b["on_2027"]:
            none.append({"locality": L["name"], "locality_id": L["id"], "body": b["label"], "next": b["next"], "source_url": b["ballot_source"]})
            continue
        seats = cal.get(L["elect"])
        assert seats, (office, L["elect"], "not found in ELECT calendar")
        for dist, n in seats:
            seat = seat_label(dist)
            fp = FILING_PAGES.get(L["id"])
            races.append({"id": f"{L['id']}-{re.sub(r'[^a-z0-9]+', '-', seat.lower()).strip('-')}", "locality": L["name"], "locality_id": L["id"],
                          "body": b["label"], "seat": seat, "seats": n, "source_url": b["ballot_source"],
                          "filing_source_url": ELECT_CANDS, **({"local_filing_source_url": fp[1]} if fp else {}), "candidates": []})
    return races, none

def constitutional():
    races = []
    for L in LOCALITIES:
        c = CO[L["id"]]
        fp = FILING_PAGES.get(L["id"])
        for label, src, shared in c["offices"]:
            races.append({"id": f"{L['id']}-{re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')}", "locality": L["name"], "locality_id": L["id"],
                          "body": "Constitutional Officers", "seat": label, "seats": 1, "source_url": src,
                          "filing_source_url": ELECT_CANDS, **({"local_filing_source_url": fp[1]} if fp else {}),
                          **({"shared_with": [{"locality_id": i, "locality": n, "source_url": u} for i, n, u in shared]} if shared else {}),
                          "candidates": []})
    ids = {r["id"] for r in races}
    for L in LOCALITIES:
        for label, county in CO[L["id"]].get("linked", []):
            rid = f"{county}-{re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')}"
            assert rid in ids, rid
    return races

def main():
    checked = check_filings()
    common = {"election": "2027-11-02", "as_of": AS_OF, "source_url": ELECT_CANDS, "filings_checked": checked,
              "filings_note": "No official candidate list for the Nov. 2, 2027 election has been posted yet."}
    for kind, n, prefix in (("house", 100, "HD"), ("senate", 40, "SD")):
        data = {"office": kind, **common, "ballot_source_url": ELECT_5YR, "races": chamber(kind, n, prefix)}
        (OUT / f"elections-2027-{kind}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    for office, pdf in (("sb", ELECT_CSB), ("bos", ELECT_BOS)):
        races, none = local(office, elect_seats(pdf))
        locs = [{"id": L["id"], "name": L["name"], "kind": L["kind"], "body": L[office]["label"], "on_2027": L[office]["on_2027"],
                 "ballot_source_url": L[office]["ballot_source"], **({"note": L[office]["note"]} if L[office].get("note") else {}),
                 **({"note_source_url": L[office]["note_source"]} if L[office].get("note_source") else {})} for L in LOCALITIES]
        data = {"office": office, **common, "ballot_source_url": pdf, "localities": locs, "races": races, "no_2027": none}
        if office == "sb":
            data["nonpartisan_note"] = "Virginia law (§ 22.1-57.3(E)) has no party nomination process for school board."
            data["nonpartisan_source_url"] = "https://law.lis.virginia.gov/vacode/title22.1/chapter5/section22.1-57.3/"
        (OUT / f"elections-2027-{office}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    name = {L["id"]: L["name"] for L in LOCALITIES}
    co_locs = []
    for L in LOCALITIES:
        c = CO[L["id"]]
        co_locs.append({"id": L["id"], "name": L["name"], "kind": L["kind"], "body": "Constitutional Officers", "on_2027": c["on_2027"],
                        "ballot_source_url": c["ballot_source"], "ballot_source_label": c["ballot_source_label"],
                        "note": c["note"], "note_source_url": c["note_source"],
                        **({"linked": [{"office": o, "locality_id": cty, "locality": name[cty], "race_id": f"{cty}-{re.sub(r'[^a-z0-9]+', '-', o.lower()).strip('-')}"}
                                       for o, cty in c["linked"]]} if c.get("linked") else {}),
                        "off_cycle": c["off_cycle"]})
    co = {"office": "co", **common, "ballot_source_url": ELECT_5YR, "terms_source_url": VACODE_217, "localities": co_locs, "races": constitutional(), "no_2027": []}
    (OUT / "elections-2027-co.json").write_text(json.dumps(co, indent=1, ensure_ascii=False) + "\n")
    for f in ("house", "senate", "sb", "bos", "co"):
        d = json.loads((OUT / f"elections-2027-{f}.json").read_text())
        by = {}
        for r in d["races"]:
            by.setdefault(r.get("locality", "statewide"), [0, 0])
            by[r.get("locality", "statewide")][0] += 1
            by[r.get("locality", "statewide")][1] += r["seats"]
        print(f, "races", len(d["races"]), "cands", sum(len(r["candidates"]) for r in d["races"]), {k: f"{v[0]} races/{v[1]} seats" for k, v in by.items()})

if __name__ == "__main__":
    main()
