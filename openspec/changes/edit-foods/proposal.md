## Why

Hoje, quem lança um alimento com a quantidade errada só pode excluí-lo e adicioná-lo de novo. Quem cadastra um alimento personalizado com um valor nutricional errado não consegue corrigi-lo. Isso gera atrito e dados incorretos no diário.

## What Changes

- Permitir editar a quantidade (número e medida: unidade ou gramas) de um alimento já lançado no diário. Calorias e macros são recalculados a partir dos valores originais por 100 g.
- Permitir editar um alimento personalizado (nome, unidade, peso da unidade e valores por 100 g) a partir da busca.
- Editar um alimento personalizado NÃO altera lançamentos antigos do diário, pois cada lançamento guarda seus próprios valores.
- Persistir as edições localmente e na fila de sincronização existente, reutilizando os upserts `entry.add` e `food.add` com o mesmo `id`. Não há mudança no banco.
- Atualizar a versão do app para `1.5.0` (`index.html` e `sw.js`), o README e o hash da CSP.

## Capabilities

### New Capabilities
- `food-entry-editing`: edição da quantidade de um alimento lançado no diário.
- `custom-food-editing`: edição de alimentos personalizados.

### Modified Capabilities
- Nenhuma. Os requisitos de `cloud-data-sync` não mudam, pois as operações de sincronização já existem.

## Impact

- `index.html`: lista do diário (botão editar), janela de lançamento (modo edição), lista de busca (editar personalizado), manipulador de cliques.
- `sw.js`: constante `VERSAO`.
- `README.md`: versão, "Novo na 1.5.0" e histórico.
- Sem alteração em tabelas, políticas RLS ou dependências.
- Limitação: o lançamento guarda apenas gramas e rótulo de quantidade, não os valores por 100 g. Os valores por 100 g são derivados de `kcal / gramas * 100`. Lançamentos com 0 g não podem ser reescalados e só aceitam exclusão.
