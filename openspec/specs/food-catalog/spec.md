# food-catalog Specification

## Purpose
TBD - created by archiving change add-food-catalog-and-barcode. Update Purpose after archive.
## Requirements
### Requirement: Catálogo de alimentos brasileiros embutido
O app SHALL incluir um catálogo de alimentos baseado na Tabela Brasileira de Composição de Alimentos (TACO, 4ª edição), servido como arquivo estático do próprio app (`data/taco.json`), com valores de energia (kcal), carboidratos, proteínas e gorduras por 100 g. O catálogo MUST NOT conter itens com energia ou algum macronutriente ausente, e SHALL tratar valores "traço" como zero.

#### Scenario: Alimento fora da base inicial
- **WHEN** o usuário busca "pão de queijo" e o item não existe em `FOODS`, mas existe no catálogo
- **THEN** a busca exibe o item do catálogo com as calorias por porção

#### Scenario: Valor ausente na fonte
- **WHEN** um alimento da TACO não tem valor de energia, carboidrato, proteína ou lipídio
- **THEN** ele não consta no arquivo `data/taco.json`

#### Scenario: Valor traço
- **WHEN** um alimento da TACO tem valor "traço" para um macronutriente
- **THEN** o catálogo grava `0` para esse macronutriente

### Requirement: Busca combinada
A busca da janela "Adicionar alimento" SHALL consultar `FOODS`, os alimentos personalizados e o catálogo, nesta ordem de prioridade, ignorando maiúsculas e acentos, e SHALL exibir apenas itens cujo nome contenha todas as palavras digitadas. A lista SHALL mostrar no máximo 50 itens. Um item do catálogo com nome igual (após normalização) ao de um item de `FOODS` ou personalizado MUST NOT aparecer.

#### Scenario: Busca sem acento
- **WHEN** o usuário digita "pao queijo"
- **THEN** a busca retorna itens cujo nome contém "pão" e "queijo"

#### Scenario: Prioridade da base local
- **WHEN** o termo corresponde a um item de `FOODS` e a um item do catálogo com o mesmo nome normalizado
- **THEN** a lista mostra somente o item de `FOODS`

#### Scenario: Limite de resultados
- **WHEN** o termo digitado corresponde a mais de 50 itens
- **THEN** a lista mostra os 50 primeiros, com os nomes que começam pelo termo antes dos demais

#### Scenario: Nenhum resultado
- **WHEN** nenhum item corresponde ao termo
- **THEN** a lista mostra a mensagem existente "Nenhum resultado" com a opção de cadastrar um novo alimento

### Requirement: Medidas caseiras e quantidade
Cada item do catálogo SHALL poder ser adicionado por gramas e, quando houver medida caseira correspondente, por essa medida, no mesmo passo de escolha de quantidade dos demais alimentos. Ao adicionar, a entrada do diário SHALL usar o formato já existente (`nome`, `gramas`, `rótulo da quantidade`, `kcal`, `carboidratos`, `proteínas`, `gorduras`), sem campos novos.

#### Scenario: Item com medida caseira
- **WHEN** o usuário escolhe um item do catálogo que tem medida caseira
- **THEN** o app oferece a medida e as gramas equivalentes, e calcula os valores proporcionalmente aos valores por 100 g

#### Scenario: Item sem medida caseira
- **WHEN** o usuário escolhe um item do catálogo sem medida caseira
- **THEN** o app permite informar a quantidade em gramas

#### Scenario: Registros antigos preservados
- **WHEN** o catálogo é ampliado ou atualizado em uma nova versão
- **THEN** as entradas já gravadas no diário mantêm os valores que tinham

### Requirement: Carregamento tolerante a falhas
O app SHALL carregar o catálogo na primeira abertura da janela "Adicionar alimento" e mantê-lo em memória. Se o carregamento falhar, a busca SHALL continuar funcionando com `FOODS` e os alimentos personalizados, e o app SHALL exibir o aviso "Catálogo ampliado indisponível" sem bloquear o registro.

#### Scenario: Catálogo indisponível
- **WHEN** o arquivo do catálogo não carrega e o usuário busca um alimento
- **THEN** a busca usa só `FOODS` e os alimentos personalizados e o aviso é exibido

#### Scenario: Uso sem internet
- **WHEN** o usuário já abriu o app online e depois busca um alimento do catálogo sem conexão
- **THEN** a busca encontra o item, sem nova requisição à rede

#### Scenario: Visitante sem login
- **WHEN** um visitante sem login busca um alimento do catálogo
- **THEN** a busca funciona da mesma forma que para um usuário logado

### Requirement: Segurança e escape dos dados do catálogo
O app SHALL escapar os nomes e rótulos do catálogo antes de inseri-los no HTML e SHALL descartar itens com valores fora das faixas válidas (energia de 0 a 900 kcal, cada macronutriente de 0 a 100 g, e soma dos macronutrientes de até 105 g por 100 g).

#### Scenario: Item com valor inválido
- **WHEN** o arquivo do catálogo contém um item com valor fora das faixas válidas
- **THEN** o app não exibe esse item na busca

#### Scenario: Nome com caracteres de marcação
- **WHEN** um nome do catálogo contém caracteres como `<` ou `&`
- **THEN** o nome é exibido como texto, sem ser interpretado como HTML

### Requirement: Atribuição das fontes
O app e o `README.md` SHALL citar a TACO (NEPA/UNICAMP, 4ª edição, 2011) como fonte dos alimentos do catálogo. O card "Sobre o app" do Perfil SHALL exibir essa atribuição.

#### Scenario: Atribuição visível
- **WHEN** o usuário abre o Perfil
- **THEN** o card "Sobre o app" mostra a fonte dos dados nutricionais do catálogo

### Requirement: Versão exibida e documentada
A constante `VERSAO` do `index.html` e a do `sw.js` SHALL ter o mesmo valor `1.6.0`, exibida no rodapé do Perfil, e o `README.md` SHALL registrar a versão atual, a funcionalidade "Novo na 1.6.0" e o histórico de versões.

#### Scenario: Versões iguais
- **WHEN** a versão é publicada
- **THEN** a `VERSAO` do `index.html` é igual à do `sw.js` e o rodapé do Perfil mostra `1.6.0`

