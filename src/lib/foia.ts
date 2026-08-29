import { FOIA_AGENCIES, type FoiaAgency } from "@/content/site";

export type FoiaDraft = {
  agencyId: string;
  requesterName: string;
  requesterEmail: string;
  requesterCity: string;
  description: string;
};

export function agencyById(id: string): FoiaAgency | undefined {
  return FOIA_AGENCIES.find((a) => a.id === id);
}

export function formatFoiaLetter(draft: FoiaDraft) {
  const agency = agencyById(draft.agencyId);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const name = draft.requesterName.trim() || "[Your name]";
  const email = draft.requesterEmail.trim() || "[Your email]";
  const city = draft.requesterCity.trim() || "[City], VA";
  const body = draft.description.trim() || "[Describe the records, including dates, meeting names, application numbers, and record types.]";
  const agencyName = agency?.name ?? "[Public body]";
  const address = agency?.address ?? "[Address]";

  return `${today}

FOIA Officer
${agencyName}
${address}

Re: Request for public records under the Virginia Freedom of Information Act, Va. Code § 2.2-3700 et seq.

Dear FOIA Officer:

Pursuant to the Virginia Freedom of Information Act, I request copies of the following public records:

${body}

I request that the records be produced in electronic form if they exist electronically. I am a private citizen making this request for civic research and public oversight.

If you determine that any portion of the requested records is exempt from disclosure, please produce all non-exempt portions and cite the specific statutory exemption for each withholding, as required by Va. Code § 2.2-3704.

Please advise me in advance if you expect the cost of production to exceed $25.

Sincerely,

${name}
${email}
${city}`;
}

const DRAFT_KEY = "vca-foia-draft";

export function saveFoiaDraft(draft: FoiaDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadFoiaDraft(): FoiaDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as FoiaDraft) : null;
  } catch {
    return null;
  }
}
