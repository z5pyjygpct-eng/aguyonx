import { type FormEvent, useMemo, useState } from "react";
import { searchSite } from "@/lib/search";

/** Dark-hero search box (v4). Same site index as HomeSearch; results render under the box. */
export function HeroSearch({ placeholder, id = "hero-q" }: { placeholder: string; id?: string }) {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const query = submitted.trim();
  const results = useMemo(() => (query ? searchSite(query).slice(0, 8) : []), [query]);
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(q);
  }
  return (
    <div className="max-w-3xl">
      <form role="search" onSubmit={onSubmit} className="flex h-14">
        <label htmlFor={id} className="sr-only">Search the public record</label>
        <input
          id={id}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (!e.target.value.trim()) setSubmitted("");
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-l-xl bg-white px-5 text-base text-navy-800 placeholder:text-[#55627a]"
        />
        <button type="submit" className="rounded-r-xl bg-gold px-6 font-serif font-semibold tracking-[0.06em] text-navy-800 uppercase hover:bg-gold-hover sm:px-8">
          Search
        </button>
      </form>
      {query ? (
        <div className="mt-3 rounded-xl bg-white p-2 text-navy-800 shadow-xl">
          {results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">No matching records on this site.</p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((h) => (
                <li key={h.id}>
                  <a href={h.href} className="block rounded-lg px-3 py-3 hover:bg-wash">
                    <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">{h.shelf}</p>
                    <p className="font-semibold">{h.title}</p>
                    {h.snippet ? <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{h.snippet}</p> : null}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
