import { Scene } from './Scene.js';
import { drawText, measureText } from '../ui/Text.js';

export class GameOverScene extends Scene {
  /**
   * @param {boolean} win — true if all levels completed
   */
  constructor(win = false) {
    super();
    this.win = win;
  }

  onEnter(game) {
    this.game = game;
    this.blink = 0;
    this.show = true;
    this.timer = 0;
    // Check for new high score
    this.isNewHS = game.score > 0 && game.score >= game.highScore;
    this.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * 640,
      y: Math.random() * 480,
      spd: 10 + Math.random() * 20,
      size: Math.random() < 0.2 ? 2 : 1,
    }));
  }

  update(dt) {
    this.timer += dt;
    this.blink += dt;
    if (this.blink > 0.6) { this.blink = 0; this.show = !this.show; }
    for (const s of this.stars) {
      s.x -= s.spd * dt;
      if (s.x < 0) { s.x = 640; s.y = Math.random() * 480; }
    }
    if (this.timer < 1.0) return; // brief lock-out before accepting input
    const kb = this.game.keyboard;
    if (kb.isJustPressed('Enter') || kb.isJustPressed('Space')) {
      this.game.returnToMenu();
    }
  }

  render(ctx) {
    const { game, win } = this;
    const W = 640, H = 480;
    ctx.fillStyle = win ? '#020611' : '#060202';
    ctx.fillRect(0, 0, W, H);

    for (const s of this.stars) {
      ctx.fillStyle = win ? '#667788' : '#664444';
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }

    if (win) {
      const title = 'MISSION';
      const title2 = 'COMPLETE';
      drawText(ctx, title,  Math.floor((W - measureText(title, 5)) / 2), 80,  '#44ffaa', 5);
      drawText(ctx, title2, Math.floor((W - measureText(title2, 5)) / 2), 80 + 7 * 5 + 6, '#44ffaa', 5);
    } else {
      const title = 'GAME OVER';
      drawText(ctx, title, Math.floor((W - measureText(title, 5)) / 2), 100, '#ff3333', 5);
    }

    // Score
    const scoreText = `FINAL SCORE  ${String(game.score).padStart(6, '0')}`;
    drawText(ctx, scoreText, Math.floor((W - measureText(scoreText, 2)) / 2), 240, '#ffff44', 2);

    // High score
    const hsText = `HIGH SCORE   ${String(game.highScore).padStart(6, '0')}`;
    drawText(ctx, hsText, Math.floor((W - measureText(hsText, 2)) / 2), 260, '#888844', 2);

    if (this.isNewHS) {
      const newHS = 'NEW HIGH SCORE!';
      drawText(ctx, newHS, Math.floor((W - measureText(newHS, 2)) / 2), 280, '#ff8844', 2);
    }

    // Level reached
    const lvText = `REACHED LEVEL ${game.currentLevel + 1}`;
    drawText(ctx, lvText, Math.floor((W - measureText(lvText, 2)) / 2), 310, '#888888', 2);

    // Prompt
    if (this.show && this.timer > 1.0) {
      const press = 'PRESS ENTER TO RETURN';
      drawText(ctx, press, Math.floor((W - measureText(press, 2)) / 2), H - 60, '#cccccc', 2);
    }
  }
}
