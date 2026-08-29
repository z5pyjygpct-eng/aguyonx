const KEY = "agx-saved";

export type SavedRef = { kind: "article" | "investigation" | "library"; slug: string };

function read(): SavedRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedRef[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedRef[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function isSaved(ref: SavedRef) {
  return read().some((x) => x.kind === ref.kind && x.slug === ref.slug);
}

export function toggleSaved(ref: SavedRef) {
  const current = read();
  const exists = current.some((x) => x.kind === ref.kind && x.slug === ref.slug);
  const next = exists
    ? current.filter((x) => !(x.kind === ref.kind && x.slug === ref.slug))
    : [...current, ref];
  write(next);
  return !exists;
}

const CONTACT_KEY = "agx-contact";

export type ContactNote = {
  name: string;
  email: string;
  message: string;
  at: string;
};

export function saveContact(data: Omit<ContactNote, "at">) {
  const record: ContactNote = { ...data, at: new Date().toISOString() };
  localStorage.setItem(CONTACT_KEY, JSON.stringify(record));
  return record;
}

export function getContact(): ContactNote | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    return raw ? (JSON.parse(raw) as ContactNote) : null;
  } catch {
    return null;
  }
}
