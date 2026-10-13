"""
Shared, conservative transcript timing for recap moments (all non-Loudoun venues).

Agenda items come ONLY from the official agenda. This module only finds WHEN an official
agenda item was taken up, by locating the transcript segment where the chair/presenter
introduces it. Rules (no guessing):
  - items are searched in official agenda order; each match must come after the previous one
  - the segment itself must contain a transition cue ("next item", "move on to",
    "item 3.1", "welcome", "public comment", ...)
  - >= 2 (and >= 50%) of the item's distinctive words must follow that cue within ~160 characters
    (or the item number is spoken next to the cue plus one title word); a segment that announces a different agenda section number is rejected
Unmatched items get no moment. Labels are the official agenda titles.
"""
import re

STOP = set("""the of and for a an to in on with by from at as is be this that city fairfax council board school schools
meeting regular special consideration discussion update updates presentation resolution ordinance approval approve item items
public hearing introduction amending pertaining section chapter article virginia code dr mr ms mrs report reports
albemarle county division action info information other business new old staff our your their will fy
work session january february march april june july august september october november december""".split())
SKIP = re.compile(r"^(call (the )?(special |regular )?meeting to order|call to order|pledge|moment of silence|roll call|adjourn|recess|reconvene|meeting opening|opening activities|closed (meeting|session)( certification)?|certification)", re.I)
CUE = re.compile(r"\b(next (item|up|on (the|our) agenda|we have|is)|move (on )?(to|into)|moving (on )?to|turn(ing)? (it )?(over )?to|item (number )?\d|agenda item|public (comment|hearing)|community (comment|input)|citizen participation|i('ll| will) (now )?(open|call))", re.I)


def kw(title):
    t = re.sub(r"\(.*?\)", " ", title)
    t = re.sub(r"\b(Mr|Ms|Mrs|Dr)\.?\s+[A-Z][\w'-]+(\s+[A-Z][\w'-]+)?", " ", t)  # presenter names
    w = [x for x in re.findall(r"[A-Za-z][A-Za-z\-']{3,}", t.lower()) if x not in STOP]
    return list(dict.fromkeys(w))[:10]


SPOKEN_NUM = re.compile(r"(?<![\d.$])(\d{1,2}\.\d{1,2})(?![\d%])")


def find_item_times(segs, items, start_after=0):
    """items: list of (num, title). Returns {(num, title): seconds} for items confidently located."""
    out, after, i0 = {}, start_after, 0
    for num, title in items:
        if SKIP.match(title):
            continue
        words = kw(title)
        numre = re.compile(r"(?<![\d.])" + re.escape(num) + r"(?![\d])") if re.match(r"^\d+\.\d+$", num) else None
        need = max(2, round(0.5 * len(words))) if words else 99
        hit = None
        for i in range(i0, len(segs)):
            s = segs[i]
            if s["start"] <= after:
                continue
            own = s["text"].lower()
            # the segment announces a DIFFERENT agenda number -> it is about that item, not this one
            spoken = [x for x in SPOKEN_NUM.findall(own) if int(x.split(".")[0]) <= 20]
            if "." in num and spoken and not any(x.split(".")[0] == num.split(".")[0] for x in spoken):
                continue
            cues = list(CUE.finditer(own))
            if not cues:
                continue
            # keywords must follow the announcement closely ("next item ... <title words>")
            # ...the title's leading distinctive word must be among them, and the matched words must
            # appear in title order (blocks stray hits like "board consent ... agenda")
            def in_order(win):
                pos, n = -1, 0
                for w in words:
                    j = win.find(w, pos + 1)
                    if j > pos:
                        pos, n = j, n + 1
                return n if words and words[0] in win else 0
            n_after = max(in_order(own[c.start():c.end() + 160]) for c in cues)
            spoke_num = bool(numre and any(numre.search(own[max(0, c.start() - 40):c.end() + 60]) for c in cues))
            if n_after >= need or (spoke_num and n_after >= 1) or (spoke_num and not words):
                hit = i
                break
            if s["start"] - after > 3 * 3600:
                break
        if hit is not None:
            t = int(segs[hit]["start"])
            out[(num, title)] = t
            after, i0 = t, hit + 1
    return out


def label_of(title):
    lab = re.sub(r"\s*\((Persons|Speakers|Those|The) [^)]*\)?.*$", "", title, flags=re.I).strip() or title
    if lab.isupper():
        lab = lab.title()
    return lab if len(lab) <= 140 else lab[:137].rstrip() + "…"
