module.exports = {
  apps: [{
    name: 'docgen-mvp',
    script: 'npx',
    args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
    env: {
      NODE_ENV: 'development'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false
  }]
}
