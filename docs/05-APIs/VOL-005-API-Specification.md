# VOL-005 — API Specification

**EventOS AI Enterprise**
**Versão:** 0.0.1
**Status:** Draft

---

## API Standards

### Base URL
```
Production:  https://api.eventos.ai/v1
Sandbox:     https://api.sandbox.eventos.ai/v1
Internal:    http://{service}.platform-core.svc.cluster.local
```

### Authentication
- **Method:** Bearer JWT
- **Header:** `Authorization: Bearer <token>`
- **Tenant:** `x-tenant-id: <organization_id>`

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer JWT token |
| `x-tenant-id` | Yes | Organization UUID |
| `x-request-id` | No | Idempotency / tracing |
| `x-idempotency-key` | For mutations | Idempotency key |
| `Accept-Language` | No | pt-BR, en, es |

### Response Format

```json
{
    "data": {},
    "meta": {
        "request_id": "uuid",
        "timestamp": "2026-07-16T14:00:00Z",
        "version": "v1"
    }
}
```

### Error Format

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Description",
        "details": [
            { "field": "email", "message": "Invalid email" }
        ]
    }
}
```

### Pagination

```json
{
    "data": [...],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 150,
        "total_pages": 8
    }
}
```

Query params: `?page=1&per_page=20&sort=created_at&order=desc`

### Rate Limiting
- **Public API:** 100 req/min
- **Authenticated:** 1000 req/min
- **Partner/Enterprise:** Custom

---

## API-000001 — Identity Service

### POST /auth/register
Register a new user.

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Str0ng!Pass",
    "phone": "+5511999999999",
    "document": "123.456.789-00"
}
```

**Response** `201`
```json
{
    "user": {
        "id": "uuid",
        "email": "john@example.com",
        "name": "John Doe"
    },
    "requires_email_verification": true
}
```

### POST /auth/login

```json
{
    "email": "john@example.com",
    "password": "Str0ng!Pass"
}
```

**Response** `200`
```json
{
    "access_token": "jwt...",
    "refresh_token": "jwt...",
    "expires_in": 3600,
    "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com" }
}
```

### POST /auth/refresh

```json
{
    "refresh_token": "jwt..."
}
```

### POST /auth/logout
**Headers:** `Authorization: Bearer <token>`

### POST /auth/forgot-password

```json
{
    "email": "john@example.com"
}
```

### POST /auth/reset-password

```json
{
    "token": "reset-token",
    "password": "NewStr0ng!Pass"
}
```

---

## API-000002 — Users

### GET /users/me
Get authenticated user profile.

### PATCH /users/me

```json
{
    "name": "John Updated",
    "phone": "+5511988888888",
    "locale": "en"
}
```

### GET /users/{id}
Get user by ID (requires admin).

### GET /users
List users (requires admin). Query: `?role=admin&status=active&page=1`

---

## API-000003 — Organizations (Tenant)

### POST /organizations

```json
{
    "name": "Minha Empresa",
    "slug": "minha-empresa",
    "document": "12.345.678/0001-90",
    "plan": "professional"
}
```

### GET /organizations/{id}

### PATCH /organizations/{id}

### GET /organizations/{id}/members

### POST /organizations/{id}/members

```json
{
    "user_id": "uuid",
    "role": "admin"
}
```

### DELETE /organizations/{id}/members/{member_id}

---

## API-000004 — Events

### POST /events

```json
{
    "name": "Feira Agropecuária 2026",
    "slug": "feira-agro-2026",
    "description": "Maior feira agropecuária do Brasil",
    "type": "presential",
    "category": "fair",
    "start_date": "2026-09-15T08:00:00Z",
    "end_date": "2026-09-18T20:00:00Z",
    "timezone": "America/Sao_Paulo",
    "capacity": 30000,
    "location_name": "Parque de Exposições",
    "address": "Rodovia BR-123, Km 10",
    "city": "Ribeirão Preto",
    "state": "SP",
    "country": "Brasil",
    "latitude": -21.1767,
    "longitude": -47.8209,
    "currency": "BRL",
    "language": "pt-BR",
    "banner_url": "https://cdn.eventos.ai/events/banner.jpg",
    "settings": {
        "has_networking": true,
        "has_certificates": true,
        "has_gamification": false
    }
}
```

**Response** `201`
```json
{
    "id": "uuid",
    "status": "draft",
    "slug": "feira-agro-2026",
    "created_at": "2026-07-16T14:00:00Z"
}
```

### GET /events/{id}

### PATCH /events/{id}

### DELETE /events/{id} (soft delete)

### GET /events
List events. Query params:
```
?status=published
&category=fair
&city=Ribeirão+Preto
&start_date_gte=2026-01-01
&page=1
&per_page=20
&sort=start_date
&order=asc
```

### POST /events/{id}/publish
Publish event (changes status to published).

### POST /events/{id}/cancel
Cancel event.

### POST /events/{id}/duplicate
Duplicate event with all configurations.

---

## API-000005 — Schedules

### POST /events/{id}/schedules

```json
{
    "name": "Palestra: Inovação no Agro",
    "speaker": "Dr. João Agricultor",
    "speaker_bio": "Especialista em agronegócio",
    "room": "Auditório Principal",
    "start_time": "2026-09-15T09:00:00Z",
    "end_time": "2026-09-15T10:30:00Z",
    "type": "lecture",
    "capacity": 500,
    "has_certificate": true
}
```

### GET /events/{id}/schedules
### PATCH /events/{id}/schedules/{schedule_id}
### DELETE /events/{id}/schedules/{schedule_id}

---

## API-000006 — Ticket Types

### POST /events/{id}/ticket-types

```json
{
    "name": "Passaporte Completo",
    "description": "Acesso a todos os dias",
    "price": 199.90,
    "quantity": 5000,
    "min_per_order": 1,
    "max_per_order": 10,
    "sale_start": "2026-01-01T00:00:00Z",
    "sale_end": "2026-09-10T23:59:59Z"
}
```

### GET /events/{id}/ticket-types
### PATCH /ticket-types/{id}
### DELETE /ticket-types/{id}

---

## API-000007 — Lots

### POST /ticket-types/{id}/lots

```json
{
    "name": "1º Lote",
    "price": 149.90,
    "quantity": 1000,
    "start_date": "2026-01-01T00:00:00Z",
    "end_date": "2026-02-28T23:59:59Z"
}
```

### GET /ticket-types/{id}/lots
### PATCH /lots/{id}
### DELETE /lots/{id}

---

## API-000008 — Orders

### POST /orders

```json
{
    "event_id": "uuid",
    "coupon_code": "AGRO10",
    "items": [
        {
            "ticket_type_id": "uuid",
            "quantity": 2
        }
    ],
    "attendees": [
        {
            "name": "Maria Silva",
            "email": "maria@email.com",
            "document": "987.654.321-00"
        },
        {
            "name": "João Silva",
            "email": "joao@email.com",
            "document": "123.456.789-00"
        }
    ]
}
```

**Response** `201`
```json
{
    "order_id": "uuid",
    "status": "pending",
    "total": 299.80,
    "discount": 29.98,
    "fee": 5.99,
    "net_total": 263.83,
    "payment_url": "https://pay.eventos.ai/order/uuid"
}
```

### GET /orders/{id}
### GET /orders
Query: `?event_id=uuid&status=confirmed&page=1`

### POST /orders/{id}/confirm
### POST /orders/{id}/cancel
### POST /orders/{id}/refund

---

## API-000009 — Attendees

### GET /events/{id}/attendees
Query: `?category=vip&name=John&company=ACME&page=1&per_page=50`

### GET /attendees/{id}
### PATCH /attendees/{id}

```json
{
    "company": "Nova Empresa",
    "position": "CEO",
    "category": "vip"
}
```

### POST /events/{id}/attendees/batch
Bulk import attendees.

```json
{
    "attendees": [
        {"name": "A", "email": "a@b.com", "category": "visitor"},
        {"name": "B", "email": "b@c.com", "category": "visitor"}
    ]
}
```

---

## API-000010 — Check-in

### POST /check-in

```json
{
    "qr_code": "abcd1234",
    "method": "qr",
    "device_id": "terminal-01",
    "location": {"lat": -23.55, "lng": -46.63}
}
```

**Response** `200`
```json
{
    "status": "approved",
    "attendee": {
        "name": "Maria Silva",
        "category": "visitor",
        "company": "ACME"
    },
    "checked_in_at": "2026-09-15T08:15:00Z"
}
```

**Response** `403` (access denied)
```json
{
    "status": "denied",
    "reason": "invalid_ticket"
}
```

### POST /check-in/face

```json
{
    "event_id": "uuid",
    "photo": "base64..."
}
```

### POST /check-in/manual

```json
{
    "event_id": "uuid",
    "document": "123.456.789-00",
    "checked_in_by": "uuid"
}
```

### GET /events/{id}/check-ins
Query: `?method=qr&date=2026-09-15&page=1`

### GET /events/{id}/check-ins/stats

```json
{
    "total_checked_in": 12500,
    "by_method": {"qr": 8000, "face": 3000, "manual": 1500},
    "by_hour": [{"hour": 8, "count": 500}, {"hour": 9, "count": 2000}]
}
```

---

## API-000011 — CRM

### GET /crm/pipelines
### POST /crm/pipelines

```json
{
    "name": "Vendas Eventos",
    "is_default": true
}
```

### GET /crm/pipelines/{id}/stages
### POST /crm/pipelines/{id}/stages

```json
{
    "name": "Prospecção",
    "position": 1,
    "probability": 10
}
```

### GET /crm/deals
Query: `?pipeline_id=uuid&stage_id=uuid&owner_id=uuid`
### POST /crm/deals

```json
{
    "title": "Evento Corporativo XYZ",
    "value": 50000.00,
    "pipeline_id": "uuid",
    "stage_id": "uuid",
    "contact_id": "uuid",
    "owner_id": "uuid",
    "expected_close": "2026-08-30"
}
```

### PATCH /crm/deals/{id}
Move deal to another stage.

```json
{
    "stage_id": "uuid",
    "value": 55000.00
}
```

### GET /crm/contacts
### POST /crm/contacts

```json
{
    "name": "Empresa XYZ",
    "email": "contato@xyz.com",
    "phone": "+5511999999999",
    "company": "XYZ Ltda",
    "position": "Diretor",
    "source": "evento"
}
```

---

## API-000012 — Check-in Devices (Sync)

### GET /sync/events/{id}
Returns all data needed for offline check-in devices.

```json
{
    "event": { "id": "uuid", "name": "Feira Agro" },
    "attendees": [
        {
            "id": "uuid",
            "name": "Maria Silva",
            "email": "maria@email.com",
            "document": "123.456.789-00",
            "qr_code": "abcd1234",
            "category": "visitor",
            "photo_url": "https://cdn..."
        }
    ],
    "sync_token": "abc123",
    "synced_at": "2026-09-14T23:00:00Z"
}
```

### POST /sync/check-ins
Bulk upload offline check-ins.

```json
{
    "sync_token": "abc123",
    "check_ins": [
        {
            "qr_code": "abcd1234",
            "method": "qr",
            "checked_in_at": "2026-09-15T08:00:00Z",
            "device_id": "terminal-01-offline"
        }
    ]
}
```

---

## API-000013 — AI Agents

### POST /ai/chat

```json
{
    "agent_type": "organizer",
    "event_id": "uuid",
    "message": "Quero criar uma feira agropecuária para 30 mil pessoas em Ribeirão Preto"
}
```

**Response** (streaming SSE)
```
event: delta
data: {"content": "Vou criar seu evento..."}

event: action
data: {"tool": "create_event", "result": {"id": "uuid", "status": "draft"}}

event: complete
data: {"summary": "Evento criado com sucesso!"}
```

### GET /ai/conversations
### GET /ai/conversations/{id}/messages

---

## API-000014 — Certificates

### GET /certificates/validate/{code}
Public verification endpoint.

### POST /events/{id}/certificates/generate
Generate certificates for all attendees.

### GET /events/{id}/certificates
### GET /attendees/{id}/certificate

---

## API-000015 — BI & Analytics

### GET /analytics/events/{id}/dashboard
Full event dashboard data.

### GET /analytics/events/{id}/heatmap
### GET /analytics/events/{id}/flow
### GET /analytics/events/{id}/roi

### POST /analytics/query
Natural language query.

```json
{
    "event_id": "uuid",
    "query": "Quantas pessoas vieram de Brasília?"
}
```

```json
{
    "answer": "1.247 pessoas",
    "sql": "SELECT COUNT(*) FROM attendees WHERE city = 'Brasília' AND event_id = 'uuid'",
    "data": [{"total": 1247}]
}
```

---

## Webhooks

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `order.confirmed` | Order paid | `{order_id, event_id, total}` |
| `checkin.completed` | Attendee checked in | `{attendee_id, event_id, method}` |
| `event.published` | Event published | `{event_id, slug, url}` |
| `ticket.sold_out` | Ticket sold out | `{ticket_type_id, event_id}` |
| `certificate.issued` | Certificate generated | `{certificate_id, attendee_id}` |

### Webhook Registration

**POST** `/webhooks`

```json
{
    "url": "https://minhaempresa.com/webhook/eventos",
    "events": ["order.confirmed", "checkin.completed"],
    "secret": "whsec_abc123"
}
```

---

## API Versioning

```
/v1/ -> current stable
/v2/ -> planned (breaking changes)
```

Headers also accept:
```
Accept: application/vnd.eventos.v1+json
```

---

## OpenAPI / SDK

All APIs are documented using OpenAPI 3.1 specification files stored at:

```
docs/05-APIs/openapi/
├── identity.yaml
├── events.yaml
├── tickets.yaml
├── checkin.yaml
├── crm.yaml
├── ai.yaml
├── analytics.yaml
└── webhooks.yaml
```

SDK packages will be generated from these specs:
- `@eventos/sdk-web` (TypeScript)
- `@eventos/sdk-mobile` (Flutter/Dart)
- `@eventos/sdk-python` (Python for AI services)
