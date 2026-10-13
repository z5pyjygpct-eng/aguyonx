#!/usr/bin/env python3
"""
Fill Albemarle County School Board recaps from OFFICIAL records + transcript timing.
  - agenda: the official ACPS agenda on ElectronicSchoolBoard (esb.k12albemarle.org
    public_agendaview.aspx), matched to the recap by meeting date (+ type when a date has two)
  - moments: official agenda items located in the machine transcript (scripts/recap_moments.py;
    item must be introduced with a spoken transition cue, in agenda order). No cue match -> no moment.
  - decisions/votes: ONLY from the ADOPTED ACPS minutes. ESB publishes them as PDF attachments on a later
    meeting's "Approval of the Minutes" consent item (file named for the meeting date). Each motion and
    its recorded outcome/tally is copied from the minutes text; nothing is inferred from video/transcript.
    No adopted minutes yet -> votesPosted stays false ("full votes after minutes are adopted").
Writes into src/content/city-recap-fill.json (merged by src/content/city-recaps.ts applyFill).
Never removes a previously published moment/agenda.

Usage: python3 scripts/albemarle-recap-fill.py [--only slug,slug] [--scan N]
Run by the Albemarle recap/transcript routine after a new recap is posted.
"""
import html, json, os, re, subprocess, sys, time, urllib.request
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from recap_moments import find_item_times, label_of

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/content/city-recap-fill.json")
INDEX = os.path.join(ROOT, "data/albemarle/esb-index.json")
CACHE = "/tmp/esb"
ESB = "https://esb.k12albemarle.org"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
args = sys.argv[1:]
only = set(args[args.index("--only") + 1].split(",")) if "--only" in args else None
scan = int(args[args.index("--scan") + 1]) if "--scan" in args else 25
os.makedirs(CACHE, exist_ok=True)


def get(mid, force=False):
    p = os.path.join(CACHE, f"ag-{mid}.html")
    if force or not os.path.exists(p) or os.path.getsize(p) < 1000:
        req = urllib.request.Request(f"{ESB}/public_agendaview.aspx?mtgId={mid}&CS=No", headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r: data = r.read()
        except Exception:
            data = b""
        open(p, "wb").write(data)
        time.sleep(0.3)
    return open(p, encoding="utf-8", errors="ignore").read()


def head(t):
    ty = re.search(r'lblMtgType"[^>]*>([^<]*)<', t)
    dt = re.search(r'lblDate"[^>]*>\s*(\d{1,2}/\d{1,2}/\d{4})', t)
    if not (ty and dt):
        return None
    return datetime.strptime(dt.group(1), "%m/%d/%Y").strftime("%Y-%m-%d"), html.unescape(ty.group(1)).strip()


def build_index():
    idx = json.load(open(INDEX)) if os.path.exists(INDEX) else {}
    top = max([int(k) for k in idx] + [1040])
    for mid in range(top + 1, top + scan):  # new meetings since last run
        h = head(get(mid, force=True))
        if h: idx[str(mid)] = h
    for p in os.listdir(CACHE):  # anything cached by a backfill scan
        if p.startswith("ag-") and p[3:-5].isdigit() and p[3:-5] not in idx:
            h = head(open(os.path.join(CACHE, p), encoding="utf-8", errors="ignore").read())
            if h: idx[p[3:-5]] = h
    os.makedirs(os.path.dirname(INDEX), exist_ok=True)
    json.dump(dict(sorted(idx.items(), key=lambda kv: int(kv[0]))), open(INDEX, "w"), indent=0)
    return idx


def txt(x):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip()


def parse_agenda(t, mid):
    groups = []
    parts = t.split('lblCatNum">')[1:]
    for part in parts:
        num = txt(part.split("</span>", 1)[0])
        mt = re.search(r'lblCatText">(.*?)</span>', part, re.S)
        title = txt(mt.group(1)) if mt else ""
        items = []
        for chunk in part.split('lblItemNum">')[1:]:
            inum = txt(chunk.split("</span>", 1)[0])
            a = re.search(r'hypItemTitle"[^>]*?href="([^"]*)"[^>]*>(.*?)</a>', chunk, re.S)
            if not a: continue
            row = {"num": inum, "title": txt(a.group(2))[:400]}
            if a.group(1): row["href"] = ESB + html.unescape(a.group(1))
            items.append(row)
        if title:
            groups.append({"heading": f"{re.sub(r'[.]0$', '', num)}. {title}" if num else title, "items": items, "_num": num})
    return groups


def fetch_bin(url, name):
    p = os.path.join(CACHE, name)
    if not os.path.exists(p) or os.path.getsize(p) < 500:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=90) as r: open(p, "wb").write(r.read())
        except Exception:
            return None
        time.sleep(0.3)
    return p


MINUTES_INDEX = os.path.join(ROOT, "data/albemarle/esb-minutes.json")


def minutes_index(idx, since="2024-01-01"):
    """date -> [{"name", "href", "via"}] from 'Approval of the Minutes' items (adopted minutes PDFs)."""
    mi = json.load(open(MINUTES_INDEX)) if os.path.exists(MINUTES_INDEX) else {"_seen": []}
    seen = set(mi["_seen"])
    for mid, (date, _ty) in sorted(idx.items(), key=lambda kv: int(kv[0])):
        if date < since or mid in seen: continue
        t = get(mid)
        for m in re.finditer(r'hypItemTitle"[^>]*?href="([^"]*)"[^>]*>(.*?)</a>', t, re.S):
            if not re.search(r"\bminutes\b", txt(m.group(2)), re.I): continue
            item = ESB + html.unescape(m.group(1))
            ip = fetch_bin(item, "item-" + re.sub(r"\W", "", m.group(1))[-40:] + ".html")
            if not ip: continue
            it = open(ip, encoding="utf-8", errors="ignore").read()
            for href, name in re.findall(r'href="(https://esb\.k12albemarle\.org/attachments/[^"]+\.pdf)"[^>]*>([^<]+)<', it):
                name = html.unescape(name).strip()
                d = re.search(r"([A-Z][a-z]+)\.? (\d{1,2}),? (\d{4})", name)
                if not d: continue
                try:
                    dd = datetime.strptime(f"{d.group(1)[:3]} {d.group(2)} {d.group(3)}", "%b %d %Y").strftime("%Y-%m-%d")
                except ValueError:
                    continue
                lst = mi.setdefault(dd, [])
                if not any(x["href"] == href for x in lst):
                    lst.append({"name": name, "href": href, "via": item})
        if date < datetime.now().strftime("%Y-%m-%d"):
            seen.add(mid)  # past agendas do not change; re-check today/future ones next run
    mi["_seen"] = sorted(seen, key=int)
    json.dump(mi, open(MINUTES_INDEX, "w"), indent=0)
    return mi


def pick_minutes(mi, date, title):
    c = mi.get(date, [])
    if len(c) > 1:
        tl = title.lower()
        for w in ("hearing", "work session", "special", "organizational", "interview", "retreat"):
            if w in tl:
                c2 = [x for x in c if w in x["name"].lower()]
                if c2: return c2[0]
        c2 = [x for x in c if re.search(r"business|regular", x["name"], re.I)]
        if c2: return c2[0]
    return c[0] if c else None


def minutes_has_motion(pdf):
    t = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True).stdout
    return bool(re.search(r"(?i)\bmotion\b", t))


def minutes_decisions(pdf, src):
    text = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True).stdout
    flat = re.sub(r"\s+", " ", text)
    if "MINUTES" not in flat[:400].upper():
        return None
    out = []
    parts = re.split(r"(?i)\bAgenda Item No\.?\s*(\d+\.\d+)", flat)
    for k in range(1, len(parts) - 1, 2):
        num, body = parts[k], parts[k + 1]
        last = 0
        OC = r"The motion (?:passed|failed|carried|was approved|was defeated)(?:[^.]|\b(?:Mr|Ms|Mrs|Dr|No)\.)*\.|Motion (?:carried|failed|passed) by an? [\d:]+ vote\.?"
        for oc in re.finditer(OC, body):
            seg, last = body[last:oc.start()], oc.end()
            mm = re.search(r"(?:Mr|Ms|Mrs|Dr|Chair|Vice[- ]Chair)\.? [A-Z][\w’'-]+(?: [A-Z][\w’'-]+)? (?:moved|offered a motion|made a motion)", seg)
            if not mm: continue
            motion = seg[mm.start():].strip()
            roll = {}
            for lab in ("AYES", "NAYS", "ABSENT", "ABSTAIN", "ABSTENTIONS?"):
                m2 = re.search(lab + r":\s*(.*?)(?=\s+(?:AYES|NAYS|ABSENT|ABSTAIN\w*):|\s+Motion (?:carried|failed|passed)|$)", motion)
                if m2: roll[lab.rstrip("S?").rstrip("S") if lab != "ABSTENTIONS?" else "ABSTAIN"] = m2.group(1).strip(" .")
            motion = re.split(r"\s+AYES:", motion)[0].strip()
            if len(motion) > 600: motion = motion[:597].rstrip() + "…"
            outcome = oc.group(0)
            fail = re.search(r"failed|defeated", outcome, re.I)
            v = re.search(r"\b(\d+)[-:](\d+)((?:[-:]\d+)*)\b", outcome)
            if re.search(r"unanimous", outcome, re.I) or (v and int(v.group(2)) == 0 and not fail):
                tally = "Unanimous"
            else:
                tally = "Failed" if fail else "Passed"
            if v: tally += f", {int(v.group(1))}-{int(v.group(2))}"
            if re.search(r"roll call", outcome, re.I): tally += " (roll call)"
            notes = [f"{k.title()}: {roll[k]}" for k in ("NAY", "ABSTAIN", "ABSENT") if roll.get(k) and not re.match(r"^none\.?$", roll[k], re.I)]
            if notes: tally += " — " + "; ".join(notes)
            extra = re.sub(r"^The motion (passed|failed|carried)( unanimously)?( with a (voice|roll call) vote of)? ?\d+-\d+(-\d+)?\.?|^Motion .*", "", outcome).strip(" .,")
            if extra: tally += f" — {extra}"
            out.append({"item": num, "action": f"{motion} {outcome if outcome.startswith('The') else ''}".strip(), "tally": tally, "source": src})
    return out



def pick(idx, date, title):
    c = [(k, v[1]) for k, v in idx.items() if v[0] == date]
    if len(c) > 1:
        tl = title.lower()
        pref = [k for k, ty in c if any(w in tl and w in ty.lower() for w in ("hearing", "work session", "special", "organizational", "interview"))]
        if pref: return pref[0]
        biz = [k for k, ty in c if "business" in ty.lower() or "regular" in ty.lower()]
        if biz: return biz[0]
    return c[0][0] if c else None


def main():
    recaps = json.loads(subprocess.run(["node", "-e", """
const jiti=require('jiti')(process.cwd()+'/x.js',{alias:{'@':process.cwd()+'/src'}});
const {CITY_RECAPS_RAW_EXPORT}=jiti(process.cwd()+'/src/content/city-recaps.ts');
console.log(JSON.stringify(CITY_RECAPS_RAW_EXPORT.filter(r=>r.venue==='albemarle-schools')));"""], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    idx = build_index()
    mi = minutes_index(idx)
    fill = json.load(open(OUT)) if os.path.exists(OUT) else {}
    done = 0
    for r in recaps:
        if only and r["slug"] not in only: continue
        meta = os.path.join(ROOT, "scripts/transcript-meta", f"albemarle-schools-{r['meetingId']}.json")
        try:
            date = datetime.strptime(re.sub(r"^\w+, ", "", r["dateLabel"]), "%b %d, %Y").strftime("%Y-%m-%d")
        except ValueError:
            date = datetime.strptime(re.sub(r"^\w+, ", "", json.load(open(meta))["date"]), "%B %d, %Y").strftime("%Y-%m-%d")
        mid = pick(idx, date, r["title"])
        prev = fill.get(r["slug"], {})
        f = {"generatedFrom": "official ACPS agenda (ElectronicSchoolBoard); transcript for timing only"}
        if not mid:
            print("no ESB agenda for", r["slug"], date); continue
        groups = parse_agenda(get(mid), mid)
        agurl = f"{ESB}/public_agendaview.aspx?mtgId={mid}&CS=No"
        f["links"] = [{"label": "Official agenda (ACPS ElectronicSchoolBoard)", "href": agurl}]
        f["agenda"] = [{"heading": g["heading"][:300], "items": g["items"]} for g in groups] or prev.get("agenda", [])
        tpath = os.path.join(ROOT, "public/files/find-the-moment/albemarle-schools/transcripts", f"{r['meetingId']}.json")
        segs = json.load(open(tpath)) if os.path.exists(tpath) else []
        cands = []
        for g in groups:
            if not g["items"] or re.search(r"public comment|community input|public hearing", g["heading"], re.I):
                cands.append((g["_num"], re.sub(r"^[\d.]+\s*", "", g["heading"])))
            cands += [(it["num"], it["title"]) for it in g["items"]]
        moments = list(prev.get("moments", []))  # never drop published moments
        if segs:
            got = find_item_times(segs, cands)
            for num, title in cands:
                t = got.get((num, title))
                if t is None or any(abs(t - m["seconds"]) < 30 for m in moments): continue
                moments.append({"seconds": t, "item": num, "label": label_of(title), "how": "transcript-agenda"})
        f["moments"] = sorted(moments, key=lambda m: m["seconds"])
        for k in ("decisions", "noVotesRecorded"):
            if k in prev: f[k] = prev[k]
        mn = pick_minutes(mi, date, r["title"])
        if mn:
            pdf = fetch_bin(mn["href"], "min-" + mn["href"].rsplit("/", 1)[1])
            src = {"label": "Adopted minutes (ACPS ElectronicSchoolBoard)", "href": mn["href"]}
            dec = minutes_decisions(pdf, src) if pdf else None
            if dec is not None:
                if len(dec) >= len(f.get("decisions", [])):
                    f["decisions"] = dec
                # "No votes recorded" only when the adopted minutes record no motion at all
                f["noVotesRecorded"] = not f.get("decisions") and not minutes_has_motion(pdf)
                f["links"].append(src)
        fill[r["slug"]] = f
        done += 1
    json.dump(fill, open(OUT, "w"), indent=1, ensure_ascii=False)
    print(f"albemarle: filled {done} recaps -> {OUT}")


if __name__ == "__main__":
    main()
