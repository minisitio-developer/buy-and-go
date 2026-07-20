# DEC-003: Testes com Jest + Vitest

| Versão | Data       | Autor        | Descrição                    |
|--------|------------|--------------|------------------------------|
| 1.0    | 2026-01-10 | Tech Lead    | Estratégia de testes         |

---

## Status

Aprovado em 10/01/2026.

## Contexto

O projeto Eventos AI exige uma estratégia de testes robusta para garantir
qualidade nos microsserviços backend (NestJS + Prisma + PostgreSQL) e
no frontend (Next.js + React + ShadCN UI).

Requisitos da estratégia de testes:
- Cobertura mínima obrigatória de 80% (linhas, branches, functions)
- Testes unitários rápidos e isolados
- Testes de integração com banco de dados real ou em container
- Testes E2E para fluxos críticos
- Diferentes ferramentas para backend e frontend (contextos distintos)

## Alternativas Consideradas

### Jest para tudo (backend e frontend)

**Prós:**
- Ferramenta única — curva de aprendizado uniforme
- Ecossistema maduro com muitos matchers e plugins
- Snapshots nativos
- Mocking embutido (`jest.fn()`, `jest.spyOn()`)

**Contras:**
- Performance lenta em projetos React com JSX (transformação pesada)
- Consumo de memória elevado em projetos grandes
- Configuração complexa com ESModules e TypeScript (depende de `ts-jest` ou `babel-jest`)
- Suporte a ESM ainda problemático (experimental)
- Hot reload ausente — rerun completa após mudanças

### Vitest para tudo

**Prós:**
- API compatível com Jest (migração trivial)
- Performance superior (Vite-based, transformação sob demanda)
- Suporte nativo a TypeScript e ESM
- Hot reload automático (HMR)
- Menor consumo de memória
- Suporte a threads e workers paralelos

**Contras:**
- Ecossistema de plugins ainda menor que Jest
- Matchers e funcionalidades avançadas menos maduras
- Comunidade menor (embora cresça rapidamente)
- Documentação menos densa que Jest

### Cypress + Jest

**Prós:**
- Cypress como ferramenta especializada para E2E
- Jest para testes unitários

**Contras:**
- Duas ferramentas com APIs diferentes
- Cypress tem escopo limitado (apenas E2E + component testing)
- Overhead de aprendizado e configuração

## Decisão

**Jest (v29) para backend (NestJS) e Vitest (v2) para frontend (Next.js).**

### Justificativa

#### Jest para Backend

1. **Ecossistema maduro:** Jest é o padrão de mercado para testes em Node.js.
   A integração com NestJS é documentada e testada extensivamente.

2. **Mocking avançado:** O módulo `jest.mock()` automático e manual é
   poderoso para isolar serviços, repositórios e módulos do NestJS.

3. **Testes de integração:** Suporte robusto a `beforeAll`/`afterAll` para
   setup/teardown de containers Docker com banco de dados.

4. **Snapshots:** Úteis para validar respostas de API sem escrever asserções
   manuais para cada campo.

5. **Cobertura nativa:** `--coverage` integrado sem plugins adicionais.

#### Vitest para Frontend

1. **Performance:** Em projetos Next.js com Vite (via `@vitejs/plugin-react`),
   o Vitest é significativamente mais rápido que Jest — transformação sob
   demanda, cache e HMR.

2. **Compatibilidade:** API idêntica ao Jest, facilitando a padronização
   de conhecimento entre equipes.

3. **Component testing:** Suporte natural a React Testing Library com
   renderização em jsdom.

4. **TypeScript nativo:** Sem necessidade de `ts-jest` ou configurações
   adicionais — funciona out-of-the-box.

5. **Integração com Vite:** Aproveita a configuração de build do projeto
   sem duplicação.

## Cobertura Mínima

### Metas por Tipo de Serviço

| Serviço        | Mínimo | Alvo  | Criticidade |
|----------------|--------|-------|-------------|
| Auth           | 85%    | 90%   | Alta        |
| Core (Eventos) | 80%    | 90%   | Alta        |
| Payments       | 90%    | 95%   | Crítica     |
| Notifications  | 75%    | 85%   | Média       |
| Dashboard      | 70%    | 80%   | Média       |
| Frontend       | 70%    | 80%   | Alta        |

### Verificação em CI

- **Pull Request:** Bloqueante se cobertura < 75%
- **Merge na main:** Bloqueante se cobertura < 80%
- **Relatório semanal:** Enviado para equipe via Slack/Discord

### O que Incluir na Cobertura

- **Linhas:** Toda linha executada ao menos uma vez
- **Branches:** Cada condicional testado em ambos os caminhos
- **Functions:** Cada função pública chamada ao menos uma vez
- **Excluído:** `*.module.ts`, `main.ts`, `*.config.ts`, `migrations/*`

## Estratégia de Mocking

### Backend (Jest)

| Tipo                | Abordagem                                       |
|---------------------|-------------------------------------------------|
| Serviços            | `jest.fn()` retornando Promise resolvida/rejeitada |
| Repositórios Prisma | Mock do `PrismaClient` com respostas controladas|
| HTTP externo        | `nock` ou `msw` para interceptar requisições    |
| Cache/Redis         | `ioredis-mock` para simular Redis em memória    |
| Fila/Messaging      | Mock dos métodos `publish`/`subscribe`          |
| Data/Hora           | `jest.useFakeTimers()` + `Date.now()` mock      |
| Variáveis de ambiente | `process.env` sobrescrito com `beforeEach`     |

### Frontend (Vitest)

| Tipo                | Abordagem                                       |
|---------------------|-------------------------------------------------|
| Componentes         | React Testing Library + `@testing-library/react`|
| Hooks customizados  | `renderHook` com wrapper de providers           |
| API calls           | `msw` (Mock Service Worker) para interceptar    |
| Router              | `next-router-mock` ou `MemoryRouter`            |
| Estado global       | Provider mock com estado controlado             |
| Media queries       | `window.matchMedia` mock com `vi.fn()`          |
| Intersection Observer | Mock direto ou biblioteca especializada       |

### Regras de Mocking

1. Mocks devem ser resetados entre testes (`beforeEach` + `jest.clearAllMocks()`)
2. Mocks de módulos externos devem ser centralizados em `__mocks__/`
3. Dados de mock devem ser definidos em factories (fábricas de objetos)
4. Usar `falso` ou `@faker-js/faker` para gerar dados realistas
5. Evitar mocks deep — mockar apenas o nível imediatamente superior

## Estrutura de Testes

### Backend

```
src/
  modules/
    auth/
      __tests__/
        auth.service.spec.ts
        auth.controller.spec.ts
        auth.guard.spec.ts
      auth.service.ts
      auth.controller.ts
```

### Frontend

```
src/
  components/
    Button/
      __tests__/
        Button.test.tsx
        Button.stories.tsx
      Button.tsx
      Button.module.css
```

## Padrões de Organização

### Nomenclatura

- Arquivos de teste: `*.spec.ts` (backend), `*.test.tsx` (frontend)
- Diretórios: `__tests__/` próximo ao módulo
- Descritores: `describe('ServiceName')` com `it('should ...')`
- Evitar `test.todo` em commits na main (permitido em branches)

### Estrutura de cada teste

1. **Arrange:** Setup de dados e mocks
2. **Act:** Execução da função/método
3. **Assert:** Verificação com `expect`

### Tratamento de Erros

- Testar caminho feliz e triste (sucesso e erro)
- Testar edge cases: valores nulos, arrays vazios, paginação
- Testar permissões e autorização quando aplicável

## Ferramentas Auxiliares

| Ferramenta                | Uso                                      |
|---------------------------|------------------------------------------|
| `@faker-js/faker`         | Geração de dados realistas               |
| `falso`                   | Objetos mock type-safe (alternativa)     |
| `msw`                     | Mock de APIs HTTP (backend e frontend)   |
| `nock`                    | Mock de HTTP para Node.js (backend)      |
| `testcontainers`          | Banco de dados real em container Docker  |
| `@testing-library/react`  | Renderização e queries de componentes    |
| `@testing-library/jest-dom` | Matchers customizados para DOM         |
| `@testing-library/user-event` | Simulação de eventos de usuário     |
| `jest-sonar-reporter`     | Relatório compatível com SonarQube       |

## Trade-offs

| Aspecto                  | Decisão                         | Mitigação                                      |
|--------------------------|---------------------------------|------------------------------------------------|
| Duas ferramentas         | Jest + Vitest                   | API compatível, mesma sintaxe                  |
| Cobertura mínima alta    | 80%                             | Foco em código crítico, excluir boilerplate    |
| Testcontainers lentos    | Banco real em container         | Cache de container, paralelismo                 |
| Mocks frágeis           | Mock de módulos internos        | Testes de integração complementares            |

## Consequências

### Positivas

- Qualidade consistente em todo o repositório
- Confiança para refatorações e mudanças
- Pipeline CI/CD com feedback rápido sobre regressões
- Documentação viva do comportamento esperado do sistema

### Negativas

- Cobertura de 80% exige disciplina contínua
- Testcontainers adicionam tempo ao pipeline (~2-3 min)
- Manutenção de mocks quando interfaces mudam
- Testes assíncronos podem ser instáveis (flaky tests)

### Ações Imediatas

1. Configurar Jest no backend com `jest.config.ts`
2. Configurar Vitest no frontend com `vitest.config.ts`
3. Criar `testcontainers` setup para banco de dados
4. Adicionar scripts: `npm run test`, `npm run test:cov`, `npm run test:e2e`
5. Integrar cobertura no CI com limite bloqueante
6. Criar issue para setup de `msw` nos testes de API
7. Documentar padrões de teste no CONTRIBUTING.md

## Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [MSW (Mock Service Worker)](https://mswjs.io/docs/)
- [DEC-002 — ESLint + Prettier + Husky](../decisions/DEC-002-ESLINT-PRETTIER-HUSKY.md)

---

## Aprovação

| Nome                   | Cargo              | Data       | Assinatura |
|------------------------|--------------------|------------|------------|
|                        | Tech Lead          |            |            |
|                        | Engenheiro de QA   |            |            |
