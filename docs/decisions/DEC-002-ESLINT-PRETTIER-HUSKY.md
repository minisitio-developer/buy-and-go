# DEC-002: ESLint + Prettier + Husky para Qualidade de Código

| Versão | Data       | Autor        | Descrição                    |
|--------|------------|--------------|------------------------------|
| 1.0    | 2026-01-10 | Tech Lead    | Padronização de código       |

---

## Status

Aprovado em 10/01/2026.

## Contexto

O projeto Eventos AI terá múltiplos desenvolvedores trabalhando em
paralelo nos microsserviços (backend NestJS, frontend Next.js) e
scripts auxiliares. Para garantir consistência de estilo, prevenir
erros comuns e automatizar a qualidade do código, é necessário
estabelecer ferramentas de linting, formatação e hooks de pre-commit.

Os objetivos são:
- Padronizar estilo de código em todo o repositório
- Automatizar a detecção de erros antes do commit
- Garantir que todos os commits sigam convenções semânticas
- Reduzir ruído em code reviews (sem discussões sobre formatação)

## Alternativas Consideradas

### Apenas ESLint (sem Prettier)

**Prós:**
- Menos dependências e configuração
- ESLint já cobre formatação básica com regras estilísticas

**Contras:**
- Regras de formatação do ESLint conflitam com si mesmas
- Performance de linting para formatação é inferior
- Impossibilidade de separar warnings de lint de formatação visual
- Comunidade migrando para Prettier como formatador padrão

### StandardJS

**Prós:**
- Zero configuração — opinionated e simples
- Amplamente adotado na comunidade JavaScript

**Contras:**
- Ausência de suporte a muitas regras específicas de TypeScript
- Impossibilidade de customização quando necessário
- Sem suporte a React/JSX específico
- Não cobre formatação de CSS, JSON, YAML, GraphQL

### Biome

**Prós:**
- Ferramenta unificada (lint + format) em Rust — extremamente rápida
- Zero configuração com opção de customização
- Compatível com regras do ESLint

**Contras:**
- Ecossistema ainda imaturo (v1 lançado em 2024)
- Plugins e regras customizadas limitadas
- Integração com editores de código ainda instável
- Compatibilidade com monorepos complexos não testada
- Risco de mudanças na API entre versões

## Decisão

**ESLint (v9) com config flat + Prettier (v3) + Husky (v9) + lint-staged.**

### Stack Definida

| Ferramenta    | Versão | Função                                  |
|---------------|--------|-----------------------------------------|
| ESLint        | 9.x    | Análise estática, regras de qualidade   |
| Prettier      | 3.x    | Formatação automática de código         |
| Husky         | 9.x    | Git hooks manager                       |
| lint-staged   | 15.x   | Executar linters apenas em arquivos staged |
| eslint-plugin-prettier | 5.x | Integra Prettier como regra do ESLint |

### Configuração do ESLint

- Formato: `eslint.config.js` (flat config — novo padrão)
- Extensão: `@typescript-eslint` com regras estritas
- Regras adicionais:
  - `no-unused-vars` — erro (com `argsIgnorePattern: '^_'`)
  - `no-console` — warn (permitido em scripts de servidor)
  - `@typescript-eslint/explicit-function-return-type` — off (inferência TS)
  - `@typescript-eslint/no-explicit-any` — warn (evitar, mas permitir)
  - `@typescript-eslint/no-floating-promises` — error
  - `@typescript-eslint/consistent-type-imports` — error

### Configuração do Prettier

- `semi: true`
- `singleQuote: true`
- `trailingComma: 'all'`
- `tabWidth: 2`
- `printWidth: 100`
- `arrowParens: 'always'`
- `endOfLine: 'lf'`
- `bracketSpacing: true`
- `jsxSingleQuote: false`

### Configuração do Husky + lint-staged

```
// .husky/pre-commit
npx lint-staged

// .husky/commit-msg
npx --no -- commitlint --edit $1
```

### Configuração do lint-staged

```javascript
export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,yml,yaml,md}': ['prettier --write'],
};
```

## Conventions de Commit (Conventional Commits)

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos Permitidos

| Tipo       | Uso                                           |
|------------|-----------------------------------------------|
| `feat`     | Nova feature                                  |
| `fix`      | Correção de bug                               |
| `chore`    | Tarefa de manutenção (deps, config)           |
| `docs`     | Documentação                                  |
| `style`    | Formatação, espaçamento, sem mudança lógica   |
| `refactor` | Refatoração de código sem mudança de comportamento |
| `test`     | Adição ou correção de testes                  |
| `perf`     | Melhoria de performance                       |
| `ci`       | Alterações em CI/CD                           |
| `revert`   | Reversão de commit anterior                   |

### Exemplos

```
feat(auth): add OAuth2 login with Google provider
fix(payments): handle Stripe idempotency errors
docs(readme): update deployment instructions
refactor(core): extract event validation to service
test(api): add integration tests for event CRUD
ci(docker): optimize multi-stage build
```

### Validação

- `commitlint` configurado com `@commitlint/config-conventional`
- Hook `commit-msg` dispara validação automática
- Commits que não seguem o padrão são rejeitados

## Pre-commit Hooks

### Pipeline de Verificação

1. **lint-staged executa em paralelo:**
   - ESLint com `--fix` nos arquivos staged
   - Prettier com `--write` nos arquivos staged
2. **Falha no lint → commit bloqueado**
3. **Falha no Prettier → arquivos corrigidos e re-adicionados**
4. **commit-msg → valida o formato da mensagem**
5. **Se passar → commit é criado**

### Hooks Adicionais (futuro)

- `pre-push`: Rodar testes unitários e type checking
- `post-commit`: Notificar em Slack (se aplicável)

## Trade-offs

| Aspecto                  | Decisão                         | Mitigação                                      |
|--------------------------|---------------------------------|------------------------------------------------|
| Performance do lint      | Ferramentas podem ser lentas    | lint-staged limita escopo a arquivos staged    |
| Conflitos ESLint × Prettier | Usar `eslint-plugin-prettier` | Desabilitar regras de formatação do ESLint     |
| Curva de aprendizado     | Husky + lint-staged + commitlint | Documentação clara + templates de commit       |

## Consequências

### Positivas

- Código consistente independente do desenvolvedor
- Code reviews focam em lógica, não em formatação
- Erros comuns são capturados antes do commit
- Histórico de git limpo com mensagens padronizadas
- Geração automática de changelog facilitada

### Negativas

- Tempo adicional em cada commit (lint-staged)
- Configuração inicial não trivial
- Desenvolvedores precisam configurar ESLint/Prettier no editor
- Hooks podem ser bypassados com `--no-verify`

### Ações Imediatas

1. Instalar dependências: `npm i -D eslint prettier husky lint-staged commitlint`
2. Inicializar Husky: `npx husky init`
3. Criar `eslint.config.js` com flat config
4. Criar `.prettierrc` com as configurações definidas
5. Configurar `lint-staged` no `package.json`
6. Adicionar `commitlint.config.js`
7. Documentar comandos: `npm run lint`, `npm run format`
8. Adicionar issue no board para configurar hooks nos editores

## Referências

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/lint-staged/lint-staged)
- [commitlint](https://commitlint.js.org/)

---

## Aprovação

| Nome                   | Cargo              | Data       | Assinatura |
|------------------------|--------------------|------------|------------|
|                        | Tech Lead          |            |            |
|                        | Engenheiro Sênior  |            |            |
