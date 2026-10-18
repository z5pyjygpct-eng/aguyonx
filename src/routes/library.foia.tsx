import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { DARK_VARS, V4Main } from "@/components/site/lcps-v4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FOIA_AGENCIES } from "@/content/site";
import {
  formatFoiaLetter,
  loadFoiaDraft,
  saveFoiaDraft,
  type FoiaDraft,
} from "@/lib/foia";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const Route = createFileRoute("/library/foia")({ component: FoiaDesk });

const empty: FoiaDraft = {
  agencyId: "loudoun-county",
  requesterName: "",
  requesterEmail: "",
  requesterCity: "Ashburn",
  description:
    "All staff memoranda, presentations, draft motions, and correspondence among staff and members of the public body concerning the Board of Supervisors meeting of [date], item [number], including any exhibits cited but not attached to the public packet.",
};

// v4 look (navy/gold). Style only: fields, labels, letter text and behavior are unchanged.
const lab = "font-mono text-xs tracking-widest text-gold uppercase";
const field = "border-navy-line bg-navy-800 text-white placeholder:text-night-muted focus-visible:ring-gold";

function FoiaDesk() {
  const [draft, setDraft] = useState<FoiaDraft>(empty);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadFoiaDraft();
    if (saved) setDraft({ ...empty, ...saved });
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveFoiaDraft(draft);
  }, [draft, ready]);

  const letter = useMemo(() => formatFoiaLetter(draft), [draft]);
  const agency = FOIA_AGENCIES.find((a) => a.id === draft.agencyId);

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letter);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = letter;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8 lg:pb-12">
            <Breadcrumbs items={[{ label: "Research Library", to: "/library" }, { label: "FOIA letter desk" }]} />
            <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">Tool</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
              Draft a Virginia <span className="text-gold">FOIA</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-[#F6F3EA]">
              Name the public body, describe the records, copy the letter. The request is yours to
              send. This page stores a draft on this device only — it does not file anything.
            </p>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-8 lg:grid-cols-2">
          <form
            className="grid content-start gap-5 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6"
            onSubmit={(e) => {
              e.preventDefault();
              void copyLetter();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="agency" className={lab}>Public body</Label>
              <Select
                value={draft.agencyId}
                onValueChange={(agencyId) => setDraft((d) => ({ ...d, agencyId }))}
              >
                <SelectTrigger id="agency" aria-label="Public body" className={field}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={DARK_VARS} className="border-navy-line bg-navy-700 text-white">
                  {FOIA_AGENCIES.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="focus:bg-navy-600 focus:text-white">
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agency ? <p className="text-xs text-on-dark-muted">{agency.notes}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="records" className={lab}>Records requested</Label>
              <Textarea
                id="records"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                required
                className={`${field} min-h-32`}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rname" className={lab}>Your name</Label>
                <Input
                  id="rname"
                  value={draft.requesterName}
                  onChange={(e) => setDraft((d) => ({ ...d, requesterName: e.target.value }))}
                  autoComplete="name"
                  className={field}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remail" className={lab}>Email</Label>
                <Input
                  id="remail"
                  type="email"
                  value={draft.requesterEmail}
                  onChange={(e) => setDraft((d) => ({ ...d, requesterEmail: e.target.value }))}
                  autoComplete="email"
                  className={field}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rcity" className={lab}>City</Label>
              <Input
                id="rcity"
                value={draft.requesterCity}
                onChange={(e) => setDraft((d) => ({ ...d, requesterCity: e.target.value }))}
                autoComplete="address-level2"
                className={field}
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full bg-gold font-semibold text-navy-900 hover:bg-gold-hover sm:w-auto sm:justify-self-start sm:px-6"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy letter"}
            </Button>
          </form>

          <div className="min-w-0 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6">
            <p className={lab}>
              Preview
            </p>
            <pre className="mt-3 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-md border border-navy-line bg-[#F6F3EA] p-5 font-mono text-xs leading-relaxed text-navy-900">
              {letter}
            </pre>
          </div>
        </div>
      </V4Main>
    </SiteShell>
  );
}
