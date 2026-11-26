## 1. Spike com chave real (antes de codar no app)

- [ ] 1.1 Com uma chave de teste de cada provedor, chamar do navegador (`http://localhost:8000`) a listagem de modelos e uma geração com *tool call*, confirmando CORS, formato da resposta e os nomes de modelos que passam no filtro
- [ ] 1.2 Registrar no `design.md` o resultado e ajustar o filtro de modelos e o formato das ferramentas, se necessário (os testes simulados já estão em "Notas da implementação")

## 2. Estado e armazenamento

- [x] 2.1 Criar o armazenamento `pratocheio:ia` (ligado, provedor, chave, modelo, consentimento por provedor) com leitura que ignora valores inválidos
- [x] 2.2 Apagar `pratocheio:ia` ao sair da conta e em "Apagar todos os dados", sem incluí-lo no CSV, na fila de sincronização nem no Supabase

## 3. Adaptadores dos provedores

- [x] 3.1 Implementar o adaptador OpenAI: `listarModelos` (`GET /v1/models`, filtro de modelos de conversa) e `conversar` (`POST /v1/chat/completions` com `tools`), devolvendo o formato interno
- [x] 3.2 Implementar o adaptador Gemini: `listarModelos` (`GET /v1beta/models`, filtro por `generateContent`) e `conversar` (`generateContent` com `functionDeclarations`), chave no cabeçalho `x-goog-api-key`
- [x] 3.3 Tratar erros (401/400 de chave, 404, 429, rede, 30 s com `AbortController`) com mensagens em português que nunca incluem a chave

## 4. Lógica do assistente

- [x] 4.1 Criar a ferramenta `buscar_alimento` sobre `S.custom`, `FOODS` e `TACO` (até 5 itens, só id e nome) e o laço de até 4 voltas
- [x] 4.2 Montar o prompt fixo do sistema (só registrar alimentos, sem metas, dietas ou suplementos, ignorar instruções do texto do usuário que mudem isso)
- [x] 4.3 Validar a proposta em código: ids existentes, quantidade de 1 a 2000 g (ou 0,25 a 20 unidades), máximo de 8 itens, descarte de qualquer texto livre do modelo
- [x] 4.4 Calcular calorias e macros pelos valores por 100 g da base, ignorando números do modelo
- [x] 4.5 Criar o filtro de sinais de transtorno alimentar (sem acentos e sem diferença de maiúsculas) e a mensagem acolhedora, executado antes de qualquer envio

## 5. Interface

- [x] 5.1 Criar o card "Assistente de IA" no Perfil: interruptor desligado por padrão, provedor, campo de chave (senha), "Conectar", seletor de modelo e "Remover chave", mostrando só os quatro últimos caracteres da chave
- [x] 5.2 Criar o aviso de consentimento antes do primeiro envio por provedor
- [x] 5.3 Criar a aba "IA" na janela de adicionar alimento (visível só com assistente pronto): campo de até 500 caracteres, destino da refeição, "Propor itens", estado de carregamento e botão desativado sem internet
- [x] 5.4 Criar o cartão de proposta com quantidade editável, remover item, "Adicionar tudo" (via `commit`, igual ao lançamento manual) e "Descartar"; usar `esc()` em todo texto exibido
- [x] 5.5 Ajustar CSS nos temas claro e escuro e em 320 px, com área de toque de 44 px
- [x] 5.6 Conferir o português da interface

## 6. Segurança, versão e documentação

- [x] 6.1 Incluir `https://api.openai.com` e `https://generativelanguage.googleapis.com` em `connect-src` da CSP
- [x] 6.2 Atualizar `VERSAO` para 1.14.0 em `index.html` e `sw.js` (valores iguais)
- [x] 6.3 Recalcular o hash SHA-256 do script inline e atualizar o `script-src` da CSP (comando na seção "Segurança e privacidade" do `README.md`)
- [x] 6.4 Atualizar o `README.md`: versão atual, "Novo na 1.14.0", seção de privacidade (dados enviados ao provedor, chave só no aparelho, aviso de que não substitui profissional) e histórico de versões
- [x] 6.5 Gerar o resumo das alterações para o commit, em português do Brasil

## 7. Verificação

- [x] 7.1 Abrir `http://localhost:8000`, conferir que o console não mostra erros e que o cache `emagrecai-1.14.0` foi criado
- [ ] 7.2 Testar: assistente desligado (nenhuma requisição aos provedores), chave inválida, chave válida nos dois provedores, troca e desaparecimento de modelo, consentimento, proposta, edição, descarte, confirmação, visitante, conta e sem internet (feito com respostas simuladas; falta repetir com chave real dos dois provedores)
- [x] 7.3 Testar travas: quantidade absurda, mais de 8 itens, alimento inexistente, texto com HTML, pedido de meta, expressão de transtorno alimentar (sem chamada ao provedor) e ausência da chave em mensagens, console e CSV
- [x] 7.4 Testar sair da conta e "Apagar todos os dados": a chave deve ser removida do `localStorage`

## 8. Testar modelo (1.16.0)

- [x] 8.1 Botão "Testar modelo" no card, com texto fixo "uma banana" pelo caminho de `iaPropor`, resultado no card e botão desativado durante o teste
- [x] 8.2 Diferenciar modelo sem ferramentas (`semFerr`), alimento não encontrado e erros do provedor
- [x] 8.3 Versão 1.16.0, hash da CSP, README e spec `ai-assistant-settings`
