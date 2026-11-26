## ADDED Requirements

### Requirement: Ordem dos cards no Perfil
A tela de Perfil SHALL exibir os cards na ordem: Conta, Metas e perfil, Lembretes, Tema, Assistente de IA, Dados, Instalar app (quando aplicável) e Sobre o app, seguidos da versão.

#### Scenario: Ordem padrão
- **WHEN** o usuário abre a aba Perfil
- **THEN** os cards aparecem na ordem definida, com Conta e Metas e perfil no topo

#### Scenario: Instalar app não aplicável
- **WHEN** o app já está instalado ou o navegador não oferece instalação
- **THEN** o card Instalar app não aparece e a ordem dos demais é mantida

### Requirement: Cards longos recolhíveis
Os cards Lembretes, Assistente de IA e Sobre o app SHALL ser recolhíveis, iniciar fechados e mostrar no cabeçalho o título e um resumo curto do estado. Conta, Metas e perfil e Dados SHALL iniciar abertos.

#### Scenario: Abrir e fechar
- **WHEN** o usuário toca ou aciona pelo teclado o cabeçalho de um card recolhível
- **THEN** o conteúdo do card é exibido ou ocultado

#### Scenario: Resumo visível com o card fechado
- **WHEN** o card Assistente de IA está fechado
- **THEN** o cabeçalho informa se o recurso está ativado ou desativado

### Requirement: Estado de abertura preservado nos redesenhos
Um card aberto pelo usuário SHALL permanecer aberto quando o Perfil ou o próprio card for redesenhado durante a sessão. O estado de abertura NÃO SHALL ser gravado nos dados do usuário.

#### Scenario: Redesenho do card de IA
- **WHEN** o usuário abre o card Assistente de IA e ativa o recurso, o que redesenha o card
- **THEN** o card continua aberto

#### Scenario: Reinício do app
- **WHEN** o usuário fecha e reabre o app
- **THEN** os cards voltam ao estado padrão

### Requirement: Aparência padronizada
Os cards do Perfil SHALL usar a mesma estrutura, espaçamento e tipografia nos temas claro e escuro, com área de toque do cabeçalho recolhível de no mínimo 44px e rótulo acessível.

#### Scenario: Tema escuro
- **WHEN** o tema escuro está ativo
- **THEN** os cabeçalhos recolhíveis mantêm contraste legível e o mesmo espaçamento do tema claro

### Requirement: Funcionalidades inalteradas
A reorganização SHALL manter o comportamento, os dados, a sincronização e a exportação CSV de todas as funções do Perfil.

#### Scenario: Salvar perfil após a mudança
- **WHEN** o usuário altera as metas e toca em Salvar perfil
- **THEN** os valores são salvos e sincronizados como antes
