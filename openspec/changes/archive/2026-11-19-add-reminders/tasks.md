## 1. Configuração e armazenamento

- [x] 1.1 Definir as constantes dos horários padrão e a chave `pratocheio:lembretes` no script do `index.html`
- [x] 1.2 Criar a função que lê e saneia a configuração (HH:MM, dia da semana 0-6, passo 1/2/3, água ligada/desligada), com retorno ao padrão por campo e tolerância a JSON corrompido
- [x] 1.3 Criar a função que grava a configuração no `localStorage` usando `lsSet`

## 2. Card "Lembretes" no Perfil

- [x] 2.1 Adicionar o card no Perfil com campos de hora para café, almoço, lanche e jantar, e dia da semana e hora da pesagem
- [x] 2.2 Adicionar a opção de água (desligada por padrão) com início, fim e intervalo, e a mensagem de erro quando o fim não é posterior ao início
- [x] 2.3 Salvar ao alterar cada campo, voltando ao valor anterior se o campo ficar vazio, e adicionar o botão "Restaurar padrões"
- [x] 2.4 Incluir o texto de orientação sobre apagar lembretes antigos antes de reimportar e sobre o alarme depender do calendário
- [x] 2.5 Garantir que `softRender` e a renderização do Perfil não apaguem o que o usuário está digitando

## 3. Exportação para o calendário

- [x] 3.1 Criar a função que monta o texto do `.ics` (CRLF, dobra de linhas, `UID` estável, `SEQUENCE` por data, horários sem fuso, `RRULE` diário e semanal, `VALARM` no horário)
- [x] 3.2 Gerar os eventos de água entre início e fim pelo intervalo, limitando a 24 eventos
- [x] 3.3 Implementar a entrega: `navigator.share` com arquivo quando `canShare` permitir, e `Blob` com `<a download="emagrecai-lembretes.ics">` como alternativa
- [x] 3.4 Ignorar `AbortError` do compartilhamento e mostrar toast nos demais erros
- [x] 3.5 Ligar o botão "Adicionar ao calendário" ao clique delegado (`data-a`) e desabilitá-lo quando a água estiver inválida

## 4. Aviso na aba Hoje

- [x] 4.1 Criar a leitura e a gravação das dispensas em `pratocheio:avisos`, mantendo só o dia atual
- [x] 4.2 Criar a função que calcula o aviso pendente (refeições e pesagem) e escolhe o de horário mais recente
- [x] 4.3 Renderizar o aviso na aba Hoje apenas quando o dia exibido é hoje, com botões "Registrar" e "×"
- [x] 4.4 Ligar "Registrar" à folha de adicionar alimento da refeição (ou ao campo de peso) e "×" à gravação da dispensa
- [x] 4.5 Estilizar o aviso seguindo as variáveis de cor e o padrão visual existentes, com boa leitura em tela pequena

## 5. Versão, segurança e documentação

- [x] 5.1 Atualizar `VERSAO` para 1.6.0 no `index.html` e no `sw.js`, com valores iguais
- [x] 5.2 Recalcular o hash SHA-256 do script inline e atualizar o `script-src` da meta tag de CSP
- [x] 5.3 Atualizar o `README.md`: versão atual, "Novo na 1.6.0", nota de privacidade sobre os horários ficarem só no aparelho e histórico de versões
- [x] 5.4 Revisar a ortografia em português do Brasil de todos os textos novos da interface

## 6. Verificação

- [x] 6.1 Abrir o app em `http://localhost:8000` e confirmar que o console não mostra erros e que o cache `emagrecai-1.6.0` foi criado
- [x] 6.2 Conferir no navegador os cenários do aviso: pendente, registrada, horário futuro, várias pendências, pesagem, dia anterior e dispensa
- [x] 6.3 Conferir o `.ics` gerado: cinco eventos com os padrões, horários editados refletidos, `UID` iguais entre gerações e eventos de água só quando ligada
- [x] 6.4 Conferir o comportamento com valores inválidos no `localStorage` e em modo visitante
- [x] 6.5 Gerar o resumo das alterações para a descrição do commit, em português do Brasil
