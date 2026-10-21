/**
 * Weekly updates email: shared constants (client-safe, no secrets).
 *
 * CAN-SPAM postal address: approved by Scott 2026-10-21 (Coraggio Consulting, LLC registered address).
 * Every send still requires Scott's explicit approval (see tools/weekly/send.mjs).
 */
export const WEEKLY_FROM = "A Guy On X <updates@aguyonx.com>";
export const WEEKLY_REPLY_TO = "updates@aguyonx.com";
export const WEEKLY_SITE = "https://aguyonx.com";
export const POSTAL_ADDRESS = "Coraggio Consulting, LLC, 8 The Green, Suite B, Dover, DE 19901";
/** Env var names (values live only in Vercel project settings, never in the repo). */
export const ENV = { apiKey: "RESEND_API_KEY", segment: "RESEND_WEEKLY_SEGMENT_ID", secret: "WEEKLY_TOKEN_SECRET" } as const;
