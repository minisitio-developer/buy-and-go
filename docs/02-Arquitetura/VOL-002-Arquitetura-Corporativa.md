# VOL-002 — Enterprise Architecture

**EventOS AI Enterprise**
**Codinome:** Atlas
**Versão:** 0.0.1
**Status:** Draft

---

## Architecture Principles

| Principle | Description |
|-----------|-------------|
| Loose Coupling | Services communicate via contracts, not direct dependencies |
| High Cohesion | Related behavior stays within the same bounded context |
| Stateless Services | All services are stateless; state lives in databases/caches |
| Eventual Consistency | Cross-service transactions use event-driven eventual consistency |
| Resiliency by Default | Services degrade gracefully; circuit breakers, retries, fallbacks |
| Observability | Every service exposes health, metrics, traces, and logs |

---

## C4 Model — Level 1: System Context

```
┌─────────────────────────────────────────────────────┐
│                    External Systems                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Stripe  │  │  AWS S3  │  │  OpenAI / Gemini  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Twilio  │  │  SendGrid│  │  Cloudflare CDN  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│               EventOS AI Platform                    │
│  ┌─────────────────────────────────────────────┐    │
│  │           API Gateway / Load Balancer        │    │
│  └─────────────────────────────────────────────┘    │
│                        │                             │
│  ┌─────────────────────────────────────────────┐    │
│  │         Platform Core Services              │    │
│  │  Identity │ IAM │ Billing │ Notification    │    │
│  └─────────────────────────────────────────────┘    │
│                        │                             │
│  ┌─────────────────────────────────────────────┐    │
│  │        Product Services (EventOS)           │    │
│  │  Events │ Tickets │ Access │ CRM │ AI       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                     Users                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │Organizers│  │Attendees │  │  Sponsors / Staff │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## C4 Model — Level 2: Container Diagram

```
User ──► Web App (NextJS) ──► API Gateway ──► Microservices
                │                              │
                ▼                              ▼
         Mobile App (Flutter)          Message Broker (Kafka)
                                             │
                                             ▼
                                       Databases (PG/Redis/ES/Mongo)
                                             │
                                             ▼
                                       Workers / AI Services
```

---

## Service Mesh Architecture

```
                    ┌──────────────────────┐
                    │   Ingress Gateway     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   API Gateway (Kong) │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Identity Svc    │  │   Event Svc      │  │   CRM Svc        │
│  Port: 3001      │  │   Port: 3002     │  │   Port: 3003     │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Message Broker     │
                    │   (Kafka + RabbitMQ) │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Payment Svc    │  │  Analytics Svc   │  │  AI Service      │
│   Port: 3004     │  │  Port: 3005      │  │  Port: 3006      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Microservices Catalog (v1)

| Service | Port | DB | Language | Description |
|---------|------|----|----------|-------------|
| identity-svc | 3001 | PostgreSQL | NestJS | User registration, auth, profiles |
| iam-svc | 3010 | PostgreSQL | NestJS | Permissions, roles, RBAC/ABAC |
| organization-svc | 3011 | PostgreSQL | NestJS | Companies, teams, hierarchy |
| event-svc | 3002 | PostgreSQL | NestJS | Events, agenda, local, map |
| ticket-svc | 3012 | PostgreSQL | NestJS | Tickets, lots, coupons |
| payment-svc | 3004 | PostgreSQL | NestJS | Payments, PIX, card, billing |
| crm-svc | 3003 | PostgreSQL | NestJS | Pipeline, leads, contacts |
| marketing-svc | 3020 | PostgreSQL | NestJS | Campaigns, email, WhatsApp |
| access-svc | 3021 | PostgreSQL + Redis | NestJS | QR, NFC, RFID, turnstiles |
| face-svc | 3022 | PostgreSQL + Vector | Python | Facial recognition |
| analytics-svc | 3005 | ClickHouse | Python | Dashboards, BI, metrics |
| ai-svc | 3006 | PostgreSQL + Vector | Python | AI agents, RAG, LLM |
| notification-svc | 3014 | Redis | NestJS | Push, email, SMS, WhatsApp |
| search-svc | 3015 | ElasticSearch | NestJS | Full-text search |
| storage-svc | 3016 | S3/R2 | NestJS | File upload, CDN |
| billing-svc | 3018 | PostgreSQL | NestJS | Invoicing, subscriptions |
| audit-svc | 3023 | PostgreSQL | NestJS | Audit logging |
| networking-svc | 3024 | Neo4j | NestJS | Matchmaking, contacts |

---

## Communication Patterns

### Synchronous (REST/gRPC)
- Query operations (read models)
- Command operations that require immediate response
- Service-to-service via internal cluster DNS

### Asynchronous (Events)
- All cross-service state changes
- Event sourcing via Kafka
- Command queues via RabbitMQ

```
Service A ──► Command (RabbitMQ) ──► Service B
Service A ──► Event (Kafka) ──► Service C, Service D, Service E
```

---

## Domain Events Catalog (Initial)

| Event | Producer | Consumers | Description |
|-------|----------|-----------|-------------|
| UserRegistered | Identity | IAM, CRM, Analytics, Notification | New user created |
| OrganizationCreated | Organization | IAM, Billing, Analytics | New tenant created |
| EventCreated | Event | CRM, Analytics, Search, AI, Notification | New event created |
| EventPublished | Event | Search, Analytics, Marketing | Event goes live |
| TicketPurchased | Ticket | Payment, Event, Analytics, Notification | Ticket sold |
| CheckInCompleted | Access | Event, Analytics, Networking | Attendee checked in |
| PaymentReceived | Payment | Billing, Analytics, Notification | Payment confirmed |
| FaceVerified | Face | Access, Analytics | Face match confirmed |
| ContactMatched | Networking | Notification, Analytics | Networking match found |
| CertificateIssued | Certification | Analytics, Notification | Certificate generated |

---

## Multi-Tenant Architecture

**Strategy:** Hybrid (Database per Tenant + Shared Infrastructure)

### Tenant Isolation Levels

| Tier | Isolation | Database | Cost |
|------|-----------|----------|------|
| Starter | Shared DB (tenant_id column) | PostgreSQL shared | Low |
| Professional | Schema per tenant | PostgreSQL schema | Medium |
| Enterprise | Database per tenant | Dedicated PG instance | High |

### Tenant Context Propagation

```
Request ──► API Gateway ──► Extract JWT ──► x-tenant-id header
                │
                ▼
         All services use tenant-id for:
         - Database queries (WHERE tenant_id = ?)
         - Cache keys (tenant:{id}:{key})
         - Event headers (x-tenant-id)
         - Metrics (tenant label)
```

---

## Observability Stack

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Prometheus     │◄───│   Service Mesh    │───►│   Grafana        │
│   (Metrics)      │    │   (Istio/Linkerd) │    │   (Dashboards)   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   OpenTelemetry  │───►│   Jaeger/Tempo   │───►│   Traces         │
│   (Tracing)      │    │   (Distributed)  │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Fluentd        │───►│   Loki/Elastic   │───►│   Kibana/Grafana │
│   (Logs)         │    │   (Log Storage)  │    │   (Log Explorer) │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Required Exports per Service

- **Health:** `GET /health` (liveness + readiness)
- **Metrics:** `GET /metrics` (Prometheus format)
- **Logs:** Structured JSON to stdout
- **Traces:** OpenTelemetry spans

---

## Kubernetes Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                  │
│                                                       │
│  ┌─────────────────┐  ┌─────────────────┐           │
│  │   namespace:     │  │   namespace:     │           │
│  │   platform-core  │  │   eventos-prod   │           │
│  │                  │  │                  │           │
│  │  identity-svc    │  │  event-svc       │           │
│  │  iam-svc         │  │  ticket-svc      │           │
│  │  notification-svc│  │  payment-svc     │           │
│  │  audit-svc       │  │  access-svc      │           │
│  └─────────────────┘  │  crm-svc          │           │
│                        │  marketing-svc    │           │
│  ┌─────────────────┐  │  face-svc         │           │
│  │   namespace:     │  │  analytics-svc   │           │
│  │   data-layer     │  │  ai-svc          │           │
│  │                  │  └─────────────────┘           │
│  │  postgresql      │                                │
│  │  redis           │  ┌─────────────────┐           │
│  │  elasticsearch   │  │   namespace:     │           │
│  │  kafka           │  │   platform-ops   │           │
│  │  clickhouse      │  │                  │           │
│  └─────────────────┘  │  prometheus       │           │
│                        │  grafana          │           │
│  ┌─────────────────┐  │  ingress-nginx    │           │
│  │   namespace:     │  │  cert-manager     │           │
│  │   ai-services    │  └─────────────────┘           │
│  │                  │                                │
│  │  llm-router      │  ┌─────────────────┐           │
│  │  rag-svc         │  │   namespace:     │           │
│  │  agent-orchestr  │  │   ci-cd          │           │
│  │  mcp-server      │  │                  │           │
│  └─────────────────┘  │  github-runner    │           │
│                        │  argocd           │           │
│                        └─────────────────┘           │
└──────────────────────────────────────────────────────┘
```

---

## Disaster Recovery

| Component | Strategy | RTO | RPO |
|-----------|----------|-----|-----|
| PostgreSQL | Multi-AZ + WAL streaming + hourly backup | 1h | 5min |
| Redis | Sentinel + AOF persistence | 5min | 1min |
| Kafka | Multi-broker + replication factor 3 | 5min | 0 |
| ElasticSearch | Cross-cluster replication | 15min | 5min |
| S3/R2 | Cross-region replication | 1h | 15min |
| Services | Kubernetes HPA + rolling update | 2min | 0 |

---

## Related Documents

- VOL-001: Strategy & Foundation
- VOL-004: Database Model
- VOL-005: APIs
- VOL-009: DevOps
- VOL-011: Security
