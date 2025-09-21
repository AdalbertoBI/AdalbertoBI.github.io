# 🚂 WhatIntegra - Deploy Railway

## 📋 Configuração Completa Railway

### 🔗 Informações do Projeto
- **ID do Projeto**: `6244cb82-c15b-4067-9755-e6e7b18e36bf`
- **URL do Dashboard**: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf
- **Token**: `7e404c8f-35b7-4b94-8f4f-0ef0ae464f2e`

### 🚀 Como fazer Deploy

#### Opção 1: Deploy Automático via Git (Recomendado)

1. **Commit e Push**:
   ```bash
   git add .
   git commit -m "Deploy WhatIntegra to Railway"
   git push origin main
   ```

2. **Railway detectará automaticamente** e fará deploy

#### Opção 2: Deploy via Railway CLI

1. **Login no Railway**:
   ```bash
   railway login
   ```

2. **Conectar ao projeto**:
   ```bash
   railway link 6244cb82-c15b-4067-9755-e6e7b18e36bf
   ```

3. **Deploy**:
   ```bash
   railway up
   ```

#### Opção 3: Deploy via Dashboard

1. Acesse: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf
2. Conecte seu repositório GitHub
3. Configure auto-deploy no branch `main`

### 🔧 Configurações do Ambiente

O projeto está configurado com:

```env
NODE_ENV=production
PORT=$PORT
HOST=0.0.0.0
WHATSAPP_DATA_DIR=/app/data
WHATSAPP_SESSION_PATH=/app/data/whatsapp_session
```

### 📁 Arquivos de Configuração

- ✅ `package.json` - Dependências e scripts
- ✅ `Procfile` - Comandos de inicialização
- ✅ `railway.toml` - Configuração Railway
- ✅ `.railwayrc` - ID do projeto
- ✅ `.env.railway` - Variáveis de ambiente
- ✅ `railway-start.sh` - Script de inicialização

### 🌐 URLs dos Serviços

Após deploy, os serviços estarão disponíveis em:

- **Servidor de Autenticação**: `https://[service-name].up.railway.app`
- **Servidor WhatsApp**: `https://[service-name].up.railway.app`
- **Health Check**: `https://[service-name].up.railway.app/health`

### 📊 Monitoramento

#### Health Checks
- `/health` - Status do serviço
- `/api/health` - Status detalhado da API

#### Logs
```bash
railway logs
```

#### Métricas
```bash
railway status
```

### 🔄 Serviços Configurados

#### 1. Servidor de Autenticação (`server.js`)
- Porta: `$PORT` (dinâmica)
- Health check: `/health`
- Endpoints: `/api/*`

#### 2. Servidor WhatsApp (`whatsapp-server.js`)
- Porta: `$PORT` (dinâmica)
- Health check: `/health`
- WebSocket habilitado
- Sessões persistentes

### 🎯 Configuração Automática no Site

O `app.js` detecta automaticamente Railway:

```javascript
const isRailway = location.hostname.includes('railway.app');

if (isRailway) {
    API_URL = 'https://whatintegra-auth-production.up.railway.app/api';
    WHATSAPP_URL = 'https://whatintegra-whatsapp-production.up.railway.app';
}
```

### 🔒 Segurança

- ✅ HTTPS automático
- ✅ Variáveis de ambiente seguras
- ✅ CORS configurado
- ✅ JWT para autenticação

### 💰 Custos

Railway oferece:
- **$5 de créditos gratuitos/mês**
- **Depois**: $0.000463/GB-hour
- **Exemplo**: ~$3-5/mês para esta aplicação

### 🆘 Solução de Problemas

#### Build falhou:
```bash
railway logs --tail
```

#### Conectividade:
```bash
curl https://[seu-servico].up.railway.app/health
```

#### Redeploy:
```bash
railway redeploy
```

#### Variáveis de ambiente:
```bash
railway vars
railway vars set NODE_ENV=production
```

### 📞 Suporte

- Dashboard: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf
- Documentação: https://docs.railway.com/
- Status: https://status.railway.com/

---

## 🏁 Próximos Passos

1. **Execute**: `deploy-railway.bat` para instruções
2. **Acesse**: Dashboard do projeto
3. **Configure**: Auto-deploy do GitHub
4. **Teste**: URLs após deploy
5. **Monitore**: Logs e métricas