import React, { useState, useEffect } from "react";

const AdminPanel = ({ onSettingsChange, currentSettings }) => {
  const [settings, setSettings] = useState({
    backgroundColor: "#000000",
    text1Color: "#FFFFFF",
    text2Color: "#CCCCCC",
    text1: "",
    text2: "",
    side: "left" // "left" або "right"
  });

  useEffect(() => {
    // Завантажуємо налаштування з localStorage
    const savedSettings = localStorage.getItem("obs-helper-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Помилка завантаження налаштувань:", error);
      }
    }
    
    // Якщо є поточні налаштування з пропсів, використовуємо їх
    if (currentSettings) {
      setSettings(prev => ({ ...prev, ...currentSettings }));
    }
  }, [currentSettings]);

  const handleChange = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    
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
        top: "50px",
        right: "10px",
        padding: "24px",
        borderRadius: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(10px)",
        border: "2px solid rgba(255, 255, 255, 0.2)",
        color: "white",
        fontFamily: "'Namu', 'Manrope', sans-serif",
        zIndex: 1001,
        minWidth: "350px",
        maxWidth: "400px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
      }}
    >
      <h3
        style={{
          marginBottom: "20px",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#731cfe",
          borderBottom: "2px solid rgba(115, 28, 254, 0.3)",
          paddingBottom: "12px"
        }}
      >
        Адмін панель - Налаштування плашки
      </h3>

      {/* Колір фону плашки */}
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
          value={settings.text1}
          onChange={(e) => handleChange("text1", e.target.value)}
          placeholder="Введіть текст 1"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "6px",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            fontSize: "14px",
            fontFamily: "'Namu', 'Manrope', sans-serif"
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
          value={settings.text2}
          onChange={(e) => handleChange("text2", e.target.value)}
          placeholder="Введіть текст 2"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "6px",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            fontSize: "14px",
            fontFamily: "'Namu', 'Manrope', sans-serif"
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

      {/* Вибір сторони */}
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
          {settings.text1 && (
            <div
              style={{
                color: settings.text1Color,
                fontSize: "18px",
                fontWeight: "bold",
                fontFamily: "'Namu', 'Manrope', sans-serif",
                marginBottom: settings.text2 ? "4px" : "0"
              }}
            >
              {settings.text1}
            </div>
          )}
          {settings.text2 && (
            <div
              style={{
                color: settings.text2Color,
                fontSize: "16px",
                fontFamily: "'Namu', 'Manrope', sans-serif"
              }}
            >
              {settings.text2}
            </div>
          )}
          {!settings.text1 && !settings.text2 && (
            <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px" }}>
              Введіть текст для попереднього перегляду
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
