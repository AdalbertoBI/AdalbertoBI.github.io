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
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
const DATA_DIR = process.env.WHATSAPP_DATA_DIR || path.join(__dirname, 'data');
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

// Middleware de CORS robusto para permitir origens específicas
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://adalbertobi.github.io', 
    'http://localhost', 
    'http://127.0.0.1',
    'http://192.168.1.4',  // IP da máquina local
    'https://192.168.1.4'  // IP da máquina local HTTPS
  ];
  
  // Permitir qualquer origem de rede local (192.168.x.x, 10.x.x.x, etc.)
  const localNetworkPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;
  
  const origin = req.headers.origin;

  console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url} - Origin: ${origin || 'none'}`);

  if (allowedOrigins.some(allowed => origin?.startsWith(allowed)) || 
      (origin && localNetworkPattern.test(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`✅ Origin ${origin} permitida.`);
  } else if (origin) {
    console.log(`❌ Origin ${origin} bloqueada.`);
  } else {
    console.log('⚠️ Requisição sem Origin. Permitindo para compatibilidade.');
    res.header('Access-Control-Allow-Origin', '*'); // Fallback para requisições sem origin (ex: Postman)
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    console.log('✈️  Respondendo à requisição OPTIONS (preflight).');
    return res.status(204).end();
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

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar usuários:', error);
    return false;
  }
}

app.get('/api/health', (_req, res) => {
  console.log('✅ Health check requested');
  res.json({ ok: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Rota de health check para Railway
app.get('/health', (req, res) => {
  console.log('🏥 Railway health check from:', req.headers.origin || 'Railway');
  res.status(200).json({ 
    status: 'healthy',
    service: 'whatintegra-auth',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Webhook endpoints para Railway
app.post('/webhooks/railway/deploy', express.raw({type: 'application/json'}), (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-railway-signature'];
  
  try {
    const event = JSON.parse(payload);
    console.log('🚀 Railway Deploy Webhook:', {
      type: event.type,
      status: event.data?.status,
      deployment_id: event.data?.id,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ received: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('❌ Railway webhook error:', error);
    res.status(400).json({ error: 'Invalid payload' });
  }
});

app.post('/webhooks/railway/volume', express.raw({type: 'application/json'}), (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-railway-signature'];
  
  try {
    const event = JSON.parse(payload);
    console.log('💾 Railway Volume Webhook:', {
      type: event.type,
      usage: event.data?.usage,
      service_id: event.data?.service_id,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ received: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('❌ Railway volume webhook error:', error);
    res.status(400).json({ error: 'Invalid payload' });
  }
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

// Rota temporária para registro de usuários (remover após configuração inicial)
app.post('/api/register', async (req, res) => {
  console.log('📝 Register attempt:', req.body);
  
  const { username, password, email } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios' });
  }
  
  const users = readUsers();
  const existingUser = users.find(u => u.username.toLowerCase() === String(username).toLowerCase());
  if (existingUser) {
    return res.status(409).json({ error: 'Usuário já existe' });
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash, email: email || '', createdAt: new Date().toISOString() });
  writeUsers(users);
  
  console.log('✅ User registered:', username);
  res.json({ message: 'Usuário criado com sucesso', username });
});

// Usar HOST configurado anteriormente
app.listen(PORT, HOST, () => {
  console.log(`✅ Auth server rodando em:`);
  console.log(`   - Local: http://127.0.0.1:${PORT}`);
  console.log(`   - Rede: http://192.168.1.4:${PORT}`);
  console.log(`   - Todas as interfaces: http://${HOST}:${PORT}`);
  console.log(`   - Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Iniciar servidor HTTPS se os certificados existirem
if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH)
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, HOST, () => {
      console.log(`🔒 Auth server HTTPS rodando em:`);
      console.log(`   - Local: https://127.0.0.1:${HTTPS_PORT}`);
      console.log(`   - Rede: https://192.168.1.4:${HTTPS_PORT}`);
      console.log(`   - Todas as interfaces: https://${HOST}:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.log('⚠️  Não foi possível iniciar servidor HTTPS:', error.message);
    console.log(`   Servidor HTTP continua disponível em http://${HOST}:${PORT}`);
  }
} else {
  console.log('⚠️  Certificados SSL não encontrados. Apenas HTTP disponível.');
}
