// Vercel Serverless Function для синхронізації стану
// Використовуємо Vercel KV або просто пам'ять (для простого використання)

// Зберігаємо стан в пам'яті (в production можна використати Vercel KV або Redis)
// Увага: при кожному cold start стан буде скидатися
// Використовуємо глобальну змінну для збереження стану між викликами
if (!global.sharedState) {
  global.sharedState = {
    command: null,
    timestamp: 0
  };
}

export default function handler(req, res) {
  const sharedState = global.sharedState;
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // GET - отримати команду
  if (req.method === 'GET') {
    const since = parseInt(req.query.since || '0', 10);
    
    if (sharedState.command && sharedState.timestamp > since) {
      res.status(200).json({
        command: sharedState.command,
        timestamp: sharedState.timestamp
      });
    } else {
      res.status(200).json({ 
        command: null, 
        timestamp: sharedState.timestamp 
      });
    }
    return;
  }
  
  // POST - відправити команду
  if (req.method === 'POST') {
    try {
      const command = req.body;
      sharedState.command = command;
      sharedState.timestamp = command.timestamp || Date.now();
      
      res.status(200).json({ 
        success: true, 
        timestamp: sharedState.timestamp 
      });
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
    return;
  }
  
  res.status(404).json({ error: 'Not Found' });
}
