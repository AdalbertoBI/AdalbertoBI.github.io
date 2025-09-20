import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8765;
const HTTPS_PORT = process.env.HTTPS_PORT || 8766;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Diretórios e arquivos
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JWT_SECRET_FILE = path.join(DATA_DIR, '.jwt_secret');
const SSL_CERT_PATH = path.join(__dirname, 'cert.pem');
const SSL_KEY_PATH = path.join(__dirname, 'key.pem');

// Garantir diretórios existam
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// === CONFIGURAÇÕES DE SEGURANÇA ===

// Cache para rate limiting manual
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS_PER_WINDOW = 100;

// Middleware de Rate Limiting Manual
function rateLimitMiddleware(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  const now = Date.now();
  
  // Limpeza automática de entradas antigas
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      requestCounts.delete(ip);
    }
  }
  
  // Verificar rate limit
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, firstRequest: now });
  } else {
    const clientData = requestCounts.get(clientIP);
    if (now - clientData.firstRequest < RATE_LIMIT_WINDOW) {
      clientData.count++;
      if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
        console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - clientData.firstRequest)) / 1000)
        });
      }
    } else {
      // Resetar contador
      requestCounts.set(clientIP, { count: 1, firstRequest: now });
    }
  }
  
  next();
}

// Middleware de Segurança Manual (substitui Helmet)
function securityMiddleware(req, res, next) {
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('X-Download-Options', 'noopen');
  res.header('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Content Security Policy para desenvolvimento
  if (NODE_ENV === 'development') {
    res.header('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://adalbertobi.github.io; img-src * data: blob:; media-src * blob:;");
  } else {
    res.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  }
  
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  next();
}

// JWT Secret management
function getJwtSecret() {
  if (fs.existsSync(JWT_SECRET_FILE)) {
    return fs.readFileSync(JWT_SECRET_FILE, 'utf8').trim();
  }
  const secret = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 64);
  fs.writeFileSync(JWT_SECRET_FILE, secret, { encoding: 'utf8' });
  return secret;
}

const JWT_SECRET = process.env.JWT_SECRET || getJwtSecret();

// === MIDDLEWARES ===

// Body parsing com limite de tamanho
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Security headers
app.use(securityMiddleware);

// Request logging melhorado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  console.log(`📡 [${timestamp}] ${req.method} ${req.url} - IP: ${clientIP} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// CORS melhorado
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Lista de origens permitidas
  const allowedOrigins = [
    'https://adalbertobi.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000'
  ];
  
  // Em desenvolvimento, permitir qualquer origem
  if (NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  next();
});

// === FUNÇÕES UTILITÁRIAS ===

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('❌ Erro ao ler usuários:', error);
    return [];
  }
}

// Validação de entrada manual
function validateLoginInput(username, password) {
  const errors = [];
  
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.push('Username é obrigatório');
  } else if (username.length > 50) {
    errors.push('Username muito longo');
  }
  
  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password é obrigatório');
  } else if (password.length > 200) {
    errors.push('Password muito longo');
  }
  
  return errors;
}

// === ROTAS ===

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    ok: true, 
    message: 'WhatIntegra Auth Server is running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Root access from:', req.headers.origin || 'unknown');
  res.json({ 
    message: 'WhatIntegra Auth Server', 
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    console.log('📋 Login attempt from:', req.headers.origin || 'unknown');
    
    const { username, password } = req.body || {};
    
    // Validação de entrada
    const validationErrors = validateLoginInput(username, password);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    // Buscar usuários
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === String(username).toLowerCase().trim());
    
    if (!user) {
      console.log('❌ User not found:', username);
      // Delay para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    
    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      console.log('❌ Wrong password for user:', username);
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    
    // Gerar token JWT
    const tokenPayload = { 
      sub: user.username, 
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 horas
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET);
    
    console.log('✅ Login successful for user:', username);
    res.json({ 
      token, 
      user: { username: user.username },
      expiresIn: '2h'
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// JWT verification middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Invalid token:', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  console.log('👤 Profile requested for:', req.user.sub);
  res.json({ username: req.user.sub });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ Route not found:', req.method, req.url);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// === INICIALIZAÇÃO DOS SERVIDORES ===

// Servidor HTTP
const httpServer = http.createServer(app);
httpServer.listen(PORT, '127.0.0.1', () => {
  console.log(`Auth server rodando em http://127.0.0.1:${PORT}`);
});

// Servidor HTTPS
if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH)
    };

    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(HTTPS_PORT, '127.0.0.1', () => {
      console.log(`🔒 Auth server HTTPS rodando em https://127.0.0.1:${HTTPS_PORT}`);
    });
    
  } catch (error) {
    console.log('⚠️  Não foi possível iniciar servidor HTTPS:', error.message);
    console.log('   Servidor HTTP continua disponível em http://127.0.0.1:' + PORT);
  }
} else {
  console.log('⚠️  Certificados SSL não encontrados. Apenas HTTP disponível.');
  console.log('   Execute: npm run generate:certs para criar certificados');
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  httpServer.close(() => {
    console.log('✅ Servidor HTTP encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  httpServer.close(() => {
    console.log('✅ Servidor HTTP encerrado');
    process.exit(0);
  });
});

export default app;