import type { BodyBlock, Citation, RelatedItem, SourceDoc } from "@/content/types";
import { HearingsChart } from "@/components/story/hearings-chart";
import { XPost } from "@/components/story/x-post";
import { useEffect, useState, type CSSProperties } from "react";

/** The site's light :root tokens, re-applied inside the v4 navy frame for light-only embeds. */
const LIGHT_VARS = {
  "--color-background": "#f6f3ea",
  "--color-foreground": "#0b1a33",
  "--color-card": "#ffffff",
  "--color-card-foreground": "#0b1a33",
  "--color-muted-foreground": "#4a5873",
  "--color-border": "#e3dccb",
  "--color-forest": "#1e4b8e",
  "--color-wash": "#ede8db",
  "--color-popover": "#ffffff",
  "--color-popover-foreground": "#0b1a33",
} as CSSProperties;

export function StoryBody({
  blocks,
  citations,
}: {
  blocks: BodyBlock[];
  citations: Citation[];
}) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} citations={citations} />
      ))}
    </div>
  );
}

function Block({ block, citations }: { block: BodyBlock; citations: Citation[] }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[1.0625rem] leading-[1.75] text-[#F6F3EA] sm:text-lg">
          {block.text}
          {block.cites?.map((id) => {
            const n = citations.findIndex((c) => c.id === id) + 1;
            return (
              <a
                key={id}
                href={`#cite-${id}`}
                className="ml-0.5 align-super font-mono text-xs font-semibold text-gold no-underline hover:text-gold-hover hover:underline"
              >
                [{n}]
              </a>
            );
          })}
        </p>
      );
    case "h2":
      return <h2 className="pt-6 font-serif text-2xl leading-tight font-bold text-gold uppercase tracking-wide sm:text-3xl">{block.text}</h2>;
    case "quote":
      return (
        <blockquote className="rounded-r-lg border-l-4 border-gold bg-navy-700/60 py-4 pr-5 pl-5">
          <p className="font-serif text-xl leading-snug text-white italic">{block.text}</p>
          {block.attrib ? (
            <footer className="mt-2 font-mono text-xs tracking-widest text-gold uppercase">
              {block.attrib}
            </footer>
          ) : null}
        </blockquote>
      );
    case "image":
      return (
        <figure>
          <img
            src={block.src}
            alt={block.alt}
            className="aspect-video w-full rounded-lg object-cover ring-1 ring-navy-line"
          />
          {block.caption ? (
            <figcaption className="mt-2 text-sm text-on-dark-muted">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "x":
      return (
        <XPost
          url={block.url}
          handle={block.handle}
          name={block.name}
          date={block.date}
          text={block.text}
        />
      );
    case "chart":
      // Chart colors are tuned for the light theme: restore light tokens on a light card so data colors stay the same.
      return (
        <div className="rounded-lg bg-white text-[#0b1a33]" style={LIGHT_VARS}>
          <HearingsChart />
        </div>
      );
    case "callout":
      return (
        <aside className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-5 py-4">
          <p className="font-mono text-xs font-bold tracking-widest text-gold uppercase">
            {block.title}
          </p>
          <p className="mt-2 text-base leading-relaxed text-[#F6F3EA]">{block.text}</p>
        </aside>
      );
    default:
      return null;
  }
}

export function Citations({ items }: { items: Citation[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10 rounded-xl border border-navy-line bg-navy-900/60 p-5 sm:p-6">
      <h2 className="font-mono text-xs font-bold tracking-widest text-gold uppercase">
        Citations
      </h2>
      <ol className="mt-4 space-y-3">
        {items.map((c, i) => (
          <li id={`cite-${c.id}`} key={c.id} className="scroll-mt-24 text-sm leading-relaxed text-[#F6F3EA] target:rounded target:bg-gold/15">
            <span className="font-mono text-xs text-gold">{i + 1}. </span>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noreferrer" className="text-white underline decoration-gold/60 underline-offset-4 hover:text-gold">
                {c.label}
              </a>
            ) : (
              c.label
            )}
            {c.note ? <span className="text-on-dark-muted"> — {c.note}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SourceDocs({ items }: { items: SourceDoc[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6">
      <h2 className="font-mono text-xs font-bold tracking-widest text-gold uppercase">
        Source documents
      </h2>
      <ul className="mt-4 divide-y divide-navy-line border-y border-navy-line">
        {items.map((d) => (
          <li key={d.id}>
            <a
              href={d.href}
              download={d.kind !== "link"}
              target={d.kind === "link" ? "_blank" : undefined}
              rel={d.kind === "link" ? "noreferrer" : undefined}
              className="flex min-h-12 items-center justify-between gap-4 py-3 text-sm text-white hover:text-gold hover:underline"
            >
              <span className="min-w-0 break-words">{d.title}</span>
              <span className="shrink-0 rounded border border-gold/60 px-1.5 py-0.5 font-mono text-xs tracking-widest text-gold uppercase">
                {d.kind}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

const RELATED_LABEL: Record<RelatedItem["type"], string> = {
  investigation: "Investigation", ftm: "Find the Moment", recap: "Recap", graphic: "Graphic",
  csv: "CSV", pdf: "PDF", "x-thread": "X thread", link: "Link", video: "Video",
};

function VideoCard({ r }: { r: RelatedItem }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <li>
      <a href={r.href} onClick={(e) => { e.preventDefault(); setOpen(true); }} aria-haspopup="dialog"
        className="flex h-full items-center gap-3 rounded-lg border border-navy-line bg-navy-700 p-4 text-white hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="w-fit rounded border border-gold/60 px-1.5 py-0.5 font-mono text-[11px] tracking-widest text-gold uppercase">{RELATED_LABEL[r.type]}</span>
          <span className="font-semibold leading-snug">{r.title}</span>
          {r.note ? <span className="text-sm text-on-dark-muted">{r.note}</span> : null}
        </span>
        <span className="relative h-16 w-9 shrink-0 overflow-hidden rounded bg-black ring-1 ring-navy-line">
          {r.poster ? <img src={r.poster} alt="" loading="lazy" className="h-full w-full object-cover" /> : null}
          <span className="absolute inset-0 flex items-center justify-center bg-black/30" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </span>
      </a>
      {open ? (
        <div role="dialog" aria-modal="true" aria-label={r.title} onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="relative flex max-h-full flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} className="rounded border border-white/40 px-2 py-1 font-mono text-xs text-white uppercase hover:bg-white/10">Close ✕</button>
            <video controls playsInline autoPlay poster={r.poster} src={r.href}
              className="aspect-[9/16] max-h-[85vh] w-[min(360px,calc(100vw-2rem))] rounded-md bg-black object-contain" />
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function RelatedResources({ items }: { items?: RelatedItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-12" aria-labelledby="related-resources">
      <h2 id="related-resources" className="font-mono text-xs font-bold tracking-widest text-gold uppercase">Related resources</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((r) => {
          const ext = /^https?:/.test(r.href);
          if (r.type === "video") return <VideoCard key={r.href} r={r} />;
          return (
            <li key={r.href}>
              <a href={r.href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}
                className="flex h-full flex-col gap-1.5 rounded-lg border border-navy-line bg-navy-700 p-4 text-white hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <span className="w-fit rounded border border-gold/60 px-1.5 py-0.5 font-mono text-[11px] tracking-widest text-gold uppercase">{RELATED_LABEL[r.type]}</span>
                <span className="font-semibold leading-snug">{r.title}</span>
                {r.note ? <span className="text-sm text-on-dark-muted">{r.note}</span> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
