import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/content/site";
import { getContact, saveContact } from "@/lib/saved";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const existing = getContact();
    if (existing) {
      setName(existing.name);
      setEmail(existing.email);
      setMessage(existing.message);
      setDone(true);
    }
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    saveContact({ name: name.trim(), email: email.trim(), message: message.trim() });
    const subject = encodeURIComponent(`aguyonx.com — from ${name.trim()}`);
    const body = encodeURIComponent(message.trim() + `\n\n— ${name.trim()} <${email.trim()}>`);
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setDone(true);
  }

  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>The desk</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Contact</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Tips, documents, and corrections. A copy stays on this device. Sending opens your mail
          client to {SITE.email}.
        </p>

        <ul className="mt-8 space-y-2 text-sm">
          <li>
            <a href={`mailto:${SITE.email}`} className="hover:underline">
              {SITE.email}
            </a>
          </li>
          <li>
            <a href={SITE.xUrl} className="hover:underline" target="_blank" rel="noreferrer">
              {SITE.handle} on X
            </a>
          </li>
        </ul>

        {done ? (
          <p className="mt-10 font-serif text-2xl">Noted. Send the message from your mail client if it opened.</p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-10 grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="cname">Name</Label>
            <Input
              id="cname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cemail">Email</Label>
            <Input
              id="cemail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cmsg">Message</Label>
            <Textarea
              id="cmsg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Send
          </Button>
        </form>
      </main>
    </SiteShell>
  );
}
