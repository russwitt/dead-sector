// Keyboard input — tracks held keys and just-pressed keys
export class Keyboard {
  constructor() {
    this._down = new Set();
    this._justPressed = new Set();

    window.addEventListener('keydown', (e) => {
      if (!this._down.has(e.code)) {
        this._justPressed.add(e.code);
      }
      this._down.add(e.code);
      // Prevent arrow keys from scrolling the page
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this._down.delete(e.code);
    });
  }

  /** Is a key currently held? */
  isDown(code) { return this._down.has(code); }

  /** Was a key pressed this frame? */
  isJustPressed(code) { return this._justPressed.has(code); }

  /** Any of the given codes held? */
  anyDown(...codes) { return codes.some(c => this._down.has(c)); }

  /** Called after each update to clear just-pressed state */
  flush() { this._justPressed.clear(); }
}
