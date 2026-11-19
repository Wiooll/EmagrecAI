# meal-reminders Specification

## Purpose
TBD - created by archiving change add-reminders. Update Purpose after archive.
## Requirements
### Requirement: Configuração dos horários de lembrete
O app SHALL oferecer, no Perfil, um card "Lembretes" com horário editável para café da manhã, almoço, lanche e jantar, e dia da semana e horário para a pesagem semanal. Os valores padrão SHALL ser 07:30, 12:00, 16:00, 19:30 e segunda-feira às 07:00. O app SHALL guardar a configuração apenas em `localStorage`, sem enviá-la ao Supabase, tanto para usuário logado quanto para visitante.

#### Scenario: Primeira abertura
- **WHEN** o usuário abre o card "Lembretes" sem ter salvo nada antes
- **THEN** os campos mostram os horários padrão

#### Scenario: Alteração de horário
- **WHEN** o usuário altera o horário do almoço para 13:00
- **THEN** o valor é salvo no aparelho e permanece após fechar e reabrir o app

#### Scenario: Valor inválido no armazenamento
- **WHEN** o `localStorage` contém um horário fora do formato HH:MM, um dia da semana inválido ou JSON corrompido
- **THEN** o app usa o valor padrão do campo afetado e continua funcionando

#### Scenario: Restaurar padrões
- **WHEN** o usuário toca em "Restaurar padrões"
- **THEN** todos os campos voltam aos valores padrão e a configuração salva é atualizada

### Requirement: Lembrete de água opcional
O app SHALL oferecer a opção de lembrete de água, desligada por padrão, com horário de início, horário de fim e intervalo de 1, 2 ou 3 horas. O app SHALL impedir a geração do arquivo de calendário quando a água estiver ligada e o fim não for posterior ao início.

#### Scenario: Água desligada por padrão
- **WHEN** o usuário abre o card "Lembretes" pela primeira vez
- **THEN** a opção de água aparece desligada e o arquivo de calendário não contém eventos de água

#### Scenario: Intervalo inválido
- **WHEN** a água está ligada e o horário de fim é igual ou anterior ao de início
- **THEN** o botão "Adicionar ao calendário" fica indisponível e o card mostra uma mensagem explicando o motivo

### Requirement: Exportação para o calendário
O app SHALL gerar no aparelho um arquivo `.ics` com um evento recorrente para cada lembrete ativo, sem fazer nenhuma requisição de rede. As refeições SHALL repetir diariamente, a pesagem SHALL repetir semanalmente no dia escolhido, e a água SHALL gerar um evento diário por horário calculado, no máximo 24. Os horários SHALL ser sem fuso (horário local de quem importa). Cada evento SHALL ter identificador estável entre gerações e um alarme no horário do evento.

#### Scenario: Geração com os padrões
- **WHEN** o usuário toca em "Adicionar ao calendário" com os horários padrão e a água desligada
- **THEN** o arquivo contém cinco eventos recorrentes: quatro diários e um semanal

#### Scenario: Horários editados refletidos no arquivo
- **WHEN** o usuário altera o horário do jantar para 20:00 e gera o arquivo
- **THEN** o evento do jantar no arquivo começa às 20:00 e mantém o mesmo identificador de antes

#### Scenario: Compartilhamento disponível
- **WHEN** o navegador permite compartilhar arquivos
- **THEN** o app abre o menu de compartilhamento do sistema com o arquivo `.ics`

#### Scenario: Compartilhamento indisponível
- **WHEN** o navegador não permite compartilhar arquivos
- **THEN** o app baixa o arquivo `emagrecai-lembretes.ics`

#### Scenario: Usuário cancela o compartilhamento
- **WHEN** o usuário fecha o menu de compartilhamento sem escolher um destino
- **THEN** o app não mostra mensagem de erro

#### Scenario: Orientação sobre reimportação
- **WHEN** o card "Lembretes" é exibido
- **THEN** o texto informa que, ao mudar um horário, é preciso apagar os lembretes antigos do calendário antes de importar de novo, e que o alarme depende das notificações do aplicativo de calendário

### Requirement: Aviso de pendência na aba Hoje
O app SHALL mostrar, na aba Hoje e somente quando o dia exibido for o dia atual, um aviso quando uma refeição estiver pendente ou a pesagem semanal estiver pendente. Uma refeição está pendente quando o horário configurado já passou e não há nenhuma entrada dela no dia. A pesagem está pendente quando hoje é o dia configurado, o horário já passou e não há peso registrado hoje. O app SHALL mostrar no máximo um aviso por vez, o do horário mais recente entre os pendentes. O aviso SHALL funcionar sem login e sem conexão.

#### Scenario: Refeição pendente
- **WHEN** são 12:30, o almoço está configurado para 12:00 e não há entradas de almoço hoje
- **THEN** a aba Hoje mostra o aviso "Você ainda não registrou o almoço"

#### Scenario: Refeição já registrada
- **WHEN** o horário do almoço passou e já existe ao menos uma entrada de almoço hoje
- **THEN** nenhum aviso de almoço é mostrado

#### Scenario: Horário ainda não chegou
- **WHEN** são 11:00 e o almoço está configurado para 12:00
- **THEN** nenhum aviso de almoço é mostrado

#### Scenario: Várias pendências
- **WHEN** são 20:00, e café, almoço e jantar estão pendentes
- **THEN** a aba Hoje mostra apenas o aviso do jantar

#### Scenario: Pesagem pendente
- **WHEN** hoje é o dia de pesagem configurado, o horário já passou e não há peso registrado hoje
- **THEN** a aba Hoje mostra um aviso de pesagem

#### Scenario: Dia diferente do atual
- **WHEN** o usuário navega para um dia anterior na aba Hoje
- **THEN** nenhum aviso é mostrado

### Requirement: Dispensar aviso
O app SHALL permitir dispensar o aviso. A dispensa SHALL valer apenas para aquela refeição (ou para a pesagem) no dia atual, SHALL ser guardada em `localStorage` e SHALL ser removida automaticamente nos dias seguintes. Ao dispensar, o app SHALL mostrar o próximo aviso pendente, se houver.

#### Scenario: Dispensar o aviso do almoço
- **WHEN** o usuário toca em "×" no aviso do almoço
- **THEN** o aviso some e não reaparece hoje, nem depois de reabrir o app

#### Scenario: Dispensa não vale para outra refeição
- **WHEN** o usuário dispensou o aviso do almoço e o jantar ficou pendente
- **THEN** o aviso do jantar é mostrado

#### Scenario: Dia seguinte
- **WHEN** o usuário dispensou o aviso do almoço ontem e o almoço volta a ficar pendente hoje
- **THEN** o aviso do almoço é mostrado

#### Scenario: Registrar a partir do aviso
- **WHEN** o usuário toca em "Registrar" no aviso de uma refeição
- **THEN** o app abre a folha de adicionar alimento daquela refeição

### Requirement: Versão e documentação
O app SHALL exibir a versão 1.6.0 no rodapé do Perfil, com a mesma constante `VERSAO` no `index.html` e no `sw.js`. O README SHALL descrever a funcionalidade, informar que os horários ficam só no aparelho e registrar a versão no histórico.

#### Scenario: Versões iguais
- **WHEN** a mudança é publicada
- **THEN** a constante `VERSAO` do `index.html` é igual à do `sw.js` e o cache `emagrecai-1.6.0` é criado

