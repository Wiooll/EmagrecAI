## 1. Interface

- [x] 1.1 Adicionar o botão "Repetir" no cartão da refeição em `render()`, visível só quando houver itens
- [x] 1.2 Criar a folha de destino: escolha da refeição (quatro opções, origem como padrão), escolha do dia ("Este dia", "Dia seguinte" e campo de data) e botão "Copiar"
- [x] 1.3 Desabilitar "Copiar" e exibir o motivo quando o destino for igual à origem
- [x] 1.4 Adicionar estilos reaproveitando as classes existentes, conferindo a ortografia pt-br

## 2. Lógica

- [x] 2.1 Implementar a ação que valida refeição (`MEALS`) e dia (`DAY`), bloqueia destino igual à origem e copia os itens com `uid()` novo
- [x] 2.2 Chamar `commit("entry.add", ...)` para cada item copiado, fechar a folha, renderizar e exibir `toast()`

## 3. Versão e documentação

- [x] 3.1 Atualizar `VERSAO` para 1.8.0 em `index.html` e `sw.js`
- [x] 3.2 Recalcular o hash SHA-256 do script inline e atualizar o `script-src` da CSP
- [x] 3.3 Atualizar o `README.md` (versão atual, "Novo na 1.8.0" e histórico)

## 4. Validação

- [x] 4.1 Em `http://localhost:8000`, repetir uma refeição para outra refeição do mesmo dia e conferir itens, totais e remoção
- [x] 4.2 Repetir para uma refeição de outro dia e conferir itens e totais nesse dia
- [x] 4.3 Conferir o console sem erros e o cache `emagrecai-1.8.0` criado
- [x] 4.4 Gerar o resumo das alterações para o commit, em pt-br
