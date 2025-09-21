// WhatIntegra - Configuração Global
// Configurações e constantes da aplicação

// === CONFIGURAÇÃO DO SERVIDOR ===
// Obter configuração do servidor (definida pelo sistema inteligente)
const serverConfig = window.WhatIntegra?.serverConfig || {
  SERVER_HOST: '192.168.1.4', // IP padrão da máquina atual
  AUTH_HTTP_PORT: 8765,
  AUTH_HTTPS_PORT: 8766,
  WHATSAPP_HTTP_PORT: 3001,
  WHATSAPP_HTTPS_PORT: 3002
};

const SERVER_HOST = serverConfig.SERVER_HOST;

// === CONFIGURAÇÃO DE AMBIENTE ===
const isGitHub = location.hostname.includes('github.io') || location.hostname.includes('github.com');
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const isLocalHttpServer = location.port === '8080' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

// URLs baseadas no ambiente e servidor configurado
const API_URL = (isGitHub && !isLocalHttpServer) ? 
  `https://${SERVER_HOST}:${serverConfig.AUTH_HTTPS_PORT}/api` : 
  `http://${SERVER_HOST}:${serverConfig.AUTH_HTTP_PORT}/api`;

const WHATSAPP_URL = (isGitHub && !isLocalHttpServer) ? 
  `https://${SERVER_HOST}:${serverConfig.WHATSAPP_HTTPS_PORT}` : 
  `http://${SERVER_HOST}:${serverConfig.WHATSAPP_HTTP_PORT}`;

// Debug da configuração com informações detalhadas
console.log('🔧 === WHATINTEGRA - CONFIGURAÇÃO INICIAL ===');
console.log('🖥️ Servidor configurado:', {
  SERVER_HOST: SERVER_HOST,
  'Tipo de acesso': SERVER_HOST === '127.0.0.1' || SERVER_HOST === 'localhost' ? 
    '🏠 LOCAL (mesma máquina)' : 
    '🌐 REMOTO (acesso de qualquer lugar)',
  'Portas': serverConfig
});
console.log('🌍 Informações do ambiente:', {
  hostname: location.hostname,
  protocol: location.protocol,
  port: location.port,
  origin: location.origin,
  userAgent: navigator.userAgent.substring(0, 50) + '...'
});
console.log('🎯 Detecção de ambiente:', {
  isGitHub: isGitHub,
  isLocalhost: isLocalhost,
  isLocalHttpServer: isLocalHttpServer
});
console.log('🔗 URLs configuradas:', {
  API_URL: API_URL,
  WHATSAPP_URL: WHATSAPP_URL,
  'Protocolo da API': API_URL.split(':')[0],
  'Protocolo do WhatsApp': WHATSAPP_URL.split(':')[0],
  'Configuração aplicada': isLocalHttpServer ? '🔓 HTTP FORÇADO (Solução 3)' : (isGitHub ? '🔒 HTTPS GitHub' : '🔓 HTTP Localhost')
});
console.log('💾 Estado do localStorage:', {
  hasStoredUser: !!localStorage.getItem('wi_user'),
  hasStoredToken: !!localStorage.getItem('wi_token'),
  hasServersAuthorized: !!localStorage.getItem('servers_authorized'),
  storedUser: localStorage.getItem('wi_user') || 'nenhum',
  tokenPreview: localStorage.getItem('wi_token') ? localStorage.getItem('wi_token').substring(0, 20) + '...' : 'nenhum'
});
console.log('🕐 Timestamp de inicialização:', new Date().toLocaleString('pt-BR'));
console.log('================================================');

// === ESTADO GLOBAL DA APLICAÇÃO ===
let currentUser = null;
let currentToken = null;

// === EXPORTAR PARA ESCOPO GLOBAL ===
window.WhatIntegra = {
  config: {
    isGitHub,
    isLocalhost,
    isLocalHttpServer,
    API_URL,
    WHATSAPP_URL
  },
  state: {
    currentUser,
    currentToken
  }
};

console.log('✅ Configuração carregada:', window.WhatIntegra.config);