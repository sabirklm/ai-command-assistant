const { spawn } = require("child_process");

function executeCommand(cmd) {
  const child = spawn(cmd, {
    stdio: "inherit",
    shell: true   // ⭐ THIS IS THE KEY
  });

  child.on("exit", (code) => {
    console.log(`\nProcess exited with code ${code}`);
  });
}

module.exports = { executeCommand };
