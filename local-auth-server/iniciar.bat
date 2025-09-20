@echo off
title WhatIntegra - Servidores Locais

echo.
echo ========================================
echo      🚀 WhatIntegra - Iniciando...
echo ========================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    pause
    exit /b 1
)

echo ✅ Iniciando servidores...
echo.
echo 🔐 Auth Server:    http://127.0.0.1:8765  
echo 💬 WhatsApp Server: http://127.0.0.1:3001
echo 🌐 Repositório:    https://github.com/AdalbertoBI/AdalbertoBI.whatintegra
echo.
echo ⚠️  Pressione Ctrl+C para parar
echo.

npm start