# about-support-info Specification

## Purpose
TBD - created by archiving change add-about-support-info. Update Purpose after archive.
## Requirements
### Requirement: Card "Sobre o app" na tela de Perfil
O sistema SHALL exibir, no final da tela de Perfil, um card "Sobre o app" com o nome do app, a versão atual, o link do GitHub do autor e os dados para colaboração via Pix.

#### Scenario: Card visível no Perfil
- **WHEN** o usuário abre a aba Perfil
- **THEN** o card "Sobre o app" aparece após a seção "Dados", com o link do GitHub e a chave Pix, e o rodapé com a versão `1.2.0` logo abaixo

#### Scenario: Card ausente nas outras abas
- **WHEN** o usuário está na aba Diário ou Progresso
- **THEN** o card "Sobre o app" não é exibido

### Requirement: Link do GitHub do autor
O sistema SHALL exibir um link para `https://github.com/Wiooll` que abre em nova aba, sem dar acesso à janela de origem.

#### Scenario: Abrir o GitHub
- **WHEN** o usuário toca no link do GitHub
- **THEN** o perfil `https://github.com/Wiooll` abre em uma nova aba do navegador
- **AND** o link possui `rel="noopener noreferrer"`

### Requirement: Chave Pix exibida e copiável
O sistema SHALL exibir a chave Pix `ae34b296-d003-4444-9d52-49e9399f45ab` por completo, em campo somente leitura, e um botão "Copiar chave Pix" que copia a chave para a área de transferência.

#### Scenario: Copiar com sucesso
- **WHEN** o usuário toca em "Copiar chave Pix" e o navegador permite a cópia
- **THEN** a área de transferência passa a conter exatamente `ae34b296-d003-4444-9d52-49e9399f45ab`
- **AND** o botão mostra "Chave copiada!" por cerca de 2 segundos e volta ao texto original

#### Scenario: Cópia indisponível
- **WHEN** o usuário toca em "Copiar chave Pix" e nem a API de área de transferência nem a alternativa funcionam
- **THEN** o botão mostra "Copie manualmente" e a chave continua visível e selecionável no campo
- **AND** nenhum erro é exibido ao usuário nem interrompe o app

#### Scenario: Campo somente leitura
- **WHEN** o usuário foca o campo da chave Pix
- **THEN** o texto é selecionado por inteiro e não pode ser editado

### Requirement: Texto de convite à colaboração
O sistema SHALL exibir uma frase curta explicando que o GitHub e o Pix servem para colaborar com o desenvolvimento do app, com a ortografia correta em português do Brasil.

#### Scenario: Texto de convite
- **WHEN** o card "Sobre o app" é exibido
- **THEN** o texto informa que a colaboração é voluntária e pode ser feita por código no GitHub ou por apoio via Pix

### Requirement: Versão visível e consistente
O sistema SHALL mostrar a versão do app ao usuário, lida de uma constante única, e o `README.md` SHALL indicar a mesma versão.

#### Scenario: Versão coincide com a documentação
- **WHEN** a versão exibida no card é comparada com a "Versão atual" do `README.md`
- **THEN** ambas são `1.2.0`

### Requirement: Sem alteração nos dados do usuário
O sistema SHALL manter inalterados o formato e o conteúdo dos dados salvos no `localStorage` (chave `pratocheio`).

#### Scenario: Dados existentes preservados
- **WHEN** um usuário com registros salvos abre o app na versão `1.2.0`
- **THEN** todos os registros, metas e pesos continuam disponíveis sem migração

#### Scenario: Apagar dados não afeta o card
- **WHEN** o usuário usa "Apagar todos os dados"
- **THEN** o card "Sobre o app" continua exibindo as mesmas informações

