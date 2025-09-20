// WhatIntegra - Configuração Global
// Configurações e constantes da aplicação

// === CONFIGURAÇÃO DE AMBIENTE ===
const isGitHub = location.hostname.includes('github.io') || location.hostname.includes('github.com');
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const isLocalHttpServer = location.port === '8080' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

// URLs baseadas no ambiente
// Para GitHub Pages: usar HTTPS na porta 8766 (servidor de autenticação) e 3002 (servidor WhatsApp)
// Para localhost ou http-server local: sempre usar HTTP na porta 8765 (servidor de autenticação) e 3001 (servidor WhatsApp)
const API_URL = (isGitHub && !isLocalHttpServer) ? 'https://127.0.0.1:8766/api' : 'http://127.0.0.1:8765/api';
const WHATSAPP_URL = (isGitHub && !isLocalHttpServer) ? 'https://127.0.0.1:3002' : 'http://127.0.0.1:3001';

// Debug da configuração com informações detalhadas
console.log('🔧 === WHATINTEGRA - CONFIGURAÇÃO INICIAL ===');
console.log('🌍 Informações do ambiente:', {
  hostname: location.hostname,
  protocol: location.protocol,
  port: location.port,
  pathname: location.pathname,
  origin: location.origin,
  userAgent: navigator.userAgent.substring(0, 100) + '...'
});
console.log('🎯 Detecção de ambiente:', {
  isGitHub: isGitHub,
  isLocalhost: isLocalhost,
  isLocalHttpServer: isLocalHttpServer,
  'GitHub detectado por': isGitHub ? 'hostname contém github.io ou github.com' : 'hostname não é GitHub',
  'Localhost detectado por': isLocalhost ? 'hostname é localhost ou 127.0.0.1' : 'hostname não é localhost',
  'HTTP Server local detectado por': isLocalHttpServer ? 'porta 8080 + localhost/127.0.0.1' : 'não é http-server local',
  'Configuração final': isLocalHttpServer ? 'FORÇANDO HTTP (Solução 3)' : (isGitHub ? 'GitHub Pages (HTTPS)' : 'Localhost (HTTP)')
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
let socket = null;
let currentUser = null;
let currentToken = null;
let currentChat = null;
let chats = [];
let messages = {};

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
    socket,
    currentUser,
    currentToken,
    currentChat,
    chats,
    messages
  }
};

console.log('✅ Configuração carregada:', window.WhatIntegra.config);