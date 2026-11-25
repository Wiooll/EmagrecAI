## Why

Registrar a mesma comida todo dia é o maior atrito do diário, e hoje a busca sempre começa do zero. O app também não ajuda a manter a constância, que é onde a maioria desiste. Por fim, peso e hábitos alimentares são dados sensíveis, e o README admite que não há exportação nem exclusão de conta pelo app. O app é usado só pelo autor e por conhecidos, mas esses dados continuam sendo de saúde.

## What Changes

- **Favoritos e recentes:** ao abrir a busca sem digitar nada, aparecem primeiro os alimentos favoritos e os usados recentemente. Cada alimento pode ser favoritado na tela de detalhe. Os favoritos ficam só no aparelho (`localStorage`), como já ocorre com lembretes e itens ocultos.
- **Constância e resumo semanal:** novo card "Constância" na aba Progresso, com sequência atual e melhor sequência de dias registrados, e novo card "Resumo da semana", com os últimos 7 dias comparados aos 7 anteriores (média de calorias, dias dentro da meta, dias registrados, variação de peso e dias com a meta de água). Tudo é calculado no aparelho, sem gravar nada novo.
- **Exportar dados:** botão no card "Dados" do Perfil que gera um arquivo CSV com alimentos, água e peso. Funciona no modo visitante e com conta, sem internet.
- **Excluir conta:** botão no card "Conta" do Perfil, com confirmação digitada. Uma nova função do Supabase (`excluir-conta`) remove o usuário e, por `on delete cascade`, todos os seus dados. O app apaga os dados locais da conta e sai.
- Atualização de versão para 1.11.0 (`VERSAO` em `index.html` e `sw.js`), hash da CSP e README.

Nenhuma mudança é incompatível com as versões anteriores. Não há migração de banco.

## Capabilities

### New Capabilities
- `favorite-recent-foods`: favoritos e recentes na busca de alimentos.
- `consistency-weekly-summary`: sequência de dias registrados e resumo dos últimos 7 dias na aba Progresso.
- `data-export`: exportação dos registros em CSV.
- `account-deletion`: exclusão da conta e de todos os dados na nuvem pelo app.

### Modified Capabilities
- `food-catalog`: a busca com campo vazio passa a mostrar favoritos e recentes antes da lista padrão.
- `google-auth`: o card "Conta" ganha a ação de excluir conta, e o fluxo de saída é reaproveitado para limpar os dados locais.

## Impact

- `index.html`: busca (`list`, `drawSheet`), detalhe do alimento, abas Progresso e Perfil, novas funções de favoritos, constância, resumo, exportação e exclusão. O script inline muda, então o hash da CSP precisa ser recalculado.
- `sw.js`: apenas a constante `VERSAO`.
- `supabase/functions/excluir-conta/` (novo) e `supabase/config.toml`: nova função com a chave de serviço do projeto, que já existe como variável padrão das funções. Exige publicação (`supabase functions deploy excluir-conta`) e a variável `ORIGENS_PERMITIDAS`, que já é usada por `consultar-codigo`.
- `README.md`: funcionalidades, histórico, seção de segurança (remover o aviso de que não há exclusão de conta) e instruções de publicação da nova função.
- CSP: `connect-src` já inclui o endereço do Supabase, então a chamada à nova função não precisa de ajuste.
- Fora do escopo: exercício e calorias gastas (fica para um próximo pacote), sincronização dos favoritos entre aparelhos e receitas.
