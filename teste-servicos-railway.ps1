# Teste dos Servicos Railway WhatIntegra
# Data: 21/09/2025

Write-Host "Testando servicos WhatIntegra no Railway..." -ForegroundColor Cyan
Write-Host ""

# URLs dos servicos
$authUrl = "https://wonderful-rebirth-production-c173.up.railway.app"
$whatsappUrl = "https://adalbertobiwhatintegra-production.up.railway.app"

Write-Host "Servico Auth: $authUrl" -ForegroundColor Yellow
Write-Host "Servico WhatsApp: $whatsappUrl" -ForegroundColor Green
Write-Host ""

# Teste 1: Health do servico Auth
Write-Host "1. Testando health do servico Auth..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$authUrl/health" -Method GET -TimeoutSec 10
    Write-Host "Auth Health: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Auth Health falhou: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 2: API Health do servico Auth
Write-Host "2. Testando /api/health do servico Auth..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$authUrl/api/health" -Method GET -TimeoutSec 10
    Write-Host "Auth API Health: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Auth API Health falhou: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 3: Registro de usuario
Write-Host "3. Testando registro de usuario..." -ForegroundColor Magenta
try {
    $body = @{
        username = "testuser3"
        password = "testpass123"
        email = "test3@test.com"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$authUrl/api/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "Registro: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Registro falhou: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 4: Login
Write-Host "4. Testando login..." -ForegroundColor Magenta
try {
    $body = @{
        username = "testuser3"
        password = "testpass123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$authUrl/api/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "Login: $($response.StatusCode)" -ForegroundColor Green

    $loginData = $response.Content | ConvertFrom-Json
    if ($loginData.token) {
        Write-Host "Token JWT gerado com sucesso" -ForegroundColor Green
    }
} catch {
    Write-Host "Login falhou: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 5: Status do WhatsApp
Write-Host "5. Verificando status do servico WhatsApp..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$whatsappUrl/health" -Method GET -TimeoutSec 10
    Write-Host "WhatsApp Health: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "WhatsApp Health: Indisponivel (esperado)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Testes concluidos!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumo da configuracao:" -ForegroundColor White
Write-Host "API Auth: $authUrl/api" -ForegroundColor Cyan
Write-Host "WhatsApp: $whatsappUrl" -ForegroundColor Cyan
Write-Host "Frontend: https://adalbertobi.github.io" -ForegroundColor Cyan