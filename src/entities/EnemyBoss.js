import { Enemy, EnemyState } from './Enemy.js';
import { Bullet } from './Bullet.js';

// Boss has 3 phases based on HP thresholds
const PHASE_THRESHOLDS = [0.66, 0.33]; // 66% and 33% HP
const TOTAL_HP = 60;
const SPEED = 55;

// Phase 1: slow circular orbit + single shots
// Phase 2: faster + 3-way spread
// Phase 3: fastest + 5-way spread + rush

export class EnemyBoss extends Enemy {
  constructor(x, y) {
    super(x, y, 28, 28, {
      hp: TOTAL_HP,
      speed: SPEED,
      scoreValue: 500,
    });
    this.phase = 1;
    this.fireTimer = 0;
    this._bulletsToSpawn = [];

    // Boss-specific movement: orbit
    this.orbitAngle = 0;
    this.orbitRadius = 180;
    this.rushTimer = 0;
    this.isRushing = false;
    this.rushTargetX = 0;
    this.rushTargetY = 0;

    // Phase intro flash
    this.phaseFlash = 0;
  }

  get phase() { return this._phase; }
  set phase(v) {
    this._phase = v;
    this.phaseFlash = 0.6;
  }

  _getPhase() {
    const pct = this.hp / this.maxHp;
    if (pct > PHASE_THRESHOLDS[0]) return 1;
    if (pct > PHASE_THRESHOLDS[1]) return 2;
    return 3;
  }

  update(dt, player, _bullets, particles) {
    this._bulletsToSpawn = [];
    this._updateAnimation(dt);

    if (this.state === EnemyState.DYING) {
      this._updateDying(dt);
      return;
    }
    if (this.state === EnemyState.DEAD) return;

    if (this.state === EnemyState.IDLE) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) this.state = EnemyState.CHASE;
      return;
    }

    // Check phase transitions
    const newPhase = this._getPhase();
    if (newPhase !== this._phase) {
      this._phase = newPhase;
      this.phaseFlash = 0.6;
      if (particles) particles.bossPhase(this.x, this.y);
    }

    if (this.phaseFlash > 0) this.phaseFlash -= dt;

    const p = this._phase;

    // ── Phase 3: Rush attack ──────────────────────────────────────
    if (p === 3 && !this.isRushing && Math.random() < dt * 0.8) {
      this.isRushing = true;
      this.rushTimer = 0.6;
      this.rushTargetX = player.x;
      this.rushTargetY = player.y;
    }

    if (this.isRushing) {
      const dx = this.rushTargetX - this.x;
      const dy = this.rushTargetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.x += (dx / dist) * 280 * dt;
      this.y += (dy / dist) * 280 * dt;
      this.rushTimer -= dt;
      if (this.rushTimer <= 0) this.isRushing = false;
    } else {
      // Orbit around player
      const orbitSpeed = p === 1 ? 0.6 : p === 2 ? 0.9 : 1.2;
      this.orbitAngle += orbitSpeed * dt;
      const targetX = player.x + Math.cos(this.orbitAngle) * this.orbitRadius;
      const targetY = player.y + Math.sin(this.orbitAngle) * this.orbitRadius;
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const spd = p === 1 ? SPEED : p === 2 ? SPEED * 1.4 : SPEED * 1.8;
      this.x += (dx / dist) * spd * dt;
      this.y += (dy / dist) * spd * dt;
    }

    this.facingLeft = player.x < this.x;

    // ── Shooting ──────────────────────────────────────────────────
    const fireRate = p === 1 ? 1.4 : p === 2 ? 0.9 : 0.6;
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = fireRate;
      const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
      const count = p === 1 ? 1 : p === 2 ? 3 : 5;
      const spread = p === 1 ? 0 : p === 2 ? 0.3 : 0.25;
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * spread;
        const b = new Bullet(this.x, this.y, baseAngle + offset, true, 240, 1);
        b.spriteName = 'bullet_boss';
        this._bulletsToSpawn.push(b);
      }
    }
  }

  get bulletsToSpawn() { return this._bulletsToSpawn; }

  render(ctx, camera, atlas) {
    if (this.state === EnemyState.DEAD) return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const frameName = `boss_${this.animFrame}`;
    const s = atlas.sprites[frameName];
    if (!s) return;

    let alpha = 1;
    let scale = 1;
    if (this.state === EnemyState.DYING) {
      const t = 1 - this.dyingTimer / this.DYING_DURATION;
      alpha = 1 - t;
      scale = 1 + t * 0.5;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(Math.round(sx), Math.round(sy));
    if (this.facingLeft) ctx.scale(-1, 1);
    if (scale !== 1) ctx.scale(scale, scale);
    ctx.drawImage(atlas.canvas, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);

    // Phase flash
    if (this.phaseFlash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      const flashColor = this._phase === 2 ? '#ff8800' : '#ff0000';
      ctx.fillStyle = flashColor;
      ctx.globalAlpha = (this.phaseFlash / 0.6) * 0.7 * alpha;
      ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
      ctx.globalCompositeOperation = 'source-over';
    }

    if (this.hitFlash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = Math.min(1, this.hitFlash / 0.12) * 0.9 * alpha;
      ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
    ctx.globalAlpha = 1;

    // Boss health bar (wide, at top of screen in world)
    if (this.state !== EnemyState.DYING) {
      this._renderBossHealthBar(ctx);
    }
  }

  _renderBossHealthBar(ctx) {
    const bw = 300;
    const bh = 8;
    const bx = 320 - bw / 2;
    const by = 12;
    ctx.fillStyle = '#220022';
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    ctx.fillStyle = '#880088';
    ctx.fillRect(bx, by, bw, bh);
    const pct = this.hp / this.maxHp;
    const phaseColor = this._phase === 1 ? '#cc33ff' : this._phase === 2 ? '#ff8800' : '#ff3333';
    ctx.fillStyle = phaseColor;
    ctx.fillRect(bx, by, bw * pct, bh);
    // Phase markers
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx + bw * PHASE_THRESHOLDS[0] - 1, by, 2, bh);
    ctx.fillRect(bx + bw * PHASE_THRESHOLDS[1] - 1, by, 2, bh);
  }
}
