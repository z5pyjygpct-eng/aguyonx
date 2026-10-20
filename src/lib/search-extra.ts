/**
 * Lazy site-search extras, loaded on the first search so the homepage stays light:
 * - meeting recaps (title, board, date, official decision text, video-moment labels) from repo recap data
 * - full text of hosted PDFs (investigations, delegate/senator papers, budget books) via
 *   public/files/search/pdf-words.json (tools/search-pdf/build.py: each PDF's distinct words)
 */
import { MEETINGS, VENUE_LABEL } from "@/lib/voter-mock";
import { pdfOwners, searchDocs, type SearchDoc, type SearchHit } from "@/lib/search";

const RECAPS: SearchDoc[] = MEETINGS.map((m) => ({
  id: `recap-${m.venue}-${m.slug}`,
  title: `${VENUE_LABEL[m.venue]}: ${m.title}`,
  snippet: `${m.dateLabel}${m.decisions.length ? ` · ${m.decisions.length} official votes` : m.rollCallCount ? ` · ${m.rollCallCount} roll calls` : ""}`,
  shelf: "Recap",
  href: m.href,
  titleFields: `${VENUE_LABEL[m.venue]} ${m.title} ${m.dateLabel} recap meeting`,
  body: `${m.decisions.map((d) => d.action).join(" ")} ${m.moments.map((x) => x.label).join(" ")}`,
  districtNumber: null,
}));

let pdfP: Promise<SearchDoc[]> | null = null;
function pdfDocs(): Promise<SearchDoc[]> {
  return (pdfP ??= fetch("/files/search/pdf-words.json")
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : {}))
    .then((words) => {
      const owners = pdfOwners();
      return Object.entries(words).map(([url, w]) => {
        const o = owners.get(url);
        const name = decodeURIComponent(url.split("/").pop() ?? url);
        return {
          id: `pdf-${url}`,
          title: o ? o.title : name,
          snippet: o ? `Full text of the PDF matches. ${o.snippet}` : "PDF we host. Full text matches.",
          shelf: o ? o.shelf : "Document",
          href: o ? o.href : url,
          titleFields: "",
          body: w,
          districtNumber: null,
        } as SearchDoc;
      });
    })
    .catch(() => { pdfP = null; return []; }));
}

/** Recap hits + PDF full-text hits (deduped against the ids/hrefs already shown). */
export async function searchExtra(q: string, seen: Set<string>): Promise<SearchHit[]> {
  const recaps = searchDocs(RECAPS, q, Infinity);
  const pdf = searchDocs(await pdfDocs(), q, Infinity).filter((h) => !seen.has(h.href));
  const out: SearchHit[] = [];
  const hrefs = new Set(seen);
  for (const h of [...recaps, ...pdf]) if (!hrefs.has(h.href)) { hrefs.add(h.href); out.push(h); }
  return out;
}
