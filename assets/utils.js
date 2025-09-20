// WhatIntegra - Funções Utilitárias
// Funções auxiliares e utilitárias

// === FUNÇÕES DE UI ===

function setStatus(msg, type = '') {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  statusEl.textContent = msg || '';
  statusEl.className = 'status';
  if (type) statusEl.classList.add(type);
}

function setLoading(loading, button) {
  if (!button) {
    button = document.getElementById('loginBtn');
  }
  if (!button) return;
  button.disabled = loading;
  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;
  button.textContent = loading ? 'Aguarde...' : originalText;
}

// === FUNÇÕES DE TEMPO ===

function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (messageDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}

function formatChatTime(timestamp) {
  return formatTime(timestamp);
}

// === FUNÇÕES DE VALIDAÇÃO ===

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function sanitizeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === FUNÇÕES DE REDE ===

// Função auxiliar para testar conectividade e fazer fallback HTTP se necessário
async function tryConnection(url, options = {}) {
  console.log('🔗 Testando conexão com:', url);
  
  try {
    const response = await fetch(url, options);
    console.log('✅ Conexão bem-sucedida:', { url, status: response.status });
    return { success: true, response, url };
  } catch (error) {
    console.log('❌ Falha na conexão HTTPS:', { url, error: error.message });
    
    // Se estamos no GitHub e a URL é HTTPS, tentar HTTP como fallback
    if (window.WhatIntegra.config.isGitHub && url.startsWith('https://')) {
      const httpUrl = url.replace('https://', 'http://').replace(':8766', ':8765').replace(':3002', ':3001');
      console.log('🔄 Tentando fallback HTTP:', httpUrl);
      
      try {
        const httpResponse = await fetch(httpUrl, options);
        console.log('✅ Fallback HTTP bem-sucedido:', { httpUrl, status: httpResponse.status });
        console.log('⚠️ Aviso: Usando HTTP (menos seguro) devido a problemas com HTTPS');
        return { success: true, response: httpResponse, url: httpUrl, isHttp: true };
      } catch (httpError) {
        console.log('❌ Fallback HTTP também falhou:', { httpUrl, error: httpError.message });
        throw error; // Lança o erro original
      }
    } else {
      throw error;
    }
  }
}

// === FUNÇÕES DE AVATAR ===

function getContactName(contactId) {
  const contact = chats.find(chat => chat.id === contactId);
  if (contact && contact.name) return contact.name;
  
  return contactId.split('@')[0].replace(/\D/g, '');
}

function getAvatarEmoji(name) {
  if (!name) return '👤';
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const emojis = ['👤', '🧑', '👩', '👨', '🙋', '🙋‍♀️', '🙋‍♂️', '👷', '👩‍💼', '👨‍💼'];
  return emojis[Math.abs(hash) % emojis.length];
}

// === EXPORTAR PARA ESCOPO GLOBAL ===
window.WhatIntegra = window.WhatIntegra || {};
window.WhatIntegra.utils = {
  setStatus,
  setLoading,
  formatTime,
  formatChatTime,
  isValidUrl,
  sanitizeHtml,
  tryConnection,
  getContactName,
  getAvatarEmoji
};

console.log('✅ Utilitários carregados');