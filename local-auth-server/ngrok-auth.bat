@echo off
echo 🚀 Iniciando tunel Ngrok para Servidor de Autenticacao (Porta 8765)
echo.
echo 📍 Aguardando conexao...
echo ⚠️  IMPORTANTE: Nao feche esta janela!
echo.
echo 🔗 URL publica sera exibida abaixo:
echo ================================================
..\..\site\ngrok.exe http 8765 --log stdout
pause