# Checkplaca

Plataforma brasileira de consultas veiculares. Este repositório está na PR-00, fundação técnica. A página pública apresenta os planos aprovados, mas ainda não valida placas, processa pagamentos ou consulta dados de veículos.

## Desenvolvimento

Requer Node.js 24 e npm. Execute `npm ci`, `npm run dev` e abra `http://localhost:3000`. Verificações: `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` e `npm run test:rls` com Docker disponível. O healthcheck fica em `/api/health`.

## Estrutura e próximos passos

O PRD integral está em [`docs/prd/PRD_Checkplaca_v1.md`](docs/prd/PRD_Checkplaca_v1.md). A sequência de PRs está em [`docs/architecture/roadmap.md`](docs/architecture/roadmap.md). Configuração, arquitetura, integrações e diretrizes visuais estão em `docs/`. Nenhuma credencial é necessária para esta fase. Consulte `.env.example` para futuras integrações.

## Supabase Auth (PR-02)

Para login por e-mail, configure `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no ambiente. No Supabase Auth, permita a URL `/auth/confirm` como redirect e aplique as migrations de `supabase/migrations/` em um projeto de desenvolvimento. O envio de OTP usa o provedor de e-mail configurado no Supabase. `/entrar` inicia o acesso e `/conta` exige sessão válida. A ausência das variáveis mantém a página pública e o healthcheck disponíveis.

## Validação gratuita e catálogo (PR-03)

A página inicial valida o formato da placa localmente. Não envia a placa a APIs, não cria conta e não persiste histórico. `/planos` mostra os preços de lançamento. O checkout em `/checkout` é um fluxo de preparação sem pedido ou cobrança. `POST /api/quotes` revalida a placa e somente responde a ofertas publicadas e licenciadas no banco. A migration do catálogo mantém todos os módulos desativados até aprovação comercial.

## Pagamentos (PR-04 em preparação)

A migration de pedidos e o processador idempotente de eventos estão prontos para testes locais com `npm run test:rls`. O checkout Asaas e o webhook real permanecem bloqueados até a confirmação do contrato de API atual e configuração das credenciais de Sandbox. Consulte `docs/integrations/asaas.md`.

## Dados veiculares (PR-05 em preparação)

A camada de provedor e o runner de relatórios usam fixtures sintéticas e regras de pagamento, licença e orçamento. A Direct Data real permanece bloqueada. Consulte `docs/integrations/direct-data.md`.
