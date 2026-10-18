import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import IDX from "@/lib/ga-members-2026-index.json";
import { MOCKUPS } from "@/lib/mockups/mockups-data";
import { withMockupCrumbs } from "@/lib/mockup-crumbs";

const VACANCY =
  '<div class="dl" data-name="Vacant" data-d="20" data-p="V" style="border:1px dashed #F5B82E;background:#08142D;border-left:3px solid #F5B82E;border-radius:10px;padding:7px 12px;display:block"><div style="font-weight:600;font-size:14px;">Vacant — District 20</div><div style="font-size:11px;color:#9AA8C2">special election Nov 3</div></div>';

function liveHtml(slug: "house-members" | "senate-members") {
  let h = MOCKUPS[slug].html;
  const chamber = slug === "house-members" ? { label: "House of Delegates", to: "/dashboards/house" } : { label: "Senate", to: "/dashboards/senate" };
  h = h.replace("<span>General Assembly</span>", '<a class="hover:text-white" href="/dashboards/general-assembly">General Assembly</a>');
  h = h.replace(`<span>${chamber.label}</span>`, `<a class="hover:text-white" href="${chamber.to}">${chamber.label}</a>`);
  // member cards click through to their LIS-backed profile pages
  const ch = slug === "house-members" ? "house" : "senate";
  const map = (IDX as Record<string, Record<string, string>>)[ch];
  h = h.replace(/<a href="[^"]*" class="dl"([^>]*?data-d="(\d+)")/g, (_m, attrs: string, d: string) =>
    map[d] ? `<a href="/dashboards/${ch}/members/${map[d]}" class="dl"${attrs}` : `<a class="dl"${attrs}`);
  if (slug === "house-members" && !h.includes('data-p="V"')) {
    h = h.replace(/(<div style="display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\);gap:8px;margin-top:16px">)/, `$1${VACANCY}`);
  }
  h = h.replace(/<div class="dl" data-name="Vacant"([^>]*)>(<div[^>]*>[^<]*<\/div><div[^>]*>[^<]*<\/div>)<\/div>/,
    '<a href="/dashboards/house/members/district-20-vacant" class="dl" data-name="Vacant"$1>$2</a>');
  return withMockupCrumbs(h, slug);
}

export function GaMembersLive({ slug }: { slug: "house-members" | "senate-members" }) {
  const html = useMemo(() => liveHtml(slug), [slug]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a.dl") as HTMLAnchorElement | null;
      const href = a?.getAttribute("href");
      if (!a || !href || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate({ to: href });
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [navigate]);
  useEffect(() => {
    if (!ref.current) return;
    try { new Function(MOCKUPS[slug].script)(); } catch { /* filter script best-effort */ }
  }, [slug]);
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <div ref={ref} className="agx-mock" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </SiteShell>
  );
}
