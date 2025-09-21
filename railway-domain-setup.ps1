# Script de Configuracao Railway - Dominios Personalizados
# Configuracao automatizada para whatintegra.com

# Configuracao Railway
$env:RAILWAY_TOKEN = "7e404c8f-35b7-4b94-8f4f-0ef0ae464f2e"
$PROJECT_ID = "6244cb82-c15b-4067-9755-e6e7b18e36bf"

Write-Host "Configurando dominios personalizados no Railway..." -ForegroundColor Green

# Lista servicos no projeto
Write-Host "Listando servicos no projeto..." -ForegroundColor Yellow
railway services

Write-Host "Instrucoes de configuracao manual no Railway Dashboard:" -ForegroundColor Cyan
Write-Host "https://railway.com/project/$PROJECT_ID" -ForegroundColor Blue

Write-Host "1. Para o servico de AUTENTICACAO:" -ForegroundColor White
Write-Host "   - Clique no servico auth ou local-auth-server" -ForegroundColor Gray
Write-Host "   - Va em Settings Domains" -ForegroundColor Gray  
Write-Host "   - Clique Add Domain" -ForegroundColor Gray
Write-Host "   - Digite: api.whatintegra.com" -ForegroundColor Green
Write-Host "   - Railway criara SSL automaticamente" -ForegroundColor Gray

Write-Host "2. Para o servico WHATSAPP:" -ForegroundColor White
Write-Host "   - Clique no servico whatsapp" -ForegroundColor Gray
Write-Host "   - Va em Settings Domains" -ForegroundColor Gray
Write-Host "   - Clique Add Domain" -ForegroundColor Gray
Write-Host "   - Digite: whatsapp.whatintegra.com" -ForegroundColor Green
Write-Host "   - Railway criara SSL automaticamente" -ForegroundColor Gray

Write-Host "3. Configuracao DNS no seu provedor:" -ForegroundColor White
Write-Host "   Adicione os registros CNAME:" -ForegroundColor Gray
Write-Host "   api      ortqmthg.up.railway.app" -ForegroundColor Yellow
Write-Host "   whatsapp ortqmthg.up.railway.app" -ForegroundColor Yellow

# Testa se Railway CLI esta instalado
try {
    railway --version | Out-Null
    Write-Host "Railway CLI esta instalado" -ForegroundColor Green
} catch {
    Write-Host "Railway CLI nao encontrado. Instale com:" -ForegroundColor Red
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Exibe status atual
Write-Host "Status atual do projeto:" -ForegroundColor Cyan
railway status

Write-Host "Abrindo Railway Dashboard..." -ForegroundColor Green
Start-Process "https://railway.com/project/$PROJECT_ID"

Write-Host "Proximos passos:" -ForegroundColor Magenta
Write-Host "1. Configure os dominios no Railway Dashboard" -ForegroundColor White
Write-Host "2. Configure DNS no seu provedor de dominio" -ForegroundColor White
Write-Host "3. Aguarde propagacao DNS ate 48h" -ForegroundColor White
Write-Host "4. Teste: https://api.whatintegra.com/health" -ForegroundColor White
Write-Host "5. Teste: https://whatsapp.whatintegra.com/health" -ForegroundColor White

Write-Host "Script concluido! Configure manualmente no dashboard." -ForegroundColor Green