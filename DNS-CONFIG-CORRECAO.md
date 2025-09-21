# 🔧 Correção: Configuração DNS WhatIntegra

## 📋 Status Atual (20 de setembro de 2025)

### ✅ Já Configurado no Railway:
- **Domínio**: `api.whatintegra.com` ✅
- **Status**: Aguardando atualização de DNS
- **Porta**: 9080 (WhatsApp Server)

### 🔄 Pendente: Configuração DNS Completa

## 🛠️ Configuração DNS no seu Provedor

### Para o domínio `whatintegra.com`, adicione estes registros:

#### 1. Registro para API de Autenticação
```
Tipo: CNAME
Nome: api
Valor: adalbertobiwhatintegra-production.up.railway.app
TTL: 300
```

#### 2. Registro para WhatsApp
```
Tipo: CNAME
Nome: whatsapp
Valor: adalbertobiwhatintegra-production.up.railway.app
TTL: 300
```

#### 3. Registro para Site (opcional)
```
Tipo: CNAME
Nome: www
Valor: adalbertobi.github.io
TTL: 300
```

## 📋 Como Configurar no seu Provedor DNS

### Passo 1: Acesse o Painel do seu Provedor
- **GoDaddy**: DNS Management
- **Hostinger**: DNS Zone
- **Namecheap**: Advanced DNS
- **Registro.br**: Gerenciar Zona

### Passo 2: Adicionar Registros CNAME
1. Clique em "Adicionar Registro" ou "Add Record"
2. Selecione tipo **CNAME**
3. Preencha:
   - **Nome/Host**: `api` (para API) ou `whatsapp` (para WhatsApp)
   - **Valor/Target**: `ortqmthg.up.railway.app`
   - **TTL**: 300 ou "5 minutes"

### Passo 3: Aguardar Propagação
- **Tempo**: 2-48 horas
- **Verificar**: Use ferramentas como `nslookup` ou `dig`

## 🧪 Como Verificar se Está Funcionando

### Teste DNS (PowerShell):
```powershell
# Verificar se DNS está propagado
nslookup api.whatintegra.com
nslookup whatsapp.whatintegra.com

# Deve retornar algo como:
# Resposta não-autoritativa:
# Nome:    ortqmthg.up.railway.app
# Address:  XX.XXX.XXX.XXX
```

### Teste dos Serviços:
```powershell
# API de Autenticação
Invoke-WebRequest -Uri "https://api.whatintegra.com/health"

# WhatsApp Server
Invoke-WebRequest -Uri "https://whatsapp.whatintegra.com/health"
```

## 🎯 URLs Finais Após Configuração Completa

```
🌐 Site Principal:     https://whatintegra.com
🔐 API Autenticação:   https://api.whatintegra.com
📱 WhatsApp Server:    https://whatsapp.whatintegra.com
```

## 📞 Suporte

Se tiver dúvidas sobre configuração DNS:
1. **GoDaddy**: https://br.godaddy.com/help
2. **Hostinger**: https://support.hostinger.com
3. **Registro.br**: https://registro.br/ajuda

**🚀 Após configurar o DNS, aguarde 2-48h para propagação completa!**