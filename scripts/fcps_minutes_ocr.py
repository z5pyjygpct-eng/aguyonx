#!/usr/bin/env python3
"""OCR fallback for FCPS (BoardDocs vsba/fairfax) approved minutes that are posted only as scanned PDFs.

Used by ffx-pw-votes.py when BD-GetMinutes is empty. Only APPROVED minutes are used:
file name must say FINAL / Approved / Signed (never Draft), or the agenda item itself is titled "Approved ... Minutes".
Requires RapidOCR in /workspace/ocrenv (pip install rapidocr_onnxruntime) and poppler (pdftoppm).
Quality gate: every vote name must fuzzy-match the board roster and Yes+No+Abstain+NotPresent must equal 12;
any failing motion makes the whole meeting stay pending (returns None).
"""
import os, re, subprocess, json, difflib, sys, urllib.parse

OCR_PY = os.environ.get("OCR_PY", "/workspace/ocrenv/bin/python")
BOARD = ["Karl Frisch", "Ricardy Anderson", "Kyle McDaniel", "Melanie K. Meren", "Rachna Sizemore Heizer",
         "Ilryong Moon", "Robyn Lady", "Marcia St. John-Cunning", "Sandy Anderson", "Seema Dixit",
         "Mateo Dunne", "Ryan McElveen"]
KEY = lambda s: re.sub(r"[^a-z]", "", s.lower())
BKEYS = {KEY(n): n for n in BOARD}

def approved_file(fname, item_title):
    f = fname.lower()
    if "draft" in f: return False
    return bool(re.search(r"final|approved|signed", f)) or "approved" in item_title.lower()

def minutes_items(agenda_html):
    return re.findall(r'unique="(\w+)"[^>]*Xtitle="[^"]*">[\s\S]{0,400}?<span class="order">([\d.]+)\s*</span><span class="title">([^<]*minutes[^<]*)', agenda_html, re.I)

def ocr_pdf(pdf, cache_txt, dpi=200):
    if os.path.exists(cache_txt): return open(cache_txt).read()
    d = cache_txt + ".pages"; os.makedirs(d, exist_ok=True)
    subprocess.run(["pdftoppm", "-r", str(dpi), "-png", pdf, f"{d}/p"], check=True)
    code = ("import sys,glob\nfrom rapidocr_onnxruntime import RapidOCR\no=RapidOCR()\n"
            "for p in sorted(glob.glob(sys.argv[1]+'/p-*.png')):\n r,_=o(p)\n"
            " rows=sorted(r or [],key=lambda b:(round(b[0][0][1]/12),b[0][0][0]))\n"
            " for b in rows: print(b[1])\n print('=====PAGE=====')\n")
    out = subprocess.run([OCR_PY, "-c", code, d], capture_output=True, text=True, check=True).stdout
    open(cache_txt, "w").write(out); return out

def match_name(tok):
    k = KEY(tok)
    if not k: return None
    if k in BKEYS: return BKEYS[k]
    m = difflib.get_close_matches(k, BKEYS.keys(), n=1, cutoff=0.8)
    return BKEYS[m[0]] if m else None

def split_names(s):
    s = re.sub(r"\s+", " ", s).strip(" .;")
    parts = [p for p in re.split(r",|;", s) if p.strip()]
    res = []
    for p in parts:
        n = match_name(p)
        if n: res.append(n); continue
        # names glued together without commas: greedy roster scan
        k, hit = KEY(p), []
        for bk in sorted(BKEYS, key=len, reverse=True):
            if bk in k: hit.append(BKEYS[bk]); k = k.replace(bk, "")
        if hit and len(k) <= 2: res += hit
        else: return None
    return res

# FCPS School Board (term 2024-2027; Tom Dannan replaced Rachna Sizemore Heizer in 2025). Each member: OCR-tolerant markers.
MARK = {"Karl Frisch": ["frisch"], "Ricardy Anderson": ["ricardy", "drranderson", "rjanderson"], "Kyle McDaniel": ["mcdanie"],
        "Melanie K. Meren": ["meren"], "Rachna Sizemore Heizer": ["heizer"], "Ilryong Moon": ["moon"], "Robyn Lady": ["robyn", "msiady", "mslady"],
        "Marcia St. John-Cunning": ["cunning"], "Sandy Anderson": ["sandy", "mssanderson", "sbanderson"], "Seema Dixit": ["dixit"],
        "Mateo Dunne": ["dunne"], "Ryan McElveen": ["mceiveen"], "Tom Dannan": ["dannan"]}
WORDS = ("karl v frisch ricardy j anderson kyle mcdaniel mcdanie melanie k meren rachna s sizemore heizer ilryong moon robyn lady marcia st john "
         "cunning sandy b seema dixit mateo dunne ryan mcelveen tom dannan vice chairman chair committee mr ms mrs dr r").split()
def okey(s): return re.sub(r"[^a-z]", "", s.lower().replace("!", "l").replace("1", "l")).replace("l", "i")
FILLER = sorted({okey(w) for w in WORDS}, key=len, reverse=True)
LABRX = r"(Yes|No|Abstain|Recused|Not\W*Present(?:\W*at\W*Vote)?|Absent)\W*[:;]"
def _pre(seg):
    seg = re.sub(r"\bDr\W{0,3}(R\W{0,3})?Anderson", " Ricardy ", seg, flags=re.I)
    seg = re.sub(r"\bMs\W{0,3}(S\W{0,3})?Anderson", " Sandy ", seg, flags=re.I)
    return re.sub(r"\b(Mr|Ms|Mrs|Dr)\b\.?", " ", seg)
def names_in(seg):
    k = okey(_pre(seg)); found = [n for n, ms in MARK.items() if any(okey(m) in k for m in ms)]
    rest = k
    for f in FILLER: rest = rest.replace(f, "")
    return found, len(rest)
def vote_block(body, dbg=None):
    lines = body.split("\n"); votes, cur, last, brk = {}, None, "", ""
    for l in lines:
        lm = re.match(r"^\s*" + LABRX + r"(.*)$", l, re.I)
        if lm:
            lab = re.sub(r"\W", "", lm[1]).lower(); lab = {"yes": "Yes", "no": "No", "abstain": "Abstain", "recused": "Recused"}.get(lab, "Not Present at Vote")
            if lab in votes: brk = l; break
            votes[lab] = lm[2]; cur = lab; last = l; continue
        if cur is None:
            if re.match(r"^\s*Final", l, re.I) or not l.strip(): continue
            brk = l; break
        f, r = names_in(l)
        if (f and r <= 3) or (okey(_pre(l)) and r == 0): votes[cur] += " , " + l; last = l
        else: brk = l; break
    if re.search(r"[,\-–]\s*$", last): return None  # list cut by a page break / OCR drop  # list cut by a page break / OCR drop
    out = {}
    for k, v in votes.items():
        f, r = names_in(v)
        if r > 3 or not f:
            if dbg is not None: dbg.append((k, v, r))
            return None
        out[k] = f
    return out

def _flat(text):
    return "\n".join(l.strip() for l in text.split("\n") if l.strip() and l.strip() != "=====PAGE=====")

def blocks(text, src):
    """one entry per 'Final Resolution' in the document: a vote dict, or None if that block fails the gate"""
    flat = _flat(text)
    fins = list(re.finditer(r"^\W*Final\W*Resolution\W*(.*)$", flat, re.I | re.M))
    out, prev = [], 0
    for fi, f in enumerate(fins):
        before = flat[prev:f.start()]
        prev = f.end()
        nxt = fins[fi + 1].start() if fi + 1 < len(fins) else len(flat)
        lines = before.rstrip().split("\n")
        tail = "\n".join(lines[-8:])
        mover = sec = None
        mm = list(re.finditer(r"Motion\W*by\W*(.+?),?\W*second(?:ed)?\W*by\W*(.+?)\W*$", tail, re.I | re.M))
        if mm: mover, sec = (names_in(mm[-1][1])[0] or [None])[0], (names_in(mm[-1][2])[0] or [None])[0]
        else:
            mv = re.findall(r"(?:Mover?|Motion\s*by)\W*(.+?)(?:\s+Second\b|$)", tail, re.I | re.M)
            sc = re.findall(r"Second(?:ed)?(?:\s*by)?\W*(.+?)$", tail, re.I | re.M)
            if mv and sc: mover, sec = (names_in(mv[-1])[0] or [None])[0], (names_in(sc[-1])[0] or [None])[0]
        consent = bool(re.search(r"All\W*those\W*in\W*favor", tail, re.I)) and not (mover or sec)
        m = consent or (mover and sec)
        votes = vote_block(flat[f.end():nxt][:1200].lstrip("\n"))
        res = re.sub(r"(?i)motion\W*carries", "Motion Carries", re.sub(r"(?i)motion\W*fails", "Motion Fails", f[1].strip(" .:")))
        if not m or not votes or not votes.get("Yes") or not re.match(r"Motion (Carries|Fails)$", res):
            out.append(None); continue
        allv = sum(votes.values(), [])
        if len(set(allv)) != len(allv) or len(allv) > 12:
            out.append(None); continue
        its = re.findall(r"^.{0,40}?\bItem\s*(\d{1,2}\.[0-9oO]{1,2})\W*(.{3,160})$", before, re.I | re.M)
        item = f"{its[-1][0].replace('o','0').replace('O','0')} {its[-1][1].strip()}" if its else ""
        mt = re.findall(r"Motion\s*:\s*([\s\S]{5,1500}?)(?=\n.*?(?:Motion\W*by|Mover))", before, re.I)
        motion = re.sub(r"\s+", " ", mt[-1]).strip() if mt else ""
        y, n = len(votes.get("Yes", [])), len(votes.get("No", []))
        parts = [f"{k}: {', '.join(v)}" for k, v in votes.items() if v and k != "Yes"]
        if consent:
            q = re.findall(r"(All\W*those\W*in\W*favor[^?]*\?)", tail, re.I)
            action = (f"{item}: " if item else "") + re.sub(r"\s+", " ", q[-1]) + " (voice confirmation, no mover/second recorded)"
        else:
            action = (f"{item}: " if item else "") + (f"Motion: {motion} " if motion else "") + f"Motion by {mover}, second by {sec}."
        tail = " … (full text in the official record)"
        out.append({"item": item.split(" ")[0] if item else "", "action": action if len(action) <= 700 else action[:700 - len(tail)].rsplit(" ", 1)[0] + tail,
                    "tally": f"{res} {y}-{n}" + (f" ({'; '.join(parts)})" if parts else ""), "source": src, "_title": item})
        out[-1]["_key"] = (mover, sec, res, tuple(sorted((k, tuple(sorted(v))) for k, v in votes.items())), len(allv))
    return out

def parse(text, src):
    b = blocks(text, src)
    return b if b and all(b) else None

def date_ok(text, d):
    """the minutes must be for this meeting: its date must appear on page 1"""
    p1 = re.sub(r"\s+", "", text.split("=====PAGE=====")[0]).lower()
    want = re.sub(r"\s+", "", d.strftime("%B %-d, %Y")).lower()
    return want in p1.replace(".", ",") or want.replace(",", "") in p1.replace(",", "").replace(".", "")

def votes_for_pdf(pdf, src, d=None, full_board=True):
    """Two independent OCR passes (200 and 300 dpi). A recorded vote is accepted only if
    (full board: all 12 members accounted for in that pass) or (both passes read the identical mover/second/result/vote lists).
    Every 'Final Resolution' in the document must be accepted, else the meeting stays pending (None)."""
    t2 = ocr_pdf(pdf, f"{pdf}.200.txt", 200)
    if d and not date_ok(t2, d): return None
    # Spot-check 2026-10-30: both passes can agree on a vote list that silently dropped names (read 5-0, page said 9-0),
    # so every recorded vote must account for all 12 members (Yes+No+Abstain+Not Present) in at least one pass.
    full = lambda x: x and x["_key"][4] == 12
    a = blocks(t2, src)
    if a and all(full(x) for x in a): return _clean(a)
    b = blocks(ocr_pdf(pdf, f"{pdf}.300.txt", 300), src)
    if not a or len(a) != len(b): return None
    out = []
    for x, y in zip(a, b):
        if full(x): out.append(x)
        elif full(y): out.append(y)
        else: return None
    return _clean(out)

def _clean(lst):
    for x in lst: x.pop("_key", None)
    return lst

def fcps_ocr_votes(meeting_unique, d, curl, cache, label):
    """find this meeting's own approved-minutes PDF on its BoardDocs agenda and OCR it. Returns (decisions, link) or (None, reason)."""
    if not os.path.exists(OCR_PY): return None, "no-ocr-env"
    B, CID = "https://go.boarddocs.com/vsba/fairfax/Board.nsf", "A9HDX937D70D"
    ag = curl(f"{B}/BD-GetAgenda?open", f"bdag-{meeting_unique}.html", post=f"id={meeting_unique}&current_committee_id={CID}", referer=f"{B}/Public", keep=False)
    t = open(ag, errors="ignore").read() if ag else ""
    items = [i for i in minutes_items(t) if not re.search(r"approv(al|e) of", i[2], re.I)]
    if not items: return None, "no-minutes-item"
    cands = []
    for u, _o, title in items:
        f = curl(f"{B}/BD-GetPublicFiles?open", f"bdpf-{u}.html", post=f"id={u}&current_committee_id={CID}", referer=f"{B}/Public", keep=False)
        for h in re.findall(r'href="([^"]+\.pdf)"', open(f, errors="ignore").read(), re.I) if f else []:
            if approved_file(urllib.parse.unquote(h), title): cands.append(h)
    if not cands: return None, "minutes-not-approved-or-not-posted"
    for h in cands:
        url = "https://go.boarddocs.com" + h if h.startswith("/") else h
        name = "fcpsmin-" + re.sub(r"\W", "_", h.split("/pfiles/")[-1])[:120] + ".pdf"
        pdf = curl(url, name, referer=f"{B}/Public")
        if not pdf: continue
        src = {"label": f"Official approved minutes ({label}, scanned PDF)", "href": url}
        got = votes_for_pdf(pdf, src, d, full_board=not re.search(r"committee|audit|governance|budget", urllib.parse.unquote(h), re.I))
        if got: return got, {"label": f"Official approved minutes ({label}): {urllib.parse.unquote(h.split('/')[-1])}", "href": url}
    return None, "ocr-doubtful-or-date-mismatch"

if __name__ == "__main__":
    print(json.dumps(votes_for_pdf(sys.argv[1], {"label": "test", "href": ""}), indent=1))
