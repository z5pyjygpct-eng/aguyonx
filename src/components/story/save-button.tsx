import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSaved, toggleSaved, type SavedRef } from "@/lib/saved";
import { cn } from "@/lib/utils";

export function SaveButton({ refId, className }: { refId: SavedRef; className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isSaved(refId));
  }, [refId.kind, refId.slug]);

  return (
    <Button
      type="button"
      variant={on ? "default" : "outline"}
      size="sm"
      className={cn("min-w-32", className)}
      aria-pressed={on}
      onClick={() => setOn(toggleSaved(refId))}
    >
      <Bookmark className={cn("size-4", on && "fill-current")} />
      {on ? "Saved" : "Save"}
    </Button>
  );
}
