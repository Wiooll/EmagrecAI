## 1. Biblioteca

- [ ] 1.1 Baixar `@zxing/library` (UMD minificado, versão fixa) para `vendor/zxing.min.js` e confirmar licença Apache-2.0 e tamanho
- [ ] 1.2 Criar `vendor/LEIAME.md` com nome, versão, origem e licença

## 2. Leitor no app (`index.html`)

- [ ] 2.1 Criar `carregarZxing()` que insere o script local sob demanda e reaproveita a promessa
- [ ] 2.2 Criar `lerQuadro(video)` que usa `BarcodeDetector` ou ZXing (canvas fora da tela, só `EAN_13`, largura máxima 640 px)
- [ ] 2.3 Mostrar o botão "Escanear com a câmera" com `isSecureContext` e `getUserMedia`, removendo a dependência de `CAM_EAN`
- [ ] 2.4 Adaptar `camIniciar` para usar `lerQuadro`, tratar falha de carregamento com a mensagem da especificação e manter `camParar` em todos os pontos de saída
- [ ] 2.5 Revisar a ortografia pt-BR das mensagens novas

## 3. CSP, service worker e versão

- [ ] 3.1 Acrescentar `'self'` ao `script-src` e recalcular o hash SHA-256 do script inline (comando no README)
- [ ] 3.2 Incluir `vendor/zxing.min.js` em `ARQUIVOS` no `sw.js`
- [ ] 3.3 Atualizar `VERSAO` no `index.html` e no `sw.js` com o mesmo valor (1.8.0)

## 4. Documentação

- [ ] 4.1 Atualizar o `README.md`: versão, "Novo na 1.8.0", histórico, seção de segurança (CSP e biblioteca local) e remoção da limitação do iPhone
- [ ] 4.2 Gerar o resumo das alterações para a descrição do commit, em português do Brasil

## 5. Verificação

- [ ] 5.1 Abrir em `http://localhost:8000`: console sem erros e cache `emagrecai-1.8.0` criado com o arquivo da biblioteca
- [ ] 5.2 Testar no Chrome (caminho `BarcodeDetector`, sem requisição ao `zxing.min.js`) e com `BarcodeDetector` removido (caminho ZXing)
- [ ] 5.3 Testar em iPhone real (Safari e app instalado), incluindo permissão negada e sem internet
- [ ] 5.4 Confirmar que a câmera desliga ao ler, cancelar, trocar de aba, fechar e ocultar a página
