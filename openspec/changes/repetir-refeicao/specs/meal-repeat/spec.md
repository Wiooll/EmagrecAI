## ADDED Requirements

### Requirement: Botão de repetir refeição
O sistema SHALL exibir o botão "Repetir" no cartão de uma refeição somente quando ela tiver ao menos um alimento registrado no dia exibido.

#### Scenario: Refeição com alimentos
- **WHEN** o usuário abre o diário em um dia com alimentos no Almoço
- **THEN** o cartão do Almoço mostra o botão "Repetir"

#### Scenario: Refeição vazia
- **WHEN** a refeição não tem alimentos
- **THEN** o cartão não mostra o botão "Repetir"

### Requirement: Escolha da refeição e do dia de destino
O sistema SHALL permitir escolher como destino qualquer uma das refeições (Café da manhã, Almoço, Jantar, Lanches) e o dia por atalhos ("Este dia", que é o dia exibido, e "Dia seguinte") ou por um campo de data. O sistema SHALL rejeitar datas inválidas e SHALL impedir a cópia quando refeição e dia de destino forem iguais aos da origem.

#### Scenario: Outra refeição no mesmo dia
- **WHEN** o usuário toca em "Repetir" no Almoço, escolhe "Jantar" e mantém o dia exibido
- **THEN** o destino é o Jantar do mesmo dia

#### Scenario: Outro dia
- **WHEN** o usuário escolhe "Dia seguinte" ou uma data no campo de data
- **THEN** o destino é a refeição escolhida nesse dia

#### Scenario: Destino igual à origem
- **WHEN** refeição e dia de destino são iguais aos da origem
- **THEN** o botão "Copiar" fica desabilitado e a folha orienta a escolher outro destino

### Requirement: Cópia dos alimentos
O sistema SHALL copiar todos os alimentos da refeição de origem para a refeição e o dia de destino, com os mesmos nomes, quantidades e valores nutricionais, novos identificadores, e sem remover os itens já existentes no destino.

#### Scenario: Cópia concluída
- **WHEN** o usuário confirma o destino
- **THEN** os itens aparecem na refeição de destino, os totais do dia são atualizados e um aviso informa a quantidade copiada, a refeição e o dia

#### Scenario: Destino já tem itens
- **WHEN** a refeição de destino já tem alimentos
- **THEN** os itens existentes são mantidos e os copiados são adicionados depois deles

#### Scenario: Cópia no mesmo dia
- **WHEN** o destino é outra refeição do dia exibido
- **THEN** a origem permanece inalterada e os itens copiados aparecem na refeição de destino

### Requirement: Sincronização
O sistema SHALL registrar cada item copiado como uma inclusão de alimento (`entry.add`), funcionando offline e sincronizando com a nuvem quando houver conexão.

#### Scenario: Sem conexão
- **WHEN** o usuário repete uma refeição sem internet
- **THEN** os itens são salvos localmente e enviados à nuvem quando a conexão voltar
