# Modelo de dados e acesso

A migration `supabase/migrations/20261118000100_profiles_and_roles.sql` cria `profiles` e `user_roles`. O trigger de `auth.users` cria um perfil sem dados pessoais adicionais. O próprio usuário pode ler seu perfil e atualizar somente `display_name`. `user_roles` fica inacessível a `anon` e `authenticated`; atribuição de administrador exige operação confiável no banco. A interface não lê ou grava papéis diretamente.

Todos os acessos sensíveis da aplicação usam `auth.getUser()` no servidor. A página `/conta` não renderiza dados quando não há sessão válida. O `user_id` usado na atualização vem da sessão autenticada, não de um campo do navegador. A migration usa RLS, políticas restritas por `auth.uid()` e grants por coluna.

Para validar RLS em um projeto de desenvolvimento, crie dois usuários sintéticos A e B via Supabase Auth. Com o JWT de A, `select` de `profiles` deve retornar apenas A e `update` com `user_id` B não deve modificar linhas. Com o JWT de B, repita invertendo os papéis. Com `anon`, leitura de `profiles` e `user_roles` deve ser negada. Com A autenticado, leitura e escrita em `user_roles` devem ser negadas. Execute também login por OTP, expiração de link, logout e recuperação de acesso.

Pedidos, relatórios e arquivos privados serão modelados nas PRs de suas jornadas. Não aplique migrations de produção automaticamente pelo deploy do app.

A migration `20261118000300_orders_and_payment_events.sql` adiciona pedidos, eventos de pagamento e jobs. A RPC de transição de pagamentos é exclusiva de `service_role`. O cliente só pode ler pedidos vinculados ao próprio `auth.uid()`. Dados de pagamento, eventos e jobs não têm grants de leitura para usuários comuns.
