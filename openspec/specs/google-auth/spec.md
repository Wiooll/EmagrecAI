# google-auth Specification

## Purpose
TBD - created by archiving change add-supabase-database. Update Purpose after archive.
## Requirements
### Requirement: Entrar com a conta Google
O sistema SHALL oferecer, na tela de Perfil, o botão "Entrar com Google" que autentica o usuário pelo Supabase Auth com o provedor Google, usando o fluxo PKCE.

#### Scenario: Login bem-sucedido
- **WHEN** o usuário toca em "Entrar com Google" e conclui o consentimento no Google
- **THEN** o app volta à página, cria a sessão do Supabase e exibe no Perfil o nome, o e-mail e a foto (ou as iniciais) da conta

#### Scenario: Consentimento cancelado
- **WHEN** o usuário cancela a tela do Google ou o Supabase retorna erro de autenticação
- **THEN** o app permanece em modo visitante, remove os parâmetros de erro da URL e exibe uma mensagem em pt-BR

### Requirement: Login opcional
O sistema SHALL permitir o uso completo do app sem login, em modo visitante.

#### Scenario: Uso sem login
- **WHEN** o usuário nunca toca em "Entrar com Google"
- **THEN** todas as telas e funções do diário continuam disponíveis

### Requirement: Sair da conta
O sistema SHALL oferecer o botão "Sair" quando houver sessão, que encerra a sessão no Supabase e volta ao modo visitante.

#### Scenario: Logout
- **WHEN** o usuário toca em "Sair"
- **THEN** a sessão é encerrada, o app carrega os dados do modo visitante e o card "Conta" volta a mostrar "Entrar com Google"

#### Scenario: Alterações pendentes no logout
- **WHEN** o usuário sai com alterações ainda na fila de envio
- **THEN** a fila e o cache da conta permanecem no navegador e são enviados no próximo login da mesma conta

### Requirement: Sessão persistida
O sistema SHALL manter o usuário logado entre visitas, usando a persistência e a renovação automática de token da biblioteca do Supabase, sem salvar tokens em chaves próprias do app.

#### Scenario: Reabrir o app
- **WHEN** o usuário logado reabre o app com sessão válida
- **THEN** o app exibe os dados da conta sem pedir login novamente

#### Scenario: Sessão inexistente ao reabrir
- **WHEN** o app abre com um último usuário salvo, mas a biblioteca informa que não há sessão
- **THEN** o app descarta o último usuário e volta ao modo visitante

#### Scenario: Reabrir sem conexão
- **WHEN** o usuário logado abre o app sem internet
- **THEN** o app exibe os dados em cache da conta e indica "Sem conexão"

### Requirement: Login indisponível
O sistema SHALL continuar funcionando em modo visitante quando o login não puder ser usado, exibindo o aviso "Login indisponível" no card "Conta".

#### Scenario: Biblioteca não carregou
- **WHEN** o script do Supabase falha ao carregar (sem internet ou bloqueado)
- **THEN** o app opera em modo visitante e o botão de login não é exibido

#### Scenario: Configuração ausente
- **WHEN** `SUPABASE_URL` ou `SUPABASE_KEY` estão vazios
- **THEN** o app opera em modo visitante e o botão de login não é exibido

#### Scenario: Aberto por file
- **WHEN** o app é aberto por `file://`
- **THEN** o card "Conta" informa que o login exige `http://localhost` ou um endereço hospedado

### Requirement: Dados do Google tratados como entrada não confiável
O sistema SHALL escapar nome e e-mail antes de inseri-los no HTML e SHALL usar a foto somente se for uma URL `https:` com host terminado em `googleusercontent.com`.

#### Scenario: Nome com HTML
- **WHEN** o nome da conta contém caracteres como `<` ou `"`
- **THEN** o app os exibe como texto, sem interpretar HTML

#### Scenario: Foto de origem inesperada
- **WHEN** a URL da foto não é `https:` ou o host não termina em `googleusercontent.com`
- **THEN** o app exibe as iniciais do nome no lugar da foto

### Requirement: Nenhum segredo no código
O sistema SHALL conter no HTML e no repositório apenas a URL do projeto e a chave publicável do Supabase, e SHALL NOT conter a chave `service_role` nem o Client Secret do Google.

#### Scenario: Revisão do código
- **WHEN** o HTML e os arquivos versionados são inspecionados
- **THEN** não há `service_role`, Client Secret nem tokens de sessão

