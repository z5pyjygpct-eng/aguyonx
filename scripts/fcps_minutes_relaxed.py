#!/usr/bin/env python3
"""Relaxed-but-defensible bar for FCPS scanned-minutes votes (Scott OK'd 2026-11-10).

Every 'Final Resolution' in the OCR text gets one of three grades:
  A  numbers published   - the motion is identified (item/mover/second or voice vote), the outcome is stated, the vote lists parse cleanly
                           (every name matches a board member, no duplicates) AND the lists account for EVERY member the minutes' own attendance
                           block (nearest 'members present' list before the vote) shows present for that part of the meeting.
                           Members marked Absent are not expected; members marked arr./left may be missing. Full 12-member lists also pass.
                           A name voting while the attendance list says Absent, or a present member missing from the lists, fails (this is the
                           guard that catches a dropped name, e.g. a 9-0 misread as 5-0).
  B  outcome only        - the motion is identified and the minutes state 'Motion Carries/Fails', but the tally cannot be verified. Published
                           as the stated outcome with NO vote count.
  C  unreadable          - not published; counted so the recap can say how many votes were too unclear to read.
OCR passes: 200 dpi first; a vote that is not A in the 200 dpi text is retried on the 300 dpi text (aligned by position).
Meeting level: needs the meeting date on the first two pages, else the whole meeting is flagged unreadable.
"""
import re, os
import fcps_minutes_ocr as fo

LATE = re.compile(r"arr\.|arrived|left|departed|late|early|\bat\s+\d", re.I)


import difflib
_CANON = {}
for _n in fo.MARK:
    _w = _n.split()
    _CANON[_n] = {re.sub(r"[^a-z]", "", _n.lower()), re.sub(r"[^a-z]", "", (_w[0] + _w[-1]).lower())}
for _n in _CANON:
    if not _n.endswith("Anderson"): _CANON[_n].add(re.sub(r"[^a-z]", "", _n.split()[-1].lower()))
_CANON["Sandy Anderson"] |= {"sandybanderson"}
_CANON["Ricardy Anderson"] |= {"ricardyjanderson"}
_CANON["Karl Frisch"] |= {"karlvfrisch"}
_CANON["Rachna Sizemore Heizer"] |= {"rachnasheizer", "rachnassizemoreheizer"}
_CANON["Melanie K. Meren"] |= {"melaniemeren"}
_CANON["Marcia St. John-Cunning"] |= {"marciastjohncunning"}
LBL = r"(Yes|No|Abstain|Recused|Not\W*Present(?:\W*at\W*Vote)?|Away\W*from\W*the\W*Table|Absent)\W*[:;]"
HDR = re.compile(r"^(minutes|fairfax\W*county\W*school\W*board|.{0,6}utherjackson.*|.{0,6}uther\W*jackson.*|gatehouse.*|r[o0]{2}m\W*\d+|page\W.*)$", re.I)
STOP = re.compile(r"^\s*(Motion|Action|Amendment|Category|Item|Final|Main|Follow|Move|The |A motion|\d)", re.I)

import functools
@functools.lru_cache(maxsize=None)
def member_scored(tok):
    t = re.sub(r"(?i)\b(vice\W*chair|chair)\b", " ", tok)
    t = re.sub(r"^[\W_]*(Mr|Ms|Mrs|Dr)\b\.?", "", t.strip(), flags=re.I)
    k = re.sub(r"[^a-z]", "", t.lower().replace("!", "l").replace("1", "l"))
    if len(k) < 4: return 0, None
    sc = sorted(((max(difflib.SequenceMatcher(None, k, f).ratio() for f in forms), n) for n, forms in _CANON.items()), reverse=True)
    if sc[0][0] >= 0.8 and sc[0][0] - sc[1][0] >= 0.05: return sc[0]
    return 0, None

def member_of(tok):
    """fuzzy-match one name token (OCR typos in first names tolerated) to a board member, else None"""
    t = re.sub(r"(?i)\b(vice\W*chair|chair)\b", " ", tok)
    t = re.sub(r"^[\W_]*(Mr|Ms|Mrs|Dr)\b\.?", "", t.strip(), flags=re.I)
    k = re.sub(r"[^a-z]", "", t.lower().replace("!", "l").replace("1", "l"))
    if len(k) < 4: return None
    sc = []
    for n, forms in _CANON.items():
        sc.append((max(difflib.SequenceMatcher(None, k, f).ratio() for f in forms), n))
    sc.sort(reverse=True)
    if sc[0][0] >= 0.8 and sc[0][0] - sc[1][0] >= 0.05: return sc[0][1]
    return None

_SKIP = {"chair", "vice", "and", "mr", "ms", "mrs", "dr", "the", "committee", "member", "members"}
def names_scan(text):
    """members named in free text (commas optional, OCR typos tolerated) -> (members in order, leftover words)"""
    t = re.sub(r"[,;]", " ", text)
    t = re.sub(r"\bDr\W{0,3}(?:R\W{0,3})?Anderson", "Ricardy Anderson", t, flags=re.I)
    t = re.sub(r"\b(?:Ms|Mrs)\W{0,3}(?:S\W{0,3})?Anderson", "Sandy Anderson", t, flags=re.I)
    w = [x for x in re.split(r"\s+", t) if re.sub(r"[^A-Za-z]", "", x)]
    w = [x for x in w if re.sub(r"[^a-z]", "", x.lower()) not in _SKIP]
    out, left, i = [], [], 0
    while i < len(w):
        best = None
        for L in (1, 2, 3, 4):
            if i + L > len(w): continue
            sc, m = member_scored(" ".join(w[i:i + L]))
            if m and (best is None or sc >= best[2] - 1e-9): best = (L, m, sc)
        if best: out.append(best[1]); i += best[0]
        else:
            if len(re.sub(r"[^A-Za-z]", "", w[i])) > 1: left.append(w[i])
            i += 1
    return out, left

def vote_block2(body):
    """OCR-tolerant vote lists -> {label: [members]} or None. Name lists may wrap lines and commas may be missing;
    any unreadable word inside a list rejects the whole vote (that is how a dropped name is caught)."""
    lines = body.split("\n"); secs, cur = {}, None
    for l in lines:
        lm = re.match(r"^\s*" + LBL + r"(.*)$", l, re.I)
        if lm:
            lab = re.sub(r"\W", "", lm[1]).lower()
            lab = {"yes": "Yes", "no": "No", "abstain": "Abstain", "recused": "Recused"}.get(lab, "Not Present at Vote")
            if lab in secs: break
            secs[lab] = lm[2]; cur = lab; continue
        if cur is None:
            if not l.strip() or re.match(r"^\s*Final", l, re.I): continue
            return None
        if not l.strip(): continue
        if HDR.match(l.strip()): continue
        if STOP.match(l): break
        old, _ol = names_scan(secs[cur])
        new, nleft = names_scan(secs[cur] + " " + l)
        if len(new) > len(old) and len(nleft) <= 1: secs[cur] += " " + l
        else: break
    if not secs: return None
    out = {}
    for k, v in secs.items():
        ms, left = names_scan(v)
        if left or (not ms and k == "Yes"): return None
        if ms: out[k] = ms
    # a section's text ending in a dangling comma / hyphen means the list was cut off
    if cur and re.search(r"[,–]\s*$", secs[cur].strip()) : return None
    return out

def parse_attendance(flat, pos, committee=False):
    """members present per the nearest attendance block before pos: {member: 'present'|'absent'|'partial'}"""
    head = [h for h in re.finditer(r"(?im)^.{0,200}\bpresent\b\W{0,3}(?:\(.*\))?\W*$", flat[:pos])
            if not re.search(r"[\d\-\u2013]\s*present", h[0], re.I) and not re.search(r"\b(not|never)\b.*present", h[0], re.I)]
    best = None
    for h in reversed(head):
        lines = []
        for _l in flat[h.end():h.end() + 1500].split("\n"):
            lines += re.split(r"(?<=\))\s+(?=[A-Z])", _l) if _l.count("(") >= 2 else [_l]
        att, extra = {}, {}
        for l in lines[:20]:
            if not l.strip(): continue
            nm = re.sub(r"\(.*$", "", l).strip(" .,")
            par = re.search(r"\((.*)", l)
            par = par[1] if par else ""
            f, r = fo.names_in(nm)
            if len(f) == 1 and (r <= 3 or "(" in l):
                st = "absent" if re.search(r"abs[eo0]n|abs.{1,3}t\b", par, re.I) else ("partial" if LATE.search(par) else "present")
                att[f[0]] = st
            elif att and "(" not in l: break
        if len(att) >= (2 if committee else 11):
            best = att; break
        if len(head) - head.index(h) > 30: break
    if best: return best
    # prose form: 'with the following Board Members present: Dr. Anderson, Mr. Frisch, ... Ms. Dixit, Mr. Dunne were absent.'
    for m in reversed(list(re.finditer(r"(?is)members?\W{0,3}present\W{0,3}(.{20,450})", flat[:pos]))):
        seg = re.sub(r"\b(Dr|Mr|Ms|Mrs)\.", r"\1", re.sub(r"\bSt\.", "St", m[1]))
        seg = re.sub(r"\s+", " ", seg)
        sents = re.split(r"(?<=[a-z])\.\s+(?=[A-Z])", seg)
        att = {}
        for k, snt in enumerate(sents[:3]):
            st = "absent" if re.search(r"abs[eo0]nt", snt, re.I) else ("present" if k == 0 else None)
            if st is None: continue
            for tok in re.split(r",|\band\b", snt):
                f, r = fo.names_in(tok)
                if not f:
                    sc, mm = member_scored(re.sub(r"^\W*(Mr|Ms|Mrs|Dr)\b", "", tok.strip()))
                    f, r = ([mm], 0) if mm else ([], 0)
                if len(f) == 1 and r <= 14: att[f[0]] = st
        if len(att) >= (2 if committee else 11): return att
    return None

def doc_extras(flat):
    """committee community members from 'following ... members present' blocks: {name: [marker]}"""
    extra = {}
    for m in re.finditer(r"following\W+(?:Board|Committee)?\W*members\W+present\W*\n([\s\S]{5,900}?)\n\s*(?:Also\b|Board members not|Staff|Item|\d\.\d|Motion)", flat, re.I):
        for l in m[1].split("\n"):
            if re.search(r"absent", l, re.I): continue
            nm = re.sub(r"\(.*$", "", l).strip(" .,")
            cm = re.match(r"^([A-Z][a-z]+)\s+([A-Z][A-Za-z'\-]{3,})$", nm)
            if cm and re.search(r"community|citizen|member", l, re.I) and not fo.names_in(nm)[0]:
                extra[nm] = [cm[2].lower()]
    return extra

def analyze(text, src, extra=None, committee=False):
    """list of per-Final-Resolution dicts: {grade A/B/C, decision (or None), reason, nvote, ...}"""
    flat = fo._flat(text)
    extra = extra if extra is not None else doc_extras(flat)
    added = []
    for n in extra:
        w = n.split()
        _CANON[n] = {re.sub(r"[^a-z]", "", n.lower()), re.sub(r"[^a-z]", "", w[-1].lower())}; added.append(n)
    member_scored.cache_clear()
    try:
        return fo._with_extra(extra, lambda: _analyze(flat, src, committee))
    finally:
        for n in added: _CANON.pop(n, None)
        member_scored.cache_clear()

class _FR:
    """A Final Resolution line, or a bare Motion Carries/Fails the clerk wrote without that prefix."""
    def __init__(self, start, end, text):
        self._start, self._end, self._t = start, end, text
    def start(self): return self._start
    def end(self): return self._end
    def __getitem__(self, i):
        if i == 1: return self._t
        raise IndexError

def _finals(flat):
    out = []
    for m in re.finditer(r"^\W*Final\W*Resolution\W*(.*)$", flat, re.I | re.M):
        out.append(_FR(m.start(), m.end(), m[1]))
    for m in re.finditer(r"^\W*(Motion\W*(?:Carries|Fails))\W*$", flat, re.I | re.M):
        prefix = flat[max(0, m.start()-80):m.start()]
        if re.search(r"Final\W*Resolution\W*:?\s*$", prefix, re.I):
            continue
        out.append(_FR(m.start(), m.end(), m[1]))
    out.sort(key=lambda x: x.start())
    return out

def _analyze(flat, src, committee=False):
    fins = _finals(flat)
    out, prev = [], 0
    for fi, f in enumerate(fins):
        before = flat[prev:f.start()]; prev = f.end()
        nxt = fins[fi + 1].start() if fi + 1 < len(fins) else len(flat)
        lines = before.rstrip().split("\n"); tail = "\n".join(lines[-8:])
        mover = sec = None
        mm = list(re.finditer(r"Motion\W*by\W*(.+?),?\W*second(?:ed)?\W*by\W*(.+?)\W*$", tail, re.I | re.M))
        if mm: mover, sec = (fo.names_in(mm[-1][1])[0] or [None])[0], (fo.names_in(mm[-1][2])[0] or [None])[0]
        else:
            mv = re.findall(r"(?:Mover?|Motion\s*by)\W*(.+?)(?:\s+Second\b|$)", tail, re.I | re.M)
            sc = re.findall(r"Second(?:ed)?(?:\s*by)?\W*(.+?)$", tail, re.I | re.M)
            if mv and sc: mover, sec = (fo.names_in(mv[-1])[0] or [None])[0], (fo.names_in(sc[-1])[0] or [None])[0]
        consent = bool(re.search(r"All\W*those\W*in\W*favor", tail, re.I)) and not (mover or sec)
        res = re.sub(r"(?i)motion\W*carries", "Motion Carries", re.sub(r"(?i)motion\W*fails", "Motion Fails", f[1].strip(" .:")))
        its = re.findall(r"^.{0,40}?\b(?:Item|Action)\W{0,3}(\d{1,2}\.[0-9oO]{1,2})\W*(.{3,160})$", flat[:f.start()], re.I | re.M)
        item = f"{its[-1][0].replace('o','0').replace('O','0')} {its[-1][1].strip()}" if its else ""
        mt = re.findall(r"(?:Motion|Amendment|Follow-on motion|Main motion)[^:\n]{0,24}:\s*([\s\S]{5,1500}?)(?=\n.*?(?:Motion\W*by|Mover|Final))", before, re.I)
        motion = re.sub(r"\s+", " ", mt[-1]).strip() if mt else ""
        d = {"grade": "C", "decision": None, "reason": "", "item": item, "pos": f.start()}
        out.append(d)
        if not re.match(r"Motion (Carries|Fails)$", res): d["reason"] = "outcome not readable"; continue
        if not item and not motion: d["reason"] = "motion not identifiable"; continue
        if not (mover or sec or consent) and not item: d["reason"] = "mover/second not readable"; continue
        votes = vote_block2(flat[f.end():nxt][:1200].lstrip("\n"))
        who = (f"{mover}" if mover else "?")
        if consent:
            q = re.findall(r"(All\W*those\W*in\W*favor[^?]*\?)", tail, re.I)
            action = (f"{item}: " if item else "") + re.sub(r"\s+", " ", q[-1]) + " (voice confirmation, no mover/second recorded)"
        else:
            mv = (f"Motion by {mover}" + (f", second by {sec}." if sec else ".")) if mover else (f"Second by {sec}." if sec else "(no mover recorded in the minutes)")
            action = (f"{item}: " if item else "") + (f"Motion: {motion} " if motion else "") + mv
        ell = " … (full text in the official record)"
        action = action if len(action) <= 700 else action[:700 - len(ell)].rsplit(" ", 1)[0] + ell
        base = {"item": item.split(" ")[0] if item else "", "action": action, "source": src, "_title": item}
        d["decision_b"] = dict(base, tally=f"{res} (vote count not read reliably from the scanned minutes; see official minutes)")
        d["grade"] = "B"
        d["res"] = res
        if not votes or not votes.get("Yes"):
            d["reason"] = "vote list not readable" if not votes else "no yes list"
            if votes is not None and not votes.get("Yes") and res == "Motion Fails" and votes.get("No"):
                pass
            continue
        allv = sum(votes.values(), [])
        if len(set(allv)) != len(allv) or len(allv) > 13:
            d["reason"] = "duplicate/extra names"; continue
        att = parse_attendance(flat, f.start(), committee)
        nv = len(allv)
        ok, why = False, ""
        if nv == 12 and not (att and any(att.get(m) == "absent" and m in votes.get("Yes", []) + votes.get("No", []) + votes.get("Abstain", []) for m in allv)):
            ok = True
        elif att:
            absent_voting = [m for m in allv if att.get(m) == "absent" and m not in votes.get("Not Present at Vote", [])]
            definite = [m for m, s in att.items() if s == "present"]
            missing = [m for m in definite if m not in allv]
            extra_names = [m for m in allv if m not in att]
            if absent_voting: why = "absent member listed as voting"
            elif missing: why = "present member(s) missing from tally: " + ", ".join(missing)
            elif extra_names: why = "tally names not on attendance list: " + ", ".join(extra_names)
            else: ok = True
        else: why = "no attendance list and fewer than 12 accounted"
        if not ok: d["reason"] = why; continue
        y, n = len(votes.get("Yes", [])), len(votes.get("No", []))
        parts = [f"{k}: {', '.join(v)}" for k, v in votes.items() if v and k != "Yes"]
        d["grade"] = "A"
        d["decision"] = dict(base, tally=f"{res} {y}-{n}" + (f" ({'; '.join(parts)})" if parts else ""))
        d["key"] = (res, tuple(sorted((k, tuple(sorted(v))) for k, v in votes.items())))
    if committee or len(fins) <= 1: out += _analyze_roll(flat, src, committee, [f.start() for f in fins])
    out.sort(key=lambda x: x["pos"])
    return out

def _analyze_roll(flat, src, committee, fin_pos):
    """Committee style: 'Motion: ... Move: X Second: Y' then a bare 'Yes: ...' roll call with no 'Final Resolution' line.
    The minutes do not state an outcome word, so only the verified roll call is published ('Roll call: Yes n, No n'); never grade B."""
    out = []
    rolls = [m for m in re.finditer(r"(?im)^\W*(?:Yes\W*:\s*)+", flat)]
    prev_end = 0
    for m in rolls:
        before_txt = flat[max(0, m.start() - 160):m.start()]
        if re.search(r"Final\W*Resolution", before_txt, re.I) and any(0 < m.start() - fp < 200 for fp in fin_pos): continue
        ctx = flat[prev_end:m.start()]
        prev_end = m.end()
        mt = list(re.finditer(r"Motion\W*:\s*([\s\S]{5,900}?)(?=\n\s*(?:Move|Moved|Second|Approved|Yes)\b|\Z)", ctx, re.I))
        motion = re.sub(r"\s+", " ", mt[-1][1]).strip() if mt else ""
        mv = re.findall(r"Move[d]?\W*(.+?)(?:\s+Second\b|$)", ctx[-300:], re.I | re.M)
        sc = re.findall(r"Second(?:ed)?\W*(.+?)$", ctx[-300:], re.I | re.M)
        mover = (names_scan(mv[-1])[0] or [None])[0] if mv else None
        sec = (names_scan(sc[-1])[0] or [None])[0] if sc else None
        its = re.findall(r"^.{0,40}?\b(?:Item|Action)\W{0,3}(\d{1,2}\.[0-9oO]{1,2})\W*(.{3,160})$", flat[:m.start()], re.I | re.M)
        item = f"{its[-1][0].replace('o','0').replace('O','0')} {its[-1][1].strip()}" if its else ""
        d = {"grade": "C", "decision": None, "reason": "", "item": item, "pos": m.start()}
        out.append(d)
        if not motion: d["reason"] = "motion not identifiable"; continue
        votes = vote_block2("Yes:" + flat[m.end():m.end() + 900])
        if not votes or not votes.get("Yes"): d["reason"] = "vote list not readable"; continue
        allv = sum(votes.values(), [])
        if len(set(allv)) != len(allv): d["reason"] = "duplicate names"; continue
        att = parse_attendance(flat, m.start(), True)
        if not att: d["reason"] = "no attendance list"; continue
        absent_voting = [x for x in allv if att.get(x) == "absent"]
        missing = [x for x in att if att[x] == "present" and x not in allv]
        extra = [x for x in allv if x not in att]
        if absent_voting or missing or extra:
            d["reason"] = "tally does not match attendance: " + "; ".join(filter(None, ["absent listed: " + ", ".join(absent_voting) if absent_voting else "", "missing: " + ", ".join(missing) if missing else "", "not on list: " + ", ".join(extra) if extra else ""])); continue
        y, n = len(votes.get("Yes", [])), len(votes.get("No", []))
        parts = [f"{k}: {', '.join(v)}" for k, v in votes.items() if v and k != "Yes"]
        who = (f"Move: {mover}" + (f", second: {sec}." if sec else ".")) if mover else ""
        action = (f"{item}: " if item else "") + f"Motion: {motion} " + who
        ell = " … (full text in the official record)"
        action = action.strip()
        action = action if len(action) <= 700 else action[:700 - len(ell)].rsplit(" ", 1)[0] + ell
        d["grade"] = "A"
        d["decision"] = {"item": item.split(" ")[0] if item else "", "action": action, "source": src, "_title": item,
                         "tally": f"Roll call: Yes {y}, No {n}" + (f" ({'; '.join(parts)})" if parts else "") + " (outcome not stated in the minutes)"}
    return out

def date_ok_relaxed(text, d):
    pages = text.split("=====PAGE=====")[:2]
    t = " ".join(pages)
    flat = re.sub(r"\s+", "", t).lower().replace("o2", "02").replace(".", ",")
    want = re.sub(r"\s+", "", d.strftime("%B %-d, %Y")).lower()
    want_pad = re.sub(r"\s+", "", d.strftime("%B %d, %Y")).lower()  # "May 07, 2026"
    w2 = want.replace(",", "")
    alt = flat.replace(",", "")
    # tolerate OCR 0/o, 1/l/i confusion inside the numeric parts only
    def norm(s): return s.replace("o", "0").replace("l", "1").replace("i", "1").replace("!", "1")
    if want in flat or w2 in alt or want_pad in flat or want_pad.replace(",", "") in alt:
        return True
    mo = d.strftime("%B").lower()
    for m in re.finditer(re.escape(mo) + r"([0-9oOlI!]{1,2}),?([0-9oOlI!]{4})", alt, re.I):
        day = norm(m[1].lower()).lstrip("0") or "0"
        if day == str(d.day) and norm(m[2].lower()) == str(d.year): return True
    return False

def relaxed_for_text(t200, t300, src, d, committee=False):
    """-> (decisions, stats) or (None, reason). stats: total, A, B, C, reasons"""
    if d and not date_ok_relaxed(t200, d): return None, "date-not-found-on-first-pages"
    a = analyze(t200, src, committee=committee)
    if not a: return None, "no-recorded-votes-found"
    b = analyze(t300, src, committee=committee) if t300 is not None and any(x["grade"] != "A" for x in a) else None
    final = []
    for i, x in enumerate(a):
        y = b[i] if b and len(b) == len(a) and b[i]["item"] == x["item"] else None
        pick = x
        if x["grade"] != "A" and y and y["grade"] == "A": pick = y
        elif x["grade"] != "A" and y and y["grade"] == "B" and x["grade"] == "C": pick = y
        final.append(pick)
    return final, None

def summarize(final):
    dec, st = [], {"total": len(final), "A": 0, "B": 0, "C": 0, "reasons": []}
    for x in final:
        st[x["grade"]] += 1
        if x["grade"] == "A": dec.append(x["decision"])
        elif x["grade"] == "B": dec.append(x["decision_b"]); st["reasons"].append((x["item"], x["reason"]))
        else: st["reasons"].append((x["item"], x["reason"]))
    return dec, st
