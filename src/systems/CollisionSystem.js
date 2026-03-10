// AABB collision: bullets↔enemies, enemies↔player, world bounds

export class CollisionSystem {
  /**
   * @param {number} worldWidth
   * @param {number} worldHeight
   */
  constructor(worldWidth, worldHeight) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  /**
   * Run all collision checks for one frame.
   * @param {Player} player
   * @param {Enemy[]} enemies
   * @param {Bullet[]} bullets  — mix of player and enemy bullets
   * @param {ParticleSystem} particles
   * @param {Camera} camera
   * @param {function(number):void} onScoreAdd
   */
  update(player, enemies, bullets, particles, camera, onScoreAdd) {
    // ── Bullet ↔ Enemy ───────────────────────────────────────────
    for (const b of bullets) {
      if (!b.active || b.fromEnemy) continue;
      for (const e of enemies) {
        if (!e.active || !e.isAlive()) continue;
        if (b.overlaps(e)) {
          b.active = false;
          e.takeDamage(b.damage, particles);
          if (e.isDying() || e.isDead()) {
            onScoreAdd(e.scoreValue);
          }
          break;
        }
      }
    }

    // ── Enemy Bullet ↔ Player ────────────────────────────────────
    for (const b of bullets) {
      if (!b.active || !b.fromEnemy) continue;
      if (player.active && b.overlaps(player)) {
        b.active = false;
        player.takeDamage(b.damage);
        if (particles) particles.playerHit(player.x, player.y);
      }
    }

    // ── World bounds — bullets ────────────────────────────────────
    for (const b of bullets) {
      if (!b.active) continue;
      if (b.x < 0 || b.x > this.worldWidth || b.y < 0 || b.y > this.worldHeight) {
        b.active = false;
      }
    }

    // ── World bounds — player ─────────────────────────────────────
    const p = player;
    p.x = Math.max(p.w, Math.min(this.worldWidth - p.w, p.x));
    p.y = Math.max(p.h, Math.min(this.worldHeight - p.h, p.y));

    // ── World bounds — enemies ────────────────────────────────────
    for (const e of enemies) {
      if (!e.active || !e.isAlive()) continue;
      e.x = Math.max(e.w, Math.min(this.worldWidth - e.w, e.x));
      e.y = Math.max(e.h, Math.min(this.worldHeight - e.h, e.y));
    }

    // ── Enemy separation steering ─────────────────────────────────
    const SEP_RADIUS = 40;
    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i];
      if (!a.active || !a.isAlive()) continue;
      a.sepX = 0;
      a.sepY = 0;
      for (let j = 0; j < enemies.length; j++) {
        if (i === j) continue;
        const b = enemies[j];
        if (!b.active || !b.isAlive()) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < SEP_RADIUS) {
          a.sepX += (dx / dist) * (1 - dist / SEP_RADIUS);
          a.sepY += (dy / dist) * (1 - dist / SEP_RADIUS);
        }
      }
    }
  }
}
