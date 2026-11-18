# Asaas, preparação da PR-04

A PR-04 modela pedidos, eventos de pagamento e jobs de relatório. A migration `20261118000300_orders_and_payment_events.sql` cria `orders`, `payment_events` e `report_jobs`. O processamento transacional `apply_payment_event` exige papel `service_role`, confere o checkout associado ao pedido, registra cada ID de evento uma vez, move o estado com regras monotônicas e cria no máximo um job. Estorno cancela job ainda enfileirado. O worker futuro deve verificar novamente que o pedido permanece pago antes de qualquer chamada à Direct Data.

O teste `npm run test:rls` usa PostgreSQL local e casos sintéticos de expiração seguida de pagamento, pagamento duplicado, expiração atrasada e estorno. Esse teste não representa evento recebido do Asaas.

## Bloqueios para checkout e webhook reais

A URL da documentação oficial do checkout retornou HTTP 403 neste ambiente, inclusive na tentativa de acesso alternativa. Não há `ASAAS_API_KEY` ou `ASAAS_WEBHOOK_AUTH_TOKEN` disponíveis. Por isso, a aplicação ainda não envia requisições ao Asaas nem expõe um webhook que aceite eventos. O checkout permanece indisponível na interface. A integração real exige confirmar endpoint, campos, autenticação, estrutura do evento e callbacks na documentação atual, configurar credenciais de Sandbox e validar o fluxo end-to-end. O token do webhook deve ser diferente da API key.

Quando os requisitos estiverem disponíveis, um adaptador Asaas deverá criar checkout hospedado por pedido elegível, persistir o ID remoto, autenticar webhooks, mapear apenas eventos documentados para os estados internos e chamar a RPC sob chave de serviço. Retorno do navegador nunca confirma pagamento. Não habilitar consulta paga enquanto licença dos módulos, pagamento e worker não estiverem validados.
