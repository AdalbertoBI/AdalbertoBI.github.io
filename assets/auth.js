// WhatIntegra - Autenticação
// Funções de login, logout e gerenciamento de sessão

// === FUNÇÕES DE AUTENTICAÇÃO ===

async function login(username, password) {
  const config = window.WhatIntegra.config;
  
  console.log('🔑 === TENTATIVA DE LOGIN ===');
  console.log('👤 Usuário:', username);
  console.log('🔗 URL de autenticação:', `${config.API_URL}/login`);
  
  try {
    window.WhatIntegra.utils.setStatus('Conectando...', 'info');
    
    const res = await fetch(`${config.API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    console.log('📡 Resposta do servidor:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      url: res.url,
      headers: [...res.headers.entries()]
    });
    
    let data = {};
    try {
      const responseText = await res.text();
      console.log('📄 Texto bruto da resposta:', responseText);
      data = responseText ? JSON.parse(responseText) : {};
      console.log('📊 Dados parseados da resposta:', data);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON da resposta:', parseError);
      console.log('⚠️ Continuando com objeto vazio');
    }
    
    if (!res.ok) {
      console.error('❌ Erro no login - Status:', res.status);
      console.error('❌ Erro no login - Data:', data);
      console.error('❌ Erro no login - Headers:', [...res.headers.entries()]);
      throw new Error(data?.error || `Erro HTTP ${res.status}: ${res.statusText}`);
    }

    const { token } = data;
    if (!token) {
      console.error('❌ Token não encontrado na resposta:', data);
      throw new Error('Token não recebido do servidor');
    }

    console.log('🎫 Token recebido:', token.substring(0, 20) + '...');
    
    localStorage.setItem('wi_user', username);
    localStorage.setItem('wi_token', token);
    localStorage.setItem('servers_authorized', 'true');
    
    // Atualizar estado global
    window.WhatIntegra.state.currentUser = username;
    window.WhatIntegra.state.currentToken = token;
    
    console.log('✅ Login bem-sucedido para:', username);
    console.log('✅ Dados armazenados no localStorage');
    window.WhatIntegra.utils.setStatus('Autenticado com sucesso!', 'success');
    
    // Redirecionar para interface do WhatsApp
    setTimeout(() => {
      console.log('🔄 Redirecionando para interface WhatsApp...');
      window.WhatIntegra.ui.showWhatsAppInterface();
    }, 500);
    
  } catch (err) {
    console.error('❌ Erro detalhado no login:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause
    });
    
    if (err.name === 'TypeError') {
      console.error('🔍 TypeError - Provavelmente problema de rede ou CORS:', err.message);
      if (err.message.includes('Failed to fetch')) {
        console.error('🌐 Failed to fetch - Possíveis causas:');
        console.error('   1. Servidor não está rodando');
        console.error('   2. CORS bloqueado');
        console.error('   3. Mixed Content (HTTP/HTTPS)');
        console.error('   4. Certificado SSL rejeitado');
      }
    } else if (err.name === 'SyntaxError') {
      console.error('📝 SyntaxError - Resposta não é JSON válido:', err.message);
    } else if (err.name === 'AbortError') {
      console.error('⏱️ AbortError - Requisição foi cancelada:', err.message);
    } else {
      console.error('❓ Tipo de erro desconhecido:', err.name);
    }

    if (err.message.includes('Failed to fetch') || err.message.includes('TypeError')) {
      console.error('🔗 Erro de conectividade detectado');
      window.WhatIntegra.utils.setStatus('❌ Erro de conectividade. Verifique se os servidores estão rodando.', 'error');
    } else if (err.message.includes('NetworkError') || err.message.includes('CORS')) {
      console.error('🌐 Erro de rede/CORS detectado');
      window.WhatIntegra.utils.setStatus('❌ Erro de rede ou CORS. Verifique a configuração dos servidores.', 'error');
    } else {
      console.error('❓ Erro genérico:', err.message);
      window.WhatIntegra.utils.setStatus(err.message || 'Erro ao autenticar', 'error');
    }
  }
}

async function trySession() {
  const token = localStorage.getItem('wi_token');
  const user = localStorage.getItem('wi_user');
  
  if (!token || !user) {
    console.log('🚫 Sem sessão salva');
    return false;
  }
  
  console.log('🔄 Tentando restaurar sessão para:', user);
  
  try {
    window.WhatIntegra.state.currentUser = user;
    window.WhatIntegra.state.currentToken = token;
    
    console.log('✅ Sessão restaurada com sucesso');
    window.WhatIntegra.ui.showWhatsAppInterface();
    return true;
  } catch (err) {
    console.error('❌ Erro ao restaurar sessão:', err);
    localStorage.removeItem('wi_user');
    localStorage.removeItem('wi_token');
    return false;
  }
}

function logout() {
  localStorage.removeItem('wi_user');
  localStorage.removeItem('wi_token');
  window.WhatIntegra.state.currentUser = null;
  window.WhatIntegra.state.currentToken = null;
  
  if (window.WhatIntegra.state.socket) {
    window.WhatIntegra.state.socket.disconnect();
    window.WhatIntegra.state.socket = null;
  }
  
  window.WhatIntegra.ui.showLoginScreen();
}

// === EXPORTAR PARA ESCOPO GLOBAL ===
window.WhatIntegra = window.WhatIntegra || {};
window.WhatIntegra.auth = {
  login,
  trySession,
  logout
};

console.log('✅ Autenticação carregada');