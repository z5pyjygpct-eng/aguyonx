/** Meeting-type buckets derived from titles (display only). */
export function bosKind(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("budget")) return "Budget";
  if (t.includes("special")) return "Special";
  if (t.includes("public hearing") && !t.includes("business")) return "Public hearing";
  if (t.includes("business")) return "Business";
  return "Other";
}
