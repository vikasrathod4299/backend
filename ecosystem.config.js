module.exports = {
  apps: [
    {
      name: "TheNetwork",
      script: "npm",
      args: "start",
      watch: ["src"],
      ignore_watch: ["node_modules", "dist"],
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      watch_delay: 1000,
    },
  ],
};
