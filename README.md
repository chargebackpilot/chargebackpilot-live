# ChargebackPilot

KI-Hilfe für Chargeback, PayPal-Käuferschutz, Klarna-Reklamation und Verbraucherbeschwerden.

Live: https://chargebackpilot.de

## Für Menschen Und AI-Assistenten

Diese `README.md` ist die einzige Root-Dokumentation und die Source of Truth für Codex, Cline, Copilot, ChatGPT und Menschen. Wenn du am Projekt arbeitest, lies zuerst diese Datei.

## Was Die App Macht

ChargebackPilot ist eine deutschsprachige Verbraucher-SaaS. Nutzer schildern einen Fall, bekommen eine KI-gestützte erste Strukturierung und können vollständige Vorlagen freischalten:

- Händler-Anschreiben
- Antrag an Bank, PayPal, Klarna oder Zahlungsdienstleister
- Eskalationsentwurf
- PDF-/E-Mail-Export
- Orientierung zu Belegen, möglichen Einwänden und nächsten Schritten

Wichtig: Die App gibt keine Rechtsberatung, keine Erfolgsgarantie und vertritt Nutzer nicht gegenüber Banken, Händlern oder Zahlungsdienstleistern.

## Repo-Karte

```text
artifacts/
  chargeback-pilot/      React + Vite Frontend, Homepage, Wizard, Paywall, SEO-Seiten
  api-server/            Express API, Gemini-Analyse, Stripe, Admin, Health Checks
  mockup-sandbox/        Entwicklungs-/Mockup-Sandbox

lib/
  db/                    Drizzle/Postgres Schema
  env/                   Environment-Validierung
  api-zod/               geteilte API-Schemas
  api-client-react/      React API Hooks
```

## Tech Stack

- Monorepo: pnpm workspaces
- Frontend: React, Vite, TypeScript, Tailwind, Radix UI, lucide-react
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL + Drizzle
- AI: Google Gemini API
- Payments: Stripe
- Bot protection: Cloudflare Turnstile
- Security: Helmet, rate limits, body limits, env validation

## Commands

```bash
pnpm install
pnpm --filter @workspace/chargeback-pilot run dev
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/chargeback-pilot run typecheck
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run build:render
pnpm start
```

In dieser Umgebung ist `rg` manchmal nicht installiert. Dann `find` und `grep` nutzen.

## Entwicklung

- Codeänderungen eng am bestehenden Stil halten.
- Frontend-Design ist ruhiges SaaS-Design, nicht Marketing-Baukasten.
- Cards nur für echte Items, Tools oder Modals verwenden.
- Mobile zuerst auf lange deutsche Labels prüfen.
- Keine Textüberlappungen, keine gequetschten Buttons, stabile Höhen/Breiten für UI-Elemente.
- Icons bevorzugt aus `lucide-react`.
- Bei neuen Produkttexten vorsichtig formulieren: indikativ, keine Rechtsberatung, Anbieterregeln prüfen.
- Bei Änderungen im Frontend mindestens Paket-Typecheck laufen lassen:

```bash
pnpm --filter @workspace/chargeback-pilot run typecheck
```

## Produktregeln

- Kostenloser Einstieg: Nutzer können einen Fall analysieren.
- Einzel-Freischaltung: `0,99 €` Endpreis pro Fall, kein Abo.
- Flatrate: `9,99 €` Endpreis für 12 Monate, kein Abo.
- Unlocks sind case-bound. Niemals wieder eine globale Unlock-Flag einführen.
- Aktuelle/saved Cases liegen clientseitig in localStorage.
- Wichtige Keys:
  - `cbp_current_case_v2`
  - `cbp_case_list_v1`
  - `cbp_unlocked_case_ids_v1`
  - `cbp_flatrate_v1`
  - `cbp_pending_paywall_scroll_v1`

## Wichtige Frontend-Dateien

- Homepage: `artifacts/chargeback-pilot/src/pages/Home.tsx`
- Wizard: `artifacts/chargeback-pilot/src/pages/Wizard.tsx`
- Case Persistence: `artifacts/chargeback-pilot/src/lib/case-persistence.ts`
- Paywall Modal: `artifacts/chargeback-pilot/src/components/PaywallModal.tsx`
- Wizard Components: `artifacts/chargeback-pilot/src/components/wizard/WizardComponents.tsx`
- Payment Logos: `artifacts/chargeback-pilot/src/components/PaymentLogos.tsx`

## Navigation Und Paywall

- Neuer Fall: `openNewWizardCase()`
- Gespeicherter Fall: `openSavedCase(caseId)`
- Neuester analysierter Fall mit Paywall: `openCurrentCasePaywall()`
- Homepage-Button "Alle Vorlagen freischalten":
  - Wenn analysierter Fall existiert: neuesten Fall öffnen und zur Paywall scrollen.
  - Wenn kein Fall existiert: neuen Wizard starten.
- Paywall-Scroll läuft über `scroll=paywall` und `PENDING_PAYWALL_SCROLL_KEY`.

## Backend Und API

Wichtige Bereiche:

- App Setup: `artifacts/api-server/src/app.ts`
- Server Entry: `artifacts/api-server/src/index.ts`
- Case Routes: `artifacts/api-server/src/routes/cases.ts`
- Stripe Routes: `artifacts/api-server/src/routes/stripe.ts`
- Admin Routes: `artifacts/api-server/src/routes/admin.ts`
- Auth Helpers: `artifacts/api-server/src/lib/auth.ts`
- Cache: `artifacts/api-server/src/lib/lru-cache.ts`

Typische öffentliche Endpunkte:

- `POST /api/cases`
- `GET /api/cases/:id`
- `GET /api/healthz`

Admin-Endpunkte sind geschützt und nutzen Bearer-Token-Sessions.

## Sicherheit

- Keine echten Secrets in Git, Markdown, Logs oder Kommentaren.
- Render/Hosting-Secrets nur als Environment-Variablen setzen.
- Wenn eine echte DB-URL oder ein API-Key versehentlich committed wurde: Credential sofort rotieren.
- `DATABASE_URL` muss SSL nutzen, z. B. mit `sslmode=require`.
- `ADMIN_PASSWORD` mindestens 15 Zeichen.
- `STRIPE_SECRET_KEY`, `GEMINI_API_KEY`, `TURNSTILE_SECRET_KEY` wie Passwörter behandeln.
- User input immer validieren.
- Keine PII ungefiltert loggen.
- Security-Meldungen: `security@chargebackpilot.de`.

## Deployment

Render Production:

```bash
pnpm run build:render
pnpm start
```

Render-Konfiguration:

- Branch: `main`
- Build Command: `pnpm run build:render`
- Start Command: `pnpm run start`
- Health Check: `/api/healthz`
- Empfohlene Region: Frankfurt

Wichtige Environment-Variablen:

```text
DATABASE_URL
NODE_ENV=production
BASE_PATH=/
ADMIN_PASSWORD
GEMINI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
TURNSTILE_SECRET_KEY
CASE_CREATE_DAILY_LIMIT_PER_IP=3
CASE_DESCRIPTION_MIN_CHARS=80
CASE_DESCRIPTION_MAX_CHARS=6000
```

Cloudflare kann DNS, SSL und statisches Asset-Caching übernehmen. Öffentliche prerendered
HTML-Seiten setzen CDN-freundliche Cache-Header; `/api`, Admin, Wizard und URLs mit Query bleiben
dynamisch beim Backend.

## SEO Und Content

- Homepage soll Vertrauen aufbauen und klar erklären, nicht keyword-stuffen.
- Relevante Themen: Chargeback, PayPal Käuferschutz, Klarna Reklamation, Visa/Mastercard/Amex, Reason Codes, Fake-Shops, nicht gelieferte Ware, Flug/Hotel/Lieferdienst, Abo-Falle.
- FAQ darf Long-tail-Fragen abdecken, muss aber rechtlich vorsichtig bleiben.
- Keine Aussagen wie "du bekommst dein Geld zurück". Besser: "kann helfen", "kann eine Option sein", "entscheidet der Zahlungsdienstleister im Einzelfall".

## Git Und Arbeitsweise

- Es kann einen dirty worktree geben. Fremde Änderungen nicht zurücksetzen.
- Vor Commits prüfen, welche Dateien gestaged werden.
- Husky/lint-staged formatiert staged TS/TSX/JS-Dateien automatisch.
- Keine destruktiven Git-Kommandos ohne ausdrückliche Bitte.

## Dokumentationspolitik

Diese Datei ersetzt die früheren Root-Dokumente:

- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `RENDER_DEPLOYMENT.md`
- `CHANGES.md`
- `replit.md`

Neue Projektregeln, Architekturentscheidungen und Betriebsnotizen gehören hier hinein. Lieber kurz, konkret und aktuell als viele lange Dateien.
