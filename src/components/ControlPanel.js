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
  onPreview
}) => {
  // Локальні стани для всіх налаштувань
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
    starColor: settings.starColor || "#731cfe"
  });

  const [tempWidth, setTempWidth] = useState(settings.width || "auto");
  const [tempHeight, setTempHeight] = useState(settings.height || "auto");
  const [tempTopOffset, setTempTopOffset] = useState(settings.topOffset || "32px");
  const [tempBottomOffset, setTempBottomOffset] = useState(settings.bottomOffset || "32px");
  const previewCanvasRef = useRef(null);
  const previewAnimationRef = useRef(null);
  const settingsRef = useRef(settings);
  const isInitialMount = useRef(true);

  // Функція для малювання зірочки
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

  // Анімація зірочки для попереднього перегляду
  useEffect(() => {
    const starPosition = settings.starPosition || localSettings.starPosition || "none";
    const starColor = settings.starColor || localSettings.starColor || "#731cfe";
    
    if (starPosition === "none" || !previewCanvasRef.current) {
      if (previewAnimationRef.current) {
        cancelAnimationFrame(previewAnimationRef.current);
      }
      return;
    }

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const starRadius = 25;
    
    // Встановлюємо розмір canvas з урахуванням device pixel ratio для чіткості
    const dpr = window.devicePixelRatio || 1;
    canvas.width = starRadius * 2 * 2 * dpr;
    canvas.height = starRadius * 2 * 2 * dpr;
    ctx.scale(dpr, dpr);
    
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const rotation = elapsed * Math.PI * 2;
      
      // Очищаємо canvas
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      // Визначаємо позицію зірочки (центр canvas)
      const starX = starRadius * 2;
      const starY = starRadius * 2;
      
      // Біле коло
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(starX, starY, starRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Зірочка
      ctx.save();
      ctx.translate(starX, starY);
      ctx.rotate(rotation);
      drawStar(ctx, 0, 0, starColor, 18);
      ctx.restore();

      previewAnimationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (previewAnimationRef.current) {
        cancelAnimationFrame(previewAnimationRef.current);
      }
    };
  }, [settings.starPosition, settings.starColor, localSettings.starPosition, localSettings.starColor]);

  // Синхронізуємо локальні налаштування з пропсами тільки при першому монтуванні
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
        starColor: settings.starColor || "#731cfe"
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
    if (onPreview) {
      onPreview(previewSettings);
    }
  };

  const handleApplyAndShow = () => {
    const finalSettings = {
      ...localSettings,
      width: tempWidth,
      height: tempHeight,
      topOffset: tempTopOffset,
      bottomOffset: tempBottomOffset
    };
    
    // Зберігаємо в localStorage
    localStorage.setItem("obs-helper-settings", JSON.stringify(finalSettings));
    
    // Відправляємо на сервер синхронізації
    fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(finalSettings)
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
    
    // Застосовуємо налаштування
    if (onSettingsChange) {
      onSettingsChange(finalSettings);
    }
    
    // Показуємо плашку з новими налаштуваннями
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
      starColor: "#731cfe"
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
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto"
        }}
      >
        {/* Заголовок */}
        <header
          style={{
            marginBottom: "50px",
            textAlign: "center"
          }}
        >
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
          <p
            style={{
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.7)",
              marginTop: "10px"
            }}
          >
            Панель управління для OBS overlay
          </p>
        </header>

        {/* Основна сітка */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginBottom: "40px"
          }}
        >
          {/* Ліва колонка - Текст та кольори */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "30px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ff9800",
                marginBottom: "30px",
                borderBottom: "2px solid rgba(255, 152, 0, 0.3)",
                paddingBottom: "15px"
              }}
            >
              Текст та кольори
            </h2>

            {/* Текст 1 */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Текст 1:
              </label>
              <input
                type="text"
                value={inputText1}
                onChange={(e) => setInputText1(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder={localSettings.text1 || "Введіть текст 1"}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "16px",
                  fontFamily: "'Namu', 'Manrope', sans-serif",
                  outline: "none",
                  transition: "border-color 0.3s"
                }}
                onFocus={(e) => (e.target.style.borderColor = "#731cfe")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.3)")}
              />
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px", flexWrap: "wrap" }}>
                <label style={{ fontSize: "14px", opacity: 0.8, minWidth: "60px" }}>Колір:</label>
                <input
                  type="color"
                  value={localSettings.text1Color}
                  onChange={(e) => updateLocalSetting("text1Color", e.target.value)}
                  style={{
                    width: "60px",
                    height: "40px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                />
                <input
                  type="text"
                  value={localSettings.text1Color}
                  onChange={(e) => updateLocalSetting("text1Color", e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "120px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    fontSize: "14px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Шрифт:</label>
                  <select
                    value={localSettings.text1Font || "'Namu', 'Manrope', sans-serif"}
                    onChange={(e) => updateLocalSetting("text1Font", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "'Namu', 'Manrope', sans-serif",
                      cursor: "pointer"
                    }}
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
                  <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Розмір:</label>
                  <input
                    type="text"
                    value={localSettings.text1Size || "24px"}
                    onChange={(e) => updateLocalSetting("text1Size", e.target.value)}
                    placeholder="24px"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Текст 2 */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Текст 2:
              </label>
              <input
                type="text"
                value={inputText2}
                onChange={(e) => setInputText2(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder={localSettings.text2 || "Введіть текст 2"}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "16px",
                  fontFamily: "'Namu', 'Manrope', sans-serif",
                  outline: "none",
                  transition: "border-color 0.3s"
                }}
                onFocus={(e) => (e.target.style.borderColor = "#731cfe")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.3)")}
              />
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px", flexWrap: "wrap" }}>
                <label style={{ fontSize: "14px", opacity: 0.8, minWidth: "60px" }}>Колір:</label>
                <input
                  type="color"
                  value={localSettings.text2Color}
                  onChange={(e) => updateLocalSetting("text2Color", e.target.value)}
                  style={{
                    width: "60px",
                    height: "40px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                />
                <input
                  type="text"
                  value={localSettings.text2Color}
                  onChange={(e) => updateLocalSetting("text2Color", e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "120px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    fontSize: "14px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Шрифт:</label>
                  <select
                    value={localSettings.text2Font || "'Namu', 'Manrope', sans-serif"}
                    onChange={(e) => updateLocalSetting("text2Font", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "'Namu', 'Manrope', sans-serif",
                      cursor: "pointer"
                    }}
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
                  <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Розмір:</label>
                  <input
                    type="text"
                    value={localSettings.text2Size || "20px"}
                    onChange={(e) => updateLocalSetting("text2Size", e.target.value)}
                    placeholder="20px"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Колір фону */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Колір фону плашки:
              </label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="color"
                  value={localSettings.backgroundColor}
                  onChange={(e) => updateLocalSetting("backgroundColor", e.target.value)}
                  style={{
                    width: "60px",
                    height: "40px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                />
                <input
                  type="text"
                  value={localSettings.backgroundColor}
                  onChange={(e) => updateLocalSetting("backgroundColor", e.target.value)}
                  placeholder="#000000"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    fontSize: "14px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
            </div>

            {/* Зірочка */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Зірочка:
              </label>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Позиція:</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => updateLocalSetting("starPosition", "none")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: localSettings.starPosition === "none" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "background-color 0.3s, transform 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (localSettings.starPosition !== "none") e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    Відсутня
                  </button>
                  <button
                    onClick={() => updateLocalSetting("starPosition", "outside")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: localSettings.starPosition === "outside" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "background-color 0.3s, transform 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (localSettings.starPosition !== "outside") e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    Зовні
                  </button>
                  <button
                    onClick={() => updateLocalSetting("starPosition", "inside")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: localSettings.starPosition === "inside" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "background-color 0.3s, transform 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (localSettings.starPosition !== "inside") e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    Всередині
                  </button>
                </div>
              </div>
              {localSettings.starPosition !== "none" && (
                <div>
                  <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Колір зірки:</label>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <input
                      type="color"
                      value={localSettings.starColor || "#731cfe"}
                      onChange={(e) => updateLocalSetting("starColor", e.target.value)}
                      style={{
                        width: "60px",
                        height: "40px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    />
                    <input
                      type="text"
                      value={localSettings.starColor || "#731cfe"}
                      onChange={(e) => updateLocalSetting("starColor", e.target.value)}
                      placeholder="#731cfe"
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "14px",
                        fontFamily: "monospace"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Відступи тексту */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Відступи тексту:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Відступ зліва:</label>
                  <input
                    type="text"
                    value={localSettings.textPaddingLeft || "0px"}
                    onChange={(e) => updateLocalSetting("textPaddingLeft", e.target.value)}
                    placeholder="0px"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>Відступ справа:</label>
                  <input
                    type="text"
                    value={localSettings.textPaddingRight || "0px"}
                    onChange={(e) => updateLocalSetting("textPaddingRight", e.target.value)}
                    placeholder="0px"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}
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
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    fontSize: "14px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Права колонка - Позиціонування та розміри */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "30px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ff9800",
                marginBottom: "30px",
                borderBottom: "2px solid rgba(255, 152, 0, 0.3)",
                paddingBottom: "15px"
              }}
            >
              Позиціонування та розміри
            </h2>

            {/* Сторона появи */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Сторона появи:
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => updateLocalSetting("side", "left")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: localSettings.side === "left" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s, transform 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.side !== "left") e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Зліва
                </button>
                <button
                  onClick={() => updateLocalSetting("side", "right")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: localSettings.side === "right" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s, transform 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.side !== "right") e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Справа
                </button>
              </div>
            </div>

            {/* Вертикальне позиціонування */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Вертикальне позиціонування:
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => updateLocalSetting("verticalPosition", "top")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: localSettings.verticalPosition === "top" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s, transform 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.verticalPosition !== "top") e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Зверху
                </button>
                <button
                  onClick={() => updateLocalSetting("verticalPosition", "center")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: localSettings.verticalPosition === "center" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s, transform 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.verticalPosition !== "center") e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  По центру
                </button>
                <button
                  onClick={() => updateLocalSetting("verticalPosition", "bottom")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: localSettings.verticalPosition === "bottom" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s, transform 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (localSettings.verticalPosition !== "bottom") e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Знизу
                </button>
              </div>
            </div>

            {/* Ширина та висота */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Розміри плашки:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    Ширина:
                  </label>
                  <input
                    type="text"
                    value={tempWidth}
                    onChange={(e) => setTempWidth(e.target.value)}
                    placeholder="auto або 400px"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    Висота:
                  </label>
                  <input
                    type="text"
                    value={tempHeight}
                    onChange={(e) => setTempHeight(e.target.value)}
                    placeholder="auto або 100px"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    updateLocalSetting("width", tempWidth);
                    updateLocalSetting("height", tempHeight);
                  }}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#731cfe",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s, transform 0.2s",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Застосувати
                </button>
              </div>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                Поточні значення: ширина = {localSettings.width || "auto"}, висота = {localSettings.height || "auto"}
              </div>
            </div>

            {/* Відступи */}
            <div style={{ marginBottom: "0" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff"
                }}
              >
                Відступи:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    Відступ зверху:
                  </label>
                  <input
                    type="text"
                    value={tempTopOffset}
                    onChange={(e) => setTempTopOffset(e.target.value)}
                    placeholder="32px"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    Відступ знизу:
                  </label>
                  <input
                    type="text"
                    value={tempBottomOffset}
                    onChange={(e) => setTempBottomOffset(e.target.value)}
                    placeholder="32px"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    updateLocalSetting("topOffset", tempTopOffset);
                    updateLocalSetting("bottomOffset", tempBottomOffset);
                  }}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#731cfe",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s, transform 0.2s",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Застосувати
                </button>
              </div>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                Поточні значення: зверху = {localSettings.topOffset || "32px"}, знизу = {localSettings.bottomOffset || "32px"}
              </div>
            </div>
          </div>
        </div>

        {/* Попередній перегляд та кнопки */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "30px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "30px"
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#ff9800",
              marginBottom: "20px",
              borderBottom: "2px solid rgba(255, 152, 0, 0.3)",
              paddingBottom: "15px"
            }}
          >
            Попередній перегляд
          </h2>
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
              paddingRight: (settings.starPosition || localSettings.starPosition) === "outside" ? "60px" : "30px"
            }}
          >
            {/* Canvas для зірочки всередині попереднього перегляду */}
            {(settings.starPosition || localSettings.starPosition) === "inside" && (
              <canvas
                ref={previewCanvasRef}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "50px",
                  height: "50px",
                  pointerEvents: "none",
                  zIndex: 10
                }}
                width={100}
                height={100}
              />
            )}
            
            {/* Canvas для зірочки зовні попереднього перегляду */}
            {(settings.starPosition || localSettings.starPosition) === "outside" && (
              <canvas
                ref={previewCanvasRef}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "-25px",
                  transform: "translateY(-50%)",
                  width: "50px",
                  height: "50px",
                  pointerEvents: "none",
                  zIndex: 10
                }}
                width={100}
                height={100}
              />
            )}

            {(inputText1 || (settings.text1 || localSettings.text1)) && (
              <div
                style={{
                  color: settings.text1Color || localSettings.text1Color,
                  fontSize: settings.text1Size || localSettings.text1Size || "24px",
                  fontWeight: "bold",
                  fontFamily: settings.text1Font || localSettings.text1Font || "'Namu', 'Manrope', sans-serif",
                  marginBottom: (inputText2 || (settings.text2 || localSettings.text2)) ? (settings.textGap || localSettings.textGap || "4px") : "0",
                  padding: `0 ${settings.textPaddingRight || localSettings.textPaddingRight || "0px"} 0 ${settings.textPaddingLeft || localSettings.textPaddingLeft || "0px"}`
                }}
              >
                {inputText1 || settings.text1 || localSettings.text1}
              </div>
            )}
            {(inputText2 || (settings.text2 || localSettings.text2)) && (
              <div
                style={{
                  color: settings.text2Color || localSettings.text2Color,
                  fontSize: settings.text2Size || localSettings.text2Size || "20px",
                  fontFamily: settings.text2Font || localSettings.text2Font || "'Namu', 'Manrope', sans-serif",
                  padding: `0 ${settings.textPaddingRight || localSettings.textPaddingRight || "0px"} 0 ${settings.textPaddingLeft || localSettings.textPaddingLeft || "0px"}`
                }}
              >
                {inputText2 || settings.text2 || localSettings.text2}
              </div>
            )}
            {!inputText1 && !inputText2 && !(settings.text1 || localSettings.text1) && !(settings.text2 || localSettings.text2) && (
              <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "16px", textAlign: "center" }}>
                Введіть текст та натисніть "Попередній перегляд" для перегляду
              </div>
            )}
          </div>

          {/* Кнопки управління */}
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              onClick={handleClear}
              style={{
                flex: 1,
                padding: "20px",
                borderRadius: "10px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                backgroundColor: "transparent",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                fontFamily: "'Namu', 'Manrope', sans-serif",
                cursor: "pointer",
                transition: "background-color 0.3s, transform 0.2s, border-color 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Очистити все
            </button>
            <button
              onClick={handlePreview}
              style={{
                flex: 1,
                padding: "20px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#ff9800",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                fontFamily: "'Namu', 'Manrope', sans-serif",
                cursor: "pointer",
                transition: "background-color 0.3s, transform 0.2s, box-shadow 0.3s",
                boxShadow: "0 4px 20px rgba(255, 152, 0, 0.4)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 6px 25px rgba(255, 152, 0, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 20px rgba(255, 152, 0, 0.4)";
              }}
            >
              Попередній перегляд
            </button>
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
                transition: "background-color 0.3s, transform 0.2s, box-shadow 0.3s",
                boxShadow: isShowing ? "0 4px 20px rgba(230, 81, 0, 0.4)" : "0 4px 20px rgba(115, 28, 254, 0.4)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = isShowing ? "0 6px 25px rgba(230, 81, 0, 0.5)" : "0 6px 25px rgba(115, 28, 254, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = isShowing ? "0 4px 20px rgba(230, 81, 0, 0.4)" : "0 4px 20px rgba(115, 28, 254, 0.4)";
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
