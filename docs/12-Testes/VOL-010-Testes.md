# VOL-010 — Testing Strategy

**EventOS AI Enterprise**
**Versão:** 0.0.1
**Status:** Draft

---

## Testing Principles

- **Coverage target:** ≥ 90% for core domain, ≥ 80% overall
- **Test types:** Unit, Integration, E2E, Contract, Performance, Security
- **BDD:** All critical flows documented as scenarios
- **CI gate:** Tests must pass before merge
- **Flakiness:** Flaky tests = blocked pipeline

---

## Test Pyramid

```
         ╱╲
        ╱ E2E ╲          (5% — critical user journeys)
       ╱────────╲
      ╱ Contract  ╲      (10% — API contract tests)
     ╱──────────────╲
    ╱  Integration    ╲   (25% — service + DB integration)
   ╱────────────────────╲
  ╱      Unit Tests       ╲ (60% — domain logic, validation)
 ╱──────────────────────────╲
```

---

## TEST-000001 to TEST-000010 — Unit Tests

### Naming Convention

```
{entity}.{action}.{scenario}.spec.ts
users.register.valid.spec.ts
events.create.invalid_dates.spec.ts
```

### Framework

```
Runner:   Jest / Vitest
Coverage: c8 / istanbul
Assert:   jest-native + chai
Mock:     sinon / testcontainers (for DB)
```

### Required Coverage per Module

| Layer | Coverage Target |
|-------|-----------------|
| Domain / Entities | 100% |
| Use Cases | 90% |
| Controllers | 80% |
| Gateways | 70% |

### Unit Test Example

```typescript
// identity/domain/user.spec.ts
describe('User Entity', () => {
    it('should create valid user', () => {
        const user = User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'Str0ng!Pass1'
        });
        expect(user.isSuccess).toBe(true);
        expect(user.getValue().email).toBe('john@example.com');
    });

    it('should reject invalid email', () => {
        const user = User.create({
            name: 'John Doe',
            email: 'invalid-email',
            password: 'Str0ng!Pass1'
        });
        expect(user.isFailure).toBe(true);
    });

    it('should hash password on creation', () => {
        const user = User.create({ ...validProps });
        expect(user.getValue().password).not.toBe('Str0ng!Pass1');
        expect(user.getValue().password).toMatch(/^\$2[ab]\$.{56}$/);
    });
});
```

---

## TEST-000011 to TEST-000030 — Integration Tests

### Example: Identity Service

```typescript
// identity/integration/register.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('POST /v1/auth/register (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();
        app = module.createNestApplication();
        await app.init();
    });

    it('should register user and return 201', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/auth/register')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Str0ng!Pass1'
            });
        expect(res.status).toBe(201);
        expect(res.body.data.user.email).toBe('john@example.com');
    });

    it('should reject duplicate email with 409', async () => {
        await request(app.getHttpServer())
            .post('/v1/auth/register')
            .send({ name: 'Jane', email: 'john@example.com', password: 'Str0ng!Pass1' })
            .expect(409);
    });

    afterAll(async () => {
        await app.close();
    });
});
```

### Database Integration

```typescript
// events/integration/create-event.db.spec.ts
import { TestDB } from '@eventos/testing';
import { EventRepository } from '../infra/event.repository';

describe('Event Repository', () => {
    let db: TestDB;
    let repo: EventRepository;

    beforeAll(async () => {
        db = await TestDB.create('postgresql://...');
        repo = new EventRepository(db.getConnection());
    });

    it('should persist and retrieve event', async () => {
        const event = Event.create({ name: 'Test Event', ... });
        await repo.save(event);
        const found = await repo.findById(event.id);
        expect(found?.name).toBe('Test Event');
    });

    afterAll(async () => {
        await db.cleanup();
    });
});
```

---

## TEST-000031 to TEST-000040 — E2E Tests

### Framework: Playwright / Cypress

```typescript
// e2e/checkin.flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete event check-in flow', async ({ page }) => {
    // Login as operator
    await page.goto('/login');
    await page.fill('[name=email]', 'operator@eventos.ai');
    await page.fill('[name=password]', 'test123');
    await page.click('button:has-text("Entrar")');

    // Open check-in app
    await page.goto('/events/feira-agro-2026/checkin');
    await expect(page.locator('text=Credenciamento')).toBeVisible();

    // Scan QR code
    await page.fill('[data-testid=qr-input]', 'qr-abc-123');
    await page.click('[data-testid=checkin-btn]');

    // Verify success
    await expect(page.locator('[data-testid=checkin-success]')).toBeVisible();
    await expect(page.locator('[data-testid=attendee-name]')).toContainText('Maria Silva');
});
```

### E2E Flow Coverage

| Flow | Priority | Description |
|------|----------|-------------|
| User registration + login | Critical | Registers, verifies email, logs in |
| Create + publish event | Critical | Full wizard, tickets, schedule, publish |
| Buy ticket + check-in | Critical | Purchase > receive QR > scan at event |
| Offline check-in sync | High | Check-in offline > sync > verify |
| AI create event | High | "Create congress for 8k people" > verify |
| CRM pipeline | Medium | Create deal > move stages > close |
| Sponsor dashboard | Medium | Sponsor logs in > sees analytics |

---

## TEST-000041 to TEST-000045 — Contract Tests

### Pact (Consumer-Driven Contracts)

```typescript
// identity/pact/identity-consumer.spec.ts
import { Pact } from '@pact-foundation/pact';

describe('Identity Service Contract', () => {
    const provider = new Pact({
        consumer: 'EventService',
        provider: 'IdentityService',
        port: 4000
    });

    it('should validate auth contract', async () => {
        await provider.addInteraction({
            state: 'user exists',
            uponReceiving: 'a request for user info',
            withRequest: {
                method: 'GET',
                path: '/v1/users/me',
                headers: { Authorization: 'Bearer token' }
            },
            willRespondWith: {
                status: 200,
                body: {
                    data: {
                        id: 'uuid',
                        email: 'john@example.com',
                        name: 'John Doe'
                    }
                }
            }
        });

        const response = await fetch('http://localhost:4000/v1/users/me', {
            headers: { Authorization: 'Bearer token' }
        });
        expect(response.status).toBe(200);
    });
});
```

---

## TEST-000046 to TEST-000050 — Performance Tests

### Framework: k6

```javascript
// k6/checkin-stress.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 0 }
    ],
    thresholds: {
        http_req_duration: ['p(95) < 500'],
        http_req_failed: ['rate < 0.01']
    }
};

export default function () {
    const res = http.post('https://api.eventos.ai/v1/check-in', {
        qr_code: `qr-${Math.random()}`,
        method: 'qr'
    }, {
        headers: {
            'Authorization': `Bearer ${__ENV.TOKEN}`,
            'x-tenant-id': __ENV.TENANT
        }
    });
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response < 500ms': (r) => r.timings.duration < 500
    });
    sleep(1);
}
```

### Performance Targets

| Endpoint | Target | Peak Load |
|----------|--------|-----------|
| Check-in POST | 500ms p95 | 1000 req/s |
| Dashboard GET | 1s p95 | 100 req/s |
| Event search | 300ms p95 | 200 req/s |
| AI chat | 3s streaming | 50 concurrent |
| Auth | 200ms p95 | 500 req/s |

---

## TEST-000051 to TEST-000053 — Security Tests

### OWASP ZAP / Burp Suite

```bash
# ZAP automated scan
zap-cli quick-scan --self-contained \
    --start-options '-config api.disablekey=true' \
    https://api.sandbox.eventos.ai/v1
```

### Scenarios

| Test | Target | Expected |
|------|--------|----------|
| SQL Injection | Login, search | Blocked (400) |
| XSS | Event name, bio | Sanitized |
| JWT tampering | All endpoints | 401 |
| Rate limiting | Auth endpoints | 429 after N attempts |
| Tenant isolation | Cross-tenant access | 403 |

---

## TEST-000054 — BDD Scenarios

```gherkin
# features/checkin.feature
Feature: Event Check-in

    Scenario: Valid QR code check-in
        Given the event "Feira Agro" is published
        And attendee "Maria Silva" has a valid ticket
        When the operator scans the QR code
        Then the check-in is approved
        And the attendee count increases by 1

    Scenario: Duplicate check-in
        Given attendee "João Pedro" is already checked in
        When the operator scans his QR code again
        Then the check-in is rejected
        And the error "already checked in" is shown

    Scenario: Offline check-in sync
        Given the device is offline
        And attendee "Ana Costa" scans the QR code
        Then the check-in is stored locally
        When the device goes online
        Then the check-in is synced to the server
```

---

## Continuous Testing

```yaml
# CI pipeline test stages
jobs:
  unit:
    - npm run test:unit

  integration:
    - docker compose up -d postgres redis
    - npm run test:integration

  contract:
    - npm run test:pact

  e2e:
    - docker compose up -d
    - npx playwright test

  performance:
    - k6 run k6/checkin-stress.js

  security:
    - npm run test:owasp

  coverage:
    - npm run test:coverage
    - npx istanbul check-coverage --branches 80 --functions 80
```

---

## Related Documents

- VOL-006: Requirements (REQ-IDs with test mappings)
- VOL-008: DevOps (CI pipeline)
- VOL-011: Security (Security tests)
