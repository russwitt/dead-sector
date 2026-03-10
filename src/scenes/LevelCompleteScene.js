import { Scene } from './Scene.js';
import { drawText, measureText } from '../ui/Text.js';
import { LEVELS } from '../data/levels.js';

export class LevelCompleteScene extends Scene {
  onEnter(game) {
    this.game = game;
    this.timer = 0;
    this.blink = 0;
    this.show = true;
    // Stars for bg
    this.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * 640,
      y: Math.random() * 480,
      spd: 15 + Math.random() * 40,
      size: Math.random() < 0.2 ? 2 : 1,
    }));
  }

  update(dt) {
    this.timer += dt;
    this.blink += dt;
    if (this.blink > 0.55) { this.blink = 0; this.show = !this.show; }
    for (const s of this.stars) {
      s.x -= s.spd * dt;
      if (s.x < 0) { s.x = 640; s.y = Math.random() * 480; }
    }
    const kb = this.game.keyboard;
    if (kb.isJustPressed('Enter') || kb.isJustPressed('Space')) {
      this.game.nextLevel();
    }
  }

  render(ctx) {
    const { game } = this;
    const W = 640, H = 480;
    ctx.fillStyle = '#030611';
    ctx.fillRect(0, 0, W, H);

    for (const s of this.stars) {
      ctx.fillStyle = '#888';
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }

    // Title
    const title = 'LEVEL CLEAR!';
    drawText(ctx, title, Math.floor((W - measureText(title, 4)) / 2), 100, '#44ffaa', 4);

    // Level name
    const completedLevel = LEVELS[game.currentLevel - 1];
    if (completedLevel) {
      const name = `${completedLevel.name} CLEARED`;
      drawText(ctx, name, Math.floor((W - measureText(name, 2)) / 2), 160, '#88ccff', 2);
    }

    // Score
    const scoreText = `SCORE  ${String(game.score).padStart(6, '0')}`;
    drawText(ctx, scoreText, Math.floor((W - measureText(scoreText, 3)) / 2), 210, '#ffff44', 3);

    // Next level info
    const nextLevel = LEVELS[game.currentLevel];
    if (nextLevel) {
      const nextText = `NEXT: LV${game.currentLevel + 1} ${nextLevel.name}`;
      drawText(ctx, nextText, Math.floor((W - measureText(nextText, 2)) / 2), 280, '#cccccc', 2);
    }

    // Continue prompt
    if (this.show) {
      const press = 'PRESS ENTER TO CONTINUE';
      drawText(ctx, press, Math.floor((W - measureText(press, 2)) / 2), H - 60, '#44ffaa', 2);
    }
  }
}
