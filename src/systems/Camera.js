// Camera — follows player, clamped to world bounds

export class Camera {
  constructor(viewW, viewH, worldW, worldH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.worldW = worldW;
    this.worldH = worldH;
    this.x = 0;
    this.y = 0;
  }

  follow(target, shakeX = 0, shakeY = 0) {
    // Center on target
    let cx = target.x - this.viewW / 2;
    let cy = target.y - this.viewH / 2;

    // Clamp to world bounds
    cx = Math.max(0, Math.min(this.worldW - this.viewW, cx));
    cy = Math.max(0, Math.min(this.worldH - this.viewH, cy));

    this.x = Math.round(cx + shakeX);
    this.y = Math.round(cy + shakeY);
  }
}
