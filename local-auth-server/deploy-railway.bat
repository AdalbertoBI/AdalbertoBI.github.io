@echo off
title WhatIntegra - Deploy to Railway
color 0C

echo ===============================================
echo     🚂 WHATINTEGRA - DEPLOY TO RAILWAY
echo ===============================================
echo.

echo 🔧 Preparando deploy...
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: package.json não encontrado!
    echo    Execute este script do diretório local-auth-server
    pause
    exit /b 1
)

echo ✅ Arquivos de configuração encontrados:
if exist "package.json" echo    - package.json
if exist "Procfile" echo    - Procfile
if exist "railway.toml" echo    - railway.toml
if exist ".railwayrc" echo    - .railwayrc
echo.

echo 📋 Informações do projeto:
echo    - ID: 6244cb82-c15b-4067-9755-e6e7b18e36bf
echo    - Ambiente: production
echo    - Serviço: Node.js
echo.

REM Verificar conexão com Railway
echo 🔍 Verificando conexão com Railway...
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Não autenticado no Railway
    echo    Visite: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf
    echo    Faça o deploy manual através do dashboard
    echo.
) else (
    echo ✅ Autenticado no Railway
    echo.
)

echo 🚀 Para fazer deploy:
echo.
echo    OPÇÃO 1 - Via Git (Recomendado):
echo    1. Commit suas alterações: git add . && git commit -m "Deploy to Railway"
echo    2. Push para o repositório: git push origin main
echo    3. Railway fará deploy automático
echo.
echo    OPÇÃO 2 - Via Railway CLI:
echo    1. railway login
echo    2. railway link 6244cb82-c15b-4067-9755-e6e7b18e36bf
echo    3. railway up
echo.
echo    OPÇÃO 3 - Via Dashboard:
echo    1. Acesse: https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf
echo    2. Conecte seu repositório GitHub
echo    3. Configure o auto-deploy
echo.

echo 💡 Dica: Railway já tem suas configurações:
echo    - Porta: %PORT% (dinâmica)
echo    - Health check: /health
echo    - Ambiente: production
echo.

echo ===============================================
pause