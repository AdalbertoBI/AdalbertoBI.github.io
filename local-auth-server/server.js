import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import https from 'https';
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

app.use(express.json());

// Headers adicionais para permitir mixed content
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  
  const origin = req.headers.origin;
  
  // Permitir qualquer origin para debug - especialmente GitHub Pages
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');
  
  // Headers específicos para Mixed Content
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  console.log(`🔧 CORS headers set for origin: ${origin}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  next();
});

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

app.get('/api/health', (_req, res) => {
  console.log('✅ Health check requested');
  res.json({ ok: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Rota específica para teste de conectividade do GitHub Pages
app.get('/', (req, res) => {
  console.log('🏠 Root access from:', req.headers.origin || 'unknown');
  res.json({ 
    message: 'WhatIntegra Auth Server', 
    status: 'running',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin 
  });
});

app.post('/api/login', async (req, res) => {
  console.log('📋 Login attempt:', { 
    body: req.body, 
    headers: req.headers.origin,
    contentType: req.headers['content-type']
  });
  
  const { username, password } = req.body || {};
  if (!username || !password) {
    console.log('❌ Missing credentials');
    return res.status(400).json({ error: 'Credenciais inválidas' });
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
  const token = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '2h' });
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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Auth server rodando em http://127.0.0.1:${PORT}`);
});

// Iniciar servidor HTTPS se os certificados existirem
if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH)
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, '127.0.0.1', () => {
      console.log(`🔒 Auth server HTTPS rodando em https://127.0.0.1:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.log('⚠️  Não foi possível iniciar servidor HTTPS:', error.message);
    console.log('   Servidor HTTP continua disponível em http://127.0.0.1:' + PORT);
  }
} else {
  console.log('⚠️  Certificados SSL não encontrados. Apenas HTTP disponível.');
}
