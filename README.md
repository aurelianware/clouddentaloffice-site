# Cloud Dental Office — marketing site

Static marketing site for [clouddentaloffice.com](https://clouddentaloffice.com).

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

This site is designed to deploy on **Cloudflare Pages**, which reads the
`_redirects` and `_headers` files natively — clean URLs (`/platform` → `platform.html`)
and custom HTTP headers both work with no build step.

### One-time setup

1. **Connect the repo** — in the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, then pick `aurelianware/clouddentaloffice-www-or--site`.
2. **Build settings** — this is a static site, so leave them empty:
   - Framework preset: **None**
   - Build command: *(blank)*
   - Build output directory: **`/`** (the repo root)
   - Production branch: **`main`**
3. **Save and Deploy.** Cloudflare builds a `*.pages.dev` preview URL on every push and deploys `main` to production.

### Custom domain

4. In the new Pages project: **Custom domains → Set up a domain → `clouddentaloffice.com`** (add `www.clouddentaloffice.com` too if you want the `www` host).
5. Point DNS at Cloudflare:
   - Easiest: move the `clouddentaloffice.com` zone to Cloudflare (update the registrar's nameservers). Cloudflare then adds the Pages DNS records and TLS automatically.
   - Or, keep DNS elsewhere and add a `CNAME` record for `clouddentaloffice.com` → `<project>.pages.dev`.
6. TLS certificates are issued automatically once DNS resolves.

### Notes

- `_redirects` maps every clean URL (`/platform`, `/scheduling`, …) to its `.html` file with a `200` rewrite.
- `_headers` sets custom HTTP headers (caching, security). **Both files are Cloudflare-specific and are ignored by GitHub Pages.**
- The `CNAME` file is a GitHub-Pages convention. It is harmless but **unused** on Cloudflare — the domain is configured in the dashboard instead. Leave it in place only if you also want GitHub Pages to work.
- Contact form opens the visitor's mail client to `sales@clouddentaloffice.com`. No Formspree, no backend.

### Fallback: GitHub Pages

GitHub Pages can serve this repo (`main`, `/`) but **ignores `_redirects` and `_headers`** — you would lose clean URLs and custom headers unless you restructure each page into a `page/index.html` folder. Cloudflare Pages is recommended.

## Voice

Precise. Founder-written. Austere. Short sentences. No stock dentist photos. No invented metrics, customers, or certifications.
