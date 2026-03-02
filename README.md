# Elite Quality HVAC Website + Back Office

This project includes:

- `index.html`: public-facing HVAC marketing website
- `shop.html`: customer-facing shop/blog page powered from back-office posts
- `blog.html`: customer-facing HVAC blog page powered from back-office posts
- `backoffice.html`: internal CRM + marketing control panel (leads, locations, services, promotions, content, directories, reviews, maintenance plans, settings, roles)
- `styles.css`: shared styling for both pages
- `app.js`: public site interactions and lead capture
- `dashboard.js`: dashboard data management, analytics rendering, and CSV export
- `server.js`: API backend, validation, persistence, and secure static hosting
- `data/store.json`: persisted application data
- `scripts/build-site-architecture.mjs`: page generation for full SEO silo architecture
- `site/data/*.mjs` + `site/templates.mjs`: reusable content and templates for generated pages

## Run locally

Quickest option:

- Double-click `start-site.bat`
- It starts the local server and opens both pages automatically

Manual option:

Recommended:

```powershell
cd C:\projects\ACwebsite
npm install
npm run build:pages
npm run start
```

Then browse:

- `http://127.0.0.1:8787/index.html`
- `http://127.0.0.1:8787/shop.html`
- `http://127.0.0.1:8787/blog.html`
- `http://127.0.0.1:8787/backoffice.html`

## SEO architecture URLs

Generated sections:

- `/industries/` (+ industry detail pages)
- `/locations/` (+ Chicagoland city detail pages)
- `/reviews/`
- `/about/`
- `/contact/`

Also generated:

- `/sitemap.xml`
- `/robots.txt`

## API endpoints

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/public-site`
- `PATCH /api/session/role`
- `POST /api/leads`
- `PATCH /api/leads/:id`
- `DELETE /api/leads/:id`
- `POST /api/channels`
- `PUT /api/channels/:id`
- `DELETE /api/channels/:id`
- `POST /api/directories`
- `PATCH /api/directories/:id`
- `DELETE /api/directories/:id`
- `POST /api/campaigns`
- `DELETE /api/campaigns/:id`
- `POST /api/sync`
- `POST /api/locations`
- `PUT /api/locations/:id`
- `DELETE /api/locations/:id`
- `POST /api/service-pages`
- `PUT /api/service-pages/:id`
- `DELETE /api/service-pages/:id`
- `POST /api/promotions`
- `PUT /api/promotions/:id`
- `DELETE /api/promotions/:id`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `POST /api/maintenance/plans`
- `PUT /api/maintenance/plans/:id`
- `DELETE /api/maintenance/plans/:id`
- `POST /api/maintenance/members`
- `PUT /api/maintenance/members/:id`
- `DELETE /api/maintenance/members/:id`
- `PUT /api/settings`
- `POST /api/settings/notifications/test`
- `PUT /api/site-content`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/leads.csv`
- `GET /api/maintenance-members.csv`
- `GET /api/export.csv`

## Notes

- Data is persisted in `data/store.json` (not localStorage).
- Lead submissions are rate-limited to reduce spam.
- Security headers and content security policy are enabled by default.
- Lead email notifications can be configured in Back Office Settings.
- In Back Office `Shop and Blog Publisher`, set `Post Type`:
  - `Shop` = product/offer card shown on Shop page
  - `Blog` = article with media/content shown on Blog page

## SEO Features

**Complete enterprise-level SEO is now integrated!**

- ✅ **Structured Data**: LocalBusiness, Organization, AggregateRating schemas
- ✅ **Dynamic Sitemap**: Auto-generated at `/sitemap.xml`
- ✅ **Robots.txt**: Proper crawl directives at `/robots.txt`
- ✅ **Open Graph**: Social sharing optimization on all pages
- ✅ **Twitter Cards**: Rich previews for Twitter
- ✅ **SEO Monitor**: Built-in dashboard in Back Office (Section 14)
- ✅ **Local SEO**: Chicago coordinates, service areas, NAP data

### Quick SEO Setup
1. Open Back Office > Settings and update business info
2. Visit `/sitemap.xml` to verify sitemap
3. Check Back Office > SEO Monitor for status
4. Read `SEO-IMPLEMENTATION.md` for complete guide

### SEO Documentation
- `SEO-IMPLEMENTATION.md` - Complete setup guide
- `SEO-CHECKLIST.md` - Quick reference checklist
- `SEO-SUMMARY.md` - Feature overview
- `lib/seo-schema.js` - Schema generation utilities

## Lead Notification SMTP Setup

To send lead alerts to owner email, set these before starting the server:

```powershell
$env:SMTP_HOST="smtp.your-provider.com"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="false"
$env:SMTP_USER="your-smtp-user"
$env:SMTP_PASS="your-smtp-password"
$env:SMTP_FROM="alerts@yourdomain.com"
npm run start
```

Then in Back Office:

1. Open `Settings`
2. Enable `Lead Notifications`
3. Add recipient emails
4. Click `Send Test Email`
# JoeACwebsite
