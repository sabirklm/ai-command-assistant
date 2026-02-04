const ALLOWED_COMMANDS = [
  "git",
  "flutter",
  "npm",
  "npx",
  "yarn",
  "pnpm",
  "docker",
  "node"
];

function isCommandSafe(cmd) {
  const base = cmd.trim().split(/\s+/)[0];
  return ALLOWED_COMMANDS.includes(base);
}

module.exports = { isCommandSafe };
