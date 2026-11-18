# CHECKPLACA — Product Requirements Document (PRD)

**Versão:** 1.1 — decisões de produto aprovadas; baseline de implementação para Codex  
**Data:** 18/11/2026  
**Status:** Escopo de V1 aprovado para especificação; integrações de dados e compartilhamento em produção dependem de licenças, credenciais e testes. Itens `VALIDAR` ou `BACKLOG / NÃO IMPLEMENTAR` não estão aprovados para implementação.  
**Produto:** Checkplaca — consulta e interpretação de dados veiculares para o mercado brasileiro.  
**Domínio:** já adquirido pelo fundador; **URL exata e DNS a configurar**, sem presumir TLD.  
**Idioma inicial:** português do Brasil (pt-BR); BRL; datas no fuso `America/Sao_Paulo` na interface, UTC no banco.  
**Responsável pelo produto:** fundador da Checkplaca.  
**Implementador principal:** Codex, via um repositório GitHub **exclusivo** para este produto e entregas via Pull Requests.

> **Instrução ao Codex:** Este documento define a V1 de produto e a engenharia necessária para construí-la. Não executar mudanças de produção, contratar serviços, comprar créditos, chamar APIs pagas ou distribuir dados pessoais sem credenciais, autorizações e validações explícitas do proprietário. Em dúvidas de escopo, implementar adapters, fixtures e feature flags em vez de presumir capacidades do fornecedor. Nunca fazer push direto em `main`; cada unidade de trabalho deve terminar em um PR revisável.

### Registro de decisão — revisão 1.1 (18/11/2026)

- `DEC-001`: **Grátis = validador sintático de placa**, sem consumo de API ou exigência de autenticação.
- `DEC-002`: **Completo = R$ 39,90** como preço de lançamento aprovado.
- `DEC-003`: **Compartilhamento integral** do relatório via link seguro por WhatsApp, **sujeito à autorização escrita para redistribuição; flag off até lá**.
- Estas decisões **substituem** qualquer especificação conflitante da versão 1.0; todas as seções e os critérios de aceite abaixo foram ajustados.

---

## 1. Resumo executivo

Checkplaca será uma plataforma **web-first, responsiva**, de consulta veicular por placa, inspirada na jornada comercial do Olho no Carro, mas com posicionamento de **preço acessível, objetividade e explicações transparentes**. O produto também funcionará como laboratório técnico de conversão, rastreamento e distribuição orgânica por SEO/AEO. Não há intenção inicial de crescimento sustentado por mídia paga nem necessidade de suportar grandes frotas ou consumo em massa.

**Escopo desta V1:** aplicativo transacional de consulta com três planos (**Grátis, Essencial e Completo**); **Grátis = somente validação local do formato de placa, sem consulta à Direct Data, sem login e sem custo de API**; **Essencial = R$ 19,90; Completo = R$ 39,90**; **Direct Data como único fornecedor dos dados pagos**; Asaas para pagamento avulso; autenticação e banco via Supabase; infraestrutura e deploy via Vercel; tela do relatório, PDF, **compartilhamento de relatório completo via link seguro se e somente se a licença autorizar**, dashboard do cliente, painel administrativo, design system versionado e fundações técnicas de SEO. O projeto de LP/site/blog aprofundado será desenvolvido em frente paralela, mas precisa se integrar por rotas, design system, analytics e SEO.

**Hipótese de negócio:** um usuário que pesquisa a procedência de um veículo prefere um relatório claro, confiável e mais barato; a maior parte do tráfego pode ser atraída por páginas de respostas úteis e ferramentas com marca, sem investimento recorrente em anúncios.

**Proposta de valor inicial:** “Confira gratuitamente o formato da placa e, se desejar, consulte a situação de um veículo, entenda os alertas e saiba o que verificar antes de comprar — com preço direto e relatório fácil de ler.” **Não** afirmar que a consulta substitui vistoria física, garante procedência, cobre toda e qualquer base ou garante aceitação por seguradora.

**Métricas prioritárias:** validações sintáticas gratuitas (sem consultar fornecedor), conversão de validação→paga, conversão por plano, relatórios concluídos, taxa de falhas por fonte, custo efetivo de APIs e margem bruta sobre APIs. Métricas de SEO/AEO completas pertencem à frente de aquisição, mas os eventos e a indexabilidade estrutural começam aqui.

---

## 2. Pesquisa de mercado: concorrentes e arquitetura dos planos

Pesquisa baseada em páginas dos próprios produtos, consultadas em **18/11/2026**. Preços são vitrines públicas e podem mudar; escopos variam e **não são equivalências funcionais exatas**.

| Concorrente / referência | Faixas de preço observadas | Organização da oferta | O que a Checkplaca aprende |
|---|---:|---|---|
| **Olho no Carro** | Dados cadastrais **R$ 13,90**; Gravame **R$ 14,90**; Leilão + dados **R$ 34,90**; Essencial **R$ 45,90**; Completo **R$ 64,90** | Produtos isolados e pacotes progressivamente mais completos. Destaca leilão, pendências, km e fotos antigas, peças e dados de mercado | Precificação âncora R$ 64,90; comunicar claramente aquilo que **não** entregamos |
| **Checkauto (DEKRA)** | Standard **R$ 54,90**; Master **R$ 59,90**; Plus **R$ 69,90** | Pacotes que acrescentam verificação de sinistro, gravame e outros itens; test drive gratuito citado em páginas da marca | Gratuito como porta de entrada; gradação por risco relevante |
| **Concar** | Express **R$ 27,90**; Premium aparece como **R$ 49,90** em uma página e **R$ 64,90** em outra seleção; Combo Lojista **R$ 79,90** em uma página | Express para cadastro/débitos; Premium para restrições e pré-compra; extras para profissionais | Evitar vitrines com preços/escopos inconsistentes; diferenciar consultas documentais das análises de histórico |
| **Historicar (referência histórica)** | Básica **R$ 29,90**; Completa **R$ 49,90**; Discovery **R$ 67,90** | Três camadas, com diferenciação por dados adicionais/fotos e ferramentas para negócios | Boa referência de relatórios e painel, mas **não tratar como operação vigente confirmada** |

**Links oficiais usados:**
- Olho no Carro: https://www.olhonocarro.com.br/
- Checkauto: https://nova.checkauto.com.br/
- Concar: https://www.concar.com.br/consulta-placa/essencial e https://www.concar.com.br/consulta-placa/pre-compra
- Historicar: https://www.historicar.com.br/planos

### 2.1 Aprendizados de UX e posicionamento

1. Oferta com **preço por consulta** é mais intuitiva que assinatura para quem compra um usado esporadicamente.
2. Três planos são suficientes: **Grátis valida exclusivamente se a placa segue um formato brasileiro conhecido (sem confirmar veículo, identidade ou existência no cadastro)**; Essencial consulta situação cadastral/restrições; Completo acrescenta leilão, FIPE e histórico de transferências **quando permitidos**.
3. Leilão é um salto relevante de valor percebido e de custo de fornecedor; separar explicitamente esse módulo no plano Completo.
4. Fotografias antigas, quilometragem histórica, sinistros independentes, preços de peças e aceitação em seguro são diferenciais anunciados por concorrentes, mas **não têm cobertura equivalente confirmada na Direct Data**. Não prometê-los.
5. Os planos precisam mostrar uma matriz com **inclui / não inclui / pode estar indisponível**, inclusive esclarecendo que o Grátis é apenas validador de formato; não usar “mais completo do Brasil”.
6. Cada relatório deve dizer **o que foi consultado**, **quando**, **o que foi encontrado**, **o que não foi encontrado** e **qual módulo ficou indisponível**.
7. Evitar alegações como “dados oficiais em tempo real” sem poder demonstrar fonte e momento de atualização de cada campo.

### 2.2 Matriz de cobertura: Direct Data como fonte única

| Assunto | Possibilidade documental na Direct Data | Interpretação adequada no produto |
|---|---|---|
| Cadastro nacional: placa, marca, modelo, ano, cor, combustível, chassi, RENAVAM | **Sim**, API Nacional | Exibir campos permitidos e mascarar identificadores sensíveis |
| Indicadores nacionais: remarcação de chassi, leilão, recall, roubo/furto, RENAJUD, RENAINF, comunicação de venda | **Sim**, flags da Nacional | **Indicadores preliminares**, não a comprovação detalhada da respectiva consulta |
| Débitos e restrições estaduais | **Sim**, API Estadual, variável por UF e disponibilidade | Mostrar quais itens foram retornados; não prometer todos os débitos sempre |
| Gravame | **Sim**, API dedicada | Situação e dados autorizados, sem expor documento de terceiros |
| Roubo/furto | **Sim**, API dedicada | Status e ocorrência, respeitando limites de cobertura |
| RENAJUD | **Sim**, API dedicada | Tipos de restrição e status conforme resposta |
| Recall | **Sim**, API dedicada | Campanhas pendentes e informações recebidas |
| Leilão | **Sim**, API dedicada | Registro, data, leiloeiro e análise de risco **se vier no payload** |
| Histórico de proprietários | **Sim**, API dedicada | **VALIDAR LICENÇA**; preferir contagem/datas e nunca nomes/documentos no relatório de consumo |
| FIPE | **Sim**, API dedicada | Valor de referência, competência e versão/código se disponíveis |
| Multas Serpro Radar | **Sim**, API dedicada | Não confundir com cobertura de todas as multas; validar requisito de RENAVAM e autorização |
| Sinistro independente de leilão | **Não comprovado** em endpoint dedicado | Não vender como histórico de sinistro completo; só mencionar fato ligado a registro de leilão, se houver |
| Fotos antigas de anúncios | **Não identificadas** | Fora do escopo |
| Histórico de quilometragem | **Não identificado** | Fora do escopo |
| Aceitação em seguradoras | **Não identificada** | Fora do escopo |
| Preço de peças / custo de manutenção | **Não identificados** | Fora do escopo |

**Atenção contratual (bloqueador de produção):** os termos de Direct Data preveem repasse condicionado de resultados, mas proíbem a redistribuição de certos dados/fontes e exigem consulta paga vinculada à solicitação, rastreabilidade e base legal. Antes de habilitar qualquer módulo de consulta pago, obter confirmação escrita de **quais campos e consultas podem ser repassados ao consumidor final, em PDF, tela e compartilhamento**, sob a marca Checkplaca. Se não estiver autorizado, desativar o módulo ou mostrar apenas campos permitidos. Fonte: https://app.directd.com.br/termos-de-uso

---

## 3. Brainstorm de diferenciais: hipótese, custo e decisão

Ideias que usam dados já retornados ou processamento sobre esses dados. **Não declarar que concorrentes não oferecem** sem benchmark específico da função. O diferencial é de apresentação e fluxo de decisão, não exclusividade comercial.

| Ideia | Descrição | Custo extra de API | Situação |
|---|---|---:|---|
| **Tradutor de alertas** | Para cada resultado, explicar em português simples “o que significa”, “impacto possível” e “o que fazer agora”; biblioteca editorial determinística | R$ 0 | **V1** |
| **Checklist de compra contextual** | Gerar checklist ajustado aos alertas (ex.: gravame → confirmar baixa; recall → verificar reparo na montadora) | R$ 0 | **V1** |
| **Selo de transparência da consulta** | Mostrar horário da consulta, APIs consultadas, fonte declarada, estado da resposta e campos indisponíveis | R$ 0 | **V1** |
| **Compartilhamento seguro do relatório completo** | PDF do comprador + link temporário, de alta entropia e revogável, capaz de exibir o **relatório completo com campos permitidos**, apenas se licença aprovar esse formato; atalho WhatsApp nativo | R$ 0 de API para compartilhar um relatório já autorizado; sujeito a direitos de redistribuição | **V1 condicional à licença** |
| **Comparar até 3 veículos** | Tabela entre relatórios que o usuário **já comprou**; sem consulta adicional | R$ 0 sobre dados já comprados; sujeito à licença | **BACKLOG / NÃO IMPLEMENTAR** |
| **Detector de divergências do anúncio** | Cliente informa ano/cor/versão anunciados e recebe comparação com base oficial | R$ 0 sobre consulta já realizada | **BACKLOG / NÃO IMPLEMENTAR** |
| **Resumo financeiro de débitos** | Somar somente valores efetivamente retornados, evitando duplicidade e sem estimar o que falta | R$ 0 | **BACKLOG / NÃO IMPLEMENTAR** |
| **Modo lojista** | Tags, notas, carteira de veículos, equipe/subcontas e exportação | R$ 0 por organização; novas consultas têm custo | **BACKLOG / NÃO IMPLEMENTAR** |
| **Histórico de mudança de status** | Reconsultar posteriormente para detectar novos gravames/restrições | **Sim**, novas chamadas | **BACKLOG / NÃO IMPLEMENTAR** |
| **Score de risco explicável** | Regra determinística sobre verificações com rastreabilidade, sem parecer jurídico/segurador | R$ 0, mas risco reputacional/validação maior | **BACKLOG / NÃO IMPLEMENTAR** |
| **Assistente textual de decisão** | Perguntas e respostas ancoradas nos fatos do relatório, nunca inferindo dados faltantes | Pode haver custo de LLM | **BACKLOG / NÃO IMPLEMENTAR** |
| **Calculadora de negociação vs. FIPE** | Usuário informa preço pedido; diferença percentual/absoluta com FIPE consultada, com ressalvas | R$ 0 após FIPE | **BACKLOG / NÃO IMPLEMENTAR** |
| **Link de validação do relatório** | Validar autenticação, integridade, validade e autenticidade sem publicar dados pessoais | R$ 0 | **V1** (validação mínima) |

**Critério para promover backlog à V1:** autorização explícita do fundador + atualização da matriz de planos + critério de aceite + teste automatizado. Codex não deve inferir aprovação por esta tabela.

---

## 4. Público, jobs-to-be-done e papéis

### Públicos

- **Comprador pessoa física, mobile:** quer checar procedência de um carro usado em poucos minutos; pode não entender RENAJUD ou gravame.
- **Vendedor pessoa física, mobile:** quer responder dúvidas do interessado com um relatório.
- **Lojista/autônomo, desktop:** consulta placas recorrentemente e precisa histórico organizado. Não exigir funcionalidades de gestão de frotas na V1.
- **Administrador:** fundador acompanha pagamentos, conversões, saldo operacional estimado, gastos, relatórios, falhas, suporte e limites de uso.

### Papéis e permissões

- `visitor`: páginas públicas, digitação/validação de placa, visão dos planos e pagamento sem exibição de dados restritos.
- `customer`: conta Supabase Auth, painel pessoal, relatórios e downloads próprios, exclusão/privacidade, solicitações de suporte.
- `admin`: acesso a dashboard operacional, configurações, pedidos e auditoria. Privilégio **apenas em claim administrada no servidor / tabela de papéis protegida**, jamais `user_metadata` editável pelo cliente.
- `system`: jobs, webhooks, integrações, trilha de auditoria; não é usuário interativo.

---

## 5. Três planos e precificação inicial (parametrizável)

**Decisões aprovadas em 18/11/2026:** (1) Grátis **exclusivamente valida formato de placa**, não acessa Direct Data nem exige login; (2) preço de lançamento do **Completo = R$ 39,90**; (3) WhatsApp compartilha **acesso ao relatório completo por link seguro**, condicionado à autorização escrita da Direct Data. **Essencial = R$ 19,90** permanece como preço inicial da V1. Não substituir as escolhas por alternativas apresentadas em brainstorms anteriores.

**Modelo:** compra avulsa; “plano” significa **tipo de consulta**, não assinatura. Preços e módulos de ofertas futuras são parametrizáveis no admin, com versionamento e efeito somente para novas compras. O plano Grátis não cria pedido, consulta de fornecedor nem relatório.

| Plano | Preço inicial aprovado | Módulos Direct Data | Custo estimado de API | Resultado bruto após API | Margem bruta somente API |
|---|---:|---|---:|---:|---:|
| **Grátis — Validar formato de placa** | **R$ 0,00** | **Nenhum** | **R$ 0,00** | R$ 0,00 | Não aplicável (preço zero) |
| **Essencial — Situação do veículo** | **R$ 19,90** | Nacional, Estadual, Gravame, Roubo/Furto, RENAJUD, Recall e Multas Radar | **R$ 9,71** | **R$ 10,19** | **51,2%** |
| **Completo — Histórico pré-compra** | **R$ 39,90** | Tudo do Essencial + Leilão + Histórico de Proprietários + FIPE | **R$ 29,70** | **R$ 10,20** | **25,6%** |

**Custos por módulo (BRL, tabela de referência em 18/11/2026):** Nacional 1,10; Estadual 1,90; Gravame 1,80; Roubo/Furto 1,45; RENAJUD 1,90; Recall 1,20; Multas Radar 0,36; Leilão 12,00; Histórico Proprietários 4,10; FIPE 3,89. **Revalidar preço e permissões na conta Direct Data antes da produção.** Os totais pressupõem uma chamada faturada por módulo; não contemplam novas tentativas e indisponibilidades. Se um módulo não for licenciado, remover da oferta e recalcular o preço/custo antes de vender.

**Preço do Completo R$ 39,90 é decisão de lançamento confirmada**, não decisão em aberto. Reprecificação futura exige nova versão de catálogo e decisão administrativa deliberada, sem mudar compras já efetuadas.

### 5.1 Regras do Grátis — **somente sintaxe, custo zero de Direct Data**

- Qualquer visitante pode informar uma placa **sem criar conta, informar e-mail, pagar ou realizar OTP**.
- Normalizar entrada (maiúsculas, retirar espaços/hífens para análise) e validar **apenas** os formatos brasileiros suportados: antigo `AAA1234` e Mercosul `AAA1A23`. Mensagens devem explicar o erro de caracteres ou quantidade, com acessibilidade e estado de sucesso.
- **Não chamar Direct Data nem outra API veicular em hipótese alguma neste fluxo.** Validar preferencialmente no client; revalidar formato no servidor caso a placa seja enviada ao quote/checkout de planos pagos. Não criar `orders`, `reports`, `report_jobs` ou `free_lookups` na validação grátis.
- Exibir conclusão honesta: **“Formato de placa válido. Isso não confirma que o veículo existe, está regular ou pertence a determinado modelo.”** Quando inválido, explicar o padrão esperado e permitir correção.
- Oferecer CTA para **Essencial (R$ 19,90)** e **Completo (R$ 39,90)**, com descrição do que cada um efetivamente consulta, sem sugerir que houve verificação documental gratuita.
- Telemetria de uso pode registrar **somente evento agregado/sanitizado** como padrão/formato válido ou inválido; **nunca** registrar valor de placa em analytics, cookies de publicidade ou logs de eventos. Não armazenar placa gratuitamente por padrão.
- Rate limiting leve no endpoint de quote, caso exista; anti-bot adicional apenas se houver abuso real. **Remover limites de créditos, orçamento, franquia, teto diário/mensal e dependência de licença Direct Data no Grátis.**
- Sem relatório, PDF, histórico no dashboard, selo de procedência ou link compartilhável no Grátis.

### 5.2 Itens por plano exibidos na matriz comercial

| Item | Grátis | Essencial | Completo |
|---|:---:|:---:|:---:|
| Validar **formato sintático** da placa | ✓ | ✓ | ✓ |
| Confirmar existência do veículo / consultar dados reais | — | ✓ (conforme retorno) | ✓ (conforme retorno) |
| Marca / modelo / ano / cor (quando retornados) | — | ✓ | ✓ |
| Cadastro nacional | — | ✓ | ✓ |
| Situação / débitos estaduais conforme UF | — | ✓ | ✓ |
| Gravame | — | ✓ | ✓ |
| Roubo e furto | — | ✓ | ✓ |
| RENAJUD | — | ✓ | ✓ |
| Recall | — | ✓ | ✓ |
| Multas Radar (cobertura específica) | — | ✓ | ✓ |
| Histórico de leilão | — | — | ✓ |
| Histórico de proprietários **sem dados pessoais de terceiros** | — | — | ✓* |
| FIPE | — | — | ✓ |
| Tradutor de alertas | — | ✓ | ✓ |
| Checklist contextual de compra | — | ✓ | ✓ |
| PDF e **compartilhamento completo protegido se licenciado** | — | ✓* | ✓* |

* **Condicional** à licença e à disponibilidade do retorno. Se a Direct Data proibir redistribuir até mesmo contagem/datas, retirar o módulo antes da venda. O compartilhamento de relatório completo, inclusive por link, **fica bloqueado por feature flag de licença até autorização escrita específica**. Download pelo comprador autenticado pode ter política diferente, também sujeita à licença correspondente.

### 5.3 Regras para planos e entitlement

- `plans` e `plan_versions` contêm nomes, preços, status de publicação, lista de módulos, ordem, destaques, custo estimado e regras de entitlement. **Preço e escopo da venda são congelados em `order_items` (snapshot).**
- Grátis é **ferramenta sintática pública**, não uma consulta veicular: não consome créditos, não tem entitlement de relatório e não gera registro em `orders` ou `reports`.
- Dados sensíveis são filtrados por **allowlist por plano e superfície** no backend, e não somente ocultos via CSS.
- Recursos inativos/sem licença não podem ser vendidos, mesmo que um toggle visual esteja ativo.
- O usuário pode comprar novo plano para a mesma placa; **não** reutilizar dados cobrados para clientes diferentes. Reutilização por upgrade para o mesmo cliente, dentro do mesmo pedido, só se a licença permitir e a identidade/consentimento coincidirem; default da V1 é **nova consulta e cobrança apropriada**.
- Sem assinatura, cashback, créditos avulsos ou pacotes de múltiplas consultas na V1.

---

## 6. Escopo funcional da V1, com critérios de aceite

### RF-01 — Entrada de placa e proposta de plano

- Página pública com campo de placa, validação de padrões brasileiro antigo (`AAA1234`) e Mercosul (`AAA1A23`), formatação acessível e busca por teclado.
- Não aceitar chassi como entrada da V1 (existe na Direct Data, mas é fluxo posterior).
- Exibir os três planos e seus escopos com matriz comparativa, preço final, diferenças e disclaimers.
- Guardar a placa normalizada somente após submissão/consentimento adequado; evitar logs de placa em analytics.
- **Aceite:** usuário escolhe plano em até poucos passos; erros de digitação têm correção no contexto; nunca há chamada paga ao fornecedor antes de uma autorização prevista no fluxo.

### RF-02 — Usuários, identificação e acesso

- Supabase Auth como provedor único; login por e-mail com **OTP/magic link**, logout, recuperação, atualização de perfil (nome opcional), termos e privacidade.
- **Compra sem cadastro prévio:** usuário informa placa/plano/e-mail, segue ao checkout; **depois de pagar**, precisa comprovar posse do e-mail por OTP para ver relatório privado e receber acesso ao painel. Vincular pedidos pendentes ao usuário pelo e-mail normalizado **apenas após confirmação de identidade**, por transação e com critérios de segurança (não confiar em email informado pelo browser).
- Para Grátis, **não exigir login/OTP**: é apenas validação de formato, sem acesso a fontes e sem armazenamento de dados veiculares.
- Desenhar os fluxos de erro: link expirado, e-mail diferente no pagamento, pagamento confirmado sem sessão, cliente já existente e merge de compra.
- **Aceite:** um usuário não consegue acessar relatório de outro alterando URL/UUID; dados do pedido estão disponíveis após OTP; logout encerra acesso.

### RF-03 — Checkout Asaas (pagamento avulso)

- Usar **Asaas Checkout hospedado** para V1 (Pix e cartão), isolando dados de cartão fora da Checkplaca; adequar à API atual do Asaas.
- `orders` nasce como `draft/pending`, com preço imutável, idempotency key e identificador do checkout remoto.
- Redirecionamento do Asaas **não é prova de pagamento**. Liberar a consulta somente após **webhook válido** ou conciliação server-to-server que confirme pagamento.
- Webhook com autenticação (`authToken` dedicado, diferente da API key), deduplicação pelo ID do evento, transição monotônica de estados e log mínimo sem dados de cartão.
- Tratar `CHECKOUT_PAID`, cancelamento, expiração e eventos de estorno aplicáveis. Cancelamento antes do pagamento nunca dispara Direct Data.
- Webhooks podem chegar duplicados e fora de ordem: reconciliação segura e idempotente.
- **Aceite:** somente **uma** orquestração de consulta por pedido elegível, mesmo que webhook de pagamento chegue várias vezes ou usuário dê refresh.

### RF-04 — Integração Direct Data (único fornecedor)

- Criar adapter `DirectDataProvider`, interface `VehicleDataProvider` e um mapper por módulo. Sem chamadas via navegador.
- Módulos em `integration_modules`: `nacional`, `estadual`, `gravame`, `roubo_furto`, `renajud`, `recall`, `multas_radar`, `leilao`, `historico_proprietarios`, `fipe`.
- Preços e endpoints configuráveis; usar endpoints **documentados** e verificar o modo seguro de autenticação. Documentação exemplifica `TOKEN` na query; **não imprimir token, não salvar URLs com token em logs e preferir header oficial se comprovadamente suportado**.
- Respeitar rate limit, timeout, horário e indisponibilidade da fonte (ex.: a Nacional avisa instabilidades durante manutenção entre 23h e 3h), normalizar erros e atrasos.
- Verificar capacidade de resposta assíncrona/callback; não presumir que um HTTP 200 significa relatório concluído. Persistir `pending/completed/no_data/failed` conforme semântica efetiva da API.
- Em um pedido, permitir execução sequencial ou limitada concorrência; capturar `provider_request_id`, módulo, horário, estimativa/custo realizado e resultado mapeado. **Nunca** executar módulo que não esteja incluído no snapshot de plano e habilitado por licença.
- Não duplicar consultas quando o usuário atualizar a página. Repetição administrativa deve explicitar potencial novo custo; receber confirmação e gerar novo `attempt` auditável.
- **Aceite:** ambiente de desenvolvimento funciona com fixtures sem consumir créditos; integração real fica atrás de feature flag e só é validada com credencial fornecida pelo proprietário.

### RF-05 — Normalização dos dados e representação de incerteza

- Mapear respostas a um domínio interno `VehicleReport` versionado; persistir payload bruto **apenas se contrato e necessidade legal permitirem**, criptografado/restrito, com retenção curta e sem logs. Preferir salvar campos mínimos normalizados.
- Estado individual para cada verificação:
  - `clear`: fonte consultada com resposta conclusiva sem ocorrência;
  - `alert`: ocorrência/pendência encontrada;
  - `inconclusive`: há sinal sem detalhe ou ambiguidade;
  - `unavailable`: fonte não respondeu/retorno tecnicamente inválido;
  - `not_included`: não contratado;
  - `not_applicable`: dado não se aplica;
  - `not_found`: fonte consultada não localizou registro suficiente (não significa “sem ocorrências”).
- Registrar `queried_at`, `source_updated_at` se disponibilizado, `source_name` declarado, `source_module`, `coverage_note` e `normalizer_version`.
- **Regra crítica:** `unavailable`, `not_found`, `not_included` e `inconclusive` **nunca** podem virar “Nada consta” ou bandeira verde.
- A Nacional traz flags preliminares de leilão, RENAJUD etc.; elas **não substituem** a consulta paga dedicada do plano. Conflitos entre módulos são exibidos como divergência de bases, sem arbitrariamente escolher uma como verdade.
- Excluir/mascarar dados pessoais de proprietário, CPF/CNPJ, endereço, número de contrato, chassi e RENAVAM conforme finalidade, licença e plano. PDF e links de compartilhamento usam representação ainda mais restrita.
- **Aceite:** todas as verificações geram status distintos; testes por fixture incluem dado ausente, flag false, divergência e timeout.

### RF-06 — Relatório em tela

- Cabeçalho com marca/modelo/ano/placa (mascarar conforme contexto), plano, ID de consulta e momento de emissão.
- Resumo visual **descritivo**, sem “aprovação” de compra: total de alertas, verificações sem ocorrência, indeterminadas e indisponíveis; legenda do que esses termos significam.
- Seções obrigatórias: Identificação; Restrições Cadastrais; Financeiro/Gravame; Roubo e Furto; Judiciais/RENAJUD; Débitos/Multas; Recall; Leilão (Completo); FIPE (Completo); Histórico de proprietários em dados agregados autorizados (Completo); Fontes/Metodologia; Checklist contextual.
- Cada bloco: estado, informação encontrada, data, fonte declarada, explicação curta, próximo passo orientativo. Nunca inventar valor, score ou data.
- Relatório individual `noindex,nofollow`, sem URL pública indexável, cache `private, no-store` em respostas sensíveis.
- **Aceite:** relatórios com 1, 5 ou 20 alertas continuam legíveis no mobile; status de todas as fontes visíveis; a pessoa entende o que foi ou não verificado.

### RF-07 — PDF e compartilhamento WhatsApp

- PDF server-side em pt-BR, A4, paginado, marca Checkplaca, datas, versão do relatório, fonte de cada item, disclaimers e rodapé de autenticação.
- Usuário autenticado pode baixar PDF próprio de bucket **privado** no Supabase Storage, via autorização e URL assinada de curta duração.
- Compartilhamento WhatsApp V1 usa **Web Share API quando disponível** e fallback `wa.me/?text=` com **texto e link seguro**, não integração com WhatsApp Business API. Não declarar “envio automático”.
- **Decisão de V1: compartilhar o relatório completo**, não apenas um resumo. O titular autenticado gera um link `share/<token>` que dá ao destinatário acesso de leitura à **versão integral do relatório licenciado e filtrado** (todas as seções autorizadas do plano; nunca payload bruto, CPF, nomes/documentos de proprietários, dados proibidos ou identificadores sensíveis sem base legal/licença). A visualização não exige criar conta do destinatário; a autorização deriva do token de capacidade, com controles abaixo.
- **Bloqueador obrigatório de licença:** feature flag `full_report_sharing_license_approved` inicia `false`, exige evidência administrativa de autorização **específica para redistribuição integral a destinatários terceiros via tela e PDF**. Antes disso, o app mostra “Compartilhamento indisponível temporariamente” e **não cria links**; nunca troca silenciosamente pelo resumo nem abre o documento. A interface, os contratos e testes devem existir com fixtures mesmo com a feature desativada.
- Token de capacidade com pelo menos **256 bits de entropia** gerados em backend, armazenar **somente hash**, expiração padrão **24 horas**, revogação pelo comprador e admin, máximo de visualizações configurável, rate limit e auditoria minimizada. Não expor token em logs, analytics, mensagens de erro, serviços de terceiros nem eventos de telemetria; adotar `Referrer-Policy: no-referrer`, `noindex,nofollow,noarchive`, `Cache-Control: private, no-store`, página sem scripts de tracking nem embeds de terceiros.
- **Acesso completo via link:** o token deve ser conferido no servidor em cada leitura e em cada download. A versão apresentada é o **relatório completo autorizado** do snapshot adquirido; alterações de licença, revogação e expiração passam a valer imediatamente. Download de PDF pelo destinatário só se habilitado expressamente na licença; caso contrário, permitir apenas visualização integral licenciada e sinalizar que o download é exclusivo do comprador.
- Para evitar consumo automático por prévias do WhatsApp e scanners, a rota de prévia do link **não deve renderizar dados protegidos**; oferecer tela neutra com ação explícita “Abrir relatório”, e só então autenticar o token e mostrar o conteúdo. Pré-visualizações não contam como acesso humano e não gastam a franquia de visualizações.
- Uma pessoa com o link poderá ver o relatório até expiração/revogação: informar claramente esse risco antes da geração e oferecer “Revogar compartilhamento” no painel. Não oferecer um link eterno ou público por placa.
- `validation/<id>` apenas comprova existência/integridade/emitido-em/estado, sem dados pessoais nem relatório completo.
- **Aceite:** comprador baixa PDF em mobile/desktop; com a licença aprovada e flag ativada, destinatário abre o **relatório completo** por token sem login; links revogados/expirados, brute force e prévias automatizadas não revelam conteúdo; antes da aprovação contratual nenhum compartilhamento completo funciona.

### RF-08 — Dashboard do usuário

- Página inicial com consultas realizadas, status (`aguardando pagamento`, `processando`, `concluída`, `parcial`, `falhou`, `expirada`), tipo de plano, data e ações (`visualizar`, `baixar`, `compartilhar`, `solicitar ajuda`).
- Busca/filtro por placa mascarada, data, plano e status. Detalhes privados da placa apenas ao próprio titular autenticado.
- Perfil, e-mail, privacidade e solicitações de exclusão; não implementar assinatura na V1.
- Página de suporte/FAQ contextual e canal de contato configurável.
- **Aceite:** usuário vê somente seus pedidos e relatórios; consegue abrir relatório concluído em 2 cliques; estados de processamento têm feedback.

### RF-09 — Painel de administração

- Admin separado em `/admin`, server-side auth + RLS + checagem de papel; operações mutáveis auditadas.
- **Visão geral:** pedidos e faturamento bruto (Asaas), compras por plano, relatórios prontos/falhos, taxa de conversão, gasto estimado/registrado Direct Data, resultado bruto sobre APIs e conversão do validador sintático gratuito para planos pagos.
- **Pedidos:** buscar por ID/e-mail/placa mascarada, status e histórico de pagamentos; não expor cartão.
- **Consultas:** módulos executados, estados, duração, erros redigidos, custo por módulo, consulta que consumiu crédito, retry controlado, suporte.
- **Produtos/planos:** editar preço, módulo, destaque e descrição gerando **nova versão**, publicar/despublicar, pré-visualizar oferta; bloqueio de módulo sem `license_approved=true`.
- **Configurações:** limite de gastos **das consultas pagas**, modos de manutenção, e-mails de contato, glossário, canal de suporte, toggles de funcionalidades, evidências de licenças e políticas de armazenamento. Não há quota financeira para validação gratuita, pois não há chamada à Direct Data.
- **Auditoria:** usuário/admin, ação, alvo, data, mudanças não sensíveis, motivos de override/refund/retry.
- **Aceite:** admin consegue explicar o custo de APIs de cada compra paga, suspender novos pedidos de consulta e gerenciar autorização de compartilhamento integral com auditoria. Usuário normal não consegue acessar admin nem endpoints protegidos.

### RF-10 — Design system e componentes do produto

- Criar tokens e componentes reutilizáveis para aplicação agora e futura frente do site/blog.
- Fluxos com estados completos: `loading/empty/error/partial/success`, mobile, teclado e leitores de tela.
- Manter documentação e exemplos versionados em `/docs/design-system.md`, `/docs/ux-patterns.md` e componentes no código.
- **Aceite:** não há cores, border radius, tipografia e espaçamentos arbitrários nos componentes; botões, cards e status reutilizam tokens e variantes.

### RF-11 — SEO/AEO estrutural e integração futura com conteúdo

- App Router renderiza página pública com SSR/metadata, `robots.txt`, `sitemap.xml`, canonical, Open Graph, semântica e performance. Não gerar páginas indexáveis por placa de usuários.
- Páginas **públicas mínimas na V1**: `/` (entrada simples e comparação de planos), `/planos`, `/como-funciona`, `/perguntas-frequentes`, `/metodologia`, `/privacidade`, `/termos` e páginas legais/configuráveis.
- Reservar rotas futuras para `/blog`, `/guias`, `/glossario`, `/consultar-placa` e variantes de conteúdo; o desenvolvimento editorial/LP avançado será **outro projeto**, mas deverá consumir o mesmo design system/rotas/analytics. Evitar criar conteúdo genérico em massa nesta fase.
- Dados estruturados somente quando compatíveis com o conteúdo visível e diretrizes dos buscadores; não usar FAQ schema como promessa de rich result. Experiência boa para leitores e agentes: headings claros, respostas diretas, perguntas frequentes, nomenclatura consistente e páginas renderizáveis sem JS excessivo.
- **Aceite:** páginas públicas indexáveis, páginas de usuário/admin/checkout/relatórios bloqueadas para indexação, sem duplicidade de canonicals e sem vazamento de placa nos caminhos públicos.

---

## 7. Jornadas e estados de negócio

### 7.1 Comprador pago — fluxo principal

1. Visitante entra na página, informa placa e escolhe `Essencial` ou `Completo`.
2. Front valida **formato** e mostra pedido (placa, nome do plano, preço, lista do que será consultado). Não mostrar dados da placa que ainda não foram verificados.
3. Usuário informa e-mail, aceita termos/privacidade e inicia checkout Asaas.
4. Sistema cria pedido interno com snapshot do plano e checkout remoto idempotente.
5. Asaas confirma pagamento por webhook autenticado. **Somente agora** o backend enfileira/abre uma execução única dos módulos licenciados.
6. Usuário recebe tela “Estamos consultando as fontes” com estados e tempo não prometido. Acesso aos resultados exige OTP no e-mail do comprador.
7. Worker chama Direct Data, guarda status de cada módulo, normaliza e fecha relatório quando todos terminarem ou atingirem a política de timeout.
8. Usuário recebe e-mail com link seguro ao painel; relatório detalhado e PDF disponíveis após autenticação.
9. Usuário pode gerar link revogável e temporário para **relatório completo autorizado** e compartilhar via WhatsApp, **somente após a licença de redistribuição integral estar aprovada e a feature flag habilitada**; antes disso, o botão fica indisponível com motivo claro.

### 7.2 Grátis — validação de formato de placa (sem API)

1. Visitante digita placa e clica “Validar formato grátis”.
2. UI normaliza caracteres e verifica se atende `AAA1234` ou `AAA1A23`. Não faz login, OTP, checkout, query, cobrança ou gravação de dados veiculares.
3. Mostrar “Formato válido” ou instrução específica de correção. Aviso explícito: **“Isso não confirma existência ou situação do veículo.”**
4. Exibir CTA dos planos Essencial e Completo com preço e diferenças. Se avançar a uma compra, a validação de formato ocorre novamente no servidor.
5. Telemetria apenas agregada e sanitizada, sem placa; a interação pode se repetir sem quota de créditos.

### 7.3 Falhas, fontes indisponíveis e pós-venda

- **Pagamento não confirmado:** nenhum módulo pago é executado.
- **Placa não localizada em Nacional:** não executar pacote inteiro automaticamente; disponibilizar suporte/revisão de placa e política de estorno conforme termos aprovados.
- **Um módulo falha:** terminar demais; relatório fica `partial` com ressalva explícita, ticket/admin alerta e política de reexecução/reembolso; não inventar `clear`.
- **Webhook repetido:** ignorar evento já processado; não duplicar API.
- **Usuário fecha aba:** backend continua o pedido de forma controlada, e usuário pode voltar pelo painel/e-mail.
- **Timeout do provider:** status específico, possibilidade de retentativa consciente do custo.
- **Chargeback/refund:** preservar histórico auditável, revogar acessos futuros conforme política, não apagar rastros legais necessários.

**Estados sugeridos:**
- `order_status`: `draft`, `checkout_pending`, `paid`, `canceled`, `expired`, `refunded`, `chargeback`.
- `report_status`: `queued`, `running`, `completed`, `partial`, `failed`, `unavailable`, `revoked`.
- `module_status`: `pending`, `running`, `clear`, `alert`, `inconclusive`, `not_found`, `unavailable`, `not_applicable`, `not_included`.

**Invariante:** `paid` em pedido não é `completed` em relatório. Nunca usar um só campo para ambos.

---

## 8. Arquitetura técnica proposta

**Stack recomendada:** Next.js (App Router, TypeScript), React, Tailwind CSS + tokens CSS, componentes headless acessíveis, Supabase (Postgres, Auth, Storage), Asaas Checkout, Direct Data API v3, Vercel (frontend + endpoints server-side), testes com Vitest/Playwright e GitHub Actions. Codex deve verificar a versão atual e piná-la junto ao lockfile. Sem dependência obrigatória de SaaS de filas para V1.

### 8.1 Desenho lógico

```text
[Visitante mobile/desktop]
          |
          v
[Next.js UI + páginas públicas indexáveis]
          |
   [Route Handlers / serviços backend]
       |          |              |
   [Supabase]   [Asaas]     [Direct Data]
   Auth/DB/     Checkout     10 módulos (pagos)
   Storage      Webhooks      (server-only)
       ^          |              |
       |          v              v
  [Jobs persistidos: DB + worker de processamento + reconciliador]
       |
       v
[Report builder normalizado] -> [Relatório privado] -> [PDF privado / link integral sob licença]
[Validador grátis de formato] -> [CTA para plano pago] (sem API/conta)
       |
[Admin: métricas, custo, planos, suporte, auditoria]
```

### 8.2 Persistência e execução confiável

- **Não depender da resposta HTTP do checkout ou do tempo da Vercel Function para completar múltiplas APIs.** Persistir `report_jobs` e executar orquestração idempotente por worker aprovado na arquitetura.
- V1 simples: um worker executado por endpoint protegido (Cron Vercel ou mecanismo equivalente suportado), faz **claim atômico com lease**, até `N` jobs, executa módulos em pequenos lotes e salva progresso; próxima execução retoma. Verificar limites atuais do plano Vercel e frequência permitida; se insuficientes, migrar worker para Supabase Edge Function/Queue, mantendo contrato de domínio estável.
- Garantir `unique (order_id, report_version)` e `unique (report_id, module_code, attempt_number)`; evitar corrida entre cron, webhook e clique do usuário.
- Entrega “exactly-once” perfeita não é presumida em integrações pagas; mitigar com idempotência local, dedupe, reconciliação e confirmação de estado remoto antes de qualquer retry potencialmente cobrado.
- Workers/cron autenticados por chave de serviço protegida; registrar eventos do Asaas de forma independente das respostas do frontend.
- Se o fornecedor oferecer processamento assíncrono/callback, criar tabelas/rotas de callback e validar assinatura/regras do fornecedor antes de aceitar status.

### 8.3 Estrutura sugerida do repositório

```text
checkplaca/
  AGENTS.md                     # instruções permanentes para Codex
  README.md
  .env.example                  # NOMES de variáveis; nunca segredos
  .github/
    workflows/ci.yml
    CODEOWNERS
    pull_request_template.md
  docs/
    prd/PRD_Checkplaca_v1.md    # este arquivo, versionado
    architecture.md
    design-system.md
    ux-patterns.md
    data-contracts.md
    api-directdata.md
    api-asaas.md
    deployment.md
    privacy-compliance.md
    analytics-events.md
    decisions/                    # ADRs
  src/
    app/
      (public)/                  # home, planos, como-funciona, FAQs e legais
      (auth)/                    # OTP e autenticação
      (app)/dashboard/           # usuário
      (app)/relatorios/[id]/     # relatório privado
      (admin)/admin/             # administração
      api/
        checkout/
        webhooks/asaas/
        jobs/processor/
        reports/
        shares/
    components/
      ui/                        # design system reutilizável
      vehicle/
      reports/
      checkout/
      admin/
    lib/
      env/
      auth/
      supabase/
      payments/asaas/
      providers/directdata/
      domain/reports/
      domain/pricing/
      domain/entitlements/
      security/
      analytics/
    styles/tokens.css
    tests/
  supabase/
    migrations/
    seed.sql
    tests/
  public/
```

### 8.4 APIs internas principais (contratos, não implementação exata)

- `POST /api/quote`: valida `plate` e `plan_code`, retorna preço/snapshot, sem chamar fornecedor.
- `POST /api/checkouts`: cria pedido e checkout Asaas com key idempotente.
- `POST /api/webhooks/asaas`: autentica evento, dedupe, atualiza pedido, enfileira job.
- **Grátis:** validador de sintaxe no client (regex compartilhada e testada); **não criar endpoint de consulta gratuita à Direct Data**. `POST /api/quote` revalida no servidor quando usuário seleciona plano pago.
- `GET /api/reports/:id`: exige ownership autenticado; responde schema sanitizado do relatório.
- `POST /api/reports/:id/pdf`: exige ownership; gera/obtém PDF privado e retorna URL efêmera.
- `POST /api/reports/:id/shares`: requer ownership e flag de licença `full_report_sharing_license_approved=true`; emite token temporário para **relatório completo autorizado**.
- `DELETE /api/shares/:id`: revoga share.
- `GET /share/:token`: página neutra de confirmação, sem dados do relatório; `POST /api/shares/:token/access`: verifica token, prazo, revogação, limite e licença antes de devolver **relatório completo filtrado para compartilhamento**; rota protegida de PDF compartilhado somente se autorizada.
- `POST /api/jobs/processor`: interno, autenticado, processa job/lease; **não** aceita `plate` arbitrária de cliente.
- `GET /api/admin/metrics`: somente admin.
- `POST /api/admin/plans/:id/publish`: somente admin, versiona preço e módulos.

**Validação:** input via schemas (ex.: Zod), objetos de saída estritos, saneamento de strings e parâmetros, rate limit server-side, semântica HTTP coerente. Não usar rotas públicas como proxy aberto para Direct Data.

---

## 9. Modelo de dados no Supabase (inicial)

Usar migrations SQL versionadas. Tabelas expostas ao Data API precisam de RLS e grants restritos; tabelas exclusivamente de serviço devem ficar em schema privado quando possível.

| Tabela | Campos-chave | Função / controle |
|---|---|---|
| `profiles` | `user_id PK`, `display_name`, `email_verified_at`, `created_at` | Perfil 1:1 com `auth.users`; cliente lê/atualiza só o próprio |
| `user_roles` | `user_id`, `role` | Admin atribuído exclusivamente por operação server-side, jamais pelo navegador |
| `plans` | `id`, `code`, `name`, `published_version_id`, `active`, `sort_order` | Catálogo base |
| `plan_versions` | `id`, `plan_id`, `price_cents`, `scope_json`, `created_at`, `is_published` | Imutabilidade comercial por versão |
| `integration_modules` | `code`, `provider_endpoint`, `cost_cents`, `license_approved`, `enabled`, `requires_json`, `version` | Config e proibição de módulos sem licença |
| `orders` | `id`, `user_id?`, `buyer_email_hash/encrypted`, `status`, `amount_cents`, `asaas_checkout_id`, `idempotency_key`, `created_at` | Compra avulsa e titularidade após OTP |
| `order_items` | `order_id`, `plan_version_id`, `price_snapshot_cents`, `modules_snapshot` | Congelamento de plano comprado |
| `payment_events` | `provider_event_id UNIQUE`, `order_id`, `type`, `received_at`, `processed_at`, `status` | Idempotência e auditoria do Asaas |
| `vehicles` | `id`, `plate_encrypted`, `plate_fingerprint`, `masked_plate`, `created_at` | Identificador privado; fingerprint não reversível, sem disponibilizar base global aos usuários |
| `reports` | `id`, `order_id`, `vehicle_id`, `owner_user_id?`, `status`, `report_schema_version`, `created_at`, `completed_at` | Resultado de compra, propriedade e status |
| `report_modules` | `id`, `report_id`, `module_code`, `module_status`, `source_at`, `queried_at`, `normalized_json`, `attempt_number`, `cost_cents` | Resultado por fonte e custo auditável |
| `report_jobs` | `id`, `report_id`, `state`, `lease_until`, `worker_id`, `attempts`, `next_attempt_at`, `last_error_code` | Execução confiável e retries controlados |
| `report_artifacts` | `id`, `report_id`, `storage_path`, `generated_at`, `pdf_template_version` | PDFs privados no Storage |
| `report_shares` | `id`, `report_id`, `token_hash`, `created_by_user_id`, `expires_at`, `revoked_at`, `view_limit`, `view_count`, `license_policy_version` | Capacidade de compartilhamento **integral autorizado** e revogável |
| `share_access_audit` | `id`, `share_id`, `accessed_at`, `result`, `request_class`, `metadata_minimized` | Tentativas/acessos e controles sem armazenar token/IP em claro por padrão |
| `feature_flags` | `key`, `enabled`, `scope`, `updated_by` | Kill switches operacionais |
| `app_settings` | `key`, `value_json`, `updated_at` | Limites de execução de APIs pagas e configurações não secretas |
| `audit_logs` | `actor_id?`, `action`, `object_type`, `object_id`, `metadata_redacted`, `at` | Auditoria administrativa e contratual |
| `support_requests` | `id`, `report_id?`, `user_id?`, `category`, `status`, `created_at` | Suporte / falhas / exclusão |
| `analytics_events` | `id`, `anonymous_session_id?`, `user_id?`, `event`, `props_sanitized`, `occurred_at` | Telemetria sem placa, nomes, CPF ou e-mail em claro |

### RLS e proteção de dados

- `profiles`, `orders`, `reports`, `report_modules`, `report_artifacts`, `support_requests`: clientes só leem linhas de sua titularidade comprovada; em `report_modules`, ownership via join autorizada/servidor, não por ID recebido do client.
- Pagamentos, jobs, custo, licenças, roles, auditoria e preço de fornecedor: escrita exclusiva de backend/admin autorizado.
- Para perfis e tabelas de clientes, policies com `TO authenticated` e vínculo por `auth.uid()`, não apenas `TO authenticated`.
- `service_role` / secret keys **nunca** usam `NEXT_PUBLIC_`, nunca entram em client bundle.
- Views devem respeitar RLS (por exemplo `security_invoker` quando cabível). `SECURITY DEFINER` só quando imprescindível, em schema não exposto, com testes de autorização.
- Buckets `reports-private` e `provider-private` (se permitido) são **privados**; downloads com autorização e URLs assinadas curtas.
- Criptografia em trânsito, minimização, criptografia de identificadores quando armazenados, backup com controles, política de retenção e exclusão. Não capturar documento/CPF de proprietário na interface pública.
- Retenção proposta: PDF e dados transacionais pessoais por **90 dias de disponibilidade na conta** como configuração inicial, sujeitos à aprovação jurídica; registros de repasse/auditoria com o prazo contratualmente exigido e base legal, sem reter payload bruto indiscriminadamente. O cliente precisa de transparência sobre retenção.
- Não usar relatório ou base de usuários para indexação, publicidade comportamental, treinamento de IA ou enriquecimento de leads por padrão.

---

## 10. Contrato da Direct Data, mapeamento e política de custos

### 10.1 Endpoints públicos documentados

| Código interno | Path v3 documentado | Parâmetro principal | Custo base |
|---|---|---|---:|
| `nacional` | `/api/ConsultaVeicular` | `Placa` | R$ 1,10 |
| `estadual` | `/api/ConsultaVeicularEstadual` | `Placa`, `Chassi` opcional | R$ 1,90 |
| `gravame` | `/api/ConsultaVeicularGravame` | `Placa`, `Chassi` opcional | R$ 1,80 |
| `roubo_furto` | `/api/ConsultaVeicularRouboFurto` | `Placa`, `Chassi` opcional | R$ 1,45 |
| `renajud` | `/api/ConsultaVeicularRenajud` | verificar parâmetros atuais | R$ 1,90 |
| `recall` | `/api/ConsultaVeicularRecall` | `Placa` | R$ 1,20 |
| `multas_radar` | `/api/ConsultaVeicularMultasRadar` | `Placa`, `Renavam` conforme documentação | R$ 0,36 |
| `leilao` | `/api/ConsultaLeilaoVeicular` | `Placa`, `Chassi` opcional | R$ 12,00 |
| `historico_proprietarios` | consultar catálogo atual | `Placa`/`Chassi`, conforme contrato | R$ 4,10 |
| `fipe` | `/api/ConsultaVeicularFipe` | `Placa`, `Chassi` opcional | R$ 3,89 |

Base: `https://apiv3.directd.com.br`. Os exemplos de documentação podem apresentar nome de parâmetro com caixa diferente e `TOKEN` na query; Codex deve mapear com base no **quickstart oficial do dia da implementação** e testar em ambiente controlado. Não extrapolar de nomes de endpoint para capacidades legais de distribuição.

**Fontes técnicas:**
- Guia: https://directd.com.br/guias/consulta-veicular-placa-api
- Nacional: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicular
- Estadual: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularEstadual
- Gravame: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularGravame
- Roubo/furto: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularRouboFurto
- RENAJUD: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularRenajud
- Recall: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularRecall
- Multas Radar: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularMultasRadar
- Leilão: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaLeilaoVeicular
- FIPE: https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularFipe
- Termos: https://app.directd.com.br/termos-de-uso

### 10.2 Normalização e payloads

- Criar fixtures JSON **sintéticas** para todos os módulos: `success_clear`, `success_alert`, `no_data`, `timeout`, `provider_error`, `ambiguous`, `partial`, `maintenance`.
- `directdata-client.ts`: chamada HTTPS server-only, normalização de metadados v3, tratamento de `assincrono`, `resultadoId`, `consultaUid`, timeouts, no-data e auth.
- Um mapper versionado por módulo: nunca renderizar diretamente JSON bruto na UI.
- `license-allowlist.ts`: define campos para cada plano e para formatos `on_screen`, `pdf_owner`, `shared_full_view` e `shared_full_pdf`. A última superfície só é liberada se houver licença explícita; **relatório completo** significa todas as seções contratadas **que a licença permite redistribuir**, não payload bruto. Campos não permitidos são descartados por padrão.
- `report-rules.ts`: traduções editoriais determinísticas; texto interpretativo não pode inventar fatos ausentes.
- `cost-guard.ts`: calcula custo previsto do job, bloqueia execução acima de limite operacional configurado sem override auditável.
- Observabilidade: salvar código de erro e tempo; **não** enviar payloads confidenciais a logs, Sentry, Analytics ou ferramentas de observabilidade externas sem contrato/licença.

### 10.3 Custo real e margens

- Guardar por chamada `estimated_cost_cents`, `actual_cost_cents` se fornecedor o retornar ou custo de tabela aplicado, `pricing_version`, `result_status`, `charged_status` quando conhecido.
- Se custos reais não forem fornecidos, mostrar no admin **“custo estimado segundo tabela”**, não “custo debitado confirmado”.
- Não mascarar custos de retentativas: `total_api_cost = sum(all billable attempts)`.
- Métricas de lucro podem mostrar **somente margem sobre API**, com aviso explícito de que não inclui outros custos.
- Nunca usar preço do fornecedor como variável editável pelo usuário final.

---

## 11. Asaas: pagamentos, eventos e estornos

- Sandbox e produção separados por configuração; `ASAAS_API_KEY`, `ASAAS_WEBHOOK_AUTH_TOKEN`, `ASAAS_ENVIRONMENT` são secretos.
- Usar **Checkout avulso** (`DETACHED`) com Pix/cartão, referência externa do pedido, retorno configurado e expiração.
- Confirmar versões, tipos de eventos e atributos pelo SDK/docs atuais; validar `CHECKOUT_PAID` e mudanças correlatas em teste de integração.
- Criar `provider_checkout_id` e mapear `referenceId`/`externalReference` do Asaas para o pedido interno de forma autenticada e inequívoca.
- Webhook responde 2xx rapidamente **após persistir evento**; processamento pesado fora do handler. Dedup por `provider_event_id` + transactional outbox.
- Reconciliador verifica checkouts pendentes e inconsistências sem recriar cobrança.
- Estorno/cancelamento é **ato administrativo protegido**, com motivo, dupla verificação para ações irreversíveis e tratamento de relatório já entregue definido em política comercial.
- No dashboard usuário, o botão “Pagar” só reabre/recria checkout se o anterior estiver expirado/cancelado segundo regras de idempotência.

**Fontes:** https://docs.asaas.com/docs/checkout-asaas ; https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook ; https://docs.asaas.com/docs/erros-comuns-e-boas-pr%C3%A1ticas

---

## 12. Design system, CRO e UX/UI

### 12.1 Direção visual (proposta a refinar)

**Personalidade:** confiável, clara, tecnológica sem parecer fintech genérica; “perícia documental acessível” com linguagem humana. Evitar visual alarmista que associe placa a criminalidade sem evidência.

**Tokens iniciais sugeridos** (validação visual por protótipos; paleta pode ser revisada sem refatorar):

| Token | Valor de partida | Uso |
|---|---|---|
| `--color-ink-900` | `#102B40` | Texto/títulos |
| `--color-primary-600` | `#146F8A` | Ação principal e navegação |
| `--color-primary-700` | `#0D536A` | Hover/foco |
| `--color-accent-500` | `#11A88D` | Destaques positivos não jurídicos |
| `--color-surface` | `#FFFFFF` | Base de cards |
| `--color-canvas` | `#F5F8FA` | Fundo |
| `--color-warning` | `#B86E0E` | Atenção |
| `--color-danger` | `#B43F41` | Alerta |
| `--color-border` | `#DCE5EC` | Divisórias |

Fonte proposta: **Inter ou Geist**, com fallback de sistema, verificada a licença; não commit de arquivos de fonte proprietários sem direito de uso. Escala tipográfica com tokens (12/14/16/20/24/32/40), espaçamento 4/8/12/16/24/32/48/64, raio 8/12/16; contraste mínimo WCAG AA, foco visível e animações reduzidas conforme preferência do usuário.

**Componentes obrigatórios do design system:** `Button`, `Input`, `PlateInput`, `Select`, `Checkbox`, `Tabs`, `Modal`, `Drawer`, `Toast`, `Badge`, `Tooltip`, `Skeleton`, `EmptyState`, `PriceCard`, `PlanComparison`, `StatusIndicator`, `SourceCoverage`, `AlertCard`, `VehicleHeader`, `ReportSection`, `DataRow`, `Timeline`, `ProgressTracker`, `PrivacyWarning`, `ShareDialog`, `DataTable`, `KpiCard`, `Pagination`, `Breadcrumbs`. Documentar variantes, estados, mobile e requisitos de acessibilidade.

### 12.2 CRO, conversão e fricção

- Hero público com campo de placa, provas de segurança **factuais e demonstráveis**, resumo dos planos e CTA.
- Evitar forçar senha/cadastro antes de pagamento; e-mail no checkout, OTP antes de exibir relatório pago; **Grátis funciona sem login porque só verifica formato, sem consulta veicular**.
- Comparação entre planos com o preço sempre claro; não esconder custos de leilão ou FIPE.
- Reduzir ansiedade: tela de progresso, retorno por e-mail, manter pedido salvo, mensagens concretas sobre indisponibilidade da fonte.
- Não usar dark patterns, falsa escassez, depoimentos inventados, avaliação média fictícia, “100% garantido” ou contadores sem dados.
- Mostrar no relatório explicação ao lado do risco, não exigir que o usuário abandone a página para entender termos técnicos.
- Testes A/B futuros por feature flag: ordem dos planos, rótulos das propostas, microcopy do checkout, posição do campo de placa, resumo do relatório. Não implementar plataforma complexa de experimento em V1.

### 12.3 Responsividade e acessibilidade

- **Mobile-first** para consumidor, com CTA e ações principais facilmente alcançáveis por polegar, tipografia de leitura e PDF bem formatado.
- **Desktop eficiente** para lojista: painel com tabela, busca, filtros e densidade de informação maior, mas mantendo responsividade.
- Breakpoints guiados por conteúdo, não por dispositivo de marketing. Testar 360/375/390/430/768/1024/1440 px.
- Teclado completo, labels, `aria-live` no progresso, validação acessível, tooltip não dependente de hover, targets de toque confortáveis e contraste WCAG AA.

---

## 13. Eventos de analytics (fundação do laboratório de aquisição)

**Princípio:** rastrear intenção, progresso e conversão, **nunca placa, RENAVAM, CPF, chassi ou proprietário** em ferramentas de analytics. Respeitar consentimento de cookies quando aplicável e operar com mínimo de dados.

| Evento | Quando | Propriedades permitidas |
|---|---|---|
| `plate_form_viewed` | Campo de placa exibido | `page_type`, `device_class` |
| `plate_format_validated` | Placa em formato válido | `plate_type` (antiga/Mercosul), **sem valor** |
| `plan_list_viewed` | Comparação visível | `placement`, `experiment_id?` |
| `plan_selected` | Clique em plano | `plan_code`, `plan_version`, `price_cents` |
| `plate_format_validation_submitted` | Validador gratuito acionado (sem API) | `plate_type` (antiga/Mercosul/desconhecida), `is_valid` (booleano), **sem placa** |
| `free_to_paid_click` | CTA do Grátis para um plano pago | `target_plan` |
| `checkout_started` | Cria pedido | `plan_code`, `price_cents` |
| `checkout_paid` | Webhook confirma pagamento | `plan_code`, `amount_cents`, sem ID de transação em analytics externo |
| `report_started` | Job iniciado | `plan_code` |
| `report_completed` | Relatório pronto | `plan_code`, `coverage_percent`, `status` |
| `report_viewed` | Usuário abre relatório | `plan_code`, `source_page` |
| `report_pdf_downloaded` | Download autorizado | `plan_code` |
| `report_shared` | Link **integral licenciado** gerado/compartilhado | `channel=whatsapp/native/copy`; sem token, placa ou URL |
| `upgrade_click` | Ferramenta de validação grátis→plano pago | `from_plan=free_format_only`, `to_plan` |

Admin deve apresentar funil básico: visitas à entrada → plano → checkout → pago → relatório concluído; métricas separadas por origem/campanha quando houver UTM, preservando privacidade. SEO/AEO futuro poderá conectar GSC e análises de respostas/referências, mas isso não faz parte da V1.

---

## 14. Requisitos não funcionais e segurança

- **Disponibilidade:** interface e painel disponíveis mesmo com Direct Data indisponível; relatório deve sinalizar fonte fora do ar.
- **Performance:** páginas públicas com metas iniciais de CWV (LCP p75 ≤ 2,5s, INP p75 ≤ 200ms, CLS p75 ≤ 0,1) em condições reais; otimizar JS e imagens.
- **Tamanho / responsividade:** páginas legíveis em celular modesto e navegadores atuais; evitar PDFs gigantes.
- **Privacidade:** LGPD, minimização, acesso por titular, retenção, exclusão onde possível, audit trail, bases legais e revisão jurídica contratual antes de comercializar.
- **Segurança:** OWASP ASVS aplicável, rate limit, Zod, proteção CSRF onde necessária, cookies seguros, headers de segurança, segredo não logado, CSP compatível com Asaas/Supabase, prevenção de IDOR, SSRF e abusos.
- **Admin:** MFA preferencialmente obrigatório para administradores, perfil de permissão não editável pelo cliente, operações perigosas com confirmação explícita.
- **Dados veiculares:** documentação de fontes, dates, licenças e tipos de campos publicados; evitar exibir documentos e nomes de terceiros.
- **Reprodutibilidade:** migrações versionadas, seed e fixtures sintéticas, testes automatizados, `README` de setup e `.env.example` sem segredos.
- **Qualidade:** typecheck/lint/test/build como bloqueadores de merge; logs estruturados com mascaramento e trace IDs.
- **Escopo de infraestrutura:** projetado para baixo volume, mas sem dívida técnica que quebre em 100 consultas simultâneas; fila, dedupe e limites permitem escalar depois.

---

## 15. GitHub, Codex, PRs e Vercel — política obrigatória

**Regra de produto:** repositório GitHub dedicado à Checkplaca; cada mudança relevante deve abrir PR. A Vercel gera **Preview** para branches/PRs; **produção é atualizada quando o PR aprovado é incorporado à branch de produção (`main`)**, não ao criar qualquer commit em qualquer branch. Isso evita que código não revisado vá ao ar.

### 15.1 Fluxo padrão por tarefa

1. Codex lê `AGENTS.md`, este PRD, `README.md` e ADRs. Abre branch `feat/<slug>`, `fix/<slug>` ou `chore/<slug>` a partir de `main` atual.
2. Faz mudança pequena, atualiza docs e testes; **não altera escopo aprovado sem atualização de PRD/ADR**.
3. Executa lint, typecheck, unit/integration/E2E relevantes e build local; nunca inclui `.env`, token, payload real confidencial ou screenshot de dados pessoais.
4. Commit com título claro (`feat: ...`), push da branch e **abertura de PR** com descrição, screenshots mobile/desktop quando necessário, mudanças DB, testes, riscos e checklist de segurança.
5. GitHub Actions valida. Vercel cria URL de Preview. PR só é mergeado com aprovação do proprietário (ou política explícita definida por ele) e checks verdes.
6. Merge para `main` desencadeia deploy de produção automático pela integração GitHub↔Vercel. Verificar status e smoke test pós-deploy.
7. Migrations Supabase devem ser **backward-compatible** e aplicadas em ordem controlada; **deploy do código não atualiza banco automaticamente** sem pipeline de migrations autorizada. Separar migrações destrutivas de releases de aplicação.

### 15.2 Proteções mínimas

- `main` protegida: bloquear push direto e forçar PR; checks obrigatórios `lint`, `typecheck`, `unit`, `build`, `e2e` crítico, `security` quando disponível.
- `CODEOWNERS` com o proprietário; bloqueio de merge com CI falhando.
- Ambiente `preview` deve usar **Asaas Sandbox** e **Direct Data em mock por padrão**, evitando custo e exposição. Produção usa credenciais/serviços próprios.
- Secrets via Vercel Environment Variables e GitHub Secrets. Variáveis públicas apenas para configs não sensíveis. Desabilitar compartilhamento público de builds com dados reais.
- Sem merges automáticos de PR Codex, sem `--force` em `main`, sem deploy manual de produção sem aprovação explícita.

### 15.3 Arquivos a criar logo no primeiro PR

- `AGENTS.md`: estilo de PR, política de segurança, leitura do PRD, guardrails de integrações e limite de autonomia.
- `docs/design-system.md`: tokens, componentes, exemplos/variantes e guia de evolução.
- `docs/architecture.md`: diagrama, módulos, decisões de fila/worker.
- `docs/api-directdata.md` e `docs/api-asaas.md`: adapters e mocks, sem credenciais.
- `docs/privacy-compliance.md`: lista de dados tratados, superfícies de exposição, retenção e licenças.
- `.github/workflows/ci.yml`: checks.
- `.env.example`: apenas `NEXT_PUBLIC_SUPABASE_URL`, chave publicável Supabase, `SUPABASE_SECRET_KEY` ou service role conforme SDK atual, `DIRECTDATA_TOKEN`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_AUTH_TOKEN`, `NEXT_PUBLIC_APP_URL`, `WORKER_SECRET`, secrets de share, flags, **todos sem valor**.

**Documentação oficial:** https://vercel.com/docs/git ; https://vercel.com/docs/git/vercel-for-github ; https://supabase.com/docs/guides/auth/server-side ; https://supabase.com/docs/guides/storage/security/access-control

---

## 16. Plano de implementação por PR (ordem recomendada)

**Não tentar construir tudo num único PR. Cada entrega deve compilar, testar e estar demonstrável em Preview.**

| Fase/PR | Conteúdo | Saída / critério de pronto |
|---|---|---|
| **PR-00 — Fundação** | Next.js/TS, lint/test/build, diretórios, README, `AGENTS.md`, CI, design tokens e layout público mínimo, healthcheck | App sobe localmente, CI verde e preview na Vercel |
| **PR-01 — Design system** | Componentes base, padrões mobile/desktop, docs, estados e páginas de demonstração | UI consistente, contraste e foco testados |
| **PR-02 — Supabase** | Migrations, Auth e OTP, RLS, perfis, papéis, seed e testes de autorização | Login e isolamento de dados aprovados; seed sem dados reais |
| **PR-03 — Planos e início de jornada** | Catálogo parametrizado, **validador gratuito sintático sem API/login**, entrada de placa, páginas de planos, quote e checkout stub | Jornada visual completa e testes assegurando **zero chamadas Direct Data** no Grátis |
| **PR-04 — Asaas Sandbox** | Checkout hosted, webhooks, dedupe, reconciliação, `orders` | Pedido pago simulado aciona `queued` somente 1 vez |
| **PR-05 — Direct Data adapter** | Adapters de 10 módulos, normalizers, fixtures, license flags, cost guard, worker | Sem rede paga por padrão; relatórios sintéticos completos e parciais |
| **PR-06 — Relatórios + PDF** | Renderer, status, glossário, checklist, PDFs privados e **compartilhamento integral por token condicionado à licença** | Relatório mobile/desktop; flag de licença `false` por padrão; preview WhatsApp não expõe dados; token revogável |
| **PR-07 — Dashboard cliente** | Histórico, filtros, relatórios, perfil, suporte | Cliente só vê dados próprios; pós-compra funcional |
| **PR-08 — Admin** | KPI, custo API, pedidos, catálogo/versionamento, autorização de compartilhamento integral, suporte/auditoria | Admin monitora consultas pagas e desativa módulos, sem gestão fictícia de créditos gratuitos |
| **PR-09 — SEO básico e lançamento** | Metadados, canonical, sitemap, robots, páginas públicas mínimas, analytics consentido, E2E final | App pronto para deploy após aprovação de licenças, pagamento e consulta real |
| **PR-10 — Integrações reais controladas** | Validar Direct Data com placas de teste autorizadas e Asaas produção; corrigir mappings e políticas de resultado | Lançamento só após checklist de segurança e autorização do fundador |

**Revisão por PR:** incluir dados de teste sem CPF/placa identificável; resumo de screenshots de `375px` e `1440px`; migração aplicada em dev; evidência de RLS; custo de chamadas externas de testes e como manter desligadas em Preview.

---

## 17. Testes e critérios de aceite de lançamento

### 17.1 Testes automatizados obrigatórios

- **Unitário:** validação de placas (antiga/Mercosul), preços em centavos, margens, snapshot, sanitização, regras de status/sem ocorrência, normalizers dos 10 módulos.
- **Integração:** Asaas checkout pago/cancelado/duplicado/fora de ordem; Direct Data mock com dados encontrados/sem dados/módulo indisponível/async; lease e dedupe de jobs.
- **RLS:** cliente A não pode acessar consulta de B; visitante não lê `reports`, `orders`, `share` privados; admin não emerge de edição de perfil.
- **E2E:** validador grátis funciona anônimo com **zero chamadas Direct Data/Asaas** e sem criar registros; visitante→plano→checkout sandbox→webhook→OTP→relatório→download; parcial; chargeback e erro; compartilhamento de **relatório completo** via WhatsApp somente com licença ativa, incluindo expiração, revogação e rejeição de prévias automatizadas.
- **Qualidade:** responsividade em 375/390/768/1440 px, teclado, foco, leitores de tela, PDF multi-página, noindex privados.

### 17.2 Critérios de aceite de negócio

- [ ] Checkout e planos permitem criar/confirmar pagamento avulso Pix/cartão com Asaas Sandbox.
- [ ] Webhook duplicado e refresh de página **não** causam segundo débito de API.
- [ ] Cliente com e-mail verificado acessa relatório e painel sem ver dados de outros clientes.
- [ ] Grátis valida **somente formato** (antiga/Mercosul), sem login, consulta Direct Data, custo, pedidos, relatório ou armazenamento de placa; mostra disclaimer de que formato válido não comprova existência do veículo.
- [ ] Essencial contém somente módulos e campos aprovados; custo previsto de R$ 9,71 sob preços de referência.
- [ ] Completo contém módulos e campos aprovados; custo previsto de R$ 29,70 sob preços de referência; leilão não é omitido apenas por flag nacional negativa.
- [ ] Indisponibilidade de fonte aparece como **indisponível**, nunca verde.
- [ ] Documento pessoal de proprietário/CPF/chassi/RENAVAM completo **não** é publicado ou compartilhado indevidamente.
- [ ] PDF privado pode ser baixado pelo comprador; **compartilhamento completo** por link temporário, revogável e sem login do destinatário só funciona após licença e flag aprovadas; link revela apenas campos licenciados e bloqueia prévia de bots.
- [ ] Admin vê vendas, gastos de APIs pagas, valor bruto após APIs, falhas e autorização de compartilhamento integral.
- [ ] Design system versionado no GitHub e testado em mobile e desktop.
- [ ] Páginas públicas indexáveis; relatórios, usuários e admin não indexáveis.
- [ ] PRs em branches com Preview da Vercel, checks e merge protegido para produção.
- [ ] Termos da Direct Data e política de privacidade/relatório revisados e aprovados antes da venda real.

### 17.3 Gate de produção (bloqueadores)

1. **LICENÇA**: resposta escrita do fornecedor autorizando o uso comercial e o repasse **por módulo e campo**, inclusive PDF e compartilhamento.
2. **TESTE REAL**: payloads de veículos de teste autorizados, incluindo retorno sem dados e indisponibilidade; custos verificados no dashboard do fornecedor.
3. **PAGAMENTO**: conta Asaas produção e webhook autenticado testado; política de reembolso publicada.
4. **PRIVACIDADE**: LGPD/termos/consentimentos, retenção e acesso de titular revisados com responsável competente.
5. **SEGURANÇA**: RLS, buckets privados, sem segredos no repositório, PR/CI protegidos e admin com MFA.
6. **FINANCEIRO**: plano pago só é publicado quando preço, módulos e margem sobre API forem aprovados no painel; **Grátis é sintático e não possui orçamento de API**.

---

## 18. Decisões aprovadas e pendências operacionais

### 18.1 Decisões de produto **aprovadas pelo fundador em 18/11/2026**

| Tema | Escolha confirmada | Consequência obrigatória na V1 |
|---|---|---|
| **Grátis** | **Somente validação do formato de placa, sem custo de API** | Não consultar Nacional, não exigir e-mail, OTP ou login, não gerar pedidos/PDF/relatórios, não criar quota de créditos |
| **Preço do Completo** | **R$ 39,90** | Oferta e defaults de catálogo usando 3990 centavos; custo referencial R$ 29,70 e margem 25,6% apenas sobre APIs |
| **Compartilhamento WhatsApp** | **Destinatário pode acessar o relatório completo via link seguro, condicionado à licença** | Implementar experiência de acesso integral com token, validade, revogação, proteção anti-indexação e flag inicialmente desativada até aprovação escrita |

### 18.2 Pendências que **não alteram** as três decisões acima

| Tema | Padrão atual / implementação | Condição para produção |
|---|---|---|
| Preço do Essencial | R$ 19,90 | Confirmar oferta no catálogo antes de publicar |
| Histórico de proprietários | Somente dados agregados permitidos | Confirmar licença e origem do módulo; remover se vedado |
| Login comprador pago | OTP por e-mail, sem senha | Teste de recuperação e vínculo de pedido |
| Checkout | Asaas hospedado | Habilitar após testes de sandbox/webhook |
| Compartilhamento completo | **Desativado por default** (feature flag) | Licença escrita para redistribuição integral via link a terceiros, por plano/campo e modalidade (tela/PDF) |
| Diferenciais | Tradutor + checklist + transparência + compartilhamento seguro | Outros brainstorms seguem backlog, sem implementação automática |
| Identidade visual | Paleta proposta azul-petróleo/verde | Ajustes guiados pelo design system no PR-01 |
| Domínio e DNS | Proprietário já dispõe do domínio | Configurar URL real, redirects e ambiente Vercel quando informado |

**Não repassar estas escolhas ao Codex como perguntas abertas.** A única validação externa imprescindível para habilitar compartilhamento integral é a licença da Direct Data, além das demais verificações contratuais da operação paga. Em caso de restrição contratual, **manter compartilhamento desativado**, registrar bloqueio e pedir decisão de escopo; **não** reverter automaticamente para resumo.

---

## 19. Fontes para consulta durante implementação

**Concorrência / produto**
- https://www.olhonocarro.com.br/
- https://nova.checkauto.com.br/
- https://www.concar.com.br/consulta-placa/essencial
- https://www.concar.com.br/consulta-placa/pre-compra
- https://www.historicar.com.br/planos

**Direct Data**
- https://directd.com.br/guias/consulta-veicular-placa-api
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicular
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularEstadual
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularGravame
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularRouboFurto
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularRenajud
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularRecall
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularMultasRadar
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaLeilaoVeicular
- https://directd.com.br/central-de-ajuda/apis/catalogo/ConsultaVeicularFipe
- https://app.directd.com.br/termos-de-uso

**Asaas**
- https://docs.asaas.com/docs/checkout-asaas
- https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook
- https://docs.asaas.com/docs/erros-comuns-e-boas-pr%C3%A1ticas

**Supabase e Vercel**
- https://supabase.com/docs/guides/auth/server-side
- https://supabase.com/docs/guides/storage/security/access-control
- https://vercel.com/docs/git/vercel-for-github
- https://vercel.com/docs/git

**Nota para Codex:** todas as fontes externas podem mudar. Confrontar as informações com documentação oficial atual no momento da implementação e registrar alterações materiais em um ADR e PR de revisão do PRD.

---

## 20. Prompt de início recomendado ao Codex

> “Leia integralmente `docs/prd/PRD_Checkplaca_v1.md`. Não implemente backlog não aprovado. Primeiro crie apenas o **PR-00 — Fundação** e, no mesmo PR, inclua `AGENTS.md`, `README.md`, `.env.example`, CI, app Next.js/TypeScript, diretórios, placeholders de design system e documentação inicial. Configure o repositório para branches e Pull Requests; não faça push direto para `main`, não execute consultas pagas da Direct Data nem crie cobranças reais. Execute lint, testes, build e abra um PR com plano de próximos passos. Não use credenciais reais em código, comentários ou logs.”

**Fim do PRD V1.**
