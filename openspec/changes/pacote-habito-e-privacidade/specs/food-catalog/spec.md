## ADDED Requirements

### Requirement: Busca vazia com atalhos
O sistema SHALL mostrar as seções "Favoritos" e "Recentes" antes da lista padrão quando o campo de busca por nome estiver vazio, conforme a capacidade `favorite-recent-foods`. A busca com texto digitado, o catálogo da TACO e a lista padrão SHALL continuar com o comportamento atual.

#### Scenario: Campo de busca vazio
- **WHEN** o usuário abre a aba "Buscar" sem digitar nada
- **THEN** favoritos e recentes aparecem antes da lista padrão de alimentos

#### Scenario: Busca por texto
- **WHEN** o usuário digita "arroz"
- **THEN** a lista mostra os resultados da busca como antes, sem favoritos nem recentes separados
