import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

async function main() {
  const [,, username, password] = process.argv;
  if (!username || !password) {
    console.error('Uso: node create-user.js <usuario> <senha>');
    process.exit(1);
  }
  const users = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) : [];
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  const passwordHash = await bcrypt.hash(password, 10);
  if (idx >= 0) {
    users[idx].passwordHash = passwordHash;
    console.log(`Senha atualizada para usuário: ${username}`);
  } else {
    users.push({ username, passwordHash });
    console.log(`Usuário criado: ${username}`);
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  console.log('Arquivo atualizado:', USERS_FILE);
}

main();
