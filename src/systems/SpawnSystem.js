// Wave management — spawns enemies per level wave data
import { EnemyGrunt } from '../entities/EnemyGrunt.js';
import { EnemyShooter } from '../entities/EnemyShooter.js';
import { EnemyBoss } from '../entities/EnemyBoss.js';

export class SpawnSystem {
  /**
   * @param {object} levelData  — from levels.js
   * @param {number} speedMult  — from levelData.speedMult (optional)
   */
  constructor(levelData, speedMult = 1) {
    this.waves = levelData.waves;
    this.worldWidth = levelData.worldWidth;
    this.worldHeight = levelData.worldHeight;
    this.speedMult = speedMult;
    this.currentWave = -1;
    this.allWavesTriggered = false;
    this._newEnemies = [];
  }

  /**
   * Check if the next wave should trigger.
   * @param {Enemy[]} enemies  — current active enemy list
   * @returns {Enemy[]}        — newly spawned enemies this frame
   */
  update(enemies) {
    this._newEnemies = [];
    const aliveCount = enemies.filter(e => e.active && e.isAlive()).length;

    if (this.currentWave === -1) {
      // Trigger first wave on start
      this._triggerWave(0);
    } else if (
      this.currentWave < this.waves.length - 1 &&
      this.waves[this.currentWave + 1].triggerCondition === 'enemiesCleared' &&
      aliveCount === 0
    ) {
      this._triggerWave(this.currentWave + 1);
    }

    return this._newEnemies;
  }

  isComplete(enemies) {
    if (!this.allWavesTriggered) return false;
    return enemies.filter(e => e.active && e.isAlive()).length === 0;
  }

  _triggerWave(index) {
    this.currentWave = index;
    if (index === this.waves.length - 1) this.allWavesTriggered = true;
    const wave = this.waves[index];
    for (const def of wave.enemies) {
      for (let i = 0; i < def.count; i++) {
        const pos = def.x !== undefined
          ? { x: def.x, y: def.y }
          : this._randomEdgePos();
        const e = this._createEnemy(def.type, pos.x, pos.y);
        if (e) this._newEnemies.push(e);
      }
    }
  }

  _createEnemy(type, x, y) {
    const sm = this.speedMult;
    switch (type) {
      case 'grunt':   return new EnemyGrunt(x, y, { speedMult: sm });
      case 'elite':   return new EnemyGrunt(x, y, { elite: true, speedMult: sm });
      case 'shooter': return new EnemyShooter(x, y, { speedMult: sm });
      case 'boss':    return new EnemyBoss(x, y);
      default:        return null;
    }
  }

  _randomEdgePos() {
    const edge = Math.floor(Math.random() * 4);
    const margin = 30;
    switch (edge) {
      case 0: return { x: Math.random() * this.worldWidth, y: margin };
      case 1: return { x: Math.random() * this.worldWidth, y: this.worldHeight - margin };
      case 2: return { x: margin, y: Math.random() * this.worldHeight };
      default: return { x: this.worldWidth - margin, y: Math.random() * this.worldHeight };
    }
  }
}
