# ========================================
# WhatIntegra - Limpar e Reinstalar
# ========================================
# Este script limpa o cache e reinstala as dependências

param(
    [switch]$Full,
    [switch]$CacheOnly,
    [switch]$NodeModulesOnly
)

$ErrorActionPreference = "Stop"

# Cores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Diretórios
$ProjectDir = $PSScriptRoot
$NodeDir = Join-Path $ProjectDir "portable\nodejs"
$NpmCacheDir = Join-Path $ProjectDir "portable\npm-cache"
$LocalAuthDir = Join-Path $ProjectDir "local-auth-server"
$NodeModulesDir = Join-Path $LocalAuthDir "node_modules"
$PackageLockFile = Join-Path $LocalAuthDir "package-lock.json"

Write-ColorOutput Yellow "🧹 Iniciando limpeza do projeto WhatIntegra..."

# Verificar se o ambiente portátil existe
$NodeExe = Join-Path $NodeDir "node.exe"
$NpmCmd = Join-Path $NodeDir "npm.cmd"

if (!(Test-Path $NodeExe)) {
    Write-ColorOutput Red "❌ Ambiente portátil não encontrado!"
    Write-ColorOutput Yellow "🔧 Execute primeiro: .\setup-portable.ps1"
    exit 1
}

# Limpar cache NPM
if ($Full -or $CacheOnly -or (!$NodeModulesOnly)) {
    if (Test-Path $NpmCacheDir) {
        Write-ColorOutput Cyan "🗑️  Removendo cache NPM..."
        Remove-Item $NpmCacheDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-ColorOutput Green "  ✅ Cache NPM removido!"
    }
    
    Write-ColorOutput Cyan "🧹 Limpando cache NPM..."
    & $NpmCmd cache clean --force
    Write-ColorOutput Green "  ✅ Cache NPM limpo!"
}

# Remover node_modules e package-lock.json
if ($Full -or $NodeModulesOnly -or (!$CacheOnly)) {
    if (Test-Path $NodeModulesDir) {
        Write-ColorOutput Cyan "🗑️  Removendo node_modules..."
        Remove-Item $NodeModulesDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-ColorOutput Green "  ✅ node_modules removido!"
    }
    
    if (Test-Path $PackageLockFile) {
        Write-ColorOutput Cyan "🗑️  Removendo package-lock.json..."
        Remove-Item $PackageLockFile -Force -ErrorAction SilentlyContinue
        Write-ColorOutput Green "  ✅ package-lock.json removido!"
    }
    
    # Reinstalar dependências
    if (!$CacheOnly) {
        Write-ColorOutput Cyan "📦 Reinstalando dependências..."
        Push-Location $LocalAuthDir
        try {
            & $NpmCmd install
            Write-ColorOutput Green "  ✅ Dependências reinstaladas!"
        }
        catch {
            Write-ColorOutput Red "  ❌ Erro ao reinstalar dependências: $_"
            exit 1
        }
        finally {
            Pop-Location
        }
    }
}

Write-ColorOutput Green "🎉 Limpeza concluída com sucesso!"

if (!$CacheOnly) {
    Write-ColorOutput Yellow "📝 Para iniciar o projeto: .\start-portable.ps1"
}