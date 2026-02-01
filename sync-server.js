// Простий HTTP сервер для синхронізації стану між браузером та OBS Browser Source
// Запускається окремо: node sync-server.js

const http = require('http');
const url = require('url');

// Зберігаємо стан в пам'яті
let sharedState = {
  command: null,
  timestamp: 0
};

let sharedSettings = {
  backgroundColor: "#000000",
  text1Color: "#FFFFFF",
  text2Color: "#CCCCCC",
  text1: "",
  text2: "",
  side: "left"
};

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
  
  // GET - отримати команду
  if (req.method === 'GET' && parsedUrl.pathname === '/api/sync') {
    const since = parseInt(parsedUrl.query.since || '0', 10);
    
    if (sharedState.command && sharedState.timestamp > since) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        command: sharedState.command,
        timestamp: sharedState.timestamp
      }));
      console.log(`📤 Відправлено команду: ${sharedState.command.type} (timestamp: ${sharedState.timestamp})`);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ command: null, timestamp: sharedState.timestamp }));
    }
    return;
  }
  
  // POST - відправити команду
  if (req.method === 'POST' && parsedUrl.pathname === '/api/sync') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const command = JSON.parse(body);
        sharedState.command = command;
        sharedState.timestamp = command.timestamp || Date.now();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, timestamp: sharedState.timestamp }));
        
        console.log(`📥 Отримано команду: ${command.type}`, command.data);
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
