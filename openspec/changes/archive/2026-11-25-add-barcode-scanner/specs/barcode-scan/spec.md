## MODIFIED Requirements

### Requirement: Leitura pela câmera
O app SHALL exibir o botão "Escanear com a câmera" sempre que o contexto for seguro e `navigator.mediaDevices.getUserMedia` existir. Ao escanear, o app SHALL abrir a câmera traseira por ação do usuário, tentar ler o código a cada 250 ms e, na primeira leitura EAN-13 com dígito verificador válido, SHALL parar a câmera, preencher o campo e consultar o produto. O app SHALL usar `BarcodeDetector` quando ele existir com suporte a `ean_13` e SHALL usar a biblioteca de leitura em JavaScript (ZXing) nos demais casos, carregando-a somente na primeira leitura.
#### Scenario: Navegador sem BarcodeDetector
- **WHEN** o navegador não tem `BarcodeDetector` (por exemplo, Safari no iPhone) e o usuário toca em "Escanear com a câmera"
- **THEN** o app carrega a biblioteca ZXing, abre a câmera e lê o código
#### Scenario: Navegador com BarcodeDetector
- **WHEN** o navegador tem `BarcodeDetector` com `ean_13`
- **THEN** o app lê com `BarcodeDetector` e não baixa nem carrega a biblioteca ZXing
#### Scenario: Leitura bem-sucedida
- **WHEN** o usuário aponta a câmera para um código EAN-13 válido
- **THEN** o app para a câmera, preenche o campo com o número e consulta o produto
#### Scenario: Leitura inválida ignorada
- **WHEN** a câmera lê um número com dígito verificador inválido
- **THEN** o app ignora a leitura e continua tentando
#### Scenario: Permissão negada
- **WHEN** o usuário nega a permissão da câmera ou não há câmera
- **THEN** o app mostra uma mensagem e mantém a digitação disponível
#### Scenario: Biblioteca indisponível
- **WHEN** a biblioteca ZXing não carrega (arquivo ausente ou sem cache)
- **THEN** o app desliga a câmera, mostra "Leitura pela câmera indisponível. Digite o número do código." e mantém a digitação disponível
#### Scenario: Contexto inseguro
- **WHEN** o app é aberto fora de HTTPS ou `localhost`
- **THEN** o botão "Escanear com a câmera" não aparece e a digitação continua disponível
