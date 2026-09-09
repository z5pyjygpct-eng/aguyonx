import { useMemo, useState, type FormEvent } from "react";
import { ExternalLink, FileText, Search } from "lucide-react";
import {
  LCPS_POLICIES,
  LCPS_POLICY_SECTIONS,
  lcpsPolicyHref,
  lcpsPolicyIsHosted,
  type LcpsPolicy,
} from "@/content/lcps-policies";
import { cn } from "@/lib/utils";

const RESULT_CAP = 80;

function matchesQuery(p: LcpsPolicy, q: string): boolean {
  if (!q) return true;
  const hay = `${p.code} ${p.title} ${p.section}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => hay.includes(token));
}

export function LcpsPolicySearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [section, setSection] = useState<string | "all">("all");

  const query = submitted.trim();

  const filtered = useMemo(() => {
    return LCPS_POLICIES.filter((p) => {
      if (section !== "all" && p.section !== section) return false;
      return matchesQuery(p, query);
    });
  }, [query, section]);

  const shown = filtered.slice(0, RESULT_CAP);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(q.trim());
  }

  return (
    <div className="rounded-md border border-border bg-card px-4 py-6 sm:px-6 sm:py-8">
      <form role="search" onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="lcps-policy-q" className="sr-only">
          Search LCPS policies by code, title, or section
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="lcps-policy-q"
            type="search"
            name="q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (!e.target.value.trim()) setSubmitted("");
            }}
            placeholder="Code, title, or section…"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-12 w-full rounded-md border border-input bg-paper pr-4 pl-11 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-[#1E4B8E] px-5 font-sans text-sm font-semibold tracking-[0.12em] text-white uppercase transition-[background-color] hover:bg-[#163a6e]"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label
          htmlFor="lcps-policy-section"
          className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          Section
        </label>
        <select
          id="lcps-policy-section"
          value={section}
          onChange={(e) => setSection(e.target.value === "all" ? "all" : e.target.value)}
          className="h-9 max-w-full rounded-md border border-input bg-paper px-3 font-sans text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <option value="all">All sections</option>
          {LCPS_POLICY_SECTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSection("all")}
          className={cn(
            "rounded-full border border-border bg-wash px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-[background-color,border-color,color] hover:border-[#0d7377] hover:bg-[#e4f2f2] hover:text-[#095456]",
            section === "all" && "border-[#0d7377] bg-[#e4f2f2] text-[#095456]",
          )}
        >
          All
        </button>
        {LCPS_POLICY_SECTIONS.map((s) => {
          const short = s.split(" - ")[0] ?? s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={cn(
                "rounded-full border border-border bg-wash px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-[background-color,border-color,color] hover:border-[#0d7377] hover:bg-[#e4f2f2] hover:text-[#095456]",
                section === s && "border-[#0d7377] bg-[#e4f2f2] text-[#095456]",
              )}
            >
              {short}
            </button>
          );
        })}
      </div>

      <p
        className="mt-5 min-h-[1.25rem] font-mono text-xs text-muted-foreground"
        aria-live="polite"
      >
        {filtered.length === 0
          ? `No policies match${query ? ` “${query}”` : ""}${
              section !== "all" ? ` in ${section}` : ""
            }.`
          : `${filtered.length} polic${filtered.length === 1 ? "y" : "ies"}${
              filtered.length > RESULT_CAP ? ` · showing first ${RESULT_CAP}` : ""
            }`}
      </p>

      {shown.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {shown.map((p) => {
            const href = lcpsPolicyHref(p);
            const hosted = lcpsPolicyIsHosted(p);
            return (
              <li key={p.itemId}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-md border border-border bg-paper px-4 py-3 transition-[background-color] duration-150 hover:bg-wash"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#1E4B8E]/30 text-[#1E4B8E]">
                    {hosted ? (
                      <FileText className="size-4" aria-hidden />
                    ) : (
                      <ExternalLink className="size-3.5" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#1E4B8E]">
                        {p.code}
                      </span>
                      <span className="font-sans text-base font-semibold text-foreground">
                        {p.title}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {p.section}
                      {hosted ? " · Hosted PDF" : " · BoardDocs"}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
