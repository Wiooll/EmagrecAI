## Context

O CSS usa variáveis (`--bg`, `--sf`, `--ink`, `--mut`, `--ln`, `--g`, `--gd`). O tema escuro já existe em dois pontos: `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){...}}` e `:root[data-theme="dark"]{...}`. Nenhum código define `data-theme`. O `index.html` tem CSP com hash do script inline, e o app já guarda preferências locais com `lsGet`/`lsSet` (por exemplo, lembretes em `pratocheio:lembretes`).

## Goals / Non-Goals

**Goals:**
- Permitir escolher Automático, Claro ou Escuro no Perfil.
- Lembrar a escolha neste aparelho e aplicá-la sem piscar o tema errado.
- Manter o tema Automático idêntico ao comportamento atual.

**Non-Goals:**
- Sincronizar o tema com a conta (Supabase).
- Criar novas paletas ou mexer no design além de corrigir contraste.

## Decisions

1. **Atributo `data-theme` no `<html>`.** Reaproveita as regras de CSS existentes. "Automático" remove o atributo; "Claro" define `light`; "Escuro" define `dark`. Alternativa descartada: classes novas, que duplicariam o CSS.
2. **Armazenamento em `localStorage`, chave `pratocheio:tema`** (mesmo prefixo das outras chaves), com valores `auto`, `light` e `dark`. Qualquer outro valor lido é tratado como `auto`. Não vai ao Supabase nem é apagado como dado da conta, mas entra em "Apagar dados" junto com as preferências locais se o app já apagar as demais.
3. **Aplicação antes da primeira pintura.** Um pequeno script inline no `<head>` lê a chave e define `data-theme`, evitando o flash do tema errado. Ele ganha seu próprio hash no `script-src` da CSP. Se o script principal já roda antes da pintura (fim do `body` sem `defer`), a aplicação pode ficar nele e dispensar o segundo hash; confirmar na implementação.
4. **`meta theme-color`.** As duas metas atuais usam `media`. Ao escolher Claro ou Escuro, o app define o `content` das duas metas com a cor do tema escolhido; em Automático, restaura os valores originais.
5. **Interface.** Card "Aparência" no Perfil com três botões de rádio (grupo com `role="radiogroup"`/`fieldset`), alvo de toque de 44 px (`--tap`), foco visível e texto em português do Brasil. A troca é imediata, sem renderizar o app inteiro.

## Risks / Trade-offs

- **Hash da CSP desatualizado deixa o app em branco** → recalcular o hash após qualquer mudança no script inline e conferir o console.
- **`localStorage` indisponível (modo privado)** → `lsGet`/`lsSet` já tratam erros; o tema volta a Automático.
- **Contraste insuficiente em algum componente no tema forçado** → revisar todas as abas nos dois temas, em 320 px.
- **Cache do service worker** → mudar `VERSAO` no `sw.js` para os aparelhos receberem o aviso de nova versão.
