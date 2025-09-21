// WhatIntegra - Auto-Configuração de Servidor
// Sistema automático que usa o IP público fixo do servidor

// === CONFIGURAÇÃO FIXA DO SERVIDOR ===
// Esta máquina (192.168.1.4) é sempre o servidor
// Railway: wonderful-rebirth-production-c173.up.railway.app (configurado automaticamente)
const SERVER_PUBLIC_IP = 'wonderful-rebirth-production-c173.up.railway.app';
const SERVER_LOCAL_IP = '192.168.1.4';

// === AUTO-DETECÇÃO INTELIGENTE ===
function autoDetectServerConfig() {
  const currentHostname = location.hostname;
  const isGitHubPages = currentHostname.includes('github.io');
  
  console.log('🔍 Auto-detectando configuração de servidor...');
  console.log('📱 Acessando de:', currentHostname);
  console.log('🖥️ Servidor fixo configurado:', SERVER_PUBLIC_IP);
  
  // Se está no GitHub Pages (qualquer dispositivo, qualquer rede)
  // Se está no GitHub Pages (qualquer dispositivo, qualquer rede)
  if (isGitHubPages) {
    return {
      strategy: 'github-pages-auto',
      SERVER_HOST: SERVER_PUBLIC_IP,
      needsUserConfiguration: false,
      description: 'IP público automático do servidor'
    };
  }
  
  // Se é localhost, usar IP local para desenvolvimento
  if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
    return {
      strategy: 'localhost',
      SERVER_HOST: SERVER_LOCAL_IP, // Usar IP local da máquina, não localhost
      needsUserConfiguration: false,
      description: 'Desenvolvimento local'
    };
  }
  
  // Se é um IP específico, assume que é o próprio servidor
  return {
    strategy: 'direct-ip',
    SERVER_HOST: currentHostname,
    needsUserConfiguration: false,
    description: 'Acesso direto via IP'
  };
}

// === CONFIGURAÇÃO INTELIGENTE ===
function getIntelligentServerConfig() {
  const autoConfig = autoDetectServerConfig();
  
  console.log('🤖 Configuração automática detectada:', autoConfig.strategy);
  console.log('🖥️ Servidor configurado para:', autoConfig.SERVER_HOST);
  
  // Sempre usar configuração automática (sem manual override)
  // Esta máquina é sempre o servidor, não precisa de configuração manual
  return {
    SERVER_HOST: autoConfig.SERVER_HOST,
    AUTH_HTTP_PORT: 8765,
    AUTH_HTTPS_PORT: 8766,
    WHATSAPP_HTTP_PORT: 3001,
    WHATSAPP_HTTPS_PORT: 3002,
    source: autoConfig.strategy,
    description: autoConfig.description
  };
}

// === HELPER VISUAL ===
function showServerConfigHelper(autoConfig) {
  // Verificar se é acesso móvel externo
  const isMobileExternal = autoConfig.isMobileExternal;
  
  // Criar modal de configuração rápida
  const modal = document.createElement('div');
  modal.id = 'server-config-modal';
  modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-y: auto;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 16px;
        max-width: ${isMobileExternal ? '500px' : '400px'};
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        margin: 20px;
      ">
        <h2 style="margin: 0 0 20px; color: #333;">
          ${isMobileExternal ? '� Acesso Móvel Externo' : '�🖥️ Configuração de Servidor'}
        </h2>
        
        ${isMobileExternal ? `
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: left;">
            <h3 style="margin: 0 0 10px; color: #d68910;">⚠️ Configuração Necessária</h3>
            <p style="margin: 0; color: #7d6608; font-size: 14px;">
              Seu celular está em rede externa. Para acessar, você precisa:
            </p>
            <ol style="margin: 10px 0 0 20px; color: #7d6608; font-size: 14px;">
              <li><strong>Descobrir seu IP público:</strong> Google "qual meu ip"</li>
              <li><strong>Configurar port forwarding no roteador:</strong><br>
                  - Portas: 8765, 8766, 3001, 3002<br>
                  - Destino: 192.168.1.4 (máquina do servidor)</li>
              <li><strong>Inserir IP público abaixo</strong></li>
            </ol>
          </div>
        ` : ''}
        
        <p style="margin: 0 0 20px; color: #666;">
          ${isMobileExternal 
            ? 'Digite o IP público configurado com port forwarding:'
            : 'Você está acessando de um dispositivo remoto.<br>Qual é o IP da máquina que roda os servidores?'
          }
        </p>
        
        <div style="margin: 20px 0;">
          <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">
            ${isMobileExternal ? 'IP Público do Servidor:' : 'IP do Servidor:'}
          </label>
          <input 
            id="quick-server-ip" 
            type="text" 
            placeholder="${isMobileExternal ? 'Ex: 203.0.113.42 (seu IP público)' : 'Ex: 192.168.1.100'}"
            style="
              width: 100%;
              padding: 12px;
              border: 2px solid #ddd;
              border-radius: 8px;
              font-size: 16px;
              text-align: center;
            "
          />
        </div>
        
        ${!isMobileExternal ? `
          <div style="margin: 20px 0; font-size: 14px; color: #888;">
            Sugestões: ${autoConfig.suggestedIPs.slice(0, 3).join(', ')}
          </div>
        ` : `
          <div style="background: #e7f5ff; border: 1px solid #339af0; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left;">
            <h4 style="margin: 0 0 10px; color: #1864ab;">💡 Como encontrar seu IP público:</h4>
            <p style="margin: 0; color: #1864ab; font-size: 14px;">
              1. No Google, pesquise: <strong>"qual meu ip"</strong><br>
              2. Copie o número que aparece (ex: 203.0.113.42)<br>
              3. Cole no campo acima
            </p>
          </div>
        `}
        
        <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;">
          <button 
            onclick="applyQuickConfig()" 
            style="
              background: #25d366;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            ✅ Aplicar
          </button>
          <button 
            onclick="closeConfigModal()" 
            style="
              background: #ccc;
              color: #666;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            ❌ Cancelar
          </button>
        </div>
        
        ${isMobileExternal ? `
          <div style="margin-top: 15px;">
            <a 
              href="./setup-celular.html" 
              target="_blank"
              style="
                display: inline-block;
                background: #f8f9fa;
                color: #495057;
                text-decoration: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                border: 1px solid #dee2e6;
              "
            >
              📚 Guia Completo para Celular
            </a>
          </div>
        ` : ''}
        
        <div style="margin-top: 20px; font-size: 12px; color: #999;">
          💡 Dica: Vá em <strong>setup-servidor.html</strong> para configuração detalhada
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focar no input
  setTimeout(() => {
    document.getElementById('quick-server-ip').focus();
  }, 100);
}

// === FUNÇÕES GLOBAIS PARA O MODAL ===
window.applyQuickConfig = function() {
  const ip = document.getElementById('quick-server-ip').value.trim();
  if (ip) {
    localStorage.setItem('whatintegra_server_host', ip);
    console.log('✅ Configuração aplicada:', ip);
    
    // Recarregar a página para aplicar a nova configuração
    location.reload();
  }
};

window.closeConfigModal = function() {
  const modal = document.getElementById('server-config-modal');
  if (modal) modal.remove();
};

// === CONFIGURAÇÃO PRINCIPAL ===
window.WhatIntegra = window.WhatIntegra || {};
window.WhatIntegra.serverConfig = getIntelligentServerConfig();

console.log('🤖 Configuração inteligente aplicada:', window.WhatIntegra.serverConfig);