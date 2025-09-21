#!/bin/sh
# Script de inicialização para container Docker

# Configurar variáveis de ambiente
export PORT=${PORT:-8080}
export NODE_ENV=${NODE_ENV:-production}

echo "🚀 Iniciando WhatIntegra..."
echo "📍 Porta: $PORT"
echo "🌍 Ambiente: $NODE_ENV"

# Iniciar servidor de autenticação em background
echo "🔐 Iniciando servidor de autenticação..."
node server.js &

# Aguardar um pouco para o servidor de auth subir
sleep 5

# Iniciar servidor WhatsApp
echo "📱 Iniciando servidor WhatsApp..."
node whatsapp-server.js &

# Aguardar processos
wait