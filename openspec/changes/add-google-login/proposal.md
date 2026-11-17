## Why

Hoje o EmagrecAI é um único arquivo HTML sem identificação de usuário: todos os dados ficam em uma única chave do `localStorage` (`pratocheio`). Quem divide o mesmo navegador ou dispositivo vê e sobrescreve os registros de outra pessoa. O login com a conta Google dá uma identidade simples (nome, foto e e-mail) e permite separar os dados por pessoa, sem criar senha nem cadastro.

## What Changes

- Novo botão "Entrar com Google" (Google Identity Services) na tela de Perfil, com o logo e o texto oficiais do Google.
- O login é **opcional**. Quem não entrar continua usando o app em "modo visitante", com o comportamento e os dados atuais.
- Após o login, o app mostra nome e foto da conta no Perfil e um botão "Sair".
- Os dados passam a ser gravados por conta: visitante em `pratocheio` (chave atual, sem mudança) e cada conta Google em `pratocheio:<sub>`, onde `<sub>` é o identificador estável do Google.
- No primeiro login de uma conta sem dados, o app pergunta se o usuário quer importar os dados atuais do modo visitante para a conta.
- A sessão é lembrada entre visitas guardando apenas o perfil mínimo (`sub`, nome, e-mail e foto). O token do Google não é salvo.
- O "Apagar todos os dados" apaga apenas os dados do contexto ativo (visitante ou conta logada).
- Criação do `README.md` (hoje inexistente) com a configuração do Client ID do Google e instruções de execução.
- Exibição da versão do app (`1.1.0`) no rodapé do Perfil.

Não há mudanças **BREAKING**: os dados e o fluxo existentes continuam funcionando sem login.

## Capabilities

### New Capabilities
- `google-login`: entrar e sair com a conta Google, sessão persistida localmente, validação básica do token recebido e fallback quando o login não está disponível.
- `account-data-scope`: separação dos dados locais por conta (visitante x conta Google), importação opcional dos dados do visitante e escopo do "Apagar todos os dados".

### Modified Capabilities
<!-- Nenhuma: ainda não existem specs em openspec/specs/. -->

## Impact

- **Código**: `EmagrecAI – Diário nutricional.html` (funções `load`/`save`/`reset`, tela `profile()`, novo bloco de sessão e estilos do botão).
- **Dependências externas**: script `https://accounts.google.com/gsi/client` (Google Identity Services). Nenhuma dependência de build ou backend.
- **Configuração obrigatória**: um OAuth Client ID do tipo "Aplicativo da Web" criado no Google Cloud Console, com as origens JavaScript autorizadas. O Google **não** aceita `file://`, então o app precisa ser aberto por `http://localhost` ou por um domínio hospedado.
- **Segurança**: não há backend, então o ID token não pode ser verificado no servidor. A identidade serve apenas para exibição e separação local dos dados, não como barreira de autorização. Os dados continuam salvos só no navegador, sem sincronização entre dispositivos.
- **Documentação**: novo `README.md`.
- **Fora de escopo**: sincronização na nuvem, backend, outros provedores de login e criptografia dos dados locais.
