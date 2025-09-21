# 🌐 WhatIntegra - Configuração Ngrok

## 📋 Como usar o Ngrok para acesso público

O Ngrok permite que seu sistema WhatIntegra seja acessado de qualquer lugar da internet, criando túneis seguros para seus servidores locais.

### 🚀 Início Rápido

1. **Execute o sistema completo:**
   ```batch
   iniciar-completo-ngrok.bat
   ```
   
   Este script irá:
   - ✅ Iniciar o servidor de autenticação (porta 8765)
   - ✅ Iniciar o servidor WhatsApp (porta 3001)
   - ✅ Criar túneis Ngrok públicos para ambos
   - ✅ Exibir as URLs públicas

### 🔗 URLs Públicas

Quando o Ngrok iniciar, você verá algo assim:

```
Session Status   online
Account          Seu Nome (Plan: Free)
Version          3.x.x
Region           United States (us)
Latency          45ms
Web Interface    http://127.0.0.1:4040

Forwarding       https://abc123.ngrok-free.app -> http://localhost:8765
Forwarding       https://xyz789.ngrok-free.app -> http://localhost:3001
```

### 📱 Configuração no Site

1. **Acesse seu site no GitHub Pages**
2. **Quando detectar Ngrok**, o sistema pedirá as URLs:
   - 🔐 **Servidor de Autenticação**: `https://abc123.ngrok-free.app/api`
   - 📱 **Servidor WhatsApp**: `https://xyz789.ngrok-free.app`

### 📋 Scripts Disponíveis

- `iniciar-completo-ngrok.bat` - Sistema completo com túneis
- `iniciar-ngrok.bat` - Apenas túneis (servidores devem estar rodando)
- `ngrok-auth.bat` - Apenas túnel do servidor de autenticação
- `ngrok-whatsapp.bat` - Apenas túnel do servidor WhatsApp

### ⚡ Interface de Monitoramento

Acesse `http://127.0.0.1:4040` para ver:
- 📊 Status dos túneis
- 📈 Tráfego em tempo real
- 🔍 Logs de requisições
- 📋 Detalhes de configuração

### 🔒 Segurança

- ✅ Túneis HTTPS automáticos
- ✅ URLs aleatórias para cada sessão
- ✅ Logs detalhados de acesso
- ⚠️ **Importante**: URLs mudam a cada reinicialização

### 💡 Dicas

1. **Mantenha as janelas abertas** - Fechar encerra os túneis
2. **Anote as URLs** - Elas mudam a cada reinicialização
3. **Use o monitoramento** - `http://127.0.0.1:4040`
4. **Para URLs fixas** - Upgrade para Ngrok Pro

### 🆘 Solução de Problemas

**Túnel não conecta:**
```batch
# Verificar se o token está configurado
ngrok config check

# Reconfigurar token se necessário
ngrok config add-authtoken SEU_TOKEN
```

**Porta já em uso:**
```batch
# Verificar portas em uso
netstat -ano | findstr :8765
netstat -ano | findstr :3001
```

**Performance lenta:**
- Use região mais próxima (configurável no arquivo ngrok.yml)
- Considere upgrade para plano pago para melhor performance

### 📞 Suporte

- Dashboard Ngrok: https://dashboard.ngrok.com/
- Documentação: https://ngrok.com/docs
- Status: https://status.ngrok.com/