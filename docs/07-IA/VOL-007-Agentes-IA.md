# VOL-007 — AI Agents

**EventOS AI Enterprise**
**Versão:** 0.0.1
**Status:** Draft

---

## AI Architecture

```
                    ┌──────────────┐
                    │  AI Gateway   │
                    │  (Rate limit, │
                    │   Auth, Log)  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │  Router  │ │  Memory  │ │   RAG    │
       └────┬─────┘ └────┬─────┘ └────┬─────┘
            │            │            │
            └────────────┼────────────┘
                         │
              ┌──────────▼──────────┐
              │   Agent Manager     │
              │   (Orchestrator)    │
              └──────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Organizer AI │ │ Marketing AI │ │ Analytics AI │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ CRM AI       │ │ Support AI   │ │ Sponsor AI   │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ Security AI  │ │ Compliance   │ │ Networking   │
│              │ │ AI           │ │ AI           │
└──────────────┘ └──────────────┘ └──────────────┘
                         │
                         ▼
                   ┌──────────┐
                   │ MCP      │
                   │ Server   │
                   └──────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Platform APIs   │
              │  (REST/gRPC)     │
              └──────────────────┘
```

---

## AI-000001 — Organizer AI

### Objective
Help organizers create, configure and manage events through natural language.

### System Prompt
```
You are Organizer AI, the event creation specialist for EventOS AI Platform.

Your goal is to help organizers create complete events in under 5 minutes.

When given a simple description like "I want to organize a medical congress for 8,000 people in Brasília for 3 days", you must:
1. Create the event with all default settings
2. Suggest the best ticket types and pricing tiers
3. Create a preliminary schedule with suggested speakers
4. Suggest potential sponsors based on the event category
5. Create the landing page content
6. Set up the accreditation configuration
7. Configure certificates

Always ask clarifying questions when needed, but prefer to make intelligent defaults.
Be proactive. Don't just answer — execute.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `create_event` | Creates a new event | POST /events |
| `update_event` | Updates event settings | PATCH /events/{id} |
| `create_ticket_type` | Adds a ticket type | POST /events/{id}/ticket-types |
| `create_lot` | Adds a pricing lot | POST /ticket-types/{id}/lots |
| `create_schedule` | Adds agenda item | POST /events/{id}/schedules |
| `publish_event` | Publishes event | POST /events/{id}/publish |
| `suggest_sponsors` | AI-suggested sponsors | AI internal |
| `generate_landing_page` | Creates landing page content | POST /events/{id}/landing-page |
| `set_accreditation` | Configures accreditation | PATCH /events/{id}/settings |
| `create_certificate_template` | Creates certificate template | POST /events/{id}/certificate-templates |
| `generate_budget` | Estimates event budget | AI internal |

### Memory
- Remembers previous events created by the organizer
- Learns preferences (pricing style, venue preferences)
- Stores successful patterns

### RAG Sources
- Event configuration best practices
- Pricing benchmarks by category and city
- Speaker database
- Sponsor database by segment

---

## AI-000002 — Marketing AI

### Objective
Create and execute marketing campaigns for events.

### System Prompt
```
You are Marketing AI, the marketing automation specialist for EventOS AI Platform.

Your goal is to create complete marketing campaigns for events.

When given instructions, you must:
1. Create email campaigns (welcome, reminder, last call, post-event)
2. Create WhatsApp message sequences
3. Generate social media posts (Instagram, LinkedIn, Twitter)
4. Create ad copy for Google and Facebook ads
5. Suggest segmentation strategies
6. Create landing page content
7. Schedule and automate sends

Use the event details (date, location, speakers, sponsors) to personalize all content.
Always use the event's branding and tone of voice.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `create_email_campaign` | Creates email campaign | POST /marketing/email |
| `create_whatsapp_campaign` | Creates WhatsApp campaign | POST /marketing/whatsapp |
| `generate_social_post` | Generates social media post | AI internal |
| `create_ad_copy` | Generates ad text | AI internal |
| `segment_audience` | Creates audience segment | POST /marketing/segments |
| `schedule_campaign` | Schedules campaign | PATCH /marketing/campaigns/{id} |
| `create_landing_page` | Creates landing page | POST /events/{id}/landing-page |
| `analyze_campaign` | Analyzes campaign performance | AI internal |

### RAG Sources
- Marketing templates by event type
- Best practices for email subject lines
- Social media post templates
- Segmentation strategies

---

## AI-000003 — Analytics AI

### Objective
Answer natural language questions about event data and generate insights.

### System Prompt
```
You are Analytics AI, the business intelligence specialist for EventOS AI Platform.

Your goal is to answer any question about event data in natural language.

You can answer questions like:
- "How many tickets did we sell today?"
- "Which sponsors had the most booth visits?"
- "What was the peak check-in hour?"
- "How many attendees came from Brasília?"
- "Which lecture had the highest attendance?"
- "What's the average stay duration?"
- "Show me the ROI by sponsor tier"

You have access to real-time data through BI dashboards and SQL queries.
Always provide numbers and, when relevant, comparisons and trends.
Use charts and visualizations when appropriate.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `query_analytics` | Runs SQL on analytics DB | POST /analytics/query |
| `get_dashboard` | Returns dashboard data | GET /analytics/events/{id}/dashboard |
| `get_heatmap` | Returns heatmap data | GET /analytics/events/{id}/heatmap |
| `get_flow` | Returns visitor flow data | GET /analytics/events/{id}/flow |
| `get_roi` | Returns ROI analysis | GET /analytics/events/{id}/roi |
| `generate_report` | Generates PDF report | POST /analytics/reports |
| `compare_events` | Compares multiple events | AI internal |
| `predict_trend` | Predicts attendance trends | AI internal |

### RAG Sources
- Historical event data
- Benchmark metrics by event type
- Industry KPIs

---

## AI-000004 — CRM AI

### Objective
Help manage sales pipelines, leads, contacts, and deal tracking.

### System Prompt
```
You are CRM AI, the sales and relationship specialist for EventOS AI Platform.

Your goal is to help organizers manage their sales pipeline and relationships.

You can:
1. Create and update deals in the pipeline
2. Suggest next actions for deals
3. Score leads based on engagement
4. Create follow-up tasks
5. Generate sales reports
6. Suggest upsell opportunities
7. Manage sponsor negotiations

Track all interactions and keep the pipeline updated.
Be proactive in suggesting actions for stale deals.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `create_deal` | Creates a deal in pipeline | POST /crm/deals |
| `update_deal` | Moves deal between stages | PATCH /crm/deals/{id} |
| `create_contact` | Creates contact | POST /crm/contacts |
| `update_contact` | Updates contact | PATCH /crm/contacts/{id} |
| `create_task` | Creates follow-up task | POST /crm/tasks |
| `score_lead` | Scores lead based on data | AI internal |
| `pipeline_analytics` | Returns pipeline metrics | GET /crm/analytics |
| `suggest_next_action` | Suggests next step for deal | AI internal |

### RAG Sources
- Sales best practices
- Deal closing strategies
- Pipeline management methodologies

---

## AI-000005 — Support AI

### Objective
Answer attendee questions about events, tickets, and logistics.

### System Prompt
```
You are Support AI, the attendee support specialist for EventOS AI Platform.

Your goal is to answer attendee questions quickly and accurately.

You can answer:
- Event schedule and location
- Ticket information and pricing
- Check-in procedures
- Certificate access
- Networking features
- Refund and cancellation policies

Be friendly, helpful, and concise.
If you cannot resolve, escalate to human support.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `find_event` | Searches events | GET /events |
| `get_ticket_info` | Gets ticket details | GET /orders/{id} |
| `get_schedule` | Gets event schedule | GET /events/{id}/schedules |
| `get_certificate` | Gets certificate | GET /attendees/{id}/certificate |
| `create_ticket` | Creates support ticket | POST /support/tickets |
| `escalate` | Escalates to human | POST /support/escalate |

### RAG Sources
- Event FAQ
- Refund and cancellation policies
- Event-specific information
- Platform documentation

---

## AI-000006 — Sponsor AI

### Objective
Provide sponsors with real-time analytics about their performance.

### System Prompt
```
You are Sponsor AI, the sponsor intelligence specialist for EventOS AI Platform.

Your goal is to provide sponsors with detailed analytics about their performance.

You can answer:
- "How many people visited our booth?"
- "What was the average time at our booth?"
- "Who visited more than once?"
- "What's our ROI compared to other sponsors?"
- "Which days had the most traffic?"
- "What's the profile of people who visited us?"

Generate reports automatically after the event.
Benchmark against similar sponsors.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `get_booth_stats` | Booth visit statistics | GET /analytics/booths/{id} |
| `get_visitor_profile` | Visitor profile analysis | GET /analytics/booths/{id}/visitors |
| `get_roi_analysis` | ROI calculation | GET /analytics/booths/{id}/roi |
| `compare_sponsors` | Compare with other sponsors | GET /analytics/sponsors/compare |
| `generate_sponsor_report` | Generate sponsor report | POST /analytics/sponsors/report |

### RAG Sources
- Sponsor tier benchmarks
- Industry ROI averages
- Historical sponsor performance

---

## MCP Server (Model Context Protocol)

The EventOS AI platform exposes an MCP server that allows any MCP-compatible AI (Claude, Cursor, etc.) to interact with the platform programmatically.

### MCP Tools

| Tool | Description |
|------|-------------|
| `create_event` | Create a new event |
| `issue_certificate` | Generate certificates for attendees |
| `create_credentials` | Generate credentials/QR codes |
| `get_dashboard` | Query event dashboard data |
| `register_sponsor` | Add a sponsor to an event |
| `generate_report` | Generate executive report |
| `create_landing_page` | Create event landing page |
| `send_whatsapp` | Send WhatsApp campaign |
| `create_campaign` | Create marketing campaign |
| `analyze_roi` | Analyze sponsor ROI |
| `query_bi` | Natural language BI query |
| `create_qr` | Generate QR code |
| `create_app` | Configure event mobile app |
| `create_schedule` | Add agenda items |
| `reserve_room` | Reserve event room |
| `issue_invoice` | Generate invoice |
| `receive_pix` | Process PIX payment |
| `create_survey` | Create attendee survey |
| `create_badge` | Design and print badges |
| `get_networking_match` | Find networking matches |

### MCP Server Configuration

```json
{
    "name": "eventos-ai-mcp",
    "version": "1.0.0",
    "tools": [
        {
            "name": "create_event",
            "description": "Create a new event",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "type": {"type": "string", "enum": ["presential", "hybrid", "online"]},
                    "start_date": {"type": "string", "format": "date-time"},
                    "end_date": {"type": "string", "format": "date-time"},
                    "capacity": {"type": "integer"}
                },
                "required": ["name", "type", "start_date", "end_date"]
            }
        }
    ]
}
```

---

## AI Routing & Model Selection

| Agent | Primary Model | Fallback | Use Case |
|-------|---------------|----------|----------|
| Organizer AI | GPT-4o / Claude 4 | GPT-4o-mini | Complex event creation |
| Marketing AI | GPT-4o | Claude 3.5 | Content generation |
| Analytics AI | GPT-4o | Claude 4 | Data analysis |
| CRM AI | GPT-4o | Claude 3.5 | Sales assistance |
| Support AI | GPT-4o-mini | Claude 3 Haiku | Quick responses |
| Sponsor AI | GPT-4o | Claude 3.5 | Analytics |

---

## Vector Database Schema

### `embeddings` collection

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| content | TEXT | Original text |
| embedding | vector(1536) | OpenAI/text-embedding-3-small |
| metadata | JSONB | Source, event_id, agent_type |
| created_at | TIMESTAMPTZ | |

### RAG Collections

| Collection | Content | Chunk Size | Overlap |
|------------|---------|------------|---------|
| event_knowledge | Event config, best practices | 500 | 50 |
| sponsor_database | Sponsor profiles | 300 | 30 |
| marketing_templates | Campaign templates | 400 | 40 |
| support_faq | FAQ and policies | 300 | 30 |
| user_history | User past interactions | 200 | 20 |

---

## Related Documents

- VOL-001: Strategy (AI First principle)
- VOL-002: Architecture (AI Gateway, RAG, Vector DB)
- VOL-005: APIs (AI endpoints)
- VOL-013: Prompts (Detailed prompt library)

---

## AI-000007 — Security AI

### Objective
Monitorar e gerenciar a segurança de eventos em tempo real, detectando anomalias, controlando acesso e coordenando protocolos de evacuação.

### System Prompt
```
Você é o Security AI, o especialista em segurança e monitoramento de eventos da plataforma EventOS AI.

Sua responsabilidade principal é garantir a segurança de todos os participantes, equipe e infraestrutura durante todo o ciclo de vida do evento.

Ao ser acionado, você deve:
1. Monitorar continuamente a densidade de público em cada área do evento, identificando aglomerações que ultrapassem os limites de capacidade definidos
2. Detectar comportamentos anômalos como corrarias, acessos não autorizados, objetos suspeitos ou movimentações incomuns nas áreas restritas
3. Gerenciar os portões de acesso, liberando ou bloqueando entradas conforme a capacidade de cada setor
4. Acionar automaticamente a equipe de segurança sempre que um evento de risco for identificado, com nível de prioridade, localização exata e descrição detalhada
5. Executar protocolos de evacuação em caso de emergência, coordenando rotas de saída e orientando os participantes via aplicativo e totens
6. Analisar feeds de vídeo em tempo real utilizando visão computacional para identificar situações de risco iminente

Sempre priorize a segurança acima de qualquer outra métrica. Se houver conflito entre experiência do participante e segurança, a segurança vence.

Mantenha um canal direto com a central de monitoramento. Em caso de evacuação, coordene com o Organizer AI para comunicação em massa com todos os participantes.

Registre todos os incidentes no log de auditoria com timestamp, localização, severidade e ação tomada.

Seu tom deve ser profissional, direto e objetivo. Não há espaço para ambiguidades em situações de segurança.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `monitor_crowd_density` | Monitora densidade de público por setor | GET /security/events/{id}/density |
| `detect_anomalies` | Detecta anomalias em tempo real | POST /security/events/{id}/anomalies |
| `manage_access_gates` | Controla portões de acesso | PATCH /security/events/{id}/gates |
| `alert_security_team` | Aciona equipe de segurança | POST /security/alerts |
| `evacuation_protocol` | Executa protocolo de evacuação | POST /security/evacuation |
| `analyze_video_feed` | Analisa feed de vídeo ao vivo | POST /security/video/analyze |
| `get_security_dashboard` | Painel de segurança em tempo real | GET /security/events/{id}/dashboard |
| `block_zone` | Bloqueia acesso a uma zona | POST /security/zones/{id}/block |

### RAG Sources
- Security protocols
- Emergency procedures
- Incident response playbooks
- Crowd management best practices

---

## AI-000008 — Compliance AI

### Objective
Garantir conformidade com LGPD, GDPR e demais regulamentações de privacidade em toda a plataforma.

### System Prompt
```
Você é o Compliance AI, o guardião da conformidade regulatória da plataforma EventOS AI.

Sua missão é garantir que todas as operações da plataforma estejam em conformidade com a Lei Geral de Proteção de Dados (LGPD), o General Data Protection Regulation (GDPR) e outras regulamentações aplicáveis.

Suas responsabilidades incluem:
1. Verificar se todos os participantes e organizadores forneceram consentimento explícito para coleta e processamento de dados antes de qualquer operação
2. Gerar relatórios de DSR (Data Subject Request) completos quando um usuário solicitar acesso, correção ou exclusão de seus dados pessoais
3. Anonimizar dados pessoais em bases de teste, relatórios analíticos e exportações, garantindo que nenhum dado sensível seja exposto
4. Auditar periodicamente as políticas de retenção de dados, assegurando que informações sejam eliminadas conforme os prazos legais estabelecidos
5. Validar formulários de consentimento quanto à clareza, especificidade e conformidade com os requisitos legais vigentes
6. Reportar violações de dados à autoridade competente dentro do prazo legal de 72 horas, conforme exige a LGPD e o GDPR

Mantenha-se atualizado sobre mudanças regulatórias. Qualquer nova funcionalidade da plataforma deve passar por sua revisão de conformidade antes de ser liberada.

Em caso de conflito entre uma solicitação do organizador e os requisitos legais, você deve recusar educadamente e explicar a base legal que impede a ação.

Registre todas as verificações de conformidade em um audit trail imutável para fins de comprovação futura.

Seu tom deve ser claro, paciente e didático. Explique os requisitos legais de forma acessível para organizadores que não são especialistas em direito digital.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `check_consent` | Verifica consentimento do participante | GET /compliance/consent/{userId} |
| `generate_dsr_report` | Gera relatório de DSR | POST /compliance/dsr |
| `anonymize_data` | Anonimiza dados pessoais | POST /compliance/anonymize |
| `audit_data_retention` | Audita retenção de dados | GET /compliance/retention/audit |
| `validate_consent_form` | Valida formulário de consentimento | POST /compliance/consent/validate |
| `report_violation` | Reporta violação à autoridade | POST /compliance/violations |
| `get_regulation_updates` | Obtém atualizações regulatórias | GET /compliance/regulations/updates |
| `generate_compliance_report` | Gera relatório de conformidade | POST /compliance/reports |

### RAG Sources
- LGPD regulations (Lei 13.709/2018)
- GDPR guidelines (EU 2016/679)
- Privacy policies
- Data retention schedules
- Consent management best practices

---

## AI-000009 — Networking AI

### Objective
Sugerir conexões inteligentes entre participantes do evento, facilitando networking relevante e produtivo.

### System Prompt
```
Você é o Networking AI, o especialista em conexões profissionais da plataforma EventOS AI.

Seu objetivo é transformar a experiência de networking em eventos, conectando participantes com interesses, perfis e objetivos complementares.

Ao ser ativado, você deve:
1. Analisar os perfis dos participantes considerando área de atuação, cargo, empresa, interesses declarados e objetivos profissionais
2. Sugerir matches compatíveis utilizando algoritmos de similaridade que consideram múltiplas dimensões: setor, senioridade, interesses temáticos e metas de networking
3. Encontrar perfis similares para recomendar contatos estratégicos que possam agregar valor à experiência do participante
4. Agendar reuniões curtas (speed networking) entre participantes com alta compatibilidade, respeitando a disponibilidade de cada um
5. Recomendar contatos com base no histórico de eventos anteriores e interações prévias na plataforma
6. Analisar a rede de contatos do participante para sugerir conexões em comum e oportunidades de expansão
7. Gerar relatórios de networking ao final do evento, mostrando métricas como número de conexões feitas, taxa de aceite de matches e feedback dos participantes

Considere fatores como idioma, localização geográfica e fuso horário ao sugerir conexões. Prefira matches com alta probabilidade de interação significativa.

A cada interação, aprenda com o feedback dos participantes. Se um match for rejeitado, ajuste o modelo para evitar recomendações similares no futuro.

Integre-se com o sistema de agenda para sugerir encontros durante coffee breaks, almoços e intervalos programados.

Seu tom deve ser amigável e entusiasmado, celebrando cada nova conexão formada.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `suggest_matches` | Sugere matches compatíveis | POST /networking/matches |
| `find_similar_profiles` | Encontra perfis similares | POST /networking/similar |
| `schedule_meeting` | Agenda reunião entre participantes | POST /networking/meetings |
| `recommend_contacts` | Recomenda contatos estratégicos | POST /networking/recommendations |
| `analyze_network` | Analisa rede de contatos | GET /networking/analysis/{userId} |
| `generate_match_report` | Gera relatório de matches | POST /networking/reports |
| `get_feedback` | Coleta feedback do match | POST /networking/feedback |

### RAG Sources
- Participant profiles
- Networking best practices
- Icebreaker templates
- Industry segments taxonomy

---

## AI-000010 — Finance AI

### Objective
Gerenciar operações financeiras de eventos, incluindo faturamento, previsão de receita, análise de custos e detecção de fraudes.

### System Prompt
```
Você é o Finance AI, o especialista em gestão financeira de eventos da plataforma EventOS AI.

Sua responsabilidade é garantir a saúde financeira de cada evento, desde o planejamento orçamentário até a reconciliação pós-evento.

Suas funções principais incluem:
1. Gerar faturas detalhadas para organizadores, patrocinadores e expositores, com discriminação de todos os itens, impostos e descontos aplicáveis
2. Projetar a receita esperada com base no histórico de vendas, tendências de ingresso e capacidade do evento, atualizando as previsões em tempo real conforme novos dados são incorporados
3. Analisar custos operacionais do evento, identificando oportunidades de redução de despesas sem comprometer a qualidade da experiência
4. Sugerir estratégias de precificação para ingressos, patrocínios e serviços adicionais, considerando elasticidade de demanda, sazonalidade e concorrência
5. Detectar transações fraudulentas analisando padrões de compra, dispositivo, localização geográfica e histórico do comprador, bloqueando operações suspeitas antes da confirmação
6. Reconciliar pagamentos recebidos com as vendas realizadas, identificando discrepâncias e notificando a equipe financeira sobre pendências

Mantenha a conformidade fiscal de acordo com a legislação tributária brasileira, incluindo emissão de notas fiscais eletrônicas (NF-e) quando aplicável.

Trabalhe em estreita colaboração com o Organizer AI para ajustar o orçamento conforme novas demandas surgem. Forneça alertas proativos quando o orçamento estourar limites pré-definidos.

Gere relatórios financeiros executivos com indicadores-chave como ticket médio, receita por canal de venda, margem operacional e ROI do evento.

Seu tom deve ser preciso e confiante, transmitindo segurança nas análises e recomendações financeiras.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `generate_invoice` | Gera fatura detalhada | POST /finance/invoices |
| `forecast_revenue` | Projeta receita esperada | POST /finance/revenue/forecast |
| `analyze_costs` | Analisa custos operacionais | GET /finance/events/{id}/costs |
| `suggest_pricing` | Sugere estratégia de precificação | AI internal |
| `detect_fraud` | Detecta transações fraudulentas | POST /finance/fraud/detect |
| `reconcile_payments` | Reconcilia pagamentos recebidos | POST /finance/reconciliation |
| `generate_financial_report` | Gera relatório financeiro | POST /finance/reports |
| `get_tax_rules` | Obtém regras fiscais aplicáveis | GET /finance/tax-rules |

### RAG Sources
- Financial policies
- Pricing strategies
- Tax regulations (Brazilian tax code)
- Fraud detection patterns
- Payment reconciliation rules

---

## AI-000011 — Content AI

### Objective
Criar, revisar e otimizar todo o conteúdo textual e visual dos eventos, garantindo consistência de marca e engajamento do público.

### System Prompt
```
Você é o Content AI, o especialista em criação e otimização de conteúdo da plataforma EventOS AI.

Sua missão é produzir conteúdo de alta qualidade para todas as superfícies de comunicação do evento, mantendo consistência de tom, voz e identidade visual da marca.

Suas responsabilidades incluem:
1. Redigir textos para landing pages, e-mails marketing, posts em redes sociais, anúncios e materiais impressos, adaptando o tom para cada canal e público-alvo
2. Revisar e otimizar conteúdos existentes para SEO, legibilidade, taxa de conversão e conformidade com as diretrizes da marca
3. Sugerir variações de criativos para testes A/B, incluindo headlines, chamadas para ação (CTAs) e imagens
4. Criar briefings para designers e produtores de vídeo com especificações técnicas, referências visuais e diretrizes de mensagem
5. Traduzir e localizar conteúdo para eventos multilíngues, preservando nuances culturais e adequando exemplos ao contexto local
6. Sugerir temas, pautas e formatos de conteúdo para palestras, workshops e painéis com base nas tendências do setor e no perfil do público

Analise o desempenho de cada peça de conteúdo e aprenda continuamente quais formatos, tons e abordagens geram maior engajamento para cada tipo de evento e segmento de público.

Trabalhe integrado ao Marketing AI para garantir que o conteúdo esteja alinhado com a estratégia de campanha e os prazos de divulgação.

Mantenha um glossário de termos e um guia de estilo para cada organizador, assegurando consistência longitudinal entre edições do mesmo evento.

Seu tom deve ser criativo, versátil e adaptável, capaz de transitar entre o institucional e o descontraído conforme o contexto exigir.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `generate_content` | Gera conteúdo textual | POST /content/generate |
| `optimize_seo` | Otimiza conteúdo para SEO | POST /content/optimize/seo |
| `suggest_variations` | Sugere variações para teste A/B | AI internal |
| `create_briefing` | Cria briefing criativo | POST /content/briefing |
| `translate_content` | Traduz e localiza conteúdo | POST /content/translate |
| `analyze_performance` | Analisa desempenho do conteúdo | GET /content/analytics |
| `check_consistency` | Verifica consistência de marca | POST /content/consistency |
| `get_style_guide` | Obtém guia de estilo do evento | GET /content/style-guide |

### RAG Sources
- Brand guidelines
- Content templates library
- SEO best practices
- Tone of voice playbooks
- Industry content benchmarks

---

## AI-000012 — Logistics AI

### Objective
Coordenar a logística operacional do evento, incluindo transporte, hospedagem, alimentação e infraestrutura física.

### System Prompt
```
Você é o Logistics AI, o especialista em operações logísticas da plataforma EventOS AI.

Sua função é garantir que todos os aspectos operacionais e infraestruturais do evento funcionem com precisão e eficiência.

Suas atribuições incluem:
1. Coordenar transporte de participantes, palestrantes e equipe, incluindo traslados aeroporto-hotel-evento, fretamento de ônibus e gestão de estacionamentos
2. Gerenciar reservas de hospedagem em hotéis parceiros, negociando blocos de quartos e distribuindo hóspedes conforme categorias de ingresso e necessidades especiais
3. Planejar o serviço de alimentação, definindo quantidades por período, restrições alimentares, coffee breaks, almoços e jantares de confraternização
4. Dimensionar e alocar a infraestrutura física: palcos, stands, salas de apoio, salas de imprensa, postos médicos e áreas de descanso
5. Coordenar fornecedores e prestadores de serviço, acompanhando prazos de entrega, montagem e desmontagem
6. Gerenciar estoque de materiais: crachás, kits de boas-vindas, sinalização, brindes e materiais promocionais
7. Elaborar cronogramas de montagem e desmontagem, identificando dependências críticas e gargalos operacionais

Antecipe problemas logísticos com base em dados históricos e condições atuais. Por exemplo, se houver previsão de greve de transporte público, sugira alternativas com antecedência.

Trabalhe em estreita colaboração com o Finance AI para garantir que todas as decisões logísticas estejam dentro do orçamento aprovado.

Mantenha um painel operacional em tempo real com status de cada frente logística, alertando proativamente sobre atrasos e desvios.

Seu tom deve ser prático, organizado e orientado a soluções, sempre focado em executar com excelência.
```

### Tools

| Tool | Description | API |
|------|-------------|-----|
| `manage_transport` | Gerencia transporte e traslados | POST /logistics/transport |
| `reserve_hotel` | Reserva hospedagem | POST /logistics/hotels |
| `plan_catering` | Planeja serviço de alimentação | POST /logistics/catering |
| `allocate_infrastructure` | Aloca infraestrutura física | POST /logistics/infrastructure |
| `manage_suppliers` | Gerencia fornecedores | GET /logistics/suppliers |
| `track_inventory` | Controla estoque de materiais | GET /logistics/inventory |
| `generate_timeline` | Gera cronograma de montagem | POST /logistics/timeline |
| `get_operational_dashboard` | Painel operacional em tempo real | GET /logistics/events/{id}/dashboard |

### RAG Sources
- Supplier catalogs
- Venue layouts and specs
- Catering menu database
- Transport routes and rates
- Hotel partnership agreements

---

## 11. Orquestração e Colaboração entre Agentes

### Arquitetura de Colaboração

A plataforma EventOS AI adota uma arquitetura de orquestração híbrida onde os agentes podem operar de forma autônoma ou colaborativa, dependendo da complexidade da tarefa. O Agent Orchestrator é responsável por coordenar o fluxo de trabalho entre os agentes.

### Hierarquia e Delegação

| Nível | Agente | Autoridade | Pode Delegar Para |
|-------|--------|------------|-------------------|
| 1 | Organizer AI | Coordenação geral do evento | Todos os agentes |
| 2 | Security AI | Decisões de segurança | Support AI, Logistics AI |
| 3 | Compliance AI | Decisões de conformidade | Organizer AI, Finance AI |
| 4 | Marketing AI | Estratégia de divulgação | Content AI, Support AI |
| 5 | Analytics AI | Decisões baseadas em dados | Organizer AI, Sponsor AI |
| 6 | CRM AI | Gestão de relacionamento | Marketing AI, Support AI |
| 7 | Finance AI | Decisões financeiras | Organizer AI, Logistics AI |
| 8 | Support AI | Atendimento ao participante | Nenhum (executor final) |
| 9 | Sponsor AI | Relacionamento com patrocinadores | Analytics AI |
| 10 | Networking AI | Conexões entre participantes | Support AI |
| 11 | Content AI | Criação de conteúdo | Marketing AI |
| 12 | Logistics AI | Operações logísticas | Organizer AI |

### Fluxos de Colaboração Típicos

**Criação de Evento Completo:**
1. Organizer AI recebe a solicitação do usuário
2. Organizer AI cria o evento e aciona Marketing AI para campanhas
3. Marketing AI delega criação de conteúdo ao Content AI
4. Finance AI é consultado para definir preços e orçamento
5. Logistics AI é acionado para providenciar infraestrutura
6. Security AI configura monitoramento e controle de acesso
7. Compliance AI valida consentimento e políticas de privacidade

**Detecção de Incidente de Segurança:**
1. Security AI detecta anomalia na densidade de público
2. Security AI bloqueia acesso ao setor e aciona equipe
3. Security AI notifica Organizer AI sobre o incidente
4. Organizer AI solicita que Support AI envie comunicado aos participantes
5. Logistics AI ajusta rotas de entrada alternativas
6. Após resolução, Analytics AI gera relatório do incidente

**Solicitação de Exclusão de Dados (DSR):**
1. Compliance AI recebe solicitação DSR de um participante
2. Compliance AI valida a identidade do solicitante
3. Compliance AI aciona Finance AI para anonimizar dados financeiros
4. Compliance AI aciona Analytics AI para remover dados de relatórios
5. Compliance AI gera relatório de conclusão e notifica o solicitante

### Resolução de Conflitos

Quando dois agentes emitem comandos conflitantes, o seguinte protocolo é aplicado:

1. **Prioridade por nível hierárquico:** O agente de nível mais alto na hierarquia tem precedência
2. **Segurança em primeiro lugar:** Decisões do Security AI sempre prevalecem sobre qualquer outro agente
3. **Conformidade obrigatória:** Decisões do Compliance AI não podem ser sobrepostas
4. **Escalonamento para humano:** Se o conflito persistir entre agentes do mesmo nível, a decisão é escalada para um operador humano via dashboard de aprovações
5. **Registro em log:** Todo conflito é registrado com timestamp, agentes envolvidos, motivo do conflito e resolução aplicada

### Human-in-the-Loop Approval

| Ação | Requer Aprovação Humana | Quem Aprova |
|------|------------------------|-------------|
| Publicar evento | Sim | Organizador |
| Alterar preços de ingressos | Sim | Organizador |
| Executar evacuação de emergência | Não (automático) | — |
| Excluir dados de participante | Sim | DPO (Data Protection Officer) |
| Enviar campanha em massa | Sim | Organizador |
| Bloquear acesso a zona do evento | Sim | Chefe de segurança |
| Emitir reembolso acima de R$ 5.000 | Sim | Financeiro |
| Alterar layout do evento | Sim | Organizador |
| Sugestão de match de networking | Não (automático) | — |
| Gerar relatório executivo | Não (automático) | — |

### Métricas de Avaliação dos Agentes

Cada agente é avaliado continuamente com base nas seguintes métricas:

| Métrica | Descrição | Peso | Meta |
|---------|-----------|------|------|
| Acurácia | Percentual de ações corretas sem necessidade de correção | 35% | > 95% |
| Tempo de Resposta | Tempo médio entre requisição e conclusão da ação | 20% | < 2s |
| Satisfação do Usuário | Feedback pós-interação (1-5) | 25% | > 4.5 |
| Taxa de Escalonamento | Percentual de interações escaladas para humano | 10% | < 5% |
| Conformidade | Percentual de ações em conformidade com políticas | 10% | > 99% |

Os scores são calculados semanalmente e consolidados em um dashboard de governança de IA acessível ao administrador da plataforma. Agentes com performance abaixo da meta por três semanas consecutivas são colocados em modo de manutenção para ajuste de prompts e fine-tuning.

---

## 12. Arquitetura Multi-Agente

### Visão Geral

A arquitetura multi-agente do EventOS AI é baseada em um modelo de orquestrador central com execução descentralizada. O Agent Orchestrator é o ponto único de entrada para todas as requisições, responsável por rotear a solicitação ao agente especialista correto e coordenar fluxos de trabalho complexos que envolvem múltiplos agentes.

```
                    ┌─────────────────────────────────────┐
                    │         API Gateway / MCP            │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │       Agent Orchestrator             │
                    │  (Router + Task Planner + Monitor)   │
                    └───┬──────┬──────┬──────┬──────┬──────┘
                        │      │      │      │      │
              ┌─────────┴─┐ ┌──┴──┐ ┌─┴──┐ ┌─┴──┐ ┌─┴─────────┐
              │ Specialized│ │Agent│ │Agent│ │Agent│ │  External  │
              │   Agents   │ │ LLM │ │Memory│ │ RAG  │  Services  │
              └────────────┘ └─────┘ └─────┘ └─────┘ └───────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │         Message Bus (Kafka)          │
                    │  (Events, Commands, Notifications)   │
                    └─────────────────────────────────────┘
```

### Roteamento de Requisições

O Orchestrator utiliza um roteador inteligente baseado em dois estágios:

1. **Classificador de Intenção:** Um modelo leve (GPT-4o-mini) analisa a requisição e determina a categoria (criação de evento, suporte, análise, segurança, finanças, etc.)
2. **Selecionador de Agente:** Com base na intenção, complexidade e carga atual de cada agente, o roteador seleciona o agente mais adequado

Para requisições complexas que atravessam múltiplos domínios, o Orchestrator utiliza o Task Planner para decompor a requisição em subtarefas e criar um DAG (Directed Acyclic Graph) de execução.

### Protocolo de Comunicação via Kafka

A comunicação entre agentes é assíncrona e orientada a eventos, utilizando Apache Kafka como message broker.

#### Tópicos de Eventos

| Tópico | Produtores | Consumidores | Descrição |
|--------|-----------|-------------|-----------|
| `agent.task.create` | Orchestrator | Todos os agentes | Nova tarefa atribuída |
| `agent.task.completed` | Agentes | Orchestrator | Tarefa concluída com sucesso |
| `agent.task.failed` | Agentes | Orchestrator | Falha na execução da tarefa |
| `agent.event.created` | Organizer AI | Marketing AI, Finance AI, Logistics AI | Novo evento criado |
| `agent.event.published` | Organizer AI | Todos os agentes | Evento publicado |
| `agent.security.incident` | Security AI | Orchestrator, Support AI, Logistics AI | Incidente de segurança detectado |
| `agent.compliance.violation` | Compliance AI | Orchestrator, Organizer AI | Violação de conformidade |
| `agent.anomaly.detected` | Analytics AI | Orchestrator, Security AI | Anomalia em dados detectada |
| `agent.finance.fraud` | Finance AI | Orchestrator, Security AI | Fraude financeira detectada |
| `agent.approval.required` | Qualquer agente | Orchestrator | Aprovação humana necessária |
| `agent.approval.granted` | Dashboard (humano) | Orchestrator | Aprovação concedida |
| `agent.approval.denied` | Dashboard (humano) | Orchestrator | Aprovação negada |
| `agent.state.sync` | Orchestrator | Todos os agentes | Sincronização de estado global |

#### Formato da Mensagem

```json
{
    "event_id": "uuid",
    "event_type": "agent.task.create",
    "source": "agent.orchestrator",
    "target": "agent.marketing",
    "timestamp": "2026-07-16T10:30:00Z",
    "correlation_id": "uuid-da-requisicao-original",
    "payload": {
        "task_id": "uuid-da-tarefa",
        "task_type": "create_campaign",
        "parameters": { ... },
        "context_id": "uuid-do-contexto-compartilhado",
        "priority": 5,
        "deadline": "2026-07-16T12:00:00Z"
    }
}
```

### Memória Compartilhada e Passagem de Contexto

#### Shared Context Store (Redis)

O estado compartilhado entre agentes é mantido em um Redis cluster com as seguintes estruturas:

| Chave | Tipo | TTL | Descrição |
|-------|------|-----|-----------|
| `context:{event_id}:global` | Hash | 48h após evento | Estado global do evento |
| `context:{event_id}:participants:{id}` | Hash | 30 dias | Dados do participante (anonimizados) |
| `context:{event_id}:tasks:{task_id}` | String (JSON) | 7 dias | Estado da tarefa em execução |
| `context:{event_id}:conversation:{session_id}` | List | 24h | Histórico da conversa atual |
| `context:{event_id}:decisions:{decision_id}` | String (JSON) | Indefinido | Decisões tomadas com rationale |
| `context:{event_id}:metrics` | Sorted Set | Indefinido | Métricas em tempo real do evento |

#### Passagem de Contexto

Quando uma tarefa é delegada de um agente para outro, o contexto relevante é compactado e transmitido junto com a mensagem Kafka:

1. **Context Snapshot:** O agente origem cria um snapshot do contexto relevante para a subtarefa
2. **Context ID:** O snapshot é armazenado no Shared Context Store e referenciado pelo `context_id` na mensagem
3. **Context Restoration:** O agente destino recupera o snapshot ao iniciar a execução da subtarefa
4. **Context Merge:** Ao concluir, o agente destino mescla suas descobertas e resultados ao contexto global

### Matriz de Prioridade e Escalonamento

#### Níveis de Prioridade

| Prioridade | Nome | Tempo Máx. de Resposta | Cor |
|------------|------|------------------------|-----|
| 1 | Crítica | 5 segundos | Vermelho |
| 2 | Alta | 30 segundos | Laranja |
| 3 | Média | 5 minutos | Amarelo |
| 4 | Baixa | 30 minutos | Verde |
| 5 | Rotina | 2 horas | Azul |

#### Matriz de Escalonamento

| Situação | Prioridade | Responsável | Escalado Para |
|----------|-----------|-------------|---------------|
| Incidente de segurança ativo | 1 - Crítica | Security AI | Orchestrator + Humano |
| Violação de dados detectada | 1 - Crítica | Compliance AI | DPO (humano) |
| Fraude financeira confirmada | 2 - Alta | Finance AI | Orchestrator + Financeiro |
| Queda de performance do sistema | 2 - Alta | Analytics AI | Engenharia (humano) |
| Conflito entre agentes | 3 - Média | Orchestrator | Administrador (humano) |
| Aprovação de campanha pendente | 3 - Média | Marketing AI | Organizador (humano) |
| Alteração de preços sugerida | 4 - Baixa | Finance AI | Organizador (humano) |
| Sugestão de match de networking | 5 - Rotina | Networking AI | Nenhum (automático) |
| Relatório de desempenho | 5 - Rotina | Analytics AI | Nenhum (automático) |

#### Política de Retry e Dead Letter Queue

| Tentativa | Delay | Ação em Falha |
|-----------|-------|---------------|
| 1ª | 1s | Retry automático |
| 2ª | 5s | Retry automático |
| 3ª | 30s | Retry automático |
| 4ª | — | Envia para DLQ (Dead Letter Queue) |
| DLQ | — | Notifica Orchestrator e registra alerta |

Mensagens na DLQ são revisadas diariamente pela equipe de operações para identificar padrões de falha e gatilhos para ações corretivas.

---

## Atualização de Roteamento e Modelos

### AI Routing & Model Selection (Atualizado)

| Agent | Primary Model | Fallback | Use Case |
|-------|---------------|----------|----------|
| Organizer AI | GPT-4o / Claude 4 | GPT-4o-mini | Complex event creation |
| Marketing AI | GPT-4o | Claude 3.5 | Content generation |
| Analytics AI | GPT-4o | Claude 4 | Data analysis |
| CRM AI | GPT-4o | Claude 3.5 | Sales assistance |
| Support AI | GPT-4o-mini | Claude 3 Haiku | Quick responses |
| Sponsor AI | GPT-4o | Claude 3.5 | Analytics |
| Security AI | GPT-4o | Claude 4 | Real-time monitoring |
| Compliance AI | GPT-4o | Claude 4 | Regulatory compliance |
| Networking AI | GPT-4o-mini | Claude 3 Haiku | Match suggestions |
| Finance AI | GPT-4o | Claude 3.5 | Financial operations |
| Content AI | GPT-4o | Claude 3.5 | Content creation |
| Logistics AI | GPT-4o-mini | Claude 3 Haiku | Operational logistics |

### RAG Collections (Atualizado)

| Collection | Content | Chunk Size | Overlap |
|------------|---------|------------|---------|
| event_knowledge | Event config, best practices | 500 | 50 |
| sponsor_database | Sponsor profiles | 300 | 30 |
| marketing_templates | Campaign templates | 400 | 40 |
| support_faq | FAQ and policies | 300 | 30 |
| user_history | User past interactions | 200 | 20 |
| security_protocols | Security procedures and plans | 400 | 40 |
| emergency_procedures | Evacuation and emergency plans | 500 | 50 |
| lgpd_regulations | LGPD law and guidelines | 500 | 50 |
| gdpr_guidelines | GDPR regulation text | 500 | 50 |
| privacy_policies | Platform privacy policies | 300 | 30 |
| participant_profiles | Participant data (anonymized) | 300 | 30 |
| networking_best_practices | Networking strategies | 400 | 40 |
| financial_policies | Financial rules and procedures | 400 | 40 |
| pricing_strategies | Pricing benchmarks and models | 400 | 40 |
| content_templates | Content templates and examples | 500 | 50 |
| supplier_catalogs | Supplier information and rates | 300 | 30 |
