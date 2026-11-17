## 1. Cálculo do mês

- [x] 1.1 Criar a variável de estado `mes` (`{a, m}`), iniciada no mês atual, ao lado de `cur` e `view` no `index.html`
- [x] 1.2 Criar `resumoMes(a, m)`: percorrer os dias do mês com `key(new Date(a, m, d))` e devolver pesos do mês (por dia), primeiro e último peso, variação, dias com calorias, média, dias acima da meta, dias com água, média de água e dias com a meta de água atingida, ignorando valores não finitos
- [x] 1.3 Criar a função que acha o mês do registro mais antigo (`S.weights`, `S.log`, `S.water`) para limitar o botão "mês anterior"
- [x] 1.4 Criar a lógica da comparação com o mês anterior (variação de peso e média de calorias), só quando o dado existe nos dois meses

## 2. Interface

- [x] 2.1 Criar o seletor de mês (‹ mês ano ›) reaproveitando o estilo de `.dnav`, com botões de 44 px, `aria-label` e estado desabilitado nos limites
- [x] 2.2 Criar o gráfico de linha do peso do mês, com eixo X por dia do mês, linha da meta, `role="img"` e `aria-label`
- [x] 2.3 Criar o gráfico de barras de calorias por dia, com linha da meta, barras acima da meta na cor de alerta e rótulos de dia a cada 5 dias
- [x] 2.4 Montar o card "Evolução mensal" em `progress()`, depois do card "Calorias na semana": resumo de peso, calorias e água, gráficos, comparação, nota sobre o uso das metas atuais e mensagens de mês sem registros
- [x] 2.5 Incluir a ação `data-a="mes"` (com `data-d`) no tratador de cliques, limitando o mês ao intervalo permitido, e chamar `render()`
- [x] 2.6 Acrescentar os estilos necessários, em linha com o CSS atual, e conferir o layout em 320 px

## 3. Versão, segurança e documentação

- [x] 3.1 Atualizar `VERSAO` no `index.html` e no `sw.js` com o mesmo valor (1.4.0, ou a próxima versão livre se `add-photo-food-capture` já tiver sido publicado)
- [x] 3.2 Recalcular o hash SHA-256 do script inline (comando da seção "Segurança e privacidade" do `README.md`) e atualizar o `script-src` da meta tag de CSP
- [x] 3.3 Atualizar o `README.md`: versão atual, funcionalidade "Novo na x.y.z" e histórico de versões
- [x] 3.4 Revisar a ortografia em pt-BR de todos os textos novos da interface

## 4. Verificação

- [x] 4.1 Servir com `python -m http.server 8000`, abrir `http://localhost:8000` e confirmar que o console não mostra erros e que o cache `emagrecai-<versão>` foi criado
- [x] 4.2 Testar com dados de exemplo: mês com peso e refeições, mês só com peso, mês só com refeições, mês vazio e conta nova sem registros
- [x] 4.3 Testar os limites da navegação (mês atual, mês do registro mais antigo, sem registros) e a virada de ano (janeiro ↔ dezembro)
- [x] 4.4 Testar peso nos dias 1 e último do mês, e um valor não numérico em `S.weights`, sem exceção no console
- [ ] 4.5 Testar visitante, conta logada e sem internet; confirmar que navegar entre meses não grava nada nem altera a fila de sincronização
- [x] 4.6 Conferir tema claro e escuro, tela de 320 px e que o gráfico semanal e o de peso existentes continuam iguais
- [x] 4.7 Gerar o resumo das alterações para a descrição do commit, em português do Brasil
