module.exports = {
  apps: [{
    name: "yandex-dashboard",
    script: "./dist/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    watch: false,
    instances: 1,
    exec_mode: "fork"
  }]
};