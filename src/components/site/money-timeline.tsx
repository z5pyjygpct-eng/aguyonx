import { useId, useState, type ReactNode } from "react";
import { counted, formatUsd } from "@/lib/finance-summaries";
import {
  availableMonths,
  barPercent,
  compactUsd,
  monthName,
  MONTH_SHORT,
  timelineBars,
  timelineYears,
  type TimelineYear,
} from "@/lib/money-timeline";
import { cn } from "@/lib/utils";

/** Site palette for money charts: gold = money in, coral = money out, emerald = money left over. */
const IN_TONE = "bg-gold";
const OUT_TONE = "bg-[#FF7A85]";
const NET_UP = "text-[#7EE0A0]";
const NET_DOWN = "text-[#FF7A85]";

export type TimelineSelection = { year?: number; month?: number };

function Pill({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3 text-sm font-semibold",
        active ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-800 text-on-dark-muted hover:border-gold hover:text-gold",
      )}
    >
      {children}
    </button>
  );
}

export function TimelineFilters({
  years,
  value,
  onChange,
}: {
  years: TimelineYear[];
  value: TimelineSelection;
  onChange: (v: TimelineSelection) => void;
}) {
  const list = timelineYears(years);
  const first = list[0]?.year;
  const last = list[list.length - 1]?.year;
  const months = availableMonths(list, value.year);
  return (
    <div className="mt-3 rounded-lg border border-navy-line bg-navy-900/50 p-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by year">
        <span className="mr-1 font-mono text-xs tracking-widest text-night-muted uppercase">Year</span>
        <Pill active={value.year == null} onClick={() => onChange({})}>
          All {first && last && first !== last ? `${first}–${last}` : "years"}
        </Pill>
        {list.map((y) => (
          <Pill key={y.year} active={value.year === y.year} onClick={() => onChange({ year: y.year })}>
            {y.year}
          </Pill>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by month">
        <span className="mr-1 font-mono text-xs tracking-widest text-night-muted uppercase">Month</span>
        {value.year == null ? (
          <span className="text-xs text-night-muted">Pick a year to see its months.</span>
        ) : (
          <>
            <Pill active={value.month == null} onClick={() => onChange({ year: value.year })}>
              All of {value.year}
            </Pill>
            {months.map((m) => (
              <Pill
                key={m}
                active={value.month === m}
                label={`${monthName(m)} ${value.year}`}
                onClick={() => onChange({ year: value.year, month: m })}
              >
                {MONTH_SHORT[m - 1]}
              </Pill>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, note, tone }: { label: string; value: string; note?: ReactNode; tone?: string }) {
  return (
    <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-3">
      <div className="text-xs tracking-wide text-night-muted uppercase">{label}</div>
      <div className={cn("font-serif text-2xl font-bold", tone ?? "text-gold")}>{value}</div>
      {note ? <div className="mt-0.5 text-xs text-night-muted">{note}</div> : null}
    </div>
  );
}

/** Raised vs. spent, with the difference, for whatever the filters select. */
export function TimelineTotals({ years, value }: { years: TimelineYear[]; value: TimelineSelection }) {
  const list = timelineYears(years);
  let inCents = 0;
  let outCents = 0;
  let inLabel = "Raised";
  let outLabel = "Spent";
  let inNote: ReactNode = null;
  let outNote: ReactNode = null;
  let period = "";
  if (value.year == null) {
    for (const y of list) {
      inCents += y.raisedCents;
      outCents += y.spentCents;
    }
    period = list.length ? `${list[0].year}–${list[list.length - 1].year}` : "";
    inNote = "Official report totals";
    outNote = "Official report totals";
  } else {
    const y = list.find((v) => v.year === value.year);
    if (!y) return null;
    if (value.month == null) {
      inCents = y.raisedCents;
      outCents = y.spentCents;
      period = String(y.year);
      inNote = `Official report totals · ${formatUsd(y.giftCents)} in ${counted(y.giftCount, "named gift")}`;
      outNote = `Official report totals · ${formatUsd(y.paymentCents)} in ${counted(y.paymentCount, "named payment")}`;
    } else {
      const m = y.months?.find((v) => v.month === value.month);
      inCents = m?.giftCents ?? 0;
      outCents = m?.paymentCents ?? 0;
      inLabel = "Named gifts received";
      outLabel = "Named payments made";
      period = `${monthName(value.month)} ${y.year}`;
      inNote = `${counted(m?.giftCount ?? 0, "gift")}${m?.donorCount != null ? ` from ${counted(m.donorCount, "giver")}` : ""}`;
      outNote = `${counted(m?.paymentCount ?? 0, "payment")}${m?.vendorCount != null ? ` to ${counted(m.vendorCount, "vendor")}` : ""}`;
    }
  }
  const net = inCents - outCents;
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Stat label={`${inLabel}${period ? ` · ${period}` : ""}`} value={formatUsd(inCents)} note={inNote} />
      <Stat label={`${outLabel}${period ? ` · ${period}` : ""}`} value={formatUsd(outCents)} note={outNote} tone="text-[#FF7A85]" />
      <Stat
        label={net >= 0 ? "Took in more than it spent" : "Spent more than it took in"}
        value={`${net >= 0 ? "+" : "−"}${formatUsd(Math.abs(net))}`}
        note={net >= 0 ? "Money in minus money out" : "Paid from money already in the bank"}
        tone={net >= 0 ? NET_UP : NET_DOWN}
      />
    </div>
  );
}

/** Grouped bar chart: gold = money in, coral = money out. Click a month (or year) to filter. */
export function RaisedSpentChart({
  years,
  value,
  onChange,
  subject,
}: {
  years: TimelineYear[];
  value: TimelineSelection;
  onChange: (v: TimelineSelection) => void;
  subject: string;
}) {
  const captionId = useId();
  const [showTable, setShowTable] = useState(false);
  const bars = timelineBars(years, value.year);
  if (!bars.length) return null;
  const monthly = value.year != null;
  const max = Math.max(1, ...bars.map((b) => Math.max(b.inCents, b.outCents)));
  const inLabel = monthly ? "Named gifts received" : "Raised";
  const outLabel = monthly ? "Named payments made" : "Spent";
  const title = monthly
    ? `Money in vs. money out by month, ${value.year}`
    : `Raised vs. spent by year, ${bars[0].label}–${bars[bars.length - 1].label}`;
  return (
    <figure className="mt-4 rounded-lg border border-navy-line bg-navy-800 p-4" aria-labelledby={captionId}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-serif text-lg font-semibold">{title}</h4>
        <ul className="flex flex-wrap gap-4 text-xs text-on-dark-muted">
          <li className="flex items-center gap-1.5">
            <span className={cn("inline-block size-3 rounded-sm", IN_TONE)} aria-hidden />
            {inLabel}
          </li>
          <li className="flex items-center gap-1.5">
            <span className={cn("inline-block size-3 rounded-sm", OUT_TONE)} aria-hidden />
            {outLabel}
          </li>
        </ul>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div
          className={cn("flex h-56 items-end gap-2 border-b border-navy-line pb-0", monthly ? "min-w-[560px]" : "min-w-[360px]")}
          role="img"
          aria-label={`${title}. ${bars.map((b) => `${b.label}: ${inLabel.toLowerCase()} ${formatUsd(b.inCents)}, ${outLabel.toLowerCase()} ${formatUsd(b.outCents)}`).join("; ")}.`}
        >
          {bars.map((b) => {
            const active = monthly ? value.month === b.month : false;
            const dim = monthly && value.month != null && !active;
            return (
              <button
                key={b.key}
                type="button"
                tabIndex={-1}
                aria-hidden
                title={`${b.label}: ${inLabel} ${formatUsd(b.inCents)} · ${outLabel} ${formatUsd(b.outCents)}`}
                onClick={() =>
                  monthly
                    ? onChange(value.month === b.month ? { year: value.year } : { year: value.year, month: b.month })
                    : onChange({ year: b.year })
                }
                className={cn(
                  "group flex h-full min-w-0 flex-1 cursor-pointer items-end justify-center gap-1 rounded-t-md px-0.5 pt-5 hover:bg-navy-600/40",
                  active && "bg-navy-600/60",
                  dim && "opacity-40",
                )}
              >
                {[
                  { cents: b.inCents, tone: IN_TONE },
                  { cents: b.outCents, tone: OUT_TONE },
                ].map((bar, i) => (
                  <span key={i} className="relative flex h-full w-1/2 max-w-10 items-end">
                    <span className={cn("block w-full rounded-t-sm", bar.tone)} style={{ height: `${barPercent(bar.cents, max)}%` }}>
                      {!monthly ? (
                        <span className="absolute -top-0.5 left-1/2 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap text-[10px] sm:block font-semibold text-on-dark-muted">
                          {compactUsd(bar.cents)}
                        </span>
                      ) : null}
                    </span>
                  </span>
                ))}
              </button>
            );
          })}
        </div>
        <div className={cn("mt-1 flex gap-2", monthly ? "min-w-[560px]" : "min-w-[360px]")} aria-hidden>
          {bars.map((b) => (
            <span
              key={b.key}
              className={cn(
                "flex-1 text-center text-xs font-semibold",
                monthly && value.month === b.month ? "text-gold" : "text-on-dark-muted",
              )}
            >
              {b.shortLabel}
            </span>
          ))}
        </div>
      </div>
      <figcaption id={captionId} className="mt-3 text-xs text-night-muted">
        {monthly ? (
          <>
            Figure. Named gifts received vs. named payments made by {subject} in each month of {value.year}, by the date on
            each line of the state report. Gifts of $100 or less are reported only as a total, so monthly bars are lower than
            the official yearly totals. Tap a month to filter. Source: Virginia Department of Elections campaign finance
            reports.
          </>
        ) : (
          <>
            Figure. Money raised vs. money spent by {subject} each year since 2021. Official totals from each scheduled state
            report, counted in the year the report period ended. Not adjusted for inflation. Tap a year to see its months.
            Source: Virginia Department of Elections campaign finance reports.
          </>
        )}
      </figcaption>
      <button
        type="button"
        aria-expanded={showTable}
        onClick={() => setShowTable((v) => !v)}
        className="mt-2 text-xs font-semibold text-gold hover:underline"
      >
        {showTable ? "Hide the numbers" : "Show the numbers as a table"}
      </button>
      {showTable ? (
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy-line text-xs tracking-wide text-night-muted uppercase">
              <th className="py-1.5 font-semibold">{monthly ? "Month" : "Year"}</th>
              <th className="py-1.5 text-right font-semibold">{inLabel}</th>
              <th className="py-1.5 text-right font-semibold">{outLabel}</th>
              <th className="py-1.5 text-right font-semibold">Difference</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((b) => {
              const net = b.inCents - b.outCents;
              return (
                <tr key={b.key} className="border-b border-navy-line/50">
                  <td className="py-1.5">{b.label}</td>
                  <td className="py-1.5 text-right text-gold">{formatUsd(b.inCents)}</td>
                  <td className="py-1.5 text-right text-[#FF7A85]">{formatUsd(b.outCents)}</td>
                  <td className={cn("py-1.5 text-right", net >= 0 ? NET_UP : NET_DOWN)}>
                    {net >= 0 ? "+" : "−"}
                    {formatUsd(Math.abs(net))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}
    </figure>
  );
}

/** Hub view: every sitting legislator combined, filterable by year and month. */
export function AllLegislatorsTimeline({ totals, memberCount }: { totals: (TimelineYear & { members: number })[]; memberCount: number }) {
  const [sel, setSel] = useState<TimelineSelection>({});
  const years = timelineYears(totals);
  if (!years.length) return null;
  const picked = sel.year != null ? years.find((y) => y.year === sel.year) : undefined;
  return (
    <section className="mt-8 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6" aria-labelledby="all-money-heading">
      <p className="font-mono text-[10px] font-semibold tracking-widest text-[#8FCB9B] uppercase sm:text-xs">All {memberCount} sitting legislators</p>
      <h2 id="all-money-heading" className="mt-1 font-serif text-2xl font-semibold uppercase">
        Raised vs. spent, <span className="text-gold">2021 to now</span>
      </h2>
      <p className="mt-1 text-sm text-on-dark-muted">
        The campaign committees of today's delegates and senators, added together by year — or by month once you pick a year.
        {picked ? ` ${picked.members} of them filed reports covering ${picked.year}.` : ""} Search a name above to see one
        person's money by year and month.
      </p>
      <TimelineFilters years={years} value={sel} onChange={setSel} />
      <TimelineTotals years={years} value={sel} />
      <RaisedSpentChart years={years} value={sel} onChange={setSel} subject="the campaign committees of all sitting legislators combined" />
      <p className="mt-2 text-xs text-night-muted">
        Money one legislator's committee gave to another's is counted for both, so these combined totals are a little higher
        than the money that actually entered Virginia politics. Members first elected after 2021 add to later years only.
      </p>
    </section>
  );
}
