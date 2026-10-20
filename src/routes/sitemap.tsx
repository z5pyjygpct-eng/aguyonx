import { createFileRoute } from "@tanstack/react-router";
import { DocPage } from "@/components/site/doc-page";
import DATA from "@/lib/sitemap.gen.json";

/** Human sitemap. Built from routes + data by tools/sitemap/build.mjs (same list as /sitemap.xml). */
export const Route = createFileRoute("/sitemap")({
  head: () => ({ meta: [{ title: "Site map · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const total = DATA.sections.reduce((a, s) => a + s.pages.length, 0);
  return (
    <DocPage crumb="Site map" titleA="Site" titleB="map" dek={`Every page on the site, ${total.toLocaleString()} in all. Meeting recaps are listed newest first.`}>
      <nav aria-label="Sections" className="flex flex-wrap gap-2">
        {DATA.sections.map((s) => <a key={s.name} href={`#${s.name.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="rounded-full border border-navy-line px-3 py-1 text-sm !no-underline">{s.name} ({s.pages.length})</a>)}
      </nav>
      {DATA.sections.map((s) => (
        <section key={s.name} id={s.name.toLowerCase().replace(/[^a-z]+/g, "-")}>
          <h2>{s.name}</h2>
          {s.name === "Meeting recaps" ? (
            <details className="mt-2"><summary className="cursor-pointer text-gold">Show all {s.pages.length} recaps</summary>
              <ul className="mt-2 columns-1 text-sm sm:columns-2">{s.pages.map((p) => <li key={p.url}><a href={p.url}>{p.title}</a></li>)}</ul>
            </details>
          ) : (
            <ul className="mt-2 columns-1 text-sm sm:columns-2">{s.pages.map((p) => <li key={p.url}><a href={p.url}>{p.title}</a></li>)}</ul>
          )}
        </section>
      ))}
    </DocPage>
  );
}
