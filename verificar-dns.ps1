# 🔍 Script de Verificação DNS - WhatIntegra

Write-Host "Verificando configuracao DNS para whatintegra.com..." -ForegroundColor Cyan
Write-Host "Data: $(Get-Date)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Gray

# Verificar DNS para api.whatintegra.com
Write-Host "`n1. Verificando api.whatintegra.com..." -ForegroundColor Green
try {
    $dnsResult = Resolve-DnsName -Name "api.whatintegra.com" -Type CNAME -ErrorAction Stop
    Write-Host "CNAME encontrado:" -ForegroundColor Green
    Write-Host "  Nome: $($dnsResult.Name)" -ForegroundColor White
    Write-Host "  Valor: $($dnsResult.NameHost)" -ForegroundColor White
    Write-Host "  TTL: $($dnsResult.TTL)" -ForegroundColor White

    if ($dnsResult.NameHost -eq "adalbertobiwhatintegra-production.up.railway.app") {
        Write-Host "  Status: CORRETO ✅" -ForegroundColor Green
    } else {
        Write-Host "  Status: INCORRETO ❌ (esperado: adalbertobiwhatintegra-production.up.railway.app)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERRO: DNS nao configurado ou CNAME nao encontrado" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Verificar DNS para whatsapp.whatintegra.com
Write-Host "`n2. Verificando whatsapp.whatintegra.com..." -ForegroundColor Green
try {
    $dnsResult = Resolve-DnsName -Name "whatsapp.whatintegra.com" -Type CNAME -ErrorAction Stop
    Write-Host "CNAME encontrado:" -ForegroundColor Green
    Write-Host "  Nome: $($dnsResult.Name)" -ForegroundColor White
    Write-Host "  Valor: $($dnsResult.NameHost)" -ForegroundColor White
    Write-Host "  TTL: $($dnsResult.TTL)" -ForegroundColor White

    if ($dnsResult.NameHost -eq "adalbertobiwhatintegra-production.up.railway.app") {
        Write-Host "  Status: CORRETO ✅" -ForegroundColor Green
    } else {
        Write-Host "  Status: INCORRETO ❌ (esperado: adalbertobiwhatintegra-production.up.railway.app)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERRO: DNS nao configurado ou CNAME nao encontrado" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Testar conectividade HTTPS
Write-Host "`n3. Testando conectividade HTTPS..." -ForegroundColor Green

# Teste API
try {
    $response = Invoke-WebRequest -Uri "https://api.whatintegra.com/health" -Method GET -TimeoutSec 10
    Write-Host "API (api.whatintegra.com): OK ✅ - Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "API (api.whatintegra.com): FALHA ❌" -ForegroundColor Red
    Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Teste WhatsApp
try {
    $response = Invoke-WebRequest -Uri "https://whatsapp.whatintegra.com/health" -Method GET -TimeoutSec 10
    Write-Host "WhatsApp (whatsapp.whatintegra.com): OK ✅ - Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "WhatsApp (whatsapp.whatintegra.com): FALHA ❌" -ForegroundColor Red
    Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Gray
Write-Host "Instrucoes:" -ForegroundColor Cyan
Write-Host "- Se DNS estiver INCORRETO: Configure CNAME no seu provedor" -ForegroundColor White
Write-Host "- Se HTTPS falhar: Aguarde 2-48h para propagacao DNS" -ForegroundColor White
Write-Host "- Execute este script novamente apos correcoes" -ForegroundColor White
Write-Host "`nData da verificacao: $(Get-Date)" -ForegroundColor Yellow