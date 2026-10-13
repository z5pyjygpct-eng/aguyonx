/** Find the Moment meeting thumbnail (standard; rendered by scripts/ftm-thumbs.py). Lazy, hides itself if missing. */
export function ftmThumbSrc(venue: string, meetingId: string): string {
  return `/thumbs/${venue}/${meetingId}.webp`;
}

export function FtmThumb({ venue, meetingId, href, className = "" }: { venue: string; meetingId: string; href?: string; className?: string }) {
  const img = (
    <img
      src={ftmThumbSrc(venue, meetingId)}
      alt=""
      loading="lazy"
      decoding="async"
      width={640}
      height={360}
      onError={(e) => ((e.currentTarget.parentElement as HTMLElement | null)?.dataset.ftmThumb ? ((e.currentTarget.parentElement as HTMLElement).style.display = "none") : (e.currentTarget.style.display = "none"))}
      className="aspect-video w-full rounded object-cover"
    />
  );
  const cls = `block w-32 shrink-0 sm:w-36 ${className}`;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" data-ftm-thumb="1" className={cls} aria-hidden tabIndex={-1}>
      {img}
    </a>
  ) : (
    <span data-ftm-thumb="1" className={cls} aria-hidden>
      {img}
    </span>
  );
}
