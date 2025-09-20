// WhatIntegra - WhatsApp WebSocket Integration
// Módulo para conexão WebSocket com o servidor WhatsApp

(() => {
  // === CONFIGURAÇÕES ===
  const getConfig = () => window.WhatIntegra?.config || {};
  const WHATSAPP_URL = () => getConfig().WHATSAPP_URL || 'https://127.0.0.1:3002';
  
  // === ESTADO ===
  let socket = null;
  let currentChat = null;
  let chats = [];
  let messages = {};
  
  // === ELEMENTOS DOM ===
  const qrCodeEl = document.getElementById('qrCode');
  const chatsListEl = document.getElementById('chatsList');
  const messagesArea = document.getElementById('messagesArea');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatName = document.getElementById('chatName');
  const chatStatus = document.getElementById('chatStatus');

  // === CONEXÃO WEBSOCKET ===

  function connectWebSocket() {
    console.log('🔌 Conectando WebSocket WhatsApp...');
    console.log('🎯 URL:', WHATSAPP_URL());
    
    if (socket) {
      socket.disconnect();
    }

    socket = io(WHATSAPP_URL(), {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket WhatsApp conectado');
      window.WhatIntegra.ui?.updateConnectionStatus('connecting', 'Conectando WhatsApp...');
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket WhatsApp desconectado');
      window.WhatIntegra.ui?.updateConnectionStatus('disconnected', 'Desconectado');
    });

    socket.on('whatsapp:status', (data) => {
      console.log('📱 Status WhatsApp:', data);
      handleWhatsAppStatus(data);
    });

    socket.on('whatsapp:qr', (data) => {
      console.log('📱 QR Code recebido');
      showQRCode(data.qr);
    });

    socket.on('whatsapp:message', (message) => {
      console.log('📨 Nova mensagem:', message);
      handleNewMessage(message);
    });

    socket.on('whatsapp:chats', (newChats) => {
      console.log('💬 Chats atualizados:', newChats?.length || 0);
      chats = newChats || [];
      updateChatsList();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
      window.WhatIntegra.ui?.updateConnectionStatus('error', 'Erro de conexão');
    });
  }

  // === MANIPULADORES DE STATUS ===

  function handleWhatsAppStatus(data) {
    console.log('📱 Processando status WhatsApp:', data);
    
    switch (data.status) {
      case 'qr':
        console.log('📱 Status: Aguardando QR Code');
        window.WhatIntegra.ui?.showQRScreen();
        window.WhatIntegra.ui?.updateConnectionStatus('connecting', 'Escaneie o QR Code');
        break;
        
      case 'ready':
        console.log('📱 Status: WhatsApp conectado e pronto');
        window.WhatIntegra.ui?.showMainInterface();
        window.WhatIntegra.ui?.updateConnectionStatus('connected', 'WhatsApp conectado');
        break;
        
      case 'disconnected':
        console.log('📱 Status: WhatsApp desconectado');
        window.WhatIntegra.ui?.showQRScreen();
        window.WhatIntegra.ui?.updateConnectionStatus('disconnected', 'WhatsApp desconectado');
        break;
        
      default:
        console.log('📱 Status desconhecido:', data.status);
        window.WhatIntegra.ui?.updateConnectionStatus('connecting', `Status: ${data.status}`);
    }
  }

  // === QR CODE ===

  function showQRCode(qrData) {
    console.log('📱 Exibindo QR Code');
    
    if (!qrCodeEl) {
      console.error('❌ Elemento qrCode não encontrado!');
      return;
    }
    
    // Limpar conteúdo anterior
    qrCodeEl.innerHTML = '';
    
    // Usar biblioteca QRCode se disponível
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
          <textarea readonly style="width: 100%; height: 100px;">${qrData}</textarea>
        </div>
      `;
    }
    
    console.log('✅ QR Code exibido');
  }

  // === CHATS ===

  function updateChatsList() {
    console.log('📋 Atualizando lista de chats:', chats?.length || 0);
    
    if (!chatsListEl) {
      console.error('❌ Elemento chatsList não encontrado!');
      return;
    }
    
    if (!chats || chats.length === 0) {
      chatsListEl.innerHTML = `
        <div class="no-chats">
          <span>Nenhuma conversa encontrada</span>
        </div>
      `;
      return;
    }
    
    chatsListEl.innerHTML = chats.map(chat => `
      <div class="chat-item" data-chat-id="${chat.id}" onclick="selectChat('${chat.id}')">
        <div class="chat-avatar">${window.WhatIntegra.utils?.getAvatarEmoji(chat.name) || '💬'}</div>
        <div class="chat-info">
          <h4 class="chat-name">${chat.name}</h4>
          <p class="chat-last-message">${chat.lastMessage?.body || 'Sem mensagens'}</p>
        </div>
        <div class="chat-meta">
          <span class="chat-time">${chat.lastMessage?.timestamp ? window.WhatIntegra.utils?.formatTime(chat.lastMessage.timestamp) || '' : ''}</span>
          ${chat.unreadCount ? `<span class="chat-unread">${chat.unreadCount}</span>` : ''}
        </div>
      </div>
    `).join('');
    
    console.log('✅ Lista de chats atualizada');
  }

  // === MENSAGENS ===

  function handleNewMessage(message) {
    console.log('📨 Processando nova mensagem:', message);
    
    // Adicionar mensagem ao histórico
    if (!messages[message.chatId]) {
      messages[message.chatId] = [];
    }
    messages[message.chatId].push(message);
    
    // Se é o chat ativo, mostrar a mensagem
    if (currentChat === message.chatId) {
      displayMessage(message);
    }
    
    // Atualizar lista de chats (pode ter mudado o timestamp da última mensagem)
    updateChatsList();
  }

  function displayMessage(message) {
    if (!messagesArea) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.fromMe ? 'sent' : 'received'}`;
    
    messageEl.innerHTML = `
      <div class="message-content">
        <p>${message.body}</p>
        <span class="message-time">${window.WhatIntegra.utils?.formatTime(message.timestamp) || ''}</span>
      </div>
    `;
    
    messagesArea.appendChild(messageEl);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // === SELEÇÃO DE CHAT ===

  window.selectChat = function(chatId) {
    console.log('💬 Selecionando chat:', chatId);
    
    currentChat = chatId;
    const chat = chats.find(c => c.id === chatId);
    
    if (!chat) {
      console.error('❌ Chat não encontrado:', chatId);
      return;
    }
    
    // Atualizar UI
    if (chatName) chatName.textContent = chat.name;
    if (chatStatus) chatStatus.textContent = 'online';
    
    // Mostrar container de chat
    window.WhatIntegra.ui?.showChatContainer();
    
    // Carregar mensagens do chat
    loadChatMessages(chatId);
  };

  async function loadChatMessages(chatId) {
    console.log('📨 Carregando mensagens do chat:', chatId);
    
    if (!messagesArea) return;
    
    try {
      const config = getConfig();
      const res = await fetch(`${config.API_URL}/whatsapp/chat/${encodeURIComponent(chatId)}/messages?limit=50`, {
        headers: {
          'Authorization': `Bearer ${window.WhatIntegra.state?.currentToken}`
        }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const chatMessages = data.messages || [];
      
      // Armazenar mensagens
      messages[chatId] = chatMessages;
      
      // Limpar área de mensagens
      messagesArea.innerHTML = '';
      
      // Exibir mensagens
      chatMessages.forEach(message => displayMessage(message));
      
      console.log('✅ Mensagens carregadas:', chatMessages.length);
      
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      messagesArea.innerHTML = '<div class="error-message">Erro ao carregar mensagens</div>';
    }
  }

  // === ENVIO DE MENSAGENS ===

  async function sendMessage(text) {
    if (!currentChat || !text.trim()) return;
    
    console.log('📤 Enviando mensagem:', { chat: currentChat, text });
    
    try {
      const config = getConfig();
      const res = await fetch(`${config.API_URL}/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.WhatIntegra.state?.currentToken}`
        },
        body: JSON.stringify({
          chatId: currentChat,
          message: text
        })
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      console.log('✅ Mensagem enviada com sucesso');
      
      // Limpar input
      if (messageInput) messageInput.value = '';
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      window.WhatIntegra.utils?.setStatus('Erro ao enviar mensagem', 'error');
    }
  }

  // === EVENT LISTENERS ===

  function setupEventListeners() {
    // Envio de mensagem com Enter
    messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageInput.value);
      }
    });
    
    // Botão de enviar
    sendBtn?.addEventListener('click', () => {
      sendMessage(messageInput?.value || '');
    });
  }

  // === EXPORT PARA NAMESPACE GLOBAL ===

  window.WhatIntegra = window.WhatIntegra || {};
  window.WhatIntegra.whatsapp = {
    connectWebSocket,
    socket: () => socket,
    currentChat: () => currentChat,
    chats: () => chats,
    messages: () => messages,
    sendMessage
  };

  // === INICIALIZAÇÃO ===

  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    console.log('✅ Módulo WhatsApp WebSocket carregado');
  });

})();