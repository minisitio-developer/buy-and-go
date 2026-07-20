# ADR-001: Decisões Arquiteturais do EventOS AI

**Status:** Vigente  
**Última Revisão:** 2026-07-16  
**Autor:** Equipe de Arquitetura EventOS AI  

---

## Índice de Decisões

| ID | Título | Status |
|----|--------|--------|
| ADR-001.1 | Monorepo com Microsserviços NestJS | Accepted |
| ADR-001.2 | PostgreSQL como Banco Principal | Accepted |
| ADR-001.3 | Kafka para Mensageria Assíncrona | Accepted |
| ADR-001.4 | Redis para Cache e Sessão | Accepted |
| ADR-001.5 | Qdrant para Armazenamento de Embeddings | Accepted |
| ADR-001.6 | API Gateway com Autenticação JWT | Accepted |
| ADR-001.7 | Separação do AI Service em Python | Accepted |
| ADR-001.8 | Frontend Next.js com SSR | Accepted |
| ADR-001.9 | Containerização com Docker Compose + Kubernetes | Accepted |
| ADR-001.10 | White-Label Multitenancy com RLS | Accepted |
| ADR-001.11 | CQRS e Event Sourcing como Padrão de Dados | Accepted |
| ADR-001.12 | OpenTelemetry para Observabilidade Distribuída | Accepted |

---

## ADR-001.1: Monorepo com Microsserviços NestJS

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI precisa atender a múltiplos produtos — EventOS, Minisitio, HealthOS, GovOS — que compartilham um núcleo de plataforma comum, mas têm requisitos de escalabilidade e implantação distintos. A equipe de arquitetura avaliou três abordagens: monólito tradicional, serverless (AWS Lambda + API Gateway) e microsserviços orquestrados.

A abordagem monolítica foi descartada porque os diferentes domínios (check-in, CRM, emissão de tickets, IA generativa) têm ciclos de vida, requisitos de recursos e necessidades de escalabilidade muito distintos. Um monólito forçaria deploys coordenados e dificultaria a escalabilidade independente do serviço de IA, que consome GPU e tem picos de demanda imprevisíveis.

A abordagem serverless pura foi avaliada, mas rejeitada devido ao cold start em Python para workloads de IA, limitações de timeout em execuções longas (processamento de PDFs, relatórios) e custo imprevisível em cenários de alta throughput sustentada. Além disso, o serverless introduz complexidade significativa para event sourcing e sagas distribuídas, que exigem estado coordenado entre funções.

Optou-se por microsserviços em monorepo para equilibrar compartilhamento de código com independência operacional. O NestJS foi escolhido como framework principal Node.js por fornecer arquitetura modular opinada (módulos, decorators, injeção de dependência), suporte nativo a GraphQL e REST, e integração direta com Kafka, Redis e Prisma. A estrutura monorepo é gerenciada com Turborepo para build caching e detecção de escopo de alterações.

### Decisão

Adotar monorepo gerenciado pelo Turborepo com a seguinte estrutura top-level:

```
eventos-ai/
├── backend/
│   ├── services/
│   │   ├── identity/        # Autenticação, autorização, multitenancy
│   │   ├── event/           # Gestão de eventos, agenda, programação
│   │   ├── ticket/          # Emissão, validação, tipos de ingresso
│   │   ├── checkin/         # Credenciamento, acesso, pulseira NFC/RFID
│   │   ├── crm/             # Contatos, deals, pipeline, automação
│   │   └── ai/              # Gateway para AI Service (Python)
│   ├── libs/
│   │   ├── shared/          # Tipos, DTOs, interfaces, utilities
│   │   ├── database/        # Prisma schemas, migrações, seed
│   │   └── messaging/       # Kafka producers/consumers, event schema
│   └── gateways/
│       └── api-gateway/     # BFF, rate limiting, JWT validation, routing
├── frontend/                # Next.js 14+ com App Router
├── ai-service/              # Python FastAPI (separado, fora do monorepo build)
├── infra/
│   ├── kubernetes/          # Manifests K8s por serviço
│   ├── terraform/           # IaC para AWS EKS, RDS, MSK, ElastiCache
│   └── docker-compose.yml   # Stack local de desenvolvimento
└── docs/                    # ADRs, arquitetura, decisões técnicas
```

Cada microsserviço é um aplicativo NestJS autônomo com seu próprio `main.ts`, `app.module.ts`, e pipeline de CI/CD. O compartilhamento ocorre via pacotes internos do Turborepo (`@eventos/shared`, `@eventos/database`, `@eventos/messaging`), nunca por duplicação de código.

### Consequências

**Positivas:**
- Escalabilidade independente: o serviço de IA pode escalar horizontalmente sem afetar o CRM ou identity
- Isolamento de falhas: um bug no check-in não derruba a emissão de tickets
- Times independentes: cada squad pode deployar seu serviço sem coordenar com os demais
- Reuso real de código via pacotes internos do monorepo
- Build caching com Turborepo reduz o tempo de CI em cenários de alteração localizada

**Negativas:**
- Complexidade operacional: múltiplos serviços, bancos de dados e filas precisam ser gerenciados
- Overhead de comunicação: chamadas entre serviços exigem serialização/deserialização e lidam com latência de rede
- Depuração distribuída: tracing e logging centralizado são obrigatórios, não opcionais
- Governança de contratos: mudanças em schemas compartilhados exigem coordenação entre squads
- Recursos humanos: equipe precisa de conhecimento em NestJS, Python, K8s, Kafka e múltiplos bancos

### Compliance

1. Todo novo serviço deve ser criado via blueprint do Turborepo, seguindo a estrutura de pastas padronizada
2. Serviços só podem se comunicar via API explícita (REST ou Kafka), nunca via banco de dados compartilhado
3. O pacote `@eventos/shared` é versionado semanticamente e qualquer breaking change exige ADR próprio
4. O CI/CD deve validar que alterações em pacotes compartilhados disparam a pipeline de todos os serviços dependentes
5. Métricas de acoplamento (afferent/efferent coupling) são monitoradas no SonarQube

---

## ADR-001.2: PostgreSQL como Banco Principal

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI gerencia dados relacionais complexos: eventos, organizadores, participantes, ingressos, transações financeiras, contratos e relacionamentos de CRM. Esses dados exigem consistência ACID, integridade referencial e consultas ad-hoc com joins entre múltiplas entidades. Avaliamos PostgreSQL, MySQL 8.0 e MongoDB como candidatos primários.

MongoDB foi considerado para sua flexibilidade de schema e escalabilidade horizontal nativa, mas rejeitado porque o domínio de eventos tem relacionamentos fortemente acoplados (organizador -> evento -> lote -> ingresso -> participante -> check-in) que exigiriam múltiplos $lookup com performance degradada. Além disso, a consistência eventual do MongoDB cria riscos para transações financeiras e emissão de ingressos, onde a duplicação ou perda de dados é inaceitável.

MySQL 8.0 é competente em performance de leitura e tem ecossistema maduro, mas PostgreSQL oferece vantagens diferenciais para nosso cenário: suporte nativo a JSONB (para metadados flexíveis de eventos), índices GIN para busca em campos dinâmicos, extensões como PostGIS (geolocalização de eventos), pgvector (embeddings de IA), e melhor suporte a CTEs e window functions para relatórios analíticos.

A capacidade do PostgreSQL de atuar como banco relacional primário e simultaneamente suportar cargas de trabalho analíticas reduz a necessidade de bancos especializados, simplificando a stack. A licença MIT do PostgreSQL elimina preocupações de custo de licenciamento corporativo.

### Decisão

PostgreSQL 16 será o banco de dados relacional primário para todos os microsserviços transacionais. Configurações específicas:

- **Alta disponibilidade:** Patroni + etcd para failover automático, com réplicas de leitura em zonas de disponibilidade distintas
- **Escalabilidade de leitura:** Réplicas síncronas locais para consistência forte, réplicas assíncronas cross-region para disaster recovery
- **Pooling de conexões:** PgBouncer em modo transaction pooling para gerenciar o pool de conexões dos microsserviços
- **Sharding:** Citus para tabelas de alto volume (check-ins, eventos) quando necessário
- **Backup:** WAL-G para backup contínuo WAL com PITR (point-in-time recovery), retenção de 30 dias
- **Migrações:** Prisma Migrate com validação em CI (não podem haver migrações conflitantes)
- **Performance:** Uso extensivo de índices parciais, coberturas e compressão de TOAST para campos JSONB

Cada microsserviço tem seu próprio schema no PostgreSQL, isolado por namespace. O schema `_shared` contém tabelas de domínio compartilhado (ex: `organizations`, `users`) acessíveis via views específicas por serviço.

### Consequências

**Positivas:**
- Consistência ACID para transações financeiras e emissão de ingressos
- JSONB permite flexibilidade de schema sem abrir mão de integridade relacional
- pgvector elimina a necessidade de banco vetorial separado para cargas leves
- PostGIS suporta consultas geográficas para eventos presenciais (busca por raio, clustering)
- CTEs e window functions permitem relatóricos analíticos complexos sem banco separado
- Ecossistema maduro de ferramentas (pgAdmin, DataGrip, DBeaver, pg_stat_statements)

**Negativas:**
- Escalabilidade horizontal de escrita é complexa (Citus adiciona overhead operacional)
- Performance de busca full-text é inferior ao ElasticSearch para consultas complexas
- Schema changes em tabelas grandes exigem cuidado com locks (uso de pgroll ou gh-ost)
- Não é ideal para séries temporais de alta cardinalidade (logs, métricas)
- Custo operacional de manutenção de HA com Patroni + etcd não é trivial

### Compliance

1. Toda migração de schema deve passar por code review e ser testada em staging antes da produção
2. Índices devem ser justificados por EXPLAIN ANALYZE e cobertos por testes de performance
3. Schemas de microsserviços não podem referenciar diretamente tabelas de outros serviços
4. Consultas N+1 são detectadas por análise estática no CI e bloqueiam o merge
5. Uso de RAW SQL é permitido apenas para queries complexas que Prisma não otimiza, com revisão obrigatória de DBA

---

## ADR-001.3: Kafka para Mensageria Assíncrona

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI requer mensageria assíncrona para múltiplos cenários: processamento de eventos de domínio (event sourcing), comunicação entre microsserviços, ingestão de dados de terceiros e streaming de eventos de check-in em tempo real para dashboards. Avaliamos Apache Kafka, RabbitMQ e Amazon SQS/SNS.

RabbitMQ é excelente para filas de trabalho com roteamento complexo (topic exchanges, direct exchanges) e entrega garantida, mas não foi projetado para retenção de mensagens por longo período, replay de eventos históricos ou streaming de alto throughput. O modelo de consumo destrutivo (mensagem é removida após confirmação) é inadequado para event sourcing, onde o log de eventos precisa ser preservado indefinidamente.

Amazon SQS/SNS foi considerado por sua simplicidade operacional (zero gerenciamento de infraestrutura) e escalabilidade automática. No entanto, o SQS não suporta consumo concorrente ordenado por chave de partição, o que impossibilita garantir ordem de eventos por aggregate ID — requisito fundamental para event sourcing. Além disso, a latência variável do SQS (polling baseado) e a limitação de 256KB por mensagem são restrições significativas.

Kafka foi escolhido por fornecer log imutável, retenção configurável por tempo/tamanho, replay de mensagens, ordenação garantida por partição, alto throughput (milhares de mensagens/segundo com latência de milissegundos) e ecossistema robusto (Kafka Connect para integração com bancos, Kafka Streams para processamento, Schema Registry para governança de schemas). A auto-geração de schemas Avro com validação no Schema Registry garante contratos firmes entre produtores e consumidores.

### Decisão

Apache Kafka será a espinha dorsal de mensageria do EventOS AI, operado via Amazon MSK (Managed Streaming for Kafka) em produção e KRaft (sem ZooKeeper) em desenvolvimento:

- **Tópicos por domínio:** Cada bounded context tem seu próprio tópico (ex: `event.ticket.issued`, `event.checkin.confirmed`, `crm.contact.updated`)
- **Schema Registry:** Schemas Avro obrigatórios para todos os eventos, armazenados no AWS Glue Schema Registry
- **Retenção:** 7 dias para tópicos de comando, 90 dias para tópicos de evento, infinity para tópicos de event sourcing (com compactação por chave)
- **Particionamento:** Por `aggregate_id` para garantir ordenação de eventos por entidade
- **Consumidores:** Group IDs por serviço, com pelo menos uma entrega (at-least-once) e idempotência no consumidor
- **Kafka Connect:** Conectores Debezium para Change Data Capture do PostgreSQL, alimentando tópicos de evento
- **Governança:** Toda mensagem tem `event_id`, `event_version`, `timestamp`, `correlation_id`, `causation_id` e `organization_id`

RabbitMQ é mantido exclusivamente para filas de trabalho internas (processamento de PDF, envio de e-mails) onde o modelo de fila destrutiva é adequado e desejável.

### Consequências

**Positivas:**
- Log imutável permite auditoria completa e reconstrução de estado (event sourcing)
- Ordenação garantida por partição viabiliza CQRS e processamento consistente de eventos
- Replay de eventos facilita debugging, testes e recuperação de desastres
- Schema Registry previne breaking changes silenciosos entre serviços
- Alta throughput escala horizontalmente com adição de partições
- Debezium CDC integra PostgreSQL ao Kafka sem alterar o código dos serviços

**Negativas:**
- Complexidade operacional: Kafka é notório por exigir tuning fino de JVM, discos, rede e parâmetros do broker
- Sobrecarga cognitiva: desenvolvedores precisam entender conceitos de partições, offsets, consumer groups, rebalanceamento
- Latência adicional: mesmo com Kafka rápido, a mensageria assíncrona adiciona delay vs chamada síncrona
- Custo: Amazon MSK é caro comparado a SQS, especialmente com armazenamento EBS provisionado
- Monitoramento complexo: lag de consumidores, taxa de rebalanceamento, throughput por partição exigem dashboards dedicados

### Compliance

1. Todo evento publicado deve ter schema Avro registrado antes do deploy
2. Breaking changes em schemas existentes exigem evolução compatível (backward/forward) conforme regras do Schema Registry
3. Consumidores devem ser idempotentes: processar a mesma mensagem duas vezes não pode causar efeitos colaterais duplicados
4. O correlation_id deve ser propagado em todas as mensagens para tracing distribuído
5. Tópicos são imutáveis em produção: não é permitido deletar ou reter messages fora da política definida

---

## ADR-001.4: Redis para Cache e Sessão

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI precisa de armazenamento em memória para múltiplos casos de uso: cache de consultas frequentes (dados de eventos, lotes, preços), sessões de usuário autenticado, rate limiting, filas de processamento leve e armazenamento temporário de tokens JWT revogados (blacklist). Avaliamos Redis, Memcached e Amazon ElastiCache Serverless.

Memcached é simples, eficiente e maduro para cache chave-valor, mas falta-lhe recursos críticos para nosso cenário: persistência em disco para recuperação pós-reinício, estruturas de dados avançadas (sorted sets para leaderboards, hyperloglog para contagens aproximadas, streams para filas), suporte a pub/sub e a capacidade de operar como banco primário para dados de curta duração. A limitação a chaves de 250 bytes e valores de 1MB também é restritiva para nossos payloads de cache de eventos, que podem incluir metadados extensos.

Amazon ElastiCache Serverless foi cogitado para reduzir overhead operacional, mas seu custo por nó é significativamente superior ao Redis autogerenciado em EC2 ou ElastiCache Redis (não serverless) para cargas de trabalho previsíveis. Além disso, ElastiCache Serverless impõe limites de 5GB por cache e não oferece suporte a Redis Stack (RediSearch, RedisJSON, RedisTimeSeries), que planejamos utilizar para busca em cache e análise em tempo real.

Redis foi escolhido por combinar baixa latência (sub-milissegundo para operações em memória), rico conjunto de estruturas de dados, persistência opcional (RDB + AOF), replicação nativa com sentinel para HA, e ecossistema de módulos (Redis Stack) que estende sua funcionalidade para busca, documentos e séries temporais sem introduzir novas dependências.

### Decisão

Redis 7 será o cache e armazenamento de sessão padrão do EventOS AI, executado em três modos distintos conforme o caso de uso:

- **Cache de leitura (Cache-Aside):** Armazenamento de respostas de consultas frequentes (dados de evento, perfil de participante, configurações de organização) com TTL variável de 5 a 60 minutos. Estratégia de invalidação por evento (cache eviction ao alterar a entidade subjacente), com fallthrough para banco em caso de miss.
- **Sessão de usuário:** Sessions armazenadas via Redis em vez de JWT stateless puro, permitindo revogação instantânea de sessões, controle de concorrência e armazenamento de metadados enriquecidos (permissões, organização ativa, preferências). TTL de 24h com renovação em cada requisição.
- **Rate Limiting:** Implementado com sorted sets (Sliding Window Log), buckets por IP, usuário, rota e organizaçao. Limites configuráveis por plano (gratuito: 100 req/min, enterprise: 10000 req/min).
- **Filas leves:** Redis Lists para filas de processamento não crítico (envio de e-mail transacional, notificações push) onde RabbitMQ seria overkill.
- **Sessão de check-in offline:** Cache temporário de credenciais de check-in em áreas com conectividade intermitente, sincronizado com PostgreSQL quando a conexão é restabelecida.

Configuração em produção: Amazon ElastiCache for Redis com cluster mode enabled, 3 shards com 2 réplicas cada, persistência AOF com fsync a cada segundo, backup automático diário com retenção de 7 dias.

### Consequências

**Positivas:**
- Latência de cache: consultas em cache são servidas em <5ms vs 20-50ms do PostgreSQL
- Redução de carga no banco primário: estimativa de 60% de cache hit ratio
- Revogação de sessão em tempo real: diferente de JWT stateless, não é necessário esperar expiração do token
- Estruturas de dados avançadas: sorted sets para filas prioritárias, hyperloglog para contagem de participantes únicos
- Redis Stack: RediSearch para cache search, RedisJSON para documentos, RedisTimeSeries para métricas em tempo real

**Negativas:**
- Consistência eventual: dados em cache podem estar defasados em relação ao banco primário
- Consumo de memória: datasets grandes exigem provisionamento cuidadoso e monitoramento de eviction rate
- Complexidade de invalidação: cache invalidation é um dos problemas mais difíceis em ciência da computação
- Ponto único de falha: sem cluster e replicação adequados, Redis derrubado pode derrubar o sistema
- Overhead operacional: tuning de maxmemory, políticas de eviction, lazy freeing e defrag necessitam expertise

### Compliance

1. Toda consulta que usa cache deve implementar fallthrough para o banco em caso de miss
2. TTL máximo de 60 minutos para cache de dados; sessões têm TTL máximo de 24 horas
3. Invalidação de cache deve ser explícita (cache eviction) sempre que a entidade subjacente for alterada
4. Métricas de cache hit ratio, eviction rate e memory usage são monitoradas no Grafana com alertas configurados
5. Dados sensíveis (PII, tokens) nunca devem ser armazenados em cache sem criptografia em nível de campo

---

## ADR-001.5: Qdrant para Armazenamento de Embeddings

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI utiliza embeddings vetoriais para múltiplas funcionalidades de IA: busca semântica em conteúdo de eventos (programação, palestras, materiais), recomendação de contatos e networking baseada em similaridade de perfil, matching de leads no CRM, clustering de participantes por interesse, e busca em documentos (contratos, relatórios, propostas). A escolha do banco vetorial é crítica para performance e escalabilidade dessas features.

Avaliamos três abordagens: pgvector como extensão do PostgreSQL existente, serviços gerenciados como Pinecone e Weaviate Cloud, e bancos vetoriais auto-hospedados como Qdrant e Milvus.

pgvector foi o candidato mais simples por eliminar uma dependência externa — rodar dentro do PostgreSQL já existente. No entanto, pgvector apresenta limitações: performance de busca em datasets acima de 1M vetores com HNSW é ~10x mais lenta que Qdrant, não suporta filtragem híbrida (vetorial + escalar) de forma eficiente, não oferece segmentação de índices por tenant (critical para multitenancy), e carece de funcionalidades avançadas como busca por payload, grouping e agregação de resultados. Para nossa escala esperada (>10M vetores, >100 tenants), pgvector se tornaria um gargalo.

Pinecone oferece excelente performance e simplicidade gerenciada, mas seu custo é alto para cargas de trabalho previsíveis (cobrança por pod, mesmo ocioso), e a falta de auto-hospedagem impede que clientes enterprise com requisitos de residência de dados possam rodar on-premise. Além disso, Pinecone não suporta filtragem geoespacial, que planejamos usar para recomendar networking por proximidade em eventos.

Weaviate oferece busca híbrida (vetorial + keyword) e schema flexível, mas sua arquitetura é orientada a objetos, o que adiciona overhead de serialização para dados que já estão normalizados no PostgreSQL. Milvus é extremamente performático, mas sua complexidade operacional (dependência de etcd, minIO, coordenadores, nós de query/index) é desproporcional para nosso estágio atual.

Qdrant foi escolhido por oferecer o melhor equilíbrio entre performance, simplicidade operacional e funcionalidades: implementação em Rust (baixa latência, alta segurança de memória), API REST + gRPC nativa, filtragem por payload com índices escalares, suporte a múltiplos tenants por collection, HNSW otimizado para busca aproximada, quantização para redução de memória, e modo auto-hospedado com Docker simples.

### Decisão

Qdrant será o banco vetorial principal do EventOS AI, com as seguintes diretrizes:

- **Hospedagem:** Auto-hospedado em Kubernetes (statefulset com volumes persistentes) para produção, Docker Compose para desenvolvimento. Como alternativa gerenciada, Qdrant Cloud será usado em ambientes onde não houver restrição de residência de dados.
- **Organização:** Uma collection por cliente (organizacao_id), com naming `embeddings_{org_id}`. Cada collection contém pontos com vector + payload (metadados: tipo de conteúdo, entidade relacionada, timestamp, permissões de acesso).
- **Modelos de embedding:** OpenAI `text-embedding-3-large` (1536 dimensões) para conteúdo textual geral, `text-embedding-3-small` para busca de alta taxa (chat, auto-complete), e modelos customizados fine-tuned no SageMaker para domínios específicos (jurídico, saúde).
- **Estratégia de indexação:** HNSW com ef_construct=200, M=32, quantization on-disk para redução de 80% no uso de memória para datasets grandes.
- **Pipeline de indexação:** Novos embeddings são gerados assincronamente via Kafka (tópico `ai.embeddings.ingest`) e processados pelo AI Service, que insere/atualiza no Qdrant.
- **Retenção:** Embeddings de conteúdo deletado são removidos dentro de 24h via job de limpeza noturno. Remoção física com rebuild de índice a cada 30 dias.

### Consequências

**Positivas:**
- Performance superior: busca em 10M vetores em ~10ms com HNSW otimizado
- Filtragem híbrida eficiente: busca vetorial combinada com filtros escalares (tipo de conteúdo, data, organização) sem degradação significativa
- Segmentação por tenant: isolamento completo de dados entre clientes na mesma instância
- Simplicidade operacional: single binary em Rust sem dependências externas
- API elegante: REST nativo com suporte a gRPC para alta throughput
- Quantização on-disk: datasets de 10M vetores cabem em 8GB RAM vs 40GB sem quantização

**Negativas:**
- Dependência adicional: mais um banco para gerenciar, fazer backup e monitorar
- Necessidade de sincronização: dados no PostgreSQL e Qdrant podem ficar inconsistentes se o pipeline de indexação falhar
- Treinamento de equipe: desenvolvedores precisam aprender conceitos de similaridade vetorial, HNSW, recall, precision
- Custo de infraestrutura: nós com GPU não são necessários, mas storage SSD rápido é recomendado
- Complexidade de embedding: escolha do modelo, dimensionalidade e técnica de chunking impactam diretamente a qualidade da busca

### Compliance

1. Todo embedding armazenado deve ter `organization_id` no payload para isolamento multitenancy
2. A pipeline de indexação deve ter fila de dead-letter no Kafka para tratamento de falhas
3. Jobs de limpeza de embeddings órfãos devem rodar diariamente e gerar relatório de consistência
4. Backup do Qdrant é feito via snapshot do volume persistente + dump via API de snapshot
5. Métricas de recall (precisão dos top-K resultados) são monitoradas continuamente para detectar degradação do índice

---

## ADR-001.6: API Gateway com Autenticação JWT

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI expõe APIs para múltiplos clientes: frontend web (Next.js), aplicativos mobile (Flutter), integrações de terceiros (parceiros, sistemas de bilheteria, plataformas de streaming) e dispositivos IoT (torniquetes, impressoras de credenciais). Cada categoria de cliente tem diferentes requisitos de autenticação, rate limiting, versionamento e transformação de protocolo.

Avaliamos três abordagens de segurança: sessões tradicionais (stateful com armazenamento server-side), JWT stateless puro, e OAuth 2.0 com tokens de acesso + refresh tokens. Cada uma tem trade-offs distintos.

Sessões tradicionais com cookies e armazenamento server-side (Redis) oferecem revogação imediata e simplicidade para o frontend, mas são problemáticas para integrações de terceiros (que não usam cookies), dispositivos IoT (que não mantêm estado de sessão), e escalabilidade horizontal (sessões precisam ser replicadas ou centralizadas). Além disso, sessões não são adequadas para microserviços porque cada requisição precisaria validar a sessão no Redis, adicionando latência e acoplamento.

OAuth 2.0 puro com Authorization Code + PKCE é o padrão moderno para autenticação delegada, mas sua complexidade é excessiva para usuários finais do EventOS que fazem login diretamente na plataforma (não via Google/Facebook). O fluxo de redirect, troca de código por token e gerenciamento de refresh tokens adiciona atrito desnecessário para o caso de uso principal. OAuth será usado exclusivamente para integrações de terceiros (API Partners).

JWT com assinatura RS256 ataca o problema central: tokens auto-contidos que carregam claims (user_id, organization_id, roles, permissions) e podem ser validados por qualquer serviço sem consultar um banco central. Isso elimina acoplamento ao serviço de identidade para validação de requisições e permite que microsserviços autorizem requisições localmente, reduzindo latência e pontos de falha.

### Decisão

Adotar API Gateway (Kong + custom BFF em NestJS) com autenticação JWT como padrão primário:

**Arquitetura de autenticação:**
- **Login:** Credenciais (email/senha ou SSO SAML/OIDC) autenticam no serviço Identity, que emite access token JWT (15 min) + refresh token (7 dias)
- **Access Token:** JWT assinado RS256 com claims: `sub` (user_id), `org` (organization_id), `roles` (array de roles), `permissions` (array de permissões calculadas), `jti` (token ID para blacklist)
- **Refresh Token:** Opaco, armazenado em Redis com hash de SHA256, vinculado a device fingerprint para detectar roubo de token
- **Validação:** API Gateway valida assinatura do JWT (JWKS endpoint do Identity Service), extrai claims e injeta headers `X-User-Id`, `X-Org-Id`, `X-Roles` para os microsserviços
- **Blacklist:** JWT revogados são mantidos em Redis até expirarem; revogação em massa possível por usuário ou organização
- **Integrações OAuth:** Fluxo Authorization Code + PKCE para parceiros, com escopos granulares (`events:read`, `tickets:write`, `checkin:admin`)

**API Gateway (Kong):**
- Rate limiting por IP, usuário e organização
- Transformação de protocolo (REST -> gRPC onde necessário)
- Caching de respostas para endpoints GET de alta frequência
- Circuit breaker para serviços degradados
- Logging estruturado de todas as requisições com correlation_id

### Consequências

**Positivas:**
- Autenticação desacoplada: microsserviços validam JWT localmente sem chamar o Identity Service
- Escalabilidade horizontal: qualquer instância de qualquer serviço pode validar tokens sem estado compartilhado
- Performance de validação: verificação de assinatura RS256 leva <1ms com cache de JWKS
- Integrações seguras: OAuth 2.0 para parceiros sem expor senhas de usuários
- Revogação granular: tokens específicos, todos os tokens de um usuário, ou todos os tokens de uma organização
- Gateway centraliza preocupações transversais: rate limiting, logging, CORS, transformação

**Negativas:**
- Tamanho do JWT: tokens com muitas claims podem exceder headers HTTP (limite de 8KB em alguns proxies)
- Dificuldade de revogação instantânea: JWT válido até expirar; blacklist no Redis mitiga mas adiciona latência
- Complexidade de rotação de chaves: RS256 exige gerenciamento de JWKS, rotação periódica e distribuição segura
- Gateway como bottleneck: Kong processa toda requisição, exigindo alta disponibilidade e escalabilidade
- Custo de latência: cada requisição passa por duas camadas de proxy (Kong + BFF) antes do microsserviço

### Compliance

1. Todo JWT deve ser assinado com RS256, nunca HS256 (que exige chave compartilhada)
2. Access tokens têm TTL máximo de 15 minutos; refresh tokens de 7 dias
3. O JWKS endpoint deve estar disponível em `/.well-known/jwks.json` para descoberta automática
4. Toda requisição ao gateway sem JWT válido é rejeitada com 401, exceto endpoints públicos (`/auth/login`, `/auth/register`, `/health`)
5. Blacklist de tokens é auditada: tentativas de uso de token revogado geram alerta de segurança

---

## ADR-001.7: Separação do AI Service em Python

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI incorpora inteligência artificial em múltiplos pontos da plataforma: geração de conteúdo (descrições de eventos, e-mails de marketing), chatbots para atendimento ao participante, recomendação de networking, análise de sentimento de feedbacks, transcrição e sumarização de palestras, matching de leads no CRM, e classificação automática de contatos.

A questão central era: implementar os serviços de IA no mesmo ecossistema Node.js dos microsserviços transacionais, ou criar um serviço separado em Python, introduzindo uma linguagem adicional (poliglota) na plataforma.

Node.js tem vantagens: equipe unificada, compartilhamento de tipos (TypeScript), infraestrutura homogênea (Docker, K8s, monitoramento), e eliminação de latência de comunicação entre serviços. No entanto, Node.js é significativamente inferior a Python em todo o ecossistema de IA/ML: PyTorch, TensorFlow, transformers (Hugging Face), LangChain, LlamaIndex, spaCy, NLTK, scikit-learn e a vasta maioria das bibliotecas de NLP, visão computacional e LLMs são Python-first ou Python-only. As tentativas de portar esses ecossistemas para Node.js (TensorFlow.js, ONNX Runtime Node) são limitadas em performance, cobertura de modelos e maturidade.

Python também oferece vantagens operacionais para AI: suporte nativo a GPU via CUDA, integração direta com SageMaker para deploy de modelos customizados, ecossistema maduro de vecto databases (clientes Qdrant, Pinecone, Weaviate nativos), e ferramentas de observabilidade de ML (MLflow, Weights & Biases, LangSmith). O custo da separação poliglota é mitigado pelo fato de que o AI Service opera como um microsserviço autônomo com API bem definida (gRPC + REST), comunicando-se com o resto da plataforma via Kafka e HTTP.

### Decisão

O AI Service será implementado em Python 3.12 com FastAPI, separado do monorepo Node.js em repositório próprio (ou submódulo), com as seguintes diretrizes:

- **Framework:** FastAPI com async/await, Pydantic v2 para validação, OpenAPI automático
- **Orquestração de LLMs:** LangChain + LangGraph para chains e agentes multi-etapa
- **Modelos:** Interface unificada via litellm (OpenAI, Anthropic, Claude, Mistral, Llama via SageMaker)
- **Embeddings:** OpenAI API + modelo customizado fine-tuned no SageMaker para domínios específicos
- **Comunicação:** gRPC para chamadas síncronas (chat, geração de conteúdo), Kafka para processamento assíncrono (indexação de embeddings, classificação em lote)
- **Cache de inferência:** Redis para cache de respostas de LLM (redução de custo e latência)
- **GPU:** Nós com GPU no EKS (instâncias g5.xlarge) para inferência de modelos locais, com escalabilidade automática baseada em métricas de fila de inferência
- **Observabilidade:** MLflow para tracking de experimentos, LangSmith para tracing de chains, Prometheus para métricas de inferência (latência p50/p95/p99, tokens/s, cache hit ratio)

O AI Service expõe dois tipos de endpoint:
1. **Síncronos (gRPC):** Chat, geração de conteúdo, recomendação em tempo real — latência esperada <2s
2. **Assíncronos (Kafka):** Indexação de embeddings, classificação em lote, análise de sentimento — processamento em background

### Consequências

**Positivas:**
- Ecossistema Python completo: PyTorch, transformers, LangChain, spaCy, scikit-learn disponíveis sem limitações
- Performance de inferência: suporte nativo a CUDA e otimizações específicas de GPU
- Independência de deploy: AI Service pode escalar e ter ciclos de release independentes dos serviços transacionais
- Time especializado: profissionais de ML podem trabalhar com as ferramentas do seu ecossistema nativo
- Custos otimizados: nós GPU são provisionados apenas para o AI Service, não para toda a plataforma

**Negativas:**
- Poliglotismo: equipe precisa de desenvolvedores Python + Node.js, aumentando custo de contratação
- Duplicação de infraestrutura: pipelines de CI/CD, Dockerfiles, monit sampling e alertas para duas stacks
- Latência entre serviços: chamadas gRPC entre Node.js e Python adicionam ~2-5ms de overhead
- Context switching: desenvolvedores que transitam entre serviços precisam trocar de contexto mental e ferramentas
- Tipos compartilhados: schemas de dados precisam ser definidos em Proto (gRPC) e gerados para ambas as linguagens

### Compliance

1. Toda comunicação entre AI Service e o resto da plataforma é via gRPC (síncrono) ou Kafka (assíncrono), nunca via banco compartilhado
2. Schemas de dados entre serviços são definidos em arquivos .proto, com geração de código para Python e TypeScript
3. O AI Service não pode acessar diretamente o PostgreSQL; dados são passados via request ou eventos
4. Modelos de ML são versionados no MLflow e referenciados por tag nos deploys do AI Service
5. Métricas de drift de modelo (data drift, concept drift) são monitoradas e disparam alertas para retreinamento

---

## ADR-001.8: Frontend Next.js com SSR

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI atende a múltiplos perfis de usuário: organizadores de eventos (dashboard complexo com gráficos e tabelas), participantes (páginas de evento, check-in, networking), administradores (configuração de plataforma, billing) e visitantes públicos (landing pages, busca de eventos). Cada perfil tem diferentes exigências de performance, SEO e interatividade.

Avaliamos três abordagens de frontend: SPA puro (React + Vite), Next.js com SSR/SSG, e Remix.run. A escolha impacta diretamente a experiência do usuário, SEO, performance de carregamento e complexidade de desenvolvimento.

SPA puro (React + Vite) oferece a experiência mais rica para dashboards interativos, com transições suaves e estado mantido no cliente. No entanto, SPAs têm problemas crônicos de SEO (conteúdo não indexável por crawlers que não executam JavaScript), performance de First Contentful Paint (FCP) prejudicada em dispositivos móveis e redes lentas, e waterfall de requisições (fetch data -> render -> fetch more data) que degrada a experiência percebida. Para landing pages públicas e páginas de evento (que precisam ser indexadas no Google), SPA puro é inadequado.

Remix.run oferece abordagem inovadora com nested routes, data loading no servidor e mutations otimistas, mas seu ecossistema de componentes e integrações é significativamente menor que Next.js. A adoção de Remix implicaria em dificuldade de contratação (menos desenvolvedores experientes), menos bibliotecas compatíveis, e integração mais complexa com ferramentas de análise (Google Analytics, Hotjar, Segment).

Next.js 14+ com App Router oferece o melhor equilíbrio: SSR para páginas públicas (SEO, performance de carregamento), CSR/ISR para dashboards interativos, Server Components para reduzir JavaScript no cliente (melhor performance em dispositivos móveis), streaming de UI com Suspense para feedback instantâneo durante carregamento de dados, e Image Optimization nativa para otimização de assets. O ecossistema maduro (Vercel, Tailwind CSS, shadcn/ui, React Query, NextAuth.js) acelera o desenvolvimento.

### Decisão

Next.js 14+ com App Router será o framework frontend do EventOS AI, combinando SSR, ISR e CSR conforme o caso de uso:

**Estratégia de renderização por rota:**

| Rota | Estratégia | Motivo |
|------|-----------|--------|
| `/` (home) | SSG + ISR (revalidate: 300s) | SEO máximo, conteúdo público |
| `/events/[slug]` | SSR + caching CDN | SEO, dados dinâmicos por evento |
| `/dashboard/*` | CSR com loading states | Interatividade máxima, autenticado |
| `/checkin/*` | CSR com Service Worker | Performance offline, PWA |
| `/admin/*` | CSR | Dashboard complexo, autenticado |
| `/login`, `/register` | SSR | Redirecionamentos condicionais |

**Stack frontend:**
- **UI:** Tailwind CSS + shadcn/ui (componentes acessíveis, customizáveis via CSS variables)
- **Estado:** TanStack React Query (server state), Zustand (client state leve)
- **Formulários:** React Hook Form + Zod (validação compartilhada com backend)
- **Autenticação:** NextAuth.js com adaptador Prisma + JWT (integrado ao Identity Service)
- **GraphQL:** Urql para consultas GraphQL aos microsserviços (subscription em tempo real via WebSocket)
- **PWA:** Service Worker com Workbox para funcionalidade offline no check-in
- **Testes:** Playwright para E2E, Testing Library + Vitest para unitários

### Consequências

**Positivas:**
- SEO excelente: SSR e SSG garantem indexação completa por crawlers
- Performance superior: Server Components reduzem JavaScript no cliente, melhorando FCP e TTI
- ISR balancea frescor de dados com performance de cache
- Streaming de UI: Suspense boundaries permitem carregamento progressivo de partes da página
- Ecossistema rico: shadcn/ui, Vercel Analytics, NextAuth.js, React Query
- PWA offline: check-in funciona sem conectividade, sincronizando quando online

**Negativas:**
- Complexidade de SSR: Server Components têm regras específicas (não podem usar hooks, event handlers)
- Custo de servidor: SSR exige servidores Node.js (ou Vercel Edge) para renderização, não é static hosting
- TTFB mais alto: SSR aumenta Time to First Byte comparado a SPA estático (pagamento pela renderização no servidor)
- Caching de CDN: ISR com revalidate pode servir dados obsoletos se não configurado corretamente
- Bundle JavaScript: mesmo com Server Components, dashboards complexos podem ter bundles grandes

### Compliance

1. Páginas públicas devem usar SSR ou SSG; páginas autenticadas podem usar CSR
2. Todo componente que acessa banco de dados ou serviços externos deve ser Server Component
3. Loading states (Suspense) são obrigatórios para todas as seções que carregam dados assincronamente
4. Imagens devem usar o componente `next/image` com lazy loading e dimensões explícitas
5. Testes E2E no Playwright cobrem as 10 rotas principais; testes de regressão visual Chromatic

---

## ADR-001.9: Containerização com Docker Compose + Kubernetes

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI precisa de um ambiente de execução consistente entre desenvolvimento, staging e produção, com isolamento de dependências, escalabilidade elástica e portabilidade entre clouds. Avaliamos três abordagens de infraestrutura: Docker Compose para tudo (incluindo produção), Kubernetes (EKS) como plataforma principal, e ECS Fargate como alternativa serverless a K8s.

Docker Compose é excelente para desenvolvimento local: define toda a stack (serviços, bancos, filas) em um único arquivo YAML, com rebuild rápido e volumes para persistência. No entanto, Docker Compose não oferece orquestração real: não há escalabilidade automática, self-healing, service discovery avançado, rolling updates, ou gerenciamento de secrets. Usar Docker Compose em produção seria inadequado para um sistema com requisitos de disponibilidade 24/7 e escalabilidade elástica.

ECS Fargate foi considerado por eliminar o gerenciamento de nós (serverless containers), reduzindo overhead operacional. No entanto, Fargate tem limitações significativas: falta de suporte a GPU (inviável para AI Service), cold start mais lento que pods do K8s, limitação de 10GB de armazenamento efêmero por tarefa, integração limitada com service mesh (Istio), e custo mais alto para cargas de trabalho previsíveis com uso intensivo de CPU/memória. Para um sistema que planeja rodar 20+ microsserviços com cargas de GPU, Fargate não é adequado.

Kubernetes (Amazon EKS) foi escolhido por fornecer a plataforma de orquestração mais madura e flexível: escalabilidade automática (HPA + Cluster Autoscaler + Karpenter), self-healing (reinício automático de pods com falha), rolling updates com health checks, service mesh (Istio para mTLS, traffic splitting, observabilidade), suporte nativo a GPU (NVIDIA device plugin), suporte a StatefulSets para bancos, e portabilidade entre clouds e on-premise. O EKS abstrai o plano de controle (master nodes gerenciados pela AWS), reduzindo a carga operacional.

### Decisão

Adotar Docker Compose para desenvolvimento local e Kubernetes (Amazon EKS) para staging e produção:

**Desenvolvimento local (Docker Compose):**
- `docker-compose.yml` define todos os serviços Node.js, o AI Service Python, PostgreSQL, Redis, Kafka (KRaft), Qdrant e RabbitMQ
- Hot reload para todos os serviços (Nodemon para Node.js, Uvicorn --reload para Python)
- Volumes para persistência de dados entre execuções
- Perfil `--profile monitoring` para iniciar Prometheus + Grafana + Loki stack opcional

**Produção (Amazon EKS):**
- Cluster EKS 1.29 com nós gerenciados em 3 AZs
- Node groups separados por workload: `system` (2x m6i.large para sistema), `services` (3x m6i.xlarge para microsserviços), `ai` (2x g5.xlarge com GPU para AI Service), `data` (3x r6i.large para bancos statefulset)
- Karpenter para escalabilidade automática: provisionamento de nós sob demanda em segundos
- Istio como service mesh: mTLS entre todos os pods, traffic mirroring para canary deployments, tracing distribuído
- External Secrets Operator para gerenciamento de secrets via AWS Secrets Manager
- cert-manager + Let's Encrypt para certificados TLS automáticos
- ArgoCD para GitOps: estado desejado no Git, sincronização automática com o cluster
- HPA baseado em CPU, memória e métricas customizadas (Kafka consumer lag, fila de inferência)

### Consequências

**Positivas:**
- Consistência: mesmo ambiente de desenvolvimento ao produção (containers)
- Escalabilidade elástica: Karpenter + HPA ajustam capacidade automaticamente
- Resiliência: self-healing, rolling updates, multi-AZ, pod disruption budgets
- Portabilidade: mesma stack pode rodar em EKS, GKE, AKS ou on-premise
- GPU: suporte nativo a nós com GPU para AI Service
- GitOps: ArgoCD garante que o cluster reflita exatamente o estado definido no Git

**Negativas:**
- Complexidade operacional: K8s é notoriamente complexo de operar (RBAC, network policies, resource quotas, etc.)
- Custo fixo: EKS tem custo por cluster ($0.10/hora) + nós gerenciados + add-ons (Istio, ALB Ingress Controller)
- Overhead de recursos: K8s components (kubelet, kube-proxy, Istio sidecars) consomem recursos significativos
- Debugging distribuído: problemas em malha de serviço (sidecar, mTLS) são difíceis de diagnosticar
- Aprendizado íngreme: equipe precisa de conhecimento em K8s, Helm, Istio, ArgoCD

### Compliance

1. Todo serviço deve ter Dockerfile multi-stage e health check (liveness + readiness)
2. Configurações específicas de ambiente são injetadas via ConfigMaps e Secrets, nunca no Dockerfile
3. Limites de recursos (requests/limits) são obrigatórios para todos os containers
4. Pods não podem rodar como root; security contexts e seccomp profiles são obrigatórios
5. Todo deploy deve ser feito via ArgoCD (GitOps), nunca via kubectl apply manual

---

## ADR-001.10: White-Label Multitenancy com RLS

**Status:** Accepted  
**Data:** 2026-07-01

### Contexto

O EventOS AI é uma plataforma white-label: cada cliente (organizador de eventos, rede de eventos, franquia) deve ter sua própria identidade visual, domínio personalizado (evento.cliente.com.br), isolamento completo de dados e capacidade de personalização de funcionalidades. O modelo de negócio inclui desde pequenos organizadores (evento único, centenas de participantes) até redes enterprise (centenas de eventos simultâneos, milhões de participantes).

Avaliamos três abordagens de multitenancy: database-per-tenant, schema-per-tenant, e row-level security (RLS) com tenant ID em todas as tabelas.

Database-per-tenant oferece o isolamento mais forte (um banco PostgreSQL inteiro por cliente), backup e restore independentes, e possibilidade de migrações específicas por cliente. No entanto, essa abordagem não escala para centenas de tenants: gerenciar centenas de bancos, pool de conexões e migrações paralelas se torna inviável operacionalmente. Além disso, consultas cross-tenant (relatórios consolidados da plataforma, buscas globais) exigem queries federadas complexas.

Schema-per-tenant (um schema PostgreSQL por cliente, compartilhando o mesmo banco) oferece isolamento intermediário com gerenciamento mais simples que database-per-tenant. Porém, requer migrações N+1 (cada novo tenant exige criação de schema e aplicação de migrações), e o número máximo de schemas no PostgreSQL é limitado (cerca de 10 mil antes de degradação de performance). Para nossa projeção de crescimento, isso seria um limitador.

Row-level security (RLS) com coluna `organization_id` em todas as tabelas foi escolhida por oferecer a melhor relação isolamento/simplicidade: um único banco, um único schema, políticas RLS que automaticamente filtram dados pelo tenant do usuário logado. O PostgreSQL aplica RLS no nível do banco (não da aplicação), garantindo que mesmo queries acidentais ou maliciosas não vazem dados entre tenants. A política RLS é ativada automaticamente para o `current_setting('app.current_organization_id')` configurado na sessão.

### Decisão

Adotar multitenancy com Row-Level Security do PostgreSQL + coluna `organization_id` em todas as tabelas multi-tenant:

**Estratégia:**
- Tabelas são classificadas como `multi-tenant` (possuem `organization_id`) ou `global` (apenas plataforma, sem tenant)
- RLS é habilitado em todas as tabelas multi-tenant com política `organization_id = current_setting('app.current_organization_id')::uuid`
- A aplicação (Prisma) configura a variável de sessão `app.current_organization_id` no início de cada requisição, após autenticação JWT
- Usuários podem pertencer a múltiplas organizações (troca de contexto via frontend)

**White-label:**
- Domínios personalizados: cada tenant tem CNAME apontando para o load balancer, com TLS automático (cert-manager + Let's Encrypt)
- Tema: CSS variables customizadas por organização (cores primárias, fontes, logos) armazenadas como JSONB na tabela `organizations.theme`
- Features: flag `features` (JSONB) por organização habilita/desabilita funcionalidades (check-in por QR code, NFC, RFID, BI, marketplace)
- Workers: tabela `organization_workers` para serviços terceiros autorizados (produtores, bilheterias parceiras)

**Isolamento de dados:**
- Backup: backup full do banco com PITR, restore é all-tenant
- Deletar um tenant: soft-delete (updated_at + deleted_at) + job assíncrono para anonimizar dados pessoais após 90 dias
- Performance: índices parciais por `organization_id` para consultas frequentes; particionamento por `organization_id` para tabelas de alta volumetria

### Consequências

**Positivas:**
- Simplicidade operacional: um banco, um schema, migrações únicas
- Consultas cross-tenant: relatórios consolidados da plataforma são queries SQL normais (com filtro de organização)
- Performance: índices por tenant evitam scans em dados de outras organizações
- Migrações simples: alterações de schema são aplicadas uma vez para todos os tenants
- Custo: um banco PostgreSQL de alta capacidade é mais econômico que N bancos pequenos
- RLS como segurança em profundidade: mesmo que a aplicação tenha um bug e não filtre por tenant, o banco rejeita

**Negativas:**
- Isolamento incompleto: um bug no RLS (política incorreta) pode expor dados de todos os tenants
- Resource contention: um tenant com consultas pesadas pode degradar a performance de todos
- Restore complexo: não é possível fazer restore de um único tenant sem ferramentas especializadas
- Tamanho do banco: com centenas de tenants, o banco pode chegar a terabytes, exigindo particionamento e sharding
- Migrações perigosas: uma migração que locka a tabela afeta todos os tenants simultaneamente

### Compliance

1. Toda tabela com dados de usuário/cliente deve ter `organization_id` e RLS habilitado
2. Tabelas de sistema (auditoria, configuração global) não têm RLS e são identificadas no schema
3. A política RLS deve ser testada com testes de integração que validam isolamento entre tenants
4. A variável `app.current_organization_id` é configurada no middleware da aplicação e nunca aceita do cliente (injeção)
5. Logs de auditoria incluem `organization_id` para rastreamento de acesso a dados

---

## ADR-001.11: CQRS e Event Sourcing como Padrão de Dados

**Status:** Proposed  
**Data:** 2026-07-16

### Contexto

Os domínios do EventOS AI, especialmente emissão de ingressos, check-in e gestão financeira, exigem trilha de auditoria completa, capacidade de reconstrução de estado histórico e suporte a cenários de disputa (ex: participante alega ter comprado ingresso mas sistema não mostra). Modelos CRUD tradicionais (update in-place) perdem o histórico de alterações e não permitem auditoria temporal.

CQRS (Command Query Responsibility Segregation) separa operações de escrita (commands) de leitura (queries), permitindo modelos otimizados para cada carga de trabalho. Event Sourcing armazena o estado como sequência imutável de eventos, onde o estado atual é derivado (fold) dos eventos. A combinação de ambos permite auditoria completa, reconstrução de estado em qualquer ponto no tempo, e sincronização de modelos de leitura otimizados.

No entanto, CQRS + Event Sourcing adiciona complexidade significativa: consistência eventual entre modelos de escrita e leitura, necessidade de projeções para materializar views de leitura, complexidade de sagas para transações distribuídas entre agregados, e overhead operacional de manter o store de eventos.

Para domínios onde auditoria não é crítica (ex: cache de dados de evento para exibição pública, dados de CRM auxiliares), o CRUD tradicional continua sendo a abordagem correta por sua simplicidade e consistência imediata.

### Decisão

Adotar CQRS + Event Sourcing APENAS para os bounded contexts que exigem auditoria e reconstrução de estado:

**Obrigatório (Event Sourcing + CQRS):**
- Emissão de ingressos (cada alteração de ingresso é um evento)
- Check-in (registro imutável de entrada/saída)
- Transações financeiras (pagamentos, reembolsos, chargebacks)
- Gestão de participantes (criação, atualização de perfil, consentimento)
- Autenticação (tentativas de login, alteração de senha, MFA)

**CRUD tradicional (sem Event Sourcing):**
- Conteúdo de evento (programação, palestrantes) — versão atual é suficiente
- Configurações de organização — overwrite é aceitável
- Cache e dados derivados — eventual consistency é adequada
- Logs e métricas — já são imutáveis por natureza

**Store de eventos:**
- Kafka como event store primário (log imutável, retenção infinita com compactação)
- PostgreSQL como store de projeções (materialized views para queries)
- Event Store (sistema externo) não será adotado para evitar mais uma dependência; Kafka + PostgreSQL cobre os requisitos

### Consequências

**Positivas:**
- Auditoria completa: todo evento de negócio é imutável e temporal
- Reconstrução de estado: possível recriar o estado do sistema em qualquer data
- Debugging: replay de eventos permite reproduzir bugs em ambiente de staging
- Modelos otimizados: leitura em PostgreSQL modelado para queries, escrita em Kafka modelado para append
- Sagas distribuídas: coordenação entre agregados via Kafka com garantia de entrega

**Negativas:**
- Consistência eventual: dados de leitura podem estar defasados em relação à escrita (segundos)
- Complexidade de projeções: manter materialized views atualizadas com o stream de eventos é trabalho contínuo
- Overhead cognitivo: desenvolvedores precisam pensar em eventos de domínio, não em CRUD
- Migrações de schema de eventos: eventos evoluem, exigindo versionamento e compatibilidade (upcasting)
- Storage: Kafka com retenção infinita para milhões de eventos por dia requer planejamento de capacidade

### Compliance

1. Apenas bounded contexts listados acima podem usar Event Sourcing; novos domínios precisam de ADR aprovando
2. Eventos de domínio são imutáveis: uma vez publicados no Kafka, nunca podem ser alterados ou deletados
3. Todo evento deve carregar metadados: `event_id`, `event_type`, `event_version`, `aggregate_id`, `timestamp`, `correlation_id`, `causation_id`, `organization_id`
4. Projeções são eventualmente consistentes e devem ser tolerantes a latência de até 5 segundos
5. Testes de replay devem ser executados semanalmente para validar que projeções estão corretas

---

## ADR-001.12: OpenTelemetry para Observabilidade Distribuída

**Status:** Accepted  
**Data:** 2026-07-16

### Contexto

Com mais de 10 microsserviços Node.js, um AI Service Python, filas Kafka, caches Redis e bancos PostgreSQL, o EventOS AI precisa de observabilidade distribuída para diagnosticar problemas de performance, rastrear requisições entre serviços e monitorar a saúde do sistema. Abordagens tradicionais (logs centralizados + métricas isoladas) são insuficientes para arquiteturas distribuídas.

Avaliamos três abordagens de observabilidade: stacks proprietárias (Datadog, New Relic), stack open-source auto-hospedada (Prometheus + Grafana + Jaeger), e OpenTelemetry como padrão de instrumentação com backend agnóstico.

Soluções proprietárias como Datadog oferecem integração imediata, dashboards prontos e suporte comercial, mas o custo é proibitivo para nossa escala esperada (Datadog cobra por host e por volume de logs, podendo chegar a dezenas de milhares de dólares mensais com 50+ hosts). Além disso, criar dependência de vendor lock-in vai contra o princípio de portabilidade da plataforma.

Stack open-source tradicional (Prometheus + Grafana + Jaeger) é poderosa e gratuita, mas a instrumentação manual em cada biblioteca e framework é trabalhosa e propensa a inconsistências. Cada linguagem (Node.js, Python) teria implementações diferentes de tracing, métricas e logging, dificultando a correlação entre sinais.

OpenTelemetry (OTel) resolve o problema ao fornecer um padrão único de instrumentação que gera traces, métricas e logs de forma consistente em qualquer linguagem. A instrumentação é feita uma vez (via SDKs automáticos e manuais) e os dados podem ser exportados para qualquer backend (Prometheus, Jaeger, Loki, Grafana, ou posteriormente Datadog/Honeycomb sem re-instrumentação). O OTel é suportado nativamente pelo NestJS (módulo `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-express`, `@opentelemetry/instrumentation-grpc`), Python (auto-instrumentação), Kafka (instrumentação de producers/consumers), e Prisma (instrumentação de queries).

### Decisão

Adotar OpenTelemetry como padrão universal de observabilidade, com backend auto-hospedado (Prometheus + Grafana + Tempo + Loki):

**Instrumentação obrigatória em todos os serviços:**
- Tracing distribuído: toda requisição HTTP, chamada gRPC, mensagem Kafka e query Prisma é traçada com `trace_id` propagado via headers (W3C Trace Context)
- Métricas: latência (p50/p95/p99), taxa de erro, throughput, saturation (Kafka consumer lag, conexões de banco, fila de inferência)
- Logs estruturados: JSON com `trace_id`, `span_id`, `service.name`, `severity`, `message` e campos contextuals

**Backend:**
- Tempo: armazenamento de traces (substitui Jaeger, integração nativa com Grafana)
- Loki: agregação de logs com labels por serviço, namespace, pod
- Prometheus: scraping de métricas a cada 15s, com alertas via Alertmanager
- Grafana: dashboards unificados (traces, logs, métricas) com correlação entre sinais (ex: clique no trace e veja logs + métricas do mesmo período)

**Instrumentação automática:**
- NestJS: `@opentelemetry/instrumentation-express`, `@opentelemetry/instrumentation-http`
- Prisma: Prisma Middleware para tracing de queries (incluindo duração, número de linhas)
- Kafka: `@opentelemetry/instrumentation-kafkajs` para tracing de producers e consumers
- Redis: `@opentelemetry/instrumentation-redis` (ou redis-4)
- Python FastAPI: OpenTelemetry SDK com auto-instrumentação (opentelemetry-distro)

### Consequências

**Positivas:**
- Visibilidade ponta-a-ponta: trace de uma requisição que passa por API Gateway -> BFF -> microsserviço -> Kafka -> AI Service -> Qdrant -> PostgreSQL
- Correlação de sinais: metrics, logs e traces no mesmo dashboard, com link direto entre eles
- Agnóstico de backend: podemos trocar de Datadog para Grafana Cloud sem re-instrumentar
- Padronizado: Community-driven, CNCF incubating, adotado por Google (Cloud Trace), AWS (X-Ray), Microsoft (Azure Monitor)
- Performance: SDKs com sampling rate configurável (head-based, tail-based) para controle de custo

**Negativas:**
- Complexidade inicial: configurar OTel em cada serviço, cada banco e cada fila é trabalho significativo
- Custo de armazenamento: traces de alta cardinalidade podem gerar volumes enormes de dados (sampling é obrigatório)
- Overhead de performance: instrumentação adiciona ~5-10% de overhead em requisições (aceitável para nosso cenário)
- Maturidade variável: SDKs para Node.js e Python são maduros, mas instrumentações específicas (Prisma, KafkaJS) podem ter bugs
- Debugging complexo: quando OTel falha (não propaga trace_id, perde spans), o diagnóstico é difícil

### Compliance

1. Todo serviço deve exportar traces, métricas e logs estruturados via OpenTelemetry SDK antes de ir para produção
2. Sampling rate default é 100% em desenvolvimento/staging e 10% em produção (head-based); traces de erro são sempre capturados (tail-based sampling com regra `status_code=ERROR`)
3. O `trace_id` deve ser propagado em todos os headers HTTP, mensagens Kafka e logs
4. Dashboards no Grafana são criados por domínio e por serviço, com correlação entre sinais
5. Alertas no Alertmanager são configurados para latência p99 > 1s, taxa de erro > 1%, e Kafka consumer lag > 1000

---

## Apêndice A: Matriz de Impacto entre Decisões

| Decisão | Impacta | É impactada por |
|---------|---------|-----------------|
| Monorepo + Microsserviços | Containerização, CI/CD, Observabilidade | Todas as decisões |
| PostgreSQL | Multitenancy, CQRS/ES | Monorepo |
| Kafka | CQRS/ES, Observabilidade, AI Service | Monorepo |
| Redis | API Gateway, Cache | Monorepo |
| Qdrant | AI Service | PostgreSQL, Infra |
| API Gateway + JWT | Frontend, Segurança | Monorepo, Redis |
| AI Service Python | Qdrant, Kafka, Containerização | Monorepo |
| Next.js SSR | API Gateway, Observabilidade | Monorepo |
| Docker + K8s | Todas as decisões | Monorepo |
| White-label RLS | PostgreSQL, API Gateway | Monorepo |

## Apêndice B: Glossário de Termos

| Termo | Definição |
|-------|-----------|
| Bounded Context | Delimitação de domínio do DDD com modelo e linguagem ubíqua próprios |
| CQRS | Command Query Responsibility Segregation — separação entre modelos de escrita e leitura |
| Event Sourcing | Armazenamento de estado como sequência imutável de eventos |
| HNSW | Hierarchical Navigable Small World — algoritmo de índice para busca aproximada de vizinhos |
| RLS | Row-Level Security — política de segurança do PostgreSQL que filtra linhas por sessão |
| Saga | Padrão para coordenar transações distribuídas com compensação em caso de falha |
| SLO | Service Level Objective — meta de desempenho/confiabilidade de um serviço |
| Tenancy | Modelo de isolamento de dados entre clientes de uma plataforma multi-tenant |
