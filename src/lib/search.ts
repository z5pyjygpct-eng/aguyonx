import { ARTICLES } from "@/content/articles";
import { BOOKS } from "@/content/books";
import { DELEGATE_FILES } from "@/content/delegates";
import { DELEGATE_PAPER_EXTRACTS } from "@/content/delegate-papers";
import { INVESTIGATIONS } from "@/content/investigations";
import { INVESTIGATION_EXTRACTS } from "@/content/investigation-papers";
import { LIBRARY } from "@/content/library";
import { NEWS, newsNewestFirst, peopleSearchText, personChip } from "@/content/news";
import { OFFICE_DOORS } from "@/content/offices";
import { SITE } from "@/content/site";
import type { BodyBlock, LibraryItem, Story } from "@/content/types";

export type SearchShelf = "Article" | "News" | "Investigation" | "Library" | "Delegate paper" | "Book" | "Page";

export type SearchHit = {
  id: string;
  title: string;
  snippet: string;
  shelf: SearchShelf;
  href: string;
};

type SearchDoc = SearchHit & {
  titleFields: string;
  body: string;
  districtNumber: string | null;
};

type QueryTerm = { kind: "term"; value: string; phrase: boolean };
type QueryNode =
  | QueryTerm
  | { kind: "and"; kids: QueryNode[] }
  | { kind: "or"; kids: QueryNode[] };

const RESULT_CAP = 40;

function fold(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/** HD-8, HD 8, hd8, 8, house district 8 → "8" */
export function districtNumber(raw: string): string | null {
  const collapsed = fold(raw).replace(/[\s._-]+/g, "");
  const m = collapsed.match(/^(?:hd|housedistrict)?(\d{1,3})$/);
  return m ? m[1] : null;
}

function isSeparator(c: string): boolean {
  return /[\s,;:|/&+!?()[\]{}.·—–]/.test(c);
}

function stripEdges(word: string): string {
  return word.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[^\p{L}\p{N}]+$/u, "");
}

/**
 * Ordinary-people query language.
 * Words AND together (spaces, commas, the word "and").
 * The word "or" ORs groups.
 * Quotes keep a phrase.
 * Other punctuation is a separator, never an error.
 */
export function tokenizeQuery(raw: string): Array<QueryTerm | "OR"> {
  const s = raw.trim();
  const out: Array<QueryTerm | "OR"> = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (isSeparator(c)) {
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "“" || c === "”" || c === "‘" || c === "’") {
      const closers = c === "“" || c === "”" ? ["“", "”", '"'] : c === "‘" || c === "’" ? ["‘", "’", "'"] : [c];
      let j = i + 1;
      let buf = "";
      while (j < s.length && !closers.includes(s[j])) {
        buf += s[j];
        j += 1;
      }
      const phrase = buf.trim();
      if (phrase) out.push({ kind: "term", value: phrase, phrase: true });
      i = j < s.length ? j + 1 : j;
      continue;
    }
    let j = i;
    while (j < s.length && !isSeparator(s[j]) && s[j] !== '"' && s[j] !== "'") j += 1;
    const word = stripEdges(s.slice(i, j));
    i = j;
    if (!word) continue;
    const lower = fold(word);
    if (lower === "and") continue;
    if (lower === "or") {
      out.push("OR");
      continue;
    }
    if (!word.includes(" ") && word.length === 1 && !/\d/.test(word)) continue;
    out.push({ kind: "term", value: word, phrase: false });
  }
  return out;
}

export function parseQuery(raw: string): QueryNode | null {
  const tokens = tokenizeQuery(raw);
  if (tokens.length === 0) return null;
  const groups: QueryTerm[][] = [[]];
  for (const tok of tokens) {
    if (tok === "OR") {
      if (groups[groups.length - 1].length === 0) continue;
      groups.push([]);
      continue;
    }
    groups[groups.length - 1].push(tok);
  }
  const cleaned = groups.filter((g) => g.length > 0);
  if (cleaned.length === 0) return null;
  const andNode = (terms: QueryTerm[]): QueryNode =>
    terms.length === 1 ? terms[0] : { kind: "and", kids: terms };
  if (cleaned.length === 1) return andNode(cleaned[0]);
  return { kind: "or", kids: cleaned.map(andNode) };
}

function tokenHit(haystack: string, term: string): boolean {
  const parts = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  return parts.some((t) => {
    if (t === term) return true;
    if (t.length >= 3 && term.length >= 3 && (t.startsWith(term) || term.startsWith(t))) return true;
    return false;
  });
}

function shortNumeric(s: string): boolean {
  return /^\d{1,2}$/.test(s);
}

function matchTerm(term: QueryTerm, doc: SearchDoc): { hit: boolean; score: number } {
  const value = term.value.trim();
  if (!value) return { hit: false, score: 0 };
  const dist = districtNumber(value);
  if (dist && doc.districtNumber === dist) return { hit: true, score: 20 };

  const folded = fold(value);
  const title = fold(doc.titleFields);
  const body = fold(doc.body);

  if (term.phrase) {
    if (title.includes(folded)) return { hit: true, score: 10 };
    if (shortNumeric(folded)) return { hit: false, score: 0 };
    if (body.includes(folded)) return { hit: true, score: 1 };
    return { hit: false, score: 0 };
  }

  if (tokenHit(title, folded)) return { hit: true, score: 10 };
  if (shortNumeric(folded)) return { hit: false, score: 0 };
  if (tokenHit(body, folded)) return { hit: true, score: 1 };
  return { hit: false, score: 0 };
}

function evalNode(node: QueryNode, doc: SearchDoc): { ok: boolean; score: number } {
  if (node.kind === "term") {
    const m = matchTerm(node, doc);
    return { ok: m.hit, score: m.score };
  }
  if (node.kind === "and") {
    let score = 0;
    for (const kid of node.kids) {
      const r = evalNode(kid, doc);
      if (!r.ok) return { ok: false, score: 0 };
      score += r.score;
    }
    return { ok: true, score };
  }
  let best = 0;
  let any = false;
  for (const kid of node.kids) {
    const r = evalNode(kid, doc);
    if (r.ok) {
      any = true;
      best = Math.max(best, r.score);
    }
  }
  return { ok: any, score: best };
}

function blockText(block: BodyBlock): string {
  switch (block.type) {
    case "p":
    case "h2":
      return block.text;
    case "quote":
      return block.attrib ? `${block.text} ${block.attrib}` : block.text;
    case "callout":
      return `${block.title} ${block.text}`;
    case "x":
      return `${block.name} ${block.handle} ${block.text}`;
    case "image":
      return block.caption ? `${block.alt} ${block.caption}` : block.alt;
    default:
      return "";
  }
}

function storyText(story: Story): string {
  const body = story.body.map(blockText).filter(Boolean).join(" ");
  const cites = story.citations
    .map((c) => (c.note ? `${c.label} ${c.note}` : c.label))
    .join(" ");
  const extract =
    story.kind === "investigation"
      ? INVESTIGATION_EXTRACTS.find((e) => e.slug === story.slug)?.text ?? ""
      : "";
  return `${body} ${cites} ${extract}`.trim();
}

function libraryHref(item: LibraryItem): string {
  return item.tool ?? item.file ?? item.href ?? "/library";
}

function storyDocs(stories: Story[], shelf: "Article" | "Investigation"): SearchDoc[] {
  return stories
    .filter((s) => s.access === "public")
    .map((s) => ({
      id: `${s.kind}-${s.slug}`,
      title: s.title,
      snippet: s.dek,
      shelf,
      href: s.kind === "article" ? `/articles/${s.slug}` : `/investigations/${s.slug}`,
      titleFields: `${s.title} ${s.topic} ${s.kicker}`,
      body: storyText(s),
      districtNumber: null,
    }));
}

function buildIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  docs.push(...storyDocs(ARTICLES, "Article"));
  docs.push(...storyDocs(INVESTIGATIONS, "Investigation"));

  for (const item of newsNewestFirst(NEWS)) {
    docs.push({
      id: `news-${item.id}`,
      title: item.headline,
      snippet: `${item.outlet}. ${item.people.map(personChip).join(", ")}.`,
      shelf: "News",
      href: item.url,
      titleFields: `${item.headline} ${item.outlet} ${peopleSearchText(item.people)} ${item.scope}`,
      body: `${item.outlet} ${peopleSearchText(item.people)} ${item.scope}${item.advocacy ? " advocacy" : ""}`,
      districtNumber: null,
    });
  }

  for (const item of LIBRARY) {
    if (item.access !== "public") continue;
    docs.push({
      id: `library-${item.slug}`,
      title: item.title,
      snippet: item.summary,
      shelf: "Library",
      href: libraryHref(item),
      titleFields: `${item.title} ${item.kind} ${item.source}`,
      body: `${item.summary} ${item.kind} ${item.source}`,
      districtNumber: null,
    });
  }

  for (const extract of DELEGATE_PAPER_EXTRACTS) {
    const member = DELEGATE_FILES.find((d) => d.slug === extract.slug);
    if (!member) continue;
    const href = extract.topic === "tax" ? member.tax : member.energy;
    if (!href) continue;
    const topicLabel = extract.topic === "tax" ? "Taxes" : "Energy";
    docs.push({
      id: `delegate-${extract.file}`,
      title: `${member.name} ${member.district} ${topicLabel}`,
      snippet: `${member.locality}. ${topicLabel} paper.`,
      shelf: "Delegate paper",
      href,
      titleFields: `${member.name} ${member.district} ${member.locality} ${topicLabel} ${extract.topic} tax taxes energy`,
      body: extract.text,
      districtNumber: districtNumber(member.district),
    });
  }

  for (const book of BOOKS) {
    docs.push({
      id: `book-${book.slug}`,
      title: book.title,
      snippet: book.dek,
      shelf: "Book",
      href: book.href,
      titleFields: `${book.title} ${book.subtitle} book`,
      body: `${book.subtitle} ${book.dek}`,
      districtNumber: null,
    });
  }

  docs.push({
    id: "page-about",
    title: "About",
    snippet: SITE.tagline,
    shelf: "Page",
    href: "/about",
    titleFields: `About A Guy on X ${SITE.name} ${SITE.short}`,
    body: `I'm A Guy on X trying to be the ${SITE.handle}. That line is not branding. It is how this started. A researcher on the platform, watching Virginia publish an enormous public record and then bury it across county sites, legislative systems, campaign-finance databases, meeting videos, and newsrooms that never talk to each other. It's public has been the official answer for years. You can actually find it was never the same sentence. For a long time, the people who could find it were not ordinary voters. Campaigns, firms, and operatives paid tens or hundreds of thousands of dollars for opposition research, influence maps, and background files. Citizens and local advocates were locked out not because the documents were secret, but because nobody had built a way to use them that did not require a staff and a retainer. A book came first: how to file the request, read the dump, follow the money, and stop treating aggregation sites as gospel. The book was the argument. The portal was the instrument. Same problem, built instead of described. Then the record itself started moving. Systems changed and whole sessions disappeared from the modern lookup with no error message. Bill numbers recycled. Floor votes got flattened into committee votes. Money and votes stayed in separate buildings. Media piled up in another pile. That is not a 2026 discovery. It is what Virginia's transparency architecture has been doing for a decade while calling itself open. So the work here is commissioned political intelligence, not a public login. Northern Virginia is home base. The Commonwealth is the file. Primary sources, coverage stated when it is incomplete, correlation when two records actually belong in the same sentence. Traditional grassroots was doors, flyers, and yard signs. That still matters. It is not the same as being able to read the official record before you knock. If you want spin, this is the wrong site. If you want the record, with the receipts, you know where to find me. VA Change Agent ${SITE.handle} ${SITE.description} ${SITE.credit}`,
    districtNumber: null,
  });

  docs.push({
    id: "page-contact",
    title: "Contact",
    snippet: `Tips, documents, and corrections. Until there is an email, the door is X.`,
    shelf: "Page",
    href: "/contact",
    titleFields: `Contact ${SITE.handle}`,
    body: `Tips, documents, and corrections. Until there is an email, the door is X. ${SITE.handle} on X.`,
    districtNumber: null,
  });

  for (const office of OFFICE_DOORS) {
    const extra =
      office.to === "/delegates"
        ? "Democrat members with a tax or energy paper on the desk. A link is live only when the file exists."
        : "No roster. No score. The public site is taste. Commissioned files stay with the desk until someone asks for one.";
    docs.push({
      id: `page-${office.to.slice(1)}`,
      title: office.title,
      snippet: office.dek,
      shelf: "Page",
      href: office.to,
      titleFields: `${office.title} ${office.navLabel} ${office.chamber}`,
      body: `${office.dek} ${extra}`,
      districtNumber: null,
    });
  }

  return docs;
}

const INDEX: SearchDoc[] = buildIndex();

export function searchSite(raw: string): SearchHit[] {
  const q = raw.trim();
  if (!q) return [];
  const tree = parseQuery(q);
  if (!tree) return [];
  const scored: Array<SearchHit & { score: number }> = [];
  for (const doc of INDEX) {
    const { ok, score } = evalNode(tree, doc);
    if (!ok) continue;
    scored.push({
      id: doc.id,
      title: doc.title,
      snippet: doc.snippet,
      shelf: doc.shelf,
      href: doc.href,
      score,
    });
  }
  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return scored.slice(0, RESULT_CAP).map(({ score: _score, ...hit }) => hit);
}
