# Contributing to ChargebackPilot

Welcome! This document describes how to contribute code, report bugs, and suggest features.

## Code Quality Standards

### TypeScript

- **Strict Mode**: All TypeScript code must pass strict mode checks (`tsc --strict`)
- **Type Annotations**: Explicit return types required for all functions
- **No `any`**: Use `unknown` instead of `any`
- **Null Safety**: Enable `strictNullChecks` (enabled by default)

```typescript
// ❌ Bad
function process(data: any) {
  return data.result; // Implicitly returns any
}

// ✅ Good
function process(data: unknown): number {
  if (typeof data !== "object" || !data) return 0;
  return (data as { result: number }).result;
}
```

### ESLint & Prettier

**Before pushing, run**:

```bash
pnpm run lint:fix   # Auto-fix linting issues
pnpm run format     # Format code with Prettier
```

**Pre-commit hooks** automatically run these, but you can run manually:

```bash
pnpm run lint       # Check (don't fix)
pnpm run format:check  # Check formatting
```

### Testing

All new features should include tests:

```bash
# Run tests (when Jest/Vitest is set up)
pnpm run test
pnpm run test:coverage
```

## Development Setup

### 1. Install Dependencies

```bash
git clone https://github.com/chargebackpilot/chargebackpilot-live.git
cd chargebackpilot
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in required values:

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/chargeback
ADMIN_PASSWORD=your_secure_password_here_16_chars_minimum
GEMINI_API_KEY=your_key_here
```

### 3. Database Setup

```bash
# Run migrations
pnpm --filter @workspace/db run push

# Or reset database
pnpm --filter @workspace/db run push --force
```

### 4. Run Development Servers

In separate terminals:

```bash
# Terminal 1: API Server
pnpm --filter @workspace/api-server run dev
# Runs on http://localhost:3000

# Terminal 2: Frontend (optional)
pnpm --filter @workspace/chargeback-pilot run dev
# Runs on http://localhost:5173
```

## Git Workflow

### Branch Naming

```
feature/short-description          # New feature
fix/short-description              # Bug fix
docs/short-description             # Documentation
refactor/short-description         # Code refactoring
test/short-description             # Test additions
perf/short-description             # Performance improvements
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

More detailed explanation if needed.

Fixes #123
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, no logic changes
- `refactor` - Code reorganization
- `test` - Test additions/modifications
- `perf` - Performance improvements
- `chore` - Dependency updates, tooling

**Examples**:

```
feat(api): add correlation IDs to all requests
fix(auth): prevent timing attacks in password comparison
docs(architecture): explain session-based auth design
refactor(cache): implement LRU eviction policy
```

### Creating a Pull Request

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Push to GitHub**:
   ```bash
   git push origin feature/your-feature
   ```

4. **Create PR on GitHub**:
   - Link related issues: `Fixes #123`
   - Describe changes
   - List testing done
   - Request reviewers

### PR Checklist

Before submitting, ensure:

- [ ] `pnpm run lint:fix` passes
- [ ] `pnpm run format` applied
- [ ] `pnpm run typecheck` passes (no TS errors)
- [ ] `pnpm run build` succeeds
- [ ] Tests written for new features
- [ ] Commit messages follow Conventional Commits
- [ ] Documentation updated if needed
- [ ] No `.env` files committed
- [ ] No secrets in code/comments

## Code Review Process

1. **Automatic checks** run on every PR:
   - Linting
   - Type checking
   - Build verification
   - CI/CD pipeline

2. **Human review** by maintainers:
   - Code quality and patterns
   - Security considerations
   - Performance impact
   - Documentation completeness

3. **Approval and merge**:
   - Requires 1 approval from maintainer
   - All checks must pass
   - Feature branch auto-deleted

## API Development Guidelines

### Request/Response Format

All endpoints return JSON with standardized format:

```typescript
interface ApiErrorResponse {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

interface ApiSuccessResponse<T> {
  data: T;
  timestamp: string;
}
```

### Error Codes

Use semantic error codes:

```typescript
// ✅ Good
res.status(400).json({
  code: "INVALID_INPUT",
  message: "Validation failed",
  details: { issues: [...] },
  timestamp: new Date().toISOString(),
});

// ❌ Bad
res.status(400).json({ error: "Bad request" });
```

### Rate Limiting

Add rate limiting to endpoints handling user input:

```typescript
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // 10 requests
  message: { code: "RATE_LIMIT", message: "..." },
});

router.post("/cases", limiter, handler);
```

### Security

- **Validate all input** with zod schemas
- **Sanitize output** (escape HTML, remove secrets)
- **Use constants** for rate limit windows
- **Log security events** (failed auth, rate limit, etc.)
- **Never log passwords** or sensitive data

## Database Migrations

Using Drizzle ORM:

### Create Schema

Edit `/lib/db/src/schema/*.ts`:

```typescript
export const examplesTable = pgTable("examples", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Push to Database

```bash
pnpm --filter @workspace/db run push
```

### Generate Types

Types auto-generate from schema:

```typescript
export type Example = typeof examplesTable.$inferSelect;
export type InsertExample = typeof examplesTable.$inferInsert;
```

## Documentation

- Update `ARCHITECTURE.md` for major design changes
- Document all new environment variables in `.env.example`
- Add JSDoc comments to public functions:

```typescript
/**
 * Verify Turnstile token validity
 * @param token - The token from Cloudflare Turnstile
 * @returns True if token is valid and not expired
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  // ...
}
```

## Performance Considerations

- **Bundle size**: Monitor with `pnpm --filter @workspace/chargeback-pilot run build`
- **API response time**: Aim for <200ms median
- **Database queries**: Use indexes, avoid N+1 queries
- **Caching**: Use LRU cache for expensive computations

## Security Reporting

Found a security vulnerability? **Do not open a public issue**.

Instead, email: `security@chargebackpilot.de` with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

## Questions or Need Help?

- Check [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
- Review existing code for patterns
- Open a discussion issue on GitHub

---

Thank you for contributing! 🚀
