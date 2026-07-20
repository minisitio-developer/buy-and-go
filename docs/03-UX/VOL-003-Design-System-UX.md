# VOL-003 — Design System & UX

**EventOS AI Enterprise**
**Versão:** 0.0.1
**Status:** Draft

---

## UX Principles

| Principle | Description |
|-----------|-------------|
| AI-First Interfaces | AI chat as primary interaction; forms as fallback |
| Minimal Friction | Any task should take ≤3 clicks |
| Offline-Capable | Critical flows work without internet |
| Role-Based Views | Different dashboards per role (organizer, staff, sponsor) |
| Mobile Primary | Every screen designed for mobile first |
| Accessibility | WCAG 2.1 AA minimum |
| White-Label Ready | All UI components support theming |

---

## Design Tokens

### Colors

```
Primary:      #4F46E5 (Indigo)
Secondary:    #10B981 (Emerald)
Accent:       #F59E0B (Amber)
Neutral:      #6B7280

Success:      #10B981
Warning:      #F59E0B
Error:        #EF4444
Info:         #3B82F6

Background:   #FFFFFF
Surface:      #F9FAFB
Border:       #E5E7EB

Text Primary: #111827
Text Secondary:#6B7280
Text Inverse: #FFFFFF
```

### Typography

```
Font Family: Inter (sans-serif)
Monospace:   JetBrains Mono

Desktop:
  h1: 48px / 700
  h2: 32px / 600
  h3: 24px / 600
  h4: 20px / 500
  body: 16px / 400
  small: 14px / 400

Mobile:
  h1: 32px / 700
  h2: 24px / 600
  h3: 20px / 600
  h4: 18px / 500
  body: 14px / 400
  small: 12px / 400
```

### Spacing (px)

```
xs: 4    sm: 8    md: 16    lg: 24
xl: 32   2xl: 48  3xl: 64  4xl: 96
```

### Radius

```
sm: 4px    md: 8px    lg: 12px    xl: 16px    full: 9999px
```

### Shadows

```
sm:   0 1px 2px rgba(0,0,0,0.05)
md:   0 4px 6px rgba(0,0,0,0.07)
lg:   0 10px 15px rgba(0,0,0,0.10)
xl:   0 20px 25px rgba(0,0,0,0.15)
```

---

## Component Library

### SC-001 — Button

```
Variants: primary, secondary, outline, ghost, danger
Sizes:    sm, md, lg
States:   default, hover, active, disabled, loading
```

### SC-002 — Input

```
Variants: text, email, password, number, phone, document
States:   default, focus, error, disabled
Prefix:   R$ / https://
Suffix:   .com / @
```

### SC-003 — Card

```
Elevation: flat, raised
Padding:   sm, md, lg
Options:   clickable, with-header, with-footer
```

### SC-004 — Table

```
Features: sortable, filterable, selectable, paginated
Actions:  inline edit, bulk actions, export
Mobile:   card view
```

### SC-005 — Modal

```
Sizes:    sm (400px), md (600px), lg (800px), xl (90vw)
Features: confirmation, form, full-screen (mobile)
```

### SC-006 — Sidebar

```
Variants: collapsible, pinned, overlay (mobile)
Sections: nav, shortcuts, notifications, user
```

### SC-007 — Topbar

```
Elements: logo, search, notifications, user menu
Breadcrumbs: auto-generated from route
```

### SC-008 — Avatar

```
Sizes:    sm (24px), md (32px), lg (48px), xl (64px)
Status:   online, offline, busy
Fallback: initials
```

### SC-009 — Badge

```
Variants: success, warning, error, info, neutral
Size:     sm, md, lg
```

### SC-010 — Timeline

```
Use:      check-in history, event log, audit
Features: status dot, timestamp, description
```

### SC-011 — Stepper

```
Use:      multi-step forms (event creation wizard)
States:   completed, current, upcoming
```

### SC-012 — AI Chat

```
Messages: user, assistant, system, tool_action
Features: markdown rendering, streaming, file upload, suggestions
Input:    multi-line textarea with send button
Actions:  stop generation, regenerate, copy
```

### SC-013 — Dashboard Widget

```
Variants: stat (number), chart, table, list
Features: refresh, full-screen, export
Refresh:  auto (30s) or manual
```

### SC-014 — QR Code

```
Sizes:    sm (100px), md (150px), lg (200px)
Features: download PNG, print, scan animation
```

### SC-015 — Map

```
Use:      event map, heatmap, booth location
Features: zoom, markers, clustering, floor selector
```

---

## Screen Catalog (MVP)

### WEB-001 — Login

```
┌─────────────────────────────┐
│         [Logo]              │
│                             │
│   Email                     │
│   [________________]        │
│                             │
│   Senha                     │
│   [________________]        │
│                             │
│   [Entrar]                  │
│                             │
│   Esqueci senha             │
│   Criar conta               │
│                             │
│   ─── ou continue com ───   │
│   [Google] [Microsoft]      │
└─────────────────────────────┘
```

### WEB-002 — Dashboard

```
┌─────────────────────────────────────────┐
│ [Logo]  [Busca...]  [🔔] [👤]          │
├────────┬────────────────────────────────┤
│        │  Bom dia, João!                │
│ Eventos│                                │
│ CRM    │  ┌──────┐ ┌──────┐ ┌──────┐   │
│ Vendas │  │ 1.247│ │R$ 89K│ │ 78%  │   │
│ Relat. │  │Check │ │Receit│ │ Ocup │   │
│ Config │  └──────┘ └──────┘ └──────┘   │
│        │                                │
│        │  ┌──────────────────────────┐  │
│        │  │ Eventos ativos           │  │
│        │  │ Feira Agro ──[●]── 78%   │  │
│        │  │ Congresso ──[●]── 45%    │  │
│        │  └──────────────────────────┘  │
│        │                                │
│        │  ┌──────────────────────────┐  │
│        │  │ Últimos check-ins        │  │
│        │  │ Maria Silva   08:15      │  │
│        │  │ João Pedro    08:12      │  │
│        │  │ Ana Costa     08:08      │  │
│        │  └──────────────────────────┘  │
└────────┴────────────────────────────────┘
```

### WEB-003 — Event List

```
┌─────────────────────────────────────────────┐
│ [←]  Meus Eventos          [+ Novo Evento]  │
├─────────────────────────────────────────────┤
│ [Buscar eventos...]  [Filtrar ▼]  [Ordenar] │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Feira Agropecuária 2026                 │ │
│ │ 15-18 Set 2026 • Ribeirão Preto, SP     │ │
│ │ 🟢 Publicado    1.247 / 30.000 inscritos│ │
│ │ [Dashboard] [Credenciamento] [Mais ▼]   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Congresso Médico Paulista               │ │
│ │ 10-12 Nov 2026 • São Paulo, SP          │ │
│ │ 🟡 Rascunho    0 / 8.000 inscritos      │ │
│ │ [Continuar] [Configurar] [Excluir]      │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│                    [1] [2] [3] ... [10]      │
└─────────────────────────────────────────────┘
```

### WEB-004 — Create Event (Wizard)

```
┌─────────────────────────────────────────────┐
│ Criar Evento                        Passo 1/5│
├─────────────────────────────────────────────┤
│ ● Informações │ ○ Ingressos │ ○ Programação │
│ ○ Credencial  │ ○ Publicar                  │
├─────────────────────────────────────────────┤
│                                             │
│ Ou descreva para IA:                        │
│ ┌─────────────────────────────────────────┐ │
│ │ "Quero uma feira agropecuária para      │ │
│ │  30 mil pessoas em Ribeirão Preto"      │ │
│ └─────────────────────────────────────────┘ │
│            [Criar com IA ✨]                │
│                                             │
│ ─── ou preencha manualmente ───             │
│                                             │
│ Nome                                  [🔍] │
│ [____________________________________]      │
│                                             │
│ Categoria  [Feiras ▼]     Tipo [Presencial] │
│                                             │
│ Data início           Data fim              │
│ [15/09/2026]          [18/09/2026]          │
│                                             │
│ Local                                        │
│ [Parque de Exposições]                      │
│                                             │
│ Cidade              Estado                  │
│ [Ribeirão Preto]    [SP ▼]                  │
│                                             │
│ Capacidade                                   │
│ [30000]                                      │
│                                             │
│              [Próximo →]                    │
└─────────────────────────────────────────────┘
```

### WEB-005 — Check-in App

```
┌─────────────────────────────────────────────┐
│        Credenciamento — Feira Agro     🔄   │
├─────────────────────────────────────────────┤
│                                             │
│           ┌─────────────────┐               │
│           │                 │               │
│           │    [📷]         │               │
│           │   Aproxime      │               │
│           │   o QR Code     │               │
│           │                 │               │
│           └─────────────────┘               │
│                                             │
│   ─── ou ───                                │
│                                             │
│   [Buscar por nome...]     [🔍]             │
│                                             │
│   [Buscar por documento]   [🔍]             │
│                                             │
│   [Reconhecimento Facial 📸]                │
│                                             │
│ ─────────────────────────────────────────    │
│                                             │
│ Últimos check-ins (12.450):                │
│ ┌─────────────────────────────────────┐     │
│ │ ✅ Maria Silva         08:15        │     │
│ │ ✅ João Pedro          08:12        │     │
│ │ ✅ Ana Costa           08:08        │     │
│ └─────────────────────────────────────┘     │
│                                             │
│          Online | Sincronizado              │
└─────────────────────────────────────────────┘
```

### WEB-006 — Event Dashboard

```
┌─────────────────────────────────────────────┐
│ [←] Dashboard — Feira Agro    [Exportar PDF] │
├─────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │12.450│ │78%   │ │3h12m │ │R$ 89K│        │
│ │Check │ │Ocupa │ │Méd.  │ │Receit│        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                             │
│ ┌──────────────────────┐ ┌──────────────┐   │
│ │ Fluxo por hora       │ │ Check-ins    │   │
│ │  ██                   │ │ QR  78%      │   │
│ │  ██████               │ │ Face 18%     │   │
│ │  ████████████████     │ │ Manual 4%    │   │
│ │  ████████████████████ │ └──────────────┘   │
│ └──────────────────────┘                     │
│                                             │
│ [Pergunte à IA sobre este evento...]  [▶]   │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Patrocinadores                          │ │
│ │ 🥇 Banco XYZ — 2.450 visitas            │ │
│ │ 🥈 Tech ABC — 1.890 visitas             │ │
│ │ 🥉 Agro Ltda — 1.234 visitas            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### WEB-007 — AI Chat

```
┌─────────────────────────────────────────────┐
│  EventOS AI                         [●●●]   │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Olá! Como posso ajudar com seu evento?  │ │
│ │ Sugestões:                              │ │
│ │ • "Crie um evento para 5 mil pessoas"   │ │
│ │ • "Quantos ingressos vendemos hoje?"    │ │
│ │ • "Gere certificados"                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ "Quero criar um congresso médico para   │ │
│ │  8 mil pessoas em Brasília"             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ✨ Vou criar seu evento!                │ │
│ │                                         │ │
│ │ ✅ Evento criado — status: rascunho     │ │
│ │ ✅ Landing page criada                  │ │
│ │ ✅ Cronograma sugerido                  │ │
│ │ ✅ Patrocinadores sugeridos             │ │
│ │                                         │ │
│ │ Deseja publicar agora?                  │ │
│ │              [Sim] [Revisar] [Não]      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Digite sua mensagem...]           [▶]     │
├─────────────────────────────────────────────┤
│                              ⚡ EventOS AI  │
└─────────────────────────────────────────────┘
```

### MOB-001 — Mobile Check-in

```
┌─────────────────────┐
│ Credenciamento      │
├─────────────────────┤
│                     │
│     ┌───────────┐   │
│     │           │   │
│     │  [📷 QR]  │   │
│     │           │   │
│     └───────────┘   │
│                     │
│ [Buscar por nome]   │
│ [Face] [Documento]  │
│                     │
│ ─────────────        │
│ Últimos             │
│ ✅ M.Silva  08:15   │
│ ✅ J.Pedro  08:12   │
│ ✅ A.Costa  08:08   │
│                     │
│ ● Online    98%     │
└─────────────────────┘
```

### MOB-002 — Mobile Ticket

```
┌─────────────────────┐
│  ← Meus Ingressos   │
├─────────────────────┤
│                     │
│   Feira Agropecuária│
│   15-18 Set 2026    │
│                     │
│  ┌───────────────┐  │
│  │ ┌───────────┐ │  │
│  │ │▀▀▀▀▀▀▀▀▀▀▀│ │  │
│  │ │▄▄▄▄▄▄▄▄▄▄▄│ │  │
│  │ └───────────┘ │  │
│  │               │  │
│  │ Maria Silva   │  │
│  │ Passaporte    │  │
│  │ Completo      │  │
│  └───────────────┘  │
│                     │
│      [Usar ingresso]│
└─────────────────────┘
```

---

## CRM Screens

### WEB-008 — CRM Dashboard (Pipeline Kanban)

**Descrição:** Visão geral do pipeline de vendas com quadro kanban de negócios por estágio. Acesso rápido a métricas de conversão e valor total do funil.

**Componentes:** KanbanBoard, DealCard, StatWidget, SearchBar, FilterChips, AIAssistantTrigger

**Estados:** Carregamento | Vazio | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] CRM Pipeline                      [🔍 Buscar...] [+Negócio]│
├─────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │R$ 450K│ │ 38   │ │ 22%  │ │R$ 89K│ │12    │              │
│ │Funil  │ │Negóci│ │Conv. │ │Receit│ │Perdi │              │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Lead     ││ Qualif.  ││ Proposta ││ Fechado  │       │
│ │ 12 neg.  ││ 8 neg.   ││ 5 neg.   ││ 3 neg.   │       │
│ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤       │
│ │ Agro Corp│ │ Tech Exp │ │ Digital  │ │ Festa    │       │
│ │ R$ 45K   │ │ R$ 89K   │ │ R$ 120K  │ │ R$ 29K   │       │
│ │ Ana       │ │ Carlos   │ │ Maria    │ │ Pedro    │       │
│ ├──────────┤ ├──────────┤ ├──────────┤ └──────────┘       │
│ │ MedConf  │ │ Saúde    │ │ Eventos+ │                      │
│ │ R$ 30K   │ │ R$ 50K   │ │ R$ 90K   │                      │
│ │ João     │ │ Luiza    │ │ Paula    │                      │
│ └──────────┘ └──────────┘ └──────────┘                      │
│                                                             │
│ [Pergunte à IA sobre seu pipeline...]                   [▶] │
└─────────────────────────────────────────────────────────────┘
```

### WEB-009 — Deal Detail

**Descrição:** Detalhes completos de um negócio com timeline de atividades, valor, probabilidade e ações rápidas.

**Componentes:** DealHeader, ActivityTimeline, ContactCard, StageSelector, ValueEditor, NotesSection, AIInsights

**Estados:** Carregamento | Vazio (sem atividades) | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Negócio: Tech Summit 2026     [Editar] [Mais ▼]       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐  ┌────────────────────────┐ │
│ │ 💼 Tech ABC Corp            │  │ Timeline de Atividades │ │
│ │ Valor: R$ 89.000            │  │                        │ │
│ │ Estágio: Proposta ●─────────│  │ Hoje                   │ │
│ │ Probab: 70%                 │  │ ● E-mail enviado 10:30 │ │
│ │ Responsável: Maria S.       │  │ ● Ligação agenda 14:00│ │
│ │ Fechamento: 15/10/2026      │  │ Ayer                   │ │
│ └─────────────────────────────┘  │ ● Proposta enviada    │ │
│                                  │ ● Reunião realizada    │ │
│ ┌─────────────────────────────┐  │ 15/09                  │ │
│ │ Contato                     │  │ ● Novo contato criado  │ │
│ │ ┌─────────────────────────┐ │  │ └────────────────────────┘ │
│ │ │ 👤 Carlos Andrade       │ │                              │
│ │ │ CTO • carlos@techabc.com│ │  ┌────────────────────────┐ │
│ │ │ 📞 +55 11 99999-0000    │ │  │ Insights IA ✨          │ │
│ │ │ [Ligar] [E-mail] [Chat] │ │  │ ⚡ Alto potencial      │ │
│ │ └─────────────────────────┘ │  │ ⚡ Sugerir upgrade     │ │
│ └─────────────────────────────┘  │ ⚡ Histórico positivo  │ │
│                                  └────────────────────────┘ │
│ [Adicionar atividade...]                    [Mover estágio ▼]│
└─────────────────────────────────────────────────────────────┘
```

### WEB-010 — Contact Profile

**Descrição:** Perfil completo de contato com histórico de interações, negócios associados e dados de comunicação.

**Componentes:** ProfileHeader, InteractionHistory, DealList, ContactInfo, TagsInput, ActivityLog, QuickActions

**Estados:** Carregamento | Vazio (sem histórico) | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Contato                                  [Editar] [▼]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👤                                                    │ │
│ │ Ana Beatriz Costa                                      │ │
│ │ Diretora de Marketing • Tech ABC Corp                  │ │
│ │ 📍 São Paulo, SP   📧 ana@techabc.com   📞 11 98888-0000│ │
│ │ Tags: [Patrocinador] [VIP] [Decisor]  [+Tag]           │ │
│ │ [Ligar] [E-mail] [WhatsApp] [Agendar]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Interações Recentes              [Filtrar ▼] [+Nova]    │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 15/09 📧 E-mail — Proposta enviada                 │ │ │
│ │ │ 14/09 📞 Ligação — Follow-up agenda (5 min)        │ │ │
│ │ │ 12/09 🤝 Reunião — Apresentação de produto         │ │ │
│ │ │ 10/09 📄 Documento — Contrato assinado             │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌──────────────┐  ┌──────────────────────────────────────┐ │
│ │ Negócios     │  │ Próximas Ações                       │ │
│ │ ● TechSummit │  │ 📅 Follow-up em 3 dias               │ │
│ │   R$ 89K     │  │ 📧 Enviar convite evento             │ │
│ │ ● Expo2026   │  │ 📞 Ligação de cortesia               │ │
│ │   R$ 45K     │  └──────────────────────────────────────┘ │
│ └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### WEB-011 — Create Deal Form

**Descrição:** Formulário de criação de novo negócio no pipeline com campos essenciais e sugestão IA.

**Componentes:** FormCard, Input, Select, DatePicker, CurrencyInput, ContactPicker, StageSelector, AIFillButton

**Estados:** Carregamento | Preenchimento | Validação | Erro | Sucesso

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Novo Negócio                             [Cancelar]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Descreva para IA:                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "Novo patrocínio para Congresso Médico, valor ~R$ 50K" │ │
│ └─────────────────────────────────────────────────────────┘ │
│            [Preencher com IA ✨]                             │
│                                                             │
│ ─── ou preencha manualmente ───                             │
│                                                             │
│ Nome do Negócio                                             │
│ [________________________________________________]          │
│                                                             │
│ Contato                    Empresa                          │
│ [Selecionar contato ▼]    [________________________________]│
│                                                             │
│ Valor                      Probabilidade                    │
│ [R$          ][________]   [50% ▼]                         │
│                                                             │
│ Estágio                     Responsável                     │
│ [Proposta ▼]               [Maria S. ▼]                    │
│                                                             │
│ Data Prevista Fechamento    Tipo                            │
│ [15/10/2026]               [Patrocínio ▼]                  │
│                                                             │
│ Observações                                                 │
│ [________________________________________________]          │
│ [________________________________________________]          │
│                                                             │
│                    [Salvar]        [Salvar e novo]          │
└─────────────────────────────────────────────────────────────┘
```

### WEB-012 — Pipeline Settings

**Descrição:** Configuração de estágios do pipeline de vendas com drag-and-drop para reordenação, edição e probabilidades.

**Componentes:** DraggableStageList, StageCard, ProbabilitySlider, ColorPicker, AddStageButton, DeleteConfirmModal, SaveBar

**Estados:** Carregamento | Vazio | Erro | Dados | Salvando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Configuração de Pipeline              [Salvar] [▲]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Nome do Pipeline                                            │
│ [Pipeline Principal ___________________________________]   │
│                                                             │
│ Estágios (arraste para reordenar)                           │
│                                                             │
│ ┌─── [≡] ─────────────────────────────────────────────────┐ │
│ │ Lead                                      Cor: [●]      │ │
│ │ Probabilidade: [████░░░░░░] 30%                         │ │
│ │ [Excluir]                                                │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌─── [≡] ─────────────────────────────────────────────────┐ │
│ │ Qualificado                             Cor: [●]        │ │
│ │ Probabilidade: [████████░░] 50%                         │ │
│ │ [Excluir]                                                │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌─── [≡] ─────────────────────────────────────────────────┐ │
│ │ Proposta                                Cor: [●]        │ │
│ │ Probabilidade: [██████████░] 70%                        │ │
│ │ [Excluir]                                                │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌─── [≡] ─────────────────────────────────────────────────┐ │
│ │ Fechado/Won                            Cor: [●]         │ │
│ │ Ganho (não editável)                                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ [+ Adicionar estágio]                                       │
│                                                             │
│ Configurações Avançadas                                     │
│ [☑] Notificar ao mover negócio                             │
│ [☑] Exigir justificativa ao perder negócio                 │
│ [  ] Atualizar probabilidade automaticamente                │
└─────────────────────────────────────────────────────────────┘
```

### WEB-013 — Quote Generation

**Descrição:** Geração de proposta comercial/orçamento com dados do negócio, itens configuráveis e preview em PDF.

**Componentes:** QuoteForm, ItemTable, DiscountInput, TaxSelector, PDFPreview, AIGenerateButton, TermsEditor, SendButton

**Estados:** Carregamento | Vazio (sem itens) | Erro | Dados | Preview | Enviando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Nova Proposta             Tech Summit 2026  [Enviar]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Para ────────────────────────────────────────────────┐ │
│ │ Carlos Andrade • Tech ABC Corp                          │ │
│ │ carlos@techabc.com                                      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ─── Itens da Proposta ───                                   │
│                                                             │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Qtd  Item                    Valor Unit.     Total      │ │
│ │ ──────────────────────────────────────────────────────── │ │
│ │ 1    Patrocínio Platinum     R$ 50.000     R$ 50.000    │ │
│ │ 2    Ingressos VIP           R$ 1.200      R$ 2.400     │ │
│ │ 1    Espaço Premium          R$ 30.000     R$ 30.000    │ │
│ │      [Adicionar item]                     ────────────  │ │
│ │                                     Total: R$ 82.400    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ Desconto: [0]%                        Condições: [30 ▾] dias│
│                                                             │
│ [Gerar com IA ✨]  [Visualizar PDF 👁]  [Salvar Rascunho]  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Preview da Proposta                          [🖨] [📎]  │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │             PROPOSTA COMERCIAL                   │ │
│ │ │                                                  │ │
│ │ │ Tech Summit 2026 • R$ 82.400                    │ │
│ │ │ Válida até: 15/11/2026                          │ │
│ │ │                                                  │ │
│ │ │ 1. Patrocínio Platinum    R$ 50.000             │ │
│ │ │ 2. Ingressos VIP          R$ 2.400              │ │
│ │ │ 3. Espaço Premium         R$ 30.000             │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Mensagem:                                                   │
│ [Prezado Carlos, segue proposta para...              ]      │
│                                                             │
│ [Enviar Proposta]  [Baixar PDF]  [Copiar Link]             │
└─────────────────────────────────────────────────────────────┘
```

### WEB-014 — Email Composer

**Descrição:** Editor de e-mail com templates, variáveis dinâmicas, preview e integração com CRM.

**Componentes:** EmailEditor, TemplateSelector, VariablePicker, RecipientSelector, AISuggestions, AttachmentList, SendScheduler

**Estados:** Carregamento | Rascunho | Editando | Enviando | Enviado | Erro

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Novo E-mail              [Salvar rascunho] [Enviar]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Para: [Carlos Andrade <carlos@techabc.com>]  [CC] [BCC]   │
│                                                             │
│ Template: [Follow-up Proposta ▼]  ✨ Sugestão IA           │
│                                                             │
│ Assunto: [Segue proposta Tech Summit 2026             ]    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Prezado {{nome}},                                       │ │
│ │                                                         │ │
│ │ Segue em anexo a proposta para o Tech Summit 2026      │ │
│ │ no valor de {{valor}}.                                  │ │
│ │                                                         │ │
│ │ {{regras}}                                              │ │
│ │                                                         │ │
│ │ Aguardo seu feedback.                                   │ │
│ │                                                         │ │
│ │ Atenciosamente,                                         │ │
│ │ {{assinatura}}                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ✨ [Reescrever] [Melhor tom] [Encurtar] [Traduzir] [▶]    │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│ │ 📎 anexo │ │ 📊 graf. │ │ 🔗 links │                    │
│ │ proposta │ │ dados    │ │ site     │                    │
│ │ .pdf     │ │ .xlsx    │ │          │                    │
│ └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
│ Agendamento: [○] Enviar agora  [●] Agendar                 │
│ Data: [20/09/2026 ▸]  Hora: [10:00 ▸]                     │
└─────────────────────────────────────────────────────────────┘
```

### WEB-015 — Meeting Scheduler

**Descrição:** Agendamento de reuniões com integração de calendário, disponibilidade e confirmação automática.

**Componentes:** CalendarPicker, TimeSlotGrid, AttendeeSelector, MeetingForm, ConflictWarning, VideoConferenceToggle, ConfirmDialog

**Estados:** Carregamento | Vazio (sem horários) | Erro | Dados | Confirmando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Agendar Reunião                           [Confirmar]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Título                                                      │
│ [Follow-up Proposta Tech Summit___________________]        │
│                                                             │
│ Com: [Carlos Andrade] + [Adicionar participantes]          │
│                                                             │
│ Duração: [30 min ▼]                                         │
│                                                             │
│ ┌─────────────┬─────────────────────────────────────────┐  │
│ │ Set 2026    │                                          │  │
│ │ ┌─────────┐ │ Horários disponíveis — 20/09/2026       │  │
│ │ │Dom Seg  │ │                                          │  │
│ │ │    1  2  │ │ [09:00] [09:30] [10:00]                │  │
│ │ │ 3  4  5  │ │ [10:30] [11:00] ——— ocupado            │  │
│ │ │ 6 [7] 8  │ │ [11:30] [12:00] ——— ocupado            │  │
│ │ │ 9 10 11  │ │ [13:00] [13:30] [14:00]                │  │
│ │ └─────────┘ │                                          │  │
│ └─────────────┴─────────────────────────────────────────┘  │
│                                                             │
│ ┌─── Opções ─────────────────────────────────────────────┐ │
│ │ ☑ Videochamada (Google Meet)                          │ │
│ │ ☐ Sala presencial                                      │ │
│ │ ☐ Gravação automática                                  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ Lembrete: [15 min antes ▼] por [E-mail e Notificação ▼]   │
│                                                             │
│ Nota interna:                                                │
│ [Discutir detalhes do contrato                        ]    │
└─────────────────────────────────────────────────────────────┘
```

---

## Sponsor Screens

### WEB-016 — Sponsor Management List

**Descrição:** Lista gerenciável de patrocinadores com status, tier, valores e ações rápidas.

**Componentes:** DataTable, SponsorCard, StatusBadge, TierBadge, SearchInput, FilterPanel, BulkActions, ExportButton

**Estados:** Carregamento | Vazio | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Patrocinadores                     [+Adicionar] [Exportar]│
├─────────────────────────────────────────────────────────────┤
│ [🔍 Buscar patrocinador...]  [Tier: Todos ▼]  [Status ▼]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Totais: 12 patrocinadores | R$ 2.4M arrecadados     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Patrocinador        Tier       Valor     Status   Ações │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ 🏢 Tech ABC Corp    Platinum  R$ 500K  🟢 Ativo  [▼]  │ │
│ │ 🏢 Agro Ltda        Gold      R$ 250K  🟢 Ativo  [▼]  │ │
│ │ 🏢 Banco Central    Platinum  R$ 500K  🟡 Pend.  [▼]  │ │
│ │ 🏢 Saúde Plus       Silver    R$ 100K  🔴 Inat.  [▼]  │ │
│ │ 🏢 Educação BR      Bronze    R$ 50K   🟢 Ativo  [▼]  │ │
│ │ ⋮                                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [1] [2] [3] ... [5]                   [Exportar CSV]       │
└─────────────────────────────────────────────────────────────┘
```

### WEB-017 — Sponsor Tier Configuration

**Descrição:** Configuração de tiers/categorias de patrocínio com benefícios, preços e cores.

**Componentes:** TierList, TierCard, BenefitChecklist, PriceInput, ColorPicker, LimitConfig, PreviewPanel

**Estados:** Carregamento | Vazio | Erro | Dados | Salvando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Configuração de Tiers                   [Salvar] [▲]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💎 Platinum                          [Editar] [Excluir] │ │
│ │ Valor: R$ 500.000   Vagas: 3/5                          │ │
│ │                                                          │ │
│ │ Benefícios:                                              │ │
│ │ ☑ Estande premium 100m²    ☑ Logo no material          │ │
│ │ ☑ 10 ingressos VIP         ☑ Palestra de 30min         │ │
│ │ ☑ Destaque site            ☑ Café executivo            │ │
│ │ ☑ Relatório pós-evento     ☑ Coquetel exclusivo        │ │
│ │                                                          │ │
│ │ Cor: [💎 #0055FF]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🥇 Gold                              [Editar] [Excluir] │ │
│ │ Valor: R$ 250.000   Vagas: 5/8                          │ │
│ │ Benefícios: [6 selecionados...]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🥈 Silver                            [Editar] [Excluir] │ │
│ │ Valor: R$ 100.000   Vagas: Ilimitadas                   │ │
│ │ Benefícios: [4 selecionados...]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌── Preview ─────────────────────────────────────────────┐ │
│ │ 💎 Platinum | 🥇 Gold | 🥈 Silver | 🥉 Bronze          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ [+ Novo Tier]                    [Duplicar de evento ▼]   │
└─────────────────────────────────────────────────────────────┘
```

### WEB-018 — Sponsor Dashboard

**Descrição:** Dashboard do patrocinador com métricas de booth, visitas, leads gerados e engajamento.

**Componentes:** StatWidget, BoothMetricCard, LeadList, HeatmapMini, EngagementChart, AIInsights, RecentActivity

**Estados:** Carregamento | Vazio (evento sem dados) | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Dashboard — Tech ABC Corp          [Período: Hoje ▼]  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│ │2.450 │ │ 890  │ │ 22%  │ │ 156  │                      │
│ │Visitas│ │Leads │ │Conv. │ │Contat│                      │
│ └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                             │
│ ┌────────────────────────┐  ┌────────────────────────┐    │
│ │ Fluxo de Visitantes    │  │ Leads Capturados       │    │
│ │  ██                     │  │ ● João M. — (11)98888 │    │
│ │  █████                  │  │ ● Ana S. — (21)97777 │    │
│ │  ████████████           │  │ ● Pedro R. — (31)9666│    │
│ │  █████████████████      │  │ ● Carla T. — ⋯       │    │
│ │ └────────────────────────┘  │ [+Ver todos]          │    │
│                               └────────────────────────┘    │
│                                                             │
│ ┌────────────────────────┐  ┌────────────────────────┐    │
│ │ Engajamento por Hora   │  │ 💡 Insights IA ✨       │    │
│ │ ┌─────┐                │  │ ⚡ Pico às 14h —       │    │
│ │ │  🏆 │                │  │  reforçar equipe       │    │
│ │ │ 1º  │                │  │ ⚡ Produto mais         │    │
│ │ │ lugar│               │  │  consultado: ERP        │    │
│ │ └─────┘                │  │ ⚡ Lead quente:         │    │
│ │ Entre os estandes      │  │  Pedro R. — ligar agr  │    │
│ └────────────────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### WEB-019 — Sponsor ROI Report

**Descrição:** Relatório de retorno sobre investimento do patrocinador com comparativos, métricas e exportação.

**Componentes:** ROIChart, CostBreakdown, LeadValueCalculator, ComparisonTable, DateRangePicker, ExportButtons, AIRecommendations

**Estados:** Carregamento | Vazio (sem dados) | Erro | Dados | Exportando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Relatório ROI — Tech ABC Corp     [Exportar] [Período ▼]│
├─────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│ │R$ 500K│ │R$ 1.2M│ │ 240% │ │R$ 123 │                    │
│ │Inves. │ │Retorno│ │ ROI  │ │Custo │                    │
│ └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ROI ao Longo do Tempo                                   │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ROI ↑ 240%                                          │ │ │
│ │ │ ██████████████████████████████████████████████████   │ │ │
│ │ │ ████████████████████████████████████████             │ │ │
│ │ │ ██████████████████████████████                       │ │ │
│ │ │ ████████████████████                                 │ │ │
│ │ │ ████████████                                         │ │ │
│ │ │ ██████                                               │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌────────────────────────────┐  ┌────────────────────────┐ │
│ │ Investimento vs Retorno   │  │ Benchmarks             │ │
│ │                           │  │                        │ │
│ │ Investimento   R$ 500K    │  │ Média do evento: 180%  │ │
│ │ Leads gerados  R$ 356K    │  │ Top 10%: 350%          │ │
│ │ Vendas fech.   R$ 844K    │  │ Sua posição: 3° lugar  │ │
│ │ Retorno total  R$ 1.2M    │  │                        │ │
│ └────────────────────────────┘  │ 🏆 Acima da média!     │ │
│                                 └────────────────────────┘ │
│                                                             │
│ 💡 Recomendações IA: Aumentar equipe no horário de pico    │
│ para potencializar conversão de leads em vendas.            │
└─────────────────────────────────────────────────────────────┘
```

### WEB-020 — Booth Assignment

**Descrição:** Mapa interativo do evento para atribuição de estandes a patrocinadores com drag-and-drop.

**Componentes:** MapCanvas, BoothMarker, SponsorLegend, FloorSelector, AssignmentPanel, DragDropZone, ConflictIndicator, SaveButton

**Estados:** Carregamento | Vazio (mapa vazio) | Erro | Dados | Editando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Mapa de Estandes — Feira Agro   [Salvar] [Imprimir]   │
├─────────────────────────────────────────────────────────────┤
│ Andar: [Térreo ▼]  │  [🔍 Zoom: 100%]  [−] [+]  [🔎]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                     PALCO PRINCIPAL                     │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│ │
│ │ │ E01  │ │ E02  │ │ E03  │ │ E04  │ │ E05  │ │ E06  ││ │
│ │ │ Tech │ │ Agro │ │[Livre]│ │[Livre]│ │ Saúde│ │ Banco││ │
│ │ │ ABC  │ │ Ltda │ │      │ │      │ │ Plus │ │ Cent.││ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│ │
│ │ │ E07  │ │ E08  │ │ E09  │ │ E10  │ │ E11  │ │ E12  ││ │
│ │ │[Livre]│ │ Educ │ │ Food │ │[Livre]│ │[Livre]│ │ Tech ││ │
│ │ │      │ │ BR   │ │ Park │ │      │ │      │ │ Nova ││ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│ │
│ │                                                         │ │
│ │ ┌─────────────────────────────┐  ┌────────────────────┐ │ │
│ │ │        ÁREA VIP             │  │      ENTRADA       │ │ │
│ │ │ ┌──────┐ ┌──────┐ ┌──────┐│  └────────────────────┘ │ │
│ │ │ │ E13  │ │ E14  │ │ E15  ││                         │ │
│ │ │ │[Livre]│ │[Livre]│ │[Livre]││                         │ │
│ │ │ └──────┘ └──────┘ └──────┘│                         │ │
│ │ └─────────────────────────────┘                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Legenda ────────────────────────────────────────────┐ │
│ │ 🟩 Disponível   🟦 Ocupado   🟧 Pendente   🚺 Acesso  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🎯 Arraste patrocinadores para os estandes livres          │
└─────────────────────────────────────────────────────────────┘
```

---

## Marketplace Screens

### WEB-021 — Marketplace Home

**Descrição:** Página inicial do marketplace com destaque de produtos, categorias e busca.

**Componentes:** HeroBanner, CategoryGrid, ProductCard, SearchBar, FeaturedDeals, TrendingSidebar, AISuggestions

**Estados:** Carregamento | Vazio | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Marketplace                    [🛒 3]  [💬]  [👤]    │
├─────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│ 🎪 [Produtos] [Categorias] [Vendedores] [Ofertas] [⋮]     │
│                                                                                                                     │
│ [🔍 Buscar produtos, serviços...]                          │
│                                                                                                                     │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ 🏆 Ofertas Especiais — Congresso Médico 2026          │  │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │  │
│ │ │🎯  │ │📋  │ │🩺  │ │📱  │                          │  │
│ │ │Kit │ │Lote│ │Equi│ │App │                          │  │
│ │ │R$99│ │R$49│ │R$2K│ │Grát│                          │  │
│ │ └────┘ └────┘ └────┘ └────┘                          │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│ Categorias                                                   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│ │🎫   │ │👕   │ │📚   │ │🎪   │ │💻   │            │
│ │Ingres│ │Brinde│ │Cursos│ │Estan│ │Softw │            │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                                                                                     │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Recomendados para você                        [Ver >]│  │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │  │
│ │ │Ingres│ │Brinde│ │Seguro│ │Creden│                 │  │
│ │ │Pass  │ │Kit   │ │Evento│ │Digital│                 │  │
│ │ │R$299 │ │R$89  │ │R$49  │ │Grátis│                 │  │
│ │ └──────┘ └──────┘ └──────┘ └──────┘                 │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### WEB-022 — Product Listing

**Descrição:** Lista de produtos com filtros avançados, ordenação e visualização em grid/lista.

**Componentes:** ProductGrid, ProductCard, FilterSidebar, SortDropdown, Pagination, QuickViewModal, CompareButton

**Estados:** Carregamento | Vazio (sem resultados) | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Ingressos         [🔍]    [🛒 2]                       │
├─────────────────────────────────────────────────────────────┤
│ Filtros           │ Resultados: 12 produtos                  │
│ ┌────────────────┐│  Ordenar: [Mais populares ▼]           │
│ │ Categoria       ││  [Grid ▼] [Lista]                     │
│ │ [☑] Ingressos   ││                                       │
│ │ [  ] Brindes    ││  ┌─────┐ ┌─────┐ ┌─────┐             │
│ │ [  ] Cursos     ││  │🎫   │ │🎫   │ │🎫   │             │
│ │ [  ] Serviços   ││  │Pass. │ │Diária│ │VIP   │             │
│ │                 ││  │Comple│ │Simp. │ │Exp.  │             │
│ │ Preço           ││  │R$299 │ │R$149 │ │R$599 │             │
│ │ [———●—————]     ││  │[Carr]│ │[Carr]│ │[Carr]│             │
│ │  R$0  R$1000    ││  └─────┘ └─────┘ └─────┘             │
│ │                 ││  ┌─────┐ ┌─────┐ ┌─────┐             │
│ │ Disponibilidade ││  │🎫   │ │📋   │ │🩺   │             │
│ │ [☑] Disponível  ││  │Lote  │ │Curso │ │Kit   │             │
│ │ [  ] Esgotado   ││  │10x   │ │Médico│ │Mídia │             │
│ │                 ││  │R$999 │ │R$49  │ │R$199 │             │
│ │ Vendedor        ││  │[Carr]│ │[Carr]│ │[Carr]│             │
│ │ [Todos ▼]       ││  └─────┘ └─────┘ └─────┘             │
│ │                 ││                                       │
│ │ [Limpar filtros]││  [1] [2] [3] ... [10]                 │
│ └────────────────┘│                                       │
└─────────────────────────────────────────────────────────────┘
```

### WEB-023 — Shopping Cart

**Descrição:** Carrinho de compras com resumo de itens, quantidades, descontos e cálculo de frete.

**Componentes:** CartItemList, QuantityStepper, PriceSummary, CouponInput, ShippingCalculator, SaveForLater, SuggestUpsell

**Estados:** Carregamento | Vazio (carrinho vazio) | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Carrinho  (3 itens)                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎫 Passaporte Completo                     R$ 299      │ │
│ │   Evento: Feira Agropecuária                            │ │
│ │   [−]  2  [+]    [Remover]   [Salvar p/ depois]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👕 Kit Brindes Oficial                       R$ 89      │ │
│ │   [−]  1  [+]    [Remover]   [Salvar p/ depois]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🅿️ Estacionamento (3 dias)                    R$ 60      │ │
│ │   [−]  1  [+]    [Remover]   [Salvar p/ depois]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Cupom de desconto ───────────────────────────────────┐ │
│ │ [________________________] [Aplicar]  🎉 CUPOM10       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Resumo ──────────────────────────────────────────────┐ │
│ │ Subtotal (3 itens):                           R$ 747    │ │
│ │ Desconto (CUPOM10 -10%):                    -R$ 74,70  │ │
│ │ Taxa de serviço:                              R$ 19,90  │ │
│ │ ─────────────────────────────────────────────           │ │
│ │ Total:                                       R$ 692,20  │ │
│ │                                                     │ │
│ │ [Continuar Comprando]     [Ir para Checkout →]        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🎯 Você também pode gostar: [Ingresso VIP] [Camiseta]     │
└─────────────────────────────────────────────────────────────┘
```

### WEB-024 — Checkout Flow

**Descrição:** Fluxo de finalização de compra com etapas de dados pessoais, pagamento e confirmação.

**Componentes:** CheckoutStepper, PaymentForm, PixQRCode, CreditCardForm, BillingAddress, OrderSummary, SecurityBadge, SuccessScreen

**Estados:** Carregamento | Validação | Erro pagamento | Sucesso | Processando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Finalizar Pedido                                       │
├─────────────────────────────────────────────────────────────┤
│ ● Dados │ ○ Pagamento │ ○ Confirmação                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Dados Pessoais ─────────────────────────────────────┐ │
│ │ Nome completo                                            │ │
│ │ [Maria da Silva__________________________________]      │ │
│ │                                                         │ │
│ │ CPF / CNPJ                    Data de Nasc.              │ │
│ │ [123.456.789-00_______]      [15/03/1990____]          │ │
│ │                                                         │ │
│ │ E-mail                      Telefone                    │ │
│ │ [maria@email.com_______]    [(11) 99999-0000____]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Ingressos Nominais ──────────────────────────────────┐ │
│ │ Ingresso 1: [Maria da Silva_______________________]     │ │
│ │ Ingresso 2: [João Pedro___________________________]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [☑] Concordo com os termos de uso e política privacidade  │
│                                                             │
│                    [Ir para Pagamento →]                    │
├─────────────────────────────────────────────────────────────┤
│ ● Dados │ ○ Pagamento │ ○ Confirmação                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Forma de Pagamento ──────────────────────────────────┐ │
│ │ [●] PIX  [○] Cartão Crédito  [○] Boleto  [○] PayPal    │ │
│ │                                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │                   PIX                               │ │ │
│ │ │                                                     │ │ │
│ │ │               ██████████████                        │ │ │
│ │ │               ██  ████  ████                        │ │ │
│ │ │               ██  ██      ██                        │ │ │
│ │ │               ██  ██  ██████                        │ │ │
│ │ │               ██████████████                        │ │ │
│ │ │                                                     │ │ │
│ │ │               Pague R$ 692,20                       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ [✅ Li o QR Code]  [Copiar código PIX]                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [Confirmar Pagamento]                     │
├─────────────────────────────────────────────────────────────┤
│ ● Dados │ ● Pagamento │ ● Confirmação                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                ✅ Pedido Confirmado!                        │
│                                                             │
│               ┌─────────────────┐                          │
│               │   🎉            │                          │
│               │  #123456        │                          │
│               └─────────────────┘                          │
│                                                             │
│ Seu pedido foi processado com sucesso.                      │
│ Os ingressos serão enviados para seu e-mail.                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Resumo                                                  │ │
│ │ Evento: Feira Agropecuária 2026                         │ │
│ │ Data: 15-18 Set 2026                                    │ │
│ │ Qtd: 2 × Passaporte Completo                  R$ 598   │ │
│ │ 1 × Kit Brindes                                 R$ 89   │ │
│ │ ─────────────────────────────                           │ │
│ │ Total pago:                                   R$ 692,20 │ │
│ │ Pagamento: PIX (aprovado)                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Baixar Comprovante 📄]  [Ver Ingressos 🎫]                │
└─────────────────────────────────────────────────────────────┘
```

### WEB-025 — Seller Dashboard

**Descrição:** Painel do vendedor no marketplace com gestão de produtos, vendas e métricas.

**Componentes:** SalesSummary, ProductManager, OrderList, RevenueChart, RatingsCard, InventoryAlert, PayoutInfo

**Estados:** Carregamento | Vazio (sem vendas) | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Minhas Vendas           [Período: Este mês ▼]         │
├─────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│ │156   │ │R$ 23K│ │4.8⭐ │ │R$ 12K│                      │
│ │Vendas│ │Fatura│ │Avalia│ │Pend. │                      │
│ └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Faturamento Mensal                                      │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ████████████████████████          R$ 12K (Semana 1) │ │ │
│ │ │ ███████████████████████████       R$ 15K (Semana 2) │ │ │
│ │ │ ██████████████████████████████    R$ 18K (Semana 3) │ │ │
│ │ │ ████████████████████████████████  R$ 23K (Semana 4) │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────┐  ┌──────────────────────┐  │
│ │ Produtos Ativos (12)        │  │ Últimos Pedidos      │  │
│ │ ─────────────────────────── │  │ ──────────────────── │  │
│ │ 🎫 Passaporte  — R$ 299    │  │ #1234 — Maria    ✅  │  │
│ │   Vendidos: 89 | Est: 200   │  │ #1233 — João     🔄  │  │
│ │ 📋 Curso — R$ 49            │  │ #1232 — Ana      ⏳  │  │
│ │   Vendidos: 234 | Est: 500  │  │ #1231 — Pedro    ✅  │  │
│ │                             │  │ [Ver todos]           │  │
│ │ [+ Adicionar Produto]       │  └──────────────────────┘  │
│ └─────────────────────────────┘                            │
│                                                             │
│ 📊 Próximo saque: R$ 12.450 → Previsão: 05/10/2026        │
└─────────────────────────────────────────────────────────────┘
```

---

## BI/Analytics Screens

### WEB-026 — BI Dashboard

**Descrição:** Dashboard executivo com widgets configuráveis de métricas de negócio, gráficos e KPIs.

**Componentes:** DashboardGrid, WidgetContainer, KPIWidget, ChartWidget, DateRangeSelector, FilterBar, ExportDashboard, AIInsights

**Estados:** Carregamento | Vazio | Erro | Dados | Configurando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] BI Analytics     [Período: Últimos 30 dias ▼]   [🔍]  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│ │12.5K │ │R$ 2.4M│ │ 78%  │ │4.5K  │ │ 22%  │            │
│ │Check │ │Receit│ │Ocup. │ │Leads │ │Cresc │            │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                             │
│ ┌─────────────────────┐  ┌─────────────────────────────┐  │
│ │ Receita por Evento  │  │ Inscrições ao Longo do Tempo│  │
│ │ ┌─────────────────┐ │  │ ┌─────────────────────────┐ │  │
│ │ │ Feira Agro R$1.2M│ │  │ │ ██████████████         │ │  │
│ │ │ Cong. Méd R$890K│ │  │ │ ██████████████████      │ │  │
│ │ │ Tech Expo R$310K│ │  │ │ ████████████████████████ │ │  │
│ │ └─────────────────┘ │  │ └─────────────────────────┘ │  │
│ └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────┐ ┌──────────────────────────────┐ │
│ │ Top Patrocinadores   │ │ 💡 Insights IA ✨            │ │
│ │ ┌──────────────────┐ │ │ • Vendas 23% acima da meta  │ │
│ │ │🥇 Tech ABC  R$500K│ │ │ • Ticket médio subiu 15%   │ │
│ │ │🥈 Agro Ltda R$250K│ │ │ • 3 eventos precisam ação  │ │
│ │ │🥉 Banco C.  R$200K│ │ │ • Lead time redução 2 dias │ │
│ │ └──────────────────┘ │ └──────────────────────────────┘ │
│ └──────────────────────┘                                  │
│                                                             │
│ [+ Adicionar Widget]  [Salvar Layout]  [Exportar PDF]     │
└─────────────────────────────────────────────────────────────┘
```

### WEB-027 — Event Heatmap

**Descrição:** Mapa de calor do evento mostrando áreas de maior concentração de visitantes em tempo real ou histórico.

**Componentes:** MapCanvas, HeatmapOverlay, TimeSlider, FloorSelector, DensityLegend, ZoneStats, PlaybackControl

**Estados:** Carregamento | Vazio (sem dados) | Erro | Dados | Reproduzindo

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Mapa de Calor — Feira Agro    [Ao Vivo ●]   [Histórico]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                     PALCO PRINCIPAL                     │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│ │
│ │ │░░░░░░│ │██████│ │██████│ │██████│ │░░░░░░│ │░░░░░░││ │
│ │ │ E01  │ │ E02  │ │ E03  │ │ E04  │ │ E05  │ │ E06  ││ │
│ │ │░░░░░░│ │██████│ │██████│ │██████│ │░░░░░░│ │░░░░░░││ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│ │
│ │ │██████│ │██████│ │░░░░░░│ │██░░░░│ │░░░░░░│ │██████││ │
│ │ │ E07  │ │ E08  │ │ E09  │ │ E10  │ │ E11  │ │ E12  ││ │
│ │ │██████│ │██████│ │░░░░░░│ │██░░░░│ │░░░░░░│ │██████││ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│ │
│ │                                                         │ │
│ │   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─          │ │
│ │   ÁREA VIP (fluxo intenso)     ENTRADA (aglomeração)    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Legenda ────────────────────────────────────────────┐ │
│ │ 🟢 Baixo  🟡 Médio  🟠 Alto  🔴 Crítico               │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ▶️ Playback: [⏮] [⏪] [▶] [⏩] [⏭]  14:30 — 15:30       │
│                                                             │
│ ┌─── Zonas Mais Quentes ──────────────────────────────────┐ │
│ │ 1. Entrada Principal — 2.450 pessoas                    │ │
│ │ 2. Estande Tech ABC — 890 pessoas                       │ │
│ │ 3. Praça Alimentação — 756 pessoas                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### WEB-028 — Real-time Monitoring

**Descrição:** Monitoramento em tempo real de check-ins, fluxo de pessoas, alertas e status do evento.

**Components:** LiveCounter, EventStream, AlertPanel, StatusCard, MiniHeatmap, ActivityFeed, Clock, ConnectionStatus

**Estados:** Carregamento | Conectando | Erro (offline) | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Monitor em Tempo Real — Feira Agro                      │
├─────────────────────────────────────────────────────────────┤
│                       ⏰ 14:32:18  🟢 Ao vivo              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│ │ 12.5K│ │ 3.2K │ │ 156  │ │ 98%  │                      │
│ │Check │ │Agora │ │Por h │ │Sist. │                      │
│ └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                             │
│ ┌─── Alertas ────────────────────────────────────────────┐ │
│ │ 🔴 ⚠️ Aglomeração na entrada — acionar segurança      │ │
│ │ 🟡 ℹ️ Estande E03 sem operador há 30 min              │ │
│ │ 🟢 ✅ Pico de check-in processado sem erros            │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Fluxo Agora              │  │ Status dos Sistemas      │ │
│ │ ┌──────────────────────┐ │  │ ┌──────────────────────┐ │ │
│ │ │ 🟢 Check-in: 156/min │ │  │ │ Credenciamento  🟢   │ │ │
│ │ │ 🟡 Estacionam: 12/min│ │  │ │ Catracas        🟢   │ │
│ │ │ 🟢 QR Lidos: 142/min │ │  │ │ Pagamentos      🟡   │ │
│ │ │ 🔴 Face: 0/min (erro)│ │  │ │ Rede Wi-Fi      🟢   │ │
│ │ └──────────────────────┘ │  │ │ Aplicativos     🟢   │ │
│ └──────────────────────────┘  │ │ API Externa     🔴   │ │
│                                │ └──────────────────────┘ │
│                                └──────────────────────────┘ │
│                                                             │
│ ┌─── Últimas Atividades ──────────────────────────────────┐ │
│ │ 14:31 ✅ Check-in — Maria S. (QR)                       │ │
│ │ 14:30 ✅ Check-in — João P. (QR)                        │ │
│ │ 14:28 ❌ Falha leitura — tentar novamente               │ │
│ │ 14:25 ✅ Check-in — Ana C. (Face)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### WEB-029 — Report Generator

**Descrição:** Gerador de relatórios personalizados com seleção de métricas, visualizações e agendamento.

**Componentes:** ReportBuilder, MetricSelector, ChartTypePicker, DateRangePicker, ScheduleConfig, PreviewPanel, ExportOptions, SavedReportsList

**Estados:** Carregamento | Vazio (sem relatórios) | Erro | Dados | Gerando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Gerar Relatório                        [Salvar] [▲]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Configuração ───────────────────────────────────────┐ │
│ │ Nome do Relatório                                       │ │
│ │ [Relatório Mensal de Vendas________________________]   │ │
│ │                                                         │ │
│ │ Evento: [Feira Agropecuária 2026 ▼]                    │ │
│ │ Período: [01/09/2026] até [30/09/2026]                 │ │
│ │ Formato: [PDF ▼]   Agendar: [●] Sim  [○] Não          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Selecione as Métricas ───────────────────────────────┐ │
│ │ [☑] Receita total          [☑] Ticket médio            │ │
│ │ [☑] Check-ins              [☑] Ocupação                │ │
│ │ [☑] Leads gerados          [☑] Conversão               │ │
│ │ [☑] Patrocinadores         [☐] Satisfação              │ │
│ │ [☐] Engajamento app        [☐] Redes sociais           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Visualização ───────────────────────────────────────┐ │
│ │ Seção 1: [📊 Gráfico de Barras ▼]  — Receita por dia  │ │
│ │ Seção 2: [📈 Linha ▼]  — Tendência de check-ins        │ │
│ │ Seção 3: [📋 Tabela ▼] — Top patrocinadores            │ │
│ │ [Adicionar seção]                                       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Agendamento ────────────────────────────────────────┐ │
│ │ Frequência: [Semanal ▼]  Dia: [Segunda ▼]  Hora: [08] │ │
│ │ Enviar para: [maria@email.com] [+Adicionar]             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Gerar Agora]  [Agendar]  [Preview]  [Cancelar]           │
└─────────────────────────────────────────────────────────────┘
```

### WEB-030 — Custom Query Builder

**Descrição:** Construtor de consultas SQL-visual para usuários avançados extraírem dados personalizados.

**Componentes:** QueryCanvas, TableSelector, FieldPicker, FilterBuilder, JoinConfigurator, SQLPreview, ResultTable, ExportData, AIQueryAssistant

**Estados:** Carregamento | Vazio | Erro (consulta inválida) | Dados | Executando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Query Builder                       [Executar] [Limpar]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Ou pergunte à IA:                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "Quais patrocinadores tiveram mais leads no último mês?" │ │
│ └─────────────────────────────────────────────────────────┘ │
│             [Gerar Query ✨]                                │
│                                                             │
│ ┌─── Query Visual ───────────────────────────────────────┐ │
│ │ 📦 Tabelas: [eventos] [patrocinadores] [leads]  [+]   │ │
│ │                                                         │ │
│ │ ┌───────┐     ┌────────────┐     ┌──────┐             │ │
│ │ │eventos│━━━━▶│patrocinador│━━━━▶│leads │             │ │
│ │ │ • id   │     │ • id       │     │ • id  │             │ │
│ │ │ • nome │     │ • nome     │     │ • nome│             │ │
│ │ │ • data │     │ • evento_id│     │ • tel │             │ │
│ │ └───────┘     └────────────┘     │ • data│             │ │
│ │                                  └──────┘             │ │
│ │                                                         │ │
│ │ 🔽 Filtros:                                             │ │
│ │   evento.nome = "Feira Agro"  [×]                      │ │
│ │   leads.data >= "2026-09-01"  [×]                      │ │
│ │   [+ Adicionar filtro]                                 │ │
│ │                                                         │ │
│ │ 🏷️ Campos: [patrocinador.nome] [COUNT(leads.id)]  [+] │ │
│ │                                                         │ │
│ │ 📊 Agrupar por: [patrocinador.nome]  [×]               │ │
│ │ 📉 Ordenar por: [COUNT(leads.id)] [DESC ▼] [×]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── SQL Gerado ──────────────────────────────────────────┐ │
│ │ SELECT p.nome, COUNT(l.id) as total_leads               │ │
│ │ FROM patrocinadores p                                    │ │
│ │ JOIN leads l ON l.patrocinador_id = p.id                │ │
│ │ JOIN eventos e ON e.id = p.evento_id                    │ │
│ │ WHERE e.nome = 'Feira Agro' AND l.data >= '2026-09-01' │ │
│ │ GROUP BY p.nome ORDER BY total_leads DESC               │ │
│ │ [Copiar SQL]                                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Resultados (5 linhas) ───────────────────────────────┐ │
│ │ Patrocinador      │ Total Leads                        │ │
│ │ ──────────────────┼────────────────────────────────────│ │
│ │ Tech ABC Corp     │ 890                                │ │
│ │ Agro Ltda         │ 654                                │ │
│ │ Banco Central     │ 432                                │ │
│ │ ⋮                                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Exportar CSV]  [Salvar Query]  [Adicionar ao Dashboard]   │
└─────────────────────────────────────────────────────────────┘
```

---

## Settings Screens

### WEB-031 — Organization Settings

**Descrição:** Configurações gerais da organização: nome, logo, domínio, fusos horários e preferências.

**Componentes:** OrgProfileForm, LogoUploader, DomainInput, TimezoneSelector, LanguageSelector, ThemePicker, SaveBar, AuditLog

**Estados:** Carregamento | Editando | Salvando | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Configurações da Organização          [Salvar]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Informações da Empresa ──────────────────────────────┐ │
│ │ Nome da Organização                                      │ │
│ │ [EventOS Tecnologia Ltda__________________________]      │ │
│ │                                                          │ │
│ │ CNPJ                                                     │ │
│ │ [12.345.678/0001-90______________________________]      │ │
│ │                                                          │ │
│ │ Site                                                     │ │
│ │ [https://www.eventos.com.br_______________________]      │ │
│ │                                                          │ │
│ │ Logo                                                     │ │
│ │ ┌──────────────────────┐                                 │ │
│ │ │     [📁 Upload]      │                                 │ │
│ │ │     EventOS          │                                 │ │
│ │ └──────────────────────┘                                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Localização ─────────────────────────────────────────┐ │
│ │ Fuso Horário                Idioma                      │ │
│ │ [America/Sao_Paulo ▼]      [Português (BR) ▼]          │ │
│ │                                                          │ │
│ │ Moeda                       Formato de Data              │ │
│ │ [BRL (R$) ▼]               [DD/MM/AAAA ▼]              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Preferências ────────────────────────────────────────┐ │
│ │ [☑] Modo escuro                                         │ │
│ │ [☑] Notificações por e-mail                             │ │
│ │ [☐] Relatório automático semanal                        │ │
│ │ [☑] Modo de férias (desativar check-in)                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🕐 Última alteração: 10/09/2026 por admin@eventos.com      │
└─────────────────────────────────────────────────────────────┘
```

### WEB-032 — Billing & Plan

**Descrição:** Gestão de plano de assinatura, métodos de pagamento, histórico de faturas e uso.

**Componentes:** PlanCard, CurrentPlanBadge, FeatureComparison, PaymentMethodForm, InvoiceTable, UsageMeter, UpgradeCTA, CancelModal

**Estados:** Carregamento | Vazio (sem faturas) | Erro | Dados | Cancelando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Faturamento e Plano                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Plano Atual ─────────────────────────────────────────┐ │
│ │ 🏆 Enterprise                                        │ │
│ │ R$ 2.990/mês                                  [Gerenciar]│ │
│ │                                                          │ │
│ │ 📊 Uso deste mês: 78%                                    │ │
│ │ ████████████████████████████████████████░░░░             │ │
│ │ Eventos: 12/15 | Patrocinadores: 8/Ilimitado            │ │
│ │ Check-ins: 45K/100K | Armazenamento: 45GB/100GB         │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Método de Pagamento ─────────────────────────────────┐ │
│ │ 💳 Cartão final 4455  [Alterar]                         │ │
│ │ Próxima cobrança: 01/10/2026 — R$ 2.990                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Faturas Recentes ────────────────────────────────────┐ │
│ │ Período           Valor     Status   Nota Fiscal        │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ Set/2026        R$ 2.990   🟢 Pago   [Download]        │ │
│ │ Ago/2026        R$ 2.990   🟢 Pago   [Download]        │ │
│ │ Jul/2026        R$ 2.990   🟢 Pago   [Download]        │ │
│ │ Jun/2026        R$ 2.490   🟢 Pago   [Download]        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Comparar Planos ─────────────────────────────────────┐ │
│ │ Basic      Pro         Enterprise    Custom             │ │
│ │ R$ 990     R$ 1.990    R$ 2.990     💬 Consultar       │ │
│ │ 3 eventos  5 eventos   15 eventos   Ilimitado           │ │
│ │ ⋮          ⋮           ⋮            ⋮                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🛑 [Cancelar Assinatura]                                    │
└─────────────────────────────────────────────────────────────┘
```

### WEB-033 — Team Management

**Descrição:** Gerenciamento de membros da equipe com funções, permissões e convites.

**Componentes:** MemberTable, RoleBadge, InviteForm, PermissionTree, RoleSelector, ActivityLog, RemoveConfirmModal

**Estados:** Carregamento | Vazio (sem membros) | Erro | Dados | Convidando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Equipe                        [Convidar Membros] [▼]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Membros da Equipe  (8 membros)                              │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Nome              E-mail              Função    Status  │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ 👤 Maria Silva    maria@eventos.com   Admin    🟢     │ │
│ │ 👤 João Pedro     joao@eventos.com    Gerente  🟢     │ │
│ │ 👤 Ana Costa      ana@eventos.com     Operador 🟢     │ │
│ │ 👤 Carlos Souza   carlos@eventos.com  Vendas   🟢     │ │
│ │ 👤 Luiza Mendes   luiza@eventos.com   Vendas   🟡     │ │
│ │ 👤 Pedro Alves    pedro@eventos.com   Finance  🟢     │ │
│ │ 👤 Sofia Rocha    sofia@eventos.com   Suporte  🔴     │ │
│ │ 👤 Convidado      convite@email.com   Operador ⏳     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Convidar Membro ─────────────────────────────────────┐ │
│ │ E-mail                                                    │ │
│ │ [novo@email.com____________________________________]    │ │
│ │                                                           │ │
│ │ Função: [Selecionar ▼]                                    │ │
│ │                                                           │ │
│ │ [Enviar Convite]                                         │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Funções e Permissões ────────────────────────────────┐ │
│ │ Admin     — Acesso total                                 │ │
│ │ Gerente   — Gerenciar eventos e equipe                   │ │
│ │ Vendas    — CRM e propostas                              │ │
│ │ Operador  — Check-in e operação                          │ │
│ │ Finance   — Faturamento e relatórios                     │ │
│ │ Suporte   — Atendimento ao participante                  │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### WEB-034 — API Keys

**Descrição:** Gerenciamento de chaves de API para integrações externas com controle de permissões e expiração.

**Componentes:** KeyList, KeyCard, CreateKeyModal, PermissionCheckbox, CopyButton, RevokeConfirm, UsageChart, RotationAlert

**Estados:** Carregamento | Vazio (sem chaves) | Erro | Dados | Criando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Chaves de API                      [+ Nova Chave]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Chaves Ativas ───────────────────────────────────────┐ │
│ │ Nome          Chave               Criada   Uso  Ações   │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ 🔑 Produção   sk_live_••••••••  15/09  1.2M  [▼]      │ │
│ │ 🔑 Homologaç  sk_test_••••••••  10/09  45K   [▼]      │ │
│ │ 🔑 Mobile     sk_live_••••••••  01/08  890K  [▼]      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Detalhes da Chave: Produção ─────────────────────────┐ │
│ │ Chave: sk_live_••••••••••••••••  [Copiar] [Revogar]   │ │
│ │                                                          │ │
│ │ Permissões:                                              │ │
│ │ [☑] Ler eventos     [☑] Criar check-in                  │ │
│ │ [☑] Ler ingressos   [☐] Criar eventos                   │ │
│ │ [☑] Ler contatos    [☐] Excluir dados                   │ │
│ │                                                          │ │
│ │ Uso nos últimos 30 dias:                                 │ │
│ │  ██████████████████████████████  1.2M requisições       │ │
│ │                                                          │ │
│ │ Expira em: 15/09/2027 (1 ano)                            │ │
│ │ Último uso: há 2 minutos                                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Documentação ────────────────────────────────────────┐ │
│ │ 📖 [Guia de Integração API]  🌐 [Swagger/OpenAPI]      │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### WEB-035 — Integration Settings

**Descrição:** Configuração de integrações com serviços externos como pagamento, e-mail, CRM e redes sociais.

**Componentes:** IntegrationCard, ConnectionStatus, OAuthButton, ConfigForm, WebhookList, EventSelector, SyncStatus, TestConnection

**Estados:** Carregamento | Vazio | Erro | Dados | Conectando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Integrações                          [Testar Tudo]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Pagamento ───────────────────────────────────────────┐ │
│ │ 💳 Stripe                                  🟢 Conectado  │ │
│ │ Chave pública: pk_live_••••••••••••                     │ │
│ │ [Configurar] [Desconectar]                              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── E-mail ──────────────────────────────────────────────┐ │
│ │ 📧 SendGrid                               🟢 Conectado  │ │
│ │ Enviados hoje: 1.245  |  Limite: 10.000/dia            │ │
│ │ [Configurar] [Desconectar]                              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── CRM ─────────────────────────────────────────────────┐ │
│ │ 🤝 Salesforce                            🟡 Pendente    │ │
│ │ Sincronização bidirecional configurada                   │ │
│ │ Última sincronização: 15/09 14:30                       │ │
│ │ [Configurar] [Sincronizar Agora] [Desconectar]          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Redes Sociais ───────────────────────────────────────┐ │
│ │ 📱 Instagram                             🟢 Conectado   │ │
│ │ 📘 Facebook                              🔴 Erro        │ │
│ │ [Reconectar]                                             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Webhooks ────────────────────────────────────────────┐ │
│ │ URL                                            Eventos  │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ https://meudominio.com/webhook  check_in, pagamento [×]│ │
│ │ [+ Adicionar Webhook]                                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💡 Dica: Configure webhooks para receber eventos em tempo  │
│ real sobre check-ins, pagamentos e novos participantes.    │
└─────────────────────────────────────────────────────────────┘
```

### WEB-036 — White Label Configuration

**Descrição:** Configuração de white label para personalização completa da plataforma com marca do cliente.

**Componentes:** ThemeEditor, ColorPicker, FontSelector, LogoSettings, DomainConfig, CustomCSS, PreviewFrame, PublishButton

**Estados:** Carregamento | Editando | Salvando | Erro | Dados | Publicado

```
┌─────────────────────────────────────────────────────────────┐
│ [←] White Label                         [Preview] [Publicar]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Marca ───────────────────────────────────────────────┐ │
│ │ Nome do Cliente                                          │ │
│ [Organização ABC____________________________________]     │ │
│ │                                                          │ │
│ │ Logo                                         Favicon     │ │
│ │ ┌──────────┐              ┌────────┐                    │ │
│ │ │[Upload]  │              │[Upload]│                    │ │
│ │ │   ABC    │              │  ☐     │                    │ │
│ │ └──────────┘              └────────┘                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Tema ─────────────────────────────────────────────────┐ │
│ │ Cores                                                     │ │
│ │ Primária: [■ #003366]  Secundária: [■ #FF6600]          │ │
│ │ Fundo: [■ #FFFFFF]     Texto: [■ #111827]               │ │
│ │                                                           │ │
│ │ Tipografia                                                │ │
│ │ Fontes: [Inter ▼]  Títulos: [700]  Corpo: [400]        │ │
│ │                                                           │ │
│ │ Arredondamento                                            │ │
│ │ [○] Padrão  [●] Arredondado  [○] Quadrado               │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Domínio Personalizado ───────────────────────────────┐ │
│ │ URL: [https://eventos.organizacaoabc.com.br________]    │ │
│ │ Status: ⚠️ DNS não configurado  [Verificar DNS]        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── CSS Customizado ─────────────────────────────────────┐ │
│ │ /* Estilos personalizados */                             │ │
│ │ .header { background: #003366; }                        │ │
│ │ .btn-primary { border-radius: 8px; }                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Preview ─────────────────────────────────────────────┐ │
│ │ ┌──────────────────────────────────────────────────────┐│ │
│ │ │ [Logo ABC]  [Busca...]           [🔔] [👤]          ││ │
│ │ │                                                      ││ │
│ │ │            Portal do Participante                    ││ │
│ │ │   Seja bem-vindo!                                    ││ │
│ │ │                                                      ││ │
│ │ │   [Meus Ingressos] [Credenciamento] [Programação]    ││ │
│ │ └──────────────────────────────────────────────────────┘│ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Networking Screens

### WEB-037 — Networking Hub

**Descrição:** Hub central de networking com feed de atividade, conexões, sugestões e chat rápido.

**Componentes:** ActivityFeed, ConnectionList, MatchCarousel, QuickChatButton, SearchPeople, FilterChips, NotificationDot

**Estados:** Carregamento | Vazio (sem conexões) | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Networking                     [🔍] [🔔 3] [👤]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Conexões Ativas ─────────────────────────────────────┐ │
│ │ 👤 Maria Silva      · Gerente de Marketing   [💬] [📇] │ │
│ │ 👤 João Pedro       · CEO Tech Startup       [💬] [📇] │ │
│ │ 👤 Ana Costa        · Diretora de Vendas     [💬] [📇] │ │
│ │ [+ Ver todos — 12 conexões]                            │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🎯 Sugestões para Você                                      │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                               │
│ │ 👤  │ │ 👤  │ │ 👤  │ │ 👤  │                               │
│ │Carl │ │Luiza│ │Pedro│ │Sofia│                               │
│ │ Tech│ │ Mkt │ │ Fin │ │ RH  │                               │
│ │[Con]│ │[Con]│ │[Con]│ │[Con]│                               │
│ └────┘ └────┘ └────┘ └────┘                               │
│                                                             │
│ ┌─── Feed de Atividades ──────────────────────────────────┐ │
│ │ 🔵 Maria Silva está no estande Tech ABC                 │ │
│ │ 🟢 João Pedro participou da palestra "Inovação 2026"   │ │
│ │ 🟡 Ana Costa agendou reunião com Carlos Souza          │ │
│ │ 🔵 Pedro Alves compartilhou contato com Sofia Rocha    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Minha presença: ○ Disponível para networking]              │
└─────────────────────────────────────────────────────────────┘
```

### WEB-038 — Match Suggestions

**Descrição:** Sugestões de匹配 baseadas em interesses, perfil e objetivos de networking com swipe/approve.

**Components:** MatchCard, SwipeButtons, InterestTags, MatchScore, MutualConnections, AcceptModal, FilterPreferences

**Estados:** Carregamento | Vazio (sem matches) | Erro | Dados | Animando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Matches Sugeridos              [Filtros] [Ver Matchs ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                      🎯 92% match                       │ │
│ │                                                         │ │
│ │                         👤                              │ │
│ │                   Carlos Andrade                        │ │
│ │                 CTO — Tech ABC Corp                     │ │
│ │                                                         │ │
│ │               📍 São Paulo, SP                          │ │
│ │                                                         │ │
│ │ 🏷️ Inteligência Artificial  ·  Eventos  ·  Inovação    │ │
│ │                                                         │ │
│ │ 👥 Conexões mútuas: Maria Silva, João Pedro            │ │
│ │                                                         │ │
│ │ "Buscando parcerias para evento de tecnologia"          │ │
│ │                                                         │ │
│ │           [✗] Recusar    [★] Favoritar    [✓] Conectar │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Preferências de Match ───────────────────────────────┐ │
│ │ Interesses: [☑] Tecnologia  [☑] Negócios  [☐] Saúde   │ │
│ │ Cargos: [Diretor] [CEO] [Gerente]                       │ │
│ │ Empresas: [Grande porte] [Startup]                      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ Você tem 8 novos matches hoje!                              │
└─────────────────────────────────────────────────────────────┘
```

### WEB-039 — Chat Interface

**Descrição:** Interface de chat em tempo real para networking entre participantes com recursos de mensagens.

**Componentes:** ChatList, MessageBubble, ChatInput, AttachmentButton, EmojiPicker, TypingIndicator, ReadReceipt, VoiceMessageButton

**Estados:** Carregamento | Vazio (sem conversas) | Erro | Dados | Enviando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Chat                                   [+ Nova Msg]    │
├───────────────┬─────────────────────────────────────────────┤
│ Conversas     │  Maria Silva                                │
│ ────────────  │  Online 🟢                                 │
│               │ ─────────────────────────────────────────── │
│ 👤 Maria      │ ┌──────────────────────────────────────┐   │
│   Ótimo!     │ │ Olá! Ficamos de alinhar a proposta   │   │
│   👍         │ │ do patrocínio.                        │   │
│               │ │                          14:30    ✓✓ │   │
│ 👤 João       │ └──────────────────────────────────────┘   │
│   Vou enviar │ ┌──────────────────────────────────────┐   │
│   ...digit.  │ │                                        │   │
│               │ │ Sim, já estou revisando o contrato.  │   │
│ 👤 Ana        │ │ Vou te enviar a minuta ainda hoje.  │   │
│   Recebi!    │ │                          14:32    ✓  │   │
│               │ └──────────────────────────────────────┘   │
│ 👤 Carlos     │ ┌──────────────────────────────────────┐   │
│   Confirma   │ │ 📎 Proposta_Comercial_TechABC.pdf    │   │
│               │ │                          14:33    ✓✓ │   │
│               │ └──────────────────────────────────────┘   │
│               │ ┌──────────────────────────────────────┐   │
│               │ │ Excelente! Vou analisar e retorno    │   │
│               │ │ até sexta.                           │   │
│               │ │                          14:35    ✓✓ │   │
│               │ └──────────────────────────────────────┘   │
│               │                                            │
│               │                                            │
│               │ [Digite sua mensagem...]  [📎] [😊] [▶]  │
└───────────────┴─────────────────────────────────────────────┘
```

### WEB-040 — Business Card Exchange

**Descrição:** Troca digital de cartões de visita com leitura QR Code, salvamento automático e integração com CRM.

**Componentes:** QRScanner, DigitalCard, CardPreview, ContactForm, CardDesigner, HistoryList, ExportVCF, NFCReader

**Estados:** Carregamento | Vazio (scanning) | Erro | Dados | CardEncontrado

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Trocar Cartão                   [Meu Cartão] [Histórico]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Escaneie um QR Code ─────────────────────────────────┐ │
│ │                                                         │ │
│ │               ┌─────────────────┐                      │ │
│ │               │                 │                      │ │
│ │               │    [📷]         │                      │ │
│ │               │   Aproxime o    │                      │ │
│ │               │   QR Code       │                      │ │
│ │               │                 │                      │ │
│ │               └─────────────────┘                      │ │
│ │                                                         │ │
│ │            ─── ou compartilhe seu QR ───                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Últimas Trocas ──────────────────────────────────────┐ │
│ │ 👤 Ana Costa          · Diretora de Vendas    15/09    │ │
│ │   [Adicionar ao CRM]  [Salvar Contato]  [Ver Cartão]   │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ 👤 Carlos Souza      · CTO Tech ABC        15/09       │ │
│ │   [Adicionar ao CRM]  [Salvar Contato]  [Ver Cartão]   │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ 👤 Maria Silva       · Gerente de Mkt     14/09       │ │
│ │   [Adicionar ao CRM]  [Salvar Contato]  [Ver Cartão]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Meu Cartão Digital ──────────────────────────────────┐ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │                 EventOS                              │ │ │
│ │ │              Maria Silva                             │ │ │
│ │ │         Gerente de Marketing                         │ │ │
│ │ │         maria@eventos.com · (11) 99999-0000         │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ [Compartilhar] [Baixar VCF] [Editar Cartão]            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### WEB-041 — Meeting Scheduler (Networking)

**Descrição:** Agendamento de reuniões entre participantes do evento com integração de calendário e salas.

**Componentes:** CalendarView, TimeSlotPicker, RoomSelector, AttendeeList, MeetingForm, ConflictCheck, ConfirmModal, CalendarSync

**Estados:** Carregamento | Vazio (sem horários) | Erro | Dados | Confirmado

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Agendar Reunião             Feira Agro 2026           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Com: [Carlos Andrade ▼]  + [Adicionar participantes]       │
│                                                             │
│ ┌──────────────┬──────────────────────────────────────────┐ │
│ │ 📅           │ Horários Disponíveis — 16/09/2026       │ │
│ │ Setembro     │ ┌──────────────────────────────────────┐ │ │
│ │ ┌────────┐  │ │ ⏰ Manhã                             │ │ │
│ │ │Seg 15  │  │ │ [09:00] [09:30] [10:00] [10:30]     │ │ │
│ │ │*Ter 16*│  │ │ [11:00]                              │ │ │
│ │ │Qua 17  │  │ ├──────────────────────────────────────┤ │ │
│ │ │Qui 18  │  │ │ ⏰ Tarde                             │ │ │
│ │ └────────┘  │ │ [14:00] [14:30] [15:00] [15:30]     │ │ │
│ └──────────────┘ │ [16:00] [16:30]                     │ │ │
│                   │ └──────────────────────────────────────┘ │ │
│                   └──────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Detalhes da Reunião ──────────────────────────────────┐ │
│ │ Assunto: [Alinhamento parceria Tech Summit_________]    │ │
│ │                                                           │ │
│ │ Duração: [30 min ▼]   Local: [Sala VIP 3 ▼]            │ │
│ │                                                           │ │
│ │ Tipo: [●] Presencial  [○] Videochamada                   │ │
│ │                                                           │ │
│ │ Nota:                                                     │ │
│ │ [Discutir proposta e próximos passos______________]     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☑ Adicionar ao meu calendário                               │
│ ☑ Notificar participantes                                   │
│                                                             │
│                    [Confirmar Reunião]                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Gamification Screens

### WEB-042 — Leaderboard

**Descrição:** Ranking de participantes com pontuação baseada em atividades, presença e engajamento no evento.

**Componentes:** RankingTable, UserPosition, ScoreBadge, LevelIndicator, AchievementPopover, PeriodTabs, MedalIcon, XPProgress

**Estados:** Carregamento | Vazio | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Ranking                       [Período: Geral ▼] [🏆] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Sua Posição ─────────────────────────────────────────┐ │
│ │ 🏅 12° lugar     │   Nível 7 · 4.250 XP                │ │
│ │ ████████████████████████████░░░░  850 XP p/ nível 8    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Top Participantes ───────────────────────────────────┐ │
│ │ #  Participante           XP       Nível   Conquistas   │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ 🥇  Ana Costa            12.450    🏅 15   23           │ │
│ │ 🥈  João Pedro           11.890    🏅 14   21           │ │
│ │ 🥉  Maria Silva          11.200    🏅 14   20           │ │
│ │ 4️⃣  Carlos Souza         10.450    🏅 13   18           │ │
│ │ 5️⃣  Luiza Mendes         9.800     🏅 12   17           │ │
│ │ 6️⃣  Pedro Alves          9.120     🏅 12   16           │ │
│ │ 7️⃣  Sofia Rocha          8.450     🏅 11   15           │ │
│ │ 8️⃣  Roberto Lima         7.890     🏅 11   14           │ │
│ │ 9️⃣  Fernanda Rios       7.200     🏅 10   13           │ │
│ │ 🔟  Gustavo Neves        6.890     🏅 10   12           │ │
│ │ ⋮                                                        │ │
│ │ ──  VOCÊ (12°)           4.250     🏅 7    8            │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ [1] [2] [3] ... [20]                                       │
│                                                             │
│ 💡 Dica: Visite estandes e participe de palestras para     │
│ ganhar mais XP!                                             │
└─────────────────────────────────────────────────────────────┘
```

### WEB-043 — Badges Collection

**Descrição:** Coleção de medalhas/conquistas obtidas pelo participante durante o evento.

**Componentes:** BadgeGrid, BadgeCard, BadgeDetail, ProgressRing, CategoryFilter, LockedBadge, UnlockAnimation, ShareButton

**Estados:** Carregamento | Vazio (sem badges) | Erro | Dados

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Minhas Conquistas               [Compartilhar] [🏅]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Conquistadas: 12/25                                         │
│ ████████████████████████░░░░░░░░░░░░░░  48%                │
│                                                             │
│ ┌─── Categorias ──────────────────────────────────────────┐ │
│ │ [Todas] [Presença] [Networking] [Palestras] [Missões]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏆      🥇      🥈      🥉      ⭐                      │ │
│ │ Presente 1º Dia 2º Dia 3º Dia   Super                    │ │
│ │ em todos Check-in Check-in Check-in Conexão              │ │
│ │  [25/25]   [01/09] [01/09] [01/09]   25 conexões         │ │
│ │ 🟢       🟢      🟢      🟢      🔒                    │ │
│ │                                                          │ │
│ │ 🕐      📍      🎤      🧭      📸                      │ │
│ │ Madruga Explorador Vip da Missão Foto                    │ │
│ │ Check-in 10 estandes Palestra Completa  Memória         │ │
│ │ antes 8h  visitados     cumprida       do evento        │ │
│ │ 🔒       🔒          🔒              🔒                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Próximas Conquistas ──────────────────────────────────┐ │
│ │ ⭐ Super Conexão — Conecte-se com mais 5 pessoas (20/25) │ │
│ │ 🧭 Missão Completa — Complete 3 missões (1/3)           │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### WEB-044 — Missions List

**Descrição:** Lista de missões e desafios disponíveis para engajar participantes durante o evento.

**Componentes:** MissionCard, ProgressBar, RewardBadge, CategoryTabs, DailyMissions, Timer, ClaimButton, CompletedCheckmark

**Estados:** Carregamento | Vazio | Erro | Dados | Reivindicando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Missões e Desafios                      [🎯]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─── Missões Diárias (expira em 5h 32min) ────────────────┐ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🎯 Check-in matinal                                │ │ │
│ │ │ Faça check-in antes das 9h                          │ │ │
│ │ │ ✅ Concluído                          +150 XP  [🎁]│ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🎯 Visite 5 estandes                                │ │ │
│ │ │ Visite diferentes estandes de patrocinadores        │ │ │
│ │ │ ███████████████████░░░░░░░░  3/5     +100 XP  [▶]  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🎯 Conheça 3 pessoas novas                          │ │ │
│ │ │ Troque cartão digital com participantes             │ │ │
│ │ │ ███████░░░░░░░░░░░░░░░░  1/3       +200 XP  [▶]   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Missões do Evento ───────────────────────────────────┐ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🎯 Tour Completo — Visite todas as áreas do evento │ │ │
│ │ │   ████████████████████████████░░  80% +500 XP  [▶] │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🎯 Super Networking — 10 conexões                  │ │ │
│ │ │   ██████████████████████████████  8/10 +300 XP [▶] │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🎯 Palestras — Participe de 5 palestras            │ │ │
│ │ │   ████████████████░░░░░░░░░░░░  2/5  +400 XP [▶]  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💡 Complete missões para subir no ranking e desbloquear     │
│ recompensas exclusivas!                                     │
└─────────────────────────────────────────────────────────────┘
```

### WEB-045 — Rewards Store

**Descrição:** Loja de recompensas onde participantes trocam pontos/moedas por brindes, descontos e benefícios.

**Componentes:** RewardGrid, RewardCard, PriceTag, PointBalance, CategoryFilter, FeaturedDeal, PurchaseModal, ConfirmationToast

**Estados:** Carregamento | Vazio (sem recompensas) | Erro | Dados | Trocando

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Loja de Recompensas            [💰 4.250 pontos] [🔄] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Categorias: [Todas] [Brindes] [Descontos] [VIP] [Digital] │
│                                                             │
│ ┌─── Ofertas Especiais ───────────────────────────────────┐ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│ │ │  🎉      │ │  🎁      │ │  🏆      │ │  🎫      │   │ │
│ │ │ Camiseta │ │ Kit      │ │ Acesso   │ │ Ingresso │   │ │
│ │ │ Oficial  │ │ Brindes  │ │ VIP      │ │ 2027     │   │ │
│ │ │ 800 pts  │ │ 1.200 pt │ │ 2.500 pt │ │ 5.000 pt │   │ │
│ │ │ [Trocar] │ │ [Trocar] │ │ [Trocar] │ │ [Trocar] │   │ │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Brindes Físicos ─────────────────────────────────────┐ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │ │
│ │ │ 🧢       │ │ 🥤       │ │ 📓      │                  │ │
│ │ │ Boné     │ │ Garrafa  │ │ Caderno  │                  │ │
│ │ │ 500 pts  │ │ 350 pts  │ │ 400 pts  │                  │ │
│ │ │ [Trocar] │ │ [Trocar] │ │ [Trocar] │                  │ │
│ │ └──────────┘ └──────────┘ └──────────┘                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Descontos ───────────────────────────────────────────┐ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │ │
│ │ │ 🏨       │ │ 🚗       │ │ 🍽️      │                  │ │
│ │ │ 20% Hotel│ │ 15% Uber │ │ 10% Rest │                  │ │
│ │ │ 600 pts  │ │ 400 pts  │ │ 300 pts  │                  │ │
│ │ │ [Trocar] │ │ [Trocar] │ │ [Trocar] │                  │ │
│ │ └──────────┘ └──────────┘ └──────────┘                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Experiências VIP ────────────────────────────────────┐ │
│ │ ┌──────────────────────┐  ┌──────────────────────────┐  │ │
│ │ │ 🎤 Meet & Greet      │  │ 🍷 Coquetel Exclusivo   │  │ │
│ │ │ Palestrantes         │  │ Patrocinadores           │  │ │
│ │ │ 3.000 pts            │  │ 1.800 pts                │  │ │
│ │ │ [Trocar]             │  │ [Trocar]                 │  │ │
│ │ └──────────────────────┘  └──────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💰 Faltam 250 pontos para o próximo nível de recompensas!  │
└─────────────────────────────────────────────────────────────┘
```

---

## Screen States

Every screen must handle these states:

| State | Description | Component |
|-------|-------------|-----------|
| Loading | Skeleton/spinner while data loads | `<Skeleton />` |
| Empty | No data to display | `<EmptyState />` |
| Error | API/network error | `<ErrorState />` |
| Success | Data displayed normally | Content |
| Offline | No internet connection | `<OfflineBanner />` |

---

## Navigation Structure

```
Platform Core (always available)
├── Dashboard
├── Events
│   ├── List
│   ├── Create (wizard)
│   ├── Detail
│   │   ├── Dashboard
│   │   ├── Attendees
│   │   ├── Check-in
│   │   ├── Schedules
│   │   ├── Tickets
│   │   ├── Sponsors
│   │   └── Certificates
│   └── Reports
├── CRM
│   ├── Pipeline
│   ├── Deals
│   ├── Contacts
│   └── Analytics
├── AI
│   ├── Chat
│   ├── Agents
│   └── History
├── Marketplace
├── Analytics / BI
└── Settings
    ├── Organization
    ├── Users
    ├── Billing
    └── White Label
```

---

## Responsive Breakpoints

```
Mobile:   0 - 767px    (single column)
Tablet:   768 - 1023px (2 columns)
Desktop:  1024px+      (full layout)
Large:    1440px+      (max-width container)
```

---

## Accessibility (a11y)

- All interactive elements must have focus styles
- Forms must have labels (not placeholders as labels)
- Color contrast ratio ≥ 4.5:1
- All images must have alt text
- Keyboard navigation (Tab, Enter, Escape)
- ARIA labels for complex components
- Screen reader announcements for dynamic content
- Touch targets ≥ 44x44px on mobile

---

## Related Documents

- VOL-001: Strategy (White Label principle)
- VOL-002: Architecture (PWA, Offline First)
- VOL-004: Database (data for screens)
- VOL-005: APIs (endpoints consumed by screens)
