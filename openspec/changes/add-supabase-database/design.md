## Context

O app é um único arquivo HTML (cerca de 213 linhas), sem build e sem backend. O estado `S` (`{p, log, water, weights, custom}`) é carregado por `load()` e gravado por `save()` na chave `pratocheio` do `localStorage`. Os handlers de clique alteram `S` diretamente e chamam `save()` e `render()`. A tela `profile()` tem o card "Dados" com o botão "Apagar todos os dados".

Não existe `README.md`, número de versão, noção de usuário nem sincronização. A proposta `add-google-login` (sem código aplicado) previa login Google com dados separados em chaves do `localStorage`. Esta mudança a substitui: a identidade e a separação de dados passam a ser do Supabase.

Decisões já tomadas pelo usuário: banco **Supabase**, objetivo de **sincronizar entre dispositivos**, e **absorver** o login Google na mesma mudança.

## Goals / Non-Goals

**Goals:**

- Guardar os dados de cada conta em um banco Postgres, isolados por RLS.
- Entrar e sair com Google via Supabase Auth, de forma opcional.
- Sincronizar entre dispositivos e continuar utilizável sem internet.
- Não perder os dados de quem já usa o app (modo visitante e importação opcional).
- Manter o arquivo HTML único, sem etapa de build.

**Non-Goals:**

- Edição em tempo real entre dispositivos (Supabase Realtime).
- Resolução de conflitos além de "última gravação vence".
- Outros provedores de login, exclusão de conta, exportação de dados.
- Backend próprio, Edge Functions, criptografia no cliente.

## Decisions

### 1. Supabase Auth com PKCE em vez do Google Identity Services direto

O Supabase já valida o login Google no servidor e emite o JWT que a RLS usa (`auth.uid()`). Usar o GSI do Google separado exigiria `signInWithIdToken` e manter dois fluxos. Com `signInWithOAuth({provider:"google"})` o navegador redireciona ao Google e volta ao app, e a biblioteca troca o código por sessão (`flowType:"pkce"`, `detectSessionInUrl:true`, `persistSession:true`, `autoRefreshToken:true`).

O Client ID e o Client Secret do Google ficam **apenas** no painel do Supabase. O HTML só conhece a URL do projeto e a chave publicável.

Alternativa descartada: o fluxo da proposta `add-google-login` (JWT decodificado no cliente, `sub` como chave). Ele não prova a identidade para nenhum servidor e não serve para proteger dados na nuvem.

### 2. Cliente `@supabase/supabase-js` v2 por CDN, versão fixa e SRI

Script UMD do jsDelivr com versão exata (por exemplo `@supabase/supabase-js@2.x.y/dist/umd/supabase.js`), `integrity` (SRI) e `crossorigin="anonymous"`. A versão e o hash são definidos na implementação, após conferir a versão estável atual. Como o jsDelivr serve arquivo estático por versão, o SRI é possível, ao contrário do script do Google.

Se o script não carregar (sem internet, bloqueador), `window.supabase` não existe: o app segue em modo visitante e o card "Conta" mostra "Login indisponível".

Alternativa descartada: chamar a API REST do PostgREST e do GoTrue com `fetch` manual. Evitaria a dependência, mas obrigaria a reimplementar renovação de token, PKCE e paginação.

### 3. Esquema do banco (inglês, `snake_case`, uma tabela por tipo de dado)

Todas as tabelas ficam em `public`, com `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`.

| Tabela | Chave primária | Colunas principais |
|---|---|---|
| `profiles` | `user_id` | `sex` (`f`/`m`), `age`, `height_cm`, `weight_kg`, `target_weight_kg`, `activity` (numeric), `goal` (`lose`/`keep`/`gain`), `kcal_goal`, `water_goal_ml`, `updated_at` |
| `food_entries` | `id uuid` (gerado no cliente) | `day date`, `meal` (`cafe`/`almoco`/`jantar`/`lanche`), `name`, `grams`, `qty_label`, `kcal`, `carbs`, `protein`, `fat`, `created_at` |
| `water_logs` | `(user_id, day)` | `ml` |
| `weight_logs` | `(user_id, day)` | `kg` |
| `custom_foods` | `id uuid` (gerado no cliente) | `name`, `kcal`, `carbs`, `protein`, `fat` (por 100 g), `unit_singular`, `unit_plural`, `unit_grams`, `created_at` |

Restrições `CHECK` validam o que a interface já assume: texto com 1 a 120 caracteres, `meal` e `goal` em listas fechadas, valores numéricos não negativos e com teto razoável (por exemplo `kcal <= 20000`, `grams > 0 and grams <= 100000`, `ml between 0 and 20000`). Índice em `food_entries (user_id, day)`.

O `id` é gerado no cliente (`crypto.randomUUID()`), o que torna as gravações **idempotentes** (`upsert`) e permite reenviar a fila offline sem duplicar linhas.

Alternativa descartada: uma única tabela `user_data` com o JSON inteiro de `S`. Seria a migração mais simples, mas cada alteração reescreve tudo, dois dispositivos se sobrescrevem por inteiro, e não dá para consultar nem validar nada no banco.

### 4. RLS obrigatória em todas as tabelas

Para cada tabela: `alter table ... enable row level security`, políticas separadas para `select`, `insert`, `update` e `delete` com `to authenticated`, `using ((select auth.uid()) = user_id)` e `with check ((select auth.uid()) = user_id)`. O `(select auth.uid())` evita reavaliar a função por linha. `revoke all on ... from anon` garante que o papel anônimo não acessa nada. A chave `service_role` nunca aparece no HTML nem no repositório.

As migrações ficam em `supabase/migrations/` e são aplicadas pela CLI ou pelo MCP. Depois de aplicar, roda-se `get_advisors` (security e performance) e o resultado deve vir sem alertas de RLS.

### 5. Estado em memória continua sendo `S`; a persistência vira uma camada separada

Os handlers continuam alterando `S` e chamando `render()`, para não reescrever a interface. No lugar de `save()` genérico, cada alteração chama uma operação nomeada:

- `entry.add`, `entry.del` (alimento no diário; as entradas ganham um campo `id`)
- `water.set`, `weight.set`, `profile.set`, `food.add`, `data.reset`

`persist(op)` age conforme o contexto:

- **Visitante**: grava `S` inteiro em `pratocheio`, como hoje (`save()` atual).
- **Conta**: grava `S` no cache `pratocheio:<user_id>` e coloca a operação na fila `pratocheio:fila:<user_id>`. Em seguida chama `flush()`.

`flush()` envia as operações em ordem, uma por vez, com `upsert`/`delete` por id ou por `(day)`. Em erro de rede, para e mantém a fila. Em erro definitivo (4xx que não seja de autenticação), descarta aquela operação, registra no console e mostra um aviso, para que uma linha inválida não trave a fila para sempre. `flush()` roda após cada operação, no evento `online` e ao iniciar.

Alternativa descartada: gravar direto no Supabase sem fila. Funciona online, mas perde registros em silêncio quando a conexão cai, o que é comum no celular.

### 6. Carregamento e atualização

Ao entrar (ou ao abrir o app com sessão), o app faz `flush()` da fila e depois lê as cinco tabelas, com paginação por `range()` em blocos de 1000 linhas, porque o PostgREST limita as respostas. O resultado é convertido para o formato de `S` e substitui `S` e o cache da conta. O mesmo recarregamento ocorre no evento `visibilitychange` (quando o app volta a ficar visível), com intervalo mínimo de 30 segundos, para pegar o que foi feito em outro dispositivo.

Conflitos: "última gravação vence" por linha. Registros de alimento são independentes (um por `id`), então só há conflito real em perfil, água e peso do mesmo dia.

### 7. Sessão, primeira renderização e modo visitante

Para evitar mostrar os dados do visitante por engano e depois trocá-los pelos da conta, o app guarda `pratocheio:ultimo` com `{uid, nome, email, foto}` do último login.

1. Na abertura, se `pratocheio:ultimo` existir, o app renderiza a partir do cache `pratocheio:<uid>` (a conta é exibida como "verificando").
2. Quando a biblioteca dispara `INITIAL_SESSION`, o app confirma a sessão e atualiza do banco. Se a sessão não existir, descarta `pratocheio:ultimo` e volta ao modo visitante.
3. Sem `pratocheio:ultimo`, o app abre direto em modo visitante.

O handler de `onAuthStateChange` não faz chamadas ao Supabase diretamente; ele agenda o trabalho com `setTimeout(..., 0)`, como a documentação do Supabase recomenda para evitar travamentos do cliente.

O cache só serve para exibição inicial e uso offline. Nenhuma gravação chega ao banco sem uma sessão válida, e a RLS rejeita qualquer tentativa sem JWT correspondente.

"Sair" chama `auth.signOut()`, remove `pratocheio:ultimo`, mantém o cache e a fila da conta no navegador (para não perder alterações pendentes) e volta ao modo visitante com `S=load()`.

### 8. Importação dos dados do visitante

Depois do primeiro carregamento do banco, se a conta não tem **nenhuma** linha (nem perfil) e `pratocheio` contém dados, o app mostra `confirm("Enviar os dados deste navegador para a sua conta?")`. Se confirmado, converte `S` do visitante em operações (gerando `id` para as entradas antigas) e as envia pela mesma fila. Os dados do visitante **não são apagados**. A pergunta não se repete, pois a conta passa a ter dados. O `confirm()` segue o padrão já usado em "Apagar todos os dados".

Se a conta já tem dados, nada é importado e nada é perguntado.

### 9. "Apagar todos os dados" por contexto

- **Visitante**: reinicia somente `pratocheio`.
- **Conta**: `delete` das linhas das cinco tabelas do usuário (a RLS limita ao dono), limpa o cache e a fila da conta e recria o estado padrão. A conta de login **não** é excluída. A mensagem de confirmação informa qual contexto será apagado.

Se o apagamento remoto falhar (sem rede), a operação `data.reset` entra na fila e o cache local é limpo na hora, para a interface não mostrar dados que o usuário mandou apagar.

### 10. Dados do Google na interface

Nome e e-mail vêm de `session.user.user_metadata` e passam por `esc()` antes de entrar no HTML. A foto só é usada se for `https:` com host terminando em `googleusercontent.com`. Caso contrário, aparecem as iniciais do nome. O card "Conta" fica no topo do Perfil, com o botão "Entrar com Google" (logo oficial do Google, texto em pt-BR), nome, e-mail, estado da sincronização ("Sincronizado", "N alterações pendentes", "Sem conexão") e o botão "Sair".

### 11. Configuração pública e versão

Constantes no topo do script: `SUPABASE_URL`, `SUPABASE_KEY` (chave publicável) e `VERSAO="1.1.0"`. Como não havia versão, o estado atual é tratado como 1.0.0 e esta mudança é uma funcionalidade nova (minor). A versão aparece no rodapé do Perfil. O `README.md` documenta execução em `http://localhost`, criação do projeto Supabase, aplicação das migrações, configuração do provedor Google, Redirect URLs, escopo de segurança e histórico de versões. Se `SUPABASE_URL` ou `SUPABASE_KEY` estiverem vazios, o login fica indisponível e o app segue em modo visitante.

## Risks / Trade-offs

- **Google OAuth não funciona em `file://`** → Documentar a execução por `http://localhost` (por exemplo `python -m http.server`) ou hospedagem, e cadastrar as URLs em *Authentication → URL Configuration* no Supabase. Em `file://`, o card mostra "Login indisponível".
- **Chave publicável exposta no HTML** → Esperado: ela é pública por projeto. A proteção é a RLS. A verificação de `get_advisors` e um teste com dois usuários (um não lê nem altera os dados do outro) fazem parte das tarefas.
- **Dados de saúde na nuvem (LGPD)** → O README informa que os dados ficam no Supabase, vinculados à conta Google. Política de privacidade formal e exclusão de conta ficam fora de escopo e são recomendadas como próxima mudança.
- **Fila offline em `localStorage`** → Se o navegador limpar os dados antes do reenvio, as alterações pendentes se perdem. É um risco menor que gravar sem fila. O estado "N alterações pendentes" deixa isso visível.
- **Conflito entre dispositivos** → "Última gravação vence" em perfil, água e peso do mesmo dia. Aceito porque o uso típico é de uma pessoa, um dispositivo por vez.
- **Sessão expirada offline** → Com `pratocheio:ultimo`, o app abre com o cache da conta e só descarta a conta se o Supabase confirmar que não há sessão. Gravações pendentes esperam a sessão voltar.
- **Projeto Supabase gratuito pode ser pausado por inatividade** → Documentado no README. A primeira abertura após a pausa mostra o erro de rede, e o app continua com o cache.
- **Sem limite de linhas por usuário** → A RLS impede acesso cruzado, mas um usuário autenticado pode gravar muitas linhas. Aceito nesta fase, com os `CHECK` limitando o tamanho de cada linha. Cotas ficam como melhoria futura.
- **Arquivo único cresce** → O HTML passa de cerca de 213 para algumas centenas de linhas. Mantém-se o padrão do projeto (sem build), e a camada de persistência fica agrupada em um bloco único e comentado.

## Migration Plan

1. Criar um projeto Supabase novo para o EmagrecAI (não reutilizar o projeto `listae`).
2. Aplicar a migração SQL (tabelas, restrições, índices, RLS) e rodar `get_advisors`.
3. Criar o OAuth Client no Google Cloud e ativar o provedor Google no Supabase (callback `https://<ref>.supabase.co/auth/v1/callback`). Cadastrar as Redirect URLs do app (localhost e domínio hospedado).
4. Preencher `SUPABASE_URL` e `SUPABASE_KEY` no HTML e publicar a nova versão. Quem não faz login não percebe diferença.
5. Quem fizer login pode enviar os dados atuais do navegador para a conta.
6. **Rollback**: voltar ao HTML anterior. Ele só lê `pratocheio`, que o login nunca altera, então nada se perde. As chaves `pratocheio:*` ficam ignoradas e os dados no Supabase permanecem intactos.

## Open Questions

- **Nome, organização e região do projeto Supabase** para o EmagrecAI. O único projeto existente (`listae`, inativo) é de outro app.
- **Domínio de produção** (Vercel ou outro) para cadastrar como Redirect URL. Até lá, só `http://localhost`.
- **Destino da proposta antiga**: depois desta mudança ser aplicada, `add-google-login` deve ser removida ou arquivada, pois suas specs conflitam com as novas.
