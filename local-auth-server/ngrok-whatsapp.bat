@echo off
echo 📱 Iniciando tunel Ngrok para Servidor WhatsApp (Porta 3001)
echo.
echo 📍 Aguardando conexao...
echo ⚠️  IMPORTANTE: Nao feche esta janela!
echo.
echo 🔗 URL publica sera exibida abaixo:
echo ================================================
..\..\site\ngrok.exe http 3001 --log stdout
pause