import cluster from 'cluster';
import os from 'os';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const numCPUs = os.cpus().length;
const maxWorkers = Math.min(numCPUs, 4); // Limitar a 4 workers

if (cluster.isPrimary) {
  console.log(`🚀 Cluster principal iniciado - PID: ${process.pid}`);
  console.log(`💻 CPUs disponíveis: ${numCPUs}`);
  console.log(`👥 Iniciando ${maxWorkers} workers...`);

  // Fork workers
  for (let i = 0; i < maxWorkers; i++) {
    const worker = cluster.fork();
    console.log(`⚙️  Worker ${worker.process.pid} iniciado`);
  }

  // Restart worker if it dies
  cluster.on('exit', (worker, code, signal) => {
    console.log(`💀 Worker ${worker.process.pid} morreu (${signal || code})`);
    const newWorker = cluster.fork();
    console.log(`🔄 Novo worker ${newWorker.process.pid} iniciado`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, desligando workers...');
    for (const worker of Object.values(cluster.workers)) {
      worker.kill('SIGTERM');
    }
  });

  process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, desligando workers...');
    for (const worker of Object.values(cluster.workers)) {
      worker.kill('SIGINT');
    }
    process.exit(0);
  });

} else {
  // Worker process - import and start the main server
  console.log(`👷 Worker ${process.pid} iniciando...`);
  
  // Start both auth and whatsapp servers in this worker
  import('./local-auth-server/server.js');
  
  // Start whatsapp server with delay
  setTimeout(() => {
    import('./local-auth-server/whatsapp-server.js');
  }, 2000);
  
  console.log(`✅ Worker ${process.pid} online`);
}

export default cluster;