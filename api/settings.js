// Vercel Serverless Function для збереження налаштувань

// Зберігаємо налаштування в пам'яті (в production можна використати Vercel KV)
// Використовуємо глобальну змінну для збереження стану між викликами
if (!global.sharedSettings) {
  global.sharedSettings = {
    backgroundColor: "#000000",
    text1Color: "#FFFFFF",
    text2Color: "#CCCCCC",
    text1: "",
    text2: "",
    side: "left"
  };
}

export default function handler(req, res) {
  const sharedSettings = global.sharedSettings;
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // GET - отримати налаштування
  if (req.method === 'GET') {
    res.status(200).json({ settings: sharedSettings });
    return;
  }
  
  // POST - зберегти налаштування
  if (req.method === 'POST') {
    try {
      const settings = req.body;
      sharedSettings = { ...sharedSettings, ...settings };
      
      res.status(200).json({ 
        success: true, 
        settings: sharedSettings 
      });
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
    return;
  }
  
  res.status(404).json({ error: 'Not Found' });
}
