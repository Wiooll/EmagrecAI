## Context

A aba Progresso (`progress()` no `index.html`) mostra o peso dos últimos 30 registros e as calorias dos últimos 7 dias. O estado `S` já guarda tudo o que a visão mensal precisa:

- `S.weights`: objeto `{ "AAAA-MM-DD": kg }`.
- `S.log`: refeições por dia; `tot(chave)` soma as calorias do dia.
- `S.water`: objeto `{ "AAAA-MM-DD": ml }`.
- `S.p.kcal`, `S.p.wg`, `S.p.tw`: metas atuais de calorias, água e peso.

Os dados são os mesmos para visitante e conta, e já estão em memória (cache local), então a visão funciona sem internet e sem consultas ao Supabase. O app é um único `index.html` com CSP por hash do script inline, e o `sw.js` precisa receber a mesma `VERSAO`.

## Goals / Non-Goals

**Goals:**
- Mostrar um mês por vez, com navegação entre meses, resumo de peso, calorias e água, dois gráficos e comparação com o mês anterior.
- Calcular tudo no cliente, a partir do estado existente, sem novas gravações.
- Manter o padrão atual do código: funções curtas, SVG escrito à mão, textos em pt-BR, `esc()` em tudo que vem de dados.

**Non-Goals:**
- Mudar o banco, a fila de sincronização ou o formato de `S`.
- Alterar o gráfico de peso e o de calorias da semana que já existem.
- Guardar o histórico das metas. A evolução mensal usa as metas atuais.
- Exportar relatório, escolher intervalo livre, evolução anual ou de macronutrientes.

## Decisions

**1. Calcular em tempo de renderização, sem guardar nada novo.**
Uma função `resumoMes(ano, mes)` percorre os dias do mês (28 a 31) e devolve peso inicial e final, dias com calorias, média, dias acima da meta, dias com água e dias com a meta de água atingida. Alternativa descartada: guardar um resumo por mês no banco. Isso exigiria migração, sincronização e tratamento de dados desatualizados, sem ganho perceptível de velocidade.

**2. Estado do mês em uma variável de módulo (`mes`), como `cur` e `view`.**
Guarda `{a: ano, m: mês de 0 a 11}`. Começa no mês atual e não é persistido: ao reabrir o app, volta ao mês atual. Nova ação `data-a="mes"` com `data-d="-1|1"` no tratador de cliques existente, que chama `render()`. Alternativa descartada: guardar o mês escolhido no `localStorage`. Não há ganho de uso e acrescenta estado para limpar ao sair da conta.

**3. Limites da navegação.**
O botão "próximo" fica desabilitado no mês atual. O botão "anterior" fica desabilitado no mês do registro mais antigo (menor chave entre `S.weights`, `S.log` e `S.water`) ou no mês atual, se não houver registros. Isso evita navegar por meses vazios sem fim. Alternativa descartada: limite fixo de 12 meses, que esconderia dados antigos.

**4. Datas sempre locais, nunca `new Date("AAAA-MM-DD")`.**
As chaves dos dias são montadas com `key(new Date(ano, mes, dia))`, a função que o app já usa, evitando o deslocamento de um dia que o parse em UTC causa em fusos como o do Brasil. O nome do mês vem de `toLocaleDateString("pt-BR", {month:"long", year:"numeric"})`.

**5. Regras do resumo.**
- Dia com calorias: `tot(chave).k > 0`. Dia com água: `S.water[chave] > 0`.
- Média de calorias e de água: só sobre os dias registrados, como já faz o card semanal.
- Dia acima da meta: calorias do dia maiores que `S.p.kcal`. Meta de água atingida: `ml >= S.p.wg`.
- Peso: primeiro e último registro do mês por ordem de data. Variação = último − primeiro, exibida só com pelo menos 2 registros; com 1 registro mostra o peso e "—" na variação.
- Distância até a meta: `último − S.p.tw`, só quando há peso no mês.
- Comparação: diferença entre as variações de peso e entre as médias de calorias do mês e do anterior, exibida só quando os dois valores existem. Textos neutros ("+120 kcal na média", "variação de −1,2 kg"), sem julgar se é bom ou ruim, porque depende do objetivo (perder, manter ou ganhar).

**6. Gráficos em SVG próprio, com eixo X por dia do mês.**
O gráfico de peso posiciona cada ponto pelo dia (1 a 31), não pelo índice, para que lacunas apareçam como lacunas. O de calorias usa uma barra por dia com a linha da meta e rótulos a cada 5 dias para caber em 320 px. Ambos usam `viewBox` e `width="100%"` como os atuais, com `role="img"` e `aria-label`. A função existente de peso não é alterada, porque usa o índice como eixo X e outro recorte de dados; reaproveitá-la exigiria refatorar código fora do escopo.

**7. Interface.**
Novo card "Evolução mensal" depois do card "Calorias na semana", com o seletor de mês no topo (botões de 44 px, mesmo estilo de `.dnav`), grade de números-resumo, os dois gráficos e a linha de comparação. Sem registros no mês: mensagem "Nada registrado neste mês." no lugar dos gráficos e dos números.

**8. Versão.**
Mudança de funcionalidade, então aumenta a versão menor (de 1.3.0 para 1.4.0, ou a próxima disponível se `add-photo-food-capture` for publicado antes). `VERSAO` do `index.html` e do `sw.js` ficam iguais, o hash da CSP é recalculado e o `README.md` recebe versão, "Novo na x.y.z" e histórico.

## Risks / Trade-offs

- [Metas atuais aplicadas a meses antigos: se o usuário mudou a meta de calorias, "dias acima da meta" de meses passados usa a meta nova] → Texto de nota no card informando que usa as metas atuais. O histórico de metas fica fora do escopo.
- [`S.weights` é preenchido só por "Salvar peso", e o peso do dia substitui o anterior] → Sem impacto: a visão usa um peso por dia, que é o que existe.
- [Barras estreitas com 31 dias em telas de 320 px] → Largura calculada a partir do `viewBox`, rótulos esparsos e teste em 320 px.
- [Alterar o script inline invalida a CSP] → Recalcular o hash SHA-256 e atualizar `script-src` (tarefa explícita).
- [Dado inválido no `localStorage` (peso não numérico)] → Ignorar valores não finitos no cálculo, sem lançar exceção, em linha com o tratamento de `load()`.
- [Conflito de numeração de versão com `add-photo-food-capture`] → Definir a versão no momento da implementação, olhando a `VERSAO` vigente.
