// Mouse input — canvas-relative position + click state
export class Mouse {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.clicked = false;       // true for one frame on mousedown
    this.down = false;          // true while held

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      // Map to logical canvas size (640×480) regardless of CSS scaling
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.x = (e.clientX - rect.left) * scaleX;
      this.y = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.down = true;
        this.clicked = true;
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.down = false;
    });

    // Prevent context menu on right-click
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Called after each update frame to clear one-shot click state */
  flush() { this.clicked = false; }
}
