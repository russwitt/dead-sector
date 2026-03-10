// Particle system — muzzle flash, death particles, player hit, screen shake

const COLORS_DEATH = ['#ff4444', '#ff8844', '#ffcc44', '#ffffff'];
const COLORS_BOSS  = ['#cc33ff', '#ff33cc', '#ff8800', '#ffff44'];
const COLORS_FLASH = ['#ffff88', '#ffcc44', '#ffffff'];
const COLORS_PLAYER_HIT = ['#4488ff', '#88bbff', '#ffffff'];

class Particle {
  constructor(x, y, vx, vy, color, life, size = 3) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.active = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.92;
    this.vy *= 0.92;
    this.life -= dt;
    if (this.life <= 0) this.active = false;
  }

  render(ctx, camera) {
    const alpha = this.life / this.maxLife;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    const s = Math.max(1, this.size * alpha);
    ctx.fillRect(Math.round(sx - s / 2), Math.round(sy - s / 2), Math.ceil(s), Math.ceil(s));
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shakeX = 0;
    this.shakeY = 0;
    this._shakeAmt = 0;
    this._shakeDuration = 0;
    this._shakeTimer = 0;
  }

  _burst(x, y, count, colors, minSpd, maxSpd, life, size = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = minSpd + Math.random() * (maxSpd - minSpd);
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, color, life + Math.random() * 0.2, size));
    }
  }

  muzzleFlash(x, y) {
    this._burst(x, y, 5, COLORS_FLASH, 60, 180, 0.12, 4);
    this.shake(2, 0.05);
  }

  enemyDeath(x, y) {
    this._burst(x, y, 14, COLORS_DEATH, 40, 200, 0.55, 4);
    this.shake(3, 0.1);
  }

  playerHit(x, y) {
    this._burst(x, y, 8, COLORS_PLAYER_HIT, 50, 160, 0.4, 3);
    this.shake(5, 0.18);
  }

  bossPhase(x, y) {
    this._burst(x, y, 30, COLORS_BOSS, 60, 280, 0.7, 6);
    this.shake(8, 0.3);
  }

  shake(amount, duration) {
    if (amount > this._shakeAmt) {
      this._shakeAmt = amount;
      this._shakeDuration = duration;
      this._shakeTimer = duration;
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (!this.particles[i].active) this.particles.splice(i, 1);
    }

    // Screen shake
    if (this._shakeTimer > 0) {
      this._shakeTimer -= dt;
      const t = this._shakeTimer / this._shakeDuration;
      const amt = this._shakeAmt * t;
      this.shakeX = (Math.random() - 0.5) * amt * 2;
      this.shakeY = (Math.random() - 0.5) * amt * 2;
      if (this._shakeTimer <= 0) {
        this.shakeX = 0;
        this.shakeY = 0;
        this._shakeAmt = 0;
      }
    }
  }

  render(ctx, camera) {
    for (const p of this.particles) {
      p.render(ctx, camera);
    }
    ctx.globalAlpha = 1;
  }
}
