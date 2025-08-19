;(async () => {
  // WPLACE TILE BORDER VISUALIZER
  // Captures tile coordinates from WPlace network requests and visualizes tile borders
  
  const CONFIG = {
    TILE_SIZE: 1000,
    GRID_COLOR: 'rgba(0, 255, 0, 0.8)',
    GRID_WIDTH: 2,
    COORDINATE_COLOR: 'rgba(255, 255, 0, 0.9)',
    HIGHLIGHT_COLOR: 'rgba(255, 0, 0, 0.6)'
  };

  // WPlace Tile Visualizer Class
  class WPlaceTileVisualizer {
    constructor() {
      this.lastTileCoords = null;
      this.canvas = null;
      this.ctx = null;
      this.container = null;
      this.isEnabled = false;
      this.gridOpacity = 0.8;
      this.showCoordinates = true;
      this.highlightLastTile = true;
      this.capturedTiles = new Set();
    }

    // Initialize the visualizer
    init() {
      this.createUI();
      this.attachEventListeners();
      this.interceptNetworkRequests();
      this.createOverlayCanvas();
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
              <input type="checkbox" id="highlight-last" checked style="margin: 0;">
              🎯 Highlight Last Tile
            </label>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #a0aec0;">
              🎨 Grid Opacity: <span id="opacity-value">${Math.round(this.gridOpacity * 100)}%</span>
            </label>
            <input type="range" id="grid-opacity" min="0.1" max="1" step="0.1" value="${this.gridOpacity}" style="
              width: 100%;
            ">
          </div>

          <div style="margin-bottom: 12px;">
            <button id="clear-tiles" style="
              width: 100%;
              padding: 8px;
              background: rgba(239, 68, 68, 0.8);
              border: none;
              border-radius: 4px;
              color: white;
              cursor: pointer;
              font-size: 12px;
            ">
              🗑️ Clear Captured Tiles
            </button>
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
            🎯 Waiting for tile requests...
          </div>

          <div id="captured-tiles-list" style="
            max-height: 150px;
            overflow-y: auto;
            margin-top: 10px;
            background: rgba(255,255,255,0.02);
            border-radius: 4px;
            padding: 5px;
            font-size: 10px;
            color: #a0aec0;
          ">
            <div style="font-weight: bold; margin-bottom: 3px;">Captured Tiles:</div>
            <div id="tiles-list">None yet</div>
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

      // Highlight last tile toggle
      document.getElementById('highlight-last').addEventListener('change', (e) => {
        this.highlightLastTile = e.target.checked;
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

      // Clear tiles
      document.getElementById('clear-tiles').addEventListener('click', () => {
        this.capturedTiles.clear();
        this.lastTileCoords = null;
        this.updateTilesList();
        this.updateInfo('🗑️ Captured tiles cleared');
        if (this.isEnabled) {
          this.updateOverlay();
        }
      });
    }

    // Intercept network requests to capture tile coordinates
    interceptNetworkRequests() {
      // Intercept fetch requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        this.checkTileRequest(args[0]);
        return response;
      };

      // Intercept XMLHttpRequest
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this.addEventListener('loadend', () => {
          visualizer.checkTileRequest(url);
        });
        return originalXHROpen.call(this, method, url, ...args);
      };

      // Also listen for postMessage events that might contain tile data
      window.addEventListener('message', (event) => {
        if (event.data && event.data.source === 'auto-image-tile') {
          this.checkTileRequest(event.data.endpoint);
        }
      });
    }

    // Check if request is for a tile and extract coordinates
    checkTileRequest(url) {
      if (!url || typeof url !== 'string') return;

      // Look for tile patterns like: /tiles/123/456.png or similar
      const tilePattern = /tiles?\/(\d+)\/(\d+)\.png/i;
      const match = url.match(tilePattern);

      if (match) {
        const tileX = parseInt(match[1], 10);
        const tileY = parseInt(match[2], 10);
        
        this.lastTileCoords = { x: tileX, y: tileY };
        this.capturedTiles.add(`${tileX},${tileY}`);
        
        this.updateInfo(`📍 Last tile: (${tileX}, ${tileY})`);
        this.updateTilesList();
        
        if (this.isEnabled) {
          this.updateOverlay();
        }
        
        console.log(`🔲 Captured tile coordinates: (${tileX}, ${tileY})`);
      }
    }

    // Update the overlay canvas
    updateOverlay() {
      if (!this.ctx) return;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (!this.lastTileCoords) return;

      // Try to find the canvas element that WPlace uses
      const wplaceCanvas = this.findWPlaceCanvas();
      if (!wplaceCanvas) {
        this.updateInfo('❌ WPlace canvas not found');
        return;
      }

      const canvasRect = wplaceCanvas.getBoundingClientRect();
      this.drawTileGrid(canvasRect);
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

    // Draw tile grid overlay
    drawTileGrid(canvasRect) {
      if (!this.lastTileCoords) return;

      this.ctx.save();
      
      // Calculate approximate tile size on screen
      // This is a rough estimation - you might need to adjust based on zoom level
      const approximateTileSize = Math.min(canvasRect.width, canvasRect.height) / 10;
      
      // Calculate grid offset based on last tile coordinates
      const { x: lastTileX, y: lastTileY } = this.lastTileCoords;
      
      // Draw grid lines
      this.ctx.strokeStyle = CONFIG.GRID_COLOR.replace(/[\d.]+(?=\))/, this.gridOpacity);
      this.ctx.lineWidth = CONFIG.GRID_WIDTH;
      
      // Calculate starting positions
      const startX = canvasRect.left;
      const startY = canvasRect.top;
      const endX = canvasRect.right;
      const endY = canvasRect.bottom;
      
      // Draw vertical lines
      for (let x = startX; x <= endX; x += approximateTileSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, startY);
        this.ctx.lineTo(x, endY);
        this.ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = startY; y <= endY; y += approximateTileSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, y);
        this.ctx.lineTo(endX, y);
        this.ctx.stroke();
      }

      // Highlight last captured tile
      if (this.highlightLastTile) {
        const centerX = canvasRect.left + canvasRect.width / 2;
        const centerY = canvasRect.top + canvasRect.height / 2;
        
        this.ctx.fillStyle = CONFIG.HIGHLIGHT_COLOR;
        this.ctx.fillRect(
          centerX - approximateTileSize / 2,
          centerY - approximateTileSize / 2,
          approximateTileSize,
          approximateTileSize
        );
      }

      // Draw coordinates if enabled
      if (this.showCoordinates) {
        this.ctx.fillStyle = CONFIG.COORDINATE_COLOR;
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        
        const centerX = canvasRect.left + canvasRect.width / 2;
        const centerY = canvasRect.top + canvasRect.height / 2;
        
        this.ctx.fillText(
          `(${lastTileX}, ${lastTileY})`,
          centerX,
          centerY
        );
      }

      this.ctx.restore();
    }

    // Update info panel
    updateInfo(message) {
      const infoPanel = document.getElementById('tile-info');
      if (infoPanel) {
        infoPanel.innerHTML = message;
      }
    }

    // Update captured tiles list
    updateTilesList() {
      const tilesList = document.getElementById('tiles-list');
      if (tilesList) {
        if (this.capturedTiles.size === 0) {
          tilesList.textContent = 'None yet';
        } else {
          const tiles = Array.from(this.capturedTiles).slice(-10); // Show last 10
          tilesList.innerHTML = tiles.map(coord => `<div>${coord}</div>`).join('');
          if (this.capturedTiles.size > 10) {
            tilesList.innerHTML += `<div style="color: #666;">...and ${this.capturedTiles.size - 10} more</div>`;
          }
        }
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

  console.log('🔲 WPlace Tile Border Visualizer loaded! It will capture tile coordinates from network requests.');
})();
