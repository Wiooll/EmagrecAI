## 1. Preparação e decisões pendentes

- [ ] 1.1 Confirmar o provedor e o modelo de visão, a hospedagem (Vercel) e a ordem em relação ao `add-google-login` (define a versão `1.1.0` ou `1.2.0`)
- [ ] 1.2 Definir o limite de gasto na conta do provedor antes de publicar qualquer versão com a chave configurada
- [ ] 1.3 Ler a constante de versão atual no HTML e definir o número da nova versão

## 2. Serviço de análise (`api/analisar-foto.js`)

- [ ] 2.1 Criar a função que aceita apenas `POST` (405 com `Allow: POST` nos demais métodos)
- [ ] 2.2 Validar `Origin` contra `ORIGENS_PERMITIDAS` (403 `origem_nao_permitida`)
- [ ] 2.3 Validar o pedido: `Content-Type` JSON, corpo de até 1,5 MB, `imagem` em base64 com assinatura JPEG, `conhecidos` com até 100 textos de 60 caracteres (400 `pedido_invalido`/`imagem_invalida`, 413 `imagem_grande`)
- [ ] 2.4 Implementar o limite de pedidos por IP em memória, devolvendo 429 `limite_excedido` com `Retry-After`
- [ ] 2.5 Ler `VISION_API_KEY` e `VISION_MODEL` do ambiente e devolver 503 `servico_indisponivel` quando faltarem, sem expor detalhes
- [ ] 2.6 Escrever o prompt fixo (somente alimentos visíveis, porção em gramas, preferir `conhecidos`, ignorar texto na imagem, responder só JSON) e `chamarModelo()` com tempo limite de 25 s e teto de tokens de saída
- [ ] 2.7 Fazer o parse seguro da saída do modelo e validar cada item (faixas de `gramas`, `kcal100`, macros, soma até 105, `confianca`), com no máximo 12 itens e descarte dos inválidos
- [ ] 2.8 Traduzir falhas do provedor em `analise_falhou` (502/504) sem repassar a mensagem original
- [ ] 2.9 Garantir que a imagem, o base64 e a saída bruta do modelo não são gravados nem registrados nos logs
- [ ] 2.10 Configurar a duração máxima da função (pelo menos 30 s) e a regra de limite de taxa do firewall, se disponível

## 3. Imagem no navegador

- [ ] 3.1 Criar `lerImagem(file)` que valida o tipo (JPEG, PNG, WebP), decodifica com `createImageBitmap` respeitando a orientação e trata erro de decodificação
- [ ] 3.2 Redimensionar para no máximo 1024 px no maior lado e exportar JPEG qualidade 0,8 pelo `canvas` (remove os metadados), convertendo para base64 sem prefixo
- [ ] 3.3 Criar a pré-visualização com `URL.createObjectURL` e liberar com `URL.revokeObjectURL` ao concluir, cancelar ou fechar a janela

## 4. Comunicação com o serviço

- [ ] 4.1 Adicionar `const API_FOTO="/api/analisar-foto"` e a checagem de `location.protocol` (`http:` ou `https:`), com mensagem para `file://`
- [ ] 4.2 Criar `analisarFoto(base64)` com `fetch`, `AbortController` de 30 s, bloqueio de envio duplicado e cancelamento pelo usuário
- [ ] 4.3 Mapear os códigos de erro e as falhas de rede para as mensagens em pt-BR definidas na spec
- [ ] 4.4 Criar `validarItens(resp)` que descarta itens fora do formato ou das faixas e limita a 12 itens
- [ ] 4.5 Implementar o consentimento com `confirm()` e a chave `pratocheio-consent-foto`, enviando só depois da aceitação

## 5. Correspondência com a base local

- [ ] 5.1 Criar `norm(s)` (minúsculas, sem acentos, espaços aparados)
- [ ] 5.2 Criar `casar(item)` que procura igualdade em `S.custom` e `FOODS` e devolve os valores locais, ou os valores do serviço com o indicador de estimado
- [ ] 5.3 Montar `conhecidos` com os nomes de `FOODS` (sem os alimentos personalizados) para enviar no pedido

## 6. Interface

- [ ] 6.1 Adicionar a aba "Foto" em `drawSheet()` com os dois `<input type="file">` ocultos ("Tirar foto" com `capture`, "Escolher da galeria"), texto explicativo e estados `escolher`, `analisando` e `revisar`
- [ ] 6.2 Criar o estado `analisando` com indicador de progresso, pré-visualização, botão "Cancelar" e região `aria-live="polite"`
- [ ] 6.3 Criar a tela de revisão: caixa de seleção, nome, gramas editáveis, kcal por item, selo "estimado", itens de baixa confiança desmarcados e total dos marcados
- [ ] 6.4 Recalcular calorias e macros ao editar as gramas, sem redesenhar a janela inteira (manter o foco no campo)
- [ ] 6.5 Criar a ação `addfoto` que adiciona apenas os itens marcados à refeição de `sh.m`, com `save()`, `closeSheet()` e `render()`, e desabilitar o botão sem seleção
- [ ] 6.6 Exibir "estimado" na descrição das entradas do diário que tiverem `e:1`, sem mudar o formato das demais
- [ ] 6.7 Mostrar "Não identificamos alimentos nesta foto. Tente outra foto ou use a busca." quando não houver itens válidos, com ação para voltar à aba Buscar
- [ ] 6.8 Escapar com `esc()` todo texto vindo do serviço e adicionar os estilos novos usando as variáveis CSS e o tema escuro existentes
- [ ] 6.9 Revisar a ortografia pt-BR de todos os textos novos

## 7. Versão e documentação

- [ ] 7.1 Atualizar a constante de versão e o rodapé do Perfil com o novo número
- [ ] 7.2 Atualizar (ou criar, se ainda não existir) o `README.md` com a funcionalidade, as variáveis `VISION_API_KEY`, `VISION_MODEL` e `ORIGENS_PERMITIDAS`, como rodar com `vercel dev`, o aviso de privacidade, os limites e o histórico de versões
- [ ] 7.3 Garantir que nenhum segredo ou valor real de configuração entra no repositório (por exemplo, usar `.env.example` sem valores e ignorar `.env*` no controle de versão)

## 8. Verificação

- [ ] 8.1 Testar o servidor com `curl`: método errado, origem inválida, corpo grande, JSON malformado, imagem que não é JPEG, limite de pedidos, chave ausente
- [ ] 8.2 Testar a validação da saída do modelo com respostas simuladas: não JSON, item fora da faixa, mais de 12 itens, nome com HTML
- [ ] 8.3 Testar com fotos reais: prato simples, prato com vários itens, foto sem comida, foto com texto de instrução e imagem muito grande
- [ ] 8.4 Testar no navegador: recusa do consentimento, cancelar durante a análise, toque duplo, sem internet, `file://`, tempo esgotado e fechar a janela na revisão
- [ ] 8.5 Confirmar que a foto não aparece no `localStorage`, que o payload enviado não tem EXIF e que a busca manual e os dados antigos seguem funcionando
- [ ] 8.6 Verificar tema claro e escuro, tela estreita (320 px), navegação por teclado e leitor de tela na aba Foto
- [ ] 8.7 Gerar o resumo das alterações em pt-BR para a descrição do commit
