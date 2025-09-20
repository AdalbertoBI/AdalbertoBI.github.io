# 🚀 WhatIntegra - Instruções de Uso

## 📋 Como Iniciar os Servidores

### Opção 1: Arquivo Batch (Mais Fácil) ✨
```bash
# No diretório raiz do projeto
.\iniciar-servidores.bat

# Ou no diretório local-auth-server
.\iniciar.bat
```

### Opção 2: Comando NPM 📦
```bash
# Navegue para o diretório local-auth-server
cd local-auth-server

# Execute um dos comandos:
npx concurrently "node server.js" "node whatsapp-server.js"
# ou
npm run dev  # Versão com cores
```

### Opção 3: Servidores Separados 🔀
```bash
# Terminal 1 - Servidor de Autenticação
cd local-auth-server
npm run auth
# ou: node server.js

# Terminal 2 - Servidor WhatsApp
cd local-auth-server
npm run whatsapp  
# ou: node whatsapp-server.js
```

## 🌐 URLs de Acesso

- **🔐 Servidor de Autenticação**: http://127.0.0.1:8765
- **💬 Servidor WhatsApp**: http://127.0.0.1:3001  
**🌐 Repositório:** https://github.com/AdalbertoBI/AdalbertoBI.whatintegra
**🔧 Página de Configuração:** https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/tree/main/site/setup.html

## ⚙️ Scripts Disponíveis

- `npm run auth` - Apenas servidor de autenticação
- `npm run whatsapp` - Apenas servidor WhatsApp
- `npm run dev` - Ambos com cores e nomes
- `npm run create:user` - Criar novo usuário

## 🛠️ Resolução de Problemas

### Problema de Mixed Content (HTTPS/HTTP)
1. Acesse: https://github.com/AdalbertoBI/AdalbertoBI.whatintegra/tree/main/site/setup.html
2. Autorize ambos os servidores locais
3. Volte para o site principal

### Porta em Uso
- Servidor Auth usa porta **8765**
- Servidor WhatsApp usa porta **3001**
- Se houver conflito, pare os processos: `Stop-Process -Name node -Force`

### Dependências
Se der erro de módulos não encontrados:
```bash
cd local-auth-server
npm install
```

## 🎯 Instalação Portátil (Recomendado)

Para uma instalação completamente portátil que não depende do Node.js do sistema:

### 🚀 Setup Rápido
```bash
# Execute um dos comandos:
.\setup-portatil.bat
# ou
.\setup-portable.ps1
```

### 🏃 Iniciar Portátil
```bash
# Execute um dos comandos:
.\iniciar-portatil.bat
# ou
.\start-portable.ps1
```

### 🧹 Limpeza e Reinstalação
```bash
# Limpar cache e reinstalar dependências:
.\clean-portable.ps1

# Ou limpar apenas o cache:
.\clean-portable.ps1 -CacheOnly

# Ou limpar apenas node_modules:
.\clean-portable.ps1 -NodeModulesOnly
```

### 🎮 Opções Avançadas
```bash
# Modo desenvolvimento:
.\start-portable.ps1 -Dev

# Apenas servidor de autenticação:
.\start-portable.ps1 -Auth

# Apenas servidor WhatsApp:
.\start-portable.ps1 -WhatsApp

# Criar usuário:
.\start-portable.ps1 -CreateUser
```

### ✅ Vantagens da Instalação Portátil
- ✅ Não requer Node.js instalado no sistema
- ✅ Versão específica garantida (20.17.0)
- ✅ Dependências isoladas no projeto
- ✅ Fácil distribuição e backup
- ✅ Evita conflitos com outras versões do Node.js
- ✅ Cache NPM local para instalações mais rápidas

## 📱 Como Usar

1. **Inicie os servidores** (qualquer método acima)
2. **Acesse**: https://github.com/AdalbertoBI/AdalbertoBI.whatintegra
3. **Faça login** com suas credenciais
4. **Escaneie o QR Code** com seu WhatsApp
5. **Use normalmente** como WhatsApp Web

## 🔒 Segurança

- Servidores rodam apenas localmente (127.0.0.1)
- Dados do WhatsApp ficam na sua máquina
- Acesso protegido por autenticação JWT
- Certificados SSL auto-assinados incluídos

## 📝 Notas

- Mantenha a janela do terminal aberta enquanto usa
- Para parar: pressione `Ctrl+C`
- QR Code é gerado automaticamente na primeira execução
- Sessão do WhatsApp fica salva localmente