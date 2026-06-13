# AGENTS.md

Working notes for Codex, Cline, Copilot, ChatGPT and any other agent editing this repository.
Read this file first, then `README.md`.

## Product

ChargebackPilot is a German consumer SaaS for structured chargeback, PayPal buyer protection,
Klarna complaint and credit-card dispute preparation.

The product helps users describe a case, receive an AI-assisted first assessment and unlock
case-bound templates:

- merchant letter
- bank, PayPal, Klarna or payment-provider request
- escalation draft
- PDF and email export
- evidence checklist, possible objections and next steps

Always preserve this positioning:

- It is a formulation and orientation tool.
- It is not legal advice, not a legal service and not a representative.
- Never promise refunds, success rates or legally binding outcomes.
- Use careful wording: "kann helfen", "kann eine Option sein", "im Einzelfall pruefen",
  "Anbieterregeln pruefen", "indikativ, keine Rechtsberatung".

## Repository Map

```text
artifacts/
  chargeback-pilot/      React + Vite frontend, homepage, wizard, paywall, SEO pages
  api-server/            Express API, Gemini analysis, Stripe, admin, static delivery
  mockup-sandbox/        development/mockup sandbox

lib/
  db/                    Drizzle/Postgres schema
  env/                   environment validation
  api-zod/               shared API schemas
  api-client-react/      generated/shared React API helpers
```

Important frontend files:

- `artifacts/chargeback-pilot/src/App.tsx`: routes, lazy chunks, providers
- `artifacts/chargeback-pilot/src/pages/Home.tsx`: homepage
- `artifacts/chargeback-pilot/src/pages/Wizard.tsx`: case wizard/result page
- `artifacts/chargeback-pilot/src/components/PaywallModal.tsx`: single-case paywall
- `artifacts/chargeback-pilot/src/lib/case-persistence.ts`: local case state
- `artifacts/chargeback-pilot/src/components/SeoHead.tsx`: client/SSR head and JSON-LD
- `artifacts/chargeback-pilot/src/seo-routes.ts`: canonical static SEO route metadata
- `artifacts/chargeback-pilot/src/seo-quality.ts`: programmatic SEO quality gate
- `artifacts/chargeback-pilot/src/seo-quality-config.json`: index/noindex schedule and overrides
- `artifacts/chargeback-pilot/scripts/prerender.mjs`: prerender, sitemap and route HTML output
- `artifacts/chargeback-pilot/src/index.css`: design tokens, dark mode, global utility overrides
- `artifacts/chargeback-pilot/src/components/theme/ThemeProvider.tsx`: light/dark/system theme state
- `artifacts/chargeback-pilot/src/components/theme/ThemeToggle.tsx`: theme toggle

Important backend files:

- `artifacts/api-server/src/app.ts`: Express app, security headers, static frontend delivery
- `artifacts/api-server/src/index.ts`: server entry
- `artifacts/api-server/src/routes/cases.ts`: case analysis routes
- `artifacts/api-server/src/routes/stripe.ts`: Stripe checkout/webhooks
- `artifacts/api-server/src/routes/admin.ts`: protected admin routes
- `artifacts/api-server/src/lib/auth.ts`: admin auth helpers

## Tech Stack

- Monorepo: pnpm workspaces
- Frontend: React, Vite, TypeScript, Tailwind, Radix UI, lucide-react, wouter
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL + Drizzle
- AI: Google Gemini API
- Payments: Stripe
- Bot protection: Cloudflare Turnstile
- Security: Helmet, rate limits, body limits, environment validation

Use `pnpm`, never npm/yarn.

## Design Direction

The UI is a calm, trustworthy German fintech/consumer-help SaaS.
Keep it operational and polished, not loud marketing.

Preserve:

- Inter font and existing typography scale
- restrained blue primary color
- compact SaaS navigation
- clear cards only for actual repeated items, tools or modals
- generous but not oversized spacing
- sober legal/consumer-help tone
- German labels that fit on mobile
- lucide icons for UI actions where possible
- payment brand logos on their correct brand surfaces

Avoid:

- decorative blobs/orbs/bokeh backgrounds
- one-note purple or beige themes
- landing-page fluff where a usable tool belongs
- nested cards
- huge hero typography inside compact panels
- SVG hero illustrations when real product/tool UI is the point
- visible explanatory text about keyboard shortcuts or implementation
- text overlap, clipped German labels and unstable button sizes

Mobile is critical. Long German strings must wrap or shrink cleanly.
Buttons such as checkout CTAs must not overflow on any common smartphone width.

## Dark Mode

Dark mode is a first-class feature.

Rules:

- Default follows system setting.
- User can override via the theme toggle.
- The visible toggle is binary: light mode and dark mode only. Do not show a third "system"
  option; system is the implicit default when no user preference is stored.
- Preference is stored in `localStorage` under `cbp-theme`.
- `index.html` includes a pre-paint script to set `.dark`, `data-theme` and `colorScheme`
  before CSS renders. Do not remove it.
- Keep light design unchanged when adding dark styles.
- Use tokens and targeted `.dark` overrides in `src/index.css`.
- Payment logos use `data-brand-logo` so dark global overrides do not damage brand colors.

When adding new hardcoded Tailwind colors (`bg-...`, `text-...`, `border-...`, gradients),
check their dark-mode appearance and add a targeted override if needed.

## SEO Architecture

SEO must be clean, page-specific and conservative.

Current principles:

- Every important route has canonical URL, title, meta description, robots and JSON-LD.
- `SeoHead` renders JSON-LD consistently during SSR and hydration. Do not reintroduce dynamic
  `document.head.appendChild` JSON-LD injection that causes hydration or duplicate-schema issues.
- Base schemas are Organization, WebSite and WebApplication.
- Page-specific schemas should match visible content only: Article, FAQPage, HowTo, BreadcrumbList,
  etc. where appropriate.
- FAQ schema must only represent FAQs visible on the page.
- No same generic FAQ/schema dump on every page.
- Candidate/noindex pages may exist but must not be pushed as SEO targets.
- `sitemap.xml` must contain only indexable canonical URLs and include `lastmod`.

Programmatic `/hilfe/...` pages are quality-gated:

- central config: `src/seo-quality-config.json`
- scoring: `src/seo-quality.ts`
- report command: `pnpm seo:report`
- sitemap/prerender decision mirrors the gate in `scripts/prerender.mjs`
- manual overrides exist: `forceIndex`, `forceNoindex`
- scheduled tranches can release more pages over time without manual clicks

Quality signals for programmatic SEO pages:

- provider-specific section
- problem-specific evidence list
- payment-method-specific next step
- FAQ with at least 3 relevant questions
- methodology/editorial note
- no generic placeholder text

Do not expose "prepared but not published" noindex candidates as prominent public SEO modules.
Internal linking should prioritize index-ready pages.

Important SEO/content pages include:

- `/ratgeber`
- `/chargeback-antrag-vorlage`
- `/paypal-kaeuferschutz-vorlage`
- `/klarna-reklamation-vorlage`
- `/ware-nicht-erhalten-musterbrief`
- `/abo-falle-musterbrief`
- `/rueckerstattung-haendler-vorlage`
- `/visa-reason-code-13-1`
- `/mastercard-chargeback-reason-code`
- `/vergleich/paypal-vs-kreditkarte-vs-klarna`
- `/scam-shops-2026`
- high-quality `/hilfe/...` pages listed by `pnpm seo:report`

Content style:

- Write natural, useful German.
- Do not keyword-stuff.
- Avoid AI-sounding labels like "automatisch verdichtet, redaktionell eingebettet".
- Prefer simple labels such as "Kurzantwort", "Auch interessant", "Passend dazu".
- "KI-Kurzantwort" may have subtle sparkle/summary styling, but no distracting caret or heavy
  non-composited blur animation.
- Keep legal caution visible without making every paragraph anxious.

## Prerendering And Static Delivery

The frontend build prerenders routes and writes:

- `route/index.html`
- `route.html` for non-root routes

This is intentional. It helps slashless URLs such as `/ratgeber` get the correct prerendered
HTML, title, canonical and robots on different static-serving setups.

The API server fallback in `artifacts/api-server/src/app.ts` must prefer prerendered HTML before
falling back to generic app-shell SEO HTML.

When touching routing, verify at least:

- `/`
- `/ratgeber`
- `/chargeback-antrag-vorlage`
- one indexable `/hilfe/...`
- one noindex candidate `/hilfe/...`

Each must return the expected canonical and robots meta.

## Paywall, Payments And Legal UX

Current pricing:

- single-case unlock: `0,99 EUR` end price, no subscription
- flatrate: `9,99 EUR` end price for 12 months, no subscription

Unlocks are case-bound. Do not reintroduce global unlock flags.

Important localStorage keys:

- `cbp_current_case_v2`
- `cbp_case_list_v1`
- `cbp_unlocked_case_ids_v1`
- `cbp_flatrate_v1`
- `cbp_pending_paywall_scroll_v1`

Homepage unlock CTA behavior:

- if an analyzed case exists, open the latest case and smooth-scroll to the paywall
- if no analyzed case exists, start a new wizard case

Stripe/legal checkbox rule:

- Do not show separate cancellation/right-of-withdrawal checkboxes in the app paywall.
- The legal consent should be handled by one Stripe Checkout checkbox/message.
- Keep wording legally cautious and consistent with AGB/Widerruf.

## Admin

Admin lives at `/admin` in the SPA and uses protected API routes.

Keep in mind:

- admin requests need Bearer token sessions after login
- direct `/admin` should be served by frontend fallback, not a backend 404
- admin password requirement requested by product owner: at least 15 characters
- admin/dev SEO report should show candidate URLs, score, missing items, status and recommendation

## Performance And PageSpeed

Goal: as close to 100 as practical without damaging design, typography or product clarity.

Recent PageSpeed-sensitive decisions:

- public routes are lazy-loaded to keep the main bundle smaller
- heavy PDF libraries must stay lazy and not load on first page view
- `SeoHead` avoids hydration mismatch from SSR/client JSON-LD differences
- AI summary animation avoids `filter: blur(...)`
- dark mode uses a pre-paint inline script to avoid flash
- route-specific prerendered HTML avoids title/canonical flicker on reload
- public Ratgeber, SEO, legal and `/hilfe/...` pages are intentionally imported synchronously in
  `App.tsx`. Do not lazy-load them again: visible content must not disappear between header and
  footer during navigation or hydration.

Do not add large always-loaded dependencies to `App.tsx` or homepage without a strong reason.
Use lazy chunks for admin, wizard, SEO page clusters, PDF generation and other non-critical code.

## Backend And Security

Never commit secrets.

Important environment variables:

```text
DATABASE_URL
NODE_ENV=production
BASE_PATH=/
ADMIN_PASSWORD
GEMINI_API_KEY
GEMINI_FALLBACK_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
TURNSTILE_SECRET_KEY
```

Security rules:

- validate user input
- no PII in logs
- use rate limits and body limits
- keep Helmet/CSP intentional
- treat Stripe, Gemini, DB and Turnstile keys as secrets
- if a real secret was committed, rotate it immediately

## Commands

Common commands:

```bash
pnpm install
pnpm --filter @workspace/chargeback-pilot run dev
pnpm --filter @workspace/chargeback-pilot run serve
pnpm --filter @workspace/chargeback-pilot run typecheck
pnpm --filter @workspace/chargeback-pilot run build
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/api-server run build
pnpm seo:report
pnpm run build:render
pnpm start
```

Before finishing meaningful frontend/SEO work, run as much of this as relevant:

```bash
pnpm --filter @workspace/chargeback-pilot run typecheck
pnpm --filter @workspace/chargeback-pilot run build
pnpm seo:report
```

If backend changed:

```bash
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/api-server run build
```

Useful HTML smoke check after build:

```bash
node - <<'NODE'
const routes = ['/', '/ratgeber', '/chargeback-antrag-vorlage', '/hilfe/amazon/ware-nicht-erhalten'];
for (const route of routes) {
  const file = route === '/' ? 'artifacts/chargeback-pilot/dist/public/index.html' : `artifacts/chargeback-pilot/dist/public${route}/index.html`;
  const html = require('node:fs').readFileSync(file, 'utf8');
  console.log(route, html.match(/<title>(.*?)<\/title>/i)?.[1], html.match(/<meta name="robots" content="([^"]+)"/i)?.[1]);
}
NODE
```

In this environment `rg` may not be installed. Use `find` and `grep` if needed.

## Git Rules

- The worktree may contain user changes. Do not revert unrelated files.
- Check `git status --short` before editing and before committing.
- Stage only files related to the task.
- Do not use destructive commands such as `git reset --hard` or `git checkout --` unless explicitly requested.
- Husky/lint-staged may format staged files during commit.
- Product-owner preference: after completing a code or documentation change, commit and push the
  finished work automatically unless the user explicitly says not to.
- If the user asks to commit/push, commit to the current branch and push.

## Copy Rules

Use German product copy.

Good:

- "Ersteinschaetzung"
- "Orientierung"
- "Textentwurf"
- "Vor Versand selbst pruefen"
- "indikativ, keine Rechtsberatung"
- "Anbieterregeln pruefen"

Avoid:

- "garantiert"
- "rechtssicher gewinnen"
- "wir holen dein Geld zurueck"
- "automatisch verdichtet"
- "KI-generiert" as a visible quality claim
- duplicate generic paragraphs across many SEO pages

## Non-Negotiables

- Keep the app useful as the first screen; do not replace it with a marketing landing page.
- Keep the calm fintech design and Inter typography.
- Keep dark mode complete and system-aware.
- Keep SEO page heads page-specific.
- Keep programmatic SEO gated and sitemap-clean.
- Keep noindex candidates out of prominent public SEO modules.
- Keep Stripe consent centralized in Stripe Checkout, not duplicate app checkboxes.
- Keep legal disclaimers cautious but not scary.
- Keep PDF generation and heavy libraries lazy.
- Keep route-specific prerendered HTML working.
