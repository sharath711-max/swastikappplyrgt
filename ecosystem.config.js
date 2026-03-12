module.exports = {
  apps: [
    {
      name: 'swastiklab-backend',
      script: './backend/app.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        DB_PATH: './backend/db/lab.db'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      watch: ['backend/app.js', 'backend/routes/', 'backend/services/', 'backend/repositories/', 'backend/middleware/'],
      ignore_watch: ['backend/uploads/', 'backend/logs/', 'backend/db/', 'backend/tests/', 'node_modules/', '.git/', 'logs/'],
      max_memory_restart: '500M',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Monitoring
      pmx: true
    }
  ],

  // Global configuration
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:sharath711-max/swastiklab.git',
      path: '/var/www/swastiklab',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  },

  // Monitoring configuration
  monitor_interval: 5000
};
