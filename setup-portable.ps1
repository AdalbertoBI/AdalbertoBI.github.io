# ========================================
# WhatIntegra - Setup Portátil
# ========================================
# Este script configura o ambiente Node.js portátil para o projeto

param(
    [string]$NodeVersion = "20.17.0"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Configurando ambiente portátil do WhatIntegra..." -ForegroundColor Green
Write-Host "📦 Versão do Node.js: $NodeVersion" -ForegroundColor Yellow

# Diretórios
$ProjectDir = $PSScriptRoot
$NodePortableDir = "$ProjectDir\portable"
$NodeDir = "$NodePortableDir\nodejs"
$NpmCacheDir = "$NodePortableDir\npm-cache"
$NpmGlobalDir = "$NodePortableDir\npm-global"

Write-Host "📁 Criando diretórios..." -ForegroundColor Cyan

# Criar diretórios
if (!(Test-Path $NodePortableDir)) {
    New-Item -ItemType Directory -Path $NodePortableDir -Force | Out-Null
    Write-Host "  ✅ Criado: $NodePortableDir"
}
if (!(Test-Path $NodeDir)) {
    New-Item -ItemType Directory -Path $NodeDir -Force | Out-Null
    Write-Host "  ✅ Criado: $NodeDir"
}
if (!(Test-Path $NpmCacheDir)) {
    New-Item -ItemType Directory -Path $NpmCacheDir -Force | Out-Null
    Write-Host "  ✅ Criado: $NpmCacheDir"
}
if (!(Test-Path $NpmGlobalDir)) {
    New-Item -ItemType Directory -Path $NpmGlobalDir -Force | Out-Null
    Write-Host "  ✅ Criado: $NpmGlobalDir"
}

# Verificar se Node.js já está instalado
$NodeExe = "$NodeDir\node.exe"
if (Test-Path $NodeExe) {
    $CurrentVersion = & $NodeExe --version 2>$null
    if ($CurrentVersion -eq "v$NodeVersion") {
        Write-Host "✅ Node.js $NodeVersion já está instalado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Node.js versão diferente encontrada. Atualizando..." -ForegroundColor Yellow
        Remove-Item $NodeDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Baixar Node.js se não existir
if (!(Test-Path $NodeExe)) {
    Write-Host "⬇️  Baixando Node.js $NodeVersion..." -ForegroundColor Cyan
    
    # Determinar arquitetura
    $Arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    $NodeUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-$Arch.zip"
    $NodeZip = "$NodePortableDir\nodejs.zip"
    
    try {
        Write-Host "  📡 URL: $NodeUrl"
        Invoke-WebRequest -Uri $NodeUrl -OutFile $NodeZip -UseBasicParsing
        Write-Host "  ✅ Download concluído!" -ForegroundColor Green
        
        Write-Host "📦 Extraindo Node.js..." -ForegroundColor Cyan
        Expand-Archive -Path $NodeZip -DestinationPath $NodePortableDir -Force
        
        # Mover arquivos para diretório correto
        $ExtractedDir = "$NodePortableDir\node-v$NodeVersion-win-$Arch"
        if (Test-Path $ExtractedDir) {
            Get-ChildItem $ExtractedDir | Move-Item -Destination $NodeDir -Force
            Remove-Item $ExtractedDir -Recurse -Force
        }
        
        Remove-Item $NodeZip -Force
        Write-Host "  ✅ Node.js extraído com sucesso!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao baixar Node.js: $_" -ForegroundColor Red
        exit 1
    }
}

# Verificar instalação
if (Test-Path $NodeExe) {
    $NodeVersionInstalled = & $NodeExe --version
    $NpmCmd = "$NodeDir\npm.cmd"
    $NpmVersionInstalled = & $NpmCmd --version
    Write-Host "✅ Node.js instalado: $NodeVersionInstalled" -ForegroundColor Green
    Write-Host "✅ NPM instalado: v$NpmVersionInstalled" -ForegroundColor Green
} else {
    Write-Host "❌ Falha na instalação do Node.js" -ForegroundColor Red
    exit 1
}

# Configurar NPM
Write-Host "⚙️  Configurando NPM..." -ForegroundColor Cyan
$NpmCmd = "$NodeDir\npm.cmd"

& $NpmCmd config set cache $NpmCacheDir
& $NpmCmd config set prefix $NpmGlobalDir
Write-Host "  ✅ Cache NPM: $NpmCacheDir" -ForegroundColor Green
Write-Host "  ✅ Global NPM: $NpmGlobalDir" -ForegroundColor Green

# Instalar dependências do projeto
Write-Host "📦 Instalando dependências do projeto..." -ForegroundColor Cyan
$LocalAuthDir = "$ProjectDir\local-auth-server"
if (Test-Path "$LocalAuthDir\package.json") {
    Push-Location $LocalAuthDir
    try {
        & $NpmCmd install
        Write-Host "  ✅ Dependências instaladas!" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ Erro ao instalar dependências: $_" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

Write-Host "🎉 Setup portátil concluído com sucesso!" -ForegroundColor Green
Write-Host "📝 Para usar o ambiente portátil, execute: .\start-portable.ps1" -ForegroundColor Yellow