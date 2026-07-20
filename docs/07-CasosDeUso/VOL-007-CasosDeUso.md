# VOLUME 07 — Casos de Uso

**Plataforma:** EventOS AI Enterprise
**Versão:** 1.0
**Data:** 2026-07-16

## Sumário

1. Atores
2. Fluxos do Organizador
3. Fluxos do Participante
4. Fluxos do Patrocinador
5. Fluxos do Administrador
6. Fluxos Financeiros
7. Fluxos de IA
8. Diagramas de Sequência

---

## 1. Atores

| Ator | Descrição |
|------|-----------|
| **Organizador** | Pessoa física ou jurídica que cria e gerencia eventos. Define lotes, preços, agenda, palestrantes, landing pages e todo o ciclo de vida do evento. |
| **Participante** | Usuário final que se inscreve, adquire ingresso, realiza check-in, participa das atividades, acessa certificados e interage com outros participantes. |
| **Patrocinador** | Empresa que contrata cotas de patrocínio para divulgar sua marca no evento. Acompanha métricas de estande, gera relatórios de ROI e gerencia leads capturados. |
| **Administrador** | Superusuário da plataforma. Gerencia organizações, planos de assinatura, cobranças, auditoria de ações e suporte a todos os atores. |
| **Financeiro** | Ator vinculado ao setor financeiro da organização. Processa pagamentos, solicita e aprova reembolsos, emite notas fiscais e concilia transações. |
| **Marketing** | Profissional responsável por criar campanhas, disparar e-mails automatizados, gerenciar conteúdo das landing pages e configurar SEO. |
| **IA Agent** | Agente autônomo de inteligência artificial que executa ações em nome do organizador mediante autorização prévia. Capaz de criar eventos, gerar campanhas e responder consultas em linguagem natural. |

---

## 2. Fluxos do Organizador

### UC-001: Criar Evento

**Ator principal:** Organizador

**Pré-condição:** Usuário logado com organização ativa

**Fluxo principal:**
1. Organizador acessa "Novo Evento"
2. Sistema exibe formulário com opção de criar manualmente ou com IA
3. Se manual: preenche nome, tipo, datas, local, capacidade
4. Se IA: acessa o UC-029 (Criar Evento com IA)
5. Sistema valida dados obrigatórios
6. Sistema cria evento em status "draft"
7. Sistema redireciona para página de configuração do evento

**Fluxo alternativo (dados inválidos):**
1. Sistema identifica campos obrigatórios não preenchidos
2. Sistema exibe mensagens de erro nos respectivos campos
3. Organizador corrige dados
4. Retorna ao passo 5 do fluxo principal

**Pós-condição:** Evento criado em status rascunho

---

### UC-002: Publicar Evento

**Ator principal:** Organizador

**Pré-condição:** Evento criado e configurado com itens mínimos obrigatórios

**Fluxo principal:**
1. Organizador acessa "Publicar"
2. Sistema valida integridade do evento (pelo menos um lote, data, local)
3. Sistema altera status do evento para "published"
4. Sistema disponibiliza landing page publicamente
5. Sistema notifica participantes pré-cadastrados (se houver)
6. Sistema exibe confirmação "Evento publicado com sucesso"

**Fluxo alternativo (validação falha):**
1. Sistema identifica itens pendentes (ex.: nenhum lote de ingressos criado)
2. Sistema exibe checklist de pendências
3. Organizador resolve pendências
4. Retorna ao passo 1

**Pós-condição:** Evento visível ao público com vendas abertas

---

### UC-003: Gerenciar Ingressos

**Ator principal:** Organizador

**Pré-condição:** Evento existente

**Fluxo principal:**
1. Organizador acessa "Ingressos" do evento
2. Sistema exibe lista de tipos de ingresso configurados
3. Organizador pode criar, editar ou desativar um tipo de ingresso
4. Ao criar: define nome, descrição, valor, quantidade máxima, data de início e fim da venda
5. Sistema valida dados
6. Sistema salva alterações
7. Sistema atualiza landing page e disponibilidade em tempo real

**Fluxo alternativo (ingresso esgotado):**
1. Sistema marca ingresso como "sold out"
2. Organizador pode aumentar quantidade ou criar novo lote

**Pós-condição:** Ingressos configurados e disponíveis para venda

---

### UC-004: Criar Lote de Preços

**Ator principal:** Organizador

**Pré-condição:** Evento publicado ou em edição

**Fluxo principal:**
1. Organizador acessa "Lotes de Preços"
2. Sistema exige lotes existentes com timer regressivo
3. Organizador clica em "Novo Lote"
4. Sistema exibe formulário: nome do lote, valor, quantidade de ingressos, data de início e fim
5. Organizador preenche e salva
6. Sistema valida se as datas não conflitam com lotes existentes
7. Sistema cria lote com timer automático
8. Sistema dispara notificação para leads cadastrados sobre novo lote

**Fluxo alternativo (conflito de datas):**
1. Sistema detecta sobreposição com lote ativo
2. Sistema sugere ajuste automático de datas
3. Organizador aceita sugestão ou ajusta manualmente

**Pós-condição:** Lote criado e disponível para compra dentro do período estipulado

---

### UC-005: Configurar Credenciamento

**Ator principal:** Organizador

**Pré-condição:** Evento publicado

**Fluxo principal:**
1. Organizador acessa "Credenciamento"
2. Sistema exibe opções: presencial, self-service (totem), digital (QR dinâmico)
3. Organizador seleciona modalidade
4. Sistema permite configurar campos a serem validados (nome, CPF, e-mail)
5. Organizador define se credenciamento será por lote, por dia ou único
6. Sistema salva configuração
7. Sistema gera QR codes individuais para cada ingresso vendido

**Fluxo alternativo (credenciamento com IA):**
1. Organizador ativa modo IA
2. IA Agent sugere configuração otimizada baseada no histórico do evento
3. Organizador confirma configuração sugerida

**Pós-condição:** Credenciamento configurado e QR codes gerados

---

### UC-006: Emitir Certificados

**Ator principal:** Organizador

**Pré-condição:** Evento encerrado com participantes que realizaram check-in

**Fluxo principal:**
1. Organizador acessa "Certificados"
2. Sistema exibe modelo padrão de certificado
3. Organizador personaliza: layout, texto, logotipo, data, carga horária
4. Sistema permite definir regras de emissão (presença mínima, por atividade)
5. Organizador seleciona participantes elegíveis
6. Sistema gera certificados em lote (PDF)
7. Sistema disponibiliza certificados na área do participante
8. Sistema envia e-mail com link de download

**Fluxo alternativo (certificado individual):**
1. Organizador busca participante por nome ou CPF
2. Sistema exibe dados de presença do participante
3. Organizador gera certificado individual

**Pós-condição:** Certificados emitidos e disponíveis para download

---

### UC-007: Visualizar Dashboard

**Ator principal:** Organizador

**Pré-condição:** Evento existente com dados de venda e/ou check-in

**Fluxo principal:**
1. Organizador acessa "Dashboard"
2. Sistema exibe painel com indicadores principais
3. Métricas exibidas: ingressos vendidos, receita bruta, receita líquida, taxa de conversão, check-ins realizados, público presente por horário
4. Organizador pode filtrar por período, lote, tipo de ingresso
5. Sistema atualiza dados em tempo real via WebSocket
6. Organizador pode exportar relatório em PDF ou CSV

**Fluxo alternativo (dados insuficientes):**
1. Sistema exibe dashboard parcial com dados disponíveis
2. Sistema sugere aguardar mais vendas para métricas significativas

**Pós-condição:** Organizador visualiza métricas do evento

---

### UC-008: Convidar Palestrantes

**Ator principal:** Organizador

**Pré-condição:** Evento em edição

**Fluxo principal:**
1. Organizador acessa "Palestrantes"
2. Sistema exibe lista de palestrantes já confirmados
3. Organizador clica em "Convidar Palestrante"
4. Sistema exibe formulário: nome, e-mail, mini bio, foto, links
5. Organizador preenche dados manualmente ou busca na base da plataforma
6. Sistema envia e-mail de convite com link de aceite
7. Palestrante recebe e-mail e confirma presença
8. Sistema notifica organizador sobre confirmação

**Fluxo alternativo (palestrante recusa):**
1. Palestrante clica em "Recusar" no e-mail
2. Sistema notifica organizador
3. Organizador busca novo palestrante

**Pós-condição:** Palestrante convidado e aguardando confirmação

---

### UC-009: Criar Agenda

**Ator principal:** Organizador

**Pré-condição:** Evento com palestrantes confirmados

**Fluxo principal:**
1. Organizador acessa "Agenda"
2. Sistema exibe grade de programação
3. Organizador clica em "Adicionar Sessão"
4. Sistema exibe formulário: título, descrição, trilha, sala, data, horário início/fim, palestrante
5. Organizador preenche dados e vincula palestrantes
6. Sistema valida conflitos de horário e sala
7. Sistema adiciona sessão à grade
8. Sistema atualiza landing page e aplicativo
9. Participantes inscritos recebem notificação sobre nova sessão

**Fluxo alternativo (conflito de horário):**
1. Sistema detecta sobreposição na mesma sala
2. Sistema sugere realocação de horário ou sala
3. Organizador ajusta conforme necessário

**Pós-condição:** Sessão incluída na grade do evento

---

### UC-010: Duplicar Evento

**Ator principal:** Organizador

**Pré-condição:** Evento anterior existente

**Fluxo principal:**
1. Organizador acessa lista de eventos e seleciona "Duplicar"
2. Sistema exibe opções do que copiar: estrutura de lotes, agenda, palestrantes, layout, patrocinadores
3. Organizador seleciona itens desejados
4. Sistema cria novo evento com dados copiados
5. Sistema altera status para "draft"
6. Sistema redireciona para configuração do novo evento
7. Organizador ajusta datas e demais campos específicos

**Fluxo alternativo (itens não copiáveis):**
1. Sistema informa que dados sensíveis (participantes, vendas) não são copiados
2. Organizador confirma ciência

**Pós-condição:** Novo evento criado a partir do template do anterior

---

### UC-011: Configurar Patrocinadores

**Ator principal:** Organizador

**Pré-condição:** Evento publicado

**Fluxo principal:**
1. Organizador acessa "Patrocinadores"
2. Sistema exibe lista de cotas disponíveis (Diamante, Ouro, Prata, Bronze)
3. Organizador define quantidade, valor e benefícios de cada cota
4. Sistema disponibiliza cotas para contratação
5. Patrocinadores contratam cotas via UC-020
6. Organizador gerencia estandes virtuais ou físicos associados
7. Sistema exibe painel com status de cada patrocinador

**Fluxo alternativo (cota personalizada):**
1. Organizador cria cota customizada com benefícios específicos
2. Sistema valida e disponibiliza apenas para patrocinador selecionado

**Pós-condição:** Patrocinadores configurados e disponíveis para contratação

---

### UC-012: Criar Landing Page

**Ator principal:** Organizador

**Pré-condição:** Evento em edição

**Fluxo principal:**
1. Organizador acessa "Landing Page"
2. Sistema exibe editor visual com templates pré-definidos
3. Organizador seleciona template ou inicia do zero
4. Organizador personaliza: cores, fontes, imagens, seções, textos
5. Sistema permite adicionar blocos: hero, agenda, palestrantes, patrocinadores, depoimentos, FAQ, mapa
6. Organizador define URL personalizada (ex.: eventos.com/meu-evento)
7. Sistema exibe prévia em tempo real
8. Organizador publica landing page
9. Sistema disponibiliza página com SEO otimizado

**Fluxo alternativo (landing page com IA):**
1. Organizador descreve o evento para IA Agent
2. IA Agent gera landing page completa com conteúdo e imagens
3. Organizador ajusta detalhes e publica

**Pós-condição:** Landing page publicada e acessível

---

### UC-013: Criar Pesquisa de Satisfação

**Ator principal:** Organizador

**Pré-condição:** Evento em andamento ou encerrado

**Fluxo principal:**
1. Organizador acessa "Pesquisas"
2. Sistema exibe modelo padrão de pesquisa NPS
3. Organizador personaliza perguntas (nota, múltipla escolha, aberta)
4. Sistema define disparo automático pós-evento
5. Sistema envia pesquisa por e-mail e WhatsApp para participantes com check-in
6. Respostas são consolidadas em relatório no dashboard

**Fluxo alternativo (pesquisa por atividade):**
1. Organizador cria pesquisa vinculada a uma sessão específica
2. Sistema dispara ao término da sessão
3. Participantes recebem notificação no aplicativo

**Pós-condição:** Pesquisa criada e disparada automaticamente

---

### UC-014: Gerenciar Leads

**Ator principal:** Organizador

**Pré-condição:** Evento com captura de leads habilitada

**Fluxo principal:**
1. Organizador acessa "Leads"
2. Sistema exibe lista de leads capturados (nome, e-mail, telefone, empresa, origem)
3. Organizador filtra por lote, data, origem
4. Sistema permite exportar leads para CSV
5. Organizador pode marcar leads como contactados, qualificados ou convertidos
6. Sistema integra com CRM via webhook

**Fluxo alternativo (automação de leads):**
1. Organizador configura regra de automação (ex.: lead qualificado recebe e-mail automático)
2. Sistema executa ação automaticamente

**Pós-condição:** Leads gerenciados e exportáveis

---

### UC-015: Configurar Notificações

**Ator principal:** Organizador

**Pré-condição:** Evento em edição

**Fluxo principal:**
1. Organizador acessa "Notificações"
2. Sistema exibe lista de gatilhos disponíveis: antes do evento, dia do evento, pós-evento
3. Organizador ativa/desativa cada gatilho
4. Organizador personaliza mensagem para cada notificação
5. Sistema permite agendar notificações push, e-mail e WhatsApp
6. Sistema salva configuração
7. Notificações são disparadas automaticamente conforme cronograma

**Pós-condição:** Notificações configuradas e agendadas

---

### UC-016: Visualizar Mapa de Presença

**Ator principal:** Organizador

**Pré-condição:** Evento com check-ins realizados

**Fluxo principal:**
1. Organizador acessa "Mapa de Presença"
2. Sistema exibe heatmap com concentração de participantes por área
3. Organizador seleciona faixa de horário para visualizar fluxo
4. Sistema mostra dados de pico de público, horários de maior movimento
5. Organizador utiliza dados para otimizar edições futuras

**Fluxo alternativo (dados insuficientes):**
1. Sistema exibe mapa sem dados se check-ins insuficientes
2. Organizador aguarda mais check-ins

**Pós-condição:** Organizador visualiza dados de fluxo de participantes

---

### UC-017: Gerenciar Equipe

**Ator principal:** Organizador

**Pré-condição:** Organização ativa

**Fluxo principal:**
1. Organizador acessa "Equipe"
2. Sistema exibe lista de membros da equipe
3. Organizador clica em "Convidar Membro"
4. Sistema exibe formulário: nome, e-mail, perfil de acesso
5. Organizador seleciona perfil (editor, financeiro, suporte, visualizador)
6. Sistema envia convite por e-mail
7. Convidado aceita e acessa com perfil definido
8. Sistema registra ação em log de auditoria

**Pós-condição:** Membro adicionado à equipe com permissões definidas

---

### UC-018: Criar Relatório Customizado

**Ator principal:** Organizador

**Pré-condição:** Evento com dados disponíveis

**Fluxo principal:**
1. Organizador acessa "Relatórios"
2. Sistema exibe opções de relatórios pré-definidos
3. Organizador seleciona "Relatório Customizado"
4. Sistema exibe construtor: seleção de métricas, filtros, período, agrupamento
5. Organizador monta relatório com dados desejados
6. Sistema gera relatório em tempo real
7. Organizador exporta em PDF, CSV ou Excel
8. Sistema permite salvar template do relatório para uso futuro

**Pós-condição:** Relatório gerado e exportado

---

### UC-019: Gerenciar Patrocinadores no Evento

**Ator principal:** Organizador

**Pré-condição:** Evento com cotas de patrocínio contratadas

**Fluxo principal:**
1. Organizador acessa "Patrocinadores > Gerenciar"
2. Sistema exibe lista de patrocinadores contratados
3. Organizador visualiza status de pagamento de cada cota
4. Organizador libera benefícios conforme pagamento confirmado
5. Sistema registra ações no contrato digital

**Pós-condição:** Patrocinadores gerenciados no evento

---

## 3. Fluxos do Participante

### UC-020: Registrar-se na Plataforma

**Ator principal:** Participante

**Pré-condição:** Nenhuma

**Fluxo principal:**
1. Participante acessa plataforma
2. Sistema exibe opções "Registrar" ou "Login com Google"
3. Participante preenche formulário: nome, e-mail, CPF, telefone, senha
4. Sistema valida e-mail único e CPF válido
5. Sistema envia e-mail de confirmação com link
6. Participante clica no link
7. Sistema confirma cadastro
8. Sistema redireciona para página inicial

**Fluxo alternativo (CPF já cadastrado):**
1. Sistema informa que CPF já possui cadastro
2. Sistema oferece opção de recuperar senha

**Pós-condição:** Participante registrado e autenticado

---

### UC-021: Comprar Ingresso

**Ator principal:** Participante

**Pré-condição:** Participante logado, evento publicado com lotes disponíveis

**Fluxo principal:**
1. Participante acessa página do evento
2. Sistema exibe informações do evento e lotes disponíveis
3. Participante seleciona tipo de ingresso e quantidade
4. Sistema adiciona ao carrinho
5. Participante visualiza resumo da compra com valores
6. Participante insere dados adicionais (respostas a perguntas do organizador)
7. Participante seleciona forma de pagamento (cartão, pix, boleto)
8. Sistema redireciona para gateway de pagamento
9. Participante finaliza pagamento
10. Sistema confirma compra e gera ingresso digital com QR code
11. Sistema envia e-mail com ingresso anexado
12. Sistema adiciona evento à agenda do participante

**Fluxo alternativo (pagamento recusado):**
1. Sistema exibe mensagem de erro do gateway
2. Participante tenta outra forma de pagamento
3. Sistema processa nova tentativa

**Pós-condição:** Ingresso adquirido e disponível na carteira digital

---

### UC-022: Aplicar Cupom

**Ator principal:** Participante

**Pré-condição:** Participante na tela de checkout

**Fluxo principal:**
1. Participante insere código do cupom no campo indicado
2. Sistema valida cupom: existência, validade, limite de usos
3. Sistema calcula desconto aplicado ao valor total
4. Sistema exibe novo valor com desconto
5. Participante prossegue com o pagamento

**Fluxo alternativo (cupom inválido):**
1. Sistema informa cupom inválido ou expirado
2. Participante insere novo cupom ou remove
3. Sistema recalcula sem desconto

**Pós-condição:** Desconto aplicado à compra

---

### UC-023: Realizar Check-in

**Ator principal:** Participante

**Pré-condição:** Ingresso adquirido, evento em andamento

**Fluxo principal:**
1. Participante acessa ingresso na carteira digital
2. Sistema exibe QR code do ingresso
3. Participante apresenta QR code no totem ou na recepção
4. Sistema lê QR code e valida autenticidade
5. Sistema registra check-in com data, hora e local
6. Sistema exibe confirmação "Credenciamento realizado"
7. Participante recebe pulseira ou crachá (presencial)

**Fluxo alternativo (QR code inválido ou já utilizado):**
1. Sistema exibe mensagem de erro
2. Atendente verifica manualmente os dados do participante
3. Atendente realiza check-in manual no sistema

**Pós-condição:** Check-in registrado no sistema

---

### UC-024: Acessar Certificado

**Ator principal:** Participante

**Pré-condição:** Participante logado, check-in realizado, certificado emitido pelo organizador

**Fluxo principal:**
1. Participante acessa "Meus Certificados"
2. Sistema exibe lista de eventos com certificados disponíveis
3. Participante seleciona evento desejado
4. Sistema exibe prévia do certificado
5. Participante clica em "Baixar PDF"
6. Sistema gera PDF com dados do participante e validação por QR code
7. Sistema realiza download automático
8. Sistema registra data de download

**Fluxo alternativo (certificado não disponível):**
1. Sistema informa que certificado ainda não foi emitido
2. Participante pode solicitar notificação quando disponível

**Pós-condição:** Certificado baixado pelo participante

---

### UC-025: Participar de Networking

**Ator principal:** Participante

**Pré-condição:** Evento em andamento com módulo de networking ativo

**Fluxo principal:**
1. Participante acessa "Networking" no aplicativo
2. Sistema exibe lista de participantes com networking habilitado
3. Participante busca por nome, empresa ou interesse
4. Participante envia solicitação de conexão
5. Destinatário aceita solicitação
6. Sistema ativa chat entre os participantes
7. Participantes trocam mensagens
8. Ao final do evento, sistema disponibiliza lista de contatos

**Fluxo alternativo (modo anônimo):**
1. Participante ativa modo anônimo
2. Sistema exibe apenas dados básicos (nome e cargo)
3. Participante escolhe revelar informações ao conectar

**Pós-condição:** Conexão estabelecida entre participantes

---

### UC-026: Avaliar Palestra

**Ator principal:** Participante

**Pré-condição:** Sessão encerrada, participante com check-in na sessão

**Fluxo principal:**
1. Participante acessa "Sessões Assistidas"
2. Sistema exibe lista de sessões assistidas
3. Participante seleciona sessão para avaliar
4. Sistema exibe formulário de avaliação: nota 1-5, comentário opcional
5. Participante preenche e envia
6. Sistema registra avaliação
7. Sistema exibe agradecimento
8. Avaliação é consolidada no dashboard do organizador

**Fluxo alternativo (editar avaliação):**
1. Participante acessa avaliação já enviada
2. Sistema permite editar até 24 horas após envio
3. Participante altera nota e/ou comentário
4. Sistema atualiza registro

**Pós-condição:** Avaliação registrada no sistema

---

### UC-027: Solicitar Reembolso

**Ator principal:** Participante

**Pré-condição:** Ingresso adquirido, política de reembolso ativa

**Fluxo principal:**
1. Participante acessa "Meus Ingressos"
2. Sistema exibe ingressos comprados
3. Participante seleciona ingresso e clica em "Solicitar Reembolso"
4. Sistema verifica prazo de reembolso
5. Sistema exibe política de reembolso do evento
6. Participante confirma solicitação
7. Sistema registra solicitação como "pending"
8. Financeiro processa UC-033 (Processar Reembolso)
9. Participante recebe notificação sobre status da solicitação

**Fluxo alternativo (fora do prazo):**
1. Sistema informa que prazo de reembolso expirou
2. Participante pode entrar em contato com suporte

**Pós-condição:** Solicitação de reembolso registrada

---

### UC-028: Visualizar Histórico de Eventos

**Ator principal:** Participante

**Pré-condição:** Participante logado

**Fluxo principal:**
1. Participante acessa "Meus Eventos"
2. Sistema exibe timeline com histórico completo
3. Sistema filtra por status: próximos, em andamento, concluídos
4. Participante clica em evento para ver detalhes
5. Sistema exibe: ingresso, certificado, sessões assistidas, avaliações
6. Participante pode acessar cada item diretamente

**Pós-condição:** Histórico visualizado pelo participante

---

## 4. Fluxos do Patrocinador

### UC-029: Contratar Cota de Patrocínio

**Ator principal:** Patrocinador

**Pré-condição:** Patrocinador logado com empresa cadastrada

**Fluxo principal:**
1. Patrocinador acessa página do evento
2. Sistema exibe cotas de patrocínio disponíveis com valores e benefícios
3. Patrocinador seleciona cota desejada
4. Sistema exibe detalhes da cota e termos
5. Patrocinador preenche dados da empresa para contrato
6. Sistema gera contrato digital
7. Patrocinador assina contrato digitalmente
8. Sistema redireciona para pagamento
9. Patrocinador efetua pagamento
10. Sistema libera acesso ao painel do patrocinador
11. Patrocinador gerencia estande e benefícios

**Fluxo alternativo (pagamento parcelado):**
1. Sistema oferece opção de parcelamento
2. Patrocinador seleciona número de parcelas
3. Sistema calcula juros e gera boletos ou cobranças recorrentes

**Pós-condição:** Cota contratada e painel do patrocinador liberado

---

### UC-030: Acompanhar Métricas do Estande

**Ator principal:** Patrocinador

**Pré-condição:** Cota contratada, evento em andamento

**Fluxo principal:**
1. Patrocinador acessa "Métricas do Estande"
2. Sistema exibe dashboard com indicadores: visitantes únicos, leads capturados, tempo médio de visita, taxa de interação
3. Patrocinador filtra por data e horário
4. Sistema exibe ranking de estandes (se disponível)
5. Patrocinador exporta relatório de métricas
6. Sistema sugere ações para melhorar desempenho

**Fluxo alternativo (estande físico):**
1. Sistema integra com sensores IoT para contagem de visitantes
2. Dados de sensores são exibidos no dashboard em tempo real

**Pós-condição:** Métricas visualizadas e relatório exportado

---

### UC-031: Gerar Relatório de ROI

**Ator principal:** Patrocinador

**Pré-condição:** Evento encerrado

**Fluxo principal:**
1. Patrocinador acessa "Relatório de ROI"
2. Sistema exibe resumo financeiro: valor investido, leads capturados, valor estimado por lead
3. Sistema calcula ROI com base em fórmula configurável
4. Patrocinador personaliza parâmetros de cálculo
5. Sistema gera relatório completo em PDF
6. Patrocinador compartilha relatório com equipe

**Pós-condição:** Relatório de ROI gerado

---

### UC-032: Gerenciar Leads do Estande

**Ator principal:** Patrocinador

**Pré-condição:** Cota contratada com captura de leads ativa

**Fluxo principal:**
1. Patrocinador acessa "Leads do Estande"
2. Sistema exibe lista de leads capturados
3. Patrocinador visualiza dados: nome, e-mail, telefone, cargo, empresa, interesse
4. Patrocinador filtra, ordena e marca leads
5. Patrocinador exporta leads para CRM
6. Sistema integra com HubSpot, Salesforce, RD Station via API

**Pós-condição:** Leads exportados para CRM do patrocinador

---

## 5. Fluxos do Administrador

### UC-033: Gerenciar Organizações

**Ator principal:** Administrador

**Pré-condição:** Administrador logado

**Fluxo principal:**
1. Administrador acessa "Organizações"
2. Sistema exibe lista de todas as organizações cadastradas
3. Administrador busca por nome, CNPJ, e-mail
4. Administrador seleciona organização para editar
5. Sistema exibe detalhes: dados cadastrais, plano, status, faturas
6. Administrador altera dados, suspende ou ativa organização
7. Sistema registra alteração em log de auditoria
8. Sistema notifica organização sobre mudanças

**Pós-condição:** Organização gerenciada

---

### UC-034: Gerenciar Planos e Cobranças

**Ator principal:** Administrador

**Pré-condição:** Administrador logado

**Fluxo principal:**
1. Administrador acessa "Planos"
2. Sistema exibe planos de assinatura disponíveis
3. Administrador cria, edita ou desativa planos
4. Ao criar plano: define nome, valor, limites de eventos, ingressos, funcionalidades
5. Sistema valida dados do plano
6. Administrador associa plano a organizações
7. Sistema gera cobranças conforme ciclo de faturamento
8. Administrador visualiza histórico de faturas por organização

**Fluxo alternativo (plano personalizado):**
1. Administrador cria plano customizado para organização específica
2. Define valores e limites diferenciados
3. Sistema aplica plano apenas à organização selecionada

**Pós-condição:** Planos gerenciados e cobranças configuradas

---

### UC-035: Visualizar Auditoria

**Ator principal:** Administrador

**Pré-condição:** Administrador logado

**Fluxo principal:**
1. Administrador acessa "Auditoria"
2. Sistema exibe log completo de ações realizadas na plataforma
3. Administrador filtra por: ator, ação, recurso, data, organização
4. Sistema exibe detalhes: usuário, IP, ação, payload, data/hora
5. Administrador exporta log em CSV
6. Sistema permite reter logs conforme política de compliance

**Pós-condição:** Logs de auditoria visualizados

---

### UC-036: Gerenciar Usuários

**Ator principal:** Administrador

**Pré-condição:** Administrador logado

**Fluxo principal:**
1. Administrador acessa "Usuários"
2. Sistema exibe lista de todos os usuários da plataforma
3. Administrador busca por nome, e-mail, CPF
4. Administrador seleciona usuário
5. Sistema exibe dados do usuário e eventos vinculados
6. Administrador pode bloquear, ativar, alterar perfil do usuário
7. Sistema registra ação em auditoria

**Pós-condição:** Usuário gerenciado

---

### UC-037: Gerenciar Suporte

**Ator principal:** Administrador

**Pré-condição:** Administrador logado

**Fluxo principal:**
1. Administrador acessa "Tickets de Suporte"
2. Sistema exibe fila de tickets abertos
3. Administrador prioriza tickets por urgência
4. Administrador responde ticket ou atribui a membro da equipe
5. Sistema notifica solicitante sobre resposta
6. Ticket é fechado quando resolvido
7. Sistema calcula SLA e métricas de atendimento

**Pós-condição:** Ticket de suporte atendido

---

## 6. Fluxos Financeiros

### UC-038: Processar Pagamento

**Ator principal:** Financeiro / Sistema

**Pré-condição:** Compra de ingresso ou patrocínio iniciada

**Fluxo principal:**
1. Sistema recebe dados de pagamento do gateway
2. Sistema valida dados do cartão ou PIX
3. Gateway processa transação
4. Sistema recebe webhook com status da transação
5. Se aprovado: sistema libera ingresso ou cota
6. Sistema registra transação no histórico financeiro
7. Sistema concilia transação automaticamente
8. Sistema notifica comprador sobre confirmação

**Fluxo alternativo (chargeback):**
1. Sistema recebe notificação de chargeback
2. Sistema bloqueia ingresso associado
3. Financeiro analisa caso
4. Financeiro contesta chargeback ou aceita estorno

**Pós-condição:** Pagamento processado e conciliado

---

### UC-039: Solicitar Reembolso (Financeiro)

**Ator principal:** Financeiro

**Pré-condição:** Solicitação de reembolso criada pelo participante

**Fluxo principal:**
1. Financeiro acessa "Reembolsos Pendentes"
2. Sistema exibe lista de solicitações com dados da compra
3. Financeiro seleciona solicitação
4. Sistema exibe detalhes: valor, forma de pagamento, data, política aplicável
5. Financeiro aprova ou recusa solicitação
6. Se aprovado: sistema envia solicitação de estorno ao gateway
7. Gateway processa estorno
8. Sistema notifica participante sobre reembolso
9. Sistema registra transação de estorno

**Fluxo alternativo (recusa):**
1. Financeiro informa motivo da recusa
2. Sistema notifica participante

**Pós-condição:** Reembolso processado ou recusado

---

### UC-040: Emitir Nota Fiscal

**Ator principal:** Financeiro

**Pré-condição:** Transação concluída, dados fiscais completos

**Fluxo principal:**
1. Financeiro acessa "Notas Fiscais"
2. Sistema exibe transações pendentes de emissão
3. Financeiro seleciona transação
4. Sistema preenche automaticamente dados para NF-e ou NFS-e
5. Financeiro revisa dados
6. Sistema envia lote para prefeitura ou sistema de NF
7. Sistema recebe protocolo ou XML da nota fiscal
8. Sistema disponibiliza nota fiscal na área do comprador
9. Sistema envia NF por e-mail

**Fluxo alternativo (rejeição SEFAZ):**
1. Sistema exibe motivo da rejeição
2. Financeiro corrige dados
3. Sistema reenvia lote

**Pós-condição:** Nota fiscal emitida e disponível

---

### UC-041: Conciliar Transações

**Ator principal:** Financeiro

**Pré-condição:** Transações realizadas no período

**Fluxo principal:**
1. Financeiro acessa "Conciliação"
2. Sistema exibe extrato do gateway de pagamento
3. Sistema cruza transações do gateway com transações internas
4. Sistema aponta divergências, se houver
5. Financeiro analise divergências e ajusta manualmente
6. Sistema gera relatório de conciliação
7. Financeiro exporta relatório para contabilidade

**Pós-condição:** Transações conciliadas

---

### UC-042: Gerar Relatório Financeiro

**Ator principal:** Financeiro

**Pré-condição:** Dados financeiros disponíveis

**Fluxo principal:**
1. Financeiro acessa "Relatórios Financeiros"
2. Sistema exibe opções: DRE, fluxo de caixa, receita por evento, inadimplência
3. Financeiro seleciona tipo de relatório e período
4. Sistema gera relatório com gráficos e tabelas
5. Financeiro exporta em formato desejado

**Pós-condição:** Relatório financeiro gerado

---

## 7. Fluxos de IA

### UC-043: Criar Evento com IA

**Ator principal:** Organizador / IA Agent

**Pré-condição:** Organizador logado, IA Agent autorizado

**Fluxo principal:**
1. Organizador acessa "Novo Evento com IA"
2. Sistema exibe campo de texto livre
3. Organizador descreve o evento em linguagem natural (ex.: "Workshop de inovação para 200 pessoas em SP, 2 dias, focado em IA generativa")
4. IA Agent processa descrição
5. IA Agent extrai entidades: nome sugerido, tipo, datas, local, público-alvo
6. Sistema exibe preview com dados extraídos
7. Organizador ajusta dados se necessário
8. Sistema cria evento em status "draft"
9. IA Agent pergunta se deseja gerar landing page, lotes e agenda automaticamente
10. Se sim: executa UC-012 e UC-004 em sequência
11. Sistema redireciona para o evento criado

**Fluxo alternativo (entidades insuficientes):**
1. IA Agent identifica informações faltantes
2. IA Agent pergunta ao organizador: "Qual a data estimada?", "Qual o local?"
3. Organizador responde
4. IA Agent completa dados e prossegue

**Pós-condição:** Evento criado com auxílio de IA

---

### UC-044: Gerar Campanha de Marketing com IA

**Ator principal:** Marketing / IA Agent

**Pré-condição:** Evento existente, IA Agent autorizado para campanhas

**Fluxo principal:**
1. Marketing acessa "Campanhas > Gerar com IA"
2. Sistema exige campo de descrição e tom desejado (formal, descontraído, urgente)
3. Marketing descreve objetivo da campanha
4. IA Agent gera conteúdo: assunto de e-mail, corpo, CTA, preview de redes sociais
5. Sistema exibe preview do conteúdo gerado
6. Marketing ajusta tom e detalhes via conversação
7. Marketing aprova conteúdo
8. Sistema cria campanha com conteúdo gerado
9. Marketing agenda disparo

**Fluxo alternativo (regenerar):**
1. Marketing solicita nova versão
2. IA Agent gera variação do conteúdo
3. Marketing escolhe versão preferida

**Pós-condição:** Campanha criada com conteúdo gerado por IA

---

### UC-045: Consultar Analytics com Linguagem Natural

**Ator principal:** Organizador / IA Agent

**Pré-condição:** Evento com dados disponíveis, IA Agent autorizado

**Fluxo principal:**
1. Organizador acessa "Perguntar à IA"
2. Sistema exibe campo de consulta em linguagem natural
3. Organizador digita pergunta (ex.: "Quantos ingressos vendi nos últimos 7 dias?")
4. IA Agent interpreta intenção e entidades
5. IA Agent consulta banco de dados analítico
6. IA Agent processa resultado
7. Sistema exibe resposta em linguagem natural com gráfico se aplicável
8. Organizador pode refinar pergunta

**Fluxo alternativo (pergunta ambígua):**
1. IA Agent identifica ambiguidade
2. IA Agent solicita esclarecimento: "Você quer dados por lote ou total?"
3. Organizador esclarece
4. IA Agent responde com dados corretos

**Pós-condição:** Resposta exibida ao organizador

---

### UC-046: Agendar Ações Automáticas

**Ator principal:** Organizador / IA Agent

**Pré-condição:** IA Agent autorizado para automação

**Fluxo principal:**
1. Organizador acessa "Automações > Nova Automação"
2. Sistema exige assistente de criação
3. Organizador descreve ação desejada (ex.: "Enviar e-mail de boas-vindas 3 dias antes do evento")
4. IA Agent interpreta e sugere configuração: gatilho, ação, condições
5. Sistema exibe preview da automação
6. Organizador confirma
7. Sistema cria regra de automação
8. Sistema executa ação conforme cronograma

**Fluxo alternativo (ação complexa):**
1. IA Agent sugere workflow com múltiplas etapas
2. Organizador ajusta etapas
3. Sistema cria automação multi-etapa

**Pós-condição:** Automação configurada e ativa

---

### UC-047: Sugerir Preço de Ingresso com IA

**Ator principal:** Organizador / IA Agent

**Pré-condição:** Evento em criação, IA Agent autorizado

**Fluxo principal:**
1. Organizador acessa "Precificação Inteligente"
2. Sistema consulta IA Agent com dados do evento (tipo, público, região)
3. IA Agent analisa dados históricos de eventos similares
4. IA Agent sugere faixa de preço otimizada por lote
5. Sistema exibe sugestão com justificativa
6. Organizador aceita ou ajusta valores
7. Sistema aplica precificação
8. IA Agent monitora vendas e sugere ajustes em tempo real (surge pricing)

**Pós-condição:** Preços definidos com auxílio de IA

---

### UC-048: Gerar Resumo do Evento com IA

**Ator principal:** Organizador / IA Agent

**Pré-condição:** Evento encerrado com dados de participação e avaliações

**Fluxo principal:**
1. Organizador acessa "Resumo Inteligente"
2. Sistema consulta IA Agent com dados consolidados do evento
3. IA Agent gera resumo executivo: público total, satisfação, pontos fortes e melhorias
4. Sistema exibe resumo em formato narrativo
5. IA Agent extrai insights acionáveis
6. Organizador salva resumo no relatório do evento

**Pós-condição:** Resumo executivo gerado por IA

---

### UC-049: Recomendar Palestrantes com IA

**Ator principal:** Organizador / IA Agent

**Pré-condição:** IA Agent autorizado, base de palestrantes disponível

**Fluxo principal:**
1. Organizador acessa "Recomendar Palestrantes"
2. Sistema pergunta tema e perfil desejado
3. IA Agent consulta banco de talentos e dados públicos
4. IA Agent recomenda palestrantes com score de compatibilidade
5. Sistema exibe perfil, histórico e score de cada recomendação
6. Organizador seleciona candidatos para convite
7. Sistema inicia fluxo UC-008 para cada selecionado

**Pós-condição:** Palestrantes recomendados e convidados

---

## 8. Diagramas de Sequência (textuais)

### UC-001: Criar Evento Manual

```
Organizador -> Frontend: Acessa "Novo Evento"
Frontend -> Organizador: Exibe formulário de criação
Organizador -> Frontend: Preenche nome, tipo, datas, local, capacidade
Frontend -> Event API: POST /events {name, type, dates, venue, capacity}
Event API -> Event API: Valida dados obrigatórios
Event API -> Database: INSERT INTO events (id, name, ...)
Database -> Event API: Row inserted
Event API -> Frontend: 201 Created {eventId}
Frontend -> Organizador: Redireciona para /events/{id}/config
```

### UC-002: Publicar Evento

```
Organizador -> Frontend: Clica "Publicar"
Frontend -> Event API: POST /events/{id}/publish
Event API -> Event API: Verifica itens obrigatórios (lotes, datas)
Event API -> Database: UPDATE events SET status='published' WHERE id=?
Database -> Event API: Updated
Event API -> Frontend: 200 OK {status: 'published'}
Frontend -> Organizador: "Evento publicado com sucesso"
Event API -> Queue: PUBLISH notification.new_event {eventId}
```

### UC-004: Criar Lote de Preços

```
Organizador -> Frontend: Acessa "Lotes" > "Novo Lote"
Frontend -> Ticket API: POST /events/{id}/ticket-tiers {name, price, qty, startDate, endDate}
Ticket API -> Database: SELECT tier WHERE date_overlap(startDate, endDate)
Database -> Ticket API: No conflict
Ticket API -> Database: INSERT INTO ticket_tiers (event_id, name, ...)
Database -> Ticket API: Row inserted
Ticket API -> Frontend: 201 Created {tierId}
Frontend -> Organizador: "Lote criado com sucesso"
```

### UC-006: Emitir Certificados

```
Organizador -> Frontend: Acessa "Certificados" > "Gerar em Lote"
Frontend -> Certificate API: POST /events/{id}/certificates/generate
Certificate API -> Database: SELECT attendee + check_in WHERE event_id=?
Database -> Certificate API: Attendees list
Certificate API -> Certificate API: Gera PDF para cada attendee
Certificate API -> Storage: PUT certificates/{eventId}/{attendeeId}.pdf
Storage -> Certificate API: File stored
Certificate API -> Database: INSERT INTO certificates (attendee_id, url, ...)
Certificate API -> Frontend: 202 Accepted
Certificate API -> Email Service: SEND certificate_link to each attendee
Frontend -> Organizador: "Certificados em processamento"
```

### UC-007: Visualizar Dashboard

```
Organizador -> Frontend: Acessa "Dashboard"
Frontend -> Analytics API: GET /events/{id}/dashboard?period=all
Analytics API -> Database: SELECT COUNT(*) FROM tickets WHERE event_id=?
Analytics API -> Database: SELECT SUM(price) FROM transactions WHERE event_id=?
Analytics API -> Database: SELECT COUNT(*) FROM check_ins WHERE event_id=?
Database -> Analytics API: Aggregated data
Analytics API -> Frontend: 200 OK {ticketsSold, revenue, checkIns, ...}
Frontend -> Organizador: Renderiza gráficos e indicadores
```

### UC-016: Check-in QR

```
Participante -> Totem: Apresenta QR Code do ingresso
Totem -> Checkin API: POST /check-in {qrCode, eventId, metadata}
Checkin API -> Database: SELECT attendee, ticket WHERE qrCode=?
Database -> Checkin API: Attendee data
Checkin API -> Database: SELECT check_in WHERE ticket_id=? AND date=CURRENT_DATE
Database -> Checkin API: No record (first check-in)
Checkin API -> Database: INSERT INTO check_ins (ticket_id, attendee_id, event_id, checked_in_at)
Database -> Checkin API: Inserted
Checkin API -> Totem: 200 OK {attendee: {name, photo}, status: 'approved'}
Totem -> Participante: Exibe "Credenciamento realizado" + foto do participante
```

### UC-021: Comprar Ingresso

```
Participante -> Frontend: Seleciona ingresso e clica "Comprar"
Frontend -> Order API: POST /orders {eventId, tierId, qty, buyerId}
Order API -> Database: SELECT tier WHERE id=? AND available_qty >= ?
Database -> Order API: Available
Order API -> Database: INSERT INTO orders (id, event_id, ...)
Order API -> Payment API: POST /payments {orderId, amount, method, gateway}
Payment API -> Gateway: POST /transactions {card, amount}
Gateway -> Payment API: 200 OK {transactionId, status: 'approved'}
Payment API -> Order API: Webhook payment.confirmed
Order API -> Database: UPDATE orders SET status='paid' WHERE id=?
Order API -> Database: INSERT INTO tickets (order_id, qr_code, ...)
Order API -> Email Service: SEND ticket_qr to buyer email
Order API -> Frontend: 201 Created {orderId, tickets}
Frontend -> Participante: "Compra realizada! Ingresso enviado por e-mail."
```

### UC-023: Realizar Check-in

```
Participante -> App: Abre ingresso na carteira digital
App -> QR Code API: GET /tickets/{id}/qr-code?token=session
QR Code API -> App: QR Code image
Participante -> Totem: Digitaliza QR Code
Totem -> Checkin API: POST /check-in {qrCode, eventId}
Checkin API -> Checkin API: Decodifica QR, verifica validade
Checkin API -> Database: SELECT ticket, attendee WHERE qr_hash=?
Database -> Checkin API: Ticket data
Checkin API -> Database: UPDATE tickets SET checked_in=true, checked_in_at=NOW() WHERE id=?
Database -> Checkin API: Updated
Checkin API -> Totem: 200 OK {attendeeName, eventName, status: 'ok'}
Totem -> Participante: "Credenciamento concluído. Bem-vindo(a)!"
```

### UC-025: Networking

```
Participante -> App: Acessa "Networking"
App -> Social API: GET /events/{id}/participants?networking=true&search=term
Social API -> Database: SELECT name, company, role FROM attendees WHERE event_id=? AND networking_optin=true
Database -> Social API: Participants list
Social API -> App: 200 OK [{name, company, role}]
Participante -> App: Envia solicitação de conexão para outro participante
App -> Social API: POST /connections {fromUserId, toUserId, eventId}
Social API -> Database: INSERT INTO connections (from_user, to_user, event_id, status, created_at)
Database -> Social API: Inserted
Social API -> Push Service: NOTIFY toUserId "Você recebeu uma solicitação de conexão"
Social API -> App: 201 Created {connectionId}
```

### UC-029: Contratar Cota de Patrocínio

```
Patrocinador -> Frontend: Seleciona cota de patrocínio
Frontend -> Sponsor API: POST /events/{id}/sponsor-tiers/{tierId}/contract
Sponsor API -> Database: INSERT INTO sponsor_contracts (company_id, tier_id, status, signed_at)
Database -> Sponsor API: Inserted
Sponsor API -> Contract API: POST /digital-signature {contractId, signerId}
Sponsor API -> Payment API: POST /payments {contractId, amount, method}
Payment API -> Gateway: POST /transactions
Gateway -> Payment API: Transaction approved
Payment API -> Sponsor API: payment.confirmed
Sponsor API -> Database: UPDATE sponsor_contracts SET status='active'
Sponsor API -> Frontend: 200 OK {contractId, panelUrl}
Frontend -> Patrocinador: Redireciona para painel do patrocinador
```

### UC-038: Processar Pagamento

```
Frontend -> Payment API: POST /payments {orderId, amount, card/pix}
Payment API -> Gateway: POST /charges {amount, paymentMethod, metadata}
Gateway -> Payment API: 200 {chargeId, status: 'pending'}
Payment API -> Database: INSERT INTO transactions (order_id, charge_id, status, amount)
Payment API -> Frontend: 202 Accepted {chargeId}
Gateway -> Payment API: Webhook charge.confirmed
Payment API -> Database: UPDATE transactions SET status='paid', confirmed_at=NOW()
Payment API -> Order API: event payment.confirmed {orderId}
Order API -> Database: UPDATE orders SET status='paid'
Order API -> Ticket API: GENERATE tickets for order
Frontend -> Comprador: "Pagamento aprovado! Ingresso liberado."
```

### UC-043: Criar Evento com IA

```
Organizador -> Frontend: Descreve evento em linguagem natural
Frontend -> IA Agent API: POST /ai/create-event {description: "..."}
IA Agent API -> LLM Provider: PROMPT with description + schema
LLM Provider -> IA Agent API: Structured event data {name, type, dates, venue}
IA Agent API -> Event API: POST /events {name, type, dates, venue}
Event API -> Database: INSERT INTO events
Database -> Event API: Event created
Event API -> IA Agent API: 201 Created {eventId}
IA Agent API -> Frontend: 200 OK {event, previewData}
Frontend -> Organizador: Exibe preview do evento gerado
Organizador -> Frontend: Confirma dados
Frontend -> Event API: PUT /events/{id} (campos ajustados)
Event API -> Organizador: "Evento criado com sucesso!"
```

### UC-045: Consultar Analytics com LN

```
Organizador -> Frontend: Digita "Quantos ingressos vendi nesta semana?"
Frontend -> IA Agent API: POST /ai/query {question, eventId, context}
IA Agent API -> LLM Provider: PROMPT + schema + contexto
LLM Provider -> IA Agent API: SQL query gerada
IA Agent API -> Analytics Database: EXECUTE generated SQL
Analytics Database -> IA Agent API: Result set
IA Agent API -> LLM Provider: PROMPT com resultado + pergunta original
LLM Provider -> IA Agent API: Resposta em linguagem natural
IA Agent API -> Frontend: 200 OK {answer, chartData}
Frontend -> Organizador: "Você vendeu 145 ingressos esta semana."
Frontend -> Organizador: Exibe gráfico de barras com vendas diárias
```

### UC-047: Sugerir Preço com IA

```
Organizador -> Frontend: Acessa "Precificação Inteligente"
Frontend -> IA Agent API: POST /ai/suggest-pricing {eventType, city, capacity, dateRange}
IA Agent API -> Analytics Database: SELECT AVG(ticket_price) FROM events WHERE type=? AND city=?
Analytics Database -> IA Agent API: Average market price
IA Agent API -> LLM Provider: PROMPT com dados de mercado + regras de negócio
LLM Provider -> IA Agent API: Suggested pricing tiers
IA Agent API -> Frontend: 200 OK {suggestions: [{name, price, reason}]}
Frontend -> Organizador: Exibe sugestões de precificação
Organizador -> Frontend: Aceita sugestão OU ajusta manualmente
Frontend -> Ticket API: POST /ticket-tiers {eventId, tiers}
```

---
## 9. Fluxos do Marketplace

### UC-050: Compra de Produto no Marketplace
**Módulo:** Marketplace
**Agente:** Participante (Comprador)
**Gatilho:** Participante deseja adquirir um produto ou serviço ofertado por um expositor durante o evento

**Fluxo Principal:**
1. Participante acessa o módulo Marketplace dentro do evento
2. Sistema exibe vitrine com produtos organizados por categoria (físicos, digitais, serviços)
3. Participante navega ou busca por produto específico
4. Participante seleciona produto e visualiza detalhes: descrição, preço, fotos, avaliações
5. Participante clica em "Comprar" e define quantidade
6. Sistema adiciona ao carrinho e exibe resumo com frete (se aplicável)
7. Participante revisa pedido e seleciona forma de pagamento
8. Sistema redireciona para checkout e processa pagamento via UC-080 ou gateway
9. Sistema confirma pedido e gera número de rastreio
10. Sistema notifica o expositor sobre nova venda
11. Sistema disponibiliza comprovante na área do participante

**Fluxo Alternativo (produto esgotado):**
- Sistema exibe mensagem "Produto indisponível" e sugere produtos similares
- Participante pode ativar notificação de reposição de estoque

**Fluxo Alternativo (pagamento recusado):**
- Sistema informa falha na transação
- Participante tenta outra forma de pagamento ou cancela

**Resposta Esperada:**
Pedido registrado com sucesso, pagamento processado, expositor notificado e comprovante disponível ao comprador

---

### UC-051: Venda de Produto como Expositor
**Módulo:** Marketplace
**Agente:** Patrocinador / Expositor
**Gatilho:** Expositor deseja cadastrar e comercializar produtos no marketplace do evento

**Fluxo Principal:**
1. Expositor acessa "Marketplace > Meus Produtos"
2. Sistema exibe lista de produtos já cadastrados
3. Expositor clica em "Novo Produto"
4. Sistema exibe formulário: nome, descrição, categoria, preço, fotos, estoque, tipo (físico/digital)
5. Expositor preenche dados e define regras de frete (se físico)
6. Sistema valida dados e submete para aprovação do organizador (se exigido)
7. Organizador aprova o produto
8. Sistema publica produto na vitrine do marketplace
9. Sistema exibe confirmação e produto fica disponível para compra

**Fluxo Alternativo (produto rejeitado):**
- Sistema notifica expositor sobre motivo da rejeição
- Expositor ajusta dados e reenvia para aprovação

**Fluxo Alternativo (produto digital):**
- Expositor faz upload do arquivo digital
- Sistema valida formato e tamanho máximo
- Entrega automatizada via UC-058

**Resposta Esperada:**
Produto cadastrado, aprovado e disponível na vitrine do marketplace

---

### UC-052: Gerenciamento de Catálogo de Produtos
**Módulo:** Marketplace
**Agente:** Expositor
**Gatilho:** Expositor precisa organizar, editar ou remover produtos do seu catálogo

**Fluxo Principal:**
1. Expositor acessa "Marketplace > Catálogo"
2. Sistema exibe grid com todos os produtos do expositor
3. Expositor filtra por status (ativo, pausado, esgotado, rascunho)
4. Expositor seleciona produto para editar
5. Sistema exibe formulário com dados atuais do produto
6. Expositor altera preço, descrição, fotos, estoque ou status
7. Sistema valida alterações
8. Sistema salva e atualiza vitrine em tempo real
9. Sistema registra alteração em log do produto

**Fluxo Alternativo (exclusão de produto):**
- Expositor marca produto como "inativo"
- Sistema remove da vitrine mas mantém histórico de vendas
- Expositor pode reativar posteriormente

**Resposta Esperada:**
Catálogo atualizado com alterações refletidas na vitrine do marketplace

---

### UC-053: Cálculo e Distribuição de Comissões
**Módulo:** Marketplace
**Agente:** Financeiro / Sistema
**Gatilho:** Venda concluída no marketplace com comissão configurada para a plataforma

**Fluxo Principal:**
1. Sistema identifica venda concluída com sucesso
2. Sistema recupera regra de comissão configurada (percentual ou valor fixo)
3. Sistema calcula comissão da plataforma sobre o valor total do pedido
4. Sistema calcula valor líquido devido ao expositor
5. Sistema registra valores em ledger financeiro: receita plataforma, repasse expositor
6. Sistema agenda repasse ao expositor conforme ciclo de pagamento
7. Sistema envia comprovante de venda ao expositor com valores discriminados
8. Sistema disponibiliza relatório de comissões no dashboard financeiro

**Fluxo Alternativo (regra de comissão por categoria):**
- Sistema aplica percentual diferenciado conforme categoria do produto
- Expositor visualiza taxa aplicada antes da venda

**Resposta Esperada:**
Comissão calculada, valores registrados e agendamento de repasse ao expositor

---

### UC-054: Avaliação de Produto Pós-Compra
**Módulo:** Marketplace
**Agente:** Participante (Comprador)
**Gatilho:** Participante recebeu o produto e deseja avaliar a experiência de compra

**Fluxo Principal:**
1. Participante acessa "Meus Pedidos > Finalizados"
2. Sistema exibe lista de pedidos concluídos nos últimos 30 dias
3. Participante seleciona produto comprado
4. Sistema exibe formulário de avaliação: nota 1-5 estrelas, título, comentário, fotos opcionais
5. Participante preenche avaliação
6. Sistema valida conteúdo contra políticas de conduta
7. Sistema publica avaliação na página do produto
8. Sistema notifica expositor sobre nova avaliação
9. Sistema atualiza média de avaliações do produto na vitrine

**Fluxo Alternativo (conteúdo impróprio):**
- Sistema detecta palavras ofensivas e bloqueia publicação
- Participante é notificado para revisar o comentário

**Fluxo Alternativo (edição de avaliação):**
- Participante edita avaliação dentro de 7 dias
- Sistema atualiza sem notificar novamente o expositor

**Resposta Esperada:**
Avaliação publicada na página do produto e média atualizada

---

### UC-055: Reembolso de Compra Marketplace
**Módulo:** Marketplace
**Agente:** Participante / Financeiro
**Gatilho:** Participante solicita devolução de valores por produto com defeito, não entregue ou arrependimento

**Fluxo Principal:**
1. Participante acessa "Meus Pedidos" e seleciona pedido finalizado
2. Sistema exibe opção "Solicitar Reembolso"
3. Participante seleciona motivo: arrependimento, produto com defeito, não recebido, diferente do anúncio
4. Sistema exibe política de reembolso do evento
5. Participante anexa evidências (fotos, vídeos) se necessário
6. Sistema registra solicitação como "pending"
7. Sistema notifica expositor e financeiro
8. Expositor tem 48h para responder
9. Se aprovado: sistema processa estorno via gateway financeiro
10. Sistema notifica participante e atualiza status para "reembolsado"

**Fluxo Alternativo (expositor recusa):**
- Financeiro media a disputa
- Financeiro analisa evidências de ambas as partes
- Financeiro decide a favor ou contra o reembolso
- Sistema executa decisão

**Fluxo Alternativo (prazo expirado):**
- Sistema informa que prazo de reembolso expirou
- Participante pode abrir ticket de suporte

**Resposta Esperada:**
Solicitação registrada, analisada e reembolso processado ou recusado com justificativa

---

### UC-056: Gerenciamento de Carrinho de Compras
**Módulo:** Marketplace
**Agente:** Participante (Comprador)
**Gatilho:** Participante adiciona produtos ao carrinho durante navegação no marketplace

**Fluxo Principal:**
1. Participante adiciona primeiro produto ao carrinho
2. Sistema cria carrinho temporário associado à sessão ou usuário
3. Sistema exibe indicador de itens no carrinho no menu
4. Participante continua navegando e adiciona mais produtos
5. Sistema atualiza quantidade, subtotal e calcula frete automaticamente
6. Participante acessa carrinho completo
7. Sistema exibe lista de itens, quantidades, valores unitários, subtotal e frete
8. Participante pode alterar quantidades ou remover itens
9. Sistema recalcula valores a cada alteração
10. Participante clica em "Finalizar Compra" e segue para checkout

**Fluxo Alternativo (carrinho expirado):**
- Sistema mantém carrinho por 24h
- Após expiração, remove itens com estoque esgotado
- Notifica participante sobre alterações no carrinho

**Fluxo Alternativo (estoque alterado durante navegação):**
- Sistema alerta se item teve estoque reduzido
- Participante confirma quantidade disponível

**Resposta Esperada:**
Carrinho gerenciado com valores atualizados e pronto para checkout

---

### UC-057: Gerenciamento de Pedidos do Marketplace
**Módulo:** Marketplace
**Agente:** Expositor
**Gatilho:** Expositor precisa acompanhar e gerenciar pedidos recebidos

**Fluxo Principal:**
1. Expositor acessa "Marketplace > Pedidos"
2. Sistema exibe lista de pedidos com status (pendente, confirmado, enviado, entregue, cancelado)
3. Expositor filtra por status, data ou produto
4. Expositor seleciona pedido para visualizar detalhes
5. Sistema exibe dados do comprador, itens, valor e endereço de entrega
6. Expositor atualiza status para "Enviado" e insere código de rastreio
7. Sistema notifica comprador sobre atualização
8. Expositor confirma entrega quando recebido

**Fluxo Alternativo (cancelamento pelo comprador):**
- Sistema notifica expositor sobre cancelamento
- Expositor confirma recebimento da devolução (se aplicável)

**Resposta Esperada:**
Pedidos gerenciados com status atualizado e comprador notificado

---

### UC-058: Venda de Produto Digital com Entrega Automática
**Módulo:** Marketplace
**Agente:** Sistema
**Gatilho:** Compra de produto digital (ebook, curso, template, licença) é concluída com sucesso

**Fluxo Principal:**
1. Sistema confirma pagamento do produto digital
2. Sistema identifica que produto é do tipo "digital"
3. Sistema recupera URL do arquivo ou chave de licença associada ao produto
4. Sistema gera link de download único e temporário (válido por 7 dias)
5. Sistema disponibiliza arquivo na área "Minhas Compras" do participante
6. Sistema envia e-mail com instruções de acesso e link de download
7. Sistema registra data de download quando acessado
8. Sistema notifica expositor sobre entrega concluída

**Fluxo Alternativo (limite de downloads excedido):**
- Participante pode solicitar reenvio
- Sistema notifica expositor para autorizar novo acesso

**Fluxo Alternativo (arquivo corrompido):**
- Participante reporta problema
- Expositor faz upload de nova versão
- Sistema notifica todos os compradores anteriores

**Resposta Esperada:**
Arquivo digital entregue automaticamente com link de download enviado ao comprador

---

## 10. Fluxos da Community

### UC-059: Criação de Fórum de Discussão
**Módulo:** Community
**Agente:** Organizador / Moderador
**Gatilho:** Necessidade de criar um espaço temático para discussões dentro do evento

**Fluxo Principal:**
1. Organizador acessa "Community > Fóruns"
2. Sistema exibe lista de fóruns existentes do evento
3. Organizador clica em "Novo Fórum"
4. Sistema exibe formulário: título, descrição, categoria, regras de participação
5. Organizador define se fórum é público ou restrito a participantes com ingresso
6. Organizador define moderadores do fórum
7. Sistema cria fórum e disponibiliza na área da comunidade
8. Sistema notifica participantes sobre novo fórum disponível

**Fluxo Alternativo (fórum por trilha):**
- Organizador vincula fórum a uma trilha ou sessão específica
- Sistema exibe fórum apenas para participantes inscritos na trilha

**Resposta Esperada:**
Fórum criado e disponível para participação conforme regras definidas

---

### UC-060: Postagem em Tópico do Fórum
**Módulo:** Community
**Agente:** Participante
**Gatilho:** Participante deseja criar um novo tópico ou responder em um tópico existente

**Fluxo Principal:**
1. Participante acessa fórum desejado
2. Sistema exibe lista de tópicos com título, autor, data e número de respostas
3. Participante clica em "Novo Tópico"
4. Sistema exibe formulário: título, conteúdo em rich text, tags opcionais
5. Participante redige mensagem e pode anexar imagens ou arquivos
6. Sistema aplica filtro de conteúdo impróprio
7. Sistema publica tópico no fórum
8. Sistema notifica moderadores e participantes inscritos no fórum
9. Sistema exibe contador de visualizações

**Fluxo Alternativo (responder tópico):**
- Participante clica em "Responder" no tópico desejado
- Sistema exibe editor de resposta
- Participante escreve e publica
- Sistema notifica autor do tópico e demais respondentes

**Fluxo Alternativo (tópico denunciado):**
- Moderador analisa denúncia
- Moderador remove ou mantém tópico conforme política da comunidade

**Resposta Esperada:**
Tópico ou resposta publicado no fórum com notificações enviadas

---

### UC-061: Criação de Grupo de Networking
**Módulo:** Community
**Agente:** Participante
**Gatilho:** Participante deseja criar um grupo temático para conectar outros participantes com interesses comuns

**Fluxo Principal:**
1. Participante acessa "Community > Grupos"
2. Sistema exibe lista de grupos existentes e opção "Criar Grupo"
3. Participante clica em "Criar Grupo"
4. Sistema exibe formulário: nome, descrição, categoria, regras, visibilidade (público/privado)
5. Participante define configurações de privacidade
6. Sistema valida dados e cria grupo
7. Sistema exibe página do grupo com opção de convidar membros
8. Participante convida outros participantes por nome ou e-mail
9. Sistema notifica convidados sobre ingresso no grupo

**Fluxo Alternativo (grupo privado):**
- Participante define grupo como privado
- Novos membros precisam de aprovação do criador
- Sistema envia solicitação para análise

**Resposta Esperada:**
Grupo criado e disponível para participação e convites

---

### UC-062: Envio de Mensagem Privada
**Módulo:** Community
**Agente:** Participante
**Gatilho:** Participante deseja enviar mensagem privada para outro participante sem exposição pública

**Fluxo Principal:**
1. Participante acessa perfil de outro participante
2. Sistema exibe opção "Enviar Mensagem"
3. Participante clica e sistema abre janela de chat privado
4. Participante digita mensagem de texto (máx. 2000 caracteres)
5. Participante pode anexar arquivos (imagens, documentos)
6. Sistema envia mensagem para destinatário
7. Sistema notifica destinatário via push e notificação no app
8. Mensagem fica disponível na caixa de entrada do destinatário

**Fluxo Alternativo (destinatário bloqueou remetente):**
- Sistema verifica lista de bloqueios do destinatário
- Sistema informa remetente que não é possível enviar mensagem

**Fluxo Alternativo (modo não perturbe):**
- Destinatário está com modo "não perturbe" ativado
- Mensagem é entregue sem notificação push
- Destinatário visualiza quando acessar o chat

**Resposta Esperada:**
Mensagem entregue com notificação enviada ao destinatário

---

### UC-063: Moderação de Conteúdo da Comunidade
**Módulo:** Community
**Agente:** Moderador / Administrador
**Gatilho:** Conteúdo denunciado por participantes ou detectado automaticamente como impróprio

**Fluxo Principal:**
1. Moderador acessa "Community > Moderação"
2. Sistema exibe fila de itens pendentes de revisão: tópicos, respostas, mensagens, arquivos
3. Moderador seleciona item para análise
4. Sistema exibe conteúdo completo e motivo da denúncia
5. Moderador avalia violação das regras da comunidade
6. Moderador decide: aprovar, remover ou advertir autor
7. Se remover: sistema oculta conteúdo e notifica autor com justificativa
8. Se advertir: sistema registra advertência no perfil do autor
9. Sistema registra ação no log de moderação
10. Sistema notifica denunciante sobre resolução

**Fluxo Alternativo (reincidência):**
- Sistema detecta múltiplas violações do mesmo usuário
- Sistema sugere banimento temporário ou permanente
- Moderador confirma e sistema aplica sanção

**Fluxo Alternativo (moderação automática):**
- IA Agent analisa conteúdo em tempo real
- IA Agent marca conteúdo suspeito para revisão humana
- IA Agent bloqueia conteúdo com alta probabilidade de violação

**Resposta Esperada:**
Conteúdo moderado conforme políticas da comunidade e ações registradas

---

### UC-064: Criação de Enquete no Grupo
**Módulo:** Community
**Agente:** Participante / Moderador
**Gatilho:** Membro deseja criar uma votação rápida dentro de um grupo para tomar decisões ou coletar opiniões

**Fluxo Principal:**
1. Participante acessa página do grupo desejado
2. Sistema exibe opção "Criar Enquete"
3. Participante clica e sistema exibe formulário: pergunta, opções de resposta
4. Participante define tipo (única escolha ou múltipla escolha)
5. Participante define data de encerramento
6. Participante pode restringir visibilidade dos votos
7. Sistema publica enquete no feed do grupo
8. Sistema notifica membros do grupo sobre nova enquete
9. Membros votam e sistema consolida resultados em tempo real
10. Ao encerrar, sistema exibe resultado final no grupo

**Fluxo Alternativo (edição de enquete):**
- Criador edita opções antes do primeiro voto
- Sistema atualiza enquete sem perder dados

**Fluxo Alternativo (votação anônima):**
- Participante ativa modo anônimo
- Sistema não exibe quem votou em cada opção

**Resposta Esperada:**
Enquete criada, votada pelos membros e resultado consolidado

---

### UC-065: Compartilhamento de Arquivos na Comunidade
**Módulo:** Community
**Agente:** Participante
**Gatilho:** Participante deseja compartilhar arquivos (PDFs, imagens, apresentações) com membros do grupo ou fórum

**Fluxo Principal:**
1. Participante acessa grupo ou tópico onde deseja compartilhar
2. Participante clica em "Anexar Arquivo" no editor
3. Sistema abre seletor de arquivos (upload local ou drive integrado)
4. Participante seleciona arquivo
5. Sistema valida tipo, tamanho e conteúdo contra malware
6. Sistema faz upload para storage temporário ou permanente
7. Sistema anexa arquivo à postagem com preview (se suportado)
8. Participante publica conteúdo
9. Arquivo fica disponível para download pelos membros
10. Sistema registra metadata: autor, data, tamanho, número de downloads

**Fluxo Alternativo (limite de tamanho excedido):**
- Sistema informa tamanho máximo permitido (ex.: 50MB)
- Participante compacta arquivo ou usa link externo

**Fluxo Alternativo (tipo não permitido):**
- Sistema bloqueia extensões .exe, .bat, .msi
- Participante converte arquivo ou remove

**Resposta Esperada:**
Arquivo validado, anexado e disponível para download pelos membros

---

### UC-066: Denúncia de Conteúdo Impróprio
**Módulo:** Community
**Agente:** Participante
**Gatilho:** Participante identifica conteúdo ofensivo, spam ou inadequado na comunidade

**Fluxo Principal:**
1. Participante identifica conteúdo inadequado (tópico, resposta, mensagem, arquivo)
2. Participante clica em "Denunciar" no conteúdo
3. Sistema exibe formulário com motivos predefinidos: spam, discurso de ódio, conteúdo ofensivo, violação de direitos autorais
4. Participante seleciona motivo e adiciona descrição opcional
5. Sistema registra denúncia anonimamente
6. Sistema adiciona item à fila de moderação
7. Moderador analisa conforme UC-063
8. Sistema notifica denunciante sobre resolução da denúncia

**Fluxo Alternativo (denúncia duplicada):**
- Sistema detecta denúncia já registrada para o mesmo conteúdo pelo mesmo usuário
- Sistema informa que denúncia já foi registrada

**Resposta Esperada:**
Denúncia registrada anonimamente e encaminhada para moderação

---

## 11. Fluxos da Academy

### UC-067: Matrícula em Curso
**Módulo:** Academy
**Agente:** Participante (Aluno)
**Gatilho:** Participante deseja se inscrever em um curso oferecido na plataforma

**Fluxo Principal:**
1. Participante acessa "Academy > Catálogo de Cursos"
2. Sistema exibe lista de cursos disponíveis com título, instrutor, carga horária, nível
3. Participante seleciona curso desejado
4. Sistema exibe página do curso: descrição, programa, pré-requisitos, avaliações
5. Participante clica em "Matricular-se"
6. Sistema verifica se curso é gratuito ou pago
7. Se pago: sistema redireciona para checkout e processa pagamento
8. Se gratuito: sistema confirma matrícula automaticamente
9. Sistema associa curso ao perfil do participante
10. Sistema disponibiliza conteúdo do curso na área "Meus Cursos"
11. Sistema notifica participante sobre matrícula confirmada
12. Sistema notifica instrutor sobre novo aluno

**Fluxo Alternativo (limite de vagas):**
- Sistema verifica vagas disponíveis
- Se esgotado: sistema exibe lista de espera
- Participante se inscreve na lista e é notificado quando vaga surgir

**Fluxo Alternativo (pré-requisito não atendido):**
- Sistema verifica conclusão de pré-requisitos
- Se não atendido: sistema informa e sugere curso preparatório

**Resposta Esperada:**
Matrícula confirmada e conteúdo do curso liberado para o aluno

---

### UC-068: Progressão em Aula com Quiz
**Módulo:** Academy
**Agente:** Participante (Aluno)
**Gatilho:** Aluno conclui aula teórica e precisa realizar quiz de verificação de aprendizado

**Fluxo Principal:**
1. Aluno acessa "Meus Cursos" e seleciona curso em andamento
2. Sistema exibe menu de aulas organizadas por módulo
3. Aluno seleciona aula e assiste conteúdo (vídeo, texto, apresentação)
4. Sistema marca aula como "assistida" após 90% de progresso
5. Sistema libera quiz da aula automaticamente
6. Sistema exibe quiz com questões (múltipla escolha, V/F, dissertativa)
7. Aluno responde questões e submete
8. Sistema corrige automaticamente questões objetivas
9. Sistema exibe resultado imediato com acertos e erros
10. Se nota >= 70% (configurável): sistema libera próxima aula
11. Sistema registra nota e progresso no histórico do aluno
12. Sistema atualiza barra de progresso do curso

**Fluxo Alternativo (reprovado no quiz):**
- Sistema informa nota insuficiente
- Aluno revisa conteúdo e refaz o quiz conforme UC-073

**Resposta Esperada:**
Quiz corrigido, nota registrada e próxima aula liberada (se aprovado)

---

### UC-069: Emissão de Certificado de Conclusão
**Módulo:** Academy
**Agente:** Sistema
**Gatilho:** Aluno conclui 100% do curso com aprovação em todos os quizzes obrigatórios

**Fluxo Principal:**
1. Sistema detecta conclusão do curso (aulas assistidas + quizzes aprovados)
2. Sistema verifica presença em atividades presenciais (se houver)
3. Sistema gera certificado digital com: nome do aluno, nome do curso, carga horária, data de conclusão, código de validação único
4. Sistema armazena certificado em storage seguro
5. Sistema disponibiliza certificado na área "Meus Certificados" do aluno
6. Sistema envia e-mail com link de download
7. Sistema registra hash do certificado em blockchain para verificação de autenticidade
8. Aluno pode compartilhar certificado em LinkedIn ou redes sociais

**Fluxo Alternativo (certificado com honra):**
- Aluno com média > 90% recebe certificado com distinção "Com Honra"
- Sistema gera versão especial do certificado

**Resposta Esperada:**
Certificado de conclusão emitido, disponível para download e verificável

---

### UC-070: Criação de Curso pelo Instrutor
**Módulo:** Academy
**Agente:** Instrutor
**Gatilho:** Instrutor deseja criar e disponibilizar um novo curso na plataforma

**Fluxo Principal:**
1. Instrutor acessa "Academy > Instrutor > Novo Curso"
2. Sistema exibe formulário de criação: título, descrição, categoria, nível, carga horária estimada, thumbnail
3. Instrutor preenche dados e define preço (gratuito ou pago)
4. Sistema permite criar módulos e organizar aulas dentro de cada módulo
5. Instrutor adiciona aula com tipo (vídeo, texto, quiz, arquivo)
6. Para aula em vídeo: instrutor faz upload ou insere URL (YouTube/Vimeo)
7. Para aula com quiz: instrutor cria questões com alternativas e gabarito
8. Sistema salva rascunho do curso
9. Instrutor submete curso para revisão
10. Administrador revisa conteúdo e aprova
11. Sistema publica curso no catálogo

**Fluxo Alternativo (curso rejeitado na revisão):**
- Sistema notifica instrutor com motivo da rejeição
- Instrutor ajusta conteúdo e reenvia

**Fluxo Alternativo (curso com certificado personalizado):**
- Instrutor faz upload de modelo de certificado personalizado
- Sistema valida e associa ao curso

**Resposta Esperada:**
Curso criado, revisado, aprovado e publicado no catálogo da Academy

---

### UC-071: Avaliação de Curso pelo Aluno
**Módulo:** Academy
**Agente:** Participante (Aluno)
**Gatilho:** Aluno conclui o curso (ou atinge 50% de progresso) e deseja avaliar a experiência

**Fluxo Principal:**
1. Aluno acessa "Meus Cursos > Concluídos"
2. Sistema exibe lista de cursos finalizados com opção "Avaliar Curso"
3. Aluno seleciona curso
4. Sistema exibe formulário de avaliação: nota geral 1-5, avaliação de conteúdo, didática, material de apoio
5. Aluno preenche avaliação e comentário
6. Sistema submete avaliação
7. Sistema atualiza nota média do curso no catálogo
8. Sistema notifica instrutor sobre nova avaliação
9. Sistema exibe agradecimento ao aluno

**Fluxo Alternativo (avaliação editável):**
- Aluno edita avaliação em até 15 dias após envio
- Sistema recalcula média

**Resposta Esperada:**
Avaliação registrada e nota média do curso atualizada

---

### UC-072: Geração de Relatório de Desempenho
**Módulo:** Academy
**Agente:** Instrutor
**Gatilho:** Instrutor deseja visualizar métricas de desempenho dos alunos em seu curso

**Fluxo Principal:**
1. Instrutor acessa "Academy > Instrutor > Relatórios"
2. Sistema exibe lista de cursos do instrutor
3. Instrutor seleciona curso desejado
4. Sistema exibe dashboard com métricas: total de matrículas, taxa de conclusão, média de notas, tempo médio de conclusão
5. Instrutor filtra por período, módulo ou aluno específico
6. Sistema exibe gráficos de evolução e desempenho por aluno
7. Instrutor pode visualizar detalhes de cada aluno (notas por quiz, progresso, tempo de acesso)
8. Instrutor exporta relatório em PDF ou CSV
9. Sistema sugere ações corretivas para alunos com baixo desempenho

**Fluxo Alternativo (relatório comparativo):**
- Instrutor seleciona múltiplos cursos
- Sistema gera relatório comparativo de desempenho entre cursos

**Resposta Esperada:**
Relatório de desempenho gerado com métricas exportáveis

---

### UC-073: Reprovação e Retentativa de Quiz
**Módulo:** Academy
**Agente:** Participante (Aluno)
**Gatilho:** Aluno não atinge nota mínima no quiz e deseja tentar novamente

**Fluxo Principal:**
1. Aluno recebe resultado "Reprovado" no quiz (nota < 70%)
2. Sistema exibe tela com nota, questões erradas e gabarito comentado
3. Sistema disponibiliza opção "Revisar Conteúdo" com material da aula
4. Aluno revisa o conteúdo novamente
5. Sistema habilita botão "Tentar Novamente" após 30 minutos de espera
6. Aluno clica em "Tentar Novamente"
7. Sistema gera nova versão do quiz com questões embaralhadas e alternativas trocadas
8. Aluno responde novo quiz
9. Sistema corrige e exibe resultado
10. Se aprovado: sistema libera próxima aula
11. Se reprovado: sistema repete o ciclo (máximo de 3 tentativas)

**Fluxo Alternativo (3ª tentativa reprovada):**
- Sistema bloqueia novas tentativas
- Sistema sugere agendar tutoria com instrutor
- Sistema notifica instrutor sobre dificuldade do aluno

**Fluxo Alternativo (limite de tentativas configurável):**
- Instrutor define limite máximo de tentativas por curso
- Sistema respeita configuração definida

**Resposta Esperada:**
Aluno revisa conteúdo e realiza nova tentativa com questões diferentes

---

### UC-074: Gerenciamento de Turmas
**Módulo:** Academy
**Agente:** Instrutor
**Gatilho:** Instrutor deseja organizar alunos em turmas com datas de início e fim definidas

**Fluxo Principal:**
1. Instrutor acessa "Academy > Instrutor > Turmas"
2. Sistema exibe lista de turmas existentes do curso
3. Instrutor clica em "Nova Turma"
4. Sistema exibe formulário: nome da turma, data início, data fim, vagas, horário
5. Instrutor define cronograma de aulas por módulo
6. Sistema cria turma e disponibiliza para matrícula
7. Alunos se matriculam na turma específica via UC-067
8. Instrutor acompanha progresso da turma no dashboard
9. Ao encerrar, sistema gera relatório consolidado da turma

**Fluxo Alternativo (turma com vagas limitadas):**
- Sistema controla número de matrículas
- Ao atingir limite, turma é marcada como "completa"
- Instrutor pode abrir nova turma

**Resposta Esperada:**
Turma criada com cronograma e alunos organizados

---

### UC-075: Interação Aluno-Instrutor via Fórum do Curso
**Módulo:** Academy
**Agente:** Participante (Aluno) / Instrutor
**Gatilho:** Aluno possui dúvida sobre conteúdo do curso e utiliza o fórum integrado

**Fluxo Principal:**
1. Aluno acessa aula e clica em "Tirar Dúvida"
2. Sistema abre fórum específico da aula dentro do curso
3. Sistema busca automaticamente perguntas similares já respondidas
4. Se dúvida já respondida: sistema sugere resposta existente
5. Se nova: aluno digita pergunta e publica
6. Sistema notifica instrutor e demais alunos da turma
7. Instrutor ou outro aluno responde
8. Sistema notifica autor da pergunta sobre resposta
9. Aluno marca resposta como "resolveu minha dúvida"
10. Sistema registra estatística de dúvidas respondidas no curso

**Fluxo Alternativo (pergunta respondida por IA):**
- IA Agent analisa conteúdo da dúvida
- IA Agent gera resposta com base no material do curso
- IA Agent sugere resposta para aprovação do instrutor

**Resposta Esperada:**
Dúvida publicada, respondida e marcada como resolvida

---

## 12. Fluxos de Billing

### UC-076: Assinatura de Plano
**Módulo:** Billing
**Agente:** Organizador
**Gatilho:** Organizador adquire plano de assinatura para utilizar a plataforma

**Fluxo Principal:**
1. Organizador acessa "Planos e Preços"
2. Sistema exibe lista de planos disponíveis: Free, Starter, Professional, Enterprise
3. Organizador seleciona plano desejado
4. Sistema exibe detalhes: valor mensal/anual, limites de eventos, funcionalidades inclusas
5. Organizador escolhe ciclo de faturamento (mensal ou anual com desconto)
6. Sistema exibe resumo e valor total
7. Organizador insere dados de pagamento (cartão de crédito)
8. Sistema processa pagamento via gateway
9. Sistema ativa plano e associa à organização
10. Sistema gera primeira fatura
11. Sistema envia e-mail de confirmação com detalhes do plano

**Fluxo Alternativo (período de trial):**
- Organizador inicia trial gratuito de 14 dias
- Sistema ativa plano sem cobrança imediata
- Sistema agenda primeira cobrança para o fim do trial

**Fluxo Alternativo (cupom de desconto):**
- Organizador insere cupom promocional
- Sistema valida e aplica desconto
- Sistema recalcula valor da assinatura

**Resposta Esperada:**
Plano ativado, pagamento processado e primeira fatura gerada

---

### UC-077: Upgrade de Plano
**Módulo:** Billing
**Agente:** Organizador
**Gatilho:** Organizador precisa de mais recursos ou limites e decide migrar para um plano superior

**Fluxo Principal:**
1. Organizador acessa "Configurações > Plano"
2. Sistema exibe plano atual e opções de upgrade disponíveis
3. Organizador seleciona novo plano desejado
4. Sistema calcula valor proporcional ao restante do ciclo vigente
5. Sistema exibe resumo: plano atual x novo plano, valor a pagar ou crédito
6. Organizador confirma upgrade
7. Sistema processa cobrança ou ajuste proporcional
8. Sistema atualiza plano da organização imediatamente
9. Sistema libera novas funcionalidades e limites
10. Sistema gera nota de crédito (se aplicável) para o período não utilizado
11. Sistema envia e-mail de confirmação do upgrade

**Fluxo Alternativo (upgrade com desconto anual):**
- Sistema converte ciclo mensal para anual com desconto
- Organizador paga diferença para anual

**Resposta Esperada:**
Plano atualizado com novos recursos liberados e valores ajustados

---

### UC-078: Cancelamento de Assinatura
**Módulo:** Billing
**Agente:** Organizador
**Gatilho:** Organizador decide encerrar o uso da plataforma e cancelar o plano

**Fluxo Principal:**
1. Organizador acessa "Configurações > Plano > Cancelar Assinatura"
2. Sistema exibe aviso sobre consequências: perda de acesso, dados retidos por 90 dias
3. Sistema solicita motivo do cancelamento (lista e campo livre)
4. Organizador seleciona motivo e confirma cancelamento
5. Sistema verifica se há eventos publicados ativos
6. Sistema agenda cancelamento para o fim do ciclo de faturamento vigente
7. Sistema mantém acesso até o término do período pago
8. Sistema envia e-mail de confirmação com data de desativação
9. Sistema oferta plano gratuito como alternativa
10. Sistema registra churn na base de analytics

**Fluxo Alternativo (cancelamento imediato):**
- Organizador solicita cancelamento imediato
- Sistema perde acesso imediatamente
- Sistema não reembolsa período não utilizado (conforme política)

**Fluxo Alternativo (reativação):**
- Organizador reativa assinatura dentro do período de retenção
- Sistema restaura dados e acesso
- Sistema retoma cobrança normal

**Resposta Esperada:**
Assinatura cancelada conforme política, acesso mantido até fim do ciclo

---

### UC-079: Geração de Fatura
**Módulo:** Billing
**Agente:** Sistema
**Gatilho:** Ciclo de faturamento é concluído ou assinatura é ativada

**Fluxo Principal:**
1. Sistema identifica faturamento mensal devido
2. Sistema recupera dados da organização e plano contratado
3. Sistema calcula valor com base no plano, descontos e taxas
4. Sistema gera fatura com identificação única
5. Sistema registra fatura no ledger financeiro
6. Sistema disponibiliza fatura na área "Financeiro > Faturas"
7. Sistema envia fatura por e-mail em PDF
8. Sistema tenta cobrança automática no cartão salvo (se houver)
9. Se cobrança bem-sucedida: sistema marca fatura como "paga"
10. Se falha: sistema agenda retentativas conforme UC-082

**Fluxo Alternativo (fatura com ajustes):**
- Organizador solicita ajuste na fatura
- Administrador lança crédito ou débito manual
- Sistema regenera fatura com ajuste

**Resposta Esperada:**
Fatura gerada, disponível para consulta e cobrança processada

---

### UC-080: Pagamento via PIX
**Módulo:** Billing
**Agente:** Participante / Organizador
**Gatilho:** Usuário seleciona PIX como forma de pagamento durante o checkout

**Fluxo Principal:**
1. Usuário seleciona "PIX" como método de pagamento
2. Sistema gera código PIX estático ou dinâmico (QR Code + copia e cola)
3. Sistema associa código PIX à transação com identificador único
4. Sistema exibe QR Code na tela com instruções de pagamento
5. Usuário abre aplicativo do banco e lê QR Code ou copia código
6. Usuário autoriza pagamento no aplicativo bancário
7. Sistema aguarda confirmação via webhook do gateway (até 15 minutos)
8. Gateway envia confirmação de pagamento
9. Sistema valida webhook e confirma transação
10. Sistema libera produto/serviço e envia comprovante
11. Sistema redireciona usuário para página de sucesso

**Fluxo Alternativo (PIX expirado):**
- Código PIX expira após 15 minutos
- Sistema exibe mensagem de expiração
- Usuário pode gerar novo código PIX com clique

**Fluxo Alternativo (pagamento parcial via PIX):**
- Usuário paga valor incorreto
- Sistema detecta divergência e agenda conciliação manual
- Sistema notifica suporte para análise

**Resposta Esperada:**
Pagamento PIX processado, confirmado via webhook e produto liberado

---

### UC-081: Crédito e Reembolso
**Módulo:** Billing
**Agente:** Financeiro
**Gatilho:** Necessidade de estornar valor ou conceder crédito na conta do usuário

**Fluxo Principal:**
1. Financeiro acessa "Billing > Transações"
2. Sistema exibe lista de transações concluídas
3. Financeiro seleciona transação alvo
4. Sistema exibe detalhes da transação: valor, método, data, status
5. Financeiro seleciona ação: "Reembolsar" ou "Criar Crédito"
6. Para reembolso: sistema processa estorno via gateway
7. Para crédito: sistema adiciona saldo na carteira do usuário
8. Sistema registra movimento no ledger financeiro
9. Sistema notifica usuário sobre crédito ou reembolso
10. Sistema atualiza saldo disponível na conta do usuário

**Fluxo Alternativo (reembolso parcial):**
- Financeiro define valor parcial a ser reembolsado
- Sistema processa estorno parcial no gateway
- Sistema ajusta valores proporcionais

**Fluxo Alternativo (crédito expirado):**
- Sistema define validade do crédito (30/60/90 dias)
- Ao expirar, crédito é revertido para a plataforma
- Sistema notifica usuário antes do vencimento

**Resposta Esperada:**
Reembolso ou crédito processado e saldo do usuário atualizado

---

### UC-082: Notificação de Vencimento
**Módulo:** Billing
**Agente:** Sistema
**Gatilho:** Assinatura próxima do vencimento ou fatura pendente de pagamento

**Fluxo Principal:**
1. Sistema identifica faturas a vencer nos próximos 7, 3 e 1 dia
2. Sistema dispara notificação por e-mail com valor e data
3. Sistema envia push notification no app
4. Sistema envia mensagem WhatsApp (se configurado)
5. Na data de vencimento, sistema tenta cobrança automática no cartão salvo
6. Se cobrança falha: sistema marca fatura como "vencida"
7. Sistema agenda retentativas: D+1, D+3, D+7
8. Sistema notifica usuário a cada tentativa falha
9. Após 7 dias sem sucesso: sistema suspende acesso a recursos premium
10. Após 30 dias: sistema desativa conta e retém dados

**Fluxo Alternativo (pagamento manual):**
- Usuário clica no link "Pagar Agora" da notificação
- Sistema redireciona para página de pagamento
- Usuário paga com cartão ou PIX
- Sistema regulariza fatura imediatamente

**Resposta Esperada:**
Notificações enviadas em múltiplos canais e cobrança processada com retentativas

---

### UC-083: Histórico de Transações Financeiras
**Módulo:** Billing
**Agente:** Organizador / Financeiro
**Gatilho:** Usuário deseja consultar extrato completo de transações da sua conta

**Fluxo Principal:**
1. Usuário acessa "Billing > Histórico de Transações"
2. Sistema exibe tabela com transações: data, descrição, valor, status, método
3. Sistema permite filtros por: período, tipo (pagamento, reembolso, crédito), status (pendente, concluído, falha)
4. Usuário ordena por coluna (data, valor)
5. Usuário clica em transação para ver detalhes
6. Sistema exibe comprovante digital da transação
7. Usuário exporta extrato em CSV ou PDF
8. Sistema disponibiliza API para integração contábil

**Fluxo Alternativo (transação em disputa):**
- Sistema marca transação com status "disputa"
- Sistema exibe indicador de análise
- Usuário acompanha status no mesmo histórico

**Resposta Esperada:**
Histórico de transações exibido com filtros e exportação disponível

---

## 13. Fluxos de Networking

### UC-084: Match Inteligente entre Participantes
**Módulo:** Networking
**Agente:** Participante / IA Agent
**Gatilho:** Participante ativa o recurso de match para encontrar conexões relevantes no evento

**Fluxo Principal:**
1. Participante acessa "Networking > Match Inteligente"
2. Sistema exibe perfil do participante com áreas de interesse, cargo, setor
3. Participante ajusta preferências de match (setores, cargos, objetivos)
4. IA Agent processa perfil e preferências
5. IA Agent compara com perfis de outros participantes com networking ativo
6. Sistema exibe lista de matches sugeridos com score de compatibilidade
7. Participante visualiza perfil resumido de cada match
8. Participante envia "Interesse" para um match
9. Se recíproco: sistema cria conexão e libera chat
10. Sistema notifica ambas as partes sobre o match

**Fluxo Alternativo (match sem reciprocidade):**
- Participante aguarda resposta do outro
- Após 72h sem resposta, sugestão expira
- Participante pode enviar nova solicitação

**Fluxo Alternativo (IA Agent ajustando sugestões):**
- IA Agent aprende com interações do participante
- IA Agent refina matches ao longo do evento
- IA Agent sugere novas conexões baseadas em comportamento

**Resposta Esperada:**
Matches sugeridos com score de compatibilidade e conexões estabelecidas por reciprocidade

---

### UC-085: Agendamento de Reunião
**Módulo:** Networking
**Agente:** Participante
**Gatilho:** Participante conectado deseja agendar uma reunião presencial ou virtual com outro participante

**Fluxo Principal:**
1. Participante acessa perfil de conexão já estabelecida
2. Sistema exibe opção "Agendar Reunião"
3. Participante clica e sistema exibe calendário com disponibilidade de horários
4. Sistema cruza agendas dos dois participantes
5. Sistema exibe slots disponíveis em comum
6. Participante seleciona horário e local (presencial: estande/sala / virtual: link gerado)
7. Participante adiciona pauta opcional da reunião
8. Sistema envia convite para o outro participante
9. Destinatário aceita, recusa ou sugere novo horário
10. Se aceito: sistema cria evento na agenda de ambos
11. Sistema envia lembretes 24h e 1h antes

**Fluxo Alternativo (reunião virtual):**
- Sistema gera link de videoconferência (Zoom/Meet/Plataforma própria)
- Link é incluído no convite
- Sistema abre link automaticamente no horário agendado

**Fluxo Alternativo (cancelamento):**
- Participante cancela reunião
- Sistema notifica o outro participante
- Sistema libera horário para novo agendamento

**Resposta Esperada:**
Reunião agendada com horário confirmado e lembretes programados

---

### UC-086: Troca de Cartão Virtual
**Módulo:** Networking
**Agente:** Participante
**Gatilho:** Participante conhece outro participante e deseja trocar contatos profissionalmente

**Fluxo Principal:**
1. Participante acessa perfil de outro participante
2. Sistema exibe opção "Trocar Cartão Virtual"
3. Participante clica e sistema exibe preview do cartão virtual (nome, cargo, empresa, contato, QR code)
4. Participante personaliza informações do cartão antes do envio
5. Sistema envia cartão virtual para o outro participante
6. Destinatário recebe notificação com preview
7. Destinatário aceita e adiciona à sua lista de contatos
8. Sistema adiciona contato mutualmente na agenda de ambos
9. Sistema registra data e local da troca

**Fluxo Alternativo (troca em lote):**
- Participante ativa modo "troca rápida" via QR code
- Sistema exibe QR code na tela
- Outro participante lê QR code com câmera do app
- Troca é realizada instantaneamente

**Fluxo Alternativo (cartão sincronizado com CRM):**
- Sistema exporta dados do cartão para CRM integrado
- Participante define regra de sincronização automática

**Resposta Esperada:**
Cartões trocados e contatos adicionados à agenda de ambos os participantes

---

### UC-087: Chat em Tempo Real
**Módulo:** Networking
**Agente:** Participante
**Gatilho:** Participantes conectados desejam conversar em tempo real durante o evento

**Fluxo Principal:**
1. Participante acessa "Networking > Conversas"
2. Sistema exibe lista de conexões com últimas mensagens
3. Participante seleciona contato para conversar
4. Sistema abre janela de chat com WebSocket ativo
5. Participante digita mensagem e envia
6. Sistema entrega mensagem em tempo real via WebSocket
7. Sistema exibe indicador "digitando" quando o outro participante escreve
8. Sistema exibe confirmação de leitura (visualizado)
9. Participante pode enviar imagens, arquivos e emojis
10. Sistema armazena histórico de conversas na nuvem
11. Sistema notifica push quando participante está offline

**Fluxo Alternativo (moderador no chat):**
- Sistema permite que moderador acompanhe chats públicos
- Moderador pode intervir se necessário

**Fluxo Alternativo (bloqueio):**
- Participante bloqueia contato
- Sistema encerra sessão de chat
- Mensagens anteriores são ocultadas

**Resposta Esperada:**
Chat em tempo real estabelecido com mensagens entregues instantaneamente

---

### UC-088: Criação de Perfil Profissional para Networking
**Módulo:** Networking
**Agente:** Participante
**Gatilho:** Participante deseja configurar seu perfil profissional para ser encontrado por outros participantes

**Fluxo Principal:**
1. Participante acessa "Networking > Meu Perfil"
2. Sistema exibe formulário com dados básicos pré-preenchidos do cadastro
3. Participante adiciona: foto profissional, cargo, empresa, biografia, áreas de interesse
4. Participante adiciona links: LinkedIn, GitHub, portfólio
5. Participante define disponibilidade para networking (disponível, ocupado, invisível)
6. Participante ativa modo "aberto a conexões"
7. Sistema salva perfil e disponibiliza no diretório de participantes
8. Sistema calcula score de completude do perfil
9. Sistema sugere melhorias para perfil mais atrativo

**Fluxo Alternativo (privacidade):**
- Participante define campos visíveis/invisíveis no perfil
- Participante ativa modo anônimo (dados básicos apenas)
- Sistema respeita preferências de visibilidade

**Resposta Esperada:**
Perfil profissional configurado e disponível no diretório de networking

---

### UC-089: Lista de Contatos e Conexões
**Módulo:** Networking
**Agente:** Participante
**Gatilho:** Participante deseja visualizar e gerenciar sua rede de contatos do evento

**Fluxo Principal:**
1. Participante acessa "Networking > Meus Contatos"
2. Sistema exibe lista de conexões estabelecidas
3. Participante busca contato por nome ou empresa
4. Sistema exibe perfil resumido de cada contato
5. Participante pode: enviar mensagem, agendar reunião, remover contato, exportar contato
6. Participante marca contatos como "favoritos"
7. Sistema permite exportar lista completa para vCard ou CSV
8. Sistema sincroniza contatos com agenda do telefone (se autorizado)

**Fluxo Alternativo (contato removido):**
- Participante remove contato da lista
- Sistema confirma remoção
- Conexão é desfeita e chat é arquivado

**Resposta Esperada:**
Lista de contatos exibida com opções de gerenciamento e exportação

---

### UC-090: Indicação de Participantes com Interesses Similares
**Módulo:** Networking
**Agente:** IA Agent
**Gatilho:** Participante acessa o feed de networking e IA Agent identifica afinidades não exploradas

**Fluxo Principal:**
1. Participante acessa "Networking > Sugestões"
2. IA Agent analisa perfil, histórico de sessões assistidas e interações do participante
3. IA Agent cruza dados com outros participantes
4. Sistema exibe lista "Participantes com interesses similares"
5. Cada sugestão inclui nome, cargo e motivo da similaridade
6. Participante visualiza sugestões e pode enviar solicitação de conexão
7. Sistema aprende com aceitações e recusas para refinar sugestões futuras

**Fluxo Alternativo (interesses em comum por sessão):**
- IA Agent identifica participantes que assistiram às mesmas sessões
- Sugestão inclui "Assistiram à mesma palestra: X"
- Participante usa como gancho para conexão

**Resposta Esperada:**
Sugestões de conexão baseadas em afinidade e comportamento no evento

---

## 14. Fluxos de Gamification

### UC-091: Ganho de Badge por Conquista
**Módulo:** Gamification
**Agente:** Sistema
**Gatilho:** Participante realiza ação que dispara uma conquista predefinida no sistema de gamificação

**Fluxo Principal:**
1. Sistema detecta evento de conquista (ex.: primeiro check-in, avaliação de 5 palestras, convite de 3 amigos)
2. Sistema consulta regras de badges configuradas
3. Sistema verifica se participante já possui badge
4. Se não possui: sistema concede badge ao participante
5. Sistema registra badge no perfil do participante
6. Sistema exibe notificação "Nova conquista desbloqueada!" com badge
7. Sistema adiciona badge à coleção do participante
8. Sistema contabiliza pontos extras (XP) pela conquista
9. Sistema publica conquista no feed da comunidade (se público)
10. Sistema verifica se badge completa conjunto para badge especial

**Fluxo Alternativo (badge por nível):**
- Badge é concedido ao atingir determinado nível de XP
- Sistema calcula XP total e confere badge automaticamente

**Fluxo Alternativo (badge temporário):**
- Badge tem validade (ex.: "Top 10 do mês")
- Sistema revoga badge ao expirar o período
- Sistema notifica participante sobre expiração

**Resposta Esperada:**
Badge concedido ao participante com notificação e registro no perfil

---

### UC-092: Progressão em Leaderboard
**Módulo:** Gamification
**Agente:** Participante / Sistema
**Gatilho:** Participante acumula pontos e deseja acompanhar sua posição no ranking do evento

**Fluxo Principal:**
1. Participante acessa "Gamificação > Leaderboard"
2. Sistema exibe ranking geral dos participantes com mais pontos no evento
3. Sistema exibe posição do participante em destaque
4. Sistema exibe categorias de ranking: geral, por trilha, por dia, por atividade
5. Participante alterna entre categorias
6. Sistema exibe placar com: posição, nome, avatar, pontos, badges, nível
7. Sistema atualiza leaderboard em tempo real
8. Participante visualiza diferença de pontos para o próximo colocado
9. Sistema sugere ações para subir de posição

**Fluxo Alternativo (filtro por empresa):**
- Participante filtra ranking por empresa
- Sistema exibe apenas participantes da mesma empresa

**Fluxo Alternativo (histórico de posição):**
- Participante visualiza gráfico de evolução no ranking ao longo do evento
- Sistema exibe dias com maior ganho de pontos

**Resposta Esperada:**
Leaderboard exibido com posição atualizada e informações detalhadas

---

### UC-093: Resgate de Recompensa
**Módulo:** Gamification
**Agente:** Participante
**Gatilho:** Participante acumula pontos ou moedas virtuais suficientes para trocar por recompensas

**Fluxo Principal:**
1. Participante acessa "Gamificação > Loja de Recompensas"
2. Sistema exibe catálogo de recompensas disponíveis: descontos, brindes, upgrades, experiências
3. Cada recompensa exibe: descrição, custo em pontos/moedas, quantidade disponível
4. Participante seleciona recompensa desejada
5. Sistema verifica saldo de pontos do participante
6. Se saldo suficiente: sistema exibe confirmação
7. Participante confirma resgate
8. Sistema debita pontos do saldo do participante
9. Sistema libera recompensa conforme tipo: código de desconto, voucher, download
10. Sistema registra resgate no histórico do participante
11. Sistema notifica participante sobre resgate bem-sucedido

**Fluxo Alternativo (saldo insuficiente):**
- Sistema informa quantidade de pontos faltantes
- Sistema sugere ações para ganhar mais pontos

**Fluxo Alternativo (recompensa esgotada):**
- Sistema marca recompensa como "indisponível"
- Participante ativa notificação de reposição

**Resposta Esperada:**
Recompensa resgatada com sucesso e pontos debitados do saldo do participante

---

### UC-094: Missão Diária
**Módulo:** Gamification
**Agente:** Sistema / Participante
**Gatilho:** Novo dia do evento inicia e sistema disponibiliza missões diárias para engajamento

**Fluxo Principal:**
1. Sistema identifica início de novo dia do evento
2. Sistema seleciona missões disponíveis para o dia (aleatórias ou baseadas no perfil)
3. Sistema exibe missões na área "Gamificação > Missões Diárias"
4. Cada missão exibe: objetivo, recompensa (XP, badge, moeda), progresso
5. Exemplos de missões: "Assista 3 palestras", "Conecte-se com 5 participantes", "Avalie 2 sessões"
6. Participante visualiza missões disponíveis
7. Participante realiza ações necessárias para cumprir as missões
8. Sistema rastreia progresso em tempo real
9. Ao completar missão: sistema concede recompensa automaticamente
10. Sistema exibe notificação "Missão cumprida!" com recompensa
11. Sistema renova missões no dia seguinte

**Fluxo Alternativo (missão não cumprida):**
- Missão expira ao final do dia
- Sistema arquiva missão como "não concluída"
- Participante pode tentar missões similares no próximo dia

**Fluxo Alternativo (missão bônus):**
- Sistema libera missão surpresa com recompensa especial
- Missão aparece com timer de 2 horas
- Participante corre para cumprir dentro do prazo

**Resposta Esperada:**
Missões diárias exibidas, progresso rastreado e recompensas concedidas automaticamente

---

### UC-095: Nível de Experiência do Usuário
**Módulo:** Gamification
**Agente:** Sistema
**Gatilho:** Participante acumula XP (pontos de experiência) suficiente para avançar de nível

**Fluxo Principal:**
1. Sistema registra ação do participante que concede XP
2. Sistema adiciona XP ao total acumulado do participante
3. Sistema verifica se XP total atingiu o limite do nível atual
4. Se sim: sistema promove participante para o próximo nível
5. Sistema exibe animação de "Subiu de Nível!"
6. Sistema desbloqueia benefícios do novo nível (badges, funcionalidades)
7. Sistema atualiza badge de nível no perfil
8. Sistema publica evolução no feed (se público)
9. Sistema recalcula leaderboard com novo nível

**Fluxo Alternativo (nível máximo):**
- Participante atinge nível máximo disponível
- Sistema concede badge "Lenda" ou equivalente
- Sistema redireciona XP excedente para conquistas especiais

**Resposta Esperada:**
Participante promovido de nível com benefícios desbloqueados

---

### UC-096: Ranking Semanal de Engajamento
**Módulo:** Gamification
**Agente:** Sistema
**Gatilho:** Semana de evento é concluída e sistema consolida ranking semanal

**Fluxo Principal:**
1. Sistema identifica fim da semana de evento (domingo 23h59)
2. Sistema calcula pontuação semanal de cada participante
3. Sistema ordena participantes por pontos ganhos na semana
4. Sistema define top 10 da semana
5. Sistema concede badges especiais para top 3 (ouro, prata, bronze)
6. Sistema publica ranking semanal no feed da comunidade
7. Sistema notifica participantes destacados
8. Sistema zera pontuação semanal para início da próxima semana
9. Sistema mantém pontuação geral acumulada

**Fluxo Alternativo (empate):**
- Sistema desempata por quem atingiu a pontuação primeiro
- Sistema ordena por timestamp da última atividade

**Resposta Esperada:**
Ranking semanal consolidado, badges concedidos e comunidade notificada

---

### UC-097: Notificação de Conquista Desbloqueada
**Módulo:** Gamification
**Agente:** Sistema
**Gatilho:** Participante desbloqueia badge, sobe de nível ou completa missão e sistema envia notificação

**Fluxo Principal:**
1. Sistema detecta conquista desbloqueada pelo participante
2. Sistema monta notificação personalizada com: título, descrição, badge/ícone
3. Sistema envia push notification para o aplicativo
4. Sistema exibe notificação in-app com animação
5. Participante clica na notificação
6. Sistema abre página da conquista com detalhes
7. Sistema oferece compartilhamento em redes sociais
8. Sistema registra que notificação foi visualizada

**Fluxo Alternativo (notificação silenciosa):**
- Participante está em modo "não perturbe"
- Notificação é armazenada na central de notificações
- Participante visualiza quando acessar

**Resposta Esperada:**
Notificação de conquista enviada e visualizada pelo participante

---

## 15. Fluxos de Face Recognition

### UC-098: Cadastro de Template Facial
**Módulo:** Face Recognition
**Agente:** Participante / Organizador
**Gatilho:** Participante realiza cadastro de biometria facial para agilizar check-ins e controle de acesso

**Fluxo Principal:**
1. Participante acessa "Configurações > Biometria Facial"
2. Sistema exibe termo de consentimento LGPD para uso de dados biométricos
3. Participante lê e aceita os termos
4. Sistema solicita posicionamento do rosto no centro do enquadramento
5. Sistema captura múltiplos frames da câmera em diferentes ângulos
6. Sistema executa detecção de liveness (UC-100) para garantir que é uma pessoa real
7. Sistema processa imagem e extrai template facial (vetor biométrico)
8. Sistema armazena template criptografado no storage seguro
9. Sistema associa template ao perfil do participante
10. Sistema exibe confirmação "Biometria cadastrada com sucesso"
11. Sistema disponibiliza opção de remover template a qualquer momento

**Fluxo Alternativo (recusa de biometria):**
- Participante não aceita os termos LGPD
- Sistema não cadastra biometria
- Participante utiliza métodos tradicionais de check-in

**Fluxo Alternativo (qualidade insuficiente):**
- Sistema detecta iluminação inadequada ou rosto obstruído
- Sistema solicita reposicionamento ou melhores condições
- Participante ajusta e tenta novamente

**Resposta Esperada:**
Template facial capturado, processado e armazenado com segurança

---

### UC-099: Verificação Facial no Check-in
**Módulo:** Face Recognition
**Agente:** Participante / Sistema
**Gatilho:** Participante chega ao evento e realiza check-in utilizando reconhecimento facial

**Fluxo Principal:**
1. Participante posiciona-se diante da câmera no totem de check-in
2. Sistema captura imagem ao vivo do participante
3. Sistema executa detecção de liveness (UC-100)
4. Sistema extrai template facial da imagem capturada
5. Sistema compara template com templates cadastrados no banco
6. Sistema identifica participante com score de similaridade
7. Se score >= limiar definido (ex.: 85%): sistema recupera dados do participante e ingressos
8. Sistema exibe confirmação com nome e foto do participante
9. Participante confirma identidade
10. Sistema registra check-in (UC-023)
11. Sistema libera acesso ao evento

**Fluxo Alternativo (score abaixo do limiar):**
- Sistema exibe mensagem "Não foi possível identificar"
- Sistema sugere aproximar ou ajustar iluminação
- Após 3 tentativas: sistema direciona para atendimento manual

**Fluxo Alternativo (participante não cadastrado):**
- Sistema informa que não há template facial cadastrado
- Atendente realiza check-in manual
- Sistema oferece cadastro de biometria para próximos eventos

**Resposta Esperada:**
Participante identificado facialmente e check-in registrado automaticamente

---

### UC-100: Detecção de Liveness
**Módulo:** Face Recognition
**Agente:** Sistema
**Gatilho:** Sistema necessita verificar se a imagem capturada é de uma pessoa real e não uma fraude

**Fluxo Principal:**
1. Sistema inicia captura de vídeo ao vivo
2. Sistema solicita micro-movimentos naturais (piscar, virar levemente a cabeça)
3. Sistema analisa sequência de frames em tempo real
4. Sistema verifica textura da pele para detectar impressão em papel ou tela
5. Sistema analisa profundidade e contornos faciais para detectar máscaras
6. Sistema verifica consistência de iluminação entre frames
7. Sistema calcula score de liveness (0 a 1)
8. Se score >= 0.95: sistema considera liveness confirmado
9. Se score < 0.95: sistema rejeita e solicita nova captura
10. Sistema retorna resultado para o fluxo chamador

**Fluxo Alternativo (ataque de apresentação detectado):**
- Sistema detecta foto, vídeo ou máscara
- Sistema bloqueia tentativa e registra log de segurança
- Sistema notifica administrador sobre tentativa de fraude

**Fluxo Alternativo (fallback para liveness passivo):**
- Sistema utiliza análise de profundidade com câmera 3D (se disponível)
- Sistema dispensa movimentos ativos do usuário

**Resposta Esperada:**
Liveness confirmado (pessoa real) ou rejeitado (tentativa de fraude)

---

### UC-101: Busca Facial de Participante
**Módulo:** Face Recognition
**Agente:** Organizador / Equipe de credenciamento
**Gatilho:** Organizador precisa localizar rapidamente um participante no sistema por meio de foto

**Fluxo Principal:**
1. Organizador acessa "Credenciamento > Busca Facial"
2. Sistema exibe campo de upload de foto
3. Organizador faz upload de foto do participante (ou captura ao vivo)
4. Sistema extrai template facial da imagem fornecida
5. Sistema compara com todos os templates cadastrados no evento
6. Sistema exibe resultados ordenados por score de similaridade
7. Organizador seleciona resultado mais provável
8. Sistema exibe dados completos do participante encontrado
9. Organizador realiza ação desejada (check-in manual, atualização de dados)

**Fluxo Alternativo (nenhum match encontrado):**
- Sistema informa que participante não foi encontrado
- Organizador tenta nova foto ou busca por nome/CPF

**Resposta Esperada:**
Participante identificado por busca facial com dados exibidos

---

### UC-102: Relatório de Reconhecimento Facial por Evento
**Módulo:** Face Recognition
**Agente:** Organizador
**Gatilho:** Organizador deseja analisar métricas de uso do reconhecimento facial no evento

**Fluxo Principal:**
1. Organizador acessa "Relatórios > Reconhecimento Facial"
2. Sistema exibe dashboard com métricas: total de cadastros biométricos, taxa de sucesso na verificação, tempo médio de check-in facial
3. Sistema exibe gráfico de compares bem-sucedidos vs. falhos
4. Organizador filtra por data, lote, tipo de ingresso
5. Sistema exibe incidentes de segurança (tentativas de fraude)
6. Organizador exporta relatório completo em PDF
7. Sistema arquiva relatório para auditoria

**Fluxo Alternativo (dados insuficientes):**
- Sistema exibe relatório parcial
- Sistema sugere aguardar mais dados para métricas significativas

**Resposta Esperada:**
Relatório de reconhecimento facial gerado com métricas do evento

---

## 16. Histórico de Revisões

| Data | Versão | Autor | Descrição |
|------|--------|-------|-----------|
| 2026-07-16 | 1.0 | Equipe EventOS | Criação do documento com 32 casos de uso |
| 2026-07-16 | 1.1 | Equipe EventOS | Adição de 53 casos de uso (UC-050 a UC-102) — Marketplace, Community, Academy, Billing, Networking, Gamification, Face Recognition |