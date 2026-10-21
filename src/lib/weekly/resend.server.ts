/**
 * Server-only helpers for the Weekly updates sign-up (Resend REST API via fetch; no SDK).
 * Never imported by client code: route handlers dynamic-import this file.
 * Missing env vars => callers get { ok:false, code:"not_configured" } and show a friendly message; nothing throws to the user.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { ENV, POSTAL_ADDRESS, WEEKLY_FROM, WEEKLY_REPLY_TO, WEEKLY_SITE } from "./config";

type Cfg = { apiKey: string; segment: string; secret: string };
export function readConfig(): Cfg | null {
  const apiKey = process.env[ENV.apiKey]?.trim();
  const segment = process.env[ENV.segment]?.trim();
  const secret = process.env[ENV.secret]?.trim();
  if (!apiKey || !segment || !secret || secret.length < 16) return null;
  return { apiKey, segment, secret };
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString();
const sig = (secret: string, body: string) => createHmac("sha256", secret).update(body).digest("base64url");

/** Signed token: purpose + email + expiry (ms). */
export function makeToken(secret: string, purpose: "confirm" | "unsub", email: string, ttlMs: number | null): string {
  const body = b64(JSON.stringify({ p: purpose, e: email, x: ttlMs ? Date.now() + ttlMs : 0 }));
  return `${body}.${sig(secret, body)}`;
}
export function readToken(secret: string, purpose: "confirm" | "unsub", token: string | null): string | null {
  if (!token || !token.includes(".")) return null;
  const [body, s] = token.split(".", 2);
  const want = Buffer.from(sig(secret, body));
  const got = Buffer.from(s);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const d = JSON.parse(unb64(body)) as { p: string; e: string; x: number };
    if (d.p !== purpose || typeof d.e !== "string") return null;
    if (d.x && Date.now() > d.x) return null;
    return d.e;
  } catch {
    return null;
  }
}

async function api(cfg: Cfg, method: string, path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const r = await fetch(`https://api.resend.com${path}`, {
      method,
      headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let data: any = null;
    try { data = await r.json(); } catch { /* empty body */ }
    return { ok: r.ok, status: r.status, data };
  } catch (err) {
    console.error("[weekly] resend fetch failed", path, err);
    return { ok: false, status: 0, data: null };
  }
}

/** Create the contact as pending (unsubscribed:true) or leave an existing one alone. */
export async function upsertPendingContact(cfg: Cfg, email: string, firstName: string) {
  const r = await api(cfg, "POST", "/contacts", { email, first_name: firstName || undefined, unsubscribed: true });
  if (r.ok) return true;
  // Already exists: fine. Don't change their status here (confirm does that).
  if (r.status === 409 || r.status === 422) return true;
  return false;
}
/** Returns the contact's first name ("" if none) on success, or null on failure. */
export async function confirmContact(cfg: Cfg, email: string): Promise<string | null> {
  const id = encodeURIComponent(email);
  const u = await api(cfg, "PATCH", `/contacts/${id}`, { unsubscribed: false });
  if (!u.ok) return null;
  const s = await api(cfg, "POST", `/contacts/${id}/segments/${encodeURIComponent(cfg.segment)}`);
  if (!(s.ok || s.status === 409)) return null;
  const g = await api(cfg, "GET", `/contacts/${id}`);
  return typeof g.data?.first_name === "string" ? g.data.first_name : "";
}
export async function unsubscribeContact(cfg: Cfg, email: string) {
  return (await api(cfg, "PATCH", `/contacts/${encodeURIComponent(email)}`, { unsubscribed: true })).ok;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function footer(unsubUrl: string) {
  // CAN-SPAM postal address (approved by Scott).
  const addrHtml = `<br>${esc(POSTAL_ADDRESS)}`;
  const addrTxt = `\n${POSTAL_ADDRESS}`;
  return {
    html: `<p style="font-size:12px;color:#55627a;border-top:1px solid #dde3ec;padding-top:12px;margin-top:24px">You're getting this because you signed up at aguyonx.com. <a href="${unsubUrl}">Unsubscribe</a> · <a href="${WEEKLY_SITE}/privacy">Privacy</a>${addrHtml}</p>`,
    text: `\n---\nYou're getting this because you signed up at aguyonx.com.\nUnsubscribe: ${unsubUrl}\nPrivacy: ${WEEKLY_SITE}/privacy${addrTxt}\n`,
  };
}
const wrap = (inner: string) => `<!doctype html><html><body style="margin:0;background:#f4f6fa"><div style="max-width:560px;margin:0 auto;padding:24px;font-family:Georgia,serif;font-size:16px;line-height:1.55;color:#0d1b33;background:#ffffff">${inner}</div></body></html>`;

async function send(cfg: Cfg, to: string, subject: string, html: string, text: string, unsubUrl: string) {
  const r = await api(cfg, "POST", "/emails", {
    from: WEEKLY_FROM,
    reply_to: WEEKLY_REPLY_TO,
    to: [to],
    subject,
    html,
    text,
    headers: { "List-Unsubscribe": `<${unsubUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
  if (!r.ok) console.error("[weekly] send failed", r.status, r.data?.name ?? "");
  return r.ok;
}

export function unsubUrlFor(cfg: Cfg, email: string) {
  return `${WEEKLY_SITE}/api/weekly/unsubscribe?t=${makeToken(cfg.secret, "unsub", email, null)}`;
}

export async function sendConfirmEmail(cfg: Cfg, email: string, firstName: string) {
  const link = `${WEEKLY_SITE}/api/weekly/confirm?t=${makeToken(cfg.secret, "confirm", email, 48 * 3600 * 1000)}`;
  const unsub = unsubUrlFor(cfg, email);
  const f = footer(unsub);
  const hi = `Hi ${firstName ? esc(firstName) : "there"},`;
  const html = wrap(`<p>${hi}</p><p>Please confirm you want my weekly updates from aguyonx.com.</p><p><a href="${link}" style="display:inline-block;background:#0d1b33;color:#e8b931;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Yes, sign me up</a></p><p>Or paste this link into your browser:<br><a href="${link}">${link}</a></p><p>This link works for 48 hours. If you didn't sign up, ignore this email and you won't hear from me.</p><p>Scott</p>${f.html}`);
  const text = `${hi.replace(/&amp;/g, "&")}\n\nPlease confirm you want my weekly updates from aguyonx.com:\n${link}\n\nThis link works for 48 hours. If you didn't sign up, ignore this email and you won't hear from me.\n\nScott${f.text}`;
  return send(cfg, email, "Please confirm your aguyonx.com updates", html, text, unsub);
}

/** Welcome email: text from /workspace/v4shots/weekly-update-plan.md section (c). */
export async function sendWelcomeEmail(cfg: Cfg, email: string, firstName: string) {
  const unsub = unsubUrlFor(cfg, email);
  const f = footer(unsub);
  const name = firstName || "there";
  const P = [
    `Hi ${name},`,
    "Thanks for signing up. I'm glad you're here.",
    "About once a week I'll send a short note on what's new at aguyonx.com: meeting recaps, how our officials voted, new investigations, and a moment or two from Find the Moment, where you can jump straight to the part of a meeting that matters.",
    "I keep it plain and I keep it sourced. If I can't show you where a number came from, it doesn't go in.",
  ];
  const html = wrap(`${P.map((p) => `<p>${esc(p)}</p>`).join("")}<p>A good place to start: <a href="${WEEKLY_SITE}/how-to">How to use this website</a>.</p><p>Hit reply anytime. I read every message, and tips are always welcome.</p><p>Thanks for paying attention to what happens in your local government. It matters.</p><p>Scott Mineo<br><a href="${WEEKLY_SITE}/">aguyonx.com</a></p>${f.html}`);
  const text = `${P.join("\n\n")}\n\nA good place to start: How to use this website\n${WEEKLY_SITE}/how-to\n\nHit reply anytime. I read every message, and tips are always welcome.\n\nThanks for paying attention to what happens in your local government. It matters.\n\nScott Mineo\n${WEEKLY_SITE}/${f.text}`;
  return send(cfg, email, "Welcome to aguyonx.com updates", html, text, unsub);
}

/** Small standalone HTML page for confirm/unsubscribe results. */
export function page(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} · A Guy on X</title></head><body style="margin:0;background:#0d1b33;color:#fff;font-family:Georgia,serif"><main style="max-width:560px;margin:0 auto;padding:48px 20px"><h1 style="text-transform:uppercase;color:#e8b931">${esc(title)}</h1><p style="font-size:18px;line-height:1.5">${body}</p><p><a style="color:#e8b931" href="/">Back to aguyonx.com</a></p></main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}
