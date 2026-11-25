## ADDED Requirements

### Requirement: Excluir conta
O sistema SHALL exibir o botão "Excluir conta" no card "Conta" do Perfil somente quando o usuário estiver logado. Ao tocar nele, o sistema SHALL explicar que a ação é irreversível, que apaga a conta e todos os dados da nuvem (perfil, alimentos lançados, água, peso e alimentos cadastrados), que não revoga a autorização do app na conta Google e que os dados do modo visitante deste navegador não são apagados. O sistema SHALL sugerir exportar os dados antes e SHALL exigir que o usuário digite `EXCLUIR` para confirmar.

#### Scenario: Usuário logado
- **WHEN** o usuário está logado e abre o Perfil
- **THEN** o card "Conta" mostra o botão "Excluir conta"

#### Scenario: Modo visitante
- **WHEN** o usuário não está logado
- **THEN** o botão "Excluir conta" não é exibido

#### Scenario: Confirmação incorreta
- **WHEN** o usuário digita um texto diferente de `EXCLUIR` ou cancela
- **THEN** nada é apagado e o app permanece como estava

### Requirement: Função de exclusão no servidor
O sistema SHALL ter a função `excluir-conta` no Supabase, que aceita somente `POST`, valida a origem da requisição contra `ORIGENS_PERMITIDAS`, valida o token de acesso do cabeçalho `Authorization` com o serviço de autenticação e remove somente o usuário dono desse token. A função NÃO SHALL aceitar identificador de usuário no corpo da requisição. A chave de serviço SHALL existir apenas no ambiente da função. A exclusão do usuário SHALL apagar em cascata as linhas de `profiles`, `food_entries`, `water_logs`, `weight_logs` e `custom_foods` do usuário.

#### Scenario: Token válido
- **WHEN** a função recebe um `POST` de uma origem permitida com um token válido
- **THEN** o usuário do token é removido, os dados dele são apagados em cascata e a resposta é `200` com `{ "ok": true }`

#### Scenario: Token ausente ou inválido
- **WHEN** a função recebe a requisição sem token ou com token inválido ou expirado
- **THEN** a resposta é `401` com o código `nao_autenticado` e nada é apagado

#### Scenario: Origem não permitida
- **WHEN** a requisição vem de uma origem fora de `ORIGENS_PERMITIDAS`
- **THEN** a resposta é `403` com o código `origem_nao_permitida` e nada é apagado

#### Scenario: Identificador no corpo
- **WHEN** a requisição inclui um identificador de outro usuário no corpo
- **THEN** a função ignora o identificador e age apenas sobre o dono do token

#### Scenario: Falha no serviço
- **WHEN** o serviço de autenticação falha ao excluir
- **THEN** a resposta é `502` com o código `servico_indisponivel`, sem detalhes internos

### Requirement: Limpeza local depois da exclusão
O sistema SHALL, somente depois de receber a confirmação de sucesso da função, descartar a fila de pendências da conta, apagar do navegador `pratocheio:<id>`, a fila e a recusa de importação da conta, encerrar a sessão local e voltar ao modo visitante, avisando o usuário que a conta foi excluída. O sistema NÃO SHALL apagar os dados do modo visitante. Em caso de erro, o sistema SHALL manter todos os dados locais e a sessão e SHALL exibir uma mensagem clara.

#### Scenario: Exclusão concluída
- **WHEN** a função responde com sucesso
- **THEN** os dados locais da conta são apagados, o app volta ao modo visitante com os dados do visitante intactos e um aviso confirma a exclusão

#### Scenario: Sem internet
- **WHEN** o usuário confirma a exclusão sem conexão
- **THEN** o app avisa que é preciso estar online e não apaga nada

#### Scenario: Erro na função
- **WHEN** a função responde com erro
- **THEN** o app mantém a sessão e os dados e mostra uma mensagem de erro

#### Scenario: Função ainda não publicada
- **WHEN** a função `excluir-conta` não está publicada
- **THEN** o app mostra que a exclusão está indisponível e não apaga nada

### Requirement: Proteção contra toques repetidos
O sistema SHALL impedir que a exclusão seja enviada mais de uma vez ao mesmo tempo, desabilitando o botão enquanto a requisição estiver em andamento.

#### Scenario: Toques repetidos
- **WHEN** o usuário toca duas vezes seguidas em confirmar
- **THEN** apenas uma requisição é enviada
