## 1. Estrutura e estilos

- [x] 1.1 Criar a função auxiliar `foldAbrir(id, titulo, resumo, extra)` e a variável `perfilAb` (ajustado: só os cards recolhíveis usam o auxiliar) em `index.html`
- [x] 1.2 Adicionar CSS `.fold`, `.fold>summary`, `.fold .res` e a classe de espaçamento das notas (variáveis de tema, alvo de toque de 44px)
- [x] 1.3 Ligar o evento `toggle` dos `<details>` do Perfil a `perfilAbertos`

## 2. Reorganização dos cards

- [x] 2.1 Conta, Metas e perfil e Dados continuam como cards fixos abertos, sem mudar campos nem ações
- [x] 2.2 Migrar Lembretes, Assistente de IA e Sobre o app para cards recolhíveis (fechados por padrão) com resumo no cabeçalho
- [x] 2.3 Tema e Instalar app mantidos como cards fixos; ordem final conferida a ordem final em `profile()`
- [x] 2.4 Fazer `iaDesenhar` e `softRender` respeitarem `perfilAbertos`
- [x] 2.5 Trocar estilos inline repetidos dos cards do Perfil por classes

## 3. Publicação da versão

- [x] 3.1 Atualizar `VERSAO` em `index.html` e `sw.js` com o mesmo valor
- [x] 3.2 Recalcular o hash SHA-256 do script inline e atualizar o `script-src` da CSP (comando na seção "Segurança e privacidade" do `README.md`)
- [x] 3.3 Atualizar o `README.md`: versão atual, "Novo na x.y.z" e histórico
- [x] 3.4 Revisar a ortografia pt-BR dos textos novos

## 4. Verificação

- [x] 4.1 Abrir `http://localhost:8000`: console sem erros e cache `emagrecai-<versão>` criado
- [x] 4.2 Testar abrir/fechar cada card com toque e teclado, nos temas claro e escuro, em tela estreita
- [x] 4.3 Ativar a IA e mudar os lembretes e confirmar que o card não fecha; salvar perfil e exportar CSV continuam funcionando
- [x] 4.4 Gerar o resumo das alterações para o commit em pt-BR
