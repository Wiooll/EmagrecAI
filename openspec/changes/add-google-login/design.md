## Context

O app é um único arquivo HTML (cerca de 213 linhas), sem build e sem backend. O estado `S` é carregado por `load()` e gravado por `save()` na chave fixa `pratocheio` do `localStorage`. Toda a interface é renderizada por `render()` a partir de strings, e os eventos usam delegação em `document` com `data-a`. A tela de Perfil (`profile()`) já tem o card "Dados", com o botão "Apagar todos os dados".

Não existe `README.md`, número de versão nem noção de usuário.

## Goals / Non-Goals

**Goals:**
- Permitir entrar e sair com a conta Google, de forma opcional.
- Separar os dados locais por conta, sem perder os dados de quem já usa o app.
- Manter o arquivo único, sem build e sem backend.
- Tratar o token e os dados do Google como entrada não confiável.

**Non-Goals:**
- Sincronização entre dispositivos ou armazenamento na nuvem.
- Backend, verificação de assinatura do token no servidor ou controle de acesso.
- Outros provedores de login (Apple, e-mail e senha).
- Criptografia dos dados locais.

## Decisions

### 1. Google Identity Services (botão "Sign in with Google") em vez de OAuth por redirecionamento
O script `https://accounts.google.com/gsi/client` entrega um ID token (JWT) em um callback, sem backend nem troca de código. A biblioteca antiga `gapi.auth2` foi descontinuada. O fluxo OAuth com redirecionamento (code + PKCE) exigiria um endpoint para trocar o código e guardar segredos, o que o app não tem.
O script é carregado de forma assíncrona (`async defer`) apenas na tela de Perfil, depois do primeiro `render()`, para não atrasar o carregamento do app.

### 2. Login é identidade local, não autorização
Sem backend, o token não pode ser verificado pela assinatura. O app decodifica o payload (base64url, `TextDecoder` para UTF-8) e valida: `aud` igual ao Client ID configurado, `iss` em `accounts.google.com` ou `https://accounts.google.com`, `exp` no futuro, e `sub` não vazio. Essas checagens evitam erros de configuração e tokens malformados. Elas não impedem que alguém forje uma sessão editando o `localStorage`, e isso é aceito porque os dados já são locais e legíveis por quem controla o navegador. Isso fica documentado no README.

Alternativa descartada: guardar e reenviar o token. Não há destino para ele, e salvá-lo só aumentaria a exposição.

### 3. Escopo dos dados por chave no `localStorage`
- Visitante: `pratocheio` (inalterada, garante compatibilidade).
- Conta Google: `pratocheio:<sub>`.
- Sessão: `pratocheio:sessao` com `{sub, nome, email, foto}`.

`load()` e `save()` passam a usar uma função `storageKey()` que devolve a chave do contexto ativo. Ao entrar ou sair, o app chama `S=load()` e `render()`. Alternativa descartada: um único objeto com todas as contas dentro de `pratocheio`, que exigiria migrar o formato atual e arriscaria os dados existentes.

O `sub` do Google é estável e não muda com o e-mail, por isso é usado na chave em vez do e-mail.

### 4. Importação dos dados do visitante
No login, se a chave `pratocheio:<sub>` não existe e `pratocheio` contém dados, o app mostra um `confirm()` ("Importar os dados deste navegador para sua conta?"). Se confirmado, copia o JSON atual para a chave da conta. Os dados do visitante **não são apagados**, e o usuário pode voltar ao modo visitante a qualquer momento. O `confirm()` já é o padrão usado no "Apagar todos os dados".

### 5. Sessão persistida só com o perfil mínimo
Ao abrir o app, se existir `pratocheio:sessao` válida (campos com tipo e tamanho esperados), o usuário continua logado sem chamar o Google. Como não há token guardado, não há expiração a tratar. "Sair" apaga a sessão, chama `google.accounts.id.disableAutoSelect()` quando a biblioteca está carregada, e volta ao modo visitante. Os dados da conta permanecem no navegador.

### 6. Dados do Google na interface e na chave
- Nome e e-mail passam por `esc()` antes de entrar no HTML, como o resto do app.
- A foto só é usada se for `https:` e o host terminar em `googleusercontent.com`. Caso contrário, mostra as iniciais do nome.
- O `sub` só é aceito se casar com `/^\d{1,40}$/`, para não montar chaves de `localStorage` a partir de texto arbitrário.

### 7. Client ID em uma constante
`const GOOGLE_CLIENT_ID=""` no topo do script. Um Client ID do Google é público por natureza, não é segredo. Se estiver vazio ou a biblioteca falhar ao carregar (sem internet, bloqueador), o botão não aparece e o Perfil mostra "Login com Google indisponível". O app segue funcionando em modo visitante.

### 8. Versão e README
`const VERSAO="1.1.0"` exibida no rodapé do Perfil. Como nunca houve versão, assume-se que o estado atual é 1.0.0 e esta mudança é uma funcionalidade nova (minor). O `README.md` é criado com descrição, como executar (`http://localhost`), como criar o Client ID, escopo de segurança e histórico de versões.

### 9. Interface
O botão usa `google.accounts.id.renderButton` (visual oficial, com o idioma `pt-BR`), em um novo card "Conta" no topo da tela de Perfil. Logado, o card mostra foto (ou iniciais), nome, e-mail e o botão "Sair" (`.btn.sec`). Os textos e estilos seguem as variáveis CSS e o tema escuro já existentes. Textos novos em pt-BR com acentuação revisada.

## Risks / Trade-offs

- **Google não aceita `file://`** → Documentar no README a execução por `http://localhost` (por exemplo `python -m http.server`) ou hospedagem, e cadastrar as origens no Cloud Console. Em `file://`, o app mostra o aviso de login indisponível em vez de falhar.
- **Sessão forjável via `localStorage`** → Aceito, pois não há backend nem dado remoto a proteger. Documentado como "identidade local".
- **Dados continuam apenas no navegador** → Limpar os dados do navegador apaga tudo, inclusive de contas logadas. O texto "Tudo fica salvo apenas neste navegador" permanece, ajustado para citar a conta.
- **Script de terceiro (Google)** → Carregado de domínio oficial, só sob demanda. Não é possível usar SRI porque o Google serve o arquivo dinamicamente.
- **Várias contas no mesmo navegador** → Cada `sub` tem sua chave, então não há mistura. Trocar de conta exige "Sair" e novo login.
- **Compatibilidade dos dados** → A chave do visitante não muda e nenhum dado é migrado ou apagado automaticamente.

## Migration Plan

1. Publicar o HTML com a nova versão. Quem não faz login não percebe diferença.
2. Quem fizer login pode importar os dados atuais para a conta.
3. Rollback: voltar ao HTML anterior. Ele só lê `pratocheio`, que nunca é alterada pelo login, então nada se perde. As chaves `pratocheio:*` ficam ignoradas.

## Open Questions

- **Client ID**: o usuário precisa criar o Client ID no Google Cloud Console e informar a(s) origem(ns) em que o app será aberto (localhost, domínio da Vercel, etc.). A implementação deixa a constante vazia até receber esse valor.
- **Importação**: confirmar se o `confirm()` na primeira entrada é o comportamento desejado, ou se prefere importar sempre, ou nunca.
