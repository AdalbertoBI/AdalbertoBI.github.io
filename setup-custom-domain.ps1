# 🌐 Script de Configuração Railway - Domínios Personalizados
# Configuração automatizada para whatintegra.com

# Configuração Railway
$env:RAILWAY_TOKEN = "7e404c8f-35b7-4b94-8f4f-0ef0ae464f2e"
$PROJECT_ID = "6244cb82-c15b-4067-9755-e6e7b18e36bf"

Write-Host "🚀 Configurando domínios personalizados no Railway..." -ForegroundColor Green

# Lista serviços no projeto
Write-Host "📋 Listando serviços no projeto..." -ForegroundColor Yellow
railway services

Write-Host "`n🎯 Instruções de configuração manual no Railway Dashboard:" -ForegroundColor Cyan
Write-Host "https://railway.com/project/$PROJECT_ID" -ForegroundColor Blue

Write-Host "`n1️⃣ Para o serviço de AUTENTICAÇÃO:" -ForegroundColor White
Write-Host "   - Clique no serviço 'auth' ou 'local-auth-server'" -ForegroundColor Gray
Write-Host "   - Vá em Settings → Domains" -ForegroundColor Gray  
Write-Host "   - Clique 'Add Domain'" -ForegroundColor Gray
Write-Host "   - Digite: api.whatintegra.com" -ForegroundColor Green
Write-Host "   - Railway criará SSL automaticamente" -ForegroundColor Gray

Write-Host "`n2️⃣ Para o serviço WHATSAPP:" -ForegroundColor White
Write-Host "   - Clique no serviço 'whatsapp'" -ForegroundColor Gray
Write-Host "   - Vá em Settings → Domains" -ForegroundColor Gray
Write-Host "   - Clique 'Add Domain'" -ForegroundColor Gray
Write-Host "   - Digite: whatsapp.whatintegra.com" -ForegroundColor Green
Write-Host "   - Railway criará SSL automaticamente" -ForegroundColor Gray

Write-Host "`n3️⃣ Configuração DNS no seu provedor:" -ForegroundColor White
Write-Host "   Adicione os registros CNAME:" -ForegroundColor Gray
Write-Host "   api      →  [railway-url-auth].up.railway.app" -ForegroundColor Yellow
Write-Host "   whatsapp →  [railway-url-whatsapp].up.railway.app" -ForegroundColor Yellow

# Testa se Railway CLI está instalado
try {
    railway --version | Out-Null
    Write-Host "`n✅ Railway CLI está instalado" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Railway CLI não encontrado. Instale com:" -ForegroundColor Red
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Exibe status atual
Write-Host "`n📊 Status atual do projeto:" -ForegroundColor Cyan
railway status

Write-Host "`n🔗 Abrindo Railway Dashboard..." -ForegroundColor Green
Start-Process "https://railway.com/project/$PROJECT_ID"

Write-Host "`n🎉 Próximos passos:" -ForegroundColor Magenta
Write-Host "1. Configure os domínios no Railway Dashboard (instruções acima)" -ForegroundColor White
Write-Host "2. Configure DNS no seu provedor de domínio" -ForegroundColor White
Write-Host "3. Aguarde propagação DNS (até 48h)" -ForegroundColor White
Write-Host "4. Teste: https://api.whatintegra.com/health" -ForegroundColor White
Write-Host "5. Teste: https://whatsapp.whatintegra.com/health" -ForegroundColor White

Write-Host "`n✅ Script concluido! Configure manualmente no dashboard." -ForegroundColor Green