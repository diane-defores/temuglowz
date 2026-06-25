module.exports = {
  apps: [{
    name: "temuglowz",
    cwd: "/home/claude/temuglowz",
    script: "bash",
    args: ["-lc", "export PORT=3006 && flox activate -- bash -lc 'pnpm run dev:site -- --port 3006 --host'"],
    env: {
      PORT: 3006
    },
    autorestart: true,
    max_restarts: 3,
    min_uptime: "10s",
    restart_delay: 2000,
    watch: false
  }]
};
