(() => {
  // Configurações
  const isGitHubPages = location.hostname.includes('github.io');
  
  // URLs baseadas no ambiente
  const API_URL = isGitHubPages ? 'https://127.0.0.1:8766/api' : 'http://127.0.0.1:8765/api';
  const WHATSAPP_URL = isGitHubPages ? 'https://127.0.0.1:3002' : 'http://127.0.0.1:3001';

  // Estado da aplicação
  let socket = null;
  let currentUser = null;
  let currentToken = null;
  let currentChat = null;
  let chats = [];
  let messages = {};

  // Elementos DOM
  const loginScreen = document.getElementById('loginScreen');
  const whatsappScreen = document.getElementById('whatsappScreen');
  const qrScreen = document.getElementById('qrScreen');
  const mainInterface = document.getElementById('mainInterface');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const chatContainer = document.getElementById('chatContainer');
  
  // Login elements
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const statusEl = document.getElementById('status');
  const configAlert = document.getElementById('configAlert');
  
  // WhatsApp elements
  const displayUser = document.getElementById('displayUser');
  const connectionStatus = document.getElementById('connectionStatus');
  const statusText = document.getElementById('statusText');
  const qrCodeEl = document.getElementById('qrCode');
  const chatsListEl = document.getElementById('chatsList');
  const messagesArea = document.getElementById('messagesArea');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatName = document.getElementById('chatName');
  const chatStatus = document.getElementById('chatStatus');
  const logoutBtn = document.getElementById('logoutBtn');

  // === UTILITY FUNCTIONS ===
  
  function setStatus(msg, type = '') {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.className = 'status';
    if (type) statusEl.classList.add(type);
  }

  function setLoading(loading, button = loginBtn) {
    if (!button) return;
    button.disabled = loading;
    const originalText = button.dataset.originalText || button.textContent;
    button.dataset.originalText = originalText;
    button.textContent = loading ? 'Aguarde...' : originalText;
  }

  function showMixedContentWarning() {
    if (isGitHubPages) {
      const warningMsg = document.createElement('div');
      warningMsg.innerHTML = `
        <strong>🔒 Certificados HTTPS Necessários</strong><br>
        Para usar o WhatsApp Web pelo GitHub Pages, você precisa autorizar os certificados HTTPS locais:<br><br>
        <div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 6px; margin: 10px 0;">
          <strong>Passo 1:</strong> <a href="https://127.0.0.1:8766/api/health" target="_blank" style="color: #3b82f6; text-decoration: underline;">Abrir Servidor de Autenticação HTTPS</a><br>
          <strong>Passo 2:</strong> <a href="https://127.0.0.1:3002/api/health" target="_blank" style="color: #3b82f6; text-decoration: underline;">Abrir Servidor WhatsApp HTTPS</a><br>
          <strong>Passo 3:</strong> Em cada página, clique em <strong>"Avançado"</strong> → <strong>"Continuar para 127.0.0.1"</strong>
        </div>
        <div style="margin-top: 15px;">
          <button onclick="location.reload()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            🔄 Testar Novamente
          </button>
        </div>
        <small style="color: #6b7280; margin-top: 10px; display: block;">
          ℹ️ Isso é necessário apenas uma vez. Os certificados são autoassinados para segurança local.
        </small>
      `;
      statusEl.innerHTML = '';
      statusEl.appendChild(warningMsg);
      statusEl.className = 'status warning';
      return true;
    }
    return false;
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

  function showConfigAlert() {
    if (configAlert) {
      configAlert.style.display = 'block';
      setStatus('Problema de conexão com servidores locais', 'error');
    }
  }

  function hideConfigAlert() {
    if (configAlert) {
      configAlert.style.display = 'none';
    }
  }

  function getContactName(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.name) return chat.name;
    
    if (chatId.endsWith('@g.us')) {
      return 'Grupo';
    }
    // Extrair número do ID
    const number = chatId.split('@')[0];
    return number.replace(/(\d{2})(\d{5})(\d{4})/, '+$1 $2-$3');
  }
  
  function requestChatsUpdate() {
    if (socket && socket.connected) {
      socket.emit('get-chats');
      console.log('🔄 Solicitando atualização da lista de chats');
    }
  }
  
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  
  function truncateMessage(message, maxLength = 50) {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }

  function getAvatarEmoji(name) {
    const emojis = ['👤', '👥', '🤝', '💼', '🏠', '❤️', '🌟', '💬', '📱', '⭐'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return emojis[Math.abs(hash) % emojis.length];
  }

  // === AUTHENTICATION ===

  async function trySession() {
    const user = localStorage.getItem('wi_user');
    const token = localStorage.getItem('wi_token');
    
    if (!user || !token) return false;
    
    try {
      const res = await fetch(`${API_URL}/session`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        currentUser = user;
        currentToken = token;
        showWhatsAppInterface();
        return true;
      } else {
        localStorage.removeItem('wi_user');
        localStorage.removeItem('wi_token');
        return false;
      }
    } catch (error) {
      console.log('Servidor não acessível:', error);
      showConfigAlert();
      return false;
    }
  }

  async function login(username, password) {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data?.error || 'Falha no login');
      }

      const { token } = data;
      localStorage.setItem('wi_user', username);
      localStorage.setItem('wi_token', token);
      
      currentUser = username;
      currentToken = token;
      
      setStatus('Autenticado com sucesso!', 'success');
      setTimeout(() => showWhatsAppInterface(), 500);
      
    } catch (err) {
      throw new Error(err.message || 'Erro ao autenticar');
    }
  }

  function logout() {
    localStorage.removeItem('wi_user');
    localStorage.removeItem('wi_token');
    currentUser = null;
    currentToken = null;
    
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    
    showLoginScreen();
  }

  // === WHATSAPP CONNECTION ===

  function connectWebSocket() {
    if (socket) {
      socket.disconnect();
    }

    console.log('🔌 Conectando WebSocket para:', WHATSAPP_URL);

    socket = io(WHATSAPP_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado ao:', WHATSAPP_URL);
      updateConnectionStatus('connecting', 'Conectando WhatsApp...');
      
      // Setup periodic sync for message updates
      if (window.messageSyncInterval) clearInterval(window.messageSyncInterval);
      window.messageSyncInterval = setInterval(() => {
        if (currentChat && socket && socket.connected) {
          const lastMessage = messages[currentChat.id] && messages[currentChat.id].length > 0 
            ? messages[currentChat.id][messages[currentChat.id].length - 1]
            : null;
          
          socket.emit('sync-messages', {
            chatId: currentChat.id,
            lastTimestamp: lastMessage ? lastMessage.timestamp : 0
          });
        }
      }, 5000); // Sync every 5 seconds
      
      // Setup periodic chat list sync
      if (window.chatSyncInterval) clearInterval(window.chatSyncInterval);
      window.chatSyncInterval = setInterval(() => {
        if (socket && socket.connected) {
          socket.emit('get-chats');
        }
      }, 30000); // Sync chat list every 30 seconds
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
      updateConnectionStatus('disconnected', 'Desconectado');
      showConfigAlert();
      
      // Clear sync intervals
      if (window.messageSyncInterval) {
        clearInterval(window.messageSyncInterval);
        window.messageSyncInterval = null;
      }
      if (window.chatSyncInterval) {
        clearInterval(window.chatSyncInterval);
        window.chatSyncInterval = null;
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
      updateConnectionStatus('disconnected', 'Desconectado');
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Erro de conexão WebSocket:', error);
      showConfigAlert();
    });

    socket.on('error', (error) => {
      console.log('❌ Erro WebSocket:', error);
      showConfigAlert();
    });

    socket.on('whatsapp:status', (data) => {
      console.log('📱 Status WhatsApp:', data);
      handleWhatsAppStatus(data);
    });

    socket.on('whatsapp:qr', (data) => {
      console.log('📱 QR Code recebido via evento específico');
      console.log('🔍 QR Data length:', data.qr?.length || 'undefined');
      
      if (data.qr) {
        showQRCode(data.qr);
        showQRScreen();
        updateConnectionStatus('connecting', 'QR Code disponível - escaneie com seu celular');
      } else {
        console.error('❌ QR Code data está vazio');
      }
    });

    socket.on('whatsapp:message', (message) => {
      console.log('📨 Mensagem recebida via whatsapp:message:', message);
      handleNewMessage(message);
    });

    socket.on('whatsapp:chats', (newChats) => {
      console.log('💬 Chats atualizados:', newChats.length);
      chats = newChats;
      renderChats();
    });
    
    // Novos handlers para sincronização aprimorada
    socket.on('message:new', (message) => {
      console.log('📨 Mensagem recebida via message:new:', message);
      handleNewMessage(message);
    });
    
    socket.on('chats:update', (newChats) => {
      console.log('📋 Lista de chats sincronizada:', newChats.length);
      chats = newChats;
      renderChats();
    });
  }

  function handleWhatsAppStatus(data) {
    console.log('📱 Processando status WhatsApp:', data);
    const { status, chats: newChats, qr } = data;
    
    // Se há QR code, mostrar independentemente do status
    if (qr) {
      console.log('📱 QR Code detectado, exibindo...');
      // Garantir que estamos na interface do WhatsApp primeiro
      if (whatsappScreen && whatsappScreen.classList.contains('hidden')) {
        showWhatsAppInterface();
      }
      showQRCode(qr);
      showQRScreen();
    }

    switch (status) {
      case 'connected':
        updateConnectionStatus('connected', 'Conectado');
        if (newChats) {
          chats = newChats;
          renderChats();
          // Carregar histórico de mensagens para todos os chats principais
          loadInitialMessageHistory();
        }
        showMainInterface();
        break;
        
      case 'qr':
        updateConnectionStatus('connecting', 'Aguardando QR Code...');
        if (!whatsappScreen || whatsappScreen.classList.contains('hidden')) {
          showWhatsAppInterface();
        }
        if (qr) showQRCode(qr);
        showQRScreen();
        break;
        
      case 'disconnected':
        updateConnectionStatus('disconnected', 'Desconectado');
        if (!whatsappScreen || whatsappScreen.classList.contains('hidden')) {
          showWhatsAppInterface();
        }
        showQRScreen();
        break;
        
      case 'auth_failure':
        updateConnectionStatus('disconnected', 'Erro de autenticação');
        if (!whatsappScreen || whatsappScreen.classList.contains('hidden')) {
          showWhatsAppInterface();
        }
        showQRScreen();
        break;
        
      case 'failed':
        updateConnectionStatus('disconnected', 'WhatsApp falhou - QR Code disponível');
        // Garantir que estamos na interface do WhatsApp
        if (!whatsappScreen || whatsappScreen.classList.contains('hidden')) {
          showWhatsAppInterface();
        }
        // Se há QR, mostrar mesmo com falha
        if (qr) {
          showQRCode(qr);
          showQRScreen();
        }
        break;
        
      default:
        updateConnectionStatus('connecting', 'Inicializando...');
        // Verificar se há QR mesmo em status desconhecido
        if (qr) {
          if (!whatsappScreen || whatsappScreen.classList.contains('hidden')) {
            showWhatsAppInterface();
          }
          showQRCode(qr);
          showQRScreen();
        }
    }
  }

  function updateConnectionStatus(status, text) {
    const statusDot = connectionStatus.querySelector('.status-dot');
    statusText.textContent = text;
    
    statusDot.className = 'status-dot';
    statusDot.classList.add(status);
  }

  function showQRCode(qrDataUrl) {
    if (!qrDataUrl) {
      console.error('❌ QR code data URL está vazio');
      return;
    }
    
    console.log('🔍 Exibindo QR Code:', qrDataUrl.substring(0, 50) + '...');
    
    if (!qrCodeEl) {
      console.error('❌ Elemento qrCode não encontrado');
      return;
    }
    
    qrCodeEl.innerHTML = `<img src="${qrDataUrl}" alt="QR Code WhatsApp" style="width: 256px; height: 256px; display: block;">`;
    console.log('✅ QR Code inserido no DOM');
    
    // Verificar se a imagem carregou
    const img = qrCodeEl.querySelector('img');
    if (img) {
      img.onload = () => console.log('✅ QR Code imagem carregada');
      img.onerror = () => console.error('❌ Erro ao carregar imagem QR Code');
    }
  }

  // === CHAT HISTORY MANAGEMENT ===

  async function loadInitialMessageHistory() {
    if (!currentToken || chats.length === 0) return;
    
    console.log('📚 Carregando histórico inicial de mensagens...');
    
    // Carregar mensagens para os primeiros 10 chats (mais ativos)
    const priorityChats = chats.slice(0, 10);
    
    for (const chat of priorityChats) {
      try {
        console.log(`📨 Carregando histórico para: ${chat.name || chat.id}`);
        
        const res = await fetch(`${WHATSAPP_URL}/api/whatsapp/chat/${encodeURIComponent(chat.id)}/messages?limit=20`, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            messages[chat.id] = data.messages.reverse(); // Ordem cronológica
            console.log(`✅ ${data.messages.length} mensagens carregadas para ${chat.name || chat.id}`);
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao carregar histórico para ${chat.id}:`, error);
      }
      
      // Pequeno delay para não sobrecarregar o servidor
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Histórico inicial carregado');
  }

  // === CHAT MANAGEMENT ===

  function renderChats() {
    if (!chatsListEl) return;

    if (chats.length === 0) {
      chatsListEl.innerHTML = `
        <div class="loading-chats">
          <span>Nenhuma conversa encontrada</span>
        </div>
      `;
      return;
    }

    // Ordenar chats por timestamp da última mensagem (mais recentes primeiro)
    const sortedChats = [...chats].sort((a, b) => {
      const timeA = a.lastMessage ? a.lastMessage.timestamp : 0;
      const timeB = b.lastMessage ? b.lastMessage.timestamp : 0;
      return timeB - timeA; // Ordem decrescente (mais recente primeiro)
    });

    chatsListEl.innerHTML = sortedChats.map(chat => `
      <div class="chat-item" data-chat-id="${chat.id}">
        <div class="chat-avatar">${getAvatarEmoji(chat.name)}</div>
        <div class="chat-info">
          <div class="chat-name">${chat.name || getContactName(chat.id)}</div>
          <div class="chat-last-message">
            ${chat.lastMessage ? (chat.lastMessage.fromMe ? 'Você: ' : '') + truncateMessage(chat.lastMessage.body) : 'Nenhuma mensagem'}
          </div>
        </div>
        <div class="chat-meta">
          ${chat.lastMessage ? `<div class="chat-time">${formatChatTime(chat.lastMessage.timestamp)}</div>` : ''}
          ${chat.unreadCount ? `<div class="chat-unread">${chat.unreadCount}</div>` : ''}
        </div>
      </div>
    `).join('');

    // Add click handlers and mark active chat
    chatsListEl.querySelectorAll('.chat-item').forEach(item => {
      const chatId = item.dataset.chatId;
      
      // Mark active chat
      if (currentChat && currentChat.id === chatId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
      
      item.addEventListener('click', () => {
        selectChat(chatId);
      });
    });
  }

  async function selectChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    // Update UI
    currentChat = chat;
    chatName.textContent = chat.name || getContactName(chat.id);
    chatStatus.textContent = chat.isGroup ? `${chat.participants || 0} participantes` : 'online';
    
    // Update active chat
    chatsListEl.querySelectorAll('.chat-item').forEach(item => {
      item.classList.toggle('active', item.dataset.chatId === chatId);
    });

    // Load messages
    await loadMessages(chatId);
    showChatContainer();
  }

  async function loadMessages(chatId) {
    if (!currentToken) return;

    try {
      messagesArea.innerHTML = `
        <div class="loading-messages">
          <div class="spinner"></div>
          <span>Carregando mensagens...</span>
        </div>
      `;

      const res = await fetch(`${WHATSAPP_URL}/api/whatsapp/chat/${encodeURIComponent(chatId)}/messages?limit=50`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });

      const data = await res.json();
      
      if (res.ok) {
        messages[chatId] = data.messages || [];
        renderMessages(chatId);
      } else {
        messagesArea.innerHTML = `
          <div class="loading-messages">
            <span>Erro ao carregar mensagens</span>
          </div>
        `;
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      messagesArea.innerHTML = `
        <div class="loading-messages">
          <span>Erro de conexão</span>
        </div>
      `;
    }
  }

  function renderMessages(chatId) {
    const chatMessages = messages[chatId] || [];
    
    console.log(`🎨 Renderizando ${chatMessages.length} mensagens para chat: ${chatId}`);
    
    if (chatMessages.length === 0) {
      messagesArea.innerHTML = `
        <div class="loading-messages">
          <span>Nenhuma mensagem ainda</span>
        </div>
      `;
      return;
    }

    // Debug: mostrar todas as mensagens que serão renderizadas
    chatMessages.forEach((msg, index) => {
      console.log(`📝 Mensagem ${index + 1}: ${msg.fromMe ? 'ENVIADA' : 'RECEBIDA'} - "${msg.body}" - ${new Date(msg.timestamp).toLocaleTimeString()}`);
    });

    messagesArea.innerHTML = chatMessages.map(msg => `
      <div class="message ${msg.fromMe ? 'from-me' : 'from-other'}">
        <div class="message-body">${msg.body}</div>
        <div class="message-meta">
          <span class="message-time">${formatTime(msg.timestamp)}</span>
          ${msg.fromMe ? '<span class="message-status">✓✓</span>' : ''}
        </div>
      </div>
    `).join('');

    // Scroll to bottom with smooth behavior
    setTimeout(() => {
      messagesArea.scrollTo({
        top: messagesArea.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
    
    console.log('✅ Mensagens renderizadas e scroll ajustado');
    
    // Mark chat as read (reset unread count)
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.unreadCount > 0) {
      chat.unreadCount = 0;
      renderChats(); // Update chat list to remove unread indicator
    }
  }

  function handleNewMessage(message) {
    console.log('📨 Processando nova mensagem:', message);
    console.log('📨 ChatId:', message.chatId, 'FromMe:', message.fromMe, 'Body:', message.body);
    
    const chatId = message.chatId;
    
    // Verificar se é uma mensagem duplicada
    if (messages[chatId]) {
      const isDuplicate = messages[chatId].some(msg => 
        msg.timestamp === message.timestamp && msg.body === message.body && msg.fromMe === message.fromMe
      );
      if (isDuplicate) {
        console.log('⚠️ Mensagem duplicada ignorada');
        return;
      }
    }
    
    // Initialize messages array if not exists
    if (!messages[chatId]) {
      messages[chatId] = [];
      console.log('📝 Inicializando array de mensagens para chat:', chatId);
    }
    
    // Add message in chronological order
    const insertIndex = messages[chatId].findIndex(msg => msg.timestamp > message.timestamp);
    if (insertIndex === -1) {
      messages[chatId].push(message);
    } else {
      messages[chatId].splice(insertIndex, 0, message);
    }
    
    console.log(`📝 Total de mensagens no chat ${chatId}:`, messages[chatId].length);

    // If current chat, update view with smooth scroll
    if (currentChat && currentChat.id === chatId) {
      console.log('🔄 Atualizando chat ativo:', chatId);
      renderMessages(chatId);
      
      // Notificação visual se não for mensagem própria
      if (!message.fromMe) {
        console.log('💬 Nova mensagem RECEBIDA no chat ativo');
      } else {
        console.log('💬 Nova mensagem ENVIADA no chat ativo');
      }
    } else {
      // Notificação para chat não ativo
      if (!message.fromMe) {
        console.log(`💬 Nova mensagem RECEBIDA de: ${getContactName(chatId)}`);
      } else {
        console.log(`💬 Nova mensagem ENVIADA para: ${getContactName(chatId)}`);
      }
    }

    // Update chat list (move to top and update last message)
    let chatIndex = chats.findIndex(c => c.id === chatId);
    
    if (chatIndex !== -1) {
      const chat = chats[chatIndex];
      chat.lastMessage = {
        body: message.body,
        timestamp: message.timestamp,
        fromMe: message.fromMe
      };
      
      // Increment unread count if not current chat and not from me
      if (!message.fromMe && (!currentChat || currentChat.id !== chatId)) {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }
      
      // Move to top only if it's not already at top
      if (chatIndex > 0) {
        chats.splice(chatIndex, 1);
        chats.unshift(chat);
      }
      
      renderChats();
    } else {
      // Chat não existe na lista, recarregar chats
      console.log('🔄 Chat não encontrado, solicitando atualização da lista');
      requestChatsUpdate();
    }
  }

  async function sendMessage(text) {
    if (!currentChat || !currentToken || !text.trim()) return;

    try {
      setLoading(true, sendBtn);
      
      const res = await fetch(`${WHATSAPP_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          to: currentChat.id,
          message: text.trim()
        })
      });

      if (res.ok) {
        messageInput.value = '';
        
        // Add message locally for immediate feedback
        const localMessage = {
          id: 'temp_' + Date.now(),
          body: text.trim(),
          fromMe: true,
          timestamp: Math.floor(Date.now() / 1000),
          type: 'chat'
        };
        
        handleNewMessage({ ...localMessage, chatId: currentChat.id });
      } else {
        const error = await res.json().catch(() => ({}));
        alert('Erro ao enviar mensagem: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro de conexão ao enviar mensagem');
    } finally {
      setLoading(false, sendBtn);
    }
  }

  // === SCREEN MANAGEMENT ===

  function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    whatsappScreen.classList.add('hidden');
  }

  function showWhatsAppInterface() {
    loginScreen.classList.add('hidden');
    whatsappScreen.classList.remove('hidden');
    
    if (displayUser) displayUser.textContent = currentUser;
    
    // Connect WebSocket
    connectWebSocket();
  }

  function showQRScreen() {
    console.log('📱 Mostrando tela QR');
    
    if (!qrScreen) {
      console.error('❌ Elemento qrScreen não encontrado');
      return;
    }
    
    if (!mainInterface) {
      console.error('❌ Elemento mainInterface não encontrado');
      return;
    }
    
    // Garantir que a tela do WhatsApp esteja visível primeiro
    if (whatsappScreen && whatsappScreen.classList.contains('hidden')) {
      console.log('📱 Removendo hidden do whatsappScreen');
      whatsappScreen.classList.remove('hidden');
    }
    
    // Ocultar tela de login se estiver visível
    if (loginScreen && !loginScreen.classList.contains('hidden')) {
      console.log('🔒 Ocultando tela de login');
      loginScreen.classList.add('hidden');
    }
    
    qrScreen.classList.remove('hidden');
    mainInterface.classList.add('hidden');
    
    console.log('✅ Tela QR visível, interface principal oculta');
    console.log('🔍 Classes QR screen:', qrScreen.className);
    console.log('🔍 Classes main interface:', mainInterface.className);
    console.log('🔍 Classes whatsapp screen:', whatsappScreen?.className);
  }

  function showMainInterface() {
    qrScreen.classList.add('hidden');
    mainInterface.classList.remove('hidden');
    welcomeScreen.classList.remove('hidden');
    chatContainer.classList.add('hidden');
  }

  function showChatContainer() {
    welcomeScreen.classList.add('hidden');
    chatContainer.classList.remove('hidden');
  }

  // === EVENT LISTENERS ===

  // Login form
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (showMixedContentWarning()) {
      setLoading(false);
      return;
    }
    
    setStatus('Validando credenciais…');
    setLoading(true);
    
    try {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      
      await login(username, password);
    } catch (err) {
      const errorMsg = err.message || 'Erro ao autenticar';
      if (errorMsg.includes('fetch') || errorMsg.includes('NetworkError') || err.name === 'TypeError') {
        showConfigAlert();
      } else {
        setStatus(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  });

  // WhatsApp controls
  logoutBtn?.addEventListener('click', logout);

  // Message input
  messageInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  sendBtn?.addEventListener('click', () => {
    sendMessage(messageInput.value);
  });

  // Search chats
  document.getElementById('searchChats')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const chatItems = chatsListEl?.querySelectorAll('.chat-item');
    
    chatItems?.forEach(item => {
      const chatName = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
      item.style.display = chatName.includes(query) ? 'flex' : 'none';
    });
  });

  // === INITIALIZATION ===

  // === URL PARAMETERS HANDLING ===
  
  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const password = urlParams.get('password');
    
    if (username && password) {
      console.log('🔗 Credenciais encontradas na URL, tentando login automático...');
      
      // Limpar parâmetros da URL para segurança
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Preencher campos do formulário
      if (document.getElementById('username')) {
        document.getElementById('username').value = decodeURIComponent(username);
      }
      if (document.getElementById('password')) {
        document.getElementById('password').value = decodeURIComponent(password);
      }
      
      // Tentar login automático
      setTimeout(async () => {
        try {
          setStatus('Fazendo login automático...', 'info');
          await login(decodeURIComponent(username), decodeURIComponent(password));
        } catch (error) {
          console.error('❌ Falha no login automático:', error);
          setStatus('Falha no login: ' + error.message, 'error');
          showMixedContentWarning();
        }
      }, 1000);
      
      return true;
    }
    
    return false;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 WhatIntegra carregado');
    
    // Check URL parameters first
    const hasUrlParams = checkUrlParams();
    
    if (!hasUrlParams) {
      // Try to restore session
      const hasSession = await trySession();
      
      if (!hasSession) {
        showLoginScreen();
      }
    } else {
      // Show login screen but don't try session restoration
      showLoginScreen();
    }
  });

  // Handle page visibility for reconnection
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentUser && socket && !socket.connected) {
      console.log('🔄 Página voltou ao foco, tentando reconectar...');
      connectWebSocket();
    }
  });

})();