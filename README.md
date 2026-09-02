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

## Deploy

GitHub Pages (this repo, `main`, `/`) or Cloudflare Pages / Azure Static Web Apps.

- `CNAME` → `clouddentaloffice.com`
- `_redirects` and `_headers` for Cloudflare Pages clean URLs
- GitHub Pages serves `platform.html` at `/platform`

Contact form opens the visitor's mail client to `sales@clouddentaloffice.com`. No Formspree, no backend.

## Voice

Precise. Founder-written. Austere. Short sentences. No stock dentist photos. No invented metrics, customers, or certifications.
