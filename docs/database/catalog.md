# Catálogo inicial

A migration `20261118000200_catalog.sql` cria `plans`, `plan_versions` e `integration_modules`. Essencial começa em 1.990 centavos e Completo em 3.990 centavos. Os custos referenciais por módulo seguem o PRD, totalizando 971 e 2.970 centavos respectivamente. As versões ficam despublicadas, os planos inativos e todos os módulos com `license_approved=false` e `enabled=false`.

RLS permite ao visitante ler apenas planos ativos e versões publicadas. Custos e licenças não são legíveis pelo visitante. O quote usa chave de backend e confere versão publicada, plano ativo e licenças de todos os módulos. A resposta não cria pedido nem consulta o fornecedor. O rate limit em memória é uma proteção leve por instância. Antes de venda real, adicionar limite compartilhado entre instâncias e política administrativa de publicação.

A interface mostra valores de lançamento do PRD enquanto não houver catálogo publicado. Após publicação, lê preços, descrições e módulos da versão ativa. O checkout continua indisponível até a PR-04.
