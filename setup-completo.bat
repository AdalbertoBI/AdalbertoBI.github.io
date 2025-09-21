@echo off
echo.
echo ======================================
echo     WHATINTEGRA - SETUP COMPLETO
echo ======================================
echo.

echo [1/4] Instalando dependencias do servidor...
cd /d "%~dp0\local-auth-server"
call npm install

echo.
echo [2/4] Configurando certificados SSL...
if not exist "cert.pem" (
    echo Gerando certificados SSL...
    call node generate-ssl-certs.js
) else (
    echo Certificados SSL ja existem.
)

echo.
echo [3/4] Criando usuario inicial...
if not exist "data\users.json" (
    echo Criando usuario 'admin' com senha 'admin123'...
    call node create-user.js admin admin123
) else (
    echo Arquivo de usuarios ja existe.
)

echo.
echo [4/4] Testando servidores...
echo Iniciando servidores de teste...
start "Auth Server Test" cmd /c "node server.js & timeout /t 5 & exit"
timeout /t 3 > nul
start "WhatsApp Server Test" cmd /c "node whatsapp-server.js & timeout /t 5 & exit"

echo.
echo ======================================
echo         SETUP CONCLUIDO!
echo ======================================
echo.
echo PROXIMOS PASSOS:
echo.
echo 1. Configure o IP do servidor em: setup-servidor.html
echo    - Local: 127.0.0.1 (mesma maquina)  
echo    - Remoto: IP da maquina servidor
echo.
echo 2. Inicie os servidores:
echo    .\iniciar-servidores.bat
echo.  
echo 3. Publique no GitHub Pages:
echo    .\publish-site.ps1
echo.
echo 4. Acesse o site e faca login com:
echo    Usuario: admin
echo    Senha: admin123
echo.
echo 5. Escaneie o QR Code do WhatsApp (apenas uma vez)
echo.
echo ======================================
echo   Pressione qualquer tecla para sair
echo ======================================
pause > nul