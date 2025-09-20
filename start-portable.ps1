# ========================================
# WhatIntegra - Iniciar Ambiente Portátil
# ========================================
# Este script inicia o projeto usando o Node.js portátil

param(
    [switch]$Setup,
    [switch]$Dev,
    [switch]$Auth,
    [switch]$WhatsApp,
    [switch]$CreateUser
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
$LocalAuthDir = Join-Path $ProjectDir "local-auth-server"

# Verificar se o ambiente portátil existe
$NodeExe = Join-Path $NodeDir "node.exe"
$NpmCmd = Join-Path $NodeDir "npm.cmd"

if (!(Test-Path $NodeExe)) {
    Write-ColorOutput Red "❌ Ambiente portátil não encontrado!"
    Write-ColorOutput Yellow "🔧 Execute primeiro: .\setup-portable.ps1"
    exit 1
}

# Executar setup se solicitado
if ($Setup) {
    Write-ColorOutput Cyan "🔧 Executando setup..."
    & (Join-Path $ProjectDir "setup-portable.ps1")
    exit 0
}

# Verificar se as dependências estão instaladas
$NodeModulesDir = Join-Path $LocalAuthDir "node_modules"
if (!(Test-Path $NodeModulesDir)) {
    Write-ColorOutput Yellow "⚠️  Dependências não encontradas. Instalando..."
    Push-Location $LocalAuthDir
    try {
        & $NpmCmd install
        Write-ColorOutput Green "✅ Dependências instaladas!"
    }
    catch {
        Write-ColorOutput Red "❌ Erro ao instalar dependências: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Configurar variáveis de ambiente
$env:PATH = "$NodeDir;$env:PATH"
$env:NODE_PATH = Join-Path $NodeDir "node_modules"

Write-ColorOutput Green "🚀 Iniciando WhatIntegra com Node.js portátil..."
Write-ColorOutput Cyan "📍 Diretório: $LocalAuthDir"

# Navegar para o diretório do servidor
Push-Location $LocalAuthDir

try {
    if ($CreateUser) {
        Write-ColorOutput Yellow "👤 Criando usuário..."
        & $NodeExe "create-user.js"
    }
    elseif ($Auth) {
        Write-ColorOutput Blue "🔐 Iniciando apenas servidor de autenticação..."
        & $NodeExe "server.js"
    }
    elseif ($WhatsApp) {
        Write-ColorOutput Green "💬 Iniciando apenas servidor WhatsApp..."
        & $NodeExe "whatsapp-server.js"
    }
    elseif ($Dev) {
        Write-ColorOutput Magenta "🔧 Iniciando modo desenvolvimento..."
        & $NpmCmd "run" "dev"
    }
    else {
        Write-ColorOutput Yellow "🌐 Iniciando todos os servidores..."
        & $NpmCmd "start"
    }
}
catch {
    Write-ColorOutput Red "❌ Erro ao iniciar: $_"
}
finally {
    Pop-Location
}

Write-ColorOutput Green "✅ Finalizado!"