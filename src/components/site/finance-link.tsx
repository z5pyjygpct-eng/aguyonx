/**
 * "$ Finances": a small link to a person's official committee page on the Virginia Department of Elections campaign finance
 * reports site. Renders nothing without an official committee URL (never guessed). At least 32px tall so it is easy to tap on a phone.
 */
export function FinanceLink({ url, name }: { url: string | null | undefined; name: string }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" data-finance-link
      aria-label={`Campaign finance reports for ${name} (Virginia Department of Elections, opens in a new tab)`}
      title="Campaign finance reports (Virginia Department of Elections)"
      className="inline-flex min-h-8 shrink-0 items-center rounded-md border border-gold/50 px-2 text-[11px] font-semibold whitespace-nowrap text-gold no-underline hover:border-gold hover:bg-gold/10">
      <span aria-hidden>$</span>&nbsp;Finances
    </a>
  );
}
