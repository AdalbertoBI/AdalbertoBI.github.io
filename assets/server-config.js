// WhatIntegra - Configuração do Servidor
// Configure aqui o IP/domínio da máquina que roda os servidores

// === INSTRUÇÕES DE USO ===
// 
// 🏠 PARA USO LOCAL (mesma máquina):
// SERVER_HOST = '127.0.0.1' ou 'localhost'
//
// 🌐 PARA ACESSO REMOTO (máquinas diferentes):
// SERVER_HOST = 'IP_DA_MÁQUINA_SERVIDOR'
//
// Exemplos:
// - Rede local: '192.168.1.100' (IP da máquina na rede local)
// - IP público: '203.0.113.42' (IP público da máquina/roteador)
// - Domínio: 'meuservidor.com.br' (domínio apontando para a máquina)
// - DynDNS: 'minhacasa.ddns.net' (serviço de DNS dinâmico)
//
// ⚠️ IMPORTANTE: 
// - A máquina servidor deve ter as portas 8765, 8766, 3001, 3002 abertas
// - Para IP público, configure port forwarding no roteador
// - Para HTTPS, são necessários certificados SSL válidos

window.WhatIntegra = window.WhatIntegra || {};

// Função para carregar configuração (localStorage tem prioridade)
function loadServerConfig() {
  // Tenta carregar configuração salva no navegador
  const savedHost = localStorage.getItem('whatintegra_server_host');
  
  // Configuração padrão
  const config = {
    SERVER_HOST: '127.0.0.1',
    AUTH_HTTP_PORT: 8765,
    AUTH_HTTPS_PORT: 8766,
    WHATSAPP_HTTP_PORT: 3001,
    WHATSAPP_HTTPS_PORT: 3002
  };
  
  // Se existe configuração salva, usar ela
  if (savedHost && savedHost.trim()) {
    config.SERVER_HOST = savedHost.trim();
    console.log('🔧 WhatIntegra: Configuração salva carregada ->', savedHost);
  } else {
    console.log('🔧 WhatIntegra: Usando configuração padrão (local)');
  }
  
  return config;
}

// Carregar e aplicar configuração
window.WhatIntegra.serverConfig = loadServerConfig();

// Funções para gerenciar configuração
window.WhatIntegra.setServerHost = function(newHost) {
  if (newHost && typeof newHost === 'string' && newHost.trim()) {
    localStorage.setItem('whatintegra_server_host', newHost.trim());
    window.WhatIntegra.serverConfig.SERVER_HOST = newHost.trim();
    console.log('✅ WhatIntegra: Nova configuração salva ->', newHost.trim());
    return true;
  }
  console.error('❌ WhatIntegra: Host inválido:', newHost);
  return false;
};

window.WhatIntegra.resetServerConfig = function() {
  localStorage.removeItem('whatintegra_server_host');
  window.WhatIntegra.serverConfig = loadServerConfig();
  console.log('🔄 WhatIntegra: Configuração resetada para padrão');
};

console.log('⚙️ Configuração de servidor carregada:', window.WhatIntegra.serverConfig);