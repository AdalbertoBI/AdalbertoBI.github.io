import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8765;

// Middleware básico
app.use(express.json());

// CORS permissivo para debug
app.use(cors({
  origin: true,
  credentials: false
}));

// Rotas básicas
app.get('/', (req, res) => {
  console.log('Received request to /');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  console.log('Received request to /api/health');
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post('/api/login', (req, res) => {
  console.log('Received login request:', req.body);
  const { username, password } = req.body;
  
  // Credenciais simples para teste
  if (username === 'Comercial' && password === 'Comercial@2025') {
    res.json({ token: 'test-token-123' });
  } else if (username === 'admin' && password === 'admin123') {
    res.json({ token: 'test-token-456' });
  } else {
    res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', (err) => {
  if (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
  console.log(`✅ Simple auth server running on http://127.0.0.1:${PORT}`);
  console.log(`Test with: curl http://127.0.0.1:${PORT}/api/health`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});