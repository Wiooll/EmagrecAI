## Why

Hoje o EmagrecAI é um único arquivo HTML sem backend. Todos os dados ficam na chave `pratocheio` do `localStorage`, então não há sincronização entre dispositivos, qualquer limpeza do navegador apaga tudo e quem divide o navegador sobrescreve os registros de outra pessoa. Um banco de dados na nuvem, com login Google, resolve os três problemas e permite usar o mesmo diário no celular e no computador.

## What Changes

- Novo banco de dados **Supabase (Postgres)** com tabelas para perfil, registros de alimentos, água, peso e alimentos personalizados, todas com **Row Level Security (RLS)**: cada usuário lê e escreve só as próprias linhas.
- Login com a conta Google via **Supabase Auth** (`signInWithOAuth`), com botão "Entrar com Google" e "Sair" na tela de Perfil. O login é opcional.
- Modo visitante preservado: sem login, o app continua gravando em `pratocheio` no `localStorage`, exatamente como hoje.
- Com login, o app carrega os dados do banco e grava cada alteração no banco. O `localStorage` passa a ser apenas cache offline da conta (`pratocheio:<user_id>`).
- Alterações feitas sem conexão ficam em uma fila local e são reenviadas quando a conexão volta.
- No primeiro login de uma conta sem dados, o app pergunta se o usuário quer enviar os dados atuais do navegador (modo visitante) para a conta. Os dados do visitante não são apagados.
- "Apagar todos os dados" passa a apagar apenas os dados do contexto ativo (visitante ou conta). Com login, apaga as linhas do banco e o cache da conta, mas não exclui a conta.
- Os dados são atualizados também quando o app volta a ficar visível (outra aba ou outro dispositivo), sem exigir recarregar a página.
- Migrações SQL versionadas no repositório (`supabase/migrations/`).
- Criação do `README.md` (hoje inexistente) com a configuração do Supabase e do Google, e como executar o app.
- Exibição da versão do app (`1.1.0`) no rodapé do Perfil.
- Esta mudança **substitui** a proposta `add-google-login`: a identidade passa a vir do Supabase Auth, e a separação de dados por conta passa a ser feita pelo banco, não por chaves do `localStorage` baseadas no `sub` do Google.

Não há mudanças **BREAKING**: os dados e o fluxo do modo visitante continuam funcionando.

## Capabilities

### New Capabilities

- `google-auth`: entrar e sair com a conta Google pelo Supabase Auth, sessão persistida pela biblioteca, exibição de nome e foto e comportamento quando o login está indisponível.
- `cloud-data-sync`: esquema do banco com RLS, leitura e gravação dos dados da conta, fila de gravações pendentes quando offline, atualização ao voltar ao app e escopo do "Apagar todos os dados".
- `guest-data-migration`: preservação do modo visitante e envio opcional dos dados do navegador para a conta no primeiro login.

### Modified Capabilities

<!-- Nenhuma: ainda não existem specs em openspec/specs/. -->

## Impact

- **Código**: `EmagrecAI – Diário nutricional.html` (funções `load`/`save`/`reset`, handlers de clique que alteram dados, tela `profile()`, bloco de sessão e sincronização, estilos do card "Conta").
- **Novo**: `supabase/migrations/*.sql` (esquema e políticas RLS) e `README.md`.
- **Dependências externas**: biblioteca `@supabase/supabase-js` v2, carregada por CDN com versão fixa. Serviço Supabase (banco e Auth) e provedor Google configurado no Supabase.
- **Configuração obrigatória** (feita pelo usuário, nunca versionada com segredos):
  - Um projeto Supabase para o EmagrecAI. O único projeto existente na conta (`listae`) pertence a outro app e **não** será usado.
  - Um OAuth Client ID e Secret do Google Cloud, informados no painel do Supabase (o secret nunca entra no código).
  - Constantes públicas no HTML: URL do projeto e chave publicável (`anon`/publishable). Elas são públicas por natureza, e a proteção dos dados vem da RLS.
- **Segurança e privacidade**: dados de saúde (peso, altura, alimentação) são dados pessoais sensíveis pela LGPD. A RLS é obrigatória em todas as tabelas, a chave `service_role` nunca é usada no navegador, e o README deve informar onde os dados ficam armazenados.
- **Compatibilidade**: o Google OAuth não funciona em `file://`. O app precisa ser aberto por `http://localhost` ou por um domínio hospedado (por exemplo Vercel), e essa URL precisa estar cadastrada como Redirect URL no Supabase.
- **Fora de escopo**: edição em tempo real entre dispositivos (Realtime), outros provedores de login, exclusão da conta, exportação de dados, backend próprio e criptografia dos dados no cliente.
