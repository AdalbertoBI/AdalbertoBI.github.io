# WhatIntegra Pages

Site estático (GitHub Pages) com tela de login que valida credenciais em um servidor local na sua máquina, sem enviar usuário/senha para a nuvem.

- Front-end: HTML/CSS/JS simples em `index.html`.
- Auth server local: Node.js em `../local-auth-server` ouvindo `http://127.0.0.1:8765`.

Atenção: Em produção na internet, autenticar via servidor local não funciona para outros computadores; esta abordagem é apenas para o seu uso pessoal no mesmo computador, com a página aberta no seu navegador.

## Como usar

1. Inicie o servidor local (veja README em `../local-auth-server`).
2. Publique o site no repositório `AdalbertoBI.github.io` (script `publish-site.ps1` na raiz do workspace).
3. Abra `https://AdalbertoBI.github.io` e faça login.

## Segurança

- Usuários e senhas ficam no arquivo local `../local-auth-server/data/users.json` (hash com bcrypt).
- O token de sessão é um JWT assinado localmente, só é aceito pelo servidor local.