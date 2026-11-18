# Deploy

GitHub Actions executa lint, typecheck, testes e build em PRs. Integrar o repositório à Vercel para previews de branch quando a conta estiver disponível. Produção deve acompanhar apenas a `main` após aprovação e merge. Variáveis privadas devem ser cadastradas por ambiente. Migrations de produção exigem revisão própria e execução controlada.
