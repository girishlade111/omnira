# Configuration and Content Architecture

## Site Configuration (`src/config/site.ts`)

All global studio identity, navigation, social links, clock timezone (`Europe/Berlin`, `12h`, seconds enabled), hero rotating phrases (`['interface', 'system', 'product', 'experience']`), CTA copy, 404 copy, and demonstration mode flags live in `siteConfig`.

## Environment Variables (`.env.example`)

- `NEXT_PUBLIC_SITE_URL`: Canonical base URL used for metadata, sitemap, and robots output.
- `CONTACT_FORM_MODE`: Defaults to `demo` for safe local submission validation; set to `webhook` with `CONTACT_WEBHOOK_URL` to enable external delivery.
- `CONTACT_WEBHOOK_URL`: Optional HTTPS webhook endpoint for contact form delivery.
- `ROBOTS_DISALLOW`: Optional override to emit `Disallow: /` in `/robots.txt`.

## Typed Content Collections (`src/content/`)

- `projects.ts`: All 27 CMS projects (`Brandora` to `Platify`) in row-major order with verified `displayDomain`, `externalUrl`, category memberships (`ALL PROJECTS`: 27, `AI`: 3, `BUSINESS`: 12, `ONE PAGE`: 5, `PORTFOLIO`: 7), `featured` flags, and local image variants.
- `services.ts`: Four core services (`Design`, `Development`, `VISUAL SYSTEM`, `CREATIVE`) and 5 isometric layer textures.
- `process.ts`: Four phases (`DISCOVER`, `Design`, `Build`, `Refine`), principle chips, and metrics (`4`, `100%`, `infinity`).
- `profile.ts`: About preview stats (`6+`, `40+`, `10K+`), 4 capabilities, Adrian Voss biography and profile details, 4 service cards, and Terminal 5-step configuration.
- `timeline.ts`: Seven career milestones (`2020` to `2026`) mapped to local artwork derivatives.
- `tools.ts`: Four categories (`DESIGN`, `DEVELOPMENT`, `MOTION`, `3D / VISUAL`) with 16 tool records and local SVG icon references.
- `testimonials.ts`: Six client testimonials, `4.8` satisfaction rating (`FROM 24 CLIENT PROJECTS`), and 8 partner SVG logos.
- `pricing.ts`: Three tiers (`STARTER $1,200`, `PRO $2,400`, `Custom $4,800`) and 4-item assurance strip.
- `faqs.ts`: Eight FAQ items (`01` to `08`).
- `contact.ts`: Status rows, email/location cards, 6 field definitions, and verified dropdown option lists.
