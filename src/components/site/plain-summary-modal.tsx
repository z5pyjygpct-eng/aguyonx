import { useEffect, useId } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, X } from "lucide-react";

export type PlainSummaryStatus = "ok" | "pending";

export type PlainSummarySourceLink = {
  label: string;
  url: string;
};

/** Generic payload for the shared plain-language summary button + modal. */
export type PlainSummaryContent = {
  title: string;
  summary: string | null;
  status: PlainSummaryStatus;
  editorialLabel: string;
  sourceLinks: PlainSummarySourceLink[];
  pendingMessage?: string;
};

const DEFAULT_BUTTON_LABEL = "Summary of Bill";
const DEFAULT_PENDING_MESSAGE = "A summary isn't available yet. Check the official links below.";

type PlainSummaryModalProps = PlainSummaryContent & {
  buttonLabel?: string;
};

/**
 * Shared gold-button + accessible modal for a plain-language summary.
 * Free of page-specific data logic; callers map their records into PlainSummaryContent.
 */
export function PlainSummaryModal({
  title,
  summary,
  status,
  editorialLabel,
  sourceLinks,
  pendingMessage = DEFAULT_PENDING_MESSAGE,
  buttonLabel = DEFAULT_BUTTON_LABEL,
}: PlainSummaryModalProps) {
  const titleId = useId();
  const labelId = useId();
  const ready = status === "ok" && Boolean(summary?.trim());
  const body = ready ? summary : pendingMessage;

  useEffect(() => {
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, []);

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        document.body.style.overflow = open ? "hidden" : "";
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center rounded-md bg-gold px-3 py-2 text-left text-sm font-bold text-navy-900 shadow-sm hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700"
        >
          {buttonLabel}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-900/75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={labelId}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(90vh,40rem)] w-[min(calc(100vw-1.5rem),36rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-gold/70 bg-navy-700 p-5 shadow-2xl focus:outline-none sm:p-6"
        >
          <div className="flex shrink-0 items-start justify-between gap-3">
            <Dialog.Title id={titleId} className="min-w-0 font-serif text-xl font-bold leading-tight text-white sm:text-2xl">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close summary"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-gold hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <p id={labelId} className="mt-3 shrink-0 text-xs font-semibold tracking-wide text-gold uppercase">
            {editorialLabel}
          </p>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
            <p className="text-base leading-relaxed text-[#F6F3EA]">{body}</p>
          </div>
          {sourceLinks.length > 0 ? (
            <p className="mt-3 flex shrink-0 flex-wrap gap-x-4 gap-y-2 border-t border-gold/30 pt-2 text-sm">
              {sourceLinks.map((link) => (
                <a
                  key={`${link.label}:${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 font-semibold text-gold underline"
                >
                  {link.label} <ExternalLink className="size-3.5" aria-hidden />
                </a>
              ))}
            </p>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
