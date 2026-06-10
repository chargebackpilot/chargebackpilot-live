# Security Policy

## Reporting Security Vulnerabilities

**⚠️ DO NOT open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability, please email:

**security@chargebackpilot.de**

Include:
- Vulnerability description
- Steps to reproduce
- Potential impact
- Proof of concept (if applicable)
- Suggested fix (optional)

We will respond within 48 hours and work with you to fix the issue responsibly.

---

## Security Best Practices

### 1. Environment Variables

**Never commit secrets to Git**:

```bash
# ✅ DO
export ADMIN_PASSWORD=$(openssl rand -hex 24)
echo ADMIN_PASSWORD=$ADMIN_PASSWORD >> .env.local

# ❌ DON'T
git add .env          # .env is in .gitignore
echo "password=secret" > code.ts
```

Minimum requirements:
- `ADMIN_PASSWORD`: 16+ characters
- `DATABASE_URL`: Use SSL connection (`?sslmode=require`)
- `STRIPE_SECRET_KEY`: Never share or log
- `GEMINI_API_KEY`: Treat like a password

### 2. Authentication

**Session-based Admin Auth**:

```typescript
// ✅ Secure: Bearer token (revocable, no plaintext)
Authorization: Bearer <session-token>

// ❌ Insecure: Password in header
x-admin-password: <password>
```

**Token generation** (auto-generated, 32 bytes random):
```typescript
const token = randomBytes(32).toString("hex");
```

**Token validation**:
- Check expiration (24-hour TTL)
- Use timing-safe comparison: `timingSafeEqual()`
- Log failed attempts

### 3. Rate Limiting

All user-facing endpoints have rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/cases` | 10 | 1 hour/IP |
| `/api/admin/login` | 5 | 15 minutes/IP |
| Global API | 100 | 1 hour/IP |

Turnstile CAPTCHA required after 2 failed case submissions.

### 4. Input Validation

**Always validate with zod**:

```typescript
// ✅ Good
const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
  description: z.string().min(1).max(1000),
});
const data = schema.parse(req.body);

// ❌ Bad
const { email, amount, description } = req.body;
if (!email) return res.status(400).send("missing email");
```

### 5. Output Sanitization

**Escape HTML/special characters**:

```typescript
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
```

### 6. Logging

**Never log sensitive data**:

```typescript
// ✅ Good
logger.info({ ip: req.ip, endpoint: req.path }, "Case created");

// ❌ Bad
logger.info(req.body);  // Might contain passwords, PII
logger.error(error.message);  // Stack trace might expose paths
```

**Pino redaction** (auto-configured):
```typescript
redact: [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers['set-cookie']",
]
```

### 7. Database Security

**Query Protection**:
- Use prepared statements (Drizzle ORM handles this)
- Never string-concatenate SQL
- Validate all filters

```typescript
// ✅ Good (uses prepared statement)
db.select().from(casesTable).where(eq(casesTable.id, userId));

// ❌ Bad
db.select().from(casesTable).where(sql`WHERE id = ${userId}`);
```

**Connection Security**:
- Use SSL: `postgresql://...?sslmode=require`
- Rotate credentials every 90 days
- Use principle of least privilege (DB user rights)
- Regular backups with encryption

### 8. API Security

**CORS** (Whitelist known origins):
```typescript
cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://chargebackpilot.de", "https://www.chargebackpilot.de"]
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
});
```

**Headers** (Helmet.js):
```typescript
helmet({
  hsts: { maxAge: 31536000, preload: true },         // HTTPS enforcement
  contentSecurityPolicy: { /* limit resource loading */ },
  frameguard: { action: "deny" },                    // Prevent clickjacking
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
```

**Body limits**:
```typescript
express.json({ limit: "1mb" });        // Prevent memory exhaustion
```

### 9. Dependencies

**Supply Chain Security**:

```yaml
# pnpm-workspace.yaml
minimumReleaseAge: 1440  # 1 day - prevents malicious packages
minimumReleaseAgeExclude:
  - '@replit/*'          # Trust only established publishers
  - stripe-replit-sync
```

**Audit regularly**:
```bash
pnpm audit              # Check for vulnerabilities
pnpm update             # Keep dependencies current
```

### 10. Deployment Security

**Render Secrets**:
- Use Render's environment variables for secrets
- Never commit `.env` to Git
- Rotate credentials on security updates
- Use different passwords for dev/prod

**HTTPS Enforcement**:
- All traffic HTTPS only
- Redirect HTTP → HTTPS
- Enable HSTS preload list

---

## Incident Response

### If You Discover a Breach

1. **Notify immediately**: security@chargebackpilot.de
2. **Contain**: Revoke affected tokens/credentials
3. **Investigate**: Determine scope and impact
4. **Notify users**: If personal data exposed
5. **Fix**: Implement patch
6. **Monitor**: Watch for unusual activity

### Regular Security Audits

- [ ] Monthly: Review access logs
- [ ] Quarterly: Dependency security scan
- [ ] Annually: Full penetration test
- [ ] After deployments: Review changes

---

## GDPR & Privacy

### Data Minimization

Only collect what's necessary:
- ✅ Case details (necessary for analysis)
- ✅ Payment information (for Stripe)
- ❌ User's full address (collect only city/country)
- ❌ Unnecessary device IDs

### Right to Be Forgotten

Users can request deletion:

```typescript
// TODO: Implement DELETE /api/users/:id endpoint
// Should purge:
// - Cases
// - Payment records
// - Session tokens
// - Logs (PII-redacted only)
```

### Data Retention

- Cases: Delete after 24 months of inactivity
- Payment logs: Keep 7 years (accounting requirement)
- Session tokens: Delete after 90 days inactivity
- Error logs: Delete after 30 days

---

## Compliance Checklist

- [ ] HTTPS everywhere
- [ ] Input validation (zod)
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Security headers (Helmet)
- [ ] No hardcoded secrets
- [ ] Logging sensitive data reviewed
- [ ] Database backups automated
- [ ] Incident response plan documented
- [ ] Security policy communicated to team

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [zod Validation Documentation](https://zod.dev/)

---

Last updated: 2026-06-10  
Version: 1.0
