## 1. Edição de lançamento no diário

- [ ] 1.1 Exibir o botão "Editar" ao lado de "Excluir" em cada lançamento com `g` > 0, com `data-a="edit"`, `data-m` e `data-i`
- [ ] 1.2 Criar função que monta o `food` temporário (valores por 100 g derivados de `k/g*100`) e a medida inicial a partir do lançamento
- [ ] 1.3 Adaptar `drawSheet` para o modo edição (`sh.edit`): abrir direto na tela de quantidade, sem botão "Voltar", com o botão "Salvar alterações"
- [ ] 1.4 Implementar a ação `saveedit`: validar quantidade > 0, atualizar o lançamento no mesmo índice mantendo `id` (gerar `uid()` se faltar) e chamar `commit("entry.add", ...)`
- [ ] 1.5 Fechar a janela e renderizar de novo; garantir que fechar sem salvar não altera nada

## 2. Edição de alimento personalizado

- [ ] 2.1 Mostrar o botão "Editar" nos itens de `S.custom` na lista de busca, sem acionar o `pick` ao tocar nele
- [ ] 2.2 Reaproveitar o formulário "Novo alimento" preenchido (`sh.editFood`) com o botão "Salvar alterações"
- [ ] 2.3 Implementar o salvamento: validar nome, atualizar o item em `S.custom` mantendo o `id` e chamar `commit("food.add", ...)`
- [ ] 2.4 Confirmar que os lançamentos antigos do diário não mudam

## 3. Versão e documentação

- [ ] 3.1 Atualizar `VERSAO` para `1.5.0` no `index.html` e no `sw.js`
- [ ] 3.2 Recalcular o hash SHA-256 do script inline e atualizar o `script-src` da CSP (comando na seção "Segurança e privacidade" do `README.md`)
- [ ] 3.3 Atualizar o `README.md`: versão atual, "Novo na 1.5.0" e histórico
- [ ] 3.4 Revisar a ortografia em pt-BR dos textos novos da interface

## 4. Verificação

- [ ] 4.1 Abrir em `http://localhost:8000`: console sem erros e cache `emagrecai-1.5.0` criado
- [ ] 4.2 Testar editar quantidade (unidade e gramas), valor inválido e totais do dia
- [ ] 4.3 Testar editar alimento personalizado e confirmar que lançamentos antigos ficam iguais
- [ ] 4.4 Testar logado (com e sem internet, conferindo a sincronização sem duplicata) e como visitante
- [ ] 4.5 Gerar o resumo das alterações para a descrição do commit, em pt-BR
