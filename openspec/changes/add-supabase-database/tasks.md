## 1. Projeto Supabase e banco de dados

- [x] 1.1 Criar um projeto Supabase novo para o EmagrecAI (não reutilizar o projeto `listae`) e anotar URL e chave publicável
- [x] 1.2 Criar `supabase/migrations/<timestamp>_create_emagrecai_schema.sql` com as tabelas `profiles`, `food_entries`, `water_logs`, `weight_logs` e `custom_foods`, chaves, `CHECK` e índice `food_entries (user_id, day)` (design, decisão 3)
- [x] 1.3 Na mesma migração, habilitar RLS em todas as tabelas, criar as políticas de `select`, `insert`, `update` e `delete` para `authenticated` com `(select auth.uid()) = user_id`, e revogar o acesso do papel `anon` (design, decisão 4)
- [x] 1.4 Aplicar a migração no projeto e conferir com `list_tables` que a RLS está ativa nas cinco tabelas
- [x] 1.5 Rodar `get_advisors` (security e performance) e corrigir qualquer alerta de RLS ou índice
- [x] 1.6 Testar o isolamento com dois usuários: A não lê, não insere e não altera linhas de B, e a chave publicável sem sessão não lê nem grava nada

## 2. Login com Google (Supabase Auth)

- [ ] 2.1 Criar o OAuth Client no Google Cloud e ativar o provedor Google no painel do Supabase (o Client Secret fica só no painel)
- [ ] 2.2 Cadastrar as Redirect URLs (`http://localhost:<porta>` e o domínio hospedado, quando existir) em *Authentication → URL Configuration*
- [x] 2.3 Adicionar ao HTML as constantes `SUPABASE_URL`, `SUPABASE_KEY` e `VERSAO="1.1.0"`, e o script `@supabase/supabase-js` com versão fixa, `integrity` (SRI) e `crossorigin`
- [x] 2.4 Criar o cliente com `flowType:"pkce"`, `persistSession`, `autoRefreshToken` e `detectSessionInUrl`, tratando biblioteca ausente, configuração vazia e `file://` como "Login indisponível"
- [x] 2.5 Implementar `onAuthStateChange` sem chamadas ao Supabase dentro do callback (usar `setTimeout(..., 0)`), tratando `INITIAL_SESSION`, `SIGNED_IN` e `SIGNED_OUT`
- [x] 2.6 Implementar entrar (`signInWithOAuth`) e sair (`signOut`), com mensagem em pt-BR quando o login falhar ou for cancelado e limpeza dos parâmetros de erro da URL
- [x] 2.7 Implementar `pratocheio:ultimo` com validação de `user_id` em formato UUID e a primeira renderização a partir do cache da conta, voltando ao visitante se não houver sessão

## 3. Camada de persistência e sincronização

- [x] 3.1 Dar `id` (`crypto.randomUUID()`) às entradas de alimento e aos alimentos personalizados, aceitando dados antigos sem `id`
- [x] 3.2 Escrever as funções de conversão entre linhas do banco e o estado `S` (e o inverso), em um bloco único e comentado
- [x] 3.3 Implementar `load()`/`save()` por contexto: visitante em `pratocheio` (sem mudança) e conta em `pratocheio:<user_id>`, com `try/catch` no acesso ao `localStorage`
- [x] 3.4 Implementar `persist(op)` e a fila `pratocheio:fila:<user_id>` com as operações `entry.add`, `entry.del`, `water.set`, `weight.set`, `profile.set`, `food.add` e `data.reset`, todas idempotentes
- [x] 3.5 Implementar `flush()` em ordem, parando em erro de rede, descartando com aviso as operações rejeitadas por erro definitivo e disparando no `online`, na abertura e após cada operação
- [x] 3.6 Implementar a leitura completa do banco com paginação por `range()` de 1000 linhas e a substituição de `S` e do cache da conta
- [x] 3.7 Recarregar os dados no `visibilitychange`, no máximo a cada 30 segundos, enviando a fila antes de ler
- [x] 3.8 Trocar as chamadas `save()` nos handlers (adicionar e remover alimento, água, peso, perfil, novo alimento) pelas operações nomeadas, sem mudar a interface do diário

## 4. Modo visitante, importação e "Apagar dados"

- [x] 4.1 Garantir que o modo visitante nunca faz requisição de dados e que `pratocheio` não é alterada por login, logout ou importação
- [x] 4.2 Implementar a importação opcional (`confirm`) no primeiro login com conta sem linhas e `pratocheio` com dados, gerando `id` para as entradas antigas e usando a fila
- [x] 4.3 Ajustar "Apagar todos os dados" por contexto, com mensagem informando qual será apagado: visitante reinicia `pratocheio`; conta apaga as linhas das cinco tabelas, limpa cache e fila e enfileira `data.reset` se estiver sem conexão

## 5. Interface

- [x] 5.1 Criar o card "Conta" no topo de `profile()` com botão "Entrar com Google" (logo oficial, pt-BR), nome, e-mail, foto ou iniciais, estado ("Sincronizado", "N alterações pendentes", "Sem conexão") e botão "Sair"
- [x] 5.2 Escapar nome e e-mail com `esc()` e aceitar a foto apenas se for `https:` com host terminado em `googleusercontent.com`
- [x] 5.3 Ajustar o texto do card "Dados" ("Tudo fica salvo apenas neste navegador") para refletir visitante x conta
- [x] 5.4 Exibir a versão `1.1.0` no rodapé do Perfil
- [x] 5.5 Aplicar os estilos novos com as variáveis CSS e o tema escuro existentes, e revisar a ortografia pt-BR dos textos novos

## 6. Documentação

- [x] 6.1 Criar o `README.md` com descrição, como executar em `http://localhost`, criação do projeto Supabase, aplicação das migrações, configuração do Google e das Redirect URLs, aviso de que os dados de saúde ficam no Supabase, escopo de segurança e histórico de versões (1.0.0 e 1.1.0)
- [x] 6.2 Confirmar que o repositório não contém `service_role`, Client Secret do Google nem tokens

## 7. Verificação

- [x] 7.1 Visitante: abrir a nova versão com dados existentes em `pratocheio` e confirmar que tudo aparece igual e que não há requisições ao Supabase
- [ ] 7.2 Login: entrar com Google, conferir nome, foto e e-mail, recarregar a página e confirmar que a sessão continua
- [x] 7.3 Importação: aceitar e recusar o envio dos dados do visitante e conferir as linhas no banco sem duplicatas; `pratocheio` intacta nos dois casos
- [x] 7.4 Sincronização: registrar um alimento em um dispositivo e vê-lo em outro ao voltar à aba, sem recarregar
- [x] 7.5 Offline: gravar sem conexão, ver "N alterações pendentes", reconectar e ver "Sincronizado" sem duplicar linhas
- [x] 7.6 Operação inválida: forçar uma linha que viola um `CHECK` e confirmar o aviso e a continuidade da fila
- [x] 7.7 Duas contas no mesmo navegador: sair de A, entrar em B e confirmar que só os dados de B aparecem
- [ ] 7.8 Apagar dados: testar como visitante e logado (online e offline) e confirmar que apenas o contexto ativo é afetado e que a sessão continua
- [ ] 7.9 Falhas: bloquear o script do Supabase e abrir por `file://`, confirmando "Login indisponível" e o app utilizável em modo visitante
- [x] 7.10 Conferir a ortografia pt-BR da interface, o tema escuro e o console do navegador sem erros
- [x] 7.11 Redigir o resumo das alterações em pt-BR para a descrição do commit
