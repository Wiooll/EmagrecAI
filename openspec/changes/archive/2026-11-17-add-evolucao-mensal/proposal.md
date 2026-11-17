## Why

A aba Progresso mostra só os últimos 30 pesos registrados e as calorias dos últimos 7 dias. Quem acompanha o emagrecimento não consegue ver "como foi o mês" nem comparar com o mês anterior, que é a leitura natural para saber se a estratégia está funcionando. Os dados para isso já existem no app (pesos e refeições por dia), então falta apenas a visão mensal.

## What Changes

- Novo card **Evolução mensal** na aba Progresso, com navegação por mês (‹ mês anterior / próximo mês ›). Abre no mês atual e não avança além dele.
- Resumo do mês selecionado:
  - **Peso**: primeiro e último peso registrados no mês, variação em kg e distância até a meta.
  - **Calorias**: média diária nos dias registrados, quantidade de dias registrados e quantidade de dias acima da meta.
  - **Água**: média diária nos dias registrados e dias em que a meta foi atingida.
- Gráfico de linha do peso ao longo do mês e gráfico de barras das calorias por dia do mês, com a linha da meta.
- Comparação com o mês anterior (diferença na variação de peso e na média de calorias), exibida só quando os dois meses têm dados.
- Estados vazios claros quando o mês não tem registros.
- Nova versão do app exibida no Perfil, atualização do `sw.js` e do `README.md`.

Não há mudanças **BREAKING**. Nada é gravado ou sincronizado: a evolução mensal é calculada a partir dos dados já existentes (`S.weights`, `S.log`, `S.water`), então vale para visitante e para conta, inclusive sem internet. O gráfico de peso e o de calorias da semana continuam como estão.

## Capabilities

### New Capabilities
- `monthly-progress`: visão mensal na aba Progresso, com navegação entre meses, resumo de peso, calorias e água, gráficos do mês e comparação com o mês anterior.

### Modified Capabilities
<!-- Nenhuma: os requisitos das specs existentes não mudam. -->

## Impact

- **Código do app**: `index.html` (função `progress()`, tratamento de eventos `data-a`, estado do mês selecionado, funções de cálculo do mês, estilos do card). Sem bibliotecas novas; os gráficos usam SVG, como os atuais.
- **Versão e PWA**: `VERSAO` do `index.html` e do `sw.js` (iguais), hash SHA-256 da CSP do script inline, `README.md` (versão, "Novo na x.y.z", histórico). A numeração depende da ordem de implementação em relação ao `add-photo-food-capture`.
- **Banco e sincronização**: nenhuma mudança. Nenhuma migração do Supabase, nenhuma nova gravação na fila.
- **Segurança e privacidade**: nenhum dado novo é coletado nem enviado. Textos vindos dos dados continuam passando por `esc()` se forem inseridos em HTML.
- **Performance**: o cálculo percorre no máximo 31 dias por render, sem impacto perceptível.
- **Fora de escopo**: exportar relatório, metas mensais, filtros por intervalo livre, evolução anual e de macronutrientes.
