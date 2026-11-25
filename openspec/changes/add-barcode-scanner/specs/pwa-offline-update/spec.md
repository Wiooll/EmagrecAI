## ADDED Requirements

### Requirement: Biblioteca de leitura em cache
O service worker SHALL incluir o arquivo local da biblioteca de leitura de código de barras (`vendor/zxing.min.js`) na lista de arquivos estáticos guardados, atendendo-o com cache primeiro, no mesmo cache versionado dos demais arquivos.
#### Scenario: Leitura sem internet
- **WHEN** o app já foi aberto online e o usuário escaneia um código sem conexão em navegador sem `BarcodeDetector`
- **THEN** a biblioteca é carregada do cache e a câmera lê o código, deixando a consulta do produto sujeita à conexão
#### Scenario: Nova versão do app
- **WHEN** uma nova versão é publicada com `VERSAO` diferente no `sw.js`
- **THEN** o cache antigo é removido e o arquivo da biblioteca é guardado no cache novo
