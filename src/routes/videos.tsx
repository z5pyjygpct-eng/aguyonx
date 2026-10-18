import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
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

// v4 look: card grid (1 / 2 / 4 across) that grows as VIDEOS gets new entries. Same videos, titles, text and links.
function VideosIndex() {
  return (
    <SiteShell>
      <V4Main>
        <HomeSearch />
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-8 pb-10 sm:px-8">
            <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">The clip shelf</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">Videos</h1>
            <p className="mt-4 max-w-2xl text-base text-[#F6F3EA]">{VIDEOS_DEK}</p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VIDEOS.map((v) => (
              <li
                key={v.id}
                id={v.id}
                className="flex scroll-mt-24 flex-col overflow-hidden rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700"
              >
                <div className="bg-night">
                  <video
                    className="aspect-video w-full bg-night"
                    controls
                    playsInline
                    preload="none"
                    poster={v.poster}
                  >
                    <source src={v.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="font-mono text-xs tracking-widest text-gold uppercase">{formatDate(v.date)}</p>
                  <h2 className="mt-2 font-serif text-xl font-semibold leading-snug">{v.title}</h2>
                  {v.byline ? <p className="mt-1 text-sm text-night-muted">{v.byline}</p> : null}
                  <p className="mt-2 text-sm leading-snug text-on-dark-muted">{v.dek}</p>
                  {v.sourceUrl ? (
                    <p className="mt-auto pt-3 text-sm">
                      <a
                        href={v.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gold underline-offset-2 hover:underline"
                      >
                        {v.sourceLabel ?? "Source"}
                      </a>
                      {v.featuredOnHome ? (
                        <>
                          {" · "}
                          <Link to="/" className="font-semibold text-gold underline-offset-2 hover:underline">
                            Also on home
                          </Link>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </V4Main>
    </SiteShell>
  );
}
