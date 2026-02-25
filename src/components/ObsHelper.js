import React, { useState, useEffect, useRef, useCallback } from "react";
import HostNameBar from "./HostNameBar";
import ControlPanel from "./ControlPanel";

// OBS WebSocket конфігурація
// Можна налаштувати через localStorage або URL параметри
const getOBSConfig = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const enableOBS = urlParams.get("enable_obs") !== "false" && localStorage.getItem("enable_obs") !== "false";
  const wsUrl = urlParams.get("obs_url") || localStorage.getItem("obs_ws_url") || "ws://localhost:4455";
  const wsPassword = urlParams.get("obs_password") || localStorage.getItem("obs_ws_password") || "";
  
  return { enableOBS, wsUrl, wsPassword };
};

export default function ObsHelper() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [isShowing, setIsShowing] = useState(false);
  const [obsConfig] = useState(getOBSConfig());
  const [inputText1, setInputText1] = useState("");
  const [inputText2, setInputText2] = useState("");
  const [hasControlAccess, setHasControlAccess] = useState(true);
  const [settings, setSettings] = useState({
    backgroundColor: "#000000",
    text1Color: "#FFFFFF",
    text2Color: "#CCCCCC",
    text1: "",
    text2: "",
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
    badgeTemplate: "custom",
    badgeScale: 100,
    text1LetterSpacing: "",
    text2LetterSpacing: "",
    text1TextTransform: "",
    paddingTop: "",
    paddingBottom: ""
  });
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const storagePollIntervalRef = useRef(null);
  const syncLastVersionRef = useRef(0);
  const syncInFlightRef = useRef(false);
  const POLL_INTERVAL_MS = 400;

  // Перевірка, чи є доступ до панелі управління
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const controlParam = urlParams.get("control");
    // Якщо control=false, то приховуємо панелі (для OBS)
    const hidePanels = controlParam === "false";
    setHasControlAccess(!hidePanels);
  }, []);

  // Завантаження налаштувань при монтуванні
  useEffect(() => {
    // Завантажуємо з localStorage
    const savedSettings = localStorage.getItem("obs-helper-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error("Помилка завантаження налаштувань:", error);
      }
    }
    
    // Завантажуємо з сервера синхронізації
    fetch("/api/settings")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        return response.json();
      })
      .then(data => {
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem("obs-helper-settings", JSON.stringify(data.settings));
        }
      })
      .catch(error => {
        console.warn("Не вдалося завантажити налаштування з сервера, використовуємо localStorage:", error.message);
      });
  }, []);

  // Синхронізація стану: сервер — єдине джерело правди (GET повертає повний стан)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isOBS = urlParams.get("control") !== "true";
    console.log("🔧 Синхронізація стану (поллінг кожні " + POLL_INTERVAL_MS + "мс)...", isOBS ? "(OBS)" : "(Панель)");

    let channel = null;
    try {
      channel = new BroadcastChannel("obs-helper-sync");
      broadcastChannelRef.current = channel;
      channel.onmessage = (event) => {
        const { type, data } = event.data || {};
        if (type === "SHOW_HOST_NAME") {
          setText1(data?.text1 || "");
          setText2(data?.text2 || "");
          if (data?.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
          setIsShowing(true);
        } else if (type === "HIDE_HOST_NAME") {
          setIsShowing(false);
          setText1("");
          setText2("");
        }
      };
    } catch (e) {
      console.warn("⚠️ BroadcastChannel не підтримується:", e);
    }

    const checkServer = async () => {
      if (syncInFlightRef.current) return;
      syncInFlightRef.current = true;
      try {
        const since = syncLastVersionRef.current;
        const response = await fetch(`/api/sync?since=${since}`);
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
          return;
        }
        const data = await response.json();
        if (data.unchanged || data.version <= since) return;
        syncLastVersionRef.current = data.version;
        setText1(data.text1 ?? "");
        setText2(data.text2 ?? "");
        setIsShowing(Boolean(data.isShowing));
        if (data.settings && typeof data.settings === "object") {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (error) {
        try {
          const raw = localStorage.getItem("obs-helper-command");
          if (!raw) return;
          const cmd = JSON.parse(raw);
          const ts = cmd.timestamp || 0;
          if (Date.now() - ts > 5000) return;
          if (cmd.type === "SHOW_HOST_NAME" && cmd.data) {
            setText1(cmd.data.text1 ?? "");
            setText2(cmd.data.text2 ?? "");
            if (cmd.data.settings) setSettings((prev) => ({ ...prev, ...cmd.data.settings }));
            setIsShowing(true);
          } else if (cmd.type === "HIDE_HOST_NAME") {
            setIsShowing(false);
            setText1("");
            setText2("");
          }
        } catch (localErr) {
          console.warn("Сервер недоступний, localStorage fallback:", localErr);
        }
      } finally {
        syncInFlightRef.current = false;
      }
    };

    storagePollIntervalRef.current = setInterval(checkServer, POLL_INTERVAL_MS);
    checkServer();

    const onStorage = (e) => {
      if (e.key === "obs-helper-command" && e.newValue) checkServer();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (channel) channel.close();
      if (storagePollIntervalRef.current) clearInterval(storagePollIntervalRef.current);
    };
  }, []);

  // Підключення до OBS WebSocket (опціональне)
  useEffect(() => {
    // Якщо OBS вимкнено, не підключаємося
    if (!obsConfig.enableOBS) {
      return;
    }

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let isManualClose = false;

    const connectToOBS = () => {
      // Якщо досягнуто максимум спроб переподключення, зупиняємося
      if (reconnectAttempts >= maxReconnectAttempts && !isManualClose) {
        console.warn("OBS WebSocket: Досягнуто максимум спроб переподключення. Перевірте, чи запущений OBS та чи увімкнений WebSocket сервер.");
        return;
      }

      try {
        const { wsUrl } = obsConfig;
        
        // Перевіряємо, чи вже є активне з'єднання
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          return;
        }

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("✅ Підключено до OBS WebSocket");
          reconnectAttempts = 0; // Скидаємо лічильник при успішному підключенні
          
          // OBS WebSocket 5.x протокол: спочатку отримуємо Hello з інформацією про автентифікацію
          // Автентифікація буде виконана після отримання Hello повідомлення
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // OBS WebSocket 5.x протокол
            if (data.op === 0) {
              // Hello - привітання від сервера з інформацією про автентифікацію
              console.log("OBS Hello received");
              
              if (data.d.authentication) {
                // Потрібна автентифікація
                if (obsConfig.wsPassword) {
                  // Відправляємо Identify з автентифікацією
                  ws.send(
                    JSON.stringify({
                      op: 1,
                      d: {
                        rpcVersion: data.d.rpcVersion || 1,
                        authentication: obsConfig.wsPassword,
                        eventSubscriptions: 33 // Підписуємося на події
                      }
                    })
                  );
                } else {
                  console.warn("OBS WebSocket вимагає пароль, але пароль не вказано");
                }
              } else {
                // Автентифікація не потрібна
                ws.send(
                  JSON.stringify({
                    op: 1,
                    d: {
                      rpcVersion: data.d.rpcVersion || 1,
                      eventSubscriptions: 33
                    }
                  })
                );
              }
            } else if (data.op === 2) {
              // Identified - успішна автентифікація
              console.log("✅ OBS WebSocket автентифіковано");
            } else if (data.op === 5) {
              // RequestResponse - відповідь на запит
              console.log("OBS Response:", data);
            } else if (data.op === 7) {
              // Event - подія від OBS
              const eventData = data.d;
              
              // Обробляємо кастомні події
              if (eventData.eventType === "CustomEvent") {
                const customData = eventData.eventData;
                if (customData && customData.type === "SHOW_HOST_NAME") {
                  console.log("📨 Отримано кастомну подію SHOW_HOST_NAME через OBS WebSocket:", customData);
                  setText1(customData.text1 || "");
                  setText2(customData.text2 || "");
                  if (customData.settings) {
                    setSettings(customData.settings);
                  }
                  setIsShowing(true);
                } else if (customData && customData.type === "HIDE_HOST_NAME") {
                  console.log("📨 Отримано кастомну подію HIDE_HOST_NAME через OBS WebSocket");
                  setIsShowing(false);
                  setText1("");
                  setText2("");
                }
              }
              
              handleOBSEvent(eventData);
            }
          } catch (error) {
            console.error("Помилка обробки повідомлення від OBS:", error);
          }
        };

        ws.onerror = (error) => {
          // Не виводимо помилку в консоль при кожній спробі переподключення
          if (reconnectAttempts === 0) {
            console.warn("⚠️ OBS WebSocket: Не вдалося підключитися. Перевірте, чи запущений OBS та чи увімкнений WebSocket сервер.");
          }
        };

        ws.onclose = (event) => {
          // Якщо це не ручне закриття і не досягнуто максимум спроб
          if (!isManualClose && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(3000 * reconnectAttempts, 15000); // Збільшуємо затримку з кожною спробою
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connectToOBS();
            }, delay);
          }
        };
      } catch (error) {
        console.error("Помилка підключення до OBS:", error);
      }
    };

    // Підключаємося до OBS з невеликою затримкою
    const initialTimeout = setTimeout(() => {
      connectToOBS();
    }, 500);

    // Очищення при розмонтуванні
    return () => {
      isManualClose = true;
      clearTimeout(initialTimeout);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [obsConfig]);

  // Обробка подій від OBS
  const handleOBSEvent = (eventData) => {
    // Тут можна обробляти різні події від OBS
    // Наприклад, показувати плашку при певних подіях
    console.log("OBS Event:", eventData);
  };

  // Функція для показу плашки. settingsOverride — налаштування з панелі (щоб не перезатирати шаблон старим станом)
  const showHostName = useCallback((text1Value, text2Value, settingsOverride) => {
    if (isShowing) {
      console.log("⚠️ Плашка вже показується, пропускаємо");
      return;
    }

    const settingsToUse = settingsOverride && typeof settingsOverride === "object" ? settingsOverride : settings;
    if (settingsOverride) {
      setSettings(settingsToUse);
    }

    const timestamp = Date.now();
    const t1 = text1Value ?? settingsToUse.text1 ?? "";
    const t2 = text2Value ?? settingsToUse.text2 ?? "";

    console.log("🚀 Показуємо плашку:", { text1: t1, text2: t2, timestamp });

    setText1(t1);
    setText2(t2);
    setIsShowing(true);

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: "SHOW_HOST_NAME",
          data: { text1: t1, text2: t2, settings: settingsToUse },
          timestamp
        });
        console.log("📤 Відправлено через BroadcastChannel");
      } catch (error) {
        console.error("❌ Помилка відправки через BroadcastChannel:", error);
      }
    }

    try {
      const command = {
        type: "SHOW_HOST_NAME",
        data: { text1: t1, text2: t2, settings: settingsToUse },
        timestamp
      };
      localStorage.setItem("obs-helper-command", JSON.stringify(command));
      console.log("💾 Збережено в localStorage:", command);
    } catch (error) {
      console.error("❌ Помилка збереження команди в localStorage:", error);
    }

    fetch("/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "SHOW_HOST_NAME",
        data: {
          text1: t1,
          text2: t2,
          settings: settingsToUse
        },
        timestamp
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        return response.json();
      })
      .then(data => {
        console.log("✅ Команда відправлена на сервер синхронізації:", data);
      })
      .catch(error => {
        console.warn("⚠️ Сервер синхронізації недоступний, використовуємо localStorage:", error.message);
      });
    
    // Відправляємо через OBS WebSocket якщо підключено
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        // Використовуємо OBS WebSocket для відправки події
        // Створюємо кастомну подію через BroadcastEvent
        const requestId = Date.now();
        wsRef.current.send(
          JSON.stringify({
            op: 6, // Request
            d: {
              requestType: "BroadcastCustomEvent",
              requestId,
              requestData: {
                eventData: {
                  type: "SHOW_HOST_NAME",
                  text1: t1,
                  text2: t2,
                  settings: settingsToUse,
                  timestamp: timestamp
                }
              }
            }
          })
        );
        console.log("📡 Відправлено через OBS WebSocket (BroadcastCustomEvent)");
      } catch (error) {
        console.error("❌ Помилка відправки через OBS WebSocket:", error);
      }
    }
  }, [isShowing, settings]);

  // Функція для відправки команди в OBS
  const sendOBSRequest = useCallback((requestType, requestData = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("OBS WebSocket is not connected");
      return;
    }

    const requestId = Date.now();
    wsRef.current.send(
      JSON.stringify({
        op: 6, // Request
        d: {
          requestType,
          requestId,
          requestData
        }
      })
    );
  }, []);

  // Експортуємо функцію для використання через window (для тестування)
  useEffect(() => {
    window.showHostName = showHostName;
    window.sendOBSRequest = sendOBSRequest;
    
    return () => {
      delete window.showHostName;
      delete window.sendOBSRequest;
    };
  }, [showHostName, sendOBSRequest]);

  const handleBarComplete = () => {
    const timestamp = Date.now();
    console.log("✅ Плашка завершила показ, timestamp:", timestamp);
    
    setIsShowing(false);
    setText1("");
    setText2("");
    
    // Відправляємо команду про завершення через BroadcastChannel
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: "HIDE_HOST_NAME",
          data: {},
          timestamp
        });
        console.log("📤 Відправлено HIDE через BroadcastChannel");
      } catch (error) {
        console.error("❌ Помилка відправки через BroadcastChannel:", error);
      }
    }
    
    // Зберігаємо в localStorage (fallback)
    try {
      const command = {
        type: "HIDE_HOST_NAME",
        data: {},
        timestamp
      };
      localStorage.setItem("obs-helper-command", JSON.stringify(command));
      console.log("💾 Збережено HIDE в localStorage:", command);
    } catch (error) {
      console.error("❌ Помилка збереження команди в localStorage:", error);
    }
    
    // Відправляємо на HTTP сервер синхронізації
    fetch("/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "HIDE_HOST_NAME",
        data: {},
        timestamp
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        return response.json();
      })
      .then(data => {
        console.log("✅ Команда HIDE відправлена на сервер синхронізації:", data);
      })
      .catch(error => {
        console.warn("⚠️ Сервер синхронізації недоступний, використовуємо localStorage:", error.message);
      });
  };

  const [previewSettings, setPreviewSettings] = useState(null);

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handlePreview = (previewSettingsData) => {
    setPreviewSettings(previewSettingsData);
  };

  const handleShowName = (newSettings) => {
    // Якщо плашка вже показується, приховуємо її
    if (isShowing) {
      const timestamp = Date.now();
      setIsShowing(false);
      setText1("");
      setText2("");
      
      // Відправляємо команду приховування
      fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "HIDE_HOST_NAME",
          data: {},
          timestamp
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
          }
          return response.json();
        })
        .catch(error => {
          console.warn("⚠️ Сервер синхронізації недоступний, використовуємо localStorage:", error.message);
        });
      return;
    }
    
    const t1 = inputText1.trim() || (newSettings?.text1) || settings.text1 || "";
    const t2 = inputText2.trim() || (newSettings?.text2) || settings.text2 || "";

    if (newSettings) {
      handleSettingsChange(newSettings);
    }

    if (t1 || t2) {
      showHostName(t1, t2, newSettings || undefined);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleShowName();
    }
  };

  const showDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";

  return (
    <div
      style={{
        width: "1920px",
        height: "1080px",
        backgroundColor: "transparent",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Тільки плашка — більше нічого в OBS */}
      {isShowing && (text1 || text2) && (
        <HostNameBar
          text1={text1}
          text2={text2}
          settings={settings}
          onComplete={handleBarComplete}
        />
      )}

      {/* Діагностика тільки за ?debug=1 в URL */}
      {showDebug && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            padding: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            fontSize: "12px",
            fontFamily: "monospace",
            zIndex: 10000,
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <div>isShowing: {isShowing ? "✅ true" : "❌ false"}</div>
          <div>text1: {text1 || "—"}</div>
          <div>text2: {text2 || "—"}</div>
          <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px" }}>
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Панель управління тільки при ?control=true */}
      {hasControlAccess && (
        <ControlPanel
          settings={previewSettings || settings}
          onSettingsChange={handleSettingsChange}
          inputText1={inputText1}
          setInputText1={setInputText1}
          inputText2={inputText2}
          setInputText2={setInputText2}
          onShowName={handleShowName}
          isShowing={isShowing}
          onKeyPress={handleKeyPress}
          onPreview={handlePreview}
        />
      )}
    </div>
  );
}
