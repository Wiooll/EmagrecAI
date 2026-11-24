## Why

A busca de alimentos do app usa só 46 itens embutidos. Quem procura "pão de queijo", "tapioca" ou "cuscuz" recebe "Nenhum resultado" e precisa cadastrar o alimento à mão, e produtos de mercado exigem digitar todos os valores do rótulo. Esse é o passo mais lento do registro e o motivo mais comum para desistir do diário. Ampliar a base com a tabela brasileira oficial e permitir a consulta por código de barras resolve os dois casos sem mudar o formato dos dados salvos.

## What Changes

- **Catálogo de comida caseira**: a Tabela Brasileira de Composição de Alimentos (TACO, 4ª edição, NEPA/UNICAMP, cerca de 600 itens) passa a ser embutida no app como um arquivo JSON estático, com valores por 100 g e medidas caseiras (fatia, colher, unidade) quando houver. A busca da janela "Adicionar alimento" passa a consultar `FOODS`, alimentos personalizados e o catálogo, nesta ordem de prioridade, sem duplicar itens.
- **Uso sem internet**: o arquivo do catálogo entra na lista de arquivos do service worker, então a busca continua funcionando offline e para o visitante sem login.
- **Consulta por código de barras**: nova aba "Código" na janela "Adicionar alimento". O usuário digita o número do código (EAN-8, UPC-A, EAN-13 ou GTIN-14) ou, em navegadores que oferecem `BarcodeDetector`, escaneia com a câmera.
- **Função de consulta (Supabase Edge Function)**: o app envia o código a uma função própria. A função valida o código, procura primeiro em uma tabela de cache (`produtos_cache`) e, se não achar, consulta o Open Food Facts com o `User-Agent` exigido por eles. O resultado validado é guardado no cache e devolvido ao app.
- **Produto não encontrado ou incompleto**: o app mostra uma mensagem clara e oferece "Cadastrar este produto", que abre a aba "Novo alimento" já existente. O código de barras não é guardado no cadastro, porque a tabela `custom_foods` não tem esse campo.
- **Atribuição das fontes**: o Perfil (card "Sobre o app") e o README citam a TACO (NEPA/UNICAMP) e o Open Food Facts, conforme as licenças.
- **Versão `1.6.0`**: a versão atual do código é `1.5.0` (edição de alimentos). `VERSAO` no `index.html` e no `sw.js`, hash da CSP, README e histórico de versões são atualizados. O README ainda indica `1.4.0` e será corrigido junto, incluindo a entrada da `1.5.0`.

Não há mudanças **BREAKING**. O registro manual, os alimentos personalizados e os dados já salvos continuam iguais. Entradas do diário guardam uma cópia dos valores, então trocar ou ampliar a base não altera registros antigos.

## Capabilities

### New Capabilities
- `food-catalog`: catálogo TACO embutido, busca combinada com a base local, medidas caseiras, deduplicação e atribuição da fonte.
- `barcode-lookup-api`: função serverless que valida o código, usa a tabela de cache, consulta o Open Food Facts, valida a resposta e aplica limites de uso.
- `barcode-scan`: aba "Código" no app, digitação do número, leitura pela câmera com `BarcodeDetector` quando disponível, tratamento de erros e cadastro de produto não encontrado.

### Modified Capabilities
- `pwa-offline-update`: o arquivo do catálogo passa a fazer parte dos arquivos guardados em cache, e a Content-Security-Policy ganha `'self'` em `connect-src` para o app ler o catálogo do próprio endereço, sem liberar nenhum domínio novo.

## Impact

- **Código do app** (`index.html`): janela `drawSheet()` (nova aba e busca combinada), carregamento do catálogo, módulo de código de barras, estilos novos, constante `VERSAO`, hash e `connect-src` da CSP.
- **Arquivos novos**: `data/taco.json` (catálogo gerado a partir de fonte oficial, com script de conversão documentado), `supabase/functions/consultar-codigo/` (função) e uma migração em `supabase/migrations/` para `produtos_cache`.
- **`sw.js`**: `VERSAO` e inclusão de `data/taco.json` em `ARQUIVOS`.
- **Banco**: nova tabela `produtos_cache` com dados públicos de produtos (sem dado pessoal), Row Level Security ativada e nenhum acesso direto para `anon` ou `authenticated`. Só a função, com a chave de serviço do ambiente, lê e grava.
- **Dependências externas**: API do Open Food Facts (leitura, sem conta). Nenhuma biblioteca nova no navegador.
- **Configuração**: variável de ambiente da função com o contato para o `User-Agent` (e-mail definido pelo autor, nunca no repositório).
- **Segurança e privacidade**: o código de barras sai do aparelho para a função própria, e o Open Food Facts só vê o endereço da função. A função é pública (o visitante não tem login), então precisa validar o código, limitar uso e nunca devolver texto bruto do provedor. O app valida de novo a resposta e escapa tudo com `esc()`. O uso da câmera exige HTTPS e permissão do usuário.
- **Licenças**: a TACO exige citação e termos de redistribuição a confirmar. O Open Food Facts usa a licença ODbL, e o cache é uma base derivada. Isso deve ser verificado antes da implementação (ver `design.md`).
- **Compatibilidade**: `BarcodeDetector` existe no Chrome e no Edge, mas não no Safari (iPhone) nem no Firefox. Nesses navegadores o usuário digita o número. Ler código de barras com biblioteca WebAssembly no iPhone fica fora desta mudança.
- **Relação com outras mudanças**: `add-photo-food-capture` também altera `drawSheet()`, a versão e o README. As duas são independentes, mas a ordem de implementação define a numeração da versão. Com o catálogo maior, a correspondência de nomes da mudança de foto melhora.
- **Fora de escopo**: busca por nome no Open Food Facts, leitura de código por biblioteca WebAssembly, contribuição de dados ao Open Food Facts, tabelas nutricionais além da TACO, micronutrientes e histórico de produtos escaneados.
