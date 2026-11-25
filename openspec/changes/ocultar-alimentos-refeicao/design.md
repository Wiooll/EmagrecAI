## Context

`diary()` em `index.html` monta um cartão por refeição (`MEALS`) com o cabeçalho (`.meal-h`: nome, kcal e botão "+") e a lista de alimentos (`.ent`). Todo o app é renderizado por template string e os cliques são tratados por `data-a`. Preferências locais, como os lembretes, usam `lsGet`/`lsSet` (`localStorage`), sem Supabase.

## Goals / Non-Goals

**Goals:**
- Recolher e expandir a lista de alimentos de cada refeição com um toque.
- Lembrar a escolha após fechar o app.

**Non-Goals:**
- Recolher por dia ou sincronizar entre aparelhos.
- Alterar totais, dados registrados ou o banco.

## Decisions

- **Botão por refeição, no cabeçalho, ao lado do "+".** Um botão com seta (▾ visível, ▸ oculto), `aria-expanded` e `aria-label` "Ocultar alimentos de <refeição>" / "Mostrar alimentos de <refeição>". Alternativa descartada: um único botão global, pois o usuário quer recolher só algumas refeições.
- **Estado em `localStorage`, chave `emagrecai-refeicoes-ocultas`, com JSON de ids de refeição ocultos** (ex.: `["almoco"]`). Segue o padrão dos lembretes e não gera tráfego no Supabase. Valor corrompido ou ids desconhecidos são ignorados e a lista aparece visível.
- **Ocultar só a lista, mantendo o total de kcal no cabeçalho.** O usuário continua vendo quanto consumiu. Quando oculta e há itens, o cabeçalho pode mostrar a quantidade de itens (ex.: "3 itens") para indicar que há conteúdo escondido.
- **Botão exibido apenas quando a refeição tem alimentos.** Sem itens, só aparece a mensagem "Nada registrado", então não há o que ocultar.
- **Ao adicionar um alimento a uma refeição oculta, ela é reexibida**, para o usuário ver o que acabou de registrar.
- **Sem CSS novo complexo:** reutilizar a classe `.del`/`.rnd` existente quando possível, mantendo o visual atual.

## Risks / Trade-offs

- [Usuário esquece que ocultou e acha que perdeu dados] → o cabeçalho mantém kcal e mostra "N itens".
- [Mudança no script inline invalida a CSP] → recalcular o hash SHA-256 conforme o `README.md`.
- [Aparelhos antigos ficam com cache] → subir `VERSAO` em `index.html` e `sw.js` para 1.8.0.
