#!/usr/bin/env python3
"""Build src/lib/ga-party-categories.json: topic categories for every chief-patron measure, used by /data/republicans-vs-democrats.

Same method as the member pages' Bill subjects card (tools/ga-members/build.py), extended with more title rules:
  1. Official LIS subject (CIBillSubjects) wherever LIS published one. Child subjects roll up to their official parent subject.
  2. Honor resolutions by official title prefix ("Celebrating the life of" / "Commending").
  3. The categories the Bill subjects card already assigns (official-vocabulary and alias matching on the LIS title/summary).
  4. NEW deterministic keyword rules, below. Each rule is a regular expression over the LIS title's LEAD PHRASE (the words before the first ";",
     which LIS uses to name the subject matter) and, for a few high-signal rules, the whole title. Summaries are used only through rule 3.
A measure with no matching rule stays uncategorized. Nothing is guessed: a rule needs an explicit topic word in the official title.
Both parties go through exactly the same code; party is never read. Output keeps only {category list, source: "o" official | "a" aguyonx}.
Usage: python3 tools/ga-members/party-categories.py [--cache DIR]
"""
import csv, json, os, re, sys, collections, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = sys.argv[sys.argv.index("--cache") + 1] if "--cache" in sys.argv else "/tmp/lis-members-cache"
HONOR = {"Memorial resolutions", "Commendations"}
MEMORIAL_RE = re.compile(r"^Celebrating the life of\b", re.I)
COMMEND_RE = re.compile(r"^Commending\b", re.I)

# (label, lead-phrase regex, optional whole-title regex). Case-insensitive. Labels reuse official LIS subject names where one fits.
R = lambda s: re.compile(s, re.I)
RULES = [
    ("Taxation", R(r"\btax(?:es|ation|ing)?\b|\bexcise\b|\bRS & UT\b"), R(r"\btax (?:credits?|exemptions?|deductions?|increases?|rates?|revenues?)\b|\bincome tax\b|\bsales (?:and|&) use tax\b|\bproperty tax")),
    ("Insurance", R(r"\binsur(?:ance|ers?|ed)\b|\bpharmacy benefits? managers?\b"), None),
    ("Health", R(r"\bhealth care\b|\bhealth (?:plans?|benefits?|professionals?|systems?|department)\b|\bpublic health\b|\bmedicaid\b|\bmedicare\b|\bhospitals?\b|\bnursing (?:homes?|facilit)|\bphysicians?\b|\bnurses?\b|\bnursing\b|\bpharmac(?:y|ists?)\b|\bprescription|\bdrug (?:pricing|affordability)|\bmedical (?:care|cannabis|marijuana|records?|facilit|debt|treatment)|\bdentist|\bdental\b|\babortion|\bcontracepti|\bvaccin|\bimmuniz|\bcancer\b|\btelehealth|\binfertility|\bmaternal|\bhospice|\bcommunicable|\bopioid|\bnaloxone|\bepinephrine|\bbirth-related neurological|\bhealth\b$"), None),
    ("Behavioral Health and Developmental Services", R(r"\bmental health\b|\bbehavioral health\b|\bsubstance (?:use|abuse)\b|\bsuicide\b|\bcommunity services boards?\b|\bdevelopmental\b|\bcrisis (?:receiving|stabilization|services)\b|\bpsychiatric\b|\bdisabilit|\bmarcus alert\b|\bemergency custody\b|\btemporary detention"), None),
    ("Education", R(r"\b(?:public |private )?(?:elem(?:entary)?\.? |sec(?:ondary)?\.? |high |middle )*schools?\b(?! bus)|\bsch\b|\bschool (?:boards?|divisions?)\b|\bteachers?\b|\bstudents?\b|\beducation\b|\beducators?\b|\bstandards of (?:quality|learning)\b|\bsol\b|\bgraduation\b|\bgraduates?\b|\bsuperintendent|\bkindergarten|\bpreschool|\bchild care\b|\bliteracy\b|\bcurriculum\b|\bhome instruction\b|\bboard of education\b|\bdyslexia|\bcivics\b"), None),
    ("Educational Institutions", R(r"\bhigher ed|\buniversit|\bcolleges?\b|\btuition\b|\bvmi\b|\bvirginia military institute\b|\bscholarship|\bstudent loans?\b|\bboard of visitors\b"), None),
    ("Elections", R(r"\belections?\b|\bvot(?:ers?|ing)\b|\bballots?\b|\bcampaign\b|\bredistricting\b|\breapportionment\b|\bpolling\b|\bregistrars?\b|\babsentee\b|\bprimar(?:y|ies)\b|\bcongressional districts?\b|\bcandidates?\b|\bpolitical (?:campaign|party|committee)"), None),
    ("Firearms", R(r"\bfirearms?\b|\bhandguns?\b|\bconcealed\b|\bammunition\b|\bguns?\b|\bsubstantial risk orders?\b|\bmachine guns?\b|\bbump stock|\bghost gun"), None),
    ("Crimes and Offenses Generally", R(r"\bassault\b|\bmurder\b|\bhomicide\b|\bmanslaughter\b|\bfelon(?:y|ies|s)\b|\bcrimes?\b|\bcriminal (?:offenses?|penalties|acts?|conduct)\b|\babduction\b|\bburglary\b|\blarceny\b|\bfraud\b|\bforgery\b|\bhate crimes?\b|\btrafficking\b|\bharass|\bstalking\b|\bsexual (?:assault|abuse|offens|violence)\b|\brape\b|\bobscen|\bprostitution\b|\bhazing\b|\barson\b|\brobbery\b|\bkidnapp|\bmisdemeanors?\b|\bvandalism\b|\bdamage or trespass\b|\bidentity theft\b|\bdrunk driving\b|\bdriving under\b|\breckless driving\b|\bswatting\b|\bdomestic violence\b|\bfamily abuse\b|\bprotective orders?\b|\baggravated\b|\bchild abuse\b|\bcruelty\b"), None),
    ("Criminal Procedure", R(r"\bsentenc|\bbail\b|\bprobation\b|\bsearch warrants?\b|\bsearch and seizure\b|\bexpunge|\bsealing\b|\bsummons\b|\bcriminal complaint\b|\bcriminal records?\b|\bcompetency\b|\bindigent defense\b|\bpublic defenders?\b|\bcommonwealth'?s attorneys?\b|\bgrand jur|\bpretrial\b|\barrests?\b|\bcriminal history\b|\bfines and costs\b|\bcourt date reminder\b"), None),
    ("Law enforcement", R(r"\blaw[- ]enforcement\b|\bpolice\b|\bsheriffs?\b|\bdeputy sheriffs?\b|\bcorrectional officers?\b|\bcriminal justice services\b|\bbody-?worn\b"), None),
    ("Prisons and Other Methods of Correction", R(r"\bparole\b|\bprisons?\b|\bcorrectional (?:facilit|center|institution|education)|\bjails?\b|\bdepartment of corrections\b|\binmates?\b|\bincarcerat|\bsolitary\b|\bearned sentence credits?\b|\bprisoners?\b|\bstate correctional\b"), None),
    ("Juvenile Justice", R(r"\bjuvenile\b|\bdelinquen|\bcourt service unit\b"), None),
    ("Courts and judges", R(r"\bjudges?\b|\bjudicial\b|\bcircuit courts?\b|\bgeneral district courts?\b|\bcourts?\b(?! date)|\bmagistrates?\b|\bsupreme court\b|\bcourt of appeals\b|\bcourthouses?\b|\bjudgeships?\b"), None),
    ("Civil Remedies and Procedure", R(r"\bcivil (?:action|actions|liability|remed|procedure|immunity|suits?)\b|\bstatute of repose\b|\bliability\b|\bsovereign immunity\b|\btort\b|\bwrongful death\b|\battorney'?s? fees\b|\bgarnishment\b|\bhabeas\b|\bdefamation\b|\bpersonal injury\b|\bmalpractice\b|\bdefault judgments?\b"), None),
    ("Domestic Relations", R(r"\bmarriage\b|\bdivorce\b|\bchild custody\b|\bcustody (?:and|&) visitation\b|\bchild support\b|\bspousal\b|\bparentage\b|\badoption\b|\bparental\b|\bparenting\b|\bvisitation\b|\bfamily law\b"), R(r"\bmarriage\b")),
    ("Welfare (Social Services)", R(r"\bsocial services\b|\bfoster care\b|\bchild protective\b|\badult protective\b|\bsnap\b|\btanf\b|\bpublic assistance\b|\bwelfare\b|\bhomeless|\bchild welfare\b|\bkinship\b|\bfood insecurity\b|\bchild abuse or neglect\b"), None),
    ("Housing", R(r"\bhousing\b|\blandlords?\b|\btenants?\b|\beviction|\brental (?:agreements?|housing|properties|units?)\b|\bresidential landlord\b|\bcondominium|\bmanufactured home|\bmobile home|\bproperty owners.? association|\bhomeowners.? association|\bbuilding code\b|\bmortgage|\bforeclosure|\bhomebuyer|\bhome ?ownership\b|\bfair housing\b|\bshort-term rental|\baccessory dwelling\b"), None),
    ("Land use and zoning", R(r"\bzoning\b|\bcomprehensive plan\b|\bland use\b|\bsubdivision\b|\bplats?\b|\bproffer|\bsite plan|\bplanning commission\b|\bboards? of zoning appeals\b|\bimpact fees\b|\bland development\b|\bboundary line adjustments?\b"), None),
    ("Local Government and Officials", R(r"\blocalit(?:y|ies)\b|\bcount(?:y|ies)\b|\bcity of\b|\btown of\b|\bcities\b|\bcharter\b|\bboards? of supervisors\b|\blocal (?:government|governing|ordinance|officials?)|\bcounty manager|\bregional (?:authorit|planning|commission)|\bmunicipal|\bconstitutional officers?\b|\bcommissioners? of the revenue\b|\bcity council"), None),
    ("Electric utilities and energy", R(r"\belectric(?:al|ity)?\b|\bpublic utilit|\butilit(?:y|ies)\b|\btransmission lines?\b|\bsubstation|\bclean energy\b|\brenewable|\bsolar\b|\bwind (?:energy|power|turbine)|\benergy\b|\bnuclear\b|\bnet energy metering\b|\bnet metering\b|\bsmall modular\b|\bdistributed energy\b|\bundergrounding\b"), None),
    ("Data centers", R(r"\bdata cent(?:er|re)s?\b"), R(r"\bdata cent(?:er|re)s?\b")),
    ("Conservation", R(r"\bconservation\b|\bchesapeake bay\b|\benvironment|\bwetlands?\b|\bstormwater\b|\bwater quality\b|\bwaste\b|\brecycl|\bpollut|\bclimate\b|\btrees?\b|\bforest|\bstate parks?\b|\bwildlife\b|\bflood|\bsea level\b|\bsewage\b|\bendangered species\b|\bplastic|\bmarine resources\b|\boysters?\b|\blitter\b|\bpfas\b|\bcoastal\b|\bleaf blowers?\b"), None),
    ("Agriculture, Animal Care and Food", R(r"\bagricultur|\bfarm(?:s|ers|ing)?\b|\bdogs?\b|\bcats?\b|\banimals?\b|\blivestock\b|\bpoultry\b|\bpets?\b|\bfood\b|\brestaurants?\b|\bhunting\b|\bfishing\b|\bpesticide|\bveterinar|\bseafood\b|\bhorses?\b|\bkennel"), None),
    ("Cannabis and marijuana", R(r"\bcannabis\b|\bmarijuana\b|\bkratom\b|\bhemp\b|\bcannabinoid|\bpsilocybin|\bpsychedelic"), None),
    ("Alcoholic Beverage Control", R(r"\balcohol|\babc\b|\bbeer\b|\bwine\b|\bdistill|\bbrewer|\bmixed beverages?\b|\bliquor\b"), None),
    ("Gambling and gaming", R(r"\bgaming\b|\bcasinos?\b|\blotter(?:y|ies)\b|\bgambling\b|\bbingo\b|\braffles?\b|\bsports? (?:betting|wagering)\b|\bskill games?\b|\bhorse racing\b|\bpari-?mutuel|\bwagering\b"), None),
    ("Tobacco and vaping", R(r"\btobacco\b|\bvaping\b|\bnicotine\b|\bcigarettes?\b|\bvapor products?\b"), None),
    ("Labor and Employment", R(r"\bwages?\b|\bemploy(?:ees?|ers?|ment|ing)\b|\bworkers?\b|\bworkplace\b|\bovertime\b|\bcollective bargaining\b|\blabor\b|\bunemployment\b|\bnon-?compete|\bcovenants not to compete\b|\bpaid (?:sick|family) leave\b|\bapprentice|\bworkforce\b|\bminimum wage\b|\bwhistleblower|\bmigrant labor\b"), None),
    ("Retirement Systems", R(r"\bretirement\b|\bpensions?\b|\bline of duty\b|\bvrs\b|\bdeferred compensation\b|\bretirees?\b"), None),
    ("Motor Vehicles", R(r"\bmotor vehicles?\b|\bdrivers?'?s?\b|\blicense plates?\b|\bregistration plates?\b|\bvehicles?\b|\bdmv\b|\bspeed(?:ing)?\b|\bphoto speed\b|\bred light\b|\bmotorcycles?\b|\bautomobile|\btowing\b|\bseat belt|\bdriving\b|\bscooter|\bmopeds?\b|\bwindow tint|\bignition interlock|\bschool bus\b|\btractor-trailers?\b"), None),
    ("Transportation", R(r"\btransportation\b|\btransit\b|\brail\b|\brailroad\b|\bhighways?\b|\bbridges?\b|\btoll\b|\btolls\b|\btoll facilit|\bvdot\b|\bairports?\b|\bairspace\b|\bwmata\b|\bferr(?:y|ies)\b|\bunmanned aircraft\b|\bdrones?\b"), None),
    ("Professions and Occupations", R(r"\blicensure\b|\baccountancy\b|\bcontractors?\b|\bregulatory boards?\b|\breal estate\b|\bcosmetolog|\bbarbers?\b|\bappraisers?\b|\bengineers?\b|\barchitects?\b|\bvirginia state bar\b|\bfuneral\b|\bhome inspectors?\b|\bsurveyors?\b|\bpsycholog|\bcounselors?\b|\bsocial workers?\b|\bprofessional and occupational\b"), None),
    ("Financial Institutions and Services", R(r"\bbank(?:s|ing)?\b|\bfinancial (?:institution|service|product|exploitation)s?\b|\bcredit unions?\b|\bloans?\b|\bpayday\b|\bconsumer finance\b|\bdebts?\b|\bmoney transmi|\bcredit (?:card|report|freeze)|\bcryptocurrenc|\bvirtual currenc|\bdigital assets?\b|\bcheck cashing\b|\bbuy now, pay later\b|\binstallment\b"), None),
    ("Consumer protection and privacy", R(r"\bconsumer (?:protection|data|finance|debt|credit|reports?|products?)\b|\bvirginia consumer\b|\bprivacy\b|\bdata protection\b|\bpersonal (?:information|data)\b|\bartificial intelligence\b|\bdeceptive\b|\bsurveillance\b|\bdata breach\b|\bdata broker|\bsocial media\b|\bfacial recognition\b|\bprice gouging\b|\bautomatic renewal\b|\bticket resale\b|\bscams?\b|\bgift cards?\b|\bright to repair\b"), None),
    ("Trade and Commerce", R(r"\bfranchis|\bcommerce\b|\bcompetition\b|\bantitrust\b|\bmanufactur|\beconomic development\b|\bsmall business|\bwholesal|\bmotion picture\b|\btrade secrets?\b|\bretail (?:franchise|sales of|establishments?|stores?)\b"), None),
    ("Corporations", R(r"\bstock corporation\b|\bnonstock corporation\b|\blimited liability compan|\bpartnership|\bcorporations?\b"), None),
    ("Administration of Government", R(r"^governor\b|\bsecretary of\b|\bstate (?:agenc|government|employees?)\b|\bfoia\b|\bfreedom of information\b|\bprocurement\b|\battorney general\b|\bpublic records\b|\bpublic meetings?\b|\bethics\b|\bconflict of interest\b|\bpublic (?:officials?|bodies)\b|\bnotar(?:y|ies)\b|\bregulations?\b|\badministrative process act\b|^confirming\b"), None),
    ("Budget and appropriations", R(r"\bbudget bill\b|\bappropriation|\bgeneral fund\b|\bunclaimed property\b"), None),
    ("General Assembly", R(r"\bgeneral assembly\b|\blegislat(?:ive|ure|ors?)\b|\bhouse of delegates\b|\bsenate of virginia\b|\bjlarc\b|\bjoint legislative\b"), None),
    ("Military and Emergency Laws", R(r"\bnational guard\b|\bmilitary\b|\bveterans?\b|\barmed forces\b|\bemergency (?:management|declarations?|powers|operations|shelters?)\b|\bdisaster|\bservicemembers?\b|\bservice members?\b|\bnavy\b|\bhomeland security\b"), None),
    ("Fire and emergency services", R(r"\bfire programs?\b|\bfirefighters?\b|\bfire (?:departments?|marshals?|protection)\b|\bemergency medical\b|\brescue squads?\b|\bfirst responders?\b|\b911\b|\bdispatchers?\b"), None),
    ("Property and Conveyances", R(r"\breal property\b|\bdeeds?\b|\beasements?\b|\bconveyance|\brecordation\b|\bliens?\b|\beminent domain\b|\bcondemn|\bdecedents?\b|\bprobate\b|\bguardians?\b|\bconservators?\b|\bpower of attorney\b|\bcemeter|\bburial|\bmechanics.? liens?\b"), None),
    ("Technology and telecommunications", R(r"\binformation technolog(?:y|ies)\b|\btelecommunications?\b|\bbroadband\b|\binternet\b|\bwireless\b|\bcable (?:television|service)\b|\bvideo (?:service|programming)\b|\bcybersecurity\b|\bartificial intelligence\b|\bvirginia information technologies agency\b"), None),
    ("Arts, culture and tourism", R(r"\barts\b|\bmuseums?\b|\btourism\b|\bhistoric (?:preservation|districts?|sites?|landmarks?)\b|\bbattlefield|\bnational scenic\b"), None),
]
DISCARD_FOR_CHART = set()

def child_to_parent():
    m = {}
    f = os.path.join(CACHE, "20261-CIParentChildSubjects.csv")
    for r in csv.DictReader(open(f, encoding="latin-1", newline="")):
        m[r["Child_Subject"].strip()] = r["Parent_Subject"].strip()
    return m

PARENT_TO_LABEL = {"Courts of Record": "Courts and judges", "Courts Not of Record": "Courts and judges", "Alcoholic Beverage Control Act": "Alcoholic Beverage Control",
                   "Pensions, Benefits, and Retirement": "Retirement Systems", "Persons With Disabilities": "Behavioral Health and Developmental Services",
                   "Fisheries and Habitat of the Tidal Waters": "Conservation", "Game, Inland Fisheries, and Boating": "Agriculture, Animal Care and Food",
                   "Wills and Decedents' Estates": "Property and Conveyances", "Wills, Trusts, and Fiduciaries": "Property and Conveyances"}

LABEL_MAP = {"Electric utilities": "Electric utilities and energy", "Solar Energy": "Electric utilities and energy", "Wind Energy": "Electric utilities and energy"}

def lead_phrase(title):
    return title.split(";")[0].strip()

def rule_cats(title):
    lead = lead_phrase(title)
    out = []
    for label, lead_rx, full_rx in RULES:
        if lead_rx.search(lead) or (full_rx and full_rx.search(title)):
            if label not in out: out.append(label)
    return out

def categorize_bill(b, c2p):
    """Returns (categories, source) where source is 'o' (official LIS subject), 'a' (aguyonx title/summary rules) or '' (none)."""
    title = b["title"]
    if MEMORIAL_RE.search(title): return ["Memorial resolutions"], "a"
    if COMMEND_RE.search(title) or re.search(r";\s*commending\b", title, re.I): return ["Commendations"], "a"
    if re.search(r";\s*(?:celebrating the life|in memory of|designating\b|commemorating\b|recognizing\b)", title, re.I): return ["Commemorations"], "a"
    if b.get("subjects"):
        cats = []
        for s in b["subjects"]:
            lab = c2p.get(s, s)
            lab = PARENT_TO_LABEL.get(lab, lab)
            if lab == s and s not in {p for p in c2p.values()}:  # a subject outside the parent/child vocabulary: use the rules on the official subject name
                rc = rule_cats(s)
                lab = rc[0] if len(rc) == 1 else s
            lab = LABEL_MAP.get(lab, lab)
            if lab not in cats: cats.append(lab)
        return cats, "o"
    cats = list(b.get("categories") or [])  # what the Bill subjects card already assigns
    for c in rule_cats(title):
        if c not in cats: cats.append(c)
    cats = [LABEL_MAP.get(c, c) for c in cats]
    cats = list(dict.fromkeys(cats))
    return cats, ("a" if cats else "")

def main():
    c2p = child_to_parent()
    out, seen = {}, set()
    stats = collections.Counter()
    gen = ""
    for ch in ("house", "senate"):
        d = json.load(open(os.path.join(ROOT, f"src/lib/ga-members-2026-{ch}.json")))
        gen = max(gen, d["generated"])
        for m in d["members"]:
            for b in m["bills"]:
                key = f'{b["session"]}|{b["bill"]}'
                if key in seen: continue
                seen.add(key)
                cats, src = categorize_bill(b, c2p)
                if cats: out[key] = [cats, src]
                stats[src or "none"] += 1
    json.dump({"generated": gen, "bills": out}, open(os.path.join(ROOT, "src/lib/ga-party-categories.json"), "w"), separators=(",", ":"), sort_keys=True)
    print(dict(stats), len(seen))

if __name__ == "__main__":
    main()
