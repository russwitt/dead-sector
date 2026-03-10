// Game — global state + scene manager
// State machine: MENU → PLAYING → LEVEL_COMPLETE → PLAYING → GAME_OVER → MENU

import { GameLoop } from './GameLoop.js';
import { Keyboard } from './input/Keyboard.js';
import { Mouse } from './input/Mouse.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { LevelCompleteScene } from './scenes/LevelCompleteScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { buildSpriteAtlas } from './data/sprites.js';
import { LEVELS } from './data/levels.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.WIDTH = 640;
    this.HEIGHT = 480;

    // Global state
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 0;   // index into LEVELS
    this.highScore = parseInt(localStorage.getItem('deadSectorHS') || '0', 10);

    // Input singletons
    this.keyboard = new Keyboard();
    this.mouse = new Mouse(canvas);

    // Sprite atlas (built once at startup)
    this.atlas = null;

    // Scene management
    this.currentScene = null;
    this._pendingScene = null;

    // Game loop
    this.loop = new GameLoop(
      (dt) => this._update(dt),
      (alpha) => this._render(alpha)
    );
  }

  async init() {
    this.atlas = await buildSpriteAtlas();
    this.switchScene(new MenuScene());
    this.loop.start();
  }

  // ── Scene Management ────────────────────────────────────────────
  switchScene(scene) {
    if (this.currentScene) this.currentScene.onExit();
    this.currentScene = scene;
    this.currentScene.onEnter(this);
  }

  // ── Convenience scene transitions ───────────────────────────────
  startGame() {
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 0;
    this.switchScene(new GameScene());
  }

  levelComplete() {
    this.currentLevel++;
    if (this.currentLevel >= LEVELS.length) {
      // All levels beaten — show game over with win flag
      this.switchScene(new GameOverScene(true));
    } else {
      this.switchScene(new LevelCompleteScene());
    }
  }

  nextLevel() {
    this.switchScene(new GameScene());
  }

  gameOver() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('deadSectorHS', String(this.highScore));
    }
    this.switchScene(new GameOverScene(false));
  }

  returnToMenu() {
    this.switchScene(new MenuScene());
  }

  // ── Loop callbacks ───────────────────────────────────────────────
  _update(dt) {
    if (this.currentScene) this.currentScene.update(dt);
    // Flush just-pressed states after scene update
    this.keyboard.flush();
    this.mouse.flush();
  }

  _render(alpha) {
    const { ctx, WIDTH, HEIGHT } = this;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (this.currentScene) this.currentScene.render(ctx, alpha);
  }
}
