## 1. Favoritos e recentes

- [x] 1.1 Criar a chave `pratocheio:favoritos` e as funções de leitura com validação (tipos, tamanhos, faixas, máximo de 50) e de gravação, identificando o alimento por `norm(n)`
- [x] 1.2 Criar a função que monta os recentes a partir de `S.log` (até 15 alimentos distintos, dias do mais novo ao mais antigo, ignorando `g` ≤ 0), reconstruindo os valores por 100 g e a unidade pelo alimento de mesmo nome em `S.custom`, `FOODS` e `TACO`
- [x] 1.3 Alterar `list("")` e `drawSheet()` para mostrar as seções "Favoritos" e "Recentes" antes da lista padrão (sem repetir favoritos nos recentes, omitindo seção vazia), mantendo `window._r` e os índices de `data-i` consistentes
- [x] 1.4 Adicionar o botão ☆/★ na tela de detalhe do alimento (`aria-pressed` e rótulo), com a ação no listener de cliques e atualização do botão sem perder a quantidade digitada
- [x] 1.5 Conferir o layout em 320 px e nos temas claro e escuro

## 2. Constância e resumo da semana

- [x] 2.1 Criar a função de dia registrado (`tot(k).k > 0`) e as funções de sequência atual (começando em ontem se hoje estiver vazio) e melhor sequência
- [x] 2.2 Criar a função de resumo de uma janela de 7 dias (média de kcal, dias na meta, dias registrados, variação de peso, dias com meta de água), reaproveitando `tot()` e a lógica de `resumoMes()`
- [x] 2.3 Criar os cards "Constância" e "Resumo da semana" e incluí-los em `progress()`, com estado vazio, comparação com os 7 dias anteriores só quando as duas janelas têm dados e aviso sobre as metas atuais
- [x] 2.4 Escapar com `esc()` e formatar com `fmt()` e `f1()` os valores exibidos, e conferir o português da interface

## 3. Exportar dados (CSV)

- [x] 3.1 Criar a função que monta o CSV a partir de `S` (cabeçalho, linhas `alimento`, `agua` e `peso`, ordenadas por data, `;`, ponto decimal, BOM)
- [x] 3.2 Criar o escape de campos: aspas duplas com duplicação, e apóstrofo antes de `=`, `+`, `-`, `@`, tabulação e retorno de carro
- [x] 3.3 Adicionar o botão "Exportar dados (CSV)" no card "Dados" e a ação que entrega o arquivo por compartilhamento ou download (extrair o auxiliar de `lembExportar()` sem mudar o comportamento dos lembretes), com aviso quando não há dados e tratamento de `AbortError`
- [x] 3.4 Testar com nome de alimento contendo `=`, aspas, `;` e quebra de linha, e abrir o arquivo no Excel ou no LibreOffice

## 4. Exclusão de conta (adiada)

- [x] 4.1 Removida a exclusão de conta a pedido do usuário: botão, função `excluirConta`, função `excluir-conta` do Supabase, entrada no `config.toml`, texto do README e especificações. A versão 1.11.0 a incluía; a 1.11.1 a retira.

## 5. Publicar a versão 1.11.1

- [x] 5.1 Atualizar `VERSAO` para `1.11.1` no `index.html` e no `sw.js` (valores iguais)
- [x] 5.2 Recalcular o hash SHA-256 do script inline e atualizar o `script-src` da CSP
- [x] 5.3 Atualizar o `README.md`: versão atual, "Novo na 1.11.1", histórico, seção de segurança e estrutura do projeto
- [x] 5.4 Revisar a ortografia em português do Brasil de todos os textos novos da interface

## 6. Verificação

- [x] 6.1 Abrir em `http://localhost:8000` e confirmar que o console não mostra erros e que o cache `emagrecai-1.11.1` foi criado
- [x] 6.2 Testar favoritos e recentes: favoritar, remover, limite de 50, alimento de código de barras, busca digitada e dados corrompidos no `localStorage`
- [x] 6.3 Testar constância e resumo: sem dados, hoje vazio com ontem registrado, sequência quebrada, uma só pesagem e comparação entre janelas
- [x] 6.4 Testar a exportação no modo visitante, com conta, sem internet e no celular (compartilhar e baixar)
- [x] 6.5 Gerar o resumo das alterações em português do Brasil para a descrição do commit
