## Context

O app é um PWA em um único `index.html`. Os registros ficam em `S.log[dia][refeição]` (lista de itens `{id,n,g,q,k,c,p,f}`). Cada inclusão chama `commit("entry.add", () => rowEntry(m, dia, e))`, que grava localmente e enfileira a sincronização com a nuvem. A tela do diário é desenhada em `render()` (cartões por refeição) e as folhas modais usam o elemento `#sheet` com o estado `sh`.

## Goals / Non-Goals

**Goals:**
- Copiar uma refeição inteira para qualquer refeição do mesmo dia ou de outro dia, com poucos toques.
- Funcionar offline e sincronizar como qualquer outra inclusão.

**Non-Goals:**
- Repetição automática ou recorrente.
- Copiar a água ou o dia inteiro.

## Decisions

- **Origem**: a refeição do cartão tocado, no dia exibido.
- **Destino**: refeição + dia. A folha mostra as quatro refeições (`MEALS`) como opções, com a refeição de origem como padrão, e a escolha do dia: "Este dia" (o dia exibido) e "Dia seguinte", mais `<input type="date">`. O padrão é o dia exibido, então o primeiro uso comum (copiar para outra refeição do mesmo dia) exige só escolher a refeição.
- **Destino igual à origem**: quando refeição e dia são os mesmos da origem, o botão "Copiar" fica bloqueado e a folha explica o motivo, para evitar duplicar a refeição sobre ela mesma sem querer.
- **Validação**: a refeição de destino precisa existir em `MEALS` e o dia precisa passar na regex `DAY` já existente.
- **Cópia**: criar novos itens com `{...e, id: uid()}` e adicionar ao final da lista do destino, sem apagar o que já existe. Cada item passa por `commit("entry.add", ...)`, reaproveitando a fila de sincronização. Não há mudança no banco. A lista de origem é copiada antes do loop, para não ser afetada quando origem e destino forem o mesmo dia.
- **Itens sem gramas** (`g` igual a 0, que não podem ser editados) são copiados normalmente.
- **Feedback**: `toast()` com a quantidade de itens, a refeição e o dia. A tela permanece no dia exibido.
- **Segurança**: dia e refeição vêm de inputs e são validados antes de gravar. Nomes continuam escapados por `esc()` ao exibir.

## Risks / Trade-offs

- Repetir duas vezes para o mesmo destino duplica os itens → o aviso informa a quantidade copiada e o usuário pode remover com "×". Sem bloqueio, para manter a simplicidade.
- O CSP usa hash do script inline → é preciso recalcular o hash após a alteração (regra do projeto).
- O botão só aparece quando há itens, para não poluir cartões vazios.
