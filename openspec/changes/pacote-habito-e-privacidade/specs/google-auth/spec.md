## ADDED Requirements

### Requirement: Exclusão da conta pelo app
O sistema SHALL oferecer a exclusão da conta no card "Conta" do Perfil, conforme a capacidade `account-deletion`. A limpeza dos dados locais depois da exclusão SHALL apagar os mesmos dados que o botão "Sair" apaga (cache da conta, fila de pendências e recusa de importação) e SHALL preservar os dados do modo visitante.

#### Scenario: Conta excluída
- **WHEN** a exclusão da conta é concluída com sucesso
- **THEN** o app encerra a sessão, limpa os dados locais da conta e volta ao modo visitante

#### Scenario: Sair continua igual
- **WHEN** o usuário toca em "Sair"
- **THEN** o comportamento é o mesmo de antes, sem excluir a conta na nuvem
