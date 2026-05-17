# Render & Cloudflare Deployment für ChargebackPilot

## Ziel
Dieser Guide richtet sich an Einsteiger. Er zeigt, wie du das Projekt auf Render deployst, deine PostgreSQL-Verbindung sicher einrichtest und mit Cloudflare + UptimeRobot stabilisierst.

## 1) Code-Basis vorbereiten

1. In der Projektwurzel:
   - `pnpm install`
   - `pnpm --filter @workspace/chargeback-pilot run build`
   - `pnpm --filter @workspace/api-server run build`

2. Lokal testen:
   - `DATABASE_URL="<dein-db-url>" PORT=3000 pnpm --filter @workspace/api-server run start`
   - Öffne `http://localhost:3000`

> Wichtig: In `artifacts/api-server/src/app.ts` wird jetzt das Frontend aus `artifacts/chargeback-pilot/dist/public` geliefert.

## 2) Render konfigurieren

1. Erstelle ein neues Web Service auf Render.
2. Wähle das Repository und die Branche `main`.
3. Trage als Build Command ein:
   - `pnpm install && BASE_PATH=/ pnpm --filter @workspace/chargeback-pilot run build && pnpm --filter @workspace/api-server run build`
4. Trage als Start Command ein:
   - `pnpm --filter @workspace/api-server run start`
5. Setze die folgenden Environment-Variablen im Render-Dashboard:
   - `DATABASE_URL` = `postgresql://neondb_owner:npg_lUNHyQbZ04Lx@ep-old-wave-aljh9i8j.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require`
   - `BASE_PATH` = `/`
   - `NODE_ENV` = `production`
   - Optional: `GEMINI_API_KEY` = `<dein-google-genai-api-key>` (nur wenn du die KI-Analyse nutzen willst)

6. Optional: Falls du eine eigene Domain hast, füge sie als Custom Domain in Render hinzu.

## 3) Render `render.yaml`

Das Projekt enthält jetzt eine `render.yaml`, die Render automatisch erkennt. Sie definiert:

- Web-Service-Typ: `node`
- Region: `frankfurt`
- Health-Check: `/api/healthz`
- Build- und Start-Commands
- `BASE_PATH=/`

## 4) Cloudflare einrichten (DNS + Caching)

### Wenn du Cloudflare als DNS verwenden willst

1. Erstelle oder logge dich in dein Cloudflare-Konto ein.
2. Füge deine Domain hinzu.
3. Stelle sicher, dass dein DNS-Eintrag auf die Render-Domain zeigt.
   - In vielen Fällen setzt du einen CNAME für `www` auf die Render-Domain.
   - Für die Root-Domain (`@`) kannst du einen CNAME Flattening / ALIAS verwenden, falls Cloudflare das anbietet.
4. Lasse Cloudflare den Proxy aktiv (orange Wolke), wenn du Caching nutzen willst.
   - Achtung: Bei Problemen kannst du für den Anfang die Wolke auf „DNS only“ (grau) stellen.
5. SSL/TLS: Wähle `Full` oder `Full (strict)`.
   - Render liefert eigene TLS-Zertifikate, das ist gut.

### Caching & Performance

- Cloudflare kann statische Assets aus dem Frontend cachen.
- Da die App dynamisch ist, bleibt `/api` weiterhin live und muss bei Render bedient werden.
- Für weniger Traffic-Last kann Cloudflare CSS/JS/Bilder cachen und so Render entlasten.

## 5) UptimeRobot konfigurieren

1. Erstelle einen kostenlosen UptimeRobot-Account.
2. Erstelle einen neuen Monitor:
   - Typ: `HTTP(s)`
   - URL: `https://<deine-domain>/api/healthz`
   - Intervall: 5 Minuten
3. Dadurch wird dein Service regelmäßig angefragt und bleibt beim Render Free Tier aktiver.

> Hinweis: Render Free Tier kann trotzdem schlafen, wenn die Nutzung sehr gering oder die Plattform ausgelastet ist. UptimeRobot hilft, ist aber keine Garantie.

## 6) Was du auf Render einstellen musst (für Anfänger)

- `Build Command`: `pnpm install && BASE_PATH=/ pnpm --filter @workspace/chargeback-pilot run build && pnpm --filter @workspace/api-server run build`
- `Start Command`: `pnpm --filter @workspace/api-server run start`
- `Region`: `Europe (Frankfurt)` empfohlen
- `Plan`: `Free`
- `Environment`: `Node`
- `Health Check Path`: `/api/healthz`
- Environment-Variablen:
  - `DATABASE_URL`
  - `BASE_PATH` = `/`
  - `NODE_ENV` = `production`
  - `GEMINI_API_KEY` (optional)

## 7) Was Cloudflare für dich erledigt

- DNS-Verwaltung
- Optionales Caching für statische Inhalte
- Optionaler Schutz durch DDoS-Erkennung
- Verschlüsselung/SSL

## 8) Gute Praxis für deinen Setup

- Lege sensible Daten nicht ins Git-Repository.
- Nutze Render Secrets / Environment-Variablen.
- Teste Änderungen erst lokal mit `pnpm install`, `pnpm --filter @workspace/chargeback-pilot run build` und `pnpm --filter @workspace/api-server run build`.
- Wenn du Probleme mit Cloudflare-Proxy hast, schalte zuerst auf `DNS only` und prüfe, ob die App läuft.

## 9) Weiterführende Tipps

- Wenn dein Traffic steigt, kann Render Free Tier eng werden. Dann solltest du auf einen bezahlten Render-Plan umsteigen.
- Cloudflare kann statische Inhalte cachen, aber nicht die API-lastigen Endpunkte vollständig ersetzen.
- Schau dir auf Render danach auch `auto deploy` und `pull request deploys` an.
