// Teste de Configuração WhatIntegra
// Execute este arquivo no console do navegador para verificar as configurações

console.log('🧪 === TESTE DE CONFIGURAÇÃO WHATINTEGRA ===');

// Simular a detecção de ambiente como no config.js
const isGitHub = location.hostname.includes('github.io') || location.hostname.includes('github.com');
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const isLocalHttpServer = (location.port === '8080' || location.port === '5500') && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
const isNgrok = location.hostname.includes('ngrok') || location.hostname.includes('ngrok-free.app');
const isRailway = location.hostname.includes('railway.app') || location.hostname.includes('up.railway.app');
const isCustomDomain = location.hostname.includes('whatintegra.com');

console.log('🌍 Ambiente atual:', {
  hostname: location.hostname,
  port: location.port,
  protocol: location.protocol,
  origin: location.origin
});

console.log('🔍 Detecção de ambiente:', {
  isGitHub,
  isLocalhost,
  isLocalHttpServer,
  isNgrok,
  isRailway,
  isCustomDomain
});

// Determinar URLs como no config.js
let API_URL, WHATSAPP_URL;

if (isCustomDomain) {
  API_URL = 'https://api.whatintegra.com/api';
  WHATSAPP_URL = 'https://whatsapp.whatintegra.com';
} else if (isRailway) {
  API_URL = 'https://wonderful-rebirth-production-c173.up.railway.app/api';
  WHATSAPP_URL = 'https://adalbertobiwhatintegra-production.up.railway.app';
} else if (isNgrok) {
  API_URL = 'http://127.0.0.1:8765/api';
  WHATSAPP_URL = 'http://127.0.0.1:3001';
} else if (isGitHub && !isLocalHttpServer) {
  API_URL = 'https://186.249.152.5:8766/api';
  WHATSAPP_URL = 'https://186.249.152.5:3002';
} else if (isLocalHttpServer) {
  API_URL = 'https://wonderful-rebirth-production-c173.up.railway.app/api';
  WHATSAPP_URL = 'https://adalbertobiwhatintegra-production.up.railway.app';
} else {
  API_URL = 'http://127.0.0.1:8765/api';
  WHATSAPP_URL = 'http://127.0.0.1:3001';
}

console.log('🔗 URLs configuradas:', {
  API_URL,
  WHATSAPP_URL,
  'Configuração': isCustomDomain ? 'Domínio Personalizado' : (isRailway ? 'Railway Cloud' : (isLocalHttpServer ? 'Servidor HTTP Local (Railway)' : (isNgrok ? 'Ngrok Tunnel' : (isGitHub ? 'GitHub Pages' : 'Localhost Desenvolvimento'))))
});

console.log('✅ Teste concluído - verifique se as URLs estão corretas para Railway');