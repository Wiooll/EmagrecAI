## Context

O app é um único `index.html` (HTML, CSS e JavaScript inline), sem build, publicado no GitHub Pages em um subcaminho (`https://<usuario>.github.io/<repositorio>/`). Pontos do estado atual que importam para esta mudança:

- `#app` tem `max-width:520px` e centraliza em telas grandes. O viewport já usa `viewport-fit=cover` e há `env(safe-area-inset-*)` no `:root`, na navegação inferior, no toast e na folha.
- Alvos de toque pequenos: `.add` 34 px, `.del` 30 px, `.dnav button` 36 px, `.rnd` 38 px. Campos com `font-size:15px` herdado do `body`.
- A folha de adicionar alimento (`#sheet`) usa `position:fixed;inset:0` e `max-height:88%`. Com o teclado virtual aberto, o conteúdo pode ficar escondido.
- A Content-Security-Policy (meta tag) usa `default-src 'none'`. Sem `manifest-src` e `worker-src`, o manifesto e o service worker são bloqueados. O script inline é liberado por hash SHA-256, que precisa ser recalculado a cada edição.
- Login Google com Supabase (PKCE) volta para `location.origin + location.pathname` com `?code=...`. Dados de saúde ficam em `localStorage` e no Supabase.
- O modo offline hoje depende só do cache HTTP do navegador, que não é garantido.

## Goals / Non-Goals

**Goals:**
- Uso confortável com uma mão em telas de 320 a 430 px, em iOS e Android.
- App instalável (ícone na tela inicial, abertura em tela cheia).
- Abrir e funcionar sem internet, inclusive após fechar e reabrir o app.
- Atualizações do app chegarem ao usuário sem ficar preso em versão antiga.
- Manter a CSP restritiva e não persistir dados sensíveis no cache do service worker.

**Non-Goals:**
- Notificações push, Background Sync, atalhos do app e publicação em lojas.
- Dividir o `index.html` em módulos ou introduzir build.
- Redesenhar a identidade visual (cores, tipografia).
- Layout próprio para desktop e tablet além do que já existe (coluna de 520 px centralizada).

## Decisions

### 1. Manter o app em `index.html` e acrescentar apenas arquivos estáticos
Novos arquivos na raiz: `manifest.webmanifest`, `sw.js` e `icons/`. O service worker precisa ser um arquivo separado por exigência do navegador. O restante continua inline, preservando o padrão do projeto.
- Alternativa descartada: gerar manifesto e service worker por `Blob`/`data:` URL para ficar em um arquivo só. Não funciona de forma confiável (o service worker exige URL do mesmo domínio) e conflita com a CSP.

### 2. Todos os caminhos relativos
`start_url` e `scope` do manifesto valem `"./"`, os ícones usam `icons/...` e o registro usa `sw.js`. Assim o app funciona na raiz (`localhost:8000`) e em subcaminho (GitHub Pages) sem configuração. Caminhos começando com `/` quebrariam no GitHub Pages.

### 3. Estratégia de cache por tipo de requisição
O service worker só responde a requisições `GET` de uma lista fechada. Todo o resto (inclusive `*.supabase.co`) passa direto para a rede, sem `respondWith`.

| Requisição | Estratégia | Motivo |
| --- | --- | --- |
| Navegação (`index.html`) | Rede primeiro, com limite de 4 s; se falhar, usa o cache | Quem está online recebe sempre a versão mais nova. Quem está offline abre o app. |
| `manifest.webmanifest` e `icons/*` | Pré-cache na instalação; cache primeiro | Raramente mudam. |
| `supabase-js` (jsDelivr, versão fixa) | Cache primeiro, preenchido em tempo de execução | A URL tem versão fixa, então o conteúdo não muda. Sem duplicar o hash SRI no service worker. |
| Google Fonts (CSS e `woff2`) | Cache primeiro com atualização em segundo plano | Evita pisca de fonte e funciona offline. |

- Alternativa descartada: cache primeiro para o `index.html`. É mais rápido, mas deixa o usuário uma abertura atrás da versão publicada, o que atrapalha correções de segurança.
- Limite: a biblioteca `supabase-js` só entra no cache a partir da segunda abertura, porque na primeira o service worker ainda não controla a página. Sem a biblioteca offline, o app já cai no modo sem login e usa o cache local (comportamento existente em `initAuth`).

### 4. Nunca guardar dados sensíveis no cache
- O cache contém apenas arquivos estáticos do app e bibliotecas públicas.
- A resposta de navegação é gravada sempre sob a chave da raiz do escopo (`./`), nunca sob a URL com query. Assim o `?code=` do retorno do login Google não vira chave de cache. Na leitura de fallback, a query é ignorada.
- Respostas de erro (não `ok`) não são gravadas, exceto respostas opacas de fontes.
- Ao sair da conta (`logout`), o cache do service worker não precisa ser limpo, porque não contém dados do usuário.

### 5. Versão do cache definida no `sw.js`
O `sw.js` tem a própria constante `VERSAO`, igual à do `index.html`, e nomeia o cache `emagrecai-<versão>`. Ao ativar, apaga os caches `emagrecai-*` de outras versões. O registro usa sempre a mesma URL (`sw.js`). Assim, mudar o arquivo `sw.js` é o que faz o navegador detectar uma nova versão, inclusive em um app instalado que ficou aberto por dias (o navegador reconsulta o `sw.js` ao voltar para o app).
- Custo: a versão fica em dois lugares (`index.html` e `sw.js`). O README e o comentário no topo do `sw.js` avisam para alterar os dois.
- Alternativa descartada: registrar `sw.js?v=<VERSAO>` para ter uma só fonte. Um app que já está aberto continua com a versão antiga da página e nunca consulta a URL nova, então a atualização não seria detectada.

### 6. Fluxo de atualização com confirmação
O novo service worker instala e fica em espera (sem `skipWaiting` automático). Quando a página detecta um worker em espera e já existe um controlador, mostra um aviso fixo "Nova versão disponível" com o botão "Atualizar". Ao tocar, envia `SKIP_WAITING` ao worker, que ativa e assume o controle. A página recarrega uma única vez em `controllerchange`.
- Motivo da confirmação: recarregar sozinho poderia descartar um alimento que o usuário está digitando na folha.
- O aviso é um elemento próprio (`#upd`), porque o `#toast` atual some em 6 s e não tem botão.

### 7. Instalação
- **Android e desktop (Chromium)**: capturar `beforeinstallprompt`, chamar `preventDefault()` e guardar o evento. O card "Instalar app" no Perfil mostra o botão "Instalar" e chama `prompt()` ao toque. O evento `appinstalled` esconde o card.
- **iOS (Safari)**: não existe `beforeinstallprompt`. Detecta-se iOS pelo user agent (incluindo iPadOS que se identifica como Mac com toque) e exibe-se uma instrução curta: Compartilhar > Adicionar à Tela de Início.
- **Já instalado**: se `matchMedia("(display-mode: standalone)").matches` ou `navigator.standalone`, o card não é exibido.
- **Navegador sem suporte** (por exemplo Firefox desktop): o card não aparece, sem mensagem de erro.
- O card é gerado por `profile()` junto com os demais, usando `esc()` nos textos dinâmicos, como o resto do código.

### 8. Layout mobile por ajustes de CSS no bloco existente
Sem reescrever telas. Mudanças pontuais no `<style>`:
- Variável `--tap:44px` aplicada em `.add`, `.del`, `.dnav button`, `.rnd`, `.nav button` e `.tabs button`. O ícone pode continuar pequeno dentro de uma área maior.
- `input,select{font-size:16px}` evita o zoom automático do iOS ao focar. Não se usa `user-scalable=no`, para manter o zoom de acessibilidade.
- Telas estreitas: `.dnav span` com largura mínima menor; `.ring svg` passa a `width:100%;height:auto` e, abaixo de 360 px, `.ring` diminui para 120 px; `.macros` e `.pv` usam fonte e espaçamento menores nessa faixa.
- Folha: `max-height:min(88dvh, 100% - safe-area)`, com `100vh` como alternativa para navegadores antigos, e rolagem interna na lista e no formulário. O viewport ganha `interactive-widget=resizes-content` (Chrome Android). Para o iOS Safari, que ignora essa opção, um pequeno ouvinte de `visualViewport` (`resize` e `scroll`) grava a altura e o deslocamento da área visível em `--vvh` e `--vvt`, e o contêiner `#sheet` passa a ocupar exatamente essa área. A folha usa `max-height:88%` desse contêiner (em vez de `dvh`) e rola internamente. Com zoom por pinça (escala acima de 1,05) os valores são removidos.
- Toque: `touch-action:manipulation` em botões, `-webkit-tap-highlight-color:transparent`, `-webkit-text-size-adjust:100%` e `overscroll-behavior-y:contain` no `body`. Os estados `:focus-visible` existentes são mantidos.
- Duas metas `theme-color` com `media="(prefers-color-scheme: ...)"` (`#F2F5F1` e `#0F1713`), seguindo as cores já usadas em `--bg`.
- Alternativa descartada: nova versão do layout com framework de CSS. Adiciona dependência e quebra o padrão do projeto.

### 9. Ícones
O ícone é a imagem enviada pelo autor (balança verde com fita métrica), guardada como `icons/icon-source.png`. Dela saem quatro PNG, gerados uma vez: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (imagem reduzida para os 80% centrais da área segura, sobre fundo verde sólido) e `apple-touch-icon.png` (180, sem transparência, porque o iOS preenche transparência com preto). Os PNG são versionados; o repositório não ganha ferramenta de geração.
- A imagem de origem é pequena (cerca de 100 px). Ampliada para 512 px ela fica com bordas suaves. Para um resultado nítido, o ideal é uma versão de pelo menos 512 x 512 px ou em SVG. Se não houver, usa-se a imagem ampliada, e o ícone pode ser trocado depois sem mudar o código (só os arquivos de `icons/`).
- A cor do fundo do ícone mascarável e do `apple-touch-icon` é amostrada da própria imagem, para não aparecer faixa de outra cor nas bordas.

### 10. CSP
Acrescentar `manifest-src 'self'; worker-src 'self'` à meta tag. `img-src` já inclui `'self'` (ícones). O script do service worker não herda a CSP da meta tag da página, e o GitHub Pages não envia cabeçalho de CSP para ele. Depois de editar o script inline, recalcular o hash com o comando do README e atualizar `script-src`.

## Risks / Trade-offs

- **[Cache mantém versão antiga do app]** → Navegação com rede primeiro, cache nomeado por versão e aviso de atualização. Uma nova versão do `sw.js` é detectada ao abrir o app e sempre que o usuário volta para ele.
- **[Esquecer de atualizar o hash da CSP]** → Já é um risco existente. Entra como etapa explícita nas tarefas, com teste de abrir o app e ver o console sem erro de CSP.
- **[Login Google no app instalado no iOS]** → O armazenamento do app instalado é separado do Safari, e o fluxo de redirecionamento pode se comportar diferente. Mitigação: testar em dispositivo real; o modo visitante continua disponível; registrar o resultado no README se houver limitação.
- **[Service worker com defeito deixa o app inacessível]** → O worker não intercepta o que não está na lista e a navegação sempre tenta a rede primeiro. Reversão: publicar um `sw.js` que apaga os caches e chama `registration.unregister()`.
- **[`dvh` e `interactive-widget` em navegadores antigos]** → Há alternativa com `vh` e `%`; o pior caso é o comportamento atual.
- **[Cores do manifesto são fixas]** → `theme_color` e `background_color` do manifesto não acompanham o tema escuro. A barra do navegador usa as metas com `media`; a tela de abertura (splash) do Android usa a cor clara. Aceito como limitação.
- **[Cota de armazenamento do cache]** → O cache é pequeno (HTML, ícones, biblioteca e fontes), bem abaixo dos limites do navegador.

## Migration Plan

1. Implementar e testar localmente com `python -m http.server 8000` (o service worker funciona em `localhost` sem HTTPS).
2. Publicar no GitHub Pages (HTTPS). Quem já usa o app recebe o `index.html` novo na próxima abertura; o service worker é registrado nesse momento.
3. Não há migração de dados: o `localStorage` e o banco não mudam.
4. Reversão: voltar o commit e publicar um `sw.js` de limpeza (apaga caches e se desregistra) por pelo menos um ciclo de atualização, para remover o worker dos aparelhos que já o instalaram.

## Open Questions

- Arquivo do ícone: a imagem enviada na conversa ainda precisa ser salva no projeto (`icons/icon-source.png`). Idealmente em 512 x 512 px ou maior.
- Decidido: o nome curto na tela inicial é "EmagrecAI"; o nome completo continua "EmagrecAI – Diário nutricional".
- Decidido: o teste de instalação e do login com Google será feito pelo autor em um iPhone real.
