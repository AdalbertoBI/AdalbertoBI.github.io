# Dockerfile para WhatIntegra
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do Chrome para WhatsApp Web
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar Chromium do sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copiar arquivos do servidor
COPY local-auth-server/package*.json ./
RUN npm install --only=production

# Copiar código fonte
COPY local-auth-server/ ./

# Criar diretório para dados persistentes
RUN mkdir -p /app/data/whatsapp_session

# Expor portas
EXPOSE 8080 3001

# Script de inicialização
COPY docker-start.sh ./
RUN chmod +x docker-start.sh

# Comando de inicialização
CMD ["./docker-start.sh"]