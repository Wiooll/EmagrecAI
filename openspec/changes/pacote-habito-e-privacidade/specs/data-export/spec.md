## ADDED Requirements

### Requirement: Botão de exportar dados
O sistema SHALL exibir no card "Dados" do Perfil o botão "Exportar dados (CSV)", disponível no modo visitante e com conta, inclusive sem internet.

#### Scenario: Modo visitante
- **WHEN** o usuário está sem login e toca em "Exportar dados (CSV)"
- **THEN** o app gera o arquivo com os dados do navegador

#### Scenario: Com conta e sem internet
- **WHEN** o usuário está logado, sem conexão, e toca em "Exportar dados (CSV)"
- **THEN** o app gera o arquivo com os dados locais da conta, sem requisição de rede

### Requirement: Conteúdo do arquivo
O sistema SHALL gerar um único arquivo `emagrecai-AAAA-MM-DD.csv`, com a data do dia da exportação, em UTF-8 com marca de ordem de bytes (BOM), separador `;`, números com ponto decimal e cabeçalho `data;tipo;refeicao;item;porcao;gramas;kcal;carboidratos_g;proteinas_g;gorduras_g;agua_ml;peso_kg`. O arquivo SHALL ter uma linha `alimento` para cada lançamento, uma linha `agua` para cada dia com água registrada maior que zero e uma linha `peso` para cada pesagem, ordenadas por data. As datas SHALL usar o formato `AAAA-MM-DD`.

#### Scenario: Lançamento de alimento
- **WHEN** existe um lançamento de 150 g de arroz no almoço de um dia
- **THEN** o arquivo tem uma linha `alimento` com a data, a refeição "Almoço", o nome, a porção, os gramas, as calorias e os macros

#### Scenario: Água e peso
- **WHEN** um dia tem 1500 ml de água e uma pesagem de 72,4 kg
- **THEN** o arquivo tem uma linha `agua` com 1500 e uma linha `peso` com 72.4 para esse dia

#### Scenario: Sem dados
- **WHEN** não há nenhum registro
- **THEN** o app avisa que não há dados para exportar e não gera o arquivo

### Requirement: Proteção contra injeção de fórmulas
O sistema SHALL colocar todo campo de texto entre aspas duplas, duplicando aspas internas, e SHALL prefixar com apóstrofo (`'`) qualquer texto que comece com `=`, `+`, `-`, `@`, tabulação ou retorno de carro, para que planilhas não executem o conteúdo como fórmula.

#### Scenario: Nome começando com sinal de igual
- **WHEN** um alimento se chama `=SOMA(A1:A2)`
- **THEN** a célula do arquivo contém o texto com o apóstrofo na frente e a planilha o exibe como texto

#### Scenario: Nome com aspas e ponto e vírgula
- **WHEN** um alimento se chama `Pão "caseiro"; integral`
- **THEN** a linha do arquivo mantém o campo íntegro, sem criar colunas extras

### Requirement: Entrega do arquivo
O sistema SHALL oferecer o arquivo pelo compartilhamento do sistema, quando houver suporte a compartilhar arquivos, ou por download, caso contrário. O sistema SHALL tratar o cancelamento do compartilhamento sem mostrar erro e SHALL avisar o usuário se não for possível gerar o arquivo.

#### Scenario: Navegador sem compartilhamento de arquivos
- **WHEN** o navegador não suporta compartilhar arquivos
- **THEN** o arquivo é baixado e um aviso informa que ele foi gerado

#### Scenario: Compartilhamento cancelado
- **WHEN** o usuário cancela a janela de compartilhamento
- **THEN** nenhuma mensagem de erro é exibida
