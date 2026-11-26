## 1. Banco de dados

- [x] 1.1 Criar a migração `supabase/migrations/<data>_create_user_notes.sql` com `public.user_notes (user_id primary key, note, updated_at)`, `check` de 1 a 2000 caracteres, RLS e políticas como as das demais tabelas, e privilégios só para `authenticated`
- [x] 1.2 Aplicar a migração no projeto Supabase antes de publicar o app e conferir os avisos de segurança (advisors)

## 2. Estado e sincronização

- [x] 2.1 Adicionar `notes:""` em `def()` e validar `S.notes` em `load()` (texto de até 2000 caracteres)
- [x] 2.2 Incluir `user_notes` na leitura de `fromDB()` e na consulta inicial de dados da conta
- [x] 2.3 Adicionar `note.set` (upsert por `user_id`) e `note.del` em `run()`, e os dois tipos na regra de `commit()` que mantém só a última alteração
- [x] 2.4 Incluir `user_notes` em `wipe()` e o texto do visitante na migração para a conta (só se a conta não tiver anotações)

## 3. Interface (aba Progresso)

- [x] 3.1 Criar a função do card "Anotações" e incluí-la em `progress()` depois do card de peso: `textarea` (rótulo, `maxlength="2000"`, contador, texto de apoio) e botão "Salvar anotações", usando `esc()` no conteúdo
- [x] 3.2 Tratar a ação `savenote` no listener de cliques (`txt(valor, 2000)`, vazio remove, aviso "Anotações salvas") e o evento `input` para atualizar o contador sem renderizar de novo
- [ ] 3.3 Ajustar o CSS do `textarea` e do contador nos temas claro e escuro e em 320 px
- [x] 3.4 Conferir o português da interface

## 4. Versão e documentação

- [x] 4.1 Atualizar `VERSAO` para 1.12.0 em `index.html` e `sw.js` (valores iguais)
- [x] 4.2 Recalcular o hash SHA-256 do script inline e atualizar o `script-src` da CSP (comando na seção "Segurança e privacidade" do `README.md`)
- [x] 4.3 Atualizar o `README.md`: versão atual, "Novo na 1.12.0", tabela `user_notes` e histórico de versões
- [x] 4.4 Gerar o resumo das alterações para o commit, em português do Brasil

## 5. Verificação

- [x] 5.1 Abrir `http://localhost:8000`, conferir que o console não mostra erros e que o cache `emagrecai-1.12.0` foi criado
- [ ] 5.2 Testar: salvar, apagar, texto com HTML, limite de 2000, modo visitante, conta offline e sincronização em outro aparelho
