import { Scene } from './Scene.js';
import { drawText, measureText } from '../ui/Text.js';

export class MenuScene extends Scene {
  onEnter(game) {
    this.game = game;
    this.blink = 0;
    this.showPress = true;
    // Animated starfield
    this.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * 640,
      y: Math.random() * 480,
      spd: 10 + Math.random() * 30,
      size: Math.random() < 0.2 ? 2 : 1,
      bright: Math.random(),
    }));
    this.titleAnim = 0;
  }

  update(dt) {
    this.blink += dt;
    if (this.blink > 0.6) {
      this.blink = 0;
      this.showPress = !this.showPress;
    }
    this.titleAnim += dt;
    // Scroll stars
    for (const s of this.stars) {
      s.x -= s.spd * dt;
      if (s.x < 0) {
        s.x = 640;
        s.y = Math.random() * 480;
      }
    }
    const kb = this.game.keyboard;
    if (kb.isJustPressed('Enter') || kb.isJustPressed('Space')) {
      this.game.startGame();
    }
  }

  render(ctx) {
    const W = 640, H = 480;
    // Background
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (const s of this.stars) {
      const b = Math.floor(s.bright * 200 + 55);
      ctx.fillStyle = `rgb(${b},${b},${b})`;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }

    // Title — "DEAD SECTOR"
    const scale = 4;
    const title1 = 'DEAD';
    const title2 = 'SECTOR';
    const t1W = measureText(title1, scale);
    const t2W = measureText(title2, scale);

    // Pulsing red/orange effect
    const pulse = Math.sin(this.titleAnim * 3) * 0.5 + 0.5;
    const r = Math.floor(180 + pulse * 75);
    const g2 = Math.floor(pulse * 40);
    ctx.fillStyle = `rgb(${r},${g2},0)`;
    drawText(ctx, title1, Math.floor((W - t1W) / 2), 120, `rgb(${r},${g2},0)`, scale);
    drawText(ctx, title2, Math.floor((W - t2W) / 2), 120 + 7 * scale + scale, `rgb(${r - 30},${g2 + 20},30)`, scale);

    // Subtitle
    const sub = 'TOP-DOWN RETRO SHOOTER';
    const subW = measureText(sub, 2);
    drawText(ctx, sub, Math.floor((W - subW) / 2), 210, '#888888', 2);

    // Controls hint
    drawText(ctx, 'WASD / ARROWS  MOVE', Math.floor((W - measureText('WASD / ARROWS  MOVE', 2)) / 2), 280, '#555566', 2);
    drawText(ctx, 'MOUSE AIM  CLICK FIRE', Math.floor((W - measureText('MOUSE AIM  CLICK FIRE', 2)) / 2), 296, '#555566', 2);

    // High score
    if (this.game.highScore > 0) {
      const hs = `BEST SCORE  ${String(this.game.highScore).padStart(6, '0')}`;
      drawText(ctx, hs, Math.floor((W - measureText(hs, 2)) / 2), 330, '#888844', 2);
    }

    // Press Enter
    if (this.showPress) {
      const press = 'PRESS ENTER TO START';
      drawText(ctx, press, Math.floor((W - measureText(press, 2)) / 2), H - 60, '#44ffaa', 2);
    }

    // Version
    drawText(ctx, 'V1.0', W - measureText('V1.0', 1) - 4, H - 10, '#333333', 1);
  }
}
