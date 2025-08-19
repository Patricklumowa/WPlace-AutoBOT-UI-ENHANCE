;(async () => {
  // TILE BORDER VISUALIZER
  // Based on Auto-Image overlay logic for visualizing tile boundaries
  
  const CONFIG = {
    TILE_SIZE_DEFAULT: 1000,
    GRID_COLOR: 'rgba(0, 255, 0, 0.8)',
    GRID_WIDTH: 2,
    BACKGROUND_COLOR: '#1a1a1a'
  };

  // Tile Border Visualizer Class
  class TileBorderVisualizer {
    constructor() {
      this.tileSize = CONFIG.TILE_SIZE_DEFAULT;
      this.imageBitmap = null;
      this.canvas = null;
      this.ctx = null;
      this.container = null;
      this.showGrid = true;
      this.gridOpacity = 0.8;
    }

    // Initialize the visualizer
    init() {
      this.createUI();
      this.attachEventListeners();
    }

    // Create the user interface
    createUI() {
      // Remove existing container if it exists
      const existing = document.getElementById('tile-visualizer');
      if (existing) existing.remove();

      this.container = document.createElement('div');
      this.container.id = 'tile-visualizer';
      this.container.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          width: 350px;
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: white;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          ">
            <h3 style="margin: 0; color: #63b3ed;">🔲 Tile Border Visualizer</h3>
            <button id="close-visualizer" style="
              background: rgba(255,255,255,0.1);
              border: none;
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              cursor: pointer;
              font-size: 14px;
            ">×</button>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #a0aec0;">
              📁 Upload Image
            </label>
            <input type="file" id="image-input" accept="image/*" style="
              width: 100%;
              padding: 8px;
              background: rgba(255,255,255,0.1);
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 6px;
              color: white;
              font-size: 12px;
            ">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #a0aec0;">
              📏 Tile Size: <span id="tile-size-value">${this.tileSize}</span>px
            </label>
            <input type="range" id="tile-size-slider" min="100" max="2000" step="50" value="${this.tileSize}" style="
              width: 100%;
              margin-bottom: 5px;
            ">
            <input type="number" id="tile-size-input" value="${this.tileSize}" min="50" max="5000" style="
              width: 100%;
              padding: 6px;
              background: rgba(255,255,255,0.1);
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 4px;
              color: white;
              font-size: 12px;
            ">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #a0aec0; cursor: pointer;">
              <input type="checkbox" id="show-grid" checked style="margin: 0;">
              🔲 Show Grid Lines
            </label>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #a0aec0;">
              🎨 Grid Opacity: <span id="opacity-value">${Math.round(this.gridOpacity * 100)}%</span>
            </label>
            <input type="range" id="grid-opacity" min="0.1" max="1" step="0.1" value="${this.gridOpacity}" style="
              width: 100%;
            ">
          </div>

          <div style="margin-bottom: 15px;">
            <button id="clear-canvas" style="
              width: 100%;
              padding: 10px;
              background: rgba(239, 68, 68, 0.8);
              border: none;
              border-radius: 6px;
              color: white;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.3s ease;
            ">
              🗑️ Clear Canvas
            </button>
          </div>

          <div id="info-panel" style="
            background: rgba(255,255,255,0.05);
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            color: #cbd5e0;
            border-left: 3px solid #63b3ed;
          ">
            📊 Ready to visualize tile borders
          </div>
        </div>

        <canvas id="tile-canvas" style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          max-width: 80vw;
          max-height: 80vh;
          border: 2px solid #4a5568;
          border-radius: 8px;
          background: ${CONFIG.BACKGROUND_COLOR};
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 9999;
          display: none;
        "></canvas>
      `;

      document.body.appendChild(this.container);
      this.canvas = document.getElementById('tile-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
    }

    // Attach event listeners
    attachEventListeners() {
      // Close button
      document.getElementById('close-visualizer').addEventListener('click', () => {
        this.container.remove();
      });

      // File input
      document.getElementById('image-input').addEventListener('change', (e) => {
        this.handleImageUpload(e);
      });

      // Tile size controls
      const sizeSlider = document.getElementById('tile-size-slider');
      const sizeInput = document.getElementById('tile-size-input');
      const sizeValue = document.getElementById('tile-size-value');

      sizeSlider.addEventListener('input', (e) => {
        this.tileSize = parseInt(e.target.value);
        sizeInput.value = this.tileSize;
        sizeValue.textContent = this.tileSize;
        this.updateVisualization();
      });

      sizeInput.addEventListener('input', (e) => {
        this.tileSize = parseInt(e.target.value) || CONFIG.TILE_SIZE_DEFAULT;
        sizeSlider.value = this.tileSize;
        sizeValue.textContent = this.tileSize;
        this.updateVisualization();
      });

      // Grid toggle
      document.getElementById('show-grid').addEventListener('change', (e) => {
        this.showGrid = e.target.checked;
        this.updateVisualization();
      });

      // Grid opacity
      const opacitySlider = document.getElementById('grid-opacity');
      const opacityValue = document.getElementById('opacity-value');

      opacitySlider.addEventListener('input', (e) => {
        this.gridOpacity = parseFloat(e.target.value);
        opacityValue.textContent = Math.round(this.gridOpacity * 100) + '%';
        this.updateVisualization();
      });

      // Clear canvas
      document.getElementById('clear-canvas').addEventListener('click', () => {
        this.clearCanvas();
      });

      // Canvas click to hide
      this.canvas.addEventListener('click', (e) => {
        if (e.target === this.canvas) {
          this.canvas.style.display = 'none';
        }
      });
    }

    // Handle image upload
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        this.imageBitmap = await createImageBitmap(file);
        this.setupCanvas();
        this.updateVisualization();
        this.canvas.style.display = 'block';
        this.updateInfo(`Image loaded: ${this.imageBitmap.width}×${this.imageBitmap.height}px`);
      } catch (error) {
        console.error('Error loading image:', error);
        this.updateInfo('❌ Error loading image');
      }
    }

    // Setup canvas dimensions
    setupCanvas() {
      if (!this.imageBitmap) return;

      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;
      
      let { width, height } = this.imageBitmap;
      
      // Scale down if image is too large
      const scaleX = maxWidth / width;
      const scaleY = maxHeight / height;
      const scale = Math.min(scaleX, scaleY, 1);
      
      this.canvas.width = width * scale;
      this.canvas.height = height * scale;
      this.canvas.style.width = this.canvas.width + 'px';
      this.canvas.style.height = this.canvas.height + 'px';
    }

    // Update visualization
    updateVisualization() {
      if (!this.imageBitmap) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw the image
      this.ctx.drawImage(this.imageBitmap, 0, 0, this.canvas.width, this.canvas.height);
      
      if (this.showGrid) {
        this.drawTileGrid();
      }

      this.updateInfo(`Tiles: ${this.calculateTileCount()} (${this.tileSize}×${this.tileSize}px each)`);
    }

    // Draw tile grid overlay
    drawTileGrid() {
      const scaleX = this.canvas.width / this.imageBitmap.width;
      const scaleY = this.canvas.height / this.imageBitmap.height;
      const scaledTileSize = this.tileSize * Math.min(scaleX, scaleY);

      this.ctx.save();
      this.ctx.strokeStyle = CONFIG.GRID_COLOR.replace(/[\d.]+(?=\))/, this.gridOpacity);
      this.ctx.lineWidth = CONFIG.GRID_WIDTH;
      this.ctx.setLineDash([]);

      // Draw vertical lines
      for (let x = 0; x <= this.canvas.width; x += scaledTileSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= this.canvas.height; y += scaledTileSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
      }

      // Draw tile coordinates (optional, for debugging)
      if (this.tileSize >= 200) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.gridOpacity * 0.8})`;
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        
        for (let x = 0; x < this.canvas.width; x += scaledTileSize) {
          for (let y = 0; y < this.canvas.height; y += scaledTileSize) {
            const tileX = Math.floor(x / scaledTileSize);
            const tileY = Math.floor(y / scaledTileSize);
            this.ctx.fillText(
              `${tileX},${tileY}`,
              x + scaledTileSize / 2,
              y + scaledTileSize / 2
            );
          }
        }
      }

      this.ctx.restore();
    }

    // Calculate total number of tiles
    calculateTileCount() {
      if (!this.imageBitmap) return 0;
      
      const tilesX = Math.ceil(this.imageBitmap.width / this.tileSize);
      const tilesY = Math.ceil(this.imageBitmap.height / this.tileSize);
      return tilesX * tilesY;
    }

    // Clear canvas
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.style.display = 'none';
      this.imageBitmap = null;
      document.getElementById('image-input').value = '';
      this.updateInfo('📊 Ready to visualize tile borders');
    }

    // Update info panel
    updateInfo(message) {
      const infoPanel = document.getElementById('info-panel');
      if (infoPanel) {
        infoPanel.textContent = message;
      }
    }
  }

  // Initialize the visualizer
  const visualizer = new TileBorderVisualizer();
  visualizer.init();

  console.log('🔲 Tile Border Visualizer loaded! Upload an image to see tile boundaries.');
})();
