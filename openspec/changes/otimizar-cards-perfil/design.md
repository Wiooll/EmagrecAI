## Context

`profile()` monta todos os cards em uma string HTML. Alguns cards são desenhados separadamente: `iaDesenhar()` troca `#ia` por `outerHTML`, e `softRender()` redesenha o Perfil quando o evento de instalação muda. Os cards repetem `<div class="card"><h2>…</h2>` e estilos inline (`margin:0 0 12px`). O app é um único `index.html` com script inline protegido por hash na CSP.

## Goals / Non-Goals

**Goals:**
- Ordem previsível e menos rolagem no Perfil.
- Cards longos recolhíveis, com resumo do estado no cabeçalho.
- Menos HTML e CSS inline duplicado.

**Non-Goals:**
- Mudar regras de metas, lembretes, IA, tema ou dados.
- Persistir o estado aberto/fechado (localStorage ou Supabase).
- Novas bibliotecas ou framework.

## Decisions

1. **`<details class="card fold">` com `<summary>` nativo** para Lembretes, IA e Sobre. Alternativa: botão com `aria-expanded` e JS próprio. O nativo dá teclado, leitor de tela e menos código, e funciona offline sem script extra.
2. **Auxiliar `cardPerfil(id, titulo, corpo, {recolhivel, aberto, resumo})`** que gera a casca. Os cards existentes passam a usá-la. Alternativa: manter cada card com seu HTML. Foi descartada porque mantém a duplicação.
3. **Estado aberto/fechado em variável de memória** (`perfilAbertos`, um `Set` de ids), atualizada pelo evento `toggle` do `<details>`. Os redesenhos (`softRender`, `iaDesenhar`) reaplicam o atributo `open` a partir dele. Assim um card aberto pelo usuário não fecha ao redesenhar. Ao recarregar o app, volta ao padrão.
4. **Padrão de abertura:** Conta, Metas e perfil e Dados abertos. Lembretes, IA e Sobre fechados. Instalar app continua oculto quando não se aplica.
5. **Resumo no `<summary>`:** Lembretes ("Água ativada" ou "Água desativada"), IA ("Ativado: <provedor>" ou "Desativado"), Sobre (versão). Texto curto, em pt-BR com acentuação correta.
6. **CSS:** classes `.fold`, `.fold>summary`, `.fold .res` e `.card .note.sp` para substituir estilos inline repetidos, usando as variáveis de tema existentes (funciona nos temas claro e escuro). Alvo de toque do `summary` com no mínimo 44px.
7. **CSP:** o script inline muda, então o hash `script-src` deve ser recalculado (passo da regra de publicação). Estilos novos entram na tag `<style>` já existente.

## Risks / Trade-offs

- [`outerHTML` de `#ia` perde o estado `open`] → `iaCard` lê `perfilAbertos` ao gerar o HTML.
- [Campos digitados se perdem em redesenho] → não redesenhar o formulário de metas; só os cards que já são redesenhados hoje.
- [Quem procura Lembretes ou IA pode não notar que está recolhido] → `summary` com seta e resumo do estado sempre visíveis.
- [Hash da CSP desatualizado quebra o app] → conferir no console em `http://localhost:8000` antes de finalizar.
