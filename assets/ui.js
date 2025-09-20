// WhatIntegra - Interface do Usuário
// Funções para controle de telas e elementos da interface

// === ELEMENTOS DOM ===
const loginScreen = document.getElementById('loginScreen');
const whatsappScreen = document.getElementById('whatsappScreen');
const qrScreen = document.getElementById('qrScreen');
const mainInterface = document.getElementById('mainInterface');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatContainer = document.getElementById('chatContainer');
const displayUser = document.getElementById('displayUser');

// === FUNÇÕES DE NAVEGAÇÃO ENTRE TELAS ===

function showLoginScreen() {
  console.log('📱 Mostrando tela de login');
  
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (whatsappScreen) whatsappScreen.classList.add('hidden');
  if (qrScreen) qrScreen.classList.add('hidden');
  if (mainInterface) mainInterface.classList.add('hidden');
  
  // Limpar formulário
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
}

function showWhatsAppInterface() {
  console.log('🚀 Mostrando interface WhatsApp');
  
  // Primeiro, mostrar a tela do WhatsApp
  if (loginScreen) loginScreen.classList.add('hidden');
  if (whatsappScreen) whatsappScreen.classList.remove('hidden');
  if (displayUser && window.WhatIntegra.state.currentUser) {
    displayUser.textContent = window.WhatIntegra.state.currentUser;
  }
  
  // Aguardar um frame para garantir que o DOM está renderizado
  setTimeout(() => {
    // Inicializar módulo WhatsApp
    if (window.WhatIntegra.whatsapp && window.WhatIntegra.whatsapp.initializeWhatsApp) {
      console.log('🔄 Inicializando módulo WhatsApp...');
      window.WhatIntegra.whatsapp.initializeWhatsApp();
    }
    
    // Mostrar tela QR inicialmente enquanto conecta
    showQRScreen();
    
    // Conectar WebSocket
    if (window.WhatIntegra.whatsapp && window.WhatIntegra.whatsapp.connectWebSocket) {
      console.log('🔌 Conectando WebSocket...');
      window.WhatIntegra.whatsapp.connectWebSocket();
    } else {
      console.error('❌ Módulo WhatsApp não disponível');
      window.WhatIntegra.utils.setStatus('Erro: Módulo WhatsApp não carregado', 'error');
    }
  }, 100); // 100ms para garantir renderização
}

function showQRScreen() {
  console.log('📱 Mostrando tela QR');
  
  // Re-selecionar elementos para garantir que existem após a tela estar visível
  const qrScreenEl = document.getElementById('qrScreen');
  const mainInterfaceEl = document.getElementById('mainInterface');
  const welcomeScreenEl = document.getElementById('welcomeScreen');
  
  if (!qrScreenEl) {
    console.error('❌ Elemento qrScreen não encontrado!');
    console.log('🔍 Elementos disponíveis:', document.querySelectorAll('[id*="qr"], [id*="QR"]'));
    return;
  }
  
  if (qrScreenEl) qrScreenEl.classList.remove('hidden');
  if (mainInterfaceEl) mainInterfaceEl.classList.add('hidden');
  if (welcomeScreenEl) welcomeScreenEl.classList.add('hidden');
  
  console.log('✅ Tela QR mostrada com sucesso');
}

function showMainInterface() {
  console.log('💬 Mostrando interface principal');
  
  if (qrScreen) qrScreen.classList.add('hidden');
  if (mainInterface) mainInterface.classList.remove('hidden');
  if (welcomeScreen) welcomeScreen.classList.remove('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');
}

function showWelcomeScreen() {
  console.log('👋 Mostrando tela de boas-vindas');
  
  if (welcomeScreen) welcomeScreen.classList.remove('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');
}

function showChatContainer() {
  console.log('💬 Mostrando container de chat');
  
  if (welcomeScreen) welcomeScreen.classList.add('hidden');
  if (chatContainer) chatContainer.classList.remove('hidden');
}

// === FUNÇÕES DE ATUALIZAÇÃO DE STATUS ===

function updateConnectionStatus(status, message) {
  const statusEl = document.getElementById('connectionStatus');
  const statusDot = statusEl?.querySelector('.status-dot');
  const statusText = document.getElementById('statusText');
  
  if (!statusEl || !statusDot || !statusText) {
    console.warn('⚠️ Elementos de status não encontrados');
    return;
  }
  
  console.log('🔄 Atualizando status de conexão:', { status, message });
  
  // Remover classes anteriores
  statusEl.classList.remove('connecting', 'connected', 'disconnected', 'error');
  
  // Adicionar nova classe
  statusEl.classList.add(status);
  statusText.textContent = message || 'Desconhecido';
  
  console.log('✅ Status atualizado:', { status, message });
}

// === FUNÇÕES DE QR CODE ===

function showQRCode(qrData) {
  console.log('📱 Exibindo QR Code');
  
  const qrCodeEl = document.getElementById('qrCode');
  if (!qrCodeEl) {
    console.error('❌ Elemento qrCode não encontrado!');
    return;
  }
  
  // Limpar conteúdo anterior
  qrCodeEl.innerHTML = '';
  
  // Criar código QR usando uma biblioteca (assumindo que QRCode está disponível globalmente)
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrCodeEl, {
      text: qrData,
      width: 256,
      height: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
    });
  } else {
    // Fallback: mostrar dados como texto
    console.warn('⚠️ Biblioteca QRCode não encontrada, usando fallback');
    qrCodeEl.innerHTML = `
      <div class="qr-fallback">
        <p>Código QR:</p>
        <textarea readonly>${qrData}</textarea>
      </div>
    `;
  }
  
  console.log('✅ QR Code exibido');
}

// === FUNÇÕES DE CHAT ===

function updateChatsList(chats) {
  console.log('📋 Atualizando lista de chats:', chats?.length || 0);
  
  const chatsList = document.getElementById('chatsList');
  if (!chatsList) {
    console.error('❌ Elemento chatsList não encontrado!');
    return;
  }
  
  if (!chats || chats.length === 0) {
    chatsList.innerHTML = `
      <div class="no-chats">
        <span>Nenhuma conversa encontrada</span>
      </div>
    `;
    return;
  }
  
  chatsList.innerHTML = chats.map(chat => `
    <div class="chat-item" data-chat-id="${chat.id}">
      <div class="chat-avatar">${window.WhatIntegra.utils.getAvatarEmoji(chat.name)}</div>
      <div class="chat-info">
        <div class="chat-name">${chat.name || 'Sem nome'}</div>
        <div class="chat-last-message">${chat.lastMessage || 'Sem mensagens'}</div>
      </div>
      <div class="chat-time">${window.WhatIntegra.utils.formatTime(chat.timestamp)}</div>
    </div>
  `).join('');
  
  console.log('✅ Lista de chats atualizada');
}

// === EXPORTAR PARA ESCOPO GLOBAL ===
window.WhatIntegra = window.WhatIntegra || {};
window.WhatIntegra.ui = {
  showLoginScreen,
  showWhatsAppInterface,
  showQRScreen,
  showMainInterface,
  showWelcomeScreen,
  showChatContainer,
  updateConnectionStatus,
  showQRCode,
  updateChatsList
};

console.log('✅ Interface carregada');