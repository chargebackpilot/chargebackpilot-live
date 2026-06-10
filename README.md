# ChargebackPilot

> KI-Hilfe für Chargeback, PayPal-Käuferschutz & Reklamation

**[Live Demo](https://chargebackpilot.de)** | **[Documentation](#documentation)** | **[Security Policy](SECURITY.md)** | **[Contributing](CONTRIBUTING.md)**

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/chargebackpilot/chargebackpilot-live.git
cd chargebackpilot

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local and fill in required variables

# 3. Install dependencies
pnpm install

# 4. Setup database
pnpm --filter @workspace/db run push

# 5. Start development servers
# Terminal 1:
pnpm --filter @workspace/api-server run dev

# Terminal 2 (optional):
pnpm --filter @workspace/chargeback-pilot run dev
```

### Commands

```bash
pnpm build              # Build all packages
pnpm build:render       # Build for Render deployment
pnpm start              # Start API server
pnpm lint              # Check code quality
pnpm lint:fix          # Fix linting issues
pnpm format            # Format code
pnpm format:check      # Check formatting
pnpm typecheck         # TypeScript type checking
```

## Project Structure

```
chargebackpilot/
├── artifacts/
│   ├── api-server/         # Express.js backend
│   └── chargeback-pilot/    # React frontend
├── lib/
│   ├── env/                # Environment validation
│   ├── db/                 # Database schema
│   ├── api-zod/            # API types
│   └── api-client-react/   # React hooks
└── docs/
    ├── ARCHITECTURE.md     # System design
    ├── CONTRIBUTING.md     # Development guide
    └── SECURITY.md         # Security policy
```

## Documentation

- **[Architecture](ARCHITECTURE.md)** - System design, database schema, API endpoints
- **[Contributing](CONTRIBUTING.md)** - Development setup, git workflow, code standards
- **[Security](SECURITY.md)** - Security policy, best practices, incident response
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Details of all changes for AI assistants

## Features

✅ **AI-Powered Case Analysis** - Google Gemini analyzes chargebacks in 60 seconds  
✅ **Professional Letter Templates** - Generated DIN 5008 compliant PDF letters  
✅ **Merchant/Bank/Escalation Routes** - Tailored templates for each stage  
✅ **Turnstile CAPTCHA** - Bot protection with Cloudflare  
✅ **Stripe Integration** - Accept payments for premium features  
✅ **Rate Limiting** - DDoS & API cost protection  
✅ **Security Headers** - HSTS, CSP, X-Frame-Options with Helmet  
✅ **Session Auth** - Secure admin authentication  

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Google Gemini API
- **Payments**: Stripe
- **Logging**: Pino
- **Security**: Helmet.js, bcrypt, timing-safe-equal

### Frontend
- **Framework**: React 19
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Forms**: React Hook Form
- **Validation**: Zod
- **Query**: TanStack React Query

### DevOps
- **Package Manager**: pnpm
- **TypeScript**: 5.9+
- **Linting**: ESLint
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions
- **Deployment**: Render
- **Monitoring**: Pino logs

## Deployment

### Production (Render)

```bash
# Render auto-deploys on main branch push
# Build command: pnpm run build:render
# Start command: pnpm run start

# Set environment variables in Render dashboard:
DATABASE_URL           # PostgreSQL connection
ADMIN_PASSWORD        # Admin panel password (16+ chars)
GEMINI_API_KEY        # Google Gemini API key
STRIPE_SECRET_KEY     # Stripe secret key
TURNSTILE_SECRET_KEY  # Cloudflare Turnstile secret
```

### Health Check

```bash
curl https://chargebackpilot.de/api/healthz
# {"ok": true}
```

## API Endpoints

### Public

- `POST /api/cases` - Submit case for analysis (rate limited: 10/hour)
- `GET /api/cases/:id` - Retrieve case result
- `GET /api/healthz` - Health check

### Admin (Protected)

- `POST /api/admin/login` - Get session token
- `POST /api/admin/logout` - Destroy session
- `GET /api/admin/stats` - Analytics dashboard

See [ARCHITECTURE.md](ARCHITECTURE.md) for full endpoint documentation.

## Security

### Key Features

✅ Environment variables validated with Zod  
✅ Session-based admin authentication (Bearer tokens)  
✅ Security headers (HSTS, CSP, X-Frame-Options)  
✅ Rate limiting (100 req/hour global, 5/15min login)  
✅ Request body size limits (1MB)  
✅ LRU cache with TTL (prevents memory leaks)  
✅ CORS whitelist (production domains only)  
✅ Input validation (Zod schemas)  
✅ Structured logging (no PII)  
✅ Timing-safe password comparison  

### Reporting Vulnerabilities

Found a security issue? Email **security@chargebackpilot.de** (not GitHub issues)

See [SECURITY.md](SECURITY.md) for full details.

## Code Quality

### Standards

- TypeScript strict mode enabled
- ESLint + Prettier enforced
- Pre-commit hooks (Husky)
- No `any` types allowed
- Explicit error codes for all API responses
- Comprehensive logging

### Checks

```bash
pnpm run lint        # ESLint
pnpm run format      # Prettier
pnpm run typecheck   # TypeScript
pnpm run build       # Full build test
```

### CI/CD

GitHub Actions runs on every push:
- ✅ Linting
- ✅ Type checking
- ✅ Build verification
- ✅ Auto-deploy to Render (main branch only)

## Performance

### Optimization Strategies

- **Frontend**: Vite code splitting, lazy route loading
- **Backend**: LRU cache for AI results, connection pooling
- **Database**: Indexed queries, prepared statements
- **API**: Request body size limits, rate limiting

### Metrics

- Frontend bundle: ~180KB gzipped (initial)
- API response time: <200ms (p95)
- Cache hit rate: ~20-30% (Gemini queries)
- Deployment: ~2 minutes (Render)

## Monitoring

### Current Setup

- **Logs**: Structured JSON to stdout (Pino)
- **Health**: `/api/healthz` endpoint
- **Stats**: `/api/admin/stats` dashboard

### Recommended Tools

- APM: [Sentry](https://sentry.io), [Datadog](https://www.datadoghq.com)
- Monitoring: [UptimeRobot](https://uptimerobot.com)
- Analytics: [Plausible](https://plausible.io)

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Git workflow
- Code standards
- PR process

## License

MIT License - See LICENSE file

## Support

- 📖 **Documentation**: [ARCHITECTURE.md](ARCHITECTURE.md)
- 🔐 **Security**: [SECURITY.md](SECURITY.md)
- 🤝 **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/chargebackpilot/chargebackpilot-live/issues)

## Roadmap

### Q3 2026
- [ ] User accounts & case history
- [ ] PDF template customization
- [ ] Multi-language support

### Q4 2026
- [ ] Webhooks & integrations
- [ ] Developer API keys
- [ ] Rate limit tiers (free/pro)

See [ARCHITECTURE.md](ARCHITECTURE.md) for full roadmap.

## Credits

Built with ❤️ by the ChargebackPilot team using modern web technologies.

---

**Latest Update**: 2026-06-10 | **Version**: 1.0.0 | **Status**: Production Ready
