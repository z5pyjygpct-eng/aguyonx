import type { BodyBlock, Citation, SourceDoc } from "@/content/types";
import { HearingsChart } from "@/components/story/hearings-chart";
import { XPost } from "@/components/story/x-post";

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
        <p className="text-base leading-relaxed">
          {block.text}
          {block.cites?.map((id) => {
            const n = citations.findIndex((c) => c.id === id) + 1;
            return (
              <a
                key={id}
                href={`#cite-${id}`}
                className="ml-0.5 font-mono text-xs text-muted-foreground no-underline hover:text-foreground"
              >
                [{n}]
              </a>
            );
          })}
        </p>
      );
    case "h2":
      return <h2 className="pt-4 font-serif text-2xl font-medium">{block.text}</h2>;
    case "quote":
      return (
        <blockquote className="border-l-2 border-forest pl-5">
          <p className="font-serif text-xl leading-snug italic">{block.text}</p>
          {block.attrib ? (
            <footer className="mt-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
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
            className="aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10"
          />
          {block.caption ? (
            <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption>
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
      return <HearingsChart />;
    case "callout":
      return (
        <aside className="border border-border bg-wash px-5 py-4">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {block.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{block.text}</p>
        </aside>
      );
    default:
      return null;
  }
}

export function Citations({ items }: { items: Citation[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-14 border-t border-border pt-8">
      <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Citations
      </h2>
      <ol className="mt-4 space-y-3">
        {items.map((c, i) => (
          <li id={`cite-${c.id}`} key={c.id} className="text-sm leading-relaxed">
            <span className="font-mono text-xs text-muted-foreground">{i + 1}. </span>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                {c.label}
              </a>
            ) : (
              c.label
            )}
            {c.note ? <span className="text-muted-foreground"> — {c.note}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SourceDocs({ items }: { items: SourceDoc[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Source documents
      </h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {items.map((d) => (
          <li key={d.id}>
            <a
              href={d.href}
              download={d.kind !== "link"}
              target={d.kind === "link" ? "_blank" : undefined}
              rel={d.kind === "link" ? "noreferrer" : undefined}
              className="flex min-h-12 items-center justify-between gap-4 py-3 text-sm hover:underline"
            >
              <span>{d.title}</span>
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {d.kind}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
