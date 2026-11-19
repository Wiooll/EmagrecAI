## ADDED Requirements

### Requirement: Editar alimento personalizado
O sistema SHALL permitir editar nome, unidade, peso da unidade e valores nutricionais por 100 g de um alimento personalizado, sem alterar lançamentos já feitos no diário.

#### Scenario: Botão editar só em personalizados
- **WHEN** a lista de busca é exibida
- **THEN** apenas alimentos personalizados mostram o botão "Editar"; alimentos da base fixa não

#### Scenario: Abrir a edição
- **WHEN** o usuário toca em "Editar" em um alimento personalizado
- **THEN** o formulário abre preenchido com os valores atuais e o botão "Salvar alterações"

#### Scenario: Salvar alterações
- **WHEN** o usuário altera os dados, com nome preenchido, e salva
- **THEN** o alimento é atualizado (mesmo `id`) e aparece com os novos valores na busca

#### Scenario: Nome vazio
- **WHEN** o usuário tenta salvar sem nome
- **THEN** nada é salvo e o campo de nome recebe o foco

#### Scenario: Lançamentos antigos preservados
- **WHEN** um alimento personalizado é editado
- **THEN** os lançamentos anteriores no diário mantêm seus valores originais

#### Scenario: Sincronização
- **WHEN** o usuário está logado e salva a edição
- **THEN** a alteração segue pela fila de sincronização por upsert com o mesmo `id`

### Requirement: Versão do app atualizada
O sistema SHALL exibir a versão `1.5.0` no rodapé do Perfil, com a mesma versão no `sw.js`.

#### Scenario: Conferir a versão
- **WHEN** o app é aberto
- **THEN** o rodapé do Perfil mostra `1.5.0` e o cache `emagrecai-1.5.0` é criado
