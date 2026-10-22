import { ExternalLink } from "lucide-react";
import { newsForLocation } from "@/lib/news-locations";

function fmt(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Full-width gold News box on a location dashboard. Additive: homepage News / NoVA Briefings are unchanged. */
export function LocationNews({ slug, title }: { slug: string; title: string }) {
  const items = newsForLocation(slug);
  return (
    <section id="news" aria-labelledby="loc-news-h" className="mt-6 scroll-mt-24 rounded-xl bg-[#f5b82e] p-5 text-navy-800 sm:p-7">
      <h2 id="loc-news-h" className="font-serif text-2xl font-bold uppercase">News: {title} Related News</h2>
      {items.length === 0 ? (
        <p className="mt-4 font-semibold">No related news yet</p>
      ) : (
        <ul className="mt-4 divide-y divide-navy-800/20">
          {items.map((n) => (
            <li key={n.id} className="py-3">
              <a href={n.url} target="_blank" rel="noreferrer" className="group flex items-start gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold leading-snug group-hover:underline">{n.headline}</span>
                  <span className="mt-1 block text-sm font-medium text-navy-800/80">{n.outlet} · {fmt(n.date)}</span>
                </span>
                <ExternalLink className="mt-1 size-4 shrink-0" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
