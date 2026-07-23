module.exports = {
  apps: [
    {
      name: "ares",
      script: "npm",
      args: "start",
      cwd: "/home/azis/ares",       // sesuaikan path project Anda
      instances: 1,
      autorestart: true,
      watch: false,                 // jangan aktifkan watch di production, cukup restart manual setelah build
      max_memory_restart: "500M",   // restart otomatis kalau memori membengkak
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