## Context

O EmagrecAI é um PWA estático (um `index.html` com script inline, `sw.js` e Supabase como backend opcional). Não existe nenhum código de notificação. O script inline é liberado na CSP por hash SHA-256, e as preferências locais já usam `localStorage` com o prefixo `pratocheio:` (funções `lsGet`, `lsSet`, `lsDel`). As refeições são `cafe`, `almoco`, `jantar` e `lanche` (constante `MEALS`), e `S.log[dia][refeição]` guarda as entradas do dia. O peso do dia fica em `S.weights[dia]`.

Um lembrete com o app fechado exigiria push com servidor (Supabase Edge Function, `pg_cron`, chaves VAPID). Foi descartado: custo e manutenção altos, e no iOS só funciona com o PWA instalado.

## Goals / Non-Goals

**Goals:**
- Lembretes de refeição, pesagem semanal e água (opcional) no calendário do sistema, em Android, iOS e PC.
- Aviso dentro do app para refeição e pesagem pendentes, dispensável por refeição e por dia.
- Horários editáveis, guardados só no aparelho, funcionando também no modo visitante.

**Non-Goals:**
- Push com servidor ou qualquer chamada de rede nova.
- Aviso de água dentro do app.
- Sincronizar horários entre aparelhos ou gravar no Supabase.
- Garantir o alarme em todos os aplicativos de calendário.

## Decisions

**1. Armazenamento em `localStorage`, chave `pratocheio:lembretes`, sem escopo por usuário.**
Os horários são preferência do aparelho, não dado do diário. Formato: `{ cafe, almoco, lanche, jantar: "HH:MM", pesagem: { dia: 0-6, hora: "HH:MM" }, agua: { ativo, ini, fim, passo } }`. Toda leitura passa por uma função de saneamento que valida `HH:MM` (`/^([01]\d|2[0-3]):[0-5]\d$/`), o dia da semana (inteiro de 0 a 6) e o passo (1, 2 ou 3), e cai no padrão de cada campo inválido. Isso protege também a geração do `.ics`, porque o valor vira texto de arquivo.
*Alternativa:* coluna em `profiles`. Sincroniza entre aparelhos, mas exige migração e não atende o visitante. Descartada.

**2. Dispensas em `localStorage`, chave `pratocheio:avisos`, formato `{ "AAAA-MM-DD": ["almoco", "pesagem"] }`.**
Ao ler, mantêm-se só os dias de hoje em diante (na prática, só hoje), o que evita crescimento da chave. Chaves de dia usam a função `key` existente, no horário local.

**3. Regra do aviso calculada ao renderizar a aba Hoje, só para o dia de hoje.**
Para cada refeição com horário já passado, sem entradas em `S.log[hoje][refeição]` e não dispensada, é candidata. Escolhe-se a de horário mais recente. A pesagem é candidata se hoje é o dia configurado, o horário já passou, não há `S.weights[hoje]` e não foi dispensada. Se houver refeição e pesagem candidatas, vence a de horário mais recente. O aviso não aparece ao navegar para outros dias. O botão do aviso abre a folha de adicionar alimento da refeição (ou o campo de peso) e o "×" grava a dispensa.
*Alternativa:* um aviso por refeição pendente. Enche a tela. Descartada.

**4. O `.ics` é gerado no aparelho, em um arquivo único.**
Como os horários são editáveis, um arquivo estático não serve. Cada lembrete é um `VEVENT` recorrente: refeições com `RRULE:FREQ=DAILY`, pesagem com `FREQ=WEEKLY;BYDAY=<dia>`, água com `FREQ=DAILY` e um evento por horário calculado entre início e fim (limite de 24 eventos). Os horários são "flutuantes" (`DTSTART:AAAAMMDDTHHMM00` sem `Z` e sem `TZID`), para que 12:00 seja 12:00 onde a pessoa estiver. Cada evento tem `UID` estável (`emagrecai-<id>@emagrecai`), `SEQUENCE` baseado na data de geração e um `VALARM` com `TRIGGER:PT0S` e `ACTION:DISPLAY`. Os textos são fixos no código, sem entrada do usuário, e as quebras de linha seguem `CRLF` com dobra de linhas longas.

**5. Entrega do arquivo: compartilhar quando possível, baixar como alternativa.**
Se `navigator.canShare({ files })` aceitar o arquivo, usa-se `navigator.share({ files })`, que costuma funcionar em PWAs instalados no iOS e no Android. Caso contrário, cria-se um `Blob` (`text/calendar`) e um `<a download="emagrecai-lembretes.ics">` temporário. Se o usuário cancelar o compartilhamento (`AbortError`), nada é mostrado. Outros erros mostram um toast.
*Alternativa:* só `Blob`. No iOS em modo standalone, o download por `blob:` é pouco confiável. Não foi testado em aparelho e fica registrado como risco.

**6. Sem mudança em `sw.js` além da versão, e sem mudança na CSP além do hash.**
O arquivo é gerado localmente. `Blob` e `<a download>` não dependem de `connect-src`. O botão usa o mecanismo existente de `data-a` no clique delegado.

**7. Interface no Perfil, seguindo o padrão atual.**
Um card "Lembretes" com `<input type="time">` por refeição, um `<select>` de dia da semana e outro de passo para a água. Os campos salvam ao alterar (evento `change`), com validação e retorno ao valor anterior se o navegador entregar vazio. Há um botão "Restaurar padrões". O texto do card avisa: ao mudar um horário, apague os lembretes antigos do calendário antes de importar de novo.

## Risks / Trade-offs

- **Alarme ignorado em alguns calendários** (possivelmente o Google Calendar ao importar `.ics`, não verificado) → o texto do card explica que o aviso depende das notificações do aplicativo de calendário, e os eventos ficam visíveis na agenda de qualquer forma.
- **Reimportar depois de editar duplica eventos em alguns clientes** → `UID` estável com `SEQUENCE` crescente atualiza em Apple e Outlook, e o card orienta a apagar os antigos.
- **Download ou compartilhamento falha no PWA do iOS** → compartilhamento primeiro, download depois, toast em caso de erro. Sem teste em aparelho nesta mudança.
- **Muitos eventos de água** → desligada por padrão, limite de 24 eventos, aviso no texto da opção.
- **Valores corrompidos no `localStorage`** → saneamento campo a campo na leitura, com padrão como retorno.
- **Aviso depende do relógio do aparelho** → aceitável, é a mesma base de `key(new Date())` usada no resto do app.
- **Banner só aparece com o app aberto** → é o limite esperado do aviso interno. O `.ics` cobre o app fechado.
