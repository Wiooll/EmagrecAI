## Why

O app já tem as cores dos dois temas no CSS (`:root` claro e `prefers-color-scheme: dark`, além de `data-theme="dark"`), mas a pessoa só consegue mudar o tema alterando a configuração do aparelho. Quem usa o app de dia no modo escuro do celular, ou à noite no modo claro, não tem como escolher dentro do app.

## What Changes

- Novo seletor "Tema" no Perfil com três opções: **Automático** (segue o aparelho, comportamento atual), **Claro** e **Escuro**.
- A escolha é salva no aparelho (`localStorage`) e aplicada ao abrir o app, definindo `data-theme` no `<html>`.
- Passa a existir `data-theme="light"` explícito para forçar o tema claro quando o aparelho está no modo escuro (o CSS já prevê `:root:not([data-theme="light"])`).
- A cor da barra do navegador (`meta theme-color`) acompanha o tema escolhido.
- Versão 1.13.0 no `index.html` e no `sw.js`, com `README.md` atualizado.
- Sem alterações no Supabase: a preferência fica só neste aparelho, como os lembretes.

## Capabilities

### New Capabilities
- `theme-switch`: escolha entre tema automático, claro e escuro no Perfil, com persistência local e aplicação ao abrir o app.

### Modified Capabilities
<!-- Nenhuma: nenhum requisito de spec existente muda. -->

## Impact

- `index.html`: CSS (seletor do tema, ajustes de contraste), script inline (leitura, aplicação e salvamento da preferência, card no Perfil, `meta theme-color`), constante `VERSAO`, hash SHA-256 do `script-src` da CSP.
- `sw.js`: constante `VERSAO`.
- `README.md`: versão atual, "Novo na 1.13.0", histórico de versões.
- Sem novas dependências, sem mudanças de banco.
