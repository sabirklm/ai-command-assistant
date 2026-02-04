const { spawn } = require("child_process");

function executeCommand(cmd) {
  const [bin, ...args] = cmd.split(/\s+/);

  const child = spawn(bin, args, {
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    console.log(`\nProcess exited with code ${code}`);
  });
}

module.exports = { executeCommand };
