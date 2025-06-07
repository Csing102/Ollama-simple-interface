const http = require('http');
const { spawn } = require('child_process');

const DEFAULT_MODEL = 'smollm:135m';
const API_URL = 'http://localhost:11434';
const PROXY_PORT = 3000;

// --- Ollama startup logic ---
function checkServer(callback) {
  http.get(`${API_URL}/api/tags`, res => callback(true)).on('error', () => callback(false));
}

function waitUntilAvailable(attemptsLeft = 10) {
  return new Promise((resolve, reject) => {
    const check = () => {
      checkServer(running => {
        if (running) return resolve(true);
        if (attemptsLeft <= 0) return reject('Ollama server did not respond.');
        console.log(`[⏳] Waiting for Ollama server... (${attemptsLeft} tries left)`);
        setTimeout(() => check(--attemptsLeft), 1000);
      });
    };
    check();
  });
}

function startOllama() {
  console.log('[🔁] Trying to start Ollama server...');
  const proc = spawn('ollama', ['serve'], {
    detached: true,
    stdio: 'ignore'
  });
  proc.unref();
}

function loadModel(model = DEFAULT_MODEL) {
  const data = JSON.stringify({ model, prompt: 'Hello Ami!', stream: false });

  const options = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        console.log(`[✅] Model '${model}' responded: ${json.response?.slice(0, 50)}...`);
      } catch {
        console.error('[❌] Could not parse Ollama response');
      }
    });
  });

  req.on('error', err => console.error('[❌] Error calling Ollama:', err.message));
  req.write(data);
  req.end();
}

// --- Proxy server with CORS ---
function startProxyServer() {
  const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    const proxy = (path) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);

          // Ensure streaming is OFF to avoid JSON parsing issues
          parsed.stream = false;

          const data = JSON.stringify(parsed);

          const proxyReq = http.request({
            hostname: 'localhost',
            port: 11434,
            path,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data)
            }
          }, proxyRes => {
            let result = '';
            proxyRes.on('data', chunk => result += chunk);
            proxyRes.on('end', () => {
              try {
                // Parse once to verify it's valid JSON, then stringify again
                const parsedResult = JSON.parse(result);
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(parsedResult));
              } catch {
                res.writeHead(500, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ error: 'Invalid JSON returned from Ollama' }));
              }
            });
          });

          proxyReq.on('error', err => {
            res.writeHead(500, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: err.message }));
          });

          proxyReq.write(data);
          proxyReq.end();
        } catch {
          res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
        }
      });
    };

    if (req.method === 'POST' && req.url === '/api/generate') {
      proxy('/api/generate');
    } else if (req.method === 'POST' && req.url === '/api/chat') {
      proxy('/api/chat');
    } else {
      res.writeHead(404, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(PROXY_PORT, () => {
    console.log(`[🚀] CORS proxy server running at http://localhost:${PROXY_PORT}`);
  });
}

// --- Boot everything ---
checkServer(running => {
  if (running) {
    console.log('[✔️] Ollama server is already running.');
    loadModel();
    startProxyServer();
  } else {
    startOllama();
    waitUntilAvailable().then(() => {
      console.log('[🚀] Ollama is now available.');
      loadModel();
      startProxyServer();
    }).catch(console.error);
  }
});
