## ADDED Requirements

### Requirement: Consentimento antes do primeiro envio
O sistema SHALL mostrar um aviso de consentimento antes do primeiro envio de texto a cada provedor, informando que o texto digitado e as buscas feitas pelo assistente saem do aparelho para o provedor escolhido, usando a chave do usuário. O sistema SHALL NOT enviar nada ao provedor antes de o usuário aceitar.

#### Scenario: Primeiro uso
- **WHEN** o usuário toca em "Propor itens" pela primeira vez com um provedor
- **THEN** o app mostra o aviso e só envia o texto depois de o usuário aceitar

#### Scenario: Recusa
- **WHEN** o usuário recusa o aviso
- **THEN** nenhuma requisição é enviada e o texto continua no campo

#### Scenario: Troca de provedor
- **WHEN** o usuário troca de provedor
- **THEN** o aviso é exibido de novo antes do primeiro envio ao novo provedor

### Requirement: Dados enviados limitados ao necessário
O sistema SHALL enviar ao provedor somente o texto digitado pelo usuário, as instruções fixas do assistente e os resultados das buscas de alimento. O sistema SHALL NOT enviar lançamentos, peso, metas, perfil, anotações ou favoritos.

#### Scenario: Conteúdo da requisição
- **WHEN** o assistente envia uma requisição ao provedor
- **THEN** ela contém apenas o texto do usuário, as instruções fixas e os resultados das buscas de alimento

### Requirement: O assistente só propõe alimentos
O sistema SHALL limitar o assistente a propor itens de alimento. O assistente SHALL NOT ter ferramenta que grave dados, altere metas ou perfil, ou leia o histórico do usuário. O sistema SHALL NOT exibir recomendações de dieta, metas calóricas, restrição alimentar ou suplementos geradas pelo modelo.

#### Scenario: Pedido de meta
- **WHEN** o usuário escreve "quero perder 10 kg em uma semana, qual deve ser minha meta?"
- **THEN** o app não altera nenhuma meta e exibe apenas itens de alimento, se houver, ou a orientação de que o assistente só registra refeições

#### Scenario: Texto livre do modelo
- **WHEN** o modelo devolve texto com conselhos além da lista de itens
- **THEN** o app descarta o texto e exibe somente os itens validados

### Requirement: Validação em código das quantidades
O sistema SHALL validar cada item proposto em código: quantidade numérica entre 1 e 2000 g (ou entre 0,25 e 20 unidades), no máximo 8 itens por proposta e alimento existente na base. Itens inválidos SHALL ser descartados com aviso.

#### Scenario: Quantidade absurda
- **WHEN** o modelo propõe 50000 g de um alimento
- **THEN** o item é descartado e o app avisa que a quantidade era inválida

#### Scenario: Excesso de itens
- **WHEN** o modelo propõe mais de 8 itens
- **THEN** o app mostra só os 8 primeiros e avisa que a lista foi limitada

### Requirement: Sinais de transtorno alimentar
O sistema SHALL verificar, antes de qualquer envio, se o texto do usuário contém expressões associadas a transtornos alimentares (como jejum prolongado, compensar a comida, vomitar, purgar ou laxante), ignorando acentos e maiúsculas. Havendo correspondência, o sistema SHALL NOT chamar o modelo e SHALL exibir uma mensagem acolhedora que recomenda procurar um profissional de saúde.

#### Scenario: Expressão de risco
- **WHEN** o usuário escreve um texto com uma expressão da lista
- **THEN** nenhuma requisição é enviada ao provedor e o app mostra a mensagem acolhedora com a recomendação de procurar um profissional

#### Scenario: Texto comum
- **WHEN** o usuário escreve "comi um pão com ovo no café"
- **THEN** o texto segue para o modelo normalmente

### Requirement: Tratamento seguro de dados externos e de erros
O sistema SHALL tratar a resposta do modelo e os nomes de alimentos como dados, exibindo-os sempre escapados e sem executar nada que venha deles. O sistema SHALL limitar cada chamada a 30 segundos, a 4 voltas de busca de alimentos e SHALL NOT repetir chamadas automaticamente. O sistema SHALL mostrar mensagens em português para chave inválida, limite de uso, modelo indisponível, falta de conexão e tempo esgotado, sem exibir a chave.

#### Scenario: HTML na resposta
- **WHEN** o nome de um alimento ou a resposta do modelo contém `<img src=x onerror=alert(1)>`
- **THEN** o texto é exibido literalmente e nada é executado

#### Scenario: Limite de uso
- **WHEN** o provedor responde que o limite de uso foi excedido
- **THEN** o app mostra uma mensagem em português, sem tentar de novo automaticamente

#### Scenario: Tempo esgotado
- **WHEN** a chamada passa de 30 segundos
- **THEN** o app cancela a chamada e avisa que o tempo esgotou, sem gravar nada

#### Scenario: Erro com a chave
- **WHEN** qualquer erro ocorre
- **THEN** a mensagem exibida e o console não contêm a chave de API

### Requirement: Política de segurança do conteúdo
O sistema SHALL permitir na Content-Security-Policy apenas `https://api.openai.com` e `https://generativelanguage.googleapis.com` como novos destinos de `connect-src`, e o hash do script inline SHALL corresponder ao script atual.

#### Scenario: CSP atualizada
- **WHEN** o app abre em `http://localhost:8000`
- **THEN** o console não mostra erros de CSP e as chamadas aos dois provedores são permitidas

#### Scenario: Outros destinos
- **WHEN** o código tenta conectar a um endereço não liberado
- **THEN** a CSP bloqueia a conexão
