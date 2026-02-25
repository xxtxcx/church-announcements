// Простий HTTP сервер для синхронізації стану між браузером та OBS Browser Source
// Запускається окремо: node sync-server.js

const http = require('http');
const url = require('url');

// Стан плашки (той самий формат, що й у api/sync.js на Vercel)
let syncState = {
  version: 0,
  isShowing: false,
  text1: "",
  text2: "",
  settings: {
    backgroundColor: "#000000",
    text1Color: "#FFFFFF",
    text2Color: "#CCCCCC",
    side: "left",
    width: "auto",
    height: "auto",
    verticalPosition: "bottom",
    topOffset: "32px",
    bottomOffset: "32px",
    text1Font: "'Namu', 'Manrope', sans-serif",
    text2Font: "'Namu', 'Manrope', sans-serif",
    text1Size: "24px",
    text2Size: "20px",
    textPaddingLeft: "0px",
    textPaddingRight: "0px",
    textGap: "4px",
    starPosition: "none",
    starColor: "#731cfe"
  }
};

let sharedSettings = { ...syncState.settings };

function applyCommand(command) {
  if (command.type === 'SHOW_HOST_NAME' && command.data) {
    syncState.version += 1;
    syncState.isShowing = true;
    syncState.text1 = command.data.text1 ?? '';
    syncState.text2 = command.data.text2 ?? '';
    if (command.data.settings && typeof command.data.settings === 'object') {
      syncState.settings = { ...syncState.settings, ...command.data.settings };
    }
  } else if (command.type === 'HIDE_HOST_NAME') {
    syncState.version += 1;
    syncState.isShowing = false;
    syncState.text1 = '';
    syncState.text2 = '';
  }
}

const PORT = 3001;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // GET - отримати поточний стан (як на Vercel)
  if (req.method === 'GET' && parsedUrl.pathname === '/api/sync') {
    const since = parseInt(parsedUrl.query.since || '0', 10);
    const payload = {
      version: syncState.version,
      isShowing: syncState.isShowing,
      text1: syncState.text1,
      text2: syncState.text2,
      settings: syncState.settings
    };
    if (syncState.version <= since) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ unchanged: true, ...payload }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    }
    return;
  }

  // POST - відправити команду (оновлює стан)
  if (req.method === 'POST' && parsedUrl.pathname === '/api/sync') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const command = JSON.parse(body);
        if (!command.type) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid command' }));
          return;
        }
        applyCommand(command);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          version: syncState.version,
          isShowing: syncState.isShowing,
          text1: syncState.text1,
          text2: syncState.text2
        }));
        console.log(`📥 ${command.type} → version ${syncState.version}`);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // GET - отримати налаштування
  if (req.method === 'GET' && parsedUrl.pathname === '/api/settings') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ settings: sharedSettings }));
    return;
  }
  
  // POST - зберегти налаштування
  if (req.method === 'POST' && parsedUrl.pathname === '/api/settings') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const settings = JSON.parse(body);
        sharedSettings = { ...sharedSettings, ...settings };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, settings: sharedSettings }));
        
        console.log(`💾 Оновлено налаштування:`, sharedSettings);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер синхронізації запущено на http://localhost:${PORT}`);
  console.log(`📡 API: GET/POST http://localhost:${PORT}/api/sync`);
});
