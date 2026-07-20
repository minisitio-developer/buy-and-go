# VOL-014 — Roadmap do Produto

| Versão | Data       | Autor               | Descrição              |
|--------|------------|---------------------|------------------------|
| 1.0    | 2026-01-15 | Equipe de Produto   | Roadmap estratégico    |

---

## 1. Visão Geral

Este documento consolida o roadmap de produto para a plataforma Eventos AI,
cobrindo o período de 2026 a 2028. O roadmap está organizado em trimestres
com metas estratégicas, features, marcos, dependências, riscos, métricas
e recursos necessários.

A priorização segue o framework RICE e a matriz Valor vs Esforço,
garantindo que entregas de alto impacto sejam aceleradas enquanto
iniciativas de baixo valor são postponadas ou eliminadas.

---

## 2. Metas Estratégicas — 2026

### 2.1 Q1 2026 — Fundação (MVP dos 5 Serviços Core)

**Objetivo:** Lançar o MVP funcional da plataforma com os cinco serviços
fundamentais para operação de eventos.

#### Features a Entregar

| Feature                                | Código       | Serviço       |
|----------------------------------------|--------------|---------------|
| Autenticação e gestão de usuários      | REQ-001      | Auth          |
| Cadastro e CRUD de eventos             | REQ-005      | Core          |
| Venda de ingressos com checkout        | REQ-012      | Payments      |
| Página pública do evento               | REQ-008      | Events        |
| Notificações por e-mail e push         | REQ-020      | Notifications |
| Dashboard básico do organizador        | REQ-030      | Dashboard     |
| Pipeline CI/CD + infra AWS             | REQ-900      | DevOps        |
| Testes E2E dos fluxos críticos         | REQ-905      | QA            |

#### Marcos / Milestones

| Marco                   | Data Prevista | Critério de Aceite                             |
|-------------------------|---------------|------------------------------------------------|
| M1 — Setup de infra     | 2026-01-31    | Cluster EKS operacional, banco provisionado    |
| M2 — Auth + Core        | 2026-02-15    | Login, cadastro de evento, testes passando     |
| M3 — Payments           | 2026-03-01    | Checkout funcional com Stripe sandbox          |
| M4 — Dashboard          | 2026-03-15    | Métricas de vendas e presença disponíveis      |
| M5 — MVP Completo       | 2026-03-31    | Todos os 5 serviços integrados e testados      |

#### Dependências Técnicas

- Provisionamento de conta AWS com permissões adequadas
- Conta Stripe configurada para ambiente de desenvolvimento
- Domínio e certificados SSL para API e frontend
- Serviço de e-mail (AWS SES ou SendGrid)
- Integração com provedor de push notifications (OneSignal)

#### Riscos e Mitigação

| Risco                                      | Impacto | Probabilidade | Mitigação                                         |
|--------------------------------------------|---------|---------------|---------------------------------------------------|
| Atraso na liberação da AWS                 | Alto    | Baixa         | Usar LocalStack como fallback                     |
| Complexidade do checkout com múltiplos moedas | Médio | Média         | Fixar BRL no MVP, expandir depois                |
| Curva de aprendizado da equipe com Prisma  | Médio   | Média         | Treinamento interno + pair programming            |
| Integração de pagamentos quebrada          | Alto    | Baixa         | Testes E2E com Stripe em modo test                |

#### Métricas de Sucesso

- Tempo de cadastro de evento < 5 minutos
- Taxa de conversão de checkout > 60%
- Uptime da API > 99.5%
- Cobertura de testes > 80%
- NPS do organizador beta > 30

#### Recursos Necessários

- 2 desenvolvedores full-stack
- 1 engenheiro de infraestrutura
- 1 designer UX/UI (tempo parcial)
- 1 product owner
- Orçamento AWS: ~$500/mês
- 1 conta Stripe

---

### 2.2 Q2 2026 — Expansão (Marketplace, Community, Academy, Gamificação)

**Objetivo:** Expandir a plataforma com recursos de engajamento,
monetização adicional e educação.

#### Features a Entregar

| Feature                                 | Código       | Serviço       |
|-----------------------------------------|--------------|---------------|
| Marketplace de serviços para eventos    | REQ-040      | Marketplace   |
| Comunidade com fóruns e grupos          | REQ-045      | Community     |
| Plataforma de cursos e vídeos           | REQ-050      | Academy       |
| Sistema de gamificação e badges         | REQ-055      | Gamification  |
| Programa de afiliados/indicados         | REQ-060      | Referral      |
| Check-in por QR Code                    | REQ-025      | Check-in      |
| Credenciais customizáveis               | REQ-026      | Credentials   |

#### Marcos / Milestones

| Marco                   | Data Prevista | Critério de Aceite                             |
|-------------------------|---------------|------------------------------------------------|
| M6 — Marketplace        | 2026-04-30    | Fornecedores cadastram e vendem serviços       |
| M7 — Community          | 2026-05-15    | Participantes interagem em fóruns por evento   |
| M8 — Academy            | 2026-06-01    | Cursos disponíveis com progresso do usuário    |
| M9 — Gamificação        | 2026-06-15    | Badges e ranking ativos                         |
| M10 — Q2 Release        | 2026-06-30    | Todos os módulos integrados e testados          |

#### Dependências Técnicas

- Serviço de armazenamento de vídeos (AWS S3 + CloudFront)
- Módulo de pagamentos estendido para split de receita (marketplace)
- Sistema de cache para rankings (Redis)
- CDN para distribuição de conteúdo multimídia
- API de geolocalização para check-in presencial

#### Riscos e Mitigação

| Risco                                      | Impacto | Probabilidade | Mitigação                                         |
|--------------------------------------------|---------|---------------|---------------------------------------------------|
| Split de receita complexo juridicamente    | Alto    | Média         | Assessoria jurídica contratada desde Q1           |
| Moderação de conteúdo na Community         | Médio   | Alta          | Filtro automático + moderadores humanos           |
| Performance da Academy com vídeos          | Médio   | Média         | Transcoding adaptativo + CDN                      |
| Gamificação artificial sem engajamento     | Médio   | Média         | Pesquisa com usuários antes da implementação      |

#### Métricas de Sucesso

- 50+ fornecedores ativos no Marketplace
- 30% dos participantes engajados na Community
- 20% de conclusão nos cursos da Academy
- 15% de aumento na retenção via gamificação
- 10% das vendas via programa de afiliados

#### Recursos Necessários

- +1 desenvolvedor backend (especialista em sistemas de recomendação)
- +1 desenvolvedor frontend
- 1 designer instrucional (Academy)
- 1 community manager
- Orçamento AWS: ~$1.200/mês
- Assessoria jurídica (contratos marketplace)

---

### 2.3 Q3 2026 — Inteligência (AI Avançada, BI, Automação)

**Objetivo:** Incorporar inteligência artificial e analytics para
automatizar processos e gerar insights acionáveis.

#### Features a Entregar

| Feature                                   | Código       | Serviço       |
|-------------------------------------------|--------------|---------------|
| Recomendação inteligente de eventos       | REQ-065      | AI            |
| Chatbot de atendimento ao participante    | REQ-070      | AI            |
| Geração automática de conteúdo (e-mails, descrições) | REQ-075 | AI      |
| BI e analytics com dashboards avançados   | REQ-080      | BI            |
| Relatórios automáticos semanais           | REQ-082      | BI            |
| Automação de lembretes e follow-ups       | REQ-085      | Automation    |
| Pontuação de leads e organizadores        | REQ-090      | AI            |
| Integração com CRM (HubSpot/Salesforce)   | REQ-095      | Integrations  |

#### Marcos / Milestones

| Marco                   | Data Prevista | Critério de Aceite                             |
|-------------------------|---------------|------------------------------------------------|
| M11 — AI Core           | 2026-07-31    | Modelo de recomendação treinado e deployado    |
| M12 — Chatbot           | 2026-08-15    | Chatbot responde 80% das dúvidas comuns        |
| M13 — BI Platform       | 2026-09-01    | Dashboard executivo com dados em tempo real    |
| M14 — Automações        | 2026-09-15    | Workflows automatizados em produção            |
| M15 — Q3 Release        | 2026-09-30    | Integração IA + BI + Automação validada        |

#### Dependências Técnicas

- Pipeline de dados (Kafka + Spark ou Kinesis + Lambda)
- Lake de dados para armazenamento de eventos analíticos
- Modelo de ML treinado com dados históricos do Q1/Q2
- Integração com provedor LLM (OpenAI / Anthropic / Bedrock)
- Infraestrutura de GPU para fine-tuning

#### Riscos e Mitigação

| Risco                                      | Impacto | Probabilidade | Mitigação                                         |
|--------------------------------------------|---------|---------------|---------------------------------------------------|
| Dados insuficientes para treinar modelos   | Alto    | Média         | Usar dados sintéticos + transfer learning         |
| Custo elevado de chamadas LLM              | Médio   | Alta          | Cache de respostas + modelos menores             |
| Precisão do chatbot abaixo do esperado     | Médio   | Média         | RAG + base de conhecimento curada                |
| Privacidade de dados em modelos de IA      | Alto    | Baixa         | Dados anonimizados, compliance LGPD              |
| Complexidade de integração com CRMs        | Médio   | Média         | Usar plataforma de iPaaS (Zapier/Make)           |

#### Métricas de Sucesso

- Precisão das recomendações > 75%
- Chatbot resolvendo > 70% dos tickets sem intervenção
- 40% de redução em tarefas manuais de comunicação
- Adoção do BI por > 60% dos organizadores
- ROI positivo em automações no primeiro mês

#### Recursos Necessários

- 1 engenheiro de dados
- 1 engenheiro de ML / NLP
- 1 analista de BI
- 1 cientista de dados (tempo parcial)
- Orçamento AWS: ~$3.000/mês (incluindo GPU/Sagemaker)
- Custos LLM: ~$500/mês

---

### 2.4 Q4 2026 — Escala (White-label, Internacionalização, Enterprise)

**Objetivo:** Preparar a plataforma para grande escala com suporte
a múltiplos tenants, idiomas e demandas enterprise.

#### Features a Entregar

| Feature                                   | Código       | Serviço       |
|-------------------------------------------|--------------|---------------|
| Arquitetura multi-tenant white-label      | REQ-100      | Platform      |
| Internacionalização (i18n) — EN, ES, FR   | REQ-105      | Platform      |
| Múltiplas moedas e gateways de pagamento  | REQ-110      | Payments      |
| Planos empresariais com SLA               | REQ-115      | Commercial    |
| Single Sign-On (SSO / SAML / OIDC)        | REQ-120      | Auth          |
| Auditoria e compliance (logs, trilhas)    | REQ-125      | Security      |
| Relatórios fiscais e notas fiscais        | REQ-130      | Billing       |
| API pública versionada                    | REQ-135      | Platform      |
| Webhooks para integração externa          | REQ-140      | Platform      |

#### Marcos / Milestones

| Marco                   | Data Prevista | Critério de Aceite                             |
|-------------------------|---------------|------------------------------------------------|
| M16 — Multi-tenant      | 2026-10-31    | 3 clientes white-label operando simultaneamente|
| M17 — i18n              | 2026-11-15    | Plataforma disponível em EN, ES, FR            |
| M18 — Enterprise        | 2026-12-01    | Cliente enterprise com SSO e SLA ativo         |
| M19 — API Pública       | 2026-12-15    | Documentação OpenAPI, rate limiting, keys      |
| M20 — Q4 Release        | 2026-12-31    | Todos os módulos enterprise validados          |

#### Dependências Técnicas

- Arquitetura de isolamento de dados por tenant
- Serviço de tradução (i18n) integrado ao pipeline CI/CD
- Provedores de pagamento adicionais (Mercado Pago, PayPal, Adyen)
- Infraestrutura multi-região (US, EU)
- Certificações de segurança (SOC 2, ISO 27001)

#### Riscos e Mitigação

| Risco                                      | Impacto | Probabilidade | Mitigação                                         |
|--------------------------------------------|---------|---------------|---------------------------------------------------|
| Complexidade do isolamento multi-tenant    | Alto    | Média         | Schema-per-tenant + pool de conexões              |
| Custo de infraestrutura multi-região       | Alto    | Média         | Otimização com caching regional + CDN             |
| Atraso em certificações de segurança       | Médio   | Média         | Iniciar processo SOC 2 no Q3                     |
| Manutenção de múltiplas traduções          | Médio   | Alta          | Crowdin + revisão automatizada                    |

#### Métricas de Sucesso

- Onboarding de 5 clientes white-label
- Tempo de tradução de novos conteúdos < 24h
- 3 clientes enterprise contratados
- SLA de 99.9% de uptime
- NPS enterprise > 50

#### Recursos Necessários

- +1 desenvolvedor backend (especialista em multi-tenancy)
- +1 desenvolvedor frontend (i18n)
- 1 engenheiro de segurança / compliance
- 1 tradutor técnico (ou agência)
- 1 executivo de contas enterprise
- Orçamento AWS: ~$8.000/mês
- Custos de certificação SOC 2: ~$30.000

---

## 3. Visão de Longo Prazo (2027–2028)

### 3.1 Expansão Global

| Iniciativa                      | Horizonte | Descrição                                         |
|---------------------------------|-----------|---------------------------------------------------|
| Data centers na Ásia e Oceania  | 2027 H1   | Cobertura APAC com latência < 100ms               |
| Suporte a 10+ idiomas           | 2027 H1   | i18n expandido para JP, KO, ZH, AR, PT, IT, DE   |
| Parcerias com plataformas locais | 2027 H2  | Integração com Eventbrite, Sympla, Doity          |

### 3.2 Marketplace de Terceiros

| Iniciativa                      | Horizonte | Descrição                                         |
|---------------------------------|-----------|---------------------------------------------------|
| SDK para desenvolvedores        | 2027 H1   | SDKs em JS, Python, Go para criar apps no marketplace |
| Loja de plugins e extensões     | 2027 H2   | Marketplace com revenue share (70/30)             |
| Programa de parcerias certificadas | 2027 H2 | Certificação para agências e consultorias         |

### 3.3 Plataforma de Dados / Data Lake

| Iniciativa                      | Horizonte | Descrição                                         |
|---------------------------------|-----------|---------------------------------------------------|
| Data Lake unificado             | 2027 H1   | Todos os eventos da plataforma em um lake         |
| Modelos preditivos de vendas    | 2027 H1   | Previsão de bilheteria para organizadores         |
| Segmentação avançada de público | 2027 H2   | Clusterização de participantes por comportamento  |
| Data clean room para parceiros  | 2028 H1   | Compartilhamento seguro de dados anonimizados     |

### 3.4 Eventos em VR/AR

| Iniciativa                      | Horizonte | Descrição                                         |
|---------------------------------|-----------|---------------------------------------------------|
| Player de eventos VR            | 2027 H2   | Experiência imersiva para eventos híbridos        |
| Feiras virtuais com avatares    | 2028 H1   | Stands 3D interativos com networking              |
| Realidade aumentada para presencial | 2028 H2 | Sobreposição AR em crachás, mapas e palestrantes |

### 3.5 Agentes Autônomos de Organização

| Iniciativa                      | Horizonte | Descrição                                         |
|---------------------------------|-----------|---------------------------------------------------|
| Agente de suporte autônomo      | 2027 H2   | Resolve problemas complexos com ações no sistema  |
| Organizador virtual             | 2028 H1   | Cria, gerencia e otimiza eventos automaticamente  |
| Agente de networking            | 2028 H2   | Conecta participantes com base em interesses      |

---

## 4. Matriz de Priorização (Valor vs Esforço)

### 4.1 Tabela de Features

| Feature                          | Esforço | Impacto | Classificação |
|----------------------------------|---------|---------|---------------|
| Autenticação e gestão de usuários| Baixo   | Alto    | Quick Win     |
| Cadastro e CRUD de eventos       | Baixo   | Alto    | Quick Win     |
| Página pública do evento         | Baixo   | Alto    | Quick Win     |
| Notificações push                | Baixo   | Alto    | Quick Win     |
| Venda de ingressos (checkout)    | Médio   | Alto    | Big Bet       |
| Dashboard básico                 | Baixo   | Médio   | Incremental   |
| Marketplace                      | Alto    | Alto    | Big Bet       |
| Comunidade / Fóruns              | Médio   | Médio   | Incremental   |
| Academy / Cursos                 | Alto    | Alto    | Big Bet       |
| Gamificação                      | Médio   | Médio   | Incremental   |
| Programa de afiliados            | Baixo   | Médio   | Quick Win     |
| Check-in QR Code                 | Baixo   | Alto    | Quick Win     |
| Recomendação inteligente         | Alto    | Alto    | Big Bet       |
| Chatbot de atendimento           | Alto    | Alto    | Big Bet       |
| Geração automática de conteúdo   | Médio   | Médio   | Incremental   |
| BI e analytics                   | Alto    | Alto    | Big Bet       |
| Automação de lembretes           | Baixo   | Médio   | Quick Win     |
| White-label multi-tenant         | Alto    | Alto    | Big Bet       |
| Internacionalização (i18n)       | Médio   | Alto    | Big Bet       |
| Múltiplas moedas                 | Alto    | Alto    | Big Bet       |
| SSO / SAML                       | Médio   | Alto    | Big Bet       |
| API pública                      | Médio   | Alto    | Big Bet       |
| Webhooks                         | Baixo   | Alto    | Quick Win     |
| Auditoria e compliance           | Alto    | Médio   | Big Bet       |
| Relatórios fiscais               | Médio   | Médio   | Incremental   |
| VR / AR                          | Alto    | Baixo   | Avoid (agora) |
| Agentes autônomos                | Alto    | Baixo   | Avoid (agora) |

### 4.2 Matriz Visual

```
                  ALTO
                    |
      Incremental   |   Big Bet
      (Dashboard,   |   (Checkout, Marketplace,
       Gamificação, |    Academy, AI, BI,
       Rel.Fiscais) |    White-label, i18n, SSO)
                    |
       IMPACTO      |
                    |
      Avoid         |   Quick Win
      (VR/AR,       |   (Auth, Eventos, Notificações,
       Agentes)     |    QR Code, Afiliados, Webhooks)
                    |
                  BAIXO
               BAIXO          ESFORÇO          ALTO
```

### 4.3 Estratégia de Execução

1. **Quick Wins primeiro:** Auth, cadastro de eventos, página pública
   notificações e QR code — entregam valor máximo com esforço mínimo.

2. **Big Bets planejadas:** Checkout, Marketplace, Academy, AI,
   White-label — requerem investimento alto mas são diferenciais
   competitivos. Iniciar POCs antes do desenvolvimento full.

3. **Incrementais contínuos:** Dashboard, gamificação, afiliados
   — entregues em paralelo aos big bets, sem bloquear o fluxo.

4. **Avoid postergado:** VR/AR e agentes autônomos — revisar
   anualmente conforme maturidade do mercado.

---

## 5. Framework de Decisão

### 5.1 Critérios de Priorização (RICE)

Toda feature ou iniciativa é avaliada com o framework RICE:

- **Reach** — Quantos usuários/clientes serão impactados no período?
  - Escala: 1 (dezenas) a 5 (milhares)
- **Impact** — Qual o efeito nos objetivos de negócio?
  - Escala: 1 (mínimo) a 5 (transformador)
- **Confidence** — Qual o grau de certeza sobre Reach e Impact?
  - 100% = dados concretos
  - 80% = experimentos / pesquisas
  - 50% = hipóteses não validadas
  - 20% = suposições fracas
- **Effort** — Quantas semanas-homem são necessárias?
  - Escala inversa: 5 (dias) a 1 (meses)

**Fórmula:** `RICE Score = (Reach × Impact × Confidence) / Effort`

### 5.2 Processo de Review Trimestral

| Atividade                | Responsável        | Periodicidade |
|--------------------------|--------------------|---------------|
| Coleta de feedback       | PO + CS            | Contínuo      |
| Análise de métricas      | PO + Analista BI   | Semanal       |
| Priorização RICE         | PO + Tech Lead     | Mensal        |
| Review trimestral        | Stakeholders       | A cada 3 meses|
| Ajuste de roadmap        | PO + Diretoria     | Trimestral    |
| Retrospecção do ciclo    | Time todo          | Pós-release   |

### 5.3 OKRs Vinculados

#### Q1 2026

| Objetivo                              | Key Result                                |
|---------------------------------------|-------------------------------------------|
| Lançar MVP estável da plataforma      | 10 eventos publicados em 30 dias          |
| Validar proposta de valor             | 50 organizadores cadastrados              |
| Garantir qualidade técnica            | Cobertura de testes > 80%                 |

#### Q2 2026

| Objetivo                              | Key Result                                |
|---------------------------------------|-------------------------------------------|
| Expandir engajamento dos participantes| 30% dos participantes ativos na Community |
| Diversificar receita                  | Marketplace gerando 15% do GMV            |
| Aumentar retenção                     | Churn rate < 10%                          |

#### Q3 2026

| Objetivo                              | Key Result                                |
|---------------------------------------|-------------------------------------------|
| Automatizar operações                 | 40% redução em tarefas manuais            |
| Entregar insights acionáveis          | 60% dos organizadores usam BI semanalmente|
| Melhorar experiência do participante  | Chatbot resolve 70% dos tickets           |

#### Q4 2026

| Objetivo                              | Key Result                                |
|---------------------------------------|-------------------------------------------|
| Escalar para clientes enterprise      | 5 contratos white-label                   |
| Globalizar a plataforma               | 3 idiomas suportados                      |
| Garantir compliance e segurança       | Certificação SOC 2 iniciada               |

---

## 6. Glossário

| Termo             | Definição                                           |
|-------------------|-----------------------------------------------------|
| MVP               | Minimum Viable Product — versão mínima funcional    |
| GMV               | Gross Merchandise Volume — volume total de vendas   |
| Churn             | Taxa de cancelamento / abandono                     |
| NPS               | Net Promoter Score — lealdade do cliente            |
| SLA               | Service Level Agreement — nível de serviço acordado |
| White-label       | Produto customizável com marca do cliente           |
| i18n              | Internationalization — suporte a múltiplos idiomas  |
| RICE              | Reach, Impact, Confidence, Effort — framework de priorização |
| OKR               | Objectives and Key Results — metodologia de metas   |
| POC               | Proof of Concept — prova de conceito                |

---

## 7. Aprovações

| Nome                   | Cargo              | Data       | Assinatura |
|------------------------|--------------------|------------|------------|
|                        | Product Owner      |            |            |
|                        | Tech Lead          |            |            |
|                        | Diretoria          |            |            |
