import React, { useState, useEffect, useRef } from "react";

const HostNameBar = ({ text1, text2, settings, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Використовуємо налаштування або значення за замовчуванням
  const bgColor = settings?.backgroundColor || "rgba(0, 0, 0, 0.85)";
  const text1Color = settings?.text1Color || "#FFFFFF";
  const text2Color = settings?.text2Color || "#CCCCCC";
  const side = settings?.side || "left";
  const width = settings?.width || "auto";
  const height = settings?.height || "auto";
  const verticalPosition = settings?.verticalPosition || "bottom";
  const topOffset = settings?.topOffset || "32px";
  const bottomOffset = settings?.bottomOffset || "32px";
  const text1Font = settings?.text1Font || "'Namu', 'Manrope', sans-serif";
  const text2Font = settings?.text2Font || "'Namu', 'Manrope', sans-serif";
  const text1Size = settings?.text1Size || "24px";
  const text2Size = settings?.text2Size || "20px";
  const textPaddingLeft = settings?.textPaddingLeft || "0px";
  const textPaddingRight = settings?.textPaddingRight || "0px";
  const textGap = settings?.textGap || "4px";
  const starPosition = settings?.starPosition || "none";
  const starColor = settings?.starColor || "#731cfe";

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

  // Анімація зірочки
  useEffect(() => {
    if (starPosition === "none" || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
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

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [starPosition, starColor]);

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
  
  // Визначаємо напрямок анімації залежно від сторони
  const enterTransform = side === "left" ? "translateX(-100%)" : "translateX(100%)";
  const exitTransform = side === "left" ? "translateX(2000px)" : "translateX(-2000px)";
  const leftPosition = side === "left" ? "0px" : "auto";
  const rightPosition = side === "right" ? "0px" : "auto";

  // Визначаємо вертикальне позиціонування
  let verticalStyle = {};
  if (verticalPosition === "top") {
    verticalStyle = { top: topOffset, bottom: "auto" };
  } else if (verticalPosition === "center") {
    verticalStyle = { top: "50%", bottom: "auto" };
  } else {
    verticalStyle = { bottom: bottomOffset, top: "auto" };
  }

  // Комбінуємо transform для центрування та анімації
  const getTransform = () => {
    const baseTransform = isEntering
      ? enterTransform
      : isExiting
      ? exitTransform
      : "translateX(0px)";
    
    if (verticalPosition === "center") {
      // Для центрування комбінуємо translateX та translateY
      return `${baseTransform} translateY(-50%)`;
    }
    return baseTransform;
  };

  // Визначаємо стилі для контейнера з урахуванням ширини
  const containerStyle = {
    position: "absolute",
    ...verticalStyle,
    zIndex: 99999,
    transform: getTransform(),
    opacity: isEntering ? 0 : isExiting ? 0 : 1,
    transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
    pointerEvents: "none"
  };

  // Якщо ширина встановлена, обмежуємо контейнер
  if (width !== "auto") {
    containerStyle.width = width;
    containerStyle.left = side === "left" ? "0px" : "auto";
    containerStyle.right = side === "right" ? "0px" : "auto";
  } else {
    containerStyle.left = leftPosition;
    containerStyle.right = rightPosition;
  }

  // Визначаємо розміри canvas для зірочки
  const starRadius = 25;
  const starPadding = 10;

  return (
    <div style={containerStyle}>
      <div
        style={{
          position: "relative",
          padding: "16px 32px",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          background: bgColor,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          width: width === "auto" ? "auto" : "100%",
          minWidth: width === "auto" ? "200px" : "unset",
          maxWidth: width === "auto" ? "none" : "100%",
          height: height === "auto" ? "auto" : height,
          boxSizing: "border-box",
          paddingRight: starPosition === "outside" ? `${starRadius + 20}px` : "32px"
        }}
      >
        {/* Canvas для зірочки всередині */}
        {starPosition === "inside" && (
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: `${starPadding}px`,
              right: `${starPadding}px`,
              width: `${starRadius * 2}px`,
              height: `${starRadius * 2}px`,
              pointerEvents: "none",
              zIndex: 10
            }}
            width={starRadius * 2 * 2}
            height={starRadius * 2 * 2}
          />
        )}
        
        {/* Canvas для зірочки зовні */}
        {starPosition === "outside" && (
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: "50%",
              right: `-${starRadius}px`,
              transform: "translateY(-50%)",
              width: `${starRadius * 2}px`,
              height: `${starRadius * 2}px`,
              pointerEvents: "none",
              zIndex: 10
            }}
            width={starRadius * 2 * 2}
            height={starRadius * 2 * 2}
          />
        )}
        {text1 && (
          <div
            style={{
              color: text1Color,
              fontSize: text1Size,
              fontWeight: "bold",
              whiteSpace: width === "auto" ? "nowrap" : "normal",
              wordWrap: width === "auto" ? "normal" : "break-word",
              overflowWrap: width === "auto" ? "normal" : "break-word",
              fontFamily: text1Font,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              margin: 0,
              padding: `0 ${textPaddingRight} 0 ${textPaddingLeft}`,
              marginBottom: text2 ? textGap : "0"
            }}
          >
            {text1}
          </div>
        )}
        {text2 && (
          <div
            style={{
              color: text2Color,
              fontSize: text2Size,
              whiteSpace: width === "auto" ? "nowrap" : "normal",
              wordWrap: width === "auto" ? "normal" : "break-word",
              overflowWrap: width === "auto" ? "normal" : "break-word",
              fontFamily: text2Font,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              margin: 0,
              padding: `0 ${textPaddingRight} 0 ${textPaddingLeft}`
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
