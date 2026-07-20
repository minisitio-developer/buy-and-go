# VOL-011 — Security

**EventOS AI Enterprise**
**Versão:** 0.0.1
**Status:** Draft

---

## Security Principles

- **Security by Design:** Every feature is born secure, not patched later
- **Zero Trust:** Never trust, always verify. Every request authenticated and authorized
- **Defense in Depth:** Multiple layers of security controls
- **Least Privilege:** Every user/service gets minimum required access
- **Data Minimalization:** Only collect what is necessary
- **Privacy by Default:** Opt-in for all data processing

---

## IAM Architecture

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───►│  Auth    │───►│  Token   │
│          │    │  Service │    │  (JWT)   │
└──────────┘    └──────────┘    └────┬─────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                         ▼                         ▼
                  ┌──────────────┐        ┌──────────────┐
                  │  RBAC        │        │  ABAC        │
                  │  (Role)      │        │  (Attribute) │
                  └──────┬───────┘        └──────┬───────┘
                         │                       │
                         └───────────┬───────────┘
                                     ▼
                          ┌──────────────────┐
                          │  Permission      │
                          │  Check           │
                          └──────────────────┘
```

---

## IAM-001 — Authentication

### Methods

| Method | Tier | Description |
|--------|------|-------------|
| Email + Password | All | Standard login |
| Social Login | All | Google, Microsoft, LinkedIn |
| Magic Link | All | Passwordless email login |
| SSO (SAML/OIDC) | Enterprise | Connect to IdP (Azure AD, Okta) |
| MFA (TOTP) | Professional+ | Authenticator app |
| MFA (SMS) | All | SMS code |
| Biometric | Mobile | Fingerprint, Face ID |

### JWT Token Structure

```json
{
    "sub": "user_uuid",
    "tenant": "organization_uuid",
    "role": "admin",
    "permissions": ["event:create", "event:publish", "attendee:read"],
    "iat": 1700000000,
    "exp": 1700003600,
    "jti": "unique_token_id"
}
```

### Token Lifecycle

| Token | Expiry | Storage | Refresh |
|-------|--------|---------|---------|
| Access Token | 1 hour | Memory / Secure Cookie | Via refresh token |
| Refresh Token | 7 days | HTTP-only Secure Cookie | Rotates on use |
| API Key | Custom | Customer-side secret | Manual rotation |

---

## IAM-002 — Roles (RBAC)

### Platform Roles

| Role | Scope | Description |
|------|-------|-------------|
| `super_admin` | Global | Platform administration |
| `org_owner` | Organization | Full org access |
| `org_admin` | Organization | Admin access (except billing) |
| `org_manager` | Organization | Manage events, staff |
| `org_staff` | Organization | Operate events, check-in |
| `event_operator` | Event | Check-in, basic ops |
| `sponsor` | Self | Sponsor analytics |
| `attendee` | Self | Own tickets, profile |

### Role Hierarchy

```
super_admin
    └── org_owner
            └── org_admin
                    └── org_manager
                            └── org_staff
                                    └── event_operator
```

---

## IAM-003 — Permissions (ABAC)

### Permission Format

```
{resource}:{action}:{scope}

Resources: event, ticket, attendee, sponsor, crm_deal, certificate, dashboard
Actions:   create, read, update, delete, publish, checkin, export
Scope:     all, own, department, event
```

### Permission Examples

| Permission | Description |
|------------|-------------|
| `event:create` | Create events |
| `event:publish` | Publish events |
| `attendee:read:all` | Read all attendees |
| `attendee:checkin` | Perform check-in |
| `crm_deal:update:own` | Update own deals |
| `sponsor:read:dashboard` | View sponsor dashboard |

### Attribute-Based Conditions

```json
{
    "effect": "allow",
    "action": "attendee:read",
    "condition": {
        "tenant_id": "${request.tenant}",
        "event_id": "${user.events}"
    }
}
```

---

## SEC-001 — Data Encryption

### At Rest

| Layer | Algorithm | Key Management |
|-------|-----------|----------------|
| Database (PostgreSQL) | AES-256 (TDE) | AWS KMS / HashiCorp Vault |
| Sensitive columns | pgcrypto + AES-256 | Application-level key |
| File storage (S3/R2) | AES-256 (SSE-S3) | AWS KMS |
| Backups | AES-256 | Separate backup key |
| Cache (Redis) | Encryption in transit only | TLS |

### In Transit

| Connection | Protocol | Cipher |
|------------|----------|--------|
| API (external) | TLS 1.3 | TLS_AES_256_GCM |
| API (internal) | mTLS | TLS_AES_128_GCM |
| Database | TLS 1.3 | TLS_AES_256_GCM |
| Messaging (Kafka) | TLS + SASL | TLS_AES_256_GCM |
| Redis | TLS 1.2+ | TLS_AES_256_GCM |

---

## SEC-002 — Network Security

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: identity-svc-policy
  namespace: platform-core
spec:
  podSelector:
    matchLabels:
      app: identity-svc
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: platform-core
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 3001
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: data-layer
      ports:
        - protocol: TCP
          port: 5432
        - protocol: TCP
          port: 6379
```

### WAF Rules

```yaml
# CloudFront WAF
ManagedRules:
  - AWSManagedRulesCommonRuleSet
  - AWSManagedRulesSQLiRuleSet
  - AWSManagedRulesKnownBadInputsRuleSet

CustomRules:
  - RateLimit:
      limit: 1000
      period: 60
      action: block
  - JWTValidation:
      action: block
```

---

## SEC-003 — OWASP Top 10 Mitigation

| OWASP | Risk | Mitigation |
|-------|------|------------|
| A01 Broken Access Control | Unauthorized data access | RBAC + ABAC + tenant validation middleware |
| A02 Cryptographic Failures | Data leak | All data encrypted at rest and in transit |
| A03 Injection (SQL, NoSQL) | Data breach | Parameterized queries, ORM, input sanitization |
| A04 Insecure Design | Architectural flaws | Threat modeling, security reviews in ADR |
| A05 Security Misconfiguration | Exposed services | IaC, automated security scanning (Kube-bench) |
| A06 Vulnerable Components | Known CVEs | Dependabot, Snyk, regular updates |
| A07 Auth Failures | Account takeover | MFA, rate limiting, brute force protection |
| A08 Data Integrity Failures | Tampered data | Digital signatures, audit logs, blockchain certs |
| A09 Logging/Monitoring | Undetected breaches | Structured logging, SIEM, alerts |
| A10 SSRF | Internal network access | Network policies, allowlist egress |

---

## SEC-004 — LGPD Compliance

### Data Classification

| Category | Examples | Protection |
|----------|----------|------------|
| Public | Event name, date | No restriction |
| Internal | Attendee count, revenue | RBAC restricted |
| Confidential | Attendee name, email, phone | Encrypted, access logged |
| Sensitive | Biometric data, document numbers | Encrypted + consent required |
| Restricted | Payment info, passwords | PCI compliant, hashed |

### Consent Management

```json
{
    "user_id": "uuid",
    "consents": [
        {
            "type": "marketing_email",
            "granted": true,
            "granted_at": "2026-07-16T14:00:00Z",
            "ip": "192.168.1.1"
        },
        {
            "type": "biometric_data",
            "granted": false,
            "granted_at": null
        }
    ]
}
```

### Data Subject Rights

| Right | Implementation | SLA |
|-------|---------------|-----|
| Access | User portal shows all personal data | 24h |
| Rectification | Profile edit | Instant |
| Deletion | Account deletion (GDPR right to be forgotten) | 30 days |
| Portability | Data export (JSON/CSV) | 72h |
| Withdraw consent | Consent toggle in settings | Instant |
| Object to processing | Opt-out of marketing | Instant |

---

## SEC-005 — Security Headers

```typescript
// Helmet configuration (NestJS)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "cdn.eventos.ai"],
            styleSrc: ["'self'", "fonts.googleapis.com"],
            imgSrc: ["'self'", "cdn.eventos.ai", "data:"],
            connectSrc: ["'self'", "api.eventos.ai", "wss://api.eventos.ai"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            frameSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
```

### Required Headers

| Header | Value |
|--------|-------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Content-Security-Policy | See above |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(self), microphone=() |

---

## SEC-006 — Secrets Management

```yaml
# External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
```

### Secret Rotation

| Secret | Rotation | Method |
|--------|----------|--------|
| Database password | 90 days | AWS RDS rotation |
| JWT secret | 30 days | Zero-downtime rotation |
| API keys | Per request | HashiCorp Vault |
| TLS certificates | 90 days | cert-manager (Let's Encrypt) |

---

## SEC-007 — Audit & Compliance

### ISO 27001 Controls

| Control | Implementation |
|---------|---------------|
| A.9 Access Control | RBAC + ABAC + MFA |
| A.10 Cryptography | AES-256 + TLS 1.3 |
| A.12 Operations Security | Immutable infra, CI/CD |
| A.13 Communications Security | mTLS, network policies |
| A.16 Incident Management | PagerDuty + runbooks |
| A.18 Compliance | LGPD, SOC2 preparation |

### SOC 2 Controls

| Criteria | Evidence |
|----------|----------|
| Security | Audit logs, IAM, encryption |
| Availability | Uptime monitoring, HA, DR |
| Confidentiality | Tenant isolation, data encryption |
| Privacy | LGPD compliance, consent management |

---

## Related Documents

- VOL-001: Strategy (Security by Design principle)
- VOL-002: Architecture (Network, IAM service)
- VOL-004: Database (Audit logs, LGPD consents)
- VOL-005: APIs (Auth headers, rate limiting)
- VOL-008: DevOps (Secrets management)
