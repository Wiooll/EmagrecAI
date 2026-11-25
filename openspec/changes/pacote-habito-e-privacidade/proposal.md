## Why

Registrar a mesma comida todo dia é o maior atrito do diário, e hoje a busca sempre começa do zero. O app também não ajuda a manter a constância, que é onde a maioria desiste. Por fim, peso e hábitos alimentares são dados sensíveis, e o app não permite levar os dados embora. O app é usado só pelo autor e por conhecidos.

## What Changes

- **Favoritos e recentes:** ao abrir a busca sem digitar nada, aparecem primeiro os alimentos favoritos e os usados recentemente. Cada alimento pode ser favoritado na tela de detalhe. Os favoritos ficam só no aparelho (`localStorage`), como já ocorre com lembretes e itens ocultos.
- **Constância e resumo semanal:** novo card "Constância" na aba Progresso, com sequência atual e melhor sequência de dias registrados, e novo card "Resumo da semana", com os últimos 7 dias comparados aos 7 anteriores (média de calorias, dias dentro da meta, dias registrados, variação de peso e dias com a meta de água). Tudo é calculado no aparelho, sem gravar nada novo.
- **Exportar dados:** botão no card "Dados" do Perfil que gera um arquivo CSV com alimentos, água e peso. Funciona no modo visitante e com conta, sem internet.
- Atualização de versão (`VERSAO` em `index.html` e `sw.js`), hash da CSP e README.

Nenhuma mudança é incompatível com as versões anteriores. Não há migração de banco.

## Capabilities

### New Capabilities
- `favorite-recent-foods`: favoritos e recentes na busca de alimentos.
- `consistency-weekly-summary`: sequência de dias registrados e resumo dos últimos 7 dias na aba Progresso.
- `data-export`: exportação dos registros em CSV.

### Modified Capabilities
- `food-catalog`: a busca com campo vazio passa a mostrar favoritos e recentes antes da lista padrão.

## Impact

- `index.html`: busca (`list`, `drawSheet`), detalhe do alimento, abas Progresso e Perfil, novas funções de favoritos, constância, resumo e exportação. O script inline muda, então o hash da CSP precisa ser recalculado.
- `sw.js`: apenas a constante `VERSAO`.
- `README.md`: funcionalidades, histórico e seção de segurança.
- Fora do escopo: exclusão de conta (adiada por decisão do usuário), exercício e calorias gastas, sincronização dos favoritos entre aparelhos e receitas.
