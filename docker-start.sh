#!/bin/sh
# Script de inicialização para container Docker

# Configurar variáveis de ambiente
export PORT=${PORT:-8080}
export WHATSAPP_PORT=$((${PORT:-8080} + 1000))
export NODE_ENV=${NODE_ENV:-production}

echo "🚀 Iniciando WhatIntegra..."
echo "📍 Porta Principal (Auth): $PORT"
echo "📍 Porta WhatsApp: $WHATSAPP_PORT"
echo "🌍 Ambiente: $NODE_ENV"

# Iniciar servidor de autenticação (que agora inclui proxy para WhatsApp)
echo "� Iniciando servidor de autenticação..."
node server.js