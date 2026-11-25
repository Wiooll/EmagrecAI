## Why

O botão "Escanear com a câmera" só aparece em navegadores com `BarcodeDetector` (Chrome e Edge). No iPhone (Safari e app instalado) e no Firefox o usuário só pode digitar o número do código. Um leitor em JavaScript como alternativa permite escanear em qualquer aparelho com câmera.

## What Changes

- Quando `BarcodeDetector` não existir ou não suportar `ean_13`, o app passa a usar uma biblioteca de leitura em JavaScript (ZXing) como alternativa. O botão "Escanear com a câmera" aparece em todos os navegadores com câmera e contexto seguro.
- Quando `BarcodeDetector` existir, o comportamento atual é mantido (sem custo extra de download).
- A biblioteca é versionada no próprio repositório (`vendor/`) e só é carregada quando o usuário toca em "Escanear com a câmera" pela primeira vez.
- A CSP passa a permitir scripts do mesmo endereço do app (`'self'`), e o service worker guarda o arquivo da biblioteca para uso sem internet.
- Regras de privacidade da câmera, validação do dígito verificador e consulta do produto continuam iguais.
- O botão deixa de depender de detecção assíncrona de formatos e a mensagem do iPhone no README deixa de ser necessária.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `barcode-scan`: o requisito "Leitura pela câmera" deixa de exigir `BarcodeDetector`. O botão aparece com `getUserMedia` em contexto seguro, e a leitura usa `BarcodeDetector` quando disponível ou a biblioteca ZXing como alternativa.
- `pwa-offline-update`: o arquivo da biblioteca passa a fazer parte dos arquivos guardados pelo service worker.

## Impact

- `index.html`: lógica da câmera (`CAM_EAN`, `camIniciar`), carregamento sob demanda do script, meta tag de CSP (`script-src 'self'` e novo hash do script inline), constante `VERSAO`.
- `sw.js`: lista `ARQUIVOS` e constante `VERSAO`.
- Novo arquivo `vendor/` com a biblioteca ZXing (versão fixa, licença MIT) e o registro da origem e da versão.
- `README.md`: versão, "Novo na x.y.z", histórico, seção de segurança e remoção da limitação do iPhone.
- Nova dependência de terceiros (código executado no app), com o risco de cadeia de suprimentos mitigado por cópia local e versão fixa.
- Aumento do tamanho do cache offline (a ser medido na implementação).
