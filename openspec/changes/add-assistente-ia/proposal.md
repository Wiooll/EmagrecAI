## Why

Lançar cada alimento à mão é o principal motivo de abandono de um diário alimentar. Um assistente de IA que entende frases como "almocei arroz, feijão, um bife e salada" reduz esse trabalho. Como o app não tem backend próprio e lida com dados de saúde, o assistente deve ser opcional, usar a chave de API do próprio usuário e nunca alterar o diário sem confirmação.

## What Changes

- Novo card "Assistente de IA" no Perfil, **desligado por padrão**. O usuário escolhe o provedor (OpenAI ou Google Gemini) e informa a própria chave de API.
- Depois que a chave é informada, o app consulta a lista de modelos do provedor, filtra os que servem para conversa e deixa o usuário escolher um. Chave inválida mostra erro e não carrega modelos.
- A chave fica só no `localStorage` do aparelho: não vai ao Supabase, não entra no CSV e é apagada ao sair da conta e em "Apagar todos os dados".
- Novo "Registro por texto" na janela de adicionar alimento: o usuário descreve a refeição (pode usar o ditado do teclado do celular) e o assistente **propõe** uma lista de alimentos. O usuário confirma, edita ou descarta cada item. Nada é gravado antes da confirmação.
- Os valores de calorias e macros dos itens propostos vêm sempre da TACO, dos alimentos do usuário ou do Open Food Facts, nunca do número devolvido pelo modelo.
- Travas de segurança em código: quantidades dentro de faixa plausível, o assistente não altera metas nem perfil, filtro de sinais de transtorno alimentar antes do envio, aviso de que não substitui profissional de saúde e consentimento explícito antes do primeiro envio de dados.
- A Content-Security-Policy passa a permitir `api.openai.com` e `generativelanguage.googleapis.com` em `connect-src`, e o hash do script inline é recalculado.
- Versão 1.14.0.

Fora desta change: foto do prato, chat livre sobre os dados, coach semanal e sugestão para fechar o dia.

## Capabilities

### New Capabilities
- `ai-assistant-settings`: card no Perfil para ativar o assistente, escolher o provedor, guardar a chave só no aparelho, listar e escolher modelos e remover a chave.
- `ai-meal-logging`: registro de refeição por texto, com proposta de itens baseada nos catálogos do app e confirmação do usuário antes de gravar.
- `ai-safety-guardrails`: consentimento, validações em código, filtro de sinais de transtorno alimentar, limites do que o assistente pode fazer e tratamento de erros.

### Modified Capabilities

Nenhuma. O comportamento dos requisitos existentes não muda.

## Impact

- `index.html`: card no Perfil, aba ou botão de registro por texto, adaptadores OpenAI e Gemini, validação das propostas, limpeza da chave ao sair e em "Apagar dados", CSS, `VERSAO` e hash da CSP.
- `sw.js`: `VERSAO` igual à do `index.html`. As chamadas aos provedores não podem ser guardadas em cache.
- `README.md`: versão, "Novo na 1.14.0", seção de privacidade (dados enviados ao provedor escolhido, chave só no aparelho) e histórico.
- Sem mudanças no banco e sem Edge Function nova.
- Dependências externas: APIs da OpenAI e do Google, chamadas direto do navegador com a chave do usuário. O teste de CORS (feito em 26/11/2026) confirmou que ambas aceitam chamadas do navegador, inclusive nas respostas de erro.
- Privacidade: o texto digitado e as buscas feitas pelo assistente saem do aparelho para o provedor escolhido. Isso exige consentimento e é descrito no README.
