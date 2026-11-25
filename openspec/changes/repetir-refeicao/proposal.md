## Why

Muitas pessoas comem as mesmas refeições em dias diferentes (por exemplo, o mesmo café da manhã). Hoje é preciso buscar e adicionar cada alimento de novo, o que toma tempo e faz o usuário desistir do registro.

## What Changes

- Cada cartão de refeição (Café da manhã, Almoço, Jantar, Lanches) com alimentos ganha o botão "Repetir".
- Ao tocar em "Repetir", o usuário escolhe a refeição de destino (qualquer uma das quatro) e o dia ("Este dia", que é o dia exibido, "Dia seguinte" ou um campo de data), e confirma. O destino pode ser outra refeição do mesmo dia.
- Todos os alimentos da refeição são copiados, com as mesmas quantidades e valores nutricionais, para a refeição e o dia escolhidos. Os itens já existentes no destino são mantidos.
- Cada item copiado recebe um novo identificador e é sincronizado com a nuvem pelo mesmo caminho dos itens adicionados manualmente (`entry.add`).
- Um aviso confirma quantos itens foram copiados e para qual dia.
- Nova versão do app (1.8.0), com atualização do `README.md`.

## Capabilities

### New Capabilities
- `meal-repeat`: copiar os alimentos de uma refeição para outra refeição, no mesmo dia ou em outro dia.

### Modified Capabilities

## Impact

- `index.html`: botão no cartão da refeição, folha (sheet) de escolha do dia, ação de cópia, constante `VERSAO` e hash SHA-256 da CSP.
- `sw.js`: constante `VERSAO`.
- `README.md`: versão atual, "Novo na 1.8.0" e histórico.
- Sem novas dependências, tabelas ou alterações no banco; reutiliza a operação `entry.add` da fila de sincronização.
