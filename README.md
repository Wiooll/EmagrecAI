# EmagrecAI – Diário nutricional

Diário alimentar simples para acompanhar calorias, macronutrientes, água e peso. Funciona em um único arquivo HTML, sem build. Com login Google, os dados ficam em um banco Supabase e sincronizam entre dispositivos.

**Versão atual:** 1.1.0

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
2. Aplique a migração `supabase/migrations/20261117150143_create_emagrecai_schema.sql` (SQL Editor, `supabase db push` ou MCP). Ela cria as tabelas `profiles`, `food_entries`, `water_logs`, `weight_logs` e `custom_foods` com Row Level Security.
3. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um **OAuth Client ID** do tipo "Aplicativo da Web". Em "URIs de redirecionamento autorizados", informe `https://<ref-do-projeto>.supabase.co/auth/v1/callback`.
4. No Supabase, em **Authentication > Sign In / Providers > Google**, ative o provedor e informe o Client ID e o Client Secret. O Client Secret fica somente no painel do Supabase.
5. No Supabase, em **Authentication > URL Configuration**, cadastre as **Redirect URLs** onde o app roda, por exemplo `http://localhost:8000/**` e a URL do GitHub Pages. Ajuste também a **Site URL**.
6. No `index.html`, confira as constantes `SUPABASE_URL` e `SUPABASE_KEY`.

## Segurança e privacidade

- A `SUPABASE_KEY` é a chave **publicável**. Ela é pública por natureza e pode ficar no HTML. A proteção dos dados vem da Row Level Security: cada usuário lê e altera somente as próprias linhas, e o acesso anônimo é bloqueado.
- A chave `service_role` e o Client Secret do Google **nunca** devem entrar no código nem no repositório.
- Peso, altura e hábitos alimentares são dados pessoais sensíveis. Na conta, eles ficam armazenados no Supabase. Não há exclusão de conta pelo app nesta versão.
- Sem backend próprio: o navegador conversa direto com o Supabase.
- Projetos gratuitos do Supabase podem ser pausados por inatividade. Nesse caso o app continua com o cache local e sincroniza quando o projeto voltar.

## Estrutura do projeto

| Caminho | Descrição |
| --- | --- |
| `index.html` | Aplicação completa (HTML, CSS e JavaScript). |
| `supabase/migrations/` | Migrações SQL do banco (tabelas, restrições e RLS). |
| `openspec/` | Especificações e propostas de mudança (OpenSpec). |
| `.kiro/` | Prompts e skills do Kiro usados no fluxo OpenSpec. |

## Aviso

As informações nutricionais são aproximadas e não substituem orientação profissional. Para metas clínicas, consulte um nutricionista.

## Histórico de versões

- **1.1.0**: banco de dados Supabase, login opcional com Google, sincronização entre dispositivos, fila de gravações offline e importação opcional dos dados do visitante. Versão exibida no rodapé do Perfil.
- **1.0.0**: versão inicial publicada no GitHub.
