import express from 'express';
import cors from 'cors';
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
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JWT_SECRET_FILE = path.join(DATA_DIR, '.jwt_secret');

// Caminhos dos certificados SSL
const SSL_CERT_PATH = path.join(__dirname, 'cert.pem');
const SSL_KEY_PATH = path.join(__dirname, 'key.pem');

// 🛡️ RATE LIMITING SIMPLES (sem dependências externas)
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests por 15 minutos

function rateLimitMiddleware(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();
  
  // Limpar entradas antigas
  for (const [ip, data] of rateLimiter.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimiter.delete(ip);
    }
  }
  
  if (!rateLimiter.has(clientIP)) {
    rateLimiter.set(clientIP, { firstRequest: now, count: 1 });
    return next();
  }
  
  const clientData = rateLimiter.get(clientIP);
  
  if (now - clientData.firstRequest > RATE_LIMIT_WINDOW) {
    // Nova janela de tempo
    rateLimiter.set(clientIP, { firstRequest: now, count: 1 });
    return next();
  }
  
  clientData.count++;
  
  if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
    console.log(`🚫 Rate limit exceeded for IP: ${clientIP} (${clientData.count} requests)`);
    return res.status(429).json({ 
      error: 'Too many requests', 
      message: `Rate limit exceeded. Max ${RATE_LIMIT_MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW / 60000} minutes.`,
      retryAfter: RATE_LIMIT_WINDOW / 1000
    });
  }
  
  // Headers informativos
  res.set({
    'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS,
    'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT_MAX_REQUESTS - clientData.count),
    'X-RateLimit-Reset': new Date(clientData.firstRequest + RATE_LIMIT_WINDOW).toISOString()
  });
  
  next();
}

// garantir diretórios
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getJwtSecret() {
  if (fs.existsSync(JWT_SECRET_FILE)) {
    return fs.readFileSync(JWT_SECRET_FILE, 'utf8').trim();
  }
  const secret = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 64);
  fs.writeFileSync(JWT_SECRET_FILE, secret, { encoding: 'utf8' });
  return secret;
}

const JWT_SECRET = process.env.JWT_SECRET || getJwtSecret();

// 🛡️ MIDDLEWARES DE SEGURANÇA
app.use(express.json({ limit: '1mb' })); // Limite de payload
app.use(rateLimitMiddleware); // Rate limiting

// 🛡️ Headers de segurança melhorados
app.use((req, res, next) => {
  const startTime = Date.now();
  console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'} - IP: ${req.ip || 'unknown'}`);
  
  const origin = req.headers.origin;
  
  // 🌐 CORS com whitelist inteligente
  const allowedOrigins = [
    'https://adalbertobi.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'null' // Para testes locais
  ];
  
  const isAllowedOrigin = !origin || origin === 'null' || allowedOrigins.some(allowed => 
    origin.startsWith(allowed)
  );
  
  if (isAllowedOrigin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');
  
  // 🛡️ Headers de segurança avançados (equivalente ao Helmet)
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Permissions-Policy', 'camera=(), microphone=(), location=()');
  res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  
  // 🏷️ Server signature
  res.header('Server', 'WhatIntegra-Auth/2.0');
  
  console.log(`🔧 Security headers set for origin: ${origin} (${isAllowedOrigin ? 'ALLOWED' : 'BLOCKED'})`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  // Log de performance
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`⏱️  ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// 🔧 Input validation helper
function validateLoginInput(req, res, next) {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password must be strings' });
  }
  
  if (username.length > 50 || password.length > 100) {
    return res.status(400).json({ error: 'Username or password too long' });
  }
  
  // Sanitização básica
  req.body.username = username.trim().toLowerCase();
  req.body.password = password.trim();
  
  next();
}

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 🏥 Health check com informações de segurança
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    ok: true, 
    message: 'WhatIntegra Auth Server is running with security enhancements', 
    timestamp: new Date().toISOString(),
    security: {
      rateLimit: `${RATE_LIMIT_MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW / 60000} minutes`,
      cors: 'Whitelist enabled',
      headers: 'Security headers active',
      validation: 'Input validation enabled'
    },
    version: '2.0-enhanced'
  });
});

// 👤 Rota de login com validação melhorada
app.post('/api/login', validateLoginInput, async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = readUsers();
    
    console.log(`🔐 Login attempt for user: ${username}`);
    
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatch) {
      console.log(`❌ Password mismatch for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // JWT com configuração mais segura
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    );
    
    console.log(`✅ Login successful for user: ${username}`);
    res.json({ 
      success: true, 
      token,
      user: { id: user.id, username: user.username },
      expiresIn: 3600 // 1 hora em segundos
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 📝 Rota de registro com validação melhorada  
app.post('/api/register', validateLoginInput, async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = readUsers();
    
    console.log(`📝 Registration attempt for user: ${username}`);
    
    if (users.find(u => u.username === username)) {
      console.log(`❌ User already exists: ${username}`);
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const saltRounds = 12; // Aumentado para mais segurança
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = {
      id: Date.now().toString(),
      username,
      hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    console.log(`✅ User registered successfully: ${username}`);
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.username }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Internal server server error' });
  }
});

// 🔐 Rota de verificação de token
app.post('/api/verify', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`✅ Token verified for user: ${decoded.username}`);
    
    res.json({ 
      valid: true, 
      user: { id: decoded.userId, username: decoded.username },
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    });
    
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

// 🌐 Servidor HTTP
const httpServer = http.createServer(app);
httpServer.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 WhatIntegra Auth Server ENHANCED v2.0`);
  console.log(`🛡️  Security Features:`);
  console.log(`   ├─ Rate Limiting: ${RATE_LIMIT_MAX_REQUESTS} req/15min per IP`);
  console.log(`   ├─ Security Headers: Complete`);
  console.log(`   ├─ Input Validation: Active`);
  console.log(`   ├─ CORS Whitelist: Enabled`);
  console.log(`   └─ JWT Security: HS256 + 1h expiry`);
  console.log(`\n🌐 Servers:`);
  console.log(`   ├─ HTTP:  http://127.0.0.1:${PORT}`);
  console.log(`   └─ HTTPS: https://127.0.0.1:${HTTPS_PORT}`);
  console.log(`\n📊 Monitor: /api/health`);
  console.log(`⚡ Ready for connections!\n`);
});

// 🔒 Servidor HTTPS (se certificados existirem)
if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  try {
    const sslOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    };
    
    const httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(HTTPS_PORT, '127.0.0.1', () => {
      console.log(`🔒 HTTPS Server: https://127.0.0.1:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.log(`⚠️  HTTPS Error: ${error.message}`);
  }
} else {
  console.log(`⚠️  HTTPS certificates not found. Only HTTP server running.`);
}

// 🛑 Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers gracefully...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});