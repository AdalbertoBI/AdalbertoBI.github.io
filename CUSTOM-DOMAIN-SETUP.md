# 🌐 WhatIntegra - Configuração Domínio Personalizado & Webhooks

## 📋 Configuração whatintegra.com

### 🔧 1. Configuração DNS (No seu provedor de domínio)

Adicione os seguintes registros DNS:

#### Para API de Autenticação:
```
Tipo: CNAME
Nome: api
Valor: adalbertobiwhatintegra-production.up.railway.app
TTL: 300
```

#### Para Servidor WhatsApp:
```
Tipo: CNAME
Nome: whatsapp
Valor: adalbertobiwhatintegra-production.up.railway.app
TTL: 300
```#### Para Site Principal (opcional):
```
Tipo: CNAME
Nome: www
Valor: adalbertobi.github.io
TTL: 300
```

### 🚀 2. Configuração Railway - Domínios Personalizados

1. **Acesse o Dashboard**: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf

2. **Para cada serviço**:
   - Clique no serviço (Auth ou WhatsApp)
   - Vá em "Settings" → "Domains"
   - Clique "Add Domain"
   - Digite: `api.whatintegra.com` (para auth) ou `whatsapp.whatintegra.com`
   - Railway gerará certificado SSL automaticamente

### 🎯 3. URLs Finais do Sistema

Após configuração completa:

- **Site Principal**: `https://whatintegra.com`
- **API Auth**: `https://api.whatintegra.com/api`  
- **WhatsApp**: `https://whatsapp.whatintegra.com`
- **Health Checks**: 
  - `https://api.whatintegra.com/health`
  - `https://whatsapp.whatintegra.com/health`

## 🔗 Configuração de Webhooks Railway

### 📊 1. Webhook de Deploy Status

Para notificar sobre status de deploys:

```json
{
  "url": "https://api.whatintegra.com/webhooks/railway/deploy",
  "events": ["deployment.status"],
  "secret": "SEU_WEBHOOK_SECRET"
}
```

### 🚨 2. Webhook de Alertas de Volume

Para alertas de uso de disco:

```json
{
  "url": "https://api.whatintegra.com/webhooks/railway/volume",
  "events": ["volume.usage"],
  "secret": "SEU_WEBHOOK_SECRET"
}
```

### 🔧 3. Implementação dos Endpoints Webhook

Adicione ao `server.js`:

```javascript
// Webhook endpoints
app.post('/webhooks/railway/deploy', express.raw({type: 'application/json'}), (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-railway-signature'];
  
  // Verificar assinatura webhook
  // Processar evento de deploy
  
  console.log('🚀 Railway Deploy Webhook:', payload);
  res.status(200).send('OK');
});

app.post('/webhooks/railway/volume', express.raw({type: 'application/json'}), (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-railway-signature'];
  
  // Verificar assinatura webhook  
  // Processar alerta de volume
  
  console.log('💾 Railway Volume Webhook:', payload);
  res.status(200).send('OK');
});
```

## 🔄 4. Configuração Automática Completa

O sistema detectará automaticamente:

### ✅ Detecção de Ambiente:
```javascript
// Domínio personalizado detectado automaticamente
if (location.hostname.includes('whatintegra.com')) {
  API_URL = 'https://api.whatintegra.com/api';
  WHATSAPP_URL = 'https://whatsapp.whatintegra.com';
}
```

### 🎯 Fluxo Completo:
1. **Usuário acessa**: `https://whatintegra.com`
2. **Sistema detecta**: Domínio personalizado
3. **Conecta automaticamente**: APIs nos subdomínios
4. **Zero configuração**: Usuário não precisa inserir URLs

## 📋 Checklist de Implementação

### Railway Dashboard:
- [ ] Adicionar domínio personalizado ao serviço Auth
- [ ] Adicionar domínio personalizado ao serviço WhatsApp
- [ ] Verificar certificados SSL automáticos
- [ ] Configurar webhooks de deploy
- [ ] Configurar webhooks de volume

### Provedor DNS:
- [ ] CNAME para `api.whatintegra.com`
- [ ] CNAME para `whatsapp.whatintegra.com`  
- [ ] CNAME para `www.whatintegra.com` (opcional)
- [ ] Verificar propagação DNS

### Código:
- [ ] ✅ Frontend detecta domínio personalizado
- [ ] Implementar endpoints webhook
- [ ] Testar health checks
- [ ] Validar SSL/TLS

## 🔍 Comandos de Teste

### Verificar DNS:
```bash
nslookup api.whatintegra.com
nslookup whatsapp.whatintegra.com
```

### Testar Health Checks:
```bash
curl https://api.whatintegra.com/health
curl https://whatsapp.whatintegra.com/health
```

### Verificar SSL:
```bash
curl -I https://api.whatintegra.com
curl -I https://whatsapp.whatintegra.com
```

## 🎉 Resultado Final

Após configuração completa:

- ✅ **whatintegra.com**: Domínio profissional
- ✅ **SSL automático**: Certificados Railway
- ✅ **Alta disponibilidade**: Cloud 24/7
- ✅ **Zero configuração**: Detecção automática
- ✅ **Monitoramento**: Webhooks ativos
- ✅ **Escalabilidade**: Railway managed

**Sistema completamente profissional e automatizado!** 🚀