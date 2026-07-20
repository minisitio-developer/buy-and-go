# VOL-004 — Database Model

**EventOS AI Enterprise**
**Versão:** 0.0.1
**Status:** Draft

---

## Database Strategy

| Database | Purpose | Scope |
|----------|---------|-------|
| PostgreSQL | Relational data (transactions, entities) | All services (primary) |
| Redis | Cache, sessions, real-time, queues | All services |
| ElasticSearch | Full-text search, analytics | Search service |
| ClickHouse | Analytical queries, BI dashboards | Analytics service |
| Neo4j | Graph relationships (networking) | Networking service |
| MongoDB | Flexible documents (surveys, content) | Academy, Marketplace |
| S3/R2 | File storage (images, videos, docs) | Storage service |
| pgvector / Qdrant | Vector embeddings (AI) | AI service |

---

## Naming Conventions

```
Tables:       plural_snake_case (e.g., users, event_tickets)
Columns:      snake_case
Primary Keys: uuid (ULID recommended)
Foreign Keys: singular_id (e.g., user_id, event_id)
Indexes:      idx_{table}_{column}
Unique:       uq_{table}_{column}
Timestamps:   created_at, updated_at, deleted_at (soft delete)
```

---

## Core Domain: Users & Identity

### `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| email | VARCHAR(255) | NOT NULL UNIQUE | |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt |
| name | VARCHAR(255) | NOT NULL | |
| document | VARCHAR(20) | | CPF/CNPJ |
| phone | VARCHAR(20) | | |
| avatar_url | VARCHAR(500) | | |
| locale | VARCHAR(10) | DEFAULT 'pt-BR' | |
| timezone | VARCHAR(50) | DEFAULT 'America/Sao_Paulo' | |
| email_verified_at | TIMESTAMPTZ | | |
| phone_verified_at | TIMESTAMPTZ | | |
| is_active | BOOLEAN | DEFAULT true | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | | Soft delete |

**Indexes:**
- `idx_users_email` ON email (unique)
- `idx_users_document` ON document
- `idx_users_created_at` ON created_at
- `idx_users_deleted_at` ON deleted_at (partial, IS NULL)

---

### `organizations` (Tenants)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(100) | NOT NULL UNIQUE | URL-friendly name |
| logo_url | VARCHAR(500) | | |
| document | VARCHAR(20) | | CNPJ |
| plan | VARCHAR(50) | NOT NULL DEFAULT 'starter' | starter/professional/enterprise |
| status | VARCHAR(20) | NOT NULL DEFAULT 'active' | active/trial/suspended/cancelled |
| settings | JSONB | DEFAULT '{}' | White-label settings |
| features | JSONB | DEFAULT '{}' | Feature flags |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | | |

**Indexes:**
- `uq_organizations_slug` ON slug (unique)
- `idx_organizations_plan` ON plan
- `idx_organizations_status` ON status

---

### `organization_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| user_id | UUID | FK -> users.id | |
| role | VARCHAR(50) | NOT NULL | owner/admin/manager/staff |
| permissions | JSONB | DEFAULT '[]' | Granular permissions |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_org_member` ON (organization_id, user_id) UNIQUE
- `idx_org_members_user` ON user_id
- `idx_org_members_role` ON role

---

## Events

### `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(150) | NOT NULL | |
| description | TEXT | | |
| short_description | VARCHAR(500) | | |
| type | VARCHAR(50) | NOT NULL | presential/hybrid/online |
| category | VARCHAR(100) | | conference/fair/congress/show |
| status | VARCHAR(30) | NOT NULL DEFAULT 'draft' | draft/published/cancelled/finished |
| visibility | VARCHAR(20) | NOT NULL DEFAULT 'public' | public/private/restricted |
| timezone | VARCHAR(50) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'BRL' | |
| language | VARCHAR(10) | DEFAULT 'pt-BR' | |
| start_date | TIMESTAMPTZ | NOT NULL | |
| end_date | TIMESTAMPTZ | NOT NULL | |
| capacity | INTEGER | | Maximum attendees |
| expected_public | INTEGER | | |
| location_name | VARCHAR(255) | | |
| address | TEXT | | |
| city | VARCHAR(100) | | |
| state | VARCHAR(50) | | |
| country | VARCHAR(50) | DEFAULT 'Brasil' | |
| latitude | DECIMAL(10,7) | | |
| longitude | DECIMAL(10,7) | | |
| banner_url | VARCHAR(500) | | |
| logo_url | VARCHAR(500) | | |
| website_url | VARCHAR(500) | | |
| hashtag | VARCHAR(100) | | Social media |
| cover_image | VARCHAR(500) | | |
| video_url | VARCHAR(500) | | Promotional video |
| settings | JSONB | DEFAULT '{}' | Event-specific settings |
| created_by | UUID | FK -> users.id | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | | |

**Indexes:**
- `uq_events_slug_org` ON (organization_id, slug) UNIQUE
- `idx_events_organization` ON organization_id
- `idx_events_status` ON status
- `idx_events_category` ON category
- `idx_events_dates` ON (start_date, end_date)
- `idx_events_city` ON city
- `idx_events_deleted_at` ON deleted_at (partial)

---

### `event_schedules`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK -> events.id | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| speaker | VARCHAR(255) | | |
| speaker_bio | TEXT | | |
| room | VARCHAR(100) | | |
| stage | VARCHAR(100) | | |
| start_time | TIMESTAMPTZ | NOT NULL | |
| end_time | TIMESTAMPTZ | NOT NULL | |
| type | VARCHAR(50) | | lecture/workshop/palestra/oficina |
| capacity | INTEGER | | |
| has_certificate | BOOLEAN | DEFAULT false | |
| sort_order | INTEGER | DEFAULT 0 | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_schedule_event` ON event_id
- `idx_schedule_time` ON (event_id, start_time)
- `idx_schedule_speaker` ON speaker

---

### `event_rooms`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK -> events.id | |
| name | VARCHAR(255) | NOT NULL | |
| capacity | INTEGER | | |
| floor | VARCHAR(50) | | |
| location | VARCHAR(255) | | |
| type | VARCHAR(50) | | auditorium/room/outdoor |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Tickets

### `ticket_types`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK -> events.id | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| price | DECIMAL(10,2) | NOT NULL | |
| original_price | DECIMAL(10,2) | | For discounts display |
| quantity | INTEGER | NOT NULL | Total available |
| sold | INTEGER | DEFAULT 0 | |
| min_per_order | INTEGER | DEFAULT 1 | |
| max_per_order | INTEGER | DEFAULT 10 | |
| sale_start | TIMESTAMPTZ | | |
| sale_end | TIMESTAMPTZ | | |
| status | VARCHAR(20) | DEFAULT 'active' | active/paused/sold_out |
| requires_document | BOOLEAN | DEFAULT false | |
| requires_approval | BOOLEAN | DEFAULT false | |
| has_seat_number | BOOLEAN | DEFAULT false | |
| sort_order | INTEGER | DEFAULT 0 | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_ticket_types_event` ON event_id
- `idx_ticket_types_status` ON (event_id, status)

---

### `ticket_lots`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| ticket_type_id | UUID | FK -> ticket_types.id | |
| name | VARCHAR(255) | NOT NULL | "1º Lote", "2º Lote" |
| price | DECIMAL(10,2) | NOT NULL | |
| quantity | INTEGER | NOT NULL | |
| sold | INTEGER | DEFAULT 0 | |
| start_date | TIMESTAMPTZ | NOT NULL | |
| end_date | TIMESTAMPTZ | NOT NULL | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_lots_ticket_type` ON ticket_type_id
- `idx_lots_dates` ON (start_date, end_date)

---

### `coupons`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| event_id | UUID | FK -> events.id (nullable) | NULL = global |
| code | VARCHAR(50) | NOT NULL | |
| discount_type | VARCHAR(20) | NOT NULL | percentage/fixed |
| discount_value | DECIMAL(10,2) | NOT NULL | |
| max_uses | INTEGER | | |
| used_count | INTEGER | DEFAULT 0 | |
| min_tickets | INTEGER | DEFAULT 1 | |
| max_tickets | INTEGER | | |
| valid_from | TIMESTAMPTZ | | |
| valid_until | TIMESTAMPTZ | | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_coupon_code_event` ON (event_id, code) UNIQUE
- `idx_coupons_event` ON event_id

---

### `orders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| event_id | UUID | FK -> events.id | |
| user_id | UUID | FK -> users.id | Buyer |
| status | VARCHAR(30) | NOT NULL DEFAULT 'pending' | pending/confirmed/cancelled/refunded |
| total | DECIMAL(10,2) | NOT NULL | |
| discount | DECIMAL(10,2) | DEFAULT 0 | |
| fee | DECIMAL(10,2) | DEFAULT 0 | Platform fee |
| net_total | DECIMAL(10,2) | NOT NULL | Total - fee |
| payment_method | VARCHAR(50) | | credit_card/pix/boleto |
| payment_id | VARCHAR(255) | | External payment ID |
| coupon_id | UUID | FK -> coupons.id | |
| notes | TEXT | | |
| paid_at | TIMESTAMPTZ | | |
| refunded_at | TIMESTAMPTZ | | |
| cancelled_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_orders_event` ON event_id
- `idx_orders_user` ON user_id
- `idx_orders_status` ON status
- `idx_orders_payment` ON payment_id
- `idx_orders_created_at` ON created_at

---

### `order_items` (Tickets sold)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| order_id | UUID | FK -> orders.id | |
| ticket_type_id | UUID | FK -> ticket_types.id | |
| lot_id | UUID | FK -> ticket_lots.id | |
| attendee_id | UUID | FK -> attendees.id | |
| unit_price | DECIMAL(10,2) | NOT NULL | |
| quantity | INTEGER | DEFAULT 1 | |
| total | DECIMAL(10,2) | NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Attendees & Check-in

### `attendees`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id (nullable) | Registered user |
| event_id | UUID | FK -> events.id | |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL | |
| phone | VARCHAR(20) | | |
| document | VARCHAR(20) | | CPF/RG |
| document_type | VARCHAR(20) | | CPF/RG/Passport |
| company | VARCHAR(255) | | |
| position | VARCHAR(255) | | Job title |
| category | VARCHAR(50) | | visitor/sponsor/speaker/staff/press/vip |
| is_approved | BOOLEAN | DEFAULT true | |
| metadata | JSONB | DEFAULT '{}' | Custom fields |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_attendee_event_email` ON (event_id, email) UNIQUE
- `idx_attendees_event` ON event_id
- `idx_attendees_user` ON user_id
- `idx_attendees_category` ON category
- `idx_attendees_company` ON company

---

### `check_ins`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| attendee_id | UUID | FK -> attendees.id | |
| event_id | UUID | FK -> events.id | |
| method | VARCHAR(30) | NOT NULL | qr/manual/face/nfc/rfid |
| checked_in_by | UUID | FK -> users.id (nullable) | Staff who checked in |
| device_id | VARCHAR(255) | | |
| ip_address | VARCHAR(45) | | |
| location | JSONB | | GPS coordinates |
| photo_url | VARCHAR(500) | | Face check-in photo |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_checkin_attendee` ON attendee_id
- `idx_checkin_event` ON event_id
- `idx_checkin_method` ON method
- `idx_checkin_created_at` ON created_at

---

### `credentials`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| attendee_id | UUID | FK -> attendees.id | |
| event_id | UUID | FK -> events.id | |
| qr_code | VARCHAR(255) | NOT NULL UNIQUE | |
| qr_data | TEXT | | Encoded data |
| nfc_tag | VARCHAR(255) | | |
| rfid_tag | VARCHAR(255) | | |
| printed_at | TIMESTAMPTZ | | |
| issued_at | TIMESTAMPTZ | DEFAULT NOW() | |
| expires_at | TIMESTAMPTZ | | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_credential_qr` ON qr_code (unique)
- `idx_credential_attendee` ON attendee_id
- `idx_credential_event` ON event_id
- `idx_credential_nfc` ON nfc_tag
- `idx_credential_rfid` ON rfid_tag

---

## CRM

### `crm_pipelines`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| is_default | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `crm_stages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| pipeline_id | UUID | FK -> crm_pipelines.id | |
| name | VARCHAR(255) | NOT NULL | |
| position | INTEGER | NOT NULL | Order |
| color | VARCHAR(20) | | |
| probability | INTEGER | DEFAULT 0 | Win probability % |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `crm_deals`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| pipeline_id | UUID | FK -> crm_pipelines.id | |
| stage_id | UUID | FK -> crm_stages.id | |
| title | VARCHAR(255) | NOT NULL | |
| value | DECIMAL(10,2) | DEFAULT 0 | |
| contact_id | UUID | FK -> crm_contacts.id | |
| owner_id | UUID | FK -> users.id | |
| source | VARCHAR(50) | | |
| expected_close | DATE | | |
| closed_at | TIMESTAMPTZ | | |
| lost_reason | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `crm_contacts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| user_id | UUID | FK -> users.id (nullable) | |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | | |
| phone | VARCHAR(20) | | |
| document | VARCHAR(20) | | |
| company | VARCHAR(255) | | |
| position | VARCHAR(255) | | |
| source | VARCHAR(50) | | |
| tags | JSONB | DEFAULT '[]' | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Sponsors

### `sponsors`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| event_id | UUID | FK -> events.id (nullable) | |
| name | VARCHAR(255) | NOT NULL | |
| logo_url | VARCHAR(500) | | |
| website | VARCHAR(500) | | |
| tier | VARCHAR(50) | | diamond/gold/silver/bronze |
| category | VARCHAR(100) | | |
| description | TEXT | | |
| contract_value | DECIMAL(10,2) | | |
| signed_at | TIMESTAMPTZ | | |
| benefits | JSONB | DEFAULT '[]' | |
| contact_id | UUID | FK -> crm_contacts.id | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## AI Agents

### `ai_agents`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| name | VARCHAR(255) | NOT NULL | |
| type | VARCHAR(50) | NOT NULL | organizer/marketing/analytics/crm/support |
| description | TEXT | | |
| system_prompt | TEXT | NOT NULL | |
| tools | JSONB | DEFAULT '[]' | Available tools |
| model | VARCHAR(100) | DEFAULT 'gpt-4o' | |
| temperature | DECIMAL(2,1) | DEFAULT 0.7 | |
| max_tokens | INTEGER | DEFAULT 4096 | |
| memory_config | JSONB | DEFAULT '{}' | |
| rag_config | JSONB | DEFAULT '{}' | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `ai_conversations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| agent_id | UUID | FK -> ai_agents.id | |
| organization_id | UUID | FK -> organizations.id | |
| user_id | UUID | FK -> users.id | |
| session_id | VARCHAR(255) | | |
| title | VARCHAR(255) | | |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `ai_messages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| conversation_id | UUID | FK -> ai_conversations.id | |
| role | VARCHAR(20) | NOT NULL | user/assistant/system/tool |
| content | TEXT | NOT NULL | |
| tool_calls | JSONB | | |
| tool_results | JSONB | | |
| tokens | INTEGER | | |
| latency_ms | INTEGER | | |
| model | VARCHAR(100) | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Networking

### `networking_profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| event_id | UUID | FK -> events.id | |
| headline | VARCHAR(255) | | |
| bio | TEXT | | |
| interests | JSONB | DEFAULT '[]' | |
| skills | JSONB | DEFAULT '[]' | |
| looking_for | JSONB | DEFAULT '[]' | partnership/job/investment |
| linkedin | VARCHAR(255) | | |
| website | VARCHAR(500) | | |
| is_visible | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `networking_matches`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK -> events.id | |
| profile_a | UUID | FK -> networking_profiles.id | |
| profile_b | UUID | FK -> networking_profiles.id | |
| score | DECIMAL(5,2) | | Match percentage |
| match_type | VARCHAR(50) | | same_segment/same_interest/same_goal |
| is_mutual | BOOLEAN | DEFAULT false | |
| a_interested | BOOLEAN | DEFAULT false | |
| b_interested | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Gamification

### `gamification_actions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK -> events.id | |
| key | VARCHAR(100) | NOT NULL | check_in/visit_booth/share/survey |
| name | VARCHAR(255) | NOT NULL | |
| points | INTEGER | NOT NULL | |
| max_per_user | INTEGER | DEFAULT 1 | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `gamification_user_points`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| event_id | UUID | FK -> events.id | |
| points | INTEGER | DEFAULT 0 | |
| level | INTEGER | DEFAULT 1 | |
| rank | INTEGER | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Certificates

### `certificates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| event_id | UUID | FK -> events.id | |
| attendee_id | UUID | FK -> attendees.id | |
| template_id | UUID | FK -> certificate_templates.id | |
| code | VARCHAR(100) | NOT NULL UNIQUE | |
| url | VARCHAR(500) | | Public verification URL |
| issued_at | TIMESTAMPTZ | DEFAULT NOW() | |
| blockchain_hash | VARCHAR(255) | | Blockchain verification |
| digital_signature | TEXT | | |
| metadata | JSONB | DEFAULT '{}' | |
| is_valid | BOOLEAN | DEFAULT true | |

---

## Audit & LGPD

### `audit_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| user_id | UUID | FK -> users.id (nullable) | |
| event_id | UUID | FK -> events.id (nullable) | |
| action | VARCHAR(100) | NOT NULL | created/updated/deleted/viewed |
| entity_type | VARCHAR(100) | NOT NULL | event/ticket/user/sponsor |
| entity_id | UUID | NOT NULL | |
| changes | JSONB | | Before/after diff |
| ip_address | VARCHAR(45) | | |
| user_agent | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_audit_org` ON organization_id
- `idx_audit_user` ON user_id
- `idx_audit_entity` ON (entity_type, entity_id)
- `idx_audit_action` ON action
- `idx_audit_created_at` ON created_at

---

### `lgpd_consents`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| organization_id | UUID | FK -> organizations.id | |
| consent_type | VARCHAR(50) | NOT NULL | marketing/analytics/third_party/biometric |
| is_granted | BOOLEAN | NOT NULL | |
| granted_at | TIMESTAMPTZ | DEFAULT NOW() | |
| revoked_at | TIMESTAMPTZ | | |
| ip_address | VARCHAR(45) | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## ERD (Conceptual)

```
organizations 1──N events
organizations 1──N users (through members)
organizations 1──N crm_pipelines
organizations 1──N sponsors
organizations 1──N ai_agents

events 1──N ticket_types
events 1──N event_schedules
events 1──N event_rooms
events 1──N attendees
events 1──N check_ins
events 1──N credentials
events 1──N networking_profiles
events 1──N gamification_actions
events 1──N certificates

ticket_types 1──N ticket_lots
ticket_types 1──N order_items

orders 1──N order_items
orders N──1 users

attendees 1──1 check_ins
attendees 1──1 credentials
attendees 1──N certificates

crm_pipelines 1──N crm_stages
crm_stages 1──N crm_deals

crm_contacts 1──N crm_deals
crm_contacts 1──N sponsors

ai_agents 1──N ai_conversations
ai_conversations 1──N ai_messages

networking_profiles N──N networking_matches
```

---

## Marketplace

### `products`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| event_id | UUID | FK -> events.id (nullable) | NULL = available across all events |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| price | DECIMAL(10,2) | NOT NULL | |
| type | VARCHAR(20) | NOT NULL | course/digital/physical/service |
| status | VARCHAR(20) | NOT NULL DEFAULT 'draft' | draft/published/archived |
| inventory | INTEGER | DEFAULT 0 | Stock count (-1 = unlimited) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_products_organization` ON organization_id
- `idx_products_event` ON event_id
- `idx_products_type` ON type
- `idx_products_status` ON status

---

### `product_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(150) | NOT NULL UNIQUE | |
| parent_id | UUID | FK -> product_categories.id (nullable) | Self-referential hierarchy |

**Indexes:**
- `uq_product_categories_slug` ON slug (unique)
- `idx_product_categories_parent` ON parent_id

---

### `orders_marketplace`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| buyer_id | UUID | FK -> users.id | |
| seller_id | UUID | FK -> organizations.id | |
| total | DECIMAL(10,2) | NOT NULL | |
| commission | DECIMAL(10,2) | DEFAULT 0 | Platform commission |
| status | VARCHAR(30) | NOT NULL DEFAULT 'pending' | pending/confirmed/shipped/delivered/cancelled/refunded |
| payment_id | VARCHAR(255) | | External payment ID |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_orders_mkt_buyer` ON buyer_id
- `idx_orders_mkt_seller` ON seller_id
- `idx_orders_mkt_status` ON status
- `idx_orders_mkt_payment` ON payment_id

---

### `order_items_marketplace`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| order_id | UUID | FK -> orders_marketplace.id | |
| product_id | UUID | FK -> products.id | |
| quantity | INTEGER | NOT NULL DEFAULT 1 | |
| unit_price | DECIMAL(10,2) | NOT NULL | |
| total | DECIMAL(10,2) | NOT NULL | |

**Indexes:**
- `idx_order_items_mkt_order` ON order_id
- `idx_order_items_mkt_product` ON product_id

---

### `commissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| order_id | UUID | FK -> orders_marketplace.id | |
| seller_id | UUID | FK -> organizations.id | |
| amount | DECIMAL(10,2) | NOT NULL | |
| rate | DECIMAL(5,2) | NOT NULL | Percentage applied |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending' | pending/paid/cancelled |
| paid_at | TIMESTAMPTZ | | |

**Indexes:**
- `idx_commissions_order` ON order_id
- `idx_commissions_seller` ON seller_id
- `idx_commissions_status` ON status

---

### `reviews`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| product_id | UUID | FK -> products.id | |
| user_id | UUID | FK -> users.id | |
| rating | INTEGER | NOT NULL CHECK (rating >= 1 AND rating <= 5) | |
| comment | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_reviews_product` ON product_id
- `idx_reviews_user` ON user_id
- `idx_reviews_rating` ON rating

---

### `cart_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| product_id | UUID | FK -> products.id | |
| quantity | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_cart_items_user` ON user_id
- `idx_cart_items_product` ON product_id
- `uq_cart_user_product` ON (user_id, product_id) UNIQUE

---

### `seller_profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id UNIQUE | One profile per org |
| name | VARCHAR(255) | NOT NULL | Storefront name |
| description | TEXT | | |
| rating | DECIMAL(2,1) | DEFAULT 0.0 | Average rating |
| sales_count | INTEGER | DEFAULT 0 | |

**Indexes:**
- `uq_seller_profile_org` ON organization_id (unique)
- `idx_seller_profiles_rating` ON rating

---

## Community

### `forums`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK -> events.id | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_forums_event` ON event_id

---

### `forum_topics`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| forum_id | UUID | FK -> forums.id | |
| user_id | UUID | FK -> users.id | |
| title | VARCHAR(255) | NOT NULL | |
| content | TEXT | NOT NULL | |
| pinned | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_forum_topics_forum` ON forum_id
- `idx_forum_topics_user` ON user_id
- `idx_forum_topics_pinned` ON (forum_id, pinned)

---

### `forum_posts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| topic_id | UUID | FK -> forum_topics.id | |
| user_id | UUID | FK -> users.id | |
| content | TEXT | NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_forum_posts_topic` ON topic_id
- `idx_forum_posts_user` ON user_id

---

### `groups`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK -> events.id | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| type | VARCHAR(20) | NOT NULL DEFAULT 'open' | open/closed |
| created_by | UUID | FK -> users.id | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_groups_event` ON event_id
- `idx_groups_type` ON type

---

### `group_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| group_id | UUID | FK -> groups.id | |
| user_id | UUID | FK -> users.id | |
| role | VARCHAR(20) | DEFAULT 'member' | member/moderator/admin |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_group_member` ON (group_id, user_id) UNIQUE
- `idx_group_members_user` ON user_id
- `idx_group_members_role` ON role

---

## Academy

### `courses`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| title | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| cover_url | VARCHAR(500) | | |
| price | DECIMAL(10,2) | DEFAULT 0.00 | 0 = free |
| status | VARCHAR(20) | NOT NULL DEFAULT 'draft' | draft/published/archived |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_courses_organization` ON organization_id
- `idx_courses_status` ON status

---

### `course_lessons`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| course_id | UUID | FK -> courses.id | |
| title | VARCHAR(255) | NOT NULL | |
| content | TEXT | | |
| video_url | VARCHAR(500) | | |
| duration | INTEGER | | Duration in seconds |
| sort_order | INTEGER | DEFAULT 0 | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_lessons_course` ON course_id
- `idx_lessons_order` ON (course_id, sort_order)

---

### `enrollments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| course_id | UUID | FK -> courses.id | |
| user_id | UUID | FK -> users.id | |
| progress | DECIMAL(5,2) | DEFAULT 0.00 | Percentage 0-100 |
| completed_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_enrollment` ON (course_id, user_id) UNIQUE
- `idx_enrollments_user` ON user_id

---

### `lesson_progress`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| enrollment_id | UUID | FK -> enrollments.id | |
| lesson_id | UUID | FK -> course_lessons.id | |
| completed | BOOLEAN | DEFAULT false | |
| time_spent | INTEGER | DEFAULT 0 | Seconds |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_lesson_progress` ON (enrollment_id, lesson_id) UNIQUE
- `idx_lesson_progress_lesson` ON lesson_id

---

### `quizzes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| lesson_id | UUID | FK -> course_lessons.id | |
| title | VARCHAR(255) | NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_quizzes_lesson` ON lesson_id

---

### `quiz_questions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| quiz_id | UUID | FK -> quizzes.id | |
| question | TEXT | NOT NULL | |
| options | JSONB | NOT NULL | Array of answer options |
| correct_answer | VARCHAR(255) | NOT NULL | Correct option value |
| sort_order | INTEGER | DEFAULT 0 | |

**Indexes:**
- `idx_quiz_questions_quiz` ON quiz_id
- `idx_quiz_questions_order` ON (quiz_id, sort_order)

---

### `quiz_attempts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| quiz_id | UUID | FK -> quizzes.id | |
| user_id | UUID | FK -> users.id | |
| score | DECIMAL(5,2) | NOT NULL | Percentage 0-100 |
| answers | JSONB | NOT NULL | User's answers |
| completed_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_quiz_attempts_quiz` ON quiz_id
- `idx_quiz_attempts_user` ON user_id

---

## Billing & Subscriptions

### `plans`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(100) | NOT NULL UNIQUE | |
| price | DECIMAL(10,2) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'BRL' | |
| interval | VARCHAR(20) | NOT NULL | monthly/yearly |
| features | JSONB | DEFAULT '{}' | Feature list |
| limits | JSONB | DEFAULT '{}' | Usage limits |
| active | BOOLEAN | DEFAULT true | |

**Indexes:**
- `uq_plans_slug` ON slug (unique)
- `idx_plans_active` ON active

---

### `subscriptions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| plan_id | UUID | FK -> plans.id | |
| status | VARCHAR(20) | NOT NULL DEFAULT 'active' | active/past_due/cancelled/expired/trialing |
| current_period_start | TIMESTAMPTZ | NOT NULL | |
| current_period_end | TIMESTAMPTZ | NOT NULL | |
| cancel_at_period_end | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_subscriptions_organization` ON organization_id
- `idx_subscriptions_plan` ON plan_id
- `idx_subscriptions_status` ON status
- `idx_subscriptions_period_end` ON current_period_end

---

### `invoices`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| subscription_id | UUID | FK -> subscriptions.id | |
| amount | DECIMAL(10,2) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'BRL' | |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending' | pending/paid/overdue/cancelled/refunded |
| paid_at | TIMESTAMPTZ | | |
| due_date | DATE | NOT NULL | |
| pdf_url | VARCHAR(500) | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_invoices_organization` ON organization_id
- `idx_invoices_subscription` ON subscription_id
- `idx_invoices_status` ON status
- `idx_invoices_due_date` ON due_date

---

### `payment_methods`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| type | VARCHAR(20) | NOT NULL | credit_card/pix/boleto |
| token | VARCHAR(255) | NOT NULL | Gateway token |
| is_default | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_payment_methods_org` ON organization_id
- `idx_payment_methods_type` ON type
- `idx_payment_methods_default` ON (organization_id, is_default)

---

### `usage_records`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| subscription_id | UUID | FK -> subscriptions.id | |
| metric | VARCHAR(100) | NOT NULL | attendees/events/api_calls/storage |
| quantity | INTEGER | NOT NULL | |
| recorded_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_usage_records_subscription` ON subscription_id
- `idx_usage_records_metric` ON (subscription_id, metric)
- `idx_usage_records_recorded_at` ON recorded_at

---

### `credits`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| amount | DECIMAL(10,2) | NOT NULL | Original credit amount |
| balance | DECIMAL(10,2) | NOT NULL | Remaining balance |
| expires_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_credits_organization` ON organization_id
- `idx_credits_expires_at` ON expires_at

---

## IAM (Identity & Access Management)

### `roles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id (nullable) | NULL = system-wide roles |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(100) | NOT NULL | |
| description | TEXT | | |
| is_system | BOOLEAN | DEFAULT false | Cannot be deleted |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_roles_slug_org` ON (organization_id, slug) UNIQUE
- `idx_roles_organization` ON organization_id

---

### `permissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| resource | VARCHAR(100) | NOT NULL | event/user/ticket/sponsor |
| action | VARCHAR(50) | NOT NULL | create/read/update/delete/manage |
| scope | VARCHAR(20) | DEFAULT 'organization' | global/organization/event |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_permission` ON (resource, action, scope) UNIQUE

---

### `role_permissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| role_id | UUID | FK -> roles.id | |
| permission_id | UUID | FK -> permissions.id | |

**Indexes:**
- `uq_role_permission` ON (role_id, permission_id) UNIQUE
- `idx_role_permissions_permission` ON permission_id

---

### `user_roles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| role_id | UUID | FK -> roles.id | |
| organization_id | UUID | FK -> organizations.id | |
| granted_by | UUID | FK -> users.id (nullable) | Who granted the role |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_user_role_org` ON (user_id, role_id, organization_id) UNIQUE
- `idx_user_roles_user` ON user_id
- `idx_user_roles_role` ON role_id
- `idx_user_roles_org` ON organization_id

---

### `api_keys`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| name | VARCHAR(255) | NOT NULL | |
| key_hash | VARCHAR(255) | NOT NULL UNIQUE | SHA-256 hash |
| permissions | JSONB | DEFAULT '[]' | Scoped permissions |
| expires_at | TIMESTAMPTZ | | |
| last_used_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_api_keys_hash` ON key_hash (unique)
- `idx_api_keys_organization` ON organization_id
- `idx_api_keys_expires_at` ON expires_at

---

### `sso_connections`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| organization_id | UUID | FK -> organizations.id | |
| provider | VARCHAR(50) | NOT NULL | google/microsoft/github/keycloak |
| client_id | VARCHAR(255) | NOT NULL | |
| client_secret_enc | TEXT | NOT NULL | Encrypted |
| domains | JSONB | DEFAULT '[]' | Allowed email domains |
| active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_sso_org_provider` ON (organization_id, provider) UNIQUE
- `idx_sso_active` ON active

---

### `mfa_devices`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| type | VARCHAR(20) | NOT NULL | totp/sms/email |
| secret_enc | TEXT | | Encrypted secret |
| verified | BOOLEAN | DEFAULT false | |
| last_used_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_mfa_devices_user` ON user_id
- `idx_mfa_devices_type` ON type

---

### `auth_sessions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| token_hash | VARCHAR(255) | NOT NULL UNIQUE | |
| ip_address | VARCHAR(45) | | |
| user_agent | TEXT | | |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `uq_auth_sessions_token` ON token_hash (unique)
- `idx_auth_sessions_user` ON user_id
- `idx_auth_sessions_expires` ON expires_at

---

## Face Recognition

### `face_templates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| template | BYTEA | NOT NULL | Face embedding vector |
| algorithm | VARCHAR(50) | NOT NULL | face_recognition/deepface/arcface |
| quality_score | DECIMAL(3,2) | | Quality 0.0-1.0 |
| enrolled_at | TIMESTAMPTZ | DEFAULT NOW() | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_face_templates_user` ON user_id
- `idx_face_templates_algorithm` ON algorithm

---

### `face_verifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| event_id | UUID | FK -> events.id | |
| checkin_id | UUID | FK -> check_ins.id (nullable) | |
| score | DECIMAL(5,2) | NOT NULL | Match confidence 0-100 |
| verified | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_face_verifications_user` ON user_id
- `idx_face_verifications_event` ON event_id
- `idx_face_verifications_checkin` ON checkin_id
- `idx_face_verifications_score` ON score

---

## Related Documents

- VOL-001: Strategy & Foundation (BC-001 to BC-027)
- VOL-002: Enterprise Architecture (Microservices mapping)
- VOL-005: APIs (CRUD endpoints per entity)
