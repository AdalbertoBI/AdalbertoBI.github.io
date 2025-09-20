# Servidor local de autenticação

Valida usuário e senha a partir de um arquivo local `data/users.json`. Fornece endpoints:

- `POST /api/login` → body `{ username, password }` → `{ token }`
- `GET /api/session` → header `Authorization: Bearer <token>` → `{ ok, user }`

Porta padrão: `8765`.

## Como rodar (Windows PowerShell)

```powershell
cd "c:\Users\PCRW\Desktop\WhatIntegra\local-auth-server"
npm install
node .\create-user.js meuUsuario minhaSenha
npm start
```

Depois abra a página publicada no GitHub Pages para fazer login.

## Notas

- Os usuários ficam em `data/users.json` (criado automaticamente).
- A chave JWT fica em `data/.jwt_secret` e é gerada automaticamente.
- Para trocar a porta: defina a variável de ambiente `PORT` antes de iniciar (`$env:PORT=9000; npm start`) e ajuste `API_URL` no front-end se mudar a porta.