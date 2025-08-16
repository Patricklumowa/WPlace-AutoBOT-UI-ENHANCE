;(async () => {
  // CONFIGURATION CONSTANTS
  const CONFIG = {
    COOLDOWN_DEFAULT: 31000,
    TRANSPARENCY_THRESHOLD: 100,
    WHITE_THRESHOLD: 250,
    LOG_INTERVAL: 10,
    PAINTING_SPEED: {
      MIN: 1,          // Minimum 1 pixel per second
      MAX: 1000,       // Maximum 1000 pixels per second
      DEFAULT: 5,      // Default 5 pixels per second
    },
    SKIP_CORRECT_PIXELS: true,  // Skip pixels that already have correct color
    // Optimized CSS Classes for reuse
    CSS_CLASSES: {
      BUTTON_PRIMARY: `
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white; border: none; border-radius: 8px; padding: 10px 16px;
        cursor: pointer; font-weight: 500; transition: all 0.3s ease;
        display: flex; align-items: center; gap: 8px;
      `,
      BUTTON_SECONDARY: `
        background: rgba(255,255,255,0.1); color: white; 
        border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; 
        padding: 8px 12px; cursor: pointer; transition: all 0.3s ease;
      `,
      MODERN_CARD: `
        background: rgba(255,255,255,0.1); border-radius: 12px; 
        padding: 18px; border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(5px);
      `,
      GRADIENT_TEXT: `
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text; font-weight: bold;
      `
    },
    THEMES: {  
      "Classic Autobot": {
        primary: "#000000",
        secondary: "#111111",
        accent: "#222222",
        text: "#ffffff",
        highlight: "#775ce3",
        success: "#00ff00",
        error: "#ff0000",
        warning: "#ffaa00",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        borderRadius: "12px",
        borderStyle: "solid",
        borderWidth: "1px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        animations: {
          glow: false,
          scanline: false,
          pixelBlink: false,
        },
      },
      "Neon Retro": {
        primary: "#1a1a2e",
        secondary: "#16213e",
        accent: "#0f3460",
        text: "#00ff41",
        highlight: "#ff6b35",
        success: "#39ff14",
        error: "#ff073a",
        warning: "#ffff00",
        neon: "#00ffff",
        purple: "#bf00ff",
        pink: "#ff1493",
        fontFamily: "'Press Start 2P', monospace",
        borderRadius: "0",
        borderStyle: "solid",
        borderWidth: "3px",
        boxShadow: "0 0 20px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1)",
        backdropFilter: "none",
        animations: {
          glow: true,
          scanline: true,
          pixelBlink: true,
        },
      },
    },
    currentTheme: "Classic Autobot",
  }

  const pallete = { "0,0,0": 1, "60,60,60": 2, "120,120,120": 3, "210,210,210": 4, "255,255,255": 5, "96,0,24": 6, "237,28,36": 7, "255,127,39": 8, "246,170,9": 9, "249,221,59": 10, "255,250,188": 11, "14,185,104": 12, "19,230,123": 13, "135,255,94": 14, "12,129,110": 15, "16,174,166": 16, "19,225,190": 17, "40,80,158": 18, "64,147,228": 19, "96,247,242": 20, "107,80,246": 21, "153,177,251": 22, "120,12,153": 23, "170,56,185": 24, "224,159,249": 25, "203,0,122": 26, "236,31,128": 27, "243,141,169": 28, "104,70,52": 29, "149,104,42": 30, "248,178,119": 31, "170,170,170": 32, "165,14,30": 33, "250,128,114": 34, "228,92,26": 35, "214,181,148": 36, "156,132,49": 37, "197,173,49": 38, "232,212,95": 39, "74,107,58": 40, "90,148,74": 41, "132,197,115": 42, "15,121,159": 43, "187,250,242": 44, "125,199,255": 45, "77,49,184": 46, "74,66,132": 47, "122,113,196": 48, "181,174,241": 49, "219,164,99": 50, "209,128,81": 51, "255,197,165": 52, "155,82,73": 53, "209,128,120": 54, "250,182,164": 55, "123,99,82": 56, "156,132,107": 57, "51,57,65": 58, "109,117,141": 59, "179,185,209": 60, "109,100,63": 61, "148,140,107": 62, "205,197,158": 63 };

  const getCurrentTheme = () => CONFIG.THEMES[CONFIG.currentTheme]

  const switchTheme = (themeName) => {
    if (CONFIG.THEMES[themeName]) {
      CONFIG.currentTheme = themeName
      saveThemePreference()

      // Remove existing theme styles
      const existingStyle = document.querySelector('style[data-wplace-theme="true"]')
      if (existingStyle) {
        existingStyle.remove()
      }

      // Recreate UI with new theme (cleanup is handled in createUI)
      createUI()
    }
  }

  const saveThemePreference = () => {
    try {
      localStorage.setItem("wplace-theme", CONFIG.currentTheme)
    } catch (e) {
      console.warn("Could not save theme preference:", e)
    }
  }

  const loadThemePreference = () => {
    try {
      const saved = localStorage.getItem("wplace-theme")
      if (saved && CONFIG.THEMES[saved]) {
        CONFIG.currentTheme = saved
      }
    } catch (e) {
      console.warn("Could not load theme preference:", e)
    }
  }

  const loadLanguagePreference = () => {
    try {
      const saved = localStorage.getItem("wplace_language")
      if (saved && TEXT[saved]) {
        state.language = saved
      }
    } catch (e) {
      console.warn("Could not load language preference:", e)
    }
  }

  const loadSkipPixelsPreference = () => {
    try {
      const saved = localStorage.getItem("wplace_skip_correct_pixels")
      if (saved !== null) {
        CONFIG.SKIP_CORRECT_PIXELS = saved === 'true'
      }
    } catch (e) {
      console.warn("Could not load skip correct pixels preference:", e)
    }
  }

  // BILINGUAL TEXT STRINGS
  const TEXT = {
    en: {
    title: "WPlace Auto-Image",
    initBot: "Start Auto-BOT",
    uploadImage: "Upload Image",
    resizeImage: "Resize Image",
    selectPosition: "Select Position",
    startPainting: "Start Painting",
    stopPainting: "Stop Painting",
    checkingColors: "🔍 Checking available colors...",
    noColorsFound: "❌ Open the color palette on the site and try again!",
    colorsFound: "✅ {count} available colors found",
    loadingImage: "🖼️ Loading image...",
    imageLoaded: "✅ Image loaded with {count} valid pixels",
    imageError: "❌ Error loading image",
    selectPositionAlert: "Paint the first pixel at the location where you want the art to start!",
    waitingPosition: "👆 Waiting for you to paint the reference pixel...",
    positionSet: "✅ Position set successfully!",
    positionTimeout: "❌ Timeout for position selection",
    startPaintingMsg: "🎨 Starting painting...",
    paintingProgress: "🧱 Progress: {painted}/{total} pixels...",
    noCharges: "⌛ No charges. Waiting {time}...",
    paintingStopped: "⏹️ Painting stopped by user",
    paintingComplete: "✅ Painting complete! {count} pixels painted.",
    paintingError: "❌ Error during painting",
    missingRequirements: "❌ Load an image and select a position first",
    progress: "Progress",
    pixels: "Pixels",
    painted: "Painted",
    charges: "Charges",
    estimatedTime: "Estimated time",
    initMessage: "Click 'Start Auto-BOT' to begin",
    waitingInit: "Waiting for initialization...",
    resizeSuccess: "✅ Image resized to {width}x{height}",
    paintingPaused: "⏸️ Painting paused at position X: {x}, Y: {y}",
    captchaNeeded: "❗ CAPTCHA token needed. Paint one pixel manually to continue,Then Open color palette again before start painting!.",
    saveData: "Save Progress",
    loadData: "Load Progress",
    saveToFile: "Save to File",
    loadFromFile: "Load from File",
    dataManager: "Data Manager",
    autoSaved: "✅ Progress saved automatically", 
    dataLoaded: "✅ Progress loaded successfully",
    fileSaved: "✅ Progress saved to file successfully",
    fileLoaded: "✅ Progress loaded from file successfully",
    noSavedData: "❌ No saved progress found",
    savedDataFound: "✅ Saved progress found! Load to continue?",
    savedDate: "Saved on: {date}",
    clickLoadToContinue: "Click 'Load Progress' to continue.",
    fileError: "❌ Error processing file",
    invalidFileFormat: "❌ Invalid file format",
    paintingSpeed: "Painting Speed",
    enableSpeedControl: "Enable Speed Control",
    pixelsPerSecond: "pixels/second",
    speedSetting: "Speed: {speed} pixels/sec",
    settings: "Settings",
    botSettings: "Bot Settings",
    close: "Close",
    language: "Language",
    themeSettings: "Theme Settings",
    themeSettingsDesc: "Choose your preferred color theme for the interface.",
    languageSelectDesc: "Select your preferred language. Changes will take effect immediately.",
    skipCorrectPixels: "Skip Correct Pixels",
    skipCorrectPixelsDesc: "Skip pixels that already have the correct color and count them as painted. Note: May not work due to canvas security restrictions.",
    pixelsSkipped: "Pixels skipped: {count}",
    speedSettingDesc: "Adjust the painting speed from {min} to {max} pixels per second. Higher speeds may result in longer update times on the WPlace server."
  },
  pt: {
    title: "WPlace Auto-Image",
    initBot: "Iniciar Auto-BOT",
    uploadImage: "Upload da Imagem",
    resizeImage: "Redimensionar Imagem",
    selectPosition: "Selecionar Posição",
    startPainting: "Iniciar Pintura",
    stopPainting: "Parar Pintura",
    checkingColors: "🔍 Verificando cores disponíveis...",
    noColorsFound: "❌ Abra a paleta de cores no site e tente novamente!",
    colorsFound: "✅ {count} cores disponíveis encontradas",
    loadingImage: "🖼️ Carregando imagem...",
    imageLoaded: "✅ Imagem carregada com {count} pixels válidos",
    imageError: "❌ Erro ao carregar imagem",
    selectPositionAlert: "Pinte o primeiro pixel na localização onde deseja que a arte comece!",
    waitingPosition: "👆 Aguardando você pintar o pixel de referência...",
    positionSet: "✅ Posição definida com sucesso!",
    positionTimeout: "❌ Tempo esgotado para selecionar posição",
    startPaintingMsg: "🎨 Iniciando pintura...",
    paintingProgress: "🧱 Progresso: {painted}/{total} pixels...",
    noCharges: "⌛ Sem cargas. Aguardando {time}...",
    paintingStopped: "⏹️ Pintura interrompida pelo usuário",
    paintingComplete: "✅ Pintura concluída! {count} pixels pintados.",
    paintingError: "❌ Erro durante a pintura",
    missingRequirements: "❌ Carregue uma imagem e selecione uma posição primeiro",
    progress: "Progresso",
    pixels: "Pixels",
    painted: "Pintados",
    charges: "Cargas",
    estimatedTime: "Tempo estimado",
    initMessage: "Clique em 'Iniciar Auto-BOT' para começar",
    waitingInit: "Aguardando inicialização...",
    resizeSuccess: "✅ Imagem redimensionada para {width}x{height}",
    paintingPaused: "⏸️ Pintura pausada na posição X: {x}, Y: {y}",
    captchaNeeded: "❗ Token CAPTCHA necessário. Pinte um pixel manualmente para continuar.",
    saveData: "Salvar Progresso",
    loadData: "Carregar Progresso",
    saveToFile: "Salvar em Arquivo",
    loadFromFile: "Carregar de Arquivo", 
    dataManager: "Dados",
    autoSaved: "✅ Progresso salvo automaticamente",
    dataLoaded: "✅ Progresso carregado com sucesso",
    fileSaved: "✅ Salvo em arquivo com sucesso",
    fileLoaded: "✅ Carregado de arquivo com sucesso",
    noSavedData: "❌ Nenhum progresso salvo encontrado",
    savedDataFound: "✅ Progresso salvo encontrado! Carregar para continuar?",
    savedDate: "Salvo em: {date}",
    clickLoadToContinue: "Clique em 'Carregar Progresso' para continuar.",
    fileError: "❌ Erro ao processar arquivo",
    invalidFileFormat: "❌ Formato de arquivo inválido",
    paintingSpeed: "Velocidade de Pintura",
    enableSpeedControl: "Ativar Controle de Velocidade",
    pixelsPerSecond: "pixels/segundo",
    speedSetting: "Velocidade: {speed} pixels/seg",
    settings: "Configurações",
    botSettings: "Configurações do Bot",
    close: "Fechar",
    language: "Idioma",
    themeSettings: "Configurações de Tema",
    themeSettingsDesc: "Escolha seu tema de cores preferido para a interface.",
    languageSelectDesc: "Selecione seu idioma preferido. As alterações terão efeito imediatamente.",
    skipCorrectPixels: "Pular Pixels Corretos",
    skipCorrectPixelsDesc: "Pular pixels que já têm a cor correta e contá-los como pintados. Nota: Pode não funcionar devido a restrições de segurança do canvas.",
    pixelsSkipped: "Pixels pulados: {count}",
    speedSettingDesc: "Ajuste a velocidade de pintura de {min} a {max} pixels por segundo. Velocidades mais altas podem resultar em tempos de atualização mais longos no servidor WPlace."
  },
  vi: {
    title: "WPlace Auto-Image",
    initBot: "Khởi động Auto-BOT",
    uploadImage: "Tải lên hình ảnh",
    resizeImage: "Thay đổi kích thước",
    selectPosition: "Chọn vị trí",
    startPainting: "Bắt đầu vẽ",
    stopPainting: "Dừng vẽ",
    checkingColors: "🔍 Đang kiểm tra màu sắc có sẵn...",
    noColorsFound: "❌ Hãy mở bảng màu trên trang web và thử lại!",
    colorsFound: "✅ Tìm thấy {count} màu sắc có sẵn",
    loadingImage: "🖼️ Đang tải hình ảnh...",
    imageLoaded: "✅ Đã tải hình ảnh với {count} pixel hợp lệ",
    imageError: "❌ Lỗi khi tải hình ảnh",
    selectPositionAlert: "Vẽ pixel đầu tiên tại vị trí bạn muốn tác phẩm nghệ thuật bắt đầu!",
    waitingPosition: "👆 Đang chờ bạn vẽ pixel tham chiếu...",
    positionSet: "✅ Đã đặt vị trí thành công!",
    positionTimeout: "❌ Hết thời gian chọn vị trí",
    startPaintingMsg: "🎨 Bắt đầu vẽ...",
    paintingProgress: "🧱 Tiến trình: {painted}/{total} pixel...",
    noCharges: "⌛ Không có điện tích. Đang chờ {time}...",
    paintingStopped: "⏹️ Người dùng đã dừng vẽ",
    paintingComplete: "✅ Hoàn thành vẽ! Đã vẽ {count} pixel.",
    paintingError: "❌ Lỗi trong quá trình vẽ",
    missingRequirements: "❌ Hãy tải lên hình ảnh và chọn vị trí trước",
    progress: "Tiến trình",
    pixels: "Pixel",
    painted: "Đã vẽ",
    charges: "Điện tích",
    estimatedTime: "Thời gian ước tính",
    initMessage: "Nhấp 'Khởi động Auto-BOT' để bắt đầu",
    waitingInit: "Đang chờ khởi tạo...",
    resizeSuccess: "✅ Đã thay đổi kích thước hình ảnh thành {width}x{height}",
    paintingPaused: "⏸️ Tạm dừng vẽ tại vị trí X: {x}, Y: {y}",
    captchaNeeded: "❗ Cần token CAPTCHA. Vẽ một pixel thủ công để tiếp tục.",
    saveData: "Lưu tiến trình",
    loadData: "Tải tiến trình",
    saveToFile: "Lưu vào tệp",
    loadFromFile: "Tải từ tệp",
    dataManager: "Dữ liệu",
    autoSaved: "✅ Đã tự động lưu tiến trình",
    dataLoaded: "✅ Đã tải tiến trình thành công",
    fileSaved: "✅ Đã lưu vào tệp thành công",
    fileLoaded: "✅ Đã tải từ tệp thành công",
    noSavedData: "❌ Không tìm thấy tiến trình đã lưu",
    savedDataFound: "✅ Tìm thấy tiến trình đã lưu! Tải để tiếp tục?",
    savedDate: "Đã lưu vào: {date}",
    clickLoadToContinue: "Nhấp 'Tải tiến trình' để tiếp tục.",
    fileError: "❌ Lỗi khi xử lý tệp",
    invalidFileFormat: "❌ Định dạng tệp không hợp lệ",
    paintingSpeed: "Tốc độ vẽ",
    enableSpeedControl: "Bật điều khiển tốc độ",
    pixelsPerSecond: "pixel/giây",
    speedSetting: "Tốc độ: {speed} pixel/giây",
    settings: "Cài đặt",
    botSettings: "Cài đặt Bot",
    close: "Đóng",
    language: "Ngôn ngữ",
    themeSettings: "Cài đặt Giao diện",
    themeSettingsDesc: "Chọn chủ đề màu sắc yêu thích cho giao diện.",
    languageSelectDesc: "Chọn ngôn ngữ ưa thích. Thay đổi sẽ có hiệu lực ngay lập tức.",
    skipCorrectPixels: "Bỏ qua Pixel đúng màu",
    skipCorrectPixelsDesc: "Bỏ qua các pixel đã có màu đúng và tính chúng là đã vẽ. Lưu ý: Có thể không hoạt động do hạn chế bảo mật canvas.",
    pixelsSkipped: "Pixel đã bỏ qua: {count}",
    speedSettingDesc: "Điều chỉnh tốc độ vẽ từ {min} đến {max} pixel mỗi giây. Tốc độ cao có thể làm trong wplace server update mất thời gian hơn."
    },
  fr: {
    title: "WPlace Auto-Image",
    initBot: "Démarrer Auto-BOT",
    uploadImage: "Télécharger l'image",
    resizeImage: "Redimensionner l'image",
    selectPosition: "Sélectionner la position",
    startPainting: "Commencer à peindre",
    stopPainting: "Arrêter de peindre",
    checkingColors: "🔍 Vérification des couleurs disponibles...",
    noColorsFound: "❌ Ouvrez la palette de couleurs sur le site et réessayez!",
    colorsFound: "✅ {count} couleurs disponibles trouvées",
    loadingImage: "🖼️ Chargement de l'image...",
    imageLoaded: "✅ Image chargée avec {count} pixels valides",
    imageError: "❌ Erreur lors du chargement de l'image",
    selectPositionAlert: "Peignez le premier pixel à l'endroit où vous voulez que l'art commence!",
    waitingPosition: "👆 En attente que vous peigniez le pixel de référence...",
    positionSet: "✅ Position définie avec succès!",
    positionTimeout: "❌ Délai d'attente pour la sélection de position",
    startPaintingMsg: "🎨 Début de la peinture...",
    paintingProgress: "🧱 Progrès: {painted}/{total} pixels...",
    noCharges: "⌛ Aucune charge. En attente {time}...",
    paintingStopped: "⏹️ Peinture arrêtée par l'utilisateur",
    paintingComplete: "✅ Peinture terminée! {count} pixels peints.",
    paintingError: "❌ Erreur pendant la peinture",
    missingRequirements: "❌ Veuillez charger une image et sélectionner une position d'abord",
    progress: "Progrès",
    pixels: "Pixels",
    painted: "Peints",
    charges: "Charges",
    estimatedTime: "Temps estimé",
    initMessage: "Cliquez sur 'Démarrer Auto-BOT' pour commencer",
    waitingInit: "En attente d'initialisation...",
    resizeSuccess: "✅ Image redimensionnée en {width}x{height}",
    paintingPaused: "⏸️ Peinture en pause à la position X: {x}, Y: {y}",
    captchaNeeded: "❗ Token CAPTCHA nécessaire. Peignez un pixel manuellement pour continuer.",
    saveData: "Sauvegarder le progrès",
    loadData: "Charger le progrès",
    saveToFile: "Sauvegarder dans un fichier",
    loadFromFile: "Charger depuis un fichier",
    dataManager: "Données",
    autoSaved: "✅ Progrès sauvegardé automatiquement",
    dataLoaded: "✅ Progrès chargé avec succès",
    fileSaved: "✅ Sauvegardé dans un fichier avec succès",
    fileLoaded: "✅ Chargé depuis un fichier avec succès",
    noSavedData: "❌ Aucun progrès sauvegardé trouvé",
    savedDataFound: "✅ Progrès sauvegardé trouvé! Charger pour continuer?",
    savedDate: "Sauvegardé le: {date}",
    clickLoadToContinue: "Cliquez sur 'Charger le progrès' pour continuer.",
    fileError: "❌ Erreur lors du traitement du fichier",
    invalidFileFormat: "❌ Format de fichier invalide",
    paintingSpeed: "Vitesse de peinture",
    enableSpeedControl: "Activer le contrôle de vitesse",
    pixelsPerSecond: "pixels/seconde",
    speedSetting: "Vitesse: {speed} pixels/sec",
    settings: "Paramètres",
    botSettings: "Paramètres du Bot",
    close: "Fermer",
    language: "Langue",
    themeSettings: "Paramètres de Thème",
    themeSettingsDesc: "Choisissez votre thème de couleurs préféré pour l'interface.",
    languageSelectDesc: "Sélectionnez votre langue préférée. Les changements prendront effet immédiatement.",
    skipCorrectPixels: "Ignorer les Pixels Corrects",
    skipCorrectPixelsDesc: "Ignorer les pixels qui ont déjà la bonne couleur et les compter comme peints. Note: Peut ne pas fonctionner en raison de restrictions de sécurité du canvas.",
    pixelsSkipped: "Pixels ignorés: {count}",
    speedSettingDesc: "Ajustez la vitesse de peinture de {min} à {max} pixels par seconde. Des vitesses plus élevées peuvent entraîner des temps de mise à jour plus longs sur le serveur WPlace."
    },
  }

  // GLOBAL STATE
  const state = {
    running: false,
    imageLoaded: false,
    processing: false,
    totalPixels: 0,
    paintedPixels: 0,
    skippedPixels: 0,  // Track skipped pixels
    availableColors: [],
    currentCharges: 0,
    cooldown: CONFIG.COOLDOWN_DEFAULT,
    imageData: null,
    originalImageSrc: null,
    stopFlag: false,
    colorsChecked: false,
    startPosition: null,
    selectingPosition: false,
    region: null,
    minimized: false,
    lastPosition: { x: 0, y: 0 },
    estimatedTime: 0,
    language: "en",
    paintingSpeed: CONFIG.PAINTING_SPEED.DEFAULT, // pixels per second
    colorPaletteLimiterEnabled: false,
    limitedColorPalette: [],
  }

  // Global variable to store the captured CAPTCHA token.
  let capturedCaptchaToken = null

  // Intercept the original window.fetch function to "listen" for network requests.
  const originalFetch = window.fetch
  window.fetch = async (url, options) => {
    // Check if the request is for painting a pixel on wplace.
    if (typeof url === "string" && url.includes("https://backend.wplace.live/s0/pixel/")) {
      try {
        const payload = JSON.parse(options.body)
        // If the request body contains the 't' field, it's our CAPTCHA token.
        if (payload.t) {
          console.log("✅ CAPTCHA Token Captured:", payload.t)
          // Store the token for our bot to use.
          capturedCaptchaToken = payload.t

          // Notify the user that the token is captured and they can start the bot.
          if (document.querySelector("#statusText")?.textContent.includes("CAPTCHA")) {
            Utils.showAlert("Token captured successfully! Make sure you open the COLOR PALETTE FIRST before start painting.", "success")
            updateUI("colorsFound", "success", {
              count: state.availableColors.length,
            })
          }
        }
      } catch (e) {
        /* Ignore errors if the request body isn't valid JSON */
      }
    }
    // Finally, execute the original request, whether we inspected it or not.
    return originalFetch(url, options)
  }

  // LANGUAGE DETECTION
  async function detectLanguage() {
    try {
      const response = await fetch("https://backend.wplace.live/me", {
        credentials: "include",
      })
      const data = await response.json()
      state.language = data.language === "pt" ? "pt" : "en"
    } catch {
      state.language = navigator.language.startsWith("pt") ? "pt" : "en"
    }
  }

  // UTILITY FUNCTIONS
  const Utils = {
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),

    // Optimized DOM creation helpers
    createElement: (tag, props = {}, children = []) => {
      const element = document.createElement(tag)
      
      // Set properties efficiently
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value)
        } else if (key === 'className') {
          element.className = value
        } else if (key === 'innerHTML') {
          element.innerHTML = value
        } else {
          element.setAttribute(key, value)
        }
      })
      
      // Append children efficiently
      if (typeof children === 'string') {
        element.textContent = children
      } else if (Array.isArray(children)) {
        children.forEach(child => {
          if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child))
          } else {
            element.appendChild(child)
          }
        })
      }
      
      return element
    },

    // Create button with common styling
    createButton: (id, text, icon, onClick, style = CONFIG.CSS_CLASSES.BUTTON_PRIMARY) => {
      const button = Utils.createElement('button', {
        id: id,
        style: style,
        innerHTML: `${icon ? `<i class="${icon}"></i>` : ''}<span>${text}</span>`
      })
      if (onClick) button.addEventListener('click', onClick)
      return button
    },

    t: (key, params = {}) => {
      let text = TEXT[state.language]?.[key] || TEXT.en[key] || key
      Object.keys(params).forEach((param) => {
        text = text.replace(`{${param}}`, params[param])
      })
      return text
    },

    showAlert: (message, type = "info") => {
      const alertDiv = document.createElement("div")
      alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10001;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease-out;
        font-family: 'Segoe UI', sans-serif;
      `

      const colors = {
        info: "background: linear-gradient(135deg, #3498db, #2980b9);",
        success: "background: linear-gradient(135deg, #27ae60, #229954);",
        warning: "background: linear-gradient(135deg, #f39c12, #e67e22);",
        error: "background: linear-gradient(135deg, #e74c3c, #c0392b);",
      }

      alertDiv.style.cssText += colors[type] || colors.info

      const style = document.createElement("style")
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)

      alertDiv.textContent = message
      document.body.appendChild(alertDiv)

      setTimeout(() => {
        alertDiv.style.animation = "slideDown 0.3s ease-out reverse"
        setTimeout(() => {
          document.body.removeChild(alertDiv)
          document.head.removeChild(style)
        }, 300)
      }, 4000)
    },

    colorDistance: (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2)),

    // Debug function to test canvas access
    testCanvasAccess: () => {
      console.log("=== Canvas Access Debug ===")
      
      const canvases = document.querySelectorAll('canvas')
      console.log(`Found ${canvases.length} canvas elements`)
      
      canvases.forEach((canvas, index) => {
        console.log(`Canvas ${index}:`, {
          width: canvas.width,
          height: canvas.height,
          id: canvas.id,
          className: canvas.className,
          style: canvas.style.cssText
        })
        
        try {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            // Try to read a pixel from center
            const x = Math.floor(canvas.width / 2)
            const y = Math.floor(canvas.height / 2)
            const imageData = ctx.getImageData(x, y, 1, 1)
            const data = imageData.data
            console.log(`  Pixel at (${x},${y}): RGB(${data[0]}, ${data[1]}, ${data[2]})`)
          }
        } catch (error) {
          console.log(`  Error reading canvas ${index}:`, error.message)
        }
      })
      
      console.log("=== End Debug ===")
    },

    // Simplified canvas pixel reading for WPlace
    getWPlacePixelColor: (x, y) => {
      try {
        console.log(`Attempting to read pixel at (${x},${y})...`)
        
        // Find the main WPlace canvas - try different approaches
        let canvas = null
        
        // Method 1: Look for canvas in main container
        const containers = ['#app', '[data-testid="canvas-container"]', '.canvas-container', 'main', 'body']
        for (const selector of containers) {
          const container = document.querySelector(selector)
          if (container) {
            const foundCanvas = container.querySelector('canvas')
            if (foundCanvas && foundCanvas.width > 100 && foundCanvas.height > 100) {
              canvas = foundCanvas
              console.log(`Found canvas via container ${selector}: ${canvas.width}x${canvas.height}`)
              break
            }
          }
        }
        
        // Method 2: Direct canvas selectors
        if (!canvas) {
          const selectors = [
            'canvas[width][height]',
            'canvas.pixelcanvas', 
            'canvas.canvas',
            'canvas[data-testid="canvas"]',
            'canvas'
          ]
          
          for (const selector of selectors) {
            const canvases = document.querySelectorAll(selector)
            for (const c of canvases) {
              // Check if canvas has reasonable dimensions and is visible
              if (c.width > 100 && c.height > 100 && 
                  c.offsetWidth > 0 && c.offsetHeight > 0) {
                canvas = c
                console.log(`Found canvas via selector ${selector}: ${canvas.width}x${canvas.height}`)
                break
              }
            }
            if (canvas) break
          }
        }
        
        // Method 3: Find the largest canvas
        if (!canvas) {
          const allCanvases = document.querySelectorAll('canvas')
          let largest = null
          let maxSize = 0
          
          for (const c of allCanvases) {
            const size = c.width * c.height
            if (size > maxSize && c.offsetWidth > 0 && c.offsetHeight > 0) {
              maxSize = size
              largest = c
            }
          }
          
          if (largest) {
            canvas = largest
            console.log(`Found largest canvas: ${canvas.width}x${canvas.height}`)
          }
        }
        
        if (!canvas) {
          console.warn("No suitable canvas found")
          return null
        }
        
        // Check if coordinates are within canvas bounds
        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
          console.warn(`Coordinates (${x},${y}) outside canvas bounds ${canvas.width}x${canvas.height}`)
          return null
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.warn("Could not get canvas context")
          return null
        }
        
        // Get pixel data
        const imageData = ctx.getImageData(x, y, 1, 1)
        const data = imageData.data
        
        const color = [data[0], data[1], data[2]]
        console.log(`Successfully read pixel at (${x},${y}): RGB(${color.join(',')})`)
        return color
        
      } catch (error) {
        console.warn(`Failed to read pixel at (${x},${y}):`, error.message)
        return null
      }
    },

    // Check if current pixel matches target color
    pixelMatches: (currentColor, targetColor, tolerance = 10) => {
      if (!currentColor || !targetColor) return false
      
      const [cr, cg, cb] = currentColor
      const [tr, tg, tb] = targetColor
      
      const distance = Math.sqrt(
        Math.pow(cr - tr, 2) + 
        Math.pow(cg - tg, 2) + 
        Math.pow(cb - tb, 2)
      )
      
      return distance <= tolerance
    },

    isWhitePixel: (r, g, b) =>
      r >= CONFIG.WHITE_THRESHOLD && g >= CONFIG.WHITE_THRESHOLD && b >= CONFIG.WHITE_THRESHOLD,

    createImageUploader: () =>
      new Promise((resolve) => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "image/png,image/jpeg"
        input.onchange = () => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result)
          fr.readAsDataURL(input.files[0])
        }
        input.click()
      }),

    createFileDownloader: (data, filename) => {
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    createFileUploader: () =>
      new Promise((resolve, reject) => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".json"
        input.onchange = (e) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = () => {
              try {
                const data = JSON.parse(reader.result)
                resolve(data)
              } catch (error) {
                reject(new Error("Invalid JSON file"))
              }
            }
            reader.onerror = () => reject(new Error("File reading error"))
            reader.readAsText(file)
          } else {
            reject(new Error("No file selected"))
          }
        }
        input.click()
      }),

    extractAvailableColors: () => {
      const colorElements = document.querySelectorAll('[id^="color-"]')
      return Array.from(colorElements)
        .filter((el) => !el.querySelector("svg"))
        .filter((el) => {
          const id = Number.parseInt(el.id.replace("color-", ""))
          return id !== 0 && id !== 5
        })
        .map((el) => {
          const id = Number.parseInt(el.id.replace("color-", ""))
          const rgbStr = el.style.backgroundColor.match(/\d+/g)
          const rgb = rgbStr ? rgbStr.map(Number) : [0, 0, 0]
          return { id, rgb }
        })
    },

    formatTime: (ms) => {
      const seconds = Math.floor((ms / 1000) % 60)
      const minutes = Math.floor((ms / (1000 * 60)) % 60)
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
      const days = Math.floor(ms / (1000 * 60 * 60 * 24))

      let result = ""
      if (days > 0) result += `${days}d `
      if (hours > 0 || days > 0) result += `${hours}h `
      if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `
      result += `${seconds}s`

      return result
    },

    calculateEstimatedTime: (remainingPixels, charges, cooldown) => {
      if (remainingPixels <= 0) return 0
      
      // Calculate time based on painting speed (pixels per second)
      const paintingSpeedDelay = state.paintingSpeed > 0 ? (1000 / state.paintingSpeed) : 1000
      const timeFromSpeed = remainingPixels * paintingSpeedDelay // ms
      
      // Calculate time based on charges and cooldown
      const cyclesNeeded = Math.ceil(remainingPixels / Math.max(charges, 1))
      const timeFromCharges = cyclesNeeded * cooldown // ms
      
      // Return the maximum of both calculations (the limiting factor)
      return Math.max(timeFromSpeed, timeFromCharges)
    },

    // Save/Load Progress Functions
    saveProgress: () => {
      try {
        const progressData = {
          timestamp: Date.now(),
          state: {
            totalPixels: state.totalPixels,
            paintedPixels: state.paintedPixels,
            lastPosition: state.lastPosition,
            startPosition: state.startPosition,
            region: state.region,
            imageLoaded: state.imageLoaded,
            colorsChecked: state.colorsChecked,
            availableColors: state.availableColors,
          },
          imageData: state.imageData
            ? {
                width: state.imageData.width,
                height: state.imageData.height,
                pixels: Array.from(state.imageData.pixels),
                totalPixels: state.imageData.totalPixels,
              }
            : null,
          paintedMap: state.paintedMap ? state.paintedMap.map((row) => Array.from(row)) : null,
        }

        localStorage.setItem("wplace-bot-progress", JSON.stringify(progressData))
        return true
      } catch (error) {
        console.error("Error saving progress:", error)
        return false
      }
    },

    loadProgress: () => {
      try {
        const saved = localStorage.getItem("wplace-bot-progress")
        return saved ? JSON.parse(saved) : null
      } catch (error) {
        console.error("Error loading progress:", error)
        return null
      }
    },

    clearProgress: () => {
      try {
        localStorage.removeItem("wplace-bot-progress")
        return true
      } catch (error) {
        console.error("Error clearing progress:", error)
        return false
      }
    },

    restoreProgress: (savedData) => {
      try {
        // Restore state
        Object.assign(state, savedData.state)

        // Restore image data
        if (savedData.imageData) {
          state.imageData = {
            ...savedData.imageData,
            pixels: new Uint8ClampedArray(savedData.imageData.pixels),
          }
        }

        // Restore painted map
        if (savedData.paintedMap) {
          state.paintedMap = savedData.paintedMap.map((row) => Array.from(row))
        }

        return true
      } catch (error) {
        console.error("Error restoring progress:", error)
        return false
      }
    },

    saveProgressToFile: () => {
      try {
        const progressData = {
          timestamp: Date.now(),
          version: "1.0",
          state: {
            totalPixels: state.totalPixels,
            paintedPixels: state.paintedPixels,
            lastPosition: state.lastPosition,
            startPosition: state.startPosition,
            region: state.region,
            imageLoaded: state.imageLoaded,
            colorsChecked: state.colorsChecked,
            availableColors: state.availableColors,
          },
          imageData: state.imageData
            ? {
                width: state.imageData.width,
                height: state.imageData.height,
                pixels: Array.from(state.imageData.pixels),
                totalPixels: state.imageData.totalPixels,
              }
            : null,
          paintedMap: state.paintedMap ? state.paintedMap.map((row) => Array.from(row)) : null,
        }

        const filename = `wplace-bot-progress-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`
        Utils.createFileDownloader(JSON.stringify(progressData, null, 2), filename)
        return true
      } catch (error) {
        console.error("Error saving to file:", error)
        return false
      }
    },

    loadProgressFromFile: async () => {
      try {
        const data = await Utils.createFileUploader()

        if (!data.version || !data.state) {
          throw new Error("Invalid file format")
        }

        const success = Utils.restoreProgress(data)
        return success
      } catch (error) {
        console.error("Error loading from file:", error)
        throw error
      }
    },
  }

  // IMAGE PROCESSOR CLASS
  class ImageProcessor {
    constructor(imageSrc) {
      this.imageSrc = imageSrc
      this.img = null
      this.canvas = null
      this.ctx = null
    }

    async load() {
      return new Promise((resolve, reject) => {
        this.img = new Image()
        this.img.crossOrigin = "anonymous"
        this.img.onload = () => {
          this.canvas = document.createElement("canvas")
          this.ctx = this.canvas.getContext("2d")
          this.canvas.width = this.img.width
          this.canvas.height = this.img.height
          this.ctx.drawImage(this.img, 0, 0)
          resolve()
        }
        this.img.onerror = reject
        this.img.src = this.imageSrc
      })
    }

    getDimensions() {
      return {
        width: this.canvas.width,
        height: this.canvas.height,
      }
    }

    getPixelData() {
      return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data
    }

    resize(newWidth, newHeight) {
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")

      tempCanvas.width = newWidth
      tempCanvas.height = newHeight

      tempCtx.imageSmoothingEnabled = false
      tempCtx.drawImage(this.canvas, 0, 0, newWidth, newHeight)

      this.canvas.width = newWidth
      this.canvas.height = newHeight
      this.ctx.imageSmoothingEnabled = false
      this.ctx.drawImage(tempCanvas, 0, 0)

      return this.ctx.getImageData(0, 0, newWidth, newHeight).data
    }

    generatePreview(width, height) {
      const previewCanvas = document.createElement("canvas")
      const previewCtx = previewCanvas.getContext("2d")

      previewCanvas.width = width
      previewCanvas.height = height

      previewCtx.imageSmoothingEnabled = false
      previewCtx.drawImage(this.img, 0, 0, width, height)

      return previewCanvas.toDataURL()
    }
  }

  // WPLACE API SERVICE
  const WPlaceService = {
    async paintPixelInRegion(regionX, regionY, pixelX, pixelY, color) {
      try {
        // Construct the payload including the captured 't' token.
        const payload = {
          coords: [pixelX, pixelY],
          colors: [color],
          t: capturedCaptchaToken,
        }
        const res = await fetch(`https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          credentials: "include",
          body: JSON.stringify(payload),
        })

        // If we get a 403 Forbidden error, our token is likely expired.
        if (res.status === 403) {
          console.error("❌ 403 Forbidden. CAPTCHA token might be invalid or expired.")
          capturedCaptchaToken = null // Invalidate our stored token.
          return "token_error" // Return a special status to stop the bot.
        }

        const data = await res.json()
        return data?.painted === 1
      } catch (e) {
        console.error("Paint request failed:", e)
        return false
      }
    },

    async getCharges() {
      try {
        const res = await fetch("https://backend.wplace.live/me", {
          credentials: "include",
        })
        const data = await res.json()
        return {
          charges: data.charges?.count || 0,
          cooldown: data.charges?.next || CONFIG.COOLDOWN_DEFAULT,
        }
      } catch (e) {
        console.error("Failed to get charges:", e)
        return {
          charges: 0,
          cooldown: CONFIG.COOLDOWN_DEFAULT,
        }
      }
    },
  }

  // COLOR MATCHING FUNCTION - Optimized with caching
  const colorCache = new Map()
  
  function findClosestColor(targetRgb, availableColors) {
    // Create cache key from RGB values
    const cacheKey = `${targetRgb[0]},${targetRgb[1]},${targetRgb[2]}`
    
    // Check cache first
    if (colorCache.has(cacheKey)) {
      return colorCache.get(cacheKey)
    }

    let colorsToUse = availableColors
    if (state.colorPaletteLimiterEnabled && state.limitedColorPalette.length > 0) {
      colorsToUse = availableColors.filter((color) => state.limitedColorPalette.includes(color.id))
    }

    let minDistance = Number.POSITIVE_INFINITY
    let closestColorId = colorsToUse[0]?.id || 1

    // Use optimized loop for better performance
    for (let i = 0; i < colorsToUse.length; i++) {
      const color = colorsToUse[i]
      const distance = Utils.colorDistance(targetRgb, color.rgb)
      if (distance < minDistance) {
        minDistance = distance
        closestColorId = color.id
        
        // If perfect match, break early
        if (distance === 0) break
      }
    }

    // Cache the result for future use
    colorCache.set(cacheKey, closestColorId)
    
    // Limit cache size to prevent memory leaks
    if (colorCache.size > 10000) {
      const firstKey = colorCache.keys().next().value
      colorCache.delete(firstKey)
    }

    return closestColorId
  }

  // --- Color Converter ---
  const colorConverter = {
    // Convert RGB to HSL
    rgbToHsl: (r, g, b) => {
      r /= 255, g /= 255, b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    },

    // Convert HSL to RGB
    hslToRgb: (h, s, l) => {
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;

      if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
      } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
      }
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      return { r, g, b };
    },

    // Apply color transformations to the canvas
    applyColorTransform: (transformType, value) => {
        if (!state.imageData) return;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = state.imageData.width;
        tempCanvas.height = state.imageData.height;

        const originalImageData = new ImageData(
            new Uint8ClampedArray(state.imageData.pixels),
            state.imageData.width,
            state.imageData.height
        );
        tempCtx.putImageData(originalImageData, 0, 0);


        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];

            switch (transformType) {
                case 'grayscale':
                    const avg = (r + g + b) / 3;
                    data[i] = data[i+1] = data[i+2] = avg;
                    break;
                case 'sepia':
                    data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                    data[i+1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                    data[i+2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
                    break;
                case 'invert':
                    data[i] = 255 - r;
                    data[i+1] = 255 - g;
                    data[i+2] = 255 - b;
                    break;
                case 'brightness':
                    const brightness = parseInt(value, 10);
                    data[i] = Math.max(0, Math.min(255, r + brightness));
                    data[i+1] = Math.max(0, Math.min(255, g + brightness));
                    data[i+2] = Math.max(0, Math.min(255, b + brightness));
                    break;
                case 'contrast':
                    const contrast = parseInt(value, 10);
                    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                    data[i] = Math.max(0, Math.min(255, factor * (r - 128) + 128));
                    data[i+1] = Math.max(0, Math.min(255, factor * (g - 128) + 128));
                    data[i+2] = Math.max(0, Math.min(255, factor * (b - 128) + 128));
                    break;
                case 'hue':
                    const hue = parseInt(value, 10);
                    let hsl = colorConverter.rgbToHsl(r, g, b);
                    hsl.h = (hsl.h + hue) % 360;
                    const { r: newR, g: newG, b: newB } = colorConverter.hslToRgb(hsl.h, hsl.s, hsl.l);
                    data[i] = newR;
                    data[i+1] = newG;
                    data[i+2] = newB;
                    break;
            }
        }
        state.imageData.pixels.set(data);
        updateResizePreview();
    }
  };

  // UI UPDATE FUNCTIONS (declared early to avoid reference errors)
  let updateUI = () => {}
  let updateStats = () => {}
  let updateDataButtons = () => {}

  function updateResizePreview() {
    const previewCanvas = document.querySelector('.resize-preview');
    const previewCtx = previewCanvas.getContext('2d');
    const imageData = new ImageData(state.imageData.pixels, state.imageData.width, state.imageData.height);
    previewCanvas.width = state.imageData.width;
    previewCanvas.height = state.imageData.height;
    previewCtx.putImageData(imageData, 0, 0);
  }

  async function createUI() {
    await detectLanguage()

    // Clean up existing UI elements to prevent duplicates
    const existingContainer = document.getElementById("wplace-image-bot-container")
    const existingStats = document.getElementById("wplace-stats-container")
    const existingSettings = document.getElementById("wplace-settings-container")
    const existingResizeContainer = document.querySelector(".resize-container")
    const existingResizeOverlay = document.querySelector(".resize-overlay")
    
    if (existingContainer) existingContainer.remove()
    if (existingStats) existingStats.remove()
    if (existingSettings) existingSettings.remove()
    if (existingResizeContainer) existingResizeContainer.remove()
    if (existingResizeOverlay) existingResizeOverlay.remove()

    loadThemePreference()
    loadLanguagePreference()
    loadSkipPixelsPreference()

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
        width: ${CONFIG.currentTheme === "Neon Retro" ? "280px" : "280px"};
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
        display: flex;
        flex-direction: column;
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
      #wplace-stats-container.wplace-dragging {
        transition: none !important;
      }
      #wplace-settings-container.wplace-dragging {
        transition: none !important;
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
        width: ${CONFIG.currentTheme === "Neon Retro" ? "280px" : "280px"};
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
        z-index: 9997;
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
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "8px 12px" : "8px 12px"};
        background: ${
          CONFIG.currentTheme === "Classic Autobot"
            ? `linear-gradient(135deg, ${theme.secondary} 0%, #2a2a2a 100%)`
            : theme.secondary
        };
        color: ${theme.highlight};
        font-size: ${CONFIG.currentTheme === "Neon Retro" ? "11px" : "13px"};
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
        gap: ${CONFIG.currentTheme === "Neon Retro" ? "6px" : "6px"};
      }
      
      .wplace-header-controls {
        display: flex;
        gap: ${CONFIG.currentTheme === "Neon Retro" ? "6px" : "6px"};
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
        padding: ${CONFIG.currentTheme === "Neon Retro" ? "12px" : "12px"};
        display: block;
        position: relative;
        z-index: 2;
        overflow-y: auto;
        flex-grow: 1;
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
        margin-bottom: ${CONFIG.currentTheme === "Neon Retro" ? "12px" : "12px"};
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

      .color-converter-controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 15px;
      }

      .color-converter-controls button {
        background: ${theme.secondary};
        color: ${theme.text};
        border: 1px solid ${theme.accent};
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
      }

      .color-converter-controls input[type="range"] {
        width: 100%;
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
      }
      
      /* Speed Control Styles */
      .wplace-speed-control {
        margin-top: 12px;
        padding: 12px;
        background: ${theme.secondary};
        border: ${theme.borderWidth} ${theme.borderStyle} ${theme.accent};
        border-radius: ${theme.borderRadius};
        backdrop-filter: ${theme.backdropFilter};
      }
      
      .wplace-speed-label {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        color: ${theme.text};
        font-size: 13px;
        font-weight: 600;
      }
      
      .wplace-speed-label i {
        margin-right: 6px;
        color: ${theme.highlight};
      }
      
      .wplace-speed-slider-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .wplace-speed-slider {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: ${theme.primary};
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
      }
      
      .wplace-speed-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${theme.highlight};
        cursor: pointer;
        border: 2px solid ${theme.text};
        box-shadow: ${theme.boxShadow};
      }
      
      .wplace-speed-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${theme.highlight};
        cursor: pointer;
        border: 2px solid ${theme.text};
        box-shadow: ${theme.boxShadow};
      }
      
      .wplace-speed-display {
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 90px;
        justify-content: flex-end;
      }
      
      #speedValue {
        color: ${theme.highlight};
        font-weight: 600;
        font-size: 14px;
      }
      
      .wplace-speed-unit {
        color: ${theme.text};
        font-size: 11px;
        opacity: 0.8;
      }
      
      /* Settings Window Styles */
      #wplace-settings-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10001;
        min-width: 400px;
        max-width: 500px;
        background: ${theme.primary};
        border: ${theme.borderWidth} ${theme.borderStyle} ${theme.accent};
        border-radius: ${theme.borderRadius};
        box-shadow: ${theme.boxShadow};
        backdrop-filter: ${theme.backdropFilter};
      }
      
      .wplace-settings {
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .wplace-setting-section {
        margin-bottom: 20px;
        padding: 12px;
        background: ${theme.secondary};
        border: ${theme.borderWidth} ${theme.borderStyle} ${theme.accent};
        border-radius: ${theme.borderRadius};
      }
      
      .wplace-setting-title {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        color: ${theme.text};
        font-size: 14px;
        font-weight: 600;
      }
      
      .wplace-setting-title i {
        margin-right: 8px;
        color: ${theme.highlight};
      }
      
      .wplace-setting-content {
        color: ${theme.text};
      }
      
      .wplace-section {
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(0,0,0,0.2);
        border-radius: ${theme.borderRadius};
      }
      
      .wplace-section h3 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 16px;
        color: ${theme.highlight};
      }
      
      .wplace-section label {
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
      }
      
      .wplace-section select,
      .wplace-section input[type="checkbox"] + label {
        margin-bottom: 10px;
      }
      
      .wplace-section select {
        width: 100%;
        padding: 8px;
        background: ${theme.secondary};
        color: ${theme.text};
        border: 1px solid ${theme.accent};
        border-radius: 5px;
      }
      
      .wplace-checkbox-container {
        display: flex;
        align-items: center;
      }
      
      .wplace-checkbox-container input[type="checkbox"] {
        margin-right: 10px;
      }
      
    `
    document.head.appendChild(style)

    const container = Utils.createElement('div', { id: 'wplace-image-bot-container' })
    const header = Utils.createElement('div', { className: 'wplace-header' }, [
      Utils.createElement('div', { className: 'wplace-header-title' }, [
        Utils.createElement('i', { className: 'fas fa-robot' }),
        Utils.createElement('span', {}, Utils.t('title')),
      ]),
      Utils.createElement('div', { className: 'wplace-header-controls' }, [
        Utils.createElement('button', { id: 'wplace-settings-btn', className: 'wplace-header-btn' }, [
          Utils.createElement('i', { className: 'fas fa-cog' })
        ]),
        Utils.createElement('button', { id: 'wplace-minimize-btn', className: 'wplace-header-btn' }, '_'),
      ]),
    ])

    const content = Utils.createElement('div', { id: 'wplace-content', className: 'wplace-content' })

    const statusSection = Utils.createElement('div', { className: 'wplace-status-section' })
    const status = Utils.createElement('div', { id: 'statusText', className: 'wplace-status status-default' }, Utils.t('initMessage'))
    const progressBar = Utils.createElement('div', { id: 'progressBar', className: 'wplace-progress-bar' })
    const progressContainer = Utils.createElement('div', { className: 'wplace-progress' }, [progressBar])
    statusSection.append(status, progressContainer)

    const controlsSection = Utils.createElement('div', { className: 'wplace-controls' })
    const row1 = Utils.createElement('div', { className: 'wplace-row' })
    const initBotBtn = Utils.createButton('initBotBtn', Utils.t('initBot'), '<i class="fas fa-power-off"></i>', initBot, 'wplace-btn wplace-btn-primary')
    const uploadImageBtn = Utils.createButton('uploadImageBtn', Utils.t('uploadImage'), '<i class="fas fa-upload"></i>', uploadImage, 'wplace-btn wplace-btn-upload')
    uploadImageBtn.disabled = true
    row1.append(initBotBtn, uploadImageBtn)

    const row2 = Utils.createElement('div', { className: 'wplace-row' })
    const resizeImageBtn = Utils.createButton('resizeImageBtn', Utils.t('resizeImage'), '<i class="fas fa-expand-arrows-alt"></i>', openResizePanel, 'wplace-btn')
    const selectPosBtn = Utils.createButton('selectPosBtn', Utils.t('selectPosition'), '<i class="fas fa-crosshairs"></i>', selectPosition, 'wplace-btn wplace-btn-select')
    resizeImageBtn.disabled = true
    selectPosBtn.disabled = true
    row2.append(resizeImageBtn, selectPosBtn)

    const row3 = Utils.createElement('div', { className: 'wplace-row' })
    const startPaintingBtn = Utils.createButton('startPaintingBtn', Utils.t('startPainting'), '<i class="fas fa-paint-brush"></i>', startPainting, 'wplace-btn wplace-btn-start')
    const stopPaintingBtn = Utils.createButton('stopPaintingBtn', Utils.t('stopPainting'), '<i class="fas fa-stop"></i>', stopPainting, 'wplace-btn wplace-btn-stop')
    startPaintingBtn.disabled = true
    stopPaintingBtn.disabled = true
    row3.append(startPaintingBtn, stopPaintingBtn)

    controlsSection.append(row1, row2, row3)
    content.append(statusSection, controlsSection)
    container.append(header, content)
    document.body.appendChild(container)

    // Stats container
    const statsContainer = Utils.createElement('div', { id: 'wplace-stats-container' })
    const statsHeader = Utils.createElement('div', { className: 'wplace-header' }, [
      Utils.createElement('div', { className: 'wplace-header-title' }, [
        Utils.createElement('i', { className: 'fas fa-chart-bar' }),
        Utils.createElement('span', {}, Utils.t('progress')),
      ]),
      Utils.createElement('div', { className: 'wplace-header-controls' }, [
        Utils.createElement('button', { id: 'wplace-stats-minimize-btn', className: 'wplace-header-btn' }, '_'),
      ]),
    ])
    const statsContent = Utils.createElement('div', { id: 'wplace-stats-content', className: 'wplace-content' })
    const statsList = Utils.createElement('div', { id: 'statsList', className: 'wplace-stats' })
    statsContent.appendChild(statsList)
    statsContainer.append(statsHeader, statsContent)
    document.body.appendChild(statsContainer)

    // Settings container
    const settingsContainer = Utils.createElement('div', { id: 'wplace-settings-container', style: { display: 'none' } })
    const settingsHeader = Utils.createElement('div', { className: 'wplace-header' }, [
        Utils.createElement('div', { className: 'wplace-header-title' }, [
            Utils.createElement('i', { className: 'fas fa-cog' }),
            Utils.createElement('span', {}, Utils.t('botSettings')),
        ]),
        Utils.createElement('div', { className: 'wplace-header-controls' }, [
            Utils.createElement('button', { id: 'wplace-settings-close-btn', className: 'wplace-header-btn' }, 'X'),
        ]),
    ]);

    const settingsContent = Utils.createElement('div', { className: 'wplace-settings' });

    // Theme settings
    const themeSection = Utils.createElement('div', { className: 'wplace-section' });
    const themeTitle = Utils.createElement('h3', {}, Utils.t('themeSettings'));
    const themeDesc = Utils.createElement('p', {}, Utils.t('themeSettingsDesc'));
    const themeSelect = Utils.createElement('select', { id: 'theme-select' });
    Object.keys(CONFIG.THEMES).forEach(themeName => {
        const option = Utils.createElement('option', { value: themeName }, themeName);
        if (CONFIG.currentTheme === themeName) option.selected = true;
        themeSelect.appendChild(option);
    });
    themeSection.append(themeTitle, themeDesc, themeSelect);

    // Language settings
    const langSection = Utils.createElement('div', { className: 'wplace-section' });
    const langTitle = Utils.createElement('h3', {}, Utils.t('language'));
    const langDesc = Utils.createElement('p', {}, Utils.t('languageSelectDesc'));
    const langSelect = Utils.createElement('select', { id: 'language-select' });
    Object.keys(TEXT).forEach(langKey => {
        const option = Utils.createElement('option', { value: langKey }, langKey.toUpperCase());
        if (state.language === langKey) option.selected = true;
        langSelect.appendChild(option);
    });
    langSection.append(langTitle, langDesc, langSelect);

    // Skip correct pixels setting
    const skipPixelsSection = Utils.createElement('div', { className: 'wplace-section' });
    const skipPixelsTitle = Utils.createElement('h3', {}, Utils.t('skipCorrectPixels'));
    const skipPixelsDesc = Utils.createElement('p', {}, Utils.t('skipCorrectPixelsDesc'));
    const skipPixelsCheckbox = Utils.createElement('input', { type: 'checkbox', id: 'skip-correct-pixels-checkbox' });
    skipPixelsCheckbox.checked = CONFIG.SKIP_CORRECT_PIXELS;
    const skipPixelsLabel = Utils.createElement('label', { for: 'skip-correct-pixels-checkbox' }, 'Enable');
    const skipPixelsContainer = Utils.createElement('div', { className: 'wplace-checkbox-container' }, [skipPixelsCheckbox, skipPixelsLabel]);
    skipPixelsSection.append(skipPixelsTitle, skipPixelsDesc, skipPixelsContainer);

    settingsContent.append(themeSection, langSection, skipPixelsSection);
    settingsContainer.append(settingsHeader, settingsContent);
    document.body.appendChild(settingsContainer);

    // Resize Panel
    const resizeOverlay = Utils.createElement('div', { className: 'resize-overlay' })
    const resizeContainer = Utils.createElement('div', { className: 'resize-container' })
    const resizeTitle = Utils.createElement('h2', { style: `text-align: center; color: ${theme.highlight};` }, Utils.t('resizeImage'))
    const previewImage = Utils.createElement('canvas', { className: 'resize-preview' })
    const widthInput = Utils.createElement('input', { type: 'number', id: 'width-input', min: 1 })
    const heightInput = Utils.createElement('input', { type: 'number', id: 'height-input', min: 1 })
    const scaleSlider = Utils.createElement('input', { type: 'range', id: 'scale-slider', min: 0.1, max: 2, step: 0.01, value: 1 })
    const scaleValue = Utils.createElement('span', { id: 'scale-value' }, '1.00')
    const confirmResizeBtn = Utils.createButton('confirmResizeBtn', 'Confirm', null, confirmResize, 'wplace-btn wplace-btn-success')
    const cancelResizeBtn = Utils.createButton('cancelResizeBtn', 'Cancel', null, closeResizePanel, 'wplace-btn wplace-btn-danger')

    const resizeControls = Utils.createElement('div', { className: 'resize-controls' }, [
      Utils.createElement('label', { for: 'width-input' }, 'Width:'),
      widthInput,
      Utils.createElement('label', { for: 'height-input' }, 'Height:'),
      heightInput,
      Utils.createElement('label', { for: 'scale-slider' }, 'Scale:'),
      scaleSlider,
      scaleValue,
    ]);

    const colorConverterControls = Utils.createElement('div', { className: 'color-converter-controls' }, [
      Utils.createElement('h3', { style: `text-align: center; color: ${theme.highlight};` }, 'Color Converter'),
      Utils.createElement('div', { className: 'wplace-row' }, [
          Utils.createButton('grayscale-btn', 'Grayscale', null, () => colorConverter.applyColorTransform('grayscale'), 'wplace-btn'),
          Utils.createButton('sepia-btn', 'Sepia', null, () => colorConverter.applyColorTransform('sepia'), 'wplace-btn'),
      ]),
      Utils.createElement('div', { className: 'wplace-row' }, [
          Utils.createButton('invert-btn', 'Invert', null, () => colorConverter.applyColorTransform('invert'), 'wplace-btn'),
          Utils.createButton('reset-colors-btn', 'Reset', null, () => {
              document.getElementById('brightness-slider').value = 0;
              document.getElementById('contrast-slider').value = 0;
              document.getElementById('hue-slider').value = 0;
              const processor = new ImageProcessor(state.originalImageSrc);
              processor.load().then(() => {
                  const resizedPixelData = processor.resize(state.imageData.width, state.imageData.height);
                  state.imageData.pixels.set(resizedPixelData);
                  updateResizePreview();
              });
          }, 'wplace-btn'),
      ]),
      Utils.createElement('label', { for: 'brightness-slider' }, 'Brightness:'),
      Utils.createElement('input', { type: 'range', id: 'brightness-slider', min: -100, max: 100, value: 0 }),
      Utils.createElement('label', { for: 'contrast-slider' }, 'Contrast:'),
      Utils.createElement('input', { type: 'range', id: 'contrast-slider', min: -100, max: 100, value: 0 }),
      Utils.createElement('label', { for: 'hue-slider' }, 'Hue:'),
      Utils.createElement('input', { type: 'range', id: 'hue-slider', min: 0, max: 360, value: 0 }),
    ]);

    const resizeButtons = Utils.createElement('div', { className: 'resize-buttons' }, [
      confirmResizeBtn,
      cancelResizeBtn,
    ]);

    resizeContainer.append(resizeTitle, previewImage, resizeControls, colorConverterControls, resizeButtons);
    resizeOverlay.appendChild(resizeContainer)
    document.body.appendChild(resizeOverlay)

    // Event listeners for color converter controls
    document.getElementById('brightness-slider').addEventListener('input', (e) => colorConverter.applyColorTransform('brightness', e.target.value));
    document.getElementById('contrast-slider').addEventListener('input', (e) => colorConverter.applyColorTransform('contrast', e.target.value));
    document.getElementById('hue-slider').addEventListener('input', (e) => colorConverter.applyColorTransform('hue', e.target.value));

    // Event Listeners
    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('wplace-header-btn') || e.target.parentElement.classList.contains('wplace-header-btn')) return;
      const containerRect = container.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const offsetY = e.clientY - containerRect.top;

      function onMouseMove(e) {
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.top = `${e.clientY - offsetY}px`;
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    statsHeader.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('wplace-header-btn') || e.target.parentElement.classList.contains('wplace-header-btn')) return;
        const statsRect = statsContainer.getBoundingClientRect();
        const offsetX = e.clientX - statsRect.left;
        const offsetY = e.clientY - statsRect.top;

        function onMouseMove(e) {
            statsContainer.style.left = `${e.clientX - offsetX}px`;
            statsContainer.style.top = `${e.clientY - offsetY}px`;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    document.getElementById('wplace-minimize-btn').addEventListener('click', () => {
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('wplace-stats-minimize-btn').addEventListener('click', () => {
        statsContent.style.display = statsContent.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('wplace-settings-btn').addEventListener('click', () => {
        settingsContainer.style.display = 'block';
    });

    document.getElementById('wplace-settings-close-btn').addEventListener('click', () => {
        settingsContainer.style.display = 'none';
    });

    themeSelect.addEventListener('change', (e) => {
        switchTheme(e.target.value);
    });

    langSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
        localStorage.setItem("wplace_language", state.language);
        createUI(); // Re-render UI with new language
    });

    skipPixelsCheckbox.addEventListener('change', (e) => {
        CONFIG.SKIP_CORRECT_PIXELS = e.target.checked;
        localStorage.setItem("wplace_skip_correct_pixels", CONFIG.SKIP_CORRECT_PIXELS);
    });

    widthInput.addEventListener('change', () => {
        const newWidth = parseInt(widthInput.value);
        if (!isNaN(newWidth) && newWidth > 0) {
            const scale = newWidth / state.imageData.width;
            heightInput.value = Math.round(state.imageData.height * scale);
            scaleSlider.value = scale;
            scaleValue.textContent = scale.toFixed(2);
            updateResizePreview();
        }
    });

    heightInput.addEventListener('change', () => {
        const newHeight = parseInt(heightInput.value);
        if (!isNaN(newHeight) && newHeight > 0) {
            const scale = newHeight / state.imageData.height;
            widthInput.value = Math.round(state.imageData.width * scale);
            scaleSlider.value = scale;
            scaleValue.textContent = scale.toFixed(2);
            updateResizePreview();
        }
    });

    scaleSlider.addEventListener('input', () => {
        const scale = parseFloat(scaleSlider.value);
        widthInput.value = Math.round(state.imageData.width * scale);
        heightInput.value = Math.round(state.imageData.height * scale);
        scaleValue.textContent = scale.toFixed(2);
        updateResizePreview();
    });
  }

  // MAIN FUNCTIONS
  async function initBot() {
    updateUI("checkingColors", "default");
    state.availableColors = Utils.extractAvailableColors();
    if (state.availableColors.length === 0) {
      updateUI("noColorsFound", "error");
      return;
    }
    state.colorsChecked = true;
    updateUI("colorsFound", "success", { count: state.availableColors.length });
    document.getElementById('uploadImageBtn').disabled = false;
    document.getElementById('resizeImageBtn').disabled = false;
    document.getElementById('selectPosBtn').disabled = false;
    document.getElementById('startPaintingBtn').disabled = false;
  }

  async function uploadImage() {
    try {
      const imageSrc = await Utils.createImageUploader();
      state.originalImageSrc = imageSrc;
      updateUI("loadingImage", "default");
      const processor = new ImageProcessor(imageSrc);
      await processor.load();
      const { width, height } = processor.getDimensions();
      const pixels = processor.getPixelData();
      state.imageData = { width, height, pixels: new Uint8ClampedArray(pixels), totalPixels: width * height };
      state.totalPixels = width * height;
      state.imageLoaded = true;
      updateUI("imageLoaded", "success", { count: state.totalPixels });
    } catch (error) {
      console.error(error);
      updateUI("imageError", "error");
    }
  }

  function openResizePanel() {
    if (!state.imageLoaded) return;
    const resizeOverlay = document.querySelector('.resize-overlay');
    resizeOverlay.style.display = 'block';
    updateResizePreview();
  }

  function closeResizePanel() {
    const resizeOverlay = document.querySelector('.resize-overlay');
    resizeOverlay.style.display = 'none';
  }

  function confirmResize() {
    const width = parseInt(document.getElementById('width-input').value);
    const height = parseInt(document.getElementById('height-input').value);
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) return;

    const processor = new ImageProcessor(state.originalImageSrc);
    processor.load().then(() => {
        const resizedPixelData = processor.resize(width, height);
        state.imageData = { width, height, pixels: new Uint8ClampedArray(resizedPixelData), totalPixels: width * height };
        state.totalPixels = width * height;
        updateUI("resizeSuccess", "success", { width, height });
        closeResizePanel();
    });
  }

  function selectPosition() {
    if (!state.imageLoaded) {
      Utils.showAlert(Utils.t('missingRequirements'), "error");
      return;
    }
    Utils.showAlert(Utils.t('selectPositionAlert'), "info");
    updateUI("waitingPosition", "default");
    state.selectingPosition = true;

    // Add a listener to the canvas to get the position
    const canvas = document.querySelector('canvas'); // This should be the wplace canvas
    if (!canvas) {
        updateUI("imageError", "error"); // A generic error message
        return;
    }

    const clickListener = (e) => {
        if (!state.selectingPosition) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        state.startPosition = { x: Math.floor(x), y: Math.floor(y) };
        state.selectingPosition = false;
        updateUI("positionSet", "success");
        canvas.removeEventListener('click', clickListener);
    };

    canvas.addEventListener('click', clickListener);
  }

  async function startPainting() {
    if (!state.imageLoaded || !state.startPosition) {
      Utils.showAlert(Utils.t('missingRequirements'), "error");
      return;
    }

    state.running = true;
    state.stopFlag = false;
    document.getElementById('stopPaintingBtn').disabled = false;
    document.getElementById('startPaintingBtn').disabled = true;
    updateUI("startPaintingMsg", "default");

    // Main painting loop
    for (let i = 0; i < state.imageData.pixels.length; i += 4) {
      if (state.stopFlag) {
        updateUI("paintingStopped", "warning");
        break;
      }

      const pixelIndex = i / 4;
      const x = pixelIndex % state.imageData.width;
      const y = Math.floor(pixelIndex / state.imageData.width);

      const targetR = state.imageData.pixels[i];
      const targetG = state.imageData.pixels[i + 1];
      const targetB = state.imageData.pixels[i + 2];
      const targetA = state.imageData.pixels[i + 3];

      if (targetA < CONFIG.TRANSPARENCY_THRESHOLD) continue; // Skip transparent pixels

      const targetColorId = findClosestColor([targetR, targetG, targetB], state.availableColors);

      const paintX = state.startPosition.x + x;
      const paintY = state.startPosition.y + y;

      // Check for charges
      let { charges, cooldown } = await WPlaceService.getCharges();
      state.currentCharges = charges;
      state.cooldown = cooldown;

      if (charges === 0) {
        updateUI("noCharges", "default", { time: Utils.formatTime(cooldown) });
        await Utils.sleep(cooldown);
        continue;
      }

      const regionX = Math.floor(paintX / 1000);
      const regionY = Math.floor(paintY / 1000);
      const pixelX = paintX % 1000;
      const pixelY = paintY % 1000;

      const result = await WPlaceService.paintPixelInRegion(regionX, regionY, pixelX, pixelY, targetColorId);

      if (result === "token_error") {
        updateUI("captchaNeeded", "error");
        break;
      }

      if (result) {
        state.paintedPixels++;
      }

      updateStats();
      await Utils.sleep(1000 / state.paintingSpeed);
    }

    state.running = false;
    document.getElementById('stopPaintingBtn').disabled = true;
    document.getElementById('startPaintingBtn').disabled = false;
    if (!state.stopFlag) {
      updateUI("paintingComplete", "success", { count: state.paintedPixels });
    }
  }

  function stopPainting() {
    state.stopFlag = true;
  }

  updateUI = (key, type, params = {}) => {
    const status = document.getElementById('statusText');
    if (status) {
      status.textContent = Utils.t(key, params);
      status.className = `wplace-status status-${type}`;
    }
  }

  updateStats = () => {
    const statsList = document.getElementById('statsList');
    if (!statsList) return;

    const remainingPixels = state.totalPixels - state.paintedPixels;
    const estimatedTime = Utils.calculateEstimatedTime(remainingPixels, state.currentCharges, state.cooldown);

    statsList.innerHTML = `
      <div class="wplace-stat-item">
        <span class="wplace-stat-label"><i class="fas fa-th"></i> ${Utils.t('pixels')}</span>
        <span class="wplace-stat-value">${state.paintedPixels}/${state.totalPixels}</span>
      </div>
      <div class="wplace-stat-item">
        <span class="wplace-stat-label"><i class="fas fa-bolt"></i> ${Utils.t('charges')}</span>
        <span class="wplace-stat-value">${state.currentCharges}</span>
      </div>
      <div class="wplace-stat-item">
        <span class="wplace-stat-label"><i class="fas fa-clock"></i> ${Utils.t('estimatedTime')}</span>
        <span class="wplace-stat-value">${Utils.formatTime(estimatedTime)}</span>
      </div>
    `;

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      const progress = state.totalPixels > 0 ? (state.paintedPixels / state.totalPixels) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }
  }

  // Initialize the UI
  createUI();
  updateStats();
})();
