import { useEffect, useMemo, useRef } from "react";
import { SiteShell } from "@/components/site/shell";
import { MOCKUPS } from "@/lib/mockups/mockups-data";

const VACANCY =
  '<div class="dl" data-name="Vacant" data-d="20" data-p="V" style="border:1px dashed #F5B82E;background:#08142D;border-left:3px solid #F5B82E;border-radius:10px;padding:7px 12px;display:block"><div style="font-weight:600;font-size:14px;">Vacant — District 20</div><div style="font-size:11px;color:#9AA8C2">Del. Maldonado resigned eff. May 31, 2026 · special election Nov 3</div></div>';

function liveHtml(slug: "house-members" | "senate-members") {
  let h = MOCKUPS[slug].html;
  const chamber = slug === "house-members" ? { label: "House of Delegates", to: "/dashboards/house" } : { label: "Senate", to: "/dashboards/senate" };
  h = h.replace("<span>General Assembly</span>", '<a class="hover:text-white" href="/dashboards/general-assembly">General Assembly</a>');
  h = h.replace(`<span>${chamber.label}</span>`, `<a class="hover:text-white" href="${chamber.to}">${chamber.label}</a>`);
  // member cards had placeholder links (#, /mockups/*) — render as plain cards on the live route
  h = h.replace(/<a href="[^"]*" class="dl"([\s\S]*?)<\/a>/g, '<div class="dl"$1</div>');
  if (slug === "house-members" && !h.includes('data-p="V"')) {
    h = h.replace(/(<div style="display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\);gap:8px;margin-top:16px">)/, `$1${VACANCY}`);
  }
  return h;
}

export function GaMembersLive({ slug }: { slug: "house-members" | "senate-members" }) {
  const html = useMemo(() => liveHtml(slug), [slug]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try { new Function(MOCKUPS[slug].script)(); } catch { /* filter script best-effort */ }
  }, [slug]);
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </SiteShell>
  );
}
