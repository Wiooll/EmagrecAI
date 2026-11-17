# mobile-layout Specification

## Purpose
TBD - created by archiving change optimize-mobile-pwa. Update Purpose after archive.
## Requirements
### Requirement: Alvos de toque com tamanho mínimo
O app SHALL exibir todos os controles interativos tocáveis (botões de dia anterior e próximo, adicionar à refeição, remover item, ajustar água, fechar a folha, abas da folha e itens da navegação inferior) com área de toque de no mínimo 44 x 44 px.

#### Scenario: Botão de adicionar alimento
- **WHEN** o usuário abre o Diário em uma tela de 360 px de largura
- **THEN** o botão "+" de cada refeição tem área de toque de pelo menos 44 x 44 px

#### Scenario: Botão de remover item
- **WHEN** uma refeição tem pelo menos um alimento registrado
- **THEN** o botão de remover do item tem área de toque de pelo menos 44 x 44 px, sem aumentar a altura da linha de forma que quebre o layout

### Requirement: Campos de formulário sem zoom automático
O app SHALL usar fonte de no mínimo 16 px em todos os campos de entrada e seleção, para que o iOS Safari não aplique zoom automático ao focar o campo. O app MUST NOT desativar o zoom por gesto do usuário.

#### Scenario: Focar campo no iOS
- **WHEN** o usuário toca em um campo de texto, número ou seleção em um iPhone
- **THEN** a página não amplia automaticamente e o zoom por gesto de pinça continua disponível

### Requirement: Telas estreitas sem quebra de layout
O app SHALL permanecer legível e utilizável, sem rolagem horizontal da página e sem texto sobreposto, em telas de 320 px de largura ou mais.

#### Scenario: Diário em 320 px
- **WHEN** o usuário abre o Diário em uma tela de 320 px de largura
- **THEN** o título, a navegação de dias, o anel de calorias com seus valores e os três indicadores de macros aparecem completos, sem rolagem horizontal

#### Scenario: Prévia do alimento em 320 px
- **WHEN** o usuário seleciona um alimento na folha de adicionar em uma tela de 320 px
- **THEN** os quatro valores da prévia (kcal, carboidratos, proteínas e gorduras) aparecem sem cortar o texto

### Requirement: Folha de adicionar alimento compatível com o teclado virtual
A folha "Adicionar alimento" SHALL limitar sua altura à área visível da tela e rolar internamente, de modo que o campo em edição e o botão de confirmar permaneçam acessíveis com o teclado virtual aberto.

#### Scenario: Teclado aberto ao digitar a quantidade
- **WHEN** o usuário foca o campo de quantidade na folha em um celular e o teclado virtual abre
- **THEN** o campo e o botão de confirmar continuam visíveis ou alcançáveis por rolagem dentro da folha

#### Scenario: Tela com pouca altura
- **WHEN** o aparelho está em orientação horizontal
- **THEN** a folha não ultrapassa a altura visível e seu conteúdo rola internamente

### Requirement: Respeito à área segura da tela
O app SHALL respeitar as áreas seguras (recorte da câmera, barra de status e barra de gestos) nas bordas superior e inferior, inclusive quando aberto em tela cheia como app instalado, sem que a navegação inferior ou o conteúdo fiquem sob elas.

#### Scenario: App instalado em aparelho com recorte
- **WHEN** o app é aberto em tela cheia em um aparelho com recorte de câmera e barra de gestos
- **THEN** o título não fica sob o recorte e a navegação inferior não fica sob a barra de gestos

### Requirement: Comportamento de toque apropriado ao app
O app SHALL desativar o atraso de duplo toque e o destaque cinza ao tocar em botões, impedir o ajuste automático de tamanho de texto em rotação e conter a rolagem elástica da página inteira.

#### Scenario: Toque rápido em botão
- **WHEN** o usuário toca em um botão de água ou de dia
- **THEN** a ação ocorre imediatamente, sem atraso de duplo toque

### Requirement: Cor da barra do navegador acompanha o tema
O app SHALL informar a cor da barra do navegador (`theme-color`) compatível com o tema claro ou escuro do sistema.

#### Scenario: Sistema em tema escuro
- **WHEN** o aparelho está com tema escuro e o usuário abre o app no navegador
- **THEN** a barra do navegador usa a cor de fundo escura do app

#### Scenario: Sistema em tema claro
- **WHEN** o aparelho está com tema claro e o usuário abre o app no navegador
- **THEN** a barra do navegador usa a cor de fundo clara do app

### Requirement: Nenhuma regressão visual em telas maiores
O app SHALL manter, em telas com mais de 520 px de largura, a coluna central de no máximo 520 px já existente, sem alterações de conteúdo ou de funcionalidade.

#### Scenario: Abrir no desktop
- **WHEN** o usuário abre o app em um navegador de desktop
- **THEN** o conteúdo aparece centralizado, com largura máxima de 520 px, e todas as funções continuam disponíveis

