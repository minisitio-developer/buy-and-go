# DEC-005: ShadCN UI + Tailwind para Frontend

| Versão | Data       | Autor        | Descrição                    |
|--------|------------|--------------|------------------------------|
| 1.0    | 2026-01-10 | Tech Lead    | Framework de UI do frontend  |

---

## Status

Aprovado em 10/01/2026.

## Contexto

O frontend do Eventos AI será construído com Next.js 14+ (App Router)
e precisa de uma biblioteca de componentes de UI que atenda aos
seguintes requisitos:

- Componentes acessíveis (WCAG 2.1 AA)
- Customização visual via design tokens
- Suporte a temas (light/dark)
- Bundle size pequeno (apenas componentes usados)
- TypeScript first com tipos completos
- Facilidade de customização sem forks
- Compatibilidade com Tailwind CSS (já definido como utilitário de estilo)
- Experiência de desenvolvimento produtiva

## Alternativas Consideradas

### Material UI (MUI)

**Prós:**
- Biblioteca mais madura e completa do ecossistema React
- Componentes prontos para uso (Data Grid, Date Pickers, Autocomplete)
- Documentação excelente e exemplos abundantes
- Sistema de temas robusto com ThemeProvider
- Suporte a animações e transições nativas
- Grande comunidade e mercado de trabalho

**Contras:**
- Bundle size enorme (~100KB+ gzipped mesmo com tree-shaking)
- Aparência muito distinta (Material Design) — difícil de customizar
- Sobrescrita de estilos complexa (sx props, styled components, CSS modules)
- CSS-in-JS com Emotion — runtime overhead e conflito com Tailwind
- Atualizações breaking frequentes (v4 → v5 → v6)
- Performance em listas grandes (Data Grid pesado)
- Personalização visual exige override profundo do theme

### Chakra UI

**Prós:**
- Excelente acessibilidade (aria attributes built-in)
- Sistema de temas com tokens semânticos
- Componentes compostos e flexíveis
- Suporte a variantes e color schemes
- Dark mode nativo via ColorModeProvider

**Contras:**
- Estilo visual genérico (necessita customização pesada)
- CSS-in-JS com Emotion (runtime overhead, conflito com Tailwind)
- Manutenção do repositório irregular (períodos sem releases)
- Ecossistema de componentes complementares limitado
- Performance em shadow DOM e SSR pode ser problemática
- Comunidade encolhendo vs concorrentes mais modernos

### Ant Design

**Prós:**
- Conjunto completo de componentes empresariais
- Suporte nativo a i18n e temas
- Componentes complexos (tabelas, formulários, upload) robustos
- Adoção forte no mercado asiático

**Contras:**
- Estilo visual muito marcante (design language própria)
- Customização de estilo extremamente difícil (LESS variables)
- Bundle size enorme (~200KB+)
- Documentação focada em chinês (tradução parcial)
- CSS-in-JS com @ant-design/cssinjs — outro runtime
- Integração complicada com Next.js App Router (CSS conflicts)

### Radix UI Primitives

**Prós:**
- Acessibilidade líder de mercado (ARIA perfeito)
- Componentes headless — controle total sobre estilo
- TypeScript impecável com tipos exportados
- Bundle zero de estilo — apenas comportamento
- Composição via slots e asChild
- Sem runtime de CSS

**Contras:**
- Apenas primitivas — sem componentes estilizados
- Exige mais código para criar componentes completos
- Ausência de componentes complexos (Data Grid, Date Range)
- Curva de aprendizado para composição avançada
- Design system precisa ser construído do zero

## Decisão

**ShadCN UI (v2) + Tailwind CSS (v3) + Radix UI Primitives.**

### Stack Definida

| Camada          | Tecnologia                    | Função                                   |
|-----------------|-------------------------------|------------------------------------------|
| Framework       | Next.js 14 (App Router)       | Roteamento, SSR, RSC                     |
| Estilização     | Tailwind CSS v3               | Utilitários CSS, design tokens           |
| Componentes     | ShadCN UI v2                  | Componentes copiáveis, estilizados       |
| Primitivas      | Radix UI                      | Acessibilidade, comportamento headless   |
| Ícones          | Lucide React                  | Ícones consistentes e leves              |
| Tema            | next-themes                   | Dark/light mode com persistência         |
| Formulários     | React Hook Form + Zod         | Validação e gerenciamento de formulários |

### Por que ShadCN UI

1. **Não é uma dependência — é uma coleção de componentes copiáveis.**
   Cada componente é copiado para o repositório do projeto, dando controle
   total sobre o código. Sem versionamento externo, sem breaking changes
   inesperadas, sem lock-in.

2. **Customização via CSS variables.**
   ShadCN UI define cores, border-radius, spacing e tipografia como
   variáveis CSS. Mudar o tema inteiro é alterar ~30 variáveis.

3. **Construído sobre Radix UI primitives.**
   Acessibilidade WCAG 2.1 AA garantida pelo Radix, com o estilo do
   Tailwind aplicado por cima. O melhor dos dois mundos: acessibilidade
   perfeita + estilo customizável.

4. **Tree-shaking natural.**
   Apenas os componentes efetivamente copiados para o projeto são
   incluídos no bundle. Sem importações fantasmas.

5. **TypeScript nativo.**
   Todos os componentes são escritos em TypeScript com tipos completos
   e exportados.

6. **Suporte a Next.js App Router.**
   Componentes server-side e client-side com boundaries claros entre
   `'use client'` e server components.

## Customização via CSS Variables

### Como Funciona

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... cores dark mode ... */
  }
}
```

### Aplicação nos Componentes

```tsx
// Componente Button do ShadCN UI
<button
  className={cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
    variant === "link" && "text-primary underline-offset-4 hover:underline",
    size === "default" && "h-10 px-4 py-2",
    size === "sm" && "h-9 rounded-md px-3",
    size === "lg" && "h-11 rounded-md px-8",
    size === "icon" && "h-10 w-10",
    className
  )}
  ref={ref}
  {...props}
/>
```

### Vantagens da Customização via CSS Variables

- **Tema instantâneo:** Alterar `--primary` muda todos os componentes
- **Dark mode sem esforço:** Basta alternar a classe `.dark` no `<html>`
- **Design tokens centralizados:** Uma única fonte de verdade para cores
- **Zero runtime:** CSS Variables são nativas do navegador
- **Integração com Tailwind:** `bg-background`, `text-foreground`, etc.

## Acessibilidade

### Padrão Adotado

- **WCAG 2.1 AA** como nível mínimo obrigatório
- **WCAG 2.1 AAA** como alvo para componentes críticos (formulários, navegação)

### Como Garantimos

1. **Radix UI** fornece comportamento acessível por padrão:
   - Roles ARIA corretos
   - Gerenciamento de foco (roving tabindex, focus trap)
   - Navegação por teclado (setas, Enter, Escape)
   - Anúncios para leitores de tela (aria-live regions)

2. **ShadCN UI** mantém a acessibilidade do Radix:
   - Não remove atributos ARIA
   - Mantém estrutura semântica (button, input, dialog, etc.)
   - Focus styles visíveis via `focus-visible:ring-2`

3. **Testes de acessibilidade:**
   - `@axe-core/react` em desenvolvimento
   - `jest-axe` nos testes unitários
   - Auditoria manual com Lighthouse e NVDA/VoiceOver
   - Checklist de acessibilidade no PR template

4. **Práticas adicionais:**
   - Labels associados a inputs (htmlFor + id)
   - Mensagens de erro vinculadas via `aria-describedby`
   - Skip links para navegação
   - Contraste de cores verificado (4.5:1 mínimo)

### Componentes com Acessibilidade Crítica

| Componente    | Considerações de Acessibilidade                    |
|---------------|----------------------------------------------------|
| Dialog/Modal  | Focus trap, aria-modal, fechar com Escape          |
| Dropdown Menu | Navegação por setas, aria-expanded                 |
| Select        | Combobox pattern, aria-activedescendant            |
| Date Picker   | Grid pattern, navegação por teclado                |
| Tabs          | Tab role, aria-selected, teclado (setas + Home/End)|
| Toast         | aria-live="polite", role="status"                  |
| Tooltip       | role="tooltip", aria-describedby no trigger        |

## Design Tokens e Tema

### Estrutura de Tokens

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
```

### Temas Suportados

| Tema        | Características                                    |
|-------------|----------------------------------------------------|
| Light       | Fundo claro, texto escuro, cores vibrantes         |
| Dark        | Fundo escuro, texto claro, cores suaves            |
| High Contrast | Para usuários com baixa visão (futuro)            |
| Brand X     | White-label com cores do cliente (futuro)          |

## Trade-offs

| Aspecto                  | Decisão                         | Mitigação                                      |
|--------------------------|---------------------------------|------------------------------------------------|
| Componentes copiáveis    | Manutenção manual               | CLI `npx shadcn-ui@latest add` atualiza        |
| Componentes complexos    | Data Grid não incluído          | Construir com TanStack Table + ShadCN         |
| Curva de aprendizado     | Tailwind + Radix + ShadCN       | Documentação interna + exemplos                |
| Bundle size              | Depende dos componentes copiados| Apenas o necessário está no bundle             |

## Consequências

### Positivas

- Controle total sobre o código dos componentes
- Tema consistente via CSS variables (light/dark instantâneo)
- Acessibilidade WCAG 2.1 AA garantida pelo Radix UI
- Bundle pequeno e performático
- Facilidade de criar novos componentes seguindo o padrão
- Onboarding rápido (Tailwind é conhecido da equipe)

### Negativas

- Componentes copiados precisam ser atualizados manualmente
- ShadCN UI não oferece componentes complexos prontos (Data Grid, Charts)
- Time precisa de conhecimento em Tailwind e Radix UI
- Ausência de suporte comercial (community-driven)

### Ações Imediatas

1. Inicializar Next.js com Tailwind CSS
2. Rodar `npx shadcn-ui@latest init` para configurar o projeto
3. Adicionar componentes base: Button, Input, Card, Dialog, Toast
4. Configurar `globals.css` com design tokens
5. Instalar e configurar `next-themes` para dark mode
6. Instalar Lucide React para ícones
7. Criar exemplo de página com componentes ShadCN
8. Documentar padrões de uso de componentes no guia do desenvolvedor
9. Adicionar verificação de acessibilidade no CI
10. Criar checklist de acessibilidade para code review

## Referências

- [ShadCN UI Documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Lucide Icons](https://lucide.dev/icons)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/)
- [DEC-002 — ESLint + Prettier + Husky](../decisions/DEC-002-ESLINT-PRETTIER-HUSKY.md)
- [DEC-003 — Testes com Jest + Vitest](../decisions/DEC-003-TESTES-JEST-VITEST.md)

---

## Aprovação

| Nome                   | Cargo              | Data       | Assinatura |
|------------------------|--------------------|------------|------------|
|                        | Tech Lead          |            |            |
|                        | Designer UX/UI     |            |            |
|                        | Frontend Lead      |            |            |
