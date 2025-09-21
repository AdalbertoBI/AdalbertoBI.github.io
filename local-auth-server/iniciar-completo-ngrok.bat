@echo off
title WhatIntegra - Sistema Completo com Ngrok
color 0B

echo ===============================================
echo    🌟 WHATINTEGRA - SISTEMA COMPLETO
echo          🌐 COM ACESSO PUBLICO NGROK
echo ===============================================
echo.

echo 🔧 Iniciando componentes do sistema...
echo.

REM Verificar se os servidores já estão rodando
echo 🔍 Verificando portas...
netstat -ano | findstr ":8765" >nul
if %errorlevel%==0 (
    echo ✅ Servidor de Autenticação já está rodando na porta 8765
) else (
    echo 🚀 Iniciando Servidor de Autenticação...
    start "Auth Server" cmd /c "cd /d %~dp0 && node server.js"
    timeout /t 3 /nobreak >nul
)

netstat -ano | findstr ":3001" >nul
if %errorlevel%==0 (
    echo ✅ Servidor WhatsApp já está rodando na porta 3001
) else (
    echo 📱 Iniciando Servidor WhatsApp...
    start "WhatsApp Server" cmd /c "cd /d %~dp0 && node whatsapp-server.js"
    timeout /t 3 /nobreak >nul
)

echo.
echo 🌐 Aguardando servidores ficarem prontos...
timeout /t 5 /nobreak >nul

echo.
echo 🔗 Iniciando túneis Ngrok para acesso público...
echo.

REM Executar o script de túneis
call iniciar-ngrok.bat

echo.
echo 🏁 Sistema encerrado.
pause