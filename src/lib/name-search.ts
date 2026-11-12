/**
 * Shared fuzzy text matching for Government budget document search and
 * Campaign money lookup. People should not need an exact title or word order.
 */

export function foldText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/,/g, "");
}

/** Split letter-number boundaries so "HD45" and "CC-12-00170" are searchable in pieces. */
export function tokenize(s: string): string[] {
  return foldText(s)
    .replace(/['\u2019]/g, "")
    .replace(/([a-z]+)(\d+)/g, "$1 $2")
    .replace(/(\d+)([a-z]+)/g, "$1 $2")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Words that appear in official committee titles but are not the person. */
const NAME_FILLERS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "for",
  "in",
  "on",
  "at",
  "friends",
  "friend",
  "committee",
  "campaign",
  "elect",
  "election",
  "delegate",
  "delegates",
  "senator",
  "senators",
  "senate",
  "house",
  "virginia",
  "va",
  "state",
  "district",
  "hd",
  "sd",
  "member",
  "members",
  "candidate",
  "candidates",
  "official",
  "citizens",
  "citizen",
]);

export function significantTokens(s: string): string[] {
  const toks = tokenize(s);
  const sig = toks.filter((t) => !NAME_FILLERS.has(t) && !(t.length === 1 && !/\d/.test(t)));
  return sig.length ? sig : toks;
}

export type TokenMatchKind = "exact" | "prefix";

export function tokenMatches(queryTok: string, hayTok: string): TokenMatchKind | null {
  if (!queryTok || !hayTok) return null;
  if (queryTok === hayTok) return "exact";
  if (queryTok.length === 1 && !/\d/.test(queryTok)) {
    return hayTok.startsWith(queryTok) ? "prefix" : null;
  }
  if (queryTok.length >= 2 && hayTok.length >= 2 && (hayTok.startsWith(queryTok) || queryTok.startsWith(hayTok))) {
    return "prefix";
  }
  return null;
}

export function allTokensMatch(
  queryTokens: string[],
  hayTokens: string[],
): { ok: boolean; exact: number; prefix: number } {
  if (!queryTokens.length) return { ok: false, exact: 0, prefix: 0 };
  let exact = 0;
  let prefix = 0;
  const used = new Set<number>();
  for (const q of queryTokens) {
    let found: TokenMatchKind | null = null;
    let foundI = -1;
    for (let i = 0; i < hayTokens.length; i++) {
      if (used.has(i)) continue;
      const kind = tokenMatches(q, hayTokens[i]!);
      if (kind === "exact") {
        found = kind;
        foundI = i;
        break;
      }
      if (kind && foundI < 0) {
        found = kind;
        foundI = i;
      }
    }
    if (!found || foundI < 0) return { ok: false, exact: 0, prefix: 0 };
    used.add(foundI);
    if (found === "exact") exact += 1;
    else prefix += 1;
  }
  return { ok: true, exact, prefix };
}

function tokensInOrder(queryTokens: string[], hayTokens: string[]): boolean {
  let from = 0;
  for (const q of queryTokens) {
    let next = -1;
    for (let i = from; i < hayTokens.length; i++) {
      if (tokenMatches(q, hayTokens[i]!)) {
        next = i + 1;
        break;
      }
    }
    if (next < 0) return false;
    from = next;
  }
  return true;
}

export function phraseNorm(query: string): string {
  return foldText(query).replace(/\s+/g, " ").trim();
}

export type FuzzyField = { text: string; weight: number };

export type FuzzyScore = { score: number; phrase: boolean };

/**
 * Score a query against one or more text fields. Returns null when the
 * query does not match. Tokens can appear in any order. Common prefixes
 * and suffixes in official names ("Friends of", "Committee for",
 * "for Senate") do not have to be typed. A contiguous phrase scores higher.
 */
export function fuzzyScore(query: string, fields: FuzzyField[]): FuzzyScore | null {
  const rawTokens = tokenize(query);
  if (!rawTokens.length) return null;
  const qSig = significantTokens(query);
  if (!qSig.length) return null;

  const combined = fields.map((f) => f.text).join(" ");
  const hayFull = tokenize(combined);
  const haySig = significantTokens(combined);

  let match = allTokensMatch(qSig, hayFull);
  if (!match.ok) match = allTokensMatch(qSig, haySig);
  if (!match.ok) match = allTokensMatch(rawTokens, hayFull);
  if (!match.ok) return null;

  let score = match.exact * 4 + match.prefix * 2;
  const phrase = phraseNorm(query);
  const phraseHit =
    phrase.length >= 2 &&
    fields.some((f) => phraseNorm(f.text).includes(phrase));
  if (phraseHit) {
    const inHighField = fields.some((f) => f.weight >= 8 && phraseNorm(f.text).includes(phrase));
    score += inHighField ? 10 : 3;
  }
  if (tokensInOrder(qSig, hayFull) || tokensInOrder(qSig, haySig)) score += 2;

  for (const f of fields) {
    const inField =
      allTokensMatch(qSig, tokenize(f.text)).ok || allTokensMatch(qSig, significantTokens(f.text)).ok;
    if (inField) score += Math.min(f.weight, 10) * 0.3;
  }

  return { score, phrase: phraseHit };
}

/** Offset of the exact phrase, or of the first query token, in normalized text. */
export function matchOffset(hay: string, query: string): number {
  const normHay = phraseNorm(hay);
  const phrase = phraseNorm(query);
  if (phrase && normHay.includes(phrase)) return normHay.indexOf(phrase);
  for (const tok of tokenize(query)) {
    if (tok.length < 2) continue;
    const i = normHay.indexOf(tok);
    if (i >= 0) return i;
  }
  return -1;
}
