// WhatIntegra - Teste de Conectividade
// Funções para testar conectividade com os servidores

// === FUNÇÃO DE TESTE DE CONECTIVIDADE ===

async function testConnectivity() {
  const testBtn = document.getElementById('testConnectionBtn');
  if (!testBtn) return;
  
  const originalText = testBtn.textContent;
  window.WhatIntegra.utils.setLoading(true, testBtn);
  testBtn.textContent = '🧪 Testando...';
  
  const config = window.WhatIntegra.config;
  
  console.log('🧪 === TESTE DE CONECTIVIDADE DETALHADO ===');
  console.log('🌍 Configuração completa:', { 
    hostname: location.hostname,
    protocol: location.protocol,
    port: location.port,
    origin: location.origin,
    isGitHub: config.isGitHub, 
    isLocalhost: config.isLocalhost, 
    isLocalHttpServer: config.isLocalHttpServer,
    API_URL: config.API_URL, 
    WHATSAPP_URL: config.WHATSAPP_URL 
  });
  
  try {
    window.WhatIntegra.utils.setStatus('🔍 Testando conectividade com servidores...', 'info');
    
    // Teste 1: Servidor Auth
    console.log('🔧 === TESTE 1: SERVIDOR AUTH ===');
    console.log('🎯 URL de teste:', config.API_URL.replace('/api', ''));
    console.log('🔍 URLs detectadas:', {
      'API_URL base': config.API_URL,
      'Auth URL (sem /api)': config.API_URL.replace('/api', ''),
      'WHATSAPP_URL': config.WHATSAPP_URL,
      'isLocalHttpServer': config.isLocalHttpServer,
      'Protocolo esperado': config.isLocalHttpServer ? 'HTTP' : 'conforme ambiente'
    });
    
    try {
      const authTestStart = performance.now();
      const authTest = await fetch(config.API_URL.replace('/api', ''), {
        method: 'GET',
        mode: 'cors'
      });
      const authTestTime = performance.now() - authTestStart;
      
      console.log('✅ Auth Server - Resposta recebida:', {
        status: authTest.status,
        statusText: authTest.statusText,
        ok: authTest.ok,
        type: authTest.type,
        url: authTest.url,
        headers: [...authTest.headers.entries()],
        responseTime: `${authTestTime.toFixed(2)}ms`
      });
      
      let authData = {};
      try {
        const authResponseText = await authTest.text();
        console.log('📄 Auth Response (texto):', authResponseText);
        authData = authResponseText ? JSON.parse(authResponseText) : {};
        console.log('📋 Auth Response (parseado):', authData);
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta do Auth Server:', parseError);
      }
      
      if (authTest.ok) {
        console.log('✅ Auth Server: SUCESSO');
        window.WhatIntegra.utils.setStatus('✅ Auth Server OK', 'success');
      } else {
        console.error('❌ Auth Server retornou erro:', authTest.status);
        throw new Error(`Auth Server HTTP ${authTest.status}: ${authTest.statusText}`);
      }
      
    } catch (authError) {
      console.error('❌ Auth Server - Erro detalhado:', {
        name: authError.name,
        message: authError.message,
        stack: authError.stack,
        cause: authError.cause
      });
      
      if (authError.name === 'TypeError') {
        console.error('🔍 TypeError no Auth Server - Diagnóstico:');
        if (authError.message.includes('Failed to fetch')) {
          console.error('   • Failed to fetch - Servidor provavelmente não está acessível');
          console.error('   • Verifique se o servidor auth está rodando na porta 8766');
          console.error('   • Verifique se o certificado HTTPS foi aceito');
        } else if (authError.message.includes('NetworkError')) {
          console.error('   • Network Error - Problema de conectividade ou CORS');
        }
      }
      
      window.WhatIntegra.utils.setStatus(`❌ Auth Server Error: ${authError.message}`, 'error');
      throw authError;
    }
    
    // Teste 2: Health endpoint
    console.log('🔧 === TESTE 2: HEALTH ENDPOINT ===');
    console.log('🎯 URL de teste:', `${config.API_URL}/health`);
    
    try {
      const healthTestStart = performance.now();
      const healthTest = await fetch(`${config.API_URL}/health`, {
        method: 'GET',
        mode: 'cors'
      });
      const healthTestTime = performance.now() - healthTestStart;
      
      console.log('✅ Health endpoint - Resposta recebida:', {
        status: healthTest.status,
        statusText: healthTest.statusText,
        ok: healthTest.ok,
        type: healthTest.type,
        url: healthTest.url,
        headers: [...healthTest.headers.entries()],
        responseTime: `${healthTestTime.toFixed(2)}ms`
      });
      
      let healthData = {};
      try {
        const healthResponseText = await healthTest.text();
        console.log('📄 Health Response (texto):', healthResponseText);
        healthData = healthResponseText ? JSON.parse(healthResponseText) : {};
        console.log('📋 Health Response (parseado):', healthData);
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta do Health endpoint:', parseError);
      }
      
      if (healthTest.ok) {
        console.log('✅ Health endpoint: SUCESSO');
        window.WhatIntegra.utils.setStatus('✅ Todos os testes OK! Você pode tentar fazer login agora.', 'success');
        
        // Se estamos no GitHub Pages, marcar como autorizado
        if (config.isGitHub) {
          localStorage.setItem('servers_authorized', 'true');
          console.log('✅ Servidores marcados como autorizados no localStorage');
        }
      } else {
        console.error('❌ Health endpoint retornou erro:', healthTest.status);
        throw new Error(`Health endpoint HTTP ${healthTest.status}: ${healthTest.statusText}`);
      }
      
    } catch (healthError) {
      console.error('❌ Health endpoint - Erro detalhado:', {
        name: healthError.name,
        message: healthError.message,
        stack: healthError.stack,
        cause: healthError.cause
      });
      
      if (healthError.name === 'TypeError') {
        console.error('🔍 TypeError no Health endpoint - Diagnóstico:');
        if (healthError.message.includes('Failed to fetch')) {
          console.error('   • Failed to fetch - API não está acessível');
          console.error('   • Verifique se a rota /api/health existe');
          console.error('   • Verifique se o middleware CORS está funcionando');
        }
      }
      
      window.WhatIntegra.utils.setStatus(`❌ Health endpoint Error: ${healthError.message}`, 'error');
      throw healthError;
    }
    
    console.log('🎉 === TODOS OS TESTES CONCLUÍDOS COM SUCESSO ===');
    
  } catch (error) {
    console.error('❌ === TESTE DE CONECTIVIDADE FALHOU ===');
    console.error('🔍 Erro geral:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    if (config.isGitHub) {
      console.error('🔒 GitHub Pages - Problema de Mixed Content detectado');
      console.error('💡 Soluções possíveis:');
      console.error('   1. Executar o script iniciar-portatil-funcional.bat');
      console.error('   2. Acessar https://127.0.0.1:8766 e aceitar o certificado');
      console.error('   3. Usar o setup.html para configurar os certificados');
      
      window.WhatIntegra.utils.setStatus('❌ Mixed Content detectado! Redirecionando para setup...', 'error');
      localStorage.removeItem('servers_authorized');
      setTimeout(() => {
        window.location.href = './setup.html';
      }, 2000);
    } else {
      console.error('💻 Execução local - Servidor não está acessível');
      console.error('💡 Soluções possíveis:');
      console.error('   1. Verificar se o script iniciar-portatil-funcional.bat foi executado');
      console.error('   2. Verificar se as portas 8765/8766 estão livres');
      console.error('   3. Verificar se o Node.js está funcionando');
      
      window.WhatIntegra.utils.setStatus('❌ Servidores não estão acessíveis. Verifique se estão rodando.', 'error');
    }
  } finally {
    window.WhatIntegra.utils.setLoading(false, testBtn);
    testBtn.textContent = originalText;
    console.log('🧪 === FIM DOS TESTES DE CONECTIVIDADE ===');
  }
}

// === EXPORTAR PARA ESCOPO GLOBAL ===
window.WhatIntegra = window.WhatIntegra || {};
window.WhatIntegra.connectivity = {
  testConnectivity
};

// Tornar testConnectivity disponível globalmente para o botão
window.testConnectivity = testConnectivity;

console.log('✅ Conectividade carregada');