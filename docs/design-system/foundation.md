# Design system da Checkplaca

A interface usa linguagem direta, hierarquia clara e estados de verificação explícitos. Os tokens estão em `src/app/globals.css` e são reutilizados na página pública e nos componentes de `src/components/ui`. A rota `/design-system` contém exemplos visuais e tem `noindex`.

## Identidade e tokens

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#102B40` | Texto principal |
| `--muted` | `#526777` | Texto secundário |
| `--primary` | `#146F8A` | Ação principal |
| `--primary-hover` | `#0D536A` | Hover e marca |
| `--accent` | `#11A88D` | Destaques positivos |
| `--canvas` | `#F5F8FA` | Fundo da página |
| `--surface` | `#FFFFFF` | Cards e campos |
| `--border` | `#DCE5EC` | Divisórias |
| `--warning` | `#98600B` | Atenção |
| `--danger` | `#A9363A` | Erro e alerta |

Fonte de sistema com fallback Arial. Títulos usam escala fluida. Corpo usa no mínimo 16 px no conteúdo principal. Espaçamento segue múltiplos de 4 px, com seções em 24, 32, 48, 64 e 96 px. Raios pequenos, médios e grandes são 10, 16 e 20 px. Cards usam sombra sutil somente quando precisam de destaque.

## Componentes

- `ButtonLink` aceita `primary`, `secondary` e `quiet`. Texto da ação deve dizer o resultado esperado.
- `PlanCard` mostra nome, preço por consulta, descrição, itens e ação opcional. `featured` destaca um plano sem alterar seu conteúdo.
- `Field` associa label, instrução ou erro ao input. `aria-invalid` indica erro.
- `Notice` tem tons informativo, atenção e erro. Erros usam `role=alert`.
- `StatusIndicator` representa `clear`, `alert`, `inconclusive`, `unavailable`, `not_included`, `not_applicable` e `not_found`. Cor nunca é o único sinal. Indisponível e não localizado não equivalem a sem ocorrência.
- `Skeleton` sinaliza carregamento e `EmptyState` explica ausência de conteúdo com ação opcional.

Componentes de relatório, modal, tabela, navegação de painel e PDF serão adicionados junto às jornadas que os usam. Toda informação veicular exibida dependerá de licença e resultado real.

## Responsividade e acessibilidade

O layout de planos passa de três colunas a uma até 800 px. Campos de exemplo passam a uma coluna até 600 px. O contêiner mantém margens laterais de 16 px em telas pequenas. Botões e campos têm altura mínima de 48 px. Links, botões e campos possuem foco visível. O layout respeita movimento reduzido. Testar 375, 768 e 1440 px em cada PR que alterar a interface.
