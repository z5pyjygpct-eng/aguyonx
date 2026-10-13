#!/usr/bin/env python3
"""
Fill Fairfax City recaps from OFFICIAL records (same rule as Loudoun):
  - decisions/votes: ONLY from the official minutes linked on the recap
      council  -> Granicus "Council Reporter" (Council Actions) HTML
      schools  -> Granicus minutes PDF (narrative: "X moved ... The motion passed unanimously.")
  - agenda: Granicus AgendaViewer (items + staff-report links)
  - moments: official Granicus video index (cuepoints) when present; otherwise the first
    transcript passage that matches the agenda item's wording (machine transcript, approximate).
Writes src/content/city-recap-fill.json (merged into CITY_RECAPS by city-recaps.ts).
Never invents a vote: a recap gets decisions only if a recorded action is parsed from minutes.

Usage: python3 scripts/fairfax-recap-fill.py [--only slug,slug] [--cache /tmp/fx]
Run after a new Fairfax recap is added (the recap + transcript ingest routines call it).
"""
import html, json, os, re, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/content/city-recap-fill.json")
FILLER = {"Early agenda business.", "Mid-meeting discussion.", "Later agenda business."}
SKIP_MOMENT = re.compile(r"^(call (the )?(special |regular )?meeting to order|pledge|adjourn|recess|reconvene|work session\.?$|work session \(continued\)|meeting opening|call to order)", re.I)
STOP = set("the of and for a an to in on with by from at as is be this that city fairfax council board school schools meeting regular special consideration discussion update presentation resolution ordinance approval approve item items public hearing introduction amending pertaining section chapter article virginia code dr mr ms mrs report".split())

args = sys.argv[1:]
only = None
cache = "/tmp/fx-cache"
for i, a in enumerate(args):
    if a == "--only": only = set(args[i + 1].split(","))
    if a == "--cache": cache = args[i + 1]
os.makedirs(cache, exist_ok=True)


def fetch(url, name):
    p = os.path.join(cache, name)
    if not os.path.exists(p) or os.path.getsize(p) < 200:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 aguyonx-recap-fill"})
        with urllib.request.urlopen(req, timeout=60) as r, open(p, "wb") as f:
            f.write(r.read())
    return p


def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s))
    s = s.replace("\xa0", " ").replace("â€™", "’")
    return re.sub(r"\s+", " ", s).strip()


def to_text(p):
    raw = open(p, "rb").read()
    if raw[:4] == b"%PDF":
        return subprocess.run(["pdftotext", "-layout", p, "-"], capture_output=True, text=True).stdout, "pdf"
    t = raw.decode("utf-8", "ignore")
    t = re.sub(r"(?is)<(script|style).*?</\1>", "", t)
    t = re.sub(r"(?i)<br\s*/?>|</(p|div|tr|li|td|h\d)>", "\n", t)
    t = html.unescape(re.sub(r"<[^>]+>", "", t)).replace("\xa0", " ")
    t = re.sub(r"[ \t]+", " ", t)
    return re.sub(r"\n\s*\n+", "\n", t), "html"


NUM = re.compile(r"^(\d+\.(\d+)?|[a-z]\.)$")


def parse_agenda(p):
    t = open(p, encoding="utf-8", errors="ignore").read()
    items = []  # dict(num, title, meta, href, level)
    top = None
    for tb in re.findall(r"(?is)<table.*?</table>", t):
        tds = re.findall(r"(?is)<td[^>]*>(.*?)</td>", tb)
        docs = re.findall(r'href="(https://fairfax\.granicus\.com/MetaViewer\.php[^"]+)"', tb)
        texts = [clean(x) for x in tds]
        idx = next((i for i, x in enumerate(texts) if NUM.match(x)), None)
        if idx is None or idx + 1 >= len(texts):
            if docs and items and not items[-1].get("href"):
                items[-1]["href"] = html.unescape(docs[0])
            continue
        num = texts[idx].rstrip(".")
        title = re.sub(r"^[–\-]\s*", "", texts[idx + 1]).strip()
        if not title:
            continue
        m = re.search(r"meta_id=(\d+)", tb)
        if re.match(r"^\d+$", num):
            top = num
            full, level = num, 0
        elif re.match(r"^\d+\.\d+$", num):
            full, level = num, 1
        else:
            full, level = f"{top}.{num}" if top else num, 1
        items.append({"num": full, "title": title[:400], "meta": m.group(1) if m else None, "level": level})
    groups, cur = [], None
    for it in items:
        if it["level"] == 0:
            cur = {"heading": f'{it["num"]}. {it["title"]}', "items": [], "_meta": it["meta"], "_num": it["num"], "_title": it["title"]}
            groups.append(cur)
        else:
            if cur is None:
                cur = {"heading": "Agenda", "items": []}
                groups.append(cur)
            row = {"num": it["num"], "title": it["title"]}
            if it.get("href"): row["href"] = it["href"]
            row["_meta"] = it["meta"]
            cur["items"].append(row)
    for it in items:  # staff report on a top-level item
        pass
    return groups


def cuepoints(clip):
    p = fetch(f"https://fairfax.granicus.com/MediaPlayer.php?view_id=13&clip_id={clip}", f"mp-{clip}.html")
    m = re.search(r"cuepoints:\s*(\[.*?\])", open(p, encoding="utf-8", errors="ignore").read(), re.S)
    try:
        return {c["id"]: int(c["time"]) for c in json.loads(m.group(1))} if m else {}
    except Exception:
        return {}


def council_decisions(text, src):
    out, top, sub = [], None, None
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for i, l in enumerate(lines):
        m = re.match(r"^(\d+)\.\s+\S", l)
        if m:
            top, sub = m.group(1), None
            continue
        if re.match(r"^[a-z]\.$", l):
            sub = l[0]
            continue
        if re.match(r"^(Approved|Denied|Failed|Adopted|Disapproved|Deferred|Tabled|Withdrawn|Continued|Motion)\b", l):
            item = f"{top}.{sub}" if top and sub else (top or "")
            tally = None
            if re.search(r"\bunanimous(ly)?\b", l, re.I):
                tally = "Unanimous"
                ab = re.search(r"\(([^)]*absent[^)]*)\)", l)
                if ab: tally += f" ({ab.group(1)})"
            else:
                m2 = re.search(r"\b(\d+-\d+(?:-\d+)?)\b((?:,\s*(?:Mayor|Councilmembers?|Councilman|Councilwoman)[^,]*?(?:opposed|abstained|absent|recused))*)", l)
                if m2: tally = (m2.group(1) + m2.group(2)).strip(", ")
            out.append({"item": item, "action": l, **({"tally": tally} if tally else {}), "source": src})
    return out


ABBR = re.compile(r"\b(Mr|Mrs|Ms|Dr|No|St|Jr|Sr|Inc|Co|Vol|vs|etc|[A-Z])\.")


def school_decisions(text, src):
    flat = re.sub(r"\s+", " ", text)
    heads = [(m.start(), m.group(1)) for m in re.finditer(r"(?<![\d.$])(\d\.\d\d)\b(?!\s*(?:p\.m|a\.m|%))", flat)]
    prot = ABBR.sub(lambda m: m.group(1) + "§", flat)
    prot = re.sub(r"\b([ap])\.m\.", r"\1§m§", prot)
    prot = re.sub(r"(\d)\.(\d)", r"\1§\2", prot)
    sents, pos = [], 0
    for m in re.finditer(r"[^.]+\.", prot):
        sents.append((m.start(), m.group(0).replace("§", ".").strip()))
    out, i = [], 0
    OUTC = re.compile(r"\b(passed|failed|carried|defeated|was approved|no members (were )?opposed|opposed|abstain)", re.I)
    while i < len(sents):
        st, sn = sents[i]
        ev = re.search(r"The vote in favor of (.+?) was unanimous", sn)
        if ev:
            item = ""
            for p_, h in heads:
                if p_ < st: item = h
            prev = sents[i - 1][1] if i else ""
            out.append({"item": item, "action": (prev + " " + sn[ev.start():]).strip(), "tally": "Unanimous", "source": src})
        if re.search(r"\bmoved\b|\bmade a motion\b", sn) and not re.search(r"moved (on|to the next|forward|into)", sn):
            j, outcome = i + 1, []
            while j < len(sents) and j <= i + 150:
                t = sents[j][1]
                if re.search(r"\bmoved\b", t) and not outcome: break
                if OUTC.search(t) and not re.search(r"those opposed, ‘?Nay", t):
                    outcome.append(t)
                    if re.search(r"passed|failed|carried|defeated|was approved", t, re.I): break
                j += 1
            if outcome:
                txt = " ".join(outcome)
                if re.search(r"unanimous|no members (were )?opposed", txt, re.I) and not re.search(r"\bopposed\b(?! *[,;:]?\s*(?:‘|')?Nay)", re.sub(r"no members (were )?opposed", "", txt, flags=re.I)):
                    tally = "Unanimous"
                else:
                    tally = txt
                mvpos = st + max(sn.find(" moved"), sn.find(" made a motion"), 0)
                item = ""
                for p_, h in heads:
                    if p_ < mvpos: item = h
                mm = list(re.finditer(r"(?:Mr|Mrs|Ms|Dr|Chair|Vice Chair)\.? [A-Z][\w’'-]+,? (?:moved|made a motion)", sn))
                if mm: sn = sn[mm[-1].start():]
                sn = re.sub(r"(as follows|following):?\s*\d+\.$", r"\1 (full text in the official minutes).", sn)
                fail = re.search(r"failed|defeated", txt, re.I)
                out.append({"item": item, "action": sn + " " + outcome[-1] if outcome[-1] not in sn else sn, "tally": ("Failed: " if fail and tally == "Unanimous" else "") + tally, "source": src})
                i = j
        i += 1
    return out


def kw(title):
    w = [x for x in re.findall(r"[A-Za-z][A-Za-z\-]{3,}", title.lower()) if x not in STOP]
    return list(dict.fromkeys(w))[:8]


CUE = re.compile(r"\b(next|item|move|motion|present|presentation|welcome|hearing|participation|report|update|introduce|recognize)\w*", re.I)


def transcript_time(segs, title, after):
    """Conservative: the item's distinctive words (>=60%, min 2) plus a procedural cue in a 3-segment window."""
    words = kw(title)
    if len(words) < 3: return None
    need = max(3, round(0.6 * len(words)))
    for i, s in enumerate(segs):
        if s["start"] <= after + 30: continue
        win = " ".join(x["text"] for x in segs[i:i + 3]).lower()
        own = segs[i]["text"].lower()
        if sum(1 for w in words if w in win) >= need and CUE.search(own) and sum(1 for w in words if w in own) >= 2:
            return int(s["start"])
    return None


def main():
    recaps = json.loads(subprocess.run(["node", "-e", """
const jiti=require('jiti')(process.cwd()+'/x.js',{alias:{'@':process.cwd()+'/src'}});
const {CITY_RECAPS_RAW_EXPORT}=jiti(process.cwd()+'/src/content/city-recaps.ts');
console.log(JSON.stringify(CITY_RECAPS_RAW_EXPORT.filter(r=>r.slug.startsWith('fxc-'))));"""], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    fill = json.load(open(OUT)) if os.path.exists(OUT) else {}
    for r in recaps:
        if only and r["slug"] not in only: continue
        clip = r["meetingId"].split("-")[1]
        links = {l["label"].split(" ")[0]: l["href"] for l in r["official"]["links"]}
        f = {"generatedFrom": "official Granicus agenda/minutes + video index; transcript for timing only"}
        groups = []
        if "Agenda" in links:
            groups = parse_agenda(fetch(links["Agenda"], f"ag-{clip}.html"))
        cues = cuepoints(clip)
        # decisions
        if "Minutes" in links:
            src = {"label": "Official minutes (Granicus)", "href": links["Minutes"]}
            text, kind = to_text(fetch(links["Minutes"], f"min-{clip}.bin"))
            dec = council_decisions(text, src) if kind == "html" else school_decisions(text, src)
            f["decisions"] = dec
            f["minutesKind"] = kind
            f["noVotesRecorded"] = len(dec) == 0
        # agenda (public shape)
        f["agenda"] = [{"heading": g["heading"][:300], "items": [{k: v for k, v in it.items() if not k.startswith("_")} for it in g["items"]]} for g in groups]
        # moments
        tpath = os.path.join(ROOT, "public/files/find-the-moment", r["venue"], "transcripts", f"{r['meetingId']}.json")
        segs = json.load(open(tpath)) if os.path.exists(tpath) else []
        cands = []
        for g in groups:
            entries = ([("top", g["_num"], g["_title"], g["_meta"])] if "_num" in g else []) + [("sub", it["num"], it["title"], it["_meta"]) for it in g["items"]]
            for kind_, num, title, meta in entries:
                if SKIP_MOMENT.match(title) or (kind_ == "top" and g["items"] and not re.search(r"public comment|citizen participation|public hearing", title, re.I)):
                    continue
                cands.append((num, title, meta))
        moments, after = [], 0
        for num, title, meta in cands:
            t, how = None, None
            if meta and meta in cues:
                t, how = cues[meta], "index"
            # (no fuzzy transcript matching for agenda items: too error-prone; see vote moments below)
            if t is None or any(abs(t - m["seconds"]) < 30 for m in moments): continue
            after = t
            label = re.sub(r"\s*\(.*$", "", title).strip() or title
            label = label if len(label) <= 140 else label[:137].rstrip() + "…"
            moments.append({"seconds": t, "item": num, "label": label, "how": how})
        # Votes as moments: official decisions paired in order with the transcript's
        # "all (those) in favor" calls, only when the counts match exactly (no guessing).
        decs = f.get("decisions", [])
        if segs and decs:
            calls, last = [], -999
            for sg in segs:
                if re.search(r"\ball (those )?in favor\b", sg["text"], re.I) and sg["start"] - last > 20:
                    calls.append(int(sg["start"])); last = sg["start"]
            if len(calls) == len(decs):
                titles = {it["num"]: it["title"] for g in groups for it in g["items"]}
                titles.update({g["_num"]: g["_title"] for g in groups if "_num" in g})
                for t, d in zip(calls, decs):
                    if any(abs(t - m["seconds"]) < 30 for m in moments): continue
                    base = titles.get(d["item"]) or re.sub(r"\s+", " ", d["action"])[:100]
                    base = re.sub(r"^[–\-]\s*", "", base)
                    lab = f"Vote: {base}"
                    moments.append({"seconds": t, **({"item": d["item"]} if d["item"] else {}), "label": lab[:150], "how": "transcript-vote"})
        moments.sort(key=lambda m: m["seconds"])
        f["moments"] = moments
        fill[r["slug"]] = f
    json.dump(fill, open(OUT, "w"), indent=1, ensure_ascii=False)
    print(f"wrote {OUT}: {len(fill)} recaps")


if __name__ == "__main__":
    main()
    
    # Standard: refresh Find the Moment thumbnails (new meetings + changed recap text).
    import subprocess as _sp, os as _os
    _sp.run(["bash", _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "ftm-thumbs.sh")], check=False)

