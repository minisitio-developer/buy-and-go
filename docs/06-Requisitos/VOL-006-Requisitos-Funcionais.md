# VOL-006 â€” Functional Requirements

**EventOS AI Enterprise**
**VersÃ£o:** 0.0.1
**Status:** Draft

---

## REQ Format

```
REQ-XXXXX
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Title:       (nome curto)
Description: (descriÃ§Ã£o funcional)
Priority:    Critical | High | Medium | Low
Type:        Functional | Technical | Security | UX
Module:      (bounded context)
Dependencies: (REQ-IDs que este requisito depende)
Acceptance:  (critÃ©rios de aceite)
API:         (API-IDs relacionados)
DB:          (DB-IDs relacionados)
Screen:      (SCR-IDs relacionados)
Test:        (TEST-IDs relacionados)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
```

---

## REQ-000001 â€” User Registration

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Functional |
| Module | BC-001 Identity |
| Dependencies | â€” |
| API | API-000001 |
| DB | users |
| Screen | WEB-001 |
| Test | TEST-000001 |

**Description:**
Allow a new user to register in the platform using email/password or social login (Google, Microsoft).

**Acceptance:**
- User enters name, email, password, phone, document
- Email verification required (send OTP)
- Password must be â‰¥ 8 chars, uppercase, number, special char
- Duplicate email returns 409 error
- Social login creates account on first access
- User receives welcome email

---

## REQ-000002 â€” User Authentication

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Security |
| Module | BC-001 Identity |
| API | API-000001 |
| DB | users |

**Acceptance:**
- Login with email + password returns JWT
- JWT expires in 1 hour (configurable)
- Refresh token valid for 7 days
- Invalid credentials return 401
- Account locked after 5 failed attempts (15 min)
- MFA via TOTP or SMS (optional, configurable per org)
- SSO via OAuth2/OpenID Connect (Enterprise)

---

## REQ-000003 â€” Multi-Tenant Organization

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Functional |
| Module | BC-003 Organization |
| API | API-000003 |
| DB | organizations, organization_members |

**Acceptance:**
- User can create organization on registration
- Organization has slug (unique URL)
- Organization admin can invite members by email
- Members have roles: owner, admin, manager, staff
- All data scoped to tenant via x-tenant-id
- Tenant isolation at DB level (shared/schema/dedicated per tier)

---

## REQ-000004 â€” Create Event

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Functional |
| Module | BC-005 Events |
| API | API-000004 |
| DB | events |
| Screen | WEB-004 |

**Acceptance:**
- Event created in draft status
- Required fields: name, type, start_date, end_date, timezone
- Event slug auto-generated (editable before publish)
- Capacity cannot exceed organization plan limit
- Location via text or map picker
- Event supports categories (conference, fair, congress, show, etc.)
- Event type: presential, hybrid, online
- Created via form wizard OR via AI chat

---

## REQ-000005 â€” Publish Event

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Functional |
| Module | BC-005 Events |
| API | API-000004 |

**Acceptance:**
- Event must have at least 1 ticket type to publish
- Event must have schedule defined
- Published event generates public URL
- Published event indexed in search
- Published event triggers notification to subscribers
- Organizer can unpublish (if no tickets sold)

---

## REQ-000006 â€” Ticket Management

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Functional |
| Module | BC-006 Tickets |
| API | API-000006, API-000007 |
| DB | ticket_types, ticket_lots |

**Acceptance:**
- Event can have multiple ticket types
- Each ticket type has name, description, price, quantity
- Each ticket type can have multiple lots (pricing tiers)
- Lots have start/end dates and limited quantity
- Sold count auto-increments on order confirmation
- Ticket types can be active, paused, or sold out
- Coupons apply percentage or fixed discount

---

## REQ-000007 â€” Order & Payment

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Functional |
| Module | BC-007 Payments |
| API | API-000008 |
| DB | orders, order_items |

**Acceptance:**
- Order created in pending status
- Payment via PIX (auto-confirm), credit card, boleto
- Platform fee calculated as % + fixed
- Coupon validation and discount application
- Attendee info collected per ticket
- Order confirmation email sent
- Order can be cancelled before payment
- Refund processed (full or partial)

---

## REQ-000008 â€” Attendee Check-in

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Functional |
| Module | BC-023 Access Control |
| API | API-000010 |
| DB | check_ins, credentials |
| Screen | WEB-005, MOB-001 |

**Acceptance:**
- Check-in via QR code (scan from ticket or credential)
- Check-in via facial recognition (photo match)
- Check-in via manual document search
- Check-in via NFC/RFID tag
- Duplicate check-in prevented (409 if already checked in)
- Invalid/expired ticket returns 403
- Offline check-in supported (sync later)
- Check-in recorded with timestamp, method, device, location
- Real-time dashboard updates on each check-in

---

## REQ-000009 â€” Offline Check-in Sync

| Field | Value |
|-------|-------|
| Priority | High |
| Type | Technical |
| Module | BC-023 Access Control |
| API | API-000012 |
| DB | check_ins |

**Acceptance:**
- Device syncs all attendees data before event
- QR check-in works without internet
- Check-ins stored locally on device
- Sync uploads batch when internet restored
- Conflict resolution: server timestamp wins
- Sync progress shown on device

---

## REQ-000010 â€” Event Dashboard (BI)

| Field | Value |
|-------|-------|
| Priority | High |
| Type | Functional |
| Module | BC-012 Analytics |
| API | API-000015 |
| DB | ClickHouse (aggregated) |
| Screen | WEB-006 |

**Acceptance:**
- Real-time check-in counter
- Occupancy % vs capacity
- Check-in rate over time (hourly chart)
- Check-in by method (QR, face, manual)
- Attendee breakdown by category
- Sponsor booth visit count
- Average stay duration
- Export to PDF/CSV

---

## REQ-000011 â€” AI Chat (Event Assistant)

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Functional |
| Module | BC-013 AI |
| API | API-000013 |
| DB | ai_conversations, ai_messages |
| Screen | WEB-007 |

**Acceptance:**
- User can chat with AI in natural language
- AI can create events, generate content, answer questions
- AI has context of the user's organization and events
- AI can execute actions via MCP tools
- Streaming responses (SSE)
- Conversation history preserved
- User can reset conversation
- Rate limited per user/org

---

## REQ-000012 â€” CRM Pipeline

| Field | Value |
|-------|-------|
| Priority | High |
| Type | Functional |
| Module | BC-004 CRM |
| API | API-000011 |
| DB | crm_pipelines, crm_stages, crm_deals, crm_contacts |

**Acceptance:**
- Organization can create multiple pipelines
- Default pipeline: ProspecÃ§Ã£o, QualificaÃ§Ã£o, Proposta, NegociaÃ§Ã£o, Fechado
- Deals can be moved between stages (drag & drop)
- Deal has value, owner, contact, expected close date
- Lost deals require reason
- Pipeline analytics: conversion rate, avg deal time, funnel

---

## REQ-000013 â€” Sponsors Management

| Field | Value |
|-------|-------|
| Priority | High |
| Type | Functional |
| Module | BC-005 Events |
| DB | sponsors |

**Acceptance:**
- Sponsor has name, logo, website, tier
- Tiers: Diamond, Gold, Silver, Bronze
- Sponsor linked to contact in CRM
- Sponsor booth visit tracking
- Sponsor analytics dashboard
- Sponsor contract value and status

---

## REQ-000014 â€” Certificate Generation

| Field | Value |
|-------|-------|
| Priority | Medium |
| Type | Functional |
| Module | BC-027 Certification |
| API | API-000014 |
| DB | certificates |

**Acceptance:**
- Certificate template with customizable layout
- Auto-generate certificates for attendees
- Certificate has unique QR code for validation
- Public validation URL
- Optional blockchain hash for authenticity
- Digital signature (ICP-Brasil optional)
- Bulk generation with progress

---

## REQ-000015 â€” Event Search

| Field | Value |
|-------|-------|
| Priority | Medium |
| Type | Functional |
| Module | BC-015 Search |
| DB | ElasticSearch |

**Acceptance:**
- Full-text search across events, attendees, contacts
- Search by name, city, category, date range
- Faceted filters
- Autocomplete suggestions
- Results ranked by relevance

---

## REQ-000016 â€” Networking Matchmaking

| Field | Value |
|-------|-------|
| Priority | Medium |
| Type | Functional |
| Module | BC-024 Networking |
| DB | networking_profiles, networking_matches |

**Acceptance:**
- Attendee can create networking profile
- Profile has interests, skills, looking_for
- AI suggests matches based on profile similarity
- Match score shown (0-100%)
- Mutual interest activates chat
- In-app chat between matched attendees
- Digital business card exchange

---

## REQ-000017 â€” Gamification

| Field | Value |
|-------|-------|
| Priority | Low |
| Type | Functional |
| Module | BC-025 Gamification |
| DB | gamification_actions, gamification_user_points |

**Acceptance:**
- Actions earn points: check-in, visit booths, share, survey
- Leaderboard per event
- Badges for achievements
- Missions (complete X actions)
- Rewards integration (coupons, prizes)

---

## REQ-000018 â€” LGPD & Privacy

| Field | Value |
|-------|-------|
| Priority | Critical |
| Type | Security |
| Module | BC-021 LGPD |
| DB | lgpd_consents |

**Acceptance:**
- Consent collected for marketing, analytics, biometrics
- Consent history logged with timestamp and IP
- User can withdraw consent at any time
- Data export request (full user data)
- Account deletion with data anonymization
- Retention policies configurable per org
- Audit log of all data access

---

## REQ-000019 â€” Audit Logging

| Field | Value |
|-------|-------|
| Priority | High |
| Type | Technical |
| Module | BC-020 Audit |
| DB | audit_logs |

**Acceptance:**
- All creates, updates, deletes logged
- Audit entry: who, what, when, IP, user-agent
- Before/after diff for updates
- Immutable audit trail (append-only)
- Searchable by entity, user, action, date
- Retention: 5 years minimum

---

## REQ-000020 â€” Multi-Language Interface

| Field | Value |
|-------|-------|
| Priority | Medium |
| Type | UX |
| Module | BC-003 Organization |

**Acceptance:**
- EventOS supports pt-BR, en, es at launch
- Language can be set per organization
- User can override personal language
- All UI strings externalized (i18n)
- Dates, currencies, numbers localized
- AI responses in user's language

---

## REQ-000021 â€” White Label

| Field | Value |
|-------|-------|
| Priority | Medium |
| Type | Functional |
| Module | BC-003 Organization |

**Acceptance:**
- Organization can set custom logo, colors, domain
- Custom CSS variables for theming
- Custom email templates
- Custom domain with SSL
- Mobile app white-label (PWA + Flutter)
- Portal URL: {organization}.eventos.ai

---

## REQ-000022 â€” Webhook Integration

| Field | Value |
|-------|-------|
| Priority | Medium |
| Type | Technical |
| Module | BC-014 Notification |

**Acceptance:**
- Webhooks for: order.confirmed, checkin.completed, event.published
- Configurable URL and secret per organization
- Retry mechanism (3 attempts with backoff)
- Webhook delivery logs
- Test webhook functionality

---

## REQ-000023 â€” Feature Flags

| Field | Value |
|-------|-------|
| Priority | High |
| Type | Technical |
| Module | Platform Core |

**Acceptance:**
- Each feature can be toggled per organization
- Flags stored in organization.features JSONB
- Flags evaluated at API middleware level
- Flags support gradual rollout (percentage)
- Admin UI for flag management

---

## REQ-000024 â€” Mobile App (PWA)

| Field | Value |
|-------|-------|
| Priority | High |
| Type | Functional |
| Module | Platform UI |

**Acceptance:**
- PWA with offline support
- Installable on home screen
- Push notifications
- Camera access for QR scanning
- Biometric login (fingerprint, face)
- Ticket wallet
- Offline check-in capability

---

## REQ-000025 â€” Event Duplication

| Field | Value |
|-------|-------|
| Priority | Medium |
| Type | Functional |
| Module | BC-005 Events |

**Acceptance:**
- Duplicate event with all settings
- Duplicate: ticket types, schedules, rooms, sponsors
- Duplicate does NOT copy: attendees, orders, check-ins
- New event starts in draft status
- Name appended with " (cÃ³pia)"

---

## Related Documents

- VOL-001: Strategy (BC-001 to BC-027)
- VOL-002: Architecture (Microservices mapping)
- VOL-004: Database (Tables per requirement)
- VOL-005: APIs (Endpoints per requirement)

---

## REQ-000026 — Listagem de Produtos no Marketplace

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000026 |
| **DB** | marketplace_products |
| **Tela** | SCREEN-026 |
| **Teste** | TEST-000026 |
| **Dependências** | REQ-000004 |

**Descrição:**
Permite que organizadores listem produtos digitais e físicos para venda na vitrine do marketplace do evento.

**Critérios de Aceitação:**
- [ ] Produto possui nome, descrição, preço, imagens e categoria
- [ ] Produto pode ser digital (download) ou físico (entrega)
- [ ] Estoque controlado por quantidade com alerta de baixo estoque
- [ ] Produto pode ter variações (tamanho, cor, edição)
- [ ] Listagem aparece na vitrine do marketplace do evento
- [ ] Organizador pode ativar/pausar/desativar produto
- [ ] Produtos com estoque zero são ocultados automaticamente

---

## REQ-000027 — Carrinho de Compras

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000027 |
| **DB** | marketplace_carts, marketplace_cart_items |
| **Tela** | SCREEN-027 |
| **Teste** | TEST-000027 |
| **Dependências** | REQ-000026 |

**Descrição:**
Implementa carrinho de compras onde o usuário pode adicionar, remover e ajustar quantidades de produtos antes de finalizar a compra.

**Critérios de Aceitação:**
- [ ] Usuário pode adicionar produto ao carrinho com quantidade
- [ ] Carrinho exibe subtotal, descontos e total
- [ ] Usuário pode remover itens individualmente
- [ ] Carrinho persiste entre sessões (usuário logado)
- [ ] Estoque é verificado ao adicionar ao carrinho
- [ ] Carrinho expira após 24 horas de inatividade
- [ ] Cupom de desconto pode ser aplicado no carrinho

---

## REQ-000028 — Checkout do Marketplace

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000028 |
| **DB** | marketplace_orders, marketplace_order_items |
| **Tela** | SCREEN-028 |
| **Teste** | TEST-000028 |
| **Dependências** | REQ-000027, REQ-000007 |

**Descrição:**
Processa o checkout do marketplace integrando com o gateway de pagamento para finalizar a compra.

**Critérios de Aceitação:**
- [ ] Checkout exibe resumo do pedido com valores
- [ ] Coleta endereço de entrega para produtos físicos
- [ ] Coleta CPF/CNPJ para nota fiscal
- [ ] Integração com PIX, cartão de crédito e boleto
- [ ] Confirmação de pedido enviada por e-mail
- [ ] Pedido criado em status pendente até confirmação
- [ ] Usuário pode cancelar pedido antes do processamento

---

## REQ-000029 — Comissões do Marketplace

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000029 |
| **DB** | marketplace_commissions, marketplace_commission_rules |
| **Teste** | TEST-000029 |
| **Dependências** | REQ-000028 |

**Descrição:**
Gerencia as regras de comissão cobradas sobre cada venda realizada no marketplace.

**Critérios de Aceitação:**
- [ ] Comissão pode ser percentual, fixa ou mista
- [ ] Regras de comissão configuráveis por categoria de produto
- [ ] Comissão calculada automaticamente no checkout
- [ ] Relatório de comissões por período
- [ ] Pagamento de comissão agendado para vendedores
- [ ] Histórico de comissões com detalhamento por pedido

---

## REQ-000030 — Painel do Vendedor

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000030 |
| **DB** | marketplace_seller_stats |
| **Tela** | SCREEN-030 |
| **Teste** | TEST-000030 |
| **Dependências** | REQ-000026 |

**Descrição:**
Painel dedicado para vendedores gerenciarem seus produtos, vendas, comissões e métricas.

**Critérios de Aceitação:**
- [ ] Visão geral de vendas (faturamento, pedidos, ticket médio)
- [ ] Gerenciamento de produtos (CRUD completo)
- [ ] Histórico de pedidos recebidos com status
- [ ] Relatório de comissões a receber
- [ ] Notificações de novas vendas em tempo real
- [ ] Avaliações recebidas dos compradores

---

## REQ-000031 — Categorias de Produtos

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000031 |
| **DB** | marketplace_categories |
| **Tela** | SCREEN-031 |
| **Teste** | TEST-000031 |
| **Dependências** | REQ-000026 |

**Descrição:**
Estrutura hierárquica de categorias para organizar e filtrar produtos no marketplace.

**Critérios de Aceitação:**
- [ ] Categorias com hierarquia (pai/filho) até 3 níveis
- [ ] Produto pode pertencer a múltiplas categorias
- [ ] Navegação por categorias na vitrine
- [ ] Filtro por categoria nos resultados de busca
- [ ] Categorias configuráveis por organização
- [ ] Imagem e descrição por categoria

---

## REQ-000032 — Avaliações de Produtos

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000032 |
| **DB** | marketplace_reviews |
| **Tela** | SCREEN-032 |
| **Teste** | TEST-000032 |
| **Dependências** | REQ-000028 |

**Descrição:**
Permite que compradores avaliem e comentem sobre produtos adquiridos no marketplace.

**Critérios de Aceitação:**
- [ ] Avaliação com nota de 1 a 5 estrelas
- [ ] Comentário escrito opcional
- [ ] Upload de foto do produto na avaliação
- [ ] Avaliação vinculada ao pedido confirmado
- [ ] Vendedor pode responder avaliações
- [ ] Média de avaliações exibida na página do produto
- [ ] Denúncia de avaliação imprópria

---

## REQ-000033 — Produtos Digitais (Download)

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000033 |
| **DB** | marketplace_digital_assets |
| **Teste** | TEST-000033 |
| **Dependências** | REQ-000028 |

**Descrição:**
Gerencia a entrega de produtos digitais como PDFs, vídeos, softwares e outros arquivos para download.

**Critérios de Aceitação:**
- [ ] Upload de arquivos de até 2GB por produto
- [ ] Link de download gerado após confirmação de pagamento
- [ ] Link expira após 7 dias ou 5 downloads
- [ ] Múltiplos arquivos por produto
- [ ] Proteção contra compartilhamento não autorizado
- [ ] Histórico de downloads do comprador

---

## REQ-000034 — Produtos por Assinatura

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000034 |
| **DB** | marketplace_subscription_products |
| **Teste** | TEST-000034 |
| **Dependências** | REQ-000026, REQ-000051 |

**Descrição:**
Permite que vendedores ofereçam produtos no modelo de assinatura recorrente.

**Critérios de Aceitação:**
- [ ] Produto pode ser configurado como assinatura mensal/trimestral/anual
- [ ] Cobrança recorrente automática
- [ ] Período de teste gratuito configurável
- [ ] Cancelamento de assinatura pelo comprador
- [ ] Notificação de renovação com 7 dias de antecedência
- [ ] Histórico de pagamentos da assinatura

---

## REQ-000035 — Sistema de Afiliados

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000035 |
| **DB** | marketplace_affiliates, marketplace_affiliate_links, marketplace_affiliate_commissions |
| **Tela** | SCREEN-035 |
| **Teste** | TEST-000035 |
| **Dependências** | REQ-000028 |

**Descrição:**
Sistema de afiliados onde usuários podem divulgar produtos e ganhar comissão por vendas realizadas através de seus links.

**Critérios de Aceitação:**
- [ ] Usuário pode se cadastrar como afiliado
- [ ] Link de afiliado único gerado por produto
- [ ] Cookie de rastreamento com duração de 30 dias
- [ ] Comissão configurável por produto ou categoria
- [ ] Painel do afiliado com métricas de desempenho
- [ ] Saque de comissões com valor mínimo configurável
- [ ] Relatório de conversão por link de afiliado

---

## REQ-000036 — Fóruns de Discussão

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000036 |
| **DB** | community_forums |
| **Tela** | SCREEN-036 |
| **Teste** | TEST-000036 |
| **Dependências** | REQ-000004 |

**Descrição:**
Cria fóruns de discussão por evento para que participantes possam interagir antes, durante e após o evento.

**Critérios de Aceitação:**
- [ ] Organizador pode criar múltiplos fóruns por evento
- [ ] Fórum possui nome, descrição e categoria
- [ ] Fórum pode ser público ou privado
- [ ] Moderadores podem ser designados por fórum
- [ ] Ordenação por data da última atividade
- [ ] Busca dentro do fórum
- [ ] Fórum pode ser arquivado após o evento

---

## REQ-000037 — Tópicos e Respostas

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000037 |
| **DB** | community_topics, community_posts |
| **Tela** | SCREEN-037 |
| **Teste** | TEST-000037 |
| **Dependências** | REQ-000036 |

**Descrição:**
Gerencia a criação de tópicos e postagens dentro dos fóruns da comunidade.

**Critérios de Aceitação:**
- [ ] Usuário pode criar tópico com título e conteúdo
- [ ] Suporte a markdown e upload de imagens
- [ ] Respostas em formato de discussão encadeada
- [ ] Votação positiva/negativa em posts
- [ ] Melhor resposta pode ser marcada pelo autor
- [ ] Notificação de novas respostas para seguidores do tópico
- [ ] Tópico pode ser fixado pelo moderador

---

## REQ-000038 — Grupos da Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000038 |
| **DB** | community_groups, community_group_members |
| **Tela** | SCREEN-038 |
| **Teste** | TEST-000038 |
| **Dependências** | REQ-000004 |

**Descrição:**
Permite a criação de grupos dentro da comunidade para discussões segmentadas por interesse.

**Critérios de Aceitação:**
- [ ] Usuário pode criar grupo público ou privado
- [ ] Grupo privado requer aprovação de ingresso
- [ ] Grupo possui mural de postagens exclusivo
- [ ] Membro pode sair ou ser removido do grupo
- [ ] Notificação de atividade no grupo
- [ ] Grupo pode ter até 3 moderadores
- [ ] Grupos aparecem na busca da comunidade

---

## REQ-000039 — Eventos da Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000039 |
| **DB** | community_events, community_event_attendees |
| **Tela** | SCREEN-039 |
| **Teste** | TEST-000039 |
| **Dependências** | REQ-000038 |

**Descrição:**
Permite que membros da comunidade criem e participem de encontros e eventos paralelos.

**Critérios de Aceitação:**
- [ ] Membro pode criar evento com data, local e descrição
- [ ] Limite de participantes configurável
- [ ] Confirmação de presença (RSVP)
- [ ] Evento aparece no calendário da comunidade
- [ ] Notificação de lembrete enviada 24h antes
- [ ] Organizador pode cancelar evento
- [ ] Eventos passados são arquivados automaticamente

---

## REQ-000040 — Mensagens Privadas

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000040 |
| **DB** | community_messages, community_conversations |
| **Tela** | SCREEN-040 |
| **Teste** | TEST-000040 |
| **Dependências** | REQ-000001 |

**Descrição:**
Sistema de mensagens privadas entre usuários da plataforma.

**Critérios de Aceitação:**
- [ ] Usuário pode enviar mensagem direta para outro usuário
- [ ] Conversas agrupadas em lista de threads
- [ ] Indicador de mensagem lida/não lida
- [ ] Notificação de nova mensagem
- [ ] Bloqueio de usuário para evitar contato
- [ ] Histórico de conversas preservado
- [ ] Upload de arquivos e imagens nas mensagens

---

## REQ-000041 — Sistema de Notificações da Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000041 |
| **DB** | community_notifications |
| **Teste** | TEST-000041 |
| **Dependências** | REQ-000036, REQ-000080 |

**Descrição:**
Centraliza notificações de atividades da comunidade como respostas, convites e menções.

**Critérios de Aceitação:**
- [ ] Notificação gerada para resposta em tópico seguido
- [ ] Notificação para convite de grupo
- [ ] Notificação para menção com @username
- [ ] Notificação para novo evento da comunidade
- [ ] Central de notificações com filtro por tipo
- [ ] Marcador de lidas e não lidas
- [ ] Preferências de notificação por canal (e-mail, push, in-app)

---

## REQ-000042 — Moderação da Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000042 |
| **DB** | community_moderation_log, community_reports |
| **Tela** | SCREEN-042 |
| **Teste** | TEST-000042 |
| **Dependências** | REQ-000036 |

**Descrição:**
Ferramentas de moderação para manter a qualidade das interações na comunidade.

**Critérios de Aceitação:**
- [ ] Usuário pode denunciar conteúdo impróprio
- [ ] Moderador pode remover tópicos e posts
- [ ] Moderador pode banir usuário temporariamente
- [ ] Histórico de ações de moderação auditado
- [ ] Fila de denúncias para revisão
- [ ] Palavras proibidas configuráveis por organização
- [ ] Ação automática para usuários reincidentes

---

## REQ-000043 — Gerenciamento de Cursos

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000043 |
| **DB** | academy_courses |
| **Tela** | SCREEN-043 |
| **Teste** | TEST-000043 |
| **Dependências** | REQ-000001 |

**Descrição:**
Permite que instrutores criem e gerenciem cursos completos dentro da plataforma.

**Critérios de Aceitação:**
- [ ] Curso possui título, descrição, categoria, imagem de capa e preço
- [ ] Curso pode ser gratuito ou pago
- [ ] Curso pode ser rascunho, publicado ou arquivado
- [ ] Múltiplos instrutores por curso
- [ ] Carga horária total calculada automaticamente
- [ ] Nível de dificuldade (iniciante, intermediário, avançado)
- [ ] Curso pode ter certificado de conclusão

---

## REQ-000044 — Lições e Módulos

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000044 |
| **DB** | academy_modules, academy_lessons |
| **Tela** | SCREEN-044 |
| **Teste** | TEST-000044 |
| **Dependências** | REQ-000043 |

**Descrição:**
Estrutura os cursos em módulos e lições com suporte a diversos tipos de conteúdo.

**Critérios de Aceitação:**
- [ ] Curso dividido em módulos com ordem definida
- [ ] Cada módulo contém múltiplas lições
- [ ] Lição pode ser vídeo, texto, PDF, quiz ou áudio
- [ ] Vídeo suporta streaming com HLS
- [ ] Progresso do aluno salvo automaticamente
- [ ] Lição pode ser liberada condicionalmente (pré-requisito)
- [ ] Duração estimada por lição

---

## REQ-000045 — Progresso do Aluno

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000045 |
| **DB** | academy_enrollments, academy_lesson_progress |
| **Tela** | SCREEN-045 |
| **Teste** | TEST-000045 |
| **Dependências** | REQ-000044 |

**Descrição:**
Rastreia o progresso individual de cada aluno dentro dos cursos matriculados.

**Critérios de Aceitação:**
- [ ] Progresso percentual calculado por lições concluídas
- [ ] Última lição acessada é salva automagicamente
- [ ] Barra de progresso visível no curso
- [ ] Marcação automática de conclusão ao final do vídeo
- [ ] Conclusão manual para conteúdos de leitura
- [ ] Aluno pode refazer lições concluídas
- [ ] Certificado liberado ao atingir 100%

---

## REQ-000046 — Quizzes e Avaliações

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000046 |
| **DB** | academy_quizzes, academy_quiz_questions, academy_quiz_attempts |
| **Teste** | TEST-000046 |
| **Dependências** | REQ-000044 |

**Descrição:**
Cria quizzes com perguntas de múltipla escolha para avaliar o conhecimento dos alunos.

**Critérios de Aceitação:**
- [ ] Quiz pode ter perguntas de múltipla escolha, verdadeiro/falso e dissertativas
- [ ] Nota mínima configurável para aprovação
- [ ] Tentativas limitadas configuráveis (1-5)
- [ ] Feedback automático por resposta
- [ ] Gabarito visível após conclusão
- [ ] Nota computada no progresso do curso
- [ ] Banco de perguntas reutilizável entre cursos

---

## REQ-000047 — Certificados de Curso

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000047 |
| **DB** | academy_certificates |
| **Teste** | TEST-000047 |
| **Dependências** | REQ-000045, REQ-000111 |

**Descrição:**
Gera certificados de conclusão para alunos que completam todos os requisitos do curso.

**Critérios de Aceitação:**
- [ ] Certificado gerado automaticamente ao concluir o curso
- [ ] Template customizável por curso
- [ ] Nome do aluno, curso, carga horária e data no certificado
- [ ] QR code único para validação
- [ ] Certificado disponível para download em PDF
- [ ] Certificado pode ser compartilhado em redes sociais
- [ ] Instrutor pode revogar certificado em caso de fraude

---

## REQ-000048 — Painel do Instrutor

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000048 |
| **DB** | academy_instructor_stats |
| **Tela** | SCREEN-048 |
| **Teste** | TEST-000048 |
| **Dependências** | REQ-000043 |

**Descrição:**
Painel dedicado para instrutores gerenciarem seus cursos e acompanharem métricas de ensino.

**Critérios de Aceitação:**
- [ ] Visão geral de alunos matriculados e concluintes
- [ ] Taxa de conclusão por curso
- [ ] Avaliações e feedback dos alunos
- [ ] Receita gerada por curso (cursos pagos)
- [ ] Gerenciamento de conteúdo (CRUD de aulas)
- [ ] Responder dúvidas dos alunos
- [ ] Relatório de engajamento por aula

---

## REQ-000049 — Matrícula em Cursos

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000049 |
| **DB** | academy_enrollments |
| **Tela** | SCREEN-049 |
| **Teste** | TEST-000049 |
| **Dependências** | REQ-000043 |

**Descrição:**
Gerencia o processo de matrícula de alunos nos cursos disponíveis na plataforma.

**Critérios de Aceitação:**
- [ ] Aluno pode se matricular em curso gratuito imediatamente
- [ ] Curso pago requer checkout antes da matrícula
- [ ] Matrícula pode ser feita por admin em nome do aluno
- [ ] Data de matrícula e data de conclusão registradas
- [ ] Aluno pode cancelar matrícula
- [ ] Limite de vagas configurável por curso
- [ ] Notificação de boas-vindas enviada ao matricular

---

## REQ-000050 — Avaliação de Cursos

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000050 |
| **DB** | academy_course_ratings |
| **Teste** | TEST-000050 |
| **Dependências** | REQ-000043 |

**Descrição:**
Permite que alunos avaliem e comentem sobre os cursos concluídos.

**Critérios de Aceitação:**
- [ ] Avaliação com nota de 1 a 5 estrelas
- [ ] Comentário escrito obrigatório para notas baixas (=2)
- [ ] Avaliação só pode ser feita após matrícula
- [ ] Média de avaliações exibida na página do curso
- [ ] Instrutor pode responder avaliações publicamente
- [ ] Denúncia de avaliação imprópria
- [ ] Avaliação pode ser editada uma vez

---

## REQ-000051 — Gerenciamento de Planos de Assinatura

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000051 |
| **DB** | billing_plans |
| **Tela** | SCREEN-051 |
| **Teste** | TEST-000051 |
| **Dependências** | REQ-000001 |

**Descrição:**
Gerencia os planos de assinatura disponíveis para organizações na plataforma.

**Critérios de Aceitação:**
- [ ] Plano possui nome, descrição, preço e ciclo (mensal/anual)
- [ ] Planos com diferentes limites de funcionalidades
- [ ] Plano pode ser Trial, Starter, Professional, Enterprise
- [ ] Período de trial configurável (14, 30 dias)
- [ ] Recursos controlados por feature flags por plano
- [ ] Plano pode ter desconto para ciclo anual
- [ ] Histórico de alterações de plano registrado

---

## REQ-000052 — Geração de Faturas

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000052 |
| **DB** | billing_invoices, billing_invoice_items |
| **Teste** | TEST-000052 |
| **Dependências** | REQ-000051, REQ-000007 |

**Descrição:**
Gera faturas automáticas para cobrança dos planos de assinatura e taxas de plataforma.

**Critérios de Aceitação:**
- [ ] Fatura gerada automaticamente no início de cada ciclo
- [ ] Itens da fatura detalhados (plano, taxas, créditos)
- [ ] Fatura com numeração sequencial única
- [ ] Dados fiscais do contratante na fatura
- [ ] Fatura disponível em PDF para download
- [ ] Fatura enviada por e-mail ao destinatário
- [ ] Fatura cancelada em caso de downgrade com reembolso proporcional

---

## REQ-000053 — Métodos de Pagamento

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000053 |
| **DB** | billing_payment_methods |
| **Tela** | SCREEN-053 |
| **Teste** | TEST-000053 |
| **Dependências** | REQ-000051 |

**Descrição:**
Gerencia os métodos de pagamento cadastrados pelas organizações para cobrança recorrente.

**Critérios de Aceitação:**
- [ ] Cadastro de cartão de crédito com tokenização segura
- [ ] Cadastro de conta bancária para débito automático
- [ ] Método de pagamento padrão definido pelo usuário
- [ ] Múltiplos métodos por organização
- [ ] Validação de cartão com cobrança de teste
- [ ] Notificação de cartão prestes a expirar
- [ ] Método pode ser removido se não estiver em uso

---

## REQ-000054 — Upgrade e Downgrade de Plano

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000054 |
| **DB** | billing_plan_changes |
| **Teste** | TEST-000054 |
| **Dependências** | REQ-000051 |

**Descrição:**
Permite que organizações façam upgrade ou downgrade de seus planos de assinatura.

**Critérios de Aceitação:**
- [ ] Upgrade ativado imediatamente com cobrança proporcional
- [ ] Downgrade agendado para o final do ciclo atual
- [ ] Usuário notificado sobre mudanças de recursos
- [ ] Período de trial não renovável após upgrade
- [ ] Histórico completo de mudanças de plano
- [ ] Downgrade restrito se exceder limites do plano inferior
- [ ] Confirmação requerida para downgrade com perda de recursos

---

## REQ-000055 — Cancelamento de Assinatura

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000055 |
| **DB** | billing_cancellations |
| **Tela** | SCREEN-055 |
| **Teste** | TEST-000055 |
| **Dependências** | REQ-000051 |

**Descrição:**
Gerencia o processo de cancelamento de assinatura com retenção e coleta de feedback.

**Critérios de Aceitação:**
- [ ] Cancelamento requer motivo obrigatório (categoria + texto)
- [ ] Pesquisa de satisfação antes do cancelamento
- [ ] Oferta de desconto para retenção configurável
- [ ] Acesso mantido até final do ciclo atual
- [ ] Dados preservados por 90 dias após cancelamento
- [ ] Reativação possível dentro do período de graça
- [ ] Confirmação por e-mail do cancelamento

---

## REQ-000056 — Medição de Uso (Usage Metering)

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | technical |
| **Módulo** | Billing |
| **API** | API-000056 |
| **DB** | billing_usage_records |
| **Teste** | TEST-000056 |
| **Dependências** | REQ-000051 |

**Descrição:**
Monitora e registra o uso de recursos da plataforma por organização para faturamento baseado em consumo.

**Critérios de Aceitação:**
- [ ] Métricas de uso: eventos criados, participantes, storage, API calls
- [ ] Registro de uso em tempo real
- [ ] Alertas configuráveis ao atingir 80%, 90%, 100% do limite
- [ ] Bloqueio ao exceder limite do plano (configurável)
- [ ] Relatório mensal de uso
- [ ] Uso exibido no painel da organização
- [ ] Dados de uso usados para cálculo de overage

---

## REQ-000057 — Gestão de Créditos

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000057 |
| **DB** | billing_credits, billing_credit_transactions |
| **Teste** | TEST-000057 |
| **Dependências** | REQ-000052 |

**Descrição:**
Sistema de créditos que podem ser aplicados como desconto em faturas futuras.

**Critérios de Aceitação:**
- [ ] Créditos podem ser adicionados manualmente pelo admin
- [ ] Créditos podem ser gerados por indicação de novos clientes
- [ ] Créditos aplicados automaticamente na próxima fatura
- [ ] Créditos expiram após 12 meses
- [ ] Histórico de transações de crédito
- [ ] Saldo de créditos visível no painel
- [ ] Créditos não são reembolsáveis em dinheiro

---

## REQ-000058 — Cálculo de Impostos

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000058 |
| **DB** | billing_tax_rules |
| **Teste** | TEST-000058 |
| **Dependências** | REQ-000052 |

**Descrição:**
Calcula impostos sobre faturas e vendas conforme regras fiscais brasileiras (ISS, PIS, COFINS, CSLL, IRPJ).

**Critérios de Aceitação:**
- [ ] Tabela de alíquotas configurável por município e serviço
- [ ] Cálculo automático de ISS conforme município do prestador
- [ ] Regime tributário do cliente considerado (Simples Nacional, Lucro Presumido, Lucro Real)
- [ ] NFSe gerada quando aplicável
- [ ] Impostos destacados na fatura
- [ ] Relatório fiscal mensal
- [ ] Integração com contadores via exportação de dados

---

## REQ-000059 — Criação de Perfil de Networking

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000059 |
| **DB** | networking_profiles |
| **Tela** | SCREEN-059 |
| **Teste** | TEST-000059 |
| **Dependências** | REQ-000016 |

**Descrição:**
Permite que participantes criem perfis profissionais detalhados para networking dentro dos eventos.

**Critérios de Aceitação:**
- [ ] Perfil com foto, cargo, empresa, biografia e LinkedIn
- [ ] Interesses selecionados a partir de tags do evento
- [ ] Objetivos de networking (conhecer, contratar, ser contratado)
- [ ] Disponibilidade para reuniões (disponível, ocupado, ausente)
- [ ] Perfil visível apenas para participantes do evento
- [ ] Privacidade controlada (visível para todos ou apenas matches)
- [ ] Perfil pode ser desativado temporariamente

---

## REQ-000060 — Matchmaking por IA

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000060 |
| **DB** | networking_matches, networking_match_scores |
| **Teste** | TEST-000060 |
| **Dependências** | REQ-000059 |

**Descrição:**
Algoritmo de IA que sugere matches entre participantes com base em compatibilidade de perfis e interesses.

**Critérios de Aceitação:**
- [ ] IA analisa perfil, interesses, objetivos e histórico
- [ ] Score de compatibilidade exibido (0-100%)
- [ ] Sugestões diárias de novos matches
- [ ] Match recíproco quando ambos aceitam a sugestão
- [ ] Filtros por área de atuação e cargo
- [ ] Match pode ser ignorado ou denunciado
- [ ] Aprendizado contínuo baseado em interações

---

## REQ-000061 — Chat entre Matches

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000061 |
| **DB** | networking_chat_messages, networking_chat_conversations |
| **Tela** | SCREEN-061 |
| **Teste** | TEST-000061 |
| **Dependências** | REQ-000060 |

**Descrição:**
Chat em tempo real entre participantes que deram match, permitindo conversas antes, durante e após o evento.

**Critérios de Aceitação:**
- [ ] Chat habilitado apenas após match recíproco
- [ ] Mensagens em tempo real via WebSocket
- [ ] Indicador de digitando
- [ ] Confirmação de leitura
- [ ] Compartilhamento de arquivos e imagens
- [ ] Bloqueio de usuário
- [ ] Histórico preservado após o evento

---

## REQ-000062 — Videochamadas Integradas

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000062 |
| **DB** | networking_video_calls |
| **Teste** | TEST-000062 |
| **Dependências** | REQ-000061 |

**Descrição:**
Permite que participantes realizem videochamadas diretamente pela plataforma após agendamento mútuo.

**Critérios de Aceitação:**
- [ ] Videochamada com duração máxima de 30 minutos
- [ ] Iniciada apenas com consentimento de ambas as partes
- [ ] Qualidade HD com adaptação de banda
- [ ] Compartilhamento de tela
- [ ] Chat de texto simultâneo na chamada
- [ ] Gravação opcional com aviso a ambos
- [ ] Encerramento automático ao atingir tempo limite

---

## REQ-000063 — Troca de Cartões Virtuais

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000063 |
| **DB** | networking_business_cards, networking_card_exchanges |
| **Tela** | SCREEN-063 |
| **Teste** | TEST-000063 |
| **Dependências** | REQ-000059 |

**Descrição:**
Digital business card exchange entre participantes durante o networking.

**Critérios de Aceitação:**
- [ ] Cartão virtual com dados profissionais do perfil
- [ ] Troca de cartão via QR code scaneado
- [ ] Troca de cartão via aprovação manual
- [ ] Cartões recebidos salvos na galeria do usuário
- [ ] Exportar contatos para CSV/vCard
- [ ] Personalização de layout do cartão
- [ ] Nota pessoal adicionada ao cartão recebido

---

## REQ-000064 — Agendamento de Reuniões

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000064 |
| **DB** | networking_meetings, networking_meeting_slots |
| **Tela** | SCREEN-064 |
| **Teste** | TEST-000064 |
| **Dependências** | REQ-000059 |

**Descrição:**
Sistema de agendamento de reuniões entre participantes com definição de slots disponíveis.

**Critérios de Aceitação:**
- [ ] Participante define slots de disponibilidade
- [ ] Outro participante pode solicitar reunião em slot disponível
- [ ] Reunião confirmada quando ambas as partes aceitam
- [ ] Duração configurável (15, 30, 60 min)
- [ ] Integração com Google Calendar e Outlook
- [ ] Lembrete enviado 30 minutos antes
- [ ] Reunião pode ser cancelada com aviso

---

## REQ-000065 — Histórico de Matches

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000065 |
| **DB** | networking_match_history |
| **Tela** | SCREEN-065 |
| **Teste** | TEST-000065 |
| **Dependências** | REQ-000060 |

**Descrição:**
Histórico completo de matches, conversas e interações de networking do participante.

**Critérios de Aceitação:**
- [ ] Histórico de matches aceitos e rejeitados
- [ ] Registro de conversas anteriores
- [ ] Registro de reuniões realizadas
- [ ] Estatísticas de networking (total de matches, conversas, reuniões)
- [ ] Exportação de contatos do histórico
- [ ] Filtros por evento e data
- [ ] Download do histórico completo

---

## REQ-000066 — Sistema de Pontos

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000066 |
| **DB** | gamification_points, gamification_point_rules |
| **Teste** | TEST-000066 |
| **Dependências** | REQ-000017 |

**Descrição:**
Sistema de pontuação que recompensa usuários por ações realizadas na plataforma.

**Critérios de Aceitação:**
- [ ] Pontos atribuídos por ações: check-in, visita a estande, compartilhamento, avaliação
- [ ] Valor de pontos configurável por ação
- [ ] Saldo de pontos visível no perfil
- [ ] Pontos acumulados por evento e global
- [ ] Histórico de transações de pontos
- [ ] Bônus por ações consecutivas (streak)
- [ ] Pontos expiram após 12 meses

---

## REQ-000067 — Conquistas e Medalhas

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000067 |
| **DB** | gamification_badges, gamification_user_badges |
| **Tela** | SCREEN-067 |
| **Teste** | TEST-000067 |
| **Dependências** | REQ-000066 |

**Descrição:**
Sistema de medalhas e conquistas visuais que os usuários podem desbloquear ao atingir metas específicas.

**Critérios de Aceitação:**
- [ ] Medalhas com nome, ícone, descrição e raridade
- [ ] Medalhas desbloqueadas ao atingir requisitos específicos
- [ ] Medalhas exibidas no perfil do usuário
- [ ] Categorias: participação, engajamento, social, aprendizado
- [ ] Medalhas secretas reveladas apenas ao desbloquear
- [ ] Notificação ao desbloquear nova medalha
- [ ] Compartilhamento de medalhas em redes sociais

---

## REQ-000068 — Ranking e Leaderboard

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000068 |
| **DB** | gamification_leaderboards |
| **Tela** | SCREEN-068 |
| **Teste** | TEST-000068 |
| **Dependências** | REQ-000066 |

**Descrição:**
Leaderboard que classifica os participantes por pontuação em diferentes categorias durante o evento.

**Critérios de Aceitação:**
- [ ] Ranking global e por evento
- [ ] Categorias: pontos totais, check-ins, visitas, social
- [ ] Atualização em tempo real
- [ ] Top 10 destacados com selo especial
- [ ] Posição atual do usuário sempre visível
- [ ] Filtro por período (hoje, semana, evento inteiro)
- [ ] Leaderboard pode ser reiniciado por evento

---

## REQ-000069 — Missões e Desafios

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000069 |
| **DB** | gamification_missions, gamification_user_missions |
| **Tela** | SCREEN-069 |
| **Teste** | TEST-000069 |
| **Dependências** | REQ-000017 |

**Descrição:**
Missões com múltiplas etapas que os usuários completam para ganhar recompensas especiais.

**Critérios de Aceitação:**
- [ ] Missão possui nome, descrição, etapas e recompensa
- [ ] Etapas podem ser sequenciais ou paralelas
- [ ] Missões diárias, semanais e do evento
- [ ] Progresso da missão visível ao usuário
- [ ] Recompensa entregue automaticamente ao completar
- [ ] Missões expiradas são removidas
- [ ] Novas missões podem ser criadas por organizadores

---

## REQ-000070 — Desafios Entre Usuários

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000070 |
| **DB** | gamification_challenges |
| **Teste** | TEST-000070 |
| **Dependências** | REQ-000066 |

**Descrição:**
Desafios onde usuários competem entre si em objetivos específicos dentro da plataforma.

**Critérios de Aceitação:**
- [ ] Usuário pode desafiar outro para competir
- [ ] Desafio aceito inicia competição com prazo
- [ ] Métrica de comparação: pontos, check-ins, visitas
- [ ] Notificação de resultado ao final
- [ ] Vencedor recebe badge exclusivo do desafio
- [ ] Histórico de desafios ganhos/perdidos
- [ ] Limite de desafios simultâneos (3 ativos)

---

## REQ-000071 — Recompensas e Prêmios

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000071 |
| **DB** | gamification_rewards, gamification_reward_redemptions |
| **Tela** | SCREEN-071 |
| **Teste** | TEST-000071 |
| **Dependências** | REQ-000066 |

**Descrição:**s
Loja de recompensas onde usuários podem trocar pontos acumulados por prêmios e benefícios.

**Critérios de Aceitação:**
- [ ] Recompensas com nome, descrição, custo em pontos e quantidade
- [ ] Categorias: descontos, brindes, experiências VIP
- [ ] Resgate de recompensa com confirmação
- [ ] Estoque limitado por recompensa
- [ ] Código de resgate gerado para recompensas físicas
- [ ] Histórico de resgates do usuário
- [ ] Recompensas podem ser patrocinadas por parceiros

---

## REQ-000072 — Sequências (Streaks)

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000072 |
| **DB** | gamification_streaks |
| **Teste** | TEST-000072 |
| **Dependências** | REQ-000066 |

**Descrição:**
Sistema de streaks que bonifica usuários por ações consecutivas em dias seguidos.

**Critérios de Aceitação:**
- [ ] Streak conta dias consecutivos de login/ação
- [ ] Streak perdida se usuário ficar 1 dia sem ação
- [ ] Bônus de pontos progressivo por streak
- [ ] Streaks de 7, 15, 30 dias com badges especiais
- [ ] Notificação de streak em risco (quase perdendo)
- [ ] Reset de streak visível no calendário
- [ ] Streak salvo por evento ou global

---

## REQ-000073 — Gerenciamento de Papéis (Roles)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | IAM |
| **API** | API-000073 |
| **DB** | iam_roles |
| **Tela** | SCREEN-073 |
| **Teste** | TEST-000073 |
| **Dependências** | REQ-000003 |

**Descrição:**
Sistema de gerenciamento de papéis e permissões para controle de acesso na plataforma.

**Critérios de Aceitação:**
- [ ] Papéis predefinidos: owner, admin, manager, staff, viewer
- [ ] Papéis customizáveis por organização
- [ ] Herança de permissões entre papéis
- [ ] Papéis podem ter hierarquia
- [ ] Usuário pode ter múltiplos papéis
- [ ] Papéis aplicados por organização (tenant)
- [ ] Histórico de alterações de papel

---

## REQ-000074 — Políticas de Permissão

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000074 |
| **DB** | iam_policies, iam_policy_rules |
| **Teste** | TEST-000074 |
| **Dependências** | REQ-000073 |

**Descrição:**
Políticas granulares de permissão que definem ações permitidas ou negadas para cada papel.

**Critérios de Aceitação:**
- [ ] Política baseada em recursos, ações e condições
- [ ] Permissões: create, read, update, delete por módulo
- [ ] Negação explícita sobrescreve permissão
- [ ] Políticas avaliadas em tempo real nas requisições
- [ ] Template de políticas por tipo de organização
- [ ] Políticas podem ser clonadas entre organizações
- [ ] Validador de política antes da aplicação

---

## REQ-000075 — SSO (Single Sign-On)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000075 |
| **DB** | iam_sso_configs |
| **Teste** | TEST-000075 |
| **Dependências** | REQ-000002 |

**Descrição:**
Suporte a Single Sign-On via protocolos OAuth2, OpenID Connect e SAML 2.0 para autenticação corporativa.

**Critérios de Aceitação:**
- [ ] Suporte a provedores: Google, Microsoft, Okta, Keycloak
- [ ] Configuração de SSO por organização
- [ ] Mapeamento de atributos do provedor para perfil
- [ ] Provisionamento automático de usuários via SCIM
- [ ] Login obrigatório via SSO (opcional)
- [ ] Certificado SAML configurável
- [ ] Fallback para login local se SSO indisponível

---

## REQ-000076 — Autenticação Multifator (MFA)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000076 |
| **DB** | iam_mfa_devices |
| **Teste** | TEST-000076 |
| **Dependências** | REQ-000002 |

**Descrição:**
Implementa autenticação multifator com suporte a TOTP, SMS e notificação push.

**Critérios de Aceitação:**
- [ ] MFA via TOTP (Google Authenticator, Authy)
- [ ] MFA via SMS com código de 6 dígitos
- [ ] MFA via notificação push (aprovar/rejeitar)
- [ ] Recovery codes para acesso de emergência (10 códigos)
- [ ] MFA obrigatório para papéis de admin
- [ ] Lembrar dispositivo por 30 dias
- [ ] Configuração de MFA no primeiro login

---

## REQ-000077 — Chaves de API

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000077 |
| **DB** | iam_api_keys |
| **Tela** | SCREEN-077 |
| **Teste** | TEST-000077 |
| **Dependências** | REQ-000002 |

**Descrição:**
Gerenciamento de chaves de API para integrações de terceiros com a plataforma.

**Critérios de Aceitação:**
- [ ] Geração de chave API key + secret
- [ ] Chave com escopo de permissões (leitura, escrita, admin)
- [ ] Chave associada a uma organização
- [ ] Data de expiração configurável
- [ ] Rotação de chave forçada a cada 90 dias
- [ ] Revogação imediata de chave comprometida
- [ ] Log de uso por chave de API

---

## REQ-000078 — Auditoria de Acesso

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000078 |
| **DB** | iam_audit_log |
| **Teste** | TEST-000078 |
| **Dependências** | REQ-000019 |

**Descrição:**
Registra todas as atividades relacionadas a autenticação e autorização para fins de auditoria.

**Critérios de Aceitação:**
- [ ] Log de login bem-sucedido e falho (com IP e user-agent)
- [ ] Log de alterações de papel e permissão
- [ ] Log de reset de senha
- [ ] Log de configuração de MFA
- [ ] Log de uso de chave de API
- [ ] Log exportável em CSV
- [ ] Retenção de logs por 5 anos

---

## REQ-000079 — Gerenciamento de Sessões

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000079 |
| **DB** | iam_sessions |
| **Tela** | SCREEN-079 |
| **Teste** | TEST-000079 |
| **Dependências** | REQ-000002 |

**Descrição:**
Gerencia sessões de usuário com suporte a múltiplos dispositivos e revogação remota.

**Critérios de Aceitação:**
- [ ] Lista de sessões ativas por usuário
- [ ] Informação de dispositivo, IP, localização e data
- [ ] Usuário pode revogar sessão remotamente
- [ ] Sessão expirada automaticamente após inatividade
- [ ] Limite de sessões simultâneas configurável
- [ ] Notificação de novo login em dispositivo desconhecido
- [ ] Admin pode revogar sessões de membros da organização

---

## REQ-000080 — Notificações por E-mail

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000080 |
| **DB** | notification_email_queue, notification_email_templates |
| **Teste** | TEST-000080 |
| **Dependências** | REQ-000001 |

**Descrição:**
Sistema de envio de e-mails transacionais e marketing para usuários da plataforma.

**Critérios de Aceitação:**
- [ ] Templates de e-mail customizáveis por organização
- [ ] Filas de envio com prioridade (alta/média/baixa)
- [ ] E-mails transacionais: boas-vindas, confirmação, recuperação de senha
- [ ] E-mails de marketing com agendamento
- [ ] Tracking de abertura e clique
- [ ] Rate limiting por domínio para evitar spam
- [ ] Suporte a SMTP customizado por organização

---

## REQ-000081 — Notificações por WhatsApp

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000081 |
| **DB** | notification_whatsapp_queue |
| **Teste** | TEST-000081 |
| **Dependências** | REQ-000080 |

**Descrição:**
Envio de notificações via WhatsApp Business API para comunicação direta com usuários.

**Critérios de Aceitação:**
- [ ] Templates de mensagem aprovados pelo WhatsApp
- [ ] Envio de notificações: lembrete, confirmação, alerta
- [ ] Suporte a mídia (imagens, PDFs) nas mensagens
- [ ] Status de entrega e leitura rastreados
- [ ] Opt-out por usuário
- [ ] Filas de envio com rate limit
- [ ] Número de WhatsApp configurável por organização

---

## REQ-000082 — Notificações por SMS

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000082 |
| **DB** | notification_sms_queue |
| **Teste** | TEST-000082 |
| **Dependências** | REQ-000080 |

**Descrição:**
Envio de notificações via SMS para comunicação urgente e lembretes críticos.

**Critérios de Aceitação:**
- [ ] Provedores de SMS: Twilio, Vonage, Zenvia
- [ ] Templates de SMS parametrizáveis
- [ ] Envio agendado e imediato
- [ ] Status de entrega rastreado
- [ ] Limite de caracteres por SMS
- [ ] Opt-out por usuário (responder STOP)
- [ ] Relatório de entregas por lote

---

## REQ-000083 — Notificações Push

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000083 |
| **DB** | notification_push_tokens |
| **Teste** | TEST-000083 |
| **Dependências** | REQ-000024 |

**Descrição:**
Notificações push para dispositivos móveis e navegadores (PWA) mantendo usuários engajados.

**Critérios de Aceitação:**
- [ ] Push para PWA via Service Workers
- [ ] Push para apps Android e iOS via Firebase
- [ ] Segmentação por usuário, evento e comportamento
- [ ] Notificações rich com imagem e ação
- [ ] Agendamento de push notificações
- [ ] Status de entrega e interação rastreados
- [ ] Usuário pode opt-out por categoria

---

## REQ-000084 — Notificações In-App

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000084 |
| **DB** | notification_inapp |
| **Tela** | SCREEN-084 |
| **Teste** | TEST-000084 |
| **Dependências** | REQ-000083 |

**Descrição:**
Central de notificações dentro da plataforma com histórico e preferências.

**Critérios de Aceitação:**
- [ ] Notificações exibidas no header da aplicação
- [ ] Categorias: sistema, evento, comunidade, marketing
- [ ] Ação ao clicar na notificação (deep link)
- [ ] Marcar como lida e marcar todas como lidas
- [ ] Histórico de notificações dos últimos 90 dias
- [ ] Preferências de notificação por tipo e canal
- [ ] Badge com contagem de não lidas

---

## REQ-000085 — Templates de Notificação

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000085 |
| **DB** | notification_templates |
| **Teste** | TEST-000085 |
| **Dependências** | REQ-000080 |

**Descrição:**
Sistema de templates centralizados para todas as notificações com suporte a variáveis dinâmicas.

**Critérios de Aceitação:**
- [ ] Templates por canal (e-mail, SMS, WhatsApp, push, in-app)
- [ ] Variáveis dinâmicas {{nome}}, {{evento}}, {{data}}
- [ ] Editor WYSIWYG para templates de e-mail
- [ ] Preview do template antes de salvar
- [ ] Versionamento de templates
- [ ] Templates padrão fornecidos pela plataforma
- [ ] Organização pode criar templates customizados

---

## REQ-000086 — Rastreamento de Entregas

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | technical |
| **Módulo** | Notifications |
| **API** | API-000086 |
| **DB** | notification_delivery_logs |
| **Tela** | SCREEN-086 |
| **Teste** | TEST-000086 |
| **Dependências** | REQ-000080 |

**Descrição:**
Rastreia o status de entrega de todas as notificações enviadas pela plataforma.

**Critérios de Aceitação:**
- [ ] Status: enviado, entregue, lido, falhou, bounce
- [ ] Log detalhado com timestamp e mensagem de erro
- [ ] Tentativas de reenvio automáticas (3 tentativas)
- [ ] Dashboard de taxas de entrega por canal
- [ ] Alerta de taxa de bounce acima de 5%
- [ ] Lista de supressão para e-mails com bounce
- [ ] Relatório de entregas exportável

---

## REQ-000087 — Busca Full-Text

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Search |
| **API** | API-000087 |
| **DB** | Elasticsearch |
| **Teste** | TEST-000087 |
| **Dependências** | REQ-000015 |

**Descrição:**
Motor de busca full-text que indexa e permite pesquisa em todos os conteúdos da plataforma.

**Critérios de Aceitação:**
- [ ] Indexação de eventos, produtos, cursos, usuários, fóruns
- [ ] Busca por palavras-chave com relevância
- [ ] Resultados ordenados por score de relevância
- [ ] Highlight dos termos buscados
- [ ] Busca com tolerância a erros de digitação (fuzzy)
- [ ] Pesquisa booleana (AND, OR, NOT)
- [ ] Busca em múltiplos idiomas com stemmers

---

## REQ-000088 — Busca Facetada

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Search |
| **API** | API-000088 |
| **DB** | Elasticsearch |
| **Tela** | SCREEN-088 |
| **Teste** | TEST-000088 |
| **Dependências** | REQ-000087 |

**Descrição:**
Filtros facetados que permitem refinar resultados de busca por múltiplas dimensões simultaneamente.

**Critérios de Aceitação:**
- [ ] Facetas: categoria, tipo, data, preço, localização
- [ ] Contagem de resultados por faceta
- [ ] Múltiplos filtros ativos simultaneamente
- [ ] Limpar filtros individualmente ou todos
- [ ] Facetas dinâmicas baseadas nos resultados
- [ ] Range de preço e data como faceta
- [ ] Facetas persistentes na URL para compartilhamento

---

## REQ-000089 — Autocomplete e Sugestões

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Search |
| **API** | API-000089 |
| **DB** | Elasticsearch |
| **Tela** | SCREEN-089 |
| **Teste** | TEST-000089 |
| **Dependências** | REQ-000087 |

**Descrição:**
Sugestões automáticas enquanto o usuário digita na barra de busca.

**Critérios de Aceitação:**
- [ ] Sugestões exibidas após 3 caracteres digitados
- [ ] Sugestões baseadas em termos populares e relevantes
- [ ] Agrupamento por tipo de entidade (eventos, produtos, pessoas)
- [ ] Máximo de 10 sugestões exibidas
- [ ] Cache de sugestões para performance
- [ ] Sugestões com highlight do termo digitado
- [ ] Correção ortográfica nas sugestões

---

## REQ-000090 — Analytics de Busca

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Search |
| **API** | API-000090 |
| **DB** | search_analytics |
| **Tela** | SCREEN-090 |
| **Teste** | TEST-000090 |
| **Dependências** | REQ-000087 |

**Descrição:**
Analytics dos termos de busca mais utilizados para otimização de conteúdo e descoberta.

**Critérios de Aceitação:**
- [ ] Top termos de busca por período
- [ ] Termos sem resultados (zero results)
- [ ] Taxa de clique por termo
- [ ] Tendências de busca ao longo do tempo
- [ ] Segmentação por módulo e organização
- [ ] Relatório exportável em CSV
- [ ] Sugestão de sinônimos baseada em dados de busca

---

## REQ-000091 — Gerenciamento de Índices

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | technical |
| **Módulo** | Search |
| **API** | API-000091 |
| **DB** | Elasticsearch |
| **Teste** | TEST-000091 |
| **Dependências** | REQ-000087 |

**Descrição:**
Gerenciamento dos índices de busca com controle de esquemas, reindexação e diagnósticos.

**Critérios de Aceitação:**
- [ ] Reindexação manual e automática de entidades
- [ ] Progresso de reindexação exibido em tempo real
- [ ] Versionamento de mapeamento de índices
- [ ] Rollback de índice em caso de falha
- [ ] Monitoramento de saúde do cluster de busca
- [ ] Agendamento de reindexação periódica
- [ ] Alertas de índice corrompido ou fora de sincronia

---

## REQ-000092 — Busca Multilíngue

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Search |
| **API** | API-000092 |
| **DB** | Elasticsearch |
| **Teste** | TEST-000092 |
| **Dependências** | REQ-000087, REQ-000020 |

**Descrição:**
Motor de busca com suporte a múltiplos idiomas incluindo análise morfológica e stemmers.

**Critérios de Aceitação:**
- [ ] Idiomas suportados: português, inglês, espanhol
- [ ] Stemmer específico por idioma (português: Snowball)
- [ ] Detecção automática do idioma do termo
- [ ] Busca em um idioma retorna resultados naquele idioma
- [ ] Sinônimos configuráveis por idioma
- [ ] Suporte a caracteres acentuados (português)
- [ ] Resultados priorizam o idioma do usuário

---

## REQ-000093 — Cadastro Facial (Enrollment)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Face Recognition |
| **API** | API-000093 |
| **DB** | face_enrollments |
| **Teste** | TEST-000093 |
| **Dependências** | REQ-000008 |

**Descrição:**
Captura e armazena templates faciais dos participantes para uso em verificações durante o evento.

**Critérios de Aceitação:**
- [ ] Captura de múltiplas fotos do rosto (3 a 5 ângulos)
- [ ] Qualidade mínima da imagem validada (iluminação, nitidez)
- [ ] Template facial extraído e armazenado de forma segura
- [ ] Cadastro pode ser feito presencial ou via upload
- [ ] Consentimento LGPD coletado antes do cadastro
- [ ] Template armazenado em formato hash não reversível
- [ ] Prazo de retenção configurável e auto-exclusão

---

## REQ-000094 — Verificação Facial (Match 1:1)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Face Recognition |
| **API** | API-000094 |
| **DB** | face_verification_logs |
| **Teste** | TEST-000094 |
| **Dependências** | REQ-000093 |

**Descrição:**
Verifica se a foto capturada ao vivo corresponde ao template facial cadastrado do participante.

**Critérios de Aceitação:**
- [ ] Comparação 1:1 entre foto viva e template cadastrado
- [ ] Threshold de similaridade configurável (padrão 85%)
- [ ] Resultado em menos de 2 segundos
- [ ] Fallback para verificação manual se similaridade baixa
- [ ] Registro de todas as tentativas (sucesso e falha)
- [ ] Máximo de 3 tentativas antes de bloquear para revisão
- [ ] Log com foto da tentativa para auditoria

---

## REQ-000095 — Detecção de Vida (Liveness)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | Face Recognition |
| **API** | API-000095 |
| **DB** | face_liveness_logs |
| **Teste** | TEST-000095 |
| **Dependências** | REQ-000093 |

**Descrição:**
Detecta se a pessoa está viva e presente no momento da captura, prevenindo fraudes com fotos ou vídeos.

**Critérios de Aceitação:**
- [ ] Detecção de vida ativa (piscar, sorrir, virar cabeça)
- [ ] Detecção de vida passiva (análise de textura e profundidade)
- [ ] Tempo de detecção inferior a 3 segundos
- [ ] Rejeição de foto impressa, tela de celular e máscara
- [ ] Score de liveness retornado com a verificação
- [ ] 3 tentativas antes de falhar
- [ ] Modo de teste para eventos sem requisito de segurança

---

## REQ-000096 — Busca Facial (1:N)

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Face Recognition |
| **API** | API-000096 |
| **DB** | face_search_logs |
| **Teste** | TEST-000096 |
| **Dependências** | REQ-000093 |

**Descrição:**
Busca uma face capturada contra a base de participantes cadastrados para identificação.

**Critérios de Aceitação:**
- [ ] Busca 1:N em até 500.000 faces
- [ ] Resultado em menos de 5 segundos
- [ ] Top 5 resultados com score de similaridade
- [ ] Usado para check-in sem documento
- [ ] Usado para localizar participantes lost & found
- [ ] Threshold mínimo de 70% para resultados
- [ ] Log de todas as buscas para auditoria

---

## REQ-000097 — Fallback de Reconhecimento Facial

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Face Recognition |
| **API** | API-000097 |
| **DB** | face_fallback_logs |
| **Teste** | TEST-000097 |
| **Dependências** | REQ-000094 |

**Descrição:**
Mecanismo de fallback quando o reconhecimento facial não consegue identificar o participante.

**Critérios de Aceitação:**
- [ ] Fallback para verificação manual por operador
- [ ] Operador vê foto cadastrada e compara visualmente
- [ ] Operador pode aprovar ou recusar manualmente
- [ ] Fallback registrado em log com identificação do operador
- [ ] Notificação ao supervisor se múltiplos fallbacks no mesmo dia
- [ ] Fallback requer senha do operador para aprovação
- [ ] Fallbacks mensais reportados para auditoria

---

## REQ-000098 — Privacidade de Dados Biométricos

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | Face Recognition |
| **API** | API-000098 |
| **DB** | face_privacy_logs |
| **Teste** | TEST-000098 |
| **Dependências** | REQ-000093, REQ-000117 |

**Descrição:**
Garante que dados biométricos sejam armazenados e processados com segurança e em conformidade com a LGPD.

**Critérios de Aceitação:**
- [ ] Templates faciais armazenados em formato hash (não reversível)
- [ ] Criptografia AES-256 dos templates em repouso
- [ ] Consentimento explícito coletado antes do cadastro
- [ ] Prazo de retenção máximo configurável (padrão 30 dias)
- [ ] Exclusão automática após o prazo de retenção
- [ ] Dados biométricos armazenados separados dos dados pessoais
- [ ] Acesso restrito a operadores autorizados com 2FA

---

## REQ-000099 — Domínio Customizado

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000099 |
| **DB** | whitelabel_domains |
| **Tela** | SCREEN-099 |
| **Teste** | TEST-000099 |
| **Dependências** | REQ-000021 |

**Descrição:**
Permite que organizações utilizem domínio próprio para o portal e páginas de evento.

**Critérios de Aceitação:**
- [ ] Configuração de domínio customizado via CNAME
- [ ] Certificado SSL automático via Let's Encrypt
- [ ] Domínio verificado antes da ativação
- [ ] Redirecionamento de domínio principal para www
- [ ] Múltiplos domínios por organização
- [ ] Páginas de erro 404 customizadas
- [ ] Health check do domínio com alerta de SSL expirando

---

## REQ-000100 — Identidade Visual Customizada

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000100 |
| **DB** | whitelabel_branding |
| **Tela** | SCREEN-100 |
| **Teste** | TEST-000100 |
| **Dependências** | REQ-000021 |

**Descrição:**
Customização completa da identidade visual da plataforma para cada organização.

**Critérios de Aceitação:**
- [ ] Logo da organização (header, favicon, login)
- [ ] Paleta de cores principal e secundária
- [ ] Fonte tipográfica customizada
- [ ] Imagem de fundo do login
- [ ] Preview ao vivo das alterações
- [ ] Reset para tema padrão
- [ ] Identidade visual aplicada em e-mails e certificados

---

## REQ-000101 — CSS Customizado

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000101 |
| **DB** | whitelabel_custom_css |
| **Teste** | TEST-000101 |
| **Dependências** | REQ-000100 |

**Descrição:**
Permite que organizações injetem CSS customizado para personalização avançada da interface.

**Critérios de Aceitação:**
- [ ] Editor de CSS com syntax highlighting
- [ ] Preview ao vivo das alterações CSS
- [ ] CSS scoped por organização (sem vazamento entre tenants)
- [ ] Validação de CSS malicioso (sanitização automática)
- [ ] Versionamento com rollback
- [ ] Tema claro e escuro customizáveis
- [ ] Modo de inspeção para identificar seletores

---

## REQ-000102 — Templates de E-mail Customizados

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000102 |
| **DB** | whitelabel_email_templates |
| **Teste** | TEST-000102 |
| **Dependências** | REQ-000085 |

**Descrição:**
Permite que organizações customizem todos os templates de e-mail com sua identidade visual.

**Critérios de Aceitação:**
- [ ] Header e footer com logo e cores da organização
- [ ] Templates HTML editáveis com preview
- [ ] Variáveis dinâmicas disponíveis nos templates
- [ ] Template responsivo para mobile
- [ ] Teste de envio para validar aparência
- [ ] Templates padrão fornecidos como base
- [ ] Fallback para template padrão se customização ausente

---

## REQ-000103 — Aplicativo White Label

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000103 |
| **DB** | whitelabel_app_configs |
| **Teste** | TEST-000103 |
| **Dependências** | REQ-000024 |

**Descrição:**
Gera aplicativo móvel customizado com a marca da organização para distribuição nas lojas.

**Critérios de Aceitação:**
- [ ] App com logo, nome e cores da organização
- [ ] Geração de APK/IPA via CI/CD automatizado
- [ ] Push notifications com nome da organização
- [ ] Splash screen customizada
- [ ] Deep links com domínio da organização
- [ ] Publicação assistida na App Store e Google Play
- [ ] Atualização OTA (over-the-air) para correções

---

## REQ-000104 — Feature Flags por Organização

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | technical |
| **Módulo** | White Label |
| **API** | API-000104 |
| **DB** | whitelabel_feature_flags |
| **Teste** | TEST-000104 |
| **Dependências** | REQ-000023 |

**Descrição:**
Gerencia quais funcionalidades estão disponíveis para cada organização de forma granular.

**Critérios de Aceitação:**
- [ ] Ativar/desativar funcionalidades por organização
- [ ] Flags agrupadas por módulo
- [ ] Programa de beta testers com flags específicas
- [ ] Rollout gradual por percentual de usuários
- [ ] Calendário de ativação programada
- [ ] Relatório de uso por flag
- [ ] Log de alterações de flag com auditoria

---

## REQ-000105 — Integração com Catracas (Gate)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000105 |
| **DB** | acs_gates |
| **Teste** | TEST-000105 |
| **Dependências** | REQ-000008 |

**Descrição:**
Integração com catracas e gates físicos para controle automatizado de acesso a eventos.

**Critérios de Aceitação:**
- [ ] Gate registrado com nome, localização e tipo
- [ ] Gate comunica via API REST ou WebSocket
- [ ] Check-in enviado ao gate libera a catraca
- [ ] Gate pode operar modo entrada e saída
- [ ] Status do gate monitorado (online/offline)
- [ ] Comando remoto para liberar/bloquear gate
- [ ] Log de todas as requisições ao gate

---

## REQ-000106 — Controle de Acesso com Torniquete

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000106 |
| **DB** | acs_turnstile_events |
| **Teste** | TEST-000106 |
| **Dependências** | REQ-000105 |

**Descrição:**
Controle de acesso via torniquetes com validação de credenciais em tempo real.

**Critérios de Aceitação:**
- [ ] Leitura de QR code no visor do torniquete
- [ ] Validação online do ticket antes de liberar
- [ ] Liberação em menos de 500ms
- [ ] Contagem de pessoas por direção (entrada/saída)
- [ ] Modo de contingência offline com cache local
- [ ] Alerta sonoro e visual para acesso negado
- [ ] Sincronização de dados offline quando online

---

## REQ-000107 — Controle com RFID

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000107 |
| **DB** | acs_rfid_tags, acs_rfid_reads |
| **Teste** | TEST-000107 |
| **Dependências** | REQ-000008 |

**Descrição:**
Controle de acesso utilizando tags RFID para pulseiras e crachás.

**Critérios de Aceitação:**
- [ ] Tag RFID associada ao ticket do participante
- [ ] Leitura por aproximação (até 10cm)
- [ ] Múltiplas leituras por tag evitadas (anti-passback)
- [ ] Leitura em movimento (até 30 pessoas/minuto)
- [ ] Tag reutilizável para múltiplos dias
- [ ] Desativação remota de tag perdida
- [ ] Integração com sistema de catraca

---

## REQ-000108 — Controle com NFC

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000108 |
| **DB** | acs_nfc_reads |
| **Teste** | TEST-000108 |
| **Dependências** | REQ-000008 |

**Descrição:**
Permite check-in por aproximação de smartphone ou crachá com NFC.

**Critérios de Aceitação:**
- [ ] Leitura NFC de smartphone (Android e iOS)
- [ ] Leitura NFC de crachá com tag
- [ ] Dados criptografados na tag NFC
- [ ] Validação online em menos de 1 segundo
- [ ] Modo offline com validação por assinatura digital
- [ ] Prevenção de clonagem de tag
- [ ] Histórico de leituras NFC

---

## REQ-000109 — Modo Offline Completo

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | technical |
| **Módulo** | Access Control |
| **API** | API-000109 |
| **DB** | acs_offline_batches |
| **Teste** | TEST-000109 |
| **Dependências** | REQ-000009 |

**Descrição:**
Modo offline completo que permite operação normal de check-in mesmo sem conexão com a internet.

**Critérios de Aceitação:**
- [ ] Dados de participantes sincronizados antes do evento
- [ ] Check-in validado localmente contra cache
- [ ] Check-ins armazenados em fila local
- [ ] Sincronização automática quando conexão restaurada
- [ ] Resolução de conflito (timestamp do servidor vence)
- [ ] Indicador de modo offline no dispositivo
- [ ] Capacidade mínima de 50.000 registros offline

---

## REQ-000110 — Override de Emergência

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000110 |
| **DB** | acs_emergency_overrides |
| **Teste** | TEST-000110 |
| **Dependências** | REQ-000105 |

**Descrição:**
Mecanismo de override manual para situações de emergência que exigem liberação geral de acesso.

**Critérios de Aceitação:**
- [ ] Override ativado por operador autorizado com PIN
- [ ] Override libera todas as catracas do setor
- [ ] Registro em log: quem, quando, motivo
- [ ] Notificação de emergência para coordenador do evento
- [ ] Override revertido automaticamente após tempo configurável
- [ ] Override geral disponível para evacuação
- [ ] Relatório pós-evento de overrides utilizados

---

## REQ-000111 — Gerenciamento de Templates de Certificado

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Certificates |
| **API** | API-000111 |
| **DB** | certificate_templates |
| **Tela** | SCREEN-111 |
| **Teste** | TEST-000111 |
| **Dependências** | REQ-000014 |

**Descrição:**
Sistema de templates para certificados com layout configurável e elementos dinâmicos.

**Critérios de Aceitação:**
- [ ] Template com fundo personalizável (imagem ou cor)
- [ ] Posicionamento livre de textos e imagens
- [ ] Campos dinâmicos: nome, curso, data, carga horária
- [ ] QR code posicionável no template
- [ ] Variações por tipo de certificado (participação, palestra, curso)
- [ ] Preview do template com dados de teste
- [ ] Template duplicável entre organizações

---

## REQ-000112 — Geração em Lote de Certificados

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Certificates |
| **API** | API-000112 |
| **DB** | certificate_batch_jobs |
| **Tela** | SCREEN-112 |
| **Teste** | TEST-000112 |
| **Dependências** | REQ-000111 |

**Descrição:**
Geração de certificados em lote para todos os participantes de um evento ou curso.

**Critérios de Aceitação:**
- [ ] Seleção de participantes por critérios (check-in, presença mínima)
- [ ] Geração assíncrona com barra de progresso
- [ ] Notificação ao final da geração
- [ ] Download em PDF individual ou ZIP compactado
- [ ] Limite de 10.000 certificados por lote
- [ ] Fila de jobs com prioridade
- [ ] Log de erros por certificado não gerado

---

## REQ-000113 — Validação por QR Code

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Certificates |
| **API** | API-000113 |
| **DB** | certificate_validation_logs |
| **Teste** | TEST-000113 |
| **Dependências** | REQ-000111 |

**Descrição:**
QR Code único em cada certificado que permite validação pública de autenticidade.

**Critérios de Aceitação:**
- [ ] QR code com hash único e não previsível
- [ ] Página pública de validação (sem login)
- [ ] Validação exibe: nome, curso, data, organização
- [ ] QR code inválido ou adulterado exibe alerta
- [ ] Certificado revogado exibe status "cancelado"
- [ ] QR code escaneável por qualquer leitor
- [ ] Log de validações com IP e data

---

## REQ-000114 — Verificação Blockchain

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | technical |
| **Módulo** | Certificates |
| **API** | API-000114 |
| **DB** | certificate_blockchain_records |
| **Teste** | TEST-000114 |
| **Dependências** | REQ-000113 |

**Descrição:**
Registra hash dos certificados em blockchain para garantir imutabilidade e autenticidade.

**Critérios de Aceitação:**
- [ ] Hash do certificado registrado em rede blockchain
- [ ] Suporte a Ethereum, Polygon ou rede permissionada
- [ ] Transação blockchain com custo mínimo (gas)
- [ ] Verificação pública via explorer blockchain
- [ ] Batch de certificados em uma única transação
- [ ] Retry automático em caso de falha na transação
- [ ] Certificado revogado registrado como nova transação

---

## REQ-000115 — Assinatura Digital (ICP-Brasil)

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | security |
| **Módulo** | Certificates |
| **API** | API-000115 |
| **DB** | certificate_digital_signatures |
| **Teste** | TEST-000115 |
| **Dependências** | REQ-000111 |

**Descrição:**
Assinatura digital dos certificados em conformidade com ICP-Brasil para validade jurídica.

**Critérios de Aceitação:**
- [ ] Assinatura digital com certificado A1 ou A3
- [ ] PDF assinado com padrão PAdES
- [ ] Validação da assinatura via Adobe Reader
- [ ] Carimbo de tempo (timestamp) na assinatura
- [ ] Múltiplas assinaturas (organizador + plataforma)
- [ ] Certificado digital armazenado com segurança
- [ ] Renovação automática de certificado expirado

---

## REQ-000116 — Página Pública de Validação

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Certificates |
| **API** | API-000116 |
| **Tela** | SCREEN-116 |
| **Teste** | TEST-000116 |
| **Dependências** | REQ-000113 |

**Descrição:**
Página pública onde qualquer pessoa pode validar a autenticidade de um certificado usando o QR code.

**Critérios de Aceitação:**
- [ ] URL pública de validação (/validar/{hash})
- [ ] Exibe dados do certificado de forma clara
- [ ] Design responsivo para mobile
- [ ] Selo visual de "válido", "inválido" ou "cancelado"
- [ ] Exibe logo da organização emissora
- [ ] Opção de compartilhar validação
- [ ] API pública de validação para integração

---

## REQ-000117 — Gerenciamento de Consentimentos LGPD

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | LGPD |
| **API** | API-000117 |
| **DB** | lgpd_consents, lgpd_consent_logs |
| **Tela** | SCREEN-117 |
| **Teste** | TEST-000117 |
| **Dependências** | REQ-000018 |

**Descrição:**
Sistema centralizado de gestão de consentimentos para coleta e tratamento de dados pessoais.

**Critérios de Aceitação:**
- [ ] Consentimento coletado com finalidade específica (marketing, analytics, biometria)
- [ ] Registro de consentimento com timestamp, IP e user-agent
- [ ] Revogação de consentimento a qualquer momento pelo usuário
- [ ] Consentimento granular por tipo de tratamento
- [ ] Prova de consentimento armazenada para auditoria
- [ ] Consentimento renovado a cada 12 meses
- [ ] Usuário menor de idade requer consentimento do responsável

---

## REQ-000118 — Exportação de Dados (Direito à Portabilidade)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | LGPD |
| **API** | API-000118 |
| **Tela** | SCREEN-118 |
| **Teste** | TEST-000118 |
| **Dependências** | REQ-000117 |

**Descrição:**
Permite que usuários solicitem exportação completa de seus dados pessoais em formato interoperável.

**Critérios de Aceitação:**
- [ ] Solicitação de exportação via painel do usuário
- [ ] Dados exportados em formato JSON ou CSV
- [ ] Inclui: dados cadastrais, consentimentos, histórico de eventos
- [ ] Prazo máximo de 15 dias para disponibilização
- [ ] Notificação por e-mail quando dados estiverem prontos
- [ ] Link de download expira em 7 dias
- [ ] Autenticação reforçada para download (e-mail + senha)

---

## REQ-000119 — Exclusão de Dados (Direito ao Esquecimento)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | LGPD |
| **API** | API-000119 |
| **DB** | lgpd_deletion_requests |
| **Tela** | SCREEN-119 |
| **Teste** | TEST-000119 |
| **Dependências** | REQ-000117 |

**Descrição:**
Processo de exclusão completa de dados pessoais do usuário conforme direito ao esquecimento da LGPD.

**Critérios de Aceitação:**
- [ ] Solicitação de exclusão via formulário ou painel
- [ ] Confirmação de identidade antes de processar
- [ ] Anonimização de dados em vez de exclusão total (conformidade fiscal)
- [ ] Dados anonimizados não podem ser reidentificados
- [ ] Confirmação por e-mail quando exclusão for concluída
- [ ] Prazo máximo de 30 dias para processamento
- [ ] Registro de solicitação mantido para auditoria (sem dados pessoais)

---

## REQ-000120 — Política de Privacidade Dinâmica

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | LGPD |
| **API** | API-000120 |
| **DB** | lgpd_privacy_policies |
| **Tela** | SCREEN-120 |
| **Teste** | TEST-000120 |
| **Dependências** | REQ-000018 |

**Descrição:**
Gerenciamento de versões da política de privacidade com aceite obrigatório em novas versões.

**Critérios de Aceitação:**
- [ ] Política de privacidade versionada com data de vigência
- [ ] Usuário notificado quando nova versão for publicada
- [ ] Aceite obrigatório para continuar usando a plataforma
- [ ] Data e versão da política aceita registrada por usuário
- [ ] Histórico de versões anteriores disponível
- [ ] Diferenciação visual entre versões
- [ ] Política disponível em múltiplos idiomas

---

## REQ-000121 — Consentimento de Cookies

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | LGPD |
| **API** | API-000121 |
| **DB** | lgpd_cookie_consents |
| **Tela** | SCREEN-121 |
| **Teste** | TEST-000121 |
| **Dependências** | REQ-000117 |

**Descrição:**
Banner de consentimento de cookies com categorização granular e opções de personalização.

**Critérios de Aceitação:**
- [ ] Banner exibido na primeira visita
- [ ] Categorias: essenciais, analytics, marketing, preferências
- [ ] Usuário pode aceitar todos ou personalizar
- [ ] Cookies essenciais não podem ser desativados
- [ ] Consentimento armazenado com timestamp
- [ ] Usuário pode alterar preferências a qualquer momento
- [ ] Banner respeita configuração de Do Not Track

---

## REQ-000122 — Gestão de Requisições de Titular (DSR)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | LGPD |
| **API** | API-000122 |
| **DB** | lgpd_dsr_requests |
| **Tela** | SCREEN-122 |
| **Teste** | TEST-000122 |
| **Dependências** | REQ-000117 |

**Descrição:**
Sistema completo para gestão de Requisições de Titular de Dados (DSR) conforme LGPD.

**Critérios de Aceitação:**
- [ ] Tipos de requisição: acesso, correção, exclusão, portabilidade, oposição
- [ ] Formulário público para envio de requisição (sem login)
- [ ] Autenticação do solicitante via e-mail + documento
- [ ] Painel admin para gestão das requisições
- [ ] Fluxo de aprovação com prazos configuráveis
- [ ] Notificação automática sobre status da requisição
- [ ] Relatório mensal de requisições recebidas e atendidas

---

## REQ-000123 — Dashboard Customizável (BI)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Analytics |
| **API** | API-000123 |
| **DB** | bi_dashboards, bi_dashboard_widgets |
| **Tela** | SCREEN-123 |
| **Teste** | TEST-000123 |
| **Dependências** | REQ-000010 |

**Descrição:**
Dashboards customizáveis com widgets arrastáveis para visualização de métricas de negócio.

**Critérios de Aceitação:**
- [ ] Widgets pré-definidos: vendas, check-ins, engajamento, receita
- [ ] Layout drag-and-drop para organizar widgets
- [ ] Widgets redimensionáveis
- [ ] Múltiplos dashboards por organização
- [ ] Compartilhamento de dashboard com permissões
- [ ] Exportação de dashboard como PDF ou imagem
- [ ] Atualização automática em tempo real ou sob demanda

---

## REQ-000124 — Agendamento de Relatórios

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Analytics |
| **API** | API-000124 |
| **DB** | bi_scheduled_reports |
| **Tela** | SCREEN-124 |
| **Teste** | TEST-000124 |
| **Dependências** | REQ-000123 |

**Descrição:**
Agendamento de relatórios periódicos enviados por e-mail ou disponibilizados na plataforma.

**Critérios de Aceitação:**
- [ ] Frequência: diário, semanal, mensal, trimestral
- [ ] Seleção de widgets e métricas do relatório
- [ ] Formato: PDF, CSV, Excel, imagem
- [ ] Destinatários configuráveis (múltiplos e-mails)
- [ ] Relatório gerado automaticamente na data agendada
- [ ] Histórico de relatórios gerados
- [ ] Falha na geração notifica administrador

---

## REQ-000125 — Exportação de Dados (BI)

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Analytics |
| **API** | API-000125 |
| **Tela** | SCREEN-125 |
| **Teste** | TEST-000125 |
| **Dependências** | REQ-000123 |

**Descrição:**
Exportação de dados brutos e agregados para ferramentas externas de BI.

**Critérios de Aceitação:**
- [ ] Exportação em CSV, JSON, Excel e Parquet
- [ ] Filtros por período, evento, organização
- [ ] Exportação de dados brutos (tabelas completas)
- [ ] Exportação de dados agregados (métricas calculadas)
- [ ] Agendamento de exportação recorrente
- [ ] Integração com Google Sheets e Power BI
- [ ] Limite de linhas por exportação (100k por arquivo)

---

## REQ-000126 — Streaming de Dados em Tempo Real

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | technical |
| **Módulo** | Analytics |
| **API** | API-000126 |
| **DB** | bi_realtime_streams (Kafka/Redis) |
| **Tela** | SCREEN-126 |
| **Teste** | TEST-000126 |
| **Dependências** | REQ-000010 |

**Descrição:**
Processamento e exibição de métricas em tempo real durante eventos ao vivo.

**Critérios de Aceitação:**
- [ ] Streaming de check-ins em tempo real
- [ ] Streaming de vendas de ingressos
- [ ] Streaming de engajamento (visitas a estandes)
- [ ] Latência máxima de 2 segundos
- [ ] Dashboard atualizado automaticamente via WebSocket
- [ ] Alertas em tempo real (lotação máxima atingida)
- [ ] Suporte a Kafka para eventos de alta escala

---

## REQ-000127 — Analytics Preditivo

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Analytics |
| **API** | API-000127 |
| **DB** | bi_predictive_models |
| **Teste** | TEST-000127 |
| **Dependências** | REQ-000123 |

**Descrição:**
Modelos preditivos que utilizam dados históricos para prever tendências e comportamentos futuros.

**Critérios de Aceitação:**
- [ ] Previsão de vendas de ingressos para próximos eventos
- [ ] Previsão de comparecimento (no-show rate)
- [ ] Previsão de pico de check-in por horário
- [ ] Sugestão de preço de ingresso baseada em demanda
- [ ] Previsão de engajamento de patrocinadores
- [ ] Modelos treinados com dados históricos da organização
- [ ] Acurácia mínima de 80% nos modelos

---

## REQ-000128 — Detecção de Anomalias

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | technical |
| **Módulo** | Analytics |
| **API** | API-000128 |
| **DB** | bi_anomaly_alerts |
| **Teste** | TEST-000128 |
| **Dependências** | REQ-000126 |

**Descrição:**
Detecta padrões anômalos nos dados em tempo real para alertar sobre possíveis problemas.

**Critérios de Aceitação:**
- [ ] Anomalias detectadas: pico de check-ins, queda de vendas, acesso suspeito
- [ ] Threshold configurável por tipo de anomalia
- [ ] Alerta enviado para responsável (e-mail, SMS, push)
- [ ] Dashboard destacando anomalias detectadas
- [ ] Histórico de anomalias com causa identificada
- [ ] Machine learning adaptativo aos padrões da organização
- [ ] Supressão de alertas repetidos (aggregação)

---

## REQ-000129 — Comparação com Benchmarks

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Analytics |
| **API** | API-000129 |
| **DB** | bi_benchmarks |
| **Tela** | SCREEN-129 |
| **Teste** | TEST-000129 |
| **Dependências** | REQ-000123 |

**Descrição:**
Comparação de métricas da organização com benchmarks do mercado e eventos similares.

**Critérios de Aceitação:**
- [ ] Benchmarks anonimizados agregados de todas as organizações
- [ ] Comparação por tipo de evento, porte e região
- [ ] Métricas: ticket médio, taxa de conversão, ocupação
- [ ] Percentil da organização em cada métrica
- [ ] Tendências do mercado (sazonalidade)
- [ ] Relatório de desempenho vs concorrência
- [ ] Dados agregados sem identificação individual

---

## REQ-000130 — Métricas Customizadas

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Analytics |
| **API** | API-000130 |
| **Tela** | SCREEN-130 |
| **Teste** | TEST-000130 |
| **Dependências** | REQ-000123 |

**Descrição:**
Permite que organizações criem métricas customizadas combinando dados existentes com fórmulas próprias.

**Critérios de Aceitação:**
- [ ] Criação de métrica com nome, fórmula e unidade
- [ ] Fórmula usando operações matemáticas e agregações
- [ ] Métrica aparece como widget no dashboard
- [ ] Validação de sintaxe da fórmula em tempo real
- [ ] Métricas compartilháveis entre usuários da organização
- [ ] Histórico da métrica ao longo do tempo
- [ ] Exportação da métrica em relatórios

---

## REQ-000131 — Gestão de Wishlist no Marketplace

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000131 |
| **DB** | marketplace_wishlists |
| **Tela** | SCREEN-131 |
| **Teste** | TEST-000131 |
| **Dependências** | REQ-000026 |

**Descrição:**
Permite que usuários salvem produtos em lista de desejos para compra futura.

**Critérios de Aceitação:**
- [ ] Usuário pode adicionar/remover produtos da wishlist
- [ ] Notificação de queda de preço em produtos da wishlist
- [ ] Notificação de produto de volta ao estoque
- [ ] Wishlist compartilhável via link
- [ ] Mover itens da wishlist para o carrinho
- [ ] Wishlist persiste entre sessões
- [ ] Limite de 100 itens por wishlist

---

## REQ-000132 — Marketplace Multimoeda

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000132 |
| **DB** | marketplace_currency_rates |
| **Teste** | TEST-000132 |
| **Dependências** | REQ-000028 |

**Descrição:**
Suporte a múltiplas moedas no marketplace com conversão automática baseada em taxa de câmbio.

**Critérios de Aceitação:**
- [ ] Moedas suportadas: BRL, USD, EUR, ARS, MXN
- [ ] Taxa de câmbio atualizada automaticamente (API externa)
- [ ] Produto exibido na moeda local do comprador
- [ ] Conversão aplicada no checkout
- [ ] Taxa de câmbio com margem configurável
- [ ] Moeda padrão configurável por organização
- [ ] Histórico de taxas aplicadas por pedido

---

## REQ-000133 — Marketplace com Checkout Agendado

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000133 |
| **DB** | marketplace_scheduled_orders |
| **Teste** | TEST-000133 |
| **Dependências** | REQ-000028 |

**Descrição:**
Permite agendar a abertura do checkout do marketplace para data/hora específica (vendas relâmpago).

**Critérios de Aceitação:**
- [ ] Produto pode ter data/hora de início de venda
- [ ] Produto exibido como "Em breve" antes da data
- [ ] Notificação disponível para ser avisado quando abrir
- [ ] Carrinho pré-montado aguarda abertura
- [ ] Checkout é liberado automaticamente na data agendada
- [ ] Fila de espera com limite de usuários simultâneos
- [ ] Contagem regressiva exibida na página do produto

---

## REQ-000134 — Programa de Fidelidade do Marketplace

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000134 |
| **DB** | marketplace_loyalty_program |
| **Teste** | TEST-000134 |
| **Dependências** | REQ-000028 |

**Descrição:**
Programa de fidelidade que acumula pontos a cada compra no marketplace.

**Critérios de Aceitação:**
- [ ] Pontos acumulados por valor gasto (ex: 1 ponto por R)
- [ ] Pontos podem ser trocados por descontos em compras futuras
- [ ] Níveis de fidelidade (Bronze, Prata, Ouro, Platina)
- [ ] Benefícios progressivos por nível (frete grátis, cashback maior)
- [ ] Extrato de pontos com histórico completo
- [ ] Pontos expiram após 12 meses sem atividade
- [ ] Regras de acúmulo configuráveis por organização

---

## REQ-000135 — Marketplace com Entregas e Logística

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000135 |
| **DB** | marketplace_shipping_rules |
| **Teste** | TEST-000135 |
| **Dependências** | REQ-000028 |

**Descrição:**
Gerencia regras de frete e logística para produtos físicos vendidos no marketplace.

**Critérios de Aceitação:**
- [ ] Regras de frete por peso, valor e CEP
- [ ] Cálculo automático de frete no checkout
- [ ] Múltiplas opções de transporte (PAC, Sedex, transportadora)
- [ ] Código de rastreamento vinculado ao pedido
- [ ] Notificação de atualização de status de entrega
- [ ] Zonas de entrega configuráveis
- [ ] Estimativa de prazo exibida no produto

---

## REQ-000136 — Denúncia de Produto no Marketplace

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000136 |
| **DB** | marketplace_reports |
| **Teste** | TEST-000136 |
| **Dependências** | REQ-000026 |

**Descrição:**
Permite que usuários denunciem produtos impróprios ou violações de regras no marketplace.

**Critérios de Aceitação:**
- [ ] Denúncia com motivo categorizado
- [ ] Denúncia anônima (denunciante não identificado)
- [ ] Fila de denúncias para moderação
- [ ] Produto denunciado sinalizado para revisão
- [ ] Ação automática para denúncias recorrentes
- [ ] Notificação ao vendedor sobre denúncia
- [ ] Histórico de denúncias por produto

---

## REQ-000137 — Produtos em Destaque no Marketplace

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000137 |
| **DB** | marketplace_featured_products |
| **Teste** | TEST-000137 |
| **Dependências** | REQ-000026 |

**Descrição:**
Sistema de produtos em destaque com posicionamento premium na vitrine do marketplace.

**Critérios de Aceitação:**
- [ ] Produto destacado aparece no topo da listagem
- [ ] Badge "Destaque" visível no card do produto
- [ ] Destaque pode ser por tempo limitado
- [ ] Destaque pode ser pago (produto patrocinado)
- [ ] Máximo de 10 produtos em destaque simultaneamente
- [ ] Rodízio automático de produtos em destaque
- [ ] Relatório de desempenho de produtos destacados

---

## REQ-000138 — Marketplace com Cupons do Vendedor

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000138 |
| **DB** | marketplace_seller_coupons |
| **Teste** | TEST-000138 |
| **Dependências** | REQ-000027 |

**Descrição:**
Permite que vendedores criem cupons de desconto exclusivos para seus produtos.

**Critérios de Aceitação:**
- [ ] Cupom com código, desconto (percentual ou fixo) e validade
- [ ] Cupom pode ser limitado a produtos específicos
- [ ] Quantidade máxima de usos configurável
- [ ] Valor mínimo de pedido configurável
- [ ] Cupom não acumulável com outras promoções
- [ ] Relatório de uso de cupons
- [ ] Cupom pode ser desativado manualmente

---

## REQ-000139 — Recomendação de Produtos por IA

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000139 |
| **DB** | marketplace_recommendations |
| **Teste** | TEST-000139 |
| **Dependências** | REQ-000026 |

**Descrição:**
Algoritmo de recomendação inteligente que sugere produtos com base no comportamento do usuário.

**Critérios de Aceitação:**
- [ ] Recomendações baseadas em histórico de compras e navegação
- [ ] Seção "Quem comprou também comprou"
- [ ] Seção "Baseado no seu interesse"
- [ ] Recomendações personalizadas por usuário
- [ ] Recomendações sazonais (datas comemorativas)
- [ ] Taxa de conversão medida por recomendação
- [ ] Aprendizado contínuo com feedback implícito

---

## REQ-000140 — Marketplace com Venda Corporativa (B2B)

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Marketplace |
| **API** | API-000140 |
| **DB** | marketplace_b2b_configs |
| **Teste** | TEST-000140 |
| **Dependências** | REQ-000028 |

**Descrição:**
Funcionalidades B2B para vendas corporativas com preços especiais, pedidos em lote e nota fiscal.

**Critérios de Aceitação:**
- [ ] Tabela de preços diferenciada por empresa compradora
- [ ] Pedido em lote via upload de planilha
- [ ] Limite de crédito por empresa
- [ ] Faturamento agrupado por pedido
- [ ] Aprovação de pedido por comprador autorizado
- [ ] Prazo de pagamento configurável
- [ ] Relatório de compras corporativas

---

## REQ-000141 — Enquetes na Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000141 |
| **DB** | community_polls |
| **Teste** | TEST-000141 |
| **Dependências** | REQ-000036 |

**Descrição:**
Criação de enquetes nos fóruns da comunidade para votação coletiva.

**Critérios de Aceitação:**
- [ ] Enquete com múltiplas opções de voto
- [ ] Voto único por usuário
- [ ] Resultados visíveis após votar
- [ ] Enquete pode ter data de encerramento
- [ ] Enquete anônima (votos não identificados)
- [ ] Enquete com múltipla escolha permitida
- [ ] Resultados em gráfico (pizza ou barras)

---

## REQ-000142 — Calendário da Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000142 |
| **DB** | community_calendar_events |
| **Tela** | SCREEN-142 |
| **Teste** | TEST-000142 |
| **Dependências** | REQ-000039 |

**Descrição:**
Calendário centralizado com todos os eventos, encontros e atividades da comunidade.

**Critérios de Aceitação:**
- [ ] Visão mensal, semanal e diária do calendário
- [ ] Eventos da comunidade destacados no calendário
- [ ] Usuário pode adicionar evento ao calendário pessoal (Google/Outlook)
- [ ] Filtro por tipo de evento
- [ ] Lembrete de eventos do calendário
- [ ] Código de cor por categoria de evento
- [ ] Calendário exportável em formato ICS

---

## REQ-000143 — Sistema de Reputação na Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000143 |
| **DB** | community_reputation |
| **Teste** | TEST-000143 |
| **Dependências** | REQ-000036 |

**Descrição:**
Sistema de reputação que pontua usuários com base em contribuições positivas na comunidade.

**Critérios de Aceitação:**
- [ ] Pontos de reputação por postagens, respostas, votos recebidos
- [ ] Níveis de reputação (Iniciante, Contribuidor, Expert, Guru)
- [ ] Selo de "Melhor Respondedor" por categoria
- [ ] Reputação visível no perfil do usuário
- [ ] Decaimento de reputação por inatividade
- [ ] Bônus por resposta marcada como melhor resposta
- [ ] Histórico de ganho de reputação

---

## REQ-000144 — Wiki da Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000144 |
| **DB** | community_wiki_pages |
| **Teste** | TEST-000144 |
| **Dependências** | REQ-000036 |

**Descrição:**
Wiki colaborativa onde membros da comunidade podem criar e editar páginas de conhecimento.

**Critérios de Aceitação:**
- [ ] Criação de página wiki com markdown
- [ ] Histórico de versões com diff entre edições
- [ ] Rollback para versão anterior
- [ ] Bloqueio de página para evitar edição conflitante
- [ ] Índice automático de páginas
- [ ] Busca dentro da wiki
- [ ] Contribuidores listados em cada página

---

## REQ-000145 — Tags e Categorias na Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000145 |
| **DB** | community_tags |
| **Teste** | TEST-000145 |
| **Dependências** | REQ-000036 |

**Descrição:**
Sistema de tags para categorizar tópicos e facilitar a descoberta de conteúdo na comunidade.

**Critérios de Aceitação:**
- [ ] Tópico pode ter múltiplas tags
- [ ] Tags sugeridas automaticamente baseadas no conteúdo
- [ ] Navegação por tag com página dedicada
- [ ] Tags mais usadas exibidas em nuvem
- [ ] Tags sinônimas mapeadas
- [ ] Criação de tag permitida para moderadores
- [ ] Limite de 5 tags por tópico

---

## REQ-000146 — Comunidades Privadas por Organização

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000146 |
| **DB** | community_private_settings |
| **Teste** | TEST-000146 |
| **Dependências** | REQ-000036 |

**Descrição:**
Comunidades privadas visíveis apenas para membros de uma organização ou evento específico.

**Critérios de Aceitação:**
- [ ] Comunidade pode ser pública, privada ou secreta
- [ ] Comunidade privada requer ingresso aprovado
- [ ] Comunidade secreta não aparece em buscas
- [ ] Membros convidados por e-mail
- [ ] Código de acesso para ingresso
- [ ] Expulsão de membro por moderador
- [ ] Regras da comunidade exibidas no ingresso

---

## REQ-000147 — Importação de Contatos na Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000147 |
| **Teste** | TEST-000147 |
| **Dependências** | REQ-000001 |

**Descrição:**
Importação de contatos de serviços externos para encontrar amigos na comunidade.

**Critérios de Aceitação:**
- [ ] Importação de contatos do Google Contacts
- [ ] Importação de contatos do Outlook
- [ ] Importação via upload de CSV/vCard
- [ ] Sugestão de conexão com contatos encontrados
- [ ] Convite em massa para contatos
- [ ] Privacidade respeitada (não armazenar contatos)
- [ ] Matching por e-mail na base de usuários

---

## REQ-000148 — Feed de Atividades da Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000148 |
| **DB** | community_activity_feed |
| **Tela** | SCREEN-148 |
| **Teste** | TEST-000148 |
| **Dependências** | REQ-000036 |

**Descrição:**
Feed centralizado de atividades recentes na comunidade incluindo novos tópicos, respostas e eventos.

**Critérios de Aceitação:**
- [ ] Feed chronológico das últimas atividades
- [ ] Tipos: novo tópico, nova resposta, novo evento, novo grupo
- [ ] Feed personalizado por interesses
- [ ] Atualização em tempo real via WebSocket
- [ ] Filtro por tipo de atividade
- [ ] Paginação infinita
- [ ] Silenciar tipos específicos de notificação

---

## REQ-000149 — Citações e Menções na Comunidade

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000149 |
| **DB** | community_mentions |
| **Teste** | TEST-000149 |
| **Dependências** | REQ-000037 |

**Descrição:**
Suporte a menções de usuários com @ e citações de posts dentro da comunidade.

**Critérios de Aceitação:**
- [ ] @username menciona usuário em post ou resposta
- [ ] Usuário mencionado recebe notificação
- [ ] Autocomplete de username ao digitar @
- [ ] Citação de post com link e preview
- [ ] Bloco de citação formatado visualmente
- [ ] Múltiplas menções permitidas por post
- [ ] Usuário pode desativar notificações de menção

---

## REQ-000150 — Comunidade com Emojis e Reações

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Community |
| **API** | API-000150 |
| **DB** | community_reactions |
| **Teste** | TEST-000150 |
| **Dependências** | REQ-000037 |

**Descrição:**
Reações com emojis em posts e respostas da comunidade para engajamento rápido.

**Critérios de Aceitação:**
- [ ] Reações: like, love, laugh, surprise, sad, angry
- [ ] Contagem de reações exibida no post
- [ ] Usuário pode reagir uma vez por post
- [ ] Usuário pode alterar sua reação
- [ ] Top reações destacadas
- [ ] Reação anônima não permitida
- [ ] Emojis customizados por organização

---

## REQ-000151 — Academy com Conteúdo Interativo

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000151 |
| **DB** | academy_interactive_content |
| **Teste** | TEST-000151 |
| **Dependências** | REQ-000044 |

**Descrição:**
Suporte a conteúdos interativos nas lições como arrastar e soltar, preenchimento e simulações.

**Critérios de Aceitação:**
- [ ] Tipos: drag-and-drop, preenchimento de lacunas, ordenação
- [ ] Conteúdo interativo com feedback em tempo real
- [ ] Pontuação computada no progresso da lição
- [ ] Múltiplas tentativas permitidas
- [ ] Conteúdo responsivo para mobile
- [ ] Templates reutilizáveis de atividades
- [ ] Analytics de desempenho por tipo de interação

---

## REQ-000152 — Academy com Área de Discussão por Aula

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000152 |
| **DB** | academy_lesson_discussions |
| **Teste** | TEST-000152 |
| **Dependências** | REQ-000044 |

**Descrição:**
Seção de comentários e discussão específica para cada lição do curso.

**Critérios de Aceitação:**
- [ ] Comentários ordenados por data
- [ ] Instrutor pode responder comentários
- [ ] Comentário destacado como "Resposta do Instrutor"
- [ ] Votação positiva em comentários úteis
- [ ] Notificação de novas respostas no tópico
- [ ] Anexo de arquivos nos comentários
- [ ] Discussão visível apenas para alunos matriculados

---

## REQ-000153 — Academy com Download de Material

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000153 |
| **DB** | academy_lesson_materials |
| **Teste** | TEST-000153 |
| **Dependências** | REQ-000044 |

**Descrição:**
Disponibiliza materiais complementares para download em cada lição do curso.

**Critérios de Aceitação:**
- [ ] Upload de PDFs, slides, planilhas e arquivos ZIP
- [ ] Tamanho máximo de 500MB por material
- [ ] Material visível apenas para alunos matriculados
- [ ] Download individual ou em lote (ZIP)
- [ ] Controle de versão do material
- [ ] Notificação quando novo material for adicionado
- [ ] Preview de PDF antes do download

---

## REQ-000154 — Academy com Legendas e Transcrições

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000154 |
| **DB** | academy_video_transcripts |
| **Teste** | TEST-000154 |
| **Dependências** | REQ-000044 |

**Descrição:**
Geração automática de legendas e transcrições para vídeos das aulas.

**Critérios de Aceitação:**
- [ ] Legenda automática via IA (português, inglês, espanhol)
- [ ] Transcrição completa do vídeo disponível para leitura
- [ ] Sincronia entre transcrição e vídeo (clica na transcrição, vai ao trecho)
- [ ] Edição manual de legendas pelo instrutor
- [ ] Download da transcrição em PDF ou SRT
- [ ] Legendas exibidas por padrão
- [ ] Pesquisa dentro da transcrição

---

## REQ-000155 — Academy com Gamificação

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000155 |
| **DB** | academy_gamification_config |
| **Teste** | TEST-000155 |
| **Dependências** | REQ-000045, REQ-000066 |

**Descrição:**
Elementos de gamificação aplicados aos cursos para aumentar engajamento dos alunos.

**Critérios de Aceitação:**
- [ ] Pontos por aula concluída e quiz aprovado
- [ ] Badge "Primeira Conclusão" e "100% em Quizzes"
- [ ] Ranking de alunos por curso
- [ ] Sequência de dias de estudo consecutivos
- [ ] Certificado especial para alunos top 10%
- [ ] Barra de progresso com metas parciais
- [ ] Nível do aluno baseado em cursos concluídos

---

## REQ-000156 — Academy com Certificado por Módulo

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000156 |
| **DB** | academy_module_certificates |
| **Teste** | TEST-000156 |
| **Dependências** | REQ-000047 |

**Descrição:**
Gera certificados intermediários por módulo concluído, além do certificado final do curso.

**Critérios de Aceitação:**
- [ ] Certificado de módulo gerado ao concluir todas as lições do módulo
- [ ] Certificado de módulo com carga horária parcial
- [ ] Acumulável para certificado final
- [ ] Design distinto do certificado final
- [ ] QR code único por certificado
- [ ] Compartilhamento de certificado de módulo
- [ ] Todos os certificados acessíveis no perfil do aluno

---

## REQ-000157 — Academy com Anotações Pessoais

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000157 |
| **DB** | academy_lesson_notes |
| **Teste** | TEST-000157 |
| **Dependências** | REQ-000044 |

**Descrição:**
Permite que alunos façam anotações pessoais vinculadas a cada aula do curso.

**Critérios de Aceitação:**
- [ ] Anotações com timestamp do vídeo
- [ ] Editor de texto rico para anotações
- [ ] Anotações privadas (visíveis apenas para o aluno)
- [ ] Exportação de anotações em PDF
- [ ] Busca dentro das anotações
- [ ] Destaque de cor nas anotações
- [ ] Anotações persistem entre sessões

---

## REQ-000158 — Academy com Pesquisa de Satisfação

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000158 |
| **DB** | academy_course_surveys |
| **Teste** | TEST-000158 |
| **Dependências** | REQ-000050 |

**Descrição:**
Pesquisa de satisfação detalhada ao final de cada curso para coleta de feedback.

**Critérios de Aceitação:**
- [ ] Pesquisa com perguntas de múltipla escolha e texto livre
- [ ] Perguntas sobre: conteúdo, instrutor, plataforma, suporte
- [ } NPS (Net Promoter Score) calculado automaticamente
- [ ] Resposta anônima
- [ ] Relatório agregado de satisfação por curso
- [ ] Tendência de satisfação ao longo do tempo
- [ ] Notificação para deixar feedback ao concluir

---

## REQ-000159 — Academy com Trilhas de Aprendizado

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Academy |
| **API** | API-000159 |
| **DB** | academy_learning_paths |
| **Tela** | SCREEN-159 |
| **Teste** | TEST-000159 |
| **Dependências** | REQ-000043 |

**Descrição:**
Trilhas de aprendizado que agrupam cursos em sequência lógica para formação completa.

**Critérios de Aceitação:**
- [ ] Trilha com nome, descrição e imagem de capa
- [ ] Cursos ordenados sequencialmente na trilha
- [ ] Pré-requisito: curso anterior deve ser concluído
- [ ] Progresso geral da trilha exibido
- [ ] Certificado de conclusão da trilha
- [ ] Trilhas sugeridas baseadas no perfil do aluno
- [ ] Instrutor pode criar trilhas com seus cursos

---

## REQ-000160 — Academy com Modo Offline

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | technical |
| **Módulo** | Academy |
| **API** | API-000160 |
| **DB** | academy_offline_content |
| **Teste** | TEST-000160 |
| **Dependências** | REQ-000044 |

**Descrição:**
Permite que alunos façam download de aulas para assistir offline no aplicativo móvel.

**Critérios de Aceitação:**
- [ ] Download de vídeos para armazenamento local
- [ ] Download de PDFs e materiais complementares
- [ ] Progresso sincronizado quando online
- [ ] Gerenciamento de espaço de armazenamento
- [ ] Download automático via Wi-Fi
- [ ] Conteúdo expirado removido após 30 dias
- [ ] Qualidade de vídeo selecionável no download

---

## REQ-000161 — Billing com Múltiplas Organizações

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000161 |
| **DB** | billing_multi_org |
| **Teste** | TEST-000161 |
| **Dependências** | REQ-000051 |

**Descrição:**
Permite que uma entidade jurídica gerencie pagamentos de múltiplas organizações filhas.

**Critérios de Aceitação:**
- [ ] Conta mestra com múltiplas subcontas
- [ ] Faturamento consolidado ou individual
- [ ] Limite de gasto por subconta
- [ ] Transferência de créditos entre contas
- [ ] Relatório consolidado de todas as contas
- [ ] Permissões granulares por subconta
- [ ] Fatura única para conta mestra

---

## REQ-000162 — Billing com Trial Management

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000162 |
| **DB** | billing_trial_periods |
| **Teste** | TEST-000162 |
| **Dependências** | REQ-000051 |

**Descrição:**
Gerencia períodos de trial com extensão, conversão e métricas de ativação.

**Critérios de Aceitação:**
- [ ] Duração do trial configurável por plano
- [ ] Trial pode ser estendido manualmente pelo admin
- [ ] Notificações de expiração do trial (7, 3, 1 dia)
- [ ] Inserção de cartão de crédito opcional no trial
- [ ] Conversão automática para plano pago ao fim do trial
- [ ] Trial pode ser cancelado a qualquer momento
- [ ] Métricas de conversão de trial para pago
- [ ] Impedimento de múltiplos trials por CNPJ

---

## REQ-000163 — Billing com Faturamento Anti-Fraude

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | Billing |
| **API** | API-000163 |
| **DB** | billing_fraud_analysis |
| **Teste** | TEST-000163 |
| **Dependências** | REQ-000007 |

**Descrição:**
Sistema de análise antifraude para transações financeiras na plataforma.

**Critérios de Aceitação:**
- [ ] Análise de risco em tempo real no checkout
- [ ] Regras: múltiplas tentativas, cartão diferente, geolocalização suspeita
- [ ] Score de risco calculado por transação
- [ ] Transações com alto risco bloqueadas ou em análise manual
- [ ] Verificação de dados do cartão (CVV, BIN, endereço)
- [ ] Histórico de chargebacks por cliente
- [ ] Relatório mensal de tentativas de fraude

---

## REQ-000164 — Billing com Cupons de Desconto

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000164 |
| **DB** | billing_coupons |
| **Teste** | TEST-000164 |
| **Dependências** | REQ-000052 |

**Descrição:**
Sistema completo de cupons de desconto aplicáveis a planos de assinatura.

**Critérios de Aceitação:**
- [ ] Cupom com desconto percentual, fixo ou período grátis
- [ ] Cupom aplicável a planos específicos
- [ ] Validade e limite de usos configuráveis
- [ ] Código promocional gerado automaticamente
- [ ] Cupom não cumulativo com outras ofertas
- [ ] Relatório de uso de cupons por campanha
- [ ] Cupons segmentados por tipo de cliente

---

## REQ-000165 — Billing com Notas Fiscais (NFSe)

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000165 |
| **DB** | billing_nfse |
| **Teste** | TEST-000165 |
| **Dependências** | REQ-000058 |

**Descrição:**
Geração de Nota Fiscal de Serviço (NFSe) para faturas emitidas pela plataforma.

**Critérios de Aceitação:**
- [ ] Integração com prefeituras municipais para emissão de NFSe
- [ ] Dados do prestador e tomador completos na nota
- [ ] Cálculo de ISS e retenções conforme município
- [ ] Numeração sequencial anual
- [ ] NFSe cancelada em caso de estorno de fatura
- [ ] Download de NFSe em XML e PDF
- [ ] Envio da NFSe por e-mail ao cliente

---

## REQ-000166 — Billing com Gateway Múltiplo

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | technical |
| **Módulo** | Billing |
| **API** | API-000166 |
| **DB** | billing_gateway_configs |
| **Teste** | TEST-000166 |
| **Dependências** | REQ-000053 |

**Descrição:**
Suporte a múltiplos gateways de pagamento com fallback automático entre eles.

**Critérios de Aceitação:**
- [ ] Gateways: Stripe, Asaas, PagSeguro, Mercado Pago, Cielo
- [ ] Fallback automático se gateway primário falhar
- [ ] Roteamento por valor da transação
- [ ] Roteamento por bandeira do cartão
- [ ] Gateway configurável por organização
- [ ] Dashboard de performance por gateway
- [ ] Troca de gateway sem impacto no cliente final

---

## REQ-000167 — Billing com Ciclo de Faturamento Flexível

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000167 |
| **DB** | billing_cycle_configs |
| **Teste** | TEST-000167 |
| **Dependências** | REQ-000051 |

**Descrição:**
Ciclos de faturamento flexíveis com datas de corte customizáveis por organização.

**Critérios de Aceitação:**
- [ ] Ciclos: semanal, quinzenal, mensal, bimestral, trimestral, semestral, anual
- [ ] Data de corte configurável (dia do mês)
- [ ] Faturamento proporcional (pro-rata) em mudanças de ciclo
- [ ] Faturamento antecipado ou postergado
- [ ] Múltiplos ciclos por organização
- [ ] Notificação de faturamento com X dias de antecedência
- [ ] Histórico de ciclos de faturamento

---

## REQ-000168 — Billing com Conciliação Bancária

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | technical |
| **Módulo** | Billing |
| **API** | API-000168 |
| **DB** | billing_reconciliation |
| **Teste** | TEST-000168 |
| **Dependências** | REQ-000052 |

**Descrição:**
Automatiza a conciliação entre transações da plataforma e extratos bancários.

**Critérios de Aceitação:**
- [ ] Importação de extrato bancário (OFX, CSV, CNAB)
- [ ] Matching automático de transações por valor, data e ID
- [ ] Transações não conciliadas destacadas para revisão
- [ ] Conciliação manual de transações pendentes
- [ ] Relatório de conciliação mensal
- [ ] Alertas de divergência acima de threshold
- [ ] Histórico completo de conciliações

---

## REQ-000169 — Billing com Dunning Management

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000169 |
| **DB** | billing_dunning |
| **Teste** | TEST-000169 |
| **Dependências** | REQ-000051 |

**Descrição:**
Processo automatizado de cobrança para faturas vencidas com múltiplas tentativas.

**Critérios de Aceitação:**
- [ ] Tentativas de cobrança automática (D+0, D+3, D+7, D+15)
- [ ] Notificações ao cliente antes do vencimento
- [ ] Juros e multa configuráveis por atraso
- [ ] Suspensão de serviços após X dias de atraso
- [ ] Reativação automática após pagamento
- [ ] Regras de dunning configuráveis por plano
- [ ] Relatório de recuperação de receita

---

## REQ-000170 — Billing com Marketplace de Apps

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Billing |
| **API** | API-000170 |
| **DB** | billing_app_marketplace |
| **Teste** | TEST-000170 |
| **Dependências** | REQ-000051 |

**Descrição:**
Marketplace de aplicativos e integrações pagas que podem ser adquiridas por organizações.

**Critérios de Aceitação:**
- [ ] App com nome, descrição, preço e desenvolvedor
- [ ] Planos de app: gratuito, pago único, assinatura
- [ ] Ativação do app na organização após compra
- [ ] Trial gratuito por app (14 dias)
- [ ] Faturamento consolidado com plano principal
- [ ] Reviews por app
- [ ] Desinstalação de app a qualquer momento

---

## REQ-000171 — Networking com Perfil em Vídeo

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000171 |
| **DB** | networking_video_profiles |
| **Teste** | TEST-000171 |
| **Dependências** | REQ-000059 |

**Descrição:**
Permite que participantes adicionem um vídeo curto de apresentação ao perfil de networking.

**Critérios de Aceitação:**
- [ ] Gravação de vídeo diretamente pela câmera
- [ ] Upload de vídeo pré-gravado (máx 60 segundos)
- [ ] Vídeo exibido no perfil de networking
- [ ] Qualidade mínima exigida para publicação
- [ ] Moderação de conteúdo do vídeo
- [ ] Vídeo pode ser substituído a qualquer momento
- [ ] Legendas automáticas no vídeo

---

## REQ-000172 — Networking com IA de Conversação

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000172 |
| **DB** | networking_ai_assistant |
| **Teste** | TEST-000172 |
| **Dependências** | REQ-000060 |

**Descrição:**
Assistente de IA que sugere tópicos de conversa e quebra-gelos para matches de networking.

**Critérios de Aceitação:**
- [ ] Sugestão de perguntas iniciais baseadas nos perfis
- [ ] Tópicos recomendados por interesse comum
- [ ] IA sugere icebreakers para iniciar conversa
- [ ] Dicas de networking personalizadas
- [ ] Feedback pós-conversa para melhorar matches
- [ ] Idioma da sugestão conforme perfil
- [ ] Assistente acessível durante a videochamada

---

## REQ-000173 — Networking com Código de Conduta

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000173 |
| **DB** | networking_code_of_conduct |
| **Teste** | TEST-000173 |
| **Dependências** | REQ-000059 |

**Descrição:**
Código de conduta que todo participante deve aceitar antes de ativar o networking.

**Critérios de Aceitação:**
- [ ] Código de conduta exibido antes da ativação
- [ ] Aceitação obrigatória para participar do networking
- [ ] Denúncia de violação do código de conduta
- [ ] Bloqueio automático após 3 denúncias
- [ ] Código customizável por organização
- [ ] Histórico de aceitação registrado
- [ ] Ações disciplinares progressivas

---

## REQ-000174 — Networking com Pessoas Próximas (Nearby)

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000174 |
| **DB** | networking_nearby |
| **Teste** | TEST-000174 |
| **Dependências** | REQ-000059 |

**Descrição:**
Mostra participantes próximos geograficamente dentro do evento para networking presencial.

**Critérios de Aceitação:**
- [ ] Lista de participantes próximos com distância
- [ ] GPS ou Bluetooth para proximidade
- [ ] Privacidade: opt-in para ser visível
- [ ] Indicar interesse em conhecer (acenar virtualmente)
- [ ] Notificação quando match estiver próximo
- [ ] Raio de proximidade configurável
- [ ] Precisão mínima de 10 metros

---

## REQ-000175 — Networking com Agenda Pública

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000175 |
| **DB** | networking_public_schedule |
| **Teste** | TEST-000175 |
| **Dependências** | REQ-000064 |

**Descrição:**
Agenda pública onde o participante mostra disponibilidade para networking aberto.

**Critérios de Aceitação:**
- [ ] Slots de networking abertos disponíveis na agenda
- [ ] Participante pode reservar slot automaticamente
- [ ] Slot com capacidade limitada
- [ ] Local do meet presencial indicado
- [ ] Link de videoconferência para meet remoto
- [ ] Notificação de confirmação da reserva
- [ ] Cancelamento com aviso de 1 hora

---

## REQ-000176 — Networking com Grupos de Interesse

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000176 |
| **DB** | networking_interest_groups |
| **Teste** | TEST-000176 |
| **Dependências** | REQ-000059 |

**Descrição:**
Grupos temáticos dentro do networking onde participantes com interesses comuns podem interagir.

**Critérios de Aceitação:**
- [ ] Grupo criado por participante com tema específico
- [ ] Grupo com descrição e regras
- [ ] Participante pode entrar em múltiplos grupos
- [ ] Chat exclusivo do grupo
- [ ] Limite de participantes por grupo
- [ ] Grupo recomendado pela IA baseado no perfil
- [ ] Grupos mais populares em destaque

---

## REQ-000177 — Networking com Scan de Crachá

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000177 |
| **DB** | networking_badge_scans |
| **Teste** | TEST-000177 |
| **Dependências** | REQ-000063 |

**Descrição:**
Troca de contatos via scan de QR code do crachá do participante.

**Critérios de Aceitação:**
- [ ] QR code único no crachá de cada participante
- [ ] Scan via câmera do celular adiciona contato
- [ ] Contato adicionado com dados do perfil
- [ ] Nota pessoal adicionada no momento do scan
- [ ] Scan recíproco adiciona ambos os lados
- [ ] Histórico de scans realizados
- [ ] Privacidade: bloquear scan no perfil

---

## REQ-000178 — Networking com Reconhecimento Facial

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000178 |
| **DB** | networking_face_recognition |
| **Teste** | TEST-000178 |
| **Dependências** | REQ-000093 |

**Descrição:**
Identifica participantes no evento via reconhecimento facial e exibe informações do perfil.

**Critérios de Aceitação:**
- [ ] Câmera identifica rosto e busca perfil de networking
- [ ] Exibe nome, empresa e cargo do participante
- [ ] Botão "Conectar" ao identificar
- [ ] Privacidade: opt-in obrigatório
- [ ] Identificação em menos de 3 segundos
- [ ] Não armazena imagens após identificação
- [ ] Funciona offline com cache local

---

## REQ-000179 — Networking com Avaliação de Match

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000179 |
| **DB** | networking_match_feedback |
| **Teste** | TEST-000179 |
| **Dependências** | REQ-000060 |

**Descrição:**
Após uma conversa, participantes podem avaliar a qualidade do match para melhorar recomendações.

**Critérios de Aceitação:**
- [ ] Avaliação de 1 a 5 estrelas após conversa
- [ ] Feedback opcional sobre o match
- [ ] Avaliação usada para treinar IA de matches
- [ ] Participante pode marcar como "Não relevante"
- [ ] Preferências ajustadas automaticamente
- [ ] Média de avaliações visível no perfil
- [ ] Avaliações anônimas

---

## REQ-000180 — Networking com Modo Anônimo

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Networking |
| **API** | API-000180 |
| **Teste** | TEST-000180 |
| **Dependências** | REQ-000059 |

**Descrição:**
Modo anônimo que oculta informações do perfil até que o participante decida se revelar.

**Critérios de Aceitação:**
- [ ] Perfil oculto na lista de participantes
- [ ] Match cego baseado apenas em interesses
- [ ] Revelação gradual de informações após match
- [ ] Controle granular do que é visível
- [ ] Desativar modo anônimo a qualquer momento
- [ ] Notificação de match mesmo no modo anônimo
- [ ] Privacidade máxima como padrão

---

## REQ-000181 — Gamification com Níveis de Usuário

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000181 |
| **DB** | gamification_user_levels |
| **Teste** | TEST-000181 |
| **Dependências** | REQ-000066 |

**Descrição:**
Sistema de níveis de usuário baseado em experiência acumulada (XP) na plataforma.

**Critérios de Aceitação:**
- [ ] Níveis de 1 a 100 com progressão não linear
- [ ] XP ganho por: check-ins, visitas, compras, avaliações
- [ ] Bônus de XP por eventos consecutivos
- [ ] Benefícios por nível (descontos, badges exclusivos)
- [ ] Barra de progresso para próximo nível
- [ ] Cálculo de XP diário máximo
- [ ] Reset de nível por evento (opcional)

---

## REQ-000182 — Gamification com Eventos Especiais

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000182 |
| **DB** | gamification_special_events |
| **Teste** | TEST-000182 |
| **Dependências** | REQ-000017 |

**Descrição:**
Eventos especiais temporários com regras de pontuação diferenciadas e prêmios exclusivos.

**Critérios de Aceitação:**
- [ ] Evento especial com data de início e fim
- [ ] Multiplicador de pontos durante evento
- [ ] Missões exclusivas do evento
- [ ] Badge comemorativo do evento
- [ ] Ranking exclusivo do evento
- [ ] Prêmio para top 3 do ranking
- [ ] Evento visível com contagem regressiva

---

## REQ-000183 — Gamification com Times

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000183 |
| **DB** | gamification_teams |
| **Teste** | TEST-000183 |
| **Dependências** | REQ-000017 |

**Descrição:**
Formação de times onde participantes competem coletivamente contra outros times.

**Critérios de Aceitação:**
- [ ] Time com nome, logo e descrição
- [ ] Criação de time ou entrada em time existente
- [ ] Pontos do time = soma dos pontos dos membros
- [ ] Ranking de times no evento
- [ ] Chat exclusivo do time
- [ ] Limite de membros por time (máx 10)
- [ ] Troca de time permitida a cada 24h

---

## REQ-000184 — Gamification com Conquistas Secretas

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000184 |
| **DB** | gamification_secret_achievements |
| **Teste** | TEST-000184 |
| **Dependências** | REQ-000067 |

**Descrição:**
Conquistas ocultas que só são reveladas quando o jogador as desbloqueia.

**Critérios de Aceitação:**
- [ ] Conquista com requisito secreto
- [ ] Dica opcional revelada parcialmente
- [ ] Notificação surpresa ao desbloquear
- [ ] Raridade da conquista indicada
- [ ] Conquista aparece como "???" antes de desbloquear
- [ ] Percentual de jogadores que desbloquearam
- [ ] Conquistas secretas contam para 100% do jogo

---

## REQ-000185 — Gamification com Integração de Provedores

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | technical |
| **Módulo** | Gamification |
| **API** | API-000185 |
| **DB** | gamification_external_providers |
| **Teste** | TEST-000185 |
| **Dependências** | REQ-000017 |

**Descrição:**
Integração com plataformas externas de gamificação como Bunch, Badgeville e outras.

**Critérios de Aceitação:**
- [ ] Webhook para enviar eventos de gamificação
- [ ] Receber badges de provedores externos
- [ ] Sincronização bidirecional de pontos
- [ ] Mapeamento de ações entre plataformas
- [ ] Fallback para sistema nativo se externo falhar
- [ ] Cache local de dados de gamificação
- [ ] Log de sincronização para auditoria

---

## REQ-000186 — Gamification com Economia de Tokens

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000186 |
| **DB** | gamification_token_economy |
| **Teste** | TEST-000186 |
| **Dependências** | REQ-000071 |

**Descrição:**
Economia baseada em tokens digitais que podem ser usados dentro do ecossistema do evento.

**Critérios de Aceitação:**
- [ ] Token com nome e ícone customizável
- [ ] Ganho de tokens por ações e desafios
- [ ] Tokens trocados por recompensas na loja
- [ ] Transferência de tokens entre participantes
- [ ] Leilão de itens raros com tokens
- [ ] Saldo de tokens no perfil
- [ ] Tokens expirados ao final do evento

---

## REQ-000187 — Gamification com Conquistas em Equipe

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000187 |
| **DB** | gamification_team_achievements |
| **Teste** | TEST-000187 |
| **Dependências** | REQ-000183 |

**Descrição:**
Conquistas que exigem colaboração de múltiplos membros do time para serem desbloqueadas.

**Critérios de Aceitação:**
- [ ] Requisito: todos os membros fazem check-in
- [ ] Requisito: soma de pontos coletiva atinge meta
- [ ] Requisito: número mínimo de membros ativos
- [ ] Badge coletivo adicionado a todos os membros
- [ ] Notificação para todos ao desbloquear
- [ ] Contribuição individual destacada
- [ ] Conquista registrada no histórico do time

---

## REQ-000188 — Gamification com Feedback por Pares

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000188 |
| **DB** | gamification_peer_feedback |
| **Teste** | TEST-000188 |
| **Dependências** | REQ-000017 |

**Descrição:**
Sistema de feedback entre participantes que gera pontos de reputação.

**Critérios de Aceitação:**
- [ ] Feedback positivo ou construtivo
- [ ] Categorias: pontualidade, simpatia, conhecimento
- [ ] Feedback anônimo opcional
- [ ] Pontos de reputação ganhos ao receber feedback positivo
- [ ] Limite de feedback enviado por dia (10)
- [ ] Feedback abusivo pode ser denunciado
- [ ] Média de feedback no perfil do participante

---

## REQ-000189 — Gamification com Minigames

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000189 |
| **DB** | gamification_minigames |
| **Teste** | TEST-000189 |
| **Dependências** | REQ-000017 |

**Descrição:**
Minigames rápidos disponíveis nos intervalos do evento para entretenimento e ganho de pontos.

**Critérios de Aceitação:**
- [ ] Jogos: quiz rápido, caça-palavras, memória, roleta
- [ ] Minigame com duração máxima de 2 minutos
- [ ] Pontos ganhos por performance no jogo
- [ ] Ranking de pontuação por minigame
- [ ] Minigame patrocinado por parceiros
- [ ] Recorde pessoal destacado
- [ ] Novos minigames adicionados a cada evento

---

## REQ-000190 — Gamification com Narrativa (Storytelling)

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Gamification |
| **API** | API-000190 |
| **DB** | gamification_storytelling |
| **Teste** | TEST-000190 |
| **Dependências** | REQ-000069 |

**Descrição:**
Missões com narrativa progressiva onde cada etapa revela parte de uma história.

**Critérios de Aceitação:**
- [ ] História dividida em capítulos
- [ ] Cada missão concluída revela novo capítulo
- [ ] Escolhas do jogador afetam o desfecho
- [ ] Múltiplos finais possíveis
- [ ] Arte e texto da história imersivos
- [ ] Progresso da história salvo
- [ ] História completa disponível ao final

---

## REQ-000191 — IAM com Provisionamento SCIM

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | technical |
| **Módulo** | IAM |
| **API** | API-000191 |
| **DB** | iam_scim_configs |
| **Teste** | TEST-000191 |
| **Dependências** | REQ-000073 |

**Descrição:**
Provisionamento automático de usuários via protocolo SCIM (System for Cross-domain Identity Management).

**Critérios de Aceitação:**
- [ ] Suporte a SCIM 2.0 (RFC 7643 e 7644)
- [ ] Criação, atualização e desativação de usuários via SCIM
- [ ] Sincronização de grupos e papéis via SCIM
- [ ] Mapeamento de atributos customizável
- [ ] Webhook para alterações de usuário
- [ ] Log de todas as operações SCIM
- [ ] Forçar sincronização manual a qualquer momento

---

## REQ-000192 — IAM com Just-In-Time (JIT) Access

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000192 |
| **DB** | iam_jit_requests |
| **Teste** | TEST-000192 |
| **Dependências** | REQ-000073 |

**Descrição:**
Acesso just-in-time onde usuários solicitam permissões elevadas por tempo limitado com aprovação.

**Critérios de Aceitação:**
- [ ] Solicitação de acesso elevado com motivo e duração
- [ ] Aprovação requerida de supervisor ou admin
- [ ] Acesso concedido por tempo limitado (mín 1h, máx 24h)
- [ ] Acesso revogado automaticamente ao expirar
- [ ] Notificação ao aprovador sobre solicitação pendente
- [ ] Histórico de acessos JIT para auditoria
- [ ] Escopo do acesso JIT (módulo específico)

---

## REQ-000193 — IAM com RBAC Hierárquico

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000193 |
| **DB** | iam_role_hierarchy |
| **Teste** | TEST-000193 |
| **Dependências** | REQ-000073 |

**Descrição:**
RBAC com hierarquia de papéis onde papéis superiores herdam permissões de papéis inferiores.

**Critérios de Aceitação:**
- [ ] Hierarquia: Owner > Admin > Manager > Staff > Viewer
- [ ] Herança automática de permissões na hierarquia
- [ ] Permissão negada em nível superior sobrescreve herança
- [ ] Visualização da árvore de herança
- [ ] Papéis customizados podem ser inseridos na hierarquia
- [ ] Simulador de permissões para testar acesso
- [ ] Migração assistida quando hierarquia é alterada

---

## REQ-000194 — IAM com Delegacia de Permissões

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | IAM |
| **API** | API-000194 |
| **DB** | iam_permission_delegation |
| **Teste** | TEST-000194 |
| **Dependências** | REQ-000073 |

**Descrição:**
Permite que usuários deleguem suas permissões a outros usuários temporariamente.

**Critérios de Aceitação:**
- [ ] Delegação com data de início e fim
- [ ] Delegação de permissões específicas (não todas)
- [ ] Cancelamento de delegação a qualquer momento
- [ ] Notificação ao delegado sobre nova delegação
- [ ] Limite de delegações ativas simultâneas
- [ ] Aprovação requerida para delegação de papéis críticos
- [ ] Histórico de delegações para auditoria

---

## REQ-000195 — IAM com Políticas Baseadas em Atributos (ABAC)

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000195 |
| **DB** | iam_abac_policies |
| **Teste** | TEST-000195 |
| **Dependências** | REQ-000074 |

**Descrição:**
Controle de acesso baseado em atributos do usuário, recurso e contexto para políticas granulares.

**Critérios de Aceitação:**
- [ ] Atributos: cargo, departamento, localização, horário
- [ ] Atributos do recurso: tipo, módulo, status
- [ ] Atributos de contexto: IP, dispositivo, horário
- [ ] Políticas ABAC combinadas com RBAC
- [ ] Avaliação em tempo real de políticas
- [ ] Editor visual de políticas ABAC
- [ ] Simulador de política para validação

---

## REQ-000196 — IAM com Bloqueio Geográfico

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000196 |
| **DB** | iam_geo_restrictions |
| **Teste** | TEST-000196 |
| **Dependências** | REQ-000002 |

**Descrição:**a
Restringe acesso à plataforma com base na localização geográfica do usuário.

**Critérios de Aceitação:**
- [ ] Países permitidos/bloqueados configuráveis
- [ ] Bloqueio por estado/região (para Brasil)
- [ ] Acesso negado retorna 403 com mensagem clara
- [ ] Exceção por usuário ou papel (admin sempre acessa)
- [ ] Notificação de tentativa de acesso de local bloqueado
- [ ] Log de tentativas bloqueadas
- [ ] Base de geolocalização atualizada periodicamente

---

## REQ-000197 — IAM com Controle de Dispositivo

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000197 |
| **DB** | iam_device_trust |
| **Teste** | TEST-000197 |
| **Dependências** | REQ-000002 |

**Descrição:**
Controle de acesso baseado em confiança do dispositivo usado para autenticação.

**Critérios de Aceitação:**
- [ ] Dispositivo registrado como confiável após primeiro login
- [ ] Verificação adicional para dispositivos não confiáveis
- [ ] Limite de dispositivos por usuário (5)
- [ ] Remoção de dispositivo confiável
- [ ] Notificação de login de novo dispositivo
- [ ] Suporte a MDM (Mobile Device Management)
- [ ] Política de dispositivo configurável por organização

---

## REQ-000198 — IAM com Expiração de Senha

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | security |
| **Módulo** | IAM |
| **API** | API-000198 |
| **DB** | iam_password_policy |
| **Teste** | TEST-000198 |
| **Dependências** | REQ-000002 |

**Descrição:**
Políticas de expiração de senha com notificações e troca forçada periódica.

**Critérios de Aceitação:**
- [ ] Expiração de senha configurável (30, 60, 90 dias)
- [ ] Notificação X dias antes da expiração
- [ ] Troca forçada no próximo login se expirada
- [ ] Histórico de senhas anteriores (evitar reuso)
- [ ] Complexidade mínima configurável
- [ ] Bloqueio de senhas comuns
- [ ] Política de senha por organização

---

## REQ-000199 — IAM com Login Social Vinculado

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | IAM |
| **API** | API-000199 |
| **DB** | iam_social_links |
| **Teste** | TEST-000199 |
| **Dependências** | REQ-000001 |

**Descrição:**
Vinculação de contas sociais ao perfil para login rápido e compartilhamento de atividades.

**Critérios de Aceitação:**
- [ ] Vincular conta Google, Microsoft, LinkedIn, Facebook
- [ ] Login com qualquer conta social vinculada
- [ ] Desvincular conta social a qualquer momento
- [ ] Foto do perfil importada da rede social
- [ ] Dados básicos sincronizados (nome, e-mail)
- [ ] Mínimo de 1 método de login sempre ativo
- [ ] Verificação de e-mail ao vincular nova conta

---

## REQ-000200 — IAM com Recuperação de Conta

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | IAM |
| **API** | API-000200 |
| **DB** | iam_account_recovery |
| **Teste** | TEST-000200 |
| **Dependências** | REQ-000002 |

**Descrição:**
Processo seguro de recuperação de conta com múltiplos métodos de verificação.

**Critérios de Aceitação:**
- [ ] Recuperação via e-mail com link temporário
- [ ] Recuperação via SMS com código de 6 dígitos
- [ ] Pergunta de segurança configurável
- [ ] Bloqueio de recuperação após 3 tentativas erradas
- [ ] Notificação de recuperação de conta
- [ ] Recuperação requer confirmação de identidade
- [ ] Troca de senha obrigatória após recuperação

---

## REQ-000201 — Notification com Campanhas de Marketing

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000201 |
| **DB** | notification_marketing_campaigns |
| **Tela** | SCREEN-201 |
| **Teste** | TEST-000201 |
| **Dependências** | REQ-000080, REQ-000081 |

**Descrição:**
Criação e envio de campanhas de marketing multicanal com segmentação de audiência.

**Critérios de Aceitação:**
- [ ] Campanha com nome, canal (e-mail, SMS, WhatsApp, push)
- [ ] Segmentação por: comportamento, localização, evento, cargo
- [ ] Agendamento de envio com fuso horário
- [ ] Teste A/B de assunto e conteúdo
- [ ] Relatório de abertura, clique e conversão
- [ ] Controle de frequência (limite por semana)
- [ ] Compliance com LGPD (opt-out em todo envio)

---

## REQ-000202 — Notification com Automação (Triggers)

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000202 |
| **DB** | notification_automation_rules |
| **Teste** | TEST-000202 |
| **Dependências** | REQ-000080 |

**Descrição:**
Automação de disparo de notificações baseada em triggers de eventos do sistema.

**Critérios de Aceitação:**
- [ ] Triggers: check-in realizado, pedido confirmado, evento publicado
- [ ] Ação: enviar notificação por canal configurado
- [ ] Condições: apenas se critério for atendido
- [ ] Atraso configurável (enviar X horas após trigger)
- [ ] Múltiplas ações por trigger
- [ ] Regras ativadas/desativadas por organização
- [ ] Log de execução de regras de automação

---

## REQ-000203 — Notification com Preferências Unificadas

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000203 |
| **DB** | notification_user_preferences |
| **Tela** | SCREEN-203 |
| **Teste** | TEST-000203 |
| **Dependências** | REQ-000080 |

**Descrição:**
Central de preferências de notificação onde o usuário controla canais e frequência por tipo.

**Critérios de Aceitação:**
- [ ] Preferências por tipo de notificação (evento, comunidade, marketing)
- [ ] Canal habilitado/desabilitado por tipo
- [ ] Horário silencioso configurável (não enviar das 22h às 8h)
- [ ] Frequência: imediato, resumo diário, semanal
- [ ] Opt-out de marketing com 1 clique
- [ ] Preferências aplicadas instantaneamente
- [ ] Preferências padrão sensatas para novos usuários

---

## REQ-000204 — Notification com Branding Customizado

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000204 |
| **DB** | notification_sender_configs |
| **Teste** | TEST-000204 |
| **Dependências** | REQ-000085 |

**Descrição:**
Customização de remetente e identidade visual das notificações por organização.

**Critérios de Aceitação:**
- [ ] Nome do remetente customizado por organização
- [ ] E-mail de remetente com domínio próprio
- [ ] Logo da organização no header de e-mails
- [ ] Cor do tema aplicada em templates
- [ ] Rodapé com dados da organização
- [ ] Preview da notificação com branding
- [ ] Fallback para branding padrão

---

## REQ-000205 — Notification com Webhook de Status

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | technical |
| **Módulo** | Notifications |
| **API** | API-000205 |
| **DB** | notification_status_webhooks |
| **Teste** | TEST-000205 |
| **Dependências** | REQ-000086 |

**Descrição:**
Webhooks que notificam sistemas externos sobre mudanças de status de entregas de notificações.

**Critérios de Aceitação:**
- [ ] Eventos: enviado, entregue, aberto, clicado, falhou, bounce
- [ ] Payload com ID da notificação, canal, timestamp, erro
- [ ] URL de webhook configurável por organização
- [ ] Retry com backoff exponencial (3 tentativas)
- [ ] Secreto compartilhado para autenticação
- [ ] Log de chamadas de webhook
- [ ] Teste de webhook no painel admin

---

## REQ-000206 — Notification com Dashboard Operacional

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000206 |
| **DB** | notification_dashboard_stats |
| **Tela** | SCREEN-206 |
| **Teste** | TEST-000206 |
| **Dependências** | REQ-000086 |

**Descrição:**
Dashboard operacional com métricas em tempo real de entregas de notificações.

**Critérios de Aceitação:**
- [ ] Volume de envios por canal (gráfico de linhas)
- [ ] Taxa de entrega, abertura e clique
- [ ] Taxa de bounce e reclamação (spam)
- [ ] Fila de envios pendentes e processando
- [ ] Top 5 falhas com erro detalhado
- [ ] Comparação com período anterior
- [ ] Exportação de métricas em CSV

---

## REQ-000207 — Notification com Internacionalização

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000207 |
| **DB** | notification_i18n_templates |
| **Teste** | TEST-000207 |
| **Dependências** | REQ-000085, REQ-000020 |

**Descrição:**
Templates de notificação traduzidos para múltiplos idiomas com seleção automática.

**Critérios de Aceitação:**
- [ ] Templates disponíveis em pt-BR, en, es
- [ ] Idioma selecionado conforme preferência do usuário
- [ ] Fallback para inglês se idioma não disponível
- [ ] Data/hora e moeda formatadas conforme locale
- [ ] Conteúdo dinâmico traduzido
- [ ] Manutenção centralizada de traduções
- [ ] Preview do template em cada idioma

---

## REQ-000208 — Notification com Filas Prioritárias

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | technical |
| **Módulo** | Notifications |
| **API** | API-000208 |
| **DB** | notification_queue_configs |
| **Teste** | TEST-000208 |
| **Dependências** | REQ-000080 |

**Descrição:**
Sistema de filas de notificação com priorização e controle de throughput.

**Critérios de Aceitação:**
- [ ] Filas por prioridade: alta (transacional), média, baixa (marketing)
- [ ] Prioridade alta sempre processada primeiro
- [ ] Rate limit por canal (ex: 10 e-mails/segundo)
- [ ] Horário de envio respeitado (não enviar fora do horário comercial)
- [ ] Pausar fila manualmente para manutenção
- [ ] Reordenamento manual de fila
- [ ] Métricas de latência por fila

---

## REQ-000209 — Notification com Supressão de Bounce

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | technical |
| **Módulo** | Notifications |
| **API** | API-000209 |
| **DB** | notification_bounce_suppression |
| **Teste** | TEST-000209 |
| **Dependências** | REQ-000086 |

**Descrição:**
Sistema de supressão automática de contas com bounce para manter reputação de entrega.

**Critérios de Aceitação:**
- [ ] E-mail suprimido após 3 bounces consecutivos
- [ ] Categorias: hard bounce (permanente) e soft bounce (temporário)
- [ ] Notificação ao usuário sobre supressão
- [ ] Reativação mediante confirmação do usuário
- [ ] Lista de supressão visível no admin
- [ ] Remoção manual da lista de supressão
- [ ] Relatório de supressões mensais

---

## REQ-000210 — Notification com Canal Prioritário

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Notifications |
| **API** | API-000210 |
| **DB** | notification_channel_routing |
| **Teste** | TEST-000210 |
| **Dependências** | REQ-000080 |

**Descrição:**
Roteamento inteligente de notificações para o melhor canal baseado em urgência e preferências.

**Critérios de Aceitação:**
- [ ] Urgência alta: SMS ou push (imediato)
- [ ] Urgência média: e-mail ou in-app (minutos)
- [ ] Urgência baixa: e-mail ou in-app (horas)
- [ ] Canal de fallback se primário falhar
- [ ] Preferência do usuário respeitada
- [ ] Custo por canal considerado no roteamento
- [ ] Histórico de roteamento para auditoria

---

## REQ-000211 — Search com Busca Visual

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Search |
| **API** | API-000211 |
| **DB** | search_visual_index |
| **Teste** | TEST-000211 |
| **Dependências** | REQ-000087 |

**Descrição:**
Busca por imagens onde o usuário faz upload de uma foto e encontra conteúdos relacionados.

**Critérios de Aceitação:**
- [ ] Upload de imagem para busca visual
- [ ] Similaridade visual com imagens de eventos
- [ ] Busca por objeto ou cena na imagem
- [ ] Resultados ordenados por similaridade
- [ ] Suporte a JPEG, PNG, WebP
- [ ] Tamanho máximo de 10MB por imagem
- [ ] Privacidade: imagens não armazenadas após busca

---

## REQ-000212 — Search com Busca por Voz

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Search |
| **API** | API-000212 |
| **DB** | search_voice_cache |
| **Teste** | TEST-000212 |
| **Dependências** | REQ-000087 |

**Descrição:**
Busca ativada por voz onde o usuário dita o termo de busca.

**Critérios de Aceitação:**
- [ ] Captura de áudio do microfone
- [ ] Transcrição de fala para texto em tempo real
- [ ] Suporte a português, inglês e espanhol
- [ ] Busca executada com texto transcrito
- [ ] Feedback visual da transcrição
- [ ] Botão de ativar/desativar voz
- [ ] Fallback para digitação se voz não funcionar

---

## REQ-000213 — Search com Sinônimos e Correlações

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Search |
| **API** | API-000213 |
| **DB** | search_synonyms |
| **Teste** | TEST-000213 |
| **Dependências** | REQ-000087 |

**Descrição:**
Dicionário de sinônimos e termos correlacionados para enriquecer resultados de busca.

**Critérios de Aceitação:**
- [ ] Sinônimos configurados: "palestra" ? "talk" ? "apresentação"
- [ ] Correlações: "ingresso" ? "ticket", "entrada", "passaporte"
- [ ] Sinônimos por idioma
- [ ] Importação em lote de sinônimos
- [ ] Sugestão automática de sinônimos baseada em analytics
- [ ] Sinônimos por organização ou globais
- [ ] Ativação/desativação de grupos de sinônimos

---

## REQ-000214 — Search com Reindexação Seletiva

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | technical |
| **Módulo** | Search |
| **API** | API-000214 |
| **DB** | search_index_queue |
| **Teste** | TEST-000214 |
| **Dependências** | REQ-000091 |

**Descrição:**
Reindexação seletiva de entidades específicas sem precisar reindexar todo o banco.

**Critérios de Aceitação:**
- [ ] Reindexar entidade por ID específico
- [ ] Reindexar entidades por tipo (apenas eventos)
- [ ] Reindexar entidades por organização
- [ ] Reindexação em background sem downtime
- [ ] Progresso da reindexação por lote
- [ ] Prioridade de reindexação configurável
- [ ] Rollback de lote em caso de falha

---

## REQ-000215 — Search com Paginação Otimizada

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | technical |
| **Módulo** | Search |
| **API** | API-000215 |
| **DB** | search_pagination_cache |
| **Teste** | TEST-000215 |
| **Dependências** | REQ-000087 |

**Descrição:**
Paginação otimizada de resultados de busca com suporte a busca após (cursor-based).

**Critérios de Aceitação:**
- [ ] Paginação cursor-based para grandes volumes
- [ ] Offset-based para volumes pequenos
- [ ] Scroll infinito com cursor
- [ ] Cache de resultados para navegação fluida
- [ ] Total de resultados exibido aproximado
- [ ] Performance consistente em qualquer página
- [ ] Limite máximo de 10.000 resultados via paginação

---

## REQ-000216 — Face Recognition com Anti-Spoofing Avançado

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | security |
| **Módulo** | Face Recognition |
| **API** | API-000216 |
| **DB** | face_antispoofing_logs |
| **Teste** | TEST-000216 |
| **Dependências** | REQ-000095 |

**Descrição:**
Camadas avançadas de anti-spoofing incluindo análise de textura, profundidade e movimento.

**Critérios de Aceitação:**
- [ ] Análise de textura da pele (padrão LBP)
- [ ] Detecção de profundidade (3D vs 2D)
- [ ] Análise de movimento ocular e microexpressões
- [ ] Bloqueio de máscaras e manequins
- [ ] Bloqueio de deepfake e vídeos gerados por IA
- [ ] Score de anti-spoofing composto
- [ ] Atualização contínua do modelo contra novas fraudes

---

## REQ-000217 — Face Recognition com Criptografia Homomórfica

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | security |
| **Módulo** | Face Recognition |
| **API** | API-000217 |
| **DB** | face_homomorphic_encryption |
| **Teste** | TEST-000217 |
| **Dependências** | REQ-000098 |

**Descrição:**
Processamento de templates faciais com criptografia homomórfica para privacidade total.

**Critérios de Aceitação:**
- [ ] Templates criptografados nunca descriptografados em memória
- [ ] Matching facial sobre dados criptografados
- [ ] Chave de descriptografia sob controle do cliente
- [ ] Performance degrada máximo 30% vs não criptografado
- [ ] Suporte a deleção segura de chaves
- [ ] Compliance com privacidade desde a concepção
- [ ] Auditoria de acesso a chaves

---

## REQ-000218 — Face Recognition com Modo Liveness Passivo

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Face Recognition |
| **API** | API-000218 |
| **DB** | face_passive_liveness |
| **Teste** | TEST-000218 |
| **Dependências** | REQ-000095 |

**Descrição:**
Detecção de vida passiva que não requer ação do usuário (sem piscar, sorrir, etc).

**Critérios de Aceitação:**
- [ ] Análise de movimento natural da face
- [ ] Detecção de profundidade por câmera monocular
- [ ] Tempo de detecção inferior a 1 segundo
- [ ] Funciona em baixa luminosidade
- [ ] Taxa de acerto superior a 99%
- [ ] Experiência fluida sem instruções ao usuário
- [ ] Modo híbrido: passivo + ativo se necessário

---

## REQ-000219 — Face Recognition com Escalabilidade Horizontal

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | technical |
| **Módulo** | Face Recognition |
| **API** | API-000219 |
| **DB** | face_cluster_nodes |
| **Teste** | TEST-000219 |
| **Dependências** | REQ-000093 |

**Descrição:**
Arquitetura de reconhecimento facial escalável horizontalmente para eventos de grande porte.

**Critérios de Aceitação:**
- [ ] Múltiplos nós de processamento facial
- [ ] Balanceamento de carga entre nós
- [ ] Cache distribuído de templates
- [ ] Escalonamento automático baseado em demanda
- [ ] Suporte a 1.000 requisições simultâneas
- [ ] Latência média inferior a 1 segundo
- [ ] Tolerância a falha de nó individual

---

## REQ-000220 — Face Recognition com Modo Delegado

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | Face Recognition |
| **API** | API-000220 |
| **Teste** | TEST-000220 |
| **Dependências** | REQ-000096 |

**Descrição:**
Permite que um usuário autorizado realize verificação facial em nome de outro (delegação).

**Critérios de Aceitação:**
- [ ] Delegado registrado com permissão específica
- [ ] Verificação facial delegada registrada em nome do delegado
- [ ] Limite de delegações por usuário
- [ ] Notificação ao usuário original sobre delegação
- [ ] Revogação de delegação a qualquer momento
- [ ] Auditoria: quem verificou e em nome de quem
- [ ] Aplicação: responsável por menor, tutores

---

## REQ-000221 — White Label com Portal do Participante

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000221 |
| **DB** | whitelabel_portal_config |
| **Teste** | TEST-000221 |
| **Dependências** | REQ-000099 |

**Descrição:**
Portal do participante completamente white-label com URL, identidade e conteúdo customizados.

**Critérios de Aceitação:**
- [ ] URL do portal: {organizacao}.eventos.ai ou domínio próprio
- [ ] Header, footer e cores da organização
- [ ] Conteúdo estático customizado (sobre, contato, FAQ)
- [ ] Página inicial com branding completo
- [ ] Menu de navegação customizável
- [ ] Rodapé com links personalizados
- [ ] Analytics integrado (Google Analytics customizado)

---

## REQ-000222 — White Label com Página de Evento Customizada

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000222 |
| **DB** | whitelabel_event_pages |
| **Teste** | TEST-000222 |
| **Dependências** | REQ-000100 |

**Descrição:**
Páginas de evento com identidade visual completa e seções customizáveis.

**Critérios de Aceitação:**
- [ ] Banner do evento com imagem ou vídeo
- [ ] Seções: sobre, programação, palestrantes, ingressos, local
- [ ] Ordem e visibilidade das seções configuráveis
- [ ] Cores e fontes do evento independentes da organização
- [ ] Imagens de fundo e ícones customizados
- [ ] CTA (call-to-action) customizado
- [ ] Preview responsivo antes de publicar

---

## REQ-000223 — White Label com MLS (Multi-Language Support)

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000223 |
| **DB** | whitelabel_i18n |
| **Teste** | TEST-000223 |
| **Dependências** | REQ-000020, REQ-000100 |

**Descrição:**
Conteúdo white-label disponível em múltiplos idiomas com gerenciamento de tradução.

**Critérios de Aceitação:**
- [ ] Idiomas ativados por organização
- [ ] Seletor de idioma no portal
- [ ] Conteúdo estático traduzido manualmente
- [ ] Conteúdo dinâmico traduzido automaticamente
- [ ] Tradução de e-mails por idioma
- [ ] Preferência de idioma por usuário
- [ ] Serviço de tradução integrado (DeepL, Google Translate)

---

## REQ-000224 — White Label com Checkout Customizado

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000224 |
| **DB** | whitelabel_checkout_config |
| **Teste** | TEST-000224 |
| **Dependências** | REQ-000028 |

**Descrição:**
Página de checkout com identidade visual da organização e fluxo customizado.

**Critérios de Aceitação:**
- [ ] Logo e cores da organização no checkout
- [ ] Campos adicionais customizados no formulário
- [ ] Termos e condições customizados
- [ ] Política de privacidade vinculada
- [ ] Página de confirmação customizada
- [ ] E-mail de confirmação com branding
- [ ] Domínio do checkout customizado

---

## REQ-000225 — White Label com SEO Customizado

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | White Label |
| **API** | API-000225 |
| **DB** | whitelabel_seo_configs |
| **Teste** | TEST-000225 |
| **Dependências** | REQ-000099 |

**Descrição:**
Configurações de SEO customizadas por organização para ranqueamento em buscadores.

**Critérios de Aceitação:**
- [ ] Meta title e description por página
- [ ] Open Graph tags customizadas
- [ ] Sitemap.xml gerado automaticamente
- [ ] Robots.txt configurável
- [ ] Structured data (JSON-LD) para eventos
- [ ] URL amigável customizada
- [ ] Google Search Console integrado

---

## REQ-000226 — Access Control com Pulseiras RFID

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000226 |
| **DB** | acs_rfid_wristbands |
| **Teste** | TEST-000226 |
| **Dependências** | REQ-000107 |

**Descrição:**
Gestão de pulseiras RFID para controle de acesso em eventos presenciais.

**Critérios de Aceitação:**
- [ ] Pulseira com chip RFID único
- [ ] Associação da pulseira ao ticket do participante
- [ ] Ativação da pulseira no check-in
- [ ] Leitura por aproximação em catracas
- [ ] Bloqueio remoto de pulseira perdida
- [ ] Reatribuição de pulseira para outro participante
- [ ] Relatório de pulseiras ativas por lote

---

## REQ-000227 — Access Control com Zonas de Acesso

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000227 |
| **DB** | acs_zones, acs_zone_access |
| **Teste** | TEST-000227 |
| **Dependências** | REQ-000105 |

**Descrição:**
Define zonas de acesso restrito dentro do evento com permissões específicas por credencial.

**Critérios de Aceitação:**
- [ ] Zonas: camarote, backstage, área VIP, estacionamento
- [ ] Ticket define quais zonas o participante pode acessar
- [ ] Catraca valida permissão de zona
- [ ] Mapa do evento com zonas destacadas
- [ ] Relatório de acesso por zona
- [ ] Override de zona para emergência
- [ ] Limite de pessoas por zona em tempo real

---

## REQ-000228 — Access Control com Integração de Câmeras

| Campo | Valor |
|-------|-------|
| **Prioridade** | low |
| **Tipo** | technical |
| **Módulo** | Access Control |
| **API** | API-000228 |
| **DB** | acs_camera_integration |
| **Teste** | TEST-000228 |
| **Dependências** | REQ-000008 |

**Descrição:**
Integração com câmeras de segurança para captura de imagem no momento do check-in.

**Critérios de Aceitação:**
- [ ] Captura de foto no momento da liberação da catraca
- [ ] Foto associada ao registro de check-in
- [ ] Busca de participante por foto no log
- [ ] Integração com câmeras IP via ONVIF
- [ ] Armazenamento seguro das imagens
- [ ] Retenção configurável (padrão 30 dias)
- [ ] Acesso restrito a imagens (auditado)

---

## REQ-000229 — Access Control com Relatório de Ocupação

| Campo | Valor |
|-------|-------|
| **Prioridade** | medium |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000229 |
| **DB** | acs_occupancy_reports |
| **Tela** | SCREEN-229 |
| **Teste** | TEST-000229 |
| **Dependências** | REQ-000105 |

**Descrição:**
Relatórios de ocupação em tempo real por zona, setor e acesso total ao evento.

**Critérios de Aceitação:**
- [ ] Ocupação atual por zona e total do evento
- [ ] Percentual de capacidade utilizada
- [ ] Fluxo de entrada e saída por horário
- [ ] Previsão de pico baseada em dados históricos
- [ ] Alerta de lotação máxima por zona
- [ ] Relatório exportável em tempo real
- [ ] Dashboard com mapa de calor de ocupação

---

## REQ-000230 — Access Control com Evacuação de Emergência

| Campo | Valor |
|-------|-------|
| **Prioridade** | high |
| **Tipo** | functional |
| **Módulo** | Access Control |
| **API** | API-000230 |
| **DB** | acs_evacuation_plans |
| **Teste** | TEST-000230 |
| **Dependências** | REQ-000110 |

**Descrição:**
Modo de evacuação de emergência que libera todas as catracas e registra saídas.

**Critérios de Aceitação:**
- [ ] Botão de pânico libera todas as saídas
- [ ] Alarme sonoro disparado nas catracas
- [ ] Registro de horário de início e fim da evacuação
- [ ] Contagem de pessoas que saíram
- [ ] Mapa de saídas de emergência exibido
- [ ] Notificação enviada para coordenadores
- [ ] Relatório pós-evacuação com tempo total
