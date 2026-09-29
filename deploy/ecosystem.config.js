module.exports = {
  apps: [
    {
      name: "nature-farming-backend",
      cwd: "/var/www/faring/backend",
      script: "src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
    {
      name: "nature-farming",
      cwd: "/var/www/faring/website",
      script: "node_modules/.bin/next",
      args: "start -p 3002",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
    {
      name: "nature-farming-admin",
      cwd: "/var/www/faring/admin",
      script: "node_modules/.bin/next",
      args: "start -p 3003",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
