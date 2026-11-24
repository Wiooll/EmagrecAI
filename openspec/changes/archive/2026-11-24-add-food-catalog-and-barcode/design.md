## Context

O app é um PWA em `index.html` (HTML, CSS e JavaScript no mesmo arquivo), versão `1.5.0`, hospedado no GitHub Pages, sem servidor próprio. Os dados ficam no `localStorage` (visitante) ou no Supabase (conta Google). A janela "Adicionar alimento" é `drawSheet()`, com as abas "Buscar" e "Novo alimento". A base `FOODS` tem 46 itens com valores por 100 g (`n`, `k`, `c`, `p`, `f`) e medidas caseiras, e cada entrada do diário guarda uma cópia dos valores.

Restrições atuais que moldam o desenho:
- A CSP é uma meta tag com `default-src 'none'`. O `connect-src` permite só o Supabase, então o app não consegue ler um JSON do próprio endereço sem ajuste.
- O `sw.js` só atende uma lista fechada de arquivos (`ARQUIVOS`) e nunca guarda respostas do Supabase.
- O acesso anônimo ao banco está bloqueado (`revoke all ... from anon`). O visitante não tem sessão no Supabase.
- O Open Food Facts exige um `User-Agent` próprio (`NomeDoApp/versão (contato)`), e o `fetch` do navegador não permite definir esse cabeçalho. Ele também não oferece busca por texto na API v2 e tem limites globais de uso (HTTP 503 quando estouram).
- `BarcodeDetector` existe no Chrome e no Edge, mas não no Safari nem no Firefox.

A mudança `add-photo-food-capture` (sem tarefas concluídas) também altera `drawSheet()`, a versão e o README. As duas são independentes.

## Goals / Non-Goals

**Goals:**
- Ampliar a busca por nome com alimentos brasileiros de fonte oficial, funcionando offline e para visitantes.
- Permitir consultar um produto de mercado pelo código de barras, digitado ou escaneado.
- Proteger o Open Food Facts de uso excessivo e proteger o app de dados externos inválidos.
- Não alterar o formato dos dados já salvos nem as tabelas do usuário.
- Manter o app 100% utilizável quando a função, o Open Food Facts ou a câmera não estiverem disponíveis.

**Non-Goals:**
- Busca por nome no Open Food Facts.
- Leitura de código com biblioteca WebAssembly (iPhone).
- Guardar o código de barras no cadastro de alimentos personalizados, ou histórico de produtos escaneados.
- Contribuir com dados ao Open Food Facts.
- Micronutrientes, fibras ou outras colunas da TACO.

## Decisions

### 1. Catálogo TACO como JSON estático no app, não tabela no Supabase
O catálogo vira `data/taco.json`, servido pelo mesmo endereço do app e guardado pelo service worker.

| | JSON estático (escolhido) | Tabela no Supabase |
|---|---|---|
| Offline | Funciona | Precisa de cache extra |
| Visitante sem login | Funciona | Bloqueado (sem acesso anônimo) |
| Latência da busca | Nenhuma (memória) | Uma ida à rede por consulta |
| Atualização | Nova versão do app | Sem nova versão |

A TACO é fixa desde 2011 e pequena (cerca de 600 itens), então o ganho de atualizar sem nova versão não compensa. A tabela no Supabase fica só para o cache de produtos (decisão 5).

### 2. Formato do catálogo e conversão dos dados
Cada item usa as mesmas chaves de `FOODS` (`n`, `k`, `c`, `p`, `f`, valores por 100 g), mais `u` (medida caseira) quando houver. O arquivo é um array JSON compacto, gerado uma única vez por um script de conversão guardado em `scripts/` e documentado no README. O script **não** faz parte do app em execução e o JSON gerado é versionado no repositório.

Regras de conversão:
- Energia em kcal (a coluna em kJ é ignorada).
- Valores "Tr" (traço) viram `0`. Valores "NA" ou ausentes em energia, carboidrato, proteína ou lipídio fazem o item ser **descartado**, para não mostrar um alimento com valor falso.
- Validação na geração: faixas (kcal de 0 a 900, macros de 0 a 100 por 100 g, soma dos macros até 105 g) e nomes únicos.
- Medidas caseiras vêm da Tabela de Medidas Referidas da POF/IBGE somente quando a correspondência com o alimento da TACO for exata. Sem medida, o item usa gramas, que o app já suporta.

A fonte dos arquivos (oficiais da UNICAMP ou o repositório `brolesi/taco`) está em "Open Questions".

### 3. Carregamento e busca no app
O catálogo é buscado com `fetch("data/taco.json")` na primeira abertura da janela "Adicionar alimento" e mantido em memória. Falha de carregamento não é erro fatal: a busca usa só `FOODS` e os alimentos personalizados, e o app mostra uma linha discreta "Catálogo ampliado indisponível".

A busca normaliza texto (minúsculas, `normalize("NFD")` sem diacríticos) e exige que **todas** as palavras digitadas apareçam no nome. A ordem dos resultados é: itens de `FOODS`, alimentos personalizados, itens do catálogo, e dentro de cada grupo os nomes que começam pelo termo vêm antes. A lista mostra no máximo 50 itens, para manter o desenho da janela rápido no celular. Um item do catálogo cujo nome normalizado seja igual ao de um item de `FOODS` ou personalizado não aparece, evitando duplicata.

Os nomes da TACO usam vírgulas (por exemplo, "Arroz, integral, cozido") e são exibidos como estão, para manter a fidelidade à fonte e a atribuição simples.

Alternativa descartada: busca aproximada (distância de edição). Aumenta custo e código, e mostraria itens errados com valores nutricionais diferentes.

### 4. CSP e service worker
- `connect-src` passa a ser `'self' https://<projeto>.supabase.co`. É o menor ajuste possível, não libera domínio externo novo e fica registrado como mudança no spec `pwa-offline-update`.
- `data/taco.json` entra em `ARQUIVOS` no `sw.js`. A estratégia `cachePrimeiro` já existente serve o arquivo. Como o cache é nomeado por versão, o catálogo novo só chega com uma nova versão do app, o que é o comportamento desejado.
- A chamada à função fica no domínio do Supabase, que já está liberado, e o `sw.js` já a deixa passar direto para a rede sem guardar nada.

### 5. Função `consultar-codigo` e cache `produtos_cache`
O app chama uma Supabase Edge Function, e não o Open Food Facts direto, por três motivos: o `User-Agent` obrigatório não pode ser definido no navegador, o cache compartilhado reduz a carga no serviço externo e o serviço externo só vê o endereço da função, e não o de cada usuário.

Fluxo:
```
app ── POST { codigo } ──▶ função
                            1. valida formato e dígito verificador
                            2. procura em produtos_cache (válido por 30 dias)
                            3. se não achar: consulta o Open Food Facts (limite de 5 s)
                            4. valida e normaliza a resposta
                            5. grava em produtos_cache e responde
```

Contrato:
```
POST  { "codigo": "7891000100103" }
200   { "produto": { "codigo": "...", "nome": "...", "marca": "...",
                     "kcal100": 0, "c100": 0, "p100": 0, "f100": 0,
                     "porcao_g": 30, "porcao_rotulo": "30 g (2 fatias)" } }
erro  { "erro": "<codigo>" }
```
Códigos de erro: `codigo_invalido` (400), `origem_nao_permitida` (403), `nao_encontrado` (404), `dados_incompletos` (422), `limite_excedido` (429, com `Retry-After`) e `servico_indisponivel` (502 ou 504). O corpo de erro nunca traz texto do Open Food Facts.

Tabela `produtos_cache` (migração nova, estilo das existentes, com comentários em português):
- `codigo` (chave primária, `check (codigo ~ '^[0-9]{8,14}$')`), `nome`, `marca`, `kcal100`, `carbs100`, `protein100`, `fat100`, `porcao_g` (opcional), `porcao_rotulo` (opcional), `fonte` (`'openfoodfacts'`), `obtido_em`.
- Faixas em `check`, iguais às de `custom_foods` por 100 g.
- Row Level Security ativada, **sem políticas** e com `revoke all` para `anon` e `authenticated`. Só a função, com a chave de serviço, lê e grava. Os dados são públicos, mas o acesso direto não é necessário.

Só resultados **positivos** são gravados. Códigos não encontrados ficam apenas em um cache de memória da instância (1 hora). Isso impede que alguém encha a tabela com códigos inexistentes.

A função é pública, porque o visitante não tem login. O ajuste `verify_jwt` e a forma de enviar a chave publicável devem ser confirmados na implementação, conforme o comportamento atual do Supabase para as novas chaves.

Alternativas descartadas:
- **Chamar o Open Food Facts direto do navegador**: não permite o `User-Agent` exigido, expõe o usuário ao serviço e não reaproveita consultas.
- **Baixar a base inteira do Open Food Facts**: tamanho enorme para um PWA e para o Supabase gratuito.
- **Guardar também resultados negativos na tabela**: abre espaço para encher o banco.

### 6. Validação da resposta do Open Food Facts
O Open Food Facts é uma base colaborativa. A função pede só os campos necessários (nome, marca, valores por 100 g e porção) e aceita um produto somente se: o nome existe e tem até 120 caracteres, `kcal`, carboidratos, proteínas e gorduras existem e são números finitos, `kcal` fica entre 0 e 900, cada macro entre 0 e 100, e a soma dos macros não passa de 105 g por 100 g. Caso contrário responde `dados_incompletos` e **não grava** no cache. A função não completa dados faltantes por estimativa.

Nome e marca são texto livre de terceiros: a função apara espaços e caracteres de controle e limita o tamanho. O app escapa tudo com `esc()` e valida de novo, porque o limite de confiança está no navegador.

### 7. Proteção contra abuso
- **Formato e dígito verificador**: aceita 8 (EAN-8), 12 (UPC-A), 13 (EAN-13) ou 14 (GTIN-14) dígitos, com dígito verificador válido. Isso descarta cerca de 90% dos números aleatórios antes de qualquer consulta.
- **Origem**: exige `Origin` dentro de `ORIGENS_PERMITIDAS` (variável de ambiente). Bloqueia páginas de terceiros, mas não scripts que forjam o cabeçalho.
- **Limite de pedidos**: contador em memória por instância, por endereço de rede, ciente de que não é compartilhado. O cache e o dígito verificador reduzem o risco real, que é sobrecarregar o Open Food Facts.
- **Limite de chamadas externas**: teto de consultas por minuto ao Open Food Facts por instância e tempo limite de 5 s por consulta.
- **Corpo**: máximo de 1 KB, somente JSON.

### 8. Aba "Código" no app
Terceira aba na janela, no mesmo estilo das existentes. Contém um campo numérico (`inputmode="numeric"`, até 14 dígitos), o botão "Buscar produto" e, quando suportado, o botão "Escanear com a câmera". O app valida o formato e o dígito verificador **antes** de chamar a função, para evitar chamadas desnecessárias e mostrar o erro na hora.

Ao encontrar o produto, o app mostra nome, marca e os valores por 100 g, e segue para o mesmo passo de escolha de quantidade que já existe para os outros alimentos (`pick`). A unidade usa `porcao_g` e `porcao_rotulo` quando existirem. Sem porção, usa gramas. Ao adicionar, a entrada do diário é igual às demais (`{n, g, q, k, c, p, f}`), sem campo novo.

Para `nao_encontrado` e `dados_incompletos`, o app mostra uma mensagem em português e o botão "Cadastrar este produto", que abre a aba "Novo alimento". Todos os códigos de erro têm mensagem própria, e o app tem tempo limite de 10 s com `AbortController`. Sem internet, a aba mostra "Sem conexão. Digite o alimento pela busca ou cadastre-o."

### 9. Leitura pela câmera
O botão "Escanear" só aparece se `window.isSecureContext`, `navigator.mediaDevices.getUserMedia` e `BarcodeDetector` existirem, e `BarcodeDetector.getSupportedFormats()` incluir `ean_13`. Fluxo: `getUserMedia({ video: { facingMode: "environment" } })`, vídeo na própria janela, detecção a cada 250 ms (não a cada quadro, para poupar bateria), e na primeira leitura com dígito verificador válido o app **para a câmera**, preenche o campo e consulta.

A câmera é desligada (`track.stop()`) ao trocar de aba, fechar a janela, cancelar, esconder a página (`visibilitychange`) e ao concluir a leitura. Permissão negada ou câmera ausente mostra uma mensagem e mantém a digitação. Nenhuma imagem é guardada ou enviada: só o número lido sai do aparelho. Respeita `prefers-reduced-motion`. O vídeo recebe `aria-label` e há um botão visível "Cancelar".

A diretiva de CSP para mídia deve ser conferida na implementação: o vídeo usa `srcObject` (não carrega URL), mas isso precisa ser confirmado no navegador antes de publicar.

Alternativa descartada: biblioteca WebAssembly para o iPhone. Acrescenta peso, uma dependência nova e mudanças na CSP. Fica como possível mudança futura.

### 10. Licenças e atribuição
O card "Sobre o app" do Perfil e o README citam a TACO (NEPA/UNICAMP, 4ª edição, 2011) e o Open Food Facts (licença ODbL). O texto do app é curto e o detalhe fica no README. A verificação dos termos é a primeira tarefa e **bloqueia** o restante se a redistribuição não for permitida.

### 11. Versão e documentação
A versão atual é `1.5.0` e a nova será `1.6.0`, nos dois lugares (`index.html` e `sw.js`). O hash da CSP é recalculado, e o `README.md` ganha: versão atual, "Novo na 1.6.0", a correção do histórico (a 1.5.0 não está documentada), como publicar a função e configurar as variáveis, como regenerar o catálogo, atribuições e histórico de versões.

## Risks / Trade-offs

- **Licença da TACO ou do Open Food Facts não permitir o uso como planejado** → Verificar na primeira tarefa. Se a redistribuição da TACO não for permitida, trocar para carregar o catálogo de outra fonte ou adiar essa parte.
- **Dados do Open Food Facts incorretos ou incompletos** → Validação rígida, `dados_incompletos` sem gravar, e a mensagem "Cadastrar este produto". O usuário vê os valores por 100 g antes de adicionar e pode cadastrar o produto manualmente se discordar deles.
- **Função pública sem login** → Dígito verificador, origem, limites e teto de chamadas externas. Um atacante determinado pode forjar `Origin`, e por isso o cache e o teto de consultas ao Open Food Facts são a defesa principal.
- **Contador em memória não é compartilhado entre instâncias** → Aceito, porque o dano máximo é um pico de consultas ao Open Food Facts, limitado pelo teto por instância. Se isso se mostrar insuficiente, avaliar contador compartilhado em outra mudança.
- **Indisponibilidade ou bloqueio pelo Open Food Facts (503 por limite global)** → A função responde `servico_indisponivel` sem repetir a chamada, o app mostra mensagem e o cache de 30 dias atende produtos já consultados.
- **Catálogo antigo (2011)** → Alimentos in natura e preparações básicas mudam pouco. Produtos industrializados mudam, e para eles existe a consulta por código.
- **Peso do arquivo no primeiro carregamento** → Algumas dezenas de KB, carregados só ao abrir a janela e guardados em cache pelo service worker.
- **Câmera e privacidade** → Câmera só liga por ação do usuário, desliga sempre que sai da tela e nada é gravado ou enviado além do número.
- **iPhone sem leitura pela câmera** → Digitação do número funciona em todos os navegadores. A mensagem da aba deixa claro onde achar o número, sob o código de barras.
- **Conflito de edição com `add-photo-food-capture`** → Ambas mudam `drawSheet()`, a versão e o README. Implementar em sequência e reconciliar a numeração.

## Migration Plan

1. Verificar as licenças (TACO e Open Food Facts) e definir o e-mail de contato para o `User-Agent`.
2. Gerar e conferir `data/taco.json` (contagem de itens, faixas e amostras conhecidas).
3. Aplicar a migração de `produtos_cache`, publicar a função e configurar `ORIGENS_PERMITIDAS` e o contato do `User-Agent` como variáveis de ambiente (nunca no repositório).
4. Publicar o app `1.6.0`. Quem já tem o app instalado recebe o aviso "Nova versão disponível".
5. Rollback: publicar a versão anterior do app. A função e a tabela podem ficar, pois nenhum dado do usuário depende delas. Se necessário, desativar a função. Nenhum dado salvo muda de formato.

## Open Questions

**Decisões tomadas na implementação:**
- **Fonte da TACO:** CSVs do repositório `brolesi/taco` (licença MIT do código e da organização dos dados). A redistribuição dos valores da TACO pelo NEPA/UNICAMP **não foi confirmada por escrito**. O risco foi aceito pelo autor, com atribuição no app e no README. Open Food Facts: ODbL, atribuição no app e no README.
- **E-mail do `User-Agent`:** definido pelo autor, guardado só em variável de ambiente (`OFF_USER_AGENT`).
- **Ordem e versão:** esta mudança entra antes de `add-photo-food-capture`. O app já estava na `1.6.0` (lembretes), então a nova versão é `1.7.0` (o texto acima cita `1.5.0` e `1.6.0` porque foi escrito antes).
- **Medidas da POF/IBGE:** nenhum nome da POF é idêntico a um da TACO, então todos os itens do catálogo usam gramas.
- **Itens descartados:** 15 itens da TACO sem energia ou macronutriente na fonte (óleos, sal, leite UHT, entre outros). Catálogo final: 582 itens.

**Ainda em aberto:**

- **Fonte dos dados da TACO**: gerar o JSON a partir dos arquivos oficiais da UNICAMP (mais seguro quanto à licença, mais trabalho) ou partir do repositório `brolesi/taco` (mais rápido, com licença a conferir).
- **Termos de redistribuição da TACO e condições do ODbL** para o cache de produtos (base derivada). Pode exigir texto de atribuição específico.
- **E-mail de contato** para o `User-Agent` do Open Food Facts.
- **`verify_jwt` e chave publicável**: como a função pública deve ser chamada pelo app com a configuração atual de chaves do projeto.
- **Medidas da POF/IBGE**: quantos itens da TACO têm correspondência exata. Os demais ficam em gramas.
- **Ordem com `add-photo-food-capture`**: esta mudança entra antes ou depois? Define a numeração da versão (`1.6.0` ou posterior).
- **Nomes da TACO com vírgulas**: exibir como estão (decisão atual) ou reescrever para leitura natural ("Arroz integral cozido")? Reescrever traz risco de erro e atribuição menos clara.
