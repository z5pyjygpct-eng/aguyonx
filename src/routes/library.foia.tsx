import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
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

export const Route = createFileRoute("/library/foia")({ component: FoiaDesk });

const empty: FoiaDraft = {
  agencyId: "loudoun-county",
  requesterName: "",
  requesterEmail: "",
  requesterCity: "Ashburn",
  description:
    "All staff memoranda, presentations, draft motions, and correspondence among staff and members of the public body concerning the Board of Supervisors meeting of [date], item [number], including any exhibits cited but not attached to the public packet.",
};

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
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="mb-6">
          <Link to="/library" className="font-mono text-xs tracking-widest text-muted-foreground uppercase hover:underline">
            ← Research library
          </Link>
        </p>
        <Kicker>Tool</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Draft a Virginia FOIA
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Name the public body, describe the records, copy the letter. The request is yours to
          send. This page stores a draft on this device only — it does not file anything.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <form
            className="grid gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              void copyLetter();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="agency">Public body</Label>
              <Select
                value={draft.agencyId}
                onValueChange={(agencyId) => setDraft((d) => ({ ...d, agencyId }))}
              >
                <SelectTrigger id="agency" aria-label="Public body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOIA_AGENCIES.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agency ? <p className="text-xs text-muted-foreground">{agency.notes}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="records">Records requested</Label>
              <Textarea
                id="records"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rname">Your name</Label>
                <Input
                  id="rname"
                  value={draft.requesterName}
                  onChange={(e) => setDraft((d) => ({ ...d, requesterName: e.target.value }))}
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remail">Email</Label>
                <Input
                  id="remail"
                  type="email"
                  value={draft.requesterEmail}
                  onChange={(e) => setDraft((d) => ({ ...d, requesterEmail: e.target.value }))}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rcity">City</Label>
              <Input
                id="rcity"
                value={draft.requesterCity}
                onChange={(e) => setDraft((d) => ({ ...d, requesterCity: e.target.value }))}
                autoComplete="address-level2"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy letter"}
            </Button>
          </form>

          <div>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Preview
            </p>
            <pre className="mt-3 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-card p-5 font-mono text-xs leading-relaxed text-foreground">
              {letter}
            </pre>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
