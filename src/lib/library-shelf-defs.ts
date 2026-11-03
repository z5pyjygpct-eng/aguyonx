/** Shelf ids/labels for /library, split out so the route's search validation does not pull the whole library into the main bundle. */
export const SHELVES = [
  { id: "foia", label: "FOIA & tools" },
  { id: "money", label: "Money & spending" },
  { id: "laws", label: "Laws, votes & elections" },
  { id: "gov", label: "State & local government" },
  { id: "watch", label: "Watchdogs & research" },
  { id: "vanews", label: "Virginia & NoVA news" },
  { id: "natnews", label: "National news" },
] as const;
export type ShelfId = (typeof SHELVES)[number]["id"];
