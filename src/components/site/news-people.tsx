import type { NewsPerson } from "@/content/news";
import { personChip } from "@/content/news";

export function NewsPeople({ people }: { people: NewsPerson[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {people.map((person) => (
        <span
          key={`${person.name}-${person.office}`}
          className="inline-flex items-center rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground"
        >
          {personChip(person)}
        </span>
      ))}
    </span>
  );
}
