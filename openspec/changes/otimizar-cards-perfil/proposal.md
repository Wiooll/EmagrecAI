## Why

A aba Perfil empilha nove cards longos (Conta, formulário de metas, Lembretes, Tema, Assistente de IA, Dados, Instalar, Sobre o app) em uma única rolagem. Os cards de uso raro (Lembretes, IA, Sobre) ocupam várias telas e empurram para baixo o que o usuário mais usa (metas e dados). Falta uma ordem clara e há textos e estilos repetidos entre os cards.

## What Changes

- Reordenar os cards por frequência de uso e afinidade: Conta, Metas e perfil, Preferências (Lembretes e Tema), Assistente de IA, Dados, Instalar app, Sobre o app.
- Tornar recolhíveis os cards longos e de uso ocasional (Lembretes, Assistente de IA, Sobre o app), usando `<details>`/`<summary>` nativos, com título e uma linha de resumo do estado (ex.: "Ativado", "Desativado", "3 lembretes").
- Manter abertos por padrão Conta, Metas e perfil e Dados. O estado aberto/fechado dura só enquanto o app está aberto (sem gravar nos dados do usuário).
- Reduzir a repetição de HTML e estilos inline dos cards do Perfil com uma função auxiliar comum e classes CSS (por exemplo, no lugar de `style="margin:0 0 12px"` repetido nas notas).
- Preservar o foco e o que o usuário digitou nos campos ao redesenhar o Perfil (`softRender`, `iaDesenhar`), sem fechar um card que o usuário abriu.
- Nenhuma alteração em dados, sincronização, CSV, funcionalidades ou textos de regra de negócio.

## Capabilities

### New Capabilities
- `profile-cards-layout`: ordem, agrupamento, recolhimento e aparência padronizada dos cards da tela de Perfil.

### Modified Capabilities
<!-- Nenhum requisito de outras capacidades muda; Lembretes, Tema, IA, Dados, Instalar e Sobre mantêm o comportamento. -->

## Impact

- `index.html`: função `profile()`, `lembCard`, `iaCard`, `installCard`, card Sobre, CSS dos cards e, por consequência, o hash SHA-256 da CSP do script inline.
- `sw.js`: constante `VERSAO` (mesmo valor do `index.html`).
- `README.md`: versão, "Novo na x.y.z" e histórico.
- Sem novas dependências, sem mudanças no Supabase nem no formato de dados.
