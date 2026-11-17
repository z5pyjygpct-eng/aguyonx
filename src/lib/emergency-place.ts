/**
 * Classify Emergency Monitor Location text at render time. Does not edit the log.
 * America split: USA / Canada / Mexico / other.
 * US states and countries are extracted only when the text supports them;
 * unmatched or contested places are left unclassified rather than guessed.
 */

export type AmericaPlace = "USA" | "Canada" | "Mexico" | "other";

export const AMERICA_PLACE_LABEL: Record<AmericaPlace, string> = {
  USA: "USA",
  Canada: "Canada",
  Mexico: "Mexico",
  other: "Other North America",
};

/** Pinned near the top of the US-state filter. */
export const PINNED_US_STATES = ["Virginia", "Washington, D.C.", "Maryland"] as const;

const US_STATE_NAMES: [string, string][] = [
  ["district of columbia", "Washington, D.C."],
  ["west virginia", "West Virginia"],
  ["new hampshire", "New Hampshire"],
  ["new jersey", "New Jersey"],
  ["new mexico", "New Mexico"],
  ["new york", "New York"],
  ["north carolina", "North Carolina"],
  ["north dakota", "North Dakota"],
  ["south carolina", "South Carolina"],
  ["south dakota", "South Dakota"],
  ["rhode island", "Rhode Island"],
  ["puerto rico", "Puerto Rico"],
  ["alabama", "Alabama"],
  ["alaska", "Alaska"],
  ["arizona", "Arizona"],
  ["arkansas", "Arkansas"],
  ["california", "California"],
  ["colorado", "Colorado"],
  ["connecticut", "Connecticut"],
  ["delaware", "Delaware"],
  ["florida", "Florida"],
  ["georgia", "Georgia"],
  ["hawaii", "Hawaii"],
  ["idaho", "Idaho"],
  ["illinois", "Illinois"],
  ["indiana", "Indiana"],
  ["iowa", "Iowa"],
  ["kansas", "Kansas"],
  ["kentucky", "Kentucky"],
  ["louisiana", "Louisiana"],
  ["maine", "Maine"],
  ["maryland", "Maryland"],
  ["massachusetts", "Massachusetts"],
  ["michigan", "Michigan"],
  ["minnesota", "Minnesota"],
  ["mississippi", "Mississippi"],
  ["missouri", "Missouri"],
  ["montana", "Montana"],
  ["nebraska", "Nebraska"],
  ["nevada", "Nevada"],
  ["ohio", "Ohio"],
  ["oklahoma", "Oklahoma"],
  ["oregon", "Oregon"],
  ["pennsylvania", "Pennsylvania"],
  ["tennessee", "Tennessee"],
  ["texas", "Texas"],
  ["utah", "Utah"],
  ["vermont", "Vermont"],
  ["virginia", "Virginia"],
  ["wisconsin", "Wisconsin"],
  ["wyoming", "Wyoming"],
  // "washington" is handled separately so "Washington County, Utah" is not the state.
];

const US_STATES = US_STATE_NAMES.map(([n]) => n);

/** 2-letter USPS codes, matched only after a comma or opening paren. */
const US_ABBR_RE =
  /(?:^|,\s*|\s\()(A[LKZR]|C[AOT]|D[CE]|F[LM]|GA|HI|I[DLNA]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AT]|W[AVIY]|DC)(?:\.?\b|\))/;

const US_ABBR_NAME: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington, D.C.", PR: "Puerto Rico",
};

const CA_PROVINCES = [
  "alberta", "british columbia", "manitoba", "new brunswick", "newfoundland and labrador",
  "newfoundland", "nova scotia", "ontario", "prince edward island", "quebec", "saskatchewan",
  "northwest territories", "nunavut", "yukon territory", "yukon",
];

const MX_STATES = [
  "aguascalientes", "baja california sur", "baja california", "campeche", "chiapas", "chihuahua",
  "coahuila", "colima", "durango", "guanajuato", "guerrero", "hidalgo", "jalisco", "michoacan",
  "morelos", "nayarit", "nuevo leon", "oaxaca", "puebla", "queretaro", "quintana roo",
  "san luis potosi", "sinaloa", "sonora", "tabasco", "tamaulipas", "tlaxcala", "veracruz",
  "yucatan", "zacatecas", "mexico city", "ciudad de mexico", "cdmx", "estado de mexico",
];

const US_CITIES = [
  "new york city", "new york", "brooklyn", "the bronx", "bronx", "queens", "staten island",
  "manhattan", "washington, d.c.", "washington, dc", "washington d.c.", "washington dc",
  "white house", "chicago", "los angeles", "houston", "dallas", "san antonio", "san diego",
  "san francisco", "seattle", "miami", "boston", "philadelphia", "phoenix", "denver",
  "atlanta", "detroit", "minneapolis", "tampa", "orlando", "nashville", "austin", "portland",
  "las vegas", "baltimore", "cleveland", "pittsburgh", "cincinnati", "st. louis", "kansas city",
  "salt lake city", "honolulu", "waikiki", "oahu", "new orleans", "indianapolis", "columbus",
  "charlotte", "milwaukee", "oklahoma city", "tucson", "mesa", "omaha", "raleigh",
  "virginia beach", "oakland", "tulsa", "arlington", "foggy bottom", "lafayette square",
  "logan circle", "co-op city",
];

/** Country names and aliases, longest first when iterating. Unlisted places stay unclassified. */
const COUNTRY_ALIASES: [string, string][] = [
  ["united arab emirates", "United Arab Emirates"],
  ["united states of america", "United States"],
  ["united states", "United States"],
  ["united kingdom", "United Kingdom"],
  ["czech republic", "Czechia"],
  ["democratic republic of the congo", "DR Congo"],
  ["democratic republic of congo", "DR Congo"],
  ["papua new guinea", "Papua New Guinea"],
  ["guinea-bissau", "Guinea-Bissau"],
  ["equatorial guinea", "Equatorial Guinea"],
  ["trinidad and tobago", "Trinidad and Tobago"],
  ["bosnia and herzegovina", "Bosnia and Herzegovina"],
  ["saudi arabia", "Saudi Arabia"],
  ["south africa", "South Africa"],
  ["south korea", "South Korea"],
  ["north korea", "North Korea"],
  ["south sudan", "South Sudan"],
  ["new zealand", "New Zealand"],
  ["sri lanka", "Sri Lanka"],
  ["el salvador", "El Salvador"],
  ["costa rica", "Costa Rica"],
  ["dominican republic", "Dominican Republic"],
  ["sierra leone", "Sierra Leone"],
  ["ivory coast", "Ivory Coast"],
  ["cote d'ivoire", "Ivory Coast"],
  ["côte d'ivoire", "Ivory Coast"],
  ["burkina faso", "Burkina Faso"],
  ["central african republic", "Central African Republic"],
  ["northern ireland", "United Kingdom"],
  ["occupied west bank", "Palestine"],
  ["west bank", "Palestine"],
  ["iraqi kurdistan", "Iraq"],
  ["u.s.a.", "United States"],
  ["u.s.", "United States"],
  ["usa", "United States"],
  ["u.k.", "United Kingdom"],
  ["uk", "United Kingdom"],
  ["uae", "United Arab Emirates"],
  ["drc", "DR Congo"],
  ["dr congo", "DR Congo"],
  ["england", "United Kingdom"],
  ["scotland", "United Kingdom"],
  ["wales", "United Kingdom"],
  ["türkiye", "Turkey"],
  ["turkiye", "Turkey"],
  ["turkey", "Turkey"],
  ["czechia", "Czechia"],
  ["vatican city", "Vatican City"],
  ["canada", "Canada"],
  ["mexico", "Mexico"],
  ["guatemala", "Guatemala"],
  ["haiti", "Haiti"],
  ["honduras", "Honduras"],
  ["nicaragua", "Nicaragua"],
  ["panama", "Panama"],
  ["belize", "Belize"],
  ["jamaica", "Jamaica"],
  ["cuba", "Cuba"],
  ["bahamas", "Bahamas"],
  ["ireland", "Ireland"],
  ["france", "France"],
  ["germany", "Germany"],
  ["belgium", "Belgium"],
  ["sweden", "Sweden"],
  ["romania", "Romania"],
  ["bulgaria", "Bulgaria"],
  ["poland", "Poland"],
  ["spain", "Spain"],
  ["hungary", "Hungary"],
  ["italy", "Italy"],
  ["austria", "Austria"],
  ["estonia", "Estonia"],
  ["latvia", "Latvia"],
  ["lithuania", "Lithuania"],
  ["finland", "Finland"],
  ["norway", "Norway"],
  ["denmark", "Denmark"],
  ["netherlands", "Netherlands"],
  ["switzerland", "Switzerland"],
  ["portugal", "Portugal"],
  ["greece", "Greece"],
  ["slovakia", "Slovakia"],
  ["croatia", "Croatia"],
  ["serbia", "Serbia"],
  ["slovenia", "Slovenia"],
  ["ukraine", "Ukraine"],
  ["russia", "Russia"],
  ["belarus", "Belarus"],
  ["moldova", "Moldova"],
  ["albania", "Albania"],
  ["yemen", "Yemen"],
  ["iraq", "Iraq"],
  ["iran", "Iran"],
  ["syria", "Syria"],
  ["lebanon", "Lebanon"],
  ["israel", "Israel"],
  ["jordan", "Jordan"],
  ["qatar", "Qatar"],
  ["bahrain", "Bahrain"],
  ["kuwait", "Kuwait"],
  ["oman", "Oman"],
  ["palestine", "Palestine"],
  ["gaza", "Palestine"],
  ["nigeria", "Nigeria"],
  ["sudan", "Sudan"],
  ["egypt", "Egypt"],
  ["ethiopia", "Ethiopia"],
  ["eritrea", "Eritrea"],
  ["kenya", "Kenya"],
  ["somalia", "Somalia"],
  ["uganda", "Uganda"],
  ["tanzania", "Tanzania"],
  ["senegal", "Senegal"],
  ["niger", "Niger"],
  ["mali", "Mali"],
  ["ghana", "Ghana"],
  ["morocco", "Morocco"],
  ["tunisia", "Tunisia"],
  ["algeria", "Algeria"],
  ["libya", "Libya"],
  ["cameroon", "Cameroon"],
  ["congo", "Congo"],
  ["guinea", "Guinea"],
  ["rwanda", "Rwanda"],
  ["burundi", "Burundi"],
  ["mozambique", "Mozambique"],
  ["zimbabwe", "Zimbabwe"],
  ["angola", "Angola"],
  ["zambia", "Zambia"],
  ["malawi", "Malawi"],
  ["madagascar", "Madagascar"],
  ["colombia", "Colombia"],
  ["venezuela", "Venezuela"],
  ["brazil", "Brazil"],
  ["chile", "Chile"],
  ["peru", "Peru"],
  ["argentina", "Argentina"],
  ["bolivia", "Bolivia"],
  ["paraguay", "Paraguay"],
  ["ecuador", "Ecuador"],
  ["uruguay", "Uruguay"],
  ["guyana", "Guyana"],
  ["suriname", "Suriname"],
  ["india", "India"],
  ["pakistan", "Pakistan"],
  ["bangladesh", "Bangladesh"],
  ["afghanistan", "Afghanistan"],
  ["japan", "Japan"],
  ["china", "China"],
  ["taiwan", "Taiwan"],
  ["australia", "Australia"],
  ["indonesia", "Indonesia"],
  ["malaysia", "Malaysia"],
  ["singapore", "Singapore"],
  ["thailand", "Thailand"],
  ["philippines", "Philippines"],
  ["vietnam", "Vietnam"],
  ["myanmar", "Myanmar"],
  ["cambodia", "Cambodia"],
  ["nepal", "Nepal"],
  ["fiji", "Fiji"],
  ["iceland", "Iceland"],
  ["luxembourg", "Luxembourg"],
  ["malta", "Malta"],
  ["cyprus", "Cyprus"],
  ["armenia", "Armenia"],
  ["azerbaijan", "Azerbaijan"],
  ["kazakhstan", "Kazakhstan"],
  ["uzbekistan", "Uzbekistan"],
  ["georgia", "Georgia"], // skipped when the text is the US state
];

export function foldPlace(s: string) {
  return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function hasPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`, "i").test(text);
}

function isCountryGeorgia(low: string, section?: string) {
  if (/\btbilisi\b|\brepublic of georgia\b/.test(low)) return true;
  if (section === "Europe") return true;
  return false;
}

function isWashingtonState(low: string) {
  if (/\bwashington state\b/.test(low)) return true;
  // ", Washington" / "Washington, USA" but not DC and not "Washington County"
  if (/,\s*washington\b(?!,\s*d\.?c)(?!\s+count(?:y|ies))/.test(low)) return true;
  if (/\bwashington,\s*(?:usa|us)\b/.test(low)) return true;
  if (/\bwashington,\s*and\b/.test(low)) return true;
  return false;
}

function isDc(low: string) {
  return (
    /\bwashington,\s*d\.?c\.?\b/.test(low) ||
    /\bwashington dc\b/.test(low) ||
    /\bwashington d\.c\.?\b/.test(low) ||
    /\bdistrict of columbia\b/.test(low) ||
    /(?<![A-Za-z])d\.c\.(?![A-Za-z])/.test(low) ||
    /\bwhite house\b/.test(low) ||
    /\bfoggy bottom\b/.test(low) ||
    /\blafayette square\b/.test(low) ||
    /\blogan circle\b/.test(low)
  );
}

/**
 * US states (and D.C., Puerto Rico) mentioned in Location.
 * Multi-state items return every state named. "Washington County, Utah" is Utah only.
 * "Tbilisi, Georgia" is not the US state. Unclear nationwide text ("United States")
 * returns no state.
 */
export function extractUsStates(location: string | undefined, section?: string): string[] {
  const text = foldPlace(location ?? "");
  const low = text.toLowerCase();
  const found = new Set<string>();

  if (isDc(low) && !/\bwashington state\b/.test(low)) found.add("Washington, D.C.");
  if (isWashingtonState(low)) found.add("Washington");

  for (const [phrase, name] of US_STATE_NAMES) {
    if (name === "Georgia" && isCountryGeorgia(low, section)) continue;
    if (name === "Washington, D.C.") continue; // already handled
    if (name === "Virginia" && !/(?<!west )(?<![A-Za-z])virginia(?![A-Za-z])/i.test(low)) continue;
    if (hasPhrase(low, phrase)) found.add(name);
  }

  const abbrRe = new RegExp(US_ABBR_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = abbrRe.exec(text))) {
    const name = US_ABBR_NAME[m[1]];
    if (!name) continue;
    if (name === "Georgia" && isCountryGeorgia(low, section)) continue;
    found.add(name);
  }
  return [...found];
}

/**
 * Countries mentioned in Location. Multi-country strings return every country
 * named. "New Mexico" is not Mexico. Crimea and unnamed waterways are left
 * unclassified rather than guessed.
 */
export function extractCountries(location: string | undefined, section?: string): string[] {
  const text = foldPlace(location ?? "");
  const low = text.toLowerCase();
  const found = new Set<string>();

  const states = extractUsStates(location, section);
  if (states.length) found.add("United States");

  for (const [phrase, name] of COUNTRY_ALIASES) {
    if (name === "Mexico" && /\bnew mexico\b/.test(low) && !/(?<!new )\bmexico\b/.test(low)) continue;
    if (name === "Georgia") {
      if (!hasPhrase(low, "georgia") && !/\btbilisi\b/.test(low)) continue;
      if (states.includes("Georgia") || (hasPhrase(low, "georgia") && !isCountryGeorgia(low, section) && states.length)) {
        // US state, not the country
        continue;
      }
      if (!isCountryGeorgia(low, section) && hasPhrase(low, "georgia") && !/\btbilisi\b/.test(low)) {
        // Ambiguous bare "Georgia" with US context already handled; if no US state
        // and not clearly the country, leave unclassified.
        if (section === "America" || section === "USA") continue;
        if (!isCountryGeorgia(low, section)) {
          // Still accept Georgia as a country when the section is clearly not US
          // and there is no US marker. Europe is handled by isCountryGeorgia.
          const usMarker = /\bunited states\b|\busa\b|\bu\.s\.?\b/.test(low);
          if (usMarker) continue;
        }
      }
    }
    if (phrase === "usa" && !/\busa\b/.test(low)) continue;
    if (phrase === "u.s." && !/\bu\.s\.(?!a)/.test(low) && !/\bu\.s\b/.test(text.toLowerCase())) {
      if (!/\bu\.s\./.test(low)) continue;
    }
    if (phrase === "uk" && !/\buk\b/.test(low)) continue;
    if (phrase === "u.k." && !/\bu\.k\./.test(low)) continue;
    if (phrase === "uae" && !/\buae\b/.test(low)) continue;
    if (phrase === "drc" && !/\bdrc\b/.test(low)) continue;
    if (name === "Congo") {
      const stripped = low
        .replace(/democratic republic of the congo/g, " ")
        .replace(/democratic republic of congo/g, " ")
        .replace(/\bdr congo\b/g, " ")
        .replace(/\bdrc\b/g, " ");
      if (!hasPhrase(stripped, "congo")) continue;
    }
    if (name === "Ireland") {
      const stripped = low.replace(/northern ireland/g, " ");
      if (!hasPhrase(stripped, "ireland")) continue;
    }
    if (hasPhrase(low, phrase)) found.add(name);
  }

  // Narrow aliases for leftover wording that is still unambiguous.
  if (/\bnigerian\b/.test(low)) found.add("Nigeria");
  if (/\bfrench cities\b|\bparis and other french\b/.test(low)) found.add("France");
  if (/\b(erbil governorate|northeast of erbil|east of erbil)\b/.test(low)) found.add("Iraq");
  if (/\bmoscow oblast\b|\brussian regions\b/.test(low) && !/\bukraine\b/.test(low)) found.add("Russia");
  if (/\bmultiple us states\b|\bunited states\b|\busa\b|\bu\.s\.a?\.?\b/.test(low)) found.add("United States");
  if (/\birish\b/.test(low)) found.add("Ireland");

  // Reuse the America-split province/state lists so "British Columbia" is Canada, etc.
  const ontarioCalifornia = /\bontario,\s*california\b/.test(low);
  if (
    /\bcanada\b/.test(low) ||
    CA_PROVINCES.some((prov) => !(prov === "ontario" && ontarioCalifornia) && hasPhrase(low, prov))
  ) {
    found.add("Canada");
  }
  if (/(?<!new )\bmexico\b/.test(low) || MX_STATES.some((s) => hasPhrase(low, s))) {
    found.add("Mexico");
  }

  return [...found];
}

export function stateSlug(name: string) {
  if (name === "Washington, D.C.") return "dc";
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function countrySlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const STATE_BY_SLUG = new Map<string, string>();
for (const [, name] of US_STATE_NAMES) STATE_BY_SLUG.set(stateSlug(name), name);
STATE_BY_SLUG.set("dc", "Washington, D.C.");
STATE_BY_SLUG.set("washington", "Washington");
STATE_BY_SLUG.set("washington-d-c", "Washington, D.C.");

const COUNTRY_BY_SLUG = new Map<string, string>();
for (const [, name] of COUNTRY_ALIASES) COUNTRY_BY_SLUG.set(countrySlug(name), name);
COUNTRY_BY_SLUG.set("usa", "United States");
COUNTRY_BY_SLUG.set("us", "United States");
COUNTRY_BY_SLUG.set("uk", "United Kingdom");

export function stateFromParam(s: string | undefined) {
  if (!s) return "";
  return STATE_BY_SLUG.get(s.toLowerCase()) ?? (STATE_BY_SLUG.has(stateSlug(s)) ? STATE_BY_SLUG.get(stateSlug(s))! : "");
}

export function countryFromParam(s: string | undefined) {
  if (!s) return "";
  const slug = countrySlug(s);
  return COUNTRY_BY_SLUG.get(slug) ?? COUNTRY_BY_SLUG.get(s.toLowerCase()) ?? "";
}

export function classifyAmericaLocation(location: string | undefined): AmericaPlace {
  const text = foldPlace(location ?? "");
  const low = text.toLowerCase();

  const hasMexico = /(?<!new )\bmexico\b/.test(low) || MX_STATES.some((s) => hasPhrase(low, s));
  const ontarioCalifornia = /\bontario,\s*california\b/.test(low);
  const hasCanada =
    /\bcanada\b/.test(low) ||
    CA_PROVINCES.some((p) => !(p === "ontario" && ontarioCalifornia) && hasPhrase(low, p));
  // "United States" must match case-insensitively; bare "US" stays case-sensitive so "us" in ordinary words does not match.
  const hasUsCountry =
    /\bunited states\b|\bu\.s\.a\.?\b|\busa\b|\bu\.s\./i.test(low) ||
    /(?<![A-Za-z])US(?![A-Za-z])/.test(text);
  let hasUsState = isWashingtonState(low) || isDc(low);
  if (!hasUsState) {
    for (const s of US_STATES) {
      if (s === "georgia" && isCountryGeorgia(low)) continue;
      if (hasPhrase(low, s)) {
        hasUsState = true;
        break;
      }
    }
  }
  const hasUs =
    hasUsCountry ||
    hasUsState ||
    US_ABBR_RE.test(text) ||
    US_CITIES.some((c) => hasPhrase(low, c)) ||
    /\bmultiple us states\b/.test(low);

  const n = Number(hasUs) + Number(hasCanada) + Number(hasMexico);
  if (n >= 2) return "other";
  if (hasMexico) return "Mexico";
  if (hasCanada) return "Canada";
  if (hasUs) return "USA";
  return "other";
}
