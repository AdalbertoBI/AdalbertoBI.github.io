@echo off
echo =====================================
echo   WhatIntegra - Iniciar Portatil  
echo =====================================

set PROJECT_DIR=%~dp0
set NODE_EXE=%PROJECT_DIR%portable\nodejs\node.exe
set SERVER_DIR=%PROJECT_DIR%local-auth-server

if not exist "%NODE_EXE%" (
    echo ERRO: Node.js nao encontrado!
    echo Execute primeiro: setup-portatil.bat
    pause
    exit /b 1
)

echo OK: Node.js Portatil v20.17.0 encontrado
echo.

echo Navegando para servidor...
cd /d "%SERVER_DIR%"

echo.
echo Iniciando servidores em terminais separados...
echo.
echo 📡 PORTAS DOS SERVIDORES:
echo ┌─ Auth HTTP:     http://127.0.0.1:8765  (uso local)
echo ├─ Auth HTTPS:    https://127.0.0.1:8766 (GitHub Pages)
echo ├─ WhatsApp HTTP: http://127.0.0.1:3001  (uso local)
echo └─ WhatsApp HTTPS: https://127.0.0.1:3002 (GitHub Pages)
echo.
echo 🌐 ACESSO:
echo ├─ Site Local:    http://localhost:3000 (se configurado)
echo └─ GitHub Pages:  https://adalbertobi.github.io/AdalbertoBI.whatintegra
echo.

echo 🚀 Abrindo terminal para Servidor de Autenticacao...
start "🔐 WhatIntegra Auth Server (HTTP:8765 HTTPS:8766)" cmd /k "cd /d %PROJECT_DIR%local-auth-server & echo. & echo 🔐 SERVIDOR DE AUTENTICACAO & echo =============================================== & echo HTTP:  http://127.0.0.1:8765 & echo HTTPS: https://127.0.0.1:8766 & echo. & echo 📋 Logs do servidor: & echo. & %NODE_EXE% server.js"

echo Aguardando 2 segundos...
timeout /t 2 /nobreak >nul

echo 📱 Abrindo terminal para Servidor WhatsApp...
start "📱 WhatIntegra WhatsApp Server (HTTP:3001 HTTPS:3002)" cmd /k "cd /d %PROJECT_DIR%local-auth-server & echo. & echo 📱 SERVIDOR WHATSAPP & echo =============================================== & echo HTTP:  http://127.0.0.1:3001 & echo HTTPS: https://127.0.0.1:3002 & echo. & echo 📋 Logs do servidor: & echo. & %NODE_EXE% whatsapp-server.js"

echo.
echo ✅ Servidores iniciados em terminais separados!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ Servidores iniciados em terminais separados!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo �️  TERMINAIS ABERTOS:
echo ├─ 🔐 Auth Server:    HTTP 8765 + HTTPS 8766
echo └─ 📱 WhatsApp Server: HTTP 3001 + HTTPS 3002
echo.
echo �📋 COMO USAR:
echo.
echo 1️⃣ Para uso LOCAL (localhost):
echo    ├─ Use as portas HTTP (8765 e 3001)
echo    └─ Acesse site local se configurado
echo.
echo 2️⃣ Para uso GITHUB PAGES (adalbertobi.github.io):
echo    ├─ PRIMEIRO: https://adalbertobi.github.io/AdalbertoBI.whatintegra/setup.html
echo    ├─ Clique em "Autorizar Servidor de Autenticação" (porta 8766)
echo    ├─ Clique em "Autorizar Servidor WhatsApp" (porta 3002)  
echo    ├─ Clique em "Testar Conexão"
echo    └─ DEPOIS: https://adalbertobi.github.io/AdalbertoBI.whatintegra/
echo.
echo 🧪 TESTE DE CONECTIVIDADE:
echo    └─ Use o botão "🧪 Testar Conectividade" na página de login
echo.
echo ⚠️  IMPORTANTE: 
echo    ├─ GitHub Pages PRECISA dos servidores HTTPS autorizados!
echo    ├─ Mantenha os terminais abertos durante o uso
echo    └─ Você verá os logs das requisições em tempo real
echo.
echo 🛑 Para PARAR os servidores:
echo    ├─ Feche os terminais dos servidores
echo    ├─ Ou pressione Ctrl+C em cada terminal
echo    └─ Ou feche todas as janelas com títulos "WhatIntegra"
echo.

pause