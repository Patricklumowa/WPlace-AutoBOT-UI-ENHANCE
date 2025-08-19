;(async () => {
  // WPLACE TILE BORDER VISUALIZER
  // Uses base tile coordinates (x:1624, y:896) to visualize 1000x1000px tile borders
  
  const CONFIG = {
    TILE_SIZE: 1000,
    BASE_TILE_X: 1624,
    BASE_TILE_Y: 896,
    GRID_COLOR: 'rgba(0, 255, 0, 0.8)',
    GRID_WIDTH: 2,
    COORDINATE_COLOR: 'rgba(255, 255, 0, 0.9)',
    HIGHLIGHT_COLOR: 'rgba(255, 0, 0, 0.6)',
    BASE_HIGHLIGHT_COLOR: 'rgba(0, 255, 255, 0.7)'
  };

  // WPlace Tile Visualizer Class
  class WPlaceTileVisualizer {
    constructor() {
      this.baseTileCoords = { x: CONFIG.BASE_TILE_X, y: CONFIG.BASE_TILE_Y };
      this.canvas = null;
      this.ctx = null;
      this.container = null;
      this.isEnabled = false;
      this.gridOpacity = 0.8;
      this.showCoordinates = true;
      this.showBaseTile = true;
      this.gridExtent = 5; // How many tiles to show around the base tile
    }

    // Initialize the visualizer
    init() {
      this.createUI();
      this.attachEventListeners();
      this.createOverlayCanvas();
      console.log(`🔲 Base tile coordinates set to: (${this.baseTileCoords.x}, ${this.baseTileCoords.y})`);
    }

    // Create the user interface
    createUI() {
      // Remove existing container if it exists
      const existing = document.getElementById('wplace-tile-visualizer');
      if (existing) existing.remove();

      this.container = document.createElement('div');
      this.container.id = 'wplace-tile-visualizer';
      this.container.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: white;
          font-size: 13px;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          ">
            <h3 style="margin: 0; color: #63b3ed; font-size: 14px;">🔲 WPlace Tile Visualizer</h3>
            <button id="close-visualizer" style="
              background: rgba(255,255,255,0.1);
              border: none;
              color: white;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              cursor: pointer;
              font-size: 12px;
            ">×</button>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #a0aec0; cursor: pointer;">
              <input type="checkbox" id="enable-visualizer" style="margin: 0;">
              🔲 Enable Tile Border Overlay
            </label>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #a0aec0; cursor: pointer;">
              <input type="checkbox" id="show-coordinates" checked style="margin: 0;">
              📍 Show Tile Coordinates
            </label>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #a0aec0; cursor: pointer;">
              <input type="checkbox" id="show-base-tile" checked style="margin: 0;">
              🎯 Highlight Base Tile (${CONFIG.BASE_TILE_X}, ${CONFIG.BASE_TILE_Y})
            </label>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #a0aec0;">
              📏 Grid Extent: <span id="extent-value">${this.gridExtent}</span> tiles
            </label>
            <input type="range" id="grid-extent" min="3" max="10" step="1" value="${this.gridExtent}" style="
              width: 100%;
            ">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #a0aec0;">
              🎨 Grid Opacity: <span id="opacity-value">${Math.round(this.gridOpacity * 100)}%</span>
            </label>
            <input type="range" id="grid-opacity" min="0.1" max="1" step="0.1" value="${this.gridOpacity}" style="
              width: 100%;
            ">
          </div>

          <div id="tile-info" style="
            background: rgba(255,255,255,0.05);
            padding: 8px;
            border-radius: 4px;
            font-size: 11px;
            color: #cbd5e0;
            border-left: 3px solid #63b3ed;
            line-height: 1.4;
          ">
            🎯 Base tile: (${CONFIG.BASE_TILE_X}, ${CONFIG.BASE_TILE_Y})<br>
            📏 Tile size: ${CONFIG.TILE_SIZE}×${CONFIG.TILE_SIZE}px<br>
            📊 Ready to visualize
          </div>
        </div>
      `;

      document.body.appendChild(this.container);
    }

    // Create overlay canvas
    createOverlayCanvas() {
      // Remove existing canvas if it exists
      const existing = document.getElementById('wplace-tile-overlay');
      if (existing) existing.remove();

      this.canvas = document.createElement('canvas');
      this.canvas.id = 'wplace-tile-overlay';
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        display: none;
      `;

      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      // Set canvas size to match viewport
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // Handle window resize
      window.addEventListener('resize', () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.isEnabled) {
          this.updateOverlay();
        }
      });
    }

    // Attach event listeners
    attachEventListeners() {
      // Close button
      document.getElementById('close-visualizer').addEventListener('click', () => {
        this.destroy();
      });

      // Enable/disable toggle
      document.getElementById('enable-visualizer').addEventListener('change', (e) => {
        this.isEnabled = e.target.checked;
        this.canvas.style.display = this.isEnabled ? 'block' : 'none';
        if (this.isEnabled) {
          this.updateOverlay();
        }
      });

      // Show coordinates toggle
      document.getElementById('show-coordinates').addEventListener('change', (e) => {
        this.showCoordinates = e.target.checked;
        if (this.isEnabled) {
          this.updateOverlay();
        }
      });

      // Show base tile toggle
      document.getElementById('show-base-tile').addEventListener('change', (e) => {
        this.showBaseTile = e.target.checked;
        if (this.isEnabled) {
          this.updateOverlay();
        }
      });

      // Grid extent
      const extentSlider = document.getElementById('grid-extent');
      const extentValue = document.getElementById('extent-value');

      extentSlider.addEventListener('input', (e) => {
        this.gridExtent = parseInt(e.target.value);
        extentValue.textContent = this.gridExtent;
        if (this.isEnabled) {
          this.updateOverlay();
        }
      });

      // Grid opacity
      const opacitySlider = document.getElementById('grid-opacity');
      const opacityValue = document.getElementById('opacity-value');

      opacitySlider.addEventListener('input', (e) => {
        this.gridOpacity = parseFloat(e.target.value);
        opacityValue.textContent = Math.round(this.gridOpacity * 100) + '%';
        if (this.isEnabled) {
          this.updateOverlay();
        }
      });
    }

    // Update the overlay canvas
    updateOverlay() {
      if (!this.ctx) return;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Try to find the canvas element that WPlace uses
      const wplaceCanvas = this.findWPlaceCanvas();
      if (!wplaceCanvas) {
        this.updateInfo('❌ WPlace canvas not found');
        return;
      }

      const canvasRect = wplaceCanvas.getBoundingClientRect();
      this.drawTileGrid(canvasRect, wplaceCanvas);
    }

    // Find WPlace canvas element
    findWPlaceCanvas() {
      // Look for common canvas selectors used by WPlace
      const selectors = [
        'canvas',
        '#canvas',
        '.canvas',
        '[id*="canvas"]',
        '[class*="canvas"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          // Check if canvas looks like it could be WPlace (has reasonable size)
          const rect = element.getBoundingClientRect();
          if (rect.width > 200 && rect.height > 200) {
            return element;
          }
        }
      }
      return null;
    }

    // Draw tile grid overlay based on base tile coordinates
    drawTileGrid(canvasRect, wplaceCanvas) {
      this.ctx.save();
      
      // Get the current zoom/scale of the WPlace canvas
      const canvasStyle = window.getComputedStyle(wplaceCanvas);
      const transform = canvasStyle.transform;
      let scale = 1;
      
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix.*\((.+)\)/);
        if (matrix) {
          const values = matrix[1].split(', ');
          scale = parseFloat(values[0]) || 1;
        }
      }

      // Calculate tile size on screen considering zoom
      const tileSize = CONFIG.TILE_SIZE * scale;
      
      // Calculate the position of the base tile on screen
      // This is approximate - you may need to adjust based on WPlace's coordinate system
      const baseTileScreenX = canvasRect.left + (canvasRect.width / 2);
      const baseTileScreenY = canvasRect.top + (canvasRect.height / 2);
      
      // Draw grid lines around the base tile
      this.ctx.strokeStyle = CONFIG.GRID_COLOR.replace(/[\d.]+(?=\))/, this.gridOpacity);
      this.ctx.lineWidth = CONFIG.GRID_WIDTH;
      
      // Calculate grid bounds
      const gridSize = this.gridExtent * 2 + 1; // Total tiles to show
      const startOffsetX = -this.gridExtent * tileSize;
      const startOffsetY = -this.gridExtent * tileSize;
      
      // Draw vertical lines
      for (let i = 0; i <= gridSize; i++) {
        const x = baseTileScreenX + startOffsetX + (i * tileSize);
        if (x >= canvasRect.left && x <= canvasRect.right) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, Math.max(canvasRect.top, baseTileScreenY + startOffsetY));
          this.ctx.lineTo(x, Math.min(canvasRect.bottom, baseTileScreenY + startOffsetY + (gridSize * tileSize)));
          this.ctx.stroke();
        }
      }
      
      // Draw horizontal lines
      for (let i = 0; i <= gridSize; i++) {
        const y = baseTileScreenY + startOffsetY + (i * tileSize);
        if (y >= canvasRect.top && y <= canvasRect.bottom) {
          this.ctx.beginPath();
          this.ctx.moveTo(Math.max(canvasRect.left, baseTileScreenX + startOffsetX), y);
          this.ctx.lineTo(Math.min(canvasRect.right, baseTileScreenX + startOffsetX + (gridSize * tileSize)), y);
          this.ctx.stroke();
        }
      }

      // Highlight base tile
      if (this.showBaseTile) {
        this.ctx.fillStyle = CONFIG.BASE_HIGHLIGHT_COLOR;
        this.ctx.fillRect(
          baseTileScreenX - tileSize / 2,
          baseTileScreenY - tileSize / 2,
          tileSize,
          tileSize
        );
      }

      // Draw coordinates if enabled
      if (this.showCoordinates) {
        this.ctx.fillStyle = CONFIG.COORDINATE_COLOR;
        this.ctx.font = `${Math.max(10, 12 * scale)}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw coordinates for visible tiles
        for (let i = -this.gridExtent; i <= this.gridExtent; i++) {
          for (let j = -this.gridExtent; j <= this.gridExtent; j++) {
            const tileX = this.baseTileCoords.x + i;
            const tileY = this.baseTileCoords.y + j;
            const screenX = baseTileScreenX + (i * tileSize);
            const screenY = baseTileScreenY + (j * tileSize);
            
            // Only draw if within canvas bounds
            if (screenX >= canvasRect.left && screenX <= canvasRect.right &&
                screenY >= canvasRect.top && screenY <= canvasRect.bottom) {
              this.ctx.fillText(
                `${tileX},${tileY}`,
                screenX,
                screenY
              );
            }
          }
        }
      }

      this.ctx.restore();
      
      // Update info
      const totalTiles = (this.gridExtent * 2 + 1) ** 2;
      this.updateInfo(`🔲 Showing ${totalTiles} tiles around base (${this.baseTileCoords.x}, ${this.baseTileCoords.y})`);
    }

    // Update info panel
    updateInfo(message) {
      const infoPanel = document.getElementById('tile-info');
      if (infoPanel) {
        infoPanel.innerHTML = message;
      }
    }

    // Destroy the visualizer
    destroy() {
      if (this.container) {
        this.container.remove();
      }
      if (this.canvas) {
        this.canvas.remove();
      }
    }
  }

  // Initialize the visualizer
  const visualizer = new WPlaceTileVisualizer();
  visualizer.init();

  console.log('🔲 WPlace Tile Border Visualizer loaded!');
  console.log(`📍 Base tile coordinates: (${CONFIG.BASE_TILE_X}, ${CONFIG.BASE_TILE_Y})`);
  console.log(`📏 Tile size: ${CONFIG.TILE_SIZE}×${CONFIG.TILE_SIZE}px`);
})();
