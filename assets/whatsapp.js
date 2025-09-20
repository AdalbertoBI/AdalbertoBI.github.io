// WhatIntegra - Módulo WhatsApp
// Gerenciamento da conexão WebSocket e interface do WhatsApp Web

// === MÓDULO WHATSAPP ENCAPSULADO ===
(function() {
  'use strict';
  
  // === ESTADO DO WHATSAPP ===
  let socket = null;
  let currentChat = null;
  let chats = [];
  let messages = {};
  let isConnected = false;

// === ELEMENTOS DOM ===
const qrCodeEl = document.getElementById('qrCode');
const chatsListEl = document.getElementById('chatsList');
const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatName = document.getElementById('chatName');
const chatStatus = document.getElementById('chatStatus');
const chatAvatar = document.getElementById('chatAvatar');

// === CONEXÃO WEBSOCKET ===

function connectWebSocket() {
  console.log('🔌 Iniciando conexão WebSocket...');
  
  const config = window.WhatIntegra.config;
  const SOCKET_URL = config.WHATSAPP_URL.replace('/api', '');
  
  console.log('🌐 URL WebSocket:', SOCKET_URL);
  
  if (socket) {
    socket.disconnect();
  }

  // Verificar se Socket.IO está disponível
  if (typeof io === 'undefined') {
    console.error('❌ Socket.IO não está carregado');
    window.WhatIntegra.utils.setStatus('Erro: Socket.IO não encontrado', 'error');
    return;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    timeout: 10000,
    autoConnect: true,
    forceNew: true
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket conectado ao servidor WhatsApp');
    updateConnectionStatus('connecting', 'Conectando WhatsApp...');
    
    // Autenticar com token
    const token = window.WhatIntegra.state.currentToken;
    if (token) {
      console.log('🔐 Enviando autenticação...');
      socket.emit('authenticate', { token });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket desconectado:', reason);
    updateConnectionStatus('disconnected', 'Desconectado');
    isConnected = false;
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Erro de conexão WebSocket:', error);
    updateConnectionStatus('error', 'Erro de conexão');
    
    // Tentar HTTP se HTTPS falhar
    if (SOCKET_URL.includes('https')) {
      const httpUrl = SOCKET_URL.replace('https:', 'http:');
      console.log('🔄 Tentando conexão HTTP:', httpUrl);
      
      setTimeout(() => {
        connectWebSocketHTTP(httpUrl);
      }, 2000);
    }
  });

  socket.on('authenticated', (data) => {
    console.log('🔐 Autenticação WebSocket:', data);
    if (data.success) {
      console.log('✅ Autenticado com sucesso no WebSocket');
      // O status será enviado automaticamente pelo servidor
    } else {
      console.error('❌ Falha na autenticação WebSocket');
      updateConnectionStatus('error', 'Erro de autenticação');
    }
  });

  socket.on('whatsapp:status', (data) => {
    console.log('📱 Status WhatsApp recebido:', data);
    handleWhatsAppStatus(data);
  });

  socket.on('whatsapp:qr', (data) => {
    console.log('🔳 QR Code recebido');
    showQRCode(data.qr);
  });

  socket.on('whatsapp:ready', () => {
    console.log('🎉 WhatsApp pronto!');
    updateConnectionStatus('connected', 'WhatsApp conectado');
    isConnected = true;
    requestChats();
  });

  socket.on('whatsapp:message', (message) => {
    console.log('📨 Nova mensagem recebida:', message);
    handleNewMessage(message);
  });

  socket.on('whatsapp:chats', (newChats) => {
    console.log('💬 Lista de chats recebida:', newChats?.length || 0);
    if (newChats && Array.isArray(newChats)) {
      chats = newChats;
      renderChats();
    }
  });

  socket.on('chats:update', (newChats) => {
    console.log('💬 Atualização de chats recebida:', newChats?.length || 0);
    if (newChats && Array.isArray(newChats)) {
      chats = newChats;
      renderChats();
    }
  });

  socket.on('message:new', (message) => {
    console.log('📨 Nova mensagem via message:new:', message);
    handleNewMessage(message);
  });

  socket.on('error', (error) => {
    console.error('❌ Erro WebSocket:', error);
    updateConnectionStatus('error', 'Erro do servidor');
  });
}

function connectWebSocketHTTP(httpUrl) {
  console.log('🔄 Tentando conexão HTTP alternativa:', httpUrl);
  
  if (socket) {
    socket.disconnect();
  }

  socket = io(httpUrl, {
    transports: ['polling', 'websocket'],
    timeout: 10000,
    autoConnect: true,
    forceNew: true
  });

  // Reconfigurar todos os event listeners
  setupSocketListeners();
}

function setupSocketListeners() {
  socket.on('connect', () => {
    console.log('✅ WebSocket HTTP conectado');
    updateConnectionStatus('connecting', 'Conectando WhatsApp...');
    
    const token = window.WhatIntegra.state.currentToken;
    if (token) {
      socket.emit('authenticate', { token });
    }
  });

  // ... outros listeners iguais aos da função principal
}

// === GERENCIAMENTO DE STATUS ===

function updateConnectionStatus(status, message) {
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.getElementById('statusText');
  
  if (statusDot) {
    statusDot.className = 'status-dot';
    statusDot.classList.add(status);
  }
  
  if (statusText) {
    statusText.textContent = message;
  }
  
  console.log(`📊 Status atualizado: ${status} - ${message}`);
}

function handleWhatsAppStatus(data) {
  const { status, chats: newChats, qr } = data;
  
  console.log('📱 Processando status WhatsApp:', status);

  switch (status) {
    case 'ready':
    case 'connected':
      updateConnectionStatus('connected', 'WhatsApp conectado');
      isConnected = true;
      if (newChats && Array.isArray(newChats)) {
        chats = newChats;
        renderChats();
      }
      window.WhatIntegra.ui.showMainInterface();
      break;
      
    case 'qr':
      updateConnectionStatus('connecting', 'Escaneie o QR Code');
      if (qr) {
        showQRCode(qr);
      }
      window.WhatIntegra.ui.showQRScreen();
      break;
      
    case 'loading':
      updateConnectionStatus('connecting', 'Inicializando WhatsApp...');
      break;
      
    case 'disconnected':
      updateConnectionStatus('disconnected', 'WhatsApp desconectado');
      isConnected = false;
      window.WhatIntegra.ui.showQRScreen();
      break;
      
    default:
      console.log('⚠️ Status desconhecido:', status);
      updateConnectionStatus('connecting', 'Conectando...');
  }
}

function requestWhatsAppStatus() {
  if (socket && socket.connected) {
    console.log('📡 Solicitando status do WhatsApp...');
    socket.emit('whatsapp:getStatus');
  }
}

function requestChats() {
  if (socket && socket.connected) {
    console.log('📡 Solicitando lista de chats...');
    socket.emit('get-chats');
  }
}

// === INTERFACE DO QR CODE ===

function showQRCode(qrCode) {
  console.log('🔳 Exibindo QR Code');
  
  if (qrCodeEl) {
    // Limpar QR anterior
    qrCodeEl.innerHTML = '';
    
    if (qrCode) {
      // Criar elemento de imagem para o QR
      const qrImg = document.createElement('img');
      qrImg.src = `data:image/png;base64,${qrCode}`;
      qrImg.alt = 'QR Code WhatsApp';
      qrImg.style.maxWidth = '256px';
      qrImg.style.height = 'auto';
      
      qrCodeEl.appendChild(qrImg);
      
      console.log('✅ QR Code exibido com sucesso');
    } else {
      qrCodeEl.innerHTML = '<div class="qr-loading">Gerando QR Code...</div>';
    }
  } else {
    console.error('❌ Elemento qrCode não encontrado');
  }
}

// === INTERFACE DE CHATS ===

function renderChats() {
  console.log('💬 Renderizando chats:', chats.length);
  
  if (!chatsListEl) {
    console.error('❌ Elemento chatsList não encontrado');
    return;
  }

  if (!chats || chats.length === 0) {
    chatsListEl.innerHTML = `
      <div class="no-chats">
        <div class="no-chats-icon">💬</div>
        <p>Nenhuma conversa encontrada</p>
        <small>Inicie uma conversa no seu celular</small>
      </div>
    `;
    return;
  }

  const chatsHTML = chats.map(chat => {
    const name = chat.name || getContactName(chat.id._serialized);
    const lastMessage = chat.lastMessage?.body || 'Nova conversa';
    const time = chat.lastMessage?.timestamp ? 
      formatChatTime(chat.lastMessage.timestamp) : '';
    const avatar = generateAvatar(name);
    
    return `
      <div class="chat-item" data-chat-id="${chat.id._serialized}" onclick="selectChat('${chat.id._serialized}')">
        <div class="chat-avatar">${avatar}</div>
        <div class="chat-content">
          <div class="chat-header">
            <h4 class="chat-name">${name}</h4>
            <span class="chat-time">${time}</span>
          </div>
          <p class="chat-preview">${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}</p>
        </div>
      </div>
    `;
  }).join('');

  chatsListEl.innerHTML = chatsHTML;
}

function selectChat(chatId) {
  console.log('💬 Selecionando chat:', chatId);
  
  currentChat = chatId;
  
  // Destacar chat selecionado
  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.chatId === chatId) {
      item.classList.add('active');
    }
  });
  
  // Encontrar dados do chat
  const chat = chats.find(c => c.id._serialized === chatId);
  if (chat) {
    updateChatHeader(chat);
    loadChatMessages(chatId);
    window.WhatIntegra.ui.showChatContainer();
  }
}

function updateChatHeader(chat) {
  const name = chat.name || getContactName(chat.id._serialized);
  
  if (chatName) chatName.textContent = name;
  if (chatStatus) chatStatus.textContent = 'online';
  if (chatAvatar) chatAvatar.textContent = generateAvatar(name);
}

function loadChatMessages(chatId) {
  if (socket && socket.connected) {
    console.log('📡 Carregando mensagens do chat:', chatId);
    socket.emit('whatsapp:getMessages', { chatId });
  }
}

// === UTILITÁRIOS ===

function getContactName(chatId) {
  if (chatId.includes('@g.us')) {
    return 'Grupo WhatsApp';
  }
  
  // Extrair número do telefone
  const phone = chatId.split('@')[0];
  return `+${phone}`;
}

function formatChatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 24 * 60 * 60 * 1000) { // Menos de 24 horas
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else if (diff < 7 * 24 * 60 * 60 * 1000) { // Menos de 7 dias
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}

function generateAvatar(name) {
  const colors = ['👤', '👨', '👩', '🧑', '👱', '🧔', '👴', '👵'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function handleNewMessage(message) {
  console.log('📨 Processando nova mensagem:', message);
  
  // Atualizar lista de chats se necessário
  requestChats();
  
  // Se é do chat atual, atualizar mensagens
  if (currentChat === message.from) {
    // TODO: Implementar atualização de mensagens em tempo real
    loadChatMessages(currentChat);
  }
}

// === ENVIO DE MENSAGENS ===

function sendMessage() {
  if (!currentChat) {
    console.warn('⚠️ Nenhum chat selecionado');
    return;
  }
  
  const message = messageInput?.value?.trim();
  if (!message) {
    console.warn('⚠️ Mensagem vazia');
    return;
  }
  
  if (socket && socket.connected) {
    console.log('📤 Enviando mensagem:', { chatId: currentChat, message });
    
    socket.emit('whatsapp:sendMessage', {
      chatId: currentChat,
      message: message
    });
    
    // Limpar input
    if (messageInput) {
      messageInput.value = '';
    }
    
    // Recarregar mensagens
    setTimeout(() => loadChatMessages(currentChat), 1000);
  } else {
    console.error('❌ WebSocket não conectado');
    window.WhatIntegra.utils.setStatus('Erro: Não conectado ao servidor', 'error');
  }
}

// === EVENT LISTENERS ===

function setupEventListeners() {
  // Botão de enviar mensagem
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  // Enter no input de mensagem
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}

// === INICIALIZAÇÃO ===

function initializeWhatsApp() {
  console.log('🚀 Inicializando módulo WhatsApp');
  
  setupEventListeners();
  
  // Conectar WebSocket se autenticado
  if (window.WhatIntegra.state.currentToken) {
    setTimeout(() => {
      connectWebSocket();
    }, 1000);
  }
}

// === EXPORTAÇÃO PARA NAMESPACE GLOBAL ===

// Adicionar ao namespace global
window.WhatIntegra = window.WhatIntegra || {};
window.WhatIntegra.whatsapp = {
  // Funções principais
  connectWebSocket,
  requestChats,
  initializeWhatsApp,
  
  // Funções de interface
  selectChat,
  sendMessage,
  
  // Estado
  getChats: () => chats,
  getCurrentChat: () => currentChat,
  isConnected: () => isConnected,
  
  // Funções globais para HTML
  selectChat: (chatId) => selectChat(chatId)
};

// Tornar selectChat global para uso no HTML
window.selectChat = selectChat;

console.log('✅ Módulo WhatsApp carregado');

})(); // Fecha o IIFE