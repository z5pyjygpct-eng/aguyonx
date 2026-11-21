import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

/**
 * "How to Use …" button + pop-up. Markup and classes are the Emergency Monitor's "How to Use Emergency Monitor" button and modal
 * (src/routes/emergency-monitor.tsx), unchanged: gold outlined small button, navy dialog with a gold border, serif title, gold close X,
 * plain bullet list that scrolls inside the dialog on a phone. Only the title and bullets change per page.
 */
const btnSm = "inline-flex min-h-9 items-center rounded-md border border-gold px-3 text-sm font-semibold text-gold hover:bg-gold hover:text-navy-900";

export function HowToUseModal({ title, closeLabel, bullets, className = "" }: { title: string; closeLabel: string; bullets: readonly string[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        data-howto-button
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${btnSm} h-auto min-h-9 shrink-0 py-1 leading-tight ${className}`}
        onClick={() => setOpen(true)}
      >
        {title}
      </button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="em-noprint fixed inset-0 z-50 bg-navy-900/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-howto-dialog
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              triggerRef.current?.focus();
            }}
            className="em-noprint fixed top-1/2 left-1/2 z-50 flex max-h-[min(92vh,40rem)] w-[min(calc(100vw-1.25rem),36rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-gold/70 bg-navy-700 shadow-2xl focus:outline-none"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
              <Dialog.Title id={titleId} className="font-serif text-lg font-bold leading-tight text-white sm:text-xl">
                {title}
              </Dialog.Title>
              <Dialog.Close
                aria-label={closeLabel}
                data-howto-close
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-gold hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-5" aria-hidden />
              </Dialog.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-3 sm:px-5">
              <ul className="list-disc space-y-3 pl-5 text-base leading-relaxed text-[#F6F3EA]">
                {bullets.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
