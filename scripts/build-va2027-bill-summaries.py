#!/usr/bin/env python3
"""Draft plain-language summaries from official LIS title + summary_plain only."""
from __future__ import annotations

import json, re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "src/content/virginia-2027-bills.json"
OUT = ROOT / "src/lib/va2027-bill-summaries.json"
TODAY = date.today().isoformat()

VERB3 = {
    "directs": "direct", "requires": "require", "provides": "provide",
    "amends": "amend", "establishes": "establish", "creates": "create",
    "repeals": "repeal", "replaces": "replace", "eliminates": "eliminate",
    "prohibits": "prohibit", "authorizes": "allow", "allows": "allow",
    "permits": "allow", "designates": "name", "removes": "remove",
    "increases": "increase", "decreases": "decrease", "expands": "expand",
    "reduces": "reduce", "adds": "add", "changes": "change",
    "clarifies": "clarify", "raises": "raise", "lowers": "lower",
    "exempts": "exempt", "imposes": "impose", "appropriates": "appropriate",
    "allocates": "allocate", "renames": "rename", "abolishes": "abolish",
    "limits": "limit", "extends": "extend", "shortens": "shorten",
    "delays": "delay", "suspends": "suspend", "terminates": "terminate",
    "makes": "make", "sets": "set", "grants": "grant", "denies": "deny",
    "defines": "define", "includes": "include", "excludes": "exclude",
    "requests": "ask", "states": "state", "specifies": "specify",
    "authorises": "allow", "places": "place", "recognizes": "recognize",
    "restores": "restore", "enumerates": "enumerate", "alters": "alter",
    "discontinues": "discontinue", "conforms": "conform", "awards": "award",
    "updates": "update", "narrows": "narrow", "instructs": "instruct",
    "delineates": "delineate", "enhances": "enhance", "codifies": "codify",
    "adjusts": "adjust", "applies": "apply", "sunsets": "sunset",
    "leaves": "leave", "contains": "contain",
}

ACTION = re.compile(r"\b(" + "|".join(sorted(VERB3)) + r")\b", re.I)

# Official-source hand drafts for short-but-complete LIS summaries (and SB852).
HAND = {
    "SB852": (
        "This bill would have Virginia's Department of Environmental Quality suspend the state's participation in the Regional Greenhouse Gas Initiative, also called RGGI. "
        "It would repeal the Virginia Clean Energy and Community Flood Preparedness Act. "
        "The state would send money collected under a market-based trading program consistent with RGGI to electric utilities that have been recovering the cost of emissions allowances through a rate adjustment clause, or that have otherwise raised customer bills to cover those costs. "
        "Those utilities would then give that money back to their customers in Virginia as a credit."
    ),
    "HB1299": (
        "This bill would say that 'shall,' as used in the Code of Virginia, establishes a mandatory requirement and is not merely directory, unless the statute explicitly provides otherwise. "
        "The official summary says the bill responds to the holding in Henderson v. Commonwealth, 77 Va. App. 250 (2023). "
        "In that case, the Court of Appeals held that when the General Assembly uses 'shall' in a statute commanding action by a public official or public body, such usage is directory and not mandatory."
    ),
    "HB1456": (
        "This bill covers several government-efficiency topics listed in the official LIS summary, including agency reporting requirements, healthcare financing reform, an Interagency Health Financing Task Force, and a managed care organization performance review. "
        "The official heading list also includes housing regulatory review, procurement reform, technology consolidation, real property management, personnel efficiency, and a federal funding contingency. "
        "It would establish a Joint Subcommittee on Government Efficiency and addresses data integration and transparency. "
        "The official LIS summary lists those headings but does not explain the details, so readers should check the official bill text."
    ),
    "HB1521": (
        "This bill is about digital innovation and infrastructure. "
        "According to the official LIS summary, it would establish rights in digital property and technology resources and require risk management policies for critical infrastructure facilities controlled by critical artificial intelligence systems. "
        "The official heading list also includes providing safe harbors, preempting local regulation, and providing for enforcement and remedies. "
        "The official LIS summary lists those points but does not explain the details, so readers should check the official bill text."
    ),
    "SB684": (
        "This bill would establish the Virginia Recycling Development Center and the Virginia Recycling Infrastructure Fund. "
        "According to the official LIS summary, it would support statewide recycling infrastructure, incentivize voluntary stewardship programs, and authorize public-private partnerships. "
        "It would also address priority materials including waste tires, mattresses, and bulky waste. "
        "The official LIS summary lists those points but does not explain the details, so readers should check the official bill text."
    ),
    "HB152": (
        "This bill would name little bluestem (Schizachyrium scoparium) as Virginia's official state grass. "
        "That would be added to the state's official emblems and designations. "
        "The official LIS summary does not say more than that."
    ),
    "HB856": (
        "This bill would name shelter pets as Virginia's official state pet. "
        "That would be added to the state's official emblems and designations. "
        "The official LIS summary does not say more than that."
    ),
    "SB155": (
        "This bill would name the brown-belted bumblebee (Bombus griseocollis) as Virginia's official state native pollinator. "
        "That would be added to the state's official emblems and designations. "
        "The official LIS summary does not say more than that."
    ),
    "SB300": (
        "This bill would name the peanut as Virginia's official state snack. "
        "That would be added to the state's official emblems and designations. "
        "The official LIS summary does not say more than that."
    ),
    "HJ17": (
        "This resolution would extend state recognition to the Wolf Creek Cherokee Tribe of Virginia. "
        "The recognition would apply within Virginia. "
        "The official LIS summary does not say more than that."
    ),
    "HJ22": (
        "This resolution would name April 27 as Birthplace of American Cuisine Day in Virginia. "
        "That designation would apply in 2026 and in each succeeding year. "
        "The official LIS summary does not say more than that."
    ),
    "HJ46": (
        "This resolution would name the week of the fourth Monday in January as Winter Salt Week in Virginia. "
        "That designation would apply in 2027 and in each succeeding year. "
        "The official LIS summary does not say more than that."
    ),
    "HJ73": (
        "This resolution would name April 24 to April 30 as Christian Heritage Week in Virginia. "
        "That designation would apply in 2026 and in each succeeding year. "
        "The official LIS summary does not say more than that."
    ),
    "HB1497": (
        "This bill is about recognizing and restoring Hampton University's status as a land-grant university. "
        "It would also establish a Hampton University Land-Grant Restoration Fund and set requirements. "
        "The official LIS summary lists those headings but does not explain the details, so readers should check the official bill text."
    ),
}

# Title-only or heading-only official rows: leave pending unless official bill text is stored later.
FORCE_PENDING = {
    "HB1315", "HB1520", "SB708", "SB709", "SB710", "SB811", "SB821", "SB829", "SB833",
}


def norm(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"&amp;", "&", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def strip_title_echo(summary: str, title: str) -> str:
    s = norm(summary)
    t = norm(title)
    for echo in (t, t.rstrip("."), re.sub(r",", "", t)):
        if echo and s.lower().startswith(echo.lower()):
            s = s[len(echo):].lstrip(" .;:")
            break
    return s


ABBREV_MARK = {
    "a.m.": "⟦AM⟧", "p.m.": "⟦PM⟧", "A.M.": "⟦AM⟧", "P.M.": "⟦PM⟧",
    "U.S.": "⟦US⟧", "Va.": "⟦VA⟧", "vs.": "⟦VS⟧", "etc.": "⟦ETC⟧",
    "Inc.": "⟦INC⟧", "Jr.": "⟦JR⟧", "Sr.": "⟦SR⟧", "Dr.": "⟦DR⟧",
    "Mr.": "⟦MR⟧", "Ms.": "⟦MS⟧", "Gen.": "⟦GEN⟧", "St.": "⟦ST⟧",
    "No.": "⟦NO⟧", "App.": "⟦APP⟧",
}

def mask_abbrev(s: str) -> str:
    for k, v in ABBREV_MARK.items():
        s = s.replace(k, v)
    return s

def unmask_abbrev(s: str) -> str:
    for k, v in ABBREV_MARK.items():
        s = s.replace(v, k)
    return s

def is_heading(sent: str) -> bool:
    s = sent.strip().rstrip(".")
    if re.match(r"^(The bill|This |It |Under )\b", s, re.I):
        return False
    if lead_verb_base(s.split()[0] if s else ""):
        return False
    words = s.split()
    # Official LIS short title / topic line: semicolon heading with no leading verb.
    if ";" in s and not ACTION.search(s.split(";")[0]) and len(words) <= 20:
        return True
    if s.count(";") >= 2 and not ACTION.search(" ".join(words[:5])):
        return True
    # Short verb-less label, e.g. "Authority of fire marshals."
    if len(words) <= 12 and not ACTION.search(s):
        return True
    return False

def split_sents(text: str) -> list[str]:
    text = mask_abbrev(norm(text))
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text)
    out = []
    for p in parts:
        p = unmask_abbrev(p.strip())
        if not p:
            continue
        chunks = re.split(
            r"(?:,?\s+and provides that\s+|;\s+(?=(?:requires|provides|directs|prohibits|allows|authorizes|establishes|creates|defines|adds|removes|exempts|imposes|requests)\b))",
            p,
            flags=re.I,
        )
        for i, c in enumerate(chunks):
            c = c.strip(" ;")
            if not c:
                continue
            if i > 0 and not ACTION.search(c.split()[0] if c else ""):
                if not c.lower().startswith(("provides", "requires", "the bill", "this")):
                    c = "The bill provides that " + c[0].lower() + c[1:]
            if c not in out:
                out.append(c)
    return out


def protect(s: str) -> str:
    s = re.sub(r"attorney for the Commonwealth", "⟦ATTY_C⟧", s, flags=re.I)
    s = re.sub(r"Commonwealth's [Aa]ttorney", "⟦ATTY_CS⟧", s)
    return s


def unprotect(s: str) -> str:
    return s.replace("⟦ATTY_C⟧", "attorney for the Commonwealth").replace("⟦ATTY_CS⟧", "Commonwealth's attorney")


def lead_verb_base(word: str) -> str | None:
    w = re.sub(r"[,;:]$", "", (word or "").lower())
    return VERB3.get(w)


def replace_modal(s: str) -> str:
    """Replace shall/will outside quotation marks only."""
    parts = re.split(r"('(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\")", s)
    out = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            out.append(part)
            continue
        part = re.sub(r"\bshall not\b", "would not", part, flags=re.I)
        part = re.sub(r"\bshall\b", "would", part, flags=re.I)
        part = re.sub(r"\bwill\b", "would", part, flags=re.I)
        out.append(part)
    return "".join(out)


def simplify(sent: str) -> str | None:
    s = protect(norm(sent))
    if is_heading(s):
        return None
    s = re.sub(r"^(?:The|This)\s+bill\s+(?:also\s+|further\s+|then\s+)?", "", s, flags=re.I)
    s = re.sub(r"^This (?:act|resolution)\s+", "", s, flags=re.I)
    s = re.sub(r"^Finally,\s+", "", s, flags=re.I)
    s = re.sub(r"^Notwithstanding the foregoing,\s+", "", s, flags=re.I)
    s = replace_modal(s)
    s = re.sub(r"\bpursuant to\b", "under", s, flags=re.I)
    s = re.sub(r"\bthe Commonwealth\b", "Virginia", s)
    s = re.sub(r"\bCommonwealth's\b", "Virginia's", s)
    s = unprotect(s)

    if re.match(r"^(This bill|This resolution|It |Under current law|Under the bill|In conducting|Persons who|Any person|A violation)\b", s):
        pass
    elif re.match(r"^This (?!bill|resolution)\w+", s):
        s = re.sub(r"\bapplies\b", "would apply", s, flags=re.I)
        if not s.lower().startswith("this bill"):
            s = "The official summary says that " + s[0].lower() + s[1:]
    elif re.match(r"^has an? (delayed effective|expiration) ", s, re.I):
        s = "This bill would have " + re.sub(r"^has ", "", s, flags=re.I)
    elif re.match(r"^contains ", s, re.I):
        s = "This bill also " + s[0].lower() + s[1:] if False else "This bill also " + s
        s = re.sub(r"This bill also contains", "This bill also contains", s)
    elif re.match(r"^is a recommendation\b", s, re.I):
        s = "This " + s
    elif re.match(r"^does not\b", s, re.I):
        s = "This bill " + s
    elif re.match(r"^also ", s, re.I):
        rest = s[5:]
        first = rest.split()[0] if rest else ""
        base = lead_verb_base(first)
        if base:
            s = f"It would also {base} " + rest[len(first):].lstrip()
        else:
            s = "This bill also " + rest
    elif re.match(r"^these changes include\b", s, re.I):
        s = "Those changes include " + s.split("include", 1)[1].lstrip()
    else:
        first = s.split()[0] if s else ""
        base = lead_verb_base(first)
        if first.lower() in {"does", "is", "are"}:
            s = "This bill " + s[0].lower() + s[1:]
        elif base:
            rest = s[len(first):].lstrip()
            if first.lower() == "provides" and rest.lower().startswith("that "):
                s = "This bill says that " + rest[5:]
            elif first.lower() == "provides" and rest.lower().startswith("for "):
                s = "This bill would provide for " + rest[4:]
            else:
                s = f"This bill would {base} {rest}"
        elif re.match(r"^(sunsets|applies|updates|delineates|instructs|enhances|only affects|current law)\b", s, re.I):
            word = s.split()[0]
            base2 = lead_verb_base(word) or word.lower().rstrip("s")
            rest = s[len(word):].lstrip()
            if word.lower() == "current":
                s = "Current " + s[8:] if s.lower().startswith("current ") else "This bill " + s[0].lower() + s[1:]
            elif word.lower().startswith("only"):
                s = "This bill only " + s[5:]
            else:
                s = f"This bill would {base2} {rest}"
        elif ACTION.search((s.split(",")[0] if s else "")):
            # Don't prefix headings or sentences already in mid-thought
            if not is_heading(s):
                s = "This bill would " + s[0].lower() + s[1:]
                s = re.sub(
                    r"^This bill would (" + "|".join(map(re.escape, VERB3)) + r")\b",
                    lambda m: "This bill would " + VERB3[m.group(1).lower()],
                    s,
                    flags=re.I,
                )

    s = re.sub(r"This bill would this bill would", "This bill would", s, flags=re.I)
    s = re.sub(r"This bill would the bill ", "This bill would ", s, flags=re.I)
    s = re.sub(r"It would the bill ", "It would ", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip()
    if not s:
        return None
    if s[0].islower():
        s = s[0].upper() + s[1:]
    if s[-1] not in ".!?":
        s += "."
    return s


def later(s: str) -> str:
    s = re.sub(r"^This bill would", "It would", s)
    s = re.sub(r"^This bill says", "It says", s)
    s = re.sub(r"^This resolution would", "It would", s)
    return s


def too_thin(title: str, summary: str) -> bool:
    body = strip_title_echo(summary, title)
    words = body.split()
    sents = [x for x in split_sents(body) if not is_heading(x)]
    action_sents = [x for x in sents if ACTION.search(x) or len(x.split()) >= 18]
    if action_sents and len(words) >= 12:
        return False
    if len(words) >= 30:
        return False
    return True


def count_sents(text: str) -> list[str]:
    return split_sents(text)


def topic_ok(topic: str) -> bool:
    if not topic or len(topic) < 8:
        return False
    if "." in topic or "&" in topic:
        return False
    if topic.count(" ") <= 1 and len(topic) < 20:
        return False
    return True


def draft(title: str, summary: str) -> str | None:
    body = strip_title_echo(summary, title)
    if too_thin(title, summary):
        return None
    raw_sents = [s for s in split_sents(body) if not is_heading(s)]
    if not raw_sents:
        raw_sents = [s for s in split_sents(summary) if not is_heading(s)] or []
    plain = []
    for sent in raw_sents:
        if not sent or sent.lower().startswith("be it enacted"):
            continue
        t = simplify(sent)
        if t and t not in plain:
            plain.append(t)
        if len(plain) == 5:
            break
    if not plain:
        return None
    if len(plain) == 1:
        topic = title.split(";")[0].strip().rstrip(".")
        only = plain[0]
        if topic_ok(topic) and topic.lower() not in only.lower():
            opener = f"This bill is about {topic[0].lower() + topic[1:]}."
            if opener not in only:
                plain.insert(0, opener)
        if len(plain) < 3:
            plain.append("The official LIS summary does not say more than that.")
        if len(plain) < 3:
            plain.append("Readers can use the official links below for the exact wording.")
    elif len(plain) == 2:
        plain.append("The official LIS summary does not add further detail beyond those points.")
    plain = plain[:5]
    if len(plain) < 3:
        return None
    out = [plain[0]] + [later(s) for s in plain[1:]]
    text = " ".join(out)
    text = re.sub(r"(?<!')\bwill\b(?!')", "would", text)
    text = re.sub(r"\s+", " ", text).strip()
    # Agreement cleanup
    def fix_would(m):
        w = m.group(2)
        return m.group(1) + " " + (VERB3.get(w, w[:-1] if w.endswith("s") and w in VERB3 or w in VERB3 else w))
    # safer agreement: only known 3sg verbs
    text = re.sub(
        r"\b((?:It|This bill) would) (" + "|".join(map(re.escape, VERB3)) + r")\b",
        lambda m: m.group(1) + " " + VERB3[m.group(2).lower()],
        text,
        flags=re.I,
    )
    return text


def main():
    ledger = json.loads(LEDGER.read_text())
    bills = list(ledger.get("new_filings") or []) + list(ledger.get("continued") or [])
    catalog = {}
    ok = pending = 0
    for b in bills:
        bid = b["bill_number"]
        title, official = b.get("title") or "", b.get("summary_plain") or ""
        if bid in FORCE_PENDING:
            catalog[bid] = {"summary": "", "status": "pending", "sourceUsed": "", "generatedAt": TODAY}
            pending += 1
            continue
        if bid in HAND:
            catalog[bid] = {"summary": HAND[bid], "status": "ok", "sourceUsed": "lis-summary", "generatedAt": TODAY}
            ok += 1
            continue
        text = draft(title, official)
        if text:
            catalog[bid] = {"summary": text, "status": "ok", "sourceUsed": "lis-summary", "generatedAt": TODAY}
            ok += 1
        else:
            catalog[bid] = {"summary": "", "status": "pending", "sourceUsed": "", "generatedAt": TODAY}
            pending += 1
    out = {
        "generatedAt": TODAY,
        "note": "Plain-language summaries grounded only in official LIS title and summary_plain (or official bill text when noted). Editorial. Missing or thin official sources are pending and are never guessed.",
        "bills": catalog,
    }
    OUT.write_text(json.dumps(out, indent=2) + "\n")
    print(json.dumps({"wrote": str(OUT), "ok": ok, "pending": pending, "total": len(bills)}))


if __name__ == "__main__":
    main()
