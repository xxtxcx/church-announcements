import React, { useState, useEffect } from "react";

const HostNameBar = ({ text1, text2, settings, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Початок анімації появи - спочатку плашка за межами екрану
    setIsVisible(true);
    
    // Невелика затримка перед початком анімації появи
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 50);

    // Після 5 секунд починаємо вихід
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5050); // 50ms затримка + 5000ms показу

    // Після завершення анімації виходу викликаємо callback
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 5550); // 50ms + 5000ms + 500ms анімації виходу

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible && !isExiting) {
    return null;
  }

  // Використовуємо налаштування або значення за замовчуванням
  const bgColor = settings?.backgroundColor || "rgba(0, 0, 0, 0.85)";
  const text1Color = settings?.text1Color || "#FFFFFF";
  const text2Color = settings?.text2Color || "#CCCCCC";
  const side = settings?.side || "left";
  
  // Визначаємо напрямок анімації залежно від сторони
  const enterTransform = side === "left" ? "translateX(-100%)" : "translateX(100%)";
  const exitTransform = side === "left" ? "translateX(2000px)" : "translateX(-2000px)";
  const leftPosition = side === "left" ? "0px" : "auto";
  const rightPosition = side === "right" ? "0px" : "auto";

  return (
    <div
      style={{
        position: "absolute",
        bottom: "32px",
        left: leftPosition,
        right: rightPosition,
        zIndex: 99999,
        transform: isEntering
          ? enterTransform
          : isExiting
          ? exitTransform
          : "translateX(0px)",
        opacity: isEntering ? 0 : isExiting ? 0 : 1,
        transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          padding: "16px 32px",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          background: bgColor,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          minWidth: "200px"
        }}
      >
        {text1 && (
          <div
            style={{
              color: text1Color,
              fontSize: "24px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              fontFamily: "'Namu', 'Manrope', sans-serif",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              margin: 0,
              padding: 0,
              marginBottom: text2 ? "4px" : "0"
            }}
          >
            {text1}
          </div>
        )}
        {text2 && (
          <div
            style={{
              color: text2Color,
              fontSize: "20px",
              whiteSpace: "nowrap",
              fontFamily: "'Namu', 'Manrope', sans-serif",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              margin: 0,
              padding: 0
            }}
          >
            {text2}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostNameBar;
