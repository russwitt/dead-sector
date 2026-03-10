import { Entity } from './Entity.js';

// Enemy state machine
export const EnemyState = {
  IDLE: 'IDLE',
  CHASE: 'CHASE',
  ATTACK: 'ATTACK',
  DYING: 'DYING',
  DEAD: 'DEAD',
};

export class Enemy extends Entity {
  constructor(x, y, w, h, opts = {}) {
    super(x, y, w, h);
    this.hp = opts.hp || 1;
    this.maxHp = this.hp;
    this.speed = opts.speed || 80;
    this.scoreValue = opts.scoreValue || 10;
    this.state = EnemyState.IDLE;
    this.stateTimer = 0.5;  // start idle briefly

    // Animation
    this.animTimer = 0;
    this.animFrame = 0;
    this.facingLeft = false;

    // Separation from other enemies
    this.sepX = 0;
    this.sepY = 0;

    // Flash on hit
    this.hitFlash = 0;

    // Dying animation timer
    this.dyingTimer = 0;
    this.DYING_DURATION = 0.35;
  }

  // Called by subclasses/systems to apply damage
  takeDamage(amount = 1, particles = null) {
    if (this.state === EnemyState.DYING || this.state === EnemyState.DEAD) return;
    this.hp -= amount;
    this.hitFlash = 0.12;
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = EnemyState.DYING;
      this.dyingTimer = this.DYING_DURATION;
      if (particles) particles.enemyDeath(this.x, this.y);
    }
  }

  isDead() { return this.state === EnemyState.DEAD; }
  isDying() { return this.state === EnemyState.DYING; }
  isAlive() { return this.state !== EnemyState.DYING && this.state !== EnemyState.DEAD; }

  // Shared movement toward player with separation
  _chasePlayer(dt, player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    // Blend separation steering
    const moveX = nx + this.sepX * 0.5;
    const moveY = ny + this.sepY * 0.5;
    const mag = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
    this.x += (moveX / mag) * this.speed * dt;
    this.y += (moveY / mag) * this.speed * dt;
    this.facingLeft = dx < 0;
  }

  _updateDying(dt) {
    this.dyingTimer -= dt;
    if (this.dyingTimer <= 0) {
      this.state = EnemyState.DEAD;
      this.active = false;
    }
  }

  _updateAnimation(dt) {
    this.animTimer += dt;
    if (this.animTimer > 0.2) {
      this.animTimer = 0;
      this.animFrame = 1 - this.animFrame;
    }
    if (this.hitFlash > 0) this.hitFlash -= dt;
  }

  // Draw health bar above enemy
  _renderHealthBar(ctx, camera) {
    if (this.hp >= this.maxHp) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const bw = this.w * 2;
    const bh = 3;
    const bx = sx - bw / 2;
    const by = sy - this.h - 6;
    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
  }

  // Subclasses override
  update(dt, player, bullets, particles) {}
  render(ctx, camera, atlas) {}
}
