## 1. Ícones e manifesto

- [x] 1.1 Salvar a imagem do ícone enviada pelo autor em `icons/icon-source.png` (conferir o tamanho; ideal 512 x 512 px ou maior)
- [x] 1.2 Gerar `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png` (imagem dentro dos 80% centrais, sobre fundo sólido da cor da própria imagem) e `icons/apple-touch-icon.png` (180 x 180, sem transparência), e conferir visualmente cada um
- [x] 1.3 Criar `manifest.webmanifest` com `name`, `short_name`, `lang: "pt-BR"`, `display: "standalone"`, `start_url: "./"`, `scope: "./"`, cores e ícones (todos os caminhos relativos)
- [x] 1.4 No `<head>` do `index.html`, adicionar `<link rel="manifest">`, `<link rel="apple-touch-icon">`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title` e as duas metas `theme-color` com `media` (`#F2F5F1` e `#0F1713`)

## 2. CSS de layout mobile

- [x] 2.1 Criar a variável `--tap:44px` e aplicá-la em `.add`, `.del`, `.dnav button`, `.rnd`, `.tabs button` e `.nav button`, ajustando o espaçamento para a linha de itens não crescer demais
- [x] 2.2 Definir `font-size:16px` em `input,select`; manter o zoom por gesto (sem `user-scalable=no`)
- [x] 2.3 Telas estreitas: reduzir `min-width` de `.dnav span`; `.ring svg` com `width:100%;height:auto`; `@media (max-width:359px)` com anel de 120 px e macros e prévia com fonte e espaçamento menores
- [x] 2.4 Folha: `max-height` relativo à área visível, rolagem interna do conteúdo, `interactive-widget=resizes-content` no meta viewport e ouvinte de `visualViewport` que grava `--vvh` e `--vvt` para o iOS
- [x] 2.5 Toque: `touch-action:manipulation`, `-webkit-tap-highlight-color:transparent`, `-webkit-text-size-adjust:100%` e `overscroll-behavior-y:contain`
- [x] 2.6 Conferir que `#app` continua com `max-width:520px` centralizado e que a área segura (topo e base) segue aplicada

## 3. Service worker

- [x] 3.1 Criar `sw.js` com constante `VERSAO` (igual à do `index.html`) e cache `emagrecai-<versão>`
- [x] 3.2 Pré-cache na instalação de `./`, `manifest.webmanifest` e dos ícones; sem `skipWaiting` automático
- [x] 3.3 Na ativação, apagar caches `emagrecai-*` de outras versões e chamar `clients.claim()`
- [x] 3.4 Tratar `fetch` só para `GET` em lista fechada: navegação (rede primeiro, limite de 4 s, fallback ao cache), ícones e manifesto (cache primeiro), `supabase-js` do jsDelivr (cache primeiro, preenchido em execução) e Google Fonts (cache primeiro com atualização em segundo plano). Todo o resto segue direto para a rede
- [x] 3.5 Gravar a resposta de navegação sempre sob a chave `./`, nunca sob URL com query, e não gravar respostas com erro
- [x] 3.6 Tratar a mensagem `SKIP_WAITING` chamando `self.skipWaiting()`

## 4. Integração no `index.html`

- [x] 4.1 Registrar o worker com `navigator.serviceWorker.register("sw.js")` dentro de `catch`, só quando `"serviceWorker" in navigator` e o protocolo não for `file:`
- [x] 4.2 Criar o elemento `#upd` (aviso fixo com botão "Atualizar") e a lógica de `updatefound`/`waiting`: exibir só se já houver `navigator.serviceWorker.controller`; ao tocar, enviar `SKIP_WAITING` e recarregar uma única vez em `controllerchange`
- [x] 4.3 Capturar `beforeinstallprompt` (com `preventDefault()` e guarda do evento) e tratar `appinstalled`
- [x] 4.4 Criar `installCard()` chamado em `profile()`: botão "Instalar" quando houver evento guardado; instruções do iOS (inclusive iPadOS) quando for iOS e não estiver instalado; nada quando já estiver em `standalone` ou sem suporte
- [x] 4.5 Adicionar o handler `data-a="install"` no listener de cliques, chamando `prompt()` somente por ação do usuário e atualizando o card em seguida
- [x] 4.6 Atualizar a CSP: `manifest-src 'self'; worker-src 'self'`, mantendo as demais diretivas

## 5. Versão, CSP e documentação

- [x] 5.1 Atualizar `VERSAO` para `1.3.0` e conferir que o rodapé do Perfil exibe "EmagrecAI v1.3.0"
- [x] 5.2 Recalcular o hash SHA-256 do script inline (comando do README) e atualizar `script-src` na meta de CSP
- [x] 5.3 Atualizar o `README.md`: versão atual, funcionalidade "Novo na 1.3.0", seção de instalação (Android, iOS e desktop), estrutura do projeto (`manifest.webmanifest`, `sw.js`, `icons/`), aviso para alterar `VERSAO` nos dois arquivos, CSP com as novas diretivas e histórico de versões
- [x] 5.4 Revisar a ortografia em português de todos os textos novos da interface (card de instalação, aviso de atualização e instruções do iOS)

## 6. Verificação

- [x] 6.1 Servir com `python -m http.server 8000`, abrir `http://localhost:8000` e confirmar que o service worker está ativo e o cache `emagrecai-1.3.0` existe (o manifesto só ficará sem erro de ícones depois das tarefas 1.1 e 1.2)
- [x] 6.2 Confirmar que o console não mostra violação de CSP e que não há entradas do Supabase nem URL com `code=` no Cache Storage
- [x] 6.3 Simular "Offline", recarregar e conferir que o app abre e registra uma refeição (a sincronização da fila com conta logada fica para o teste em aparelho real, tarefa 6.6)
- [x] 6.4 Simular nova versão (alterar o `sw.js`) e conferir o aviso "Nova versão disponível"; a página só recarrega após tocar em "Atualizar" e o cache fica só com a versão atual
- [x] 6.5 Emular 320 px e conferir: sem rolagem horizontal, alvos de 44 px, anel e macros legíveis e folha utilizável (430 px e 360 px ainda sem conferência visual)
- [x] 6.6 Testar em aparelho real Android (Chrome), se houver: instalar pelo botão, abrir em tela cheia, entrar com Google, abrir sem internet
- [x] 6.7 Testar no iPhone do autor (Safari, via GitHub Pages): ausência de zoom ao focar campos, Adicionar à Tela de Início, ícone sem fundo preto e login com Google no app instalado (registrar limitações no README, se houver)
- [x] 6.8 Conferir ícones e manifesto no navegador (a ferramenta de Lighthouse disponível não tem a categoria PWA): os quatro ícones carregam nos tamanhos corretos, estão no cache e o console não mostra erros
- [x] 6.9 Gerar o resumo das alterações para a descrição do commit em português do Brasil
