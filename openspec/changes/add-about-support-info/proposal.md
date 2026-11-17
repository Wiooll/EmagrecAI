## Why

O app não tem nenhum lugar com informações sobre o projeto. Quem usa não vê a versão, não sabe quem desenvolve e não tem como contribuir. O autor quer divulgar o perfil do GitHub e uma chave Pix para receber colaborações com o desenvolvimento.

## What Changes

- Novo card "Sobre o app" no final da tela de Perfil, com:
  - a versão do app (`1.2.0`) segue visível no rodapé do Perfil, logo abaixo do card (constante `VERSAO` já existente);
  - link para o GitHub do autor (`https://github.com/Wiooll`), aberto em nova aba;
  - chave Pix (`ae34b296-d003-4444-9d52-49e9399f45ab`) com botão "Copiar chave Pix" e confirmação visual de que foi copiada.
- Texto curto convidando a colaborar com o desenvolvimento, por código no GitHub ou por apoio via Pix.
- O `README.md` passa a documentar a seção "Sobre o app", a versão `1.2.0` e o histórico de versões.
- Os valores (versão, URL do GitHub e chave Pix) ficam em constantes únicas no `index.html`, para facilitar a troca futura.

Não há mudanças **BREAKING**: o fluxo e os dados salvos no `localStorage` não mudam.

## Capabilities

### New Capabilities
- `about-support-info`: exibir as informações do app (versão, link do GitHub) e os dados para colaboração (chave Pix com cópia para a área de transferência).

### Modified Capabilities
<!-- Nenhuma: ainda não existem specs em openspec/specs/. -->

## Impact

- **Código**: `index.html` (função `profile()`, novo handler de cópia no listener de cliques e pequenos estilos).
- **Dependências**: nenhuma nova. A cópia usa `navigator.clipboard`, com alternativa para quando a API não estiver disponível (por exemplo, abrindo por `file://` em alguns navegadores).
- **Segurança e privacidade**: a chave Pix aleatória e o perfil do GitHub são dados públicos por escolha do autor. O app não envia nada a servidores. O link externo usa `rel="noopener noreferrer"`.
- **Documentação**: `README.md` (funcionalidades, versão e histórico).
- **Versão**: `1.1.0` para `1.2.0`. A `1.1.0` já foi usada pelo commit do Supabase e do login Google.
- **Fora de escopo**: QR Code Pix, pagamentos dentro do app, Pix copia e cola com valor definido e página separada de "Sobre".
