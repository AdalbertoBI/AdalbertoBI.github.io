import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { fileURLToPath } from 'url';
import pkg from 'whatsapp-web.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import qrcode from 'qrcode';

const { Client, LocalAuth } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      callback(null, true);
    },
    credentials: false
  }
});

const PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3002;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
const DATA_DIR = process.env.WHATSAPP_DATA_DIR || path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JWT_SECRET_FILE = path.join(DATA_DIR, '.jwt_secret');
const WHATSAPP_SESSION_DIR = process.env.WHATSAPP_SESSION_PATH || path.join(DATA_DIR, 'whatsapp_session');

// Caminhos dos certificados SSL
const SSL_CERT_PATH = path.join(__dirname, 'cert.pem');
const SSL_KEY_PATH = path.join(__dirname, 'key.pem');

// Garantir diretórios
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(WHATSAPP_SESSION_DIR)) fs.mkdirSync(WHATSAPP_SESSION_DIR, { recursive: true });

// Configuração JWT
function getJwtSecret() {
  if (fs.existsSync(JWT_SECRET_FILE)) {
    return fs.readFileSync(JWT_SECRET_FILE, 'utf8').trim();
  }
  const secret = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 64);
  fs.writeFileSync(JWT_SECRET_FILE, secret, { encoding: 'utf8' });
  return secret;
}

const JWT_SECRET = process.env.JWT_SECRET || getJwtSecret();

// Middleware
app.use(express.json());

// Endpoint para obter preview de links
app.get('/api/link-preview', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    console.log('🔗 Buscando preview para:', url);

    // Fazer requisição para obter o HTML da página
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhatIntegra/1.0; +https://whatintegra.com/bot)'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extrair metadados usando regex simples
    const preview = {
      url: url,
      title: extractMetaContent(html, 'og:title') || extractTitleTag(html),
      description: extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description'),
      image: extractMetaContent(html, 'og:image') || extractMetaContent(html, 'twitter:image')
    };

    // Limpar dados
    if (preview.image && !preview.image.startsWith('http')) {
      const urlObj = new URL(url);
      preview.image = new URL(preview.image, urlObj.origin).href;
    }

    console.log('✅ Preview obtido:', preview);
    res.json(preview);

  } catch (error) {
    console.error('❌ Erro ao buscar preview:', error);
    res.status(500).json({ error: 'Erro ao buscar preview do link' });
  }
});

function extractMetaContent(html, property) {
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractTitleTag(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage(); // Armazenar arquivos na memória
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024, // Limite de 16MB
    files: 5 // Máximo 5 arquivos por vez
  },
  fileFilter: (req, file, cb) => {
    // Aceitar tipos de arquivo comuns
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/webm',
      'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}`), false);
    }
  }
});

// CORS permissivo para desenvolvimento
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS request from origin:', origin);
    callback(null, true);
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    console.log('Preflight request from:', origin);
    return res.status(200).end();
  }
  
  next();
});

// Estado global do WhatsApp
let whatsappClient = null;
let whatsappStatus = 'disconnected';
let qrCodeData = null;
let connectedUsers = new Set();
let chats = [];
let currentQRAttempts = 0;
const MAX_QR_ATTEMPTS = 5;

// Funções de usuários
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ error: 'Token necessário' });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Inicializar WhatsApp Client
function initializeWhatsApp() {
  console.log('🔄 Inicializando cliente WhatsApp...');
  
  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: WHATSAPP_SESSION_DIR,
      clientId: 'whatintegra'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  whatsappClient.on('qr', async (qr) => {
    console.log('📱 QR Code recebido');
    currentQRAttempts++;
    
    try {
      qrCodeData = await qrcode.toDataURL(qr);
      whatsappStatus = 'qr';
      
      // Emitir QR code para todos os usuários conectados
      io.emit('whatsapp:qr', { qr: qrCodeData, attempts: currentQRAttempts });
      console.log(`📱 QR Code enviado para ${connectedUsers.size} usuários conectados`);
      
      if (currentQRAttempts >= MAX_QR_ATTEMPTS) {
        console.log('⚠️ Máximo de tentativas de QR atingido');
        whatsappStatus = 'failed';
        io.emit('whatsapp:status', { status: 'failed', message: 'Máximo de tentativas atingido' });
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR code:', error);
    }
  });

  whatsappClient.on('ready', async () => {
    console.log('✅ WhatsApp Web está pronto!');
    whatsappStatus = 'connected';
    qrCodeData = null;
    currentQRAttempts = 0;
    
    // Buscar chats iniciais com fotos de perfil
    console.log('📋 Carregando chats com fotos de perfil...');
    const initialChats = await whatsappClient.getChats();
    
    const chatsWithProfiles = await Promise.all(
      initialChats.slice(0, 50).map(async (chat) => {
        try {
          let profilePicture = null;
          try {
            profilePicture = await chat.getProfilePicUrl();
          } catch (error) {
            console.log(`⚠️ Sem foto de perfil para ${chat.name || chat.id.user}: ${error.message}`);
            profilePicture = null; // Garantir que seja null em caso de erro
          }
          
          return {
            id: chat.id._serialized,
            name: chat.name || chat.id.user,
            isGroup: chat.isGroup,
            profilePicture: profilePicture,
            lastMessage: chat.lastMessage ? {
              body: chat.lastMessage.body,
              timestamp: chat.lastMessage.timestamp,
              fromMe: chat.lastMessage.fromMe
            } : null,
            unreadCount: chat.unreadCount || 0
          };
        } catch (error) {
          console.error(`❌ Erro ao processar chat ${chat.id._serialized}:`, error);
          return {
            id: chat.id._serialized,
            name: chat.name || chat.id.user,
            isGroup: chat.isGroup,
            profilePicture: null,
            lastMessage: chat.lastMessage ? {
              body: chat.lastMessage.body,
              timestamp: chat.lastMessage.timestamp,
              fromMe: chat.lastMessage.fromMe
            } : null,
            unreadCount: chat.unreadCount || 0
          };
        }
      })
    );
    
    chats = chatsWithProfiles;
    console.log(`📋 ${chats.length} chats carregados com fotos de perfil`);
    
    io.emit('whatsapp:status', { 
      status: 'connected',
      chats: chats
    });
    
    console.log(`✅ ${chats.length} chats carregados`);
  });

  whatsappClient.on('message', async (message) => {
    console.log('📨 Nova mensagem recebida:', message.body, 'Tipo:', message.type);
    console.log('📨 De:', message.from, 'Para:', message.to, 'FromMe:', message.fromMe);
    
    let messageData = {
      id: message.id._serialized,
      body: message.body,
      from: message.from,
      to: message.to,
      fromMe: message.fromMe,
      timestamp: message.timestamp * 1000, // Converter para milissegundos
      type: message.type,
      chatId: message.from, // ID do chat (remetente para mensagens recebidas)
      hasMedia: message.hasMedia,
      media: null,
      mediaInfo: null
    };
    
    // Processar mídia se existir
    if (message.hasMedia && ['image', 'video', 'audio', 'document', 'sticker'].includes(message.type)) {
      try {
        console.log('📎 Processando mídia do tipo:', message.type);
        const media = await message.downloadMedia();
        
        if (media) {
          messageData.media = {
            data: media.data, // Base64 da mídia
            mimetype: media.mimetype,
            filename: media.filename || `media_${Date.now()}.${media.mimetype.split('/')[1]}`,
            filesize: media.filesize || null
          };
          
          messageData.mediaInfo = {
            type: message.type,
            mimetype: media.mimetype,
            filename: media.filename,
            caption: message.body || '', // Caption da imagem/vídeo
          };
          
          console.log('✅ Mídia processada:', message.type, media.mimetype, media.filename);
        }
      } catch (error) {
        console.error('❌ Erro ao baixar mídia:', error);
      }
    }
    
    // Adicionar informações de link preview
    if (message.type === 'chat' && message.links && message.links.length > 0) {
      messageData.links = message.links;
    }
    
    console.log('📤 Emitindo mensagem via WebSocket:', {
      ...messageData,
      media: messageData.media ? { ...messageData.media, data: '[BASE64_DATA]' } : null
    });
    
    // Emitir mensagem para todos os usuários conectados
    io.emit('whatsapp:message', messageData);
    
    // Também emitir no novo formato para compatibilidade
    io.emit('message:new', messageData);
    
    // Atualizar lista de chats se necessário
    if (!chats.find(chat => chat.id === message.from)) {
      try {
        const chat = await message.getChat();
        
        let profilePicture = null;
        try {
          profilePicture = await chat.getProfilePicUrl();
        } catch (error) {
          console.log(`⚠️ Sem foto de perfil para ${chat.name || chat.id.user}: ${error.message}`);
          profilePicture = null; // Garantir que seja null em caso de erro
        }
        
        const newChatData = {
          id: chat.id._serialized,
          name: chat.name || chat.id.user,
          isGroup: chat.isGroup,
          profilePicture: profilePicture,
          lastMessage: {
            body: message.body,
            timestamp: message.timestamp,
            fromMe: message.fromMe
          },
          unreadCount: chat.unreadCount || 0
        };
        
        chats.unshift(newChatData);
        io.emit('whatsapp:chats', chats);
      } catch (error) {
        console.error('❌ Erro ao buscar chat:', error);
      }
    }
  });

  whatsappClient.on('disconnected', (reason) => {
    console.log('🔌 WhatsApp desconectado:', reason);
    whatsappStatus = 'disconnected';
    qrCodeData = null;
    chats = [];
    
    io.emit('whatsapp:status', { 
      status: 'disconnected', 
      reason: reason 
    });
    
    // Tentar reconectar após 5 segundos
    setTimeout(() => {
      console.log('🔄 Tentando reconectar...');
      initializeWhatsApp();
    }, 5000);
  });

  whatsappClient.on('auth_failure', (message) => {
    console.error('❌ Falha na autenticação:', message);
    whatsappStatus = 'auth_failure';
    io.emit('whatsapp:status', { 
      status: 'auth_failure', 
      message: 'Falha na autenticação. Escaneie o QR code novamente.' 
    });
  });

  // Event handlers para status de mensagens
  whatsappClient.on('message_ack', (message, ack) => {
    console.log('📝 Status da mensagem atualizado:', message.id._serialized, 'Status:', ack);
    
    let status = 'sent';
    let statusIcon = '✓';
    
    switch (ack) {
      case 1: // ACK_SENT - Mensagem enviada para o servidor
        // Valores já definidos por padrão
        break;
      case 2: // ACK_RECEIVED - Mensagem entregue ao dispositivo do destinatário
        status = 'delivered';
        statusIcon = '✓✓';
        break;
      case 3: // ACK_READ - Mensagem lida pelo destinatário
        status = 'read';
        statusIcon = '✓✓';
        break;
    }
    
    const statusUpdate = {
      messageId: message.id._serialized,
      status: status,
      statusIcon: statusIcon,
      isRead: ack === 3,
      timestamp: Date.now()
    };
    
    console.log('📤 Emitindo atualização de status:', statusUpdate);
    io.emit('message:status', statusUpdate);
  });

  // Handler para mudanças em fotos de perfil de contatos
  whatsappClient.on('contact_changed', async (contact) => {
    try {
      console.log('👤 Contato alterado:', contact.id);
      
      // Verificar se houve mudança na foto de perfil
      const newProfilePicUrl = await contact.getProfilePicUrl().catch(() => null);
      
      // Limpar cache da foto antiga
      const cacheKey = `profile_${contact.id}`;
      profilePictureCache.delete(cacheKey);
      
      // Emitir evento para clientes conectados
      io.emit('profile:changed', {
        contactId: contact.id,
        name: contact.name || contact.pushname,
        hasProfilePicture: !!newProfilePicUrl
      });
      
    } catch (error) {
      console.error('⚠️ Erro ao processar mudança de contato:', error);
    }
  });

  // Event handler para mensagens lidas
  whatsappClient.on('message_read', (message) => {
    console.log('👁️ Mensagem marcada como lida:', message.id._serialized);
    
    const readUpdate = {
      messageId: message.id._serialized,
      status: 'read',
      statusIcon: '✓✓',
      isRead: true,
      timestamp: Date.now()
    };
    
    io.emit('message:status', readUpdate);
  });

  whatsappClient.initialize();
}

// Função para configurar eventos do WebSocket (reutilizada para HTTP e HTTPS)
function setupWebSocketEvents(ioInstance) {
  ioInstance.on('connection', (socket) => {
    console.log('👤 Usuário conectado via WebSocket');
    connectedUsers.add(socket.id);
    
    // Enviar status atual
    socket.emit('whatsapp:status', { 
      status: whatsappStatus,
      chats: chats,
      qr: qrCodeData 
    });
    
    // Handler para solicitar lista de chats
    socket.on('get-chats', async () => {
      console.log('📋 Solicitação de lista de chats via WebSocket');
      if (client?.info) {
        try {
          const chatList = await client.getChats();
          const formattedChats = chatList.slice(0, 20).map(chat => ({
            id: chat.id._serialized,
            name: chat.name || chat.pushname || 'Sem nome',
            isGroup: chat.isGroup,
            lastMessage: chat.lastMessage ? {
              body: chat.lastMessage.body,
              timestamp: chat.lastMessage.timestamp * 1000,
              fromMe: chat.lastMessage.fromMe
            } : null,
            unreadCount: chat.unreadCount || 0
          }));
          
          chats = formattedChats;
          socket.emit('chats:update', chats);
          console.log(`📋 Enviados ${chats.length} chats via WebSocket`);
        } catch (error) {
          console.error('❌ Erro ao buscar chats via WebSocket:', error);
          socket.emit('error', { message: 'Erro ao buscar chats' });
        }
      } else {
        socket.emit('error', { message: 'WhatsApp não conectado' });
      }
    });
    
    // Handler para sincronizar mensagens
    socket.on('sync-messages', async ({ chatId, lastTimestamp }) => {
      if (client?.info) {
        try {
          const chat = await client.getChatById(chatId);
          const messages = await chat.fetchMessages({ limit: 10 });
          
          // Filtrar apenas mensagens mais recentes que o último timestamp
          const newMessages = messages
            .filter(msg => msg.timestamp * 1000 > lastTimestamp)
            .map(msg => ({
              id: msg.id._serialized,
              chatId: msg.from,
              body: msg.body,
              fromMe: msg.fromMe,
              timestamp: msg.timestamp * 1000,
              type: msg.type
            }));
            
          if (newMessages.length > 0) {
            console.log(`🔄 Sincronizando ${newMessages.length} mensagens novas para ${chatId}`);
            newMessages.forEach(msg => {
              socket.emit('message:new', msg);
            });
          }
        } catch (error) {
          console.error('❌ Erro na sincronização de mensagens:', error);
        }
      }
    });
    
    // Handlers para indicador de digitação
    socket.on('typing:start', (data) => {
      console.log('⌨️ Usuário começou a digitar:', data);
      // Retransmitir para outros usuários conectados (simulação)
      socket.broadcast.emit('typing:start', {
        chatId: data.chatId,
        userName: 'Usuário', // Poderia ser obtido do WhatsApp
        userId: socket.id
      });
    });

    socket.on('typing:stop', (data) => {
      console.log('⌨️ Usuário parou de digitar:', data);
      // Retransmitir para outros usuários conectados (simulação)
      socket.broadcast.emit('typing:stop', {
        chatId: data.chatId,
        userId: socket.id
      });
    });
    
    socket.on('disconnect', () => {
      console.log('👤 Usuário desconectado');
      connectedUsers.delete(socket.id);
    });
  });
}

// Socket.IO para tempo real (servidor HTTP)
setupWebSocketEvents(io);

// === ROTAS DE AUTENTICAÇÃO ===

app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    whatsapp: whatsappStatus,
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString() 
  });
});

// Rota de health check para Railway
app.get('/health', (req, res) => {
  console.log('🏥 Railway health check - WhatsApp Server');
  res.status(200).json({ 
    status: 'healthy',
    service: 'whatintegra-whatsapp',
    whatsappStatus: whatsappStatus,
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// === ENDPOINTS PARA MÍDIAS E FOTOS DE PERFIL ===

// Cache de fotos de perfil para melhor performance
const profilePictureCache = new Map();

// Criar diretório de cache se não existir
const cacheDir = path.join(__dirname, 'cache', 'profile-pictures');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Endpoint melhorado para foto de perfil com cache
app.get('/api/profile-picture/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    if (!whatsappClient || whatsappStatus !== 'connected') {
      return res.status(503).json({ error: 'WhatsApp não conectado' });
    }

    // Verificar cache na memória primeiro
    const cacheKey = `profile_${chatId}`;
    const cached = profilePictureCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < 3600000) { // Cache de 1 hora
      console.log('📸 Foto de perfil servida do cache:', chatId);
      return res.redirect(cached.url);
    }

    const chat = await whatsappClient.getChatById(chatId);
    
    if (chat) {
      const profilePicUrl = await chat.getProfilePicUrl();
      if (profilePicUrl) {
        // Salvar no cache
        profilePictureCache.set(cacheKey, {
          url: profilePicUrl,
          timestamp: Date.now()
        });

        console.log('📸 Nova foto de perfil obtida e cacheada:', chatId);
        
        // Tentar baixar e cachear localmente para próximas requisições
        downloadAndCacheProfilePicture(chatId, profilePicUrl);
        
        res.redirect(profilePicUrl);
      } else {
        res.status(404).json({ error: 'Foto de perfil não encontrada' });
      }
    } else {
      res.status(404).json({ error: 'Chat não encontrado' });
    }
  } catch (error) {
    console.error('❌ Erro ao obter foto de perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para baixar e cachear fotos de perfil localmente
async function downloadAndCacheProfilePicture(chatId, profilePicUrl) {
  try {
    const fileName = `${chatId.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    const filePath = path.join(cacheDir, fileName);
    
    // Verificar se já existe no disco
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const ageInHours = (Date.now() - stats.mtime.getTime()) / 3600000;
      
      if (ageInHours < 24) { // Cache de disco válido por 24 horas
        return filePath;
      }
    }

    // Baixar nova imagem
    console.log('📥 Baixando foto de perfil para cache:', chatId);
    const response = await fetch(profilePicUrl);
    
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      console.log('✅ Foto de perfil cacheada no disco:', fileName);
      return filePath;
    }
  } catch (error) {
    console.error('⚠️ Erro ao cachear foto de perfil:', error);
  }
  
  return null;
}

// Endpoint para servir fotos de perfil do cache local
app.get('/api/cached-profile-picture/:chatId', (req, res) => {
  try {
    const chatId = req.params.chatId;
    const fileName = `${chatId.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    const filePath = path.join(cacheDir, fileName);
    
    if (fs.existsSync(filePath)) {
      console.log('📸 Servindo foto de perfil do cache local:', chatId);
      res.sendFile(filePath);
    } else {
      // Redirecionar para o endpoint que busca a foto
      res.redirect(`/api/profile-picture/${chatId}`);
    }
  } catch (error) {
    console.error('❌ Erro ao servir foto de perfil do cache:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint original mantido para compatibilidade
app.get('/api/profile-picture/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    if (!whatsappClient || whatsappStatus !== 'connected') {
      return res.status(503).json({ error: 'WhatsApp não conectado' });
    }
    
    const chat = await whatsappClient.getChatById(chatId);
    
    if (chat) {
      const profilePicUrl = await chat.getProfilePicUrl();
      if (profilePicUrl) {
        // Redirecionar para a URL da foto de perfil
        res.redirect(profilePicUrl);
      } else {
        res.status(404).json({ error: 'Foto de perfil não encontrada' });
      }
    } else {
      res.status(404).json({ error: 'Chat não encontrado' });
    }
  } catch (error) {
    console.error('❌ Erro ao obter foto de perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para baixar mídia de uma mensagem
app.get('/api/download-media/:messageId', async (req, res) => {
  try {
    const messageId = req.params.messageId;
    
    if (!whatsappClient || whatsappStatus !== 'connected') {
      return res.status(503).json({ error: 'WhatsApp não conectado' });
    }
    
    // Buscar a mensagem pelo ID
    const message = await whatsappClient.getMessageById(messageId);
    
    if (message && typeof message.hasMedia === 'boolean' && message.hasMedia) {
      const media = await message.downloadMedia();
      
      if (media) {
        const buffer = Buffer.from(media.data, 'base64');
        
        res.set({
          'Content-Type': media.mimetype,
          'Content-Length': buffer.length,
          'Content-Disposition': `inline; filename="${media.filename || 'media'}"`
        });
        
        res.send(buffer);
      } else {
        res.status(404).json({ error: 'Mídia não encontrada' });
      }
    } else {
      res.status(404).json({ error: 'Mensagem ou mídia não encontrada' });
    }
  } catch (error) {
    console.error('❌ Erro ao baixar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para servir mídia em base64 (para exibição direta no navegador)
app.get('/api/media/:messageId', async (req, res) => {
  try {
    const messageId = req.params.messageId;
    
    if (!whatsappClient || whatsappStatus !== 'connected') {
      return res.status(503).json({ error: 'WhatsApp não conectado' });
    }
    
    const message = await whatsappClient.getMessageById(messageId);
    
    if (message && typeof message.hasMedia === 'boolean' && message.hasMedia) {
      const media = await message.downloadMedia();
      
      if (media) {
        res.json({
          data: media.data,
          mimetype: media.mimetype,
          filename: media.filename,
          filesize: media.filesize
        });
      } else {
        res.status(404).json({ error: 'Mídia não encontrada' });
      }
    } else {
      res.status(404).json({ error: 'Mensagem ou mídia não encontrada' });
    }
  } catch (error) {
    console.error('❌ Erro ao obter mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('🔐 Tentativa de login:', req.body);
  
  const { username, password } = req.body;
  if (!username || !password) {
    console.log('❌ Username or password missing');
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === String(username).toLowerCase());
  
  if (!user) {
    console.log('❌ User not found:', username);
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    console.log('❌ Wrong password for user:', username);
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }
  
  console.log('✅ Login successful for user:', username);
  const token = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

app.get('/api/session', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) return res.status(401).json({ error: 'Sem token' });
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, user: payload.sub });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// === ROTAS DO WHATSAPP ===

app.get('/api/whatsapp/status', authenticateToken, (req, res) => {
  res.json({
    status: whatsappStatus,
    chats: chats,
    qr: qrCodeData,
    connectedUsers: connectedUsers.size
  });
});

app.post('/api/whatsapp/restart', authenticateToken, (req, res) => {
  console.log('🔄 Reiniciando WhatsApp por solicitação do usuário:', req.user);
  
  if (whatsappClient) {
    whatsappClient.destroy();
  }
  
  whatsappStatus = 'initializing';
  qrCodeData = null;
  chats = [];
  currentQRAttempts = 0;
  
  setTimeout(() => {
    initializeWhatsApp();
  }, 2000);
  
  res.json({ message: 'WhatsApp reiniciando...' });
});

app.get('/api/whatsapp/chats', authenticateToken, (req, res) => {
  res.json({ chats: chats });
});

app.get('/api/whatsapp/chat/:chatId/messages', authenticateToken, async (req, res) => {
  const { chatId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  
  if (!whatsappClient || whatsappStatus !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não está conectado' });
  }
  
  try {
    const chat = await whatsappClient.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit });
    
    const formattedMessages = messages.map(msg => ({
      id: msg.id._serialized,
      body: msg.body,
      from: msg.from,
      to: msg.to,
      fromMe: msg.fromMe,
      timestamp: msg.timestamp,
      type: msg.type
    }));
    
    res.json({ messages: formattedMessages.reverse() });
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

app.post('/api/whatsapp/send', authenticateToken, async (req, res) => {
  const { to, message } = req.body;
  
  if (!whatsappClient || whatsappStatus !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não está conectado' });
  }
  
  if (!to || !message) {
    return res.status(400).json({ error: 'Destinatário e mensagem são obrigatórios' });
  }
  
  try {
    console.log(`📤 Enviando mensagem para ${to}: ${message.substring(0, 50)}...`);
    await whatsappClient.sendMessage(to, message);
    
    res.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      sentBy: req.user 
    });
    
    console.log(`✅ Mensagem enviada por ${req.user}`);
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Endpoint para enviar mídias
app.post('/api/whatsapp/send-media', authenticateToken, upload.single('file'), async (req, res) => {
  if (!whatsappClient || whatsappStatus !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não está conectado' });
  }
  
  const { to } = req.body;
  const file = req.file;
  
  if (!to || !file) {
    return res.status(400).json({ error: 'Destinatário e arquivo são obrigatórios' });
  }
  
  try {
    console.log(`📎 Enviando mídia para ${to}: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
    
    // Preparar mídia para envio
    const media = {
      data: file.buffer.toString('base64'),
      mimetype: file.mimetype,
      filename: file.originalname
    };
    
    // Usar o whatsapp-web.js para enviar mídia
    await whatsappClient.sendMessage(to, media, { 
      sendAudioAsVoice: file.mimetype.startsWith('audio/') 
    });
    
    res.json({ 
      success: true, 
      message: 'Mídia enviada com sucesso',
      filename: file.originalname,
      size: file.size,
      type: file.mimetype,
      sentBy: req.user 
    });
    
    console.log(`✅ Mídia enviada por ${req.user}: ${file.originalname}`);
  } catch (error) {
    console.error('❌ Erro ao enviar mídia:', error);
    res.status(500).json({ error: 'Erro ao enviar mídia: ' + error.message });
  }
});

// Inicializar WhatsApp na inicialização do servidor
console.log('🚀 Inicializando servidor WhatIntegra...');
initializeWhatsApp();

// Iniciar servidor HTTP (usando HOST configurado anteriormente)
server.listen(PORT, HOST, () => {
  console.log(`✅ WhatIntegra WhatsApp Server rodando em:`);
  console.log(`   - Local: http://127.0.0.1:${PORT}`);
  console.log(`   - Rede: http://192.168.1.4:${PORT}`);
  console.log(`   - Todas as interfaces: http://${HOST}:${PORT}`);
  console.log(`   - Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket habilitado para tempo real`);
  console.log(`📱 WhatsApp Web integrado`);
});

// Iniciar servidor HTTPS se os certificados existirem
if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH)
    };

    const httpsServer = createHttpsServer(httpsOptions, app);
    const httpsIo = new Server(httpsServer, {
      cors: {
        origin: function(origin, callback) {
          callback(null, true);
        },
        credentials: false
      }
    });

    // Configurar os mesmos eventos do WebSocket para HTTPS
    setupWebSocketEvents(httpsIo);

    httpsServer.listen(HTTPS_PORT, HOST, () => {
      console.log(`🔒 WhatIntegra HTTPS rodando em:`);
      console.log(`   - Local: https://127.0.0.1:${HTTPS_PORT}`);
      console.log(`   - Rede: https://192.168.1.4:${HTTPS_PORT}`);
      console.log(`   - Todas as interfaces: https://${HOST}:${HTTPS_PORT}`);
      console.log(`🔌 WebSocket HTTPS habilitado para tempo real`);
      console.log(`📱 WhatsApp Web integrado via HTTPS`);
    });
  } catch (error) {
    console.log('⚠️  Não foi possível iniciar servidor HTTPS:', error.message);
    console.log(`   Servidor HTTP continua disponível em http://${HOST}:${PORT}`);
  }
} else {
  console.log('⚠️  Certificados SSL não encontrados. Apenas HTTP disponível.');
}