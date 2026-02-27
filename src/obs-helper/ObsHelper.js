import React, { useState, useEffect, useRef, useCallback } from "react";
import HostNameBar from "./HostNameBar";
import ControlPanel from "./ControlPanel";

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
  const [sessionActive, setSessionActive] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const storagePollIntervalRef = useRef(null);
  const syncLastVersionRef = useRef(0);
  const syncInFlightRef = useRef(false);
  const POLL_INTERVAL_MS = 400;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const controlParam = urlParams.get("control");
    setHasControlAccess(controlParam !== "false");
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem("obs-helper-settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Помилка завантаження налаштувань:", error);
      }
    }
    fetch("/api/settings")
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Response is not JSON");
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isOBS = urlParams.get("control") !== "true";
    const shouldPoll = isOBS || sessionActive;
    if (!shouldPoll) return;

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
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return;
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
  }, [sessionActive]);

  useEffect(() => {
    if (!obsConfig.enableOBS) return;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let isManualClose = false;

    const connectToOBS = () => {
      if (reconnectAttempts >= maxReconnectAttempts && !isManualClose) return;
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
        const ws = new WebSocket(obsConfig.wsUrl);
        wsRef.current = ws;
        ws.onopen = () => {
          reconnectAttempts = 0;
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.op === 0) {
              if (data.d.authentication) {
                if (obsConfig.wsPassword) {
                  ws.send(JSON.stringify({ op: 1, d: { rpcVersion: data.d.rpcVersion || 1, authentication: obsConfig.wsPassword, eventSubscriptions: 33 } }));
                } else {
                  console.warn("OBS WebSocket вимагає пароль, але пароль не вказано");
                }
              } else {
                ws.send(JSON.stringify({ op: 1, d: { rpcVersion: data.d.rpcVersion || 1, eventSubscriptions: 33 } }));
              }
            } else if (data.op === 2) {
              console.log("✅ OBS WebSocket автентифіковано");
            } else if (data.op === 7) {
              const eventData = data.d;
              if (eventData.eventType === "CustomEvent") {
                const customData = eventData.eventData;
                if (customData && customData.type === "SHOW_HOST_NAME") {
                  setText1(customData.text1 || "");
                  setText2(customData.text2 || "");
                  if (customData.settings) setSettings(customData.settings);
                  setIsShowing(true);
                } else if (customData && customData.type === "HIDE_HOST_NAME") {
                  setIsShowing(false);
                  setText1("");
                  setText2("");
                }
              }
            }
          } catch (error) {
            console.error("Помилка обробки повідомлення від OBS:", error);
          }
        };
        ws.onerror = () => {
          if (reconnectAttempts === 0) console.warn("⚠️ OBS WebSocket: не вдалося підключитися.");
        };
        ws.onclose = () => {
          if (!isManualClose && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            reconnectTimeoutRef.current = setTimeout(connectToOBS, Math.min(3000 * reconnectAttempts, 15000));
          }
        };
      } catch (error) {
        console.error("Помилка підключення до OBS:", error);
      }
    };

    const initialTimeout = setTimeout(connectToOBS, 500);
    return () => {
      isManualClose = true;
      clearTimeout(initialTimeout);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [obsConfig]);

  const showHostName = useCallback((text1Value, text2Value, settingsOverride) => {
    if (isShowing) return;
    const settingsToUse = settingsOverride && typeof settingsOverride === "object" ? settingsOverride : settings;
    if (settingsOverride) setSettings(settingsToUse);
    const timestamp = Date.now();
    const t1 = text1Value ?? settingsToUse.text1 ?? "";
    const t2 = text2Value ?? settingsToUse.text2 ?? "";
    setText1(t1);
    setText2(t2);
    setIsShowing(true);

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type: "SHOW_HOST_NAME", data: { text1: t1, text2: t2, settings: settingsToUse }, timestamp });
      } catch (error) {
        console.error("❌ Помилка відправки через BroadcastChannel:", error);
      }
    }
    try {
      localStorage.setItem("obs-helper-command", JSON.stringify({ type: "SHOW_HOST_NAME", data: { text1: t1, text2: t2, settings: settingsToUse }, timestamp }));
    } catch (error) {
      console.error("❌ Помилка збереження команди в localStorage:", error);
    }
    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "SHOW_HOST_NAME", data: { text1: t1, text2: t2, settings: settingsToUse }, timestamp })
    })
      .then(response => response.ok && response.headers.get("content-type")?.includes("application/json") ? response.json() : Promise.reject(new Error("Not JSON")))
      .catch(error => console.warn("⚠️ Сервер синхронізації недоступний:", error.message));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ op: 6, d: { requestType: "BroadcastCustomEvent", requestId: Date.now(), requestData: { eventData: { type: "SHOW_HOST_NAME", text1: t1, text2: t2, settings: settingsToUse, timestamp } } } }));
      } catch (error) {
        console.error("❌ Помилка відправки через OBS WebSocket:", error);
      }
    }
  }, [isShowing, settings]);

  useEffect(() => {
    window.showHostName = showHostName;
    return () => { delete window.showHostName; };
  }, [showHostName]);

  const handleBarComplete = () => {
    setIsShowing(false);
    setText1("");
    setText2("");
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type: "HIDE_HOST_NAME", data: {}, timestamp: Date.now() });
      } catch (error) {
        console.error("❌ Помилка відправки через BroadcastChannel:", error);
      }
    }
    try {
      localStorage.setItem("obs-helper-command", JSON.stringify({ type: "HIDE_HOST_NAME", data: {}, timestamp: Date.now() }));
    } catch (error) {
      console.error("❌ Помилка збереження команди в localStorage:", error);
    }
    fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "HIDE_HOST_NAME", data: {}, timestamp: Date.now() }) })
      .catch(error => console.warn("⚠️ Сервер синхронізації недоступний:", error.message));
  };

  const [previewSettings, setPreviewSettings] = useState(null);
  const handleSettingsChange = (newSettings) => setSettings(newSettings);
  const handlePreview = (previewSettingsData) => setPreviewSettings(previewSettingsData);

  const handleShowName = (newSettings) => {
    if (isShowing) {
      setIsShowing(false);
      setText1("");
      setText2("");
      fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "HIDE_HOST_NAME", data: {}, timestamp: Date.now() }) }).catch(() => {});
      return;
    }
    const t1 = inputText1.trim() || (newSettings?.text1) || settings.text1 || "";
    const t2 = inputText2.trim() || (newSettings?.text2) || settings.text2 || "";
    if (newSettings) handleSettingsChange(newSettings);
    if (t1 || t2) showHostName(t1, t2, newSettings || undefined);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleShowName();
  };

  const showDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";

  return (
    <div style={{ width: "1920px", height: "1080px", backgroundColor: "transparent", margin: "0 auto", position: "relative", overflow: "hidden" }}>
      {isShowing && (text1 || text2) && (
        <HostNameBar text1={text1} text2={text2} settings={settings} onComplete={handleBarComplete} />
      )}
      {showDebug && (
        <div style={{ position: "absolute", bottom: "10px", left: "10px", padding: "8px", backgroundColor: "rgba(0, 0, 0, 0.8)", color: "white", fontSize: "12px", fontFamily: "monospace", zIndex: 10000, borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
          <div>isShowing: {isShowing ? "✅ true" : "❌ false"}</div>
          <div>text1: {text1 || "—"}</div>
          <div>text2: {text2 || "—"}</div>
          <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px" }}>{new Date().toLocaleTimeString()}</div>
        </div>
      )}
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
          sessionActive={sessionActive}
          onSessionChange={setSessionActive}
        />
      )}
    </div>
  );
}
