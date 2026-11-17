## 1. Armazenamento por contexto

- [ ] 1.1 Adicionar `const VERSAO="1.1.0"` e `const GOOGLE_CLIENT_ID=""` no topo do script
- [ ] 1.2 Criar `storageKey()` que devolve `pratocheio` (visitante) ou `pratocheio:<sub>` (conta)
- [ ] 1.3 Alterar `load()` e `save()` para usar `storageKey()`, mantendo o tratamento de erro do `localStorage`
- [ ] 1.4 Ajustar o `reset` para apagar só o contexto ativo e informar o contexto na mensagem do `confirm()`

## 2. Sessão e validação do token

- [ ] 2.1 Criar `loadSession()` que lê `pratocheio:sessao` e valida tipos, tamanhos e `sub` (`/^\d{1,40}$/`), descartando sessão inválida
- [ ] 2.2 Criar `decodeJwt(token)` com base64url e `TextDecoder`, dentro de `try/catch`
- [ ] 2.3 Criar `validateClaims(claims)` conferindo `aud`, `iss`, `exp` e `sub`
- [ ] 2.4 Criar `safePhoto(url)` aceitando só `https:` com host terminando em `googleusercontent.com`
- [ ] 2.5 Criar `onGoogleCredential(resp)` que valida, grava a sessão (sem token), faz a pergunta de importação e recarrega `S` e a tela; em falha mostra "Não foi possível entrar. Tente novamente."
- [ ] 2.6 Criar `logout()` que apaga a sessão, chama `google.accounts.id.disableAutoSelect()` se disponível, recarrega `S` e a tela

## 3. Importação dos dados do visitante

- [ ] 3.1 No primeiro login sem `pratocheio:<sub>` e com dados em `pratocheio`, perguntar com `confirm()` e copiar o JSON se confirmado
- [ ] 3.2 Garantir que `pratocheio` nunca é alterada nem apagada pela importação

## 4. Interface

- [ ] 4.1 Criar o card "Conta" no topo de `profile()`: botão do Google (deslogado) ou foto/iniciais, nome, e-mail e botão "Sair" (logado), sempre com `esc()`
- [ ] 4.2 Carregar `https://accounts.google.com/gsi/client` sob demanda ao abrir o Perfil, inicializar com `google.accounts.id.initialize` e `renderButton` (`locale: "pt-BR"`)
- [ ] 4.3 Exibir "Login com Google indisponível" quando não houver Client ID, a biblioteca falhar ou o protocolo for `file:`
- [ ] 4.4 Adicionar estilos do card Conta (avatar, linha de dados) usando as variáveis CSS e o tema escuro existentes
- [ ] 4.5 Ajustar o texto do card "Dados" para citar o contexto ativo (visitante ou conta)
- [ ] 4.6 Exibir "EmagrecAI v1.1.0" no rodapé do Perfil
- [ ] 4.7 Registrar os novos `data-a` (`logout`) no tratador de cliques existente, sem duplicar listeners

## 5. Documentação

- [ ] 5.1 Criar `README.md` com descrição, funcionalidades, como executar via `http://localhost`, como criar o OAuth Client ID e cadastrar origens, limites de segurança e histórico de versões
- [ ] 5.2 Revisar a ortografia pt-BR de todos os textos novos da interface e do README

## 6. Validação

- [ ] 6.1 Servir o app em `http://localhost` e verificar sem Client ID: mensagem de indisponibilidade e app normal como visitante
- [ ] 6.2 Verificar no console, com token falso, os cenários de `aud` incorreto, token malformado, `exp` vencido e `sub` inválido
- [ ] 6.3 Verificar com Client ID real: login, nome/foto no Perfil, recarregar a página mantendo a sessão e logout
- [ ] 6.4 Verificar a importação (aceitar e recusar) e que `pratocheio` permanece igual no `localStorage`
- [ ] 6.5 Verificar duas contas no mesmo navegador sem mistura de dados, e "Apagar todos os dados" por contexto
- [ ] 6.6 Verificar nome com `<` e `"` e foto com URL inválida via sessão simulada
- [ ] 6.7 Verificar o tema escuro, a tela em 360 px de largura e a navegação por teclado no card Conta
- [ ] 6.8 Gerar o resumo das alterações em pt-BR para a descrição do commit
