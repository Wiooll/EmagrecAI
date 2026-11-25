## ADDED Requirements

### Requirement: Ocultar e mostrar alimentos de uma refeição
O app SHALL exibir, no cabeçalho de cada refeição da aba Diário que tenha alimentos, um botão para ocultar e mostrar a lista de alimentos adicionados. O botão SHALL ter `aria-expanded` e um `aria-label` que indique a ação e a refeição. Com a lista oculta, o cartão SHALL manter o nome da refeição, o total de kcal, a quantidade de itens e o botão "+". A lista SHALL ficar visível por padrão.

#### Scenario: Ocultar a lista
- **WHEN** o usuário toca no botão de uma refeição com alimentos visíveis
- **THEN** a lista de alimentos dessa refeição some e o total de kcal continua exibido

#### Scenario: Mostrar a lista novamente
- **WHEN** o usuário toca no botão de uma refeição com a lista oculta
- **THEN** a lista de alimentos volta a aparecer

#### Scenario: Refeição sem alimentos
- **WHEN** uma refeição não tem alimentos no dia exibido
- **THEN** o botão não é exibido e a mensagem "Nada registrado" permanece

#### Scenario: Adicionar alimento a refeição oculta
- **WHEN** o usuário adiciona um alimento a uma refeição com a lista oculta
- **THEN** a lista dessa refeição é exibida com o novo alimento

### Requirement: Preferência salva no aparelho
O app SHALL guardar quais refeições estão ocultas apenas em `localStorage`, sem enviá-la ao Supabase, tanto para usuário logado quanto para visitante. A preferência SHALL valer para todos os dias. Valores inválidos ou JSON corrompido SHALL ser ignorados, deixando as listas visíveis.

#### Scenario: Reabrir o app
- **WHEN** o usuário oculta a lista do almoço e fecha e reabre o app
- **THEN** a lista do almoço continua oculta

#### Scenario: Trocar de dia
- **WHEN** o usuário oculta a lista do almoço e navega para outro dia
- **THEN** a lista do almoço continua oculta nesse dia

#### Scenario: Armazenamento corrompido
- **WHEN** o `localStorage` contém JSON inválido para essa preferência
- **THEN** todas as listas aparecem visíveis e o app continua funcionando
