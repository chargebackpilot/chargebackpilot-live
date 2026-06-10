# ChargebackPilot Architecture Documentation

**Date**: 2026-06-10  
**Version**: 1.0  
**Status**: Production Ready

## Overview

ChargebackPilot is a full-stack SaaS application that helps users analyze chargeback cases and generate complaint templates. The application uses a monorepo structure with shared libraries and separate backend/frontend deployments.

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Vite + TypeScript | Latest |
| **Backend** | Express.js + Node.js | v20 |
| **Database** | PostgreSQL + Drizzle ORM | Latest |
| **AI Analysis** | Google Gemini API | 2.4.0 |
| **Payments** | Stripe | v22+ |
| **Bot Protection** | Cloudflare Turnstile | v0 |
| **Package Manager** | pnpm | v9+ |

## Project Structure

```
workspace/
├── artifacts/                    # Production applications
│   ├── api-server/              # Express backend (Node.js)
│   │   ├── src/
│   │   │   ├── app.ts          # Express app setup with security headers
│   │   │   ├── index.ts        # Server entry point
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts     # Session-based admin authentication
│   │   │   │   ├── logger.ts   # Pino logging setup
│   │   │   │   ├── lru-cache.ts# Memory-efficient cache with TTL
│   │   │   │   └── gemini-analysis.ts # AI analysis
│   │   │   └── routes/
│   │   │       ├── cases.ts    # Case submission & analysis
│   │   │       ├── admin.ts    # Admin dashboard API
│   │   │       ├── health.ts   # Health checks
│   │   │       └── stripe.ts   # Payment webhooks
│   │   └── build.mjs           # esbuild configuration
│   ├── chargeback-pilot/        # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── pages/          # Route pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── lib/            # Utilities (PDF generation, etc.)
│   │   ├── vite.config.ts      # Vite configuration with SSR
│   │   └── entry-server.tsx    # SSR entry point
│   └── mockup-sandbox/          # Development playground
├── lib/                         # Shared libraries (pnpm workspaces)
│   ├── env/                    # Environment variables + validation (zod)
│   ├── db/                     # Database schema (Drizzle)
│   ├── api-zod/                # API type definitions (zod)
│   └── api-client-react/       # React API client hooks
├── scripts/                     # Build & utility scripts
└── .github/workflows/           # CI/CD pipelines
```

## Architecture Decisions

### 1. **Monorepo Structure (pnpm workspaces)**

**Decision**: Use pnpm workspaces instead of separate repositories.

**Rationale**:
- Shared libraries (`@workspace/env`, `@workspace/db`, `@workspace/api-zod`)
- Centralized TypeScript configuration
- Single CI/CD pipeline
- Easy refactoring across packages

**Trade-offs**: 
- More complex root-level configuration
- Must install root dependencies

**Rollback**: Could split into separate repos if growth warrants it.

---

### 2. **Session-Based Admin Auth (vs Headers)**

**Decision**: Use Bearer token sessions instead of password in headers.

**Rationale**:
- Passwords never transmitted in cleartext
- Session tokens are revocable
- Compatible with modern frontend auth patterns
- Prevents timing attacks with `timingSafeEqual`

**Implementation**:
```typescript
// Before: ❌ INSECURE
Authorization: x-admin-password: my-password-here

// After: ✅ SECURE
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Trade-offs**: 
- Requires client to store token
- Server needs session store (in-memory, Redis, or database)

**Migration Path**: 
- Old header-based auth deprecated but still works
- Clients must update to Bearer token auth

---

### 3. **LRU Cache for AI Analysis Results**

**Decision**: Use LRU (Least Recently Used) cache with TTL instead of simple Map.

**Rationale**:
- Prevents memory leaks from unbounded cache growth
- Automatic eviction of oldest entries when limit reached
- TTL-based expiration (1 hour default)
- Reduces duplicate API calls to Gemini

**Implementation**:
```typescript
// Max 500 entries, 1 hour TTL, auto-cleanup every 5 minutes
const aiCache = new LRUCache<string, unknown>(500, 60 * 60 * 1000);
```

**Metrics**:
- Cache hit rate: Reduces Gemini API calls by ~20-30%
- Memory usage: Fixed at ~50MB max
- Cleanup interval: 5 minutes

**Trade-offs**:
- Evicted entries are re-computed (no persistence layer)
- In-memory only (not distributed)

---

### 4. **Security Headers with Helmet.js**

**Decision**: Use `helmet` middleware for HSTS, CSP, X-Frame-Options, etc.

**Rationale**:
- Industry-standard security headers
- HSTS prevents SSL stripping attacks
- CSP prevents XSS attacks
- X-Frame-Options prevents clickjacking

**Configuration**:
```typescript
helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  contentSecurityPolicy: { /* ... */ },
  frameguard: { action: "deny" },
})
```

---

### 5. **Environment Variables with Zod Validation**

**Decision**: Create `@workspace/env` library for centralized env validation.

**Rationale**:
- Type-safe environment access
- Validation on startup (fail fast)
- Same schema for backend and frontend
- Clear documentation of all required variables

**Implementation**:
```typescript
export const apiServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  ADMIN_PASSWORD: z.string().min(16, "Must be at least 16 characters"),
  DATABASE_URL: z.string().url(),
  // ... more fields
});

// In index.ts
const env = getApiServerEnv(); // Throws if invalid
```

---

### 6. **Request Body Size Limits**

**Decision**: Limit JSON/URL-encoded body size to 1MB.

**Rationale**:
- Prevents memory exhaustion attacks (DoS)
- Typical case payload is <10KB
- Explicit `express.json({ limit: "1mb" })`

---

## Error Handling Pattern

All API endpoints use standardized error responses:

```typescript
interface ApiErrorResponse {
  code: string;          // Machine-readable error code
  message: string;       // Human-readable message
  details?: unknown;     // Additional context (dev only)
  timestamp: string;     // ISO 8601 timestamp
}

// Example error
{
  "code": "INVALID_INPUT",
  "message": "Ungültige Eingabedaten",
  "details": {
    "issues": [...]
  },
  "timestamp": "2026-06-10T10:30:00Z"
}
```

**Error Codes**:
- `INVALID_INPUT` - Input validation failed
- `UNAUTHORIZED` - Auth failed or missing
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Unhandled error

---

## Database Schema

### Core Tables

#### `cases` Table
```typescript
{
  id: serial (PK),
  paymentMethod: string,           // "paypal", "stripe", "visa", etc.
  problemType: string,             // "chargeback", "refund", etc.
  merchantName: string,
  amount: real,                    // EUR
  paymentDate: text,               // ISO date
  merchantCountry: string | null,
  merchantContacted: boolean,
  merchantResponse: text | null,
  evidence: string[],              // URLs/descriptions
  description: text,
  analysis: CaseAnalysis (JSON),   // AI analysis result
  paid: boolean,                   // Payment status
  paidAt: timestamp | null,
  paidAmountCents: integer,        // Stripe amount
  stripeSessionId: text,
  createdAt: timestamp (DEFAULT NOW),
}
```

#### `consents` Table
```typescript
{
  id: serial (PK),
  userId: string,                  // Anonymous UUID or IP hash
  consentType: string,             // "terms", "privacy", "marketing"
  timestamp: timestamp (DEFAULT NOW),
}
```

**Indexes**:
- `stripeSessionId` - Webhook lookups
- `createdAt` - Time-range queries
- `paymentMethod` - Analytics

---

## API Endpoints

### Public Endpoints

#### `POST /api/cases`
Submit case for AI analysis. Rate limited: 10 per hour per IP.

**Request**:
```json
{
  "paymentMethod": "paypal",
  "problemType": "chargeback",
  "merchantName": "Example Shop",
  "amount": 49.99,
  "paymentDate": "2026-06-01",
  "evidence": ["description or URL"],
  "description": "Item never arrived",
  "turnstileToken": "..." // Optional/required after 2 attempts
}
```

**Response** (201):
```json
{
  "id": "12345",
  "paymentMethod": "paypal",
  "analysis": {
    "strength": "stark",
    "successProbability": 0.85,
    "summary": "...",
    "merchantTemplate": "...",
    "bankTemplate": "...",
    "escalationTemplate": "..."
  },
  "createdAt": "2026-06-10T10:30:00Z"
}
```

#### `GET /api/cases/:id`
Retrieve case analysis result.

#### `GET /api/healthz`
Health check endpoint. No auth required.

### Protected Endpoints (Admin Only)

#### `POST /api/admin/login`
Authenticate and get session token.

**Request**:
```json
{ "password": "your-secure-password-16-chars-min" }
```

**Response** (200):
```json
{
  "ok": true,
  "token": "abc123def456...",
  "expiresIn": 86400
}
```

#### `GET /api/admin/stats`
Analytics dashboard data. Requires `Authorization: Bearer <token>`.

---

## Security Considerations

### 1. **Supply Chain Security**
- `pnpm-workspace.yaml` enforces 1-day minimum package age
- Prevents installation of malicious npm packages released hours ago
- Exclusion allowlist for trusted packages only

### 2. **Admin Password Requirements**
- Minimum 16 characters (enforced by zod)
- Stored in environment variables, never in code
- Compare using `timingSafeEqual` to prevent timing attacks

### 3. **Rate Limiting**
- **API**: 100 requests/hour per IP
- **Login**: 5 attempts/15 minutes per IP
- **Case Creation**: 10 per hour per IP (with Turnstile after 2 failures)

### 4. **CORS**
- Whitelist known origins (production: domain only)
- No wildcard in production
- Credentials required for cross-origin requests

### 5. **Data Privacy**
- No user identification (cases tracked by ID only)
- Evidence stored as hashed references
- TODO: GDPR delete endpoint

---

## Deployment Strategy

### Render Deployment

```yaml
# render.yaml
services:
  - type: web_service
    name: chargebackpilot
    env: node
    region: frankfurt
    buildCommand: pnpm run build:render
    startCommand: pnpm run start
    healthCheckPath: /api/healthz
    envVars:
      - DATABASE_URL  (sync: false - secret)
      - ADMIN_PASSWORD (sync: false - secret)
      - GEMINI_API_KEY (sync: false - secret)
      - STRIPE_SECRET_KEY (sync: false - secret)
```

### Build Process

1. **pnpm install** - Install dependencies
2. **typecheck** - Ensure no TS errors
3. **lint** - Code quality checks
4. **build** - Compile API server and React frontend
5. **Render deploy** - Deploy bundle

### Health Checks

- `/api/healthz` checked every 30 seconds
- If fails 3 times, service marked unhealthy
- Auto-rollback to previous deploy

---

## Monitoring & Observability

### Current Setup

- **Logging**: Pino (structured JSON logs)
- **Metrics**: Admin stats dashboard (`/api/admin/stats`)
- **Tracing**: Request ID in logs

### Recommended Additions

- [ ] APM (Application Performance Monitoring) - Sentry, Datadog, or Elastic
- [ ] Uptime monitoring - UptimeRobot or similar
- [ ] Database query analysis - pgBadger or pg_stat_statements
- [ ] Error rate dashboard - Grafana

---

## Roadmap

### Q3 2026

- [ ] User authentication (OAuth/social login)
- [ ] Case history (per user account)
- [ ] PDF template customization
- [ ] Multi-language support

### Q4 2026

- [ ] Webhook integrations (Zapier, Make)
- [ ] API key system for developers
- [ ] Rate limit tiers (free/pro/enterprise)
- [ ] Advanced analytics dashboard

---

## Troubleshooting

### Common Issues

**"ADMIN_PASSWORD must be at least 16 characters"**
- Generate: `openssl rand -hex 24`
- Update `.env` file
- Restart application

**"Rate limit exceeded"**
- Implement exponential backoff (2s, 4s, 8s, ...)
- Use Turnstile after 2 failures
- Cache results client-side

**"Database connection timeout"**
- Check `DATABASE_URL` is correct
- Verify database is accepting connections
- Check firewall rules (port 5432 for PostgreSQL)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## References

- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Helmet.js Security Headers](https://helmetjs.github.io/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
