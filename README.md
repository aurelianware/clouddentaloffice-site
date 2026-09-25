# Cloud Dental Office — marketing site

Static marketing site for `{{PRIMARY_DOMAIN}}`.

Deploys to Cloudflare Pages project `clouddentaloffice-www`.

Sister to [cloudhealthoffice.com](https://cloudhealthoffice.com) (`src/site/` in the Cloud Health Office repo). Same Sentinel visual language: absolute black, cyan accent, founder-written copy.

## What this is

Cloud Dental Office is one cloud system for scheduling, eligibility, claims, and payments for independent and small-group dental practices ({{LICENSE_WORDING}}). The site speaks to practice owners first; architecture and API detail live under **For developers & partners**. Cloud Dental Office is the system of record. Practice websites and marketplace partners read a vendor-neutral public availability contract and submit booking intent. They never become the calendar. They never see PHI.

Product source: [github.com/aurelianware/clouddentaloffice](https://github.com/aurelianware/clouddentaloffice)

## Pages

| Path | Audience | Purpose |
| --- | --- | --- |
| `/` | Practice owners | Office pain, how it works, honest status, privacy, founder, pilot CTA |
| `/features` | Practice owners | Ready / in progress / reserved, based on the product repo |
| `/integrations` | Practice owners | Zocdoc, practice website, Cloud Health Office, Stedi, Stripe |
| `/pilot` | Practice owners | Founding-practice pilot (October 2026); 3rd Set Smiles stated once, factually |
| `/about` | Practice owners | Founder and company |
| `/contact` | Practice owners | Pilot inquiry: mailto, nothing stored on this site |
| `/trust` | Both | Isolation boundary. No SOC 2 / HITRUST claim. |
| `/platform` | Developers & partners | Services, portal, gateway, public edge |
| `/scheduling` | Developers & partners | Public availability + booking-request contract (202 / 409 / 503) |
| `/claims` | Developers & partners | 837D / 270/271 / 835 status: honest, no invented coverage |
| `/architecture` | Developers & partners | Private PHI network, one public door (IntakeService) |
| `/docs` | Developers & partners | Clone, Compose, Kubernetes |
| `/privacy` | Both | Marketing-site privacy notes |

Pages are plain HTML with the header, nav, and footer repeated in each file. When you change the nav or footer, change it in every page.

## Placeholders

Values in `{{DOUBLE_BRACES}}` are filled in before launch: `PRIMARY_DOMAIN`, `LICENSE_WORDING`, `LICENSE_URL`, `PILOT_PRICING`, `ZOCDOC_REFERRAL_URL`, `ZOCDOC_CONFIRMATION_MODEL`, `STEDI_ROLE`. Find them with `grep -rn "{{" --include=*.html --include=*.xml --include=*.txt .`. The link check treats `https://{{PRIMARY_DOMAIN}}/…` as internal.

## Brand assets

Logos live in `/brand`. The header uses `brand/cdo-horizontal-on-dark.svg` and the footer uses `brand/cdo-stacked-on-dark.svg`. `brand/cdo-icon.svg` is the source for the favicons and share image.

After replacing any of them, regenerate the PNGs (`og-image.png`, `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`, `brand/cdo-icon-{192,512}.png`):

```sh
npm i --no-save puppeteer-core
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/build-brand-images.mjs
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
