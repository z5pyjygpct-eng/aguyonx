import { type FormEvent, useEffect, useState } from "react";
import { SiteSearchResults } from "@/components/site/site-search-results";

/** Dark-hero search box (v4). Same site index as HomeSearch; results render under the box. */
/** True below Tailwind's sm breakpoint (640px). False during SSR, then follows the viewport. */
function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639.98px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

export function HeroSearch({ placeholder, placeholderNarrow, id = "hero-q" }: { placeholder: string; placeholderNarrow?: string; id?: string }) {
  const narrow = useNarrow();
  // ?q= runs a search on load (used by /how-to examples and the 404 page)
  useEffect(() => {
    if (id !== "hero-q") return;
    const v = new URLSearchParams(window.location.search).get("q");
    if (v) { setQ(v); setSubmitted(v); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
          placeholder={narrow && placeholderNarrow ? placeholderNarrow : placeholder}
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
