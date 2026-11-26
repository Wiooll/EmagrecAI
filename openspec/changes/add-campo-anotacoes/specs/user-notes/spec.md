## ADDED Requirements

### Requirement: Campo fixo de anotações na aba Progresso
O sistema SHALL exibir, na aba Progresso, um card "Anotações" com um único campo de texto livre, limite de 2000 caracteres, contador "x/2000" e o botão "Salvar anotações". O texto SHALL ser o mesmo em qualquer dia e SHALL aparecer no campo sempre que a aba for aberta.

#### Scenario: Sem anotações
- **WHEN** o usuário abre a aba Progresso e nunca salvou anotações
- **THEN** o campo aparece vazio, com texto de apoio e o contador "0/2000"

#### Scenario: Com anotações
- **WHEN** o usuário abre a aba Progresso depois de salvar um texto
- **THEN** o campo mostra o texto salvo, inclusive em outro dia

#### Scenario: Limite de caracteres
- **WHEN** o usuário tenta digitar mais de 2000 caracteres
- **THEN** o campo não aceita os caracteres excedentes

### Requirement: Salvar e apagar as anotações
O sistema SHALL salvar o texto no aparelho ao tocar em "Salvar anotações" e avisar que foi salvo, preservando as quebras de linha. O sistema SHALL apagar o texto quando o campo estiver vazio ou só com espaços ao salvar.

#### Scenario: Salvar
- **WHEN** o usuário digita um texto e toca em "Salvar anotações"
- **THEN** o texto é salvo, aparece o aviso "Anotações salvas" e o texto continua ao reabrir o app

#### Scenario: Apagar
- **WHEN** o usuário apaga todo o texto e toca em "Salvar anotações"
- **THEN** o texto é removido e o campo fica vazio

### Requirement: Sincronização com a conta
O sistema SHALL, quando houver login, gravar o texto na tabela `user_notes` do Supabase pela fila de gravações pendentes, mantendo só a última alteração, e SHALL restaurá-lo ao entrar em outro aparelho. No modo visitante, o texto SHALL ficar apenas no aparelho. A tabela SHALL ter RLS que permita ao usuário acessar somente a própria linha.

#### Scenario: Gravação offline
- **WHEN** o usuário logado salva as anotações sem internet
- **THEN** o texto fica salvo localmente, a alteração entra como pendente e é enviada quando a conexão voltar

#### Scenario: Várias edições antes de sincronizar
- **WHEN** o usuário salva as anotações várias vezes antes de sincronizar
- **THEN** apenas a última versão permanece na fila

#### Scenario: Outro aparelho
- **WHEN** o usuário entra com a mesma conta em outro aparelho
- **THEN** o campo mostra o texto salvo na conta

#### Scenario: Migração de visitante
- **WHEN** o usuário com anotações no modo visitante entra pela primeira vez com uma conta que ainda não tem anotações e escolhe levar os dados
- **THEN** o texto do visitante é enviado à conta

### Requirement: Segurança e privacidade das anotações
O sistema SHALL limitar o texto a 2000 caracteres ao salvar, ao enviar e na tabela, ignorar valores inválidos lidos do armazenamento, exibir o texto sempre escapado e incluir as anotações em "Apagar dados".

#### Scenario: Texto com HTML
- **WHEN** as anotações contêm `<img src=x onerror=alert(1)>`
- **THEN** o texto é exibido literalmente e nada é executado

#### Scenario: Apagar dados
- **WHEN** o usuário confirma "Apagar dados"
- **THEN** as anotações locais e, se houver conta, as da nuvem são removidas
