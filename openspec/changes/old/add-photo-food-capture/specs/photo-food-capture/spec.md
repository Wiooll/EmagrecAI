## ADDED Requirements

### Requirement: Entrada de foto na janela de adicionar alimento
O sistema SHALL oferecer, na janela "Adicionar alimento", uma aba "Foto" com as ações "Tirar foto" e "Escolher da galeria", e SHALL manter a refeição já selecionada para os itens adicionados.

#### Scenario: Abrir a aba Foto
- **WHEN** o usuário toca em "Foto" na janela de uma refeição
- **THEN** o sistema mostra as duas ações e uma explicação curta de que a foto será analisada e os itens poderão ser revisados

#### Scenario: Tirar foto em celular
- **WHEN** o usuário toca em "Tirar foto" em um dispositivo com câmera
- **THEN** o sistema abre a câmera traseira por meio do seletor de arquivos do navegador, sem pedir outra permissão

### Requirement: Validação e redução da imagem no aparelho
O sistema SHALL aceitar somente arquivos de imagem JPEG, PNG ou WebP, SHALL redimensionar a imagem para no máximo 1024 px no maior lado e SHALL reenviá-la como JPEG, de modo que metadados (como localização) não sejam enviados.

#### Scenario: Arquivo que não é imagem
- **WHEN** o usuário escolhe um arquivo que não é JPEG, PNG ou WebP
- **THEN** o sistema não envia nada e exibe "Escolha uma imagem JPEG, PNG ou WebP."

#### Scenario: Foto grande
- **WHEN** o usuário escolhe uma foto de 4000 x 3000 px
- **THEN** o sistema envia uma imagem JPEG com no máximo 1024 px no maior lado, sem os metadados originais

#### Scenario: Imagem corrompida
- **WHEN** o navegador não consegue decodificar o arquivo escolhido
- **THEN** o sistema exibe "Não foi possível ler esta imagem." e permanece na aba Foto

### Requirement: Consentimento de privacidade
O sistema SHALL exibir, antes do primeiro envio, o aviso "A foto será enviada para análise e não é guardada." e SHALL enviar a imagem somente após o usuário confirmar. A confirmação SHALL ser lembrada neste navegador.

#### Scenario: Primeiro uso
- **WHEN** o usuário seleciona uma foto sem ter confirmado o aviso antes
- **THEN** o sistema pede a confirmação e não envia a imagem até que o usuário aceite

#### Scenario: Usuário recusa
- **WHEN** o usuário cancela o aviso de privacidade
- **THEN** o sistema descarta a imagem, não faz nenhuma requisição e permanece na aba Foto

#### Scenario: Usos seguintes
- **WHEN** o usuário já confirmou o aviso anteriormente
- **THEN** o sistema envia a foto direto, sem repetir o aviso

### Requirement: Foto não é armazenada
O sistema SHALL manter a imagem apenas em memória durante a análise e SHALL descartá-la ao concluir, cancelar ou fechar a janela, sem gravá-la no `localStorage` nem em outro armazenamento.

#### Scenario: Fim da análise
- **WHEN** a análise termina com sucesso, com erro ou é cancelada
- **THEN** a imagem e qualquer URL temporária de pré-visualização são descartadas e nenhum dado da imagem aparece no `localStorage`

### Requirement: Estado de análise e cancelamento
O sistema SHALL mostrar um indicador de progresso durante a análise, SHALL impedir envios duplicados e SHALL permitir cancelar a análise.

#### Scenario: Toque repetido
- **WHEN** o usuário aciona o envio enquanto uma análise está em andamento
- **THEN** o sistema ignora o segundo acionamento e mantém uma única requisição

#### Scenario: Cancelar
- **WHEN** o usuário toca em "Cancelar" durante a análise
- **THEN** o sistema interrompe a requisição e volta para a aba Foto sem adicionar itens

### Requirement: Revisão obrigatória antes de adicionar
O sistema SHALL listar os alimentos reconhecidos em uma tela de revisão e SHALL adicionar ao diário somente os itens marcados, após o usuário tocar em "Adicionar". Itens com confiança baixa SHALL iniciar desmarcados.

#### Scenario: Revisar e adicionar
- **WHEN** a análise retorna três itens e o usuário desmarca um e toca em "Adicionar ao almoço"
- **THEN** o sistema adiciona dois itens ao almoço do dia selecionado, atualiza os totais e fecha a janela

#### Scenario: Ajustar a quantidade
- **WHEN** o usuário altera a quantidade em gramas de um item
- **THEN** o sistema recalcula calorias e macros do item e o total da revisão na hora

#### Scenario: Nada marcado
- **WHEN** nenhum item está marcado
- **THEN** o botão "Adicionar" permanece desabilitado

#### Scenario: Fechar sem adicionar
- **WHEN** o usuário fecha a janela durante a revisão
- **THEN** nenhum item é adicionado ao diário

### Requirement: Correspondência com a base local
O sistema SHALL tentar casar cada item reconhecido com a base local (`FOODS` e alimentos personalizados) por nome normalizado (sem acentos e sem diferença de maiúsculas). Quando houver correspondência, o sistema SHALL usar os valores nutricionais da base local. Quando não houver, SHALL usar os valores estimados retornados pelo serviço e marcar o item como "estimado".

#### Scenario: Alimento da base
- **WHEN** o serviço retorna "Arroz branco cozido" com 150 g
- **THEN** o sistema calcula calorias e macros com os valores de 100 g da base local e não exibe a marca "estimado"

#### Scenario: Alimento fora da base
- **WHEN** o serviço retorna um item sem correspondência local
- **THEN** o sistema usa os valores por 100 g retornados pelo serviço e exibe a marca "estimado" no item

#### Scenario: Item estimado no diário
- **WHEN** o usuário adiciona um item estimado
- **THEN** a entrada do diário guarda o mesmo formato das demais (`n`, `g`, `k`, `c`, `p`, `f`) mais um indicador de estimativa, e a lista do diário exibe "estimado" na descrição do item

### Requirement: Exibição segura dos dados retornados
O sistema SHALL tratar a resposta do serviço como entrada não confiável, SHALL escapar todo texto antes de inseri-lo no HTML e SHALL descartar itens com campos fora do formato ou fora das faixas esperadas.

#### Scenario: Nome com HTML
- **WHEN** o serviço retorna um nome contendo `<script>` ou aspas
- **THEN** o sistema exibe o texto literal e nenhum código é executado

#### Scenario: Valores inválidos
- **WHEN** um item chega com gramas negativas, não numéricas ou acima do limite
- **THEN** o sistema descarta o item e mostra os demais

#### Scenario: Nenhum item válido
- **WHEN** todos os itens retornados são descartados ou a lista vem vazia
- **THEN** o sistema exibe "Não identificamos alimentos nesta foto. Tente outra foto ou use a busca." e oferece voltar para a aba Buscar

### Requirement: Falha graciosa e uso manual preservado
O sistema SHALL continuar totalmente funcional sem a análise por foto. Quando o serviço estiver indisponível, o app estiver aberto por `file://`, não houver internet, a requisição exceder 30 segundos ou o serviço limitar o uso, o sistema SHALL exibir uma mensagem clara em pt-BR, preservar a foto selecionada apenas durante a tela e permitir tentar de novo ou usar a busca manual.

#### Scenario: Sem internet
- **WHEN** o usuário envia uma foto sem conexão
- **THEN** o sistema exibe "Sem conexão. Tente novamente ou use a busca." e mantém as abas Buscar e Novo alimento funcionando

#### Scenario: Abertura por arquivo local
- **WHEN** o app é aberto por `file://`
- **THEN** a aba Foto informa "Análise por foto indisponível neste modo de abertura." e não faz requisições

#### Scenario: Limite de uso atingido
- **WHEN** o serviço responde que o limite de pedidos foi atingido
- **THEN** o sistema exibe "Muitas análises em pouco tempo. Aguarde um pouco e tente de novo."

#### Scenario: Tempo esgotado
- **WHEN** a análise passa de 30 segundos sem resposta
- **THEN** o sistema interrompe a requisição e exibe "A análise demorou demais. Tente novamente."

### Requirement: Versão exibida
O sistema SHALL exibir o número da nova versão do app no rodapé do Perfil e SHALL registrar a funcionalidade no histórico de versões do `README.md`.

#### Scenario: Versão visível
- **WHEN** o usuário abre a tela de Perfil
- **THEN** o rodapé mostra a versão atual do app, igual à registrada no `README.md`
