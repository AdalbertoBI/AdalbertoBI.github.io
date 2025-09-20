# 🚀 WhatIntegra

> **WhatsApp Web compartilhado com autenticação local segura**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://adalbertobi.github.io/AdalbertoBI.whatintegra)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/AdalbertoBI/AdalbertoBI.whatintegra/jekyll-gh-pages.yml?branch=main)](https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/actions)
[![License](https://img.shields.io/github/license/AdalbertoBI/AdalbertoBI.whatintegra)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/AdalbertoBI/AdalbertoBI.whatintegra)](https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/commits/main)

## 📋 Sobre o Projeto

**WhatIntegra** é uma solução inovadora que permite compartilhar uma sessão do WhatsApp Web entre múltiplos usuários com autenticação local segura. O sistema combina uma interface web moderna hospedada no GitHub Pages com servidores Node.js locais para autenticação e proxy do WhatsApp.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação Local Segura** - Credenciais nunca saem da sua máquina
- 👥 **Acesso Multiusuário** - Múltiplas pessoas podem usar a mesma sessão WhatsApp
- 🌐 **Interface Web Moderna** - Design responsivo e intuitivo
- 🔄 **Sincronização em Tempo Real** - WebSocket para atualizações instantâneas
- 📱 **QR Code Integration** - Conecte facilmente seu celular
- 🛡️ **Arquitetura Modular** - Código organizado e fácil manutenção

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    HTTPS    ┌──────────────────┐    HTTP     ┌─────────────────┐
│   GitHub Pages  │◄────────────►│  Servidor Auth   │◄────────────►│ Servidor WhatsApp│
│   (Interface)   │              │   (Port 8765)    │             │   (Port 3001)    │
└─────────────────┘              └──────────────────┘             └─────────────────┘
         ▲                                ▲                                ▲
         │                                │                                │
         ▼                                ▼                                ▼
┌─────────────────┐              ┌──────────────────┐             ┌─────────────────┐
│   Navegador     │              │    users.json    │             │  WhatsApp Web   │
│   (Cliente)     │              │  (Credenciais)   │             │   (Puppeteer)   │
└─────────────────┘              └──────────────────┘             └─────────────────┘
```

## 🚀 Como Usar

### 1. **Configuração dos Servidores Locais**

```bash
# Clone o repositório completo
git clone https://github.com/AdalbertoBI/AdalbertoBI.whatintegra.git
cd WhatIntegra

# Configure o servidor de autenticação
cd local-auth-server
npm install
npm start

# Em outro terminal, inicie o servidor WhatsApp
node whatsapp-server.js
```

### 2. **Acesso à Interface Web**

1. Acesse: https://adalbertobi.github.io/AdalbertoBI.whatintegra
2. Faça login com suas credenciais locais
3. Escaneie o QR code com seu celular
4. Comece a usar o WhatsApp Web compartilhado!

### 3. **Credenciais Padrão**

- **Usuário**: `admin`
- **Senha**: Use `create-user.js` para criar sua senha

> ⚠️ **Importante**: Execute `node create-user.js seuUsuario suaSenha` para criar suas credenciais

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5/CSS3** - Interface moderna e responsiva
- **Vanilla JavaScript** - Arquitetura modular ES6+
- **Socket.IO** - Comunicação em tempo real
- **GitHub Pages** - Hospedagem estática

### Backend  
- **Node.js** - Servidor de aplicação
- **Express.js** - Framework web
- **Socket.IO** - WebSocket server
- **Puppeteer** - Controle do WhatsApp Web
- **bcrypt** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT

## 📁 Estrutura do Projeto

```
WhatIntegra/
├── 📁 site/                    # Interface web (GitHub Pages)
│   ├── 📁 assets/
│   │   ├── config.js          # Configurações globais
│   │   ├── utils.js           # Funções utilitárias
│   │   ├── connectivity.js    # Testes de conectividade
│   │   ├── auth.js            # Autenticação
│   │   ├── ui.js              # Interface do usuário
│   │   ├── app-main.js        # Coordenação principal
│   │   └── styles.css         # Estilos CSS
│   ├── index.html             # Página principal
│   └── setup.html             # Página de configuração
├── 📁 local-auth-server/       # Servidor de autenticação
│   ├── server.js              # Servidor principal
│   ├── whatsapp-server.js     # Servidor WhatsApp
│   └── 📁 data/
│       └── users.json         # Base de usuários
└── 📁 .github/workflows/       # CI/CD
    └── jekyll-gh-pages.yml    # Deploy automático
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Portas dos servidores
AUTH_SERVER_PORT=8765
AUTH_SERVER_HTTPS_PORT=8766
WHATSAPP_SERVER_PORT=3001
WHATSAPP_SERVER_HTTPS_PORT=3002

# Configurações de segurança
JWT_SECRET=sua_chave_secreta_aqui
BCRYPT_ROUNDS=12
```

### Certificados SSL

O sistema inclui geração automática de certificados SSL para desenvolvimento local:

```bash
cd local-auth-server
npm run generate-certs
```

## 🛡️ Segurança

- ✅ **Credenciais Locais** - Senhas nunca são enviadas para serviços externos
- ✅ **Hash bcrypt** - Senhas criptografadas com salt
- ✅ **JWT Tokens** - Autenticação baseada em tokens assinados
- ✅ **HTTPS Local** - Certificados SSL auto-assinados
- ✅ **CORS Configurado** - Controle de origem de requisições
- ✅ **Validação de Entrada** - Sanitização de dados de entrada

## 📈 Status do Projeto

| Funcionalidade | Status | Descrição |
|---|---|---|
| 🔐 Autenticação | ✅ Completo | Sistema JWT com bcrypt |
| 👥 Multi-usuário | ✅ Completo | Múltiplos acessos simultâneos |
| 📱 QR Code | ✅ Completo | Conexão WhatsApp via QR |
| 💬 Mensagens | 🔄 Em desenvolvimento | Interface de chat |
| 📎 Arquivos | 📋 Planejado | Upload e download |
| 🔔 Notificações | 📋 Planejado | Push notifications |

## 🤝 Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork localmente  
3. **Crie** uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### 🐛 Reportar Bugs

Use o [GitHub Issues](https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/issues) para reportar bugs ou sugerir melhorias.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**AdalbertoBI**
- GitHub: [@AdalbertoBI](https://github.com/AdalbertoBI)
- LinkedIn: [Adalberto Barbosa](https://linkedin.com/in/adalbertobi)

## 🙏 Agradecimentos

- [WhatsApp Web.js](https://github.com/pedroslopez/whatsapp-web.js) pela inspiração
- [Puppeteer](https://github.com/puppeteer/puppeteer) pelo controle do navegador
- [GitHub Pages](https://pages.github.com/) pela hospedagem gratuita
- Comunidade open source pelo suporte constante

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

[🌟 Star](https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/stargazers) | [🐛 Issues](https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/issues) | [🔀 Fork](https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/fork) | [📈 Insights](https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/pulse)

</div>