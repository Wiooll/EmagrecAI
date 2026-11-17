---
inclusion: always
---

# Publicar uma nova versão do app

O app é um PWA com service worker. Os aparelhos só percebem que há uma versão nova quando o arquivo `sw.js` muda. Por isso, a versão fica em dois lugares, e os dois valores devem ser sempre iguais.

## Ao implementar qualquer mudança que vá para o usuário

1. Atualize a constante `VERSAO` no `index.html` (ela aparece no rodapé do Perfil).
2. Atualize a constante `VERSAO` no `sw.js` com o mesmo valor. Sem isso, os aparelhos que já instalaram o app não recebem o aviso "Nova versão disponível" e podem continuar com arquivos antigos em cache.
3. Se o script inline do `index.html` foi alterado, recalcule o hash SHA-256 e atualize o `script-src` da meta tag de CSP. O comando está na seção "Segurança e privacidade" do `README.md`. Sem isso, o app deixa de funcionar.
4. Se foram adicionados arquivos estáticos que o app precisa para abrir sem internet (por exemplo, novos ícones), inclua-os na lista `ARQUIVOS` do `sw.js`.
5. Atualize o `README.md`: versão atual, funcionalidade "Novo na x.y.z" e histórico de versões.
6. Gere o resumo das alterações para a descrição do commit, em português do Brasil.

## Conferência rápida antes de finalizar

- `VERSAO` do `index.html` é igual à `VERSAO` do `sw.js`.
- O hash da CSP corresponde ao script inline atual.
- Abrir o app em `http://localhost:8000` e confirmar que o console não mostra erros e que o cache `emagrecai-<versão>` foi criado.
