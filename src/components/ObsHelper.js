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
    side: "left"
  });
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const storagePollIntervalRef = useRef(null);

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

  // Синхронізація стану між браузером та OBS через BroadcastChannel та localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isOBS = urlParams.get("control") !== "true"; // Якщо немає ?control=true, то це OBS
    console.log("🔧 Ініціалізація синхронізації стану...", isOBS ? "(OBS Browser Source)" : "(Браузер з панеллю управління)");
    
    // Змінна для відстеження останньої обробленої команди (всередині useEffect)
    let lastProcessedTimestamp = 0;
    
    // Створюємо BroadcastChannel для синхронізації між вкладками/вікнами
    let channel = null;
    try {
      channel = new BroadcastChannel("obs-helper-sync");
      broadcastChannelRef.current = channel;
      console.log("✅ BroadcastChannel створено");

      // Слухаємо повідомлення від інших екземплярів
      channel.onmessage = (event) => {
        console.log("📨 Отримано повідомлення через BroadcastChannel:", event.data);
        const { type, data } = event.data;
        
        if (type === "SHOW_HOST_NAME") {
          console.log("✅ Отримано команду показати плашку через BroadcastChannel:", data);
          setText1(data.text1 || "");
          setText2(data.text2 || "");
          if (data.settings) {
            setSettings(data.settings);
          }
          setIsShowing(true);
        } else if (type === "HIDE_HOST_NAME") {
          console.log("✅ Отримано команду приховати плашку через BroadcastChannel");
          setIsShowing(false);
          setText1("");
          setText2("");
        }
      };
    } catch (error) {
      console.warn("⚠️ BroadcastChannel не підтримується:", error);
    }

    // Перевіряємо HTTP сервер синхронізації (основний механізм)
    const checkServer = async () => {
      try {
        // Спочатку перевіряємо налаштування
        const settingsResponse = await fetch("/api/settings");
        if (settingsResponse.ok) {
          const contentType = settingsResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const settingsData = await settingsResponse.json();
            if (settingsData.settings) {
              setSettings(prev => {
                const newSettings = { ...prev, ...settingsData.settings };
                localStorage.setItem("obs-helper-settings", JSON.stringify(newSettings));
                return newSettings;
              });
            }
          }
        }
        
        // Потім перевіряємо команди
        const response = await fetch(`/api/sync?since=${lastProcessedTimestamp}`);
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.command && data.timestamp > lastProcessedTimestamp) {
              const command = data.command;
              const commandTime = data.timestamp;
              const now = Date.now();
              
              console.log("🔍 Перевірка сервера синхронізації:", {
                commandTime,
                lastProcessed: lastProcessedTimestamp,
                isNew: commandTime > lastProcessedTimestamp,
                isFresh: (now - commandTime < 10000),
                commandType: command.type
              });
              
              // Обробляємо тільки нові команди (не старіші за 10 секунд)
              if (commandTime > lastProcessedTimestamp && (now - commandTime < 10000)) {
                console.log("📦 Отримано НОВУ команду з сервера:", command);
                
                if (command.type === "SHOW_HOST_NAME") {
                  console.log("✅ Виконую команду SHOW_HOST_NAME:", command.data);
                  lastProcessedTimestamp = commandTime;
                  
                  // Оновлюємо стан
                  setText1(command.data.text1 || "");
                  setText2(command.data.text2 || "");
                  if (command.data.settings) {
                    setSettings(command.data.settings);
                  }
                  setIsShowing(true);
                  
                  console.log("✅ Стан оновлено: isShowing=true, text1=" + command.data.text1 + ", text2=" + command.data.text2);
                } else if (command.type === "HIDE_HOST_NAME") {
                  console.log("✅ Виконую команду HIDE_HOST_NAME");
                  lastProcessedTimestamp = commandTime;
                  
                  // Оновлюємо стан
                  setIsShowing(false);
                  setText1("");
                  setText2("");
                  
                  console.log("✅ Стан оновлено: isShowing=false");
                }
              }
            }
          }
        }
      } catch (error) {
        // Сервер недоступний, використовуємо localStorage як fallback
        console.warn("⚠️ Сервер синхронізації недоступний, використовуємо localStorage:", error.message);
        
        // Fallback до localStorage
        try {
          const storedCommand = localStorage.getItem("obs-helper-command");
          if (storedCommand) {
            const command = JSON.parse(storedCommand);
            const commandTime = command.timestamp || 0;
            const now = Date.now();
            
            if (commandTime > lastProcessedTimestamp && (now - commandTime < 5000)) {
              console.log("📦 Отримано команду з localStorage (fallback):", command);
              
              if (command.type === "SHOW_HOST_NAME") {
                lastProcessedTimestamp = commandTime;
                setText1(command.data.text1 || "");
                setText2(command.data.text2 || "");
                if (command.data.settings) {
                  setSettings(command.data.settings);
                }
                setIsShowing(true);
              } else if (command.type === "HIDE_HOST_NAME") {
                lastProcessedTimestamp = commandTime;
                setIsShowing(false);
                setText1("");
                setText2("");
              }
            }
          }
        } catch (localError) {
          console.error("❌ Помилка читання з localStorage:", localError);
        }
      }
    };

    // Перевіряємо HTTP сервер часто (кожні 100мс для швидшої реакції в OBS)
    storagePollIntervalRef.current = setInterval(checkServer, 100);
    
    // Перевіряємо одразу
    checkServer();
    console.log("✅ Polling сервера синхронізації запущено (кожні 100мс)");
    
    // Також слухаємо події storage для миттєвої реакції (fallback)
    const handleStorageChange = (e) => {
      if (e.key === "obs-helper-command" && e.newValue) {
        console.log("📢 Storage подія отримана (fallback):", e.newValue);
        checkServer();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Очищення
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channel) {
        channel.close();
      }
      if (storagePollIntervalRef.current) {
        clearInterval(storagePollIntervalRef.current);
      }
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

  // Функція для показу плашки
  const showHostName = useCallback((text1Value, text2Value) => {
    if (isShowing) {
      console.log("⚠️ Плашка вже показується, пропускаємо");
      return;
    }
    
    const timestamp = Date.now();
    const t1 = text1Value || settings.text1 || "";
    const t2 = text2Value || settings.text2 || "";
    
    console.log("🚀 Показуємо плашку:", { text1: t1, text2: t2, timestamp });
    
    // Оновлюємо локальний стан
    setText1(t1);
    setText2(t2);
    setIsShowing(true);
    
    // Відправляємо команду через BroadcastChannel
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: "SHOW_HOST_NAME",
          data: { text1: t1, text2: t2, settings },
          timestamp
        });
        console.log("📤 Відправлено через BroadcastChannel");
      } catch (error) {
        console.error("❌ Помилка відправки через BroadcastChannel:", error);
      }
    }
    
    // Зберігаємо в localStorage (fallback)
    try {
      const command = {
        type: "SHOW_HOST_NAME",
        data: { text1: t1, text2: t2, settings },
        timestamp
      };
      localStorage.setItem("obs-helper-command", JSON.stringify(command));
      console.log("💾 Збережено в localStorage:", command);
    } catch (error) {
      console.error("❌ Помилка збереження команди в localStorage:", error);
    }
    
    // Відправляємо на HTTP сервер синхронізації (основний механізм)
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
          settings: settings // Передаємо поточні налаштування
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
                  settings: settings,
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

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handleShowName = () => {
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
    
    // Інакше показуємо плашку
    const t1 = inputText1.trim() || settings.text1 || "";
    const t2 = inputText2.trim() || settings.text2 || "";
    
    if (t1 || t2) {
      showHostName(t1, t2);
      setInputText1("");
      setInputText2("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleShowName();
    }
  };

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
      {/* Плашка - завжди видима в OBS */}
      {isShowing && (text1 || text2) && (
        <>
          {console.log("🎯 Рендеримо плашку:", { isShowing, text1, text2, settings })}
          <HostNameBar 
            text1={text1} 
            text2={text2} 
            settings={settings}
            onComplete={handleBarComplete} 
          />
        </>
      )}
      
      {/* Тестовий елемент для перевірки */}
      {isShowing && (
        <div
          style={{
            position: "absolute",
            top: "200px",
            left: "100px",
            padding: "20px",
            backgroundColor: "red",
            color: "white",
            fontSize: "20px",
            zIndex: 99999,
            border: "5px solid yellow"
          }}
        >
          ТЕСТ: isShowing={isShowing ? "true" : "false"}, text1="{text1}", text2="{text2}"
        </div>
      )}
      
      {/* Debug інформація (завжди видима для діагностики) */}
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
        <div>text1: {text1 || "empty"}</div>
        <div>text2: {text2 || "empty"}</div>
        <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px" }}>
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Об'єднана панель управління (завжди видима, прихована тільки з ?control=false) */}
      {hasControlAccess && (
        <ControlPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          inputText1={inputText1}
          setInputText1={setInputText1}
          inputText2={inputText2}
          setInputText2={setInputText2}
          onShowName={handleShowName}
          isShowing={isShowing}
          onKeyPress={handleKeyPress}
        />
      )}
    </div>
  );
}
