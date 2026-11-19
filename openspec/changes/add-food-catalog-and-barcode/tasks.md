## 1. Pré-requisitos e decisões

- [ ] 1.1 Verificar os termos de redistribuição da TACO (NEPA/UNICAMP) e as condições de atribuição e base derivada da licença ODbL do Open Food Facts. Registrar a conclusão no `design.md` (Open Questions). Se a redistribuição da TACO não for permitida, parar e rever o plano
- [ ] 1.2 Definir a fonte dos dados da TACO (arquivos oficiais da UNICAMP ou `brolesi/taco`) e o e-mail de contato do `User-Agent`
- [ ] 1.3 Confirmar a versão atual no `index.html` e no `sw.js` (`1.5.0`) e se `add-photo-food-capture` já foi implementada, para fixar a nova versão (`1.6.0` ou posterior)

## 2. Catálogo TACO

- [ ] 2.1 Criar o script de conversão em `scripts/` que lê a fonte, usa energia em kcal, converte "traço" em `0`, descarta itens sem energia ou macronutriente, valida faixas e nomes únicos e gera `data/taco.json` com as chaves `n`, `k`, `c`, `p`, `f` e `u` opcional
- [ ] 2.2 Cruzar com a Tabela de Medidas Referidas (POF/IBGE) e incluir medida caseira só quando a correspondência for exata
- [ ] 2.3 Gerar `data/taco.json`, conferir a contagem de itens e amostras conhecidas (por exemplo, arroz, feijão, pão francês, ovo) e versionar o arquivo
- [ ] 2.4 Documentar no README como regenerar o catálogo

## 3. Busca combinada no app

- [ ] 3.1 Carregar `data/taco.json` na primeira abertura da janela "Adicionar alimento", manter em memória e validar cada item (faixas e escape de texto)
- [ ] 3.2 Implementar a busca com normalização sem acentos, exigência de todas as palavras, prioridade `FOODS` > personalizados > catálogo, deduplicação por nome normalizado e limite de 50 itens
- [ ] 3.3 Reaproveitar `ud(f)` e o passo de quantidade existentes para itens do catálogo, com gramas quando não houver medida caseira
- [ ] 3.4 Exibir "Catálogo ampliado indisponível" quando o carregamento falhar, mantendo a busca local
- [ ] 3.5 Ajustar a meta tag de CSP (`connect-src 'self' <supabase>`) e recalcular o hash do script inline
- [ ] 3.6 Incluir `data/taco.json` em `ARQUIVOS` do `sw.js` e confirmar que a busca funciona offline

## 4. Banco e função de consulta

- [ ] 4.1 Criar a migração de `produtos_cache` (chave `codigo` com `check`, faixas nutricionais, `obtido_em`), com Row Level Security ativada, sem políticas e com `revoke all` de `anon` e `authenticated`, no estilo das migrações existentes
- [ ] 4.2 Implementar `supabase/functions/consultar-codigo`: validação do corpo e do código (tamanhos 8, 12, 13 e 14, dígito verificador), método e CORS
- [ ] 4.3 Implementar a consulta ao Open Food Facts com `User-Agent` vindo de variável de ambiente, apenas os campos necessários e tempo limite de 5 s
- [ ] 4.4 Implementar a validação e a normalização da resposta externa (faixas, soma dos macronutrientes, nome e marca sem caracteres de controle) e os códigos de erro do contrato
- [ ] 4.5 Implementar o cache: leitura com validade de 30 dias, gravação somente de produtos válidos, cache em memória de 1 hora para códigos não encontrados e uso do dado antigo quando a consulta externa falhar
- [ ] 4.6 Implementar a proteção contra abuso: `ORIGENS_PERMITIDAS`, limite por origem de rede com `Retry-After` e teto de consultas externas por minuto
- [ ] 4.7 Definir `verify_jwt` e a forma de chamada com a chave publicável conforme o comportamento atual do Supabase e confirmar que o visitante sem login consegue consultar
- [ ] 4.8 Garantir que erros e logs não contenham a chave de serviço, o contato nem texto bruto do provedor

## 5. Aba "Código" no app

- [ ] 5.1 Adicionar a terceira aba "Código" em `drawSheet()` com campo numérico, botão "Buscar produto", dica de onde achar o número e região `aria-live="polite"`
- [ ] 5.2 Implementar a limpeza do texto colado, a validação de tamanho e dígito verificador no app e a mensagem "Código inválido. Confira o número"
- [ ] 5.3 Implementar a chamada à função com `AbortController` de 10 s, a validação e o escape da resposta e a tradução de cada código de erro em mensagem em português, incluindo "Sem conexão" e o modo `file://`
- [ ] 5.4 Levar o produto encontrado ao passo de quantidade existente, com porção do rótulo quando houver e gramas quando não, limitando o nome a 120 caracteres
- [ ] 5.5 Oferecer "Cadastrar este produto" para `nao_encontrado` e `dados_incompletos`, abrindo a aba "Novo alimento"
- [ ] 5.6 Adicionar os estilos da aba, com área de toque de 44 px, suporte a 320 px e `prefers-reduced-motion`

## 6. Leitura pela câmera

- [ ] 6.1 Exibir "Escanear com a câmera" somente com contexto seguro, `getUserMedia` e `BarcodeDetector` com `ean_13`
- [ ] 6.2 Abrir a câmera traseira por ação do usuário, detectar a cada 250 ms, ignorar leituras com dígito verificador inválido e, na primeira válida, parar a câmera, preencher o campo e consultar
- [ ] 6.3 Desligar a câmera (`track.stop()`) ao concluir, cancelar, trocar de aba, fechar a janela e quando a página ficar oculta
- [ ] 6.4 Tratar permissão negada e ausência de câmera com mensagem e manter a digitação
- [ ] 6.5 Confirmar no navegador que o vídeo por `srcObject` não gera violação de CSP e, se gerar, ajustar a diretiva no menor escopo possível

## 7. Atribuição, versão e documentação

- [ ] 7.1 Adicionar a atribuição da TACO e do Open Food Facts no card "Sobre o app" do Perfil
- [ ] 7.2 Atualizar `VERSAO` no `index.html` e no `sw.js` com o mesmo valor (`1.6.0`) e conferir a exibição no rodapé do Perfil
- [ ] 7.3 Atualizar o `README.md`: versão atual, "Novo na 1.6.0", correção do histórico (entrada da 1.5.0 e versão atual), publicação da função, variáveis de ambiente (`ORIGENS_PERMITIDAS`, contato do `User-Agent`), atribuições, limites e estrutura do projeto (`data/`, `scripts/`, `supabase/functions/`)
- [ ] 7.4 Revisar a ortografia em português do Brasil de todos os textos novos da interface

## 8. Verificação

- [ ] 8.1 Buscar alimentos do catálogo com e sem acento, conferir a deduplicação, o limite de 50 e o cálculo de calorias por medida e por gramas
- [ ] 8.2 Testar a consulta com produtos reais conhecidos, um código inexistente, um código com dígito verificador errado e um produto sem calorias
- [ ] 8.3 Testar falhas: sem internet, função fora do ar, tempo esgotado e `file://`, confirmando que a busca por nome e o cadastro manual continuam funcionando
- [ ] 8.4 Testar a câmera no Chrome Android (leitura, cancelar, trocar de aba e segundo plano) e confirmar que no iPhone o botão de câmera não aparece e a digitação funciona
- [ ] 8.5 Confirmar que o acesso direto a `produtos_cache` com a chave publicável é negado e rodar os verificadores de segurança do Supabase
- [ ] 8.6 Abrir o app em `http://localhost:8000`, confirmar que o console não mostra erros ou violações de CSP, que a `VERSAO` do `index.html` é igual à do `sw.js`, que o hash da CSP confere e que o cache `emagrecai-1.6.0` foi criado
- [ ] 8.7 Gerar o resumo das alterações em português do Brasil para a descrição do commit
