/** Content access. V1 ships public-only; "members" is reserved for later accounts. */
export type Access = "public" | "members";

export type Citation = {
  id: string;
  label: string;
  href?: string;
  note?: string;
};

export type SourceDoc = {
  id: string;
  title: string;
  href: string;
  kind: "pdf" | "csv" | "md" | "txt" | "link";
  note?: string;
};

export type BodyBlock =
  | { type: "p"; text: string; cites?: string[] }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; attrib?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "x"; url: string; handle: string; name: string; date: string; text: string }
  | { type: "chart"; chart: "hearings" }
  | { type: "callout"; title: string; text: string };

export type Story = {
  slug: string;
  kind: "article" | "investigation";
  title: string;
  dek: string;
  date: string;
  displayDate: string;
  topic: string;
  kicker: string;
  image: string;
  imageAlt: string;
  access: Access;
  readMinutes: number;
  body: BodyBlock[];
  citations: Citation[];
  documents: SourceDoc[];
};

export type LibraryKind =
  | "government"
  | "news"
  | "research-tool"
  | "tool";

export type LibraryItem = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  displayDate: string;
  kind: LibraryKind;
  source: string;
  access: Access;
  href?: string;
  file?: string;
  tool?: string;
};
