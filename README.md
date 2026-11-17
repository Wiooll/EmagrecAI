# EmagrecAI – Diário nutricional

Diário alimentar simples para acompanhar calorias, macronutrientes, água e peso. Funciona em um único arquivo HTML, sem build. Com login Google, os dados ficam em um banco Supabase e sincronizam entre dispositivos.

**Versão atual:** 1.3.0

## Funcionalidades

- Registro de refeições (café da manhã, almoço, jantar e lanches) com busca em uma base de alimentos comuns no Brasil.
- Cadastro de alimentos próprios, com valores por 100 g.
- Medidas caseiras (colher, fatia, unidade etc.) ou gramas.
- Anel de calorias restantes e barras de carboidratos, proteínas e gorduras.
- Controle de água por copos de 250 ml.
- Registro de peso com gráfico de evolução e calorias dos últimos 7 dias.
- Perfil com meta calórica sugerida pela fórmula de Mifflin-St Jeor.
- Tema claro e escuro automático, de acordo com o sistema.
- **Novo na 1.1.0:** login opcional com Google e sincronização dos dados entre dispositivos (Supabase).
- **Novo na 1.1.0:** uso sem internet. As alterações ficam em uma fila e são enviadas quando a conexão volta.
- **Novo na 1.2.0:** card "Sobre o app" no Perfil, com o link do GitHub do autor e a chave Pix (com botão para copiar) para quem quiser colaborar com o desenvolvimento. As constantes `GITHUB_URL` e `PIX_KEY` ficam no `index.html`.
- **Novo na 1.2.1:** correções de segurança. Ao sair da conta, o cache local, a fila de pendências e a recusa de importação são apagados do navegador. O app passou a ter Content-Security-Policy, e o banco teve os privilégios reduzidos ao mínimo.

- **Novo na 1.3.0:** layout otimizado para celular (botões com área de toque de 44 px, campos sem zoom automático no iOS, telas a partir de 320 px, folha de adicionar alimento ajustada ao teclado virtual) e instalação como app (PWA), com ícone na tela inicial, tela cheia e uso sem internet.
## Instalar como app (PWA)
O app pode ser instalado na tela inicial. É necessário abri-lo por **HTTPS** (por exemplo, o GitHub Pages) ou por `http://localhost`.
- **Android (Chrome) e computador (Chrome ou Edge):** abra o app, vá em **Perfil > Instalar app** e toque em **Instalar**. Também é possível usar o menu do navegador.
- **iPhone e iPad (Safari):** toque em **Compartilhar** e depois em **Adicionar à Tela de Início**. O iOS não oferece botão de instalação para sites. O card no Perfil mostra essas instruções.
- O card "Instalar app" não aparece quando o app já está instalado ou quando o navegador não oferece instalação.
- **Uso sem internet:** o `sw.js` (service worker) guarda o app em cache depois da primeira visita online. Com internet, o app sempre busca a versão mais nova do `index.html` e usa o cache apenas se a rede falhar ou demorar mais de 4 segundos. A biblioteca do Supabase fica em cache a partir da segunda abertura. Respostas do Supabase e do login nunca são guardadas em cache.
- **Atualizações:** quando uma nova versão é publicada, o app mostra o aviso "Nova versão disponível" com o botão **Atualizar**. A página só recarrega depois do toque.
- **Ao publicar uma nova versão:** altere a constante `VERSAO` no `index.html` **e** no `sw.js` (os dois valores devem ser iguais). A mudança no `sw.js` é o que faz os aparelhos detectarem a atualização.
- **Ícones:** ficam em `icons/`. Para trocar, substitua os PNG mantendo os nomes e os tamanhos (192, 512, 512 mascarável e 180 para o iOS, sem transparência).
- **Limitação conhecida:** no iOS, o app instalado tem armazenamento separado do Safari. Quem já usava o modo visitante no Safari começa vazio no app instalado (os dados do Safari não são apagados). O login com Google no app instalado deve ser testado em aparelho real.
## Como executar

O app não precisa de build. Use uma das opções:

- Servir localmente: `python -m http.server 8000` e acessar `http://localhost:8000`. **Necessário para o login com Google.**
- Publicar no GitHub Pages: em **Settings > Pages**, escolha a branch `main` e a pasta `/ (root)`.
- Abrir o `index.html` direto no navegador. Funciona em modo visitante, mas o login com Google fica indisponível, porque o Google não aceita `file://`.

A fonte *Plus Jakarta Sans* é carregada do Google Fonts e a biblioteca `@supabase/supabase-js` (versão fixa, com verificação SRI) é carregada do jsDelivr. Sem internet, o app usa a fonte padrão do sistema e o modo visitante.

## Modo visitante e conta

- **Visitante (sem login):** os dados ficam apenas no `localStorage` do navegador, na chave `pratocheio`. Nada é enviado a servidores.
- **Conta Google:** os dados ficam no Supabase, vinculados à sua conta, e uma cópia fica no navegador (`pratocheio:<id da conta>`) para uso sem internet.
- No primeiro login com uma conta vazia, o app pergunta se você quer enviar os dados do navegador para a conta. Os dados do visitante nunca são apagados por isso.
- "Apagar todos os dados" apaga somente o contexto ativo (visitante ou conta). Com login, ele não exclui a conta Google.

## Configuração do Supabase (para quem publica o próprio app)

1. Crie um projeto no [Supabase](https://supabase.com). O projeto atual é `EmagrecAI---Di-rio-nutricional`.
2. Aplique as migrações de `supabase/migrations/` em ordem (SQL Editor, `supabase db push` ou MCP). A primeira, `20261117150143_create_emagrecai_schema.sql`, cria as tabelas `profiles`, `food_entries`, `water_logs`, `weight_logs` e `custom_foods` com Row Level Security. A segunda, `20261117190332_revoke_extra_table_privileges.sql`, remove os privilégios `TRUNCATE`, `REFERENCES` e `TRIGGER` dos papéis `authenticated` e `anon`.
3. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um **OAuth Client ID** do tipo "Aplicativo da Web". Em "URIs de redirecionamento autorizados", informe `https://<ref-do-projeto>.supabase.co/auth/v1/callback`.
4. No Supabase, em **Authentication > Sign In / Providers > Google**, ative o provedor e informe o Client ID e o Client Secret. O Client Secret fica somente no painel do Supabase.
5. No Supabase, em **Authentication > URL Configuration**, cadastre as **Redirect URLs** onde o app roda, por exemplo `http://localhost:8000/**` e a URL do GitHub Pages. Ajuste também a **Site URL**.
6. No `index.html`, confira as constantes `SUPABASE_URL` e `SUPABASE_KEY`. Se mudar de projeto, atualize também o endereço em `connect-src` na meta tag de Content-Security-Policy.
7. Se você usa somente o login com Google, desative em **Authentication > Sign In / Providers** os provedores **Email** e **Anonymous**. Assim ninguém cria conta diretamente pela API com a chave publicável.

## Segurança e privacidade

- A `SUPABASE_KEY` é a chave **publicável**. Ela é pública por natureza e pode ficar no HTML. A proteção dos dados vem da Row Level Security: cada usuário lê e altera somente as próprias linhas, e o acesso anônimo é bloqueado.
- A chave `service_role` e o Client Secret do Google **nunca** devem entrar no código nem no repositório.
- Peso, altura e hábitos alimentares são dados pessoais sensíveis. Na conta, eles ficam armazenados no Supabase. Não há exclusão de conta pelo app nesta versão.
- Ao sair da conta, o app tenta enviar as alterações pendentes e apaga do navegador os dados da conta (cache, fila e recusa de importação). Se ainda houver pendências, ele pede confirmação antes de sair. Os dados do modo visitante não são apagados.
- O `index.html` define uma **Content-Security-Policy** por meta tag: só o script inline do app (liberado por hash SHA-256), o `supabase-js` do jsDelivr, as fontes do Google, o endereço do Supabase e as fotos do Google são permitidos. O manifesto e o service worker são permitidos apenas do mesmo endereço do app (`manifest-src 'self'` e `worker-src 'self'`). O `supabase-js` é inserido por script (não por atributos `onload`/`onerror`), porque a CSP bloqueia código inline em atributos. Limitação: o GitHub Pages não permite cabeçalhos HTTP, então `frame-ancestors` (proteção contra clickjacking) não pode ser aplicado.
- **Ao editar o script inline do `index.html`, atualize o hash da CSP**, ou o app deixa de funcionar. Para calcular o novo hash, no PowerShell, na pasta do projeto: `$t=[IO.File]::ReadAllText("index.html"); $m=[regex]::Match($t,'<script>(.*?)</script>','Singleline'); "sha256-"+[Convert]::ToBase64String([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($m.Groups[1].Value)))`. Depois substitua o valor `sha256-...` em `script-src` na meta tag.
- Sem backend próprio: o navegador conversa direto com o Supabase.
- Projetos gratuitos do Supabase podem ser pausados por inatividade. Nesse caso o app continua com o cache local e sincroniza quando o projeto voltar.

## Estrutura do projeto

| Caminho | Descrição |
| --- | --- |
| `index.html` | Aplicação completa (HTML, CSS e JavaScript). |
| `manifest.webmanifest` | Manifesto do PWA (nome, cores, ícones e modo de exibição). |
| `sw.js` | Service worker: cache para uso sem internet e aviso de atualização. |
| `icons/` | Ícones do app (192, 512, 512 mascarável e `apple-touch-icon` de 180) e a imagem de origem `icon-source.png`. |
| `supabase/migrations/` | Migrações SQL do banco (tabelas, restrições e RLS). |
| `openspec/` | Especificações e propostas de mudança (OpenSpec). |
| `.kiro/` | Prompts e skills do Kiro usados no fluxo OpenSpec. |

## Créditos
- Ícone do app: "IMC" (`icons8-imc-512`), de [Icons8](https://icons8.com). Confira a licença e a exigência de atribuição do Icons8 para o seu tipo de uso.
## Aviso

As informações nutricionais são aproximadas e não substituem orientação profissional. Para metas clínicas, consulte um nutricionista.

## Histórico de versões
- **1.3.0**: layout otimizado para celular e instalação como PWA (manifesto, ícones, service worker, uso sem internet, card "Instalar app" e aviso de nova versão). A CSP ganhou `manifest-src 'self'` e `worker-src 'self'`.

- **1.2.1**: segurança. Limpeza dos dados da conta no navegador ao sair, Content-Security-Policy e revogação de privilégios `TRUNCATE`, `REFERENCES` e `TRIGGER` no banco.
- **1.2.0**: card "Sobre o app" no Perfil, com link do GitHub e chave Pix copiável para colaboração com o desenvolvimento.
- **1.1.0**: banco de dados Supabase, login opcional com Google, sincronização entre dispositivos, fila de gravações offline e importação opcional dos dados do visitante. Versão exibida no rodapé do Perfil.
- **1.0.0**: versão inicial publicada no GitHub.
