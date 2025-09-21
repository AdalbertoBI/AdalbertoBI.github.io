@echo off
title WhatIntegra - Git Commit & Railway Deploy
color 0A

echo ===============================================
echo   🚀 WHATINTEGRA - COMMIT & RAILWAY DEPLOY
echo ===============================================
echo.

echo 📋 Verificando status do Git...
cd D:\PROJETOS\WhatIntegra
git status --porcelain

echo.
echo 📦 Arquivos a serem commitados:
git diff --name-only HEAD

echo.
echo 🔄 Fazendo commit das alterações...
git add .
git commit -m "Configure Railway deployment - Add health checks, environment configs, and Railway-specific settings"

echo.
echo 🚀 Fazendo push para GitHub (trigger Railway deploy)...
git push origin main

echo.
echo ✅ Deploy iniciado!
echo.
echo 📊 Monitore o progresso em:
echo    https://railway.com/project/6244cb82-c15b-4067-9755-e6e7b18e36bf
echo.
echo 🌐 Após deploy, seus serviços estarão em:
echo    - Auth Server: https://[service-name].up.railway.app
echo    - WhatsApp Server: https://[service-name].up.railway.app  
echo    - Health Check: https://[service-name].up.railway.app/health
echo.
echo 💡 Configuração automática:
echo    O site GitHub Pages detectará automaticamente as URLs Railway
echo.

pause