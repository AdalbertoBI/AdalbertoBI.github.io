# 🧪 WhatIntegra - Testes PowerShell Corretos

## 📋 URLs para Teste (Atualizar com URL real do Railway)

### Railway (Descobrir URL real)
```powershell
# 1. Primeiro, descobrir a URL real do serviço Railway
# Acesse: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf
# Procure por "Domains" ou "URL" no seu serviço
# A URL será algo como: https://xxxxx.up.railway.app

# Substitua 'xxxxx' pela URL real do seu serviço
$RAILWAY_URL = "https://xxxxx.up.railway.app"
```

### Testes de Health Check
```powershell
# Teste básico de conectividade
try {
    $response = Invoke-WebRequest -Uri "$RAILWAY_URL/health" -Method GET
    Write-Host "✅ Health Check OK:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | Format-Table
} catch {
    Write-Host "❌ Health Check Falhou:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
```

### Testes da API de Autenticação
```powershell
# Teste de registro de usuário
try {
    $body = @{
        username = "teste"
        email = "teste@email.com"
        password = "123456"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$RAILWAY_URL/api/register" -Method POST `
        -Body $body -ContentType "application/json"

    Write-Host "✅ Registro OK:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | Format-Table
} catch {
    Write-Host "❌ Registro Falhou:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

# Teste de login
try {
    $body = @{
        email = "teste@email.com"
        password = "123456"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$RAILWAY_URL/api/login" -Method POST `
        -Body $body -ContentType "application/json"

    Write-Host "✅ Login OK:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | Format-Table
} catch {
    Write-Host "❌ Login Falhou:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
```

### Teste do Frontend
```powershell
# Teste se o site carrega
try {
    $response = Invoke-WebRequest -Uri "https://adalbertobi.github.io/WhatIntegra/site/" -Method GET
    Write-Host "✅ Frontend OK - Status:" $response.StatusCode -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Falhou:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
```

## 🔍 Como Descobrir a URL Real do Railway

1. **Acesse o Dashboard**: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf

2. **Clique no seu serviço** (provavelmente chamado "AdalbertoBI.whatintegra" ou similar)

3. **Procure por**:
   - **Domains** tab
   - **URL** field
   - **Railway domain** (geralmente termina com `.up.railway.app`)

4. **A URL será algo como**:
   - `https://abc123.up.railway.app`
   - `https://xyz789.up.railway.app`
   - `https://whatintegra-production.up.railway.app`

## 📝 Comandos Rápidos para Teste

### Health Check Rápido
```powershell
Invoke-WebRequest -Uri "https://[SUA-URL-REAL].up.railway.app/health" | Select-Object -ExpandProperty Content
```

### API Register Rápido
```powershell
$body = '{"username":"teste","email":"teste@email.com","password":"123456"}'
Invoke-WebRequest -Uri "https://[SUA-URL-REAL].up.railway.app/api/register" -Method POST -Body $body -ContentType "application/json"
```

### API Login Rápido
```powershell
$body = '{"email":"teste@email.com","password":"123456"}'
Invoke-WebRequest -Uri "https://[SUA-URL-REAL].up.railway.app/api/login" -Method POST -Body $body -ContentType "application/json"
```

## 🎯 Problema Atual

A URL `https://ortqmthg.up.railway.app` está retornando **404 Application not found**.

**Solução**: Descobrir a URL real do serviço no Railway Dashboard e atualizar todas as configurações.

## 📞 Suporte

Se precisar de ajuda:
1. Verifique o Railway Dashboard
2. Procure pela URL real do serviço
3. Atualize este arquivo com a URL correta
4. Execute os testes novamente