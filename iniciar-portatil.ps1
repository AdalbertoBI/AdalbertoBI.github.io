# WhatIntegra - Iniciar Portátil
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   WhatIntegra - Iniciar Portatil" -ForegroundColor Green  
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Obter diretório atual
$ProjectDir = Get-Location
$NodeExe = "$ProjectDir\portable\nodejs\node.exe"
$NpmCmd = "$ProjectDir\portable\nodejs\npm.cmd"
$ServerDir = "$ProjectDir\local-auth-server"

# Verificar Node.js
if (!(Test-Path $NodeExe)) {
    Write-Host "ERRO: Node.js portatil nao encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\setup-portatil.bat" -ForegroundColor Yellow
    Read-Host "Pressione Enter para continuar"
    exit 1
}

Write-Host "OK: Node.js Portatil encontrado" -ForegroundColor Green
& $NodeExe --version

Write-Host "OK: NPM Portatil encontrado" -ForegroundColor Green  
& $NpmCmd --version

Write-Host ""
Write-Host "Navegando para: $ServerDir" -ForegroundColor Cyan
Set-Location $ServerDir

if (!(Test-Path "package.json")) {
    Write-Host "ERRO: package.json nao encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para continuar"
    exit 1
}

Write-Host ""
Write-Host "Iniciando servidores..." -ForegroundColor Yellow
Write-Host "URLs disponiveis:" -ForegroundColor Cyan
Write-Host "Auth: http://127.0.0.1:8765" -ForegroundColor White
Write-Host "WhatsApp: http://127.0.0.1:3001" -ForegroundColor White
Write-Host "Repositório: https://github.com/AdalbertoBI/AdalbertoBI.whatintegra" -ForegroundColor White
Write-Host ""

# Executar npm start
& $NpmCmd start

Write-Host ""
Write-Host "Finalizado!" -ForegroundColor Green
Read-Host "Pressione Enter para sair"