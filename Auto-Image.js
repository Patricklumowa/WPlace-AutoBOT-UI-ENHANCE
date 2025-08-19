;(async () => {
  // WPLACE TILE BORDER VISUALIZER
  // Uses base tile coordinates (x:1624, y:896) to visualize 1000x1000px tile borders
  
  const CONFIG = {
    TILE_SIZE: 1000,
    BASE_TILE_X: 1624,
    BASE_TILE_Y: 896,
    GRID_COLOR: 'rgba(0, 255, 0, 0.6)',
    GRID_WIDTH: 2,
    COORDINATE_COLOR: 'rgba(255, 255, 0, 0.8)',
    BASE_HIGHLIGHT_COLOR: 'rgba(0, 255, 255, 0.4)'
  };

  // WPlace Tile Visualizer Class
  class WPlaceTileVisualizer {
    constructor() {
      this.baseTileCoords = { x: CONFIG.BASE_TILE_X, y: CONFIG.BASE_TILE_Y };
      this.canvas = null;
      this.ctx = null;
      this.gridExtent = 10; // How many tiles to show around the base tile
      this.updateInterval = null;
    }

    // Initialize the visualizer
    init() {
      this.createOverlayCanvas();
      this.startOverlay();
      console.log(`🔲 Tile Border Overlay activated`);
      console.log(`� Base tile coordinates: (${this.baseTileCoords.x}, ${this.baseTileCoords.y})`);
      console.log(`📏 Tile size: ${CONFIG.TILE_SIZE}×${CONFIG.TILE_SIZE}px`);
      console.log(`🔲 Press Ctrl+Shift+T to toggle overlay`);
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
        this.updateOverlay();
      });

      // Add keyboard shortcut to toggle overlay
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
          this.toggleOverlay();
        }
      });
    }

    // Start the overlay with continuous updates
    startOverlay() {
      this.updateOverlay();
      // Update every 100ms to handle canvas movements/zoom changes
      this.updateInterval = setInterval(() => {
        this.updateOverlay();
      }, 100);
    }

    // Toggle overlay visibility
    toggleOverlay() {
      if (this.canvas.style.display === 'none') {
        this.canvas.style.display = 'block';
        console.log('🔲 Tile overlay enabled');
      } else {
        this.canvas.style.display = 'none';
        console.log('🔲 Tile overlay disabled');
      }
    }

    // Update the overlay canvas
    updateOverlay() {
      if (!this.ctx) return;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Try to find the canvas element that WPlace uses
      const wplaceCanvas = this.findWPlaceCanvas();
      if (!wplaceCanvas) {
        return; // Silently fail if canvas not found
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
      // This positions the base tile at the center of the visible canvas
      const baseTileScreenX = canvasRect.left + (canvasRect.width / 2);
      const baseTileScreenY = canvasRect.top + (canvasRect.height / 2);
      
      // Draw grid lines around the base tile
      this.ctx.strokeStyle = CONFIG.GRID_COLOR;
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
      this.ctx.fillStyle = CONFIG.BASE_HIGHLIGHT_COLOR;
      this.ctx.fillRect(
        baseTileScreenX - tileSize / 2,
        baseTileScreenY - tileSize / 2,
        tileSize,
        tileSize
      );

      // Draw coordinates for tiles
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

      this.ctx.restore();
    }

    // Update info panel
    updateInfo(message) {
      // No UI panel in overlay mode
      console.log(message);
    }

    // Destroy the visualizer
    destroy() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      if (this.canvas) {
        this.canvas.remove();
      }
    }
  }

  // Initialize the visualizer
  const visualizer = new WPlaceTileVisualizer();
  visualizer.init();

  // Add to global scope for manual control
  window.tileVisualizer = visualizer;

})();
