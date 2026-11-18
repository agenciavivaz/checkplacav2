# Checkplaca

Plataforma brasileira de consultas veiculares. Este repositório está na PR-00, fundação técnica. A página pública apresenta os planos aprovados, mas ainda não valida placas, processa pagamentos ou consulta dados de veículos.

## Desenvolvimento

Requer Node.js 24 e npm. Execute `npm ci`, `npm run dev` e abra `http://localhost:3000`. Verificações: `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`. O healthcheck fica em `/api/health`.

## Estrutura e próximos passos

O PRD integral está em [`docs/prd/PRD_Checkplaca_v1.md`](docs/prd/PRD_Checkplaca_v1.md). A sequência de PRs está em [`docs/architecture/roadmap.md`](docs/architecture/roadmap.md). Configuração, arquitetura, integrações e diretrizes visuais estão em `docs/`. Nenhuma credencial é necessária para esta fase. Consulte `.env.example` para futuras integrações.
