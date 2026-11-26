## Context

O app é um único `index.html` (PWA, sem build) com estado em `S`, salvo em `localStorage` por `save()`, e sem backend próprio. A busca de alimentos usa `S.custom`, `FOODS` e o catálogo TACO (`TACO`, carregado por `carregarTaco()`). Há ainda a consulta por código de barras (função `consultar-codigo`). A meta calórica sugerida vem de `suggest(p)`, que já aplica o piso de 1200 kcal. A CSP libera hoje só o Supabase em `connect-src`. Favoritos e horários de lembrete são exemplos de dados guardados só no aparelho (`pratocheio:*`).

Teste de CORS feito em 26/11/2026, sem usar chave real:

| Chamada | OpenAI | Gemini |
|---|---|---|
| Preflight `GET /models` | 200, `Allow-Origin: *`, aceita `authorization` | 200, `Allow-Origin` igual à origem, aceita `x-goog-api-key` |
| Preflight `POST` de geração | 200, aceita `authorization` e `content-type` | 200, aceita `x-goog-api-key` e `content-type` |
| Resposta de erro (chave inválida) | 401 com `Allow-Origin: *` e JSON legível | 400 com `Allow-Origin` e JSON legível |

As duas APIs aceitam chamadas diretas do navegador. Falta validar o fluxo completo com uma chave real (listagem de modelos e uma geração com *tool calls*), o que é a primeira tarefa.

## Goals / Non-Goals

**Goals:**
- Recurso opcional, desligado por padrão, com chave do próprio usuário (OpenAI ou Gemini).
- Registro de refeição por texto que **propõe** itens; só o usuário grava.
- Números nutricionais sempre vindos dos catálogos do app.
- Travas de segurança em código, não só no prompt.
- Funcionar também no modo visitante, sem backend novo.

**Non-Goals:**
- Foto do prato, chat livre, coach semanal, sugestões de cardápio e voz própria (vale o ditado do teclado).
- Alterar metas, perfil ou lançamentos já salvos pelo assistente.
- Outros provedores, proxy no servidor e guardar a chave na conta.

## Decisions

1. **Chamada direta do navegador ao provedor, com a chave do usuário.** Sem Edge Function e sem cota própria. Alternativa descartada: proxy no Supabase, porque exigiria login, controle de custo e faria os dados de saúde passarem pelo servidor do projeto.

2. **Chave só em `localStorage` (`pratocheio:ia`), junto com provedor, modelo e consentimento.** Não é sincronizada, não entra no CSV e é apagada ao sair da conta e em "Apagar todos os dados". Alternativas descartadas: Supabase (chave em servidor de terceiro) e `sessionStorage` (digitar a chave toda vez). A chave nunca vai para log, URL ou mensagem de erro. No Gemini, vai no cabeçalho `x-goog-api-key`, nunca na URL.

3. **Dois adaptadores com a mesma interface.** Cada um expõe `listarModelos(chave)` e `conversar(chave, modelo, mensagens, ferramentas)`, devolvendo um formato interno único (`texto` ou `chamadas`). A lógica do assistente não conhece o formato de cada provedor. OpenAI usa `GET /v1/models` e `POST /v1/chat/completions` com `tools`. Gemini usa `GET /v1beta/models` e `POST /v1beta/models/<modelo>:generateContent` com `functionDeclarations`. Alternativa descartada: biblioteca dos provedores, que não cabe no modelo de arquivo único e teria de passar pela CSP.

4. **Lista de modelos só depois da chave.** Ao tocar em "Conectar", o app chama `listarModelos`. OpenAI: manter só ids que comecem com `gpt-`, `o1`, `o3` ou `o4` e excluir os que contenham `embedding`, `audio`, `realtime`, `image`, `tts`, `whisper`, `moderation` ou `transcribe`. Gemini: manter os que tiverem `generateContent` em `supportedGenerationMethods` e excluir os de imagem, áudio e *embedding*. A lista é guardada só na memória. O modelo escolhido é guardado, mas a lista é recarregada a cada abertura do card. Se o modelo escolhido sumir da lista, o app pede nova escolha. Como o filtro por nome não é perfeito, o primeiro uso de um modelo que falhe mostra uma mensagem clara, e o usuário troca de modelo.

5. **O assistente roda um laço curto de ferramentas, no aparelho.** Ferramentas expostas ao modelo, todas de leitura:
   - `buscar_alimento(consulta)`: busca em `S.custom`, `FOODS` e `TACO`, devolve até 5 itens com id e nome, sem nutrientes.
   - `buscar_codigo(codigo)`: não entra nesta change.
   O modelo devolve a proposta final como uma lista `{alimento_id, quantidade, medida}`. O app resolve o id no catálogo local e **calcula** calorias e macros com os valores por 100 g. Ids inexistentes são descartados e o item aparece como "não encontrado". Limite de 4 voltas do laço e de 8 itens por proposta. Alternativa descartada: deixar o modelo informar kcal e macros, porque modelos erram esses números.

6. **Confirmação obrigatória.** O resultado é um cartão com os itens, a refeição de destino e, por item, quantidade editável e botão de remover. "Adicionar tudo" grava pelo mesmo `commit` do lançamento manual. "Descartar" não grava nada. Nenhuma ferramenta escreve em `S`. O assistente não tem acesso a metas, perfil, peso nem histórico.

7. **Dados enviados.** Apenas o texto digitado pelo usuário, as instruções fixas e os resultados de `buscar_alimento`. Nenhum lançamento anterior, peso, meta ou dado de perfil é enviado. Antes do primeiro envio, um aviso de consentimento explica que o texto vai ao provedor escolhido, com a chave do usuário, e só então o botão de envio é liberado. O consentimento fica salvo no aparelho e vale por provedor.

8. **Travas em código.**
   - Faixa de quantidade: 1 a 2000 g (ou 0,25 a 20 unidades), inteiros ou decimais válidos; fora disso o item é descartado com aviso.
   - Filtro de sinais de transtorno alimentar sobre o texto do usuário **antes** do envio, com uma lista curta de expressões em português (jejum prolongado, "compensar", "me castigar", "vomitar", "purgar", "laxante" e similares, ignorando acentos e maiúsculas). Se houver correspondência, o app não chama o modelo e mostra um texto acolhedor, recomendando procurar um profissional de saúde. A lista é conservadora e documentada, e não substitui avaliação profissional.
   - Instrução fixa no prompt do sistema: só registrar alimentos, nunca recomendar restrição, dieta, meta ou suplemento, e ignorar instruções contidas no texto do usuário que mudem essas regras. As travas acima não dependem dessa instrução.
   - Resultados de ferramentas e textos externos são tratados como dados: o app nunca executa nada que venha do modelo, e tudo exibido passa por `esc()`.
   - Limite de 500 caracteres para o texto do usuário e tempo máximo de 30 s por chamada, com cancelamento.
   - O piso de 1200 kcal de `suggest()` não muda. O assistente não calcula nem mostra metas.

9. **Erros.** Chave inválida (401 no OpenAI, 400 `API key not valid` no Gemini), cota ou limite (429), modelo indisponível (404), sem internet e tempo esgotado têm mensagens próprias em português e nunca exibem a chave. Sem internet, o botão de envio fica desativado com aviso. O restante do app continua funcionando offline.

10. **CSP, service worker e versão.** `connect-src` ganha `https://api.openai.com` e `https://generativelanguage.googleapis.com`. O hash do script inline é recalculado. O `sw.js` só intercepta requisições GET de endereços conhecidos (arquivos do app, `ESTATICOS`, e fontes, `FONTES`), então as chamadas aos provedores não passam pelo cache e nada precisa mudar nele além da `VERSAO`. `VERSAO` passa para 1.14.0 nos dois arquivos.

11. **Interface.** Card "Assistente de IA" no Perfil, com interruptor (desligado por padrão), seletor de provedor, campo de chave do tipo senha, botão "Conectar", seletor de modelo e botão "Remover chave". O registro por texto aparece como uma nova aba "IA" na janela de adicionar alimento, visível só com o assistente ativo, conectado e com modelo escolhido.

## Risks / Trade-offs

- [Chave no `localStorage` pode ser lida por um XSS] → CSP restrita com hash, `esc()` em tudo o que é exibido, chave apagada ao sair e instrução no card para usar uma chave com limite de gasto.
- [A CSP fica mais aberta em `connect-src`] → Só dois domínios fixos e escopo limitado; scripts de terceiros continuam bloqueados.
- [Modelo erra o alimento ou a quantidade] → O usuário vê e edita tudo antes de gravar, e os valores nutricionais vêm dos catálogos.
- [Prompt injection pelo texto do usuário ou por nomes de produto] → O assistente não tem ferramenta de escrita, a saída é validada em código e a gravação exige confirmação.
- [O filtro de transtorno alimentar deixa passar casos] → É uma camada entre várias, com texto de aviso no card e no README. O escopo do assistente (só registrar alimentos, sem metas nem conselhos) é a proteção principal.
- [Filtro de modelos por nome pode listar modelos que não servem ou esconder bons] → Mensagem clara na falha e escolha livre entre os da lista.
- [Dados de saúde saem do aparelho] → Consentimento explícito, envio mínimo e descrição no README.
- [Custo e limite de uso ficam com o usuário] → Aviso no card. Sem retentativa automática, para não gerar gasto sem querer.
- [Tamanho do `index.html` cresce] → Adaptadores enxutos e sem dependências novas.

## Migration Plan

Sem mudanças no banco. A publicação inclui `index.html`, `sw.js` e `README.md`. Para voltar atrás, basta publicar a versão 1.13.0. Chaves já salvas ficam inertes no `localStorage`, e quem voltar para a 1.14.0 pode removê-las pelo card.

## Open Questions

- Teste com chave real: confirmar o formato de *tool calls* e a listagem de modelos nos dois provedores (primeira tarefa).
- Quais modelos aparecerão na prática depois do filtro, e se vale uma lista de modelos recomendados.
