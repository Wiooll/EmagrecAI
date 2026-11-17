# cloud-data-sync Specification

## Purpose
TBD - created by archiving change add-supabase-database. Update Purpose after archive.
## Requirements
### Requirement: Esquema do banco com validação
O sistema SHALL armazenar os dados da conta nas tabelas `profiles`, `food_entries`, `water_logs`, `weight_logs` e `custom_foods` do Supabase, cada uma com `user_id` referenciando `auth.users` com exclusão em cascata, e com restrições `CHECK` para tipos, listas fechadas (`meal`, `goal`, `sex`) e limites numéricos.

#### Scenario: Refeição inválida
- **WHEN** uma gravação envia `meal` fora de `cafe`, `almoco`, `jantar` ou `lanche`
- **THEN** o banco rejeita a linha

#### Scenario: Valor fora do limite
- **WHEN** uma gravação envia calorias negativas ou gramas iguais a zero
- **THEN** o banco rejeita a linha

### Requirement: Isolamento por usuário com RLS
O sistema SHALL manter Row Level Security habilitada em todas as tabelas, com políticas de `select`, `insert`, `update` e `delete` restritas a `user_id = auth.uid()` para o papel `authenticated`, e SHALL NOT conceder acesso ao papel `anon`.

#### Scenario: Leitura de outro usuário
- **WHEN** o usuário A consulta `food_entries` com a sessão dele
- **THEN** a resposta contém somente as linhas cujo `user_id` é o de A

#### Scenario: Gravação em nome de outro usuário
- **WHEN** o usuário A tenta inserir ou atualizar uma linha com o `user_id` de B
- **THEN** o banco rejeita a operação

#### Scenario: Acesso sem login
- **WHEN** uma requisição usa apenas a chave publicável, sem sessão
- **THEN** nenhuma linha é retornada nem gravada

### Requirement: Gravação das alterações da conta
O sistema SHALL, com sessão ativa, gravar no banco cada alteração de diário (adicionar e remover alimento), água, peso, perfil e alimentos personalizados, usando identificadores gerados no cliente para que o reenvio não duplique linhas.

#### Scenario: Adicionar alimento logado
- **WHEN** o usuário logado adiciona um alimento ao almoço
- **THEN** a linha é gravada em `food_entries` com o `user_id` da conta e o app mostra o registro na hora

#### Scenario: Remover alimento logado
- **WHEN** o usuário logado remove um alimento
- **THEN** a linha correspondente é removida de `food_entries`

#### Scenario: Reenvio da mesma operação
- **WHEN** uma operação já enviada é reenviada pela fila
- **THEN** o banco continua com uma única linha para aquele identificador

#### Scenario: Peso salvo
- **WHEN** o usuário logado salva o peso do dia
- **THEN** `weight_logs` recebe ou atualiza a linha do dia e `profiles.weight_kg` é atualizado

### Requirement: Carregamento dos dados da conta
O sistema SHALL carregar do banco todas as linhas do usuário ao entrar e ao abrir o app com sessão, em páginas de no máximo 1000 linhas, e SHALL converter o resultado para o estado usado pela interface.

#### Scenario: Mais de 1000 registros
- **WHEN** a conta tem mais de 1000 linhas em `food_entries`
- **THEN** o app lê todas as páginas e exibe o histórico completo

#### Scenario: Conta nova
- **WHEN** o usuário entra com uma conta sem linhas
- **THEN** o app usa o perfil padrão e dias sem registros

### Requirement: Fila de gravações pendentes
O sistema SHALL colocar em uma fila local as gravações que falharem por falta de conexão e SHALL reenviá-las, em ordem, ao reabrir o app e quando o navegador voltar a ficar online.

#### Scenario: Gravar sem internet
- **WHEN** o usuário logado adiciona um alimento sem conexão
- **THEN** o registro aparece na interface, a operação entra na fila e o card "Conta" indica as alterações pendentes

#### Scenario: Conexão restabelecida
- **WHEN** o navegador volta a ficar online com operações na fila
- **THEN** o app as envia em ordem e o card "Conta" volta a indicar "Sincronizado"

#### Scenario: Operação rejeitada pelo banco
- **WHEN** o banco rejeita uma operação por erro definitivo (por exemplo, violação de `CHECK`)
- **THEN** o app descarta essa operação, avisa o usuário e continua enviando as demais

### Requirement: Atualização entre dispositivos
O sistema SHALL recarregar os dados da conta quando o app voltar a ficar visível, no máximo uma vez a cada 30 segundos, depois de enviar a fila pendente.

#### Scenario: Registro feito em outro dispositivo
- **WHEN** o usuário registra um alimento no celular e depois volta à aba do computador
- **THEN** o computador exibe o novo registro sem recarregar a página

#### Scenario: Fila pendente antes de recarregar
- **WHEN** há operações na fila no momento da atualização
- **THEN** o app as envia antes de ler o banco, para não sobrescrever o estado local com dados antigos

### Requirement: Cache local da conta
O sistema SHALL manter uma cópia da conta em `pratocheio:<user_id>` e SHALL montar essa chave somente com um `user_id` no formato UUID.

#### Scenario: Identificador inválido
- **WHEN** o último usuário salvo contém um `user_id` que não é um UUID
- **THEN** o app descarta o registro e usa o modo visitante

#### Scenario: Duas contas no mesmo navegador
- **WHEN** a conta A sai e a conta B entra
- **THEN** o app mostra somente os dados da conta B

### Requirement: Apagar dados limitado ao contexto ativo
O sistema SHALL apagar, em "Apagar todos os dados", somente os dados do contexto ativo (visitante ou conta), informando na confirmação qual contexto será apagado, e SHALL NOT excluir a conta de login.

#### Scenario: Apagar logado
- **WHEN** o usuário logado confirma "Apagar todos os dados"
- **THEN** as linhas dele nas cinco tabelas são removidas, o cache e a fila da conta são limpos, `pratocheio` permanece e a sessão continua ativa

#### Scenario: Apagar logado sem conexão
- **WHEN** o usuário logado confirma o apagamento sem conexão
- **THEN** o app limpa o cache local na hora e a operação de apagar entra na fila

#### Scenario: Apagar como visitante
- **WHEN** o visitante confirma "Apagar todos os dados"
- **THEN** somente `pratocheio` é reiniciada e os dados das contas permanecem

### Requirement: Falha de armazenamento ou de rede tratada
O sistema SHALL continuar operando, sem exceção não tratada, quando o `localStorage` estiver indisponível ou cheio ou quando o Supabase não responder.

#### Scenario: Armazenamento indisponível
- **WHEN** a leitura ou a gravação no `localStorage` lança erro
- **THEN** o app usa os dados padrão ou o estado em memória e permanece utilizável

#### Scenario: Supabase fora do ar
- **WHEN** o Supabase não responde ou retorna erro 5xx
- **THEN** o app mantém o cache local, enfileira as gravações e exibe "Sem conexão"

