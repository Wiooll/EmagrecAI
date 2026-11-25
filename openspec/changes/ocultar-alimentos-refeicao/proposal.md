## Why

Na aba Diário, cada refeição lista todos os alimentos adicionados. Com muitos itens, a tela fica longa e o usuário precisa rolar muito para chegar às refeições seguintes e à água. Falta uma forma de recolher essa lista.

## What Changes

- Cada cartão de refeição (Café da manhã, Almoço etc.) ganha um botão para ocultar e mostrar a lista de alimentos adicionados.
- Com a lista oculta, o cartão continua exibindo o nome da refeição, o total de kcal e o botão "+".
- O estado (oculto ou visível) fica salvo só neste aparelho, por refeição, e vale para todos os dias.
- Padrão: lista visível, como hoje.
- Nenhuma mudança nos dados registrados nem no banco de dados (Supabase).
- Nova versão do app (1.8.0), com atualização de `README.md`, `sw.js` e da CSP.

## Capabilities

### New Capabilities
- `meal-entries-collapse`: botão por refeição para ocultar e mostrar a lista de alimentos adicionados na aba Diário, com a preferência salva no aparelho.

### Modified Capabilities
<!-- Nenhuma: os requisitos das capacidades existentes não mudam. -->

## Impact

- `index.html`: função `diary()` (cartão da refeição), estilos do botão, tratamento do clique em `data-a`, nova chave em `localStorage`, constante `VERSAO` e hash da CSP.
- `sw.js`: constante `VERSAO`.
- `README.md`: versão atual, "Novo na 1.8.0" e histórico.
- Sem novas dependências e sem mudança de API.
