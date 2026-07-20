# VOL-015 — Internacionalização

**EventOS AI Enterprise**
**Codinome:** Atlas
**Versão:** 0.0.1
**Status:** Draft
**Autor:** Equipe EventOS AI

---

## INT-000001 — Propósito

Este documento define a estratégia completa de internacionalização do EventOS AI, abrangendo expansão geográfica, suporte multi-idioma, multi-moeda, conformidade legal, infraestrutura multi-região, localização cultural e roadmap de expansão para os próximos 5 anos.

---

## INT-000002 — Escopo

- Estratégia de internacionalização por fases
- Suporte a idiomas e sistema de tradução
- Múltiplas moedas e gateways de pagamento
- Aspectos legais e regulatórios por região
- Infraestrutura multi-região na AWS
- Localização de formatos, fusos e feriados
- Roadmap de expansão detalhado

---

## INT-000010 — Estratégia de Internacionalização

### INT-000011 — Visão Geral da Expansão

A internacionalização do EventOS AI será executada em 4 fases, cada uma com duração aproximada de 12 a 18 meses, começando pelo mercado doméstico brasileiro e expandindo progressivamente para América Latina, América do Norte e Europa.

| Fase | Região | Período | Mercado Endereçável | Receita Projetada |
|------|--------|---------|---------------------|-------------------|
| 1 | Brasil | Ano 1 | R$ 2,3B (eventos corporativos) | R$ 12M |
| 2 | América Latina | Ano 2 | USD 1,8B | USD 8M |
| 3 | EUA e Canadá | Ano 3 | USD 12B | USD 25M |
| 4 | Europa | Ano 4 | USD 9B | USD 18M |

---

### INT-000020 — Fase 1: Brasil (Ano 1)

**Objetivo:** Consolidar o produto no mercado brasileiro, validar o modelo de negócio e construir a base de clientes.

**Metas:**
- 500 contas ativas (empresas) ao final do ano 1
- 50.000 eventos gerenciados na plataforma
- NPS mínimo de 75
- Churn rate < 3% ao mês
- Receita recorrente anual (ARR) de R$ 12M

**Funcionalidades prioritárias:**
- Idioma pt-BR nativo (100% da interface)
- Moeda BRL com formatação locale
- Gateway de pagamento PIX (Gerencianet / PagSeguro)
- Gateway de pagamento boleto bancário e cartão de crédito (Cielo, Adyen BR)
- Suporte a notas fiscais eletrônicas (NF-e/NFS-e)
- Conformidade total com a LGPD
- Integração com Receita Federal (CNPJ)
- Suporte a feriados nacionais e estaduais brasileiros
- Fuso horário padrão America/Sao_Paulo (-03:00)
- Data no formato dd/mm/aaaa
- Hora no formato HH:mm (24h)

**Estratégia de entrada:**
- Foco inicial em eventos corporativos de médio e grande porte
- Parcerias com associações de eventos (ABRACE, UBRAFE)
- Equipe de vendas diretas em São Paulo, Rio de Janeiro e Belo Horizonte
- Marketing digital segmentado por setor (tecnologia, saúde, educação, financeiro)
- Modelo freemium para pequenos eventos com upgrade para planos pagos

**Marcos:**
| Mês | Marco |
|-----|-------|
| M1 | MVP com pt-BR e BRL |
| M2 | Primeiros 10 clientes pagantes |
| M3 | Integração PIX e boleto |
| M4 | LGPD completo + DPO nomeado |
| M6 | 100 contas ativas |
| M9 | 250 contas ativas |
| M12 | 500 contas ativas + ARR R$ 12M |

---

### INT-000030 — Fase 2: América Latina (Ano 2)

**Objetivo:** Expandir para os principais mercados da América Latina, adaptando o produto para cada país.

**Países-alvo (em ordem de entrada):**

| Ordem | País | Moeda | Idioma | Mercado Eventos | Gateway |
|-------|------|-------|--------|-----------------|---------|
| 1 | México | MXN | es-MX | USD 800M | MercadoPago |
| 2 | Colômbia | COP | es-CO | USD 350M | MercadoPago / Epay |
| 3 | Chile | CLP | es-CL | USD 280M | MercadoPago / Kiphu |
| 4 | Argentina | ARS | es-AR | USD 200M | MercadoPago / Modo |

**Metas:**
- 200 contas ativas na América Latina ao final do ano 2
- 20.000 eventos gerenciados
- Receita recorrente anual de USD 8M
- Suporte a espanhol latino-americano com variações regionais

**Adaptações necessárias por país:**
- Catálogo de feriados nacionais e regionais
- Formatos de data: dd/mm/aaaa (padrão LATAM)
- Formatos de hora: HH:mm (24h) exceto México que usa h:mm AM/PM em contextos informais
- Fuso horário: America/Mexico_City, America/Bogota, America/Santiago, America/Argentina/Buenos_Aires
- Nota fiscal eletrônica local (CFDI no México, DTE no Chile, Factura Electrónica na Colômbia e Argentina)
- Conformidade com leis de proteção de dados locais

**Estratégia de entrada:**
- Escritório regional no México (Cidade do México) para cobrir América do Norte
- Escritório regional na Colômbia (Bogotá) para cobrir América do Sul
- Equipe de vendas com nativos em espanhol
- Parcerias com associações latino-americanas de eventos
- Marketing digital em espanhol com segmentação por país

**Marcos:**
| Mês | Marco |
|-----|-------|
| M13 | Lançamento México (es-MX, MXN, MercadoPago) |
| M15 | Lançamento Colômbia (es-CO, COP) |
| M17 | Lançamento Chile (es-CL, CLP) |
| M18 | Lançamento Argentina (es-AR, ARS) |
| M20 | 100 contas LATAM ativas |
| M24 | 200 contas LATAM ativas + ARR USD 8M |

---

### INT-000040 — Fase 3: EUA e Canadá (Ano 3)

**Objetivo:** Entrar no maior mercado de eventos do mundo com um produto competitivo e compliance total.

**Metas:**
- 500 contas ativas (EUA + Canadá) ao final do ano 3
- 100.000 eventos gerenciados
- Receita recorrente anual de USD 25M
- Suporte completo em inglês americano
- Certificação SOC 2 Type II

**Adaptações necessárias:**
- Idioma en-US completo
- Moeda USD e CAD
- Gateway de pagamento Stripe (primário), PayPal (secundário)
- Gateway de pagamento canadense: Stripe + Moneris
- Formatos de data: MM/dd/aaaa (EUA), dd/MM/aaaa (Canadá)
- Formatos de hora: h:mm AM/PM (12h) — padrão norte-americano
- Fuso horário: múltiplos fusos (ET, CT, MT, PT, AT)
- Suporte a feriados americanos (Thanksgiving, 4th of July, Presidents Day, etc.)
- Feriados canadenses (Canada Day, Victoria Day, Thanksgiving CA)
- Conformidade CCPA (Califórnia) e PIPEDA (Canadá)
- Suporte a sales tax (diferente por estado)
- Integração com IRS 1099 para pagamentos a fornecedores
- Acessibilidade WCAG 2.1 AA (obrigatório nos EUA)

**Estratégia de entrada:**
- Escritório central em Nova York e filial em São Francisco
- Equipe de vendas Enterprise dedicada
- Parcerias com Event Marketer, IAEE e MPI
- Integração com ferramentas do ecossistema americano (Salesforce, HubSpot, Marketo)
- Marketing de conteúdo em inglês com foco em ROI e produtividade
- Participação em conferências (IMEX America, CES, SXSW)

**Marcos:**
| Mês | Marco |
|-----|-------|
| M25 | Lançamento EUA (en-US, USD, Stripe) |
| M27 | Lançamento Canadá (en-CA, CAD, Stripe + Moneris) |
| M28 | Certificação SOC 2 Type II |
| M30 | 100 contas norte-americanas |
| M33 | Conformidade CCPA implementada |
| M36 | 500 contas norte-americanas + ARR USD 25M |

---

### INT-000050 — Fase 4: Europa (Ano 4)

**Objetivo:** Estabelecer presença nos principais mercados europeus de eventos, com foco inicial em países de língua portuguesa, espanhola e inglesa.

**Países-alvo:**

| Ordem | País | Moeda | Idioma | Mercado Eventos | Gateway |
|-------|------|-------|--------|-----------------|---------|
| 1 | Portugal | EUR | pt-PT | USD 300M | Adyen / Stripe |
| 2 | Espanha | EUR | es-ES | USD 900M | Adyen / Stripe / Redsys |
| 3 | Reino Unido | GBP | en-GB | USD 2B | Stripe / Adyen |
| 4 | Alemanha | EUR | de-DE | USD 1,5B | Adyen / Stripe |
| 5 | França | EUR | fr-FR | USD 1,2B | Adyen / Stripe |

**Metas:**
- 300 contas ativas na Europa ao final do ano 4
- 60.000 eventos gerenciados
- Receita recorrente anual de EUR 18M
- Suporte a 4 idiomas europeus (pt-PT, es-ES, en-GB, de-DE, fr-FR)
- Compliance total com GDPR

**Adaptações necessárias:**
- Idioma pt-PT (diferenças significativas do pt-BR)
- Idioma es-ES (diferenças do es-LATAM: vocabulário, conjugação vosotros)
- Idioma en-GB (diferenças ortográficas do en-US)
- Moeda EUR e GBP
- Formatos de data: dd/mm/aaaa (padrão europeu)
- Formatos de hora: HH:mm (24h — padrão europeu)
- Fuso horário: Europe/Lisbon, Europe/Madrid, Europe/London, Europe/Berlin, Europe/Paris
- Suporte a feriados nacionais e regionais de cada país
- Conformidade total com GDPR (RGPD na Europa)
- IVA (VAT) por país — taxas variam de 17% (Luxemburgo) a 27% (Hungria)
- Obrigação de faturas eletrônicas (e-invoicing) na UE
- DPO obrigatório na União Europeia
- Data residency obrigatória (dados armazenados na EU)

**Estratégia de entrada:**
- Escritório central em Lisboa (hub para Europa)
- Escritório em Madrid e Londres
- Equipe de vendas local em cada país
- Parcerias com MPI Europe, Eventex e associações locais
- Data center eu-west-1 obrigatório
- Certificação ISO 27001 + SOC 2

**Marcos:**
| Mês | Marco |
|-----|-------|
| M37 | Lançamento Portugal (pt-PT, EUR, Adyen) |
| M39 | Lançamento Espanha (es-ES, EUR, Redsys) |
| M42 | Lançamento Reino Unido (en-GB, GBP, Stripe) |
| M45 | Lançamento Alemanha (de-DE, EUR, Adyen) |
| M48 | Lançamento França (fr-FR, EUR, Adyen) |
| M48 | 300 contas europeias + ARR EUR 18M |

---

## INT-000100 — Multi-idioma

### INT-000110 — Arquitetura de i18n

O EventOS AI utilizará o **next-intl** como biblioteca principal de internacionalização, integrada ao framework Next.js.

**Stack tecnológica:**
- Framework: Next.js 15+ com App Router
- Biblioteca i18n: next-intl v4.x
- Armazenamento de traduções: JSON com namespacing por domínio
- Detecção de idioma: Accept-Language header + geolocalização por IP
- Rotas: /[locale]/path (ex: /pt-BR/events, /en/events, /es/events)

**Estrutura de diretórios:**
```
src/
  i18n/
    messages/
      pt-BR.json
      en.json
      es.json
    request.ts
    routing.ts
    navigation.ts
  app/
    [locale]/
      (dashboard)/
      (public)/
```

**Namespaces de tradução:**
| Namespace | Descrição | Tamanho estimado |
|-----------|-----------|------------------|
| common | Botões, labels, mensagens genéricas | 200 entradas |
| auth | Login, registro, recuperação de senha | 150 entradas |
| events | Criação, edição, listagem de eventos | 400 entradas |
| tickets | Tipos de ingresso, check-in, relatórios | 300 entradas |
| billing | Planos, faturas, histórico de pagamentos | 250 entradas |
| dashboard | Métricas, gráficos, widgets | 180 entradas |
| notifications | Emails, push, SMS | 120 entradas |
| errors | Mensagens de erro, validação, exceptions | 200 entradas |
| locale | Termos de localização (moeda, data, feriados) | 100 entradas |

### INT-000120 — Mapa de Idiomas

| Código | Idioma | País primário | Fase | Cobertura atual (alvo) |
|--------|--------|---------------|------|------------------------|
| pt-BR | Português brasileiro | Brasil | 1 | 100% |
| es-MX | Espanhol mexicano | México | 2 | 100% |
| es-CO | Espanhol colombiano | Colômbia | 2 | 95% |
| es-CL | Espanhol chileno | Chile | 2 | 90% |
| es-AR | Espanhol argentino | Argentina | 2 | 90% |
| en-US | Inglês americano | Estados Unidos | 3 | 100% |
| en-CA | Inglês canadense | Canadá | 3 | 95% |
| pt-PT | Português europeu | Portugal | 4 | 100% |
| es-ES | Espanhol europeu | Espanha | 4 | 100% |
| en-GB | Inglês britânico | Reino Unido | 4 | 100% |
| de-DE | Alemão | Alemanha | 4 | 80% |
| fr-FR | Francês | França | 4 | 80% |

### INT-000130 — Processo de Tradução

**Fluxo de tradução automática com IA:**

1. Desenvolvedor adiciona nova chave no arquivo de origem (pt-BR)
2. Pipeline CI detecta alterações no diretório `messages/`
3. Script Node.js extrai novas chaves e envia para API de tradução (OpenAI / Gemini)
4. IA gera tradução para todos os idiomas ativos
5. Revisor humano valida as traduções (espanhol, inglês, português)
6. Pull request é aberto com as traduções validadas
7. Aprovado e mergeado — deploy contínuo

**Ferramenta de tradução:**
```typescript
// apps/web/src/i18n/translate.ts
import OpenAI from 'openai';

interface TranslateOptions {
  sourceLocale: string;
  targetLocale: string;
  text: string;
  namespace: string;
  context?: string;
}

export async function translateWithAI(options: TranslateOptions): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `Traduza o seguinte texto do ${options.sourceLocale} para o ${options.targetLocale}.
  Contexto: Plataforma SaaS de gestão de eventos.
  Domínio: ${options.namespace}.
  ${options.context ? `Contexto adicional: ${options.context}` : ''}
  Mantenha o tom profissional mas amigável.
  Texto: "${options.text}"
  Tradução:`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0].message.content?.replace(/"/g, '').trim() ?? options.text;
}
```

**Política de qualidade:**
- pt-BR, en-US: tradução humana + revisão (qualidade 100%)
- espanhol variações: tradução IA + revisão humana (qualidade 95%+)
- de-DE, fr-FR: tradução IA com revisão amostral (qualidade 85%+)
- Atualização mensal de glossário técnico
- Testes automatizados de i18n detectam chaves faltantes

---

## INT-000200 — Multi-moeda

### INT-000210 — Moedas Suportadas

| Código | Moeda | Símbolo | Locale | Casas decimais | Formato |
|--------|-------|---------|--------|----------------|---------|
| BRL | Real brasileiro | R$ | pt-BR | 2 | R$ 1.234,56 |
| USD | Dólar americano | $ | en-US | 2 | $1,234.56 |
| EUR | Euro | € | pt-PT / es-ES | 2 | 1.234,56 € |
| ARS | Peso argentino | $ | es-AR | 2 | $ 1.234,56 |
| CLP | Peso chileno | $ | es-CL | 0 | $ 1.235 |
| COP | Peso colombiano | $ | es-CO | 2 | $ 1.234,56 |
| MXN | Peso mexicano | $ | es-MX | 2 | $ 1,234.56 |
| GBP | Libra esterlina | £ | en-GB | 2 | £1,234.56 |
| CAD | Dólar canadense | C$ | en-CA | 2 | C$1,234.56 |

### INT-000220 — Conversão Automática de Moedas

**Arquitetura de câmbio:**

```
┌─────────────────┐      ┌────────────────────┐
│  ExchangeRate    │      │  Redis Cache       │
│  API (provedor)  │─────▶│  TTL: 15 minutos   │
└─────────────────┘      └────────┬───────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────┐
│  CurrencyService (Microsserviço)                │
│  - getRate(from, to)                            │
│  - convert(amount, from, to)                    │
│  - getSupportedCurrencies()                     │
│  - formatCurrency(amount, code, locale)         │
└────────────────────────────────────────────────┘
```

**Provedores de taxa de câmbio:**
| Provedor | API | Free Tier | Rate Limiting | Uso |
|----------|-----|-----------|---------------|-----|
| ExchangeRate-API | exchangerate-api.com | 1.500 req/mês | 5 req/seg | Fallback |
| Open Exchange Rates | openexchangerates.org | 1.000 req/mês | 3 req/seg | Primário |
| AwesomeAPI (BRL) | awesomeapi.com.br | Ilimitado | 10 req/seg | Taxas BRL |

**Implementação do conversor:**
```typescript
// apps/web/src/lib/currency/currency-service.ts
interface CurrencyRate {
  code: string;
  rateToUSD: number;
  updatedAt: Date;
}

export class CurrencyService {
  private cacheTtlMs = 15 * 60 * 1000; // 15 minutes

  async convert(
    amount: number,
    from: string,
    to: string,
  ): Promise<{ amount: number; rate: number; convertedAt: Date }> {
    if (from === to) return { amount, rate: 1, convertedAt: new Date() };

    const rates = await this.getRates();
    const rateFrom = rates[from] ?? 1;
    const rateTo = rates[to] ?? 1;
    const rate = rateTo / rateFrom;

    return {
      amount: Number((amount * rate).toFixed(2)),
      rate: Number(rate.toFixed(6)),
      convertedAt: new Date(),
    };
  }

  format(amount: number, currency: string, locale: string): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(amount);
  }
}
```

### INT-000230 — Gateways de Pagamento por Região

**Matriz de gateways:**

| Região | Gateway Primário | Gateway Secundário | Métodos suportados |
|--------|-----------------|-------------------|--------------------|
| Brasil | PagSeguro / Gerencianet | Cielo / Adyen BR | PIX, boleto, cartão crédito (6x), débito |
| México | MercadoPago MX | Conekta | OXXO, SPEI, cartão crédito |
| Colômbia | MercadoPago CO | Epay | PSE, cartão crédito, efecty |
| Chile | MercadoPago CL | Khipu / Flow | Khipu, Webpay, cartão crédito, Sencillito |
| Argentina | MercadoPago AR | Modo | Rapipago, PagoFácil, cartão crédito, transferência |
| EUA | Stripe | PayPal | Cartão crédito, ACH, Apple Pay, Google Pay |
| Canadá | Stripe | Moneris | Cartão crédito, Interac, Apple Pay |
| Portugal | Adyen | Stripe | MB Way, Multibanco, cartão crédito |
| Espanha | Redsys | Adyen | Bizum, cartão crédito, transferência |
| Reino Unido | Stripe | Adyen | Cartão crédito, Apple Pay, Google Pay, BACS |

**Padrão de implementação:**
```typescript
// apps/api/src/payment/gateway-registry.ts
const gatewayRegistry: Record<string, PaymentGatewayConfig> = {
  BR: {
    primary: 'pagseguro',
    secondary: 'cielo',
    methods: ['pix', 'boleto', 'credit_card'],
    currency: 'BRL',
    installmentsMax: 6,
    autoReconcile: true, // PIX instantâneo
  },
  MX: {
    primary: 'mercadopago',
    secondary: 'conekta',
    methods: ['oxxo', 'spei', 'credit_card'],
    currency: 'MXN',
    installmentsMax: 12,
    autoReconcile: false,
  },
  US: {
    primary: 'stripe',
    secondary: 'paypal',
    methods: ['credit_card', 'ach_debit', 'apple_pay', 'google_pay'],
    currency: 'USD',
    installmentsMax: 1,
    autoReconcile: true,
  },
};
```

**Fluxo de pagamento internacional:**
1. Usuário seleciona país/região no checkout
2. Sistema determina moeda local
3. Gateway é selecionado com base na região do comprador
4. Valor convertido é exibido na moeda local
5. Transação processada no gateway local
6. Settlement é feito na moeda base da conta (configurável)
7. Taxa de câmbio + spread é registrada na transação
8. Relatório financeiro multi-moeda é gerado

---

## INT-000300 — Aspectos Legais

### INT-000310 — LGPD (Brasil) — Lei Geral de Proteção de Dados

**Escopo:** Lei 13.709/2018 — aplicável a todos os dados de cidadãos brasileiros.

**Requisitos de compliance no EventOS AI:**

| Requisito | Implementação | Prioridade |
|-----------|--------------|------------|
| Consentimento explícito | Banner de cookies + opt-in granular | Crítica |
| Direito de acesso | API de exportação de dados do usuário | Crítica |
| Direito de exclusão | Hard delete com confirmação em 30 dias | Crítica |
| Portabilidade | Exportação em JSON/CSV | Alta |
| DPO | Nomeação de Encarregado (DPO) + publicação de contato | Crítica |
| Registro de tratamento | Log de todas as operações com dados pessoais | Crítica |
| Relatório de impacto | ROPA (Record of Processing Activities) | Alta |
| Notificação de vazamento | Comunicação à ANPD + titulares em 72h | Crítica |
| Bases legais | 10 bases legais implementadas (art. 7º) | Crítica |
| Anonimização | Dados anonimizados para BI e analytics | Média |

**Tabela de dados pessoais tratados:**
| Categoria | Dados | Base legal | Retenção |
|-----------|-------|------------|----------|
| Identificação | Nome, CPF, RG, data de nascimento | Execução contratual | 5 anos após fim do contrato |
| Contato | Email, telefone, endereço | Execução contratual / Legítimo interesse | 5 anos |
| Financeiro | Cartão tokenizado, histórico de pagamentos | Execução contratual / Obrigação legal | 6 anos (fiscal) |
| Evento | Preferências, histórico de eventos | Legítimo interesse | 2 anos |
| Biometria | Foto (credencial) | Consentimento | Até revogação |

### INT-000320 — GDPR (Europa) — General Data Protection Regulation

**Escopo:** Regulamento (UE) 2016/679 — aplicável a todos os dados de cidadãos europeus.

**Diferenças críticas entre LGPD e GDPR:**
| Aspecto | LGPD | GDPR |
|---------|------|------|
| Idade consentimento | 18 anos | 16 anos (ajustável por país) |
| Multa máxima | 2% do faturamento (limitado a R$ 50M) | 4% do faturamento global OU € 20M |
| Data Protection Officer | Obrigatório | Obrigatório para processamento em larga escala |
| Transferência internacional | Cláusulas contratuais + S市场经济 | Standard Contractual Clauses (SCC) |
| Prazo resposta ao titular | 15 dias | 30 dias |
| Accountability | Programas de governança | Princípio de accountability + Privacy by Design |

**Requisitos específicos GDPR:**
| Requisito | Implementação |
|-----------|--------------|
| Data Residency | Dados de cidadãos europeus armazenados exclusivamente em eu-west-1 |
| Privacy by Design | Toda feature nova passa por privacy review |
| DPO Europeu | Representante legal na UE (escritório em Lisboa) |
| Consentimento | Opt-in granular, não pré-selecionado, fácil de revogar |
| DPIA | Data Protection Impact Assessment obrigatório para features de alto risco |
| Right to be Forgotten | Exclusão completa em todos os sistemas em até 30 dias |
| Data Portability | Exportação em formato estruturado, de uso comum e legível |
| Breach Notification | Notificação à autoridade em 72h + comunicação ao titular |
| SCC | Cláusulas contratuais padrão para transferência Brasil-Europa |

### INT-000330 — CCPA (Califórnia) — California Consumer Privacy Act

**Escopo:** Aplicável a negócios que coletam dados de residentes da Califórnia com receita anual > USD 25M.

**Requisitos CCPA:**
| Requisito | Implementação |
|-----------|--------------|
| Right to Know | Portal do titular com todos os dados coletados e compartilhados |
| Right to Delete | Exclusão de dados com exceções (obrigações legais) |
| Right to Opt-Out | Link "Do Not Sell My Personal Information" visível no site |
| Right to Non-Discrimination | Preços e serviços não podem ser alterados por opt-out |
| Categoria de dados | Divulgação completa das categorias coletadas nos 12 meses anteriores |
| Verificação de identidade | Processo de verificação robusto para requisições de titulares |
| Opt-in para menores | Menores de 16 anos: opt-in obrigatório; <13: consentimento parental |

**Diferenças CCPA vs LGPD:**
- CCPA foca em "opt-out" (não venda de dados); LGPD foca em "opt-in" (consentimento)
- CCPA não exige DPO, mas exige métodos claros para requisições
- CCPA tem threshold de receita; LGPD aplica-se a qualquer empresa que trate dados no Brasil
- Multas CCPA: USD 2.500 por violação não intencional, USD 7.500 por violação intencional

### INT-000340 — Leis de Proteção de Dados na América Latina

**Argentina — Lei 25.326:**
- Considerada uma das mais rigorosas da região
- Exige registro de bases de dados na AAIP (Agência de Acesso à Informação Pública)
- Consentimento prévio, informado e por escrito
- Prazo de retenção: enquanto durar a finalidade
- Multas: até ARS 1M (reajustável)
- DPO não obrigatório, mas altamente recomendado

**Colômbia — Lei 1581 de 2012:**
- Exige autorização prévia, expressa e informada
- Registro de bases de dados na SIC (Superintendência de Indústria e Comércio)
- Direitos ARCO (Acesso, Correção, Exclusão, Oposição)
- Prazo de retenção: conforme finalidade + obrigações legais
- Multas: até 2.000 salários mínimos mensais
- DPO obrigatório para processamento em larga escala

**Chile — Lei 19.628 (em reforma 2024-2025):**
- Legislação mais antiga da região (1999)
- Reforma em andamento para alinhamento com padrão GDPR
- Novo projeto de lei: multas de até 20.000 UTM (aproximadamente CLP 1.2B)
- Obrigatoriedade de notificação de violações
- Direitos ARCO ampliados
- DPO obrigatório (na nova lei)

**México — LFPDPPP (Lei Federal de Proteção de Dados Pessoais):**
- Aplicável a dados de cidadãos mexicanos
- Exige aviso de privacidade completo
- Consentimento tácito para dados não sensíveis; expresso para dados sensíveis
- Registro de tratamento de dados opcional
- Multas: até 320.000 UMA (aproximadamente MXN 32M)
- ARCO direitos implementados via INFOMEX

---

## INT-000400 — Infraestrutura Multi-Região

### INT-000410 — Topologia AWS Global

```
                    ┌────────────────────────────────┐
                    │    CloudFront CDN (Global)      │
                    │    Distribuição de conteúdo      │
                    │    Latência < 50ms worldwide     │
                    └────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  us-east-1    │   │  sa-east-1    │   │  eu-west-1    │
│  N. Virginia   │   │  São Paulo    │   │  Dublin       │
│  (EUA/Canadá)  │   │  (Brasil)     │   │  (Europa)     │
│               │   │               │   │               │
│  Primary: F3  │   │  Primary: F1  │   │  Primary: F4  │
│  Failover: F4 │   │  Failover: F1 │   │  Failover: F3 │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
              ┌────────────────────────────┐
              │  Route53 (Global)           │
              │  Latency-based routing      │
              │  Health checks automáticos  │
              └────────────────────────────┘
```

### INT-000420 — Recursos por Região

**us-east-1 (N. Virginia) — Fase 3 (EUA/Canadá):**
| Recurso | Especificação |
|---------|--------------|
| EKS cluster | 5 nodes m6i.xlarge (4 vCPU, 16 GiB cada) |
| RDS Aurora PostgreSQL | 2 instâncias db.r6g.large (multi-AZ) |
| ElastiCache Redis | 2 nós cache.r6g.large (cluster mode) |
| S3 | Data lake + assets de eventos |
| OpenSearch | 3 nós m6i.large.search |
| MSK (Kafka) | 3 brokers kafka.m5.large |

**sa-east-1 (São Paulo) — Fase 1 (Brasil):**
| Recurso | Especificação |
|---------|--------------|
| EKS cluster | 10 nodes m6i.xlarge (5 vCPU, 20 GiB cada) — maior demanda |
| RDS Aurora PostgreSQL | 3 instâncias db.r6g.xlarge (multi-AZ + read replica) |
| ElastiCache Redis | 3 nós cache.r6g.xlarge (cluster mode) |
| S3 | Assets de eventos + backups |
| OpenSearch | 5 nós m6i.large.search |
| MSK (Kafka) | 5 brokers kafka.m5.large |

**eu-west-1 (Dublin) — Fase 4 (Europa):**
| Recurso | Especificação |
|---------|--------------|
| EKS cluster | 5 nodes m6i.xlarge (4 vCPU, 16 GiB cada) |
| RDS Aurora PostgreSQL | 2 instâncias db.r6g.large (multi-AZ) |
| ElastiCache Redis | 2 nós cache.r6g.large (cluster mode) |
| S3 | Assets + data residency EU |
| OpenSearch | 3 nós m6i.large.search |
| MSK (Kafka) | 3 brokers kafka.m5.large |

### INT-000430 — CloudFront CDN Global

**Configuração:**
- Distribuição global com 450+ PoPs (Points of Presence)
- Cache de assets estáticos (JS, CSS, imagens): TTL 24h
- Cache de API responses: TTL 60s (com invalidate por evento)
- Lambda@Edge para geolocalização e roteamento de idioma
- Web Application Firewall (WAF) com regras regionais
- Origin Shield para reduzir carga nos origins

**Lambda@Edge — Roteamento de Idioma:**
```typescript
// edge/redirect-locale.ts
exports.handler = (event: any) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  const cloudfrontCountry = headers['cloudfront-viewer-country']?.[0]?.value;

  const countryToLocale: Record<string, string> = {
    BR: 'pt-BR',
    US: 'en',
    CA: 'en',
    MX: 'es',
    CO: 'es',
    CL: 'es',
    AR: 'es',
    PT: 'pt-PT',
    ES: 'es-ES',
    GB: 'en-GB',
    IE: 'en-GB',
    DE: 'de-DE',
    FR: 'fr-FR',
  };

  const uri = request.uri;

  // Skip if already has locale prefix
  if (/^\/(pt-BR|en|es|pt-PT|en-GB|es-ES|de-DE|fr-FR)\//.test(uri)) {
    return request;
  }

  const locale = countryToLocale[cloudfrontCountry] || 'en';
  const newUri = `/${locale}${uri}`;
  request.uri = newUri;

  return request;
};
```

### INT-000440 — Estratégia de Failover

**Cross-region disaster recovery:**

| Cenário | Ação | RTO | RPO |
|---------|------|-----|-----|
| Falha sa-east-1 | DNS failover para us-east-1 (pico de tráfego Brasil vai para N. Virginia) | 5 min | 1 min |
| Falha us-east-1 | Tráfego EUA vai para eu-west-1 | 5 min | 1 min |
| Falha eu-west-1 | Tráfego Europa vai para us-east-1 | 5 min | 1 min |
| Falha multi-região | Modo degradado com serviço mínimo em região saudável | 15 min | 5 min |

**Mecanismos:**
- RDS Cross-region snapshot (a cada 15 minutos)
- S3 Cross-region replication (CRR) ativada
- EKS backup via Velero para S3 em região secundária
- R53 health checks com failover automático
- DR test obrigatório a cada 6 meses

---

## INT-000500 — Localização

### INT-000510 — Formatos de Data e Hora

| País/Região | Formato data | Exemplo | Formato hora | Exemplo | Locale ICU |
|-------------|-------------|---------|-------------|---------|-----------|
| Brasil | dd/MM/aaaa | 15/07/2026 | HH:mm (24h) | 14:30 | pt-BR |
| México | dd/MM/aaaa | 15/07/2026 | HH:mm (24h) / h:mm AM PM | 14:30 / 2:30 PM | es-MX |
| Colômbia | dd/MM/aaaa | 15/07/2026 | HH:mm (24h) | 14:30 | es-CO |
| Chile | dd-MM-aaaa | 15-07-2026 | HH:mm (24h) | 14:30 | es-CL |
| Argentina | dd/MM/aaaa | 15/07/2026 | HH:mm (24h) | 14:30 | es-AR |
| EUA | MM/dd/aaaa | 7/15/2026 | h:mm AM/PM (12h) | 2:30 PM | en-US |
| Canadá (inglês) | MM/dd/aaaa | 7/15/2026 | h:mm AM/PM (12h) | 2:30 PM | en-CA |
| Portugal | dd/MM/aaaa | 15/07/2026 | HH:mm (24h) | 14:30 | pt-PT |
| Espanha | dd/MM/aaaa | 15/07/2026 | HH:mm (24h) | 14:30 | es-ES |
| Reino Unido | dd/MM/aaaa | 15/07/2026 | HH:mm (24h) | 14:30 | en-GB |
| Alemanha | dd.MM.aaaa | 15.07.2026 | HH:mm (24h) | 14:30 | de-DE |
| França | dd/MM/aaaa | 15/07/2026 | HH:mm (24h) | 14:30 | fr-FR |

### INT-000520 — Fuso Horário

**Fusos suportados pelo EventOS AI:**

| Fuso | Abreviação | Offset UTC | Regiões atendidas |
|------|-----------|------------|-------------------|
| America/Sao_Paulo | BRT | -03:00 | Brasil (padrão) |
| America/Manaus | AMT | -04:00 | Brasil (Norte) |
| America/Noronha | FNT | -02:00 | Brasil (arquipélagos) |
| America/Mexico_City | CST | -06:00 | México (padrão) |
| America/Bogota | COT | -05:00 | Colômbia |
| America/Santiago | CLT | -04:00 | Chile (padrão) |
| America/Argentina/Buenos_Aires | ART | -03:00 | Argentina |
| America/New_York | ET | -05:00 | EUA (Costa Leste) |
| America/Chicago | CT | -06:00 | EUA (Centro) |
| America/Denver | MT | -07:00 | EUA (Montanhas) |
| America/Los_Angeles | PT | -08:00 | EUA (Costa Oeste) |
| America/Anchorage | AKT | -09:00 | EUA (Alasca) |
| America/Toronto | ET | -05:00 | Canadá (Ontário) |
| America/Vancouver | PT | -08:00 | Canadá (BC) |
| Europe/Lisbon | WET | +00:00 | Portugal |
| Europe/Madrid | CET | +01:00 | Espanha |
| Europe/London | GMT | +00:00 | Reino Unido |
| Europe/Berlin | CET | +01:00 | Alemanha |
| Europe/Paris | CET | +01:00 | França |

**Estratégia de exibição:**
- Eventos exibidos no fuso horário do evento (definido pelo organizador)
- Usuário vê data/hora convertida para seu fuso local
- Check-in e agenda seguem o fuso do evento
- Toda comunicação (email, push) usa o fuso do evento e exibe "Fuso do evento: [cidade]"
- Servidor armazena tudo em UTC; conversão ocorre no cliente

**Implementação:**
```typescript
// apps/web/src/lib/locale/timezone.ts
import { formatInTimeZone } from 'date-fns-tz';

export function formatEventDate(
  utcDate: Date,
  eventTimezone: string,
  locale: string,
): string {
  const dateFormat = getDateFormatForLocale(locale);
  const timeFormat = getTimeFormatForLocale(locale);

  return formatInTimeZone(utcDate, eventTimezone, `${dateFormat} ${timeFormat}`);
}

export function getUserLocalTime(
  utcDate: Date,
  userTimezone: string,
): Date {
  return utcDate; // handled by Intl.DateTimeFormat on client
}
```

### INT-000530 — Moeda e Número

**Formatação numérica ICU por região:**

| Locale | Decimal | Grupo | Moeda | Exemplo (1234567.89) |
|--------|---------|-------|-------|---------------------|
| pt-BR | , | . | R$ 1.234.567,89 | R$ 1.234.567,89 |
| en-US | . | , | $1,234,567.89 | $1,234,567.89 |
| es-MX | . | , | $1,234,567.89 | $1,234,567.89 |
| es-CO | , | . | $ 1.234.567,89 | $ 1.234.567,89 |
| es-CL | , | . | $ 1.234.568 | (CLP sem decimais) |
| es-AR | , | . | $ 1.234.567,89 | $ 1.234.567,89 |
| en-GB | . | , | £1,234,567.89 | £1,234,567.89 |
| pt-PT | , | . | 1.234.567,89 € | 1.234.567,89 € |
| es-ES | , | . | 1.234.567,89 € | 1.234.567,89 € |
| de-DE | , | . | 1.234.567,89 € | 1.234.567,89 € |
| fr-FR | , | . | 1 234 567,89 € | 1 234 567,89 € |

**Implementação via Intl API:**
```typescript
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'CLP' ? 0 : 2,
  }).format(amount);
}

export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
```

### INT-000540 — Feriados Regionais

**Gerenciamento de feriados:**
- Biblioteca: date-fns-holidays (extendida com dados customizados)
- Feriados nacionais de cada país (fixos e móveis)
- Feriados regionais/estaduais por estado relevante
- Feriados religiosos (baseados em algoritmo, não em lista fixa)

**Brasil — feriados nacionais:**
| Data | Feriado | Tipo |
|------|---------|------|
| 1/1 | Confraternização Universal | Fixo |
| Carnaval | Carnaval (2 dias) | Móvel (fevereiro/março) |
| Sexta-Feira Santa | Paixão de Cristo | Móvel |
| 21/4 | Tiradentes | Fixo |
| 1/5 | Dia do Trabalho | Fixo |
| Corpus Christi | Corpus Christi | Móvel |
| 7/9 | Independência | Fixo |
| 12/10 | Nossa Senhora Aparecida | Fixo |
| 2/11 | Finados | Fixo |
| 15/11 | Proclamação da República | Fixo |
| 20/11 | Consciência Negra | Fixo (desde 2024) |
| 25/12 | Natal | Fixo |

**EUA — feriados nacionais:**
| Data | Feriado | Tipo |
|------|---------|------|
| 1/1 | New Year's Day | Fixo |
| 3ª segunda de janeiro | Martin Luther King Day | Móvel |
| 3ª segunda de fevereiro | Presidents' Day | Móvel |
| Última segunda de maio | Memorial Day | Móvel |
| 4/7 | Independence Day | Fixo |
| 1ª segunda de setembro | Labor Day | Móvel |
| 2ª segunda de outubro | Columbus Day | Móvel |
| 11/11 | Veterans Day | Fixo |
| 4ª quinta de novembro | Thanksgiving | Móvel |
| 25/12 | Christmas | Fixo |

**Portugal — feriados nacionais:**
| Data | Feriado |
|------|---------|
| 1/1 | Ano Novo |
| Carnaval | Terça-feira de Carnaval |
| Sexta-Feira Santa | Móvel |
| 25/4 | Dia da Liberdade |
| 1/5 | Dia do Trabalhador |
| 10/6 | Dia de Portugal |
| 15/8 | Assunção de Nossa Senhora |
| 5/10 | Implantação da República |
| 1/11 | Todos os Santos |
| 1/12 | Restauração da Independência |
| 8/12 | Imaculada Conceição |
| 25/12 | Natal |

**Funcionalidade de calendário no EventOS AI:**
- Organizador seleciona o país do evento
- Feriados nacionais são automaticamente bloqueados como não úteis
- Sugestão de datas alternativas evitando feriados
- Tratamento especial para feriados móveis (Páscoa, Carnaval)
- Configuração manual de dias úteis/não úteis pelo organizador

---

## INT-000600 — Roadmap de Expansão (5 Anos)

### Ano 1 — Fundação Brasil (Meses 1-12)

**Trimestre 1 (M1-M3):**
- [ ] MVP da plataforma em pt-BR (100% interface)
- [ ] Suporte a moeda BRL com formatação local
- [ ] Gateway PagSeguro (PIX + cartão + boleto)
- [ ] Sistema de usuários multi-tenant
- [ ] Cadastro de eventos básico
- [ ] Venda de ingressos nacional
- [ ] Check-in presencial com QR Code
- [ ] Estrutura de diretórios next-intl preparada
- [ ] Primeiro deployment em sa-east-1
- [ ] 10 clientes pagantes

**Trimestre 2 (M4-M6):**
- [ ] LGPD completo (DPO, consentimento, direitos ARCO)
- [ ] Emissão de nota fiscal eletrônica (NFS-e)
- [ ] Dashboard de métricas básico
- [ ] Integração com Receita Federal (validação CNPJ)
- [ ] Suporte a eventos híbridos
- [ ] App mobile (check-in + agenda)
- [ ] 100 contas ativas
- [ ] CloudFront configurado para Brasil

**Trimestre 3 (M7-M9):**
- [ ] Inteligência artificial básica (recomendação de datas)
- [ ] Relatórios exportáveis (PDF, Excel)
- [ ] API pública (REST + GraphQL)
- [ ] Webhooks para integração
- [ ] Notificações push e email
- [ ] 250 contas ativas

**Trimestre 4 (M10-M12):**
- [ ] Marketplace de fornecedores
- [ ] CRM de participantes
- [ ] Gamificação de eventos
- [ ] Chat ao vivo com IA
- [ ] 500 contas ativas
- [ ] ARR R$ 12M
- [ ] NPS 75+

### Ano 2 — Expansão América Latina (Meses 13-24)

**Trimestre 5 (M13-M15):**
- [ ] Estrutura de i18n completa (next-intl + namespaces)
- [ ] Suporte a espanhol latino-americano (es-MX, es-CO)
- [ ] Moedas MXN e COP
- [ ] Gateway MercadoPago (México + Colômbia)
- [ ] Lançamento México
- [ ] Lançamento Colômbia
- [ ] 50 contas LATAM

**Trimestre 6 (M16-M18):**
- [ ] Suporte es-CL e es-AR
- [ ] Moedas CLP e ARS
- [ ] Gateway MercadoPago (Chile + Argentina)
- [ ] Lançamento Chile
- [ ] Lançamento Argentina
- [ ] Conformidade LGPD Argentina + Colômbia
- [ ] 100 contas LATAM

**Trimestre 7 (M19-M21):**
- [ ] Tradução automática com IA integrada ao CI/CD
- [ ] Dashboard multi-moeda para organizadores
- [ ] Suporte a nota fiscal eletrônica LATAM
- [ ] Feriados regionais LATAM implementados
- [ ] Calendário inteligente com feriados

**Trimestre 8 (M22-M24):**
- [ ] 200 contas LATAM
- [ ] ARR USD 8M
- [ ] Preparação técnica para entrada nos EUA
- [ ] Início da tradução en-US (revisão humana)
- [ ] Estudo de conformidade CCPA
- [ ] Contratação equipe EUA (VP Sales, Eng)

### Ano 3 — EUA e Canadá (Meses 25-36)

**Trimestre 9 (M25-M27):**
- [ ] Interface completa en-US
- [ ] Moeda USD
- [ ] Gateway Stripe (primário) + PayPal (secundário)
- [ ] Formato 12h AM/PM + MM/dd/aaaa
- [ ] Fusos horários norte-americanos
- [ ] Feriados EUA implementados
- [ ] Lançamento EUA
- [ ] Lançamento Canadá (CAD + Moneris)
- [ ] Certificação SOC 2 Type II

**Trimestre 10 (M28-M30):**
- [ ] Conformidade CCPA completa
- [ ] Acessibilidade WCAG 2.1 AA
- [ ] Sales tax calculation automatizado (estados EUA)
- [ ] Integração Salesforce + HubSpot
- [ ] 100 contas norte-americanas

**Trimestre 11 (M31-M33):**
- [ ] Conformidade PIPEDA (Canadá)
- [ ] Suporte a 1099-NEC para fornecedores
- [ ] Múltiplos fusos em um mesmo evento
- [ ] Eventos cross-border (EUA + Canadá)
- [ ] Marketplace norte-americano

**Trimestre 12 (M34-M36):**
- [ ] 500 contas norte-americanas
- [ ] ARR USD 25M
- [ ] Preparação técnica para Europa
- [ ] Início da tradução pt-PT, es-ES, en-GB
- [ ] Estudo GDPR + contratação DPO Europa
- [ ] Escritório Nova York + Lisboa

### Ano 4 — Europa (Meses 37-48)

**Trimestre 13 (M37-M39):**
- [ ] Infraestrutura eu-west-1 (Dublin)
- [ ] Data residency Europa (dados armazenados na EU)
- [ ] Interface pt-PT + es-ES + en-GB
- [ ] Moedas EUR + GBP
- [ ] Gateway Adyen (primário) + Stripe (secundário)
- [ ] Lançamento Portugal
- [ ] Lançamento Espanha

**Trimestre 14 (M40-M42):**
- [ ] Conformidade GDPR completa (DPO, DPIA, SCC, breach notification)
- [ ] VAT handling automático por país
- [ ] e-invoicing (fatura eletrônica UE)
- [ ] Lançamento Reino Unido
- [ ] 150 contas europeias

**Trimestre 15 (M43-M45):**
- [ ] Suporte a de-DE e fr-FR
- [ ] Gateway Redsys (Espanha)
- [ ] Feriados europeus implementados
- [ ] Lançamento Alemanha
- [ ] 200 contas europeias

**Trimestre 16 (M46-M48):**
- [ ] Lançamento França
- [ ] 300 contas europeias
- [ ] ARR EUR 18M
- [ ] Certificação ISO 27001
- [ ] DR test completo cross-region

### Ano 5 — Consolidação Global (Meses 49-60)

**Objetivos estratégicos:**
- [ ] Operação plena em 15+ países
- [ ] 12+ idiomas suportados com qualidade 90%+
- [ ] 10+ moedas com conversão em tempo real
- [ ] 3 regiões AWS operando em active-active
- [ ] ARR global: USD 70M+
- [ ] 2.000+ contas ativas globalmente
- [ ] 500.000+ eventos gerenciados
- [ ] NPS global 70+
- [ ] Churn rate < 2% ao mês

**Próximos mercados a avaliar:**
- Japão (JPY, ja-JP) — eventos corporativos gigantes
- Austrália (AUD, en-AU) — mercado de convenções
- Emirados Árabes (AED, ar-AE) — Dubai como hub de eventos
- Índia (INR, hi-IN / en-IN) — crescimento explosivo
- África do Sul (ZAR, en-ZA) — gateway para África

**Melhorias contínuas:**
- Sistema de tradução comunitária (crowdsourcing)
- Marketplace global de fornecedores
- AI multilingue (chatbot, recomendações, descrições)
- Pagamentos em criptomoedas (USDC, BTC)
- Relatórios financeiros multi-moeda consolidados
- Suporte a fusos horários de todos os países do mundo

---

## INT-000700 — Métricas de Internacionalização

### INT-000710 — KPIs de Expansão

| KPI | Meta Ano 1 | Meta Ano 2 | Meta Ano 3 | Meta Ano 4 | Meta Ano 5 |
|-----|-----------|-----------|-----------|-----------|-----------|
| Países ativos | 1 | 5 | 7 | 12 | 15+ |
| Idiomas | 1 | 4 | 5 | 9 | 12+ |
| Moedas | 1 | 5 | 7 | 9 | 10+ |
| Contas ativas | 500 | 700 | 1.200 | 1.500 | 2.000+ |
| ARR (USD) | ~$2M | ~$10M | ~$35M | ~$53M | ~$70M+ |
| NPS | 75 | 72 | 70 | 68 | 70 |
| Disponibilidade | 99,9% | 99,95% | 99,99% | 99,99% | 99,995% |
| Churn rate | 3% | 2,5% | 2% | 2% | <2% |

### INT-000720 — Monitoramento de Performance Global

**Ferramentas:**
- CloudWatch (métricas de infraestrutura por região)
- CloudFront Real-Time Logs (latência por país)
- Synthetics canaries (health checks a cada 5 min de cada região)
- Sentry (rastreamento de erros com informação de localização)
- Grafana dashboards por região

**Indicadores monitorados:**
- Latência média de página: < 500ms (global)
- Latência de API P95: < 300ms
- Disponibilidade: 99,99% (SLA)
- Erros de tradução: < 0,1% das requisições i18n
- Conversão de checkout: monitorada por moeda
- Taxa de abandono por gateway de pagamento
- Tempo de sincronização cross-region: < 2s

---

## INT-000800 — Glossário de Internacionalização

| Termo | Definição |
|-------|-----------|
| i18n | Internacionalização — preparação do software para múltiplos idiomas e regiões |
| l10n | Localização — adaptação a um mercado específico (idioma, cultura, legislação) |
| g11n | Globalização — processo combinado de i18n + l10n |
| Locale | Conjunto de parâmetros linguísticos e culturais (idioma + região) |
| ICU Message | Formato padrão para mensagens internacionalizáveis |
| Translation Memory | Banco de traduções reutilizáveis entre projetos |
| Pseudo-localization | Técnica de teste que substitui caracteres para validar i18n |
| RTL | Right-to-Left — idiomas escritos da direita para a esquerda (árabe, hebraico) |
| Data Residency | Obrigação de armazenar dados em uma jurisdição geográfica específica |
| SCC | Standard Contractual Clauses — cláusulas contratuais para transferência de dados |
| DPIA | Data Protection Impact Assessment — avaliação de impacto de proteção de dados |
| Cross-border | Operações comerciais entre países diferentes |
| Settlement | Liquidação financeira — conversão e transferência de valores entre moedas |
| Spread | Diferença entre taxa de câmbio comercial e taxa aplicada ao cliente |
| ROPA | Record of Processing Activities — registro das operações de tratamento de dados |

---

## INT-000900 — Referências

### Documentos internos:
- VOL-001 — Estratégia, Visão e Fundação
- VOL-002 — Enterprise Architecture (arquitetura multi-região)
- VOL-008 — DevOps e Infraestrutura (deploy multi-região)
- VOL-011 — Segurança (proteção de dados e criptografia)
- ADR-002 — Tech Stack (decisão por next-intl)

### Legislação:
- Brasil: Lei 13.709/2018 (LGPD) — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- Europa: Regulamento (UE) 2016/679 (GDPR) — https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Califórnia: California Civil Code §§ 1798.100-1798.199 (CCPA) — https://oag.ca.gov/privacy/ccpa
- Argentina: Lei 25.326 — http://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm
- Colômbia: Lei 1581 de 2012 — https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981
- México: LFPDPPP — https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf

### APIs e serviços:
- next-intl: https://next-intl-docs.vercel.app
- ExchangeRate-API: https://www.exchangerate-api.com
- Open Exchange Rates: https://openexchangerates.org
- AwesomeAPI (câmbio BRL): https://docs.awesomeapi.com.br
- date-fns: https://date-fns.org (para formatação de data por timezone)
- MercadoPago API: https://www.mercadopago.com.br/developers
- Stripe API: https://stripe.com/docs/api
- Adyen API: https://docs.adyen.com

---

## Histórico de Revisões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 0.0.1 | Jul/2026 | Equipe EventOS AI | Versão inicial do documento de internacionalização |

---

**Fim do VOL-015**
