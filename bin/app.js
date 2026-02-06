#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { generateCommand } = require("../src/ollama");
const { isCommandSafe } = require("../src/safety");
const { executeCommand } = require("../src/execute");

const command = process.argv[2];
const userPrompt = process.argv.slice(3).join(" ");

const PID_FILE = path.join(__dirname, "../njs.pid");
const SERVER_FILE = path.join(__dirname, "../index.js");

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/* ---------- start ---------- */
if (command === "start") {
  if (fs.existsSync(PID_FILE)) {
    const pid = fs.readFileSync(PID_FILE, "utf8");
    if (isRunning(pid)) {
      console.log("Backend already running");
      process.exit(0);
    }
  }

  const child = spawn("node", [SERVER_FILE], {
    detached: true,
    stdio: "ignore"
  });

  fs.writeFileSync(PID_FILE, child.pid.toString());
  child.unref();
  const port = process.env.PORT || 3300;
  console.log(`The backend is running... ${port}`);
  console.log(`Server running at http://localhost:${port}`);
}

/* ---------- stop ---------- */
else if (command === "stop") {
  if (!fs.existsSync(PID_FILE)) {
    console.log("Backend not running");
    process.exit(0);
  }

  const pid = fs.readFileSync(PID_FILE, "utf8");
  try {
    process.kill(pid);
    fs.unlinkSync(PID_FILE);
    console.log("Backend stopped");
  } catch {
    console.log("Failed to stop backend");
  }
}

/* ---------- status ---------- */
else if (command === "status") {
  if (!fs.existsSync(PID_FILE)) {
    console.log("Backend not running");
    process.exit(0);
  }

  const pid = fs.readFileSync(PID_FILE, "utf8");
  console.log(
    isRunning(pid)
      ? `Backend running (PID ${pid})`
      : "Backend not running"
  );
}

/* ---------- run (AI → command) ---------- */
else if (command === "run") {
  if (!userPrompt) {
    console.log('Usage: njs run "<task>"');
    process.exit(1);
  }

  (async () => {
    const cmd = await generateCommand(userPrompt);

    console.log("\n🧠 Generated command:\n");
    console.log(cmd);

    if (!isCommandSafe(cmd)) {
      console.log("\n❌ Blocked unsafe command");
      return;
    }

    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question("\nExecute this command? (Y/n): ", (ans) => {
      rl.close();

      const input = ans.trim().toLowerCase();

      if (input === "" || input === "y" || input === "yes") {
        executeCommand(cmd);
      } else {
        console.log("Cancelled");
      }
    });

  })();
}

else {
  console.log("Usage: njs start | stop | status | run \"<task>\"");
}
