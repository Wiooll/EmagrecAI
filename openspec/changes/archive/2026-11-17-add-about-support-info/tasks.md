## 1. Constantes e estilos

- [x] 1.1 Em `index.html`, adicionar as constantes `GITHUB_URL="https://github.com/Wiooll"` e `PIX_KEY="ae34b296-d003-4444-9d52-49e9399f45ab"` junto às demais constantes do script e atualizar `VERSAO` para `"1.2.0"`
- [x] 1.2 Adicionar ao `<style>` as regras do card (`.about`, link do GitHub e campo `readonly` da chave com fonte menor e rolagem horizontal), usando as variáveis de tema existentes (`--ln`, `--mut`, `--g`)

## 2. Tela de Perfil

- [x] 2.1 Em `profile()`, adicionar após o card "Dados" (e antes do rodapé de versão) o card "Sobre o app" com o texto de convite à colaboração (pt-BR, com acentuação correta)
- [x] 2.2 Adicionar o link do GitHub com `target="_blank"` e `rel="noopener noreferrer"`, usando `esc()` na interpolação
- [x] 2.3 Adicionar o campo `<input readonly>` com a chave Pix (com `<label for>`, seleção total ao focar) e o botão "Copiar chave Pix" com `data-a="copypix"`

## 3. Cópia da chave Pix

- [x] 3.1 No listener de cliques, tratar `copypix` com `navigator.clipboard.writeText(PIX_KEY)`
- [x] 3.2 Implementar a alternativa com `select()` + `document.execCommand("copy")` dentro de `try/catch` quando a API não existir ou a promessa for rejeitada
- [x] 3.3 Trocar o texto do botão para "Chave copiada!" por cerca de 2 segundos (ou "Copie manualmente" em caso de falha) sem chamar `render()`

## 4. Documentação e versão

- [x] 4.1 Atualizar o `README.md`: versão atual `1.2.0`, item de funcionalidades sobre "Sobre o app" e entrada `1.2.0` no histórico de versões
- [x] 4.2 Conferir que a versão do `README.md` é igual à exibida no rodapé do Perfil e que não restou menção a `1.1.0` como versão atual

## 5. Validação

- [x] 5.1 Abrir o app (por `http://localhost` e por `file://`), ir ao Perfil e conferir o card, a versão `1.2.0` e a ortografia dos textos
- [x] 5.2 Conferir o link do GitHub: `href="https://github.com/Wiooll"`, `target="_blank"` e `rel="noopener noreferrer"`
- [x] 5.3 Conferir a cópia: valor enviado exatamente `ae34b296-d003-4444-9d52-49e9399f45ab`, retorno visual, restauração do texto, mensagem de falha e alternativa com `execCommand`
- [x] 5.4 Conferir o layout em tela estreita e nos temas claro e escuro, sem quebra do card
- [x] 5.5 Confirmar que o formato dos dados no `localStorage` não mudou (a mudança não toca em `load`/`save`/`resetAll`) e que o card é estático
- [x] 5.6 Escrever o resumo das alterações em pt-br para a descrição do commit
