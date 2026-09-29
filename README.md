# Cloud Dental Office — marketing site

Static marketing site for [clouddental.io](https://clouddental.io).

`clouddental.io` is the only site address. `clouddentaloffice.com` was the old address and is retired: it has no DNS record, and nothing on the site links to it. The link check fails if a page references it again.

Deploys to Cloudflare Pages project `clouddentaloffice-www`.

Sister to [cloudhealthoffice.com](https://cloudhealthoffice.com) (`src/site/` in the Cloud Health Office repo). Same Sentinel visual language: absolute black, cyan accent, founder-written copy.

## What this is

The marketing site for Cloud Dental Office, a source-available dental practice platform (Business Source License 1.1; see the product [LICENSING.md](https://github.com/aurelianware/clouddentaloffice/blob/main/LICENSING.md)). Cloud Dental Office is the system of record. Practice websites and marketplace partners read a vendor-neutral public availability contract and submit booking intent. They never become the calendar. They never see PHI.

Product source: [github.com/aurelianware/clouddentaloffice](https://github.com/aurelianware/clouddentaloffice)

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Home — system of record, intake isolation, bounded contexts |
| `/platform` | Nine services, portal, gateway, public edge |
| `/scheduling` | Public availability + booking-request contract (202 / 409 / 503) |
| `/claims` | 837D / 270/271 / 835 status — honest, no invented coverage |
| `/architecture` | Private PHI network, one public door (IntakeService) |
| `/pilot` | Zocdoc scheduling-API pilot with 3rd Set Smiles — stated once, factually |
| `/docs` | Clone, Compose, Kubernetes |
| `/trust` | Isolation boundary, license summary. No SOC 2 / HITRUST claim. |
| `/contact` | Pilot inquiry — Formspree to sales@cloudhealthoffice.com |
| `/privacy` | Marketing-site privacy notes |

## Brand assets

`graphics/brand/` holds the brand kit as delivered (source of truth; do not
redraw, recolor, or re-crop): `cdo-icon`, `cdo-logo-horizontal-{light,dark}-bg`,
`cdo-logo-stacked-{light,dark}-bg`, each as SVG and PNG, plus the whole set as
`cdo-brand-kit.zip`. The site is dark-only, so it uses the `dark-bg` variants.

Derived from those files:

- `favicon.svg`: `cdo-icon.svg` with its viewBox widened to a square (transparent padding, art unchanged).
- `favicon.ico` (16/32/48), `icon-192.png`, `icon-512.png`: `favicon.svg` rasterized.
- `apple-touch-icon.png`: `cdo-icon.svg` centered on navy `#06101a` (iOS has no transparency).
- `graphics/og-image.png` (1200×630): the horizontal dark-bg logo centered on the hero background.

`/css/*`, `/js/*`, and `/graphics/*` are cached as immutable for a year
(`_headers`), so a changed file needs a new URL or returning visitors keep the
old one. Give a replaced brand file a new filename. After editing
`css/sentinel.css`, update the `?v=` on its `<link>` in every page to the new
content hash. The same applies to `css/conversion.css` and `js/site.js`:

```sh
for f in css/sentinel.css css/conversion.css js/site.js; do
  H=$(sha256sum "$f" | cut -c1-8)
  sed -i -E "s|/${f//./\\.}(\?v=[0-9a-f]+)?\"|/$f?v=$H\"|" *.html
done
```

## Deploy — Cloudflare Pages

Static files, no build step. Cloudflare Pages serves `_headers` natively and
serves clean URLs on its own: `/platform` serves `platform.html`, and a request
for `/platform.html` gets a 308 redirect to `/platform`.

### How it deploys today

`.github/workflows/deploy.yml` runs on every push to `main` (and on manual
dispatch). It uses `wrangler pages deploy` to upload the repo root to the
`clouddentaloffice-www` project as a Direct Upload. It needs two repository
secrets: `CLOUDFLARE_API_TOKEN` (Cloudflare Pages: Edit) and
`CLOUDFLARE_ACCOUNT_ID`.

`.github/workflows/link-check.yml` runs `scripts/check-links.py` on every pull
request and push. Run it locally before pushing:

```sh
python3 scripts/check-links.py
```

### Alternative: Cloudflare Git integration

Use this only if you retire the Actions deploy. Cloudflare cannot attach Git to
a Direct Upload project, so this means creating a new Pages project. Never run
both, or every push deploys twice.

1. **Connect the repo.** In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, then pick `aurelianware/clouddentaloffice-site`.
2. **Build settings.** This is a static site, so leave them empty:
   - Framework preset: **None**
   - Build command: *(blank)*
   - Build output directory: **`/`** (the repo root)
   - Production branch: **`main`**
3. **Save and Deploy.** Cloudflare builds a `*.pages.dev` preview URL on every push and deploys `main` to production.

### Custom domain

The production domain is `clouddental.io`, with its DNS zone on Cloudflare. To attach a domain to a new Pages project:

4. In the Pages project: **Custom domains → Set up a domain → `clouddental.io`**.
5. Pages requires an apex domain's zone to be on Cloudflare. For a subdomain you can keep DNS elsewhere and add a `CNAME` → `clouddentaloffice-www.pages.dev`. **Add the domain in the Pages project first.** A bare CNAME without it returns Cloudflare error 1001.
6. TLS certificates are issued automatically once DNS resolves.

### Notes

- **Do not add `.html` rewrite rules to `_redirects`** (for example `/platform /platform.html 200`). Cloudflare Pages already serves clean URLs and redirects `/platform.html` → `/platform`. A rule that rewrites back to `.html` fights that redirect and makes every page loop. That is exactly what broke navigation before. The link check fails if one comes back. Use `_redirects` only for real moves (old path → new path, `301`).
- Link to clean URLs (`/platform`), never `/platform.html`. The link check enforces this.
- `404.html` at the root is served automatically, with a 404 status, for unknown paths. Keep it; without it Pages treats the site as a single-page app and serves `index.html` for every path.
- `_headers` sets custom HTTP headers (caching, security). It is Cloudflare-specific.
- `CNAME` and `.nojekyll` are GitHub Pages conventions. Cloudflare ignores them; the domain is configured in the dashboard.
- Contact form posts to Formspree form `xgojygon`, the same form the cloudhealthoffice.com contact page uses, which delivers to `sales@cloudhealthoffice.com`. Cloud Dental leads carry the subject "Cloud Dental Office pilot inquiry" and `site=clouddental.io`. If that form restricts allowed domains in Formspree, `clouddental.io` must be on the list. If the POST fails, the page opens a prefilled email to the same address.

## Voice

Precise. Founder-written. Austere. Short sentences. No stock dentist photos. No invented metrics, customers, or certifications.
