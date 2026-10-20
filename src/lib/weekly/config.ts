/**
 * Weekly updates email: shared constants (client-safe, no secrets).
 *
 * LEGAL FLAG: CAN-SPAM requires a valid physical postal address in every commercial/bulk email.
 * Scott has NOT supplied one yet. POSTAL_ADDRESS is intentionally empty. Do not invent one.
 * The draft link check (tools/weekly/check.mjs) and the send step refuse to send while it is empty.
 */
export const WEEKLY_FROM = "A Guy On X <updates@aguyonx.com>";
export const WEEKLY_REPLY_TO = "updates@aguyonx.com";
export const WEEKLY_SITE = "https://aguyonx.com";
export const POSTAL_ADDRESS = ""; // TODO(Scott): supply a postal address (e.g. a PO box) before any weekly send.
/** Env var names (values live only in Vercel project settings, never in the repo). */
export const ENV = { apiKey: "RESEND_API_KEY", segment: "RESEND_WEEKLY_SEGMENT_ID", secret: "WEEKLY_TOKEN_SECRET" } as const;
