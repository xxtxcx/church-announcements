import React from "react";

const ControlPanel = ({ 
  settings, 
  onSettingsChange, 
  inputText1, 
  setInputText1, 
  inputText2, 
  setInputText2, 
  onShowName, 
  isShowing,
  onKeyPress 
}) => {
  const handleChange = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    
    // Зберігаємо в localStorage
    localStorage.setItem("obs-helper-settings", JSON.stringify(newSettings));
    
    // Відправляємо на сервер синхронізації
    fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newSettings)
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
    
    // Викликаємо callback
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        padding: "24px",
        borderRadius: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(10px)",
        border: "2px solid rgba(255, 255, 255, 0.2)",
        color: "white",
        fontFamily: "'Namu', 'Manrope', sans-serif",
        zIndex: 1001,
        minWidth: "400px",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          fontSize: "24px",
          fontWeight: "bold",
          color: "#731cfe",
          borderBottom: "2px solid rgba(115, 28, 254, 0.3)",
          paddingBottom: "12px"
        }}
      >
        Панель управління
      </h2>

      {/* Налаштування плашки */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#ff9800"
          }}
        >
          Налаштування плашки
        </h3>

        {/* Колір фону */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600
            }}
          >
            Колір фону плашки:
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
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
              value={settings.backgroundColor}
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
              placeholder="#000000"
              style={{
                flex: 1,
                padding: "8px 12px",
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

        {/* Текст 1 */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600
            }}
          >
            Текст 1:
          </label>
          <input
            type="text"
            value={inputText1}
            onChange={(e) => setInputText1(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={settings.text1 || "Введіть текст 1"}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: "14px",
              fontFamily: "'Namu', 'Manrope', sans-serif",
              outline: "none"
            }}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
            <label style={{ fontSize: "12px", opacity: 0.8 }}>Колір:</label>
            <input
              type="color"
              value={settings.text1Color}
              onChange={(e) => handleChange("text1Color", e.target.value)}
              style={{
                width: "50px",
                height: "30px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            />
            <input
              type="text"
              value={settings.text1Color}
              onChange={(e) => handleChange("text1Color", e.target.value)}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: "4px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "12px",
                fontFamily: "monospace"
              }}
            />
          </div>
        </div>

        {/* Текст 2 */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600
            }}
          >
            Текст 2:
          </label>
          <input
            type="text"
            value={inputText2}
            onChange={(e) => setInputText2(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={settings.text2 || "Введіть текст 2"}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: "14px",
              fontFamily: "'Namu', 'Manrope', sans-serif",
              outline: "none"
            }}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
            <label style={{ fontSize: "12px", opacity: 0.8 }}>Колір:</label>
            <input
              type="color"
              value={settings.text2Color}
              onChange={(e) => handleChange("text2Color", e.target.value)}
              style={{
                width: "50px",
                height: "30px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            />
            <input
              type="text"
              value={settings.text2Color}
              onChange={(e) => handleChange("text2Color", e.target.value)}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: "4px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "12px",
                fontFamily: "monospace"
              }}
            />
          </div>
        </div>

        {/* Сторона появи */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600
            }}
          >
            Сторона появи:
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => handleChange("side", "left")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: settings.side === "left" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.3s"
              }}
            >
              Зліва
            </button>
            <button
              onClick={() => handleChange("side", "right")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: settings.side === "right" ? "#731cfe" : "rgba(115, 28, 254, 0.3)",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.3s"
              }}
            >
              Справа
            </button>
          </div>
        </div>

        {/* Попередній перегляд */}
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>
            Попередній перегляд:
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: "6px",
              backgroundColor: settings.backgroundColor,
              border: "2px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            {(inputText1 || settings.text1) && (
              <div
                style={{
                  color: settings.text1Color,
                  fontSize: "18px",
                  fontWeight: "bold",
                  fontFamily: "'Namu', 'Manrope', sans-serif",
                  marginBottom: (inputText2 || settings.text2) ? "4px" : "0"
                }}
              >
                {inputText1 || settings.text1}
              </div>
            )}
            {(inputText2 || settings.text2) && (
              <div
                style={{
                  color: settings.text2Color,
                  fontSize: "16px",
                  fontFamily: "'Namu', 'Manrope', sans-serif"
                }}
              >
                {inputText2 || settings.text2}
              </div>
            )}
            {!inputText1 && !inputText2 && !settings.text1 && !settings.text2 && (
              <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px" }}>
                Введіть текст для попереднього перегляду
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Кнопка показу/приховування плашки */}
      <button
        onClick={onShowName}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: isShowing ? "#ff6464" : "#731cfe",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
          fontFamily: "'Namu', 'Manrope', sans-serif",
          cursor: "pointer",
          transition: "background-color 0.3s, transform 0.2s",
          boxShadow: "0 4px 12px rgba(115, 28, 254, 0.4)"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
        }}
      >
        {isShowing ? "Приховати плашку" : "Показати плашку"}
      </button>
    </div>
  );
};

export default ControlPanel;
