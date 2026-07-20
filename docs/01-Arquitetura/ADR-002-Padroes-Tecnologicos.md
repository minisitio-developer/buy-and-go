# ADR-002: Padrões Tecnológicos do EventOS AI

**Status:** Vigente  
**Última Revisão:** 2026-07-16  
**Autor:** Equipe de Arquitetura EventOS AI  

---

## Índice de Padrões

| ID | Padrão | Aplicação |
|----|--------|-----------|
| ST-001 | Versionamento Semântico e Git Flow | Todos os repositórios |
| ST-002 | Code Review e Linting | Todo código antes do merge |
| ST-003 | Testes Unitários, Integração e E2E | Qualidade e regressão |
| ST-004 | Documentação como Código | Toda feature e API |
| ST-005 | CI/CD com GitHub Actions | Pipeline automatizada |
| ST-006 | Monitoramento com Prometheus + Grafana | Produção e staging |
| ST-007 | Segurança — OWASP Top 10 e Secrets | Todo o ciclo de vida |
| ST-008 | Logging Estruturado | Todos os serviços |
| ST-009 | Error Handling Padrão | Backend e frontend |
| ST-010 | Prisma ORM — Conventions | Camada de dados |

---

## ST-001: Versionamento Semântico e Git Flow

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

O EventOS AI mantém múltiplos artefatos versionáveis: pacotes internos do monorepo (`@eventos/shared`, `@eventos/database`, `@eventos/messaging`), imagens Docker dos microsserviços, schemas Avro no Schema Registry, e documentação. Sem uma política clara de versionamento, a coordenação entre squads se torna caótica, breaking changes passam despercebidos, e o rastreamento de regressões é impossível.

### Decisão

**Versionamento Semântico (SemVer 2.0.0):** Todo artefato versionável segue o formato `MAJOR.MINOR.PATCH`:

- **MAJOR:** Breaking change incompatível com versões anteriores (rename de endpoint, alteração de schema de evento, remoção de campo de API)
- **MINOR:** Nova funcionalidade compatível com versão anterior (novo endpoint, novo campo opcional em schema, novo evento)
- **PATCH:** Correção de bug compatível com versão anterior (fix de segurança, correção de typo, otimização de performance)

**Git Flow adaptado (monorepo):**

```
main          ───●──────●──────────────────●───────── releases
                  \    /                  /
develop           ─●──●──●──●──●──●──●──●─── integração contínua
                     \    /  \    /
feature/*            ─●──●    ─●──●──────── features e fixes
                         \         /
hotfix/*                  ─●───────●─────── correções críticas
```

- `main`: branch de produção. Cada merge é uma release. Commits são tagged com `vMAJOR.MINOR.PATCH`
- `develop`: branch de integração. Features são mergeadas aqui e testadas em staging
- `feature/<id>-<descricao>`: branches de trabalho, criadas a partir de `develop`
- `hotfix/<id>-<descricao>`: branches de correção urgente, criadas a partir de `main`
- `release/v<version>`: branches de preparação de release (freeze, testes finais)

**Conventional Commits:** Todas as mensagens de commit seguem o padrão:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

Tipos permitidos:
- `feat`: nova funcionalidade (MINOR)
- `fix`: correção de bug (PATCH)
- `BREAKING CHANGE`: no corpo ou rodapé indica MAJOR
- `docs`: alteração em documentação
- `style`: formatação, espaçamento, linting (sem mudança de comportamento)
- `refactor`: refatoração sem mudança de funcionalidade
- `test`: adição ou alteração de testes
- `chore`: tarefas de build, CI/CD, dependências
- `perf`: otimização de performance
- `ci`: alteração em pipeline de CI
- `revert`: reversão de commit anterior

Escopos recomendados: `identity`, `event`, `ticket`, `checkin`, `crm`, `ai`, `shared`, `gateway`, `frontend`, `infra`, `docs`

### Consequências

- Facilita geração automática de changelogs (semantic-release, standard-version)
- A pipeline de CI determina automaticamente a versão da próxima release baseada nos commits
- Breaking changes são claramente comunicadas aos consumidores dos pacotes
- Desenvolvedores precisam treinar para escrever commits semânticos (validação via commitlint)
- Git flow adiciona complexidade de branches comparado ao trunk-based development

### Compliance

1. Todo commit deve passar pelo hook `commit-msg` (husky + commitlint) que valida o formato
2. Push para `main` e `develop` é bloqueado; alterações entram exclusivamente via Pull Request
3. O CI valida que PRs seguem a convenção de commits e recusa PRs com mensagens inválidas
4. Tags de release são criadas automaticamente pelo CI ao mergear em `main`
5. CHANGELOG.md é gerado automaticamente a partir dos commits convencionais

---

## ST-002: Code Review e Linting

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

Com múltiplos desenvolvedores trabalhando em diversos serviços do monorepo, a consistência de código, aderência a boas práticas e prevenção de bugs comuns depende de um processo disciplinado de code review combinado com análise estática automatizada. Sem essas barreiras, cada desenvolvedor introduz seu estilo pessoal, criando um código heterogêneo difícil de manter e propenso a bugs.

### Decisão

**Ferramentas de Análise Estática:**

| Ferramenta | Aplicação | Configuração |
|-----------|-----------|-------------|
| ESLint | TypeScript/JavaScript (backend + frontend) | `@eventos/eslint-config` — pacote compartilhado no monorepo |
| Prettier | Formatação automática | `@eventos/prettier-config` — sem debate de estilo |
| Husky | Git hooks | Validação pre-commit de lint + formatação |
| lint-staged | Lint apenas em arquivos staged | Executa ESLint + Prettier nos arquivos do commit |
| SonarQube | Análise estática avançada | Qualidade de código, code smells, duplicação, cobertura |
| commitlint | Validação de commit message | Conventional Commits obrigatório |

**Regras de ESLint (além do recomendado):**
- `@typescript-eslint/strict` — tipagem estrita
- `no-console` — proibido; usar logger estruturado
- `max-lines` — 400 linhas por arquivo
- `max-params` — máximo 4 parâmetros por função
- `no-magic-numbers` — números mágicos proibidos (exceto 0, 1, -1)
- `prefer-readonly` — propriedades imutáveis onde possível
- `no-floating-promises` — promises não tratadas são erro
- `explicit-function-return-type` — retorno explícito obrigatório em funções públicas
- `no-unused-vars` — variáveis não usadas são erro (com exceção para padrões de destructuring)

**Processo de Code Review:**

1. **Draft PR:** Aberto pelo autor para feedback inicial (opcional)
2. **PR formal:** Aberto quando o código está completo, com descrição seguindo template:
   - O que foi feito e por quê
   - Screenshots (se aplicável — mudanças de UI)
   - Link para issue/story
   - Checklist de qualidade
3. **Revisão obrigatória:** Mínimo 1 approval de revisor da mesma squad + 1 de squad diferente para mudanças em pacotes compartilhados
4. **Tempo máximo de review:** 24h úteis (SLI: 90% dos PRs revisados em <24h)
5. **Bloqueios:** Não pode mergear sem approval, sem CI verde, sem cobertura mínima de testes (80% linhas novas)
6. **Merge:** Squash merge para `develop` (commits são achatados em um commit semântico), merge commit para `main` (preserva histórico de releases)

### Consequências

- Consistência de estilo em toda a base de código
- Detecção precoce de bugs e code smells
- Compartilhamento de conhecimento entre desenvolvedores via revisão
- Sobrecarga de tempo: code review adiciona ~20% ao ciclo de desenvolvimento
- Fricção inicial: desenvolvedores novos precisam se adaptar às regras estritas

### Compliance

1. CI falha se ESLint reportar qualquer erro (warnings são permitidos apenas com justificativa no código via `// eslint-disable-next-line`)
2. Cobertura de código (lines novas) deve ser >= 80% para aprovação
3. PRs com mais de 400 linhas alteradas são recusados automaticamente (exceto para generated code)
4. O SonarQube quality gate deve ser verde para merge
5. Revisão de segurança é obrigatória para PRs que alteram autenticação, autorização, ou manipulação de dados sensíveis

---

## ST-003: Testes Unitários, Integração e E2E

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

A arquitetura de microsserviços do EventOS AI introduz múltiplos pontos de falha: comunicação entre serviços, integrações com bancos, filas e APIs externas, e comportamento assíncrono via Kafka. Testar adequadamente cada camada é essencial para manter a confiança no deploy contínuo. Sem uma estratégia clara de testes, correções em um serviço podem quebrar funcionalidades em outro, e regressões passam despercebidas.

### Decisão

Adotar a pirâmide de testes invertida (trophy-shaped) com foco em testes de integração, complementados por testes unitários e E2E:

```
        ╱  E2E (5%)  ╲       — Playwright (frontend), Supertest (API)
       ╱  Integração     ╲    — Testcontainers + bancos reais
      ╱     (70%)          ╲
     ╱  Unitários (20%)      ╲  — Jest + mocks mínimos
    ╱   Static/Type (5%)       ╲ — TypeScript compiler, ESLint
```

**Testes Unitários (Jest + Testing Library):**
- Alvo: funções puras, utilities, helpers, validadores (Zod schemas), transforms
- Regra: testar comportamento, não implementação. Mocks apenas para dependências externas (HTTP, banco)
- Ferramenta: Vitest (Node.js) — mais rápido que Jest, compatível com Jest API
- Cobertura mínima: 80% de linhas para código novo, 60% geral do módulo
- `describe`/`it` com nomenclatura padronizada: `describe('MyService')` / `it('should return event when given valid id')`

**Testes de Integração (Testcontainers + Supertest):**
- Alvo: controllers, services com banco real, Kafka producers/consumers, gRPC handlers
- Estratégia: cada teste sobe o container real do PostgreSQL (Testcontainers), aplica migrações, executa operações e valida estado
- Kafka: redpanda em container para testes de mensageria sem depender do cluster real
- Redis: container para testes de cache e sessão
- Qdrant: container para testes de busca vetorial
- Regra: testar o serviço completo (controller -> service -> repository -> banco), sem mocks na camada de dados
- Setup/teardown: `beforeAll` para iniciar containers, `afterAll` para parar. Testes são paralelizados por arquivo

**Testes E2E (Playwright):**
- Alvo: fluxos completos do usuário (login -> criar evento -> emitir ingresso -> fazer check-in)
- Estratégia: ambiente de staging dedicado com dados de seed conhecidos
- Regra: testar jornadas críticas de negócio, não cada variação de UI
- Frequência: a cada deploy em staging, antes do merge para `main`
- Relatório: Playwright Report + vídeo/screenshot de falhas

**Testes de Contrato (Pact):**
- Alvo: contratos entre microsserviços (API REST, eventos Kafka)
- Estratégia: provedor publica contrato (Pact file), consumidor valida que suas expectativas são atendidas
- Frequência: a cada alteração no contrato (novo endpoint, novo campo em evento)

### Consequências

- Testes de integração com containers reais são mais lentos (~5-10s por teste) mas muito mais confiáveis que mocks
- Cobertura de 80% é factível com a pirâmide proposta
- Testcontainers evita poluição entre testes (cada teste tem banco limpo)
- Testes E2E em staging previnem regressões cross-service
- Custo de infraestrutura de CI: Testcontainers exigem Docker disponível no runner

### Compliance

1. Todo PR deve incluir testes para código novo ou alterado
2. CI executa: lint -> type-check -> unit tests -> integration tests -> build
3. E2E tests executam em pipeline separada (mais lenta), apenas em PRs para `main`
4. Cobertura mínima de 80% em linhas novas é enforced no SonarQube
5. Testes flaky (que falham intermitentemente) são identificados e removidos ou corrigidos em <48h

---

## ST-004: Documentação como Código

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

A documentação tradicional (Word, Google Docs, Confluence) envelhece rapidamente e perde sincronia com o código. Em um monorepo com múltiplos serviços evoluindo independentemente, documentação desatualizada é pior que nenhuma documentação — ela engana desenvolvedores e consumidores de API. O EventOS AI adota documentação como código (Docs as Code) para manter a documentação versionada, revisada e testada como parte do pipeline de CI.

### Decisão

**Princípios:**
1. Toda documentação relevante vive no repositório (monorepo), versionada junto com o código
2. Documentação é escrita em Markdown com extensões (Mermaid para diagramas, Admonitions para boxes)
3. Toda API REST tem especificação OpenAPI 3.1 gerada pelo NestJS (Swagger decorators)
4. Schemas de eventos Kafka são documentados no Schema Registry (Avro) com descrições
5. Toda ADR tem formato padronizado e é revisada como PR

**Estrutura de documentação:**

```
docs/
├── 01-Visao-Estrategica/     # Visão, princípios, objetivos de negócio
├── 02-Arquitetura/           # ADRs, decisões arquiteturais, C4 model
├── 03-UX/                    # Design system, user flows, protótipos
├── 04-Banco/                 # Modelo de dados, DER, migrações
├── 05-APIs/                  # OpenAPI specs, contratos gRPC
├── 06-Requisitos/            # Requisitos funcionais e não-funcionais
├── 07-CasosDeUso/            # Casos de uso detalhados por domínio
├── 07-IA/                    # Prompt book, agentes, modelos de ML
├── 08-BI/                    # Dashboards, métricas, relatórios
├── 09-DevOps/                # Infraestrutura, CI/CD, runbooks
├── 10-Seguranca/             # Políticas de segurança, threat models
├── 11-Comercial/             # Planos, pricing, SLAs
├── 12-Testes/                # Estratégia de testes, cenários
├── 13-Prompts/               # Prompt book para agentes de IA
├── 14-Roadmap/               # Roadmap do produto
└── 15-Internacionalizacao/   # i18n, l10n, suporte a idiomas
```

**Documentação de código (inline):**
- TSDoc/JSDoc para todas as funções e classes públicas em TypeScript
- Docstrings Python (Google style) para AI Service
- `README.md` em cada microsserviço com: propósito, pré-requisitos, setup local, variáveis de ambiente, endpoints principais
- `CONTRIBUTING.md` na raiz com guia de contribuição

**Ferramentas:**
- **MkDocs** (Material theme) para build do site de documentação
- **Swagger UI** para documentação interativa de API
- **Mermaid** para diagramas (ERD, fluxos, arquitetura) inline no Markdown
- **markdownlint** para linting de formatação
- **vale** (prose linter) para revisão de estilo de escrita

### Consequências

- Documentação sempre atualizada com o código (versionada no mesmo repo)
- Revisão de documentação é parte do fluxo de PR (ninguém mergea sem docs)
- Geração automática de site de documentação (MkDocs) a cada merge em `main`
- Barreira de entrada: desenvolvedores precisam escrever documentação, não só código
- Documentação inline (TSDoc) polui o código fonte mas gera API docs automaticamente

### Compliance

1. Toda PR com `feat` ou `fix` deve incluir documentação correspondente (aviso automático no template de PR)
2. OpenAPI specs são validadas (spectral lint) no CI para conformidade com padrões
3. MkDocs build falha se houver links quebrados na documentação
4. Novos endpoints devem ter entry no OpenAPI antes de serem consumidos
5. ADRs são obrigatórias para decisões arquiteturais que afetam outros serviços ou a plataforma como um todo

---

## ST-005: CI/CD com GitHub Actions

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

O monorepo do EventOS AI contém múltiplos serviços, pacotes compartilhados e ferramentas, cada um com seu próprio ciclo de build, teste e deploy. Um pipeline de CI/CD eficiente deve detectar quais partes foram alteradas, executar apenas os testes relevantes, e promover alterações de desenvolvimento até produção com segurança e rastreabilidade.

### Decisão

GitHub Actions como plataforma de CI/CD, com workflows modulares e reutilizáveis:

**Workflows:**

```yaml
# .github/workflows/ci.yml — executa em toda PR para develop/main
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, install-deps, lint, format-check]

  type-check:
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, install-deps, tsc --noEmit]

  test-unit:
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, install-deps, vitest run --coverage]

  test-int:
    runs-on: ubuntu-latest
    services:
      postgres: image: postgis/postgis:16-3.4
      redis: image: redis:7-alpine
    steps: [checkout, setup-node, install-deps, prisma generate, vitest run --config vitest.integration.ts]

  security-scan:
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, install-deps, npm audit, trivy fs .]

  build:
    needs: [lint, type-check, test-unit, test-int]
    steps: [checkout, setup-node, install-deps, build affected services]

# .github/workflows/deploy.yml — executa no merge para main
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - build docker images for each affected service
      - push to Amazon ECR
      - tag with git-sha and semver

  deploy-staging:
    needs: [build-and-push]
    steps:
      - update kustomize overlay for staging
      - argoCD sync (ou kubectl apply via action)

  e2e:
    needs: [deploy-staging]
    steps:
      - playwright run --config e2e/playwright.config.ts

  deploy-production:
    needs: [e2e]
    environment: production
    steps:
      - promote staging tag to production tag
      - update kustomize overlay for production
      - argoCD sync

  notify:
    needs: [deploy-production]
    steps:
      - notify Slack (#deployments) com link para release notes
```

**Estratégias de otimização:**
- **Turborepo cache:** Build e teste apenas serviços/pacotes afetados pelas alterações
- **Cache de dependências:** `actions/setup-node` com cache de `node_modules` e `.turbo`
- **Matrix builds:** Paralelização de testes por serviço
- **Remote caching:** Compartilhamento de cache entre runners via Vercel Remote Cache ou S3

**Ambientes:**
| Ambiente | Trigger | Aprovação | Dados |
|----------|---------|-----------|-------|
| Development | Push a `develop` | Automática | Dados sintéticos |
| Staging | Merge a `main` | Automática | Dados anonimizados |
| Production | Deploy a partir de staging | Manual + approval | Dados reais |
| Hotfix | PR para `main` com label `hotfix` | Aprovação expedita | Produção |

### Consequências

- Deploy automatizado reduz erro humano e acelera time-to-market
- Caching do Turborepo reduz tempo de CI de 30min para ~5min em mudanças localizadas
- Ambientes com aprovação manual em produção garantem segurança sem sacrificar velocidade
- Complexidade de configuração: workflows YAML do GitHub Actions podem ficar extensos
- Custo de execução: GitHub Actions cobra por minuto; matrix builds paralelos aumentam consumo

### Compliance

1. CI deve passar em todos os stages antes do merge (branch protection rule)
2. Deploy para produção exige approval manual de pelo menos 1 arquiteto
3. Imagens Docker são escaneadas por vulnerabilidades (Trivy) antes do push para ECR
4. Toda release é taggeada no Git com a versão semântica correspondente
5. Rollback automático se as métricas de erro subirem >5% nos primeiros 10 minutos após deploy

---

## ST-006: Monitoramento com Prometheus + Grafana

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

Com mais de 10 microsserviços, bancos distribuídos e filas de mensagens, o monitoramento do EventOS AI precisa capturar métricas de performance, saúde e utilização em tempo real, correlacionar eventos entre serviços, e disparar alertas proativos antes que problemas afetem usuários. Sem um sistema de monitoramento robusto, a equipe opera cega e reage a incidentes apenas quando usuários reportam.

### Decisão

Prometheus + Grafana como stack de métricas, com alertas via Alertmanager e dashboards por domínio:

**Métricas coletadas (obrigatórias por serviço):**

| Categoria | Métrica | Descrição |
|-----------|---------|-----------|
| Latência | `http_request_duration_seconds` | Histograma p50/p95/p99 por rota e método |
| Taxa de erro | `http_requests_total{status="5xx"}` | Contagem de erros por rota |
| Throughput | `http_requests_total` | Requisições por segundo |
| Saturation | `kafka_consumer_lag` | Lag do consumidor Kafka |
| Banco | `prisma_query_duration_seconds` | Duração de queries Prisma |
| Cache | `redis_hit_ratio` | Hit ratio do cache Redis |
| Recurso | `process_cpu_usage`, `process_memory_bytes` | CPU e memória do processo |
| Filas | `rabbitmq_queue_messages` | Tamanho de filas do RabbitMQ |
| GPU | `nvidia_gpu_utilization` | Utilização de GPU no AI Service |

**Métricas de negócio:**
- `checkins_total{type="qrcode|nfc|rfid|manual"}` — check-ins por modalidade
- `tickets_sold_total` — ingressos vendidos por evento/lote
- `active_users` — usuários ativos por organização
- `ai_inference_total{model="gpt4|claude|mistral"}` — inferências de IA por modelo
- `ai_inference_tokens_total` — tokens consumidos por modelo

**Dashboards (Grafana):**
- **Service Overview:** Um painel por microsserviço (RED metrics: Rate, Errors, Duration)
- **Business Overview:** Métricas de negócio por organização
- **Infrastructure Overview:** Cluster K8s, nós, pods, volumes
- **Kafka Overview:** Throughput, lag, consumer group status
- **Database Overview:** Conexões, replicação, slow queries, tabelas por tamanho
- **AI Overview:** Latência de inferência, fila, cache hit ratio, custo por modelo
- **SLA/SLI Overview:** SLOs por serviço com burn rate alerts

**Alertas (Alertmanager):**
- **Página (PagerDuty):** Serviço down, P99 latência > 5s por 5min, erro > 5% por 5min
- **Slack (#alerts):** Kafka consumer lag > 1000, disco > 80%, CPU > 80% sustentado
- **E-mail:** Daily digest de métricas e tendências

**Service Level Objectives (SLOs):**
| Serviço | SLO | Período |
|---------|-----|---------|
| API Gateway | 99.95% disponibilidade | 30 dias |
| Identity | 99.99% disponibilidade | 30 dias |
| Check-in | 99.9% disponibilidade (offline mode mitiga) | 30 dias |
| AI Service | 99.5% disponibilidade | 30 dias |
| Kafka | 99.95% disponibilidade | 30 dias |
| Banco (RDS) | 99.99% disponibilidade (Multi-AZ) | 30 dias |

### Consequências

- Visibilidade em tempo real de toda a plataforma
- Alertas proativos previnem incidentes antes de afetar usuários
- SLOs claros permitem decisões baseadas em dados sobre prioridades de engenharia
- Overhead de instrumentação: cada serviço precisa expor métricas no formato Prometheus
- Custo de armazenamento de métricas de alta cardinalidade pode ser significativo

### Compliance

1. Todo serviço expõe endpoint `/metrics` no formato Prometheus (porta 9464 por convenção)
2. Dashboards são versionados no Git (Grafana provisioning via arquivos JSON)
3. SLOs são revisados trimestralmente e ajustados conforme maturidade da plataforma
4. Alertas não podem ser silenciados por mais de 7 dias sem justificativa documentada
5. Post-mortem é obrigatório para incidentes que violam SLOs

---

## ST-007: Segurança — OWASP Top 10 e Secrets Management

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

O EventOS AI processa dados pessoais de participantes (nome, e-mail, CPF, dados de pagamento), dados de organizações (contratos, estratégias de precificação) e integra-se com sistemas de bilheteria, pagamento e CRM. Uma violação de segurança pode causar danos financeiros, legais (LGPD) e reputacionais irreparáveis. A segurança deve ser incorporada em todas as camadas, não tratada como add-on.

### Decisão

**OWASP Top 10 — Mitigações por categoria:**

| Risco OWASP | Mitigação no EventOS AI |
|-------------|------------------------|
| A01: Broken Access Control | RLS no PostgreSQL, autorização baseada em claims JWT, RBAC por organização |
| A02: Cryptographic Failures | TLS 1.3 em todas as comunicações, criptografia AES-256 em repouso para PII |
| A03: Injection | Prisma ORM (previne SQL injection), input validation com Zod, sanitização de inputs |
| A04: Insecure Design | Threat modeling via STRIDE no design de cada feature, ADRs de segurança |
| A05: Security Misconfiguration | Policy-as-code (Kyverno) no K8s, scans de configuração com kube-bench |
| A06: Vulnerable Components | Dependabot + Renovate para atualizações, Trivy para scan de imagens |
| A07: ID and Auth Failures | JWT RS256, refresh tokens com device fingerprint, MFA para administradores |
| A08: Software Integrity | Assinatura de imagens Docker (Cosign), SBOM gerado automaticamente |
| A09: Security Logging | Todos os eventos de segurança logados (login, logout, MFA, alteração de roles) |
| A10: SSRF | Restrição de rede (network policies K8s), validação de URLs fornecidas pelo usuário |

**Secrets Management:**

Nunca armazenar secrets no código fonte. A hierarquia de secrets:

1. **Desenvolvimento local:** Arquivo `.env.local` (gitignorado) com valores mock
2. **CI/CD:** GitHub Actions Secrets (não expostos em logs)
3. **Staging/Produção:** AWS Secrets Manager, acessado via External Secrets Operator no K8s
4. **Rotação:** Secrets de banco rodados a cada 90 dias; API keys de terceiros conforme política do provedor

**Práticas obrigatórias:**
- Hash de senhas: bcrypt com custo 12 (configurável, nunca < 10)
- Rate limiting de login: 5 tentativas por minuto por IP + 10 por minuto por usuário
- MFA: Obrigatório para administradores e organizadores, opcional para participantes
- Session invalidation: Ao trocar senha, todas as sessões ativas são revogadas
- CORS: Whitelist de origens configurada por organização, nunca `Access-Control-Allow-Origin: *`
- Headers de segurança: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`

### Consequências

- Redução significativa da superfície de ataque
- Conformidade com LGPD e requisitos de clientes enterprise
- Processo de rotação de secrets adiciona complexidade operacional
- MFA adiciona fricção para usuários administradores
- Scans de segurança no CI aumentam o tempo de pipeline

### Compliance

1. Todo PR deve passar por security scan (Trivy + npm audit) antes do merge
2. Dependências com vulnerabilidades críticas (CVSS >= 9) devem ser corrigidas em 48h
3. Secrets são auditados mensalmente para detectar exposição acidental
4. Teste de penetração é realizado semestralmente por equipe externa
5. Toda feature que processa PII deve ter data flow diagram aprovado pelo DPO

---

## ST-008: Logging Estruturado

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

Em uma arquitetura distribuída, logs são a principal fonte de informação para debugging, auditoria e análise de comportamento do sistema. Logs não estruturados (`console.log('User logged in')`) são impossíveis de pesquisar, correlacionar e analisar em escala. O EventOS AI precisa de logging estruturado, centralizado e rico em contexto para suportar troubleshooting rápido e auditoria de segurança.

### Decisão

**Formato de log:** JSON, com campos obrigatórios:

```json
{
  "timestamp": "2026-07-16T14:30:00.000Z",
  "level": "info",
  "service": "event-service",
  "version": "1.2.3",
  "environment": "production",
  "trace_id": "abc123def456",
  "span_id": "span789",
  "correlation_id": "corr-abc-123",
  "message": "Event created successfully",
  "event_id": "evt-456",
  "organization_id": "org-789",
  "user_id": "usr-012",
  "duration_ms": 145,
  "metadata": {}
}
```

**Níveis de log:**
| Nível | Uso | Ação |
|-------|-----|------|
| `debug` | Informação detalhada para debugging | Só em desenvolvimento; em produção via feature flag |
| `info` | Eventos de negócio (entidade criada, atualizada) | Sempre ativo |
| `warn` | Situações anormais mas não críticas (retry, degradação) | Alerta no Slack |
| `error` | Erro operacional que requer atenção (falha de conexão, validação) | Alerta + PagerDuty se frequente |
| `fatal` | Erro irrecuperável (falha na inicialização, sem conexão com banco) | PagerDuty imediato |

**Regras de log:**
- Nunca logar dados sensíveis (senhas, tokens, CPF, dados de cartão de crédito) — campo sensitive=true no schema
- Logs de auditoria (login, alteração de permissão, deleção de dados) são sempre `info` com `audit: true`
- Exceções são logadas com stack trace completo OBRIGATORIAMENTE
- Logs de requisição HTTP (request/response) com duração, status code e tamanho

**Transporte e armazenamento:**
- **Desenvolvimento:** Console (pino-pretty para legibilidade humana)
- **Produção:** JSON para stdout, coletado pelo Loki (via Promtail ou OpenTelemetry Collector)
- **Retenção:** Loki: 7 dias (quente), S3 Glacier: 90 dias (frio), 1 ano (archive)
- **Índices no Loki:** `service`, `level`, `trace_id`, `organization_id`, `environment`

**Ferramenta:** Pino (Node.js) — mais rápido que Winston (2-3x) e com suporte nativo a JSON:

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: ['req.headers.authorization', 'req.body.password', 'req.body.cpf'],
});
```

### Consequências

- Logs pesquisáveis e filtráveis por qualquer campo
- Correlação entre logs de diferentes serviços via `trace_id` e `correlation_id`
- Performance: Pino é significativamente mais rápido que alternatives, minimizando impacto
- Redução de ruído: logs estruturados permitem alertas precisos (ex: `level=error AND service=checkin`)
- Costo de armazenamento: logs JSON são maiores que texto plano

### Compliance

1. Todo log em produção deve ser JSON válido com campos obrigatórios preenchidos
2. `console.log`/`console.error` são bloqueados pelo ESLint; uso exclusivo do logger Pino
3. Redact de campos sensíveis é configurado por serviço e revisado em code review
4. Taxa de logs é monitorada (logs/s por serviço); picos indicam possível bug ou ataque
5. Logs com `audit: true` têm retenção de 1 ano (vs 7 dias para logs operacionais)

---

## ST-009: Error Handling Padrão

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

Cada microsserviço do EventOS AI lida com erros de diferentes naturezas: validação de input, regras de negócio violadas, falhas de integração (banco, Kafka, API externa), erros inesperados (bug no código, falta de memória). Sem um padrão unificado de error handling, cada desenvolvedor cria seu próprio estilo, resultando em respostas de erro inconsistentes para o cliente, debugging difícil e monitoramento impreciso.

### Decisão

**Hierarquia de Exceções (NestJS + Python):**

```
DomainException (abstract)
├── ValidationException     — Dados de input inválidos (400)
├── BusinessRuleException   — Regra de negócio violada (422)
│   ├── TicketAlreadySoldException
│   ├── EventAlreadyStartedException
│   ├── ParticipantAlreadyCheckedInException
│   └── OrganizationQuotaExceededException
├── NotFoundException       — Entidade não encontrada (404)
├── UnauthorizedException   — Não autenticado (401)
├── ForbiddenException      — Não autorizado (403)
├── ConflictException       — Conflito de estado (409)
└── InfrastructureException — Falha externa (502/503)
    ├── DatabaseException
    ├── KafkaException
    ├── RedisException
    └── AIServiceException
```

**Formato de resposta de erro (JSON):**

```json
{
  "error": {
    "code": "TICKET_ALREADY_SOLD",
    "message": "O ingresso #12345 já foi vendido para outro participante",
    "details": [
      {
        "field": "ticket_id",
        "issue": "already_sold",
        "value": "12345"
      }
    ],
    "trace_id": "abc123def456",
    "timestamp": "2026-07-16T14:30:00.000Z",
    "docs_url": "https://docs.eventos.ai/errors/TICKET_ALREADY_SOLD"
  }
}
```

**Padrões de implementação:**

**NestJS (Node.js):**
```typescript
// exception filter global
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 1. Logar exceção com trace completo
    // 2. Mapear para DomainExceptionCode
    // 3. Retornar resposta padronizada
    // 4. Se nível >= error, notificar time via alerta
  }
}
```

**Python (FastAPI):**
```python
@app.exception_handler(DomainException)
async def domain_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": str(exc),
                "trace_id": request.state.trace_id,
                "timestamp": datetime.utcnow().isoformat(),
            }
        },
    )
```

**Regras de error handling:**
1. Toda exceção é capturada por um filter global (nunca try/catch em controllers)
2. Exceções de infraestrutura são retryáveis (Kafka, banco) com backoff exponencial
3. Erros de validação (Zod) são mapeados automaticamente para `ValidationException` com detalhes de campo
4. Nunca expor detalhes de implementação (stack trace) em produção
5. Erros de domínio têm código único (UPPER_SNAKE_CASE) documentado no OpenAPI

### Consequências

- Consistência: todas as APIs retornam erros no mesmo formato
- Facilidade de debugging: `trace_id` em toda resposta de erro
- Documentação automática: códigos de erro aparecem no OpenAPI/Swagger
- Separação clara entre erro de negócio (422) e erro de sistema (502)
- Overhead de categorização: cada novo erro precisa ser classificado na hierarquia

### Compliance

1. Todo novo endpoint deve tratar erros de validação, domínio e infraestrutura
2. Códigos de erro (TICKET_ALREADY_SOLD) são registrados no `error-codes.md` do serviço
3. Erros não mapeados (500) disparam alerta automático
4. Testes cobrem cenários de erro para todos os endpoints
5. `docs_url` no erro deve levar a página de documentação explicando a causa e solução

---

## ST-010: Prisma ORM — Conventions

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

O Prisma ORM é a camada de acesso a dados de todos os microsserviços Node.js do EventOS AI. Com múltiplos desenvolvedores modelando schemas, escrevendo queries e criando migrações, é essencial estabelecer convenções claras para nomenclatura, relacionamentos, índices e padrões de acesso para manter a consistência e performance do banco de dados.

### Decisão

**Nomenclatura:**

```prisma
// Model names: PascalCase, singular
model Event {
  // ID: UUID v4 gerado automaticamente
  id        String   @id @default(uuid()) @db.Uuid
  
  // Timestamps: camelCase, decoradores @createdAt @updatedAt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos: nome no plural
  tickets   Ticket[]
  sessions  Session[]
  
  // Campos obrigatórios: nome descritivo sem prefixo redundante
  title     String   @db.VarChar(255)      // não "event_title"
  status    EventStatus @default(DRAFT)
  
  // Chave estrangeira: {campo}Id
  organizationId String @map("organization_id") @db.Uuid
  
  // Mapeamento snake_case para PostgreSQL
  @@map("events")
}

// Enums: PascalCase
enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
  
  @@map("event_status")
}
```

**Regras de schema:**

1. **IDs:** UUID v4, nunca auto-increment (segurança, distributed systems, sharding)
2. **Timestamps:** `createdAt` e `updatedAt` em TODAS as tabelas
3. **Soft delete:** `deletedAt DateTime?` para tabelas com dados de usuário; queries com filtro `where: { deletedAt: null }`
4. **Mapeamento:** `@@map("snake_case_table")` e `@map("snake_case_column")` — o schema Prisma usa camelCase, o banco snake_case
5. **Índices:** Sempre criar índices para chaves estrangeiras e campos de filtro frequente:
   ```prisma
   @@index([organizationId])
   @@index([status, startDate])
   @@index([slug], unique: true)
   ```
6. **Tipos:** Usar tipos nativos do PostgreSQL via `@db`:
   - `@db.Uuid` para UUIDs
   - `@db.VarChar(n)` para strings com limite
   - `@db.Text` para textos longos
   - `@db.JsonB` para metadados flexíveis
   - `@db.Timestamptz()` para timestamps com timezone
   - `@db.Decimal(10, 2)` para valores monetários
7. **Enums:** `enum` nativo do Prisma mapeado para enum PostgreSQL (não usar string para campos com valores fixos)
8. **Relacionamentos:** Preferir `@relation` explícito com chave estrangeira nomeada

**Padrões de query:**

```typescript
// Repository pattern: encapsular queries no serviço
@Injectable()
export class EventRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { id },
      include: { tickets: true, sessions: true },
    });
  }

  async findByOrganization(
    organizationId: string,
    filters: { status?: EventStatus; page?: number; limit?: number },
  ) {
    const { status, page = 1, limit = 20 } = filters;
    return this.prisma.event.findMany({
      where: {
        organizationId,
        ...(status && { status }),
        deletedAt: null,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

**Migrações:**
- Nome descritivo: `20260716_add_ticket_type_field`
- Sempre revisar o SQL gerado antes de aplicar
- Migrações são aplicadas automaticamente no startup do serviço apenas em dev/staging
- Em produção, migrações são executadas como passo separado no CI/CD antes do deploy

**Performance:**
- Usar `select` para buscar apenas campos necessários (nunca `include` sem necessidade)
- Queries N+1 são detectadas pelo Prisma Client Events e alertadas
- `batch` para operações em lote (createMany, updateMany)
- Raw SQL permitido apenas para queries complexas que o Prisma não otimiza, com review obrigatório

### Consequências

- Consistência: todos os modelos seguem as mesmas convenções de nomenclatura
- Manutenibilidade: qualquer desenvolvedor pode abrir qualquer schema e entender imediatamente
- Performance: índices explícitos e queries otimizadas previnem degradação
- Segurança: Prisma previne SQL injection por design
- Complexidade: modelos com muitos relacionamentos podem ter schemas longos e aninhados

### Compliance

1. Todo novo modelo deve seguir as convenções de nomenclatura e incluir `id`, `createdAt`, `updatedAt`, `organizationId`
2. Migrações são revisadas em PR e validadas em staging antes de produção
3. Queries N+1 são detectadas por análise de logs do Prisma e reportadas como bug
4. Uso de `select` explícito é obrigatório em consultas de listagem
5. Raw SQL exige aprovação de arquiteto e documentação do motivo

---

## Apêndice A: Checklists de Qualidade

### Checklist Pré-PR

- [ ] Código passa em `npm run lint` sem erros
- [ ] Código passa em `npm run type-check`
- [ ] Testes unitários escritos para toda lógica nova
- [ ] Testes de integração escritos para endpoints novos
- [ ] Cobertura de linhas novas >= 80%
- [ ] Documentação atualizada (README, OpenAPI, TSDoc)
- [ ] Commits seguem Conventional Commits
- [ ] Nenhum secret exposto no código
- [ ] Dependências atualizadas (Renovate/Dependabot)

### Checklist Pré-Produção

- [ ] CI verde (lint, type-check, tests, build, security scan)
- [ ] Deploy em staging funcionando por >= 24h
- [ ] Testes E2E passando em staging
- [ ] Dashboards de métricas mostram baseline normal
- [ ] Alertas configurados para o novo serviço/endpoint
- [ ] Runbook de rollback documentado
- [ ] Aprovação de segurança para mudanças em auth/PII
- [ ] Aprovação de arquiteto para mudanças arquiteturais

---

## Apêndice B: Referências

- Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/
- SemVer: https://semver.org/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OpenTelemetry: https://opentelemetry.io/
- NestJS Documentation: https://docs.nestjs.com/
- Prisma Documentation: https://www.prisma.io/docs/
- Testcontainers for Node.js: https://node.testcontainers.org/
