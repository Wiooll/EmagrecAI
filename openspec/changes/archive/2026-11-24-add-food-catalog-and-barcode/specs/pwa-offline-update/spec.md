## MODIFIED Requirements

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
