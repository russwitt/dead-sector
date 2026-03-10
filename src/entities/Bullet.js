import { Entity } from './Entity.js';

const PLAYER_SPEED = 480;  // px/s
const ENEMY_SPEED = 280;
const LIFETIME = 2.0;      // seconds before auto-despawn

export class Bullet extends Entity {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} angle  radians
   * @param {boolean} fromEnemy
   * @param {number} [speed]
   * @param {number} [damage]
   */
  constructor(x, y, angle, fromEnemy = false, speed = null, damage = null) {
    super(x, y, 4, 4);
    this.fromEnemy = fromEnemy;
    const spd = speed !== null ? speed : (fromEnemy ? ENEMY_SPEED : PLAYER_SPEED);
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd;
    this.damage = damage !== null ? damage : (fromEnemy ? 1 : 1);
    this.lifetime = LIFETIME;
    this.spriteName = fromEnemy ? 'bullet_enemy' : 'bullet_player';
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.active = false;
  }

  render(ctx, camera, atlas) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const s = atlas.sprites[this.spriteName];
    ctx.drawImage(
      atlas.canvas,
      s.x, s.y, s.w, s.h,
      Math.round(sx - s.w / 2),
      Math.round(sy - s.h / 2),
      s.w, s.h
    );
  }
}
