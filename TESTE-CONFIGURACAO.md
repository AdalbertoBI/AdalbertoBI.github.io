# 🚀 WhatIntegra - Teste Rápido da Configuração

## 📋 URLs Atuais (20 de setembro de 2025)

### Railway (Temporário)
- **API Auth**: https://ortqmthg.up.railway.app/api
- **WhatsApp**: https://ortqmthg.up.railway.app
- **Health Check**: https://ortqmthg.up.railway.app/health

### Domínio Personalizado (Após configuração DNS)
- **API Auth**: https://api.whatintegra.com/api
- **WhatsApp**: https://whatsapp.whatintegra.com
- **Health Check**: https://api.whatintegra.com/health

## 🧪 Testes Automáticos

### PowerShell (Windows)
```powershell
# Teste Health Check Railway
curl https://ortqmthg.up.railway.app/health

# Teste API Register
curl -X POST https://ortqmthg.up.railway.app/api/register `
  -H "Content-Type: application/json" `
  -d '{"username":"teste","email":"teste@email.com","password":"123456"}'

# Teste API Login
curl -X POST https://ortqmthg.up.railway.app/api/login `
  -H "Content-Type: application/json" `
  -d '{"email":"teste@email.com","password":"123456"}'
```

### Bash (Linux/Mac)
```bash
# Teste Health Check Railway
curl https://ortqmthg.up.railway.app/health

# Teste API Register
curl -X POST https://ortqmthg.up.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"teste","email":"teste@email.com","password":"123456"}'

# Teste API Login
curl -X POST https://ortqmthg.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456"}'
```

## 🎯 Status da Configuração

### ✅ Implementado
- [x] URL Railway correta: `ortqmthg.up.railway.app`
- [x] Frontend atualizado para detectar Railway
- [x] Configurações DNS documentadas
- [x] Scripts de teste criados

### 🔄 Próximos Passos
- [ ] Configurar domínio personalizado no Railway Dashboard
- [ ] Configurar registros DNS no provedor
- [ ] Aguardar propagação DNS (2-48h)
- [ ] Testar URLs finais

## 📊 Dashboard Railway
**Link**: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf

Para configurar domínios personalizados:
1. Clique no serviço
2. Settings → Domains
3. Add Domain: `api.whatintegra.com`
4. Add Domain: `whatsapp.whatintegra.com`

## 🔧 Configuração DNS
No seu provedor de domínio (whatintegra.com):

```
Tipo: CNAME
Nome: api
Valor: ortqmthg.up.railway.app
TTL: 300

Tipo: CNAME
Nome: whatsapp
Valor: ortqmthg.up.railway.app
TTL: 300
```

## 🎉 Resultado Final
Após configuração completa:
- ✅ `https://whatintegra.com` → Site principal
- ✅ `https://api.whatintegra.com` → API de autenticação
- ✅ `https://whatsapp.whatintegra.com` → Servidor WhatsApp
- ✅ SSL automático via Railway
- ✅ Zero configuração para usuários

**🚀 Sistema pronto para produção!**