# Substitua pela URL REAL do seu servico Railway
# Descubra no dashboard: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf
$RAILWAY_URL = "https://adalbertobiwhatintegra-production.up.railway.app"

Write-Host "Testando WhatIntegra..." -ForegroundColor Cyan
Write-Host "URL: $RAILWAY_URL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Gray

# Teste 1: Health Check
Write-Host "`nTeste 1: Health Check" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$RAILWAY_URL/health" -Method GET -TimeoutSec 10
    Write-Host "Health Check OK - Status:" $response.StatusCode -ForegroundColor Green
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "Status:" $healthData.status -ForegroundColor White
    Write-Host "Servico:" $healthData.service -ForegroundColor White
    Write-Host "Uptime:" $healthData.uptime "segundos" -ForegroundColor White
} catch {
    Write-Host "Health Check Falhou:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

# Teste 2: API Register
Write-Host "`nTeste 2: Registro de Usuario" -ForegroundColor Green
try {
    $body = @{
        username = "teste_powershell"
        email = "teste_powershell@email.com"
        password = "123456"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$RAILWAY_URL/api/register" -Method POST `
        -Body $body -ContentType "application/json" -TimeoutSec 10

    Write-Host "Registro OK - Status:" $response.StatusCode -ForegroundColor Green
    $registerData = $response.Content | ConvertFrom-Json
    Write-Host "Resposta:" ($registerData | ConvertTo-Json -Compress) -ForegroundColor White
} catch {
    Write-Host "Registro Falhou:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

# Teste 3: API Login
Write-Host "`nTeste 3: Login de Usuario" -ForegroundColor Green
try {
    $body = @{
        email = "teste_powershell@email.com"
        password = "123456"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$RAILWAY_URL/api/login" -Method POST `
        -Body $body -ContentType "application/json" -TimeoutSec 10

    Write-Host "Login OK - Status:" $response.StatusCode -ForegroundColor Green
    $loginData = $response.Content | ConvertFrom-Json
    Write-Host "Token gerado:" ($loginData.token -ne $null) -ForegroundColor White
} catch {
    Write-Host "Login Falhou:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

# Teste 4: Frontend
Write-Host "`nTeste 4: Frontend (GitHub Pages)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "https://adalbertobi.github.io/WhatIntegra/site/" -Method GET -TimeoutSec 10
    Write-Host "Frontend OK - Status:" $response.StatusCode -ForegroundColor Green
    Write-Host "Titulo da pagina:" ($response.ParsedHtml.title) -ForegroundColor White
} catch {
    Write-Host "Frontend Falhou:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Gray
Write-Host "Resumo dos Testes:" -ForegroundColor Cyan
Write-Host "URL Railway testada: $RAILWAY_URL" -ForegroundColor Yellow
Write-Host "Para usar URL correta: Edite a variavel `$RAILWAY_URL` acima" -ForegroundColor White
Write-Host "Descubra URL real no Railway Dashboard" -ForegroundColor White