export function XPost({
  url,
  handle,
  name,
  date,
  text,
}: {
  url: string;
  handle: string;
  name: string;
  date: string;
  text: string;
}) {
  return (
    <blockquote className="border border-border bg-card p-5" cite={url}>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-medium">{name}</span>
        <span className="font-mono text-xs text-muted-foreground">@{handle}</span>
        <span className="font-mono text-xs text-muted-foreground">{date}</span>
      </p>
      <p className="mt-3 text-base leading-relaxed">{text}</p>
      <p className="mt-4">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs tracking-widest text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline"
        >
          View on X
        </a>
      </p>
    </blockquote>
  );
}
