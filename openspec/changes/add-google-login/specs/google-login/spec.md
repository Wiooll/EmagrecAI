## ADDED Requirements

### Requirement: Entrar com a conta Google
O sistema SHALL oferecer, na tela de Perfil, o botão "Entrar com Google" usando Google Identity Services, e SHALL identificar o usuário pelo ID token recebido.

#### Scenario: Login bem-sucedido
- **WHEN** o usuário clica em "Entrar com Google" e conclui a autenticação
- **THEN** o sistema exibe nome, e-mail e foto da conta no Perfil e passa a usar os dados dessa conta

#### Scenario: Usuário cancela o login
- **WHEN** o usuário fecha a janela do Google sem concluir
- **THEN** o sistema permanece em modo visitante, sem erro e sem alterar dados

### Requirement: Login opcional
O sistema SHALL continuar totalmente funcional em modo visitante, sem exigir login para registrar refeições, água, peso ou perfil.

#### Scenario: Uso sem login
- **WHEN** o usuário abre o app sem entrar com o Google
- **THEN** todas as telas e funções atuais estão disponíveis e os dados são lidos e gravados na chave `pratocheio`

### Requirement: Validação do token recebido
O sistema SHALL tratar o ID token como entrada não confiável e SHALL rejeitar o login quando o payload for malformado, o `aud` for diferente do Client ID configurado, o `iss` não for do Google, o `exp` estiver no passado, ou o `sub` não for numérico.

#### Scenario: Token com audiência incorreta
- **WHEN** o callback recebe um token cujo `aud` difere do Client ID configurado
- **THEN** o sistema não cria sessão e exibe a mensagem "Não foi possível entrar. Tente novamente."

#### Scenario: Token malformado
- **WHEN** o callback recebe um valor que não é um JWT decodificável
- **THEN** o sistema não cria sessão e exibe a mesma mensagem de erro, sem lançar exceção não tratada

### Requirement: Exibição segura dos dados da conta
O sistema SHALL escapar nome e e-mail antes de inseri-los no HTML e SHALL usar a foto somente quando a URL for `https:` e o host terminar em `googleusercontent.com`.

#### Scenario: Nome com caracteres HTML
- **WHEN** o nome da conta contém `<` ou `"`
- **THEN** o sistema exibe os caracteres como texto, sem interpretá-los como HTML

#### Scenario: Foto de origem inválida
- **WHEN** a URL da foto não é `https:` do domínio `googleusercontent.com`
- **THEN** o sistema não carrega a imagem e exibe as iniciais do nome

### Requirement: Sessão persistida sem token
O sistema SHALL guardar apenas `sub`, nome, e-mail e foto para manter o usuário logado entre visitas, e SHALL NOT salvar o ID token.

#### Scenario: Reabrir o app logado
- **WHEN** o usuário reabre o app depois de ter entrado
- **THEN** o sistema restaura a sessão e exibe a conta sem nova autenticação

#### Scenario: Sessão salva corrompida
- **WHEN** o valor salvo da sessão é inválido ou tem campos fora do formato esperado
- **THEN** o sistema descarta a sessão e inicia em modo visitante

### Requirement: Sair da conta
O sistema SHALL oferecer o botão "Sair" quando houver sessão, removendo a sessão e voltando ao modo visitante.

#### Scenario: Logout
- **WHEN** o usuário clica em "Sair"
- **THEN** o sistema apaga a sessão salva, volta ao modo visitante e mostra novamente o botão "Entrar com Google"

#### Scenario: Dados da conta após sair
- **WHEN** o usuário sai da conta
- **THEN** os dados da conta permanecem no navegador e voltam a aparecer no próximo login com a mesma conta

### Requirement: Login indisponível
O sistema SHALL ocultar o botão do Google e exibir a mensagem "Login com Google indisponível" quando o Client ID não estiver configurado, a biblioteca do Google não carregar, ou o app estiver aberto via `file://`.

#### Scenario: Sem Client ID configurado
- **WHEN** `GOOGLE_CLIENT_ID` está vazio
- **THEN** o Perfil mostra a mensagem de indisponibilidade e o resto do app funciona normalmente

#### Scenario: Falha ao carregar a biblioteca
- **WHEN** o script do Google não carrega por falta de internet ou bloqueio
- **THEN** o Perfil mostra a mensagem de indisponibilidade e nenhum erro quebra a renderização do app

### Requirement: Versão visível
O sistema SHALL exibir o número da versão (`1.1.0`) no rodapé da tela de Perfil.

#### Scenario: Ver a versão
- **WHEN** o usuário abre a tela de Perfil
- **THEN** o rodapé mostra "EmagrecAI v1.1.0"
