## Why

O app é usado quase só no celular, mas o layout foi pensado de forma genérica: botões de toque pequenos (34 px e 30 px), campos com fonte de 15 px (o iOS aplica zoom automático ao focar), folha de adicionar alimento que não considera o teclado virtual e telas de 320 px apertadas. Além disso, o app só abre pelo navegador. Não há ícone na tela inicial, não há tela cheia e o modo offline depende do cache HTTP do navegador, que pode ser descartado. Transformar o app em PWA (Progressive Web App) resolve os dois pontos de uma vez.

> Nota: o pedido citava "wpa". Foi assumido que o termo correto é **PWA** (app instalável na tela inicial).

## What Changes

- **Layout mobile**
  - Alvos de toque com no mínimo 44 px (botões de dia, adicionar refeição, remover item, água e navegação inferior).
  - Campos de formulário com 16 px, para o iOS não aplicar zoom ao focar.
  - Ajustes para telas estreitas (320 px): anel de calorias, macros e prévia do alimento sem quebrar nem estourar a largura.
  - Folha "Adicionar alimento" com altura baseada em `dvh` e rolagem interna, para o teclado virtual não cobrir os campos nem o botão de confirmar.
  - Área segura (notch e barra de gestos) respeitada em todas as bordas, inclusive em modo tela cheia.
  - Ajustes de toque: sem atraso de duplo toque (`touch-action: manipulation`), sem destaque cinza ao tocar, sem rolagem elástica que puxa a página para atualizar por engano, e `text-size-adjust` fixo.
  - Cor da barra do navegador (`theme-color`) acompanhando o tema claro e escuro.
- **Instalação como PWA**
  - Novo `manifest.webmanifest` (nome, nome curto, `display: standalone`, cores, ícones).
  - Ícones PNG 192, 512, 512 maskable e `apple-touch-icon` 180, gerados a partir da imagem do ícone enviada pelo autor (balança verde com fita métrica).
  - Novo `sw.js` (service worker) que guarda o app em cache para abrir sem internet e atualiza em segundo plano.
  - Card "Instalar app" no Perfil: botão de instalação no Android e no desktop (evento `beforeinstallprompt`) e instruções curtas para iOS (Safari > Compartilhar > Adicionar à Tela de Início). O card some quando o app já está instalado.
  - Aviso "Nova versão disponível" com botão para recarregar quando um novo service worker é encontrado.
- **Segurança (CSP)**: a meta tag de Content-Security-Policy ganha `manifest-src 'self'` e `worker-src 'self'`. Sem isso, o `default-src 'none'` bloqueia o manifesto e o service worker. O hash do script inline é recalculado.
- **Documentação e versão**: `README.md` documenta a instalação e a nova estrutura de arquivos. A versão sobe de `1.2.1` para `1.3.0` (constante `VERSAO`, rodapé do Perfil e histórico).

Não há mudanças **BREAKING**: o formato dos dados no `localStorage` e as tabelas do Supabase não mudam.

## Capabilities

### New Capabilities
- `mobile-layout`: requisitos de usabilidade em telas de celular (alvos de toque, tamanho de fonte dos campos, telas estreitas, teclado virtual, área segura e tema da barra do navegador).
- `pwa-install`: manifesto, ícones e card de instalação no Perfil (Android, desktop e instruções para iOS).
- `pwa-offline-update`: service worker com cache do app para uso offline e fluxo de atualização com aviso ao usuário.

### Modified Capabilities
<!-- Nenhuma: ainda não existem specs em openspec/specs/. As mudanças em change anteriores (login Google e sincronização) não alteram requisitos. -->

## Impact

- **Código**: `index.html` (CSS, `<head>` com manifest, ícones e `theme-color`, meta de CSP, card em `profile()`, registro do service worker e tratamento de `beforeinstallprompt`). Novos arquivos na raiz: `manifest.webmanifest`, `sw.js` e uma pasta `icons/`.
- **Dependências**: nenhuma nova. Tudo usa APIs do navegador.
- **Segurança e privacidade**: o service worker só guarda arquivos estáticos do app e bibliotecas públicas. Nunca guarda respostas do Supabase (dados de saúde e tokens) nem requisições de login. A CSP continua restritiva, com apenas duas diretivas a mais, ambas limitadas a `'self'`.
- **Compatibilidade**: o app deve ser publicado em HTTPS (GitHub Pages atende). Como o GitHub Pages serve o app em um subcaminho, todos os caminhos do manifesto e do service worker são relativos. No iOS, a instalação é manual (sem `beforeinstallprompt`) e o login com Google no app instalado deve ser testado, porque o armazenamento do app instalado é separado do Safari.
- **Performance**: primeira abertura igual à atual. As seguintes passam a carregar do cache local.
- **Documentação**: `README.md` (instalação, estrutura do projeto, versão e histórico).
- **Versão**: `1.2.1` para `1.3.0`.
- **Fora de escopo**: notificações push, sincronização em segundo plano (Background Sync), atalhos do app, publicação em lojas (Play Store e App Store), reestruturação do `index.html` em vários arquivos e mudança visual de identidade (cores e tipografia).
