# pwa-offline-update Specification

## Purpose
TBD - created by archiving change optimize-mobile-pwa. Update Purpose after archive.
## Requirements
### Requirement: Funcionamento offline do app
O app SHALL registrar um service worker no escopo do app e guardar em cache o `index.html`, o manifesto, os ícones, o catálogo de alimentos (`data/taco.json`), a biblioteca `supabase-js` e as fontes, de modo que o app abra e funcione sem internet depois da primeira visita online.

#### Scenario: Abrir sem internet
- **WHEN** o usuário já abriu o app online e depois o abre sem conexão
- **THEN** o app carrega normalmente e permite registrar e consultar refeições, água e peso

#### Scenario: Alterações offline de conta
- **WHEN** um usuário logado registra uma refeição sem conexão
- **THEN** a alteração entra na fila de pendências existente e é enviada ao banco quando a conexão volta

#### Scenario: Primeira visita sem internet
- **WHEN** o usuário nunca abriu o app online e tenta abri-lo sem conexão
- **THEN** o navegador exibe o próprio aviso de falta de conexão, sem erro causado pelo app

#### Scenario: Busca no catálogo sem internet
- **WHEN** o usuário já abriu o app online e busca um alimento do catálogo sem conexão
- **THEN** o catálogo é servido do cache e a busca retorna os itens normalmente

### Requirement: Versão atual quando online
O service worker SHALL tentar a rede primeiro para a navegação (`index.html`) e usar o cache apenas quando a rede falhar ou demorar mais de 4 segundos, para que usuários online recebam a versão publicada mais recente.

#### Scenario: Nova versão publicada
- **WHEN** uma nova versão do app é publicada e o usuário abre o app com internet
- **THEN** a página carregada é a nova versão do `index.html`

#### Scenario: Rede lenta
- **WHEN** a rede não responde em até 4 segundos
- **THEN** o app abre a partir do cache

### Requirement: Dados sensíveis fora do cache
O service worker MUST NOT guardar em cache respostas do Supabase, requisições de autenticação ou qualquer requisição que não esteja na lista de arquivos estáticos permitidos. O service worker MUST NOT guardar a URL de retorno do login (com `code` ou `error` na query) como chave de cache.

#### Scenario: Requisição ao Supabase
- **WHEN** o app consulta ou grava dados em `*.supabase.co`
- **THEN** a requisição segue direto para a rede e nada é gravado no Cache Storage

#### Scenario: Retorno do login Google
- **WHEN** o navegador volta do login com a URL contendo `?code=...`
- **THEN** o Cache Storage não contém nenhuma entrada com esse `code` na URL

### Requirement: Cache versionado e limpeza de versões antigas
O service worker SHALL nomear o cache com a versão do app (`emagrecai-<versão>`), definida na constante `VERSAO` do `sw.js` (igual à do `index.html`), e SHALL apagar os caches `emagrecai-*` de outras versões ao ativar.

#### Scenario: Atualização de versão
- **WHEN** o app é atualizado de uma versão para outra e o novo service worker é ativado
- **THEN** o Cache Storage passa a ter somente o cache da versão nova

### Requirement: Aviso e atualização controlada
Quando houver uma nova versão do service worker aguardando e já existir um controlador, o app SHALL exibir o aviso "Nova versão disponível" com o botão "Atualizar". O app MUST NOT recarregar a página sem ação do usuário. Ao tocar em "Atualizar", o app SHALL ativar o novo worker e recarregar a página uma única vez.

#### Scenario: Nova versão detectada
- **WHEN** o app está aberto e um novo service worker termina de instalar
- **THEN** o aviso "Nova versão disponível" aparece com o botão "Atualizar", sem recarregar a página

#### Scenario: Usuário atualiza
- **WHEN** o usuário toca em "Atualizar"
- **THEN** a página recarrega uma vez e passa a rodar a versão nova

#### Scenario: Usuário está digitando
- **WHEN** a folha de adicionar alimento está aberta com dados preenchidos e uma nova versão é detectada
- **THEN** a página não recarrega e os dados digitados são mantidos

### Requirement: Política de segurança de conteúdo compatível
A Content-Security-Policy do app SHALL incluir `manifest-src 'self'` e `worker-src 'self'` e SHALL permitir `'self'` em `connect-src` somente para que o app leia o catálogo do próprio endereço, sem liberar nenhum domínio externo novo e sem relaxar as demais diretivas, e o hash do script inline SHALL corresponder ao script publicado.

#### Scenario: Console sem violações
- **WHEN** o app é aberto em um navegador após a mudança
- **THEN** o console não exibe violações de CSP, o manifesto é carregado, o catálogo é lido e o service worker é registrado

#### Scenario: Origem não permitida
- **WHEN** a página tenta carregar um script ou worker de uma origem fora da lista
- **THEN** o navegador bloqueia o carregamento

#### Scenario: Conexão a domínio não listado
- **WHEN** o app tenta fazer uma requisição `fetch` a um domínio externo diferente do Supabase
- **THEN** o navegador bloqueia a requisição
### Requirement: Biblioteca de leitura em cache
O service worker SHALL incluir o arquivo local da biblioteca de leitura de código de barras (`vendor/zxing.min.js`) na lista de arquivos estáticos guardados, atendendo-o com cache primeiro, no mesmo cache versionado dos demais arquivos.
#### Scenario: Leitura sem internet
- **WHEN** o app já foi aberto online e o usuário escaneia um código sem conexão em navegador sem `BarcodeDetector`
- **THEN** a biblioteca é carregada do cache e a câmera lê o código, deixando a consulta do produto sujeita à conexão
#### Scenario: Nova versão do app
- **WHEN** uma nova versão é publicada com `VERSAO` diferente no `sw.js`
- **THEN** o cache antigo é removido e o arquivo da biblioteca é guardado no cache novo
