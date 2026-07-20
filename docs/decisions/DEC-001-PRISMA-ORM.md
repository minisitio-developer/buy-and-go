# DEC-001: Escolha do Prisma como ORM

| Versão | Data       | Autor        | Descrição                    |
|--------|------------|--------------|------------------------------|
| 1.0    | 2026-01-10 | Tech Lead    | Definição do ORM do projeto |

---

## Status

Aprovado em 10/01/2026.

## Contexto

O projeto Eventos AI necessita de um ORM (Object-Relational Mapper) para
interagir com o banco de dados PostgreSQL. O ORM escolhido será utilizado
em todos os microsserviços que persistem dados, incluindo os serviços
de Auth, Core, Payments, Notifications e Dashboard.

Os requisitos avaliados foram:
- Suporte nativo a TypeScript com tipos end-to-end
- Performance adequada para queries complexas
- Suporte a migrations versionadas
- Capacidade de gerar tipos automaticamente a partir do schema
- Facilidade de testes e mocking
- Ecossistema e comunidade ativos
- Curva de aprendizado para a equipe

## Alternativas Consideradas

### TypeORM

**Prós:**
- Maturidade e ampla adoção no mercado
- Suporte a Data Mapper e Active Record
- Decorators familiares para equipes com experiência em Java (JPA)

**Contras:**
- Tipagem TypeScript fraca — muitos `any` e casts manuais
- Performance inconsistente em queries complexas (N+1 frequente)
- Manutenção do repositório considerada lenta (issues abertas há meses)
- Relações bidirecionais confusas e propensas a erros
- Documentação desatualizada e exemplos contraditórios

### Sequelize

**Prós:**
- ORM mais antigo do ecossistema Node.js, muito testado
- Suporte a transações e locking
- Grande quantidade de documentação histórica

**Contras:**
- Abordagem imperativa e verbosa
- Tipagem TypeScript fraca mesmo com pacotes `@types`
- Ausência de migrations nativas de qualidade (depende de pacote externo)
- Não gera tipos automaticamente
- Modelos definidos em JS puro com anotações confusas

### Drizzle ORM

**Prós:**
- Tipagem TypeScript excelente — melhor da categoria
- SQL-like API que não esconde o banco de dados
- Performance superior por ser leve e sem runtime reflection
- Bundle size pequeno

**Contras:**
- Ecossistema ainda jovem (menos de 2 anos)
- Menos recursos avançados (relações polimórficas, soft delete)
- Comunidade menor e menos conteúdo educacional
- Migrations ainda em maturação
- Ferramentas visuais (Drizzle Studio) ainda instáveis
- Risco de mudanças breaking na API

### Knex.js

**Prós:**
- Query builder puro, sem abstração de objetos — mais controle
- Excelente para queries complexas e raw SQL
- Performance previsível
- Migrations maduras e flexíveis

**Contras:**
- Não é um ORM — não há mapeamento objeto-relacional
- Sem geração de tipos automaticamente
- Código mais verboso para operações CRUD simples
- Cada query é manual — maior chance de erros em operações repetitivas
- Sem validação de schemas em tempo de compilação

## Decisão

**Prisma ORM versão 6.x será utilizado como ORM padrão do projeto.**

### Justificativa

1. **Type safety end-to-end:** O Prisma gera tipos TypeScript automaticamente
   a partir do schema, eliminando discrepâncias entre banco e código.
   Erros de tipo são capturados em tempo de compilação.

2. **Migrations versionadas:** O CLI do Prisma gerencia migrations com
   rollback, diffing e seed, integrado ao workflow de desenvolvimento.

3. **Produtividade da equipe:** A sintaxe declarativa do schema Prisma é
   intuitiva. O Prisma Studio oferece uma interface visual para inspecionar
   dados durante o desenvolvimento.

4. **Performance adequada:** Para o volume esperado (dezenas de milhares
   de eventos/mês), o Prisma oferece performance satisfatória. Query
   otimizadas com `include`, `select` e `raw` queries cobrem casos
   excepcionais.

5. **Relações e agregados:** Suporte nativo a relações, composição de
   queries, paginação, filtros e agregações.

### Trade-offs

| Aspecto                  | Prisma                          | Mitigação                                      |
|--------------------------|---------------------------------|------------------------------------------------|
| Performance bulk insert  | Inferior a raw SQL              | Usar `createMany` e transações batch           |
| Queries complexas        | Limitado em subqueries aninhadas| `$queryRaw` para SQL puro                      |
| Cold start (Serverless)  | Conexão inicial mais lenta      | Pool de conexões + Data Proxy                  |
| Lock-in de schema        | Schema Prisma proprietário      | Export DDL via `prisma migrate diff`           |
| Runtime size             | ~15MB no node_modules           | Aceitável para deploy em container             |

## Consequências

### Positivas

- Redução significativa de bugs de tipagem entre banco e aplicação
- Onboarding mais rápido de novos desenvolvedores
- Schema único como fonte da verdade para o banco de dados
- Integração com ferramentas de teste (fácil de mockar com `spyOn`)
- Possibilidade de gerar documentação automaticamente do schema

### Negativas

- Dependência adicional no pipeline de CI/CD (geração de cliente)
- Necessidade de rodar `prisma generate` após cada alteração de schema
- Migrations complexas exigem revisão manual do SQL gerado
- Performance em bulk inserts requer atenção (monitoramento contínuo)

### Ações Imediatas

1. Adicionar `prisma` e `@prisma/client` ao `package.json` do projeto
2. Configurar `prisma/schema.prisma` com PostgreSQL provider
3. Criar script `db:migrate` e `db:seed` no package.json
4. Adicionar hook de pre-commit para validar schema Prisma
5. Documentar padrões de uso (naming conventions, soft delete, audit)
6. Configurar Prisma Studio como ferramenta auxiliar de desenvolvimento

## Padrões de Uso

- **Naming:** snake_case no banco, camelCase no Prisma schema e código
- **Soft delete:** Usar campo `deleted_at` com escopo de middleware
- **Audit:** Campos `created_at`, `updated_at` automáticos via `@default(now())`
- **Pagination:** Sempre usar paginação cursor-based para listagens
- **Transactions:** Usar `$transaction` para operações atômicas
- **Logging:** Habilitar `log: ['query', 'info', 'warn', 'error']` em dev

## Exemplo de Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   @map("password_hash")
  role      Role     @default(ORGANIZER)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  events    Event[]
  tickets   Ticket[]

  @@map("users")
}

enum Role {
  ADMIN
  ORGANIZER
  PARTICIPANT
}

model Event {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  date        DateTime
  location    String?
  capacity    Int?
  status      EventStatus @default(DRAFT)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  organizerId String @map("organizer_id")
  organizer   User   @relation(fields: [organizerId], references: [id])

  tickets     Ticket[]

  @@index([organizerId])
  @@index([status])
  @@map("events")
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  FINISHED
}

model Ticket {
  id          String   @id @default(cuid())
  type        String
  price       Decimal  @db.Decimal(10, 2)
  quantity    Int
  sold        Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  eventId     String   @map("event_id")
  event       Event    @relation(fields: [eventId], references: [id])

  @@index([eventId])
  @@map("tickets")
}
```

### Integração com NestJS

```typescript
// services/core/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// services/core/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## Middleware de Soft Delete

```typescript
// services/core/src/prisma/prisma.middleware.ts
import { Prisma } from '@prisma/client';

export function softDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const models = ['User', 'Event', 'Ticket'];
    const action = params.action;

    if (models.includes(params.model ?? '') && action === 'findUnique') {
      params.action = 'findFirst';
      params.args.where = { ...params.args.where, deletedAt: null };
    }

    if (models.includes(params.model ?? '') && action === 'findMany') {
      params.args.where = { ...params.args.where, deletedAt: null };
    }

    if (models.includes(params.model ?? '') && action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }

    return next(params);
  };
}
```

## Monitoramento e Debug

### Prisma Studio

- Acessível via `npx prisma studio` na porta 5555
- Permitido em desenvolvimento, proibido em produção
- Útil para inspecionar dados durante debugging

### Logging por Ambiente

| Ambiente   | Nível de Log                    | Armazenamento         |
|------------|----------------------------------|-----------------------|
| Dev        | query, info, warn, error         | Console               |
| Staging    | warn, error                      | Console + CloudWatch  |
| Produção   | error (query lenta > 1s)         | CloudWatch + Datadog  |

### Query Monitoring

- Habilitar `eventDurationThreshold` para logar queries lentas (> 500ms)
- Configurar middleware para capturar queries lentas em produção
- Integrar com APM (DataDog, New Relic) para tracing

```typescript
// Configuração de query monitoring
const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

prisma.$on('warn', (e) => {
  if (e.message.includes('query')) {
    console.warn(`Slow query detected: ${e.message}`);
  }
});
```

## Boas Práticas e Anti-patterns

### Faça

- Usar `select` explícito para buscar apenas campos necessários
- Preferir `findUnique` sobre `findFirst` quando buscar por ID único
- Usar `include` com moderação (apenas relações necessárias)
- Paginar listagens com `take` + `skip` ou cursor-based
- Usar `$transaction` para operações que envolvem múltiplas tabelas

### Evite

- `findMany` sem `where` em tabelas grandes (sempre filtrar)
- `include` aninhados profundos (mais de 2 níveis)
- `update` sem `where` (atualização em massa não intencional)
- `delete` em vez de soft delete em dados críticos
- `raw` queries sem validação de parâmetros

## Referências

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma vs TypeORM comparison](https://www.prisma.io/docs/orm/more/comparisons)
- [DEC-003 — Testes com Jest + Vitest](../decisions/DEC-003-TESTES-JEST-VITEST.md)

---

## Aprovação

| Nome                   | Cargo              | Data       | Assinatura |
|------------------------|--------------------|------------|------------|
|                        | Tech Lead          |            |            |
|                        | Engenheiro Sênior  |            |            |
