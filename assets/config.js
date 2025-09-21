// WhatIntegra - Configuração Global
// Configurações e constantes da aplicação

// === CONFIGURAÇÃO INTELIGENTE DE AMBIENTE ===
const isGitHub = location.hostname.includes('github.io') || location.hostname.includes('github.com');
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const isLocalHttpServer = location.port === '8080' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
const isNgrok = location.hostname.includes('ngrok') || location.hostname.includes('ngrok-free.app');
const isRailway = location.hostname.includes('railway.app') || location.hostname.includes('up.railway.app');
const isCustomDomain = location.hostname.includes('whatintegra.com');

// === CONFIGURAÇÃO INTELIGENTE DE URLs ===
let API_URL, WHATSAPP_URL;

if (isCustomDomain) {
    // Domínio personalizado - usar subdomínios
    API_URL = 'https://api.whatintegra.com/api';
    WHATSAPP_URL = 'https://whatsapp.whatintegra.com';
} else if (isRailway) {
    // Railway - serviços separados
    API_URL = 'https://wonderful-rebirth-production-c173.up.railway.app/api';
    WHATSAPP_URL = 'https://adalbertobiwhatintegra-production.up.railway.app';
} else if (isNgrok) {
    // Se estamos acessando via Ngrok, usar URLs específicas configuradas
    // Essas URLs devem ser atualizadas quando os túneis Ngrok forem criados
    API_URL = prompt('🔗 Digite a URL do túnel Ngrok para o servidor de autenticação:\n(ex: https://abc123.ngrok-free.app/api)') || 'http://127.0.0.1:8765/api';
    WHATSAPP_URL = prompt('📱 Digite a URL do túnel Ngrok para o servidor WhatsApp:\n(ex: https://xyz789.ngrok-free.app)') || 'http://127.0.0.1:3001';
} else if (isGitHub && !isLocalHttpServer) {
    // GitHub Pages: usar HTTPS na porta 8766 (servidor de autenticação) e 3002 (servidor WhatsApp)
    API_URL = 'https://186.249.152.5:8766/api';
    WHATSAPP_URL = 'https://186.249.152.5:3002';
} else {
    // Localhost ou http-server local: sempre usar HTTP na porta 8765 (servidor de autenticação) e 3001 (servidor WhatsApp)
    API_URL = 'http://127.0.0.1:8765/api';
    WHATSAPP_URL = 'http://127.0.0.1:3001';
}

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