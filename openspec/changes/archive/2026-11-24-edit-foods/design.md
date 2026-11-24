## Context

O app é um único `index.html` (PWA) com estado `S` em memória e `localStorage`. Alterações vão para o Supabase por uma fila (`commit(tipo, fn)`) processada por `run()`, que usa upsert por `id` para `entry.add` e `food.add`. A exclusão de lançamento usa `entry.del`. Os lançamentos do diário (`S.log[dia][refeição]`) guardam `{id, n, g, q, k, c, p, f}`: já com valores totais para a porção, sem referência ao alimento de origem.

## Goals / Non-Goals

**Goals:**
- Corrigir a quantidade de um lançamento sem excluir e relançar.
- Corrigir um alimento personalizado.
- Reutilizar a fila e os upserts existentes, sem mudar o banco.

**Non-Goals:**
- Editar alimentos da base fixa (`FOODS`).
- Mover um lançamento de refeição ou de dia.
- Reescrever lançamentos antigos quando um alimento personalizado muda.
- Editar o nome de um lançamento.

## Decisions

1. **Editar lançamento reaproveitando a janela de quantidade.** A janela atual (`sh.food`) já tem quantidade, medida e pré-visualização. Em modo edição (`sh.edit={m,i}`), ela abre direto nessa tela, com o botão "Salvar alterações" no lugar de "Adicionar". Alternativa descartada: criar uma tela nova (duplica código).
2. **Valores por 100 g derivados do lançamento.** Para reescalar, usa-se `k/g*100` (e igual para c, p, f), montando um `food` temporário com a unidade vinda de `q` quando possível; caso contrário, a medida inicial é gramas. Alternativa descartada: guardar `food_id` no lançamento (exige migração).
3. **Persistência.** Ao salvar, atualiza-se o item no mesmo índice, mantendo o `id`, e chama-se `commit("entry.add", ...)`, que faz upsert. Se o lançamento não tiver `id` (dados antigos de visitante), gera-se um `uid()` e o lançamento passa a existir no banco como novo, sem deixar duplicata, pois nunca foi sincronizado.
4. **Editar alimento personalizado.** A lista de busca mostra um botão "Editar" apenas nos itens de `S.custom`. Ele abre a aba "Novo alimento" preenchida (`sh.editFood=id`) com o botão "Salvar alterações". Salva com `commit("food.add", ...)` usando o mesmo `id`. O mesmo formulário é reaproveitado, sem duplicação.
5. **Validação.** Quantidade deve ser > 0 e finita. Texto é escapado com `esc()` ao renderizar. Valores numéricos negativos são recusados e limitados com `cl()` como no restante do app. O nome é obrigatório.
6. **Sem novo script inline fora do padrão.** A mudança altera o script inline, então o hash SHA-256 da CSP deve ser recalculado.

## Risks / Trade-offs

- [Arredondamento ao derivar valores por 100 g] → diferença desprezível; manter `fmt`/`f1` na exibição.
- [Lançamento com `g` = 0] → o botão editar não é exibido.
- [Fila offline com `entry.add` repetido para o mesmo `id`] → upsert é idempotente; a última edição prevalece.
- [Esquecer de atualizar CSP ou `sw.js`] → o app deixa de abrir ou não avisa a nova versão; coberto nas tarefas.
