## ADDED Requirements

### Requirement: Escolha do tema no Perfil
O sistema SHALL exibir no Perfil um card "Aparência" com as opções "Automático", "Claro" e "Escuro", indicando a opção atual. A opção padrão SHALL ser "Automático".

#### Scenario: Primeiro acesso
- **WHEN** o usuário abre o Perfil sem nunca ter escolhido um tema
- **THEN** a opção "Automático" aparece selecionada

#### Scenario: Trocar para Escuro
- **WHEN** o usuário seleciona "Escuro"
- **THEN** o app passa para o tema escuro imediatamente, sem recarregar

#### Scenario: Trocar para Claro com o aparelho no modo escuro
- **WHEN** o aparelho está no modo escuro e o usuário seleciona "Claro"
- **THEN** o app exibe o tema claro

### Requirement: Tema automático segue o aparelho
O sistema SHALL, na opção "Automático", usar o tema claro ou escuro conforme a configuração do aparelho e acompanhar mudanças dela.

#### Scenario: Aparelho no modo escuro
- **WHEN** a opção é "Automático" e o aparelho está no modo escuro
- **THEN** o app exibe o tema escuro

#### Scenario: Mudança no aparelho
- **WHEN** a opção é "Automático" e o aparelho muda de claro para escuro
- **THEN** o app passa para o tema escuro sem recarregar

### Requirement: Persistência da escolha
O sistema SHALL salvar a escolha apenas no aparelho e aplicá-la ao abrir o app, sem exibir antes o tema errado. O sistema SHALL tratar qualquer valor salvo inválido como "Automático".

#### Scenario: Reabrir o app
- **WHEN** o usuário escolheu "Escuro" e reabre o app
- **THEN** o app abre direto no tema escuro, sem piscar o tema claro

#### Scenario: Valor inválido salvo
- **WHEN** o valor salvo da preferência não é "auto", "light" nem "dark"
- **THEN** o app usa "Automático"

#### Scenario: Armazenamento indisponível
- **WHEN** o aparelho não permite gravar no armazenamento local
- **THEN** o app continua funcionando e a escolha vale até fechar o app

### Requirement: Barra do navegador acompanha o tema
O sistema SHALL ajustar a cor da barra do navegador (`theme-color`) ao tema escolhido.

#### Scenario: Tema forçado
- **WHEN** o usuário escolhe "Escuro" com o aparelho no modo claro
- **THEN** a barra do navegador usa a cor do tema escuro

### Requirement: Legibilidade e acessibilidade nos dois temas
O sistema SHALL manter texto legível, foco visível e alvos de toque de pelo menos 44 px em todas as abas nos dois temas, inclusive em 320 px de largura.

#### Scenario: Revisão das abas
- **WHEN** o usuário percorre Diário, Progresso e Perfil em cada tema
- **THEN** nenhum texto, borda ou botão fica ilegível ou sem contraste
