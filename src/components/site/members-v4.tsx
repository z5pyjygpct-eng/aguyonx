import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, Mail, Phone, Play } from "lucide-react";
import { V4Main } from "@/components/site/lcps-v4";
import { V4VenueHero, FoiaButton, type V4Venue } from "@/components/site/venue-v4";
import type { MemberData } from "@/lib/members-v4";

const PH = "rounded border border-dashed border-gold/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-gold uppercase";
function Placeholder({ children }: { children?: ReactNode }) {
  return <p className="text-sm text-night-muted"><span className={PH}>Placeholder — not yet sourced</span> {children}</p>;
}
const initials = (n: string) => n.replace(/^Dr\.\s+/, "").split(/\s+/).filter((w) => /^[A-Z]/.test(w) && !/\.$/.test(w)).map((w) => w[0]).slice(0, 2).join("");
const barColor = (p: number) => (p >= 95 ? "#2BB673" : p >= 85 ? "#F5B82E" : "#C8102E");
const VOTE: Record<string, string> = { Yes: "bg-[#2BB673] text-navy-900", No: "bg-[#C8102E] text-white", Absent: "bg-navy-800 text-night-muted border border-navy-line", Abstain: "bg-[#6E8FC4] text-navy-900" };

function Avatar({ name, big }: { name: string; big?: boolean }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center rounded-[10px] border-2 border-gold bg-navy-800 font-serif font-bold text-gold ${big ? "size-28 text-4xl" : "size-20 text-2xl"}`} title="Photo placeholder — no member photos on file">
      {initials(name)}
      <span className="absolute -bottom-2 rounded bg-navy-900 px-1 font-mono text-[8px] text-night-muted">NO PHOTO</span>
    </div>
  );
}

function AttBar({ m }: { m: MemberData }) {
  if (m.attendance == null) return <p className="font-mono text-xs text-night-muted">Attendance: not yet computed</p>;
  return (
    <div>
      <div className="flex justify-between font-mono text-xs"><span className="text-night-muted">Present at votes · 12 mo</span><span>{m.attendance.toFixed(0)}%</span></div>
      <div className="mt-1 h-2 rounded bg-navy-800"><div className="h-2 rounded" style={{ width: `${m.attendance}%`, background: barColor(m.attendance) }} /></div>
    </div>
  );
}

function Fold({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  useEffect(() => { if (window.matchMedia("(max-width: 639px)").matches) setOpen(false); }, []);
  return (
    <section className="rounded-[10px] border border-navy-line bg-navy-800">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left font-serif text-lg font-semibold uppercase" aria-expanded={open}>
        {title}<ChevronDown className={`size-5 text-gold transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="border-t border-navy-line px-4 py-3">{children}</div> : null}
    </section>
  );
}

function Profile({ m, rosterUrl, recapTo }: { m: MemberData; rosterUrl: string; recapTo: string }) {
  return (
    <div className="col-span-full rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-6">
      <div className="flex flex-wrap items-start gap-5">
        <Avatar name={m.name} big />
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-3xl font-bold uppercase">{m.name}{m.party ? <span className="ml-2 font-mono text-base text-night-muted">({m.party})</span> : null}</h3>
          <p className="text-[#F6F3EA]">{m.role} · {m.district} District</p>
          <div className="mt-2 space-y-1"><Placeholder>Term dates.</Placeholder><Placeholder>Email and phone — see the <a className="text-gold underline" href={rosterUrl} target="_blank" rel="noreferrer">official roster</a>.</Placeholder></div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <Fold title="Bio"><Placeholder>No bio on file. We'll only add one from official sources.</Placeholder></Fold>
        <Fold title="Committees"><Placeholder>Committee assignments not on file yet.</Placeholder></Fold>
        <div className="lg:col-span-2"><Fold title={`Recent motions (${m.motions.length} on record)`}>
          {m.motions.length === 0 ? <p className="text-sm text-night-muted">Per-member votes not computed for this body yet. See the official roll calls linked from each recap.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="font-mono text-[11px] tracking-wider text-night-muted uppercase"><tr><th className="py-1 pr-3">Date</th><th className="pr-3">Motion</th><th className="pr-3">Vote</th><th className="pr-3">Tally</th><th>Links</th></tr></thead>
                <tbody>
                  {m.motions.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t border-navy-line align-top">
                      <td className="py-2 pr-3 font-mono text-xs whitespace-nowrap">{r.date.replace(/^[A-Za-z]+, /, "")}</td>
                      <td className="pr-3"><span className="line-clamp-2">{r.action}</span></td>
                      <td className="pr-3"><span className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${VOTE[r.vote]}`}>{r.vote}</span></td>
                      <td className="pr-3 font-mono text-xs whitespace-nowrap">{r.tally.split(" ")[0]}</td>
                      <td className="whitespace-nowrap"><Link to={recapTo as never} params={{ slug: r.recapSlug } as never} className="text-gold hover:underline">Recap</Link>{r.jump ? <> · <a href={r.jump} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline"><Play className="size-3" />Video</a></> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Fold></div>
        <Fold title="Meeting attendance">
          <p className="mb-2 text-xs text-night-muted">Present = recorded at one or more votes in that meeting's official tallies.</p>
          <ul className="flex flex-wrap gap-1.5">
            {m.meetings.slice(0, 40).map((x) => <li key={x.recapSlug} title={`${x.date} — ${x.title}`} className={`size-5 rounded-sm ${x.present ? "bg-[#2BB673]" : "bg-[#C8102E]"}`} />)}
          </ul>
          <p className="mt-2 font-mono text-xs text-night-muted">{m.meetings.filter((x) => x.present).length} of {m.meetings.length} meetings with recorded votes · newest first</p>
        </Fold>
        <Fold title="Conflicts of interest"><Placeholder>No disclosures entered yet. Statements of Economic Interests are filed with the <a className="text-gold underline" href="https://ethics.dls.virginia.gov/" target="_blank" rel="noreferrer">Virginia Conflict of Interest and Ethics Advisory Council</a>.</Placeholder></Fold>
      </div>
    </div>
  );
}

export function MembersV4Page({ venue, boardName, explainer, members, rosterUrl, recapTo }: { venue: V4Venue; boardName: string; explainer: string; members: MemberData[]; rosterUrl: string; recapTo: string }) {
  const [district, setDistrict] = useState("All"); const [office, setOffice] = useState("All");
  const [sort, setSort] = useState<"name" | "att">("name"); const [open, setOpen] = useState<string | null>(null);
  const districts = ["All", ...new Set(members.map((m) => m.district))]; const offices = ["All", ...new Set(members.map((m) => m.role))];
  const list = useMemo(() => members.filter((m) => (district === "All" || m.district === district) && (office === "All" || m.role === office))
    .sort((a, b) => sort === "name" ? a.surname.localeCompare(b.surname) : (b.attendance ?? -1) - (a.attendance ?? -1)), [members, district, office, sort]);
  const ranked = [...members].sort((a, b) => (b.attendance ?? -1) - (a.attendance ?? -1));
  const sel = "mt-1 w-full rounded-md border border-navy-line bg-navy-800 px-2 py-2 text-sm text-white";
  const lab = "flex flex-col font-mono text-xs tracking-widest text-night-muted uppercase";
  return (
    <V4Main>
      <V4VenueHero venue={venue} kicker="Members" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="font-serif text-3xl font-semibold uppercase">{boardName}</h2><p className="text-[#F6F3EA]">{explainer}</p></div>
          <FoiaButton foia={venue.foia} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className={lab}>District<select className={sel} value={district} onChange={(e) => setDistrict(e.target.value)}>{districts.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className={lab}>Office<select className={sel} value={office} onChange={(e) => setOffice(e.target.value)}>{offices.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className={lab}>Committee<select className={sel} disabled title="Committee data not on file yet"><option>All (not on file yet)</option></select></label>
          <label className={lab}>Sort<select className={sel} value={sort} onChange={(e) => setSort(e.target.value as "name" | "att")}><option value="name">Name</option><option value="att">Attendance</option></select></label>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.flatMap((m) => {
            const isOpen = open === m.id;
            const cardEl = (
              <li key={m.id}>
                <button type="button" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen} className={`flex h-full w-full flex-col gap-3 rounded-[10px] border border-navy-line border-t-4 bg-navy-700 p-4 text-left hover:border-gold ${isOpen ? "border-gold border-t-gold" : "border-t-gold"}`}>
                  <div className="flex gap-3">
                    <Avatar name={m.name} />
                    <div className="min-w-0">
                      <p className="font-serif text-xl leading-tight font-semibold uppercase">{m.name}</p>
                      <p className="text-sm text-gold">{m.role}{m.party ? ` · ${m.party}` : ""}</p>
                      <p className="text-sm text-night-muted">{m.district}</p>
                      <p className="font-mono text-[11px] text-night-muted">Term ends: <span className={PH}>TBD</span></p>
                    </div>
                  </div>
                  <AttBar m={m} />
                  <div className="flex items-center gap-3 text-night-muted"><Mail className="size-4" aria-label="Email (placeholder)" /><Phone className="size-4" aria-label="Phone (placeholder)" /><span className="ml-auto font-mono text-xs text-gold">{isOpen ? "Close ▲" : "Profile ▼"}</span></div>
                </button>
              </li>
            );
            return isOpen ? [cardEl, <li key={m.id + "-p"} className="col-span-full"><Profile m={m} rosterUrl={rosterUrl} recapTo={recapTo} /></li>] : [cardEl];
          })}
        </ul>

        <section className="mt-10 rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-5">
          <h2 className="font-serif text-2xl font-semibold uppercase">Board attendance · last 12 months</h2>
          <p className="text-xs text-night-muted">Share of recorded votes where the member was present, from official tallies in our meeting recaps. Not a full meeting roll call.</p>
          <ol className="mt-3 space-y-1.5">
            {ranked.map((m, i) => (
              <li key={m.id} className="grid grid-cols-[1.5rem_9rem_1fr_4rem] items-center gap-2 text-sm sm:grid-cols-[2rem_14rem_1fr_6rem]">
                <span className="font-mono text-gold">{i + 1}</span><span className="truncate">{m.name}</span>
                <span className="h-3 rounded bg-navy-800">{m.attendance != null ? <span className="block h-3 rounded" style={{ width: `${m.attendance}%`, background: barColor(m.attendance) }} /> : null}</span>
                <span className="text-right font-mono text-xs">{m.attendance != null ? `${m.attendance.toFixed(1)}% · ${m.counted}` : "no data"}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 font-mono text-[11px] text-night-muted">% · number of recorded votes counted</p>
        </section>
        <p className="mt-6 text-sm text-night-muted">Official roster and contacts: <a className="text-gold hover:underline" href={rosterUrl} target="_blank" rel="noreferrer">{rosterUrl.replace("https://", "")} <ExternalLink className="inline size-3" /></a></p>
      </div>
    </V4Main>
  );
}
