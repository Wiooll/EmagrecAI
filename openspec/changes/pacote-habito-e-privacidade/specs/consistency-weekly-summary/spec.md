## ADDED Requirements

### Requirement: Dia registrado
O sistema SHALL considerar um dia como registrado quando o total de calorias lançadas nesse dia for maior que zero. Água e peso sozinhos NÃO SHALL tornar um dia registrado.

#### Scenario: Dia com alimentos
- **WHEN** o dia tem ao menos um alimento com calorias maiores que zero
- **THEN** o dia conta como registrado

#### Scenario: Dia só com água ou peso
- **WHEN** o dia tem água ou peso, mas nenhum alimento
- **THEN** o dia não conta como registrado

### Requirement: Card de constância
O sistema SHALL exibir na aba Progresso o card "Constância", com a sequência atual de dias registrados, a melhor sequência de todo o histórico e a quantidade de dias registrados nos últimos 7 dias. A sequência atual SHALL contar os dias consecutivos registrados terminando hoje e, se hoje ainda não tiver registro, SHALL começar a contagem em ontem sem zerar a sequência.

#### Scenario: Sequência terminando hoje
- **WHEN** o usuário registrou alimentos hoje e nos 4 dias anteriores
- **THEN** a sequência atual mostra 5 dias

#### Scenario: Hoje ainda sem registro
- **WHEN** o usuário registrou os 3 dias anteriores a hoje e ainda não registrou hoje
- **THEN** a sequência atual mostra 3 dias

#### Scenario: Sequência interrompida
- **WHEN** o último dia registrado foi anterior a ontem
- **THEN** a sequência atual mostra 0 dia e a melhor sequência é preservada

#### Scenario: Sem registros
- **WHEN** o usuário nunca registrou alimentos
- **THEN** o card mostra 0 dia nas sequências e orienta a registrar uma refeição

### Requirement: Card de resumo da semana
O sistema SHALL exibir na aba Progresso o card "Resumo da semana", que cobre os últimos 7 dias incluindo hoje e mostra: a média de calorias nos dias registrados, a quantidade de dias dentro da meta (dia registrado com calorias menores ou iguais à meta), a quantidade de dias registrados, a variação de peso (último peso menos o primeiro peso da janela, somente com dois ou mais pesos) e a quantidade de dias com a meta de água atingida. O card SHALL comparar a média de calorias e a variação de peso com os 7 dias anteriores somente quando as duas janelas tiverem dados. O card SHALL informar que usa as metas atuais do perfil.

#### Scenario: Semana com registros
- **WHEN** o usuário registrou alimentos em 5 dos últimos 7 dias
- **THEN** o card mostra 5 dias registrados, a média de calorias desses dias e quantos ficaram dentro da meta

#### Scenario: Comparação com a semana anterior
- **WHEN** as duas janelas de 7 dias têm dias registrados
- **THEN** o card mostra a diferença da média diária de calorias em relação à janela anterior

#### Scenario: Sem dados na janela
- **WHEN** não há alimentos, peso ou água nos últimos 7 dias
- **THEN** o card mostra uma mensagem pedindo para registrar refeições e não mostra médias nem comparações

#### Scenario: Peso com um único registro
- **WHEN** há só um peso na janela
- **THEN** o card não mostra variação de peso

### Requirement: Cálculo local
O sistema SHALL calcular constância e resumo semanal no aparelho, a partir dos dados já carregados, sem gravar dados novos no armazenamento nem no banco e sem requisições de rede. O sistema SHALL usar a data local do aparelho para definir "hoje" e os limites de cada dia.

#### Scenario: Uso sem internet
- **WHEN** o app está sem conexão
- **THEN** os cards de constância e resumo da semana são exibidos normalmente
