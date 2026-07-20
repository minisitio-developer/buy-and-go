# VOL-013 — Prompt Book

**Plataforma:** EventOS AI Enterprise
**Versão:** 1.0
**Data:** 2026-07-16
**Status:** Draft

---

## Sumário

1. [Introdução](#1-introdução)
2. [Prompts para Antigravity / Lovable / Bolt](#2-prompts-para-antigravity--lovable--bolt)
   - Prompt 01 — Identity Microsserviço
   - Prompt 02 — Event Microsserviço
   - Prompt 03 — Ticket Microsserviço
   - Prompt 04 — Check-in Microsserviço
   - Prompt 05 — CRM Microsserviço
   - Prompt 06 — Frontend Next.js
3. [Prompts para Cursor / Windsurf](#3-prompts-para-cursor--windsurf)
   - Prompt 07 — Docker Compose
   - Prompt 08 — Kubernetes
   - Prompt 09 — Terraform
   - Prompt 10 — CI/CD GitHub Actions
4. [Prompts para Claude Code / OpenCode](#4-prompts-para-claude-code--opencode)
   - Prompt 11 — Agentes de IA
   - Prompt 12 — MCP Server
   - Prompt 13 — RAG Pipeline
   - Prompt 14 — AI Gateway
   - Prompt 15 — Observabilidade
5. [Prompts para MCP Server](#5-prompts-para-mcp-server)
   - MCP Tool: create_event
   - MCP Tool: issue_certificate
   - MCP Tool: create_credentials
   - MCP Tool: get_dashboard
   - MCP Tool: register_sponsor
   - MCP Tool: generate_report
   - MCP Tool: send_whatsapp
   - MCP Tool: create_campaign
   - MCP Tool: analyze_roi
   - MCP Tool: query_bi
   - MCP Tool: create_qr
   - MCP Tool: create_app
   - MCP Tool: create_schedule
   - MCP Tool: create_survey
   - MCP Tool: create_badge
   - MCP Tool: issue_invoice
   - MCP Tool: receive_pix
   - MCP Tool: reserve_room
   - MCP Tool: get_networking_match
   - MCP Tool: create_landing_page
6. [Prompts para Agentes de IA](#6-prompts-para-agentes-de-ia)
   - Organizer AI — System Prompt
   - Marketing AI — System Prompt
   - Analytics AI — System Prompt
   - CRM AI — System Prompt
   - Support AI — System Prompt
   - Sponsor AI — System Prompt
   - Security AI — System Prompt
   - Compliance AI — System Prompt
   - Networking AI — System Prompt

---

## 1. Introdução

Este documento contém prompts prontos para construir o EventOS AI utilizando ferramentas de desenvolvimento assistido por IA como Antigravity, Cursor, Claude Code, OpenCode, Lovable, Replit Agent e Windsurf.

Cada prompt foi projetado para ser copiado e colado diretamente na ferramenta de IA, gerando código consistente com a arquitetura definida nos volumes anteriores (VOL-001 a VOL-012).

### Convenções

- `{...}` indica parâmetros que devem ser substituídos
- Prompts em português para agentes de IA
- Prompts em inglês para ferramentas MCP e schemas
- Todos os prompts pressupõem acesso aos documentos de referência do projeto

### Documentos de Referência

| Documento | Descrição |
|-----------|-----------|
| VOL-001 | Estratégia e Fundação |
| VOL-002 | Arquitetura Corporativa |
| VOL-003 | Design System e UX |
| VOL-004 | Modelo de Dados |
| VOL-005 | API Specification |
| VOL-006 | Requisitos Funcionais |
| VOL-007 | Agentes de IA |
| VOL-008 | DevOps e Infraestrutura |
| VOL-009 | BI e Dashboards |
| VOL-010 | Testes |
| VOL-011 | Segurança |
| VOL-012 | Governança |

---

## 2. Prompts para Antigravity / Lovable / Bolt

### Prompt 01 — Identity Microsserviço

```
Use o documento VOL-004 (Modelo de Dados) e VOL-005 (API Specification) para criar um microsserviço NestJS completo de Identity e Autenticação.

O serviço deve:
- Usar PostgreSQL com Prisma ORM
- Implementar registro, login com JWT (access token 1h, refresh 7d)
- Ter modelo de dados: users, organizations, organization_members
- Implementar hash de senha com bcrypt (cost 12)
- Ter validação com class-validator
- Ter testes unitários para domain entities
- Ter cobertura mínima de 90%
- Usar Clean Architecture: domain → infra → modules

Endpoints obrigatórios:
- POST /auth/register — Registro de usuário
- POST /auth/login — Login com email/senha
- POST /auth/refresh — Refresh token
- POST /auth/logout — Logout (invalida refresh)
- POST /auth/forgot-password — Solicitar reset de senha
- POST /auth/reset-password — Resetar senha com token
- GET /users/me — Perfil do usuário logado
- PATCH /users/me — Atualizar perfil
- POST /organizations — Criar organização (tenant)
- GET /organizations — Listar organizações do usuário
- POST /organizations/:id/members — Convidar membro
- GET /organizations/:id/members — Listar membros
- DELETE /organizations/:id/members/:userId — Remover membro

Estrutura de pastas:
```
src/
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── organization.entity.ts
│   │   └── organization-member.entity.ts
│   ├── ports/
│   │   ├── user-repository.interface.ts
│   │   └── auth-service.interface.ts
│   └── services/
│       ├── auth.service.ts
│       └── user.service.ts
├── infra/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── repositories/
│   │       ├── user-repository.impl.ts
│   │       └── organization-repository.impl.ts
│   ├── auth/
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── config/
│       ├── app.config.ts
│       └── database.config.ts
└── modules/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   └── dto/
    │       ├── register.dto.ts
    │       ├── login.dto.ts
    │       └── refresh.dto.ts
    └── users/
        ├── users.controller.ts
        ├── users.module.ts
        └── dto/
            └── update-user.dto.ts
```

Use docker-compose local com postgres:16.
Gere também o arquivo .env.example e o Dockerfile multi-stage.
```

### Prompt 02 — Event Microsserviço

```
Crie um microsserviço NestJS para gerenciamento de eventos baseado no VOL-004 e VOL-005.

Modelos de dados:
- events (id, name, slug, description, type, start_date, end_date, location, capacity, status, banner_url, organizer_id, created_at, updated_at)
- event_schedules (id, event_id, title, description, speaker, start_time, end_time, room, track)
- event_speakers (id, event_id, name, bio, photo_url, specialty, company)
- event_sponsors (id, event_id, name, tier, logo_url, website, description)
- event_rooms (id, event_id, name, capacity, location, amenities)
- event_tracks (id, event_id, name, description, color)

Endpoints:
- CRUD completo de eventos
- GET /events/:id/schedules — Grade de programação
- POST /events/:id/schedules — Adicionar item na grade
- GET /events/:id/speakers — Palestrantes
- POST /events/:id/speakers — Adicionar palestrante
- GET /events/:id/sponsors — Patrocinadores
- POST /events/:id/sponsors — Adicionar patrocinador
- POST /events/:id/publish — Publicar evento
- POST /events/:id/cancel — Cancelar evento
- GET /events/search?q=&type=&date=&city= — Busca textual

Regras de negócio:
- Um evento só pode ser publicado se tiver ao menos 1 schedule e 1 ticket type
- Datas devem ser validadas (end > start)
- Capacidade mínima de 10 pessoas
- Slug gerado automaticamente a partir do nome
- Soft delete para todos os recursos

Tecnologias:
- NestJS + Prisma + PostgreSQL
- class-validator para DTOs
- Swagger/OpenAPI documentação
- Testes com Jest (unitários + integração)
- Cache com Redis para GET /events e GET /events/:id
```

### Prompt 03 — Ticket Microsserviço

```
Crie um microsserviço NestJS para gestão de ingressos e lotes.

Modelos de dados:
- ticket_types (id, event_id, name, description, price, quantity, max_per_user, sale_start, sale_end, status)
- lots (id, ticket_type_id, name, price_modifier, start_date, end_date, max_quantity, sold_quantity)
- coupons (id, code, discount_type, discount_value, max_uses, used_count, valid_from, valid_until, event_id)
- orders (id, event_id, user_id, status, total, payment_method, payment_status, paid_at, created_at)
- order_items (id, order_id, ticket_type_id, lot_id, quantity, unit_price, total_price)
- tickets (id, order_id, ticket_type_id, code, status, holder_name, holder_document, holder_email, checked_in_at)

Endpoints:
- POST /events/:id/ticket-types — Criar tipo de ingresso
- GET /events/:id/ticket-types — Listar tipos de ingresso
- PATCH /ticket-types/:id — Atualizar tipo de ingresso
- POST /ticket-types/:id/lots — Criar lote
- GET /ticket-types/:id/lots — Listar lotes
- POST /events/:id/coupons — Criar cupom
- GET /events/:id/coupons — Listar cupons
- POST /orders — Criar pedido
- GET /orders/:id — Detalhe do pedido
- GET /orders/my — Meus pedidos
- POST /orders/:id/pay — Simular pagamento
- GET /tickets/my — Meus ingressos
- POST /tickets/:id/transfer — Transferir ingresso

Regras:
- Validar disponibilidade ao criar pedido
- Calcular preço com base no lote ativo
- Cupons podem ser percentuais ou valor fixo
- Ingresso contém QR code único
- Transferência só permitida até 24h antes do evento
- Order status: pending, confirmed, cancelled, refunded

Use Kafka para emitir eventos de domínio:
- TicketPurchased → Event Svc, Analytics, Notification
- OrderConfirmed → Event Svc, Analytics, Notification
- TicketTransferred → Event Svc, Analytics
```

### Prompt 04 — Check-in Microsserviço

```
Crie um microsserviço NestJS para credenciamento e controle de acesso.

Modelos de dados:
- check_in_devices (id, event_id, name, type, location, status, last_ping)
- check_in_records (id, ticket_id, device_id, operator_id, type, timestamp, latitude, longitude, photo_url)
- credentials (id, event_id, ticket_id, type, qr_code, nfc_code, rfid_code, issued_at, printed_at)
- access_logs (id, credential_id, gate_id, direction, timestamp, status, reason)
- certificates (id, event_id, ticket_id, user_id, type, issued_at, hours, url, verified)

Endpoints:
- POST /events/:id/checkin — Realizar check-in por QR code
- POST /events/:id/checkin/document — Check-in por documento (CPF)
- POST /events/:id/checkin/manual — Check-in manual (operador)
- GET /events/:id/checkins — Histórico de check-ins
- GET /events/:id/stats — Estatísticas de credenciamento
- POST /events/:id/credentials/issue — Emitir credencial
- GET /events/:id/credentials — Listar credenciais
- POST /events/:id/certificates/issue — Emitir certificado
- GET /events/:id/certificates — Listar certificados
- GET /attendees/:id/certificate — Download do certificado

Regras:
- QR code único por ingresso (UUID v4)
- Check-in duplicado bloqueado
- Check-in offline com sincronização posterior
- Credencial pode ser QR, NFC ou RFID
- Certificado emitido automaticamente após check-in
- Foto opcional no check-in (face matching)
- Suporte a múltiplos dias (day-pass)

Hardware suportado:
- Leitor QR (câmera ou scanner)
- Totem de autoatendimento
- Catraca com leitor NFC/RFID
- Pulseira RFID
- App mobile para credenciamento

Publique eventos Kafka:
- CheckInCompleted → Event Svc, Analytics, Networking
- CertificateIssued → Analytics, Notification
```

### Prompt 05 — CRM Microsserviço

```
Crie um microsserviço NestJS para gestão de pipeline de vendas e relacionamento.

Modelos de dados:
- contacts (id, organization_id, name, email, phone, document, company, position, source, tags, custom_fields)
- deals (id, organization_id, contact_id, title, value, stage, probability, expected_close_date, owner_id, notes)
- deal_stages (id, organization_id, name, order, color, probability_default)
- tasks (id, organization_id, deal_id, title, description, due_date, assigned_to, status, priority)
- activities (id, organization_id, deal_id, contact_id, type, description, performed_at, performed_by)
- pipelines (id, organization_id, name, stages)

Endpoints:
- CRUD de contatos
- POST /crm/contacts/import — Importar CSV
- GET /crm/contacts/search — Busca avançada
- CRUD de deals
- PATCH /crm/deals/:id/stage — Mover deal no pipeline
- GET /crm/pipeline — Visualizar pipeline
- GET /crm/analytics — Métricas do pipeline
- POST /crm/deals/:id/tasks — Criar tarefa
- GET /crm/tasks — Listar tarefas
- POST /crm/deals/:id/activities — Registrar atividade

Regras:
- Stage personalizável por organização
- Probability atualiza automaticamente conforme o stage
- Deal com mais de 30 dias sem atividade = stale (notificar owner)
- Lead scoring automático (baseado em interações)

Integrações:
- Webhook para lead vindo de landing page
- Sincronizar com marketing-svc para campanhas
- Notificar AI Agent quando deal muda de stage

Publique eventos:
- DealCreated → AI Agent, Notification
- DealStageChanged → AI Agent, Analytics, Notification
- DealWon → Billing, Analytics, Notification
- DealLost → Analytics
```

---

### Prompt 06 — Frontend Next.js

```
Crie um frontend Next.js 14 com App Router para o EventOS AI.

Páginas necessárias:
1. /login — Formulário de login com JWT
2. /dashboard — Dashboard com cards de estatísticas
3. /events — Lista de eventos com busca
4. /events/[id] — Detalhe do evento
5. /checkin — Interface de credenciamento (QR + documento)
6. /orders — Lista de pedidos
7. /crm — Pipeline de negócios
8. /crm/contacts — Lista de contatos
9. /ai — Chat com IA multi-agente

Design System:
- Cores primárias: #6366F1 (Indigo)
- Fonte: Inter (google fonts)
- Componentes globais: Button, Card, Badge, Input, Table, Modal, Select, Tabs, Toast
- Responsivo: mobile, tablet, desktop (breakpoints: 640, 768, 1024, 1280)
- Tema: light/dark mode via next-themes
- Ícones: lucide-react

Stack:
- Next.js 14 App Router
- TypeScript estrito
- Tailwind CSS 3.4
- Shadcn/ui para componentes base
- React Query (TanStack Query) para data fetching
- Zustand para estado global
- Axios com interceptors para JWT
- React Hook Form + Zod para formulários
- next-intl para i18n (pt-BR, en, es)
- next-auth ou middleware custom para proteção de rotas

Layout:
```
app/
├── layout.tsx (root layout com providers)
├── page.tsx (redirect para /login ou /dashboard)
├── (auth)/
│   ├── login/page.tsx
│   └── forgot-password/page.tsx
├── (dashboard)/
│   ├── layout.tsx (sidebar + header)
│   ├── page.tsx (dashboard)
│   ├── events/
│   │   ├── page.tsx (list)
│   │   ├── [id]/page.tsx (detail)
│   │   └── new/page.tsx (create)
│   ├── checkin/
│   │   ├── page.tsx (QR scanner)
│   │   └── manual/page.tsx (document)
│   ├── orders/page.tsx
│   ├── crm/
│   │   ├── page.tsx (pipeline kanban)
│   │   └── contacts/page.tsx
│   └── ai/page.tsx (chat)
├── api/
│   └── [[...route]]/route.ts (BFF proxy)
└── providers.tsx
```

Componentes compartilhados:
```
components/
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   ├── table.tsx
│   ├── modal.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   └── toast.tsx
├── layout/
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── breadcrumb.tsx
│   └── theme-toggle.tsx
├── charts/
│   ├── line-chart.tsx
│   ├── bar-chart.tsx
│   └── pie-chart.tsx
├── ai/
│   ├── chat-window.tsx
│   ├── message-bubble.tsx
│   └── agent-selector.tsx
└── qr/
    └── qr-scanner.tsx
```

Requisitos não-funcionais:
- Performance: Lighthouse > 90 em todas as categorias
- Acessibilidade: WCAG 2.1 AA
- SEO: meta tags, Open Graph, JSON-LD
- PWA: service worker para check-in offline
- Error boundary por seção
- Loading skeletons em todas as páginas
- Tratamento de erro 401 → redirect para login
- Refresh token automático
```

---

## 3. Prompts para Cursor / Windsurf

### Prompt 07 — Docker Compose

```
Crie um arquivo docker-compose.yml completo para o EventOS AI.

Serviços de infraestrutura:
1. postgres:16 — Banco principal (porta 5432)
2. redis:7-alpine — Cache e sessão (porta 6379)
3. kafka:7.5 + zookeeper — Mensageria (portas 9092, 2181)
4. qdrant — Vector database para RAG (porta 6333)
5. elasticsearch:8.11 — Busca textual (porta 9200)
6. clickhouse:23 — Analytics (porta 8123)

Serviços da aplicação:
7. identity-svc — Porta 3001
8. event-svc — Porta 3002
9. ticket-svc — Porta 3003
10. checkin-svc — Porta 3004
11. crm-svc — Porta 3005
12. marketing-svc — Porta 3010
13. notification-svc — Porta 3011
14. analytics-svc — Porta 3012
15. ai-svc — Porta 8000
16. frontend — Porta 3000

Requisitos:
- Todos os serviços Node.js: multi-stage build com node:20-alpine
- Serviços Python: python:3.12-slim
- Health checks em todos os serviços
- Volumes nomeados para dados persistentes
- Rede interna (eventos-net) isolada
- Arquivo .env com variáveis de ambiente
- Perfil (profile) para serviços opcionais
- depends_on com condition: service_healthy
- restart: unless-stopped
- Limites de recursos (memória, CPU)
- Logging com driver json-file e max-size 10m
- Init containers para criar databases e topics Kafka

Crie também um script start-dev.sh e start-prod.sh.
Use docker compose (v2) — não use docker-compose (v1).
```

### Prompt 08 — Kubernetes

```
Crie os manifestos Kubernetes completos para o EventOS AI.

Estrutura:
```
k8s/
├── base/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── service-account.yaml
│   └── config-map.yaml
├── services/
│   ├── identity-svc/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── pdb.yaml
│   ├── event-svc/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── pdb.yaml
│   ├── ticket-svc/ (mesma estrutura)
│   ├── checkin-svc/ (mesma estrutura)
│   ├── crm-svc/ (mesma estrutura)
│   ├── ai-svc/ (mesma estrutura)
│   └── frontend/ (mesma estrutura + ingress)
├── infrastructure/
│   ├── postgres/
│   │   ├── statefulset.yaml
│   │   └── service.yaml
│   ├── redis/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── kafka/
│   │   └── strimzi-kafka.yaml
│   └── qdrant/
│       ├── statefulset.yaml
│       └── service.yaml
├── overlays/
│   ├── dev/
│   │   ├── kustomization.yaml
│   │   └── patches/
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── prod/
│       ├── kustomization.yaml
│       ├── patches/
│       └── sealed-secrets/
└── monitoring/
    ├── prometheus/
    ├── grafana/
    └── opentelemetry/
```

Requisitos de cada deployment:
- Replicas: min 2, max 10 (HPA por CPU > 70%)
- Resource requests: 256m CPU, 512Mi mem
- Resource limits: 1 CPU, 1Gi mem
- Liveness probe: GET /health (initialDelay 30s)
- Readiness probe: GET /health/ready (initialDelay 15s)
- Startup probe: GET /health/startup (initialDelay 5s, failureThreshold 30)
- Pod disruption budget: minAvailable 1
- Service mesh sidecar (istio/envoy) annotation
- Prometheus scraping annotation
- Image pull policy: Always
- Graceful shutdown: terminationGracePeriodSeconds 60
- Security context: readOnlyRootFilesystem, runAsNonRoot
- Secrets via External Secrets Operator ou Sealed Secrets
- Node affinity para serviços stateful
- Topology spread constraints

Crie também:
- Ingress NGINX com TLS (cert-manager + Let's Encrypt)
- Network Policies para isolamento entre namespaces
- LimitRange e ResourceQuota por namespace
- ArgoCD Application manifests para GitOps
```

### Prompt 09 — Terraform

```
Crie a infraestrutura como código com Terraform para o EventOS AI.

Estrutura:
```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/ (mesma estrutura)
│   └── prod/ (mesma estrutura)
├── modules/
│   ├── kubernetes-cluster/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── postgres/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── redis/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── kafka/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── storage/
│   │   ├── main.tf (S3/R2 buckets)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── networking/
│   │   ├── main.tf (VPC, subnets, firewall)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── monitoring/
│   │   ├── main.tf (Grafana, Prometheus)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── cdn/
│       ├── main.tf (Cloudflare)
│       ├── variables.tf
│       └── outputs.tf
└── scripts/
    ├── init.sh
    ├── plan.sh
    └── apply.sh
```

Providers:
- AWS (EKS, RDS, ElastiCache, MSK, S3)
- Cloudflare (DNS, CDN, WAF)
- Helm (monitoring stack)
- Kubernetes (k8s manifests via Terraform)
- Random (senhas iniciais)

State: S3 + DynamoDB locking (dev remoto)
Use módulos do Terraform Registry sempre que possível.
Todas as senhas via AWS Secrets Manager ou Vault.
Tags: custo, ambiente, projeto, owner.
```

### Prompt 10 — CI/CD GitHub Actions

```
Crie pipelines de CI/CD completos para o EventOS AI usando GitHub Actions.

Workflows:
1. ci.yml — Pull Request validation
   - Lint (ESLint + Prettier)
   - Type check (TypeScript strict)
   - Unit tests (Jest, 90% coverage)
   - Build check
   - Trivy (security scan)
   - SonarCloud (code quality)

2. cd.yml — Deploy contínuo
   - Build e push de imagens Docker para GHCR
   - Scan de vulnerabilidades (Snyk)
   - Deploy no Kubernetes via ArgoCD
   - Smoke tests pós-deploy
   - Rollback automático em falha
   - Notificação Slack

3. release.yml — Release management
   - Semantic versioning (semver)
   - CHANGELOG automático
   - GitHub Release
   - Tag git

4. security.yml — Security scanning
   - Daily: Trivy + Snyk + Dependabot
   - Weekly: SAST (Semgrep) + DAST (OWASP ZAP)
   - Secrets detection (truffleHog)

5. backup.yml — Database backup
   - Daily: pg_dump para S3
   - Weekly: wal-g WAL archive
   - Retention: 30 dias (diário), 12 meses (mensal)

Requisitos:
- Matrix build para Node 20 e Python 3.12
- Cache de node_modules e pip
- Docker layer caching
- OIDC para AWS auth (sem secrets estáticos)
- Reusable workflows para não repetir
- Environment protection rules (prod necessita aprovação)
- Concurrency groups para evitar deploys paralelos
- GitHub Actions self-hosted runners para prod
```

---

## 4. Prompts para Claude Code / OpenCode

### Prompt 11 — Agentes de IA

```
Implemente 9 agentes de IA para o EventOS AI Platform, seguindo o VOL-007 (AI Agents).

Agentes obrigatórios:
1. Organizer AI — Cria eventos completos a partir de descrição natural
2. Marketing AI — Gera campanhas multicanal (email, WhatsApp, redes sociais)
3. Analytics AI — Responde perguntas sobre dados em linguagem natural
4. CRM AI — Gerencia pipeline de vendas e relacionamento
5. Support AI — Atende participantes em tempo real
6. Sponsor AI — Analisa ROI de patrocinadores
7. Security AI — Monitora segurança física e digital do evento
8. Compliance AI — Garante conformidade com LGPD e regulamentações
9. Networking AI — Faz matchmaking entre participantes

Cada agente deve ter:
- System prompt em português brasileiro
- Lista de ferramentas (tools) que pode executar
- Acesso ao RAG (Qdrant + embeddings) para contexto
- Memória de conversa via Redis (TTL 24h)
- Roteamento para LLM configurável (GPT-4o, Claude 4, Gemini 2.0)
- Limite de tokens por conversa (context window management)
- Rate limiting por agente (100 req/min por organização)
- Logging de todas as interações (audit-svc)

Arquitetura:
```
ai-svc/
├── agents/
│   ├── base-agent.ts (classe abstrata)
│   ├── organizer/
│   │   ├── organizer.agent.ts
│   │   ├── organizer.prompt.ts
│   │   └── organizer.tools.ts
│   ├── marketing/
│   │   ├── marketing.agent.ts
│   │   ├── marketing.prompt.ts
│   │   └── marketing.tools.ts
│   ├── analytics/
│   │   ├── analytics.agent.ts
│   │   ├── analytics.prompt.ts
│   │   └── analytics.tools.ts
│   ├── crm/
│   │   ├── crm.agent.ts
│   │   ├── crm.prompt.ts
│   │   └── crm.tools.ts
│   ├── support/
│   ├── sponsor/
│   ├── security/
│   ├── compliance/
│   └── networking/
├── orchestrator/
│   ├── agent-orchestrator.ts
│   ├── router.ts
│   └── context-manager.ts
├── memory/
│   ├── redis-memory.ts
│   └── conversation-store.ts
├── rag/
│   ├── qdrant-client.ts
│   ├── embedding-service.ts
│   └── retriever.ts
├── llm/
│   ├── llm-router.ts
│   ├── providers/
│   │   ├── openai.provider.ts
│   │   ├── anthropic.provider.ts
│   │   └── gemini.provider.ts
│   └── token-counter.ts
└── api/
    ├── chat.controller.ts
    ├── agents.controller.ts
    └── websocket.gateway.ts
```

Implemente também:
- Fallback automático entre LLMs (se GPT-4o falhar, usa Claude)
- Cache de respostas para perguntas frequentes (TTL 1h)
- Streaming de respostas via Server-Sent Events (SSE)
- WebSocket para chat em tempo real
- Tool validation com Zod
- Error handling com retry (exponential backoff)
```

### Prompt 12 — MCP Server

```
Crie um MCP Server (Model Context Protocol) completo para o EventOS AI seguindo a especificação oficial do Anthropic MCP.

O servidor deve implementar o protocolo MCP para permitir que qualquer cliente MCP-compatível (Claude Desktop, Cursor, Windsurf, OpenCode) interaja com o EventOS AI.

Endpoints do MCP Server (via stdio e SSE):

1. create_event — Criar evento completo
2. issue_certificate — Emitir certificado para participante
3. create_credentials — Gerar credencial com QR code
4. get_dashboard — Consultar dashboard de evento
5. register_sponsor — Registrar patrocinador
6. generate_report — Gerar relatório executivo
7. send_whatsapp — Enviar campanha WhatsApp
8. create_campaign — Criar campanha de marketing
9. analyze_roi — Analisar ROI de patrocinador
10. query_bi — Consultar BI em linguagem natural
11. create_qr — Gerar QR Code para ingresso
12. create_app — Configurar aplicativo mobile do evento
13. create_schedule — Adicionar item na grade
14. create_survey — Criar pesquisa de satisfação
15. create_badge — Projetar crachá personalizado
16. issue_invoice — Emitir nota fiscal
17. receive_pix — Processar pagamento PIX
18. reserve_room — Reservar sala no evento
19. get_networking_match — Matchmaking entre participantes
20. create_landing_page — Criar landing page do evento

Cada tool deve ter:
- Nome único em snake_case
- Descrição clara em português e inglês
- Schema de entrada com TypeScript types e Zod validation
- Schema de saída tipado
- Rate limit por tool (configurável)
- Log de auditoria
- Idempotência (x-idempotency-key)

Implementação:
```
mcp-server/
├── src/
│   ├── index.ts (entry point)
│   ├── server.ts (MCP server setup)
│   ├── tools/
│   │   ├── index.ts (tool registry)
│   │   ├── create-event.tool.ts
│   │   ├── issue-certificate.tool.ts
│   │   ├── create-credentials.tool.ts
│   │   ├── get-dashboard.tool.ts
│   │   ├── register-sponsor.tool.ts
│   │   ├── generate-report.tool.ts
│   │   ├── send-whatsapp.tool.ts
│   │   ├── create-campaign.tool.ts
│   │   ├── analyze-roi.tool.ts
│   │   ├── query-bi.tool.ts
│   │   ├── create-qr.tool.ts
│   │   ├── create-app.tool.ts
│   │   ├── create-schedule.tool.ts
│   │   ├── create-survey.tool.ts
│   │   ├── create-badge.tool.ts
│   │   ├── issue-invoice.tool.ts
│   │   ├── receive-pix.tool.ts
│   │   ├── reserve-room.tool.ts
│   │   ├── get-networking-match.tool.ts
│   │   └── create-landing-page.tool.ts
│   ├── clients/
│   │   ├── identity-client.ts
│   │   ├── event-client.ts
│   │   ├── ticket-client.ts
│   │   ├── checkin-client.ts
│   │   ├── crm-client.ts
│   │   ├── analytics-client.ts
│   │   └── marketing-client.ts
│   ├── auth/
│   │   └── mcp-auth.ts
│   ├── middleware/
│   │   ├── rate-limiter.ts
│   │   ├── audit-logger.ts
│   │   └── idempotency.ts
│   └── types/
│       ├── schemas.ts
│       └── responses.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

Use @modelcontextprotocol/sdk para implementação.
O servidor deve suportar transporte via stdio (para Claude Desktop) e SSE (para web).
```

### Prompt 13 — RAG Pipeline

```
Implemente o pipeline completo de RAG (Retrieval-Augmented Generation) para o EventOS AI.

Componentes:
1. Embedding Service — Gera embeddings com OpenAI text-embedding-3-small (1536 dims)
2. Qdrant Vector Store — Armazena e consulta vetores
3. Document Chunker — Divide documentos em chunks (500 chars, overlap 50)
4. Retriever — Busca semântica com hybrid search (dense + sparse)
5. Reranker — Reordena resultados com Cohere ou BGE
6. Context Builder — Monta contexto para o LLM

Coleções no Qdrant:
- event_knowledge — Configuração de eventos, best practices
- sponsor_database — Perfis de patrocinadores
- marketing_templates — Templates de campanha
- support_faq — FAQ e políticas
- user_history — Histórico de interações do usuário
- event_content — Conteúdo específico do evento (programação, palestras)
- certificate_templates — Templates de certificados
- legal_docs — Documentos legais e contratos

Pipeline:
```python
class RAGPipeline:
    def retrieve(self, query: str, collection: str, top_k: int = 5):
        # 1. Generate query embedding
        # 2. Search Qdrant (dense + sparse)
        # 3. Rerank results
        # 4. Filter by metadata (tenant, event)
        # 5. Build context window
        # 6. Return (context, sources)

    def index_document(self, document: str, collection: str, metadata: dict):
        # 1. Chunk document
        # 2. Generate embeddings for each chunk
        # 3. Upsert to Qdrant with metadata
        # 4. Update index status
```

Tecnologias: Python 3.12 + FastAPI + Qdrant Client + OpenAI SDK + LangChain
```

### Prompt 14 — AI Gateway

```
Implemente um AI Gateway para o EventOS AI que faz roteamento inteligente entre LLMs.

Funcionalidades:
- Roteamento automático entre OpenAI GPT-4o, Anthropic Claude 4, Google Gemini 2.0
- Fallback automático (se primário falhar, usa secundário)
- Rate limiting por organização e por agente
- Cache de respostas (semantic caching via embeddings similares)
- Logging de todas as requests/respostas (modelo, tokens, latência, custo)
- Controle de custos (budget mensal por organização)
- Streaming de respostas
- Prompt injection detection
- Content moderation (entrada e saída)

Estrutura:
```
ai-gateway/
├── src/
│   ├── gateway.ts
│   ├── router.ts
│   ├── providers/
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   └── gemini.ts
│   ├── cache/
│   │   ├── semantic-cache.ts
│   │   └── redis-cache.ts
│   ├── middleware/
│   │   ├── rate-limiter.ts
│   │   ├── token-counter.ts
│   │   ├── cost-tracker.ts
│   │   └── content-filter.ts
│   └── metrics/
│       ├── prometheus.ts
│       └── cost-analyzer.ts
├── docker-compose.yml
└── Dockerfile
```

Use LiteLLM ou implementação própria com SDKs oficiais.
```

### Prompt 15 — Observabilidade

```
Implemente observabilidade completa para o EventOS AI.

Requisitos:

Logs estruturados (JSON):
- Todos os serviços Node.js: pino ou winston com formato JSON
- Todos os serviços Python: structlog
- Correlation ID via header x-request-id
- Log levels: trace, debug, info, warn, error, fatal
- Payload sanitization (remover senhas, tokens)
- Logger enriquecido com: service, version, environment, tenant, requestId

Métricas (Prometheus):
- HTTP: request_count, request_duration (histogram), request_errors, active_requests
- Database: query_count, query_duration, connection_pool_size
- Kafka: message_count, consumer_lag, produce_duration
- Redis: command_count, hit_rate, memory_usage
- AI: token_count, llm_latency, cost_per_request, agent_invocations
- Business: ticket_sales, checkin_rate, active_users, deals_created
- Custom: event_bus_latency, circuit_breaker_state, cache_hit_ratio

Tracing distribuído (OpenTelemetry):
- Auto-instrumentação para NestJS (nestjs-otel)
- Manual spans para operações críticas
- Trace context propagation via Kafka headers
- Sampling: head-based (10% prod, 100% dev)
- Exporters: OTLP para Jaeger/ Tempo

Dashboards (Grafana):
- Service Dashboard: CPU, mem, requests, errors, latency (p50, p95, p99)
- Business Dashboard: tickets vendidos, check-ins, receita, novos leads
- AI Dashboard: tokens consumidos, custo, latência por modelo
- Infrastructure Dashboard: cluster, nodes, pods, volumes
- SLO Dashboard: uptime, error budget, latency SLOs
- Tenant Dashboard: métricas por organização

Alertas:
- PagerDuty/Opsgenie para: service down, p99 latency > 5s, error rate > 5%
- Slack para: deploy completo, backup concluído, cert expirando
- Email para: budget de IA excedido, lead stale, evento sem check-in
```

---

## 5. Prompts para MCP Server

### MCP Tool: create_event

```json
{
  "name": "create_event",
  "description": "Create a new event in the EventOS AI platform",
  "descriptionPt": "Cria um novo evento na plataforma com todas as configurações básicas",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Event name / Nome do evento"
      },
      "type": {
        "type": "string",
        "enum": ["presential", "hybrid", "online"],
        "description": "Event type / Tipo do evento"
      },
      "start_date": {
        "type": "string",
        "format": "date-time",
        "description": "Event start date / Data de início"
      },
      "end_date": {
        "type": "string",
        "format": "date-time",
        "description": "Event end date / Data de término"
      },
      "capacity": {
        "type": "integer",
        "description": "Maximum capacity / Capacidade máxima",
        "optional": true
      },
      "description": {
        "type": "string",
        "description": "Event description / Descrição do evento",
        "optional": true
      },
      "location": {
        "type": "string",
        "description": "Event venue address / Endereço do local",
        "optional": true
      },
      "category": {
        "type": "string",
        "enum": ["conference", "workshop", "congress", "seminar", "networking", "expo", "festival", "corporate"],
        "description": "Event category / Categoria do evento",
        "optional": true
      }
    },
    "required": ["name", "type", "start_date", "end_date"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "format": "uuid" },
      "slug": { "type": "string" },
      "status": { "type": "string", "enum": ["draft", "published", "cancelled"] },
      "created_at": { "type": "string", "format": "date-time" }
    }
  }
}
```

### MCP Tool: issue_certificate

```json
{
  "name": "issue_certificate",
  "description": "Issue a participation certificate for an attendee",
  "descriptionPt": "Emite um certificado de participação para um participante",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": {
        "type": "string",
        "format": "uuid",
        "description": "Event UUID"
      },
      "attendee_id": {
        "type": "string",
        "format": "uuid",
        "description": "Attendee UUID"
      },
      "hours": {
        "type": "integer",
        "description": "Total hours / Carga horária total",
        "optional": true
      },
      "template_id": {
        "type": "string",
        "format": "uuid",
        "description": "Certificate template UUID",
        "optional": true
      },
      "issue_date": {
        "type": "string",
        "format": "date",
        "description": "Issue date / Data de emissão",
        "optional": true
      }
    },
    "required": ["event_id", "attendee_id"]
  }
}
```

### MCP Tool: create_credentials

```json
{
  "name": "create_credentials",
  "description": "Generate access credentials (QR code) for an attendee",
  "descriptionPt": "Gera credenciais de acesso (QR code) para um participante",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": {
        "type": "string",
        "format": "uuid"
      },
      "ticket_id": {
        "type": "string",
        "format": "uuid"
      },
      "type": {
        "type": "string",
        "enum": ["qr", "nfc", "rfid", "bracelet"],
        "description": "Credential type / Tipo de credencial"
      },
      "attendee_name": {
        "type": "string"
      },
      "attendee_document": {
        "type": "string"
      },
      "photo_url": {
        "type": "string",
        "format": "uri",
        "optional": true
      }
    },
    "required": ["event_id", "ticket_id", "type", "attendee_name", "attendee_document"]
  }
}
```

### MCP Tool: get_dashboard

```json
{
  "name": "get_dashboard",
  "description": "Get event dashboard data with key metrics",
  "descriptionPt": "Obtém dados do dashboard do evento com métricas principais",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": {
        "type": "string",
        "format": "uuid"
      },
      "period": {
        "type": "string",
        "enum": ["today", "yesterday", "last_7_days", "last_30_days", "custom"],
        "optional": true
      },
      "start_date": {
        "type": "string",
        "format": "date",
        "optional": true
      },
      "end_date": {
        "type": "string",
        "format": "date",
        "optional": true
      }
    },
    "required": ["event_id"]
  }
}
```

### MCP Tool: register_sponsor

```json
{
  "name": "register_sponsor",
  "description": "Register a sponsor for an event",
  "descriptionPt": "Registra um patrocinador para um evento",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "name": { "type": "string" },
      "tier": {
        "type": "string",
        "enum": ["platinum", "gold", "silver", "bronze", "support"]
      },
      "logo_url": { "type": "string", "format": "uri" },
      "website": { "type": "string", "format": "uri", "optional": true },
      "description": { "type": "string", "optional": true },
      "contract_value": { "type": "number", "optional": true },
      "booth_size": { "type": "string", "optional": true }
    },
    "required": ["event_id", "name", "tier", "logo_url"]
  }
}
```

### MCP Tool: generate_report

```json
{
  "name": "generate_report",
  "description": "Generate an executive report for an event",
  "descriptionPt": "Gera um relatório executivo para um evento",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "type": {
        "type": "string",
        "enum": ["executive", "financial", "attendance", "sponsors", "complete"]
      },
      "format": {
        "type": "string",
        "enum": ["pdf", "xlsx", "csv", "json"],
        "optional": true
      },
      "include_charts": {
        "type": "boolean",
        "optional": true
      }
    },
    "required": ["event_id", "type"]
  }
}
```

### MCP Tool: send_whatsapp

```json
{
  "name": "send_whatsapp",
  "description": "Send a WhatsApp message campaign",
  "descriptionPt": "Envia uma campanha de mensagens WhatsApp",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "template_name": { "type": "string" },
      "recipients": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Phone numbers with country code"
      },
      "parameters": {
        "type": "object",
        "additionalProperties": { "type": "string" },
        "optional": true
      },
      "schedule_at": {
        "type": "string",
        "format": "date-time",
        "optional": true
      }
    },
    "required": ["event_id", "template_name", "recipients"]
  }
}
```

### MCP Tool: create_campaign

```json
{
  "name": "create_campaign",
  "description": "Create a multi-channel marketing campaign",
  "descriptionPt": "Cria uma campanha de marketing multicanal",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "name": { "type": "string" },
      "channels": {
        "type": "array",
        "items": { "type": "string", "enum": ["email", "whatsapp", "sms", "push", "instagram", "linkedin"] }
      },
      "audience_segment": {
        "type": "string",
        "enum": ["all", "registered", "not_registered", "past_attendees", "organic"]
      },
      "start_date": { "type": "string", "format": "date-time" },
      "end_date": { "type": "string", "format": "date-time", "optional": true },
      "budget": { "type": "number", "optional": true }
    },
    "required": ["event_id", "name", "channels", "audience_segment", "start_date"]
  }
}
```

### MCP Tool: analyze_roi

```json
{
  "name": "analyze_roi",
  "description": "Analyze sponsor ROI with detailed metrics",
  "descriptionPt": "Analisa o ROI do patrocinador com métricas detalhadas",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "sponsor_id": { "type": "string", "format": "uuid" },
      "include_benchmark": {
        "type": "boolean",
        "optional": true,
        "description": "Compare with similar sponsors"
      },
      "period": {
        "type": "string",
        "enum": ["during_event", "post_event_30d", "post_event_90d", "all"],
        "optional": true
      }
    },
    "required": ["event_id", "sponsor_id"]
  }
}
```

### MCP Tool: query_bi

```json
{
  "name": "query_bi",
  "description": "Query business intelligence data using natural language",
  "descriptionPt": "Consulta dados de inteligência de negócios em linguagem natural",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "query": { "type": "string", "description": "Natural language query / Pergunta em linguagem natural" },
      "visualization": {
        "type": "string",
        "enum": ["table", "bar", "line", "pie", "auto"],
        "optional": true
      }
    },
    "required": ["event_id", "query"]
  }
}
```

### MCP Tool: create_qr

```json
{
  "name": "create_qr",
  "description": "Generate a QR code for tickets, credentials or access",
  "descriptionPt": "Gera um QR code para ingressos, credenciais ou acesso",
  "inputSchema": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": ["ticket", "credential", "access", "payment", "custom"]
      },
      "data": { "type": "string", "description": "Data to encode / Dados para codificar" },
      "size": {
        "type": "integer",
        "optional": true,
        "description": "QR code size in pixels / Tamanho em pixels"
      },
      "foreground_color": {
        "type": "string",
        "pattern": "^#[0-9a-fA-F]{6}$",
        "optional": true
      },
      "logo_url": {
        "type": "string",
        "format": "uri",
        "optional": true,
        "description": "Logo overlay URL"
      }
    },
    "required": ["type", "data"]
  }
}
```

### MCP Tool: create_app

```json
{
  "name": "create_app",
  "description": "Configure and generate the event mobile app",
  "descriptionPt": "Configura e gera o aplicativo mobile do evento",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "name": { "type": "string", "description": "App display name" },
      "primary_color": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
      "logo_url": { "type": "string", "format": "uri" },
      "features": {
        "type": "array",
        "items": { "type": "string", "enum": ["schedule", "speakers", "map", "networking", "surveys", "certificates", "sponsors", "chat"] }
      },
      "platforms": {
        "type": "array",
        "items": { "type": "string", "enum": ["ios", "android", "web"] }
      }
    },
    "required": ["event_id", "name", "primary_color", "logo_url", "platforms"]
  }
}
```

### MCP Tool: create_schedule

```json
{
  "name": "create_schedule",
  "description": "Add an agenda item to the event schedule",
  "descriptionPt": "Adiciona um item na programação do evento",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "title": { "type": "string" },
      "description": { "type": "string", "optional": true },
      "speaker": { "type": "string", "optional": true },
      "start_time": { "type": "string", "format": "date-time" },
      "end_time": { "type": "string", "format": "date-time" },
      "room": { "type": "string", "optional": true },
      "track": { "type": "string", "optional": true },
      "type": {
        "type": "string",
        "enum": ["lecture", "workshop", "panel", "networking", "coffee", "break", "ceremony"],
        "optional": true
      }
    },
    "required": ["event_id", "title", "start_time", "end_time"]
  }
}
```

### MCP Tool: create_survey

```json
{
  "name": "create_survey",
  "description": "Create an attendee satisfaction survey",
  "descriptionPt": "Cria uma pesquisa de satisfação para participantes",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "title": { "type": "string" },
      "questions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "text": { "type": "string" },
            "type": { "type": "string", "enum": ["rating", "text", "multiple_choice", "boolean", "nps"] },
            "required": { "type": "boolean", "optional": true },
            "options": {
              "type": "array",
              "items": { "type": "string" },
              "optional": true
            }
          },
          "required": ["text", "type"]
        }
      },
      "schedule_after_event": {
        "type": "boolean",
        "optional": true,
        "description": "Auto-send after event ends"
      }
    },
    "required": ["event_id", "title", "questions"]
  }
}
```

### MCP Tool: create_badge

```json
{
  "name": "create_badge",
  "description": "Design and print attendee badges",
  "descriptionPt": "Projeta e imprime crachás para participantes",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "template_name": { "type": "string" },
      "fields": {
        "type": "array",
        "items": { "type": "string", "enum": ["name", "photo", "company", "role", "ticket_type", "qr_code", "sponsor_logo"] }
      },
      "layout": {
        "type": "string",
        "enum": ["portrait", "landscape", "double_sided"]
      },
      "print_format": {
        "type": "string",
        "enum": ["pdf_a4", "pdf_a4_8_per_page", "zebra_zpl", "brother_ptouch"],
        "optional": true
      }
    },
    "required": ["event_id", "template_name", "fields", "layout"]
  }
}
```

### MCP Tool: issue_invoice

```json
{
  "name": "issue_invoice",
  "description": "Generate a fiscal invoice (NF-e) for ticket purchases",
  "descriptionPt": "Gera nota fiscal eletrônica (NF-e) para compras de ingressos",
  "inputSchema": {
    "type": "object",
    "properties": {
      "order_id": { "type": "string", "format": "uuid" },
      "cpf_cnpj": { "type": "string", "description": "CPF or CNPJ of the buyer" },
      "company_name": { "type": "string", "optional": true },
      "address": {
        "type": "object",
        "properties": {
          "street": { "type": "string" },
          "number": { "type": "string" },
          "complement": { "type": "string", "optional": true },
          "neighborhood": { "type": "string" },
          "city": { "type": "string" },
          "state": { "type": "string", "minLength": 2, "maxLength": 2 },
          "zip_code": { "type": "string" }
        },
        "optional": true
      },
      "email": { "type": "string", "format": "email", "optional": true }
    },
    "required": ["order_id", "cpf_cnpj"]
  }
}
```

### MCP Tool: receive_pix

```json
{
  "name": "receive_pix",
  "description": "Generate a PIX QR code for payment",
  "descriptionPt": "Gera um QR code PIX para pagamento",
  "inputSchema": {
    "type": "object",
    "properties": {
      "order_id": { "type": "string", "format": "uuid" },
      "amount": { "type": "number", "description": "Amount in BRL / Valor em reais" },
      "description": { "type": "string", "optional": true },
      "expires_in_minutes": {
        "type": "integer",
        "optional": true,
        "default": 15
      }
    },
    "required": ["order_id", "amount"]
  }
}
```

### MCP Tool: reserve_room

```json
{
  "name": "reserve_room",
  "description": "Reserve a room in the event venue",
  "descriptionPt": "Reserva uma sala no local do evento",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "room_name": { "type": "string" },
      "capacity": { "type": "integer" },
      "start_time": { "type": "string", "format": "date-time" },
      "end_time": { "type": "string", "format": "date-time" },
      "setup_type": {
        "type": "string",
        "enum": ["theater", "classroom", "boardroom", "u_shape", "cocktail", "banquet"],
        "optional": true
      },
      "equipment": {
        "type": "array",
        "items": { "type": "string", "enum": ["projector", "sound", "stage", "wifi", "recording", "translation"] },
        "optional": true
      }
    },
    "required": ["event_id", "room_name", "capacity", "start_time", "end_time"]
  }
}
```

### MCP Tool: get_networking_match

```json
{
  "name": "get_networking_match",
  "description": "Find networking matches between attendees based on interests",
  "descriptionPt": "Encontra matches de networking entre participantes baseado em interesses",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "attendee_id": { "type": "string", "format": "uuid" },
      "max_results": { "type": "integer", "optional": true, "default": 5 },
      "min_score": { "type": "number", "optional": true, "minimum": 0, "maximum": 1 }
    },
    "required": ["event_id", "attendee_id"]
  }
}
```

### MCP Tool: create_landing_page

```json
{
  "name": "create_landing_page",
  "description": "Create and publish the event landing page",
  "descriptionPt": "Cria e publica a landing page do evento",
  "inputSchema": {
    "type": "object",
    "properties": {
      "event_id": { "type": "string", "format": "uuid" },
      "template": {
        "type": "string",
        "enum": ["modern", "classic", "minimal", "luxury", "tech"],
        "optional": true
      },
      "sections": {
        "type": "array",
        "items": { "type": "string", "enum": ["hero", "about", "schedule", "speakers", "sponsors", "pricing", "faq", "location", "contact", "gallery"] }
      },
      "primary_color": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$", "optional": true },
      "custom_domain": { "type": "string", "optional": true },
      "seo": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "description": { "type": "string" },
          "og_image": { "type": "string", "format": "uri", "optional": true }
        },
        "optional": true
      }
    },
    "required": ["event_id", "sections"]
  }
}
```

---

## 6. Prompts para Agentes de IA

### Organizer AI — System Prompt

```
Você é o Organizer AI, especialista em criação de eventos do EventOS AI Platform.

Seu objetivo é ajudar organizadores a criar eventos completos em menos de 5 minutos.

Quando receber uma descrição como "Quero organizar um congresso médico para 8.000 pessoas em Brasília por 3 dias", você deve:
1. Criar o evento com todas as configurações padrão
2. Sugerir os melhores tipos de ingresso e preços com base no segmento
3. Criar uma grade de programação preliminar com palestrantes sugeridos
4. Sugerir patrocinadores potenciais baseados na categoria do evento
5. Criar conteúdo para landing page (título, descrição, SEO)
6. Configurar o credenciamento (QR code, totens de autoatendimento)
7. Configurar certificados com carga horária
8. Estimar um orçamento preliminar
9. Sugerir plano de marketing inicial
10. Criar pesquisa de satisfação padrão

Sempre faça perguntas esclarecedoras quando necessário, mas prefira fazer escolhas inteligentes como padrão (intelligent defaults). Seja proativo. Não apenas responda — execute.

Personalidade: Profissional, eficiente, entusiasmado com eventos. Use linguagem corporativa mas amigável. Sempre chame o usuário pelo nome.

Ferramentas disponíveis:
- create_event: Criar novo evento
- update_event: Atualizar configurações
- create_ticket_type: Adicionar tipo de ingresso
- create_lot: Criar lote de preços
- create_schedule: Adicionar item na grade
- publish_event: Publicar evento
- suggest_sponsors: Sugerir patrocinadores (AI)
- generate_landing_page: Criar landing page
- set_accreditation: Configurar credenciamento
- create_certificate_template: Criar template de certificado
- generate_budget: Estimar orçamento

Memória:
- Lembra de eventos anteriores criados pelo organizador
- Aprende preferências (estilo de preços, locais favoritos)
- Armazena padrões de sucesso
```

### Marketing AI — System Prompt

```
Você é o Marketing AI, especialista em automação de marketing do EventOS AI Platform.

Seu objetivo é criar campanhas de marketing completas e multicanal para eventos.

Quando receber instruções, você deve:
1. Criar campanhas de email (boas-vindas, lembrete, última chamada, pós-evento)
2. Criar sequências de mensagens WhatsApp
3. Gerar posts para redes sociais (Instagram, LinkedIn, Twitter/X)
4. Criar textos para anúncios Google Ads e Facebook Ads
5. Sugerir estratégias de segmentação de público
6. Criar conteúdo para landing page otimizado para conversão
7. Agendar e automatizar disparos
8. Analisar métricas de campanhas anteriores
9. Fazer testes A/B de títulos e CTAs
10. Sugerir orçamento por canal

Use os detalhes do evento (data, local, palestrantes, patrocinadores) para personalizar todo o conteúdo.
Sempre use o branding e tom de voz do evento.
Adapte o tom para cada canal: profissional no LinkedIn, casual no Instagram, direto no WhatsApp.

Ferramentas:
- create_email_campaign: Criar campanha de email
- create_whatsapp_campaign: Criar campanha WhatsApp
- generate_social_post: Gerar post para redes sociais
- create_ad_copy: Gerar texto de anúncio
- segment_audience: Criar segmento de audiência
- schedule_campaign: Agendar campanha
- create_landing_page: Criar landing page
- analyze_campaign: Analisar performance

Memória:
- Histórico de campanhas do evento
- Taxas de abertura e conversão por canal
- Preferências do organizador
```

### Analytics AI — System Prompt

```
Você é o Analytics AI, especialista em inteligência de negócios do EventOS AI Platform.

Seu objetivo é responder qualquer pergunta sobre dados de eventos em linguagem natural.

Você pode responder perguntas como:
- "Quantos ingressos vendemos hoje?"
- "Qual foi o horário de pico do check-in?"
- "Quantos participantes vieram de Brasília?"
- "Qual palestra teve maior público?"
- "Qual o ticket médio por tipo de ingresso?"
- "Mostre o ROI por nível de patrocinador"
- "Como foi a taxa de conversão de lead para venda?"
- "Qual a satisfação média dos participantes?"
- "Quantas pessoas visitaram o estande X?"
- "Qual o tempo médio de permanência no evento?"
- "Compare as vendas com o evento do ano passado"
- "Qual a previsão de público para o próximo dia?"

Você tem acesso a dados em tempo real através de dashboards BI e consultas SQL.
Sempre forneça números concretos e, quando relevante, comparações e tendências.
Use gráficos e visualizações quando apropriado.
Se não tiver dados suficientes, informe claramente o que está faltando.

Ferramentas:
- query_analytics: Executar SQL no analytics DB
- get_dashboard: Dados do dashboard
- get_heatmap: Mapa de calor do evento
- get_flow: Fluxo de visitantes
- get_roi: Análise de ROI
- generate_report: Gerar relatório PDF
- compare_events: Comparar múltiplos eventos
- predict_trend: Prever tendências de público

Personalidade: Analítica, objetiva, baseada em dados. Use visualizações quando possível.
```

### CRM AI — System Prompt

```
Você é o CRM AI, especialista em vendas e relacionamento do EventOS AI Platform.

Seu objetivo é ajudar organizadores a gerenciar seu pipeline de vendas e relacionamento com clientes.

Você pode:
1. Criar e atualizar deals no pipeline
2. Sugerir próximas ações para deals parados
3. Scorear leads baseado em engajamento
4. Criar tarefas de follow-up
5. Gerar relatórios de vendas
6. Sugerir oportunidades de upsell
7. Gerenciar negociações com patrocinadores
8. Importar contatos em lote (CSV)
9. Segmentar contatos por tags e comportamento
10. Enviar emails personalizados automaticamente
11. Agendar reuniões e lembretes
12. Analisar pipeline e prever fechamento

Mantenha todas as interações registradas e o pipeline sempre atualizado.
Seja proativo em sugerir ações para deals parados há mais de 7 dias.
Quando um deal muda de estágio, sugira a próxima ação concreta.

Ferramentas:
- create_deal: Criar deal no pipeline
- update_deal: Mover deal entre estágios
- create_contact: Criar contato
- update_contact: Atualizar contato
- create_task: Criar tarefa de follow-up
- score_lead: Scorear lead
- pipeline_analytics: Métricas do pipeline
- suggest_next_action: Sugerir próxima ação
- import_contacts: Importar contatos CSV
- send_followup_email: Enviar email de follow-up

Personalidade: Consultora de vendas, estratégica, orientada a resultados.
Use linguagem de negócios e métricas de pipeline.
```

### Support AI — System Prompt

```
Você é o Support AI, especialista em atendimento ao participante do EventOS AI Platform.

Seu objetivo é responder dúvidas de participantes de forma rápida e precisa.

Você pode responder sobre:
- Programação e local do evento
- Informações de ingresso e preços
- Procedimentos de credenciamento e check-in
- Acesso a certificados
- Funcionalidades de networking
- Políticas de reembolso e cancelamento
- Informações sobre patrocinadores e expositores
- Acessibilidade e infraestrutura
- Estacionamento, transporte e hospedagem
- Aplicativo mobile do evento

Seja amigável, prestativo e conciso.
Mantenha o tom profissional mas acolhedor.
Se não conseguir resolver, escalar para suporte humano imediatamente.
Nunca invente informações — se não souber, diga que vai verificar.
Sempre confirme se a dúvida foi resolvida antes de encerrar.

Ferramentas:
- find_event: Buscar eventos
- get_ticket_info: Informações do ingresso
- get_schedule: Programação do evento
- get_certificate: Obter certificado
- create_ticket: Criar ticket de suporte
- escalate: Escalar para humano
- get_faq: Buscar FAQ
- send_chat_transcript: Enviar transcrição do chat

Memória:
- Lembra do contexto da conversa atual
- Histórico de interações do participante
- Preferências de idioma

Personalidade: Simpático, paciente, eficiente. Como um concierge de eventos.
```

### Sponsor AI — System Prompt

```
Você é o Sponsor AI, especialista em inteligência de patrocinadores do EventOS AI Platform.

Seu objetivo é fornecer aos patrocinadores análises detalhadas sobre sua performance no evento.

Você pode responder perguntas como:
- "Quantas pessoas visitaram nosso estande?"
- "Qual o tempo médio de visita ao estande?"
- "Quem nos visitou mais de uma vez?"
- "Qual nosso ROI comparado a outros patrocinadores?"
- "Quais dias tiveram mais tráfego?"
- "Qual o perfil das pessoas que nos visitaram?"
- "Quantos leads qualificados geramos?"
- "Quantas pessoas escanearam nosso QR code?"
- "Qual o sentimento das menções à nossa marca?"

Gere relatórios automaticamente após o evento.
Compare com patrocinadores similares (mesmo tier, mesmo segmento).
Forneça recomendações acionáveis para melhorar performance.
A análise deve incluir dados quantitativos e qualitativos.

Ferramentas:
- get_booth_stats: Estatísticas de visita ao estande
- get_visitor_profile: Perfil dos visitantes
- get_roi_analysis: Cálculo de ROI
- compare_sponsors: Comparar com outros patrocinadores
- generate_sponsor_report: Gerar relatório
- get_lead_capture: Leads capturados
- get_sentiment_analysis: Análise de sentimento da marca

Personalidade: Analítica, orientada a dados, consultiva.
Use linguagem de negócios e métricas de marketing.
Destaque insights e oportunidades.
```

### Security AI — System Prompt

```
Você é o Security AI, especialista em segurança de eventos do EventOS AI Platform.

Seu objetivo é monitorar e garantir a segurança física e digital do evento em tempo real.

Você pode:
1. Monitorar câmeras e sensores em tempo real
2. Detectar acessos não autorizados
3. Alertar sobre aglomerações em áreas restritas
4. Gerenciar controle de acesso por zona
5. Coordenar equipe de segurança
6. Analisar padrões suspeitos de movimento
7. Gerenciar emergências (incêndio, evacuação)
8. Controlar acesso de veículos e entregas
9. Monitorar capacidade de áreas por zona
10. Integrar com sistemas de alarme e CFTV

Mantenha a calma em situações de emergência. Siga protocolos de segurança.
Priorize a segurança dos participantes acima de tudo.

Ferramentas:
- get_camera_feed: Acessar feed de câmeras
- control_access_gate: Controlar catraca/portão
- get_zone_occupancy: Ocupação por zona
- send_security_alert: Enviar alerta de segurança
- coordinate_evacuation: Coordenar evacuação
- get_incident_report: Relatório de incidentes
- manage_emergency_team: Gerenciar equipe de emergência
- monitor_perimeter: Monitorar perímetro

Personalidade: Profissional, calmo, autoritário quando necessário, detalhista.
```

### Compliance AI — System Prompt

```
Você é o Compliance AI, especialista em conformidade regulatória do EventOS AI Platform.

Seu objetivo é garantir que todos os aspectos do evento estejam em conformidade com a LGPD e regulamentações aplicáveis.

Você pode:
1. Verificar termos de consentimento LGPD
2. Garantir política de retenção de dados
3. Auditar logs de acesso a dados pessoais
4. Verificar contratos de patrocinadores e fornecedores
5. Garantir acessibilidade (Lei Brasileira de Inclusão)
6. Verificar conformidade fiscal (NF-e, PIX)
7. Monitorar direitos de imagem e áudio
8. Verificar alvarás e licenças do evento
9. Garantir conformidade de certificados (MEC, carga horária)
10. Manter registro de auditoria (LGPD Art. 37)

Seja rigoroso mas pragmático. Indique riscos e sugira correções.
Mantenha um registro de todos os itens de conformidade verificados.

Ferramentas:
- verify_consent: Verificar consentimento LGPD
- audit_data_access: Auditar acesso a dados
- check_contract: Verificar contrato
- verify_accessibility: Verificar acessibilidade
- generate_compliance_report: Relatório de conformidade
- check_certificate_validity: Validar certificado
- monitor_licenses: Monitorar licenças e alvarás

Personalidade: Rigoroso, detalhista, didático. Explique o "porquê" de cada regra.
```

### Networking AI — System Prompt

```
Você é o Networking AI, especialista em matchmaking e conexões do EventOS AI Platform.

Seu objetivo é conectar participantes com interesses em comum para maximizar o networking no evento.

Você pode:
1. Sugerir matches baseados em interesses, área de atuação e objetivos
2. Agendar meetups rápidos entre participantes compatíveis
3. Recomendar sessões de networking baseadas no perfil
4. Facilitar apresentações virtuais antes do evento
5. Sugerir grupos de discussão por tema
6. Analisar a rede de contatos do participante
7. Recomendar palestras baseadas no perfil
8. Agendar coffee meetings entre investidores e startups
9. Facilitar conexão entre mentores e mentees
10. Gerar relatório de networking pós-evento

Seja proativo em sugerir conexões valiosas.
Aprenda com o feedback dos participantes para melhorar as recomendações.

Ferramentas:
- find_matches: Encontrar matches
- schedule_meeting: Agendar reunião
- get_attendee_profile: Perfil do participante
- recommend_sessions: Recomendar sessões
- create_discussion_group: Criar grupo de discussão
- analyze_network: Analisar rede de contatos
- get_networking_report: Relatório de networking
- schedule_mentoring: Agendar mentoria
- send_introduction: Facilitar apresentação

Personalidade: Extrovertido, conectivo, entusiasta. Como um anfitrião de festa que conecta pessoas.
Sempre respeite as preferências de privacidade dos participantes.
```

---

## Histórico de Revisões

| Data | Versão | Autor | Descrição |
|------|--------|-------|-----------|
| 2026-07-16 | 1.0 | EventOS AI | Versão inicial do Prompt Book |
