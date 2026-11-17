## Why

Hoje, para registrar uma refeição, o usuário precisa buscar cada alimento em uma lista de 46 itens, escolher a medida e informar a quantidade. É o passo mais lento do app e o principal motivo de abandono de diários alimentares. Tirar uma foto do prato e receber uma lista de alimentos com porções estimadas reduz esse esforço, desde que o usuário possa revisar o resultado antes de salvar.

## What Changes

- Novo botão de câmera na janela "Adicionar alimento", ao lado das abas "Buscar" e "Novo alimento", já associado à refeição escolhida.
- O usuário tira uma foto (ou escolhe da galeria). A imagem é reduzida no aparelho, enviada para análise e **não é salva** em nenhum lugar.
- Um serviço de análise (função serverless) recebe a foto, consulta um modelo de visão e devolve uma lista de alimentos com porção estimada em gramas e um nível de confiança.
- Os itens reconhecidos são cruzados com a base local (`FOODS` e alimentos personalizados). Quando há correspondência, usam os valores nutricionais já conferidos. Quando não há, usam os valores estimados pelo modelo e aparecem marcados como "estimado".
- Nova tela de **revisão obrigatória**: cada item pode ser desmarcado, ter a quantidade ajustada ou ser removido. Nada entra no diário sem o usuário tocar em "Adicionar".
- Aviso de privacidade exibido antes do primeiro envio ("a foto será enviada para análise e não é guardada"), com o consentimento lembrado no navegador.
- Se o serviço estiver indisponível, sem internet ou não configurado, o botão mostra uma mensagem clara e o usuário continua usando a busca manual.
- Limites no serviço: tamanho máximo da imagem, tipos aceitos, limite de pedidos por origem e validação do formato da resposta do modelo.
- O `README.md` passa a documentar a configuração do serviço e a nova versão do app é exibida no Perfil.

Não há mudanças **BREAKING**: o registro manual, os dados salvos e o modo sem internet continuam como estão. A funcionalidade é opcional.

## Capabilities

### New Capabilities
- `photo-food-capture`: captura ou seleção da foto no app, redução da imagem, consentimento de privacidade, tela de revisão, correspondência com a base local e adição dos itens ao diário.
- `food-photo-analysis-api`: serviço serverless que recebe a imagem, valida o pedido, aplica limites de uso, consulta o modelo de visão e devolve a lista de alimentos em formato validado.

### Modified Capabilities
<!-- Nenhuma: ainda não existem specs em openspec/specs/. -->

## Impact

- **Código do app**: `EmagrecAI – Diário nutricional.html` (janela `drawSheet()`, tratamento de eventos em `data-a`, novas funções de redução de imagem, chamada ao serviço e tela de revisão, estilos novos).
- **Código novo**: função serverless (por exemplo `api/analisar-foto.js`) no mesmo projeto hospedado. **Isso quebra a premissa de arquivo único sem backend**, mas só para esta funcionalidade. O app continua funcionando sem ela.
- **Dependências externas**: API de um modelo de visão (provedor a definir na implementação, ver "Open Questions" em `design.md`). O app não usa bibliotecas novas no navegador.
- **Configuração obrigatória**: chave da API do modelo guardada como variável de ambiente no serviço, nunca no HTML. Hospedagem com suporte a funções (a Vercel já é a hospedagem citada no projeto).
- **Segurança e privacidade**: a foto é um dado pessoal e sai do aparelho. O serviço não grava nem registra a imagem. Como o app não tem login verificado no servidor, o endpoint precisa se proteger com limite de uso, limite de tamanho e checagem de origem.
- **Custo**: cada análise gera uma chamada paga ao modelo. O limite de uso e o tamanho reduzido da imagem controlam o custo.
- **Compatibilidade**: depende de `<input type="file" accept="image/*" capture>`, `canvas` e `fetch`, todos disponíveis nos navegadores atuais. Não depende do `add-google-login`, mas os dois alteram `drawSheet`/`profile` e `load`/`save`, então a ordem de implementação afeta a numeração da versão.
- **Documentação**: `README.md` atualizado (ou criado, caso o `add-google-login` ainda não tenha sido implementado).
- **Fora de escopo**: reconhecimento offline, leitura de código de barras ou rótulo, guardar o histórico de fotos, sugerir receitas e estimativa de porção com precisão clínica.
