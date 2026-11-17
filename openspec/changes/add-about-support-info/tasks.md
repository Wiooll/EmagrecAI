## 1. Constantes e estilos

- [ ] 1.1 Em `index.html`, adicionar as constantes `APP_VERSION="1.1.0"`, `GITHUB_URL="https://github.com/Wiooll"` e `PIX_KEY="ae34b296-d003-4444-9d52-49e9399f45ab"` junto às demais constantes do script
- [ ] 1.2 Adicionar ao `<style>` as regras do card (`.about`, link do GitHub e campo `readonly` da chave com fonte menor e rolagem horizontal), usando as variáveis de tema existentes (`--ln`, `--mut`, `--g`)

## 2. Tela de Perfil

- [ ] 2.1 Em `profile()`, adicionar após o card "Dados" o card "Sobre o app" com nome, `Versão ${APP_VERSION}` e o texto de convite à colaboração (pt-BR, com acentuação correta)
- [ ] 2.2 Adicionar o link do GitHub com `target="_blank"` e `rel="noopener noreferrer"`, usando `esc()` na interpolação
- [ ] 2.3 Adicionar o campo `<input readonly>` com a chave Pix (com `aria-label`, seleção total ao focar) e o botão "Copiar chave Pix" com `data-a="copypix"`

## 3. Cópia da chave Pix

- [ ] 3.1 No listener de cliques, tratar `copypix` com `navigator.clipboard.writeText(PIX_KEY)`
- [ ] 3.2 Implementar a alternativa com `select()` + `document.execCommand("copy")` dentro de `try/catch` quando a API não existir ou a promessa for rejeitada
- [ ] 3.3 Trocar o texto do botão para "Chave copiada!" por cerca de 2 segundos (ou "Copie manualmente" em caso de falha) sem chamar `render()`

## 4. Documentação e versão

- [ ] 4.1 Atualizar o `README.md`: versão atual `1.1.0`, item de funcionalidades sobre "Sobre o app" e entrada `1.1.0` no histórico de versões
- [ ] 4.2 Conferir que a versão do `README.md` é igual à exibida no card e que não restou menção a `1.0.0` como versão atual

## 5. Validação

- [ ] 5.1 Abrir o app (por `http://localhost` e por `file://`), ir ao Perfil e conferir o card, a versão `1.1.0` e a ortografia dos textos
- [ ] 5.2 Clicar no link do GitHub e confirmar que abre `https://github.com/Wiooll` em nova aba
- [ ] 5.3 Clicar em "Copiar chave Pix", colar em outro campo e conferir que o valor é exatamente `ae34b296-d003-4444-9d52-49e9399f45ab`; testar o retorno visual e a alternativa quando a cópia falha
- [ ] 5.4 Conferir o layout em tela estreita (320 px) e nos temas claro e escuro, sem quebra do card
- [ ] 5.5 Confirmar que os dados existentes no `localStorage` (`pratocheio`) continuam carregando e que "Apagar todos os dados" mantém o card intacto
- [ ] 5.6 Escrever o resumo das alterações em pt-br para a descrição do commit
