# Checkplaca

Plataforma brasileira de consultas veiculares. Este repositório está na PR-00, fundação técnica. A página pública apresenta os planos aprovados, mas ainda não valida placas, processa pagamentos ou consulta dados de veículos.

## Desenvolvimento

Requer Node.js 24 e npm. Execute `npm ci`, `npm run dev` e abra `http://localhost:3000`. Verificações: `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` e `npm run test:rls` com Docker disponível. O healthcheck fica em `/api/health`.

## Estrutura e próximos passos

O PRD integral está em [`docs/prd/PRD_Checkplaca_v1.md`](docs/prd/PRD_Checkplaca_v1.md). A sequência de PRs está em [`docs/architecture/roadmap.md`](docs/architecture/roadmap.md). Configuração, arquitetura, integrações e diretrizes visuais estão em `docs/`. Nenhuma credencial é necessária para esta fase. Consulte `.env.example` para futuras integrações.

## Supabase Auth (PR-02)

Para login por e-mail, configure `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no ambiente. No Supabase Auth, permita a URL `/auth/confirm` como redirect e aplique as migrations de `supabase/migrations/` em um projeto de desenvolvimento. O envio de OTP usa o provedor de e-mail configurado no Supabase. `/entrar` inicia o acesso e `/conta` exige sessão válida. A ausência das variáveis mantém a página pública e o healthcheck disponíveis.
