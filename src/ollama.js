const http = require("http");

const OLLAMA_BASE_API = "http://localhost:11434";

function generateCommand(userPrompt) {
  const systemPrompt = `
You are a CLI command generator.

Rules:
- Output ONLY ONE executable shell command
- NO explanations
- NO markdown
- NO backticks
- If unsure, output exactly:
  echo "Cannot determine command"
`;

  const body = JSON.stringify({
    model: "gemma3:4b",
    prompt: `${systemPrompt}\nUser request: ${userPrompt}`,
    stream: false
  });

  return new Promise((resolve, reject) => {
    const req = http.request(
      `${OLLAMA_BASE_API}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json.response.trim());
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = { generateCommand };
