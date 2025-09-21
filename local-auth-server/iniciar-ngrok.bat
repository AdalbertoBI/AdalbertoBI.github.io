@echo off
title WhatIntegra - Ngrok Tunnels Manager
color 0A

echo ===============================================
echo    🌐 WHATINTEGRA - NGROK TUNNELS MANAGER
echo ===============================================
echo.
echo 🚀 Iniciando tuneis publicos...
echo.

REM Criar um arquivo de configuração temporário para múltiplos túneis
echo version: "2" > ngrok-temp.yml
echo authtoken_from_env: true >> ngrok-temp.yml
echo tunnels: >> ngrok-temp.yml
echo   auth-server: >> ngrok-temp.yml
echo     addr: 8765 >> ngrok-temp.yml
echo     proto: http >> ngrok-temp.yml
echo     inspect: true >> ngrok-temp.yml
echo   whatsapp-server: >> ngrok-temp.yml
echo     addr: 3001 >> ngrok-temp.yml
echo     proto: http >> ngrok-temp.yml
echo     inspect: true >> ngrok-temp.yml

echo 📡 Iniciando túneis para:
echo   🔐 Servidor de Autenticação: localhost:8765
echo   📱 Servidor WhatsApp: localhost:3001
echo.
echo ⚠️  MANTENHA ESTA JANELA ABERTA!
echo 🔗 URLs públicas serão exibidas abaixo:
echo ===============================================

REM Iniciar ambos os túneis
..\..\site\ngrok.exe start --config ngrok-temp.yml --all

echo.
echo 🛑 Túneis encerrados. Pressione qualquer tecla para sair...
pause >nul

REM Limpar arquivo temporário
del ngrok-temp.yml 2>nul