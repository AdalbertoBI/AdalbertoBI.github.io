module.exports = {
  apps: [
    {
      name: 'whatintegra-auth',
      script: 'server.js',
      cwd: './local-auth-server',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 8765,
        HTTPS_PORT: 8766
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8765,
        HTTPS_PORT: 8766
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/auth-error.log',
      out_file: './logs/auth-out.log',
      log_file: './logs/auth-combined.log',
      merge_logs: true,
      max_memory_restart: '200M',
      node_args: '--max-old-space-size=128'
    },
    {
      name: 'whatintegra-whatsapp',
      script: 'whatsapp-server.js',
      cwd: './local-auth-server',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        HTTPS_PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HTTPS_PORT: 3002
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/whatsapp-error.log',
      out_file: './logs/whatsapp-out.log',
      log_file: './logs/whatsapp-combined.log',
      merge_logs: true,
      max_memory_restart: '500M',
      node_args: '--max-old-space-size=512'
    }
  ]
};