#!/usr/bin/env python3
"""Build the /2027 election data (preview draft) from official sources only.

Writes one JSON per office type to src/lib/:
  elections-2027-house.json, elections-2027-senate.json, elections-2027-sb.json, elections-2027-bos.json, elections-2027-co.json

Sources (official only; nothing from VPAP or the news):
  - Which seats are on the Nov. 2, 2027 ballot: Virginia Department of Elections (ELECT) ballot calendars (PDFs below), parsed
    live for every county in LOCALITIES; constitutional offices from Va. Code 24.2-217 plus each locality's own government pages.
  - Candidate filings: ELECT candidate lists (https://www.elections.virginia.gov/casting-a-ballot/candidate-list/) and each
    county's general registrar / elections office pages (FILING_PAGES). The builder checks them on every run.
  - Until official Nov. 2027 ballot lists are posted, races are filled with registered 2027 campaign committees from ELECT's
    campaign finance reporting system (registrations.py; each labeled "Registered campaign committee, not yet on the ballot" and
    linked to its official committee record). Ballot lists take precedence: when the check finds a posted 2027 list, the build
    no longer stops; it records the list in "ballot_list_posted" so the page flags it, and a parser for that list then replaces
    the registrations. It never falls back to VPAP or news.
  - House and Senate district coverage of each locality: ELECT registrant counts by district and precinct (registrations.py).
  - Current General Assembly member + party: src/lib/ga-members-2026-{house,senate}.json (built from LIS by tools/ga-members).
Rules: a seat, candidate or party appears only if an official source says so; every record keeps its source URL.
Candidate records (once an official list exists) carry filed_date exactly as the official record prints it (M/D/YYYY) and
filed_date_source_url; if the record has no date, both are null. Never derive a date from anything else.
Adding a county = add it to LOCALITIES (its seats are read from the ELECT calendars) and CO, then re-run.
Usage: python3 tools/elections-2027/build.py
"""
import datetime as dt, html, json, os, re, subprocess, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import registrations as REG

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
HENRICO_OFFICIALS = "https://henrico.gov/registrar/elected-officials/"  # CA + Sheriff '27, Clerk '31
HENRICO_FORM = "https://henrico.gov/government/county-manager-form-of-government/"  # treasurer / commissioner of the revenue do not exist
CHES_REGISTRAR = "https://www.chesterfield.gov/registrar"  # constitutional officers with "Next Election"
CHES_INVESTITURE = "https://www.chesterfield.gov/m/newsflash/home/detail/4253"  # 2023 investiture: clerk on an eight-year term from Jan. 2024
PWC_OFFICIAL_STATEMENT = "https://emma.msrb.org/P11911146-P11459990-.pdf"  # county's own disclosure: no elected treasurer / commissioner of the revenue

# County general registrar / elections office pages checked for an official Nov. 2027 candidate list.
FILING_PAGES = {
    "loudoun": ("Loudoun County Office of Elections", "https://www.loudoun.gov/4150/Candidates-Campaigns"),
    "fairfax-county": ("Fairfax County Office of Elections", "https://www.fairfaxcounty.gov/elections/sample-ballots"),
    "prince-william": ("Prince William County Office of Elections", "https://www.pwcvotes.org/ontheballot"),
    "henrico": ("Henrico County Voter Registration and Elections", "https://henrico.gov/registrar/programs/candidates/"),
    "chesterfield": ("Chesterfield County General Registrar", CHES_REGISTRAR),
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
    {"id": "henrico", "name": "Henrico", "kind": "county", "elect": "Henrico",
     "bos": {"label": "Board of Supervisors", "on_2027": True, "ballot_source": ELECT_BOS,
             "note": "All five district supervisors are up in 2027.", "note_source": ELECT_BOS},
     "sb": {"label": "School Board", "on_2027": True, "ballot_source": ELECT_CSB,
            "note": "All five district seats are up in 2027.", "note_source": ELECT_CSB}},
    {"id": "chesterfield", "name": "Chesterfield", "kind": "county", "elect": "Chesterfield",
     "bos": {"label": "Board of Supervisors", "on_2027": True, "ballot_source": ELECT_BOS,
             "note": "All five district supervisors are up in 2027.", "note_source": ELECT_BOS},
     "sb": {"label": "School Board", "on_2027": True, "ballot_source": ELECT_CSB,
            "note": "All five district seats are up in 2027.", "note_source": ELECT_CSB}},
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
    "loudoun": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "Department of Elections calendar",
                "offices": [(SHERIFF, LOUDOUN_CO, []), (CA, LOUDOUN_CO, []), (TREAS, LOUDOUN_CO, []), (COR, LOUDOUN_CO, [])],
                "off_cycle": [{**CLERK_2031, "source_url": LOUDOUN_CO}],
                "note": "Loudoun elects all four four-year constitutional offices in 2027. The Clerk of the Circuit Court has an eight-year term.",
                "note_source": LOUDOUN_CO},
    "fairfax-county": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "Department of Elections calendar",
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
    "prince-william": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "Department of Elections calendar",
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
    "henrico": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "Department of Elections calendar",
                "offices": [(SHERIFF, HENRICO_OFFICIALS, []), (CA, HENRICO_OFFICIALS, [])],
                "off_cycle": [{**CLERK_2031, "source_url": HENRICO_OFFICIALS},
                              {"office": "Treasurer and Commissioner of the Revenue", "next": "not elected in Henrico (county-manager form; an appointed director of finance carries out both offices' duties)", "source_url": HENRICO_FORM}],
                "note": "Henrico elects a sheriff and a commonwealth's attorney in 2027.", "note_source": HENRICO_OFFICIALS},
    "chesterfield": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "Department of Elections calendar",
                     "offices": [(SHERIFF, CHES_REGISTRAR, []), (CA, CHES_REGISTRAR, []), (TREAS, CHES_REGISTRAR, []), (COR, CHES_REGISTRAR, [])],
                     "off_cycle": [{"office": "Clerk of the Circuit Court", "next": "Nov. 2031 (eight-year term that began Jan. 2024, per the county's 2023 investiture notice)", "source_url": CHES_INVESTITURE}],
                     "note": "Chesterfield elects all four four-year constitutional offices in 2027.", "note_source": CHES_REGISTRAR},
    "albemarle": {"on_2027": True, "ballot_source": ELECT_5YR, "ballot_source_label": "Department of Elections calendar",
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
    """Check for an official Nov. 2027 candidate list. Returns (pages checked, posted lists). A posted list no longer stops the build:
    it is returned so the data and page flag it (ballot lists take precedence over registrations)."""
    page = fetch(ELECT_CANDS)
    if page is None:
        raise SystemExit(f"could not read {ELECT_CANDS}")
    lists = [(h, text(t)) for h, t in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', page, re.S) if "candidate-list" in h or "candidatelist" in h]
    assert any("2026" in t for _, t in lists), "ELECT candidate-list page changed shape"
    hits = [(h, t) for h, t in lists if "2027" in h + t]
    posted = [{"label": f"Virginia Department of Elections: {t}", "url": h if h.startswith("http") else ELECT + h} for h, t in hits]
    if hits:
        print(f"FLAG: ELECT has posted a 2027 candidate list {hits}: it takes precedence; add its parser so it replaces registrations", file=sys.stderr)
    checked = [{"label": "Virginia Department of Elections candidate lists", "url": ELECT_CANDS, "status": "2027 list posted" if hits else "no Nov. 2027 list posted"}]
    for lid, (label, url) in FILING_PAGES.items():
        p = fetch(url)
        if p is None:
            print(f"note: {label} page not reachable from the build box ({url}); ELECT list is the controlling source", file=sys.stderr)
            checked.append({"label": label, "url": url, "status": "not reachable at build time", "locality_id": lid})
            continue
        t = text(p)
        if re.search(r"2027[^.]{0,120}(candidate list|candidates (&|and) (sample ballots|referendums))|(candidate list|candidates (&|and) (sample ballots|referendums))[^.]{0,120}2027", t, re.I):
            print(f"FLAG: {label} may list 2027 candidates ({url}): it takes precedence; review and add a parser", file=sys.stderr)
            posted.append({"label": label, "url": url, "locality_id": lid})
            checked.append({"label": label, "url": url, "status": "may list 2027 candidates", "locality_id": lid})
            continue
        checked.append({"label": label, "url": url, "status": "no Nov. 2027 list posted", "locality_id": lid})
    return checked, posted

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
    checked, posted = check_filings()
    common = {"election": "2027-11-02", "as_of": AS_OF, "source_url": ELECT_CANDS, "filings_checked": checked,
              "filings_note": ("An official candidate list for the Nov. 2, 2027 election appears to be posted; it takes precedence over the registrations shown."
                               if posted else "No official candidate list for the Nov. 2, 2027 election has been posted yet."),
              "ballot_list_posted": posted,
              "registrations_source_url": REG.CF_INDEX, "registrations_label": REG.LABEL,
              "registrations_note": "Registered 2027 campaign committees (official state record); ballot lists not yet posted."}
    files = {}
    for kind, n, prefix in (("house", 100, "HD"), ("senate", 40, "SD")):
        files[kind] = {"office": kind, **common, "ballot_source_url": ELECT_5YR, "races": chamber(kind, n, prefix)}
    for office, pdf in (("sb", ELECT_CSB), ("bos", ELECT_BOS)):
        races, none = local(office, elect_seats(pdf))
        locs = [{"id": L["id"], "name": L["name"], "kind": L["kind"], "body": L[office]["label"], "on_2027": L[office]["on_2027"],
                 "ballot_source_url": L[office]["ballot_source"], **({"note": L[office]["note"]} if L[office].get("note") else {}),
                 **({"note_source_url": L[office]["note_source"]} if L[office].get("note_source") else {})} for L in LOCALITIES]
        data = {"office": office, **common, "ballot_source_url": pdf, "localities": locs, "races": races, "no_2027": none}
        if office == "sb":
            data["nonpartisan_note"] = "Virginia law (§ 22.1-57.3(E)) has no party nomination process for school board."
            data["nonpartisan_source_url"] = "https://law.lis.virginia.gov/vacode/title22.1/chapter5/section22.1-57.3/"
        files[office] = data
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
    files["co"] = {"office": "co", **common, "ballot_source_url": ELECT_5YR, "terms_source_url": VACODE_217, "localities": co_locs, "races": constitutional(), "no_2027": []}

    # Shared offices: a city resident's committee for sheriff / commonwealth's attorney belongs in the county race.
    linked = {}
    for L in LOCALITIES:
        for label, county in CO[L["id"]].get("linked", []):
            linked[(L["id"], label)] = f"{county}-{re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')}"
    for label in (SHERIFF, CA):  # Manassas Park shares both offices with Prince William (MANASSAS_PARK_CO)
        linked[("manassas-park", label)] = f"prince-william-{re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')}"
    report = REG.build(files, linked)

    # Current members, from official member lists only: the House of Delegates and Senate of Virginia member lists, and county
    # board / school board pages (registrations.LOCAL_MEMBERS, each name confirmed on the live page). Party: Senate list prints it;
    # for the House, party comes from LIS (Legislative Information System) when the LIS member for the district has the same last name.
    ga = REG.ga_members(fetch)
    for kind, url in (("house", REG.HOUSE_MEMBERS_URL), ("senate", REG.SENATE_MEMBERS_URL)):
        for r in files[kind]["races"]:
            lis = MEMBERS[kind].get(r["district"])
            off = ga[kind].get(r["district"])
            if not off:
                r["current_member"] = None
                r["current_members"] = []
                r["members_source_url"] = url
                continue
            same = lis and REG.last_name(lis["name"]) == REG.last_name(off[0])
            party = off[1] or (lis["party"] if same else None)
            r["current_member"] = {"name": off[0], "party": party, "slug": lis["slug"] if same else None, "source_url": url,
                                   "party_source_url": url if off[1] else (LIS_SRC if same and party else None)}
            gp = REG.GA_PARTY.get((kind, r["district"]))
            if not party and gp and REG.last_name(off[0]) == gp["last"].lower():
                r["current_member"].update({k: gp[k] for k in ("party", "party_source_url", "party_note")})
            r["current_members"] = [r["current_member"]]
            r["members_source_url"] = url
    lm, misses = REG.local_members(fetch)
    for off in ("bos", "sb", "co"):
        for r in files[off]["races"]:
            key = (off, r["locality_id"], r["seat"])
            src = REG.LOCAL_MEMBERS.get((off, r["locality_id"]))
            r["current_members"] = lm.get(key, [])
            if r["current_members"]:
                r["members_source_url"] = src[0]
    report["member_misses"] = misses
    report["boards_without_roster"] = sorted({f"{L['name']} {L[o]['label']}" for L in LOCALITIES for o in ("bos", "sb")
                                              if L[o]["on_2027"] and (o, L["id"]) not in REG.LOCAL_MEMBERS})
    # Incumbent = a registered committee's candidate is a current member of that seat (official roster): same last name and
    # same first initial (registrations.same_person), or same last name with every given name on the roster in the committee's name
    # (a member who goes by a middle name: roster "Kyle McDaniel", committee "Robert Kyle McDaniel").
    def given_in(c, m):
        tok = lambda n: [t for t in re.sub(r"[.,\"()]", " ", n.lower()).split() if t not in ("jr", "sr", "ii", "iii", "iv", "dr")]
        mt, ct = tok(m), set(tok(c))
        g = [t for t in mt[:-1] if len(t) > 1]
        return bool(g) and REG.last_name(c) == REG.last_name(m) and all(t in ct for t in g)
    for d in files.values():
        for r in d["races"]:
            mems = r.get("current_members", [])
            r["members_known"] = bool(mems)
            for c in r["candidates"]:
                c["incumbent"] = any(REG.same_person(c["name"], m["name"]) or given_in(c["name"], m["name"]) for m in mems)
            r["candidates"].sort(key=lambda c: (not c["incumbent"], c["name"].lower()))

    # House / Senate districts that include part or all of each covered locality.
    cov = REG.coverage(fetch)
    for kind in ("house", "senate"):
        races = {r["district"]: r for r in files[kind]["races"]}
        for r in races.values():
            r["localities"] = []
        for L in LOCALITIES:
            for c in cov[kind][L["id"]]:
                races[c["district"]]["localities"].append({"locality_id": L["id"], "locality": L["name"], "coverage": c["coverage"],
                                                           "precincts": c["precincts"], "locality_precincts": c["locality_precincts"], "source_url": c["source_url"]})
        files[kind]["coverage_source_url"] = cov["sources"][0 if kind == "house" else 1]
        files[kind]["coverage_source_label"] = REG.COVERAGE_SOURCE_LABEL
        files[kind]["coverage_page_url"] = REG.REG_STATS_PAGE
        files[kind]["districts_source_url"] = REG.SCV_ORDER
    # Counting rule: residence inside the seat + a 2027 activity signal (registrations.apply_rule); "Check" flags.
    report["rule"] = REG.apply_rule(files, cov["statewide"])
    # A current member registered for another 2027 office: keep them as the seat's member, mark them as not running for it.
    races_by_id = {(k, r["id"]): r for k, d in files.items() for r in d["races"]}  # race ids repeat across offices
    report["running_elsewhere"] = []
    for d in files.values():
        for r in d["races"]:
            for m in r.get("current_members", []):
                rx = REG.RUNNING_ELSEWHERE.get((d["office"], r.get("locality_id"), r["seat"], m["name"]))
                if not rx:
                    continue
                t = races_by_id.get((rx["office_id"], rx["race_id"]))
                c = next((c for c in (t or {}).get("candidates", []) if REG.same_person(c["name"], m["name"])), None)
                if c:
                    m["running_for"] = {"office_id": rx["office_id"], "race_id": rx["race_id"], "office": rx["office"], "committee_url": c.get("committee_url")}
                report["running_elsewhere"].append({"race": r["id"], "member": m["name"], "target": rx["race_id"], "confirmed": bool(c)})
    common_rule = ("Counted: committees on the Nov. 2027 cycle, not closed, with a residence inside the seat and a 2027 signal "
                   "(registered in 2026 or later, a 2026 Statement of Organization naming 2027, money raised on a 2026 report, or the "
                   "seat's current officeholder). Committees the Department of Elections carried forward from earlier races with none "
                   "of these are not counted.")
    for d in files.values():
        d["registrations_rule"] = common_rule
    for k, d in files.items():
        (OUT / f"elections-2027-{k}.json").write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n")
    rp = os.environ.get("ELECTIONS_2027_REPORT")
    if rp:
        Path(rp).write_text(json.dumps({**report, "coverage": {k: cov[k] for k in ("house", "senate")}, "coverage_sources": cov["sources"]}, indent=1, ensure_ascii=False))
    print("rule: kept", report["rule"]["kept"], "dropped", len(report["rule"]["dropped"]), "check", report["rule"]["check"],
          "residence unreadable (kept)", len(report["rule"]["residence_unreadable_kept"]))
    print("registrations: considered", report["considered"], "matched", report["matched"], "unmatched", len(report["unmatched"]),
          "final-report excluded", report["excluded_final"], "special-cycle excluded", len(report["excluded_other_cycle"]),
          "local outside covered localities", report["out_of_scope_local"], "statement unreadable", len(report["soo_unreadable"]))
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
