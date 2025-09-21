// WhatIntegra - Auto-Configuração de Servidor
// Detecta automaticamente o melhor servidor baseado no contexto de acesso

// === AUTO-DETECÇÃO INTELIGENTE ===
function autoDetectServerConfig() {
  const currentHostname = location.hostname;
  const isGitHubPages = currentHostname.includes('github.io');
  
  console.log('🔍 Auto-detectando configuração de servidor...');
  console.log('📱 Acessando de:', currentHostname);
  
  // Se está no GitHub Pages, precisa descobrir o IP do servidor
  if (isGitHubPages) {
    // Tentar IPs comuns de rede local
    const commonLocalIPs = [
      '192.168.1.1',   // Gateway comum
      '192.168.0.1',   // Gateway comum
      '192.168.1.100', // IP comum
      '192.168.1.101',
      '192.168.1.102',
      '192.168.0.100',
      '192.168.0.101',
      '10.0.0.1',      // Redes corporativas
      '172.16.0.1'     // Outras redes
    ];
    
    return {
      strategy: 'github-pages-mobile',
      suggestedIPs: commonLocalIPs,
      needsUserConfiguration: true
    };
  }
  
  // Se é localhost, usar localhost
  if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
    return {
      strategy: 'localhost',
      SERVER_HOST: '127.0.0.1',
      needsUserConfiguration: false
    };
  }
  
  // Se é um IP específico, assume que é o próprio servidor
  return {
    strategy: 'direct-ip',
    SERVER_HOST: currentHostname,
    needsUserConfiguration: false
  };
}

// === CONFIGURAÇÃO INTELIGENTE ===
function getIntelligentServerConfig() {
  const autoConfig = autoDetectServerConfig();
  
  // Configuração salva manualmente pelo usuário tem prioridade
  const manualConfig = localStorage.getItem('whatintegra_server_host');
  if (manualConfig && manualConfig.trim()) {
    console.log('✅ Usando configuração manual:', manualConfig);
    return {
      SERVER_HOST: manualConfig.trim(),
      AUTH_HTTP_PORT: 8765,
      AUTH_HTTPS_PORT: 8766,
      WHATSAPP_HTTP_PORT: 3001,
      WHATSAPP_HTTPS_PORT: 3002,
      source: 'manual'
    };
  }
  
  // Auto-configuração baseada no contexto
  if (autoConfig.needsUserConfiguration) {
    console.warn('⚠️ Acesso remoto detectado! Configuração necessária.');
    console.log('💡 Sugestões de IP:', autoConfig.suggestedIPs);
    
    // Mostrar helper para configuração
    showServerConfigHelper(autoConfig);
    
    // Usar o primeiro IP sugerido como fallback
    return {
      SERVER_HOST: autoConfig.suggestedIPs[0],
      AUTH_HTTP_PORT: 8765,
      AUTH_HTTPS_PORT: 8766,
      WHATSAPP_HTTP_PORT: 3001,
      WHATSAPP_HTTPS_PORT: 3002,
      source: 'auto-fallback',
      needsConfiguration: true
    };
  }
  
  return {
    SERVER_HOST: autoConfig.SERVER_HOST,
    AUTH_HTTP_PORT: 8765,
    AUTH_HTTPS_PORT: 8766,
    WHATSAPP_HTTP_PORT: 3001,
    WHATSAPP_HTTPS_PORT: 3002,
    source: 'auto-detected'
  };
}

// === HELPER VISUAL ===
function showServerConfigHelper(autoConfig) {
  // Criar modal de configuração rápida
  const modal = document.createElement('div');
  modal.id = 'server-config-modal';
  modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 16px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <h2 style="margin: 0 0 20px; color: #333;">🖥️ Configuração de Servidor</h2>
        <p style="margin: 0 0 20px; color: #666;">
          Você está acessando de um dispositivo remoto.<br>
          Qual é o IP da máquina que roda os servidores?
        </p>
        
        <div style="margin: 20px 0;">
          <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">
            IP do Servidor:
          </label>
          <input 
            id="quick-server-ip" 
            type="text" 
            placeholder="Ex: 192.168.1.100"
            style="
              width: 100%;
              padding: 12px;
              border: 2px solid #ddd;
              border-radius: 8px;
              font-size: 16px;
              text-align: center;
            "
          />
        </div>
        
        <div style="margin: 20px 0; font-size: 14px; color: #888;">
          Sugestões: ${autoConfig.suggestedIPs.slice(0, 3).join(', ')}
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button 
            onclick="applyQuickConfig()" 
            style="
              background: #25d366;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            ✅ Aplicar
          </button>
          <button 
            onclick="closeConfigModal()" 
            style="
              background: #ccc;
              color: #666;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            ❌ Cancelar
          </button>
        </div>
        
        <div style="margin-top: 20px; font-size: 12px; color: #999;">
          💡 Dica: Vá em <strong>setup-servidor.html</strong> para configuração detalhada
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focar no input
  setTimeout(() => {
    document.getElementById('quick-server-ip').focus();
  }, 100);
}

// === FUNÇÕES GLOBAIS PARA O MODAL ===
window.applyQuickConfig = function() {
  const ip = document.getElementById('quick-server-ip').value.trim();
  if (ip) {
    localStorage.setItem('whatintegra_server_host', ip);
    console.log('✅ Configuração aplicada:', ip);
    
    // Recarregar a página para aplicar a nova configuração
    location.reload();
  }
};

window.closeConfigModal = function() {
  const modal = document.getElementById('server-config-modal');
  if (modal) modal.remove();
};

// === CONFIGURAÇÃO PRINCIPAL ===
window.WhatIntegra = window.WhatIntegra || {};
window.WhatIntegra.serverConfig = getIntelligentServerConfig();

console.log('🤖 Configuração inteligente aplicada:', window.WhatIntegra.serverConfig);