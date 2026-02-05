@echo off
REM Script para iniciar o servidor Lâminas do Destino
REM Compatível com Windows PowerShell

cls
echo.
echo ======================================
echo   Lâminas do Destino - Backend Setup
echo ======================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não foi encontrado!
    echo.
    echo Por favor, instale Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version
echo.

REM Verificar se package.json existe
if not exist package.json (
    echo ❌ Arquivo package.json não encontrado!
    echo Por favor, execute este script na pasta raiz do projeto.
    echo.
    pause
    exit /b 1
)

REM Verificar se node_modules existe
if not exist node_modules (
    echo 📦 Instalando dependências...
    call npm install
    echo.
)

REM Verificar se .env existe
if not exist .env (
    echo ⚠️  Arquivo .env não encontrado!
    echo.
    echo Por favor, crie um arquivo .env com as seguintes configurações:
    echo.
    echo PORT=5000
    echo NODE_ENV=development
    echo EMAIL_SERVICE=gmail
    echo EMAIL_USER=seu_email@gmail.com
    echo EMAIL_PASSWORD=sua_senha_de_app
    echo EMAIL_FROM=contato@laminasdodestino.com
    echo ALLOWED_ORIGIN=http://localhost:5000
    echo CLIENT_URL=http://localhost:3000
    echo.
    echo Você pode copiar do .env.example:
    copy .env.example .env
    echo.
    echo Edite o arquivo .env com suas credenciais!
    echo.
)

REM Iniciar o servidor
echo 🌙 Iniciando Servidor Lâminas do Destino...
echo.
echo 🌐 Servidor rodando em: http://localhost:5000
echo 🧪 Página de teste: http://localhost:5000/teste-api.html
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm start

pause
