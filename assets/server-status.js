// WhatIntegra - Status do Servidor
// Exibe e gerencia a configuração do servidor na interface

// === MOSTRAR STATUS DO SERVIDOR ===
function updateServerStatusDisplay() {
  const serverStatusEl = document.getElementById('serverStatus');
  const currentServerHostEl = document.getElementById('currentServerHost');
  const serverSourceEl = document.getElementById('serverSource');
  
  if (!serverStatusEl) {
    return;
  }
  
  // Configuração fixa para Railway Cloud
  if (currentServerHostEl) {
    currentServerHostEl.textContent = 'Railway Cloud';
  }
  
  if (serverSourceEl) {
    serverSourceEl.textContent = 'Configuração automática - Não alterar';
  }
  
  // Mostrar status
  serverStatusEl.classList.remove('hidden');
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