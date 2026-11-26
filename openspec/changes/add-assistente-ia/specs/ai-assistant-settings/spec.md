## ADDED Requirements

### Requirement: Card "Assistente de IA" no Perfil
O sistema SHALL exibir no Perfil o card "Assistente de IA" com um interruptor, desligado por padrão. Com o interruptor desligado, o app SHALL se comportar como antes, sem exibir o registro por texto e sem fazer nenhuma chamada a provedores de IA.

#### Scenario: Primeira abertura
- **WHEN** o usuário abre o Perfil sem nunca ter configurado o assistente
- **THEN** o card aparece com o interruptor desligado e um texto explicando que o recurso é opcional e usa a chave de API do próprio usuário

#### Scenario: Assistente desligado
- **WHEN** o interruptor está desligado
- **THEN** a janela de adicionar alimento não mostra a aba de registro por texto e nenhuma requisição é enviada à OpenAI ou ao Google

### Requirement: Escolha do provedor e informe da chave
O sistema SHALL permitir escolher entre OpenAI e Google Gemini e informar a chave de API em um campo do tipo senha, com o botão "Conectar". A chave SHALL ser removida da tela depois de conectar, mostrando apenas os quatro últimos caracteres.

#### Scenario: Escolher provedor
- **WHEN** o usuário liga o interruptor e escolhe um provedor
- **THEN** o app mostra o campo da chave e um link de ajuda para obter a chave naquele provedor

#### Scenario: Chave vazia
- **WHEN** o usuário toca em "Conectar" com o campo vazio
- **THEN** o app mostra o aviso "Informe a chave de API" e não faz requisição

### Requirement: Lista de modelos carregada depois da chave
O sistema SHALL carregar a lista de modelos do provedor somente depois que o usuário informar a chave e tocar em "Conectar". O sistema SHALL mostrar apenas modelos de conversa, excluindo modelos de imagem, áudio e embeddings, e SHALL permitir ao usuário escolher um deles.

#### Scenario: Chave válida
- **WHEN** o usuário informa uma chave válida e toca em "Conectar"
- **THEN** o app mostra uma lista de modelos de conversa do provedor e permite escolher um

#### Scenario: Chave inválida
- **WHEN** o provedor recusa a chave
- **THEN** o app mostra "Chave inválida" e não exibe lista de modelos nem ativa o registro por texto

#### Scenario: Sem internet
- **WHEN** o usuário toca em "Conectar" sem conexão
- **THEN** o app avisa que é preciso estar online para carregar os modelos e mantém as configurações anteriores

#### Scenario: Modelo escolhido deixou de existir
- **WHEN** o usuário reabre o card e o modelo salvo não está mais na lista do provedor
- **THEN** o app pede que o usuário escolha outro modelo e desativa o registro por texto até lá

### Requirement: Chave guardada somente no aparelho
O sistema SHALL guardar a chave, o provedor, o modelo e o consentimento apenas no `localStorage` do aparelho. O sistema SHALL NOT enviar esses dados ao Supabase, incluí-los no CSV exportado, escrevê-los em URLs ou registrá-los em logs. No Gemini, a chave SHALL ser enviada no cabeçalho `x-goog-api-key`.

#### Scenario: Conta com vários aparelhos
- **WHEN** o usuário configura o assistente em um aparelho e entra com a mesma conta em outro
- **THEN** o outro aparelho mostra o assistente desligado e sem chave

#### Scenario: Exportar CSV
- **WHEN** o usuário exporta os dados em CSV
- **THEN** o arquivo não contém a chave nem as configurações do assistente

### Requirement: Testar o modelo escolhido
O sistema SHALL exibir o botão "Testar modelo" quando houver chave e modelo escolhido. O teste SHALL enviar ao modelo apenas o texto fixo "uma banana", pelo mesmo caminho do registro por texto, e SHALL mostrar o resultado no card. O teste SHALL NOT enviar dados do usuário nem gravar nada no diário. O botão SHALL ficar desativado enquanto o teste estiver em andamento.

#### Scenario: Modelo funcionando
- **WHEN** o usuário toca em "Testar modelo" e o modelo usa as ferramentas e propõe um alimento do catálogo
- **THEN** o card mostra que o modelo está funcionando, o alimento entendido e o tempo de resposta

#### Scenario: Modelo sem ferramentas
- **WHEN** o modelo responde sem usar as ferramentas do app
- **THEN** o card avisa que o modelo não usou as ferramentas e sugere escolher outro

#### Scenario: Erro do provedor
- **WHEN** o provedor responde com erro de chave, limite, sobrecarga ou o aparelho está sem internet
- **THEN** o card mostra "O teste falhou." seguido da mensagem do erro, sem exibir a chave

#### Scenario: Nada é gravado
- **WHEN** o teste termina, com sucesso ou não
- **THEN** o diário não muda

### Requirement: Remover a chave e limpeza automática
O sistema SHALL oferecer o botão "Remover chave", que apaga chave, modelo e consentimento e desliga o assistente. O sistema SHALL apagar esses dados também ao sair da conta e em "Apagar todos os dados".

#### Scenario: Remover a chave
- **WHEN** o usuário toca em "Remover chave"
- **THEN** a chave, o modelo e o consentimento são apagados e o interruptor volta para desligado

#### Scenario: Sair da conta
- **WHEN** o usuário sai da conta
- **THEN** os dados do assistente são apagados do navegador

#### Scenario: Apagar todos os dados
- **WHEN** o usuário confirma "Apagar todos os dados"
- **THEN** os dados do assistente são apagados do navegador
