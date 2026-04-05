
# 📚 Comics Inventory API

API em **PHP puro** para cadastro de **HQs e Livros**, protegida com **JWT (Bearer)**, organizada em camadas limpas (Controller → Service → Repository).

Inclui também um **script Python (`import_hqs.py`)** para importar os dados de um arquivo Excel (`Controle de Quadrinhos.xlsx`) diretamente para a API.

---

## 🚀 Funcionalidades

* CRUD completo (`/items`) para HQs/Livros.
* Autenticação via JWT com expiração de **30 minutos**.
* Endpoint para emissão de token: `POST /auth/token`.
* Importação automática de planilha Excel via script Python.
* Organização limpa em camadas para fácil manutenção.

---

## ⚙️ Requisitos

### Backend (API PHP)

* PHP 8.1+
* Composer
* MySQL/MariaDB
* Extensões PDO + JSON

### Script Python

* Python 3.9+
* Virtualenv recomendado

Dependências Python:

```bash
pip install -r requirements.txt
```

Arquivo `requirements.txt`:

```
pandas
requests
openpyxl
```

---

## 🔑 Configuração

1. Clone o repositório:

   ```bash
   git clone https://github.com/seuuser/comicsinventory-api.git
   cd comicsinventory-api
   ```

2. Crie o arquivo `.env` na raiz:

   ```env
   DB_HOST=127.0.0.1
   DB_NAME=hqs
   DB_USER=root
   DB_PASS=secret

   API_KEY=SUA_API_KEY_FORTE
   JWT_SECRET=troque-esta-chave-secreta
   JWT_ISSUER=comicsinventory-api
   JWT_TTL=1800
   ```

3. Crie a tabela no MySQL:

   ```sql
   CREATE TABLE items (
       id INT AUTO_INCREMENT PRIMARY KEY,
       tipo ENUM('hq','livro') DEFAULT 'hq',
       nome VARCHAR(255) NOT NULL,
       volume VARCHAR(50) NULL,
       editora VARCHAR(255) NULL,
       valor DECIMAL(10,2) NULL,
       autor VARCHAR(255) NULL,
       isbn VARCHAR(50) NULL,
       idioma VARCHAR(50) NULL,
       status ENUM('na_estante','vendido','desejado') NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

4. Suba o servidor embutido do PHP:

   ```bash
   php -S localhost:8000 -t public
   ```

---

## 🔐 Autenticação

Obter token:

```bash
curl -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"api_key":"SUA_API_KEY_FORTE"}'
```

Resposta:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 1800
}
```

Use o token em todas as requisições protegidas:

```bash
curl http://localhost:8000/items -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📦 Script Python de Importação

Arquivo: `import_hqs.py`

### Uso

```bash
python import_hqs.py \
  --file "Controle de Quadrinhos.xlsx" \
  --api-base "http://localhost:8000" \
  --api-key "SUA_API_KEY_FORTE" \
  --tipo hq
```

### Opções

* `--file`: caminho do arquivo Excel.
* `--api-base`: base da API (default: `http://localhost:8000`).
* `--api-key`: chave para emissão do token.
* `--tipo`: tipo do item (`hq` ou `livro`).
* `--dry-run`: apenas imprime os dados, não envia.

### Exemplo (teste sem envio)

```bash
python import_hqs.py \
  --file "Controle de Quadrinhos.xlsx" \
  --api-base "http://localhost:8000" \
  --api-key "SUA_API_KEY" \
  --tipo hq \
  --dry-run
```

---

## 📊 Resumo

* **API PHP**: CRUD + JWT
* **Script Python**: importa planilha para API
* **JWT**: expira em 30 min
* **Segurança**: dados sensíveis no `.env`