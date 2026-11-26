## ADDED Requirements

### Requirement: Aba de registro por texto
O sistema SHALL exibir a aba "IA" na janela de adicionar alimento somente quando o assistente estiver ligado, conectado e com modelo escolhido. A aba SHALL ter um campo de texto de até 500 caracteres, o botão "Propor itens" e o destino da refeição.

#### Scenario: Assistente pronto
- **WHEN** o assistente está ligado, conectado e com modelo escolhido
- **THEN** a aba "IA" aparece na janela de adicionar alimento

#### Scenario: Assistente não configurado
- **WHEN** o assistente está desligado ou sem modelo escolhido
- **THEN** a aba "IA" não aparece

#### Scenario: Limite de texto
- **WHEN** o usuário tenta digitar mais de 500 caracteres
- **THEN** o campo não aceita os caracteres excedentes

### Requirement: Proposta de itens a partir do texto
O sistema SHALL enviar o texto ao modelo e SHALL exibir uma proposta com os alimentos identificados, cada um com quantidade e medida. O sistema SHALL localizar cada alimento na base do app (alimentos do usuário, lista padrão e TACO) e SHALL calcular calorias e macronutrientes a partir dos valores por 100 g dessa base. Valores nutricionais informados pelo modelo SHALL ser ignorados.

#### Scenario: Refeição reconhecida
- **WHEN** o usuário escreve "almocei arroz, feijão e um bife" e toca em "Propor itens"
- **THEN** o app mostra os itens encontrados na base, com quantidade e calorias calculadas pelo app

#### Scenario: Alimento fora da base
- **WHEN** o modelo cita um alimento que não existe na base do app
- **THEN** o item aparece como "não encontrado", sem valores nutricionais, e não pode ser adicionado

#### Scenario: Valor nutricional inventado
- **WHEN** a resposta do modelo traz calorias ou macros
- **THEN** esses valores não são usados nem exibidos

### Requirement: Confirmação antes de gravar
O sistema SHALL gravar no diário somente depois de o usuário tocar em "Adicionar tudo" na proposta. O usuário SHALL poder editar a quantidade e remover cada item, e SHALL poder descartar a proposta inteira. Os itens confirmados SHALL ser gravados como qualquer alimento lançado manualmente, inclusive com sincronização e uso sem internet.

#### Scenario: Confirmar
- **WHEN** o usuário toca em "Adicionar tudo"
- **THEN** os itens da proposta são lançados na refeição escolhida e o diário e os totais são atualizados

#### Scenario: Editar e remover
- **WHEN** o usuário altera a quantidade de um item e remove outro antes de confirmar
- **THEN** apenas os itens restantes são gravados, com as quantidades editadas e os valores recalculados

#### Scenario: Descartar
- **WHEN** o usuário toca em "Descartar"
- **THEN** nada é gravado no diário

#### Scenario: Fechar sem confirmar
- **WHEN** o usuário fecha a janela com uma proposta aberta
- **THEN** nada é gravado

### Requirement: Funcionamento sem conta e sem internet
O sistema SHALL permitir o registro por texto no modo visitante e com conta. O sistema SHALL desativar o botão "Propor itens" sem internet, com aviso, sem afetar o restante do app.

#### Scenario: Modo visitante
- **WHEN** um visitante com o assistente configurado usa a aba "IA"
- **THEN** a proposta funciona e os itens confirmados são salvos no aparelho

#### Scenario: Sem internet
- **WHEN** o aparelho está sem conexão
- **THEN** o botão "Propor itens" fica desativado com o aviso "Sem internet" e as demais abas continuam funcionando
