import { Enemy, EnemyState } from './Enemy.js';

const MELEE_RANGE = 22;
const ATTACK_DAMAGE = 1;
const ATTACK_COOLDOWN = 0.8;

export class EnemyGrunt extends Enemy {
  /**
   * @param {number} x
   * @param {number} y
   * @param {object} opts  — { elite: bool, speedMult: number }
   */
  constructor(x, y, opts = {}) {
    const elite = opts.elite || false;
    const speedMult = opts.speedMult || 1;
    super(x, y, 12, 12, {
      hp: elite ? 5 : 2,
      speed: (elite ? 75 : 90) * speedMult,
      scoreValue: elite ? 25 : 10,
    });
    this.elite = elite;
    this.attackCooldown = 0;
    this.spriteBase = elite ? 'elite' : 'grunt';
  }

  update(dt, player, _bullets, particles) {
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

    // Chase
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this._chasePlayer(dt, player);

    // Attack (melee)
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (dist < MELEE_RANGE && this.attackCooldown <= 0) {
      this.state = EnemyState.ATTACK;
      this.attackCooldown = ATTACK_COOLDOWN;
      player.takeDamage(ATTACK_DAMAGE);
      if (particles) particles.playerHit(player.x, player.y);
    } else {
      this.state = EnemyState.CHASE;
    }
  }

  render(ctx, camera, atlas) {
    if (this.state === EnemyState.DEAD) return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const frameName = `${this.spriteBase}_${this.animFrame}`;
    const s = atlas.sprites[frameName];
    if (!s) return;

    // Dying: shrink + fade
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

    // Hit flash
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
