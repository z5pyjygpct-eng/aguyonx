/**
 * Classify an Emergency Monitor "America" alert's Location text into
 * USA / Canada / Mexico / other, at render time. Does not edit the log.
 */

export type AmericaPlace = "USA" | "Canada" | "Mexico" | "other";

export const AMERICA_PLACE_LABEL: Record<AmericaPlace, string> = {
  USA: "USA",
  Canada: "Canada",
  Mexico: "Mexico",
  other: "Other North America",
};

const US_STATES = [
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware",
  "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky",
  "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi",
  "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey", "new mexico",
  "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania",
  "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah", "vermont",
  "virginia", "west virginia", "wisconsin", "wyoming", "district of columbia", "puerto rico",
];

/** 2-letter USPS codes, matched only after a comma or opening paren. */
const US_ABBR = /(?:^|,\s*|\s\()(A[LKZR]|C[AOT]|D[CE]|F[LM]|GA|HI|I[DLNA]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AT]|W[AVIY]|DC)(?:\.?\b|\))/;

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

function fold(s: string) {
  return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function hasPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`, "i").test(text);
}

export function classifyAmericaLocation(location: string | undefined): AmericaPlace {
  const text = fold(location ?? "");
  const low = text.toLowerCase();

  const hasMexico = /(?<!new )\bmexico\b/.test(low) || MX_STATES.some((s) => hasPhrase(low, s));
  const ontarioCalifornia = /\bontario,\s*california\b/.test(low);
  const hasCanada =
    /\bcanada\b/.test(low) ||
    CA_PROVINCES.some((p) => !(p === "ontario" && ontarioCalifornia) && hasPhrase(low, p));
  const hasUsCountry = /\bunited states\b|\bu\.s\.a\.?\b|\busa\b|\bu\.s\.?\b|(?<![A-Za-z])US(?![A-Za-z])/.test(text);
  let hasUsState = false;
  if (/\bwashington state\b|\bwashington,\s*(d\.?c\.?|usa|us)\b|,\s*washington\b|\bwashington,\s*and\b/.test(low)) {
    hasUsState = true;
  }
  if (!hasUsState) {
    for (const s of US_STATES) {
      if (hasPhrase(low, s)) {
        hasUsState = true;
        break;
      }
    }
  }
  const hasUs =
    hasUsCountry ||
    hasUsState ||
    US_ABBR.test(text) ||
    US_CITIES.some((c) => hasPhrase(low, c)) ||
    /\bmultiple us states\b/.test(low);

  const n = Number(hasUs) + Number(hasCanada) + Number(hasMexico);
  if (n >= 2) return "other";
  if (hasMexico) return "Mexico";
  if (hasCanada) return "Canada";
  if (hasUs) return "USA";
  return "other";
}
