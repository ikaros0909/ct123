module.exports = {
  apps: [
    {
      name: 'ct123-app',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/ct123',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        HTTPS: process.env.HTTPS || 'false'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: process.env.PORT || 3000,
        HTTPS: process.env.HTTPS || 'false'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 80,
        HTTPS: process.env.HTTPS || 'true'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}
