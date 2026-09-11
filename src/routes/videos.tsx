import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { HomeSearch } from "@/components/site/home-search";
import { VIDEOS, VIDEOS_DEK } from "@/content/videos";

export const Route = createFileRoute("/videos")({ component: VideosIndex });

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function VideosIndex() {
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>The clip shelf</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Videos
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{VIDEOS_DEK}</p>

        <ul className="mt-12 space-y-14">
          {VIDEOS.map((v) => (
            <li key={v.id} id={v.id} className="scroll-mt-24">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {formatDate(v.date)}
              </p>
              <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl">
                {v.title}
              </h2>
              {v.byline ? (
                <p className="mt-2 text-sm text-muted-foreground">{v.byline}</p>
              ) : null}
              <div className="mt-5 overflow-hidden rounded-md bg-night shadow-sm outline outline-1 outline-night/10">
                <video
                  className="aspect-video w-full bg-night"
                  controls
                  playsInline
                  preload="metadata"
                  poster={v.poster}
                >
                  <source src={v.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{v.dek}</p>
              {v.sourceUrl ? (
                <p className="mt-2 text-sm">
                  <a
                    href={v.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0d7377] underline-offset-2 hover:underline"
                  >
                    {v.sourceLabel ?? "Source"}
                  </a>
                  {v.featuredOnHome ? (
                    <>
                      {" · "}
                      <Link
                        to="/"
                        className="text-[#0d7377] underline-offset-2 hover:underline"
                      >
                        Also on home
                      </Link>
                    </>
                  ) : null}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </main>
    </SiteShell>
  );
}
