#!/usr/bin/env python3
"""
Fairfax County + Prince William official votes -> recaps (Scott OK'd 2026-10-28).
Votes come ONLY from official records, each decision carries its source link. Never from video/transcript.
  fairfax-county-bos  : Clerk's Board Summary PDF ("Report of Actions"), fairfaxcounty.gov/boardofsupervisors/board-meeting-summaries
                        (full-Board meetings only; committee meetings have no posted action record -> stay pending)
  fairfax-county-schools: FCPS BoardDocs (vsba/fairfax) structured minutes (BD-GetMinutes) for the matching meeting;
                        if empty, OCR of the meeting's own APPROVED scanned minutes PDF (scripts/fcps_minutes_ocr.py, needs
                        /workspace/ocrenv with rapidocr_onnxruntime; strict roster/12-vote/date gate, else stays pending; --no-ocr skips)
  pwc-bos             : PWC Board of County Supervisors "Brief" (official action record) on pwcgov.granicus.com MinutesViewer, by clip id
  pwc-schools         : PWCS BoardDocs (vsba/pwcs) structured minutes (BD-GetMinutes)
Writes/merges src/content/city-recap-fill.json (decisions, noVotesRecorded, links), applied by city-recaps.ts applyFill.
Merge rule: never removes decisions an earlier run published; a recap with no official record yet is left untouched
(recap stays "votes not yet posted" - missing votes never hold up a recap).
Usage: python3 scripts/ffx-pw-votes.py [--only slug,slug] [--cache /tmp/ffxpw-cache] [--refresh]
  --refresh re-downloads index pages (always) and records that were previously empty.
"""
import html, json, os, re, subprocess, sys, time, urllib.parse, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/content/city-recap-fill.json")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
args = sys.argv[1:]
only, cache = None, "/tmp/ffxpw-cache"
for i, a in enumerate(args):
    if a == "--only": only = set(args[i + 1].split(","))
    if a == "--cache": cache = args[i + 1]
os.makedirs(cache, exist_ok=True)
JAR = os.path.join(cache, "cj.txt")


def curl(url, out, post=None, referer=None, keep=True):
    p = os.path.join(cache, out)
    if keep and os.path.exists(p) and os.path.getsize(p) > 0:
        return p
    cmd = ["curl", "-sL", "--max-time", "120", "-A", UA, "-b", JAR, "-c", JAR, "-o", p, "-w", "%{http_code}"]
    if post is not None:
        cmd += ["-X", "POST", "-H", "X-Requested-With: XMLHttpRequest", "-d", post]
    if referer: cmd += ["-H", f"Referer: {referer}"]
    for _ in range(3):
        code = subprocess.run(cmd + [url], capture_output=True, text=True).stdout.strip()
        if code == "200": break
        time.sleep(3)
    if code != "200" and os.path.exists(p): os.remove(p)
    time.sleep(0.3)
    return p if code == "200" else None


def htext(s):
    s = re.sub(r"(?is)<(script|style).*?</\1>", "", s)
    s = re.sub(r"(?i)<br\s*/?>|</(p|div|tr|li|h\d)>", "\n", s)
    s = html.unescape(re.sub(r"<[^>]+>", "", s)).replace("\xa0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    return re.sub(r"\n\s*\n+", "\n", s).strip()


def one(s): return re.sub(r"\s+", " ", s).strip()


def cap(s, n=700, tail=" … (full text in the official record)"):
    s = one(s)
    return s if len(s) <= n else s[:n].rsplit(" ", 1)[0] + tail


def ymd(label):
    return datetime.datetime.strptime(re.sub(r"^\w+,\s*", "", label).strip(), "%B %d, %Y").date()


# ---------------- Fairfax County BOS: Clerk's Board Summary ----------------
NUMW = {w: i for i, w in enumerate("zero one two three four five six seven eight nine ten".split())}


def ffx_summary_index():
    p = curl("https://www.fairfaxcounty.gov/boardofsupervisors/board-meeting-summaries", "ffx-summaries.html", keep=False)
    idx = {}
    for h in re.findall(r'href="([^"]*Summary[^"]*\.pdf)"', open(p, errors="ignore").read(), re.I):
        m = re.search(r"/(\d{2})-(\d{2})-(\d{2})%20", h)
        if not m: continue
        d = datetime.date(2000 + int(m[3]), int(m[1]), int(m[2]))
        idx[d] = h if h.startswith("http") else "https://www.fairfaxcounty.gov" + h
    return idx


ABBR = re.compile(r"\b(Mr|Mrs|Ms|Dr|No|Nos|St|Jr|Sr|Inc|Co|Corp|LLC|Ltd|Rd|Ave|Blvd|Dist|Sec|Vol|vs|etc|U\.S|[A-Z])\.")


def sentences(flat):
    prot = ABBR.sub(lambda m: m.group(1) + "§", flat)
    prot = re.sub(r"\b([ap])\.m\.", r"\1§m§", prot)
    prot = re.sub(r"(\d)\.(\d)", r"\1§\2", prot)
    return [s.replace("§", ".").strip() for s in re.findall(r"[^.]+(?:\.[\"”’]*|$)", prot) if s.strip()]


OUTC = re.compile(r"\b(carried|failed|did not carry|was defeated)\b", re.I)


def ffx_tally(s):
    m = re.search(r"\b(carried|failed|did not carry|was defeated)\b.*", s, re.I)
    t = m.group(0).rstrip(".") if m else s
    t = t[0].upper() + t[1:]
    return t


def nice(t):
    if not t.isupper(): return t
    small = {"a", "an", "and", "as", "at", "for", "in", "of", "on", "or", "the", "to", "with", "by"}
    ws = []
    for i, w in enumerate(t.split()):
        core = w.strip("()“”\"',.:;")
        if re.search(r"\d", w) or w.startswith("(") or core in ("FY", "CIP", "LLC", "VDOT", "FCPS", "WMATA", "NOVA", "BOS", "II", "III", "US", "U.S."):
            ws.append(w)
        elif i and core.lower() in small: ws.append(w.lower())
        else: ws.append(w.capitalize())
    return re.sub(r"’S\b", "’s", " ".join(ws))


def parse_ffx_summary(pdf, src):
    txt = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True).stdout
    txt = re.sub(r"(?m)^\s*Board Summary\s+-\d+-\s+.*$", "", txt)
    lines = txt.split("\n")
    items, cur = [], None
    for ln in lines:
        m = re.match(r"^\s{0,12}(\d{1,3})\.\s{2,}(\S.*)$", ln)
        tl = re.sub(r"\(\d{1,2}:\d{2}\s*[ap]\.m\.\)", "", m[2]) if m else ""
        if m and re.match(r"^[A-Z0-9“\"'(]", m[2]) and tl.upper() == tl:
            cur = {"num": m[1], "title": m[2].strip(), "body": [], "intitle": True}
            items.append(cur); continue
        if cur is None: continue
        if cur["intitle"]:
            s = ln.strip()
            s2 = re.sub(r"\(\d{1,2}:\d{2}\s*[ap]\.m\.\)", "", s)
            if s and not re.search(r"[a-z]", s2):
                cur["title"] += " " + s; continue
            cur["intitle"] = False
        cur["body"].append(ln)
    out = []
    for it in items:
        title = one(re.sub(r"\(\d{1,2}:\d{2}\s*[ap]\.m\.\)", "", it["title"]))
        sents = sentences(one(" ".join(it["body"])))
        last = -1
        for i, s in enumerate(sents):
            if not OUTC.search(s) or not re.search(r"\bmotion\b|\bit\b|\bcarried\b", s): continue
            j = i
            while j > last + 1 and not re.search(r"\bmoved\b", sents[j]): j -= 1
            if not re.search(r"\bmoved\b", sents[j]) or i - j > 6:
                last = i; continue
            action = " ".join(sents[j:i + 1])
            out.append({"item": f"{it['num']}. {nice(title)}"[:200],
                        "action": cap(action), "tally": ffx_tally(s), "source": src})
            last = i
    return out


# ---------------- PWC BOCS: Brief (Granicus MinutesViewer) ----------------
def parse_pwc_brief(p, src):
    raw = open(p, encoding="utf-8", errors="ignore").read()
    blocks = re.split(r'grid-column-start:\s*1;\s*grid-column-end:\s*9;', raw)
    out, top = [], ""
    for b in blocks:
        t = re.sub(r'^[\s">]+', "", htext(b))
        mt = re.match(r"^\s*(\d+)\.\s*\n?(.+)", t)
        if mt and not re.search(r"(APPROVED|DENIED|FAILED|DEFERRED|ADOPTED|NOT APPROVED)\s*:", t):
            top = f"{mt[1]}. {one(mt[2].split(chr(10))[0])}"; continue
        segs = re.split(r"(?=\b(?:APPROVED|DENIED|FAILED|DEFERRED|ADOPTED|NOT APPROVED|REJECTED|TABLED|WITHDRAWN|CONTINUED|REMANDED)\s*:)", t)
        num = re.match(r"^\s*(\d+\.[A-Z0-9]+\.?)\s", t)
        for sg in segs:
            m = re.match(r"(APPROVED|DENIED|FAILED|DEFERRED|ADOPTED|NOT APPROVED|REJECTED|TABLED|WITHDRAWN|CONTINUED|REMANDED)\s*:\s*(.*)", sg, re.S)
            if not m: continue
            body = m[2]
            mv = re.search(r"\n?\s*1:\s*([A-Z][\w'’-]+)\s+2:\s*([A-Z][\w'’-]+)\s*(.*)", body, re.S)
            if not mv: continue
            what = one(body[:mv.start()])
            rest = mv[3].split("\n")[0]
            tally = one(rest).strip(" /") or m[1].title()
            res = re.findall(r"(Res\. No\. [\d-]+|Ord\. No\. [\d-]+)", body)
            action = f"{m[1].title()}: {what}. Motion by Supervisor {mv[1]}, second by Supervisor {mv[2]}." + (f" ({', '.join(dict.fromkeys(res))})" if res else "")
            item = (num[1].rstrip(".") if num else "") or top
            out.append({"item": item, "action": cap(action), "tally": tally, "source": src})
    return out


# ---------------- BoardDocs (FCPS, PWCS) ----------------
BD = {"fairfax-county-schools": ("vsba/fairfax", "A9HDX937D70D", "FCPS BoardDocs"),
      "pwc-schools": ("vsba/pwcs", "A9HETF3BF91A", "PWCS BoardDocs")}


def bd_list(venue):
    site, cid, _ = BD[venue]
    base = f"https://go.boarddocs.com/{site}/Board.nsf"
    curl(f"{base}/Public", f"bd-{cid}-public.html", keep=False)
    p = curl(f"{base}/BD-GetMeetingsList?open", f"bd-{cid}-list.json", post=f"current_committee_id={cid}", referer=f"{base}/Public", keep=False)
    return json.load(open(p)) if p else []


def bd_minutes(venue, uid, refresh):
    site, cid, _ = BD[venue]
    base = f"https://go.boarddocs.com/{site}/Board.nsf"
    p = os.path.join(cache, f"bdmin-{uid}.html")
    if refresh and os.path.exists(p) and os.path.getsize(p) == 0: os.remove(p)
    if os.path.exists(p): return p
    q = curl(f"{base}/BD-GetMinutes?open", f"bdmin-{uid}.html", post=f"id={uid}&current_committee_id={cid}", referer=f"{base}/Public")
    if q is None: open(p, "w").close(); return p
    return q


def bd_names(s): return [x.strip() for x in s.split(",") if x.strip()]


def parse_bd_minutes(p, src):
    t = htext(open(p, encoding="utf-8", errors="ignore").read())
    if len(t) < 100: return None
    lines = [l.strip() for l in t.split("\n") if l.strip()]
    out, item, pre = [], "", []
    i = 0
    while i < len(lines):
        l = lines[i]
        m = re.match(r"^(?:Action(?: \(Consent\))?|Procedural|Information|Presentation|Discussion|Reports?|Recognition|Action, Discussion)[^:]{0,20}:\s*(\d+\.\d+)\s+(.*)$", l)
        if m:
            item, pre = f"{m[1]} {m[2]}", []; i += 1; continue
        if re.match(r"^\d+\.\s+\S", l) and not l.startswith("Motion"):
            pre = []; i += 1; continue
        mm = re.match(r"^Motion by (.+?), second by (.+?)\.?$", l)
        if mm:
            res, votes, j = "", {}, i + 1
            while j < len(lines):
                x = lines[j]
                r = re.match(r"^Final Resolution:\s*(.*)$", x)
                v = re.match(r"^(Yes|No|Abstain|Not Present at Vote|Absent|Recused):\s*(.*)$", x)
                if r: res = r[1]
                elif v: votes[v[1]] = bd_names(v[2])
                else: break
                j += 1
            motion = ""
            mv = [x for x in pre if re.search(r"\b(I move|move that|moved that|recommend(?:s|ed)? that)\b", x, re.I)]
            if mv: motion = " ".join(mv[-2:])
            action = (f"{item}: " if item else "") + (motion + " " if motion else "") + f"Motion by {mm[1]}, second by {mm[2]}."
            y, n = len(votes.get("Yes", [])), len(votes.get("No", []))
            parts = [f"{k}: {', '.join(v)}" for k, v in votes.items() if v and k != "Yes"]
            tally = f"{res or 'Recorded'} {y}-{n}" + (f" ({'; '.join(parts)})" if parts else "")
            if res or votes:
                out.append({"item": item.split(" ")[0] if item else "", "action": cap(action), "tally": tally, "source": src, "_title": item})
            pre, i = [], j; continue
        pre.append(l); i += 1
    return out


def norm_type(title):
    t = title.lower()
    for k in ["work session", "public hearing", "forum", "audit", "governance", "budget", "administration", "comprehensive planning", "cpdc", "public engagement", "joint", "retreat", "swearing"]:
        if k in t: return "comprehensive planning" if k == "cpdc" else k
    return "regular"


def bd_match(r, meetings):
    d = ymd(r["dateLabel"]).strftime("%Y%m%d")
    same = [m for m in meetings if m.get("numberdate") == d and not re.search(r"cancel", m.get("name", ""), re.I)]
    if not same: return None
    want = norm_type(r["title"].split(" — ")[0])
    if want in ("forum", "swearing"): return None
    if want == "regular":
        hits = [m for m in same if re.search(r"^(Regular Meeting|School Board Meeting)", m["name"]) and not re.search(r"Disciplinary|Licensure|Special", m["name"])]
    else:
        hits = [m for m in same if norm_type(m["name"]) == want]
    if not hits and len(same) == 1 and want == "regular": hits = same
    return hits[0] if len(hits) == 1 else None


def load_recaps():
    js = """const jiti=require('jiti')(process.cwd()+'/x.js',{alias:{'@':process.cwd()+'/src'}});
const {HC_RECAPS}=jiti(process.cwd()+'/src/content/city-recaps-hc.ts');
console.log(JSON.stringify(HC_RECAPS.filter(r=>/^(fxco|pwc)-/.test(r.slug)).map(r=>({slug:r.slug,meetingId:r.meetingId,venue:r.venue,title:r.title,dateLabel:r.dateLabel}))));"""
    return json.loads(subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True, check=True).stdout)


def main():
    refresh = "--refresh" in args
    recaps = load_recaps()
    fill = json.load(open(OUT)) if os.path.exists(OUT) else {}
    ffx_idx = ffx_summary_index()
    bdl = {v: bd_list(v) for v in BD}
    report = []
    for r in recaps:
        if only and r["slug"] not in only: continue
        v, dec, link, kind = r["venue"], None, None, ""
        d = ymd(r["dateLabel"])
        if v == "fairfax-county-bos":
            if re.search(r"Board of Supervisors (Meeting|Budget Public Hearing)$", r["title"]) and d in ffx_idx:
                href = ffx_idx[d]
                p = curl(href, f"ffx-sum-{d}.pdf", keep=not refresh)
                link = {"label": "Clerk's Board Summary (official actions, Fairfax County)", "href": href}
                if p: dec = parse_ffx_summary(p, {"label": "Clerk's Board Summary (Fairfax County)", "href": href})
            kind = "board-summary"
        elif v == "pwc-bos":
            clip = r["meetingId"].split("-")[-1]
            href = f"https://pwcgov.granicus.com/MinutesViewer.php?view_id=23&clip_id={clip}"
            p = curl(href, f"pwc-brief-{clip}.html", keep=not refresh)
            if p and os.path.getsize(p) > 2000 and "Brief" in open(p, errors="ignore").read(3000):
                link = {"label": "Board Brief (official actions, PWC Granicus)", "href": href}
                dec = parse_pwc_brief(p, {"label": "Board Brief (Prince William County)", "href": href})
            kind = "brief"
        elif v in BD:
            m = bd_match(r, bdl[v])
            if m:
                site, cid, lab = BD[v]
                p = bd_minutes(v, m["unique"], refresh)
                href = f"https://go.boarddocs.com/{site}/Board.nsf/Public?open&id=minutes&meeting={m['unique']}"
                href = f"https://go.boarddocs.com/{site}/Board.nsf/goto?open&id={m['unique']}"
                got = parse_bd_minutes(p, {"label": f"Official minutes ({lab})", "href": href})
                if got is not None:
                    link = {"label": f"Official minutes ({lab}): {m['name']}", "href": href}
                    sub = r["title"].split(" — ")[1] if " — " in r["title"] else ""
                    if sub:  # short closed-meeting clip of a committee/work session: only the closed-meeting motions
                        got = [x for x in got if re.search(r"closed", x["_title"] + x["action"], re.I)]
                    dec = got
                elif v == "fairfax-county-schools" and "--no-ocr" not in args:
                    # FCPS posts most approved minutes only as scanned PDFs: OCR fallback (scripts/fcps_minutes_ocr.py)
                    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
                    import fcps_minutes_ocr
                    got, info = fcps_minutes_ocr.fcps_ocr_votes(m["unique"], d, curl, cache, lab)
                    if got:
                        sub = r["title"].split(" — ")[1] if " — " in r["title"] else ""
                        if sub: got = [x for x in got if re.search(r"closed", x["_title"] + x["action"], re.I)]
                        dec, link, kind = got, info, "boarddocs-ocr"
                    else:
                        r["_why"] = info
            if kind != "boarddocs-ocr": kind = "boarddocs"
        prev = fill.get(r["slug"], {})
        if dec is None:
            report.append((v, r["slug"], r["dateLabel"], "pending", 0, r.get("_why", ""))); continue
        for x in dec: x.pop("_title", None)
        keep = [x for x in prev.get("decisions", []) if not any(x["action"] == y["action"] for y in dec)]
        f = dict(prev)
        f["decisions"] = dec + keep
        f["noVotesRecorded"] = len(f["decisions"]) == 0
        f["votesSource"] = kind
        f["links"] = [l for l in prev.get("links", []) if l["href"] != link["href"]] + [link]
        fill[r["slug"]] = f
        report.append((v, r["slug"], r["dateLabel"], "votes" if f["decisions"] else "no-votes-in-record", len(f["decisions"])))
    json.dump(fill, open(OUT, "w"), indent=1, ensure_ascii=False)
    json.dump(report, open(os.path.join(cache, "report.json"), "w"), indent=1)
    from collections import Counter
    c = Counter((x[0], x[3]) for x in report)
    for k in sorted(c): print(k, c[k])
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
