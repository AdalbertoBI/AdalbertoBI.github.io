// WhatIntegra - WhatsApp Web Integration
// Configurações
const isGitHub = location.hostname.includes('github.io') || location.hostname.includes('github.com');
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// URLs baseadas no ambiente
// Para GitHub Pages: usar HTTPS na porta 8766 (servidor HTTPS)
// Para localhost: usar HTTP na porta 8765 (servidor HTTP)
const API_URL = isGitHub ? 'https://127.0.0.1:8766/api' : 'http://127.0.0.1:8765/api';
const WHATSAPP_URL = isGitHub ? 'https://127.0.0.1:3002' : 'http://127.0.0.1:3001';

// Debug da configuração
console.log('🔧 WhatIntegra - Configuração:', {
  hostname: location.hostname,
  isGitHub,
  isLocalhost,
  API_URL,
  WHATSAPP_URL
});

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

// Emoji elements
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.getElementById('emojiGrid');

// File attachment elements
const attachBtn = document.getElementById('attachBtn');
const fileInput = document.getElementById('fileInput');

// Typing indicator elements
const typingIndicator = document.getElementById('typingIndicator');
const typingText = document.getElementById('typingText');

// === EMOJI SYSTEM ===

const emojiCategories = {
    people: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
      '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
      '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
      '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
      '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
      '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'
    ],
    nature: [
      '🌿', '🍀', '🍃', '🍂', '🍁', '🌾', '🌱', '🌲', '🌳', '🌴', '🌵', '🌶️', '🍄', '🌰', '🌹', '🌺',
      '🌻', '🌼', '🌷', '🌸', '💐', '🏵️', '🌿', '🍀', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣',
      '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟',
      '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠'
    ],
    food: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆',
      '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨',
      '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪',
      '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤',
      '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮'
    ],
    activities: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
      '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿',
      '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️‍♂️', '🤼‍♀️', '🤼‍♂️', '🤸‍♀️', '🤸‍♂️', '⛹️‍♀️', '⛹️‍♂️', '🤾‍♀️', '🤾‍♂️', '🏌️‍♀️', '🏌️‍♂️', '🏇',
      '🧘‍♀️', '🧘‍♂️', '🏄‍♀️', '🏄‍♂️', '🏊‍♀️', '🏊‍♂️', '🤽‍♀️', '🤽‍♂️', '🚣‍♀️', '🚣‍♂️', '🧗‍♀️', '🧗‍♂️', '🚵‍♀️', '🚵‍♂️', '🚴‍♀️', '🚴‍♂️'
    ],
    travel: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼',
      '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞',
      '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀',
      '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🗺️', '🗿'
    ],
    objects: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼',
      '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭',
      '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸',
      '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️'
    ],
    symbols: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
      '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
      '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️',
      '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯'
    ]
  };

function initializeEmojiPicker() {
  if (!emojiBtn || !emojiPicker || !emojiGrid) {
    console.log('⚠️ Elementos do seletor de emoji não encontrados');
    return;
  }

    // Toggle emoji picker
    emojiBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleEmojiPicker();
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
        hideEmojiPicker();
      }
    });

    // Category buttons
    const categoryButtons = document.querySelectorAll('.emoji-category');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        selectEmojiCategory(category, btn);
      });
    });

    // Load default category
    selectEmojiCategory('people', document.querySelector('.emoji-category[data-category="people"]'));
    
    console.log('✅ Seletor de emoji inicializado');
  }

  function toggleEmojiPicker() {
    emojiPicker.classList.toggle('hidden');
    
    if (!emojiPicker.classList.contains('hidden')) {
      console.log('😊 Seletor de emoji aberto');
    } else {
      console.log('😊 Seletor de emoji fechado');
    }
  }

  function hideEmojiPicker() {
    emojiPicker.classList.add('hidden');
  }

  function selectEmojiCategory(category, button) {
    // Update active category button
    document.querySelectorAll('.emoji-category').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Load emojis for category
    const emojis = emojiCategories[category] || [];
    
    emojiGrid.innerHTML = emojis.map(emoji => 
      `<button class="emoji-item" data-emoji="${emoji}">${emoji}</button>`
    ).join('');

    // Add click handlers to emoji buttons
    emojiGrid.querySelectorAll('.emoji-item').forEach(btn => {
      btn.addEventListener('click', () => {
        insertEmoji(btn.dataset.emoji);
      });
    });

    console.log(`😊 Carregados ${emojis.length} emojis da categoria ${category}`);
  }

  function insertEmoji(emoji) {
    if (!messageInput) return;

    const cursorPosition = messageInput.selectionStart;
    const textBefore = messageInput.value.substring(0, cursorPosition);
    const textAfter = messageInput.value.substring(messageInput.selectionEnd);
    
    messageInput.value = textBefore + emoji + textAfter;
    messageInput.focus();
    
    // Set cursor position after the emoji
    const newPosition = cursorPosition + emoji.length;
    messageInput.setSelectionRange(newPosition, newPosition);
    
    // Hide emoji picker after selection
    hideEmojiPicker();
    
    console.log(`😊 Emoji inserido: ${emoji}`);
  }

  // === FILE ATTACHMENT SYSTEM ===

  function initializeFileAttachment() {
    if (!attachBtn || !fileInput) {
      console.log('⚠️ Elementos de anexo não encontrados');
      return;
    }

    // Click attach button to open file dialog
    attachBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        handleFileAttachment(files);
      }
    });

    console.log('✅ Sistema de anexos inicializado');
  }

  async function handleFileAttachment(files) {
    if (!currentChat || !currentToken) {
      alert('Selecione uma conversa primeiro');
      return;
    }

    console.log(`📎 Processando ${files.length} arquivo(s) para anexo`);

    for (const file of files) {
      if (file.size > 16 * 1024 * 1024) { // 16MB limit
        alert(`Arquivo muito grande: ${file.name}. Limite: 16MB`);
        continue;
      }

      try {
        await sendFileMessage(file);
      } catch (error) {
        console.error('❌ Erro ao enviar arquivo:', error);
        alert(`Erro ao enviar ${file.name}: ${error.message}`);
      }
    }

    // Clear file input
    fileInput.value = '';
  }

  async function sendFileMessage(file) {
    console.log(`📎 Enviando arquivo: ${file.name} (${file.type}, ${file.size} bytes)`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('to', currentChat.id);

    try {
      setLoading(true, sendBtn);
      
      const res = await fetch(`${WHATSAPP_URL}/api/whatsapp/send-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        },
        body: formData
      });

      if (res.ok) {
        console.log(`✅ Arquivo enviado com sucesso: ${file.name}`);
        
        // Add local message for immediate feedback
        const localMessage = {
          id: 'temp_' + Date.now(),
          body: file.name,
          fromMe: true,
          timestamp: Math.floor(Date.now() / 1000),
          type: getFileType(file.type),
          hasMedia: true,
          media: {
            mimetype: file.type,
            filename: file.name,
            filesize: file.size
          }
        };
        
        handleNewMessage({ ...localMessage, chatId: currentChat.id });
      } else {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar arquivo:', error);
      throw error;
    } finally {
      setLoading(false, sendBtn);
    }
  }

  function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // === TYPING INDICATOR SYSTEM ===

  let typingTimer = null;
  let isTyping = false;

  function initializeTypingIndicator() {
    if (!messageInput) {
      console.log('⚠️ Input de mensagem não encontrado para indicador de digitação');
      return;
    }

    // Detectar quando o usuário está digitando
    messageInput.addEventListener('input', () => {
      handleUserTyping();
    });

    messageInput.addEventListener('keydown', () => {
      handleUserTyping();
    });

    console.log('✅ Sistema de indicador de digitação inicializado');
  }

  function handleUserTyping() {
    if (!currentChat || !socket) return;

    // Se não está digitando, começar a digitar
    if (!isTyping) {
      isTyping = true;
      socket.emit('typing:start', { chatId: currentChat.id });
      console.log('⌨️ Começou a digitar');
    }

    // Limpar timer anterior
    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    // Definir novo timer para parar de digitar (2 segundos de inatividade)
    typingTimer = setTimeout(() => {
      if (isTyping) {
        isTyping = false;
        socket.emit('typing:stop', { chatId: currentChat.id });
        console.log('⌨️ Parou de digitar');
      }
    }, 2000);
  }

  function showTypingIndicator(chatId, userName) {
    if (!typingIndicator || !typingText) return;
    
    // Só mostrar se for o chat atual
    if (!currentChat || currentChat.id !== chatId) return;

    const name = userName || getContactName(chatId);
    typingText.textContent = `${name} está digitando...`;
    typingIndicator.classList.remove('hidden');

    console.log(`⌨️ Mostrando indicador de digitação para ${name}`);
  }

  function hideTypingIndicator(chatId) {
    if (!typingIndicator) return;
    
    // Só esconder se for o chat atual
    if (!currentChat || currentChat.id !== chatId) return;

    typingIndicator.classList.add('hidden');
    console.log('⌨️ Ocultando indicador de digitação');
  }

  function hideAllTypingIndicators() {
    if (!typingIndicator) return;
    typingIndicator.classList.add('hidden');
  }

  // === LINK PREVIEW SYSTEM ===

  function detectLinksInMessage(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex);
    return matches || [];
  }

  function renderMessageWithLinkPreviews(msg) {
    // Verificar se a mensagem tem links
    const links = detectLinksInMessage(msg.body || '');
    
    if (links.length === 0) {
      return `<div class="message-body">${msg.body || ''}</div>`;
    }

    // Renderizar mensagem com links clicáveis
    let messageText = msg.body || '';
    links.forEach(link => {
      const linkHtml = `<a href="${link}" target="_blank" rel="noopener noreferrer" class="message-link">${link}</a>`;
      messageText = messageText.replace(link, linkHtml);
    });

    let linkPreviewHtml = '';
    
    // Se temos informações de preview do servidor
    if (msg.linkPreviews && msg.linkPreviews.length > 0) {
      linkPreviewHtml = msg.linkPreviews.map(preview => `
        <div class="link-preview">
          ${preview.image ? `<div class="link-preview-image">
            <img src="${preview.image}" alt="Preview" loading="lazy">
          </div>` : ''}
          <div class="link-preview-content">
            ${preview.title ? `<div class="link-preview-title">${preview.title}</div>` : ''}
            ${preview.description ? `<div class="link-preview-description">${preview.description}</div>` : ''}
            <div class="link-preview-url">${preview.url}</div>
          </div>
        </div>
      `).join('');
    }

    return `
      <div class="message-body">${messageText}</div>
      ${linkPreviewHtml}
    `;
  }

  async function fetchLinkPreview(url) {
    try {
      // Usar um serviço de preview ou API própria
      const response = await fetch(`${WHATSAPP_URL}/api/link-preview?url=${encodeURIComponent(url)}`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar preview do link:', error);
    }
    
  // === PROFILE PICTURE OPTIMIZATION ===

  function preloadProfilePictures(chatIds) {
    // Pré-carregar fotos de perfil para melhorar performance
    chatIds.forEach(chatId => {
      const img = new Image();
      img.src = `${WHATSAPP_URL}/api/cached-profile-picture/${chatId}`;
      // Não precisamos fazer nada com a imagem, apenas carregar o cache
    });
  }

  function updateProfilePictureInRealTime(chatId, newProfilePicture) {
    // Atualizar foto de perfil em tempo real quando há mudanças
    const chatElements = document.querySelectorAll(`[data-chat-id="${chatId}"] .profile-picture`);
    
    chatElements.forEach(imgElement => {
      if (newProfilePicture) {
        imgElement.src = `${WHATSAPP_URL}/api/cached-profile-picture/${chatId}?t=${Date.now()}`;
        imgElement.style.display = 'block';
        const emojiAvatar = imgElement.parentNode.querySelector('.avatar-emoji');
        if (emojiAvatar) {
          emojiAvatar.style.display = 'none';
        }
      } else {
        imgElement.style.display = 'none';
        const emojiAvatar = imgElement.parentNode.querySelector('.avatar-emoji');
        if (emojiAvatar) {
          emojiAvatar.style.display = 'flex';
        }
      }
    });
  }

  // === VOICE RECORDING SYSTEM ===

  let mediaRecorder = null;
  let audioChunks = [];
  let recordingStartTime = null;
  let recordingTimer = null;
  let recordedBlob = null;

  const voiceBtn = document.getElementById('voiceBtn');
  const voiceModal = document.getElementById('voiceModal');
  const recordingTime = document.getElementById('recordingTime');
  const cancelRecordingBtn = document.getElementById('cancelRecordingBtn');
  const stopRecordingBtn = document.getElementById('stopRecordingBtn');
  const sendVoiceBtn = document.getElementById('sendVoiceBtn');

  function initializeVoiceRecording() {
    if (!voiceBtn || !voiceModal) {
      console.log('⚠️ Elementos de gravação de voz não encontrados');
      return;
    }

    voiceBtn.addEventListener('click', startVoiceRecording);
    cancelRecordingBtn.addEventListener('click', cancelVoiceRecording);
    stopRecordingBtn.addEventListener('click', stopVoiceRecording);
    sendVoiceBtn.addEventListener('click', sendVoiceMessage);

    // Fechar modal clicando fora
    voiceModal.addEventListener('click', (e) => {
      if (e.target === voiceModal) {
        cancelVoiceRecording();
      }
    });

    console.log('✅ Sistema de gravação de voz inicializado');
  }

  async function startVoiceRecording() {
    try {
      console.log('🎤 Iniciando gravação de voz...');

      // Solicitar permissão para o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Configurar o MediaRecorder
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      recordedBlob = null;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        showVoicePreview();
      };

      // Iniciar gravação
      mediaRecorder.start();
      recordingStartTime = Date.now();

      // Mostrar modal e iniciar timer
      voiceModal.classList.remove('hidden');
      voiceBtn.classList.add('recording');
      sendVoiceBtn.classList.add('hidden');
      
      startRecordingTimer();

      console.log('✅ Gravação iniciada');

    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões do navegador.');
    }
  }

  function startRecordingTimer() {
    recordingTimer = setInterval(() => {
      if (recordingStartTime) {
        const elapsed = Date.now() - recordingStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        recordingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Limitar gravação a 5 minutos
        if (elapsed > 300000) {
          stopVoiceRecording();
        }
      }
    }, 100);
  }

  function stopRecordingTimer() {
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }
  }

  function stopVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      stopRecordingTimer();
      voiceBtn.classList.remove('recording');
      console.log('⏹️ Gravação parada');
    }
  }

  function showVoicePreview() {
    // Mostrar botão de envio
    sendVoiceBtn.classList.remove('hidden');
    stopRecordingBtn.classList.add('hidden');
    
    // Atualizar mensagem
    const recordingMessage = document.querySelector('.recording-message');
    if (recordingMessage) {
      recordingMessage.textContent = 'Gravação finalizada. Enviar?';
    }
  }

  function cancelVoiceRecording() {
    if (mediaRecorder) {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      mediaRecorder = null;
    }

    // Limpar dados
    audioChunks = [];
    recordedBlob = null;
    recordingStartTime = null;
    stopRecordingTimer();

    // Resetar interface
    voiceModal.classList.add('hidden');
    voiceBtn.classList.remove('recording');
    sendVoiceBtn.classList.add('hidden');
    stopRecordingBtn.classList.remove('hidden');
    recordingTime.textContent = '00:00';

    const recordingMessage = document.querySelector('.recording-message');
    if (recordingMessage) {
      recordingMessage.textContent = 'Gravando mensagem de voz...';
    }

    console.log('❌ Gravação cancelada');
  }

  async function sendVoiceMessage() {
    if (!recordedBlob || !currentChat || !currentToken) {
      alert('Erro: gravação não disponível ou chat não selecionado');
      return;
    }

    try {
      console.log('📤 Enviando mensagem de voz...');

      const formData = new FormData();
      formData.append('file', recordedBlob, 'voice-message.webm');
      formData.append('to', currentChat.id);

      setLoading(true, sendVoiceBtn);

      const res = await fetch(`${WHATSAPP_URL}/api/whatsapp/send-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        },
        body: formData
      });

      if (res.ok) {
        console.log('✅ Mensagem de voz enviada');
        
        // Adicionar mensagem local para feedback imediato
        const localMessage = {
          id: 'temp_' + Date.now(),
          body: 'Mensagem de voz',
          fromMe: true,
          timestamp: Math.floor(Date.now() / 1000),
          type: 'audio',
          hasMedia: true,
          media: {
            mimetype: 'audio/webm',
            filename: 'voice-message.webm'
          }
        };
        
        handleNewMessage({ ...localMessage, chatId: currentChat.id });
        cancelVoiceRecording();
      } else {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem de voz:', error);
      alert(`Erro ao enviar mensagem de voz: ${error.message}`);
    } finally {
      setLoading(false, sendVoiceBtn);
    }
  }

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
      
      if (isGitHub) {
        setStatus('⚠️ Mixed Content detectado! Clique no alerta azul acima para configurar.', 'error');
      } else {
        setStatus('Problema de conexão com servidores locais', 'error');
      }
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
    
    if (!user || !token) {
      console.log('🔍 Nenhuma sessão armazenada encontrada');
      return false;
    }
    
    try {
      console.log('🔄 Verificando sessão armazenada para:', user);
      console.log('🔗 Testando conexão com:', API_URL);
      
      const res = await fetch(`${API_URL}/session`, {
        headers: { 'Authorization': `Bearer ${token}` },
        mode: 'cors'
      });
      
      console.log('📡 Resposta da verificação de sessão:', res.status);
      
      if (res.ok) {
        currentUser = user;
        currentToken = token;
        console.log('✅ Sessão válida restaurada para:', user);
        showWhatsAppInterface();
        return true;
      } else {
        console.log('❌ Sessão inválida, removendo dados armazenados');
        localStorage.removeItem('wi_user');
        localStorage.removeItem('wi_token');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      console.log('⚠️ Servidor não acessível, exibindo alerta de configuração');
      showConfigAlert();
      return false;
    }
  }

  async function login(username, password) {
    try {
      console.log('🔐 Tentando login...', { username, API_URL });
      console.log('🌍 Configuração atual:', { hostname, isGitHub, isLocalhost, API_URL, WHATSAPP_URL });
      
      // Verificar se estamos no GitHub Pages tentando acessar HTTPS local
      if (isGitHub) {
        console.log('⚠️ Executando no GitHub Pages - Verificando servidores HTTPS...');
        
        // Verificar se os servidores foram autorizados
        if (!localStorage.getItem('servers_authorized')) {
          console.log('🔧 Servidores HTTPS não foram autorizados ainda');
          setStatus('🛠️ Redirecionando para configuração de HTTPS...', 'warning');
          
          setTimeout(() => {
            window.location.href = './setup.html';
          }, 1500);
          return;
        } else {
          console.log('✅ Servidores HTTPS já foram autorizados pelo setup');
          setStatus('🔒 Conectando via HTTPS seguro...', 'info');
          
          // Testar conectividade antes do login
          console.log('🧪 Testando conectividade com servidor auth...');
          try {
            const testResponse = await fetch(API_URL.replace('/api', ''), {
              method: 'GET',
              mode: 'cors'
            });
            console.log('✅ Teste de conectividade OK:', testResponse.status);
          } catch (testError) {
            console.error('❌ Teste de conectividade falhou:', testError);
            setStatus('❌ Não foi possível conectar ao servidor HTTPS. Verifique se os servidores estão rodando e foram autorizados no setup.html', 'error');
            
            // Remover autorização e redirecionar para setup
            localStorage.removeItem('servers_authorized');
            setTimeout(() => {
              window.location.href = './setup.html';
            }, 3000);
            return;
          }
        }
      }
      
      setStatus('Conectando ao servidor...', 'info');
      console.log('📡 Enviando requisição POST para:', `${API_URL}/login`);
      
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        mode: 'cors'
      });

      console.log('📡 Resposta do servidor:', res.status, res.statusText);

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        console.error('❌ Erro no login:', data);
        throw new Error(data?.error || `Erro ${res.status}: ${res.statusText}`);
      }

      const { token } = data;
      if (!token) {
        throw new Error('Token não recebido do servidor');
      }

      localStorage.setItem('wi_user', username);
      localStorage.setItem('wi_token', token);
      localStorage.setItem('servers_authorized', 'true'); // Marcar como autorizado
      
      currentUser = username;
      currentToken = token;
      
      console.log('✅ Login bem-sucedido para:', username);
      setStatus('Autenticado com sucesso!', 'success');
      setTimeout(() => showWhatsAppInterface(), 500);
      
    } catch (err) {
      console.error('❌ Erro no login:', err);
      
      // Tratar diferentes tipos de erro
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        if (isGitHub) {
          console.error('🔒 Mixed Content Error - HTTPS não autorizado');
          setStatus('❌ Servidores HTTPS não autorizados! Redirecionando para setup...', 'error');
          
          // Remover flag de autorização se houver erro
          localStorage.removeItem('servers_authorized');
          
          setTimeout(() => {
            window.location.href = './setup.html';
          }, 2000);
        } else {
          setStatus('❌ Servidor não acessível. Verifique se os servidores estão rodando.', 'error');
        }
      } else if (err.message.includes('NetworkError') || err.message.includes('CORS')) {
        setStatus('❌ Erro de rede ou CORS. Verifique a configuração dos servidores.', 'error');
      } else {
        setStatus(err.message || 'Erro ao autenticar', 'error');
      }
    }
  }
  
  async function testConnectivity() {
    const testBtn = document.getElementById('testConnectionBtn');
    if (!testBtn) return;
    
    const originalText = testBtn.textContent;
    setLoading(true, testBtn);
    testBtn.textContent = '🧪 Testando...';
    
    console.log('🧪 === TESTE DE CONECTIVIDADE ===');
    console.log('🌍 Configuração:', { hostname, isGitHub, isLocalhost, API_URL, WHATSAPP_URL });
    
    try {
      setStatus('🔍 Testando conectividade com servidores...', 'info');
      
      // Teste 1: Servidor Auth
      console.log('🔧 Testando Auth Server...');
      try {
        const authTest = await fetch(API_URL.replace('/api', ''), {
          method: 'GET',
          mode: 'cors'
        });
        console.log('✅ Auth Server:', authTest.status, authTest.statusText);
        
        const authData = await authTest.json();
        console.log('📋 Auth Response:', authData);
        
        setStatus('✅ Auth Server OK', 'success');
      } catch (authError) {
        console.error('❌ Auth Server Error:', authError);
        setStatus(`❌ Auth Server Error: ${authError.message}`, 'error');
        throw authError;
      }
      
      // Teste 2: Health endpoint
      console.log('🔧 Testando Health endpoint...');
      try {
        const healthTest = await fetch(`${API_URL}/health`, {
          method: 'GET',
          mode: 'cors'
        });
        console.log('✅ Health endpoint:', healthTest.status, healthTest.statusText);
        
        const healthData = await healthTest.json();
        console.log('📋 Health Response:', healthData);
        
        setStatus('✅ Todos os testes OK! Você pode tentar fazer login agora.', 'success');
        
        // Se estamos no GitHub Pages, marcar como autorizado
        if (isGitHub) {
          localStorage.setItem('servers_authorized', 'true');
          console.log('✅ Servidores marcados como autorizados');
        }
        
      } catch (healthError) {
        console.error('❌ Health endpoint Error:', healthError);
        setStatus(`❌ Health endpoint Error: ${healthError.message}`, 'error');
        throw healthError;
      }
      
    } catch (error) {
      console.error('❌ Teste de conectividade falhou:', error);
      
      if (isGitHub) {
        setStatus('❌ Mixed Content detectado! Redirecionando para setup...', 'error');
        localStorage.removeItem('servers_authorized');
        setTimeout(() => {
          window.location.href = './setup.html';
        }, 2000);
      } else {
        setStatus('❌ Servidores não estão acessíveis. Verifique se estão rodando.', 'error');
      }
    } finally {
      setLoading(false, testBtn);
      testBtn.textContent = originalText;
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
      
      // Pré-carregar fotos de perfil dos chats atualizados
      const chatIds = newChats.map(chat => chat.id);
      preloadProfilePictures(chatIds);
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
      
      // Pré-carregar fotos de perfil quando chats são sincronizados
      const chatIds = newChats.map(chat => chat.id);
      preloadProfilePictures(chatIds);
    });

    // Handler para atualizações de status de mensagens
    socket.on('message:status', (statusUpdate) => {
      console.log('📊 Status de mensagem atualizado:', statusUpdate);
      updateMessageStatus(statusUpdate);
    });

    // Handler para mudanças de foto de perfil
    socket.on('profile:changed', (profileUpdate) => {
      console.log('👤 Foto de perfil alterada:', profileUpdate);
      
      // Atualizar foto de perfil em tempo real
      updateProfilePictureInRealTime(profileUpdate.contactId, profileUpdate.hasProfilePicture);
      
      // Atualizar cache se o contato está na lista de chats
      const chatIndex = chats.findIndex(chat => chat.id === profileUpdate.contactId);
      if (chatIndex !== -1) {
        chats[chatIndex].profilePicture = profileUpdate.hasProfilePicture 
          ? `${WHATSAPP_URL}/api/cached-profile-picture/${profileUpdate.contactId}`
          : null;
        
        // Re-renderizar apenas o chat específico para atualizar a foto
        renderChats();
      }
    });

    // Handlers para indicador de digitação
    socket.on('typing:start', (data) => {
      console.log('⌨️ Alguém começou a digitar:', data);
      showTypingIndicator(data.chatId, data.userName);
    });

    socket.on('typing:stop', (data) => {
      console.log('⌨️ Alguém parou de digitar:', data);
      hideTypingIndicator(data.chatId);
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

    chatsListEl.innerHTML = sortedChats.map(chat => {
      // Usar sistema de cache otimizado para fotos de perfil
      const profilePictureUrl = chat.profilePicture 
        ? `${WHATSAPP_URL}/api/cached-profile-picture/${chat.id}`
        : null;
      
      // Criar elemento de avatar com foto de perfil cacheada ou emoji
      const avatarContent = profilePictureUrl
        ? `<img src="${profilePictureUrl}" alt="${chat.name}" class="profile-picture" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
        : '';
      const emojiAvatar = `<div class="avatar-emoji" style="${profilePictureUrl ? 'display:none' : ''}">${getAvatarEmoji(chat.name)}</div>`;
      
      return `
        <div class="chat-item" data-chat-id="${chat.id}">
          <div class="chat-avatar">
            ${avatarContent}
            ${emojiAvatar}
          </div>
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
      `;
    }).join('');

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

    // Clear typing indicators when changing chats
    hideAllTypingIndicators();

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

    messagesArea.innerHTML = chatMessages.map(msg => {
      // Determinar o conteúdo da mensagem baseado no tipo
      let messageContent = '';
      
      if (msg.hasMedia && msg.media) {
        // Mensagem com mídia
        const mediaType = msg.type;
        const mimetype = msg.media.mimetype || '';
        
        if (mediaType === 'image' || mimetype.startsWith('image/')) {
          // Imagem
          messageContent = `
            <div class="message-media">
              <img src="data:${mimetype};base64,${msg.media.data}" 
                   alt="Imagem" 
                   class="message-image" 
                   onclick="openMediaViewer(this.src)"
                   loading="lazy">
              ${msg.body ? `<div class="media-caption">${msg.body}</div>` : ''}
            </div>
          `;
        } else if (mediaType === 'video' || mimetype.startsWith('video/')) {
          // Vídeo
          messageContent = `
            <div class="message-media">
              <video controls class="message-video" preload="metadata">
                <source src="data:${mimetype};base64,${msg.media.data}" type="${mimetype}">
                Seu navegador não suporta a reprodução de vídeo.
              </video>
              ${msg.body ? `<div class="media-caption">${msg.body}</div>` : ''}
            </div>
          `;
        } else if (mediaType === 'audio' || mimetype.startsWith('audio/')) {
          // Áudio
          messageContent = `
            <div class="message-media">
              <div class="voice-message">
                <div class="voice-message-icon">🎤</div>
                <div class="voice-message-info">
                  <audio controls class="message-audio">
                    <source src="data:${mimetype};base64,${msg.media.data}" type="${mimetype}">
                    Seu navegador não suporta a reprodução de áudio.
                  </audio>
                  <div class="voice-message-duration">Mensagem de voz</div>
                </div>
              </div>
              ${msg.body ? `<div class="media-caption">${msg.body}</div>` : ''}
            </div>
          `;
        } else if (mediaType === 'document') {
          // Documento
          const filename = msg.media.filename || 'Documento';
          messageContent = `
            <div class="message-media">
              <div class="document-message">
                <div class="document-icon">📄</div>
                <div class="document-info">
                  <div class="document-name">${filename}</div>
                  <div class="document-size">${formatFileSize(msg.media.filesize)}</div>
                </div>
                <button onclick="downloadMedia('${msg.id}')" class="download-btn">⬇️</button>
              </div>
              ${msg.body ? `<div class="media-caption">${msg.body}</div>` : ''}
            </div>
          `;
        } else {
          // Mídia não suportada
          messageContent = `
            <div class="message-media">
              <div class="unsupported-media">
                <span>📎 Mídia não suportada (${mediaType})</span>
                <button onclick="downloadMedia('${msg.id}')" class="download-btn">⬇️ Baixar</button>
              </div>
              ${msg.body ? `<div class="media-caption">${msg.body}</div>` : ''}
            </div>
          `;
        }
      } else {
        // Mensagem de texto normal com possível preview de links
        messageContent = renderMessageWithLinkPreviews(msg);
      }
      
      return `
        <div class="message ${msg.fromMe ? 'from-me' : 'from-other'}" data-message-id="${msg.id}">
          ${messageContent}
          <div class="message-meta">
            <span class="message-time">${formatTime(msg.timestamp)}</span>
            ${msg.fromMe ? `<span class="message-status ${msg.isRead ? 'message-read' : ''}">
              <span class="status-icon ${msg.isRead ? 'read' : ''}">${msg.statusIcon || '✓'}</span>
            </span>` : ''}
          </div>
        </div>
      `;
    }).join('');

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

  // === MESSAGE STATUS MANAGEMENT ===

  function updateMessageStatus(statusUpdate) {
    const { messageId, status, statusIcon, isRead } = statusUpdate;
    
    console.log(`📊 Atualizando status da mensagem ${messageId} para ${status} (${statusIcon})`);
    
    // Encontrar a mensagem em todas as conversas
    let messageFound = false;
    for (const chatId in messages) {
      const chatMessages = messages[chatId];
      const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        // Atualizar status da mensagem
        chatMessages[messageIndex].status = status;
        chatMessages[messageIndex].statusIcon = statusIcon;
        chatMessages[messageIndex].isRead = isRead;
        
        console.log(`✅ Status atualizado para mensagem no chat ${chatId}`);
        messageFound = true;
        
        // Se é o chat atual, re-renderizar as mensagens
        if (currentChat && currentChat.id === chatId) {
          updateMessageStatusInDOM(messageId, statusIcon, isRead);
        }
        break;
      }
    }
    
    if (!messageFound) {
      console.log(`⚠️ Mensagem ${messageId} não encontrada para atualizar status`);
    }
  }

  function updateMessageStatusInDOM(messageId, statusIcon, isRead) {
    // Encontrar o elemento da mensagem no DOM usando o data-message-id
    const messageElement = messagesArea.querySelector(`[data-message-id="${messageId}"]`);
    
    if (messageElement) {
      const messageStatusEl = messageElement.querySelector('.message-status');
      
      if (messageStatusEl) {
        const statusIconEl = messageStatusEl.querySelector('.status-icon');
        
        if (statusIconEl) {
          // Atualizar o ícone de status
          statusIconEl.textContent = statusIcon;
          statusIconEl.className = `status-icon ${isRead ? 'read' : ''}`;
          
          // Adicionar classe de lido ao status
          if (isRead) {
            messageStatusEl.classList.add('message-read');
          }
          
          console.log(`✅ Status atualizado no DOM para mensagem ${messageId}`);
        }
      }
    } else {
      console.log(`⚠️ Elemento DOM não encontrado para mensagem ${messageId}`);
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
    
    console.log('📝 Formulário de login submetido');
    
    if (showMixedContentWarning()) {
      console.log('⚠️ Mixed content warning mostrado');
      setLoading(false);
      return;
    }
    
    const username = document.getElementById('username')?.value?.trim();
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
      setStatus('Preencha todos os campos', 'error');
      return;
    }
    
    setStatus('Validando credenciais…', 'info');
    setLoading(true);
    
    try {
      await login(username, password);
    } catch (err) {
      console.error('❌ Erro no formulário de login:', err);
      const errorMsg = err.message || 'Erro ao autenticar';
      
      if (errorMsg.includes('não acessível') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || err.name === 'TypeError') {
        console.log('🛠️ Exibindo alerta de configuração devido a erro de rede');
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
  
  // Test connection button
  document.getElementById('testConnectionBtn')?.addEventListener('click', async () => {
    await testConnectivity();
  });

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

  // Initialize emoji picker
  initializeEmojiPicker();

  // Initialize file attachment system
  initializeFileAttachment();

  // Initialize typing indicator
  initializeTypingIndicator();

  // Initialize voice recording system
  initializeVoiceRecording();

  // === MEDIA UTILITY FUNCTIONS ===

  // Função para formatar tamanho de arquivo
  function formatFileSize(bytes) {
    if (!bytes) return 'Tamanho desconhecido';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Função para baixar mídia
  async function downloadMedia(messageId) {
    try {
      const response = await fetch(`${WHATSAPP_URL}/api/download-media/${messageId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Criar link temporário para download
        const a = document.createElement('a');
        a.href = url;
        a.download = `media_${messageId}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
      } else {
        console.error('❌ Erro ao baixar mídia:', response.statusText);
        alert('Erro ao baixar mídia');
      }
    } catch (error) {
      console.error('❌ Erro ao baixar mídia:', error);
      alert('Erro ao baixar mídia');
    }
  }

  // Função para abrir visualizador de mídia
  function openMediaViewer(src) {
    // Criar modal para visualização de imagem
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    // Fechar modal ao clicar
    modal.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Fechar modal com ESC
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
  }

  // Disponibilizar funções globalmente para uso nos templates
  window.downloadMedia = downloadMedia;
  window.openMediaViewer = openMediaViewer;

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

// Initialize when DOM is loaded
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

console.log('✅ Script WhatIntegra carregado com sucesso');
}