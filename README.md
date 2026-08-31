# A Guy on X

Independent investigative research and political intelligence for Loudoun County and Virginia.

**Site:** [aguyonx.com](https://aguyonx.com)  
**Desk:** [@VaChangeAgent](https://x.com/VaChangeAgent)

This repository is the canonical source for the public site. Content lives in ordinary TypeScript modules under `src/content/` and downloadable records under `public/library/`. Clone it, run it, and deploy it with ordinary Node tooling — no App Builder account required.

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Home |
| `/articles` | Commentary from the file |
| `/investigations` | Long-form research with citations, charts, X posts, source documents |
| `/library` | Reports, FOIA, datasets, government records, campaign finance |
| `/library/foia` | Virginia FOIA letter desk |
| `/about` | The desk and the method |
| `/contact` | Mail / X |

## Local development

Requires Node 22.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints.

```bash
npm run typecheck
npm run build
```

## Content

- Stories: `src/content/articles.ts`, `src/content/investigations.ts`
- Library catalog: `src/content/library.ts`
- Site identity: `src/content/site.ts`
- Body blocks support paragraphs, headings, quotes, images, charts, X posts, and callouts. Citations and downloadable documents hang off each story.

To add an article: append an object to `ARTICLES` with a unique `slug`, then add any files under `public/library/`.

All current records are `access: "public"`. The `"members"` value is reserved for later accounts — do not ship gated copy until auth is on.

## Deploy to aguyonx.com

Recommended path: **GitHub → Vercel → custom domain**.

1. Create an empty GitHub repository and push this project (`main`).
2. In [Vercel](https://vercel.com), **Add New Project** and import that repository.
3. Framework: Vite. Build command: `npm run build`. Node 22.
4. After the first deploy succeeds, open **Project → Settings → Domains** and add `aguyonx.com` and `www.aguyonx.com`.
5. At your DNS host, add the records Vercel shows (usually an A record for the apex and a CNAME for `www`).
6. Wait for HTTPS. Vercel issues the certificate automatically.

CI (typecheck + production build) runs from `.github/workflows/ci.yml` on push to `main`.

## Architecture (v1 vs later)

**Now (v1)**

- Static content in git. No accounts, no database, no payments.
- Contact is @VaChangeAgent on X until an email is chosen.
- FOIA drafts stay in `localStorage` on the visitor’s device.

**Later, without rewriting the publication**

| Feature | Where it plugs in |
| --- | --- |
| User accounts | Better Auth is already in `src/lib/auth/` (unused in v1). Add `/login` and wrap server functions with `authMiddleware`. |
| Paid subscriptions / Stripe | New `src/lib/billing/` + Stripe webhooks; membership state on the user row. |
| Members-only articles | Filter `access === "members"` on the server; do not send the body to logged-out clients. |
| Protected documents | Move files off `public/` to object storage; signed URLs after entitlement check. |
| AI search of the library | Server-only search over `src/content` + stored document text; never call models from the browser with a secret. |

Do not import `@/lib/db` or auth gates until those features are actually on.

## License

Editorial content © A Guy on X. Code in this repository may be reused for running aguyonx.com.
