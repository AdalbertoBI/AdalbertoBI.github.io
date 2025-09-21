// WhatIntegra - Status do Servidor
// Exibe e gerencia a configuração do servidor na interface

// === MOSTRAR STATUS DO SERVIDOR ===
function updateServerStatusDisplay() {
  const serverStatusEl = document.getElementById('serverStatus');
  const currentServerHostEl = document.getElementById('currentServerHost');
  const serverSourceEl = document.getElementById('serverSource');
  const changeServerBtn = document.getElementById('changeServerBtn');
  
  if (!serverStatusEl || !window.WhatIntegra?.serverConfig) {
    return;
  }
  
  const config = window.WhatIntegra.serverConfig;
  
  // Atualizar informações
  if (currentServerHostEl) {
    currentServerHostEl.textContent = config.SERVER_HOST;
  }
  
  if (serverSourceEl) {
    const sourceText = {
      'manual': '👤 Configuração manual',
      'auto-detected': '🤖 Detectado automaticamente', 
      'auto-fallback': '⚠️ Configuração temporária'
    };
    serverSourceEl.textContent = sourceText[config.source] || 'Configuração padrão';
  }
  
  // Mostrar status
  serverStatusEl.classList.remove('hidden');
  
  // Configurar botão de alteração
  if (changeServerBtn) {
    changeServerBtn.onclick = () => {
      if (window.showServerConfigHelper) {
        window.showServerConfigHelper({
          strategy: 'manual-change',
          suggestedIPs: ['192.168.1.100', '192.168.0.100', '10.0.0.100']
        });
      } else {
        // Fallback para página de configuração
        window.open('./setup-servidor.html', '_blank');
      }
    };
  }
}

// === INICIALIZAR QUANDO DOM ESTIVER PRONTO ===
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateServerStatusDisplay);
} else {
  updateServerStatusDisplay();
}

// === ATUALIZAR QUANDO CONFIGURAÇÃO MUDAR ===
window.addEventListener('storage', (e) => {
  if (e.key === 'whatintegra_server_host') {
    setTimeout(() => {
      location.reload(); // Recarregar para aplicar nova configuração
    }, 500);
  }
});

console.log('📊 Sistema de status do servidor carregado');