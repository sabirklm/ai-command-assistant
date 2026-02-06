const ALLOWED_COMMANDS = [
  // Version control
  "git",

  // Node / JS ecosystem
  "node",
  "npm",
  "npx",
  "yarn",
  "pnpm",
  "bun",

  // Mobile & frontend
  "flutter",
  "dart",
  "adb",

  // Containers & infra
  "docker",
  "docker-compose",
  "kubectl",
  "helm",

  // Networking / tunneling (ngrok & friends)
  "ngrok",
  "cloudflared",
  "localtunnel",
  "ssh",

  // Build tools
  "make",
  "cmake",
  "gradle",
  "mvn",

  // Package managers (system-level – be careful)
  "brew",
  "apt",
  "apt-get",

  // Utilities (safe-ish, commonly needed)
  "curl",
  "wget",
  "http",
  "jq",
  "cat",
  "ls",
  "pwd",
  "echo",

  // Process & debugging (limit later if needed)
  "ps",
  "top",
  "kill",

  // Editors / viewers (optional)
  "code",
  "vim",
  "nano"
];

function isCommandSafe(cmd) {
  const base = cmd.trim().split(/\s+/)[0];
  return ALLOWED_COMMANDS.includes(base);
}

module.exports = { isCommandSafe };
