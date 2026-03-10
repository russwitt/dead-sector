import { Entity } from './Entity.js';
import { Bullet } from './Bullet.js';

const SPEED = 180;        // px/s
const FIRE_RATE = 0.15;   // seconds between shots
const MAX_HP = 5;
const INVINCIBLE_TIME = 1.5; // seconds of invincibility after hit

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 10, 10);
    this.hp = MAX_HP;
    this.maxHp = MAX_HP;

    this.vx = 0;
    this.vy = 0;

    this.angle = 0;       // aim angle in radians
    this.fireTimer = 0;
    this.invTimer = 0;    // invincibility timer

    // Animation
    this.animTimer = 0;
    this.animFrame = 0;
    this.moving = false;

    // Bullets to spawn (returned from update for GameScene to collect)
    this._bulletsToSpawn = [];
  }

  update(dt, keyboard, mouse, camera, particles) {
    this._bulletsToSpawn = [];

    // ── Movement ──────────────────────────────────────────────────
    let dx = 0, dy = 0;
    if (keyboard.anyDown('ArrowLeft', 'KeyA'))  dx -= 1;
    if (keyboard.anyDown('ArrowRight','KeyD'))  dx += 1;
    if (keyboard.anyDown('ArrowUp',  'KeyW'))   dy -= 1;
    if (keyboard.anyDown('ArrowDown','KeyS'))   dy += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.moving = dx !== 0 || dy !== 0;
    this.x += dx * SPEED * dt;
    this.y += dy * SPEED * dt;

    // ── Aim ───────────────────────────────────────────────────────
    // mouse coords are in canvas space; convert to world space
    const worldMouseX = mouse.x + camera.x;
    const worldMouseY = mouse.y + camera.y;
    this.angle = Math.atan2(worldMouseY - this.y, worldMouseX - this.x);

    // ── Shooting ──────────────────────────────────────────────────
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if ((mouse.down || mouse.clicked) && this.fireTimer <= 0) {
      this.fireTimer = FIRE_RATE;
      const bx = this.x + Math.cos(this.angle) * 18;
      const by = this.y + Math.sin(this.angle) * 18;
      this._bulletsToSpawn.push(new Bullet(bx, by, this.angle, false));
      // Muzzle flash
      if (particles) particles.muzzleFlash(bx, by);
    }

    // ── Animation ─────────────────────────────────────────────────
    if (this.moving) {
      this.animTimer += dt;
      if (this.animTimer > 0.15) {
        this.animTimer = 0;
        this.animFrame = 1 - this.animFrame;
      }
    } else {
      this.animFrame = 0;
    }

    // ── Invincibility ─────────────────────────────────────────────
    if (this.invTimer > 0) this.invTimer -= dt;
  }

  takeDamage(amount = 1) {
    if (this.invTimer > 0) return false;
    this.hp -= amount;
    this.invTimer = INVINCIBLE_TIME;
    return true;
  }

  isInvincible() { return this.invTimer > 0; }

  render(ctx, camera, atlas) {
    // Flicker when invincible
    if (this.invTimer > 0 && Math.floor(this.invTimer * 10) % 2 === 0) return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Determine flip: face right when angle in (-90, 90)
    const flipX = Math.abs(this.angle) > Math.PI / 2;
    const frameName = `player_${this.animFrame}`;

    ctx.save();
    ctx.translate(Math.round(sx), Math.round(sy));
    // Rotate sprite toward aim direction (just tilt slightly)
    // We'll keep the sprite upright and just flip
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(
      atlas.canvas,
      atlas.sprites[frameName].x, atlas.sprites[frameName].y,
      atlas.sprites[frameName].w, atlas.sprites[frameName].h,
      -atlas.sprites[frameName].w / 2,
      -atlas.sprites[frameName].h / 2,
      atlas.sprites[frameName].w,
      atlas.sprites[frameName].h
    );
    ctx.restore();
  }

  get bulletsToSpawn() { return this._bulletsToSpawn; }
}
