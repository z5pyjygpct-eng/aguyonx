import { type FormEvent, useState } from "react";
import { SiteSearchResults } from "@/components/site/site-search-results";

/** Dark-hero search box (v4). Same site index as HomeSearch; results render under the box. */
export function HeroSearch({ placeholder, id = "hero-q" }: { placeholder: string; id?: string }) {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const query = submitted.trim();
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
      {query ? <SiteSearchResults query={query} dark /> : null}
    </div>
  );
}
