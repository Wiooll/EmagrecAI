## Context

O app é um único `index.html` com script inline, sem build, e um service worker. O estado `S` (`log`, `water`, `weights`, `custom`, `p`) fica no `localStorage` e, com login, é sincronizado com o Supabase por uma fila de operações idempotentes (`commit` → `flush`). Preferências que não precisam de nuvem (lembretes, avisos, refeições ocultas) ficam só no `localStorage`, com chaves `pratocheio:*`, leitura defensiva e validação.

Pontos do código que o pacote toca:

- `list(q)` e `drawSheet()`: busca de alimentos. Com campo vazio, hoje mostra `[...S.custom, ...FOODS]` (50 itens).
- Tela de detalhe do alimento (`sh.food`), aberta por `pick`, `edit` e depois de cadastrar um alimento.
- `progress()`: cards de peso, calorias da semana e evolução mensal. `resumoMes()` e `tot()` já calculam totais por dia.
- `profile()`: cards "Conta" (`accountCard`) e "Dados".
- `logout()`: já apaga `pratocheio:<id>`, a fila e a recusa de importação.
- `lembExportar()`: já gera e baixa um arquivo (`File` + `navigator.share`, com fallback para `Blob` + `<a download>`).

## Goals / Non-Goals

**Goals:**
- Lançar um alimento repetido em poucos toques, sem digitar.
- Mostrar constância e um resumo semanal sem gravar dados novos.
- Permitir que o usuário leve seus dados embora (CSV).
- Manter o padrão do projeto: sem dependências novas, sem build, funcionamento offline.

**Non-Goals:**
- Sincronizar favoritos entre aparelhos.
- Receitas e refeições salvas, exercício e calorias gastas.
- Notificações do resumo semanal. O resumo só aparece na aba Progresso.
- Importar o CSV de volta.
- Excluir a conta pelo app (adiado).

## Decisions

### 1. Favoritos só no aparelho, com cópia dos valores do alimento

Os favoritos ficam em `pratocheio:favoritos` (lista de até 50 alimentos), validados na leitura como os demais itens de `localStorage`. Cada favorito guarda uma cópia do alimento (`n`, `k`, `c`, `p`, `f` por 100 g e `u`), não só o nome.

- **Por que a cópia:** alimentos vindos do código de barras não ficam em lugar nenhum depois de lançados, e os da TACO só estão carregados depois de abrir a busca. Com a cópia, o favorito funciona sem consultar nada.
- **Por que só no aparelho:** o app tem poucos usuários, e lembretes e ocultas já seguem esse modelo. Evita migração, tabela nova, operação nova na fila e mudança no `wipe`.
- **Alternativa descartada:** tabela `favorite_foods` no Supabase. Sincroniza entre aparelhos, mas custa migração, RLS, fila e importação do visitante. Pode ser feita depois, trocando só a camada de leitura e escrita.
- **Identificação:** por nome normalizado (`norm(n)`). Favoritar de novo o mesmo nome substitui a cópia.
- **Limpeza ao sair da conta:** a chave é do aparelho e não contém dados de saúde, então continua após `logout`. "Apagar todos os dados" não a remove (só apaga registros e metas, como já ocorre com lembretes).

### 2. Recentes derivados do diário, sem armazenar nada

Os recentes são calculados a partir de `S.log`: percorrer os dias em ordem decrescente e coletar alimentos distintos por nome normalizado até chegar a 15. A porção de 100 g é reconstruída como na edição de lançamentos (`k / g * 100`), e a unidade vem do alimento de mesmo nome em `S.custom`, `FOODS` ou `TACO`, com `["porção","porções",100]` como padrão.

- **Por que derivar:** não precisa de escrita, de limite de armazenamento nem de sincronização, e sempre reflete o que foi lançado, inclusive em outro aparelho.
- **Custo:** ordenar as chaves de `S.log` a cada abertura da busca. Com alguns anos de dados são centenas de chaves, o que é desprezível.
- **Alimentos sem gramas** (`g` ≤ 0, caso legado) são ignorados, como no botão de editar.

### 3. Onde aparecem favoritos e recentes

Só quando o campo de busca está vazio, em duas seções antes da lista padrão: "Favoritos" e "Recentes". Ao digitar, a busca funciona como hoje. O alimento que está nos favoritos não se repete em "Recentes". O botão ☆/★ fica na tela de detalhe do alimento, ao lado do nome, com `aria-pressed` e rótulo "Favoritar" ou "Remover dos favoritos".

- **Alternativa descartada:** estrela em cada linha da lista. Aumenta a densidade visual em telas de 320 px e conflita com o botão "Editar" dos alimentos cadastrados.

### 4. Constância e resumo semanal calculados em `S`

- **Dia registrado:** dia com `tot(k).k > 0`, mesma regra de `limitesMes()` e `resumoMes()`.
- **Sequência atual:** dias consecutivos registrados terminando hoje. Se hoje ainda não tem registro, a contagem começa em ontem, para a sequência não "zerar" de manhã.
- **Melhor sequência:** maior sequência em todo o histórico, calculada percorrendo os dias ordenados.
- **Resumo da semana:** janela dos últimos 7 dias incluindo hoje, comparada com os 7 dias anteriores. Indicadores: média de kcal nos dias registrados, dias dentro da meta (registrado e ≤ meta), dias registrados, variação de peso (último menos primeiro peso da janela, se houver dois ou mais) e dias com a meta de água. A comparação só aparece quando as duas janelas têm dados.
- **Por que 7 dias móveis, e não segunda a domingo:** não precisa de navegação nem de regra para semana incompleta, e combina com o gráfico "Calorias na semana", que já usa os últimos 7 dias.
- As metas usadas são as atuais do perfil, como no resumo mensal, e o card repete esse aviso.

### 5. Exportação em um único CSV

Um arquivo `emagrecai-AAAA-MM-DD.csv` com colunas: `data;tipo;refeicao;item;porcao;gramas;kcal;carboidratos_g;proteinas_g;gorduras_g;agua_ml;peso_kg`. Cada lançamento de alimento é uma linha com `tipo=alimento`, cada dia com água vira uma linha `tipo=agua`, e cada pesagem vira uma linha `tipo=peso`. As linhas são ordenadas por data.

- **Formato:** separador `;`, decimal com ponto, codificação UTF-8 com BOM, para abrir direto no Excel em português sem quebrar acentos. Os números usam ponto para não depender da configuração regional.
- **Segurança (injeção de fórmula):** nomes de alimentos podem vir do Open Food Facts ou de cadastro livre. Qualquer célula de texto que comece com `=`, `+`, `-`, `@`, tabulação ou retorno de carro recebe um apóstrofo na frente, e todo campo de texto é colocado entre aspas com `"` duplicado.
- **Entrega:** mesma estratégia de `lembExportar()` (compartilhar arquivo quando houver suporte, senão baixar). Se for conveniente, extrair um auxiliar de download usado pelas duas funções, sem mudar o comportamento dos lembretes.
- **Por que um arquivo só:** quem usa o app não quer baixar três arquivos, e a planilha filtra por `tipo`.
- **Alternativa descartada:** JSON de backup. Serve para restaurar, mas ninguém pediu importação, e o CSV atende "levar meus dados".
- **Escopo:** exporta o que está no contexto ativo (visitante ou conta), a partir de `S`, sem rede. Com pendências na fila, o arquivo já contém tudo, porque `S` é a fonte local.

### 6. Versão, CSP e service worker

Versão 1.11.1 em `index.html` e `sw.js` (a 1.11.0 já foi publicada com a exclusão de conta, que foi retirada). O script inline muda, então o hash da CSP é recalculado. Nenhum arquivo estático novo, então a lista `ARQUIVOS` do `sw.js` não muda.

## Risks / Trade-offs

- **Favoritos não sincronizam entre aparelhos** → Aceito: o uso é pessoal e a camada pode ser trocada depois por tabela no Supabase.
- **Alimento favorito ou recente com valores antigos** (a TACO ou o cadastro mudou) → Os lançamentos antigos já seguem esse modelo ("editar um alimento cadastrado não altera lançamentos antigos"). A cópia é só um atalho, e o usuário vê os valores antes de adicionar.
- **CSV aberto em planilha** → Mitigado pelo prefixo anti-fórmula e pelo uso de aspas. Mesmo assim, o arquivo deve ser tratado como dado do usuário.
- **Constância depende de `tot(k).k > 0`** → Quem só registra água ou peso não conta como dia registrado. É a mesma regra do resumo mensal e evita um segundo conceito de "dia registrado".
- **Fuso horário:** `key()` usa a data local, como o resto do app, então a virada do dia segue o relógio do aparelho.

## Migration Plan

1. Publicar o `index.html` e o `sw.js` na versão 1.11.1. Sem mudança de banco, o rollback é voltar o commit.

## Decisões confirmadas pelo usuário

- A constância aparece só na aba Progresso. O layout do Diário não muda.
- A exclusão de conta ficou fora deste pacote. A versão 1.11.0 a incluía e a 1.11.1 a retirou, por decisão do usuário. Se voltar, precisa de uma função do Supabase com a chave de serviço, que valide o token e apague só o dono dele (as tabelas já usam `on delete cascade`).
