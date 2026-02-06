const { spawn } = require("child_process");

function executeCommand(cmd) {
  const child = spawn(cmd, {
    stdio: "inherit",
    shell: true
  });

  child.on("exit", (code) => {
    console.log(`\nProcess exited with code ${code}`);
  });
}

module.exports = { executeCommand };
