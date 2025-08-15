async function createUI() {
    await detectLanguage()

    loadThemePreference()

    const theme = getCurrentTheme()

    const fontAwesome = document.createElement("link")
    fontAwesome.rel = "stylesheet"
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    document.head.appendChild(fontAwesome)

    if (theme.fontFamily.includes("Press Start 2P")) {
      const googleFonts = document.createElement("link")
      googleFonts.rel = "stylesheet"
      googleFonts.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
      document.head.appendChild(googleFonts)
    }

    const style = document.createElement("style")
    style.setAttribute("data-wplace-theme", "true")

    style.textContent = `
      ${
        theme.animations.glow
          ? `
      @keyframes neonGlow {
        0%, 100% { 
          text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
        }
        50% { 
          text-shadow: 0 0 2px currentColor, 0 0 5px currentColor, 0 0 8px currentColor;
        }
      }`
          : ""
      }
      
      ${
        theme.animations.pixelBlink
          ? `
      @keyframes pixelBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.7; }
      }`
          : ""
      }
      
      ${
        theme.animations.scanline
          ? `
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(400px); }
      }`
          : ""
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(0, 255, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0); }
      }
      @keyframes slideIn {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      #wplace-image-bot-container {
        position: fixed;
        top: 20px;
        right: 20px;
        width: ${CONFIG.currentTheme === "Neon Retro" ? "320px" : "280px"};
        max-height: calc(100vh - 40px);
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.primary} 0%, #1a1a1a 100%)`
            : theme.primary
        };
        border: ${theme.borderWidth} ${theme.borderStyle} ${CONFIG.currentTheme === "Classic Autobot" ? theme.accent : theme.text};
        border-radius: ${theme.borderRadius};
        padding: 0;
        box-shadow: ${theme.boxShadow};
        z-index: 9998;
        font-family: ${theme.fontFamily};
        color: ${theme.text};
        animation: slideIn 0.4s ease-out;
        overflow: hidden;
        ${theme.backdropFilter ? `backdrop-filter: ${theme.backdropFilter};` : ""}
        transition: all 0.3s ease;
        user-select: none;
        ${CONFIG.currentTheme === "Neon Retro" ? "image-rendering: pixelated;" : ""}
      }
      
      ${
        theme.animations.scanline
          ? `
      #wplace-image-bot-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, ${theme.neon}, transparent);
        animation: scanline 3s linear infinite;
        z-index: 1;
        pointer-events: none;
      }`
          : ""
      }
      
      ${
        CONFIG.currentTheme === "Neon Retro"
          ? `
      #wplace-image-bot-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 65, 0.03) 2px,
            rgba(0, 255, 65, 0.03) 4px
          );
        pointer-events: none;
        z-index: 1;
      }`
          : ""
      }
      
      #wplace-image-bot-container.wplace-dragging {
        transition: none;
        box-shadow: 0 12px 40px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.2);
        transform: scale(1.02);
        z-index: 9999;
      }
      #wplace-image-bot-container.wplace-minimized {
        width: 200px;
        height: auto;
      }
      #wplace-image-bot-container.wplace-compact {
        width: 240px;
      }
      
      /* Stats Container */
      #wplace-stats-container {
        position: fixed;
        top: 20px;
        left: 20px;
        width: ${CONFIG.currentTheme === "Neon Retro" ? "320px" : "280px"};
        max-height: calc(100vh - 40px);
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.primary} 0%, #1a1a1a 100%)`
            : theme.primary
        };
        border: ${theme.borderWidth} ${theme.borderStyle} ${CONFIG.currentTheme === "Classic Autobot" ? theme.accent : theme.text};
        border-radius: ${theme.borderRadius};
        padding: 0;
        box-shadow: ${theme.boxShadow};
        z-index: 10000;
        font-family: ${theme.fontFamily};
        color: ${theme.text};
        animation: slideIn 0.4s ease-out;
        overflow: hidden;
        ${theme.backdropFilter ? `backdrop-filter: ${theme.backdropFilter};` : ""}
        transition: all 0.3s ease;
        user-select: none;
        ${CONFIG.currentTheme === "Neon Retro" ? "image-rendering: pixelated;" : ""}
      }
      
      .wplace-header {
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "12px 15px" : "8px 12px"};
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.secondary} 0%, #2a2a2a 100%)`
            : theme.secondary
        };
        color: ${theme.highlight};
        font-size: ${CONFIG.currentTheme === "Neon Retro" ? "10px" : "13px"};
        font-weight: ${CONFIG.currentTheme === "Neon Retro" ? "normal" : "700"};
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
        border-bottom: ${CONFIG.currentTheme === "Neon Retro" ? "2px" : "1px"} solid ${CONFIG.currentTheme === "Classic Autobot" ? "rgba(255,255,255,0.1)" : theme.text};
        ${CONFIG.currentTheme === "Classic Autobot" ? "text-shadow: 0 1px 2px rgba(0,0,0,0.5);" : "text-transform: uppercase; letter-spacing: 1px;"}
        transition: background 0.2s ease;
        position: relative;
        z-index: 2;
        ${theme.animations.glow ? "animation: neonGlow 2s ease-in-out infinite alternate;" : ""}
      }
      
      .wplace-header-title {
        display: flex;
        align-items: center;
        gap: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "6px"};
      }
      
      .wplace-header-controls {
        display: flex;
        gap: ${CONFIG.currentTheme === "Neon Retro" ? "10px" : "6px"};
      }
      
      .wplace-header-btn {
        background: ${CONFIG.currentTheme === "Classic Autobot" ? "rgba(255,255,255,0.1)" : theme.accent};
        border: ${CONFIG.currentTheme === "Neon Retro" ? `2px solid ${theme.text}` : "none"};
        color: ${theme.text};
        cursor: pointer;
        border-radius: ${CONFIG.currentTheme === "Classic Autobot" ? "4px" : "0"};
        width: ${CONFIG.currentTheme === "Classic Autobot" ? "18px" : "auto"};
        height: ${CONFIG.currentTheme === "Classic Autobot" ? "18px" : "auto"};
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "4px 6px" : "0"};
        font-size: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "10px"};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-family: ${theme.fontFamily};
        ${CONFIG.currentTheme === "Neon Retro" ? "image-rendering: pixelated;" : ""}
      }
      .wplace-header-btn:hover {
        background: ${CONFIG.currentTheme === "Classic Autobot" ? theme.accent : theme.text};
        color: ${CONFIG.currentTheme === "Classic Autobot" ? theme.text : theme.primary};
        transform: ${CONFIG.currentTheme === "Classic Autobot" ? "scale(1.1)" : "none"};
        ${CONFIG.currentTheme === "Neon Retro" ? `box-shadow: 0 0 10px ${theme.text};` : ""}
      }
      
      .wplace-content {
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "15px" : "12px"};
        display: block;
        position: relative;
        z-index: 2;
      }
      .wplace-content.wplace-hidden {
        display: none;
      }
      
      .wplace-status-section {
        margin-bottom: 12px;
        padding: 8px;
        background: rgba(255,255,255,0.03);
        border-radius: ${theme.borderRadius};
        border: 1px solid rgba(255,255,255,0.1);
      }
      
      .wplace-section {
        margin-bottom: ${CONFIG.currentTheme === "Neon Retro" ? "15px" : "12px"};
        padding: 12px;
        background: rgba(255,255,255,0.03);
        border-radius: ${theme.borderRadius};
        border: 1px solid rgba(255,255,255,0.1);
      }
      
      .wplace-section-title {
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 8px;
        color: ${theme.highlight};
        display: flex;
        align-items: center;
        gap: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .wplace-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .wplace-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .wplace-row.single {
        grid-template-columns: 1fr;
      }
      
      .wplace-btn {
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "12px 8px" : "8px 12px"};
        border: ${CONFIG.currentTheme === "Neon Retro" ? "2px solid" : "none"};
        border-radius: ${theme.borderRadius};
        font-weight: ${CONFIG.currentTheme === "Neon Retro" ? "normal" : "500"};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "6px"};
        font-size: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "11px"};
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        font-family: ${theme.fontFamily};
        ${CONFIG.currentTheme === "Neon Retro" ? "text-transform: uppercase; letter-spacing: 1px; image-rendering: pixelated;" : ""}
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.accent} 0%, #4a4a4a 100%)`
            : theme.accent
        };
        ${CONFIG.currentTheme === "Classic Autobot" ? "border: 1px solid rgba(255,255,255,0.1);" : ""}
      }
      
      ${
        CONFIG.currentTheme === "Classic Autobot"
          ? `
      .wplace-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s ease;
      }
      .wplace-btn:hover:not(:disabled)::before {
        left: 100%;
      }`
          : `
      .wplace-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }
      .wplace-btn:hover::before {
        left: 100%;
      }`
      }
      
      .wplace-btn:hover:not(:disabled) {
        transform: ${CONFIG.currentTheme === "Classic Autobot" ? "translateY(-1px)" : "none"};
        box-shadow: ${
          CONFIG.currentTheme === "Classic Autobot" ? "0 4px 12px rgba(0,0,0,0.4)" : "0 0 15px currentColor"
        };
        ${theme.animations.pixelBlink ? "animation: pixelBlink 0.5s infinite;" : ""}
      }
      .wplace-btn:active:not(:disabled) {
        transform: translateY(0);
      }
      
      .wplace-btn-primary {
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.accent} 0%, #6a5acd 100%)`
            : theme.accent
        };
        color: ${theme.text};
        ${CONFIG.currentTheme === "Neon Retro" ? `border-color: ${theme.text};` : ""}
      }
      .wplace-btn-upload {
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.secondary} 0%, #4a4a4a 100%)`
            : theme.purple
        };
        color: ${theme.text};
        ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `border: 1px dashed ${theme.highlight};`
            : `border-color: ${theme.text}; border-style: dashed;`
        }
      }
      .wplace-btn-start {
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.success} 0%, #228b22 100%)`
            : theme.success
        };
        color: ${CONFIG.currentTheme === "Classic Autobot" ? "white" : theme.primary};
        ${CONFIG.currentTheme === "Neon Retro" ? `border-color: ${theme.success};` : ""}
      }
      .wplace-btn-stop {
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.error} 0%, #dc143c 100%)`
            : theme.error
        };
        color: ${CONFIG.currentTheme === "Classic Autobot" ? "white" : theme.text};
        ${CONFIG.currentTheme === "Neon Retro" ? `border-color: ${theme.error};` : ""}
      }
      .wplace-btn-select {
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.highlight} 0%, #9370db 100%)`
            : theme.highlight
        };
        color: ${CONFIG.currentTheme === "Classic Autobot" ? "white" : theme.primary};
        ${CONFIG.currentTheme === "Neon Retro" ? `border-color: ${theme.highlight};` : ""}
      }
      .wplace-btn-file {
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? "linear-gradient(135deg, #ff8c00 0%, #ff7f50 100%)"
            : theme.warning
        };
        color: ${CONFIG.currentTheme === "Classic Autobot" ? "white" : theme.primary};
        ${CONFIG.currentTheme === "Neon Retro" ? `border-color: ${theme.warning};` : ""}
      }
      .wplace-btn:disabled {
        opacity: ${CONFIG.currentTheme === "Classic Autobot" ? "0.5" : "0.3"};
        cursor: not-allowed;
        transform: none !important;
        ${theme.animations.pixelBlink ? "animation: none !important;" : ""}
        box-shadow: none !important;
      }
      .wplace-btn:disabled::before {
        display: none;
      }
      
      .wplace-stats {
        background: ${CONFIG.currentTheme === "Classic Autobot" ? "rgba(255,255,255,0.03)" : theme.secondary};
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "12px" : "8px"};
        border: ${CONFIG.currentTheme === "Neon Retro" ? `2px solid ${theme.text}` : "1px solid rgba(255,255,255,0.1)"};
        border-radius: ${theme.borderRadius};
        margin-bottom: ${CONFIG.currentTheme === "Neon Retro" ? "15px" : "8px"};
        ${CONFIG.currentTheme === "Neon Retro" ? "box-shadow: inset 0 0 10px rgba(0, 255, 65, 0.1);" : ""}
      }
      
      .wplace-stat-item {
        display: flex;
        justify-content: space-between;
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "6px 0" : "4px 0"};
        font-size: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "11px"};
        border-bottom: 1px solid rgba(255,255,255,0.05);
        ${CONFIG.currentTheme === "Neon Retro" ? "text-transform: uppercase; letter-spacing: 1px;" : ""}
      }
      .wplace-stat-item:last-child {
        border-bottom: none;
      }
      .wplace-stat-label {
        display: flex;
        align-items: center;
        gap: 6px;
        opacity: 0.9;
        font-size: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "10px"};
      }
      .wplace-stat-value {
        font-weight: 600;
        color: ${theme.highlight};
      }
      
      .wplace-progress {
        width: 100%;
        background: ${CONFIG.currentTheme === "Classic Autobot" ? "rgba(0,0,0,0.3)" : theme.secondary};
        border: ${CONFIG.currentTheme === "Neon Retro" ? `2px solid ${theme.text}` : "1px solid rgba(255,255,255,0.1)"};
        border-radius: ${theme.borderRadius};
        margin: ${CONFIG.currentTheme === "Neon Retro" ? "10px 0" : "8px 0"};
        overflow: hidden;
        height: ${CONFIG.currentTheme === "Neon Retro" ? "16px" : "6px"};
        position: relative;
      }
      
      ${
        CONFIG.currentTheme === "Neon Retro"
          ? `
      .wplace-progress::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 65, 0.1) 2px,
            rgba(0, 255, 65, 0.1) 4px
          );
        pointer-events: none;
      }`
          : ""
      }
      
      .wplace-progress-bar {
        height: ${CONFIG.currentTheme === "Neon Retro" ? "100%" : "6px"};
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.highlight} 0%, #9370db 100%)`
            : `linear-gradient(90deg, ${theme.success}, ${theme.neon})`
        };
        transition: width ${CONFIG.currentTheme === "Neon Retro" ? "0.3s" : "0.5s"} ease;
        position: relative;
        ${CONFIG.currentTheme === "Neon Retro" ? `box-shadow: 0 0 10px ${theme.success};` : ""}
      }
      
      ${
        CONFIG.currentTheme === "Classic Autobot"
          ? `
      .wplace-progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }`
          : `
      .wplace-progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 4px;
        height: 100%;
        background: ${theme.text};
        animation: pixelBlink 1s infinite;
      }`
      }
      
      .wplace-status {
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "10px" : "6px"};
        border: ${CONFIG.currentTheme === "Neon Retro" ? "2px solid" : "1px solid"};
        border-radius: ${theme.borderRadius};
        text-align: center;
        font-size: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "11px"};
        ${CONFIG.currentTheme === "Neon Retro" ? "text-transform: uppercase; letter-spacing: 1px;" : ""}
        position: relative;
        overflow: hidden;
      }
      
      .status-default {
        background: ${CONFIG.currentTheme === "Classic Autobot" ? "rgba(255,255,255,0.1)" : theme.accent};
        border-color: ${theme.text};
        color: ${theme.text};
      }
      .status-success {
        background: ${CONFIG.currentTheme === "Classic Autobot" ? "rgba(0, 255, 0, 0.1)" : theme.success};
        border-color: ${theme.success};
        color: ${CONFIG.currentTheme === "Classic Autobot" ? theme.success : theme.primary};
        box-shadow: 0 0 15px ${theme.success};
      }
      .status-error {
        background: ${CONFIG.currentTheme === "Classic Autobot" ? "rgba(255, 0, 0, 0.1)" : theme.error};
        border-color: ${theme.error};
        color: ${CONFIG.currentTheme === "Classic Autobot" ? theme.error : theme.text};
        box-shadow: 0 0 15px ${theme.error};
        ${theme.animations.pixelBlink ? "animation: pixelBlink 0.5s infinite;" : ""}
      }
      .status-warning {
        background: ${CONFIG.currentTheme === "Classic Autobot" ? "rgba(255, 165, 0, 0.1)" : theme.warning};
        border-color: ${theme.warning};
        color: ${CONFIG.currentTheme === "Classic Autobot" ? "orange" : theme.primary};
        box-shadow: 0 0 15px ${theme.warning};
      }
      
      .resize-container {
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${theme.primary};
        padding: 20px;
        border: ${theme.borderWidth} ${theme.borderStyle} ${theme.text};
        border-radius: ${theme.borderRadius};
        z-index: 10000;
        box-shadow: ${
          CONFIG.currentTheme === "Classic Autobot" ? "0 0 20px rgba(0,0,0,0.5)" : "0 0 30px rgba(0, 255, 65, 0.5)"
        };
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        font-family: ${theme.fontFamily};
      }
      
      .resize-preview {
        max-width: 100%;
        max-height: 300px;
        margin: 10px 0;
        border: ${
          CONFIG.currentTheme === "Classic Autobot" ? `1px solid ${theme.accent}` : `2px solid ${theme.accent}`
        };
        ${CONFIG.currentTheme === "Neon Retro" ? "image-rendering: pixelated;" : ""}
      }
      
      .resize-controls {
        display: flex;
        flex-direction: column;
        gap: ${CONFIG.currentTheme === "Neon Retro" ? "15px" : "10px"};
        margin-top: 15px;
      }
      
      .resize-controls label {
        font-size: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "12px"};
        ${CONFIG.currentTheme === "Neon Retro" ? "text-transform: uppercase; letter-spacing: 1px;" : ""}
        color: ${theme.text};
      }
      
      .resize-slider {
        width: 100%;
        height: ${CONFIG.currentTheme === "Neon Retro" ? "8px" : "4px"};
        background: ${CONFIG.currentTheme === "Classic Autobot" ? "#ccc" : theme.secondary};
        border: ${CONFIG.currentTheme === "Neon Retro" ? `2px solid ${theme.text}` : "none"};
        border-radius: ${theme.borderRadius};
        outline: none;
        -webkit-appearance: none;
      }
      
      ${
        CONFIG.currentTheme === "Neon Retro"
          ? `
      .resize-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        background: ${theme.highlight};
        border: 2px solid ${theme.text};
        border-radius: 0;
        cursor: pointer;
        box-shadow: 0 0 5px ${theme.highlight};
      }
      
      .resize-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: ${theme.highlight};
        border: 2px solid ${theme.text};
        border-radius: 0;
        cursor: pointer;
        box-shadow: 0 0 5px ${theme.highlight};
      }`
          : ""
      }
      
      .resize-buttons {
        display: flex;
        gap: 10px;
      }
      
      .resize-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: none;
      }
      
      ${
        CONFIG.currentTheme === "Neon Retro"
          ? `
      /* Retro checkbox styling */
      input[type="checkbox"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border: 2px solid ${theme.text};
        background: ${theme.secondary};
        margin-right: 8px;
        position: relative;
        cursor: pointer;
      }
      
      input[type="checkbox"]:checked {
        background: ${theme.success};
      }
      
      input[type="checkbox"]:checked::after {
        content: '✓';
        position: absolute;
        top: -2px;
        left: 1px;
        color: ${theme.primary};
        font-size: 12px;
        font-weight: bold;
      }
      
      /* Icon styling for retro feel */
      .fas, .fa {
        filter: drop-shadow(0 0 3px currentColor);
      }`
          : ""
      }
    `
    document.head.appendChild(style)

    const container = document.createElement("div")
    container.id = "wplace-image-bot-container"
    container.innerHTML = `
      <div class="wplace-header">
        <div class="wplace-header-title">
          <i class="fas fa-image"></i>
          <span>${Utils.t("title")}</span>
        </div>
        <div class="wplace-header-controls">
          <button id="themeBtn" class="wplace-header-btn" title="Switch Theme">
            <i class="fas fa-palette"></i>
          </button>
          <button id="statsBtn" class="wplace-header-btn" title="Show Stats">
            <i class="fas fa-chart-bar"></i>
          </button>
          <button id="compactBtn" class="wplace-header-btn" title="Compact Mode">
            <i class="fas fa-compress"></i>
          </button>
          <button id="minimizeBtn" class="wplace-header-btn" title="Minimize">
            <i class="fas fa-minus"></i>
          </button>
        </div>
      </div>
      <div class="wplace-content">
        <div class="wplace-status-section">
          <div id="statusText" class="wplace-status status-default">
            ${Utils.t("waitingInit")}
          </div>
          <div class="wplace-progress">
            <div id="progressBar" class="wplace-progress-bar" style="width: 0%"></div>
          </div>
        </div>

        <div class="wplace-section">
          <div class="wplace-section-title">🤖 Bot Setup</div>
          <div class="wplace-controls">
            <button id="initBotBtn" class="wplace-btn wplace-btn-primary">
              <i class="fas fa-robot"></i>
              <span>${Utils.t("initBot")}</span>
            </button>
          </div>
        </div>

        <div class="wplace-section">
          <div class="wplace-section-title">🖼️ Image Management</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="uploadBtn" class="wplace-btn wplace-btn-upload" disabled>
                <i class="fas fa-upload"></i>
                <span>${Utils.t("uploadImage")}</span>
              </button>
              <button id="resizeBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-expand"></i>
                <span>${Utils.t("resizeImage")}</span>
              </button>
            </div>
            <div class="wplace-row single">
              <button id="selectPosBtn" class="wplace-btn wplace-btn-select" disabled>
                <i class="fas fa-crosshairs"></i>
                <span>${Utils.t("selectPosition")}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="wplace-section">
          <div class="wplace-section-title">🎮 Painting Control</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="startBtn" class="wplace-btn wplace-btn-start" disabled>
                <i class="fas fa-play"></i>
                <span>${Utils.t("startPainting")}</span>
              </button>
              <button id="stopBtn" class="wplace-btn wplace-btn-stop" disabled>
                <i class="fas fa-stop"></i>
                <span>${Utils.t("stopPainting")}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="wplace-section">
          <div class="wplace-section-title">💾 Data Management</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="saveBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-save"></i>
                <span>${Utils.t("saveData")}</span>
              </button>
              <button id="loadBtn" class="wplace-btn wplace-btn-primary">
                <i class="fas fa-folder-open"></i>
                <span>${Utils.t("loadData")}</span>
              </button>
            </div>
            <div class="wplace-row">
              <button id="saveToFileBtn" class="wplace-btn wplace-btn-file" disabled>
                <i class="fas fa-download"></i>
                <span>${Utils.t("saveToFile")}</span>
              </button>
              <button id="loadFromFileBtn" class="wplace-btn wplace-btn-file">
                <i class="fas fa-upload"></i>
                <span>${Utils.t("loadFromFile")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Stats Window - Separate UI
    const statsContainer = document.createElement("div")
    statsContainer.id = "wplace-stats-container"
    statsContainer.style.display = "none"
    statsContainer.innerHTML = `
      <div class="wplace-header">
        <div class="wplace-header-title">
          <i class="fas fa-chart-bar"></i>
          <span>Painting Stats</span>
        </div>
        <div class="wplace-header-controls">
          <button id="closeStatsBtn" class="wplace-header-btn" title="Close Stats">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="wplace-content">
        <div class="wplace-stats">
          <div id="statsArea">
            <div class="wplace-stat-item">
              <div class="wplace-stat-label"><i class="fas fa-info-circle"></i> ${Utils.t("initMessage")}</div>
            </div>
          </div>
        </div>
      </div>
    `

    const resizeContainer = document.createElement("div")
    resizeContainer.className = "resize-container"
    resizeContainer.innerHTML = `
      <h3 style="margin-top: 0; color: ${theme.text}">${Utils.t("resizeImage")}</h3>
      <div class="resize-controls">
        <label style="color: ${theme.text}">
          Width: <span id="widthValue">0</span>px
          <input type="range" id="widthSlider" class="resize-slider" min="10" max="500" value="100">
        </label>
        <label style="color: ${theme.text}">
          Height: <span id="heightValue">0</span>px
          <input type="range" id="heightSlider" class="resize-slider" min="10" max="500" value="100">
        </label>
        <label style="color: ${theme.text}">
          <input type="checkbox" id="keepAspect" checked>
          Keep Aspect Ratio
        </label>
        <img id="resizePreview" class="resize-preview" src="">
        <div class="resize-buttons">
          <button id="confirmResize" class="wplace-btn wplace-btn-primary">
            <i class="fas fa-check"></i>
            <span>Apply</span>
          </button>
          <button id="cancelResize" class="wplace-btn wplace-btn-stop">
            <i class="fas fa-times"></i>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    `

    const resizeOverlay = document.createElement("div")
    resizeOverlay.className = "resize-overlay"

    document.body.appendChild(container)
    document.body.appendChild(resizeOverlay)
    document.body.appendChild(resizeContainer)
    document.body.appendChild(statsContainer)

    // Query all UI elements after appending to DOM
    const initBotBtn = container.querySelector("#initBotBtn")
    const uploadBtn = container.querySelector("#uploadBtn")
    const resizeBtn = container.querySelector("#resizeBtn")
    const selectPosBtn = container.querySelector("#selectPosBtn")
    const startBtn = container.querySelector("#startBtn")
    const stopBtn = container.querySelector("#stopBtn")
    const saveBtn = container.querySelector("#saveBtn")
    const loadBtn = container.querySelector("#loadBtn")
    const saveToFileBtn = container.querySelector("#saveToFileBtn")
    const loadFromFileBtn = container.querySelector("#loadFromFileBtn")
    const minimizeBtn = container.querySelector("#minimizeBtn")
    const compactBtn = container.querySelector("#compactBtn")
    const statsBtn = container.querySelector("#statsBtn")
    const statusText = container.querySelector("#statusText")
    const progressBar = container.querySelector("#progressBar")
    const statsArea = statsContainer.querySelector("#statsArea")
    const content = container.querySelector(".wplace-content")
    const closeStatsBtn = statsContainer.querySelector("#closeStatsBtn")

    // Check if all elements are found
    if (!initBotBtn || !uploadBtn || !selectPosBtn || !startBtn || !stopBtn) {
      console.error("Some UI elements not found:", {
        initBotBtn: !!initBotBtn,
        uploadBtn: !!uploadBtn,
        selectPosBtn: !!selectPosBtn,
        startBtn: !!startBtn,
        stopBtn: !!stopBtn,
      })
    }

    if (!statsContainer || !statsArea || !closeStatsBtn) {
      console.error("Stats UI elements not found:", {
        statsContainer: !!statsContainer,
        statsArea: !!statsArea,
        closeStatsBtn: !!closeStatsBtn,
      })
    }

    // A single, optimized function to make elements draggable
    function makeDraggable(element) {
      let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0
      // We'll store the panel's position in these variables to avoid re-reading from the DOM.
      let currentTop = 0,
        currentLeft = 0

      const header = element.querySelector(".wplace-header")
      if (header) {
        header.onmousedown = dragMouseDown
      }

      function dragMouseDown(e) {
        if (e.target.closest(".wplace-header-btn")) return

        e.preventDefault()
        // Get the starting position of the cursor
        pos3 = e.clientX
        pos4 = e.clientY

        // Get the panel's initial position just ONCE.
        currentTop = element.offsetTop
        currentLeft = element.offsetLeft

        element.classList.add("wplace-dragging")
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag

        document.body.style.userSelect = "none"
      }

      function elementDrag(e) {
        e.preventDefault()
        // Calculate the distance the mouse has moved since the last frame
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        // Update the last known mouse position
        pos3 = e.clientX
        pos4 = e.clientY

        // Calculate the panel's new position in memory (this is very fast)
        currentTop = currentTop - pos2
        currentLeft = currentLeft - pos1

        // Boundary checking to keep UI within viewport
        const maxTop = window.innerHeight - element.offsetHeight
        const maxLeft = window.innerWidth - element.offsetWidth
        currentTop = Math.max(0, Math.min(currentTop, maxTop))
        currentLeft = Math.max(0, Math.min(currentLeft, maxLeft))

        // Apply the new styles (only writing, not reading)
        element.style.top = currentTop + "px"
        element.style.left = currentLeft + "px"
      }

      function closeDragElement() {
        element.classList.remove("wplace-dragging")
        document.onmouseup = null
        document.onmousemove = null
        document.body.style.userSelect = ""
      }
    }

    // Make stats container draggable
    makeDraggable(statsContainer)

    // Make main container draggable
    makeDraggable(container)

    // Stats window functionality
    if (statsBtn && closeStatsBtn) {
      statsBtn.addEventListener("click", () => {
        const isVisible = statsContainer.style.display !== "none"
        if (isVisible) {
          statsContainer.style.display = "none"
          statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>'
          statsBtn.title = "Show Stats"
        } else {
          statsContainer.style.display = "block"
          statsBtn.innerHTML = '<i class="fas fa-chart-line"></i>'
          statsBtn.title = "Hide Stats"
        }
      })

      closeStatsBtn.addEventListener("click", () => {
        statsContainer.style.display = "none"
        statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>'
        statsBtn.title = "Show Stats"
      })
    }

    const widthSlider = resizeContainer.querySelector("#widthSlider")
    const heightSlider = resizeContainer.querySelector("#heightSlider")
    const widthValue = resizeContainer.querySelector("#widthValue")
    const heightValue = resizeContainer.querySelector("#heightValue")
    const keepAspect = resizeContainer.querySelector("#keepAspect")
    const resizePreview = resizeContainer.querySelector("#resizePreview")
    const confirmResize = resizeContainer.querySelector("#confirmResize")
    const cancelResize = resizeContainer.querySelector("#cancelResize")

    // Compact mode functionality
    if (compactBtn) {
      compactBtn.addEventListener("click", () => {
        container.classList.toggle("wplace-compact")
        const isCompact = container.classList.contains("wplace-compact")

        if (isCompact) {
          compactBtn.innerHTML = '<i class="fas fa-expand"></i>'
          compactBtn.title = "Expand Mode"
        } else {
          compactBtn.innerHTML = '<i class="fas fa-compress"></i>'
          compactBtn.title = "Compact Mode"
        }
      })
    }

    // Minimize functionality
    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => {
        state.minimized = !state.minimized
        if (state.minimized) {
          container.classList.add("wplace-minimized")
          content.classList.add("wplace-hidden")
          minimizeBtn.innerHTML = '<i class="fas fa-expand"></i>'
          minimizeBtn.title = "Restore"
        } else {
          container.classList.remove("wplace-minimized")
          content.classList.remove("wplace-hidden")
          minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>'
          minimizeBtn.title = "Minimize"
        }
      })
    }

    // Save progress functionality
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        if (!state.imageLoaded) {
          Utils.showAlert(Utils.t("missingRequirements"), "error")
          return
        }

        const success = Utils.saveProgress()
        if (success) {
          updateUI("autoSaved", "success")
          Utils.showAlert(Utils.t("autoSaved"), "success")
        } else {
          Utils.showAlert("Error saving progress", "error")
        }
      })
    }

    // Load progress functionality
    if (loadBtn) {
      loadBtn.addEventListener("click", () => {
        const savedData = Utils.loadProgress()
        if (!savedData) {
          updateUI("noSavedData", "warning")
          Utils.showAlert(Utils.t("noSavedData"), "warning")
          return
        }

        // Show confirmation dialog
        const confirmLoad = confirm(
          `${Utils.t("savedDataFound")}\n\n` +
            `Saved: ${new Date(savedData.timestamp).toLocaleString()}\n` +
            `Progress: ${savedData.state.paintedPixels}/${savedData.state.totalPixels} pixels`,
        )

        if (confirmLoad) {
          const success = Utils.restoreProgress(savedData)
          if (success) {
            updateUI("dataLoaded", "success")
            Utils.showAlert(Utils.t("dataLoaded"), "success")
            updateDataButtons()

            if (!state.colorsChecked) {
              initBotBtn.style.display = "block"
            }

            if (state.imageLoaded && state.startPosition && state.region && state.colorsChecked) {
              startBtn.disabled = false
            }
          } else {
            Utils.showAlert("Error loading progress", "error")
          }
        }
      })
    }

    // Save to file functionality
    if (saveToFileBtn) {
      saveToFileBtn.addEventListener("click", () => {
        const success = Utils.saveProgressToFile()
        if (success) {
          updateUI("fileSaved", "success")
          Utils.showAlert(Utils.t("fileSaved"), "success")
        } else {
          Utils.showAlert(Utils.t("fileError"), "error")
        }
      })
    }

    // Load from file functionality
    if (loadFromFileBtn) {
      loadFromFileBtn.addEventListener("click", async () => {
        try {
          const success = await Utils.loadProgressFromFile()
          if (success) {
            updateUI("fileLoaded", "success")
            Utils.showAlert(Utils.t("fileLoaded"), "success")
            updateDataButtons()

            // Auto-enable buttons after loading from file
            if (state.colorsChecked) {
              uploadBtn.disabled = false
              selectPosBtn.disabled = false
              resizeBtn.disabled = false
              initBotBtn.style.display = "none"
            } else {
              initBotBtn.style.display = "block"
            }

            if (state.imageLoaded && state.startPosition && state.region && state.colorsChecked) {
              startBtn.disabled = false
            }
          }
        } catch (error) {
          if (error.message === "Invalid JSON file") {
            Utils.showAlert(Utils.t("invalidFileFormat"), "error")
          } else {
            Utils.showAlert(Utils.t("fileError"), "error")
          }
        }
      })
    }

    updateUI = (messageKey, type = "default", params = {}) => {
      const message = Utils.t(messageKey, params)
      statusText.textContent = message
      statusText.className = `wplace-status status-${type}`
      statusText.style.animation = "none"
      void statusText.offsetWidth
      statusText.style.animation = "slideIn 0.3s ease-out"
    }

    updateStats = async () => {
      if (!state.colorsChecked || !state.imageLoaded) return

      const { charges, cooldown } = await WPlaceService.getCharges()
      state.currentCharges = Math.floor(charges)
      state.cooldown = cooldown

      const progress = state.totalPixels > 0 ? Math.round((state.paintedPixels / state.totalPixels) * 100) : 0
      const remainingPixels = state.totalPixels - state.paintedPixels

      state.estimatedTime = Utils.calculateEstimatedTime(remainingPixels, state.currentCharges, state.cooldown)

      progressBar.style.width = `${progress}%`

      statsArea.innerHTML = `
        <div class="wplace-stat-item">
          <div class="wplace-stat-label"><i class="fas fa-image"></i> ${Utils.t("progress")}</div>
          <div class="wplace-stat-value">${progress}%</div>
        </div>
        <div class="wplace-stat-item">
          <div class="wplace-stat-label"><i class="fas fa-paint-brush"></i> ${Utils.t("pixels")}</div>
          <div class="wplace-stat-value">${state.paintedPixels}/${state.totalPixels}</div>
        </div>
        <div class="wplace-stat-item">
          <div class="wplace-stat-label"><i class="fas fa-bolt"></i> ${Utils.t("charges")}</div>
          <div class="wplace-stat-value">${Math.floor(state.currentCharges)}</div>
        </div>
        ${
          state.imageLoaded
            ? `
        <div class="wplace-stat-item">
          <div class="wplace-stat-label"><i class="fas fa-clock"></i> ${Utils.t("estimatedTime")}</div>
          <div class="wplace-stat-value">${Utils.formatTime(state.estimatedTime)}</div>
        </div>
        `
            : ""
        }
      `
    }

    // Helper function to update data management buttons
    updateDataButtons = () => {
      const hasImageData = state.imageLoaded && state.imageData
      saveBtn.disabled = !hasImageData
      saveToFileBtn.disabled = !hasImageData
    }

    // Initialize data buttons state
    updateDataButtons()

    function showResizeDialog(processor) {
      const { width, height } = processor.getDimensions()
      const aspectRatio = width / height

      widthSlider.value = width
      heightSlider.value = height
      widthValue.textContent = width
      heightValue.textContent = height
      resizePreview.src = processor.img.src

      resizeOverlay.style.display = "block"
      resizeContainer.style.display = "block"

      const updatePreview = () => {
        const newWidth = Number.parseInt(widthSlider.value)
        const newHeight = Number.parseInt(heightSlider.value)

        widthValue.textContent = newWidth
        heightValue.textContent = newHeight

        resizePreview.src = processor.generatePreview(newWidth, newHeight)
      }

      widthSlider.oninput = () => {
        if (keepAspect.checked) {
          const newWidth = Number.parseInt(widthSlider.value)
          const newHeight = Math.round(newWidth / aspectRatio)
          heightSlider.value = newHeight
        }
        updatePreview()
      }

      heightSlider.oninput = () => {
        if (keepAspect.checked) {
          const newHeight = Number.parseInt(heightSlider.value)
          const newWidth = Math.round(newHeight * aspectRatio)
          widthSlider.value = newWidth
        }
        updatePreview()
      }

      confirmResize.onclick = () => {
        const newWidth = Number.parseInt(widthSlider.value)
        const newHeight = Number.parseInt(heightSlider.value)

        const newPixels = processor.resize(newWidth, newHeight)

        let totalValidPixels = 0
        for (let y = 0; y < newHeight; y++) {
          for (let x = 0; x < newWidth; x++) {
            const idx = (y * newWidth + x) * 4
            const r = newPixels[idx]
            const g = newPixels[idx + 1]
            const b = newPixels[idx + 2]
            const alpha = newPixels[idx + 3]

            if (alpha < CONFIG.TRANSPARENCY_THRESHOLD) continue
            if (Utils.isWhitePixel(r, g, b)) continue

            totalValidPixels++
          }
        }

        state.imageData.pixels = newPixels
        state.imageData.width = newWidth
        state.imageData.height = newHeight
        state.imageData.totalPixels = totalValidPixels
        state.totalPixels = totalValidPixels
        state.paintedPixels = 0

        updateStats()
        updateUI("resizeSuccess", "success", {
          width: newWidth,
          height: newHeight,
        })

        closeResizeDialog()
      }

      cancelResize.onclick = closeResizeDialog
    }

    function closeResizeDialog() {
      resizeOverlay.style.display = "none"
      resizeContainer.style.display = "none"
    }

    if (initBotBtn) {
      initBotBtn.addEventListener("click", async () => {
        try {
          updateUI("checkingColors", "default")

          state.availableColors = Utils.extractAvailableColors()

          if (state.availableColors.length === 0) {
            Utils.showAlert(Utils.t("noColorsFound"), "error")
            updateUI("noColorsFound", "error")
            return
          }

          state.colorsChecked = true
          uploadBtn.disabled = false
          selectPosBtn.disabled = false
          initBotBtn.style.display = "none"

          updateUI("colorsFound", "success", {
            count: state.availableColors.length,
          })
          updateStats()
        } catch (error) {
          updateUI("imageError", "error")
        }
      })
    }

    if (uploadBtn) {
      uploadBtn.addEventListener("click", async () => {
        try {
          updateUI("loadingImage", "default")
          const imageSrc = await Utils.createImageUploader()

          const processor = new ImageProcessor(imageSrc)
          await processor.load()

          const { width, height } = processor.getDimensions()
          const pixels = processor.getPixelData()

          let totalValidPixels = 0
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 4
              const r = pixels[idx]
              const g = pixels[idx + 1]
              const b = pixels[idx + 2]
              const alpha = pixels[idx + 3]

              if (alpha < CONFIG.TRANSPARENCY_THRESHOLD) continue
              if (Utils.isWhitePixel(r, g, b)) continue

              totalValidPixels++
            }
          }

          state.imageData = {
            width,
            height,
            pixels,
            totalPixels: totalValidPixels,
            processor,
          }

          state.totalPixels = totalValidPixels
          state.paintedPixels = 0
          state.imageLoaded = true
          state.lastPosition = { x: 0, y: 0 }

          resizeBtn.disabled = false
          saveBtn.disabled = false

          if (state.startPosition) {
            startBtn.disabled = false
          }

          updateStats()
          updateDataButtons()
          updateUI("imageLoaded", "success", { count: totalValidPixels })
        } catch (error) {
          updateUI("imageError", "error")
        }
      })
    }

    if (resizeBtn) {
      resizeBtn.addEventListener("click", () => {
        if (state.imageLoaded && state.imageData.processor) {
          showResizeDialog(state.imageData.processor)
        }
      })
    }

    if (selectPosBtn) {
      selectPosBtn.addEventListener("click", async () => {
        if (state.selectingPosition) return

        state.selectingPosition = true
        state.startPosition = null
        state.region = null
        startBtn.disabled = true

        Utils.showAlert(Utils.t("selectPositionAlert"), "info")
        updateUI("waitingPosition", "default")

        const originalFetch = window.fetch

        window.fetch = async (url, options) => {
          if (
            typeof url === "string" &&
            url.includes("https://backend.wplace.live/s0/pixel/") &&
            options?.method?.toUpperCase() === "POST"
          ) {
            try {
              const response = await originalFetch(url, options)
              const clonedResponse = response.clone()
              const data = await clonedResponse.json()

              if (data?.painted === 1) {
                const regionMatch = url.match(/\/pixel\/(\d+)\/(\d+)/)
                if (regionMatch && regionMatch.length >= 3) {
                  state.region = {
                    x: Number.parseInt(regionMatch[1]),
                    y: Number.parseInt(regionMatch[2]),
                  }
                }

                const payload = JSON.parse(options.body)
                if (payload?.coords && Array.isArray(payload.coords)) {
                  state.startPosition = {
                    x: payload.coords[0],
                    y: payload.coords[1],
                  }
                  state.lastPosition = { x: 0, y: 0 }

                  if (state.imageLoaded) {
                    startBtn.disabled = false
                  }

                  window.fetch = originalFetch
                  state.selectingPosition = false
                  updateUI("positionSet", "success")
                }
              }

              return response
            } catch (error) {
              return originalFetch(url, options)
            }
          }
          return originalFetch(url, options)
        }

        setTimeout(() => {
          if (state.selectingPosition) {
            window.fetch = originalFetch
            state.selectingPosition = false
            updateUI("positionTimeout", "error")
            Utils.showAlert(Utils.t("positionTimeout"), "error")
          }
        }, 120000)
      })
    }

    // Function to start painting (can be called programmatically)
    async function startPainting() {
      if (!state.imageLoaded || !state.startPosition || !state.region) {
        updateUI("missingRequirements", "error")
        return false
      }
      if (!capturedCaptchaToken) {
        updateUI("captchaNeeded", "error")
        Utils.showAlert(Utils.t("captchaNeeded"), "error")
        return false
      }

      state.running = true
      state.stopFlag = false
      startBtn.disabled = true
      stopBtn.disabled = false
      uploadBtn.disabled = true
      selectPosBtn.disabled = true
      resizeBtn.disabled = true
      saveBtn.disabled = true

      updateUI("startPaintingMsg", "success")

      try {
        await processImage()
        return true
      } catch (error) {
        updateUI("paintingError", "error")
        return false
      } finally {
        state.running = false
        stopBtn.disabled = true
        saveBtn.disabled = false

        if (!state.stopFlag) {
          startBtn.disabled = true
          uploadBtn.disabled = false
          selectPosBtn.disabled = false
          resizeBtn.disabled = false
        } else {
          startBtn.disabled = false
        }
      }
    }

    if (startBtn) {
      startBtn.addEventListener("click", startPainting)
    }

    if (stopBtn) {
      stopBtn.addEventListener("click", () => {
        state.stopFlag = true
        state.running = false
        stopBtn.disabled = true
        updateUI("paintingStopped", "warning")

        // Auto save when stopping
        if (state.imageLoaded && state.paintedPixels > 0) {
          Utils.saveProgress()
          Utils.showAlert(Utils.t("autoSaved"), "success")
        }
      })
    }

    // Check for saved progress on startup
    const checkSavedProgress = () => {
      const savedData = Utils.loadProgress()
      if (savedData && savedData.state.paintedPixels > 0) {
        const savedDate = new Date(savedData.timestamp).toLocaleString()
        const progress = Math.round((savedData.state.paintedPixels / savedData.state.totalPixels) * 100)

        Utils.showAlert(
          `${Utils.t("savedDataFound")}\n\n` +
            `Saved: ${savedDate}\n` +
            `Progress: ${savedData.state.paintedPixels}/${savedData.state.totalPixels} pixels (${progress}%)\n` +
            `${Utils.t("clickLoadToContinue")}`,
          "info",
        )
      }
    }

    // Check for saved progress after a short delay to let UI settle
    setTimeout(checkSavedProgress, 1000)

    const themeBtn = container.querySelector("#themeBtn")
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        createThemePopup()
      })
    }
  }
