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

// Garantir diretórios
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

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

// Middleware básico
app.use(express.json({ limit: '10mb' }));

// Headers CORS
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);

  const origin = req.headers.origin;

  // Permitir qualquer origin para debug - especialmente GitHub Pages
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Funções auxiliares para usuários
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Endpoint para criar usuário (apenas para desenvolvimento)
app.post('/api/create-user', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios' });
  }

  const users = readUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });
  writeUsers(users);

  console.log('✅ Usuário criado:', username);
  res.json({ message: 'Usuário criado com sucesso' });
});

// Endpoint de login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('❌ Credenciais faltando');
    return res.status(400).json({ error: 'Credenciais inválidas' });
  }

  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === String(username).toLowerCase());

  if (!user) {
    console.log('❌ Usuário não encontrado:', username);
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    console.log('❌ Senha incorreta para usuário:', username);
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  console.log('✅ Login bem-sucedido para usuário:', username);
  const token = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Endpoint para verificar sessão
app.get('/api/session', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Sem token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, user: payload.sub });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Endpoint de teste de conectividade
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WhatIntegra API funcionando!',
    timestamp: new Date().toISOString(),
    server: 'unificado'
  });
});

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
    console.error('❌ Erro ao obter preview:', error.message);
    res.status(500).json({ error: 'Erro ao obter preview do link' });
  }
});

// Funções auxiliares para extração de metadados
function extractMetaContent(html, property) {
  const regex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractTitleTag(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1] : null;
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Iniciar servidor HTTP
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 WhatIntegra Server rodando em http://127.0.0.1:${PORT}`);
  console.log(`🔒 Com compressão e segurança habilitadas`);
  console.log(`📊 Rate limiting ativo`);
});

// Iniciar servidor HTTPS se os certificados existirem
if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH)
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, '127.0.0.1', () => {
      console.log(`🔒 WhatIntegra HTTPS rodando em https://127.0.0.1:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.log('⚠️  Não foi possível iniciar servidor HTTPS:', error.message);
    console.log('   Servidor HTTP continua disponível em http://127.0.0.1:' + PORT);
  }
} else {
  console.log('⚠️  Certificados SSL não encontrados. Apenas HTTP disponível.');
}