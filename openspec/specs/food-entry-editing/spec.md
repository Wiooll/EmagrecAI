# food-entry-editing Specification

## Purpose
TBD - created by archiving change edit-foods. Update Purpose after archive.
## Requirements
### Requirement: Editar a quantidade de um alimento lançado
O sistema SHALL permitir ao usuário editar a quantidade e a medida (unidade ou gramas) de um alimento já lançado no diário, recalculando calorias e macros proporcionalmente, mantendo o mesmo lançamento (mesmo `id`), dia e refeição.

#### Scenario: Abrir a edição
- **WHEN** o usuário toca em "Editar" em um lançamento do diário
- **THEN** abre a janela com o nome do alimento, a quantidade e a medida atuais e a pré-visualização de calorias e macros

#### Scenario: Salvar nova quantidade
- **WHEN** o usuário altera a quantidade para um valor maior que zero e toca em "Salvar alterações"
- **THEN** o lançamento é atualizado no mesmo lugar, os totais do dia são recalculados e a janela fecha

#### Scenario: Quantidade inválida
- **WHEN** o usuário informa quantidade vazia, zero ou negativa
- **THEN** o lançamento não é alterado e o campo recebe o foco

#### Scenario: Sincronização
- **WHEN** o usuário está logado e salva a edição
- **THEN** o lançamento é enviado pela fila de sincronização por upsert com o mesmo `id`, sem criar duplicata, inclusive se estiver sem internet no momento

#### Scenario: Visitante sem login
- **WHEN** o usuário não está logado e salva a edição
- **THEN** a alteração é gravada apenas no armazenamento local

#### Scenario: Lançamento sem peso
- **WHEN** o lançamento tem 0 g
- **THEN** o botão "Editar" não é exibido para ele

