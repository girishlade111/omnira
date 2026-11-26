# Contact Form, Validation, Rate Limiting, and SEO Routes

This document describes the backend form validation, anti-spam protection, rate limiting, environment-driven delivery modes, and App Router SEO endpoints implemented for Omnira.

## 1. Contact Form Schema and Reference Reconciliation

Reference source: `research/reference/content/live-extraction.json` and `src/content/contact.ts`.

### Visible Form Fields (6)

| Field Key | UI Label | Input Type | Live HTML `name` | Validation Rule (`src/lib/contact-validation.ts`) |
| --- | --- | --- | --- | --- |
| `name` | `YOUR NAME` | `text` | `Name` | Required, trimmed string, 2..120 chars |
| `email` | `EMAIL ADDRESS` | `email` | `Email` | Required, trimmed lowercase valid email, max 254 chars |
| `projectType` | `PROJECT TYPE` | `select` | `Location` (Framer quirk) | Required enum from `contactContent.selectOptions.projectType` |
| `budgetRange` | `BUDGET RANGE` | `select` | `Location` (Framer quirk) | Required enum from `contactContent.selectOptions.budgetRange` |
| `timeline` | `TIMELINE` | `select` | `Location` (Framer quirk) | Required enum from `contactContent.selectOptions.timeline` |
| `details` | `PROJECT DETAILS` | `textarea` | `Email` (Framer quirk) | Optional string (defaults to `""`), trimmed, max 4000 chars |

Notes on live reference reconciliation:
- On `https://omnira.framer.website/contact`, all three `<select>` elements shared `name="Location"` and the `<textarea>` had `name="Email"`, while `name`, `email`, and `details` lacked the HTML `required` attribute (`required: false` in `live-extraction.json`).
- Our Next.js API enforces clean semantic field names (`name`, `email`, `projectType`, `budgetRange`, `timeline`, `details`), enforces `name` and `email` as required, and keeps `details` optional (max 4000 chars) to match the live HTML attribute while still supporting required UI validation if enabled.
- Option label `Not suire yet` (live typo) is normalized to `Not sure yet` with value `not-sure-yet`.

### Allowed Select Values

- `projectType`: `design`, `development`, `visual_system`, `creative`
- `budgetRange`: `1k-3k`, `3k-5k`, `5k-10k`, `10k-plus`, `not-sure-yet`
- `timeline`: `asap`, `2-weeks`, `2-4-weeks`, `1-2-months`, `3-plus-months`, `flexible`

### Anti-Spam Honeypot

Hidden fields (`website`, `company`, `subject`, `title`, `feedback`, `notes`, `remarks`, `comments`) are checked via `hasHoneypotTrip()`. Any non-empty honeypot value causes `POST /api/contact` to return `400` (`SPAM_DETECTED`).

## 2. Rate Limiter (`src/lib/rate-limit.ts`)

- In-memory sliding-window limiter keyed by `contact:<clientIp>`.
- Default policy: `5` requests per `600000` ms (10 minutes).
- Client IP resolution uses `x-forwarded-for` (first hop), `x-real-ip`, or `127.0.0.1` fallback.
- Exceeding the limit returns HTTP `429` (`RATE_LIMITED`) with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

## 3. API Endpoint (`src/app/api/contact/route.ts`)

- `POST /api/contact`:
  1. Parses JSON body (`400 INVALID_JSON` on malformed body).
  2. Checks honeypot fields (`400 SPAM_DETECTED`).
  3. Checks sliding-window rate limit (`429 RATE_LIMITED`).
  4. Validates payload with Zod (`400 VALIDATION_ERROR` with `fieldErrors`).
  5. Delivery mode:
     - When `CONTACT_FORM_MODE !== "demo"` and `CONTACT_WEBHOOK_URL` is configured, posts JSON payload to the webhook (8s timeout) and returns `200` with `mode: "webhook"` and `simulated: false` (or `502` on upstream failure, without exposing secrets).
     - Otherwise, returns `200` with `mode: "demo"`, `simulated: true`, and an explicit message stating that the request was validated locally and no live email was transmitted.
     - Nothing is ever transmitted to `omnira.framer.website`.
- `GET /api/contact` returns `405 Method Not Allowed` with `Allow: POST`.

## 4. SEO Routes (`src/app/sitemap.ts`, `src/app/robots.ts`)

- `sitemap.ts`: Emits `/`, `/about`, `/works`, and `/contact` using `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000`). `/404` is excluded.
- `robots.ts`: Defaults to `Allow: /` with `Sitemap: <siteUrl>/sitemap.xml`, and switches to `Disallow: /` when `ROBOTS_DISALLOW=true` or `CONTACT_FORM_MODE=demo`.
