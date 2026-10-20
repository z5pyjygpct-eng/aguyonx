import { type FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { SiteSearchResults } from "@/components/site/site-search-results";

export function HomeSearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(q);
  }

  const query = submitted.trim();

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
        {query ? <SiteSearchResults query={query} /> : null}
      </div>
    </section>
  );
}
