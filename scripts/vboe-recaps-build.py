#!/usr/bin/env python3
"""Board of Education recaps for every transcribed VBOE meeting.
Votes: ONLY from official minutes posted by VDOE on Virginia Regulatory Town Hall (board 93), parsed
from the PDF text in /workspace/vboe-minutes (m{ID}.raw.txt, v{ID}.html). Motion text is verbatim.
Moments: detected in the machine transcripts (public/files/find-the-moment/va-boe/transcripts), neutral labels.
Writes src/content/vboe-recaps-data.ts."""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from vboe_minutes_parse import parse
MIN = "/workspace/vboe-minutes"
TR = os.path.join(ROOT, "public/files/find-the-moment/va-boe/transcripts")
TH = {"2026-09-24":43094,"2026-09-23":43093,"2026-08-27":43092,"2026-08-26":43091,"2026-06-25":43090,"2026-06-24":43089,
"2026-04-23":43088,"2026-04-22":43087,"2026-03-26":43086,"2026-03-25":43085,"2026-01-08":42668,"2025-12-11":42667,"2025-12-10":42666,
"2025-11-13":40817,"2025-11-12":40816,"2025-10-23":40815,"2025-10-22":40814,"2025-09-25":40813,"2025-09-24":40812,"2025-08-28":40811,
"2025-08-27":40810,"2025-07-31":40809,"2025-07-30":40808,"2025-06-18":40807,"2025-05-22":40805,"2025-05-21":40804,"2025-03-27":40803,"2025-03-26":40802}
src = open(os.path.join(ROOT, "src/content/va-boe-data.ts")).read()
MEET = [dict(zip(("id","yt","date","dateLabel","title","duration"), m.groups())) for m in re.finditer(
    r'id: "(vboe-[^"]+)", youtubeId: "([^"]+)", date: "([^"]+)", dateLabel: "([^"]+)", title: "([^"]+)", duration: "([^"]+)"', src)]
STOP = set("final review first board education virginia regulations regulation proposed amendments standards report annual school schools public division plan local their within under through about should would".split())
HON = r"(?:Mr|Mrs|Ms|Dr)\. [A-Z][\w'’-]+(?: [A-Z][\w'’-]+)?"
# 2022-09-15 -> 36888 added Oct 23 2026 (minutes dated "September 14-15, 2022", cover the Sep 15 business meeting).
# Added 2026-10-23: 2022-2025 meetings (Town Hall board 93; only where the minutes' own date matches the video date)
TH_2023 = {"2022-09-15":36888,"2022-11-17":37248,"2023-02-02":37602,"2023-03-23":37761,"2023-04-20":37881,"2023-05-11":37996,"2023-06-15":38114,"2023-07-27":38351,"2023-08-31":38506,"2023-09-13":38649,"2023-09-14":38650,"2023-10-18":38850,"2023-10-19":38851,"2023-11-15":38955,"2023-12-12":39097,"2024-01-24":39330,"2024-01-25":39331,"2024-03-27":39628,"2024-03-28":39629,"2024-04-23":39766,"2024-04-24":39767,"2024-04-25":39768,"2024-05-21":39891,"2024-06-20":39996,"2024-06-21":39997,"2024-07-24":40187,"2024-08-28":40353,"2024-09-26":40572,"2024-10-23":40734,"2024-10-24":40735,"2024-12-02":40938,"2024-12-03":40939,"2025-02-26":40800,"2025-02-27":40801}
TH.update(TH_2023)
# Added 2026-10-24: 2020-2022 videos ingested Oct 24 2026. Their YouTube catalog dates/titles do not reliably match the
# Town Hall minutes (e.g. a "Business Meeting" video is actually a committee session; minutes headers fall a day off), so
# NO minutes are attached to them: votesPosted false until each video is matched to its minutes by hand.
NOMAP_1024 = set(["vboe-2N0xO9h_t7o", "vboe-5w1i2Pfq7ms", "vboe-8FApFeZ-_Z0", "vboe-8fYGbaXRHTY", "vboe-G1Wbk7TDZGg", "vboe-GK4Pl0tXctw", "vboe-GZ5k1Xr-TQw", "vboe-G_cUYsYVGxk", "vboe-GdmjTI-I6IE", "vboe-HCYMQXsoLYs", "vboe-HpxprL7ccNg", "vboe-IWWkBYMYDSg", "vboe-LVpvdfY9L9w", "vboe-LYT9-P5_gHc", "vboe-P6kmxaBMey0", "vboe-Qy9_eTP40mg", "vboe-RfScME8c_4k", "vboe-XLY0vCLSzmg", "vboe-_NZ6ElwUFfU", "vboe-_m2HA_4ftqQ", "vboe-dfe_FD2V8Sw", "vboe-e7xKkm2V8Ok", "vboe-eMU5k9aPH2M", "vboe-eSl1gssmSnk", "vboe-hUyPAkWm6FI", "vboe-i0wBFGyfpWI", "vboe-jgguYIllqdI", "vboe-k3WSP9Oc2WE", "vboe-lexBvJdBJHo", "vboe-lfw6lprxWLM", "vboe-mAzST8Z4hFM", "vboe-mw9_iIlBQ_I", "vboe-nhXt0Qthp1I", "vboe-q7jOfPX5wi4", "vboe-rKIx9lmLEV0", "vboe-rt7G6H1EqhY", "vboe-sN4pbYcejAc", "vboe-uckpkAmkm48", "vboe-wtJ44RMB7IA", "vboe-yyTdlVgmZjw"])
# Added 2026-10-24 (hand match): each video matched to its Town Hall minutes by content (transcript opening/closing,
# minutes approved, elections, public commenters, license motions). Ranges are 1-indexed line slices of m{ID}.raw.txt
# where one Town Hall PDF covers two meeting days (executive session day + business day). None = whole PDF.
MAP_1024 = {"vboe-mw9_iIlBQ_I": (30679, (61, 584)), "vboe-e7xKkm2V8Ok": (30992, None), "vboe-HpxprL7ccNg": (31129, None),
 "vboe-Qy9_eTP40mg": (31347, None), "vboe-dfe_FD2V8Sw": (31503, None), "vboe-8fYGbaXRHTY": (31628, None),
 "vboe-_m2HA_4ftqQ": (32612, (72, 548)), "vboe-wtJ44RMB7IA": (32748, (1, 65)), "vboe-q7jOfPX5wi4": (32748, (66, 357)),
 "vboe-GK4Pl0tXctw": (33077, (126, 541)), "vboe-i0wBFGyfpWI": (33235, (62, 455)), "vboe-eSl1gssmSnk": (33235, (456, 462)),
 "vboe-hUyPAkWm6FI": (36725, None), "vboe-LYT9-P5_gHc": (36725, None), "vboe-XLY0vCLSzmg": (36888, (735, 807))}
NOTE_1024 = {"vboe-wtJ44RMB7IA": " This video is the Board's July 21, 2021 executive session (closed meeting on teacher-license cases); the votes shown are the open-session motions recorded for that day.",
 "vboe-XLY0vCLSzmg": " This video is the Sep 14, 2022 executive session (open-session license motions) followed by the work session; the minutes say no votes were taken in the work session.",
 "vboe-eSl1gssmSnk": " The Board's minutes say no votes were taken in the Oct 20, 2021 work session (teacher evaluation, Culturally Competent Educators update, Direct Aid rebenchmarking), which is in the second half of this video. The Committee on the Standards of Quality portion earlier in the video is not covered by the Board minutes posted on Town Hall.",
 "vboe-hUyPAkWm6FI": " This video covers the morning work session (HB 938) and the start of the business meeting.",
 "vboe-LYT9-P5_gHc": " This video picks up the business meeting after the morning session."}
SLUG_KEEP = {"vboe-XLY0vCLSzmg": "2022-09-14-work-session", "vboe-hUyPAkWm6FI": "2022-08-17-work-session", "vboe-LYT9-P5_gHc": "2022-08-17-business-meeting",
 "vboe-eSl1gssmSnk": "2021-10-20-standards-of-quality-session", "vboe-wtJ44RMB7IA": "2021-07-21-work-session"}
def CHK(m): return "Oct 24, 2026" if m["id"] in NOMAP_1024 else ("Oct 23, 2026" if m["date"] < "2025-03-01" else "Oct 22, 2026")

def tally(t):
    if re.search(r"voted unanimously", t, re.I): return "Carried unanimously"
    if re.search(r"carried unanimously", t, re.I) and not re.search(r"abstain|voted no|voted nay", t, re.I): return "Carried unanimously"
    if re.search(r"carried unanimously", t, re.I): return "Carried unanimously, with an abstention recorded (see text)"
    if re.search(r"\bfailed\b|did not carry", t, re.I): return "Failed (see minutes for the recorded vote)"
    if re.search(r"\bcarried\b|passed|approved by", t, re.I): return "Carried (see minutes for the recorded vote)"
    return "Result not stated in the minutes"
def clip(s, n):
    s = s.strip()
    if len(s) <= n: return s
    c = s[:n]; i = max(c.rfind(". "), c.rfind("? "))
    return (c[:i+1] if i > n * 0.5 else c.rsplit(" ", 1)[0]) + " …"
def slugify(t): return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", t.lower())).strip("-")
def decisions(mid, url, rng=None):
    f = f"{MIN}/m{mid}.raw.txt"
    if rng:
        f2 = f"/tmp/vboe-m{mid}-{rng[0]}-{rng[1]}.raw.txt"
        open(f2, "w").write("".join(open(f).readlines()[rng[0]-1:rng[1]])); f = f2
    agenda, decs, _ = parse(f)
    out, lic = [], 0
    for d in decs:
        t = d["text"]
        ms = list(re.finditer(HON + r" (?:made a motion|motioned|moved)", t))
        if ms and ms[-1].start() > 0: t = t[ms[-1].start():]
        sec = d["sec"] or ""
        if re.search(r"\b(were|was) moved to the\b", t) and not ms: continue
        if (re.search(r"reprimand|endorsement to|revo[kc]|suspen|reinstat", t, re.I) or (re.search(r"licen[sc]", t, re.I) and re.search(r"deny|denial|issue|licen[sc]e (of|for|to)|case", t, re.I))) and not re.search(r"regulation|guidance|amend|guidelines", t, re.I):
            lic += 1; continue
        if re.search(r"material for this item can be found", t) and not tally(t): t = t.split(" The material for this item")[0]
        if re.search(r"closed", sec, re.I) or re.search(r"closed (meeting|session)", t, re.I):
            item = "Closed session"
        elif re.search(r"consent", sec, re.I): item = "Consent agenda"
        elif d["item"] and not re.search(r"approval of (the )?(agenda|minutes)", sec, re.I): item = f"Item {d['item']}"
        else: item = sec.title() if sec else "Motion"
        a = clip(t, 600)
        if d["item"] and item.startswith("Item"): a = f"{d['title']}: {a}"
        out.append({"item": item, "action": a, **({"tally": tally(t)} if tally(t) else {}), "source": {"label": "Official minutes (PDF)", "href": url}})
    if lic:
        out.append({"item": "Closed session", "action": f"{lic} motion{'s' if lic > 1 else ''} on individual teacher-license cases heard in closed session. Individuals are not named here; the minutes record each case and result.",
                    "source": {"label": "Official minutes (PDF)", "href": url}})
    return agenda, out
def moments(m, agenda):
    p = f"{TR}/{m['id']}.json"
    segs = json.load(open(p))
    if not segs: return []
    got = []; used = set()
    def add(i, label, item=None, quote=False):
        s = segs[i]; sec = int(s["start"])
        if any(abs(sec - g["seconds"]) < 90 for g in got): return
        g = {"seconds": sec, "label": label}
        if item: g["item"] = item
        if quote: g["quote"] = clip(s["text"], 200)
        got.append(g)
    co = next((i for i, s in enumerate(segs) if re.search(r"call (this|the)? ?(meeting|session|board)?.{0,20}to order", s["text"], re.I)), None)
    if co is not None: add(co, "Call to order", quote=True)
    else: add(0, "Video begins")
    pc = next((i for i, s in enumerate(segs) if re.search(r"public comment", s["text"], re.I)), None)
    if pc is not None: add(pc, "Public comment period", quote=True)
    # agenda items: first segment mentioning >=2 distinctive title words (or the item title phrase)
    for sec, letter, title in agenda:
        if re.search(r"closed", sec or "", re.I): continue
        kw = [w for w in set(re.findall(r"[a-z]{6,}", title.lower())) if w not in STOP]
        if len(kw) < 2: continue
        best = None
        for i, s in enumerate(segs):
            t = s["text"].lower(); n = sum(1 for w in kw if w in t)
            if n >= min(3, len(kw)) or (n >= 2 and re.search(r"item|next|present|move to|turn to", t)): best = i; break
        if best is not None: add(best, f"{clip(title, 140)} (discussion near here)", item=letter, quote=True)
    if re.search(r"business|special", m["title"], re.I):
        n = 0
        for i, s in enumerate(segs):
            t = s["text"].lower()
            if n < 4 and "motion" in t and re.search(r"second|all in favor|aye|opposed", t):
                before = len(got); add(i, "Motion and vote. See the official minutes for the recorded result."); n += len(got) - before
    for i, s in enumerate(segs):
        if re.search(r"next presentation|next item|next on (the|our) agenda|turn it over to|hand it over to|(would|'d) like to (introduce|welcome)|presentation (on|regarding|about)|go ahead and get started", s["text"], re.I):
            add(i, "Presentation or new topic begins", quote=True)
        elif re.search(r"\b(take a|we'll|we will|stand in) (short |brief |quick )?(recess|break)|we('re| are) back|reconvene", s["text"], re.I):
            add(i, "Recess or reconvene")
    adj = next((i for i in range(len(segs) - 1, -1, -1) if re.search(r"adjourn", segs[i]["text"], re.I)), None)
    if adj is not None: add(adj, "Adjournment")
    got.sort(key=lambda g: g["seconds"])
    if len(got) > 12:  # keep anchors, thin the rest evenly
        keep = [g for g in got if g["label"] in ("Call to order", "Public comment period", "Adjournment") or g.get("item")]
        rest = [g for g in got if g not in keep]
        got = sorted(keep[:12] + rest[: max(0, 12 - len(keep))], key=lambda g: g["seconds"])
    return got
recaps = []
tx = set(f[:-5] for f in os.listdir(TR) if f.endswith(".json"))
for m in MEET:
    if m["id"] not in tx: continue
    tslug = slugify(m["title"].replace("(Part ", "part-").replace(")", ""))
    slug = SLUG_KEEP.get(m["id"], f"{m['date']}-{tslug}")
    rng = None
    if m["id"] in MAP_1024: mid, rng = MAP_1024[m["id"]]
    else: mid = None if m["id"] in NOMAP_1024 else TH.get(m["date"])
    part = re.search(r"Part (\d+)", m["title"])
    base = {"slug": slug, "meetingId": m["id"], "date": m["date"], "title": m["title"], "dateLabel": m["dateLabel"],
            "whenWhere": f"Virginia Board of Education · {m['title']} · video {m['duration']} · VDOE YouTube",
            "transcriptDownloads": {"pdfUrl": f"/files/find-the-moment/va-boe/transcripts/coraggio-transcript-va-boe-{slug}.pdf",
                                    "txtUrl": f"/files/find-the-moment/va-boe/transcripts/coraggio-transcript-va-boe-{slug}.txt"}}
    for k in ("pdfUrl", "txtUrl"):
        assert os.path.exists(os.path.join(ROOT, "public" + base["transcriptDownloads"][k])), base["transcriptDownloads"][k]
    if mid:
        h = open(f"{MIN}/v{mid}.html", errors="ignore").read()
        v = re.search(rf"Minutes_DOE_{mid}_v(\d+)\.pdf", h); ver = v.group(1) if v else "1"
        url = f"https://townhall.virginia.gov/L/GetFile.cfm?File=meeting\\93\\{mid}\\Minutes_DOE_{mid}_v{ver}.pdf"
        draft = mid in (43092, 43093, 43094, 31628)
        agenda, decs = decisions(mid, url, rng)
        status = "DRAFT minutes (posted for Board approval)" if draft else "approved minutes"
        note = f"Votes below are from the {status} posted by VDOE on Virginia Regulatory Town Hall. Motion text is quoted from the minutes."
        if part: note += f" The minutes cover the full {m['dateLabel']} meeting; this video is Part {part.group(1)}."
        if mid == 36888: note += " These minutes cover the Board's September 14-15, 2022 meeting days; this video is the Sep 15 business meeting."
        if not decs: note = f"The {status} for {m['dateLabel']} record no motions or votes (presentations only)."
        if m["id"] in MAP_1024: note += " Matched to this video by hand on Oct 24, 2026."
        note += NOTE_1024.get(m["id"], "")
        groups = {}
        for sec, letter, title in agenda:
            if re.search(r"closed", sec or "", re.I): continue
            groups.setdefault(sec or "Agenda", []).append({"num": letter, "title": title})
        ag = [{"heading": k, "items": v} for k, v in groups.items()]
        if not ag: ag = [{"heading": "Work session", "dek": "Presentations to the Board. The minutes list no lettered agenda items; materials are posted with VDOE's meeting agendas.", "items": []}]
        rec = {**base, "official": {"votesPosted": True, "checkedLabel": CHK(m), "note": note,
               "links": [{"label": f"Minutes, {m['dateLabel']} (Town Hall PDF{', DRAFT' if draft else ''})", "href": url},
                         {"label": "Town Hall meeting page", "href": f"https://townhall.virginia.gov/L/ViewMeeting.cfm?MeetingID={mid}"},
                         {"label": "VDOE Board meetings, agendas and minutes", "href": "https://www.doe.virginia.gov/state-board-data-funding/virginia-board-of-education"}]},
               "decisions": decs, "agenda": ag}
    else:
        agenda = []
        rec = {**base, "official": {"votesPosted": False, "checkedLabel": CHK(m), "note": ("Votes not shown yet: VDOE's minutes for this period could not be matched to this specific video with confidence (the video's posted date and title don't line up with the Town Hall minutes)." if m["id"] in NOMAP_1024 else "Votes unavailable: no official VDOE minutes found for this meeting."), "links": []}, "decisions": [], "agenda": []}
    rec["moments"] = moments(m, agenda)
    rec["context"] = []
    recaps.append(rec)
ts = "/** GENERATED by scripts/vboe-recaps-build.py. Votes: official VDOE minutes (Town Hall) only. Do not hand-edit. */\n"
ts += 'import type { VboeRecap } from "./vboe-recaps";\n\nexport const VBOE_RECAPS: VboeRecap[] = ' + json.dumps(recaps, indent=1, ensure_ascii=False) + ";\n"
open(os.path.join(ROOT, "src/content/vboe-recaps-data.ts"), "w").write(ts)
for r in recaps: print(r["slug"], len(r["decisions"]), len(r["moments"]), sum(len(g["items"]) for g in r["agenda"]))
print(len(recaps))
