## Why

O app registra alimentos, água e peso, mas não há onde guardar observações gerais sobre o acompanhamento (orientações do nutricionista, o que funciona ou não, lembretes pessoais). Esse texto não pertence a um dia específico, e por isso fica fixo na aba Progresso.

## What Changes

- Novo card "Anotações" na aba Progresso, com um único campo de texto livre (até 2000 caracteres, com contador) e o botão "Salvar anotações". O mesmo texto aparece sempre, em qualquer dia.
- Salvar com o campo vazio apaga o texto.
- Com conta, o texto é sincronizado com o Supabase (nova tabela `user_notes`, uma linha por usuário), pela mesma fila offline usada pelo peso e pela água. No modo visitante fica só no aparelho.
- "Apagar dados" passa a incluir as anotações.
- Atualização de versão (`VERSAO` em `index.html` e `sw.js`), hash da CSP e README.

Nenhuma mudança é incompatível com versões anteriores. A migração apenas cria uma tabela nova. O Diário não muda.

## Capabilities

### New Capabilities
- `user-notes`: campo fixo de anotações na aba Progresso, com persistência local e sincronização com a conta.

### Modified Capabilities
<!-- Nenhuma: o comportamento de requisitos existentes não muda. -->

## Impact

- `index.html`: estado (`def`, `fromDB`), função `progress`, tratamento de eventos, `commit`/`run`/`wipe` e CSS. O script inline muda, então o hash da CSP precisa ser recalculado.
- `supabase/migrations/`: nova migração criando `public.user_notes` com RLS.
- `sw.js`: apenas a constante `VERSAO`.
- `README.md`: funcionalidade "Novo na x.y.z" e histórico de versões.
- Fora do escopo: anotações por dia ou por refeição, várias anotações, busca, exportação e formatação do texto.
