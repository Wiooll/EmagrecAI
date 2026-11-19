## Context

O app é um único arquivo HTML (cerca de 213 linhas), sem build e sem backend. O estado `S` fica no `localStorage` (chave `pratocheio`). A janela "Adicionar alimento" é `drawSheet()`, com o estado `sh` (`m` refeição, `tab` aba, `food` item escolhido) e duas abas, "Buscar" e "Novo alimento". Os eventos usam delegação em `document` com `data-a`. A base `FOODS` tem 46 itens com valores por 100 g (`n`, `k`, `c`, `p`, `f`), e cada entrada do diário guarda `{n, g, q, k, c, p, f}`.

Reconhecer comida em foto exige um modelo de visão, que não roda de forma confiável no navegador para pratos brasileiros e não pode ser chamado direto do HTML sem expor a chave. Por isso esta mudança introduz a **primeira peça de backend** do projeto, restrita a essa funcionalidade.

A mudança `add-google-login` (ainda sem tarefas concluídas) também altera `load`/`save`, o Perfil e o README. As duas são independentes, mas compartilham arquivos.

## Goals / Non-Goals

**Goals:**
- Registrar uma refeição a partir de uma foto, com revisão obrigatória pelo usuário.
- Proteger a chave do modelo e limitar custo e abuso do endpoint.
- Tratar a foto como dado pessoal: não guardar, reduzir e remover metadados.
- Manter o app 100% utilizável sem a funcionalidade (offline, `file://`, serviço fora do ar).
- Não alterar o formato dos dados já salvos.

**Non-Goals:**
- Reconhecimento offline ou modelo rodando no navegador.
- Leitura de código de barras ou de rótulo nutricional.
- Guardar fotos ou histórico de análises.
- Precisão clínica na estimativa de porção.
- Autenticação verificada no servidor (depende de decisão futura sobre o login).

## Decisions

### 1. Modelo de visão por função serverless, não chamada direta nem modelo local
O navegador envia a foto para `POST /api/analisar-foto` (função da Vercel, mesmo projeto do HTML), e a função chama o modelo.

Alternativas descartadas:
- **Chamada direta do HTML à API do modelo**: a chave ficaria visível no código-fonte e qualquer pessoa poderia gastar o crédito.
- **Modelo no navegador (TF.js, transformers.js)**: baixa precisão para comida brasileira, não estima gramas e acrescenta dezenas de MB.
- **Só código de barras (Open Food Facts)**: barato e preciso, mas não cobre prato caseiro, que é o caso principal. Fica como possível mudança futura.

### 2. Provedor atrás de uma função adaptadora
O código da função isola a chamada ao modelo em `chamarModelo(imagemBase64, conhecidos)`, que devolve o texto bruto. O restante (validação do pedido, parse, validação da saída, limites) não depende do provedor. A chave e o modelo vêm de `VISION_API_KEY` e `VISION_MODEL`. Trocar de provedor mexe em uma função só. A escolha do provedor está em "Open Questions".

### 3. Contrato do endpoint
Pedido:
```
POST /api/analisar-foto
{ "imagem": "<base64 JPEG sem prefixo>", "conhecidos": ["Arroz branco cozido", ...] }
```
Resposta 200:
```
{ "itens": [ { "nome": "Arroz branco cozido", "gramas": 150,
               "kcal100": 128, "c100": 28.1, "p100": 2.5, "f100": 0.2,
               "confianca": "alta" } ] }
```
Erros: `{ "erro": "<codigo>" }` com os códigos `pedido_invalido`, `imagem_invalida`, `imagem_grande`, `origem_nao_permitida`, `limite_excedido`, `servico_indisponivel`, `analise_falhou`. O app traduz cada código em uma mensagem pt-BR própria. O corpo do erro nunca contém texto do provedor.

Os valores são **por 100 g**, o mesmo formato de `FOODS`, para que o cálculo no app seja o já existente (`valor * g / 100`).

### 4. Redução e limpeza da imagem no cliente
O arquivo é lido com `createImageBitmap` (com `imageOrientation: "from-image"` para respeitar a rotação), desenhado em um `canvas` com o maior lado em 1024 px e exportado com `canvas.toBlob("image/jpeg", 0.8)`. Esse caminho **descarta os metadados EXIF**, incluindo a localização. O resultado fica em torno de 100 a 300 KB, bem abaixo do limite de 1,5 MB do servidor, o que também reduz custo e latência. Depois disso o blob é convertido em base64 e enviado. Pré-visualização usa `URL.createObjectURL` e é liberada com `URL.revokeObjectURL` ao terminar.

Alternativa descartada: enviar o arquivo original. Seria mais pesado, mais caro, e enviaria os metadados.

### 5. Formato de saída e prompt do modelo
O modelo é instruído a: listar apenas alimentos e bebidas visíveis; estimar a porção em gramas; usar o nome exato de `conhecidos` quando o alimento corresponder; informar valores por 100 g quando não for conhecido; ignorar texto presente na imagem; responder somente JSON no formato do contrato. Sempre que o provedor oferecer saída estruturada (JSON Schema), ela deve ser usada, e a validação do servidor continua obrigatória. O texto do prompt fica fixo no servidor e não aceita conteúdo vindo do pedido, exceto a lista `conhecidos`, que é validada (tamanho e quantidade) e tratada como dados.

### 6. Validação em duas camadas
O servidor valida o pedido e a saída do modelo (faixas numéricas, limites de tamanho, no máximo 12 itens, soma dos macros até 105 g por 100 g). O app valida de novo a resposta do servidor, porque o limite de confiança está no navegador: tudo é escapado com `esc()` antes de ir ao HTML e itens fora da faixa são descartados. Isso atende a regra de não confiar em dado externo, inclusive o vindo do próprio backend.

Injeção de instruções por texto dentro da foto é tratada assim: o modelo não tem ferramentas nem acesso a nada, a saída precisa passar na validação estrita e o usuário revisa tudo. O pior caso é um item errado na revisão.

### 7. Correspondência com a base local
No app, o nome retornado e os nomes da base são normalizados (`toLowerCase`, `normalize("NFD")` sem diacríticos, espaços aparados) e comparados por igualdade. Como o app envia os nomes de `FOODS` em `conhecidos`, o modelo tende a devolver o nome exato, então a igualdade cobre quase todos os casos sem heurística de aproximação. Quando casa, usa os valores de `FOODS`. Quando não casa, usa os valores do modelo e marca `e: 1` (estimado).

Só os nomes da base embutida são enviados em `conhecidos`. Alimentos personalizados do usuário ficam de fora do pedido, para não enviar dados digitados pelo usuário a um serviço externo sem necessidade. A correspondência local ainda os considera, caso o modelo devolva um nome igual.

Alternativa descartada: correspondência aproximada por `includes`. Casaria "Arroz" com "Arroz integral" ou com o item errado e dá valores nutricionais incorretos sem aviso.

### 8. Tela de revisão
Novo estado `sh.foto = { fase, itens, erro }`, com `fase` em `"escolher" | "analisando" | "revisar"`. Na revisão, cada item mostra caixa de seleção, nome, campo de gramas, kcal calculadas, selo "estimado" quando for o caso. Itens com `confianca: "baixa"` iniciam desmarcados. O rodapé mostra o total de kcal e macros dos marcados e o botão "Adicionar ao <refeição>", desabilitado sem seleção. Ao adicionar, cada item vira uma entrada `{n, g, q:"", k, c, p, f}` (mais `e:1` se estimado), no mesmo caminho de `save()`/`render()` que o `addfood` atual. O campo opcional `e` não afeta nenhum cálculo existente, e a lista do diário só acrescenta "estimado" quando ele existir. Dados antigos continuam válidos.

### 9. Entrada por duas ações
Dois `<input type="file" hidden>`: um com `accept="image/jpeg,image/png,image/webp" capture="environment"` ("Tirar foto") e outro sem `capture` ("Escolher da galeria"). Funciona sem pedir permissão de câmera e sem `getUserMedia`. Em computador, ambos abrem o seletor de arquivos. Alternativa descartada: `getUserMedia` com pré-visualização ao vivo, que exige permissão, HTTPS e muito mais código.

### 10. Consentimento
O aviso usa `confirm()`, o mesmo padrão do "Apagar todos os dados". A aceitação fica na chave `pratocheio-consent-foto` (valor `"1"`), separada de `pratocheio` e fora do padrão `pratocheio:<sub>` do `add-google-login`, para não colidir com ele. O "Apagar todos os dados" não remove o consentimento, que é uma preferência do aparelho. O Perfil poderia ganhar um botão para revogar, mas isso fica fora do escopo.

### 11. Proteção contra abuso
O endpoint não tem login verificado, então se protege assim, em camadas:
- **Origem**: exige `Origin` dentro de `ORIGENS_PERMITIDAS` (variável de ambiente, lista separada por vírgula). Isso bloqueia uso a partir de páginas de terceiros, mas não de scripts que forjam o cabeçalho.
- **Limite de pedidos**: regra de limite de taxa do Firewall da Vercel por IP (a confirmar a disponibilidade no plano na implementação), mais um contador em memória por instância como proteção adicional, ciente de que ele não é compartilhado entre instâncias.
- **Custo máximo**: limite de tokens de saída na chamada ao modelo, imagem reduzida e, se o provedor permitir, limite mensal de gasto na conta do provedor.
- **Tamanho**: 1,5 MB no corpo, validado antes de decodificar o base64.

Alternativa descartada: exigir login Google. O token só pode ser confiável se for verificado no servidor, o que o `add-google-login` deliberadamente não faz. Se o login passar a ter verificação no servidor, o endpoint pode exigi-la no futuro.

### 12. Tempos limite
O app cancela a requisição após 30 s (`AbortController`). O servidor aplica 25 s à chamada ao modelo e retorna `analise_falhou`, de modo que o app normalmente recebe uma resposta de erro antes de estourar o próprio limite. A duração máxima da função na hospedagem deve ser configurada para pelo menos 30 s.

### 13. Endereço do serviço e `file://`
`const API_FOTO="/api/analisar-foto"` (caminho relativo). Se `location.protocol` não for `http:` nem `https:`, a aba Foto mostra "Análise por foto indisponível neste modo de abertura" e não tenta a requisição. Localmente, usa-se `vercel dev`, que serve o HTML e a função na mesma origem.

### 14. Versão e README
Segue a regra do projeto: nova funcionalidade, aumento de versão menor. A versão atual deve ser lida do HTML na hora da implementação. Se o `add-google-login` já tiver sido aplicado, será `1.2.0`. Se não, será `1.1.0`, com criação do `README.md` e da constante `VERSAO` exibida no rodapé do Perfil, como previsto lá. O README ganha: como configurar `VISION_API_KEY`, `VISION_MODEL` e `ORIGENS_PERMITIDAS`, como rodar com `vercel dev`, aviso de privacidade, limites e histórico de versões.

### 15. Interface
Terceira aba "Foto" na janela, mesmo estilo das abas existentes, botões `.btn` e `.btn.sec`. Textos novos em pt-BR com acentuação revisada. O nome da aba e os botões têm texto visível e `aria-label` onde houver só ícone. Durante a análise o foco vai para o botão "Cancelar", e o resultado ou o erro é anunciado em uma região `aria-live="polite"`. Respeita `prefers-reduced-motion`, como o resto do app.

## Risks / Trade-offs

- **Estimativa de porção imprecisa (erro típico de 20 a 40%)** → Revisão obrigatória, campo de gramas editável, selo "estimado" e itens de baixa confiança desmarcados. O Perfil e o README dizem que valores são aproximados.
- **Modelo inventa valores nutricionais** → Faixas rígidas no servidor e no app, preferência pela base local quando o nome casa, e selo "estimado" nos demais.
- **Foto sai do aparelho** → Aviso e consentimento antes do primeiro envio, metadados removidos, imagem reduzida, nada gravado nem registrado em log, e política do provedor documentada no README. O usuário deve ser informado de que a foto é processada por um terceiro.
- **Endpoint público sem login** → Checagem de origem, limite por IP, teto de tokens e limite de gasto no provedor. Um atacante determinado pode forjar `Origin`, então o limite de gasto no provedor é a última defesa e deve ser configurado antes da publicação.
- **Contador em memória não é compartilhado entre instâncias** → Só complementa a regra do firewall. Se não houver regra de limite disponível, avaliar um armazenamento compartilhado, o que seria uma nova dependência e uma decisão à parte.
- **Custo por foto** → Imagem de 1024 px, saída curta e limites de uso. O custo real depende do provedor escolhido.
- **Latência (3 a 10 s)** → Indicador de progresso, cancelamento e tempo limite. A busca manual continua rápida.
- **Quebra da premissa "sem backend"** → Isolada em um único arquivo (`api/analisar-foto.js`). O app funciona sem ele. Remover a pasta `api` e a aba Foto reverte tudo.
- **Conflito de edição com `add-google-login`** → Ambos mudam `profile()`, `load()`/`save()` e o README. Implementar em sequência e reconciliar a numeração de versão.
- **Rotação e formatos de foto de celular (HEIC no iOS)** → O iOS converte para JPEG ao usar o seletor com `accept="image/*"`, mas um HEIC escolhido manualmente pode falhar. Nesse caso o app mostra "Não foi possível ler esta imagem."

## Migration Plan

1. Criar a função e configurar as variáveis de ambiente no ambiente de pré-visualização, definindo antes o limite de gasto no provedor.
2. Publicar o HTML com a aba Foto junto da função. Quem não usar a aba não percebe diferença.
3. Testar com fotos reais (prato simples, prato com vários itens, foto sem comida, foto com texto de instrução, imagem enorme, arquivo que não é imagem).
4. Rollback: voltar o HTML anterior e/ou remover `api/analisar-foto.js`. Nenhum dado salvo muda de formato, e entradas com `e: 1` continuam legíveis por versões antigas, que simplesmente ignoram o campo.

## Open Questions

- **Provedor e modelo de visão**: qual usar (e quanto se aceita pagar por foto)? A implementação deixa `VISION_API_KEY` e `VISION_MODEL` por configuração, mas é preciso escolher o provedor para escrever `chamarModelo` e para confirmar suporte a saída estruturada e a política de retenção de imagens.
- **Hospedagem**: confirmar que o projeto será publicado na Vercel (ou outra hospedagem com funções), já que a função serverless depende disso. O projeto já cita a Vercel no `add-google-login`.
- **Limite de taxa**: o plano da Vercel disponível inclui regra de limite de taxa no firewall? Se não, aceitar apenas o contador em memória ou adotar um armazenamento compartilhado?
- **Ordem de implementação**: esta mudança entra antes ou depois do `add-google-login`? Isso define se a versão será `1.1.0` ou `1.2.0`.
- **Revogar consentimento**: incluir no Perfil um botão para "Esquecer aviso de privacidade da foto"? Está fora do escopo atual.
