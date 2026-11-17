## ADDED Requirements

### Requirement: Manifesto do aplicativo
O app SHALL publicar um manifesto web (`manifest.webmanifest`) vinculado no `index.html`, com nome, nome curto, idioma `pt-BR`, `display: standalone`, `start_url` e `scope` relativos (`./`), cores de tema e fundo, e ícones. Todos os caminhos MUST ser relativos, para funcionar na raiz e em subcaminho do GitHub Pages.

#### Scenario: Manifesto válido
- **WHEN** o app é aberto em um navegador Chromium e o painel Application do DevTools é inspecionado
- **THEN** o manifesto é lido sem erros e o app é considerado instalável

#### Scenario: Publicação em subcaminho
- **WHEN** o app é servido em `https://<usuario>.github.io/<repositorio>/`
- **THEN** o manifesto, os ícones e o `start_url` resolvem dentro do subcaminho, sem erro 404

### Requirement: Ícones do aplicativo
O app SHALL fornecer ícones PNG de 192 x 192 e 512 x 512 px, um ícone mascarável (`maskable`) de 512 x 512 px com o conteúdo dentro da área segura, e um `apple-touch-icon` de 180 x 180 px sem transparência, referenciados no manifesto e no `<head>`.

#### Scenario: Ícone na tela inicial do Android
- **WHEN** o usuário instala o app no Android
- **THEN** o ícone aparece na tela inicial sem corte do desenho principal, qualquer que seja a máscara do aparelho

#### Scenario: Ícone na tela inicial do iOS
- **WHEN** o usuário adiciona o app à Tela de Início no iOS
- **THEN** o ícone aparece com fundo verde sólido, sem fundo preto

### Requirement: Instalação por botão em navegadores compatíveis
Quando o navegador oferecer a instalação (evento `beforeinstallprompt`), o app SHALL exibir no Perfil um card "Instalar app" com um botão "Instalar". Ao tocar, o app SHALL abrir o diálogo de instalação do navegador. O app MUST NOT abrir o diálogo sem uma ação do usuário.

#### Scenario: Instalar pelo Perfil
- **WHEN** o usuário abre o Perfil em um navegador que oferece a instalação e toca em "Instalar"
- **THEN** o diálogo de instalação do navegador é exibido

#### Scenario: Usuário recusa a instalação
- **WHEN** o usuário fecha o diálogo de instalação sem aceitar
- **THEN** o app continua funcionando normalmente e o card volta a aparecer quando o navegador oferecer a instalação de novo (cada evento de instalação só pode ser usado uma vez)

#### Scenario: Instalação concluída
- **WHEN** o evento `appinstalled` é disparado
- **THEN** o card "Instalar app" deixa de ser exibido

### Requirement: Instruções de instalação no iOS
Em iPhone e iPad, onde não há botão de instalação programável, o app SHALL exibir no card "Instalar app" instruções curtas em português: no Safari, tocar em Compartilhar e depois em "Adicionar à Tela de Início".

#### Scenario: iPhone no Safari
- **WHEN** o usuário abre o Perfil no Safari do iPhone com o app ainda não instalado
- **THEN** o card exibe as instruções de instalação e nenhum botão "Instalar"

### Requirement: Card oculto quando não aplicável
O app SHALL ocultar o card "Instalar app" quando já estiver aberto como app instalado (`display-mode: standalone` ou `navigator.standalone`) e quando o navegador não oferecer instalação nem for iOS.

#### Scenario: App já instalado
- **WHEN** o usuário abre o app pelo ícone da tela inicial e vai ao Perfil
- **THEN** o card "Instalar app" não aparece

#### Scenario: Navegador sem suporte
- **WHEN** o usuário abre o app em um navegador sem suporte à instalação que não seja iOS
- **THEN** o Perfil não exibe o card e nenhum erro aparece no console

### Requirement: Login e dados preservados no app instalado
O app instalado SHALL manter o modo visitante, o login com Google, a sincronização e a fila offline funcionando como no navegador. O retorno do login MUST abrir o app dentro do escopo instalado.

#### Scenario: Entrar com Google no app instalado
- **WHEN** o usuário toca em "Entrar com Google" no app instalado e conclui o login
- **THEN** o app volta ao Perfil já com a conta ativa e inicia a sincronização

#### Scenario: Dados de visitante após instalar
- **WHEN** um usuário visitante, com registros no navegador, instala o app
- **THEN** o app instalado abre sem apagar nem alterar o formato dos dados salvos no `localStorage` do navegador
