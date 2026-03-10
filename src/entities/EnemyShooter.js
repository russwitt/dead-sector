import { Enemy, EnemyState } from './Enemy.js';
import { Bullet } from './Bullet.js';

const PREFERRED_DIST = 160;   // px — tries to stay this far
const FIRE_RANGE = 260;
const FIRE_RATE = 1.8;        // seconds between shots
const BULLET_SPEED = 220;

export class EnemyShooter extends Enemy {
  constructor(x, y, opts = {}) {
    const speedMult = opts.speedMult || 1;
    super(x, y, 12, 12, {
      hp: 3,
      speed: 65 * speedMult,
      scoreValue: 20,
    });
    this.fireTimer = FIRE_RATE * Math.random(); // stagger initial shot
    this._bulletsToSpawn = [];
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

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    this.facingLeft = dx < 0;

    // Move: maintain preferred distance
    const diff = dist - PREFERRED_DIST;
    if (Math.abs(diff) > 20) {
      const sign = diff > 0 ? 1 : -1;
      const moveX = nx * sign + this.sepX * 0.3;
      const moveY = ny * sign + this.sepY * 0.3;
      const mag = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
      this.x += (moveX / mag) * this.speed * dt;
      this.y += (moveY / mag) * this.speed * dt;
    }

    // Shoot
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (dist <= FIRE_RANGE && this.fireTimer <= 0) {
      this.fireTimer = FIRE_RATE;
      const angle = Math.atan2(dy, dx);
      // Add slight inaccuracy
      const spread = (Math.random() - 0.5) * 0.15;
      this._bulletsToSpawn.push(
        new Bullet(this.x, this.y, angle + spread, true, BULLET_SPEED)
      );
      this.state = EnemyState.ATTACK;
    } else {
      this.state = EnemyState.CHASE;
    }
  }

  get bulletsToSpawn() { return this._bulletsToSpawn; }

  render(ctx, camera, atlas) {
    if (this.state === EnemyState.DEAD) return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const frameName = `shooter_${this.animFrame}`;
    const s = atlas.sprites[frameName];
    if (!s) return;

    let alpha = 1;
    let scale = 1;
    if (this.state === EnemyState.DYING) {
      const t = 1 - this.dyingTimer / this.DYING_DURATION;
      alpha = 1 - t;
      scale = 1 + t * 0.3;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(Math.round(sx), Math.round(sy));
    if (this.facingLeft) ctx.scale(-1, 1);
    if (scale !== 1) ctx.scale(scale, scale);
    ctx.drawImage(atlas.canvas, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);

    if (this.hitFlash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = Math.min(1, this.hitFlash / 0.12) * 0.8;
      ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
    ctx.globalAlpha = 1;

    if (this.state !== EnemyState.DYING) this._renderHealthBar(ctx, camera);
  }
}
