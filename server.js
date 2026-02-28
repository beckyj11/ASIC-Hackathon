/**
 * VERDANT — Local Dev Server
 *
 * Serves static files and proxies /api/recommend to the Anthropic API
 * so the API key never lives in client-side code.
 *
 * Requires Node 18+ (uses built-in fetch — no npm install needed).
 *
 * Usage:
 *   node server.js          (reads ANTHROPIC_API_KEY from .env)
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");

// Load .env file if present (no npm install needed)
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach(line => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    });
}

const PORT    = 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

const MIME = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".json": "application/json",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

const server = http.createServer(async (req, res) => {

  // ── Proxy: POST /api/recommend → Anthropic ──────────────────────
  if (req.method === "POST" && req.url === "/api/recommend") {
    if (!API_KEY) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        error: { message: "ANTHROPIC_API_KEY environment variable is not set." }
      }));
    }

    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
      try {
        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type":      "application/json",
            "x-api-key":         API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body,
        });

        const data = await upstream.json();
        res.writeHead(upstream.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: err.message } }));
      }
    });
    return;
  }

  // ── Static file server ──────────────────────────────────────────
  const urlPath  = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = path.join(__dirname, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nVerdant running at http://localhost:${PORT}\n`);
  if (API_KEY) {
    console.log("✓ API key loaded");
  } else {
    console.log("✗ No ANTHROPIC_API_KEY set — run as:");
    console.log("  ANTHROPIC_API_KEY=sk-ant-... node server.js\n");
  }
});
