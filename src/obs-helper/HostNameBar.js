import React, { useState, useEffect } from "react";

const HostNameBar = ({ text1, text2, settings, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

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
  const hasStar = starPosition !== "none";
  const text1LetterSpacing = settings?.text1LetterSpacing ?? "";
  const text2LetterSpacing = settings?.text2LetterSpacing ?? "";
  const text1TextTransform = settings?.text1TextTransform ?? "";
  const paddingTop = settings?.paddingTop ?? "";
  const paddingBottom = settings?.paddingBottom ?? "";
  const badgeTemplate = settings?.badgeTemplate ?? "custom";
  const isTemplateStyle = badgeTemplate === "purple" || badgeTemplate === "dark" || badgeTemplate === "teal";
  const badgeScale = Math.min(200, Math.max(100, Number(settings?.badgeScale) || 100));

  useEffect(() => {
    setIsVisible(true);
    const enterTimer = setTimeout(() => setIsEntering(false), 50);
    const exitTimer = setTimeout(() => setIsExiting(true), 5050);
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 5550);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible && !isExiting) return null;

  const enterTransform = side === "left" ? "translateX(-100%)" : "translateX(100%)";
  const exitTransform = side === "left" ? "translateX(2000px)" : "translateX(-2000px)";
  const leftPosition = side === "left" ? "0px" : "auto";
  const rightPosition = side === "right" ? "0px" : "auto";

  let verticalStyle = {};
  if (verticalPosition === "top") {
    verticalStyle = { top: topOffset, bottom: "auto" };
  } else if (verticalPosition === "center") {
    verticalStyle = { top: "50%", bottom: "auto" };
  } else {
    verticalStyle = { bottom: bottomOffset, top: "auto" };
  }

  const getTransform = () => {
    const baseTransform = isEntering ? enterTransform : isExiting ? exitTransform : "translateX(0px)";
    if (verticalPosition === "center") return `${baseTransform} translateY(-50%)`;
    return baseTransform;
  };

  const containerStyle = {
    position: "absolute",
    ...verticalStyle,
    zIndex: 99999,
    transform: getTransform(),
    opacity: isEntering ? 0 : isExiting ? 0 : 1,
    transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
    pointerEvents: "none"
  };
  if (width !== "auto") {
    containerStyle.width = width;
    containerStyle.left = side === "left" ? "0px" : "auto";
    containerStyle.right = side === "right" ? "0px" : "auto";
  } else {
    containerStyle.left = leftPosition;
    containerStyle.right = rightPosition;
  }

  const scaleOriginX = side === "right" ? "100%" : "0%";
  const scaleOriginY = verticalPosition === "top" ? "0%" : verticalPosition === "bottom" ? "100%" : "50%";

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "inline-block",
          transform: `scale(${badgeScale / 100})`,
          transformOrigin: `${scaleOriginX} ${scaleOriginY}`
        }}
      >
        <div
          style={{
            position: "relative",
            paddingTop: paddingTop || (isTemplateStyle ? "10px" : "16px"),
            paddingBottom: paddingBottom || (isTemplateStyle ? "10px" : "16px"),
            paddingLeft: textPaddingLeft || (isTemplateStyle ? "24px" : "32px"),
            paddingRight: textPaddingRight || (isTemplateStyle ? "24px" : "32px"),
            borderRadius: isTemplateStyle ? 0 : "8px",
            boxShadow: isTemplateStyle ? "none" : "0 4px 20px rgba(0, 0, 0, 0.5)",
            background: bgColor,
            backdropFilter: isTemplateStyle ? "none" : "blur(10px)",
            WebkitBackdropFilter: isTemplateStyle ? "none" : "blur(10px)",
            border: isTemplateStyle ? "none" : "2px solid rgba(255, 255, 255, 0.3)",
            width: width === "auto" ? "auto" : "100%",
            minWidth: width === "auto" ? (isTemplateStyle ? "unset" : "200px") : "unset",
            maxWidth: width === "auto" ? "none" : "100%",
            height: height === "auto" ? "auto" : height,
            boxSizing: "border-box",
            display: "inline-flex",
            flexDirection: "column"
          }}
        >
          {hasStar && (
            <div
              style={{
                position: "absolute",
                width: "26px",
                height: "26px",
                ...(side === "right"
                  ? { left: 0, top: 0, transform: "translate(-50%, -50%)" }
                  : { right: 0, top: 0, transform: "translate(50%, -50%)" }),
                pointerEvents: "none",
                zIndex: 10
              }}
            >
              <svg
                viewBox="0 0 50 50"
                width="26"
                height="26"
                style={{
                  display: "block",
                  transformOrigin: "50% 50%",
                  animation: "starRotate 3s linear infinite"
                }}
              >
                <defs>
                  <filter id="starShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="rgba(0,0,0,0.3)" />
                  </filter>
                </defs>
                <circle cx="25" cy="25" r="25" fill="white" filter="url(#starShadow)" />
                <g stroke={starColor} strokeWidth="7" strokeLinecap="butt">
                  <line x1="25" y1="25" x2="25" y2="7" />
                  <line x1="25" y1="25" x2="42.1" y2="19.42" />
                  <line x1="25" y1="25" x2="35.44" y2="39.58" />
                  <line x1="25" y1="25" x2="14.56" y2="39.58" />
                  <line x1="25" y1="25" x2="7.9" y2="19.42" />
                </g>
              </svg>
            </div>
          )}
          {text1 && (
            <div
              style={{
                color: text1Color,
                fontSize: text1Size,
                fontWeight: "500",
                lineHeight: 1,
                letterSpacing: text1LetterSpacing || undefined,
                textTransform: text1TextTransform || undefined,
                whiteSpace: width === "auto" ? "nowrap" : "normal",
                wordWrap: width === "auto" ? "normal" : "break-word",
                overflowWrap: width === "auto" ? "normal" : "break-word",
                fontFamily: text1Font,
                textShadow: isTemplateStyle ? "none" : "2px 2px 4px rgba(0, 0, 0, 0.8)",
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
                fontWeight: "400",
                lineHeight: 1,
                letterSpacing: text2LetterSpacing || undefined,
                whiteSpace: width === "auto" ? "nowrap" : "normal",
                wordWrap: width === "auto" ? "normal" : "break-word",
                overflowWrap: width === "auto" ? "normal" : "break-word",
                fontFamily: text2Font,
                textShadow: isTemplateStyle ? "none" : "2px 2px 4px rgba(0, 0, 0, 0.8)",
                margin: 0,
                padding: `0 ${textPaddingRight} 0 ${textPaddingLeft}`
              }}
            >
              {text2}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostNameBar;
