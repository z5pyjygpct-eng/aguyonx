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
    <blockquote className="rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-700 p-5" cite={url}>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-semibold text-white">{name}</span>
        <span className="font-mono text-xs text-muted-foreground">@{handle}</span>
        <span className="font-mono text-xs text-muted-foreground">{date}</span>
      </p>
      <p className="mt-3 text-base leading-relaxed text-[#F6F3EA]">{text}</p>
      <p className="mt-4">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs tracking-widest text-gold uppercase underline-offset-4 hover:text-gold-hover hover:underline"
        >
          View on X
        </a>
      </p>
    </blockquote>
  );
}
