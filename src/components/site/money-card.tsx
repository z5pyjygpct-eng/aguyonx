import { useEffect, useId, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Download, ExternalLink } from "lucide-react";
import {
  committeeUrl,
  formatDate,
  formatPeriod,
  formatShortDate,
  formatUsd,
  kindLabel,
  lateFilingCount,
  percent,
  profileMoneyHref,
  reportUrl,
  reportXmlUrl,
  counted,
  cyclePhrase,
  familiarFirstName,
  familyName,
  type DonorKind,
  type FinanceDonor,
  type FinanceFiling,
  type FinanceHistory,
  type FinanceHistoryMonthGiver,
  type FinanceHistoryYear,
  type FinanceSpendItem,
  type FinanceSummary,
} from "@/lib/finance-summaries";
import { CampaignMoneyLookup } from "@/components/site/campaign-money-lookup";
import { RaisedSpentChart, TimelineFilters, TimelineTotals, type TimelineSelection } from "@/components/site/money-timeline";
import { monthName, timelineYears } from "@/lib/money-timeline";
import { loadFinanceSummary } from "@/lib/finance-summaries-load";
import { historySlice, loadMemberHistory, type HistoryLedger } from "@/lib/campaign-money-history";
import {
  DOLLAR_RANGE_PILLS,
  DONOR_TYPE_PILLS,
  filterFinanceDonors,
  toggleList,
  type DollarRangePill,
  type DonorTypePill,
} from "@/lib/campaign-money-filters";
import { cn } from "@/lib/utils";

const GLOSSARY: Record<string, string> = {
  "Money in the bank": "The campaign's official ending balance on its latest state report — cash left after raising and spending in that period.",
  "Cash on hand": "The same figure as money in the bank: the ending balance on the latest state report.",
  "Raised this cycle": "Official total receipts in the election cycle named on the report, including cash gifts, gifts of goods or services, and other receipts.",
  "Spent this cycle": "Official total disbursements in that same election cycle, including cash spending and the value of in-kind gifts the campaign reported as spent.",
  "In-kind": "A gift of goods or services instead of cash — printing, mailing, or staff time, for example — reported at its value.",
  "Schedule A": "The state's list of itemized cash gifts, generally more than $100 in a cycle.",
  "Ending balance": "The official money-in-the-bank figure on Schedule H of a state report.",
  PAC: "A political action committee — an organization that raises and gives money in elections.",
  "Unitemized gifts": "Gifts of $100 or less in a cycle. Virginia law lets campaigns report those as a single total, without naming the giver.",
  "Election cycle": "The period the committee named on the report, usually running through the next election for that office.",
  Amendment: "A later version of the same report. We always use the latest amendment so totals are not counted twice.",
  Transfer: "Money given by another candidate's committee or a political party committee.",
  "Filing on time": "The report was submitted on or before the state's due date.",
};

function MoneyTerm({ term, children }: { term: string; children?: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const def = GLOSSARY[term];
  if (!def) return <>{children ?? term}</>;
  return (
    <span className="relative inline">
      <button
        type="button"
        className="cursor-help border-b border-dotted border-gold/80 text-left"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        {children ?? term}
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute z-30 mt-2 w-72 max-w-[80vw] rounded-md border border-navy-line bg-navy-900 p-3 text-left text-xs font-normal normal-case tracking-normal text-on-dark-muted shadow-lg"
        >
          {def}
        </span>
      ) : null}
    </span>
  );
}

function SourceLine({ reportId, filed, amendment, extra }: { reportId?: string; filed?: string; amendment?: number; extra?: ReactNode }) {
  if (!reportId) return extra ? <p className="mt-3 text-xs text-night-muted">{extra}</p> : null;
  return (
    <p className="mt-3 text-xs text-night-muted">
      {amendment ? `Amendment ${amendment}, ` : ""}
      From the state report filed {formatDate(filed)} (Report{" "}
      <a href={reportUrl(reportId)} target="_blank" rel="noreferrer" className="text-gold hover:underline">
        {reportId}
        <ExternalLink className="ml-1 inline size-3" aria-hidden />
      </a>
      ).{" "}
      <a href={reportXmlUrl(reportId)} target="_blank" rel="noreferrer" className="text-gold hover:underline">
        Official XML
        <ExternalLink className="ml-1 inline size-3" aria-hidden />
      </a>
      . {extra}
    </p>
  );
}

function Bar({
  parts,
}: {
  parts: { label: string; cents: number; count?: number; tone: string }[];
}) {
  const total = parts.reduce((s, p) => s + p.cents, 0);
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-navy-800" role="img" aria-label={parts.map((p) => `${p.label} ${percent(p.cents, total)}%`).join(", ")}>
        {parts.map((p) =>
          p.cents > 0 ? (
            <span key={p.label} className={p.tone} style={{ width: `${Math.max(percent(p.cents, total), total ? 0.8 : 0)}%` }} title={`${p.label}: ${formatUsd(p.cents)}`} />
          ) : null,
        )}
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {parts.map((p) => (
          <li key={p.label} className="text-sm">
            <div className="text-xs tracking-wide text-night-muted uppercase">{p.label}</div>
            <div className="font-serif text-xl font-bold text-white">{formatUsd(p.cents)}</div>
            <div className="text-xs text-night-muted">
              {percent(p.cents, total)}%{p.count != null ? ` · ${p.count} ${p.count === 1 ? "giver" : "givers"}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Box({
  label,
  value,
  note,
  term,
}: {
  label: string;
  value: string;
  note: ReactNode;
  term?: string;
}) {
  return (
    <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-4">
      <div className="text-xs tracking-wide text-on-dark-muted uppercase">{term ? <MoneyTerm term={term}>{label}</MoneyTerm> : label}</div>
      <div className="mt-1 font-serif text-3xl font-bold text-gold sm:text-4xl">{value}</div>
      <div className="mt-2 text-xs text-night-muted">{note}</div>
    </div>
  );
}

function personTitle(s: FinanceSummary): string {
  return `${s.honorific} ${s.name}`;
}

function OfficialCommitteeLink({ s }: { s: FinanceSummary }) {
  return (
    <a href={committeeUrl(s.committeeId)} target="_blank" rel="noreferrer" className="text-gold hover:underline">
      {s.committeeName} ({s.committeeCode})
      <ExternalLink className="ml-1 inline size-3" aria-hidden />
    </a>
  );
}

function FilingRow({ f }: { f: FinanceFiling }) {
  const tone = f.onTime === false ? "text-[#FF7A85]" : f.onTime === true ? "text-[#7EE0A0]" : "text-night-muted";
  const label = f.onTime === false ? "Late" : f.onTime === true ? "On time" : "Date missing";
  return (
    <li className="flex flex-col gap-1 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-semibold">{formatPeriod(f.start, f.end)}</div>
        <div className="text-xs text-night-muted">
          Filed {formatShortDate(f.filed)}
          {f.due ? ` · due ${formatShortDate(f.due)}` : ""}
          {f.amendment ? ` · Amendment ${f.amendment}` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={`text-xs font-semibold tracking-wide uppercase ${tone}`}>{label}</span>
        <a href={reportUrl(f.reportId)} target="_blank" rel="noreferrer" className="text-sm text-gold hover:underline">
          Report {f.reportId}
          <ExternalLink className="ml-1 inline size-3" aria-hidden />
        </a>
      </div>
    </li>
  );
}


function groupSpendItems(items: FinanceSpendItem[]) {
  const map = new Map<string, { name: string; cents: number; payments: FinanceSpendItem[] }>();
  for (const item of items) {
    const key = item.name || "Not stated";
    const group = map.get(key) ?? { name: key, cents: 0, payments: [] };
    group.cents += item.cents;
    group.payments.push(item);
    map.set(key, group);
  }
  for (const group of map.values()) {
    group.payments.sort((a, b) => b.cents - a.cents || (a.date ?? "").localeCompare(b.date ?? ""));
  }
  return [...map.values()].sort((a, b) => b.cents - a.cents || a.name.localeCompare(b.name));
}

function SpendingCategory({ category }: { category: { name: string; cents: number; items?: FinanceSpendItem[] } }) {
  const [open, setOpen] = useState(false);
  const items = category.items ?? [];
  const vendors = groupSpendItems(items);
  const paymentCount = items.length;
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-navy-600/40"
      >
        <span className="flex min-w-0 items-start gap-2">
          <ChevronDown className={`mt-0.5 size-4 shrink-0 text-gold transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
          <span className="min-w-0">
            <span className="block font-medium">{category.name}</span>
            <span className="block text-xs text-night-muted">
              {paymentCount ? `${paymentCount} ${paymentCount === 1 ? "payment" : "payments"}` : "No itemized payments"}
              {paymentCount ? ` · ${open ? "Hide who was paid" : "See who was paid"}` : ""}
            </span>
          </span>
        </span>
        <span className="shrink-0 font-serif text-lg font-bold text-gold">{formatUsd(category.cents)}</span>
      </button>
      {open ? (
        <ul className="divide-y divide-navy-line/50 border-t border-navy-line/50 bg-navy-900/40">
          {vendors.length === 0 ? (
            <li className="px-4 py-3 pl-10 text-sm text-on-dark-muted">No itemized payments in the reports we have loaded for this category.</li>
          ) : (
            vendors.map((vendor) => (
              <li key={vendor.name} className="px-4 py-3 pl-10">
                <div className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 font-semibold">{vendor.name}</span>
                  <span className="shrink-0 font-serif text-base font-bold text-gold">{formatUsd(vendor.cents)}</span>
                </div>
                <ul className="mt-1 space-y-1">
                  {vendor.payments.map((payment, i) => (
                    <li key={`${vendor.name}-${payment.date}-${payment.item}-${i}`} className="flex items-baseline justify-between gap-3 text-xs text-on-dark-muted">
                      <span className="min-w-0">
                        {payment.item || "Not stated"}
                        {payment.date ? ` · ${formatShortDate(payment.date)}` : ""}
                      </span>
                      <span className="shrink-0">{formatUsd(payment.cents)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </li>
  );
}


const LIST_PAGE_SIZE = 10;

function pageItems(page: number, pages: number): Array<number | "gap"> {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, pages, page, page - 1, page + 1, page - 2, page + 2]);
  const nums = [...keep].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  for (const n of nums) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && n > prev + 1) out.push("gap");
    out.push(n);
  }
  return out;
}

function MoneyPages({
  page,
  pages,
  onPage,
  label,
}: {
  page: number;
  pages: number;
  onPage: (n: number) => void;
  label: string;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label={label} className="mt-3 flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs tracking-widest text-night-muted uppercase">Pages:</span>
      {pageItems(page, pages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-night-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPage(item)}
            className={cn(
              "inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-sm font-semibold",
              item === page
                ? "border-gold bg-gold text-navy-900"
                : "border-navy-line bg-navy-800 text-on-dark-muted hover:border-gold hover:text-gold",
            )}
          >
            {item}
          </button>
        ),
      )}
    </nav>
  );
}



const SMALL_GIFT_NOTE =
  "Gifts of $100 or less are often reported only as a lump sum, without a name, so they may not appear in this list.";

const HISTORY_LIST_NOTE =
  "Raised and spent by year are the official per-report totals (Schedule H) for scheduled reports whose period ended that year. Itemized gifts and payments are the named rows dated that year. Gifts of $100 or less are often reported only as a lump sum, without a name. Large-contribution (48-hour) reports repeat gifts already on scheduled reports, so they are not counted twice.";

function useHistoryLedger(csvPath: string | null | undefined) {
  const [ledger, setLedger] = useState<HistoryLedger | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(csvPath ? "loading" : "idle");
  useEffect(() => {
    if (!csvPath) {
      setLedger(null);
      setStatus("idle");
      return;
    }
    let on = true;
    setStatus("loading");
    loadMemberHistory(csvPath)
      .then((data) => {
        if (on) {
          setLedger(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (on) {
          setLedger(null);
          setStatus("error");
        }
      });
    return () => {
      on = false;
    };
  }, [csvPath]);
  return { ledger, status };
}

function FilterChip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-xs font-medium",
        pressed
          ? "border-gold bg-gold text-navy-900"
          : "border-navy-line bg-navy-800 text-on-dark-muted hover:border-gold hover:text-gold",
      )}
    >
      {label}
    </button>
  );
}

function usePaged<T>(items: T[], resetKey: string) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / LIST_PAGE_SIZE));
  const safe = Math.min(page, pages);
  useEffect(() => {
    setPage(1);
  }, [resetKey]);
  const slice = items.slice((safe - 1) * LIST_PAGE_SIZE, safe * LIST_PAGE_SIZE);
  return { page: safe, pages, setPage, slice, start: (safe - 1) * LIST_PAGE_SIZE };
}

function DonorRow({ donor, index }: { donor: FinanceDonor; index: number }) {
  const [open, setOpen] = useState(false);
  const gifts = donor.gifts ?? [];
  const giftWord = donor.count === 1 ? "gift" : "gifts";
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-navy-600/40"
      >
        <span className="flex min-w-0 items-start gap-2">
          <ChevronDown className={`mt-0.5 size-4 shrink-0 text-gold transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
          <span className="min-w-0">
            <span className="block font-semibold">
              <span className="mr-2 font-mono text-xs text-night-muted">{index}.</span>
              {donor.name}
            </span>
            <span className="block text-xs text-night-muted">
              {kindLabel(donor.kind as DonorKind)}
              {donor.city || donor.state ? ` · ${[donor.city, donor.state].filter(Boolean).join(", ")}` : ""}
              {donor.count > 1 ? ` · ${donor.count} ${giftWord}` : ""}
              {donor.inKindCents ? ` · includes ${formatUsd(donor.inKindCents)} in-kind` : ""}
              {` · ${open ? "Hide gifts" : "See gifts"}`}
            </span>
          </span>
        </span>
        <span className="shrink-0 font-serif text-xl font-bold text-gold">{formatUsd(donor.cents)}</span>
      </button>
      {open ? (
        <ul className="divide-y divide-navy-line/50 border-t border-navy-line/50 bg-navy-900/40">
          {gifts.length === 0 ? (
            <li className="px-4 py-3 pl-10 text-sm text-on-dark-muted">No itemized gifts in the reports we have loaded for this donor.</li>
          ) : (
            gifts.map((gift, i) => (
              <li key={`${gift.date ?? "undated"}-${gift.cents}-${i}`} className="px-4 py-3 pl-10">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold">{gift.type === "inkind" ? "In-kind" : "Direct"}</span>
                    {gift.date ? ` · ${formatShortDate(gift.date)}` : ""}
                    {gift.item ? ` · ${gift.item}` : ""}
                  </span>
                  <span className="shrink-0 font-serif text-base font-bold text-gold">{formatUsd(gift.cents)}</span>
                </div>
                {donor.kind === "individual" && (gift.occupation || gift.employer) ? (
                  <div className="mt-1 text-xs text-on-dark-muted">
                    {[
                      gift.occupation ? `Occupation: ${gift.occupation}` : null,
                      gift.employer ? `Employer: ${gift.employer}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                ) : null}
                {gift.reportId ? (
                  <a
                    href={reportUrl(gift.reportId)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                  >
                    State report {gift.reportId}
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : null}
              </li>
            ))
          )}
          {donor.donorId ? (
            <li className="px-4 py-3 pl-10">
              <Link
                to="/campaign-money"
                search={{ donor: donor.donorId }}
                className="text-sm font-semibold text-gold hover:underline"
              >
                See all official gifts from this donor
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}
    </li>
  );
}

function VendorRow({ vendor }: { vendor: { name: string; cents: number; count: number; items?: FinanceSpendItem[] } }) {
  const [open, setOpen] = useState(false);
  const items = vendor.items ?? [];
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-navy-600/40"
      >
        <span className="flex min-w-0 items-start gap-2">
          <ChevronDown className={`mt-0.5 size-4 shrink-0 text-gold transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
          <span className="min-w-0">
            <span className="block font-medium">{vendor.name}</span>
            <span className="block text-xs text-night-muted">
              {vendor.count} {vendor.count === 1 ? "payment" : "payments"}
              {` · ${open ? "Hide payments" : "See payments"}`}
            </span>
          </span>
        </span>
        <span className="shrink-0 font-serif text-lg font-bold text-gold">{formatUsd(vendor.cents)}</span>
      </button>
      {open ? (
        <ul className="divide-y divide-navy-line/50 border-t border-navy-line/50 bg-navy-900/40">
          {items.length === 0 ? (
            <li className="px-4 py-3 pl-10 text-sm text-on-dark-muted">No itemized payments in the reports we have loaded for this vendor.</li>
          ) : (
            items.map((payment, i) => (
              <li key={`${vendor.name}-${payment.date}-${payment.item}-${i}`} className="flex items-baseline justify-between gap-3 px-4 py-3 pl-10 text-xs text-on-dark-muted">
                <span className="min-w-0">
                  {payment.item || "Not stated"}
                  {payment.date ? ` · ${formatShortDate(payment.date)}` : ""}
                  {payment.category ? ` · ${payment.category}` : ""}
                </span>
                <span className="shrink-0 font-serif text-sm font-bold text-gold">{formatUsd(payment.cents)}</span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </li>
  );
}

function HistoryYearRow({
  y,
  firstName,
  defaultOpen = false,
  donors,
  vendors,
  loading = false,
}: {
  y: FinanceHistoryYear;
  firstName: string;
  defaultOpen?: boolean;
  donors?: FinanceDonor[];
  vendors?: { name: string; cents: number; count: number; items?: FinanceSpendItem[] }[];
  loading?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const allDonors = donors ?? y.donors;
  const allVendors = vendors ?? y.vendors;
  const full = donors != null;
  const donorPager = usePaged(allDonors, `${y.year}-donors-${allDonors.length}`);
  const vendorPager = usePaged(allVendors, `${y.year}-vendors-${allVendors.length}`);
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-navy-600/40"
      >
        <span className="flex min-w-0 items-start gap-2">
          <ChevronDown className={`mt-1 size-4 shrink-0 text-gold transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
          <span className="min-w-0">
            <span className="block font-serif text-lg font-bold">{y.year}</span>
            <span className="block text-xs text-night-muted">
              {counted(y.reports, "report")} · {counted(y.donorCount, "named giver")} ·{" "}
              {counted(y.vendorCount, "vendor")}{y.committees.length ? ` · ${y.committees.join(", ")}` : ""}
              {` · ${open ? "Hide details" : "See details"}`}
            </span>
          </span>
        </span>
        <span className="grid shrink-0 grid-cols-2 gap-x-4 text-right">
          <span className="text-[10px] tracking-wide text-night-muted uppercase">Raised</span>
          <span className="text-[10px] tracking-wide text-night-muted uppercase">Spent</span>
          <span className="font-serif text-base font-bold text-gold sm:text-lg">{formatUsd(y.raisedCents)}</span>
          <span className="font-serif text-base font-bold text-on-dark-muted sm:text-lg">{formatUsd(y.spentCents)}</span>
        </span>
      </button>
      {open ? (
        <div className="border-t border-navy-line/50 bg-navy-900/40 px-4 py-4">
          <p className="text-xs text-on-dark-muted">
            {formatUsd(y.giftCents)} in {counted(y.giftCount, "itemized gift")} and {formatUsd(y.paymentCents)} in{" "}
            {counted(y.paymentCount, "itemized payment")} dated {y.year}
            {typeof y.endingBalanceCents === "number" ? ` · money in the bank at the end of the last ${y.year} report: ${formatUsd(y.endingBalanceCents)}` : ""}.
          </p>
          <h4 className="mt-4 text-xs font-semibold tracking-wide text-gold uppercase">
            {full ? `All itemized donors in ${y.year}` : `Top givers to ${firstName} in ${y.year}`}
          </h4>
          <p className="mt-1 text-xs text-night-muted">
            {full
              ? `Every named giver with a gift dated ${y.year}, totaled for the year, shown ${LIST_PAGE_SIZE} at a time. Tap a name to see each official gift. ${SMALL_GIFT_NOTE}`
              : loading
                ? `Loading every named donor for ${y.year}…`
                : `Largest named givers dated ${y.year}. ${SMALL_GIFT_NOTE}`}
          </p>
          {allDonors.length ? (
            <>
              <ol className="mt-2 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
                {donorPager.slice.map((d, i) => (
                  <DonorRow key={`${y.year}-${d.name}`} donor={d} index={donorPager.start + i + 1} />
                ))}
              </ol>
              <MoneyPages page={donorPager.page} pages={donorPager.pages} onPage={donorPager.setPage} label={`${y.year} donor pages`} />
              {allDonors.length > LIST_PAGE_SIZE ? (
                <p className="mt-2 text-xs text-night-muted">
                  Showing {donorPager.start + 1}–{Math.min(donorPager.start + LIST_PAGE_SIZE, allDonors.length)} of {allDonors.length.toLocaleString()}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-sm text-on-dark-muted">
              {loading ? `Loading every named donor for ${y.year}…` : `No itemized gifts dated ${y.year}.`}
            </p>
          )}
          <h4 className="mt-5 text-xs font-semibold tracking-wide text-gold uppercase">
            {full ? `All itemized payments in ${y.year}` : `Top vendors paid in ${y.year}`}
          </h4>
          <p className="mt-1 text-xs text-night-muted">
            {full
              ? `Every named payee with a payment dated ${y.year}, shown ${LIST_PAGE_SIZE} at a time. Tap a payee to see the purpose, date, and amount of each official payment.`
              : loading
                ? `Loading every named payment for ${y.year}…`
                : `Largest named payees dated ${y.year}.`}
          </p>
          {allVendors.length ? (
            <>
              <ul className="mt-2 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
                {vendorPager.slice.map((v) => (
                  <VendorRow key={`${y.year}-${v.name}`} vendor={v} />
                ))}
              </ul>
              <MoneyPages page={vendorPager.page} pages={vendorPager.pages} onPage={vendorPager.setPage} label={`${y.year} payment pages`} />
              {allVendors.length > LIST_PAGE_SIZE ? (
                <p className="mt-2 text-xs text-night-muted">
                  Showing {vendorPager.start + 1}–{Math.min(vendorPager.start + LIST_PAGE_SIZE, allVendors.length)} of {allVendors.length.toLocaleString()}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-sm text-on-dark-muted">
              {loading ? `Loading every named payment for ${y.year}…` : `No itemized payments dated ${y.year}.`}
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}

function MonthGiverList({ rows, total, noun, emptyText }: { rows: FinanceHistoryMonthGiver[]; total?: number; noun: "giver" | "vendor"; emptyText: string }) {
  if (!rows.length) return <p className="mt-2 text-sm text-on-dark-muted">{emptyText}</p>;
  return (
    <>
      <ol className="mt-2 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
        {rows.map((r, i) => (
          <li key={`${r.name}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="min-w-0">
              <span className="block font-semibold">
                <span className="mr-2 font-mono text-xs text-night-muted">{i + 1}.</span>
                {r.name}
              </span>
              <span className="block text-xs text-night-muted">
                {noun === "giver" && r.kind ? `${kindLabel(r.kind as DonorKind)} · ` : ""}
                {r.count} {noun === "giver" ? (r.count === 1 ? "gift" : "gifts") : r.count === 1 ? "payment" : "payments"}
              </span>
            </span>
            <span className={cn("shrink-0 font-serif text-lg font-bold", noun === "giver" ? "text-gold" : "text-[#FF7A85]")}>{formatUsd(r.cents)}</span>
          </li>
        ))}
      </ol>
      {total != null && total > rows.length ? (
        <p className="mt-1 text-xs text-night-muted">
          Top {rows.length} of {total.toLocaleString()} {noun}s that month, by amount.
        </p>
      ) : null}
    </>
  );
}

function MonthDetail({
  y,
  month,
  firstName,
  donors,
  vendors,
  loading = false,
}: {
  y: FinanceHistoryYear;
  month: number;
  firstName: string;
  donors?: FinanceDonor[];
  vendors?: { name: string; cents: number; count: number; items?: FinanceSpendItem[] }[];
  loading?: boolean;
}) {
  const m = y.months?.find((v) => v.month === month);
  const label = `${monthName(month)} ${y.year}`;
  const allDonors = donors ?? [];
  const allVendors = vendors ?? [];
  const full = donors != null;
  const donorPager = usePaged(full ? allDonors : [], `${y.year}-${month}-donors-${allDonors.length}`);
  const vendorPager = usePaged(full ? allVendors : [], `${y.year}-${month}-vendors-${allVendors.length}`);
  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold tracking-wide text-gold uppercase">
        {full ? `All itemized donors in ${label}` : `Top givers to ${firstName} in ${label}`}
      </h4>
      {full ? (
        <>
          <p className="mt-1 text-xs text-night-muted">
            Every named giver with a gift dated {label}, shown {LIST_PAGE_SIZE} at a time. {SMALL_GIFT_NOTE}
          </p>
          {allDonors.length ? (
            <>
              <ol className="mt-2 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
                {donorPager.slice.map((d, i) => (
                  <DonorRow key={`${label}-${d.name}`} donor={d} index={donorPager.start + i + 1} />
                ))}
              </ol>
              <MoneyPages page={donorPager.page} pages={donorPager.pages} onPage={donorPager.setPage} label={`${label} donor pages`} />
            </>
          ) : (
            <p className="mt-2 text-sm text-on-dark-muted">{loading ? `Loading every named donor for ${label}…` : `No named gifts dated ${label}.`}</p>
          )}
        </>
      ) : (
        <MonthGiverList rows={m?.donors ?? []} total={m?.donorCount} noun="giver" emptyText={loading ? `Loading every named donor for ${label}…` : `No named gifts dated ${label}.`} />
      )}
      <h4 className="mt-5 text-xs font-semibold tracking-wide text-gold uppercase">
        {full ? `All itemized payments in ${label}` : `Top vendors paid in ${label}`}
      </h4>
      {full ? (
        <>
          <p className="mt-1 text-xs text-night-muted">
            Every named payee with a payment dated {label}, shown {LIST_PAGE_SIZE} at a time. Tap a payee to see the purpose, date, and amount.
          </p>
          {allVendors.length ? (
            <>
              <ul className="mt-2 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
                {vendorPager.slice.map((v) => (
                  <VendorRow key={`${label}-${v.name}`} vendor={v} />
                ))}
              </ul>
              <MoneyPages page={vendorPager.page} pages={vendorPager.pages} onPage={vendorPager.setPage} label={`${label} payment pages`} />
            </>
          ) : (
            <p className="mt-2 text-sm text-on-dark-muted">{loading ? `Loading every named payment for ${label}…` : `No named payments dated ${label}.`}</p>
          )}
        </>
      ) : (
        <MonthGiverList rows={m?.vendors ?? []} total={m?.vendorCount} noun="vendor" emptyText={loading ? `Loading every named payment for ${label}…` : `No named payments dated ${label}.`} />
      )}
      <p className="mt-2 text-xs text-night-muted">
        Named gifts and payments are the lines itemized on state reports, by the date on each line. To see every gift and
        payment one by one for the whole year, pick “All of {y.year}” and open the year, or download the CSV below.
      </p>
    </div>
  );
}

function MoneyHistory({
  h,
  firstName,
  subject,
  sel,
  onChange,
  ledger,
  ledgerStatus,
}: {
  h: FinanceHistory;
  firstName: string;
  subject: string;
  sel: TimelineSelection;
  onChange: (next: TimelineSelection) => void;
  ledger: HistoryLedger | null;
  ledgerStatus: "idle" | "loading" | "ready" | "error";
}) {
  if (!h.years.length) return null;
  const earlier = h.committees.filter((c) => !c.current);
  const years = timelineYears(h.years);
  const newestFirst = [...years].reverse();
  const picked = sel.year != null ? years.find((y) => y.year === sel.year) : undefined;
  const loading = ledgerStatus === "loading";
  return (
    <>
      <h3 className="mt-8 font-serif text-xl font-semibold uppercase">Money by year and month, 2021 to now</h3>
      <p className="mt-1 text-sm text-on-dark-muted">
        Official raised and spent totals from every scheduled state report since January 2021
        {h.through ? `, through ${formatDate(h.through)}` : ""}. Pick a year, then a month, to narrow the chart and the
        lists of donors and payments below it. The All donors section under this one follows the year you pick.
        {earlier.length
          ? ` Includes ${firstName}'s earlier House or Senate committee${earlier.length > 1 ? "s" : ""}: ${earlier.map((c) => c.committeeName).join(", ")}.`
          : ""}
      </p>
      <TimelineFilters years={years} value={sel} onChange={onChange} />
      <TimelineTotals years={years} value={sel} />
      <RaisedSpentChart years={years} value={sel} onChange={onChange} subject={subject} />
      {picked && sel.month != null ? (
        <MonthDetail
          y={picked}
          month={sel.month}
          firstName={firstName}
          donors={ledger ? (ledger.months.get(`${sel.year}-${String(sel.month).padStart(2, "0")}`)?.donors ?? []) : undefined}
          vendors={ledger ? (ledger.months.get(`${sel.year}-${String(sel.month).padStart(2, "0")}`)?.vendors ?? []) : undefined}
          loading={loading}
        />
      ) : (
        <ul className="mt-4 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
          {(picked ? [picked] : newestFirst).map((y) => (
            <HistoryYearRow
              key={`${y.year}-${picked ? "one" : "all"}`}
              y={y}
              firstName={firstName}
              defaultOpen={Boolean(picked)}
              donors={ledger?.years.get(y.year)?.donors}
              vendors={ledger?.years.get(y.year)?.vendors}
              loading={loading}
            />
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-night-muted">{HISTORY_LIST_NOTE}</p>
      {h.csvPath ? (
        <a
          href={h.csvPath}
          download
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900"
        >
          <Download className="size-4" aria-hidden />
          Download every itemized gift and payment since 2021 (CSV)
        </a>
      ) : null}
    </>
  );
}

function AggregateDonors({
  firstName,
  through,
  sel,
  ledger,
  ledgerStatus,
  fallbackDonors,
  cycleLabel,
  reportId,
  filed,
  amendment,
  itemizedNote,
}: {
  firstName: string;
  through?: string | null;
  sel: TimelineSelection;
  ledger: HistoryLedger | null;
  ledgerStatus: "idle" | "loading" | "ready" | "error";
  fallbackDonors: FinanceDonor[];
  cycleLabel?: string;
  reportId?: string;
  filed?: string;
  amendment?: number;
  itemizedNote?: string;
}) {
  const [donorTypes, setDonorTypes] = useState<DonorTypePill[]>([]);
  const [ranges, setRanges] = useState<DollarRangePill[]>([]);
  const [query, setQuery] = useState("");
  const yearPicked = sel.year != null;
  const monthPicked = yearPicked && sel.month != null;
  const hasLedger = Boolean(ledger);
  const source = ledger
    ? historySlice(ledger, sel).donors
    : yearPicked
      ? []
      : fallbackDonors;
  const filtered = filterFinanceDonors(source, { types: donorTypes, ranges, query });
  const pager = usePaged(filtered, `${sel.year ?? "all"}-${sel.month ?? "all"}-${donorTypes.join(",")}-${ranges.join(",")}-${query}-${filtered.length}`);
  const filtersOn = donorTypes.length > 0 || ranges.length > 0 || Boolean(query.trim());

  const heading = monthPicked
    ? `Donors in ${monthName(sel.month!)} ${sel.year} only`
    : yearPicked
      ? `Donors in ${sel.year} only`
      : "All donors, 2021 to today (all years combined)";

  const throughLabel = through ? formatDate(through) : "today";
  const subline = monthPicked
    ? `Every itemized donor to ${firstName} with a gift dated ${monthName(sel.month!)} ${sel.year}, totaled for that month. Clear the month or year in the filter above to go back to all years combined.`
    : yearPicked
      ? `Every itemized donor to ${firstName} with a gift dated ${sel.year}, totaled for that year. Clear the year in the filter above to see all years combined, or open ${sel.year} in Money by year to see payments too.`
      : `Every itemized donor to ${firstName} from 2021 through today, totaled across all years. To see a single year, open it in Money by year above or pick a year in the filter.`;

  return (
    <>
      <h3 className="mt-8 font-serif text-xl font-semibold uppercase">{heading}</h3>
      <p className="mt-1 text-sm text-on-dark-muted">
        {ledgerStatus === "loading" && !hasLedger
          ? "Loading every itemized donor from 2021 through today…"
          : !hasLedger && ledgerStatus === "error"
            ? "We could not load the 2021-to-today donor list just now. You can download the CSV from Money by year above."
            : !hasLedger && !yearPicked
              ? `We have not loaded the 2021-to-today donor list for this campaign yet. The names below are itemized givers in ${cyclePhrase(cycleLabel)}, as a stand-in.`
              : subline}{" "}
        {hasLedger ? (
          <>
            Includes <MoneyTerm term="In-kind">gifts of goods or services</MoneyTerm>, shown {LIST_PAGE_SIZE} at a time. Tap a name to see each official gift. Names appear as they were filed with the state. {SMALL_GIFT_NOTE}
            {through && !yearPicked ? ` Official filings in this list run through ${throughLabel}.` : ""}
          </>
        ) : null}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <label className="sr-only" htmlFor="profile-aggregate-donors-q">
          Filter this donor list by name or amount
        </label>
        <input
          id="profile-aggregate-donors-q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter these donors by name, or an amount such as $10k+"
          className="min-h-11 w-full rounded-md border border-navy-line bg-navy-800 px-3 text-sm text-white placeholder:text-night-muted focus:border-gold focus:outline-none"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Donor type">
          {DONOR_TYPE_PILLS.map((chip) => (
            <FilterChip
              key={chip.id}
              label={chip.label}
              pressed={donorTypes.includes(chip.id)}
              onClick={() => setDonorTypes((list) => toggleList(list, chip.id))}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Total given">
          {DOLLAR_RANGE_PILLS.map((chip) => (
            <FilterChip
              key={chip.id}
              label={chip.label}
              pressed={ranges.includes(chip.id)}
              onClick={() => setRanges((list) => toggleList(list, chip.id))}
            />
          ))}
        </div>
        {filtersOn ? (
          <button
            type="button"
            onClick={() => {
              setDonorTypes([]);
              setRanges([]);
              setQuery("");
            }}
            className="self-start text-xs font-semibold text-gold hover:underline"
          >
            Clear donor filters
          </button>
        ) : null}
      </div>
      {filtered.length ? (
        <ol className="mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800" start={pager.start + 1}>
          {pager.slice.map((d, i) => (
            <DonorRow key={d.donorId ?? d.name} donor={d} index={pager.start + i + 1} />
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-on-dark-muted">
          {ledgerStatus === "loading" && !hasLedger
            ? "Loading every itemized donor from 2021 through today…"
            : yearPicked && !hasLedger && ledgerStatus !== "error"
              ? "Loading that year’s donors…"
              : filtersOn
                ? "No itemized donors match these filters."
                : yearPicked
                  ? `No itemized donors dated ${monthPicked ? `${monthName(sel.month!)} ${sel.year}` : sel.year}.`
                  : "No itemized donors in the reports we have loaded from 2021 through today."}
        </p>
      )}
      <MoneyPages page={pager.page} pages={pager.pages} onPage={pager.setPage} label="Donor list pages" />
      {filtered.length > LIST_PAGE_SIZE || (filtersOn && source.length) ? (
        <p className="mt-2 text-xs text-night-muted">
          Showing {filtered.length ? pager.start + 1 : 0}–{Math.min(pager.start + LIST_PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
          {filtersOn ? ` matching donors (of ${source.length.toLocaleString()} in this view)` : " donors"}
        </p>
      ) : null}
      <SourceLine reportId={reportId} filed={filed} amendment={amendment} extra={itemizedNote} />
    </>
  );
}

function ReadyView({
  s,
  billsHref,
  votesHref,
  variant,
  sel,
  onSel,
  ledger,
  ledgerStatus,
}: {
  s: FinanceSummary;
  billsHref: string;
  votesHref: string;
  variant: "profile" | "hub";
  sel: TimelineSelection;
  onSel: (next: TimelineSelection) => void;
  ledger: HistoryLedger | null;
  ledgerStatus: "idle" | "loading" | "ready" | "error";
}) {
  const [allFilings, setAllFilings] = useState(false);
  const [vendorPage, setVendorPage] = useState(1);
  const vendors = s.spending?.vendors ?? [];
  const vendorPages = Math.max(1, Math.ceil(vendors.length / LIST_PAGE_SIZE));
  const safeVendorPage = Math.min(vendorPage, vendorPages);
  const vendorSlice = vendors.slice((safeVendorPage - 1) * LIST_PAGE_SIZE, safeVendorPage * LIST_PAGE_SIZE);
  useEffect(() => {
    setVendorPage(1);
  }, [s.slug]);
  const report = s.latestReport;
  const filings = s.filings ?? [];
  const shownFilings = allFilings ? filings : filings.slice(0, 8);
  const late = lateFilingCount(filings);
  const firstName = familiarFirstName(s.name);

  return (
    <>
      <p className="text-sm text-on-dark-muted">
        Official campaign money for {personTitle(s)}, filed as <OfficialCommitteeLink s={s} />. Figures are from the
        Virginia Department of Elections, not from an outside summary. Virginia has no limit on how much anyone can give.{" "}
        <MoneyTerm term="Unitemized gifts">Gifts of $100 or less</MoneyTerm> in a cycle are reported only as a total, not by name.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Box
          label="Money in the bank"
          term="Money in the bank"
          value={formatUsd(s.cashOnHandCents ?? 0)}
          note={
            <>
              <MoneyTerm term="Ending balance">Ending balance</MoneyTerm> as of {formatDate(s.asOf)}
              {report ? (
                <>
                  {" · "}
                  <a href={reportUrl(report.id)} target="_blank" rel="noreferrer" className="text-gold hover:underline">
                    Report {report.id}
                    <ExternalLink className="ml-1 inline size-3" aria-hidden />
                  </a>
                </>
              ) : null}
            </>
          }
        />
        <Box
          label="Raised this cycle"
          term="Raised this cycle"
          value={formatUsd(s.raisedCycleCents ?? 0)}
          note={<>{s.cycleLabel ?? "This election cycle"}{s.cycleStart && s.cycleEnd ? ` · ${formatPeriod(s.cycleStart, s.cycleEnd)}` : ""}</>}
        />
        <Box
          label="Spent this cycle"
          term="Spent this cycle"
          value={formatUsd(s.spentCycleCents ?? 0)}
          note={<>{s.cycleLabel ?? "This election cycle"} · official disbursements</>}
        />
        <Box
          label="Filing record"
          term="Filing on time"
          value={late.total ? `${late.total - late.late} of ${late.total}` : "—"}
          note={
            late.total
              ? `${late.late ? `${late.late} late · ` : "All on time · "}scheduled reports we have on file`
              : "No scheduled reports in the archive yet"
          }
        />
      </div>
      <SourceLine reportId={report?.id} filed={report?.filed} amendment={report?.amendment} extra="We use only the latest amendment of each report." />

      {s.history ? <MoneyHistory h={s.history} firstName={firstName} subject={`${personTitle(s)}'s campaign`} sel={sel} onChange={onSel} ledger={ledger} ledgerStatus={ledgerStatus} /> : null}

      <AggregateDonors
        firstName={firstName}
        through={s.history?.through}
        sel={sel}
        ledger={ledger}
        ledgerStatus={ledgerStatus}
        fallbackDonors={s.donors ?? []}
        cycleLabel={s.cycleLabel}
        reportId={report?.id}
        filed={report?.filed}
        amendment={report?.amendment}
        itemizedNote={s.itemizedNote}
      />

      <h3 className="mt-8 font-serif text-xl font-semibold uppercase">Where does the money come from?</h3>
      <p className="mt-1 text-sm text-on-dark-muted">
        A simple split of itemized gifts in this cycle. “In-state” means a Virginia address on the state report. Out-of-state
        addresses were kept as filed; a missing or “NA” state was filled from the ZIP code when possible.{" "}
        <MoneyTerm term="PAC">PACs</MoneyTerm> and other organizations are grouped together.{" "}
        <MoneyTerm term="Transfer">Party and candidate committee gifts</MoneyTerm> are shown separately.
      </p>
      {s.origin ? (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-gold uppercase">Virginia vs. out of state</h4>
          <Bar
            parts={[
              { label: "Virginia", cents: s.origin.inStateCents, count: s.origin.inStateCount, tone: "bg-gold" },
              { label: "Out of state", cents: s.origin.outOfStateCents, count: s.origin.outOfStateCount, tone: "bg-[#7FA7FF]" },
              { label: "Not stated", cents: s.origin.unknownCents, count: s.origin.unknownCount, tone: "bg-navy-line" },
            ]}
          />
        </div>
      ) : null}
      {s.types ? (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-gold uppercase">Individual vs. PAC vs. transfers</h4>
          <Bar
            parts={[
              { label: "Individuals", cents: s.types.individualCents, count: s.types.individualCount, tone: "bg-[#7EE0A0]" },
              { label: "PACs and organizations", cents: s.types.pacCents, count: s.types.pacCount, tone: "bg-gold" },
              { label: "Party or candidate committees", cents: s.types.transferCents, count: s.types.transferCount, tone: "bg-[#7FA7FF]" },
            ]}
          />
        </div>
      ) : null}
      {s.size ? (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-gold uppercase">Small vs. large gifts</h4>
          <Bar
            parts={[
              { label: "Named gifts (over $100)", cents: s.size.largeCents, tone: "bg-gold" },
              { label: "Small gifts ($100 or less)", cents: s.size.smallCents, tone: "bg-navy-line" },
            ]}
          />
          <p className="mt-2 text-xs text-night-muted">{s.size.rule}</p>
        </div>
      ) : null}
      <SourceLine reportId={report?.id} filed={report?.filed} amendment={report?.amendment} extra={s.itemizedNote} />

      <h3 className="mt-8 font-serif text-xl font-semibold uppercase">How is the money spent?</h3>
      <p className="mt-1 text-sm text-on-dark-muted">
        Spending by plain-language category, plus the vendors paid the most in this cycle. Tap a category or a vendor to
        see who was paid, what the state filing listed, and the amount. Category groups are ours, built from the state's
        free-text “item or service” field — they are not official state categories.
      </p>
      {s.spending?.categories.length ? (
        <ul className="mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
          {s.spending.categories.map((c) => (
            <SpendingCategory key={c.name} category={c} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-on-dark-muted">No itemized spending in the reports we have loaded for {cyclePhrase(s.cycleLabel)}.</p>
      )}
      {vendors.length ? (
        <>
          <h4 className="mt-5 text-xs font-semibold tracking-wide text-gold uppercase">Top vendors</h4>
          <p className="mt-1 text-xs text-night-muted">
            All {counted(vendors.length, "vendor")} in {cyclePhrase(s.cycleLabel)}, shown {LIST_PAGE_SIZE} at a time, starting with the largest totals.
            Tap a vendor to see each official payment.
          </p>
          <ul className="mt-2 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
            {vendorSlice.map((v) => (
              <VendorRow key={v.name} vendor={v} />
            ))}
          </ul>
          <MoneyPages page={safeVendorPage} pages={vendorPages} onPage={setVendorPage} label="Vendor list pages" />
          {vendors.length > LIST_PAGE_SIZE ? (
            <p className="mt-2 text-xs text-night-muted">
              Showing {(safeVendorPage - 1) * LIST_PAGE_SIZE + 1}–{Math.min(safeVendorPage * LIST_PAGE_SIZE, vendors.length)} of {vendors.length.toLocaleString()}
            </p>
          ) : null}
        </>
      ) : null}
      <SourceLine
        reportId={report?.id}
        filed={report?.filed}
        amendment={report?.amendment}
        extra={s.spending?.groupingNote}
      />

      <h3 className="mt-8 font-serif text-xl font-semibold uppercase">Loans, debts, and in-kind gifts</h3>
      <p className="mt-1 text-sm text-on-dark-muted">Is the campaign borrowing money, carrying unpaid debts, or receiving gifts of goods or services?</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-3">
          <div className="text-xs tracking-wide text-night-muted uppercase">Loan balance</div>
          <div className="font-serif text-2xl font-bold text-gold">{formatUsd(s.loanBalanceCents ?? 0)}</div>
        </div>
        <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-3">
          <div className="text-xs tracking-wide text-night-muted uppercase">Unpaid debts</div>
          <div className="font-serif text-2xl font-bold text-gold">{formatUsd(s.debtsCents ?? 0)}</div>
        </div>
        <div className="rounded-lg border border-navy-line bg-navy-800 px-4 py-3">
          <div className="text-xs tracking-wide text-night-muted uppercase">In-kind gifts this cycle</div>
          <div className="font-serif text-2xl font-bold text-gold">{formatUsd(s.inkindCents ?? 0)}</div>
        </div>
      </div>
      {s.loans?.length ? (
        <ul className="mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
          {s.loans.map((loan) => (
            <li key={`${loan.name}-${loan.date}`} className="px-4 py-2.5 text-sm">
              <span className="font-semibold">{loan.name}</span> · {formatUsd(loan.cents)}
              {loan.balanceCents ? ` · balance ${formatUsd(loan.balanceCents)}` : ""} {loan.date ? ` · ${formatShortDate(loan.date)}` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-on-dark-muted">No loans reported on the latest cycle filings we have loaded.</p>
      )}
      {s.debts?.length ? (
        <ul className="mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
          {s.debts.map((d) => (
            <li key={`${d.name}-${d.date}`} className="px-4 py-2.5 text-sm">
              <span className="font-semibold">{d.name}</span> · {formatUsd(d.cents)} {d.item ? ` · ${d.item}` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-on-dark-muted">No unpaid debts reported on the latest cycle filings we have loaded.</p>
      )}
      {s.inkind?.length ? (
        <ul className="mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
          {s.inkind.map((g) => (
            <li key={`${g.name}-${g.date}-${g.item}`} className="px-4 py-2.5 text-sm">
              <span className="font-semibold">{g.name}</span> · {formatUsd(g.cents)}
              {g.item ? ` · ${g.item}` : ""} {g.date ? ` · ${formatShortDate(g.date)}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <SourceLine reportId={report?.id} filed={report?.filed} amendment={report?.amendment} />


      <h3 className="mt-8 font-serif text-xl font-semibold uppercase">Did they file on time?</h3>
      <p className="mt-1 text-sm text-on-dark-muted">
        Scheduled state reports, using the latest amendment of each period. “On time” means the report was filed on or before the state's due date.
      </p>
      {filings.length ? (
        <>
          <ul className="mt-3 divide-y divide-navy-line overflow-hidden rounded-lg border border-navy-line bg-navy-800">
            {shownFilings.map((f) => (
              <FilingRow key={f.reportId} f={f} />
            ))}
          </ul>
          {filings.length > 8 ? (
            <button
              type="button"
              aria-expanded={allFilings}
              onClick={() => setAllFilings((v) => !v)}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900"
            >
              {allFilings ? "Show the most recent filings" : `Show all ${filings.length} scheduled reports`}
            </button>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-on-dark-muted">No scheduled reports in the archive yet.</p>
      )}
      <p className="mt-3 text-xs text-night-muted">
        Source: Virginia Department of Elections due dates and filing dates on each official report, linked above.
      </p>

      <h3 className="mt-8 font-serif text-xl font-semibold uppercase">Tied to the public record</h3>
      <p className="mt-1 text-sm text-on-dark-muted">
        This is the same member's public record already on aguyonx.com. The facts sit side by side. We do not claim that a gift caused a vote or a bill.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <a href={billsHref} className="rounded-lg border border-navy-line bg-navy-800 px-4 py-4 hover:border-gold">
          <div className="text-xs tracking-wide text-gold uppercase">Bills patroned</div>
          <div className="mt-1 font-semibold">See {s.honorific} {familyName(s.name)}'s bills →</div>
        </a>
        <a href={votesHref} className="rounded-lg border border-navy-line bg-navy-800 px-4 py-4 hover:border-gold">
          <div className="text-xs tracking-wide text-gold uppercase">Floor votes</div>
          <div className="mt-1 font-semibold">See the voting scorecard →</div>
        </a>
      </div>

      <h3 className="mt-8 font-serif text-xl font-semibold uppercase">Simple downloads</h3>
      <p className="mt-1 text-sm text-on-dark-muted">
        A clean spreadsheet of this person's official state data — totals, itemized gifts, spending, loans, and the filing record.
      </p>
      {s.csvPath ? (
        <a
          href={s.csvPath}
          download
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-gold bg-gold px-4 text-sm font-bold text-navy-900 hover:bg-white hover:border-white"
        >
          <Download className="size-4" aria-hidden />
          Download CSV — copy of official state data, as of {formatDate(s.asOf)}
        </a>
      ) : null}

      <div className="mt-8 border-t border-navy-line/60 pt-4">
        <h3 className="text-xs font-semibold tracking-wide text-gold uppercase">Money glossary</h3>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {Object.entries(GLOSSARY).map(([term, def]) => (
            <div key={term} className="rounded-md bg-navy-800/80 px-3 py-2">
              <dt className="text-sm font-semibold">{term}</dt>
              <dd className="text-xs text-night-muted">{def}</dd>
            </div>
          ))}
        </dl>
      </div>

      {variant === "hub" ? (
        <p className="mt-6 text-sm">
          <Link to={profileMoneyHref(s.chamber, s.slug) as never} className="font-semibold text-gold hover:underline">
            Open the full profile for {personTitle(s)} →
          </Link>
        </p>
      ) : null}

      {s.verification?.matchedOfficialXml ? (
        <p className="mt-4 text-xs text-night-muted">
          The mid-year 2026 totals on this page were checked against the official XML for report {s.verification.reportId} on{" "}
          {formatDate(s.verification.checkedOn)}.
        </p>
      ) : null}
    </>
  );
}

function Fallback({ s, officialHref }: { s?: FinanceSummary | null; officialHref?: string }) {
  const href = officialHref || (s?.committeeId ? committeeUrl(s.committeeId) : "https://cfreports.elections.virginia.gov/");
  return (
    <div>
      <p className="text-sm text-on-dark-muted">
        We have not pulled full filings for this member yet — view the official state committee page for the complete record.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900"
      >
        Official state committee page
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}

export function CampaignMoneySection({
  slug,
  summary,
  billsHref = "#bills",
  votesHref = "#votes",
  variant = "profile",
  officialHref,
  className,
}: {
  slug?: string;
  summary?: FinanceSummary | null;
  billsHref?: string;
  votesHref?: string;
  variant?: "profile" | "hub";
  officialHref?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState<FinanceSummary | null | undefined>(summary);
  const [status, setStatus] = useState<"ready" | "loading" | "missing">(summary ? "ready" : slug ? "loading" : "missing");

  useEffect(() => {
    if (summary) {
      setLoaded(summary);
      setStatus("ready");
      return;
    }
    if (!slug) {
      setStatus("missing");
      return;
    }
    let on = true;
    setStatus("loading");
    loadFinanceSummary(slug)
      .then((row) => {
        if (!on) return;
        setLoaded(row);
        setStatus(row ? "ready" : "missing");
      })
      .catch(() => {
        if (on) setStatus("missing");
      });
    return () => {
      on = false;
    };
  }, [slug, summary]);

  const s = loaded;
  const titleWho = s ? personTitle(s) : "this campaign";
  const { ledger, status: ledgerStatus } = useHistoryLedger(s?.status === "ready" ? s.history?.csvPath : null);
  const [sel, setSel] = useState<TimelineSelection>({});
  useEffect(() => {
    setSel({});
  }, [s?.slug]);
  const scoped = ledger ? historySlice(ledger, sel) : null;

  return (
    <section id="campaign-money" className={cn("min-w-0 scroll-mt-24 rounded-xl border border-navy-line border-t-4 border-t-[#164A3A] bg-navy-700 p-5 sm:p-7", className)}>
      <h2 className="font-serif text-2xl font-semibold uppercase">
        Campaign money
        <span className="ml-3 rounded border border-[#8FCB9B]/50 px-2 py-0.5 font-sans text-[11px] font-bold tracking-wide text-[#8FCB9B] normal-case">
          State filings · Official records
        </span>
      </h2>
      <p className="mt-1 font-serif text-lg font-semibold text-gold">{titleWho}'s campaign money</p>
      {variant === "profile" ? (
        <div className="mt-4 rounded-lg border border-navy-line bg-navy-800/80 p-3 sm:p-4">
          <p className="mb-3 font-mono text-[10px] font-semibold tracking-widest text-gold uppercase sm:text-xs">
            Search campaign money
          </p>
          <CampaignMoneyLookup
            compact
            embedded
            inputId="profile-campaign-money-q"
            placeholder="Donor or vendor here, or another name / $10k+"
            scope={s && s.status === "ready" ? { donors: scoped?.donors ?? s.donors, vendors: scoped?.vendors ?? s.spending?.vendors } : undefined}
          />
        </div>
      ) : null}
      <div className="mt-5">
        {status === "loading" ? <p className="text-sm text-on-dark-muted">Loading official campaign finance reports…</p> : null}
        {status === "missing" || (s && s.status === "unavailable") ? <Fallback s={s} officialHref={officialHref} /> : null}
        {status === "ready" && s && s.status === "ready" ? (
          <ReadyView s={s} billsHref={billsHref} votesHref={votesHref} variant={variant} sel={sel} onSel={setSel} ledger={ledger} ledgerStatus={ledgerStatus} />
        ) : null}
      </div>
    </section>
  );
}
