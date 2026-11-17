# EmagrecAI – Diário nutricional

Diário alimentar simples para acompanhar calorias, macronutrientes, água e peso. Funciona em um único arquivo HTML, sem build e sem backend.

**Versão atual:** 1.0.0

## Funcionalidades

- Registro de refeições (café da manhã, almoço, jantar e lanches) com busca em uma base de alimentos comuns no Brasil.
- Cadastro de alimentos próprios, com valores por 100 g.
- Medidas caseiras (colher, fatia, unidade etc.) ou gramas.
- Anel de calorias restantes e barras de carboidratos, proteínas e gorduras.
- Controle de água por copos de 250 ml.
- Registro de peso com gráfico de evolução e calorias dos últimos 7 dias.
- Perfil com meta calórica sugerida pela fórmula de Mifflin-St Jeor.
- Tema claro e escuro automático, de acordo com o sistema.

## Como executar

Não há dependências. Use uma das opções:

- Abrir o `index.html` direto no navegador.
- Servir localmente: `python -m http.server 8000` e acessar `http://localhost:8000`.
- Publicar no GitHub Pages: em **Settings > Pages**, escolha a branch `main` e a pasta `/ (root)`.

A fonte *Plus Jakarta Sans* é carregada do Google Fonts. Sem internet, o app usa a fonte padrão do sistema.

## Dados e privacidade

Todos os dados ficam no `localStorage` do navegador, na chave `pratocheio`. Nada é enviado a servidores. Limpar os dados do navegador apaga o histórico. Há também o botão "Apagar todos os dados" na tela de Perfil.

## Estrutura do projeto

| Caminho | Descrição |
| --- | --- |
| `index.html` | Aplicação completa (HTML, CSS e JavaScript). |
| `openspec/` | Especificações e propostas de mudança (OpenSpec). |
| `.kiro/` | Prompts e skills do Kiro usados no fluxo OpenSpec. |

## Aviso

As informações nutricionais são aproximadas e não substituem orientação profissional. Para metas clínicas, consulte um nutricionista.

## Histórico de versões

- **1.0.0**: versão inicial publicada no GitHub.
