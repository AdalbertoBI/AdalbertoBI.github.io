import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Gerando certificados SSL auto-assinados...');

async function main() {
try {
  // Verificar se OpenSSL está disponível no sistema
  try {
    execSync('openssl version', { stdio: 'ignore' });
    console.log('✅ OpenSSL encontrado no sistema');
  } catch (error) {
    console.log('❌ OpenSSL não encontrado. Instalando via chocolatey...');
    try {
      execSync('choco install openssl -y', { stdio: 'inherit' });
      console.log('✅ OpenSSL instalado com sucesso');
    } catch (chocoError) {
      console.log('❌ Chocolatey não encontrado. Gerando certificados via Node.js...');
      generateWithNode();
      return;
    }
  }

  // Gerar certificado com OpenSSL
  const certPath = path.join(__dirname, 'cert.pem');
  const keyPath = path.join(__dirname, 'key.pem');
  
  // Remover certificados antigos
  if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
  if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
  
  // Gerar chave privada
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
  
  // Gerar certificado
  const subject = '/C=BR/ST=SP/L=SaoPaulo/O=WhatIntegra/OU=Dev/CN=localhost';
  execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "${subject}" -extensions v3_req -config <(echo "[req]"; echo "distinguished_name=req"; echo "[v3_req]"; echo "subjectAltName=@alt_names"; echo "[alt_names]"; echo "DNS.1=localhost"; echo "IP.1=127.0.0.1")`, { 
    stdio: 'inherit',
    shell: 'bash'
  });
  
  console.log('✅ Certificados SSL gerados com sucesso!');
  console.log(`📁 Certificado: ${certPath}`);
  console.log(`🔑 Chave privada: ${keyPath}`);
  
} catch (error) {
  console.log('❌ Erro ao usar OpenSSL:', error.message);
  await generateWithNode();
}

async function generateWithNode() {
  console.log('🔧 Gerando certificados usando Node.js...');
  
  try {
    // Instalar dependência necessária
    execSync('npm install selfsigned --save-dev', { cwd: __dirname, stdio: 'inherit' });
    
    // Importar após instalação
    const selfsigned = await import('selfsigned');
    
    const attrs = [
      { name: 'commonName', value: 'localhost' },
      { name: 'countryName', value: 'BR' },
      { name: 'stateOrProvinceName', value: 'SP' },
      { name: 'localityName', value: 'SaoPaulo' },
      { name: 'organizationName', value: 'WhatIntegra' },
      { name: 'organizationalUnitName', value: 'Dev' }
    ];
    
    const opts = {
      keySize: 2048,
      days: 365,
      algorithm: 'sha256',
      extensions: [
        {
          name: 'basicConstraints',
          cA: false
        },
        {
          name: 'keyUsage',
          keyCertSign: true,
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: true
        },
        {
          name: 'subjectAltName',
          altNames: [
            {
              type: 2, // DNS
              value: 'localhost'
            },
            {
              type: 7, // IP
              ip: '127.0.0.1'
            }
          ]
        }
      ]
    };
    
    const pems = selfsigned.generate(attrs, opts);
    
    // Salvar certificados
    const certPath = path.join(__dirname, 'cert.pem');
    const keyPath = path.join(__dirname, 'key.pem');
    
    fs.writeFileSync(certPath, pems.cert);
    fs.writeFileSync(keyPath, pems.private);
    
    console.log('✅ Certificados SSL gerados com Node.js!');
    console.log(`📁 Certificado: ${certPath}`);
    console.log(`🔑 Chave privada: ${keyPath}`);
    
  } catch (nodeError) {
    console.error('❌ Erro ao gerar certificados com Node.js:', nodeError.message);
    process.exit(1);
  }
}

console.log(`
⚠️  IMPORTANTE: 
Como este é um certificado auto-assinado, você precisará aceitar 
o aviso de segurança no navegador ao acessar:
- https://localhost:8765 (servidor de autenticação)
- https://localhost:3001 (servidor WhatsApp)

Ou adicionar exceções de segurança para localhost.
`);

}

main().catch(console.error);