## 1. Estado da preferência

- [x] 1.1 Criar em `index.html` funções para ler e gravar a lista de refeições ocultas em `localStorage` (`emagrecai-refeicoes-ocultas`), validando JSON e ids contra `MEALS`
- [x] 1.2 Criar a ação que alterna o estado de uma refeição e renderiza de novo o Diário

## 2. Interface

- [x] 2.1 Em `diary()`, adicionar o botão de ocultar/mostrar no `.meal-h` (só com alimentos), com `aria-expanded` e `aria-label` em pt-BR
- [x] 2.2 Ocultar a lista `.ent` quando a refeição estiver oculta e mostrar "N itens" no cabeçalho
- [x] 2.3 Tratar o clique do novo `data-a` no manipulador de eventos existente
- [x] 2.4 Reexibir a refeição ao adicionar um alimento a ela
- [x] 2.5 Ajustar o CSS do botão (seta ▾/▸), mantendo o padrão visual atual

## 3. Publicação da versão 1.9.0

- [x] 3.1 Atualizar `VERSAO` em `index.html` e `sw.js` para 1.9.0
- [x] 3.2 Recalcular o hash SHA-256 do script inline e atualizar a CSP (comando no `README.md`)
- [x] 3.3 Atualizar o `README.md`: versão atual, "Novo na 1.9.0" e histórico
- [x] 3.4 Gerar o resumo das alterações para a descrição do commit em pt-BR

## 4. Validação

- [x] 4.1 Abrir `http://localhost:8000`: console sem erros e cache `emagrecai-1.9.0` criado
- [x] 4.2 Conferir os cenários da spec: ocultar, mostrar, persistir ao reabrir, trocar de dia, refeição vazia, adicionar a refeição oculta e JSON corrompido
