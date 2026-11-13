#!/usr/bin/env python3
"""Build official campaign-money summaries for sitting legislators.

Source: Virginia Department of Elections monthly CF CSVs in
/workspace/research/elect_bulk (Report.csv + Schedules A–I). Never uses VPAP.

For each sitting legislator, keep only the latest amendment of each filing,
read Schedule H/G for official totals, and itemize current-cycle gifts and
spending from the schedule months we have on hand (2022-01 through 2023-01
and 2026-01 through 2026-10). Each member's 2021-present history also carries
itemized gift and payment totals by month (with the top givers and vendors per month)
for the site's year-and-month filter and raised-vs-spent charts.

Kilgore for Delegate (CC-12-00170, report 495571) is verified against the
official XML at cfreports.elections.virginia.gov/Report/ReportXML/495571.
"""
from __future__ import annotations

import csv
import json
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path

WT = Path(__file__).resolve().parents[2]
BULK = Path("/workspace/research/elect_bulk")
# Filtered copies of the same official monthly files for months whose itemized
# schedules were missing from BULK (2021-01..2021-12 and 2023-02..2025-12).
# Rows are kept only for the sitting members' committees and their earlier
# House/Senate committees (tools/finance/prior-ga-committees.json).
HIST = Path("/workspace/research/elect_hist")
PRIOR_COMMITTEES = Path(__file__).resolve().parent / "prior-ga-committees.json"
WINDOW_START = date(2021, 1, 1)  # never go back before 2021
HISTORY_DONORS_PER_YEAR = 25
HISTORY_VENDORS_PER_YEAR = 15
HISTORY_ITEMS_PER_ROW = 25
HISTORY_MONTH_TOP = 10  # top givers / vendors kept per month for the year-and-month filter
COMMITTEES = WT / "src/content/finance-committees.json"
DONORS_FILE = WT / "src/content/finance-donors.json"
OUT = WT / "src/content/finance-summaries.json"
CSV_DIR = WT / "public/files/campaign-money"

# Official XML for Kilgore's mid-year 2026 report, fetched 2026-11-12.
KILGORE_XML = {
    "committeeCode": "CC-12-00170",
    "reportId": "495571",
    "endingBalanceCents": 7_665_439,
    "raisedCycleCents": 11_569_600,
    "spentCycleCents": 14_692_540,
    "scheduleATotalCents": 10_770_000,
    "scheduleBTotalCents": 756_600,
    "scheduleCTotalCents": 43_000,
    "scheduleDTotalCents": 13_935_940,
    "filed": "2026-07-14",
    "start": "2026-01-01",
    "end": "2026-06-30",
}

US_STATES = {
    "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM",
    "NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA",
    "WV","WI","WY","AS","GU","MP","PR","VI",
}

# Inclusive 5-digit ZIP ranges, lowest to highest, first match wins after sort.
ZIP_RANGES = [
    (501, 599, "NY"), (1000, 2799, "MA"), (2800, 2999, "RI"), (3000, 3899, "NH"),
    (3900, 4999, "ME"), (5000, 5999, "VT"), (6000, 6999, "CT"), (7000, 8999, "NJ"),
    (9000, 9999, "AE"),  # military, treat as out-of-state / not VA
    (10000, 14999, "NY"), (15000, 19699, "PA"), (19700, 19999, "DE"),
    (20001, 20099, "DC"), (20100, 20199, "VA"), (20200, 20599, "DC"),
    (20600, 21999, "MD"), (22000, 24699, "VA"), (24700, 26899, "WV"),
    (27000, 28999, "NC"), (29000, 29999, "SC"), (30000, 31999, "GA"),
    (32000, 34999, "FL"), (35000, 36999, "AL"), (37000, 38599, "TN"),
    (38600, 39799, "MS"), (39800, 39999, "GA"), (40000, 42799, "KY"),
    (43000, 45999, "OH"), (46000, 47999, "IN"), (48000, 49999, "MI"),
    (50000, 52899, "IA"), (53000, 54999, "WI"), (55000, 56799, "MN"),
    (57000, 57799, "SD"), (58000, 58899, "ND"), (59000, 59999, "MT"),
    (60000, 62999, "IL"), (63000, 65899, "MO"), (66000, 67999, "KS"),
    (68000, 69399, "NE"), (70000, 71499, "LA"), (71600, 72999, "AR"),
    (73000, 74999, "OK"), (75000, 79999, "TX"), (80000, 81699, "CO"),
    (82000, 83199, "WY"), (83200, 83899, "ID"), (84000, 84799, "UT"),
    (85000, 86599, "AZ"), (87000, 88499, "NM"), (88900, 89899, "NV"),
    (90000, 96199, "CA"), (96700, 96899, "HI"), (97000, 97999, "OR"),
    (98000, 99499, "WA"), (99500, 99999, "AK"),
]


def fold(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "").lower()
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def slugify(name: str) -> str:
    s = fold(name).replace(" ", "-")
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:80] or "donor"


def money_cents(raw: str) -> int:
    s = (raw or "").strip().replace(",", "").replace("$", "")
    if not s:
        return 0
    try:
        return int(round(float(s) * 100))
    except ValueError:
        return 0


def is_true(v: str) -> bool:
    return (v or "").strip().lower() in {"true", "1", "yes", "y"}


def fix_text(v: str) -> str:
    """State files are Windows-1252; csv is read as latin-1, so repair curly quotes/dashes."""
    if not v or not any("\x80" <= ch <= "\x9f" for ch in v):
        return v
    try:
        return v.encode("latin-1").decode("cp1252")
    except UnicodeError:
        return v


def read_rows(path: Path):
    with path.open(encoding="latin-1", newline="") as f:
        for row in csv.DictReader(f):
            yield {k: fix_text(v) if isinstance(v, str) else v for k, v in row.items()}


def month_dir(month: str) -> Path:
    """Prefer whichever copy of a month has itemized schedules."""
    if (BULK / month / "ScheduleA.csv").exists():
        return BULK / month
    if (HIST / month / "ScheduleA.csv").exists():
        return HIST / month
    return BULK / month


def iso_date(raw: str) -> str:
    s = (raw or "").strip()
    if not s:
        return ""
    s = s.replace("T", " ")
    for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f", "%m/%d/%Y"):
        try:
            return datetime.strptime(s[:26].split(".")[0], fmt if ":" not in fmt or " " in s else "%Y-%m-%d").strftime("%Y-%m-%d")
        except ValueError:
            continue
    # last chance: first 10 chars if they look like ISO
    if re.match(r"\d{4}-\d{2}-\d{2}", s):
        return s[:10]
    return s[:10]


def parse_day(raw: str) -> date | None:
    s = iso_date(raw)
    if not s or not re.match(r"\d{4}-\d{2}-\d{2}$", s):
        return None
    try:
        return date.fromisoformat(s)
    except ValueError:
        return None


def display_name(first: str, middle: str, last: str, prefix: str = "", suffix: str = "") -> str:
    parts = [p.strip() for p in (prefix, first, middle, last, suffix) if p and p.strip()]
    return " ".join(parts)


def normalize_zip(raw: str) -> str:
    digits = re.sub(r"\D", "", raw or "")
    return digits[:5] if len(digits) >= 5 else digits


def state_from_zip(zip_code: str) -> str:
    z = normalize_zip(zip_code)
    if len(z) < 5:
        return ""
    n = int(z)
    for lo, hi, st in ZIP_RANGES:
        if lo <= n <= hi:
            return st if st != "AE" else ""
    return ""


def donor_state(state_code: str, zip_code: str) -> str:
    st = (state_code or "").strip().upper()
    if st in {"N/A", "NA", "NULL", "NONE", "--", "XX"}:
        st = ""
    if st in US_STATES:
        return st
    inferred = state_from_zip(zip_code)
    return inferred or ""


def origin_bucket(state: str) -> str:
    if state == "VA":
        return "inState"
    if state:
        return "outOfState"
    return "unknown"


PARTY_RE = re.compile(
    r"\b(republican party|democratic party|democrat party|libertarian party|"
    r"green party|gop\b|virginia democrats|virginia republican|"
    r"house republican|house democratic|senate republican|senate democratic|"
    r"legislative majority|legislative caucus|party committee|political party)\b",
    re.I,
)
CAND_RE = re.compile(
    r"\b(candidate committee|for delegate|for senate|for senator|for house|"
    r"for supervisor|for school board|for congress|for clerk|for sheriff|"
    r"for treasurer|for commissioner|for mayor|for council)\b",
    re.I,
)
PAC_RE = re.compile(
    r"\b(political action|political committee|leadership pac|"
    r"cce|referendum committee|committee for responsible government)\b|pac\b",
    re.I,
)


def donor_type(name: str, occupation: str, is_individual: bool) -> str:
    """Map a Schedule A/B giver to official-style categories.

    Individuals follow the state's IsIndividual flag. Political committees
    (PACs, party, and candidate committees) are tagged from the filed name or
    occupation. Remaining non-individual givers are businesses and other
    organizations — we do not guess a separate nonprofit class.
    """
    blob = f"{name} {occupation}"
    if PARTY_RE.search(blob):
        return "party"
    if CAND_RE.search(blob) or re.search(r"\bfor delegate\b|\bfor senate\b", name, re.I):
        return "candidate"
    if PAC_RE.search(blob):
        return "pac"
    if is_individual:
        return "individual"
    return "business"


def type_bucket(kind: str) -> str:
    if kind == "individual":
        return "individual"
    if kind in {"party", "candidate"}:
        return "transfer"
    return "pac"


def spend_category(item: str, payee: str) -> str:
    item_l = (item or "").strip().lower()
    t = f"{item_l} {payee or ''}".lower()
    if item_l in {"donation", "campaign contribution", "contribution", "political contribution"} or re.search(
        r"\b(contribution to|donation to|campaign contribution)\b", t
    ):
        return "Money given to other campaigns"
    if any(k in t for k in ("poll", "survey", "research")):
        return "Polling and research"
    if any(k in t for k in ("facebook", "meta ", "instagram", "google ads", "advertis", "ad buy", "media buy", "radio", "television", "tv ad", "yard sign", "campaign material", "printing", "postage", "mailing", "direct mail", "newspaper", "sponsor")):
        return "Advertising and campaign materials"
    if any(k in t for k in ("consult", "campaign work", "session work", "strategy")):
        return "Consulting and campaign work"
    if any(k in t for k in ("legal", "attorney", "compliance", "account", "bookkeep", "treasur")):
        return "Legal, accounting, and compliance"
    if any(k in t for k in ("salary", "payroll", "wages", "staff", "office work")):
        return "Staff and payroll"
    if any(k in t for k in ("mileage", "travel", "hotel", "lodging", "airfare", "per diem", "parking", "gas ", "fuel", "uber", "lyft")):
        return "Travel"
    if any(k in t for k in ("rent", "office", "telephone", "phone", "utility", "utilities", "internet", "software", "supplies", "equipment")):
        return "Office and administration"
    if any(k in t for k in ("fundrais", "event", "catering", "food", "meal", "meeting expense", "banquet")):
        return "Fundraising and events"
    if item_l in {"", "n/a", "na", "none", "miscellaneous", "misc", "other"}:
        return "Not stated / can't tell"
    return "Not stated / can't tell"


def cycle_label(cycle: str) -> str:
    s = (cycle or "").strip()
    m = re.match(r"(\d{1,2})/(\d{4})$", s)
    if m:
        month, year = int(m.group(1)), m.group(2)
        month_name = date(2000, month, 1).strftime("%B")
        return f"{month_name} {year} election cycle"
    return s or "this election cycle"


def pretty_usd_header(cents: int) -> str:
    sign = "-" if cents < 0 else ""
    cents = abs(cents)
    dollars, rem = divmod(cents, 100)
    if rem:
        return f"{sign}${dollars:,}.{rem:02d}"
    return f"{sign}${dollars:,}"


def load_indexed_donor_ids() -> set[str]:
    if not DONORS_FILE.exists():
        return set()
    raw = json.loads(DONORS_FILE.read_text())
    ids = set()
    names_to_id = {}
    for d in raw.get("donors") or []:
        if isinstance(d, dict) and d.get("id"):
            ids.add(d["id"])
            name = d.get("n") or d.get("name") or ""
            if name:
                names_to_id[slugify(name)] = d["id"]
        elif isinstance(d, dict) and d.get("n"):
            ids.add(slugify(d["n"]))
    # also accept slugs
    ids.update(names_to_id.values())
    ids.update(names_to_id.keys())
    return ids


def build_history(lis_id, meta, prior_committees, winners, schedules, add_txn, indexed_donors):
    """Year-by-year money from 2021 to the latest filing, across the member's current
    committee and any earlier House/Senate committee. Uses only the latest amendment of
    each scheduled report (large-contribution reports repeat gifts and are skipped)."""
    codes = [meta["committeeCode"]] + [c["committeeCode"] for c in prior_committees if c["committeeCode"] != meta["committeeCode"]]
    names = {meta["committeeCode"]: meta["committeeName"]}
    for c in prior_committees:
        names.setdefault(c["committeeCode"], c["committeeName"])
    reps = sorted(
        (r for r in winners.values() if r["committeeCode"] in codes and r["filingType"] == "Report"),
        key=lambda r: (r["end"], r["start"], r["reportId"]),
    )
    years: dict[int, dict] = {}

    def yr(y: int) -> dict:
        if y not in years:
            years[y] = {
                "year": y, "raisedCents": 0, "spentCents": 0, "endingBalanceCents": None,
                "reports": 0, "giftCount": 0, "giftCents": 0, "paymentCount": 0, "paymentCents": 0,
                "committees": [], "_donors": {}, "_vendors": {}, "_months": {},
            }
        return years[y]

    def mo(y: dict, d: str) -> dict:
        m = int(d[5:7])
        if m not in y["_months"]:
            y["_months"][m] = {"month": m, "giftCount": 0, "giftCents": 0, "paymentCount": 0, "paymentCents": 0,
                               "_donors": {}, "_vendors": {}}
        return y["_months"][m]

    report_rows = []
    csv_lines = [["section", "date", "name", "amount_usd", "city", "state", "type", "employer", "occupation",
                  "description", "schedule", "report_id", "report_period", "committee_code", "committee_name"]]
    today = date.today().isoformat()
    for rec in reps:
        sch = schedules.get(rec["reportId"]) or {}
        h = (sch.get("H") or [None])[0]
        end_year = int(rec["end"][:4]) if rec["end"] else None
        receipts = money_cents((h or {}).get("CurrentReceipts") or "") if h else 0
        disb = money_cents((h or {}).get("CurrentDisbursements") or "") if h else 0
        ending = money_cents((h or {}).get("EndingBalance") or "") if h else None
        report_rows.append({
            "reportId": rec["reportId"], "committeeCode": rec["committeeCode"],
            "committeeName": rec["committeeName"] or names.get(rec["committeeCode"], ""),
            "start": rec["start"], "end": rec["end"], "filed": rec["filingDate"],
            "amendment": rec["amendmentCount"], "receiptsCents": receipts, "disbursementsCents": disb,
            "endingBalanceCents": ending, "hasSchedules": bool(h),
        })
        if end_year:
            y = yr(end_year)
            y["reports"] += 1
            y["raisedCents"] += receipts
            y["spentCents"] += disb
            if ending is not None:
                y["endingBalanceCents"] = ending
            cname = rec["committeeName"] or names.get(rec["committeeCode"], "")
            if cname and cname not in y["committees"]:
                y["committees"].append(cname)
        period = f"{rec['start']} to {rec['end']}"
        for sched in ("A", "B", "D"):
            bucket: list[dict] = []
            for row in sch.get(sched) or []:
                add_txn(bucket, row, sched)
            for t in bucket:
                d = t["date"] or rec["end"]
                if not d or d < WINDOW_START.isoformat() or d > today:
                    if not d or d < WINDOW_START.isoformat():
                        continue
                y = yr(int(d[:4]))
                m = mo(y, d)
                csv_lines.append([
                    {"A": "contribution", "B": "in_kind", "D": "expenditure"}[sched], t["date"], t["name"],
                    pretty_usd_header(t["cents"]), t["city"], t["state"], t["kind"] if sched != "D" else "",
                    t["employer"] if sched != "D" else "", t["occupation"] if sched != "D" else "",
                    t["item"], sched, rec["reportId"], period, rec["committeeCode"],
                    rec["committeeName"] or names.get(rec["committeeCode"], ""),
                ])
                if sched == "D":
                    y["paymentCount"] += 1
                    y["paymentCents"] += t["cents"]
                    key = fold(t["name"]) or t["name"]
                    m["paymentCount"] += 1
                    m["paymentCents"] += t["cents"]
                    mv = m["_vendors"].setdefault(key, {"name": t["name"], "cents": 0, "count": 0})
                    mv["cents"] += t["cents"]
                    mv["count"] += 1
                    v = y["_vendors"].setdefault(key, {"name": t["name"], "cents": 0, "count": 0, "items": []})
                    v["cents"] += t["cents"]
                    v["count"] += 1
                    v["items"].append({"item": t["item"], "date": t["date"], "cents": t["cents"],
                                       "category": spend_category(t["item"], t["name"])})
                else:
                    y["giftCount"] += 1
                    y["giftCents"] += t["cents"]
                    key = fold(t["name"]) or t["name"]
                    m["giftCount"] += 1
                    m["giftCents"] += t["cents"]
                    md = m["_donors"].setdefault(key, {"name": t["name"], "cents": 0, "count": 0, "kind": t["kind"]})
                    md["cents"] += t["cents"]
                    md["count"] += 1
                    dn = y["_donors"].setdefault(key, {"name": t["name"], "cents": 0, "count": 0, "kind": t["kind"],
                                                       "city": t["city"], "state": t["state"], "inKindCents": 0, "gifts": []})
                    dn["cents"] += t["cents"]
                    dn["count"] += 1
                    if sched == "B":
                        dn["inKindCents"] += t["cents"]
                    gift = {"date": t["date"], "cents": t["cents"], "type": "inkind" if sched == "B" else "direct",
                            "reportId": rec["reportId"]}
                    if sched == "B" and t["item"]:
                        gift["item"] = t["item"]
                    if t["individual"]:
                        if t["employer"]:
                            gift["employer"] = t["employer"]
                        if t["occupation"]:
                            gift["occupation"] = t["occupation"]
                    dn["gifts"].append(gift)
    out_years = []
    for y in sorted(years.values(), key=lambda v: -v["year"]):
        if y["year"] < WINDOW_START.year:
            continue
        donors = sorted(y.pop("_donors").values(), key=lambda d: (-d["cents"], d["name"]))
        vendors = sorted(y.pop("_vendors").values(), key=lambda d: (-d["cents"], d["name"]))
        y["donorCount"] = len(donors)
        y["vendorCount"] = len(vendors)
        top = []
        for dn in donors[:HISTORY_DONORS_PER_YEAR]:
            dn["gifts"].sort(key=lambda g: (g["date"] or "", g["cents"]), reverse=True)
            dn["gifts"] = dn["gifts"][:HISTORY_ITEMS_PER_ROW]
            slug = slugify(dn["name"])
            if slug in indexed_donors:
                dn["donorId"] = slug
            if not dn["inKindCents"]:
                dn.pop("inKindCents")
            top.append(dn)
        topv = []
        for v in vendors[:HISTORY_VENDORS_PER_YEAR]:
            v["items"].sort(key=lambda g: (g["date"] or "", g["cents"]), reverse=True)
            v["items"] = v["items"][:HISTORY_ITEMS_PER_ROW]
            topv.append(v)
        y["donors"] = top
        y["vendors"] = topv
        months = []
        for m in sorted(y.pop("_months").values(), key=lambda v: v["month"]):
            mdonors = sorted(m.pop("_donors").values(), key=lambda d: (-d["cents"], d["name"]))
            mvendors = sorted(m.pop("_vendors").values(), key=lambda d: (-d["cents"], d["name"]))
            m["donorCount"] = len(mdonors)
            m["vendorCount"] = len(mvendors)
            m["donors"] = mdonors[:HISTORY_MONTH_TOP]
            m["vendors"] = mvendors[:HISTORY_MONTH_TOP]
            months.append(m)
        y["months"] = months
        if y["endingBalanceCents"] is None:
            y.pop("endingBalanceCents")
        out_years.append(y)
    committees = [{"committeeCode": c, "committeeName": names.get(c, ""), "current": c == meta["committeeCode"]} for c in codes
                  if any(r["committeeCode"] == c for r in report_rows)]
    history = {
        "from": WINDOW_START.isoformat(),
        "through": report_rows[-1]["end"] if report_rows else None,
        "committees": committees,
        "years": out_years,
        "reports": list(reversed(report_rows)),
        "csvPath": f"/files/campaign-money/history/{meta['slug']}.csv" if len(csv_lines) > 1 else None,
        "note": (
            "Raised and spent by year are the official per-report totals (Schedule H) for scheduled reports whose period "
            "ended that year. Top givers and vendors are the itemized rows dated that year. Large-contribution reports "
            "repeat gifts already on scheduled reports, so they are not counted twice."
        ),
    }
    return history, (csv_lines if len(csv_lines) > 1 else None)


def main() -> None:
    committees = json.loads(COMMITTEES.read_text())
    members = committees["members"]
    by_code = {v["committeeCode"]: v for v in members.values()}
    prior = json.loads(PRIOR_COMMITTEES.read_text())["members"] if PRIOR_COMMITTEES.exists() else {}
    prior_codes = {c["committeeCode"]: lis for lis, p in prior.items() for c in p["committees"]}
    wanted_codes = set(by_code) | set(prior_codes)
    indexed_donors = load_indexed_donor_ids()

    months = sorted(
        {p.name for root in (BULK, HIST) if root.exists() for p in root.iterdir() if p.is_dir() and re.match(r"\d{4}_\d{2}$", p.name)}
    )
    months = [m for m in months if m >= f"{WINDOW_START.year}_01"]
    schedule_months = [m for m in months if (month_dir(m) / "ScheduleA.csv").exists()]

    # Collect reports for our committees
    reports_by_id: dict[str, dict] = {}
    for month in months:
        path = month_dir(month) / "Report.csv"
        if not path.exists():
            continue
        if True:
            for row in read_rows(path):
                code = (row.get("CommitteeCode") or "").strip()
                if code not in wanted_codes:
                    continue
                rid = (row.get("ReportId") or "").strip()
                if not rid:
                    continue
                rec = {
                    "reportId": rid,
                    "uid": (row.get("ReportUID") or "").strip() or f"id:{rid}",
                    "committeeCode": code,
                    "committeeName": (row.get("CommitteeName") or "").strip(),
                    "committeeId": (row.get("AccountId") or "").strip(),
                    "filingType": (row.get("FilingType") or "").strip(),
                    "isAmendment": is_true(row.get("IsAmendment") or ""),
                    "amendmentCount": int(row.get("AmendmentCount") or 0),
                    "filingDate": iso_date(row.get("FilingDate") or ""),
                    "submittedDate": iso_date(row.get("SubmittedDate") or row.get("FilingDate") or ""),
                    "dueDate": iso_date(row.get("DueDate") or ""),
                    "start": iso_date(row.get("StartDate") or ""),
                    "end": iso_date(row.get("EndDate") or ""),
                    "cycle": (row.get("ElectionCycle") or "").strip(),
                    "cycleStart": iso_date(row.get("ElectionCycleStartDate") or ""),
                    "cycleEnd": iso_date(row.get("ElectionCycleEndDate") or ""),
                    "noActivity": is_true(row.get("NoActivity") or ""),
                    "isFinal": is_true(row.get("IsFinalReport") or ""),
                    "startBalanceCents": money_cents(row.get("BalanceLastReportingPeriod") or ""),
                }
                # later monthly dumps replace earlier copies of the same id
                reports_by_id[rid] = rec

    # Latest amendment per ReportUID (and per period+type as a safety net)
    best_by_uid: dict[str, dict] = {}
    for rec in reports_by_id.values():
        key = rec["uid"]
        prev = best_by_uid.get(key)
        if prev is None or (rec["amendmentCount"], rec["submittedDate"], rec["reportId"]) > (
            prev["amendmentCount"],
            prev["submittedDate"],
            prev["reportId"],
        ):
            best_by_uid[key] = rec
    winners = {rec["reportId"]: rec for rec in best_by_uid.values()}

    # Also collapse rare cases of different UIDs for the same period+type (keep higher amendment)
    period_best: dict[tuple, dict] = {}
    for rec in winners.values():
        pkey = (rec["committeeCode"], rec["start"], rec["end"], rec["filingType"])
        prev = period_best.get(pkey)
        if prev is None or (rec["amendmentCount"], rec["submittedDate"], rec["reportId"]) > (
            prev["amendmentCount"],
            prev["submittedDate"],
            prev["reportId"],
        ):
            period_best[pkey] = rec
    winners = {
        rec["reportId"]: rec
        for rec in period_best.values()
        # Do not go back before 2021: drop reports whose period ended in 2020 or earlier.
        if not rec["end"] or rec["end"] >= WINDOW_START.isoformat()
    }
    winner_ids = set(winners)

    # Load schedules only for winning reports of our committees
    schedules: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))
    seen_row: set[tuple] = set()
    sched_files = {
        "A": "ScheduleA.csv",
        "B": "ScheduleB.csv",
        "C": "ScheduleC.csv",
        "D": "ScheduleD.csv",
        "E": "ScheduleE.csv",
        "F": "ScheduleF.csv",
        "G": "ScheduleG.csv",
        "H": "ScheduleH.csv",
        "I": "ScheduleI.csv",
    }
    for month in schedule_months:
        for key, fname in sched_files.items():
            path = month_dir(month) / fname
            if not path.exists():
                continue
            if True:
                for row in read_rows(path):
                    rid = (row.get("ReportId") or "").strip()
                    if rid not in winner_ids:
                        continue
                    row_id = (
                        row.get("ScheduleAId")
                        or row.get("ScheduleBId")
                        or row.get("ScheduleCId")
                        or row.get("ScheduleDId")
                        or row.get("ScheduleEId")
                        or row.get("ScheduleFId")
                        or row.get("ScheduleGId")
                        or row.get("ScheduleHId")
                        or row.get("ScheduleIId")
                        or ""
                    )
                    uniq = (key, rid, row_id or json.dumps(row, sort_keys=True))
                    if uniq in seen_row:
                        continue
                    seen_row.add(uniq)
                    schedules[rid][key].append(row)

    def latest_periodic(code: str) -> dict | None:
        rows = [
            r
            for r in winners.values()
            if r["committeeCode"] == code and r["filingType"] == "Report"
        ]
        if not rows:
            return None
        return max(rows, key=lambda r: (r["end"], r["submittedDate"], r["amendmentCount"], r["reportId"]))

    members_out: dict[str, dict] = {}
    csv_rows_by_slug: dict[str, list[list[str]]] = {}
    history_csv_by_slug: dict[str, list[list[str]]] = {}

    for lis_id, meta in members.items():
        code = meta["committeeCode"]
        latest = latest_periodic(code)
        honorific = "Del." if meta["chamber"] == "house" else "Sen."
        base = {
            "lisId": lis_id,
            "slug": meta["slug"],
            "name": meta["name"],
            "chamber": meta["chamber"],
            "district": meta["district"],
            "honorific": honorific,
            "committeeName": meta["committeeName"],
            "committeeCode": code,
            "committeeId": meta["committeeId"],
        }
        if not latest or latest["reportId"] not in schedules or "H" not in schedules[latest["reportId"]]:
            members_out[lis_id] = {
                **base,
                "status": "unavailable",
                "note": "We haven't pulled full filings for this member yet — view the official state committee page.",
            }
            continue

        h = schedules[latest["reportId"]]["H"][0]
        g = (schedules[latest["reportId"]].get("G") or [None])[0]
        cash = money_cents(h.get("EndingBalance") or "")
        raised = money_cents(h.get("TotalReceiptsThisElectionCycle") or "")
        spent = money_cents(h.get("TotalDisbursements") or "")
        unitemized = money_cents((g or {}).get("UnItemizedTotal") or "") if g else 0
        unitemized_inkind = money_cents((g or {}).get("UnItemizedInKindTotal") or "") if g else 0
        itemized_a = money_cents((g or {}).get("ScheduleATotal") or "") if g else 0
        itemized_b = money_cents((g or {}).get("ScheduleBTotal") or "") if g else 0
        other_c = money_cents(h.get("ScheduleCTotal") or "") or (money_cents((g or {}).get("ScheduleCTotal") or "") if g else 0)
        loan_balance = money_cents((g or {}).get("NewLoanBalance") or h.get("LoansReceivedTotal") or "") if g else 0
        if g:
            loan_balance = money_cents(g.get("NewLoanBalance") or "0")
        debts = money_cents(h.get("TotalUnPaidDebts") or "0")

        cycle = latest["cycle"]
        cycle_reports = [
            r
            for r in winners.values()
            if r["committeeCode"] == code
            and r["filingType"] == "Report"
            and r["cycle"] == cycle
            and r["reportId"] in schedules
        ]

        # Itemized coverage: every month from 2021-01 through the latest file now has
        # schedules, so a cycle is complete unless it began before 2021 (we do not go back further).
        cstart = parse_day(latest["cycleStart"]) or parse_day("1900-01-01")
        itemized_full = cstart >= WINDOW_START

        def add_txn(bucket: list, row: dict, sched: str) -> None:
            if sched == "E":
                name = display_name(
                    row.get("LenderFirstName") or "",
                    row.get("LenderMiddleName") or "",
                    row.get("LenderLastOrCompanyName") or "",
                    row.get("LenderPrefix") or "",
                    row.get("LenderSuffix") or "",
                )
                city = row.get("LenderCity") or ""
                state = donor_state(row.get("LenderState") or "", row.get("LenderZipCode") or "")
                zipc = row.get("LenderZipCode") or ""
                individual = is_true(row.get("LenderIsIndividual") or "")
                item = row.get("TransactionType") or "Loan"
                extra = {"loanBalanceCents": money_cents(row.get("LoanBalance") or "")}
            else:
                name = display_name(
                    row.get("FirstName") or "",
                    row.get("MiddleName") or "",
                    row.get("LastOrCompanyName") or "",
                    row.get("Prefix") or "",
                    row.get("Suffix") or "",
                )
                city = row.get("City") or ""
                state = donor_state(row.get("StateCode") or "", row.get("ZipCode") or "")
                zipc = row.get("ZipCode") or ""
                individual = is_true(row.get("IsIndividual") or "")
                item = (
                    row.get("ProductOrService")
                    or row.get("ItemOrService")
                    or row.get("ReceiptType")
                    or row.get("PurposeOfObligation")
                    or row.get("TypeOfDisposition")
                    or ""
                )
                extra = {}
            occ = row.get("OccupationOrTypeOfBusiness") or ""
            cents = money_cents(row.get("Amount") or "")
            bucket.append(
                {
                    "name": name or "Not stated",
                    "cents": cents,
                    "date": iso_date(row.get("TransactionDate") or ""),
                    "city": city,
                    "state": state,
                    "zip": normalize_zip(zipc),
                    "individual": individual,
                    "occupation": occ,
                    "employer": (row.get("NameOfEmployer") or "").strip(),
                    "item": item,
                    "kind": donor_type(name, occ, individual),
                    "sched": sched,
                    "reportId": row.get("ReportId") or "",
                    **extra,
                }
            )

        gifts: list[dict] = []
        spending: list[dict] = []
        inkind: list[dict] = []
        other_receipts: list[dict] = []
        loans: list[dict] = []
        debt_rows: list[dict] = []
        dispositions: list[dict] = []
        for rec in cycle_reports:
            rows = schedules.get(rec["reportId"]) or {}
            for row in rows.get("A") or []:
                add_txn(gifts, row, "A")
            for row in rows.get("B") or []:
                add_txn(inkind, row, "B")
                add_txn(gifts, row, "B")
            for row in rows.get("C") or []:
                add_txn(other_receipts, row, "C")
            for row in rows.get("D") or []:
                add_txn(spending, row, "D")
            for row in rows.get("E") or []:
                add_txn(loans, row, "E")
            for row in rows.get("F") or []:
                add_txn(debt_rows, row, "F")
            for row in rows.get("I") or []:
                add_txn(dispositions, row, "I")

        # Aggregate donors (A + B)
        donor_acc: dict[str, dict] = {}
        for gft in gifts:
            key = fold(gft["name"]) or gft["name"]
            d = donor_acc.get(key)
            if d is None:
                d = {
                    "name": gft["name"],
                    "cents": 0,
                    "count": 0,
                    "kind": gft["kind"],
                    "city": gft["city"],
                    "state": gft["state"],
                    "inKindCents": 0,
                    "occupation": gft["occupation"],
                    "gifts": [],
                }
                donor_acc[key] = d
            d["cents"] += gft["cents"]
            d["count"] += 1
            if gft["sched"] == "B":
                d["inKindCents"] += gft["cents"]
            if not d["state"] and gft["state"]:
                d["state"] = gft["state"]
                d["city"] = gft["city"]
            if len(gft["name"]) > len(d["name"]):
                d["name"] = gft["name"]
            gift = {
                "cents": gft["cents"],
                "type": "inkind" if gft["sched"] == "B" else "direct",
            }
            if gft.get("date"):
                gift["date"] = gft["date"]
            if gft.get("item"):
                gift["item"] = gft["item"]
            if gft.get("employer"):
                gift["employer"] = gft["employer"]
            if gft.get("occupation"):
                gift["occupation"] = gft["occupation"]
            if gft.get("reportId"):
                gift["reportId"] = str(gft["reportId"])
            d["gifts"].append(gift)
        donors_sorted = sorted(donor_acc.values(), key=lambda d: (-d["cents"], d["name"].lower()))
        top_donors = []
        for d in donors_sorted:
            slug = slugify(d["name"])
            entry = {
                "name": d["name"],
                "cents": d["cents"],
                "count": d["count"],
                "kind": d["kind"],
                "city": d["city"],
                "state": d["state"],
                "inKindCents": d["inKindCents"],
            }
            if slug in indexed_donors:
                entry["donorId"] = slug
            entry["gifts"] = sorted(
                d.get("gifts") or [],
                key=lambda g: (g.get("date") or "", g.get("cents") or 0),
                reverse=True,
            )
            top_donors.append(entry)

        origin = {"inStateCents": 0, "outOfStateCents": 0, "unknownCents": 0, "inStateCount": 0, "outOfStateCount": 0, "unknownCount": 0}
        types = {"individualCents": 0, "pacCents": 0, "transferCents": 0, "individualCount": 0, "pacCount": 0, "transferCount": 0}
        for d in donors_sorted:
            bucket = origin_bucket(d["state"])
            origin[f"{bucket}Cents"] += d["cents"]
            origin[f"{bucket}Count"] += 1
            tb = type_bucket(d["kind"])
            types[f"{tb}Cents"] += d["cents"]
            types[f"{tb}Count"] += 1

        # Small vs large: official unitemized totals (≤ $100, reported only as a total) vs itemized
        size = {
            "smallCents": unitemized + unitemized_inkind,
            "largeCents": itemized_a + itemized_b if (itemized_a or itemized_b) else sum(d["cents"] for d in donors_sorted),
            "rule": "Virginia law lets campaigns report gifts of $100 or less in a cycle as a single total, without naming the giver.",
        }

        cat_acc: Counter[str] = Counter()
        cat_items: dict[str, list[dict]] = defaultdict(list)
        vendor_acc: dict[str, dict] = {}
        for s in spending:
            cat = spend_category(s["item"], s["name"])
            cat_acc[cat] += s["cents"]
            cat_items[cat].append(
                {
                    "name": s["name"],
                    "item": s["item"],
                    "date": s["date"],
                    "cents": s["cents"],
                }
            )
            key = fold(s["name"]) or s["name"]
            v = vendor_acc.get(key)
            if v is None:
                v = {"name": s["name"], "cents": 0, "count": 0, "items": []}
                vendor_acc[key] = v
            v["cents"] += s["cents"]
            v["count"] += 1
            if len(s["name"]) > len(v["name"]):
                v["name"] = s["name"]
            pay = {"cents": s["cents"], "category": cat}
            if s.get("item"):
                pay["item"] = s["item"]
            if s.get("date"):
                pay["date"] = s["date"]
            v["items"].append(pay)
        for v in vendor_acc.values():
            v["items"] = sorted(v["items"], key=lambda x: (-x["cents"], x.get("date") or ""))
        categories = [
            {
                "name": name,
                "cents": cents,
                "items": sorted(
                    cat_items[name],
                    key=lambda x: (-x["cents"], x.get("date") or "", (x.get("name") or "").lower()),
                ),
            }
            for name, cents in sorted(cat_acc.items(), key=lambda kv: (-kv[1], kv[0]))
        ]
        vendors = sorted(vendor_acc.values(), key=lambda v: (-v["cents"], v["name"].lower()))

        def on_time(filed: str, due: str) -> bool | None:
            fd, dd = parse_day(filed), parse_day(due)
            if not fd or not dd:
                return None
            return fd <= dd

        filings = []
        for rec in sorted(
            [r for r in winners.values() if r["committeeCode"] == code and r["filingType"] == "Report"],
            key=lambda r: (r["end"], r["start"], r["reportId"]),
            reverse=True,
        ):
            filings.append(
                {
                    "reportId": rec["reportId"],
                    "start": rec["start"],
                    "end": rec["end"],
                    "filed": rec["filingDate"],
                    "due": rec["dueDate"],
                    "onTime": on_time(rec["filingDate"], rec["dueDate"]),
                    "amendment": rec["amendmentCount"],
                    "cycle": rec["cycle"],
                }
            )

        itemized_note = ""
        if itemized_full:
            itemized_note = (
                "Itemized gifts and spending below come from official state reports for this election cycle."
            )
        else:
            itemized_note = (
                "Official raised, spent, and cash-on-hand totals come from the latest state report for this cycle. "
                "This cycle began before 2021, so the named-donor and spending lists start with reports covering "
                "January 1, 2021 and later; earlier gifts in the cycle are not shown."
            )

        verification = None
        if code == KILGORE_XML["committeeCode"]:
            ok = (
                latest["reportId"] == KILGORE_XML["reportId"]
                and cash == KILGORE_XML["endingBalanceCents"]
                and raised == KILGORE_XML["raisedCycleCents"]
                and spent == KILGORE_XML["spentCycleCents"]
            )
            if not ok:
                raise SystemExit(
                    f"Kilgore verification failed: report={latest['reportId']} cash={cash} raised={raised} spent={spent}"
                )
            # also check G totals when present
            if g:
                if money_cents(g.get("ScheduleATotal") or "") != KILGORE_XML["scheduleATotalCents"]:
                    raise SystemExit("Kilgore Schedule A total does not match the official XML")
                if money_cents(g.get("ScheduleBTotal") or "") != KILGORE_XML["scheduleBTotalCents"]:
                    raise SystemExit("Kilgore Schedule B total does not match the official XML")
            verification = {
                "matchedOfficialXml": True,
                "reportId": KILGORE_XML["reportId"],
                "xmlUrl": f"https://cfreports.elections.virginia.gov/Report/ReportXML/{KILGORE_XML['reportId']}",
                "checkedOn": "2026-11-12",
            }

        history, history_lines = build_history(
            lis_id, meta, prior.get(lis_id, {}).get("committees", []), winners, schedules, add_txn, indexed_donors
        )
        if history_lines:
            history_csv_by_slug[meta["slug"]] = history_lines

        csv_path = f"/files/campaign-money/{meta['slug']}.csv"
        members_out[lis_id] = {
            **base,
            "status": "ready",
            "itemizedCoverage": "full" if itemized_full else "partial",
            "itemizedNote": itemized_note,
            "asOf": latest["end"],
            "cycle": cycle,
            "cycleLabel": cycle_label(cycle),
            "cycleStart": latest["cycleStart"],
            "cycleEnd": latest["cycleEnd"],
            "cashOnHandCents": cash,
            "raisedCycleCents": raised,
            "spentCycleCents": spent,
            "unitemizedCents": unitemized + unitemized_inkind,
            "itemizedContribCents": itemized_a + itemized_b,
            "inkindCents": itemized_b,
            "otherReceiptsCents": other_c,
            "loanBalanceCents": loan_balance,
            "debtsCents": debts,
            "latestReport": {
                "id": latest["reportId"],
                "filed": latest["filingDate"],
                "start": latest["start"],
                "end": latest["end"],
                "due": latest["dueDate"],
                "amendment": latest["amendmentCount"],
            },
            "donors": top_donors,
            "origin": origin,
            "types": types,
            "size": size,
            "spending": {
                "categories": categories,
                "vendors": vendors,
                "groupingNote": "Spending groups are our grouping of the state's free-text 'item or service' entries, not official state categories.",
            },
            "inkind": [
                {
                    "name": x["name"],
                    "cents": x["cents"],
                    "date": x["date"],
                    "item": x["item"],
                    "city": x["city"],
                    "state": x["state"],
                }
                for x in sorted(inkind, key=lambda x: (-x["cents"], x["date"]))
            ],
            "loans": [
                {
                    "name": x["name"],
                    "cents": x["cents"],
                    "date": x["date"],
                    "balanceCents": x.get("loanBalanceCents") or 0,
                    "item": x["item"],
                }
                for x in loans
            ],
            "debts": [
                {"name": x["name"], "cents": x["cents"], "date": x["date"], "item": x["item"]}
                for x in debt_rows
            ],
            "filings": filings,
            "history": history,
            "csvPath": csv_path,
            **({"verification": verification} if verification else {}),
        }

        # CSV copy of official itemized + summary rows
        header = [
            "section",
            "date",
            "name",
            "amount_usd",
            "city",
            "state",
            "type",
            "description",
            "schedule",
            "report_id",
            "filing_date",
        ]
        lines = [header]
        lines.append([
            "summary",
            latest["end"],
            "Cash on hand (ending balance)",
            pretty_usd_header(cash),
            "",
            "VA",
            "",
            f"From official Schedule H, {cycle_label(cycle)}",
            "H",
            latest["reportId"],
            latest["filingDate"],
        ])
        lines.append([
            "summary",
            latest["end"],
            "Raised this cycle",
            pretty_usd_header(raised),
            "",
            "",
            "",
            f"Total receipts this election cycle (Schedule H)",
            "H",
            latest["reportId"],
            latest["filingDate"],
        ])
        lines.append([
            "summary",
            latest["end"],
            "Spent this cycle",
            pretty_usd_header(spent),
            "",
            "",
            "",
            "Total disbursements this election cycle (Schedule H)",
            "H",
            latest["reportId"],
            latest["filingDate"],
        ])
        def emit(section: str, rows: list[dict], sched: str) -> None:
            for x in rows:
                rid = x.get("reportId") or latest["reportId"]
                rec = winners.get(rid) or latest
                lines.append([
                    section,
                    x.get("date") or "",
                    x.get("name") or "",
                    pretty_usd_header(x.get("cents") or 0),
                    x.get("city") or "",
                    x.get("state") or "",
                    x.get("kind") or "",
                    x.get("item") or "",
                    sched,
                    rid,
                    rec.get("filingDate") or "",
                ])
        emit("contribution", [g for g in gifts if g["sched"] == "A"], "A")
        emit("in_kind", inkind, "B")
        emit("other_receipt", other_receipts, "C")
        emit("expenditure", spending, "D")
        emit("loan", loans, "E")
        emit("debt", debt_rows, "F")
        csv_rows_by_slug[meta["slug"]] = lines

    payload = {
        "generated": date.today().isoformat(),
        "source": (
            "Virginia Department of Elections campaign finance report files "
            "(apps.elections.virginia.gov/SBE_CSV/CF/ Report.csv and Schedules A–I). "
            "Totals use Schedule H/G from the latest amendment of each committee's most recent "
            "scheduled report. Itemized gifts and spending use the latest amendment only, from "
            f"monthly files {schedule_months[0].replace('_', '-')} through {schedule_months[-1].replace('_', '-')} "
            "(no reports for periods ending before 2021). The 2021-present history also includes each member's "
            "earlier House or Senate committee when they had one. "
            "Kilgore for Delegate report 495571 was checked against the official XML at "
            "cfreports.elections.virginia.gov/Report/ReportXML/495571 on 2026-11-12. "
            "No Virginia Public Access Project data."
        ),
        "scheduleMonths": schedule_months,
        "memberCount": len(members_out),
        "readyCount": sum(1 for m in members_out.values() if m.get("status") == "ready"),
        "members": members_out,
    }

    SUM_DIR = WT / "src/content/finance-summaries"
    SUM_DIR.mkdir(parents=True, exist_ok=True)
    for old_json in SUM_DIR.glob("*.json"):
        old_json.unlink()
    index = {
        "generated": payload["generated"],
        "source": payload["source"],
        "scheduleMonths": schedule_months,
        "memberCount": payload["memberCount"],
        "readyCount": payload["readyCount"],
        "members": [],
    }
    for lis_id, m in members_out.items():
        (SUM_DIR / f"{m['slug']}.json").write_text(json.dumps(m, ensure_ascii=False, separators=(",", ":")))
        index["members"].append({
            "lisId": m["lisId"],
            "slug": m["slug"],
            "name": m["name"],
            "honorific": m["honorific"],
            "chamber": m["chamber"],
            "district": m["district"],
            "committeeName": m["committeeName"],
            "committeeCode": m["committeeCode"],
            "committeeId": m["committeeId"],
            "status": m.get("status"),
            "asOf": m.get("asOf"),
            "cycle": m.get("cycle"),
            "cycleLabel": m.get("cycleLabel"),
            "cashOnHandCents": m.get("cashOnHandCents"),
            "raisedCycleCents": m.get("raisedCycleCents"),
            "spentCycleCents": m.get("spentCycleCents"),
            "itemizedCoverage": m.get("itemizedCoverage"),
        })
    index["members"].sort(key=lambda r: (0 if r["slug"] == "terry-g-kilgore" else 1, r["chamber"], r["district"], r["name"]))
    # All sitting legislators combined, by year and month, for the hub's raised-vs-spent chart.
    agg: dict[int, dict] = {}
    for m in members_out.values():
        for y in ((m.get("history") or {}).get("years") or []):
            a = agg.setdefault(y["year"], {"year": y["year"], "members": 0, "raisedCents": 0, "spentCents": 0,
                                           "giftCents": 0, "giftCount": 0, "paymentCents": 0, "paymentCount": 0, "_months": {}})
            a["members"] += 1
            for k in ("raisedCents", "spentCents", "giftCents", "giftCount", "paymentCents", "paymentCount"):
                a[k] += y.get(k) or 0
            for mo in y.get("months") or []:
                am = a["_months"].setdefault(mo["month"], {"month": mo["month"], "giftCents": 0, "giftCount": 0,
                                                           "paymentCents": 0, "paymentCount": 0})
                for k in ("giftCents", "giftCount", "paymentCents", "paymentCount"):
                    am[k] += mo.get(k) or 0
    index["historyTotals"] = []
    for yv in sorted(agg):
        a = agg[yv]
        months = a.pop("_months")
        a["months"] = [months[k] for k in sorted(months)]
        index["historyTotals"].append(a)
    (SUM_DIR / "_index.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")))
    # Keep a combined file for local checks; the site loads per-member JSON instead.
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
    CSV_DIR.mkdir(parents=True, exist_ok=True)
    # remove stale csvs we no longer generate
    keep = set(csv_rows_by_slug)
    for old in CSV_DIR.glob("*.csv"):
        if old.stem not in keep:
            old.unlink()
    for slug, lines in csv_rows_by_slug.items():
        path = CSV_DIR / f"{slug}.csv"
        # utf-8-sig so Excel opens it cleanly; first comment line states the copy label
        as_of = members_out[next(lis for lis, m in members_out.items() if m["slug"] == slug)].get("asOf") or payload["generated"]
        with path.open("w", encoding="utf-8-sig", newline="") as f:
            f.write(f"Copy of official Virginia Department of Elections campaign finance data, as of {as_of}. Not from VPAP.\n")
            writer = csv.writer(f)
            writer.writerows(lines)

    hist_dir = CSV_DIR / "history"
    hist_dir.mkdir(parents=True, exist_ok=True)
    for old in hist_dir.glob("*.csv"):
        if old.stem not in history_csv_by_slug:
            old.unlink()
    for slug, lines in history_csv_by_slug.items():
        with (hist_dir / f"{slug}.csv").open("w", encoding="utf-8-sig", newline="") as f:
            f.write("Copy of official Virginia Department of Elections campaign finance data, 2021 to the latest filing. Not from VPAP.\n")
            csv.writer(f).writerows(lines)

    ready = payload["readyCount"]
    print(f"wrote {OUT} bytes={OUT.stat().st_size} members={payload['memberCount']} ready={ready} csvs={len(csv_rows_by_slug)}")
    k = next(m for m in members_out.values() if m["slug"] == "terry-g-kilgore")
    print(
        "KILGORE",
        "cash",
        pretty_usd_header(k["cashOnHandCents"]),
        "raised",
        pretty_usd_header(k["raisedCycleCents"]),
        "spent",
        pretty_usd_header(k["spentCycleCents"]),
        "report",
        k["latestReport"]["id"],
        "asOf",
        k["asOf"],
        "coverage",
        k["itemizedCoverage"],
        "topDonor",
        k["donors"][0]["name"] if k["donors"] else None,
        k["donors"][0]["cents"] / 100 if k["donors"] else None,
        "verified",
        k.get("verification"),
    )


if __name__ == "__main__":
    main()
