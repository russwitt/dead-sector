import { Scene } from './Scene.js';
import { Player } from '../entities/Player.js';
import { Camera } from '../systems/Camera.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { HUD } from '../ui/HUD.js';
import { LEVELS } from '../data/levels.js';
import { drawText, measureText } from '../ui/Text.js';

// Map tile size for floor grid rendering
const TILE = 40;

export class GameScene extends Scene {
  onEnter(game) {
    this.game = game;
    const level = LEVELS[game.currentLevel];
    this.level = level;

    // World
    this.worldW = level.worldWidth;
    this.worldH = level.worldHeight;

    // Player
    this.player = new Player(level.playerSpawn.x, level.playerSpawn.y);

    // Systems
    this.camera = new Camera(game.WIDTH, game.HEIGHT, this.worldW, this.worldH);
    this.particles = new ParticleSystem();
    this.collision = new CollisionSystem(this.worldW, this.worldH);
    this.spawner = new SpawnSystem(level, level.speedMult || 1);
    this.hud = new HUD(game);

    // Entity lists
    this.enemies = [];
    this.bullets = [];

    // Level state
    this.complete = false;
    this.completeTimer = 0;
    this.COMPLETE_DELAY = 2.0;

    // Wave display
    this.waveDisplayTimer = 0;
    this.waveText = '';

    // Pre-render floor tile pattern into offscreen canvas for perf
    this._buildFloor();
  }

  _buildFloor() {
    const c = document.createElement('canvas');
    c.width = this.worldW;
    c.height = this.worldH;
    const ctx = c.getContext('2d');
    ctx.fillStyle = this.level.floorColor;
    ctx.fillRect(0, 0, this.worldW, this.worldH);
    // Grid lines
    ctx.strokeStyle = this.level.backgroundColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.worldW; x += TILE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.worldH); ctx.stroke();
    }
    for (let y = 0; y <= this.worldH; y += TILE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.worldW, y); ctx.stroke();
    }
    this._floorCanvas = c;
  }

  update(dt) {
    const { game, player, enemies, bullets, particles, collision, spawner } = this;

    if (this.complete) {
      this.completeTimer -= dt;
      if (this.completeTimer <= 0) game.levelComplete();
      return;
    }

    // ── Spawn new enemies ───────────────────────────────────────────
    const newEnemies = spawner.update(enemies);
    if (newEnemies.length > 0) {
      this.enemies.push(...newEnemies);
      const wi = spawner.currentWave + 1;
      this.waveText = `WAVE ${wi}`;
      this.waveDisplayTimer = 2.0;
    }

    // ── Update player ───────────────────────────────────────────────
    player.update(dt, game.keyboard, game.mouse, this.camera, particles);

    // Player bullets
    for (const b of player.bulletsToSpawn) bullets.push(b);

    // ── Update enemies ───────────────────────────────────────────────
    for (const e of enemies) {
      e.update(dt, player, bullets, particles);
      // Collect enemy bullets
      if (e.bulletsToSpawn) {
        for (const b of e.bulletsToSpawn) bullets.push(b);
      }
    }

    // ── Update bullets ───────────────────────────────────────────────
    for (const b of bullets) b.update(dt);

    // ── Particles ────────────────────────────────────────────────────
    particles.update(dt);

    // ── Collision ────────────────────────────────────────────────────
    collision.update(player, enemies, bullets, particles, this.camera, (pts) => {
      game.score += Math.round(pts * (this.level.scoreMultiplier || 1));
      if (game.score > game.highScore) game.highScore = game.score;
    });

    // ── Camera ───────────────────────────────────────────────────────
    this.camera.follow(player, particles.shakeX, particles.shakeY);

    // ── Prune dead entities ──────────────────────────────────────────
    this._prune();

    // ── Player death ─────────────────────────────────────────────────
    if (player.hp <= 0) {
      game.lives--;
      if (game.lives <= 0) {
        game.gameOver();
      } else {
        // Respawn player
        player.hp = player.maxHp;
        player.x = this.level.playerSpawn.x;
        player.y = this.level.playerSpawn.y;
        player.invTimer = 2;
        particles.shake(6, 0.3);
      }
    }

    // ── Level complete ────────────────────────────────────────────────
    if (!this.complete && spawner.isComplete(enemies)) {
      this.complete = true;
      this.completeTimer = this.COMPLETE_DELAY;
    }

    // ── Wave text timer ───────────────────────────────────────────────
    if (this.waveDisplayTimer > 0) this.waveDisplayTimer -= dt;
  }

  _prune() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (!this.enemies[i].active) this.enemies.splice(i, 1);
    }
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      if (!this.bullets[i].active) this.bullets.splice(i, 1);
    }
  }

  render(ctx) {
    const { camera, player, enemies, bullets, particles, level } = this;

    // ── Background ────────────────────────────────────────────────────
    ctx.fillStyle = level.backgroundColor;
    ctx.fillRect(0, 0, this.game.WIDTH, this.game.HEIGHT);

    // ── Floor ─────────────────────────────────────────────────────────
    ctx.drawImage(
      this._floorCanvas,
      camera.x, camera.y, this.game.WIDTH, this.game.HEIGHT,
      0, 0, this.game.WIDTH, this.game.HEIGHT
    );

    // ── World border ─────────────────────────────────────────────────
    ctx.strokeStyle = '#ff222244';
    ctx.lineWidth = 4;
    ctx.strokeRect(-camera.x, -camera.y, this.worldW, this.worldH);

    // ── Bullets (behind entities) ─────────────────────────────────────
    for (const b of bullets) b.render(ctx, camera, this.game.atlas);

    // ── Enemies ───────────────────────────────────────────────────────
    for (const e of enemies) e.render(ctx, camera, this.game.atlas);

    // ── Player ───────────────────────────────────────────────────────
    player.render(ctx, camera, this.game.atlas);

    // ── Particles ─────────────────────────────────────────────────────
    particles.render(ctx, camera);

    // ── HUD ───────────────────────────────────────────────────────────
    const waveInfo = {
      current: this.spawner.currentWave + 1,
      total: this.spawner.waves.length,
    };
    this.hud.render(ctx, player, level.name, waveInfo);

    // ── Enemy count ───────────────────────────────────────────────────
    const alive = this.enemies.filter(e => e.isAlive()).length;
    const ecText = `ENEMIES ${alive}`;
    drawText(ctx, ecText, this.game.WIDTH - measureText(ecText, 2) - 8, this.game.HEIGHT - 18, '#cc4444', 2);

    // ── Wave announcement ─────────────────────────────────────────────
    if (this.waveDisplayTimer > 0) {
      const alpha = Math.min(1, this.waveDisplayTimer);
      ctx.globalAlpha = alpha;
      const wt = this.waveText;
      const wtW = measureText(wt, 3);
      drawText(ctx, wt, Math.floor((this.game.WIDTH - wtW) / 2), Math.floor(this.game.HEIGHT / 2) - 20, '#ffff44', 3);
      ctx.globalAlpha = 1;
    }

    // ── Level complete overlay ────────────────────────────────────────
    if (this.complete) {
      const alpha = 1 - this.completeTimer / this.COMPLETE_DELAY;
      ctx.fillStyle = `rgba(0,0,0,${alpha * 0.5})`;
      ctx.fillRect(0, 0, this.game.WIDTH, this.game.HEIGHT);
      if (alpha > 0.3) {
        const msg = 'LEVEL CLEAR!';
        drawText(ctx, msg, Math.floor((this.game.WIDTH - measureText(msg, 4)) / 2), 200, '#44ffaa', 4);
      }
    }
  }
}
