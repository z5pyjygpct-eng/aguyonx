import { useEffect, useState } from "react";
import { findDonor, formatUsd, officialCommitteeHref, type DonorRecord } from "@/lib/finance-donors";
import { loadDonors } from "@/lib/global-search-load";
import { counted } from "@/lib/finance-summaries";

export function DonorView({ donorId }: { donorId: string }) {
  const [state, setState] = useState<{ status: "loading" } | { status: "ready"; donor: DonorRecord | null }>({ status: "loading" });

  useEffect(() => {
    let on = true;
    setState({ status: "loading" });
    loadDonors()
      .then((donors) => {
        if (!on) return;
        setState({ status: "ready", donor: findDonor(donors, donorId) });
      })
      .catch(() => on && setState({ status: "ready", donor: null }));
    return () => {
      on = false;
    };
  }, [donorId]);

  if (state.status === "loading") {
    return <p className="text-sm text-on-dark-muted" role="status">Loading official donor records…</p>;
  }
  const donor = state.donor;
  if (!donor) {
    return (
      <div className="rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5">
        <h2 className="font-serif text-2xl font-semibold uppercase">Who received this money?</h2>
        <p className="mt-2 text-sm text-on-dark-muted">No official Schedule A or B match for “{donorId}” in the months we have indexed.</p>
      </div>
    );
  }

  return (
    <section className="rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5">
      <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">Donor</p>
      <h2 className="mt-1 font-serif text-2xl font-semibold uppercase">Who received money from {donor.name}?</h2>
      <p className="mt-2 text-sm text-on-dark-muted">
        {formatUsd(donor.totalCents)} across {counted(donor.giftCount, "official cash and in-kind gift")}
        in the Virginia Department of Elections reports we have indexed. Recipients below are campaign committees,
        not government budgets.
      </p>
      <ul className="mt-4 divide-y divide-navy-line">
        {donor.recipients.map((r) => {
          const href = officialCommitteeHref(r.committeeId);
          const inner = (
            <>
              <p className="font-semibold text-white">{r.committeeName}</p>
              <p className="mt-0.5 text-sm text-on-dark-muted">
                {formatUsd(r.amountCents)} · {r.giftCount} gift{r.giftCount === 1 ? "" : "s"}
                {r.candidateName ? ` · ${r.candidateName}` : ""}
              </p>
            </>
          );
          return (
            <li key={`${r.committeeId ?? r.committeeName}-${r.amountCents}`} className="py-3">
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="block hover:text-gold">
                  {inner}
                </a>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-night-muted">
        Source: official Virginia Department of Elections Schedule A (cash) and Schedule B (in-kind) files for
        2022-01 through 2023-01 and 2026-01 through 2026-10. Later 2023–2025 monthly schedule files were not in
        the local archive, and the live state CSV host blocked a refresh. Totals use the latest filing per report.
        Not from the Virginia Public Access Project.
      </p>
    </section>
  );
}
