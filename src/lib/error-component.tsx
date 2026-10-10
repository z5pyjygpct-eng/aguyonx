import { useState } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { isChunkLoadError, reloadForStaleChunk } from "@/lib/chunk-reload";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    (error as { message: string }).message
  ) {
    return (error as { message: string }).message;
  }
  return "An unexpected error occurred. Try reloading the page.";
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  // A stale chunk after a deploy: reload once instead of showing the error.
  const stale = isChunkLoadError(error);
  const [reloading] = useState(() => stale && reloadForStaleChunk());
  if (reloading) return null;
  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">
        {stale
          ? "This page was updated while it was open. Please refresh to load the latest version."
          : errorMessage(error)}
      </p>
    </main>
  );
}
