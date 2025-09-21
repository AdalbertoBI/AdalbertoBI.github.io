#!/bin/bash
# Railway startup script for WhatIntegra

echo "🚀 Iniciando WhatIntegra no Railway..."

# Configurar variáveis de ambiente
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=${PORT:-8080}

# Criar diretórios necessários
mkdir -p /app/data/whatsapp_session
mkdir -p /app/data

echo "📁 Diretórios criados:"
echo "  - /app/data"
echo "  - /app/data/whatsapp_session"

# Definir permissões
chmod -R 755 /app/data

echo "🔧 Configuração:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo "  - HOST: $HOST"

# Iniciar aplicação baseado na variável RAILWAY_SERVICE
if [ "$RAILWAY_SERVICE" = "whatsapp" ]; then
    echo "📱 Iniciando servidor WhatsApp..."
    exec node whatsapp-server.js
elif [ "$RAILWAY_SERVICE" = "auth" ]; then
    echo "🔐 Iniciando servidor de autenticação..."
    exec node server.js
else
    echo "🔄 Iniciando servidor de autenticação (padrão)..."
    exec node server.js
fi