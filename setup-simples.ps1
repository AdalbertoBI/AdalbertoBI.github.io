# WhatIntegra - Setup Portátil Simples

$NodeVersion = "20.17.0"

Write-Host "🚀 Configurando ambiente portátil do WhatIntegra..." -ForegroundColor Green
Write-Host "📦 Versão do Node.js: $NodeVersion" -ForegroundColor Yellow

# Obter diretório atual
$ProjectDir = Get-Location

# Definir caminhos
$PortableDir = "$ProjectDir\portable"
$NodeDir = "$PortableDir\nodejs"  
$CacheDir = "$PortableDir\npm-cache"
$GlobalDir = "$PortableDir\npm-global"

# Criar diretórios se não existirem
Write-Host "📁 Criando diretórios..." -ForegroundColor Cyan

if (!(Test-Path $PortableDir)) {
    New-Item -Type Directory $PortableDir -Force | Out-Null
    Write-Host "✅ Criado: $PortableDir"
}

if (!(Test-Path $NodeDir)) {
    New-Item -Type Directory $NodeDir -Force | Out-Null  
    Write-Host "✅ Criado: $NodeDir"
}

if (!(Test-Path $CacheDir)) {
    New-Item -Type Directory $CacheDir -Force | Out-Null
    Write-Host "✅ Criado: $CacheDir"  
}

if (!(Test-Path $GlobalDir)) {
    New-Item -Type Directory $GlobalDir -Force | Out-Null
    Write-Host "✅ Criado: $GlobalDir"
}

# Verificar Node.js
$NodeExe = "$NodeDir\node.exe"

if (Test-Path $NodeExe) {
    Write-Host "✅ Node.js já instalado!" -ForegroundColor Green
} else {
    Write-Host "⬇️ Baixando Node.js $NodeVersion..." -ForegroundColor Cyan
    
    $Arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    $Url = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-$Arch.zip"
    $ZipFile = "$PortableDir\node.zip"
    
    try {
        Write-Host "📡 Baixando de: $Url"
        Invoke-WebRequest -Uri $Url -OutFile $ZipFile -UseBasicParsing
        Write-Host "✅ Download concluído!" -ForegroundColor Green
        
        Write-Host "📦 Extraindo..." -ForegroundColor Cyan
        Expand-Archive -Path $ZipFile -DestinationPath $PortableDir -Force
        
        $ExtractedFolder = "$PortableDir\node-v$NodeVersion-win-$Arch"
        if (Test-Path $ExtractedFolder) {
            Copy-Item "$ExtractedFolder\*" $NodeDir -Recurse -Force
            Remove-Item $ExtractedFolder -Recurse -Force
        }
        
        Remove-Item $ZipFile -Force
        Write-Host "✅ Node.js extraído!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro: $_" -ForegroundColor Red
        exit 1
    }
}

# Configurar NPM
if (Test-Path $NodeExe) {
    $NodeVer = & $NodeExe --version
    Write-Host "✅ Node.js: $NodeVer" -ForegroundColor Green
    
    $NpmCmd = "$NodeDir\npm.cmd"
    $NpmVer = & $NpmCmd --version
    Write-Host "✅ NPM: v$NpmVer" -ForegroundColor Green
    
    Write-Host "⚙️ Configurando NPM..." -ForegroundColor Cyan
    & $NpmCmd config set cache $CacheDir
    & $NpmCmd config set prefix $GlobalDir
    
    # Instalar dependências  
    $ServerDir = "$ProjectDir\local-auth-server"
    if (Test-Path "$ServerDir\package.json") {
        Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
        Push-Location $ServerDir
        & $NpmCmd install
        Pop-Location
        Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
    }
}

Write-Host "🎉 Setup concluído!" -ForegroundColor Green
Write-Host "📝 Use: .\iniciar-portatil.bat" -ForegroundColor Yellow