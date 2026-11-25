## 1. Favoritos e recentes

- [x] 1.1 Criar a chave `pratocheio:favoritos` e as funções de leitura com validação (tipos, tamanhos, faixas, máximo de 50) e de gravação, identificando o alimento por `norm(n)`
- [x] 1.2 Criar a função que monta os recentes a partir de `S.log` (até 15 alimentos distintos, dias do mais novo ao mais antigo, ignorando `g` ≤ 0), reconstruindo os valores por 100 g e a unidade pelo alimento de mesmo nome em `S.custom`, `FOODS` e `TACO`
- [x] 1.3 Alterar `list("")` e `drawSheet()` para mostrar as seções "Favoritos" e "Recentes" antes da lista padrão (sem repetir favoritos nos recentes, omitindo seção vazia), mantendo `window._r` e os índices de `data-i` consistentes
- [x] 1.4 Adicionar o botão ☆/★ na tela de detalhe do alimento (`aria-pressed` e rótulo), com a ação no listener de cliques e atualização do botão sem perder a quantidade digitada
- [ ] 1.5 Conferir o layout em 320 px e nos temas claro e escuro

## 2. Constância e resumo da semana

- [x] 2.1 Criar a função de dia registrado (`tot(k).k > 0`) e as funções de sequência atual (começando em ontem se hoje estiver vazio) e melhor sequência
- [x] 2.2 Criar a função de resumo de uma janela de 7 dias (média de kcal, dias na meta, dias registrados, variação de peso, dias com meta de água), reaproveitando `tot()` e a lógica de `resumoMes()`
- [x] 2.3 Criar os cards "Constância" e "Resumo da semana" e incluí-los em `progress()`, com estado vazio, comparação com os 7 dias anteriores só quando as duas janelas têm dados e aviso sobre as metas atuais
- [x] 2.4 Escapar com `esc()` e formatar com `fmt()` e `f1()` os valores exibidos, e conferir o português da interface

## 3. Exportar dados (CSV)

- [x] 3.1 Criar a função que monta o CSV a partir de `S` (cabeçalho, linhas `alimento`, `agua` e `peso`, ordenadas por data, `;`, ponto decimal, BOM)
- [x] 3.2 Criar o escape de campos: aspas duplas com duplicação, e apóstrofo antes de `=`, `+`, `-`, `@`, tabulação e retorno de carro
- [x] 3.3 Adicionar o botão "Exportar dados (CSV)" no card "Dados" e a ação que entrega o arquivo por compartilhamento ou download (extrair o auxiliar de `lembExportar()` sem mudar o comportamento dos lembretes), com aviso quando não há dados e tratamento de `AbortError`
- [ ] 3.4 Testar com nome de alimento contendo `=`, aspas, `;` e quebra de linha, e abrir o arquivo no Excel ou no LibreOffice

## 4. Excluir conta

- [x] 4.1 Criar `supabase/functions/excluir-conta/index.ts`: só `POST`, CORS por `ORIGENS_PERMITIDAS` (mesmo padrão de `consultar-codigo`), validação do token com `auth.getUser`, `auth.admin.deleteUser` do `id` do token, códigos `nao_autenticado`, `origem_nao_permitida` e `servico_indisponivel`, sem detalhes internos nas respostas
- [x] 4.2 Adicionar `[functions.excluir-conta]` com `verify_jwt = false` e o comentário explicativo ao `supabase/config.toml`
- [x] 4.3 Criar no app a função `excluirConta()`: exigir login e conexão, mostrar o texto de aviso e pedir a digitação de `EXCLUIR`, proteger contra toques repetidos e chamar a função com `Authorization: Bearer` (token da sessão) e `apikey`
- [x] 4.4 Em caso de sucesso, descartar a fila, apagar `pratocheio:<id>`, a fila e a recusa de importação, encerrar a sessão local (`signOut` com escopo local), voltar ao modo visitante e avisar; em caso de erro, manter tudo e mostrar mensagem por código
- [x] 4.5 Adicionar o botão "Excluir conta" (visual de perigo) ao card "Conta", só com login; extrair a limpeza local compartilhada com `logout()` sem mudar o comportamento de "Sair"
- [ ] 4.6 Publicar a função (`supabase functions deploy excluir-conta`), confirmar `ORIGENS_PERMITIDAS` e testar com uma conta Google de teste: exclusão, token inválido, origem não permitida e sem internet

## 5. Publicar a versão 1.11.0

- [x] 5.1 Atualizar `VERSAO` para `1.11.0` no `index.html` e no `sw.js` (valores iguais)
- [x] 5.2 Recalcular o hash SHA-256 do script inline e atualizar o `script-src` da CSP (comando na seção "Segurança e privacidade" do README)
- [x] 5.3 Atualizar o `README.md`: versão atual, "Novo na 1.11.0", histórico, seção de segurança (remover "não há exclusão de conta pelo app" e documentar exportação e exclusão), publicação da função `excluir-conta` e estrutura do projeto
- [x] 5.4 Revisar a ortografia em português do Brasil de todos os textos novos da interface

## 6. Verificação

- [x] 6.1 Abrir em `http://localhost:8000` e confirmar que o console não mostra erros e que o cache `emagrecai-1.11.0` foi criado
- [x] 6.2 Testar favoritos e recentes: favoritar, remover, limite de 50, alimento de código de barras, busca digitada e dados corrompidos no `localStorage`
- [x] 6.3 Testar constância e resumo: sem dados, hoje vazio com ontem registrado, sequência quebrada, uma só pesagem e comparação entre janelas
- [ ] 6.4 Testar a exportação no modo visitante, com conta, sem internet e no celular (compartilhar e baixar)
- [ ] 6.5 Testar o fluxo de exclusão de ponta a ponta e confirmar no painel do Supabase que o usuário e as linhas de dados sumiram
- [x] 6.6 Gerar o resumo das alterações em português do Brasil para a descrição do commit
