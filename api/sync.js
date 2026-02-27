// Vercel Serverless Function — один источник правди для стану плашки
// Зберігаємо повний стан (не тільки останню команду), щоб уникнути розбіжностей

const defaultSettings = {
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
  starColor: "#731cfe",
  badgeScale: 100
};

if (!global.syncState) {
  global.syncState = {
    version: 0,
    isShowing: false,
    text1: "",
    text2: "",
    settings: { ...defaultSettings }
  };
}

function applyCommand(state, command) {
  const next = { ...state, version: state.version + 1 };
  if (command.type === "SHOW_HOST_NAME" && command.data) {
    next.isShowing = true;
    next.text1 = command.data.text1 ?? "";
    next.text2 = command.data.text2 ?? "";
    if (command.data.settings && typeof command.data.settings === "object") {
      next.settings = { ...next.settings, ...command.data.settings };
    }
  } else if (command.type === "HIDE_HOST_NAME") {
    next.isShowing = false;
    next.text1 = "";
    next.text2 = "";
  }
  return next;
}

export default function handler(req, res) {
  const state = global.syncState;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    const since = parseInt(req.query.since || "0", 10);
    // Повертаємо стан; клієнт сам порівняє version із since
    const payload = {
      version: state.version,
      isShowing: state.isShowing,
      text1: state.text1,
      text2: state.text2,
      settings: state.settings
    };
    if (state.version <= since) {
      res.status(200).json({ unchanged: true, ...payload });
      return;
    }
    res.status(200).json(payload);
    return;
  }

  if (req.method === "POST") {
    try {
      const command = req.body;
      if (!command || !command.type) {
        res.status(400).json({ error: "Invalid command" });
        return;
      }
      const next = applyCommand(state, command);
      global.syncState = next;
      res.status(200).json({
        success: true,
        version: next.version,
        isShowing: next.isShowing,
        text1: next.text1,
        text2: next.text2
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid JSON" });
    }
    return;
  }

  res.status(404).json({ error: "Not Found" });
}
