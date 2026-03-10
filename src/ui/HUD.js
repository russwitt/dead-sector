// HUD — health bar, lives icons, score, level display
import { drawText, measureText } from './Text.js';

const SCALE = 2;

export class HUD {
  constructor(game) {
    this.game = game;
  }

  render(ctx, player, levelName, waveInfo) {
    const g = this.game;
    const W = g.WIDTH;

    // ── Score ─────────────────────────────────────────────────────
    drawText(ctx, `SCORE ${String(g.score).padStart(6, '0')}`, 8, 8, '#ffff44', SCALE);

    // ── High Score ────────────────────────────────────────────────
    const hsText = `HI ${String(g.highScore).padStart(6, '0')}`;
    const hsW = measureText(hsText, SCALE);
    drawText(ctx, hsText, W - hsW - 8, 8, '#888844', SCALE);

    // ── Level Name ────────────────────────────────────────────────
    const lvText = `LV${g.currentLevel + 1} ${levelName}`;
    const lvW = measureText(lvText, SCALE);
    drawText(ctx, lvText, Math.floor((W - lvW) / 2), 8, '#88ccff', SCALE);

    // ── Wave info ─────────────────────────────────────────────────
    if (waveInfo) {
      const wText = `WAVE ${waveInfo.current}/${waveInfo.total}`;
      const wW = measureText(wText, SCALE);
      drawText(ctx, wText, Math.floor((W - wW) / 2), 8 + 7 * SCALE + 2, '#aaaaaa', SCALE);
    }

    // ── Health Bar ────────────────────────────────────────────────
    const barX = 8;
    const barY = g.HEIGHT - 18;
    const barW = 100;
    const barH = 8;
    drawText(ctx, 'HP', barX, barY - 10, '#ffffff', SCALE);
    ctx.fillStyle = '#440000';
    ctx.fillRect(barX, barY, barW, barH);
    const hpPct = Math.max(0, player.hp / player.maxHp);
    const hpColor = hpPct > 0.5 ? '#44ff44' : hpPct > 0.25 ? '#ffaa00' : '#ff3333';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, Math.round(barW * hpPct), barH);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // ── Lives ─────────────────────────────────────────────────────
    const livesX = 8;
    const livesY = g.HEIGHT - 36;
    drawText(ctx, `LIVES`, livesX, livesY, '#aaaaaa', SCALE);
    for (let i = 0; i < g.lives; i++) {
      ctx.fillStyle = '#4488ff';
      const lx = livesX + 5 * 6 * SCALE + 4 + i * 14;
      ctx.fillRect(lx, livesY + 1, 10, 10);
      ctx.fillStyle = '#88bbff';
      ctx.fillRect(lx + 3, livesY + 1, 4, 4);
    }
  }
}
