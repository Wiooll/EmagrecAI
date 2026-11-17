## ADDED Requirements

### Requirement: Dados separados por contexto
O sistema SHALL gravar e ler os dados do app na chave `pratocheio` quando em modo visitante e na chave `pratocheio:<sub>` quando houver conta Google logada, sem misturar os dois conjuntos.

#### Scenario: Registro logado
- **WHEN** o usuário logado adiciona um alimento
- **THEN** o registro é salvo em `pratocheio:<sub>` e a chave `pratocheio` não é alterada

#### Scenario: Duas contas no mesmo navegador
- **WHEN** a conta A sai e a conta B entra
- **THEN** o sistema carrega somente os dados da conta B

#### Scenario: Chave do visitante preservada
- **WHEN** um usuário existente abre a nova versão sem fazer login
- **THEN** o sistema lê seus dados de `pratocheio` exatamente como antes

### Requirement: Importação opcional dos dados do visitante
O sistema SHALL perguntar se o usuário deseja importar os dados do modo visitante no primeiro login de uma conta que ainda não tem dados, e SHALL NOT apagar os dados do visitante.

#### Scenario: Primeiro login com dados de visitante
- **WHEN** a conta não tem `pratocheio:<sub>` e `pratocheio` contém dados, e o usuário confirma a importação
- **THEN** o sistema copia os dados para a conta e mantém os dados do visitante intactos

#### Scenario: Importação recusada
- **WHEN** o usuário recusa a importação
- **THEN** a conta começa com os dados padrão e os dados do visitante permanecem intactos

#### Scenario: Conta já possui dados
- **WHEN** a conta já tem `pratocheio:<sub>`
- **THEN** o sistema carrega esses dados e não faz a pergunta

### Requirement: Apagar dados limitado ao contexto ativo
O sistema SHALL apagar, no "Apagar todos os dados", apenas os dados do contexto ativo (visitante ou conta logada), e a mensagem de confirmação SHALL informar qual contexto será apagado.

#### Scenario: Apagar logado
- **WHEN** o usuário logado confirma "Apagar todos os dados"
- **THEN** somente os dados de `pratocheio:<sub>` são reiniciados e `pratocheio` permanece

#### Scenario: Apagar como visitante
- **WHEN** o visitante confirma "Apagar todos os dados"
- **THEN** somente `pratocheio` é reiniciada e os dados das contas permanecem

### Requirement: Chave de armazenamento derivada de valor validado
O sistema SHALL montar a chave `pratocheio:<sub>` somente com um `sub` que contenha apenas dígitos (1 a 40).

#### Scenario: Sub inválido
- **WHEN** a sessão salva contém um `sub` com letras, símbolos ou mais de 40 dígitos
- **THEN** o sistema descarta a sessão e usa o modo visitante

### Requirement: Falha de armazenamento tratada
O sistema SHALL continuar operando quando o `localStorage` estiver indisponível ou cheio, sem exceção não tratada.

#### Scenario: Armazenamento indisponível
- **WHEN** a leitura ou gravação no `localStorage` lança erro
- **THEN** o app usa os dados padrão em memória e permanece utilizável
