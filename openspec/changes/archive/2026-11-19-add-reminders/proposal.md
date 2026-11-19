## Why

Quem usa o diário esquece de registrar refeições e de se pesar. O app não tem nenhum tipo de lembrete hoje. Um aviso com o app fechado exigiria push com servidor, o que é complexo demais para o ganho. Dois mecanismos simples cobrem o caso: lembretes no calendário do sistema (funcionam com o app fechado, em Android, iOS e PC) e um aviso dentro do app quando uma refeição ou a pesagem está pendente.

## What Changes

- Novo card "Lembretes" no Perfil, com horários editáveis para café da manhã, almoço, lanche, jantar e pesagem semanal (dia da semana e horário). Os horários padrão são 07:30, 12:00, 16:00, 19:30 e segunda-feira às 07:00.
- Lembrete de água opcional, desligado por padrão, com início, fim e intervalo (1h, 2h ou 3h).
- Botão "Adicionar ao calendário", que gera no aparelho um arquivo `.ics` com eventos recorrentes e alarme, e o entrega ao sistema (compartilhamento do arquivo quando disponível, download como alternativa).
- Aviso na aba Hoje quando uma refeição já passou do horário e não tem registro no dia, ou quando é o dia da pesagem e não há peso registrado. Mostra só o aviso mais recente. O usuário pode dispensá-lo, por refeição e por dia.
- Horários e dispensas ficam em `localStorage`. Nada é enviado ao Supabase, e o modo visitante funciona igual.
- Versão do app passa de 1.5.0 para 1.6.0.

Fora do escopo: push com servidor, aviso de água dentro do app, sincronização dos horários entre aparelhos.

## Capabilities

### New Capabilities
- `meal-reminders`: configuração dos horários de lembrete, geração do arquivo `.ics` para o calendário e aviso de pendência na aba Hoje, com dispensa por refeição e por dia.

### Modified Capabilities
<!-- Nenhuma. Os requisitos das specs existentes não mudam. -->

## Impact

- `index.html`: card "Lembretes" no Perfil, banner na aba Hoje, leitura e validação do `localStorage`, geração do `.ics`, constante `VERSAO` e hash SHA-256 da CSP.
- `sw.js`: constante `VERSAO`. Nenhum arquivo novo precisa entrar em `ARQUIVOS`, porque o `.ics` é gerado no aparelho.
- `README.md`: funcionalidade "Novo na 1.6.0", versão atual, histórico de versões e nota de privacidade (os horários ficam só no aparelho).
- Sem mudança no Supabase, nas migrações ou na Content-Security-Policy (além do hash do script).
- Risco conhecido: alarmes de arquivos `.ics` variam entre aplicativos de calendário, e reimportar depois de mudar um horário pode duplicar eventos. A tela deve avisar o usuário.
