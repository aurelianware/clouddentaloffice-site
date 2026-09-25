# Cloud Dental Office — marketing site

Static marketing site for [clouddentaloffice.com](https://clouddentaloffice.com).

Deploys to Cloudflare Pages project `clouddentaloffice-www`.

Sister to [cloudhealthoffice.com](https://cloudhealthoffice.com) (`src/site/` in the Cloud Health Office repo). Same Sentinel visual language: absolute black, cyan accent, founder-written copy.

## What this is

A source-available Apache 2.0 dental practice platform site. Cloud Dental Office is the system of record. Practice websites and marketplace partners read a vendor-neutral public availability contract and submit booking intent. They never become the calendar. They never see PHI.

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
| `/trust` | Isolation boundary. No SOC 2 / HITRUST claim. |
| `/contact` | Pilot inquiry — mailto, nothing stored on this site |
| `/privacy` | Marketing-site privacy notes |

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

4. In the Pages project: **Custom domains → Set up a domain → `clouddentaloffice.com`** (add `www.clouddentaloffice.com` too if you want the `www` host).
5. Point DNS at Cloudflare:
   - Apex (`clouddentaloffice.com`): Pages requires the zone to be on Cloudflare. Move the nameservers to Cloudflare.
   - Subdomain (`www`): either move the zone, or keep DNS elsewhere and add a `CNAME` for `www` → `clouddentaloffice-www.pages.dev`. **Add the domain in the Pages project first.** A bare CNAME without it returns Cloudflare error 1001.
6. TLS certificates are issued automatically once DNS resolves.

### Notes

- **Do not add `.html` rewrite rules to `_redirects`** (for example `/platform /platform.html 200`). Cloudflare Pages already serves clean URLs and redirects `/platform.html` → `/platform`. A rule that rewrites back to `.html` fights that redirect and makes every page loop. That is exactly what broke navigation before. The link check fails if one comes back. Use `_redirects` only for real moves (old path → new path, `301`).
- Link to clean URLs (`/platform`), never `/platform.html`. The link check enforces this.
- `404.html` at the root is served automatically, with a 404 status, for unknown paths. Keep it; without it Pages treats the site as a single-page app and serves `index.html` for every path.
- `_headers` sets custom HTTP headers (caching, security). It is Cloudflare-specific.
- `CNAME` and `.nojekyll` are GitHub Pages conventions. Cloudflare ignores them; the domain is configured in the dashboard.
- Contact form opens the visitor's mail client to `sales@clouddentaloffice.com`. No Formspree, no backend.

## Voice

Precise. Founder-written. Austere. Short sentences. No stock dentist photos. No invented metrics, customers, or certifications.
