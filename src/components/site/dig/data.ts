import type { Board, Leg, Place, RollCallFile, SpendFile, SubjectIndex } from "./types";

// Static JSON under /files/dig/, fetched on demand so nothing heavy ships in the page bundle.
const cache = new Map<string, Promise<unknown>>();
function get<T>(path: string): Promise<T> {
  let p = cache.get(path);
  if (!p) {
    p = fetch(`/files/dig/${path}`).then((r) => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p as Promise<T>;
}
export const loadIndex = () => get<SubjectIndex>("index.json");
export const loadMoney = (slug: string) => get<SpendFile>(`money/${slug}.json`);
export const loadRollCalls = (ch: "house" | "senate") => get<RollCallFile>(`rc-${ch}.json`);
export async function loadSubject(id: string): Promise<{ kind: "leg"; leg: Leg; rc: RollCallFile } | { kind: "board"; board: Board } | { kind: "place"; place: Place; boards: Board[] }> {
  const [kind, key] = id.split(".");
  if (kind === "leg") {
    const leg = await get<Leg>(`leg/${key}.json`);
    return { kind, leg, rc: await loadRollCalls(leg.chamber) };
  }
  if (kind === "board") return { kind, board: await get<Board>(`board-${key}.json`) };
  if (kind === "place") {
    const place = await get<Place>(`place-${key}.json`);
    const boards = await Promise.all(place.boards.map((b) => get<Board>(`board-${b.split(".")[1]}.json`)));
    return { kind, place, boards };
  }
  throw new Error(`Unknown subject ${id}`);
}
