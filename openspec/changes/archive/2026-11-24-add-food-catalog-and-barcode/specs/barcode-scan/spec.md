## ADDED Requirements

### Requirement: Aba "Código" na janela de adicionar alimento
A janela "Adicionar alimento" SHALL ter uma aba "Código" ao lado de "Buscar" e "Novo alimento", já associada à refeição escolhida, com um campo numérico para o código de barras (`inputmode="numeric"`, até 14 dígitos) e o botão "Buscar produto".

#### Scenario: Abrir a aba
- **WHEN** o usuário toca na aba "Código"
- **THEN** o app mostra o campo numérico, o botão "Buscar produto" e uma dica de onde achar o número, sob o código de barras da embalagem

#### Scenario: Refeição preservada
- **WHEN** o usuário abre a janela a partir do almoço e usa a aba "Código"
- **THEN** o produto adicionado entra na refeição almoço

### Requirement: Validação no app antes da consulta
O app SHALL aceitar somente dígitos com 8, 12, 13 ou 14 posições e dígito verificador válido, e SHALL mostrar o erro na própria aba, em português, sem chamar a função quando o código for inválido.

#### Scenario: Código com poucos dígitos
- **WHEN** o usuário digita 5 dígitos e toca em "Buscar produto"
- **THEN** o app mostra "Código inválido. Confira o número" e não faz nenhuma requisição

#### Scenario: Dígito verificador errado
- **WHEN** o usuário digita 13 dígitos com dígito verificador incorreto
- **THEN** o app mostra "Código inválido. Confira o número" e não faz nenhuma requisição

#### Scenario: Colar com espaços
- **WHEN** o usuário cola um código com espaços ou traços
- **THEN** o app remove os caracteres não numéricos antes de validar

### Requirement: Resultado da consulta e adição ao diário
Quando a função devolver um produto, o app SHALL validar e escapar os dados, mostrar nome, marca e valores por 100 g e levar o usuário ao passo de quantidade já existente, usando `porcao_g` e `porcao_rotulo` como medida quando existirem e gramas quando não. A entrada do diário SHALL usar o formato já existente, sem campos novos, e o nome SHALL ter no máximo 120 caracteres.

#### Scenario: Produto encontrado com porção
- **WHEN** a função devolve um produto com `porcao_g` e `porcao_rotulo`
- **THEN** o app oferece a porção do rótulo e as gramas, e calcula os valores proporcionalmente aos valores por 100 g

#### Scenario: Produto encontrado sem porção
- **WHEN** a função devolve um produto sem porção
- **THEN** o app permite informar a quantidade em gramas

#### Scenario: Resposta com dados inválidos
- **WHEN** a resposta da função tem valores fora das faixas válidas ou nome vazio
- **THEN** o app descarta o resultado e trata como `dados_incompletos`

#### Scenario: Nome com marcação
- **WHEN** o nome ou a marca contêm `<` ou `&`
- **THEN** são exibidos como texto, sem ser interpretados como HTML

### Requirement: Tratamento de erros e falta de conexão
O app SHALL traduzir cada código de erro da função em mensagem própria em português, SHALL cancelar a consulta após 10 segundos e SHALL manter a busca por nome e o cadastro manual disponíveis em qualquer falha. Para `nao_encontrado` e `dados_incompletos`, o app SHALL oferecer o botão "Cadastrar este produto", que abre a aba "Novo alimento".

#### Scenario: Produto não encontrado
- **WHEN** a função responde `nao_encontrado`
- **THEN** o app mostra "Produto não encontrado" e o botão "Cadastrar este produto"

#### Scenario: Dados incompletos
- **WHEN** a função responde `dados_incompletos`
- **THEN** o app mostra que o produto não tem dados nutricionais completos e oferece o botão "Cadastrar este produto"

#### Scenario: Sem internet
- **WHEN** o usuário consulta um código sem conexão
- **THEN** o app mostra "Sem conexão" e orienta usar a busca por nome ou o cadastro, sem travar

#### Scenario: Tempo esgotado
- **WHEN** a função não responde em 10 segundos
- **THEN** o app cancela a requisição e mostra uma mensagem para tentar de novo

#### Scenario: Limite de uso
- **WHEN** a função responde `limite_excedido`
- **THEN** o app mostra uma mensagem para aguardar e tentar novamente

#### Scenario: Modo sem endereço web
- **WHEN** o app é aberto por `file://`
- **THEN** a aba mostra que a consulta por código está indisponível neste modo de abertura e não faz requisição

### Requirement: Leitura pela câmera
O app SHALL exibir o botão "Escanear com a câmera" somente quando o contexto for seguro, `navigator.mediaDevices.getUserMedia` existir e `BarcodeDetector` existir com suporte a `ean_13`. Ao escanear, o app SHALL abrir a câmera traseira por ação do usuário, tentar detectar o código a cada 250 ms e, na primeira leitura com dígito verificador válido, SHALL parar a câmera, preencher o campo e consultar o produto.

#### Scenario: Navegador sem suporte
- **WHEN** o navegador não tem `BarcodeDetector` (por exemplo, Safari no iPhone)
- **THEN** o botão "Escanear com a câmera" não aparece e a digitação continua disponível

#### Scenario: Leitura bem-sucedida
- **WHEN** o usuário aponta a câmera para um código EAN-13 válido
- **THEN** o app para a câmera, preenche o campo com o número e consulta o produto

#### Scenario: Leitura inválida ignorada
- **WHEN** a câmera lê um número com dígito verificador inválido
- **THEN** o app ignora a leitura e continua tentando

#### Scenario: Permissão negada
- **WHEN** o usuário nega a permissão da câmera ou não há câmera
- **THEN** o app mostra uma mensagem e mantém a digitação disponível

### Requirement: Privacidade e controle da câmera
O app MUST ligar a câmera apenas por ação explícita do usuário e SHALL desligá-la (`track.stop()`) ao concluir a leitura, ao tocar em "Cancelar", ao trocar de aba, ao fechar a janela e quando a página ficar oculta. O app MUST NOT gravar nem enviar imagens da câmera. Somente o número lido SHALL sair do aparelho.

#### Scenario: Trocar de aba
- **WHEN** a câmera está ativa e o usuário muda para a aba "Buscar"
- **THEN** a câmera é desligada

#### Scenario: Página em segundo plano
- **WHEN** a câmera está ativa e o usuário troca de aplicativo
- **THEN** a câmera é desligada

#### Scenario: Cancelar
- **WHEN** o usuário toca em "Cancelar" durante a leitura
- **THEN** a câmera é desligada e a aba "Código" volta ao estado normal

### Requirement: Acessibilidade e interface
A aba "Código" SHALL usar os componentes visuais já existentes (abas, `.btn`, `.btn.sec`), textos em português do Brasil com acentuação revisada, rótulos visíveis nos campos, `aria-label` no vídeo da câmera, mensagens de resultado em uma região `aria-live="polite"` e SHALL respeitar `prefers-reduced-motion`.

#### Scenario: Leitor de tela
- **WHEN** a consulta termina com sucesso ou erro
- **THEN** o resultado é anunciado em uma região `aria-live="polite"`

#### Scenario: Tela pequena
- **WHEN** o app é aberto em uma tela de 320 px de largura
- **THEN** a aba "Código" cabe sem rolagem horizontal e os botões têm área de toque de pelo menos 44 px
