#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const command = process.argv[2];
const PID_FILE = path.join(__dirname, "../myapp.pid");
const SERVER_FILE = path.join(__dirname, "../index.js");

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

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

  console.log("Backend started");
}

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

else if (command === "status") {
  if (!fs.existsSync(PID_FILE)) {
    console.log("Backend not running");
    process.exit(0);
  }

  const pid = fs.readFileSync(PID_FILE, "utf8");
  console.log(isRunning(pid)
    ? `Backend running (PID ${pid})`
    : "Backend not running");
}

else {
  console.log("Usage: myapp start | stop | status");
}
