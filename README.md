# EmagrecAI – Diário nutricional

Diário alimentar simples para acompanhar calorias, macronutrientes, água e peso. Funciona em um único arquivo HTML, sem build. Com login Google, os dados ficam em um banco Supabase e sincronizam entre dispositivos.

**Versão atual:** 1.12.0

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
- **Novo na 1.12.0:** campo de anotações na aba Progresso. É um único texto fixo (até 2000 caracteres), igual em qualquer dia, para observações gerais sobre o acompanhamento. Salva pelo botão "Salvar anotações"; salvar vazio apaga o texto. Com conta, sincroniza pela tabela `user_notes` (aplique a migração `20261126120000_create_user_notes.sql` antes de publicar); no modo visitante fica só no aparelho. "Apagar todos os dados" também apaga as anotações.
- **Novo na 1.11.1:** a exclusão de conta pelo app, que a 1.11.0 trazia, foi retirada. Todo o restante da 1.11.0 continua igual.
- **Novo na 1.11.0:** hábito e privacidade.
  - **Favoritos e recentes:** na janela de adicionar alimento, com a busca vazia, aparecem as seções "Favoritos" e "Recentes" antes da lista padrão. A estrela (☆/★) na tela de detalhe do alimento favorita ou remove o favorito (até 50). Os favoritos ficam só no `localStorage` do aparelho (`pratocheio:favoritos`) e guardam uma cópia dos valores do alimento. Os recentes (até 15) são calculados a partir do diário, sem gravar nada.
  - **Constância e resumo da semana:** na aba Progresso, o card "Constância" mostra a sequência atual, a melhor sequência e os dias registrados nos últimos 7 dias. O card "Resumo da semana" mostra média de calorias, dias registrados, dias na meta, variação de peso e dias com a meta de água, e compara com os 7 dias anteriores. Um dia conta como registrado quando tem alimentos lançados. Tudo é calculado no aparelho, com as metas atuais do perfil.
  - **Exportar dados (CSV):** o botão "Exportar dados (CSV)" no card "Dados" do Perfil gera um único arquivo `emagrecai-AAAA-MM-DD.csv` (separador `;`, UTF-8 com BOM, para abrir no Excel) com alimentos, água e peso. Funciona no modo visitante, com conta e sem internet. Textos que começariam uma fórmula de planilha (`=`, `+`, `-`, `@`) recebem um apóstrofo na frente.
- **Novo na 1.10.0:** leitura do código de barras pela câmera em mais aparelhos. O botão "Escanear com a câmera" agora aparece também no iPhone (Safari e app instalado) e no Firefox. Onde o navegador não tem `BarcodeDetector`, o app usa a biblioteca ZXing, guardada no próprio projeto (`vendor/zxing.min.js`) e carregada só na primeira leitura. Onde há `BarcodeDetector`, nada muda. A leitura continua só de EAN-13, a câmera só liga ao tocar no botão e nenhuma imagem é guardada ou enviada.
- **Novo na 1.9.0:** ocultar os alimentos de uma refeição. No Diário, cada refeição com alimentos ganhou o botão ▾/▸ para ocultar ou mostrar a lista de itens. Com a lista oculta, o cartão mantém o total de kcal e mostra a quantidade de itens. A escolha fica salva só neste aparelho, vale para todos os dias e a lista volta a aparecer ao adicionar ou repetir alimentos naquela refeição.
- **Novo na 1.8.0:** repetir uma refeição. Cada refeição com alimentos no diário ganhou o botão "Repetir", que copia todos os itens para outra refeição do mesmo dia ou para uma refeição de outro dia ("Este dia", "Dia seguinte" ou uma data escolhida). Os itens que já existem no destino são mantidos, e a cópia é sincronizada como qualquer outro alimento adicionado.
- **Novo na 1.7.0:** catálogo ampliado e código de barras. A busca por nome passou a incluir cerca de 580 alimentos da TACO (funciona sem internet e sem login), ignorando acentos e exigindo todas as palavras digitadas (máximo de 50 resultados). A nova aba "Código" consulta um produto de mercado pelo número do código de barras, digitado ou lido pela câmera (botão "Escanear com a câmera", só em navegadores com `BarcodeDetector`, como Chrome e Edge no Android e no computador; no iPhone, digite o número). Os valores vêm do Open Food Facts por uma função do Supabase, são conferidos antes de aparecer e, se o produto não existir ou estiver incompleto, o app oferece "Cadastrar este produto". A câmera só liga ao tocar no botão e nenhuma imagem é guardada ou enviada. Veja "Catálogo TACO e código de barras" abaixo.
- **Novo na 1.6.0:** lembretes. No Perfil, o card "Lembretes" permite escolher os horários de café da manhã, almoço, lanche e jantar, o dia e o horário da pesagem semanal e, se quiser, lembretes de água (início, fim e intervalo). O botão "Adicionar ao calendário" gera um arquivo `.ics` com eventos recorrentes e alarme, que funciona com o app fechado em Android, iPhone e computador. Na aba Diário, um aviso mostra a refeição ou a pesagem pendente mais recente (só para hoje) e pode ser dispensado por refeição e por dia. Os horários e as dispensas ficam só no `localStorage` do aparelho, sem mudanças no banco. O alarme depende das notificações do aplicativo de calendário, e é preciso apagar os lembretes antigos do calendário antes de importar o arquivo de novo.
- **Novo na 1.5.0:** edição de alimentos. No Diário, o botão ✎ de cada lançamento permite corrigir a quantidade e a medida (unidade ou gramas), com calorias e macros recalculados. Na busca, o botão "Editar" dos alimentos que você cadastrou permite corrigir nome, unidade, peso da unidade e valores por 100 g. Editar um alimento cadastrado não altera lançamentos antigos. As alterações usam a fila de sincronização existente, sem mudanças no banco.
- **Novo na 1.4.0:** card "Evolução mensal" na aba Progresso. Mostra um mês por vez, com navegação entre meses, resumo de peso (primeiro, último, variação e distância da meta), calorias (média diária, dias registrados e dias acima da meta) e água (média e dias com a meta atingida), gráficos de peso e de calorias por dia e comparação com o mês anterior. Os números são calculados no aparelho a partir dos dados já salvos, sem gravar nada novo. Os dias acima da meta usam as metas atuais do perfil.
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
2. Aplique as migrações de `supabase/migrations/` em ordem (SQL Editor, `supabase db push` ou MCP). A primeira, `20261117150143_create_emagrecai_schema.sql`, cria as tabelas `profiles`, `food_entries`, `water_logs`, `weight_logs` e `custom_foods` com Row Level Security. A segunda, `20261117190332_revoke_extra_table_privileges.sql`, remove os privilégios `TRUNCATE`, `REFERENCES` e `TRIGGER` dos papéis `authenticated` e `anon`. A `20261126120000_create_user_notes.sql` cria a tabela `user_notes` (anotações) com RLS.
3. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um **OAuth Client ID** do tipo "Aplicativo da Web". Em "URIs de redirecionamento autorizados", informe `https://<ref-do-projeto>.supabase.co/auth/v1/callback`.
4. No Supabase, em **Authentication > Sign In / Providers > Google**, ative o provedor e informe o Client ID e o Client Secret. O Client Secret fica somente no painel do Supabase.
5. No Supabase, em **Authentication > URL Configuration**, cadastre as **Redirect URLs** onde o app roda, por exemplo `http://localhost:8000/**` e a URL do GitHub Pages. Ajuste também a **Site URL**.
6. No `index.html`, confira as constantes `SUPABASE_URL` e `SUPABASE_KEY`. Se mudar de projeto, atualize também o endereço em `connect-src` na meta tag de Content-Security-Policy.
7. Se você usa somente o login com Google, desative em **Authentication > Sign In / Providers** os provedores **Email** e **Anonymous**. Assim ninguém cria conta diretamente pela API com a chave publicável.

## Catálogo TACO e código de barras

**Catálogo (`data/taco.json`).** Gerado a partir da Tabela Brasileira de Composição de Alimentos (TACO, 4ª edição, NEPA/UNICAMP, 2011), pelos CSVs do repositório [brolesi/taco](https://github.com/brolesi/taco) (licença MIT do código e da organização dos dados). A licença de redistribuição dos valores da TACO **não foi confirmada por escrito** com o NEPA/UNICAMP. Itens sem energia ou macronutriente na fonte são descartados (15 itens, como óleos e sal). As medidas caseiras da POF/IBGE só entram quando o nome é idêntico ao da TACO. Na prática nenhum item corresponde, então os itens do catálogo usam gramas. Para regenerar:
1. Baixe `data/processed/taco/taco_composicao.csv` e `data/processed/pof/pof_medidas_caseiras.csv` do repositório acima para `scripts/fonte/`.
2. Na raiz do projeto, rode `python scripts/gerar_taco.py`.
3. Confira a contagem de itens impressa e publique uma nova versão do app (o `data/taco.json` está na lista `ARQUIVOS` do `sw.js`).

**Consulta por código de barras.** A aba "Código" chama a função `consultar-codigo` (`supabase/functions/consultar-codigo/`), que consulta o [Open Food Facts](https://world.openfoodfacts.org) (dados sob licença ODbL, atribuição obrigatória) e guarda os produtos válidos por 30 dias na tabela `produtos_cache`. Para publicar:
1. Aplique a migração `20261119160000_create_produtos_cache.sql`. A tabela tem RLS ativada, sem políticas e sem acesso para `anon` e `authenticated`: só a função, com a chave de serviço, lê e grava.
2. Defina as variáveis de ambiente da função (no painel do Supabase ou com `supabase secrets set`, nunca no repositório): `OFF_USER_AGENT` (formato `EmagrecAI/1.7 (seu-email)`, exigido pelo Open Food Facts) e `ORIGENS_PERMITIDAS` (origens do app separadas por vírgula, por exemplo `https://<usuario>.github.io,http://localhost:8000`).
3. Publique a função com `supabase functions deploy consultar-codigo`. O `supabase/config.toml` define `verify_jwt = false`, porque o visitante não tem login e a chave publicável não é um JWT. O app envia a chave no cabeçalho `apikey`.
- **Limites:** código com 8, 12, 13 ou 14 dígitos e dígito verificador válido; 30 pedidos por minuto por endereço de rede; 20 consultas por minuto ao Open Food Facts; consulta externa com limite de 5 s; produtos não encontrados ficam 1 hora só na memória da função. Os contadores são por instância da função.
- **Erros do contrato:** `codigo_invalido`, `origem_nao_permitida`, `nao_encontrado`, `dados_incompletos`, `limite_excedido` e `servico_indisponivel`.
- **Atribuição:** o card "Sobre o app" do Perfil cita a TACO e o Open Food Facts.
- A leitura pela câmera precisa de HTTPS ou `http://localhost`. O vídeo não é gravado: só o número lido sai do aparelho.

## Segurança e privacidade

- A `SUPABASE_KEY` é a chave **publicável**. Ela é pública por natureza e pode ficar no HTML. A proteção dos dados vem da Row Level Security: cada usuário lê e altera somente as próprias linhas, e o acesso anônimo é bloqueado.
- A chave `service_role` e o Client Secret do Google **nunca** devem entrar no código nem no repositório.
- Peso, altura e hábitos alimentares são dados pessoais sensíveis. Na conta, eles ficam armazenados no Supabase. É possível exportar os dados em CSV pelo Perfil. Não há exclusão de conta pelo app nesta versão.
- Ao sair da conta, o app tenta enviar as alterações pendentes e apaga do navegador os dados da conta (cache, fila e recusa de importação). Se ainda houver pendências, ele pede confirmação antes de sair. Os dados do modo visitante não são apagados.
- O `index.html` define uma **Content-Security-Policy** por meta tag: só o script inline do app (liberado por hash SHA-256), scripts do mesmo endereço do app (`'self'`, usado pela biblioteca ZXing em `vendor/`), o `supabase-js` do jsDelivr, as fontes do Google, o endereço do Supabase e as fotos do Google são permitidos. O manifesto e o service worker são permitidos apenas do mesmo endereço do app (`manifest-src 'self'` e `worker-src 'self'`). O `supabase-js` é inserido por script (não por atributos `onload`/`onerror`), porque a CSP bloqueia código inline em atributos. Limitação: o GitHub Pages não permite cabeçalhos HTTP, então `frame-ancestors` (proteção contra clickjacking) não pode ser aplicado.
- **Ao editar o script inline do `index.html`, atualize o hash da CSP**, ou o app deixa de funcionar. Para calcular o novo hash, no PowerShell, na pasta do projeto: `$t=[IO.File]::ReadAllText("index.html"); $m=[regex]::Match($t,'<script>(.*?)</script>','Singleline'); "sha256-"+[Convert]::ToBase64String([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($m.Groups[1].Value)))`. Depois substitua o valor `sha256-...` em `script-src` na meta tag.
- Os horários dos lembretes (`pratocheio:lembretes`) e as dispensas do aviso (`pratocheio:avisos`) ficam só no `localStorage` do aparelho. Não são enviados ao Supabase e não são apagados ao sair da conta. O arquivo `.ics` é gerado no próprio aparelho, sem nenhuma requisição de rede.
- Sem backend próprio: o navegador conversa direto com o Supabase.
- Os favoritos (`pratocheio:favoritos`) também ficam só no `localStorage` do aparelho, não são enviados ao Supabase e não são apagados ao sair da conta. Não entram no CSV exportado.
- Projetos gratuitos do Supabase podem ser pausados por inatividade. Nesse caso o app continua com o cache local e sincroniza quando o projeto voltar.

## Estrutura do projeto

| Caminho | Descrição |
| --- | --- |
| `index.html` | Aplicação completa (HTML, CSS e JavaScript). |
| `manifest.webmanifest` | Manifesto do PWA (nome, cores, ícones e modo de exibição). |
| `sw.js` | Service worker: cache para uso sem internet e aviso de atualização. |
| `vendor/` | Biblioteca ZXing (`zxing.min.js`, versão 0.21.3, licença MIT) usada na leitura do código de barras. Veja `vendor/LEIAME.md`. |
| `icons/` | Ícones do app (192, 512, 512 mascarável e `apple-touch-icon` de 180) e a imagem de origem `icon-source.png`. |
| `supabase/migrations/` | Migrações SQL do banco (tabelas, restrições e RLS). |
| `supabase/functions/` | Função `consultar-codigo` (consulta ao Open Food Facts com cache). |
| `supabase/config.toml` | Configuração da função (`verify_jwt = false`). |
| `data/taco.json` | Catálogo de alimentos da TACO, gerado por `scripts/gerar_taco.py`. |
| `scripts/` | Script de geração do catálogo e CSVs de origem (`scripts/fonte/`). Não fazem parte do app. |
| `openspec/` | Especificações e propostas de mudança (OpenSpec). |
| `.kiro/` | Prompts e skills do Kiro usados no fluxo OpenSpec. |

## Créditos
- Ícone do app: "IMC" (`icons8-imc-512`), de [Icons8](https://icons8.com). Confira a licença e a exigência de atribuição do Icons8 para o seu tipo de uso.
## Aviso

As informações nutricionais são aproximadas e não substituem orientação profissional. Para metas clínicas, consulte um nutricionista.

## Histórico de versões
- **1.12.0**: campo fixo de anotações na aba Progresso, com sincronização pela nova tabela `user_notes` (migração `20261126120000_create_user_notes.sql`). O hash da CSP foi atualizado.
- **1.11.1**: retirada a exclusão de conta que a 1.11.0 trazia (botão "Excluir conta" e função `excluir-conta`), por decisão do autor. O hash da CSP foi atualizado.
- **1.11.0**: favoritos e recentes na busca de alimentos, cards "Constância" e "Resumo da semana" na aba Progresso, exportação dos dados em CSV e, só nesta versão, exclusão da conta pelo app. O hash da CSP foi atualizado.
- **1.10.0**: leitura do código de barras pela câmera também em navegadores sem `BarcodeDetector` (iPhone, Firefox), com a biblioteca ZXing local em `vendor/zxing.min.js`. A CSP ganhou `'self'` em `script-src`, o hash foi atualizado e o arquivo entrou no cache do service worker.
- **1.9.0**: botão para ocultar e mostrar a lista de alimentos de cada refeição no Diário, com a preferência salva no aparelho (`localStorage`). O hash da CSP foi atualizado por causa do script inline.
- **1.8.0**: botão "Repetir" nas refeições do diário, para copiar os alimentos para outra refeição do mesmo dia ou de outro dia. O hash da CSP foi atualizado.
- **1.7.0**: catálogo TACO na busca por nome (cerca de 580 alimentos, offline), aba "Código" com consulta por código de barras (Open Food Facts via função do Supabase) e leitura pela câmera onde houver suporte. A CSP ganhou `'self'` em `connect-src` e o hash foi atualizado.
- **1.6.0**: lembretes de refeição, pesagem semanal e água (opcional) com horários editáveis, exportação para o calendário em arquivo `.ics` e aviso de pendência na aba Diário, com dispensa por refeição e por dia. O hash da CSP foi atualizado por causa da mudança no script inline.
- **1.5.0**: edição de alimentos: quantidade de um lançamento do diário e alimentos cadastrados pelo usuário. O hash da CSP foi atualizado por causa da mudança no script inline.
- **1.4.0**: card "Evolução mensal" na aba Progresso, com resumo de peso, calorias e água por mês, gráficos do mês e comparação com o mês anterior. O hash da CSP foi atualizado por causa da mudança no script inline.
- **1.3.0**: layout otimizado para celular e instalação como PWA (manifesto, ícones, service worker, uso sem internet, card "Instalar app" e aviso de nova versão). A CSP ganhou `manifest-src 'self'` e `worker-src 'self'`.

- **1.2.1**: segurança. Limpeza dos dados da conta no navegador ao sair, Content-Security-Policy e revogação de privilégios `TRUNCATE`, `REFERENCES` e `TRIGGER` no banco.
- **1.2.0**: card "Sobre o app" no Perfil, com link do GitHub e chave Pix copiável para colaboração com o desenvolvimento.
- **1.1.0**: banco de dados Supabase, login opcional com Google, sincronização entre dispositivos, fila de gravações offline e importação opcional dos dados do visitante. Versão exibida no rodapé do Perfil.
- **1.0.0**: versão inicial publicada no GitHub.
