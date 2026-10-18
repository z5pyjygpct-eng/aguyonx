/**
 * Shared v4 breadcrumb trail. Home is always first; every level is a link except the
 * current page (last item: plain text, aria-current="page"). Middle levels without a
 * real page (no `to`) are dropped rather than shown as dead text. Emits BreadcrumbList JSON-LD.
 */
import { Link } from "@tanstack/react-router";
import { SITE } from "@/content/site";

export type Crumb = { label: string; to?: string; params?: Record<string, string>; hash?: string };

const NAV = "text-sm text-night-muted";
const OL = "flex min-w-0 flex-wrap items-center gap-y-1";
const A = "rounded-sm underline-offset-4 hover:text-white hover:underline";
const SEP = "mx-2 text-gold";
const CUR = "min-w-0 max-w-full truncate font-semibold text-white";

function hrefOf(c: Crumb): string {
  let p = c.to ?? "/";
  for (const [k, v] of Object.entries(c.params ?? {})) p = p.replace(`$${k}`, encodeURIComponent(v));
  return c.hash ? `${p}#${c.hash}` : p;
}

/** Home + the given levels, with unlinked middle levels removed. */
export function crumbTrail(items: Crumb[]): Crumb[] {
  const last = items.length - 1;
  return [{ label: "Home", to: "/" }, ...items.filter((c, i) => i === last || !!c.to)];
}

function jsonLd(trail: Crumb[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(i < trail.length - 1 ? { item: `${SITE.url}${hrefOf(c)}` } : {}),
    })),
  }).replace(/</g, "\\u003c");
}

// exact matching: ancestor links must not get the router's aria-current="page" (only the last item is current).
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const trail = crumbTrail(items);
  const last = trail.length - 1;
  return (
    <nav aria-label="Breadcrumb" className={`${NAV} ${className}`}>
      <ol className={OL}>
        {trail.map((c, i) => (
          <li key={`${i}-${c.label}`} className={i === last ? "flex min-w-0 items-center" : "flex items-center"}>
            {i > 0 ? <span aria-hidden className={SEP}>›</span> : null}
            {i === last ? (
              <span aria-current="page" className={CUR} title={c.label}>{c.label}</span>
            ) : (
              <Link to={c.to as never} params={c.params as never} hash={c.hash} activeOptions={{ exact: true, includeHash: true }} className={A}>{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(trail) }} />
    </nav>
  );
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Same markup as <Breadcrumbs>, as an HTML string, for the static mockup HTML pages. */
export function breadcrumbsHtml(items: Crumb[]): string {
  const trail = crumbTrail(items);
  const last = trail.length - 1;
  const lis = trail
    .map((c, i) => {
      const sep = i > 0 ? `<span aria-hidden="true" class="${SEP}">›</span>` : "";
      const body = i === last
        ? `<span aria-current="page" class="${CUR}" title="${esc(c.label)}">${esc(c.label)}</span>`
        : `<a class="${A}" href="${esc(hrefOf(c))}">${esc(c.label)}</a>`;
      return `<li class="${i === last ? "flex min-w-0 items-center" : "flex items-center"}">${sep}${body}</li>`;
    })
    .join("");
  return `<nav aria-label="Breadcrumb" class="${NAV}"><ol class="${OL}">${lis}</ol><script type="application/ld+json">${jsonLd(trail)}</script></nav>`;
}

/** Slug used for dashboard column anchors (e.g. "Loudoun County Board of Supervisors" → "loudoun-county-board-of-supervisors"). */
export const colId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
