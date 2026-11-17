## ADDED Requirements

### Requirement: Modo visitante preservado
O sistema SHALL, sem sessão, ler e gravar os dados na chave `pratocheio` do `localStorage`, no mesmo formato de hoje, sem enviar nenhum dado ao Supabase.

#### Scenario: Usuário existente abre a nova versão
- **WHEN** um usuário que já usava o app abre a nova versão sem fazer login
- **THEN** o app lê seus dados de `pratocheio` exatamente como antes

#### Scenario: Registro como visitante
- **WHEN** o visitante adiciona um alimento
- **THEN** o registro é gravado em `pratocheio` e nenhuma requisição de dados é feita ao Supabase

### Requirement: Dados do visitante nunca são alterados pelo login
O sistema SHALL NOT modificar nem apagar a chave `pratocheio` ao entrar, ao sair ou ao importar dados para a conta.

#### Scenario: Entrar e sair
- **WHEN** o usuário entra com Google e depois sai
- **THEN** o conteúdo de `pratocheio` é idêntico ao de antes do login

### Requirement: Importação opcional no primeiro login
O sistema SHALL perguntar se o usuário deseja enviar os dados do navegador para a conta quando a conta não tiver nenhuma linha no banco e `pratocheio` contiver dados, e SHALL enviá-los pela fila de gravações apenas se o usuário confirmar.

#### Scenario: Importação confirmada
- **WHEN** a conta está vazia, `pratocheio` tem dados e o usuário confirma
- **THEN** perfil, registros de alimento, água, peso e alimentos personalizados são gravados na conta, as entradas antigas recebem identificadores novos e `pratocheio` permanece intacta

#### Scenario: Importação recusada
- **WHEN** o usuário recusa a pergunta
- **THEN** a conta começa com os dados padrão, `pratocheio` permanece intacta e a pergunta não é repetida enquanto a conta continuar sem dados

#### Scenario: Conta já possui dados
- **WHEN** a conta já tem linhas no banco
- **THEN** o app carrega os dados da conta e não faz a pergunta

#### Scenario: Visitante sem dados
- **WHEN** a conta está vazia e `pratocheio` não existe ou contém apenas os valores padrão
- **THEN** o app não faz a pergunta

### Requirement: Importação sem duplicar
O sistema SHALL garantir que enviar os mesmos dados do visitante mais de uma vez (por exemplo, após falha e nova tentativa) não crie linhas duplicadas na conta.

#### Scenario: Importação interrompida
- **WHEN** a conexão cai no meio do envio e a fila é retomada
- **THEN** cada registro aparece uma única vez no banco
