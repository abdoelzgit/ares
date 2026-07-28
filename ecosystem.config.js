module.exports = {
  apps: [
    {
      name: "ares",
      script: "npm",
      args: "start",
      cwd: "/home/azis/ares",
      exec_mode: "fork",        // WAJIB tambahkan ini, eksplisit paksa fork bukan cluster
      instances: 1,             // pastikan cuma 1 instance
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/azis/ares/logs/error.log",
      out_file: "/home/azis/ares/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
}