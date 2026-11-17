# monthly-progress Specification

## Purpose
TBD - created by archiving change add-evolucao-mensal. Update Purpose after archive.

## Requirements
### Requirement: Card de evolução mensal na aba Progresso
O sistema SHALL exibir, na aba Progresso, o card "Evolução mensal" com os dados de um único mês, abrindo no mês atual, e SHALL calcular tudo a partir dos dados já existentes no aparelho, sem novas gravações no banco nem na fila de sincronização.

#### Scenario: Abrir a aba Progresso
- **WHEN** o usuário abre a aba Progresso
- **THEN** o card "Evolução mensal" mostra o mês atual, com o nome do mês e o ano em português do Brasil

#### Scenario: Uso sem internet ou como visitante
- **WHEN** o usuário está sem conexão ou sem login
- **THEN** o card exibe a evolução do mês com os dados locais, sem mensagem de erro

#### Scenario: Nenhuma gravação ao navegar
- **WHEN** o usuário navega entre meses
- **THEN** nenhuma alteração é gravada no `localStorage` nem enviada ao Supabase

### Requirement: Navegação entre meses
O sistema SHALL permitir trocar o mês exibido com os botões "mês anterior" e "próximo mês", SHALL NOT permitir avançar além do mês atual e SHALL NOT permitir voltar além do mês do registro mais antigo.

#### Scenario: Voltar um mês
- **WHEN** o usuário toca em "mês anterior" estando em um mês com registros anteriores
- **THEN** o card exibe o mês anterior e todos os números e gráficos passam a refletir esse mês

#### Scenario: Mês atual como limite
- **WHEN** o card exibe o mês atual
- **THEN** o botão "próximo mês" fica desabilitado

#### Scenario: Registro mais antigo como limite
- **WHEN** o card exibe o mês do registro mais antigo (peso, refeição ou água)
- **THEN** o botão "mês anterior" fica desabilitado

#### Scenario: Sem nenhum registro
- **WHEN** o usuário não tem nenhum registro
- **THEN** os dois botões de navegação ficam desabilitados e o card exibe o mês atual

### Requirement: Resumo de peso do mês
O sistema SHALL exibir o primeiro e o último peso registrados no mês, a variação em kg (último menos primeiro) e a diferença entre o último peso e o peso meta do perfil.

#### Scenario: Dois ou mais pesos no mês
- **WHEN** o mês tem pesos registrados em pelo menos dois dias
- **THEN** o card mostra o primeiro peso, o último peso, a variação com sinal (por exemplo "−1,2 kg") e a distância até a meta

#### Scenario: Apenas um peso no mês
- **WHEN** o mês tem peso registrado em um único dia
- **THEN** o card mostra esse peso e exibe "—" na variação

#### Scenario: Nenhum peso no mês
- **WHEN** o mês não tem peso registrado
- **THEN** o card informa que não há peso registrado no mês e não exibe o gráfico de peso

### Requirement: Resumo de calorias e água do mês
O sistema SHALL exibir a média diária de calorias, a quantidade de dias registrados e a quantidade de dias acima da meta calórica, além da média diária de água e da quantidade de dias com a meta de água atingida. As médias SHALL considerar somente os dias com registro, e as metas usadas SHALL ser as do perfil atual.

#### Scenario: Média apenas dos dias registrados
- **WHEN** o mês tem calorias registradas em 10 dos 30 dias
- **THEN** a média de calorias é a soma dessas calorias dividida por 10 e o card informa "10 dias registrados"

#### Scenario: Dia acima da meta
- **WHEN** as calorias de um dia são maiores que a meta calórica do perfil
- **THEN** esse dia é contado em "dias acima da meta"

#### Scenario: Meta de água atingida
- **WHEN** a água de um dia é maior ou igual à meta de água do perfil
- **THEN** esse dia é contado em "dias com a meta de água atingida"

#### Scenario: Mês sem refeições
- **WHEN** o mês não tem refeições registradas
- **THEN** o card informa que não há refeições registradas no mês e não exibe o gráfico de calorias

#### Scenario: Aviso sobre as metas
- **WHEN** o card exibe os dias acima da meta ou com a meta de água atingida
- **THEN** o card informa que o cálculo usa as metas atuais do perfil

### Requirement: Gráficos do mês
O sistema SHALL exibir um gráfico de linha do peso e um gráfico de barras das calorias por dia, ambos com o eixo horizontal posicionado pelo dia do mês, com a linha da meta e com descrição acessível (`role="img"` e `aria-label`).

#### Scenario: Dias sem peso aparecem como intervalo
- **WHEN** o usuário registrou peso nos dias 2 e 20
- **THEN** os pontos do gráfico ficam posicionados nos dias 2 e 20, com o espaço entre eles proporcional

#### Scenario: Barra acima da meta
- **WHEN** as calorias de um dia ultrapassam a meta
- **THEN** a barra desse dia usa a cor de alerta, igual ao gráfico semanal existente

#### Scenario: Tela de 320 px
- **WHEN** o app é aberto em uma tela de 320 px de largura com um mês de 31 dias
- **THEN** o gráfico de calorias cabe na largura do card, sem rolagem horizontal, e os rótulos de dia não se sobrepõem

### Requirement: Comparação com o mês anterior
O sistema SHALL exibir a diferença entre o mês exibido e o mês anterior na variação de peso e na média diária de calorias, somente quando o dado existir nos dois meses, com texto neutro que não classifica a diferença como boa ou ruim.

#### Scenario: Dados nos dois meses
- **WHEN** o mês exibido e o anterior têm calorias registradas
- **THEN** o card mostra a diferença das médias com sinal (por exemplo "+120 kcal na média diária em relação ao mês anterior")

#### Scenario: Mês anterior sem dados
- **WHEN** o mês anterior não tem o dado correspondente
- **THEN** o card não exibe a comparação desse item

### Requirement: Datas em fuso local e dados inválidos tolerados
O sistema SHALL montar as chaves dos dias do mês no fuso local do aparelho e SHALL ignorar valores não numéricos ou não finitos nos cálculos, sem lançar exceção.

#### Scenario: Primeiro e último dia do mês
- **WHEN** o usuário registra peso no dia 1 e no último dia do mês
- **THEN** ambos aparecem no mês correto, sem deslocamento de um dia por causa de fuso horário

#### Scenario: Peso inválido no armazenamento
- **WHEN** `S.weights` contém um valor não numérico para um dia do mês
- **THEN** o card ignora esse dia e continua exibindo os demais dados

### Requirement: Versão do app atualizada
O sistema SHALL exibir no rodapé do Perfil a nova versão do app, e a constante `VERSAO` do `index.html` SHALL ser igual à do `sw.js`.

#### Scenario: Conferir a versão
- **WHEN** o usuário abre o Perfil após a atualização
- **THEN** o rodapé mostra "EmagrecAI v" seguido da nova versão, e os aparelhos com o app instalado recebem o aviso "Nova versão disponível"
