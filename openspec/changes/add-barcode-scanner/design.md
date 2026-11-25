## Context

O leitor atual (`camIniciar` no `index.html`) usa `BarcodeDetector` com `ean_13` e só aparece quando `CAM_EAN` é verdadeiro. O app é um arquivo `index.html` com script inline liberado por hash na CSP (`default-src 'none'`, `script-src` com hash e `cdn.jsdelivr.net`). O service worker guarda uma lista fechada de arquivos estáticos (`ARQUIVOS`). O GitHub Pages não permite cabeçalhos HTTP.

## Goals / Non-Goals

**Goals:**
- Leitura de EAN-13 pela câmera em aparelhos sem `BarcodeDetector` (iPhone, Firefox).
- Manter privacidade: câmera só por ação do usuário, nenhuma imagem guardada ou enviada.
- Não aumentar o custo de quem já tem `BarcodeDetector`.

**Non-Goals:**
- Novos formatos além do EAN-13, lanterna, leitura por foto da galeria.
- Mudanças na função do Supabase ou na validação do dígito verificador (`gtinOk`).

## Decisions

1. **Biblioteca: `@zxing/library` (UMD, versão fixa), copiada para `vendor/zxing.min.js`.**
   - Alternativa A: carregar do jsDelivr com SRI. Descartada: o leitor deixaria de funcionar offline na primeira vez e dependeria de terceiro em tempo de execução.
   - Alternativa B: `zxing-wasm`. Descartada: exige `wasm-unsafe-eval` na CSP e arquivo maior.
   - Alternativa C: `html5-qrcode` (também baseado em ZXing). Descartada: traz interface própria, que fugiria dos componentes visuais existentes.
   - Ao implementar, confirmar o tamanho do arquivo e a licença (MIT) e registrar versão e origem em `vendor/LEIAME.md`.

2. **Carregamento sob demanda.** Uma função `carregarZxing()` insere um `<script src="vendor/zxing.min.js">` na primeira leitura e devolve a mesma promessa nas chamadas seguintes. Quem usa `BarcodeDetector` nunca baixa o arquivo.

3. **Uma única interface de leitura.** Criar `lerQuadro(video)`, que devolve o texto lido ou `null`: usa `BarcodeDetector` se disponível, senão decodifica o quadro do `<video>` com ZXing, desenhando-o num `canvas` fora da tela e usando `MultiFormatReader` restrito a `EAN_13`. O laço de 250 ms, `camParar`, `gtinOk` e o fluxo de busca permanecem como estão.

4. **Visibilidade do botão.** O botão aparece quando `isSecureContext` e `getUserMedia` existem, sem esperar `getSupportedFormats`. Se `BarcodeDetector` existir mas não suportar `ean_13`, usa-se ZXing.

5. **CSP.** Acrescentar `'self'` ao `script-src`, mantendo o hash do script inline. O ZXing não usa `eval`. O hash do script inline muda e precisa ser recalculado conforme o README.

6. **Service worker.** Incluir `vendor/zxing.min.js` em `ARQUIVOS` (cache-primeiro, mesmo mecanismo do `taco.json`) e atualizar `VERSAO` nos dois arquivos.

## Risks / Trade-offs

- **Código de terceiros no app** → cópia local, versão fixa, registro da origem, sem rede em tempo de execução.
- **Desempenho em aparelhos fracos** (decodificação em JavaScript a cada 250 ms) → reduzir a resolução do quadro (por exemplo, largura máxima de 640 px) e manter a trava `ler` para não empilhar leituras.
- **Cache maior** → o arquivo entra no pré-cache; aceitável para um PWA que já guarda a tabela TACO. Medir o tamanho final.
- **Legibilidade em Safari** → `<video>` já usa `playsinline muted`; validar em iPhone real, pois não há como testar aqui.
- **`'self'` no `script-src`** amplia a política. Como o app não aceita upload de arquivos nem escreve no próprio domínio, o risco é baixo.
