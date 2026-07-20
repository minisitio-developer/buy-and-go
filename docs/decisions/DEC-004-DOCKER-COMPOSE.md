# DEC-004: Docker Compose para Desenvolvimento Local

| Versão | Data       | Autor        | Descrição                    |
|--------|------------|--------------|------------------------------|
| 1.0    | 2026-01-10 | Tech Lead    | Ambiente de desenvolvimento  |

---

## Status

Aprovado em 10/01/2026.

## Contexto

O projeto Eventos AI é composto por múltiplos microsserviços que dependem
de serviços externos: PostgreSQL, Redis, RabbitMQ/Kafka, S3 (MinIO) e
Stripe (mock). Para garantir que todos os desenvolvedores tenham um
ambiente consistente e reproduzível, é necessário definir uma estratégia
de ambiente de desenvolvimento local.

Requisitos avaliados:
- Facilidade de setup para novos desenvolvedores
- Paridade com ambiente de produção (tanto quanto possível)
- Hot reload para desenvolvimento ágil
- Baixo consumo de recursos da máquina local
- Suporte a debug e breakpoints
- Orquestração de múltiplos containers

## Alternativas Consideradas

### Tilt

**Prós:**
- Experiência de desenvolvimento superior com hot reload inteligente
- Interface web com visualização do estado dos serviços
- Resource view com logs centralizados
- Suporte a builds incrementais e caching avançado
- Integração nativa com Kubernetes

**Contras:**
- Curva de aprendizado alta (Tiltfile em Starlark/Python)
- Overhead para projetos pequenos/médios
- Consumo de memória elevado (~1-2GB para o Tilt process)
- Dependência de Docker Desktop (ou Rancher Desktop)
- Documentação densa e exemplos focados em Kubernetes

### Skaffold

**Prós:**
- Desenvolvido pelo Google, integração forte com GKE
- Pipeline de build, push e deploy automatizado
- Suporte a múltiplas ferramentas de build (Docker, Jib, Buildpacks)
- File watching e sync inteligente

**Contras:**
- Foco principal em Kubernetes — complexo para dev local simples
- Configuração verbosa (skaffold.yaml)
- Debug remoto complicado em ambientes Kubernetes
- Não adequado para equipes que não usam K8s em dev
- Performance fraca em Windows (integração com filesystem)

### Minikube

**Prós:**
- Kubernetes real rodando localmente
- Paridade total com produção (se produção for K8s)
- Ecossistema de addons (dashboard, metrics, ingress)

**Contras:**
- Extremamente pesado para desenvolvimento local (~4GB RAM mínimo)
- Hot reload difícil de configurar (precisa de Skaffold ou Tilt)
- Complexidade desnecessária se produção não usa K8s
- Curva de aprendizado alta para desenvolvedores juniores
- Debug de microsserviços envolve port-forward e redirecionamento

### Desenvolvimento Local sem Containers

**Prós:**
- Simplicidade — instalar PostgreSQL, Redis, etc diretamente
- Sem overhead de virtualização
- Debug mais simples (processos nativos)

**Contras:**
- Inconsistência entre máquinas (versões diferentes de dependências)
- Poluição do sistema operacional (serviços instalados globalmente)
- Dificuldade de reproduzir bugs específicos de ambiente
- Onboarding lento (cada desenvolvedor instala manualmente)
- Impossibilidade de simular arquitetura de microsserviços

## Decisão

**Docker Compose (v2.27+) será a ferramenta padrão para desenvolvimento local.**

### Justificativa

1. **Simplicidade:** Um único arquivo `docker-compose.yml` define todos
   os serviços. Setup inicial é `docker compose up`.

2. **Paridade com produção:** Os mesmos serviços (PostgreSQL, Redis,
   RabbitMQ) rodam em containers, garantindo consistência.

3. **Baixo consumo:** Para desenvolvimento local, apenas os serviços
   de infraestrutura sobem em containers. Os microsserviços em Node.js
   rodam fora do container para maximizar hot reload.

4. **Onboarding rápido:** Novo desenvolvedor clona o repositório, instala
   Docker Desktop, roda `make setup` e está pronto.

5. **Ecossistema maduro:** Docker Compose é amplamente conhecido,
   documentado e suportado em todas as plataformas.

### Docker Compose File

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: eventosai-postgres
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: eventosai
      POSTGRES_PASSWORD: eventosai_dev
      POSTGRES_DB: eventosai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U eventosai']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: eventosai-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: eventosai-rabbitmq
    ports:
      - '5672:5672'
      - '15672:15672'
    environment:
      RABBITMQ_DEFAULT_USER: eventosai
      RABBITMQ_DEFAULT_PASS: eventosai_dev
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ['CMD', 'rabbitmq-diagnostics', 'check_port_connectivity']
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: eventosai-minio
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      MINIO_ROOT_USER: eventosai
      MINIO_ROOT_PASSWORD: eventosai_dev
    volumes:
      - minio_data:/data
    command: server /data --console-address ':9001'
    healthcheck:
      test: ['CMD', 'mc', 'ready', 'local']
      interval: 5s
      timeout: 5s
      retries: 5

  stripe-mock:
    image: stripemock/stripe-mock:latest
    container_name: eventosai-stripe-mock
    ports:
      - '12111:12111'
      - '12112:12112'

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  minio_data:
```

## Hot Reload Strategy

### Abordagem Híbrida

Os microsserviços Node.js (Auth, Core, Payments, Notifications, Dashboard)
rodam **fora do Docker** durante o desenvolvimento. Isso garante:

1. **Hot reload instantâneo:** NestJS com `--watch` + Webpack HMR recarrega
   em < 1 segundo (vs ~5-10 segundos dentro do container).

2. **Debug nativo:** Breakpoints no VSCode/WebStorm funcionam sem
   configuração de remote debug.

3. **Performance:** Sem overhead de volume mounts ou bind mounts para
   sincronizar arquivos (lento no Windows/Mac).

4. **Logs locais:** Saída do console diretamente no terminal do
   desenvolvedor, sem precisar de `docker logs`.

### Processo de Desenvolvimento

```
Terminal 1: docker compose up postgres redis rabbitmq minio stripe-mock
Terminal 2: cd services/auth && npm run start:dev
Terminal 3: cd services/core && npm run start:dev
Terminal 4: cd services/payments && npm run start:dev
(make dev sobe tudo via concurrently)
```

## Volume Mounts (para serviços dentro do Docker)

Quando eventualmente um microsserviço precisa rodar dentro do container
(para replicar bug específico ou testar comportamento em produção),
os volumes são configurados:

```yaml
services:
  auth-service:
    build:
      context: ./services/auth
      dockerfile: Dockerfile.dev
    ports:
      - '3001:3001'
    volumes:
      - ./services/auth/src:/app/src:ro       # Código fonte (read-only)
      - /app/node_modules                       # Evita sobrescrever node_modules
      - ./services/auth/package.json:/app/package.json
      - ./services/auth/tsconfig.json:/app/tsconfig.json
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://eventosai:eventosai_dev@postgres:5432/eventosai
    depends_on:
      postgres:
        condition: service_healthy
```

### Otimizações para Volume Mounts

- **Bind mounts read-only:** Código fonte montado como `:ro` para evitar
  alterações acidentais dentro do container
- **node_modules isolado:** Volume anônimo para `node_modules` — não é
  sobrescrito pelo bind mount
- **Watchman/Chokidar:** Configurado para detectar mudanças de arquivos
  no Windows (que não tem inotify nativo)
- **Exclusões:** `.git`, `node_modules`, `dist`, `.next` excluídos do watch

## Serviços de Infraestrutura

| Serviço       | Portas        | Finalidade                     | Alternativa Produção |
|---------------|---------------|--------------------------------|----------------------|
| PostgreSQL    | 5432          | Banco de dados principal       | RDS PostgreSQL       |
| Redis         | 6379          | Cache, sessão, filas           | ElastiCache Redis    |
| RabbitMQ      | 5672 / 15672  | Mensageria / eventos           | Amazon MQ / RabbitMQ |
| MinIO         | 9000 / 9001   | Armazenamento de arquivos      | S3                   |
| Stripe Mock   | 12111 / 12112 | Simulação de pagamentos        | Stripe Live          |

## Scripts de Automação

### Makefile

```makefile
.PHONY: setup dev dev-infra dev-services down clean

setup:
	docker compose pull
	docker compose create
	cp .env.example .env
	npm install
	npx prisma generate
	npx prisma migrate dev

dev-infra:
	docker compose up postgres redis rabbitmq minio stripe-mock

dev-services:
	npx concurrently \
		"cd services/auth && npm run start:dev" \
		"cd services/core && npm run start:dev" \
		"cd services/payments && npm run start:dev"

dev:
	make dev-infra
	make dev-services

down:
	docker compose down

clean:
	docker compose down -v
	rm -rf node_modules services/*/node_modules
```

## Configuração de Ambiente (.env)

```
# Database
DATABASE_URL=postgresql://eventosai:eventosai_dev@localhost:5432/eventosai

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://eventosai:eventosai_dev@localhost:5672

# MinIO/S3
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=eventosai
S3_SECRET_KEY=eventosai_dev
S3_BUCKET=eventosai-dev

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
```

## Trade-offs

| Aspecto                  | Decisão                         | Mitigação                                      |
|--------------------------|---------------------------------|------------------------------------------------|
| Microsserviços fora do Docker | Inconsistência potencial     | Dockerfile de produção para cada serviço       |
| Consumo de memória       | ~2-3GB para serviços de infra  | Alpine images, desligar serviços não usados    |
| Stripe mock limitado     | Não reproduz todos cenários     | Stripe test mode para cenários complexos       |
| Volume mounts lentos (Win) | Read-only + exclusões         | Docker Desktop com WSL2 backend                |

## Consequências

### Positivas

- Setup de desenvolvimento em < 5 minutos
- Ambiente consistente entre todos os desenvolvedores
- Isolamento completo de serviços de infraestrutura
- Facilidade para testar diferentes versões de dependências
- Scripts de automação reduzem erros manuais

### Negativas

- Consumo de ~2-3GB de RAM para serviços de infra
- Dependência de Docker Desktop (licença para equipes > 250 pessoas)
- Diferenças sutis entre Windows (WSL2) e macOS/Linux
- Stripe mock não cobre todos os cenários de pagamento

### Ações Imediatas

1. Criar `docker-compose.yml` na raiz do projeto
2. Criar `Makefile` com comandos de setup e dev
3. Criar `.env.example` com variáveis de ambiente
4. Adicionar `.env` ao `.gitignore`
5. Documentar setup no README.md
6. Configurar healthchecks para todos os serviços
7. Testar onboarding com desenvolvedor novo

## Referências

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Hot Reload](https://docs.nestjs.com/recipes/hot-reload)
- [MinIO Documentation](https://min.io/docs/minio/container/index.html)
- [Stripe Mock](https://github.com/stripe/stripe-mock)
- [DEC-001 — Prisma ORM](../decisions/DEC-001-PRISMA-ORM.md)

---

## Aprovação

| Nome                   | Cargo              | Data       | Assinatura |
|------------------------|--------------------|------------|------------|
|                        | Tech Lead          |            |            |
|                        | Engenheiro de Infra |            |            |
