# Direct Data, preparação da PR-05

A interface `VehicleDataProvider` recebe um módulo, placa normalizada e sinal de cancelamento. `MockVehicleDataProvider` usa cenários sintéticos em `src/lib/vehicle-data/fixtures/` para os dez módulos. `DirectDataProvider` permanece bloqueado, sem rede. O guia oficial retornou HTTP 403 neste ambiente e não há credencial ou licença comercial configurada. Nenhum endpoint, campo de resposta ou forma de autenticação foi presumido.

`runPaidReport` rejeita pedidos sem pagamento confirmado, placa inválida, módulos duplicados, módulo desabilitado ou sem licença, e custo previsto acima do limite. Ele consulta todos os módulos do snapshot, inclusive leilão mesmo quando o Nacional não sinaliza ocorrência. A saída distingue `clear`, `alert`, `inconclusive`, `unavailable` e `not_found`. Falha ou resposta fora do esquema vira `unavailable`, sem exibir dados brutos. Custos estimados e realizados ficam separados. O mock não representa consulta real.

A migration `20261118000400_reports_and_provider_calls.sql` prepara relatórios, resultados por módulo, tentativas auditáveis e campos de lease no job. RLS restringe leitura de relatório e módulos ao titular. Chamadas e custos do fornecedor ficam inacessíveis a usuários comuns.

A conexão do runner ao job persistido, as dez normalizações de payload real, a política de allowlist por campo, a execução assíncrona e o controle de retries pagos dependem de documentação oficial, payloads de teste autorizados, licença por módulo e credenciais. Nenhuma consulta paga pode ser ativada até o webhook Asaas, o vínculo da placa ao pedido e esses controles estarem validados. Preview deve seguir em mock.
