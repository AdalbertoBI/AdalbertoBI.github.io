// WhatIntegra - Aplicação Principal
// Coordenação dos módulos e inicialização

// === INICIALIZAÇÃO DA APLICAÇÃO ===

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('username');
  const password = params.get('password');
  
  if (username && password) {
    console.log('🔗 Parâmetros de URL detectados, fazendo login automático');
    
    // Preencher formulário
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) usernameInput.value = decodeURIComponent(username);
    if (passwordInput) passwordInput.value = decodeURIComponent(password);
    
    // Fazer login automático
    setTimeout(() => {
      if (window.WhatIntegra.auth) {
        window.WhatIntegra.auth.login(decodeURIComponent(username), decodeURIComponent(password));
      }
    }, 100);
    
    return true;
  }
  
  return false;
}

// === EVENT LISTENERS ===

function setupEventListeners() {
  console.log('🎯 Configurando event listeners');
  
  // Login form
  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (username && password && window.WhatIntegra.auth) {
      await window.WhatIntegra.auth.login(username, password);
    }
  });
  
  // Test connection button
  const testBtn = document.getElementById('testConnectionBtn');
  testBtn?.addEventListener('click', async () => {
    if (window.WhatIntegra.connectivity && window.WhatIntegra.connectivity.testConnectivity) {
      await window.WhatIntegra.connectivity.testConnectivity();
    }
  });
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', () => {
    if (window.WhatIntegra.auth) {
      window.WhatIntegra.auth.logout();
    }
  });
  
  console.log('✅ Event listeners configurados');
}

// === INICIALIZAÇÃO QUANDO DOM ESTIVER PRONTO ===

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 WhatIntegra inicializando...');
  
  // Verificar se todos os módulos estão carregados
  const requiredModules = ['config', 'utils', 'connectivity', 'auth', 'ui', 'whatsapp'];
  const missingModules = requiredModules.filter(module => !window.WhatIntegra[module]);
  
  if (missingModules.length > 0) {
    console.error('❌ Módulos não carregados:', missingModules);
    window.WhatIntegra.utils?.setStatus('❌ Erro ao carregar módulos: ' + missingModules.join(', '), 'error');
    return;
  }
  
  console.log('✅ Todos os módulos carregados');
  
  // Configurar event listeners
  setupEventListeners();
  
  // Verificar parâmetros de URL primeiro
  const hasUrlParams = checkUrlParams();
  
  if (!hasUrlParams) {
    // Tentar restaurar sessão
    const hasSession = await window.WhatIntegra.auth.trySession();
    
    if (!hasSession) {
      // Mostrar tela de login
      window.WhatIntegra.ui.showLoginScreen();
    }
  }
  
  console.log('✅ WhatIntegra inicializado com sucesso');
});

// === VISIBILIDADE DA PÁGINA ===

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.WhatIntegra.state.currentUser && window.WhatIntegra.state.socket && !window.WhatIntegra.state.socket.connected) {
    console.log('🔄 Página voltou ao foco, tentando reconectar...');
    if (window.WhatIntegra.whatsapp && window.WhatIntegra.whatsapp.connectWebSocket) {
      window.WhatIntegra.whatsapp.connectWebSocket();
    }
  }
});

console.log('✅ App principal carregado');