## ADDED Requirements

### Requirement: Função de consulta por código de barras
O sistema SHALL expor uma Supabase Edge Function `consultar-codigo` que recebe `POST` com JSON `{ "codigo": "<dígitos>" }` e responde JSON `{ "produto": {...} }` com `codigo`, `nome`, `marca`, `kcal100`, `c100`, `p100`, `f100` e, quando houver, `porcao_g` e `porcao_rotulo`, todos os valores nutricionais por 100 g. Qualquer outro método, exceto o pré-voo CORS (`OPTIONS`), SHALL receber 405.

#### Scenario: Produto no cache
- **WHEN** a função recebe um código válido que existe em `produtos_cache` dentro do prazo de validade
- **THEN** responde 200 com o produto do cache, sem consultar o Open Food Facts

#### Scenario: Produto fora do cache
- **WHEN** a função recebe um código válido que não está no cache e o Open Food Facts devolve um produto válido
- **THEN** a função grava o produto em `produtos_cache` e responde 200 com ele

#### Scenario: Método não permitido
- **WHEN** a função recebe um GET
- **THEN** responde 405 com o cabeçalho `Allow: POST`

### Requirement: Validação do código
A função SHALL aceitar somente códigos numéricos com 8, 12, 13 ou 14 dígitos e dígito verificador válido, e SHALL validar o corpo antes de qualquer consulta: JSON válido, tamanho de no máximo 1 KB e campo `codigo` como texto.

#### Scenario: Código com dígito verificador inválido
- **WHEN** o código tem 13 dígitos, mas o dígito verificador não confere
- **THEN** responde 400 com `{ "erro": "codigo_invalido" }` e não consulta o cache nem o Open Food Facts

#### Scenario: Código com caracteres não numéricos
- **WHEN** o campo `codigo` contém letras ou símbolos
- **THEN** responde 400 com `{ "erro": "codigo_invalido" }`

#### Scenario: Corpo malformado ou grande demais
- **WHEN** o corpo não é um JSON válido, não tem `codigo` ou excede 1 KB
- **THEN** responde 400 com `{ "erro": "codigo_invalido" }` e não faz nenhuma consulta

### Requirement: Consulta ao Open Food Facts
Quando o produto não estiver no cache, a função SHALL consultar o Open Food Facts pedindo somente os campos necessários, identificando-se com um `User-Agent` no formato `EmagrecAI/<versão> (<contato>)`, onde o contato vem de variável de ambiente, e SHALL limitar a consulta a 5 segundos.

#### Scenario: Identificação da aplicação
- **WHEN** a função consulta o Open Food Facts
- **THEN** a requisição leva o cabeçalho `User-Agent` com o nome do app, a versão e o contato configurado

#### Scenario: Tempo limite
- **WHEN** o Open Food Facts não responde em 5 segundos
- **THEN** a função responde 504 com `{ "erro": "servico_indisponivel" }` e não grava nada no cache

#### Scenario: Limite global do serviço externo
- **WHEN** o Open Food Facts responde 429 ou 5xx
- **THEN** a função responde 502 com `{ "erro": "servico_indisponivel" }`, sem repetir a consulta

### Requirement: Validação da resposta externa
A função SHALL aceitar um produto somente quando houver nome de 1 a 120 caracteres, energia, carboidratos, proteínas e gorduras por 100 g como números finitos, energia entre 0 e 900 kcal, cada macronutriente entre 0 e 100 g e soma dos macronutrientes de até 105 g. A função MUST NOT estimar valores ausentes e MUST NOT incluir texto bruto do Open Food Facts nos erros.

#### Scenario: Produto sem calorias
- **WHEN** o Open Food Facts devolve um produto sem valor de energia
- **THEN** a função responde 422 com `{ "erro": "dados_incompletos" }` e não grava nada no cache

#### Scenario: Valores fora de faixa
- **WHEN** a soma dos macronutrientes por 100 g passa de 105 g
- **THEN** a função responde 422 com `{ "erro": "dados_incompletos" }` e não grava nada no cache

#### Scenario: Produto inexistente
- **WHEN** o Open Food Facts não conhece o código
- **THEN** a função responde 404 com `{ "erro": "nao_encontrado" }` e não grava o código na tabela

#### Scenario: Texto livre de terceiros
- **WHEN** o nome ou a marca contêm espaços sobrando ou caracteres de controle
- **THEN** a função remove esses caracteres e limita o tamanho antes de gravar e devolver

### Requirement: Cache de produtos
O sistema SHALL guardar em `produtos_cache` somente produtos que passaram na validação, com validade de 30 dias, e SHALL manter os códigos não encontrados apenas em memória da instância, por 1 hora. A tabela MUST NOT conter dado pessoal, MUST ter Row Level Security ativada sem políticas para `anon` e `authenticated`, e SHALL ser acessada somente pela função com a chave de serviço do ambiente.

#### Scenario: Acesso direto à tabela
- **WHEN** um cliente com a chave publicável tenta ler ou gravar `produtos_cache` pela API de dados
- **THEN** o acesso é negado

#### Scenario: Cache vencido
- **WHEN** um produto do cache tem mais de 30 dias
- **THEN** a função consulta o Open Food Facts novamente e atualiza o registro, ou devolve o dado antigo se a consulta externa falhar

#### Scenario: Código inexistente repetido
- **WHEN** o mesmo código não encontrado é consultado de novo dentro de 1 hora
- **THEN** a função responde `nao_encontrado` sem nova consulta externa

### Requirement: Proteção contra abuso
A função SHALL aceitar pedidos somente das origens listadas em `ORIGENS_PERMITIDAS`, SHALL limitar a quantidade de pedidos por origem de rede em uma janela de tempo, SHALL limitar o total de consultas ao Open Food Facts por minuto e SHALL responder aos pedidos de pré-voo CORS apenas para as origens permitidas.

#### Scenario: Origem não permitida
- **WHEN** o cabeçalho `Origin` não consta em `ORIGENS_PERMITIDAS`
- **THEN** responde 403 com `{ "erro": "origem_nao_permitida" }` e não consulta nada

#### Scenario: Limite excedido
- **WHEN** uma mesma origem de rede ultrapassa o limite de pedidos na janela
- **THEN** responde 429 com `{ "erro": "limite_excedido" }` e o cabeçalho `Retry-After`

#### Scenario: Teto de consultas externas
- **WHEN** o total de consultas ao Open Food Facts da instância passa do teto por minuto
- **THEN** a função responde 429 com `{ "erro": "limite_excedido" }` para códigos que não estão no cache

### Requirement: Segredos e configuração fora do código
O contato do `User-Agent`, a lista `ORIGENS_PERMITIDAS` e a chave de serviço do Supabase SHALL ser lidos de variáveis de ambiente da função. Nenhum desses valores SHALL constar no repositório, no `index.html` ou em logs.

#### Scenario: Variável ausente
- **WHEN** a função inicia sem o contato do `User-Agent` ou sem `ORIGENS_PERMITIDAS`
- **THEN** responde 502 com `{ "erro": "servico_indisponivel" }` e não consulta nada

#### Scenario: Registro de logs
- **WHEN** a função registra um erro
- **THEN** o registro não contém a chave de serviço nem o contato configurado
