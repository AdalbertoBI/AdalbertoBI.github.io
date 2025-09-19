(() => {
  const form = document.getElementById('loginForm');
  const statusEl = document.getElementById('status');
  const loginBtn = document.getElementById('loginBtn');
  const appSection = document.getElementById('app');
  const loginCard = document.querySelector('.card');
  const displayUser = document.getElementById('displayUser');
  const logoutBtn = document.getElementById('logoutBtn');

  const API_URL = 'http://127.0.0.1:8765/api';

  function setStatus(msg, type = '') {
    statusEl.textContent = msg || '';
    statusEl.className = 'status';
    if (type) statusEl.classList.add(type);
  }

  function setLoading(loading) {
    loginBtn.disabled = loading;
    loginBtn.textContent = loading ? 'Entrando…' : 'Entrar';
  }

  function showApp(username) {
    displayUser.textContent = username;
    appSection.classList.remove('hidden');
    loginCard.classList.add('hidden');
  }

  function showLogin() {
    appSection.classList.add('hidden');
    loginCard.classList.remove('hidden');
    setStatus('');
  }

  async function trySession() {
    const user = localStorage.getItem('wi_user');
    const token = localStorage.getItem('wi_token');
    if (!user || !token) return;
    try {
      const res = await fetch(`${API_URL}/session`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        showApp(user);
      } else {
        localStorage.removeItem('wi_user');
        localStorage.removeItem('wi_token');
      }
    } catch {
      // se o servidor não estiver rodando, apenas mostrar login
    }
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('Validando credenciais…');
    setLoading(true);
    try {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Falha no login');
      }
      const { token } = data;
      localStorage.setItem('wi_user', username);
      localStorage.setItem('wi_token', token);
      setStatus('Autenticado com sucesso.', 'success');
      showApp(username);
    } catch (err) {
      setStatus(err.message || 'Erro ao autenticar', 'error');
    } finally {
      setLoading(false);
    }
  });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('wi_user');
    localStorage.removeItem('wi_token');
    showLogin();
  });

  // inicialização
  trySession();
})();
