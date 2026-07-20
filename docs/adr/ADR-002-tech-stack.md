# ADR-002: Technology Stack

**Status:** Accepted
**Date:** 2026-07-16
**Author:** Equipe EventOS AI

## Context

We need to define the primary technology stack for EventOS AI Enterprise.

## Decision

### Frontend
- **Framework:** React + NextJS
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **PWA:** Service Workers + Workbox
- **Mobile:** Flutter (iOS/Android)

### Backend
- **API Layer:** NestJS (Node.js)
- **Microservices:** Node.js + TypeScript
- **AI Services:** Python (FastAPI)
- **Architecture:** DDD + CQRS + Event Sourcing + Hexagonal + Clean Architecture

### Databases
- **Primary:** PostgreSQL (relational data)
- **Cache:** Redis
- **Search:** ElasticSearch
- **Document:** MongoDB
- **Analytics:** ClickHouse
- **Graph:** Neo4j (networking, relationships)
- **Storage:** S3 / Cloudflare R2
- **Vector:** Vector Database (pgvector / Qdrant)

### Messaging
- **Event Bus:** Kafka (event sourcing)
- **Queue:** RabbitMQ (commands)

### Infrastructure
- **Containers:** Docker
- **Orchestration:** Kubernetes
- **IaC:** Terraform
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana + OpenTelemetry
- **Logging:** Elastic + Loki

## Consequences

- Polyglot persistence increases operational complexity
- Python services needed for AI/ML workloads
- Node.js services for high-throughput API traffic
- Requires mature DevOps practices

## Related

- DEC-000003: Interface Contracts
- DEC-000001: Modular Architecture
