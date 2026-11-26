## 1. Tema e persistência
- [x] 1.1 Criar a chave `pratocheio:tema` e funções para ler (valores `auto`, `light`, `dark`; inválido vira `auto`) e salvar com `lsGet`/`lsSet`
- [x] 1.2 Criar a função que aplica o tema: define ou remove `data-theme` no `<html>` e ajusta as duas metas `theme-color` (restaura os valores originais em Automático)
- [x] 1.3 Aplicar o tema salvo antes da primeira pintura (script no `<head>` ou início do script principal) e confirmar que não há flash

## 2. Interface (aba Perfil)
- [x] 2.1 Criar o card "Aparência" com as opções Automático, Claro e Escuro (grupo de rádio acessível, alvo de 44 px, foco visível) e incluí-lo no Perfil
- [x] 2.2 Tratar a escolha no listener existente: salvar, aplicar na hora e atualizar a opção marcada, sem renderizar o app inteiro
- [x] 2.3 Ajustar o CSS do seletor e revisar contraste das abas nos dois temas e em 320 px
- [x] 2.4 Conferir o português da interface

## 3. Versão e documentação
- [x] 3.1 Atualizar `VERSAO` para 1.13.0 em `index.html` e `sw.js` (valores iguais)
- [x] 3.2 Recalcular o hash SHA-256 do script inline (e do novo script do `<head>`, se houver) e atualizar o `script-src` da CSP (comando na seção "Segurança e privacidade" do `README.md`)
- [x] 3.3 Atualizar o `README.md`: versão atual, "Novo na 1.13.0" e histórico de versões
- [x] 3.4 Gerar o resumo das alterações para o commit, em português do Brasil

## 4. Verificação
- [x] 4.1 Abrir `http://localhost:8000`, conferir que o console não mostra erros e que o cache `emagrecai-1.13.0` foi criado
- [x] 4.2 Testar: cada opção, reabrir o app, aparelho no modo claro e escuro, mudança do aparelho em Automático, valor inválido no `localStorage` e `localStorage` bloqueado
