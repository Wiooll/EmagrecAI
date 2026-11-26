## Context

O estado do app fica em `S` (`S.log`, `S.water`, `S.weights`, `S.custom`, `S.p`), salvo em `localStorage` por `save()`. Com conta, `commit(tipo, fn)` também enfileira a gravação e envia ao Supabase. `fromDB()` reconstrói `S` a partir das tabelas e `wipe()` apaga os dados do usuário. Na aba Progresso, `progress()` já tem o campo "Peso de hoje" com botão "Salvar peso" (ação `savew`), que serve de modelo.

## Goals / Non-Goals

**Goals:**
- Um único campo de texto fixo na aba Progresso, igual em todos os dias.
- Funcionar no modo visitante e com conta, inclusive offline.
- Reaproveitar a fila de gravações, sem mecanismo novo.

**Non-Goals:**
- Anotações por dia ou por refeição, várias anotações, busca, exportação, formatação do texto.

## Decisions

1. **Estado `S.notes = "texto"` (string).** `def()` ganha `notes:""`, e `load()` já mescla com `def()`, então dados antigos continuam válidos. Valores que não são texto são ignorados e limitados a 2000 caracteres na leitura.

2. **Tabela própria `public.user_notes (user_id primary key, note, updated_at)`.** `note` com `check (char_length(note) between 1 and 2000)`, RLS e privilégios iguais aos das demais tabelas (somente `authenticated`, `auth.uid() = user_id`). Alternativa descartada: coluna em `profiles`, porque `savep` regrava o perfil inteiro a partir do formulário e `fromDB` monta `S.p` só com os campos conhecidos, o que apagaria o texto sem querer.

3. **Salvar por botão, como o peso.** O card tem `textarea` e o botão "Salvar anotações" (ação `savenote`), que chama `commit("note.set", ...)` e mostra o aviso "Anotações salvas". Alternativa descartada: salvar ao sair do campo, porque o `render()` da aba Progresso poderia apagar um texto não salvo; com botão o comportamento é igual ao do peso. Em `run`, `note.set` faz `upsert` em `user_notes` (`onConflict:"user_id"`). Texto vazio vira `note.del`, que apaga a linha, pois a coluna não aceita vazio. `commit` já mantém só a última gravação do mesmo tipo quando `d` não é lista, então basta incluir `note.set` e `note.del` na lista de tipos que ele deduplica.

4. **Validação.** O texto é limpo com `txt(s, 2000)` antes de salvar e de enviar. O campo tem `maxlength="2000"`. A renderização usa `esc()`.

5. **`fromDB`, `wipe` e migração.** `fromDB` recebe a linha de `user_notes` e preenche `S.notes`. A consulta inicial ganha mais uma tabela. `wipe` inclui `user_notes`. A migração de dados de visitante para conta envia também o texto, se a conta ainda não tiver anotações.

6. **Interface.** Card "Anotações" depois do card de peso, com rótulo associado, contador "x/2000" atualizado no evento `input` sem renderizar de novo e texto de apoio "Observações gerais sobre o seu acompanhamento". Legível nos temas claro e escuro e em 320 px.

## Risks / Trade-offs

- [Texto digitado e não salvo se o usuário trocar de aba] → O padrão é o mesmo do peso; o botão deixa claro que é preciso salvar.
- [Duas edições em aparelhos diferentes] → Vale a última gravação; o texto é único, como as demais configurações.
- [App novo sem a tabela criada] → A migração é aplicada antes de publicar o app; sem a tabela, a gravação falha, permanece na fila e o texto local não se perde.
- [Dado pessoal na nuvem] → RLS por usuário, limite de 2000 caracteres, sem log do conteúdo, inclusão em "Apagar dados".
- [Hash da CSP] → O script inline muda, então o hash precisa ser recalculado, senão o app deixa de abrir.
