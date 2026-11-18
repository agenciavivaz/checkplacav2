# Arquitetura inicial

Next.js App Router serve páginas públicas, áreas privadas e rotas internas. Supabase cuida de Auth e PostgreSQL com RLS. Um proxy atualiza cookies de sessão nas rotas autenticadas. Server Actions enviam o OTP, atualizam o perfil e encerram a sessão. O callback troca o código ou token de e-mail por sessão antes de abrir `/conta`.

Asaas fornecerá checkout hospedado e webhooks. Um worker processará jobs de relatório somente após confirmação de pagamento. A camada Direct Data terá interface de provedor e adaptadores por módulo. Essa integração começa em mock e exigirá licença e credenciais para operação real.

```mermaid
flowchart LR
  Browser --> Next[Next.js]
  Next --> Auth[Supabase Auth]
  Next --> DB[PostgreSQL/RLS]
  Next --> Asaas[Asaas Checkout]
  Asaas --> Webhook[Webhook autenticado]
  Webhook --> DB
  DB --> Worker
  Worker --> Direct[Direct Data]
  Worker --> Storage[Storage privado]
```

O app público e conteúdo futuro compartilham domínio e design system. Rotas privadas têm `noindex` e autorização no servidor.
