## Context

O app é um único `index.html` (HTML, CSS e JavaScript) sem build. As telas são geradas por funções que retornam strings de HTML (`diary()`, `progress()`, `profile()`), e os eventos são tratados por um único listener de cliques, que despacha por `data-a`. A navegação inferior tem três abas: Diário, Progresso e Perfil. Hoje não há nenhuma tela de informações e a versão (`1.0.0`) aparece só no `README.md`.

## Goals / Non-Goals

**Goals:**
- Mostrar versão, link do GitHub e chave Pix em um local fácil de achar.
- Permitir copiar a chave Pix com um toque, com retorno visual.
- Seguir o padrão atual do código (função que gera HTML, `data-a`, classes `.card`, `.btn`, `.note`).

**Non-Goals:**
- Nova aba na navegação, QR Code Pix, valor de doação ou qualquer integração de pagamento.
- Mudança no formato dos dados salvos.

## Decisions

**1. Card "Sobre o app" no fim da aba Perfil, em vez de nova aba.**
O Perfil já reúne configurações e a seção "Dados". Uma quarta aba na navegação gastaria espaço fixo em tela para um conteúdo de uso raro. Alternativa descartada: botão "ⓘ" no cabeçalho do Diário abrindo um sheet. Exigiria novo estado e novo fluxo de fechamento.

**2. Constantes únicas para os valores.**
`const APP_VERSION="1.1.0"`, `GITHUB_URL` e `PIX_KEY` ficam juntos, perto das demais constantes do script. A tela e o handler de cópia leem delas. Evita repetir o valor e facilita a troca.

**3. Link externo seguro.**
`<a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">`. Os valores são constantes do código, não entrada do usuário, mas passam por `esc()` ao serem interpolados, para manter o padrão do arquivo.

**4. Cópia com `navigator.clipboard.writeText` e alternativa.**
- Caminho principal: `navigator.clipboard.writeText(PIX_KEY)`, que só existe em contexto seguro (`https` ou `localhost`).
- Alternativa: se a API não existir ou a promessa for rejeitada (comum em `file://`), a chave já está visível em um `<input readonly>` com seleção automática ao focar, e o handler usa `select()` + `document.execCommand("copy")` dentro de `try/catch`.
- Retorno visual: o texto do botão muda para "Chave copiada!" por cerca de 2 segundos, sem chamar `render()` (que apagaria o estado de rolagem e campos). Se tudo falhar, mostra "Copie manualmente".

Alternativa descartada: mostrar a chave só dentro de um botão. Em caso de falha da API o usuário não teria como copiar.

**5. Chave Pix visível como texto.**
A chave é aleatória (UUID) e pública por decisão do autor. Ela aparece completa para o usuário conferir antes de pagar. Não há dado sensível do usuário envolvido.

**6. Versão exibida ao usuário.**
Linha "Versão 1.1.0" dentro do card, lendo `APP_VERSION`. O `README.md` mantém o mesmo número e o histórico de versões.

## Risks / Trade-offs

- [Clipboard bloqueado em `file://` ou em navegadores antigos] → alternativa com `execCommand`, campo `readonly` com a chave selecionável e mensagem "Copie manualmente".
- [Número de versão duplicado em `index.html` e `README.md`, podendo ficar divergente] → só dois lugares, com a lista de verificação nas tarefas. Não vale criar mecanismo de build para isso.
- [Conflito de versão com `add-google-login` e `add-supabase-database`, que também planejam alterar a versão] → ajustar para o próximo número da sequência ao implementar quem vier depois.
- [Chave Pix pública sujeita a uso indevido por terceiros] → o risco é nulo para o app, pois a chave só recebe valores. O autor assume a exposição.
- [Texto longo quebra o layout em telas estreitas (UUID de 36 caracteres)] → o campo da chave usa fonte menor e `overflow` com rolagem horizontal no próprio campo, sem quebrar o card.
