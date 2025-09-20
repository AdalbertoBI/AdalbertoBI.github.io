import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8765;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JWT_SECRET_FILE = path.join(DATA_DIR, '.jwt_secret');

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
  const origin = req.headers.origin;
  
  // Permitir qualquer origin para debug
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');
  
  // Permitir preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('Preflight request from:', origin);
    return res.status(200).end();
  }
  
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    // Permitir qualquer origin para debug
    console.log('CORS request from origin:', origin);
    callback(null, true);
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
  res.json({ ok: true });
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
