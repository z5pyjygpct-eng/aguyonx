"""2027 campaign committee registrations and district-by-locality coverage, from official Virginia Department of Elections records.

Registrations (filled into the races until official ballot lists are posted):
  - Monthly bulk report files from the Department of Elections campaign finance reporting system,
    https://apps.elections.virginia.gov/SBE_CSV/CF/<YYYY_MM>/Report.csv (one row per report filed). For each committee
    (CommitteeCode) the latest report is kept. Kept: CommitteeType "Candidate Campaign Committee", ElectionCycle "11/2027"
    (the Nov. 2027 general election), latest report not marked final.
  - Office and district come from the report record (OfficeSought, District). For local offices, the locality comes from the
    committee's Statement of Organization (the candidate's "County or City of Residence"),
    https://cf.elections.virginia.gov/Printable/StatementOfOrganization/<id>/pdf/cfreports .
  - A committee is placed in a race only when the office AND the district (or, for countywide offices, the locality) match a
    seat on the 2027 ballot. Anything else is returned as unmatched or ambiguous with the reason; nothing is guessed.
  - Party: as the committee record lists it (Democratic -> D, Republican -> R, any other named party -> Other). Blank or
    "Write-In" -> null ("Party not listed").
  - Registration date: neither the report file nor the Statement of Organization prints the date the committee registered, so
    filed_date stays null. It is never derived from report dates.
  - Limitation: a committee that registered but has not filed any report yet does not appear in the report files.
  - Counting rule (apply_rule, run after current members are attached). A placed committee is counted only when ALL hold:
      1. ElectionCycle 11/2027, latest report not final, office not labeled "Do Not Use" (checked in build());
      2. residence check: the Statement of Organization's "County or City of Residence" is inside the seat. For House and
         Senate seats that means a locality the current district includes (Department of Elections registrants by district
         and precinct, all localities statewide), which drops committees left over from the pre-2023 districts that share a
         number; for local seats the residence is the locality (already required to place it);
      3. a 2027 activity signal, at least one of:
         (a) registered in 2026 or later (committee ID CC-26-... or newer), or a Statement of Organization amended in 2026+
             that names 2027 as the election year;
         (b) raised more than $0 on a report covering 2026 (Schedule H "contributions and receipts received", latest
             amendment of each reporting period; https://apps.elections.virginia.gov/SBE_CSV/CF/<YYYY_MM>/ScheduleH.csv);
         (c) the committee belongs to the seat's current officeholder (official member list; same last name and first initial).
    The Department of Elections moves every open committee to the next cycle automatically, so without (3) committees from
    2019/2023/2025 runs would be counted as 2027 candidates. Dropped committees are listed in the build report with the reason.
  - "Check" flag: the seat's current officeholder has no counted committee, but has a committee for this seat whose record
    carries a Department of Elections record-keeping flag (latest report marked final after raising money in 2026, or the office
    labeled "Do Not Use"). Shown as "Check" with a short explanation instead of "Member not filed yet".

Coverage (which House and Senate districts include part or all of each locality):
  - Department of Elections registrant counts by House and by Senate district, precinct by precinct, under the current districts
    (drawn by the Supreme Court of Virginia, Dec. 2021, first used in 2023). A district covers a locality if any of the
    locality's precincts is in it; "all" if every precinct of the locality is in that one district, otherwise "part".
"""
import csv, datetime as dt, io, json, re, subprocess, time
from pathlib import Path

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
CF_CSV = "https://apps.elections.virginia.gov/SBE_CSV/CF/{ym}/Report.csv"
CF_INDEX = "https://apps.elections.virginia.gov/SBE_CSV/CF/"
CF_SCHED_H = "https://apps.elections.virginia.gov/SBE_CSV/CF/{ym}/ScheduleH.csv"
COMMITTEE_URL = "https://cfreports.elections.virginia.gov/Committee/Index/{guid}"
SOO_URL = "https://cf.elections.virginia.gov/Printable/StatementOfOrganization/{guid}/pdf/cfreports"
REG_STATS_PAGE = "https://www.elections.virginia.gov/resultsreports/registration-statistics/2026-registration-statistics/"
REDISTRICTING_PAGE = "https://www.elections.virginia.gov/casting-a-ballot/redistricting/"
SCV_ORDER = "https://www.vacourts.gov/static/courts/scv/districting/redistricting_final.pdf"
COVERAGE_SOURCE_LABEL = ("Virginia Department of Elections, registered voters by House and Senate district and precinct "
                         "(current districts drawn by the Supreme Court of Virginia, Dec. 2021, first used 2023)")
LABEL = "Registered campaign committee, not yet on the ballot"
CACHE = Path.home() / ".cache/aguyonx-elections-2027/cf"
FIRST_MONTH = (2023, 11)  # the 2024-2027 reporting cycle starts after the Nov. 2023 election

# Locality names as the Statement of Organization ("County or City of Residence") and the registrant files print them.
RESIDENCE = {"loudoun county": "loudoun", "fairfax county": "fairfax-county", "fairfax city": "fairfax-city", "city of fairfax": "fairfax-city",
             "prince william county": "prince-william", "manassas city": "manassas", "city of manassas": "manassas",
             "manassas park city": "manassas-park", "city of manassas park": "manassas-park", "henrico county": "henrico",
             "chesterfield county": "chesterfield", "albemarle county": "albemarle"}
REGFILE_NAME = {"loudoun": "LOUDOUN COUNTY", "fairfax-county": "FAIRFAX COUNTY", "fairfax-city": "FAIRFAX CITY", "prince-william": "PRINCE WILLIAM COUNTY",
                "manassas": "MANASSAS CITY", "henrico": "HENRICO COUNTY", "chesterfield": "CHESTERFIELD COUNTY", "albemarle": "ALBEMARLE COUNTY"}

def _get(url, dest, timeout=180):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    for i in range(4):
        r = subprocess.run(["curl", "-s", "-L", "--max-time", str(timeout), "-A", UA, "-o", str(dest), "-w", "%{http_code}", url], capture_output=True, text=True)
        if r.stdout == "200" and dest.stat().st_size > 0:
            return dest
        dest.unlink(missing_ok=True)
        if r.stdout == "404":
            return None
        time.sleep(3 + 5 * i)
    return None

def months(today):
    y, m = FIRST_MONTH
    while (y, m) <= (today.year, today.month):
        yield f"{y}_{m:02d}"
        y, m = (y + (m == 12), m % 12 + 1)

ALL_REPORTS = {}  # ReportId -> report row (candidate committees), filled by latest_committees()

def latest_committees(today=None):
    """Latest report per candidate committee across the monthly files; returns (rows, source_urls)."""
    today = today or dt.date.today()
    latest, urls = {}, []
    for ym in months(today):
        cur = ym == f"{today.year}_{today.month:02d}"
        dest = CACHE / (f"Report-{ym}-{today.isoformat()}.csv" if cur else f"Report-{ym}.csv")
        p = _get(CF_CSV.format(ym=ym), dest)
        if p is None:
            continue
        urls.append(CF_CSV.format(ym=ym))
        for r in csv.DictReader(io.StringIO(p.read_bytes().decode("cp1252", errors="replace"))):
            if r.get("CommitteeType") != "Candidate Campaign Committee":
                continue
            key = (r.get("SubmittedDate") or r.get("FilingDate") or "", int(r.get("ReportId") or 0))
            ALL_REPORTS[r.get("ReportId")] = r
            code = r["CommitteeCode"]
            if code not in latest or key > latest[code][0]:
                latest[code] = (key, r)
    return [v[1] for v in latest.values()], urls

def receipts_2026(today=None):
    """{CommitteeCode: dollars} raised on reports covering 2026 (period ending 1/1/2026 or later), using Schedule H
    "ContributionsAndReceiptsReceived" and only the latest amendment of each reporting period. Needs latest_committees() first."""
    today = today or dt.date.today()
    h, urls = {}, []
    for ym in months(today):
        if ym < "2026_01":
            continue
        cur = ym == f"{today.year}_{today.month:02d}"
        dest = CACHE / (f"ScheduleH-{ym}-{today.isoformat()}.csv" if cur else f"ScheduleH-{ym}.csv")
        p = _get(CF_SCHED_H.format(ym=ym), dest)
        if p is None:
            continue
        urls.append(CF_SCHED_H.format(ym=ym))
        for r in csv.DictReader(io.StringIO(p.read_bytes().decode("cp1252", errors="replace"))):
            try:
                h[r["ReportId"]] = float(r.get("ContributionsAndReceiptsReceived") or 0)
            except ValueError:
                pass
    per = {}
    for rid, r in ALL_REPORTS.items():
        if (r.get("EndDate") or "")[:10] < "2026-01-01" or rid not in h:
            continue
        k = (r["CommitteeCode"], (r.get("StartDate") or "")[:10], (r.get("EndDate") or "")[:10], r.get("FilingType") or "")
        key = (r.get("SubmittedDate") or r.get("FilingDate") or "", int(rid or 0))
        if k not in per or key > per[k][0]:
            per[k] = (key, h[rid])
    out = {}
    for (code, *_), (_, v) in per.items():
        out[code] = round(out.get(code, 0.0) + v, 2)
    return out, urls

def soo_text(guid):
    txt = CACHE / "soo" / f"{guid}.txt"
    if txt.exists() and txt.stat().st_size > 0:
        return txt.read_text(errors="ignore")
    pdf = _get(SOO_URL.format(guid=guid), CACHE / "soo" / f"{guid}.pdf", timeout=60)
    if pdf is None:
        return None
    t = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout
    if t.strip():
        txt.write_text(t)
    pdf.unlink(missing_ok=True)
    return t or None

def prefetch_soo(guids):
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(10) as ex:
        list(ex.map(soo_text, guids))

def soo_fields(guid):
    """Residence locality, election year and amendment date from the committee's Statement of Organization (None if unreadable)."""
    t = soo_text(guid)
    if not t:
        return None
    L = t.split("\n")
    def before(label):
        for i, l in enumerate(L):
            if label in l:
                j = i - 1
                while j >= 0 and (not L[j].strip() or L[j].strip() == "Election" or (L[j].strip().startswith("X ") and "November" in L[j])):
                    j -= 1
                return L[j], l
        return None, None
    v, lab = before("County or City of Residence")
    res = v[:lab.find("Voter Identification") - 3].strip() if v else None
    year = None
    v, lab = before("Political Party")
    if v:
        yrs = [x for x in re.split(r"\s{2,}", v.strip()) if re.fullmatch(r"\d{4}", x)]
        year = yrs[0] if yrs else None
    m = re.search(r"Date Changes Took Effect.*?\n\s*(\d{1,2}/\d{1,2}/\d{4})", t, re.S)
    return {"residence": res, "year": year, "amended": not re.search(r"X\s+NEW", t),
            "changes_effective": m.group(1) if m else None}

def _mdy(ts):
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", ts or "")
    return f"{int(m.group(2))}/{int(m.group(3))}/{m.group(1)}" if m else None

def party_of(p):
    p = (p or "").strip()
    if p == "Democratic":
        return "D", p
    if p == "Republican":
        return "R", p
    if not p or p.lower() in ("write-in", "write in"):
        return None, p or None
    return "Other", p

SALUT = re.compile(r"^(mr|mrs|ms|miss|dr|delegate|del|senator|sen|hon|honorable|rev|sheriff|judge|colonel|col|captain|capt|major|maj|sgt|general|gen)\.?\s+", re.I)
ROMAN = {"II", "III", "IV", "V"}
def clean_name(n):
    """Display form of the record's candidate name: salutations and "Esq." dropped, ALL-CAPS words set in title case."""
    n = re.sub(r"\s+", " ", n or "").strip()
    while SALUT.match(n):
        n = SALUT.sub("", n, count=1)
    n = re.sub(r",?\s+Esq\.?$", "", n, flags=re.I)
    return " ".join(w if (w in ROMAN or not (w.isupper() and len(w) > 1)) else "-".join(p.capitalize() for p in w.split("-")) for w in n.split(" "))

def last_name(n):
    toks = [t for t in re.sub(r"[.,]", " ", n).split() if t.lower() not in ("jr", "sr", "ii", "iii", "iv")]
    return toks[-1].lower() if toks else ""

def ga_kind(office):
    o = office.lower()
    if "2001" in o or o.endswith("- ptr") or o.strip() in ("sd",):
        return "ambiguous"
    if "house of delegates" in o or o.strip() == "delegate":
        return "house"
    if re.fullmatch(r"(member,? )?(state )?senate( of virginia)?", o.strip()):
        return "senate"
    return None

def local_kind(office):
    o = office.lower()
    if o.startswith("do not use") or "special" in o:
        return "ambiguous"
    if "board of supervisors" in o:
        return "bos"
    if "school board" in o:
        return "sb"
    for k, lab in (("sheriff", "Sheriff"), ("commonwealth", "Commonwealth's Attorney"), ("treasurer", "Treasurer"), ("revenue", "Commissioner of the Revenue")):
        if k in o:
            return ("co", lab)
    if "clerk" in o:
        return ("co", "Clerk of the Circuit Court")
    return None

def dist_name(d):
    d = re.sub(r"(?i)^election\s*-\s*", "", d or "").strip()
    return re.sub(r"(?i)\s+(magisterial\s+)?district$", "", d).strip()

LATEST_ROWS = []  # latest report row of every candidate committee (any cycle), set by build()
RAISED = {}       # CommitteeCode -> dollars raised on 2026 reports, set by build()

def build(files, linked):
    """files: {office: data dict with races}. linked: {(city_id, seat_label): county_race_id}. Fills candidates in place.
    Returns a report dict (matched counts, unmatched, sources)."""
    rows, urls = latest_committees()
    LATEST_ROWS[:] = rows
    raised, h_urls = receipts_2026()
    RAISED.clear(); RAISED.update(raised)
    by_id = {r["id"]: (off, r) for off, d in files.items() for r in d["races"]}
    house = {r["district"]: r for r in files["house"]["races"]}
    senate = {r["district"]: r for r in files["senate"]["races"]}
    local_idx = {}
    for off in ("bos", "sb", "co"):
        for r in files[off]["races"]:
            local_idx.setdefault((off, r["locality_id"]), []).append(r)
    rep = {"report_files": urls, "receipts_files": h_urls, "considered": 0, "excluded_final": 0, "excluded_other_cycle": [], "matched": 0,
           "unmatched": [], "out_of_scope_local": 0, "soo_unreadable": []}
    placed = []
    prefetch_soo([r["AccountId"].strip("{}").lower() for r in rows if r.get("ElectionCycle") == "11/2027" and r.get("IsFinalReport") != "True"
                  and (ga_kind(r["OfficeSought"] or "") in ("house", "senate") or local_kind(r["OfficeSought"] or ""))])
    for r in rows:
        cyc = r.get("ElectionCycle", "")
        if not cyc.endswith("/2027"):
            continue
        guid = r["AccountId"].strip("{}").lower()
        rec = {"committee_name": re.sub(r"\s+", " ", r["CommitteeName"]).strip(), "committee_code": r["CommitteeCode"], "candidate": clean_name(r["CandidateName"]),
               "office_sought": r["OfficeSought"], "district": r["District"], "party_record": r["Party"] or None, "committee_url": COMMITTEE_URL.format(guid=guid),
               "latest_report_filed": _mdy(r.get("SubmittedDate") or r.get("FilingDate"))}
        if r.get("IsFinalReport") == "True":
            rep["excluded_final"] += 1
            continue
        if cyc != "11/2027":
            rep["excluded_other_cycle"].append({**rec, "reason": f"election cycle {cyc} (a special election, not the Nov. 2, 2027 general)"})
            continue
        rep["considered"] += 1
        office = r["OfficeSought"] or ""
        if office.lower().startswith("do not use"):
            rep["unmatched"].append({**rec, "reason": "office record is labeled 'Do Not Use' by the Department of Elections"})
            continue
        gk = ga_kind(office)
        target = None
        if gk == "ambiguous":
            rep["unmatched"].append({**rec, "reason": "office record names old (2001) lines, a partial term or an unclear chamber"})
            continue
        if gk in ("house", "senate"):
            m = re.search(r"\d+", r["District"] or "")
            n = int(m.group()) if m else None
            table = house if gk == "house" else senate
            if n is None or n not in table:
                rep["unmatched"].append({**rec, "reason": "no valid district number in the record"})
                continue
            target = (gk, table[n])
            soo = soo_fields(guid) or {}
            if soo.get("residence"):
                rec["residence"] = soo["residence"]
            rec["statement_url"] = SOO_URL.format(guid=guid)
        else:
            lk = local_kind(office)
            if lk is None:
                continue  # an office this page does not track (city council, town, soil and water, statewide)
            soo = soo_fields(guid)
            if soo is None or not soo.get("residence"):
                rep["soo_unreadable"].append(rec)
                continue
            loc = RESIDENCE.get(soo["residence"].strip().lower())
            if loc is None:
                rep["out_of_scope_local"] += 1
                continue
            rec["residence"] = soo["residence"]
            rec["statement_url"] = SOO_URL.format(guid=guid)
            if lk == "ambiguous":
                rep["unmatched"].append({**rec, "reason": "office record is marked special election or 'Do Not Use'"})
                continue
            off, seat = (lk[0], lk[1]) if isinstance(lk, tuple) else (lk, None)
            cand_loc = loc
            if off == "co" and (loc, seat) in linked:
                rid = linked[(loc, seat)]
                target = ("co", by_id[rid][1])
            else:
                races = local_idx.get((off, cand_loc), [])
                if off == "co":
                    hit = [x for x in races if x["seat"] == seat]
                else:
                    o, dn = office.lower(), dist_name(r["District"]).lower()
                    seats = {x["seat"]: x for x in races}
                    if "chair" in o:
                        hit = [seats["Chair"]] if "Chair" in seats else []
                    elif "at large" in o or "at-large" in o or dn in ("at large", "at-large"):
                        hit = [seats["At-Large"]] if "At-Large" in seats else ([seats["Chair"]] if "Chair" in seats and off == "bos" else [])
                    else:
                        hit = [x for s, x in seats.items() if s.lower() == dn]
                if len(hit) != 1:
                    why = ("no 2027 race for this office in " + soo["residence"]) if not races else \
                          (f"district '{dist_name(r['District']) or '(blank)'}' is not one of the seats on the 2027 ballot in {soo['residence']}")
                    rep["unmatched"].append({**rec, "reason": why})
                    continue
                target = (off, hit[0])
        off, race = target
        code, plabel = party_of(r["Party"])
        name = rec["candidate"]
        inc = False
        if off in ("house", "senate") and race.get("current_member"):
            inc = last_name(name) == last_name(race["current_member"]["name"])
        placed.append((race, {
            "name": name, "incumbent": inc, "party": code, "party_label": plabel, "endorsement": None,
            "party_source_url": rec["committee_url"] if code else None,
            "filing_kind": "registration", "label": LABEL, "committee_name": rec["committee_name"], "committee_code": rec["committee_code"],
            "committee_url": rec["committee_url"], "filing_source_url": rec["committee_url"],
            **({"statement_url": rec["statement_url"]} if rec.get("statement_url") else {}),
            **({"residence": rec["residence"]} if rec.get("residence") else {}),
            "office_sought_record": rec["office_sought"], "latest_report_filed": rec["latest_report_filed"], "district_record": rec["district"] or None,
            "filed_date": None, "filed_date_source_url": None,
            "_soo": soo_fields(guid) or {}, "_raised_2026": raised.get(rec["committee_code"], 0.0),
        }))
    for race, c in placed:
        dup = next((x for x in race["candidates"] if x.get("filing_kind") == "registration" and x["name"].lower() == c["name"].lower()), None)
        if dup:
            dup.setdefault("other_committees", []).append({"committee_name": c["committee_name"], "committee_url": c["committee_url"],
                                                           "committee_code": c["committee_code"], "_soo": c["_soo"], "_raised_2026": c["_raised_2026"]})
            continue
        race["candidates"].append(c)
        rep["matched"] += 1
    for d in files.values():
        for race in d["races"]:
            race["candidates"].sort(key=lambda c: (not c.get("incumbent"), c["name"].lower()))
    return rep

def coverage(fetch_text):
    """{"house": {locality_id: [{district, coverage, precincts, source_url}]}, "senate": {...}, "sources": [...]}"""
    page = fetch_text(REG_STATS_PAGE)
    assert page, f"could not read {REG_STATS_PAGE}"
    out, sources = {}, []
    for chamber, word in (("house", "House"), ("senate", "Senate")):
        links = re.findall(r'href="([^"]*Daily_Registrant_Count_By_' + word + r'_(\d{4}_\d{2}_\d{2})_\d+\.csv)"', page)
        assert links, f"no registrant-by-{word} file on {REG_STATS_PAGE}"
        href, _ = max(links, key=lambda x: x[1])
        url = href if href.startswith("http") else "https://www.elections.virginia.gov" + href
        sources.append(url)
        p = _get(url, CACHE / ("cov-" + url.rsplit("/", 1)[1]))
        assert p, url
        per = {}
        for r in csv.DictReader(io.StringIO(p.read_text(encoding="utf-8-sig", errors="replace"))):
            m = re.match(r"Locality:\s*\d+\s+(.*)", r["Locality"])
            toks = r["District"].split()
            if not m or len(toks) < 2:
                continue  # rows with no district (a handful of unassigned registrants) do not define coverage
            per.setdefault(m.group(1).strip(), {}).setdefault(int(toks[-1]), set()).add(r["PrecinctCode"])
        out.setdefault("statewide", {})[chamber] = {d: sorted(n for n, ds in per.items() if d in ds) for d in {d for ds in per.values() for d in ds}}
        cov = {}
        for lid, nm in REGFILE_NAME.items():
            ds = per.get(nm)
            assert ds, (chamber, nm, "not in", url)
            allp = set().union(*ds.values())
            cov[lid] = [{"district": d, "coverage": "all" if len(ds) == 1 else "part", "precincts": len(ps), "locality_precincts": len(allp), "source_url": url}
                        for d, ps in sorted(ds.items())]
        out[chamber] = cov
    out["sources"] = sources
    return out

# ---- Current members (official sources only) ----
HOUSE_MEMBERS_URL = "https://house.vga.virginia.gov/members"
SENATE_MEMBERS_URL = "https://apps.senate.virginia.gov/Senator/index.php"
LOUDOUN_BOS_URL = "https://www.loudoun.gov/m/directory/department?did=4"
FFX_BOS_URL = "https://www.fairfaxcounty.gov/boardofsupervisors/"
FFX_SB_URL = "https://www.fcps.edu/school-board/school-board-members"
PWC_BOS_URL = "https://www.pwcva.gov/department/board-county-supervisors"
HENRICO_BOS_URL = "https://henrico.gov/supervisors/"
CHES_SB_URL = "https://oneccps.org/page/school-board"
LOUDOUN_CO_URL = "https://www.loudoun.gov/89/Constitutional-Officers"
# Loudoun County FY2024 Annual Comprehensive Financial Report, directory of officials (school board terms run to Dec. 31, 2027).
# The school division's own site blocks automated reads, so the county's official report is the roster the build box can read.
LOUDOUN_SB_URL = "https://www.loudoun.gov/DocumentCenter/View/211930/FY2024-Loudoun-ACFR"
# (office, locality_id, seat) -> names exactly as the official page prints them; each is checked against the live page at build
# time and dropped if the page does not show it. Boards not listed here have no official roster the build box can read yet.
LOCAL_MEMBERS = {
    ("bos", "loudoun"): (LOUDOUN_BOS_URL, {"Chair": ["Phyllis J. Randall"], "Algonkian": ["Juli E. Briskman"], "Ashburn": ["Michael R. Turner"],
                                           "Broad Run": ["Sylvia R. Glass"], "Catoctin": ["Caleb A. Kershner"], "Dulles": ["Matthew F. Letourneau"],
                                           "Leesburg": ["Kristen C. Umstattd"], "Little River": ["Laura A. TeKrony"], "Sterling": ["Koran T. Saines"]}),
    ("sb", "loudoun"): (LOUDOUN_SB_URL, {"At-Large": ["Anne Donohue"], "Ashburn": ["Deana Griffiths"], "Catoctin": ["Kari LaBell"],
                                         "Little River": ["Dr. Sumera Rashid"]}),
    ("co", "loudoun"): (LOUDOUN_CO_URL, {"Sheriff": ["Mike Chapman"], "Commonwealth's Attorney": ["Bob Anderson"], "Treasurer": ["Henry C. Eickelberg"],
                                         "Commissioner of the Revenue": ["Bob Wertz"]}),
    ("bos", "fairfax-county"): (FFX_BOS_URL, {"Chair": ["Jeffrey C. McKay"], "Sully": ["Kathy L. Smith"], "Braddock": ["Rachna Sizemore Heizer"],
                                              "Dranesville": ["James N. Bierman, Jr."], "Franconia": ["Rodney L. Lusk"], "Hunter Mill": ["Walter L. Alcorn"],
                                              "Mason": ["Andres F. Jimenez"], "Mount Vernon": ["Daniel G. Storck"], "Providence": ["Dalia A. Palchik"],
                                              "Springfield": ["Pat Herrity"]}),
    ("sb", "fairfax-county"): (FFX_SB_URL, {"Braddock": ["Tom Dannan"], "Dranesville": ["Robyn Lady"], "Franconia": ["Marcia St. John-Cunning"],
                                            "Hunter Mill": ["Melanie K. Meren"], "Mason": ["Ricardy Anderson"], "Mount Vernon": ["Mateo Dunne"],
                                            "Providence": ["Karl Frisch"], "Springfield": ["Sandy Anderson"], "Sully": ["Seema Dixit"],
                                            "At-Large": ["Kyle McDaniel", "Ryan McElveen", "Ilryong Moon"]}),
    ("bos", "prince-william"): (PWC_BOS_URL, {"Chair": ["Deshundra Jefferson"], "Brentsville": ["Tom Gordy"], "Coles": ["Yesli Vega"], "Gainesville": ["George Stewart"],
                                              "Neabsco": ["Victor S. Angry"], "Occoquan": ["Kenny A. Boddye"], "Potomac": ["Andrea O. Bailey"], "Woodbridge": ["Jeannie LaCroix"]}),
    ("bos", "henrico"): (HENRICO_BOS_URL, {"Brookland": ["Daniel J. Schmitt"], "Varina": ["Tyrone E. Nelson"], "Three Chopt": ["Misty D. Roundtree"],
                                           "Tuckahoe": ["Jody K. Rogish"], "Fairfield": ["Roscoe D. Cooper III"]}),
    ("sb", "chesterfield"): (CHES_SB_URL, {"Midlothian": ["Lisa M. Hudgins"], "Matoaca": ["Steven A. Paranto"], "Bermuda": ["Ann C. Coker"],
                                           "Clover Hill": ["Christina Brady"], "Dale": ["Dominique R. Chatters"]}),
}

def _page_text(fetch_text, url):
    p = fetch_text(url)
    if not p:
        return None
    if p.startswith("%PDF"):
        path = fetch_text(url, binary=True)
        t = subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True).stdout
        return re.sub(r"\s+", " ", t)
    t = re.sub(r"(?s)<script.*?</script>|<style.*?</style>", " ", p)
    import html as _h
    return re.sub(r"\s+", " ", _h.unescape(re.sub(r"<[^>]+>", " ", t)))

def ga_members(fetch_text):
    """{chamber: {district: (name, party_or_None)}} from the House of Delegates and Senate of Virginia member lists."""
    out = {}
    t = _page_text(fetch_text, HOUSE_MEMBERS_URL)
    assert t, HOUSE_MEMBERS_URL
    h = {}
    for chunk in re.split(r"\S+@house\.virginia\.gov", t):
        m = re.search(r"([A-Z][^:]{2,80}?) Capitol Office: \S+ District: (\d+)", chunk)
        if not m:
            continue
        raw = m.group(1).strip()
        raw = re.sub(r"^.*(?:Email:|Members|Delegates)\s+", "", raw)
        parts = [x.strip() for x in raw.split(",")]
        suffix = [x for x in parts[2:] if re.fullmatch(r"Jr\.?|Sr\.?|II|III|IV", x)]
        nm = " ".join([parts[1] if len(parts) > 1 else "", parts[0]]).strip() + (", " + suffix[0] if suffix else "")
        h[int(m.group(2))] = (re.sub(r"\s+", " ", nm), None)
    out["house"] = h
    t = _page_text(fetch_text, SENATE_MEMBERS_URL)
    assert t, SENATE_MEMBERS_URL
    s = {}
    for m in re.finditer(r"(?:View Profile |Senators? )?([A-Z][A-Za-z'\-.\" ]+?) District (\d+) Party: (Democrat|Republican|Independent)", t):
        s[int(m.group(2))] = (m.group(1).replace("View Profile ", "").strip(), {"Democrat": "D", "Republican": "R"}.get(m.group(3), "Other"))
    out["senate"] = s
    return out

def local_members(fetch_text):
    """{(office, locality_id, seat): [{name, source_url}]} for names confirmed on the live official page; plus a list of misses."""
    out, misses = {}, []
    for (off, lid), (url, seats) in LOCAL_MEMBERS.items():
        t = _page_text(fetch_text, url)
        for seat, names in seats.items():
            for n in names:
                if t and n in t:
                    out.setdefault((off, lid, seat), []).append({"name": n, "party": None, "source_url": url})
                else:
                    misses.append({"office": off, "locality_id": lid, "seat": seat, "name": n, "source_url": url})
    return out, misses


# ---- Counting rule (see module docstring) ----
def norm_locality(name):
    """Statement of Organization residence -> the registrant file's locality name ("CITY OF WINCHESTER" -> "WINCHESTER CITY")."""
    n = re.sub(r"\s+", " ", (name or "").upper().replace(",", " ")).strip()
    n = re.sub(r"^(THE )?COUNTY OF (.+)$", r"\2 COUNTY", n)
    n = re.sub(r"^(THE )?CITY OF (.+)$", r"\2 CITY", n)
    n = n.replace("SAINT ", "ST ").replace("ST. ", "ST ")
    return n or None

def residence_in_district(residence, localities):
    """True / False when the residence is a recognizable locality; None when it cannot be read (not dropped on that alone)."""
    n = norm_locality(residence)
    if not n:
        return None
    known = {x.replace("ST. ", "ST ") for x in localities}
    if n in known:
        return True
    if not re.search(r"(COUNTY|CITY)$", n):
        # bare name ("Loudoun", "Winchester"): accept a match on either suffix
        return any(k in (n + " COUNTY", n + " CITY") for k in known) or None
    return False

NICK = {"bob": "robert", "rob": "robert", "bobby": "robert", "mike": "michael", "bill": "william", "will": "william", "jim": "james",
        "jimmy": "james", "tom": "thomas", "dick": "richard", "rick": "richard", "chuck": "charles", "ted": "edward", "ned": "edward",
        "peggy": "margaret", "liz": "elizabeth", "beth": "elizabeth", "kate": "katherine", "kathy": "katherine", "sandy": "sandra",
        "tony": "anthony", "pat": "patrick", "jack": "john", "hank": "henry", "larry": "lawrence", "jerry": "gerald", "andy": "andrew"}
def first_initial(n):
    toks = [t for t in re.sub(r"[.,\"()]", " ", clean_name(n)).split() if t]
    if not toks:
        return ""
    t = toks[0].lower()
    return NICK.get(t, t)[0]

def same_person(a, b):
    """Clean match of a committee's candidate to an official member name: same last name and same first initial."""
    return bool(a and b) and last_name(a) == last_name(b) and first_initial(a) == first_initial(b)

def _activity(code, soo, raised):
    sig = []
    m = re.match(r"CC-(\d{2})-", code or "")
    if m and int(m.group(1)) >= 26:
        sig.append("registered in 20" + m.group(1))
    ce = (soo or {}).get("changes_effective") or ""
    if (soo or {}).get("year") == "2027" and ce[-4:].isdigit() and int(ce[-4:]) >= 2026 and (soo or {}).get("amended"):
        sig.append("Statement of Organization amended in " + ce[-4:] + " naming 2027")
    if raised > 0:
        sig.append(f"raised ${raised:,.0f} on 2026 reports")
    return sig

def apply_rule(files, statewide_cov):
    """Drop placed committees that fail the counting rule; set race["check"] for record-keeping flags. Returns a report dict."""
    rep = {"kept": 0, "dropped": [], "residence_unreadable_kept": [], "check": []}
    for off, d in files.items():
        for race in d["races"]:
            keep = []
            for c in race["candidates"]:
                if c.get("filing_kind") != "registration":
                    keep.append(c)
                    continue
                pool = [(c["committee_code"], c.pop("_soo", {}), c.pop("_raised_2026", 0.0))]
                for o in c.get("other_committees", []):
                    pool.append((o.get("committee_code"), o.pop("_soo", {}), o.pop("_raised_2026", 0.0)))
                    o.pop("committee_code", None)
                sig = []
                for code, soo, raised in pool:
                    sig += [x for x in _activity(code, soo, raised) if x not in sig]
                if c.get("incumbent"):
                    sig.append("current officeholder")
                why = None
                if off in ("house", "senate"):
                    ok = residence_in_district(c.get("residence"), statewide_cov[off].get(race["district"], []))
                    if ok is False:
                        why = f"residence ({c.get('residence')}) is outside the current {('House' if off == 'house' else 'Senate')} District {race['district']}; committee is from the pre-2023 district with the same number"
                    elif ok is None and not c.get("incumbent"):
                        rep["residence_unreadable_kept"].append({"race": race["id"], "name": c["name"], "committee_code": c["committee_code"]})
                if not why and not sig:
                    why = "no 2027 activity: registered before 2026, no 2026 Statement of Organization naming 2027, $0 raised on 2026 reports, and not the current officeholder"
                if why:
                    rep["dropped"].append({"race": race["id"], "name": c["name"], "party": c.get("party"), "committee_code": c["committee_code"],
                                           "committee_url": c["committee_url"], "reason": why})
                    continue
                c["activity"] = sig
                keep.append(c)
            race["candidates"] = keep
            rep["kept"] += sum(1 for c in keep if c.get("filing_kind") == "registration")
            flag = check_flag(off, race)
            if flag:
                race["check"] = flag
                rep["check"].append({"race": race["id"], **flag})
    return rep

def check_flag(off, race):
    """The current officeholder has no counted committee but has a flagged record for this seat (final after 2026 money, or 'Do Not Use')."""
    members = race.get("current_members") or ([race["current_member"]] if race.get("current_member") else [])
    if not members or any(c.get("incumbent") for c in race["candidates"]):
        return None
    for m in members:
        for r in LATEST_ROWS:
            if not same_person(r.get("CandidateName"), m["name"]):
                continue
            office = (r.get("OfficeSought") or "").lower()
            dnu = office.startswith("do not use")
            if off in ("house", "senate"):
                gk = ga_kind(re.sub(r"(?i)^do not use\s*", "", r.get("OfficeSought") or ""))
                dm = re.search(r"\d+", r.get("District") or "")
                if gk != off or not dm or int(dm.group()) != race["district"]:
                    continue
            else:
                lk = local_kind(re.sub(r"(?i)^do not use\s*", "", r.get("OfficeSought") or ""))
                kind = lk[0] if isinstance(lk, tuple) else lk
                if kind != off:
                    continue
                if off != "co" and race["seat"] not in ("Chair", "At-Large") and dist_name(r.get("District")).lower() != race["seat"].lower():
                    continue
                soo = soo_fields(r["AccountId"].strip("{}").lower()) or {}
                if RESIDENCE.get((soo.get("residence") or "").strip().lower()) != race.get("locality_id"):
                    continue
            url = COMMITTEE_URL.format(guid=r["AccountId"].strip("{}").lower())
            raised = RAISED.get(r["CommitteeCode"], 0.0)
            if dnu:
                return {"label": "Check", "member": m["name"], "committee_url": url,
                        "note": f"{m['name']}'s committee is labeled \"Do Not Use\" in the Virginia Department of Elections record, so it is not counted."}
            if r.get("IsFinalReport") == "True" and raised > 0:
                return {"label": "Check", "member": m["name"], "committee_url": url,
                        "note": f"{m['name']} raised ${raised:,.0f} on 2026 reports, but the latest report is marked final in the Virginia Department of Elections record, so it is not counted."}
    return None
