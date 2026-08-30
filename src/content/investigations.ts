import type { Story } from "@/content/types";

/** Empty until a real investigation is ready. Do not restock with placeholders. */
export const INVESTIGATIONS: Story[] = [];

export function investigationBySlug(slug: string) {
  return INVESTIGATIONS.find((s) => s.slug === slug);
}
