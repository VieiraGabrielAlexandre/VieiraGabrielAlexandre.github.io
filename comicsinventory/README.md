# Comics Inventory – Frontend (HTML/CSS/JS)

Frontend estático para conversar com a API PHP (JWT + CRUD) de HQs/Livros.

## Como usar

1. Ajuste a URL da API:
    - Copie `assets/js/config.example.js` para `assets/js/config.js`
    - Edite `API_BASE` (ex.: `http://localhost:8000` ou `http://localhost:8000/comicsinventory/api`)

2. Abra `index.html` no navegador (local ou hospedado em qualquer serviço estático).

3. Clique em **⚙️ Configurar**:
    - Confirme a `API Base`
    - Informe sua **API Key** (usada para obter o token em `POST /auth/token`)

4. Clique em **🔑 Obter Token** para autenticar.
5. Use a UI para listar/criar/editar/excluir itens, com paginação e filtros.

## Observações

- Como o frontend roda em outro domínio/porta, a API precisa permitir **CORS**:
  ```php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: Authorization, Content-Type');
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
