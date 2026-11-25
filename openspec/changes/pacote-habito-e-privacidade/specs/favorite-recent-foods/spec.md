## ADDED Requirements

### Requirement: Favoritar alimentos
O sistema SHALL permitir marcar e desmarcar um alimento como favorito na tela de detalhe do alimento, com um botão que indica o estado atual (favoritado ou não) e tem rótulo acessível. O sistema SHALL guardar uma cópia dos valores do alimento (nome, valores por 100 g e unidade) apenas no aparelho, com no máximo 50 favoritos, e SHALL identificar o alimento pelo nome sem acentos e sem diferenciar maiúsculas de minúsculas.

#### Scenario: Favoritar um alimento
- **WHEN** o usuário abre o detalhe de um alimento que não é favorito e toca em "Favoritar"
- **THEN** o alimento passa a ser favorito, o botão mostra o estado favoritado e o alimento aparece na lista de favoritos da busca

#### Scenario: Remover dos favoritos
- **WHEN** o usuário abre o detalhe de um alimento favorito e toca em "Remover dos favoritos"
- **THEN** o alimento deixa de ser favorito e some da lista de favoritos

#### Scenario: Limite de favoritos
- **WHEN** o usuário já tem 50 favoritos e favorita outro alimento
- **THEN** o sistema remove o favorito mais antigo e mantém 50 itens

#### Scenario: Alimento de código de barras
- **WHEN** o usuário favorita um produto consultado pelo código de barras
- **THEN** o favorito funciona nas próximas buscas sem nova consulta externa

### Requirement: Favoritos e recentes na busca vazia
O sistema SHALL mostrar, quando o campo de busca estiver vazio, a seção "Favoritos" e a seção "Recentes" antes da lista padrão de alimentos. A seção "Recentes" SHALL listar até 15 alimentos distintos lançados nos dias mais recentes do diário, do mais novo para o mais antigo, sem repetir os que já aparecem em "Favoritos". Uma seção sem itens SHALL ser omitida. Ao digitar na busca, o sistema SHALL se comportar como antes.

#### Scenario: Busca vazia com favoritos e recentes
- **WHEN** o usuário abre a janela de adicionar alimento sem digitar nada
- **THEN** a janela mostra "Favoritos", depois "Recentes" e depois a lista padrão

#### Scenario: Sem favoritos nem recentes
- **WHEN** o usuário nunca favoritou nem lançou alimentos
- **THEN** a janela mostra somente a lista padrão, como antes

#### Scenario: Digitando na busca
- **WHEN** o usuário digita um termo no campo de busca
- **THEN** as seções "Favoritos" e "Recentes" somem e a lista mostra os resultados da busca

#### Scenario: Alimento favorito também recente
- **WHEN** um alimento é favorito e foi lançado recentemente
- **THEN** ele aparece apenas em "Favoritos"

### Requirement: Lançamento a partir de favoritos e recentes
O sistema SHALL abrir o detalhe do alimento ao tocar em um favorito ou recente, com os valores por 100 g reconstruídos do alimento original e a unidade de medida do alimento de mesmo nome, quando existir, ou "porção" de 100 g. O sistema SHALL ignorar nos recentes os lançamentos sem peso em gramas.

#### Scenario: Lançar um recente
- **WHEN** o usuário toca em um alimento de "Recentes"
- **THEN** o detalhe mostra o alimento com a quantidade e a medida prontas para adicionar à refeição escolhida

### Requirement: Armazenamento local e privacidade
O sistema SHALL guardar os favoritos somente no `localStorage` do aparelho, sem enviá-los ao Supabase. O sistema SHALL validar os dados lidos do `localStorage` (tipos, tamanhos e faixas de valores), descartando itens inválidos sem exibir erro.

#### Scenario: Dados corrompidos
- **WHEN** o valor guardado dos favoritos está corrompido ou tem itens inválidos
- **THEN** o app ignora os itens inválidos e continua funcionando
