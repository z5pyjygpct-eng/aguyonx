import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchSite, type SearchHit } from "@/lib/search";

function isFileOrExternal(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("/files/") ||
    /\.(pdf|md|csv|txt)$/i.test(href)
  );
}

function ResultLink({ hit, children }: { hit: SearchHit; children: ReactNode }) {
  const file = isFileOrExternal(hit.href);
  return (
    <a
      href={hit.href}
      className="block px-1 py-4 hover:bg-wash"
      {...(file ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function HomeSearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(q);
  }

  const query = submitted.trim();
  const results = useMemo(() => (query ? searchSite(query) : []), [query]);

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <form role="search" onSubmit={onSubmit}>
          <label htmlFor="site-search" className="sr-only">
            Search the public record
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="site-search"
              type="search"
              name="q"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (!e.target.value.trim()) setSubmitted("");
              }}
              placeholder="Name, district, or topic"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 w-full rounded-md border border-input bg-paper pr-4 pl-11 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            />
          </div>
        </form>
        {query ? (
          results.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">No matching records on this site.</p>
          ) : (
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {results.map((hit) => (
                <li key={hit.id}>
                  <ResultLink hit={hit}>
                    <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                      {hit.shelf}
                    </p>
                    <h2 className="mt-1 font-serif text-xl font-medium">{hit.title}</h2>
                    {hit.snippet ? (
                      <p className="mt-1 text-sm text-muted-foreground">{hit.snippet}</p>
                    ) : null}
                  </ResultLink>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </section>
  );
}
