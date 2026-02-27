import React, { useState, useEffect, useRef } from "react";

const ControlPanel = ({
  settings,
  onSettingsChange,
  inputText1,
  setInputText1,
  inputText2,
  setInputText2,
  onShowName,
  isShowing,
  onKeyPress,
  onPreview,
  sessionActive,
  onSessionChange
}) => {
  const BADGE_TEMPLATES = {
    purple: {
      badgeTemplate: "purple",
      backgroundColor: "#7B2FBE",
      text1Color: "#ffffff",
      text2Color: "#e0c8ff",
      text1Font: "'Montserrat', sans-serif",
      text2Font: "'Montserrat', sans-serif",
      text1Size: "26px",
      text2Size: "12px",
      text1LetterSpacing: "2px",
      text2LetterSpacing: "0.3px",
      text1TextTransform: "uppercase",
      textGap: "4px",
      textPaddingLeft: "24px",
      textPaddingRight: "24px",
      paddingTop: "10px",
      paddingBottom: "10px",
      width: "auto"
    },
    dark: {
      badgeTemplate: "dark",
      backgroundColor: "rgba(20, 20, 20, 0.85)",
      text1Color: "#ffffff",
      text2Color: "#cccccc",
      text1Font: "'Montserrat', sans-serif",
      text2Font: "'Montserrat', sans-serif",
      text1Size: "26px",
      text2Size: "12px",
      text1LetterSpacing: "2px",
      text2LetterSpacing: "0.3px",
      text1TextTransform: "uppercase",
      textGap: "4px",
      textPaddingLeft: "24px",
      textPaddingRight: "24px",
      paddingTop: "10px",
      paddingBottom: "10px",
      width: "auto"
    },
    teal: {
      badgeTemplate: "teal",
      backgroundColor: "#1A5C7A",
      text1Color: "#ffffff",
      text2Color: "#a8dce8",
      text1Font: "'Montserrat', sans-serif",
      text2Font: "'Montserrat', sans-serif",
      text1Size: "26px",
      text2Size: "12px",
      text1LetterSpacing: "2px",
      text2LetterSpacing: "0.3px",
      text1TextTransform: "uppercase",
      textGap: "4px",
      textPaddingLeft: "24px",
      textPaddingRight: "24px",
      paddingTop: "10px",
      paddingBottom: "10px",
      width: "auto"
    }
  };

  const [localSettings, setLocalSettings] = useState({
    backgroundColor: settings.backgroundColor || "#000000",
    text1Color: settings.text1Color || "#FFFFFF",
    text2Color: settings.text2Color || "#CCCCCC",
    side: settings.side || "left",
    width: settings.width || "auto",
    height: settings.height || "auto",
    verticalPosition: settings.verticalPosition || "bottom",
    topOffset: settings.topOffset || "32px",
    bottomOffset: settings.bottomOffset || "32px",
    text1Font: settings.text1Font || "'Namu', 'Manrope', sans-serif",
    text2Font: settings.text2Font || "'Namu', 'Manrope', sans-serif",
    text1Size: settings.text1Size || "24px",
    text2Size: settings.text2Size || "20px",
    textPaddingLeft: settings.textPaddingLeft || "0px",
    textPaddingRight: settings.textPaddingRight || "0px",
    textGap: settings.textGap || "4px",
    starPosition: settings.starPosition || "none",
    starColor: settings.starColor || "#731cfe",
    badgeTemplate: settings.badgeTemplate || "custom",
    badgeScale: settings.badgeScale ?? 100,
    text1LetterSpacing: settings.text1LetterSpacing ?? "",
    text2LetterSpacing: settings.text2LetterSpacing ?? "",
    text1TextTransform: settings.text1TextTransform ?? "",
    paddingTop: settings.paddingTop ?? "",
    paddingBottom: settings.paddingBottom ?? ""
  });

  const [tempWidth, setTempWidth] = useState(settings.width || "auto");
  const [tempHeight, setTempHeight] = useState(settings.height || "auto");
  const [tempTopOffset, setTempTopOffset] = useState(settings.topOffset || "32px");
  const [tempBottomOffset, setTempBottomOffset] = useState(settings.bottomOffset || "32px");
  const [extendedOpen, setExtendedOpen] = useState(false);
  const previewCanvasRef = useRef(null);
  const previewAnimationRef = useRef(null);
  const settingsRef = useRef(settings);
  const isInitialMount = useRef(true);

  const drawStar = (ctx, cx, cy, color, size = 18) => {
    const scale = size / 100;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(7 * Math.PI / 180);
    ctx.strokeStyle = color;
    ctx.lineWidth = 45 * scale;
    ctx.lineCap = 'butt';
    const lines = [
      { x: 0, y: 0, x2: 0, y2: -100 * scale },
      { x: 0, y: 0, x2: 95 * scale, y2: -31 * scale },
      { x: 0, y: 0, x2: 58 * scale, y2: 81 * scale },
      { x: 0, y: 0, x2: -58 * scale, y2: 81 * scale },
      { x: 0, y: 0, x2: -95 * scale, y2: -31 * scale }
    ];
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });
    ctx.restore();
  };

  useEffect(() => {
    const hasStar = (settings.starPosition || localSettings.starPosition || "none") !== "none";
    const starColorPreview = settings.starColor || localSettings.starColor || "#731cfe";
    if (!hasStar || !previewCanvasRef.current) {
      if (previewAnimationRef.current) cancelAnimationFrame(previewAnimationRef.current);
      return;
    }
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const starRadius = 25;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = starRadius * 2 * 2 * dpr;
    canvas.height = starRadius * 2 * 2 * dpr;
    ctx.scale(dpr, dpr);
    let startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const rotation = elapsed * Math.PI * 2;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      const starX = starRadius * 2;
      const starY = starRadius * 2;
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(starX, starY, starRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.save();
      ctx.translate(starX, starY);
      ctx.rotate(rotation);
      drawStar(ctx, 0, 0, starColorPreview, 18);
      ctx.restore();
      previewAnimationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (previewAnimationRef.current) cancelAnimationFrame(previewAnimationRef.current);
    };
  }, [settings.starPosition, localSettings.starPosition, settings.starColor, localSettings.starColor]);

  const applyTemplate = (templateId) => {
    if (!BADGE_TEMPLATES[templateId]) return;
    setLocalSettings((prev) => ({ ...prev, ...BADGE_TEMPLATES[templateId] }));
  };

  useEffect(() => {
    if (isInitialMount.current) {
      setLocalSettings({
        backgroundColor: settings.backgroundColor || "#000000",
        text1Color: settings.text1Color || "#FFFFFF",
        text2Color: settings.text2Color || "#CCCCCC",
        side: settings.side || "left",
        width: settings.width || "auto",
        height: settings.height || "auto",
        verticalPosition: settings.verticalPosition || "bottom",
        topOffset: settings.topOffset || "32px",
        bottomOffset: settings.bottomOffset || "32px",
        text1Font: settings.text1Font || "'Namu', 'Manrope', sans-serif",
        text2Font: settings.text2Font || "'Namu', 'Manrope', sans-serif",
        text1Size: settings.text1Size || "24px",
        text2Size: settings.text2Size || "20px",
        textPaddingLeft: settings.textPaddingLeft || "0px",
        textPaddingRight: settings.textPaddingRight || "0px",
        textGap: settings.textGap || "4px",
        starPosition: settings.starPosition || "none",
        starColor: settings.starColor || "#731cfe",
        badgeTemplate: settings.badgeTemplate || "custom",
        badgeScale: settings.badgeScale ?? 100,
        text1LetterSpacing: settings.text1LetterSpacing ?? "",
        text2LetterSpacing: settings.text2LetterSpacing ?? "",
        text1TextTransform: settings.text1TextTransform ?? "",
        paddingTop: settings.paddingTop ?? "",
        paddingBottom: settings.paddingBottom ?? ""
      });
      setTempWidth(settings.width || "auto");
      setTempHeight(settings.height || "auto");
      setTempTopOffset(settings.topOffset || "32px");
      setTempBottomOffset(settings.bottomOffset || "32px");
      settingsRef.current = settings;
      isInitialMount.current = false;
    }
  }, [settings]);

  const updateLocalSetting = (field, value) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePreview = () => {
    const previewSettings = {
      ...localSettings,
      width: tempWidth,
      height: tempHeight,
      topOffset: tempTopOffset,
      bottomOffset: tempBottomOffset
    };
    if (onPreview) onPreview(previewSettings);
  };

  const handleApplyAndShow = () => {
    const finalSettings = {
      ...localSettings,
      width: tempWidth,
      height: tempHeight,
      topOffset: tempTopOffset,
      bottomOffset: tempBottomOffset
    };
    localStorage.setItem("obs-helper-settings", JSON.stringify(finalSettings));
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalSettings)
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Response is not JSON");
        return response.json();
      })
      .catch(error => {
        console.warn("⚠️ Сервер синхронізації недоступний, використовуємо localStorage:", error.message);
      });
    if (onSettingsChange) onSettingsChange(finalSettings);
    onShowName(finalSettings);
  };

  const handleClear = () => {
    setInputText1("");
    setInputText2("");
    setTempWidth("auto");
    setTempHeight("auto");
    setTempTopOffset("32px");
    setTempBottomOffset("32px");
    setLocalSettings({
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
      badgeTemplate: "custom",
      badgeScale: 100,
      text1LetterSpacing: "",
      text2LetterSpacing: "",
      text1TextTransform: "",
      paddingTop: "",
      paddingBottom: ""
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "'Namu', 'Manrope', sans-serif",
        zIndex: 1001,
        overflowY: "auto",
        padding: "40px 20px"
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <header style={{ marginBottom: "50px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#731cfe",
              marginBottom: "10px",
              textShadow: "0 0 20px rgba(115, 28, 254, 0.5)"
            }}
          >
            OBS Helper
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.7)", marginTop: "10px" }}>
            Панель управління для OBS overlay
          </p>
        </header>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <button
            type="button"
            onClick={() => onSessionChange && onSessionChange(!sessionActive)}
            style={{
              padding: "14px 28px",
              borderRadius: "10px",
              border: sessionActive ? "2px solid rgba(255, 100, 100, 0.6)" : "2px solid rgba(115, 28, 254, 0.8)",
              background: sessionActive ? "rgba(200, 80, 80, 0.25)" : "rgba(115, 28, 254, 0.25)",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "'Namu', 'Manrope', sans-serif",
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s"
            }}
          >
            {sessionActive ? "Закрити сесію" : "Старт сесії"}
          </button>
          <span style={{ marginLeft: "16px", alignSelf: "center", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
            {sessionActive ? "Полінг увімкнено — синхронізація з OBS" : "Увімкніть сесію для синхронізації з OBS (економія запитів)"}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "24px 30px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "20px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", gap: "32px", alignItems: "stretch", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px", flex: "1 1 300px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Рядок 1</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    value={inputText1}
                    onChange={(e) => setInputText1(e.target.value)}
                    onKeyPress={onKeyPress}
                    placeholder={localSettings.text1 || "Введіть текст"}
                    style={{
                      flex: "1 1 200px",
                      minWidth: "0",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "16px",
                      fontFamily: "'Namu', 'Manrope', sans-serif",
                      outline: "none"
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#731cfe")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.3)")}
                  />
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", opacity: 0.8 }}>Колір:</span>
                    <input
                      type="color"
                      value={localSettings.text1Color}
                      onChange={(e) => updateLocalSetting("text1Color", e.target.value)}
                      style={{ width: "40px", height: "36px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "6px", cursor: "pointer" }}
                    />
                    <input
                      type="text"
                      value={localSettings.text1Color}
                      onChange={(e) => updateLocalSetting("text1Color", e.target.value)}
                      style={{
                        width: "90px",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "13px",
                        fontFamily: "monospace"
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Рядок 2</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    value={inputText2}
                    onChange={(e) => setInputText2(e.target.value)}
                    onKeyPress={onKeyPress}
                    placeholder={localSettings.text2 || "Введіть текст"}
                    style={{
                      flex: "1 1 200px",
                      minWidth: "0",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "16px",
                      fontFamily: "'Namu', 'Manrope', sans-serif",
                      outline: "none"
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#731cfe")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.3)")}
                  />
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", opacity: 0.8 }}>Колір:</span>
                    <input
                      type="color"
                      value={localSettings.text2Color}
                      onChange={(e) => updateLocalSetting("text2Color", e.target.value)}
                      style={{ width: "40px", height: "36px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "6px", cursor: "pointer" }}
                    />
                    <input
                      type="text"
                      value={localSettings.text2Color}
                      onChange={(e) => updateLocalSetting("text2Color", e.target.value)}
                      style={{
                        width: "90px",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "13px",
                        fontFamily: "monospace"
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Колір плашки</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={localSettings.backgroundColor}
                    onChange={(e) => updateLocalSetting("backgroundColor", e.target.value)}
                    style={{ width: "40px", height: "36px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "6px", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    value={localSettings.backgroundColor}
                    onChange={(e) => updateLocalSetting("backgroundColor", e.target.value)}
                    placeholder="#000000"
                    style={{
                      width: "90px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "13px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Шаблон плашки</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => applyTemplate("purple")}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "2px solid " + (localSettings.badgeTemplate === "purple" ? "#fff" : "rgba(255,255,255,0.3)"),
                      background: "#7B2FBE",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Шаблон 1
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("dark")}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "2px solid " + (localSettings.badgeTemplate === "dark" ? "#fff" : "rgba(255,255,255,0.3)"),
                      background: "rgba(20, 20, 20, 0.95)",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Шаблон 2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("teal")}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "2px solid " + (localSettings.badgeTemplate === "teal" ? "#fff" : "rgba(255,255,255,0.3)"),
                      background: "#1A5C7A",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Шаблон 3
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Сторона плашки</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => updateLocalSetting("side", "left")}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "2px solid " + (localSettings.side === "left" ? "#731cfe" : "rgba(255,255,255,0.3)"),
                      background: localSettings.side === "left" ? "rgba(115, 28, 254, 0.3)" : "transparent",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Зліва
                  </button>
                  <button
                    type="button"
                    onClick={() => updateLocalSetting("side", "right")}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "2px solid " + (localSettings.side === "right" ? "#731cfe" : "rgba(255,255,255,0.3)"),
                      background: localSettings.side === "right" ? "rgba(115, 28, 254, 0.3)" : "transparent",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Справа
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Зірочка</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => updateLocalSetting("starPosition", "none")}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "2px solid " + (localSettings.starPosition === "none" ? "#731cfe" : "rgba(255,255,255,0.3)"),
                      background: localSettings.starPosition === "none" ? "rgba(115, 28, 254, 0.3)" : "transparent",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Ні
                  </button>
                  <button
                    type="button"
                    onClick={() => updateLocalSetting("starPosition", "corner")}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "2px solid " + (localSettings.starPosition !== "none" ? "#731cfe" : "rgba(255,255,255,0.3)"),
                      background: localSettings.starPosition !== "none" ? "rgba(115, 28, 254, 0.3)" : "transparent",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Так
                  </button>
                  {localSettings.starPosition !== "none" && (
                    <>
                      <span style={{ fontSize: "13px", opacity: 0.8 }}>Колір:</span>
                      <input
                        type="color"
                        value={localSettings.starColor || "#731cfe"}
                        onChange={(e) => updateLocalSetting("starColor", e.target.value)}
                        style={{ width: "40px", height: "36px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "6px", cursor: "pointer" }}
                      />
                      <input
                        type="text"
                        value={localSettings.starColor || "#731cfe"}
                        onChange={(e) => updateLocalSetting("starColor", e.target.value)}
                        style={{
                          width: "90px",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          color: "white",
                          fontSize: "13px",
                          fontFamily: "monospace"
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "100px", borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff", textAlign: "center" }}>Масштаб плашки</label>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <input
                  type="range"
                  min={100}
                  max={200}
                  step={10}
                  value={localSettings.badgeScale ?? 100}
                  onChange={(e) => updateLocalSetting("badgeScale", Number(e.target.value))}
                  style={{
                    width: "120px",
                    height: "8px",
                    transform: "rotate(-90deg)",
                    transformOrigin: "center center",
                    margin: "0 -40px"
                  }}
                  title="100%–200%"
                />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", minWidth: "48px", textAlign: "center" }}>
                  {localSettings.badgeScale ?? 100}%
                </span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>100–200%</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExtendedOpen((v) => !v)}
          style={{
            width: "100%",
            padding: "12px 20px",
            marginBottom: "24px",
            borderRadius: "8px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: extendedOpen ? "rgba(115, 28, 254, 0.2)" : "transparent",
            color: "white",
            fontSize: "15px",
            fontWeight: 600,
            fontFamily: "'Namu', 'Manrope', sans-serif",
            cursor: "pointer",
            transition: "background-color 0.2s, border-color 0.2s"
          }}
        >
          {extendedOpen ? "Згорнути розширені налаштування" : "Відкрити розширені налаштування"}
        </button>

        {extendedOpen && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#ff9800", marginBottom: "24px", borderBottom: "2px solid rgba(255, 152, 0, 0.3)", paddingBottom: "12px" }}>
                Текст та кольори (розширені)
              </h2>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Рядок 1 — шрифт і розмір</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>Шрифт</label>
                    <select
                      value={localSettings.text1Font || "'Namu', 'Manrope', sans-serif"}
                      onChange={(e) => updateLocalSetting("text1Font", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", cursor: "pointer" }}
                    >
                      <option value="'Namu', 'Manrope', sans-serif">Namu / Manrope</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="'Courier New', monospace">Courier New</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                      <option value="Impact, sans-serif">Impact</option>
                      <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>Розмір</label>
                    <input
                      type="text"
                      value={localSettings.text1Size || "24px"}
                      onChange={(e) => updateLocalSetting("text1Size", e.target.value)}
                      placeholder="24px"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Рядок 2 — шрифт і розмір</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>Шрифт</label>
                    <select
                      value={localSettings.text2Font || "'Namu', 'Manrope', sans-serif"}
                      onChange={(e) => updateLocalSetting("text2Font", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", cursor: "pointer" }}
                    >
                      <option value="'Namu', 'Manrope', sans-serif">Namu / Manrope</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="'Courier New', monospace">Courier New</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                      <option value="Impact, sans-serif">Impact</option>
                      <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>Розмір</label>
                    <input
                      type="text"
                      value={localSettings.text2Size || "20px"}
                      onChange={(e) => updateLocalSetting("text2Size", e.target.value)}
                      placeholder="20px"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "12px", fontSize: "16px", fontWeight: 600, color: "#fff" }}>Відступи тексту:</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Відступ зліва:</label>
                    <input
                      type="text"
                      value={localSettings.textPaddingLeft || "0px"}
                      onChange={(e) => updateLocalSetting("textPaddingLeft", e.target.value)}
                      placeholder="0px"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Відступ справа:</label>
                    <input
                      type="text"
                      value={localSettings.textPaddingRight || "0px"}
                      onChange={(e) => updateLocalSetting("textPaddingRight", e.target.value)}
                      placeholder="0px"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Відстань між рядками:</label>
                  <input
                    type="text"
                    value={localSettings.textGap || "4px"}
                    onChange={(e) => updateLocalSetting("textGap", e.target.value)}
                    placeholder="4px"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#ff9800", marginBottom: "30px", borderBottom: "2px solid rgba(255, 152, 0, 0.3)", paddingBottom: "15px" }}>
                Позиціонування та розміри
              </h2>
              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontSize: "16px", fontWeight: 600, color: "#fff" }}>Вертикальне позиціонування:</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => updateLocalSetting("verticalPosition", "top")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: localSettings.verticalPosition === "top" ? "#731cfe" : "rgba(115, 28, 254, 0.3)", color: "white", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>Зверху</button>
                  <button onClick={() => updateLocalSetting("verticalPosition", "center")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: localSettings.verticalPosition === "center" ? "#731cfe" : "rgba(115, 28, 254, 0.3)", color: "white", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>По центру</button>
                  <button onClick={() => updateLocalSetting("verticalPosition", "bottom")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: localSettings.verticalPosition === "bottom" ? "#731cfe" : "rgba(115, 28, 254, 0.3)", color: "white", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>Знизу</button>
                </div>
              </div>
              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontSize: "16px", fontWeight: 600, color: "#fff" }}>Розміри плашки:</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "rgba(255, 255, 255, 0.8)" }}>Ширина:</label>
                    <input type="text" value={tempWidth} onChange={(e) => setTempWidth(e.target.value)} placeholder="auto або 400px" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "rgba(255, 255, 255, 0.8)" }}>Висота:</label>
                    <input type="text" value={tempHeight} onChange={(e) => setTempHeight(e.target.value)} placeholder="auto або 100px" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }} />
                  </div>
                  <button onClick={() => { updateLocalSetting("width", tempWidth); updateLocalSetting("height", tempHeight); }} style={{ padding: "12px 20px", borderRadius: "8px", border: "none", backgroundColor: "#731cfe", color: "white", fontSize: "14px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>Застосувати</button>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>Поточні: ширина = {localSettings.width || "auto"}, висота = {localSettings.height || "auto"}</div>
              </div>
              <div style={{ marginBottom: "0" }}>
                <label style={{ display: "block", marginBottom: "12px", fontSize: "16px", fontWeight: 600, color: "#fff" }}>Відступи:</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "rgba(255, 255, 255, 0.8)" }}>Відступ зверху:</label>
                    <input type="text" value={tempTopOffset} onChange={(e) => setTempTopOffset(e.target.value)} placeholder="32px" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "rgba(255, 255, 255, 0.8)" }}>Відступ знизу:</label>
                    <input type="text" value={tempBottomOffset} onChange={(e) => setTempBottomOffset(e.target.value)} placeholder="32px" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", fontSize: "14px", fontFamily: "monospace" }} />
                  </div>
                  <button onClick={() => { updateLocalSetting("topOffset", tempTopOffset); updateLocalSetting("bottomOffset", tempBottomOffset); }} style={{ padding: "12px 20px", borderRadius: "8px", border: "none", backgroundColor: "#731cfe", color: "white", fontSize: "14px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>Застосувати</button>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>Поточні: зверху = {localSettings.topOffset || "32px"}, знизу = {localSettings.bottomOffset || "32px"}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.1)", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#ff9800", marginBottom: "20px", borderBottom: "2px solid rgba(255, 152, 0, 0.3)", paddingBottom: "15px" }}>Попередній перегляд</h2>
          <div
            style={{
              position: "relative",
              padding: "20px 30px",
              borderRadius: "8px",
              backgroundColor: settings.backgroundColor || localSettings.backgroundColor,
              border: "2px solid rgba(255, 255, 255, 0.3)",
              marginBottom: "30px",
              minHeight: "80px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: (settings.width || localSettings.width) === "auto" ? "auto" : (settings.width || localSettings.width),
              height: (settings.height || localSettings.height) === "auto" ? "auto" : (settings.height || localSettings.height),
              boxSizing: "border-box",
              paddingRight: "30px"
            }}
          >
            {(settings.starPosition || localSettings.starPosition) !== "none" && (
              <canvas
                ref={previewCanvasRef}
                style={{
                  position: "absolute",
                  width: "50px",
                  height: "50px",
                  ...((settings.side || localSettings.side) === "right" ? { left: 0, top: 0, transform: "translate(-50%, -50%)" } : { right: 0, top: 0, transform: "translate(50%, -50%)" }),
                  pointerEvents: "none",
                  zIndex: 10
                }}
                width={100}
                height={100}
              />
            )}
            {(inputText1 || (settings.text1 || localSettings.text1)) && (
              <div style={{ color: settings.text1Color || localSettings.text1Color, fontSize: settings.text1Size || localSettings.text1Size || "24px", fontWeight: "500", lineHeight: 1, letterSpacing: (settings.text1LetterSpacing ?? localSettings.text1LetterSpacing) || undefined, textTransform: (settings.text1TextTransform ?? localSettings.text1TextTransform) || undefined, fontFamily: settings.text1Font || localSettings.text1Font || "'Namu', 'Manrope', sans-serif", marginBottom: (inputText2 || (settings.text2 || localSettings.text2)) ? (settings.textGap || localSettings.textGap || "4px") : "0", padding: `0 ${settings.textPaddingRight || localSettings.textPaddingRight || "0px"} 0 ${settings.textPaddingLeft || localSettings.textPaddingLeft || "0px"}` }}>
                {inputText1 || settings.text1 || localSettings.text1}
              </div>
            )}
            {(inputText2 || (settings.text2 || localSettings.text2)) && (
              <div style={{ color: settings.text2Color || localSettings.text2Color, fontSize: settings.text2Size || localSettings.text2Size || "20px", fontWeight: "400", lineHeight: 1, letterSpacing: (settings.text2LetterSpacing ?? localSettings.text2LetterSpacing) || undefined, fontFamily: settings.text2Font || localSettings.text2Font || "'Namu', 'Manrope', sans-serif", padding: `0 ${settings.textPaddingRight || localSettings.textPaddingRight || "0px"} 0 ${settings.textPaddingLeft || localSettings.textPaddingLeft || "0px"}` }}>
                {inputText2 || settings.text2 || localSettings.text2}
              </div>
            )}
            {!inputText1 && !inputText2 && !(settings.text1 || localSettings.text1) && !(settings.text2 || localSettings.text2) && (
              <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "16px", textAlign: "center" }}>Введіть текст та натисніть "Попередній перегляд" для перегляду</div>
            )}
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={handleClear} style={{ flex: 1, padding: "20px", borderRadius: "10px", border: "2px solid rgba(255, 255, 255, 0.3)", backgroundColor: "transparent", color: "white", fontSize: "18px", fontWeight: "bold", fontFamily: "'Namu', 'Manrope', sans-serif", cursor: "pointer" }}>Очистити все</button>
            <button onClick={handlePreview} style={{ flex: 1, padding: "20px", borderRadius: "10px", border: "none", backgroundColor: "#ff9800", color: "white", fontSize: "18px", fontWeight: "bold", fontFamily: "'Namu', 'Manrope', sans-serif", cursor: "pointer", boxShadow: "0 4px 20px rgba(255, 152, 0, 0.4)" }}>Попередній перегляд</button>
            <button
              onClick={handleApplyAndShow}
              style={{
                flex: 2,
                padding: "20px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: isShowing ? "#e65100" : "#731cfe",
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
                fontFamily: "'Namu', 'Manrope', sans-serif",
                cursor: "pointer",
                boxShadow: isShowing ? "0 4px 20px rgba(230, 81, 0, 0.4)" : "0 4px 20px rgba(115, 28, 254, 0.4)"
              }}
            >
              {isShowing ? "Приховати плашку" : "Показати плашку"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
