/**
 * Ingest helper: prints suggested `locations` for news items that lack them.
 *   npx tsx tools/news/tag-locations.ts            # list untagged items with suggested tags
 * Ingests can also import { tagNewsLocations } from "src/lib/news-locations" and set
 * `locations: [...]` on each new NewsItem (omit the field when the result is empty).
 * Even without this, the site applies the same tagger at build time to untagged items.
 */
import { NEWS } from "../../src/content/news";
import { NEWS_LOCATION_BACKFILL } from "../../src/content/news-locations";
import { tagNewsLocations } from "../../src/lib/news-locations";

for (const n of NEWS) {
  if (n.locations || n.id in NEWS_LOCATION_BACKFILL) continue;
  const t = tagNewsLocations(n);
  if (t.length) console.log(`${n.id}\t${JSON.stringify(t)}\t${n.headline}`);
}
