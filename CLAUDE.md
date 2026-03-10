# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

ES modules require a local HTTP server — opening `index.html` directly over `file://` will not work.

```bash
npx serve .          # serves on http://localhost:3000
```

There is no build step, bundler, transpiler, or test suite. The game runs directly from source.

## Git & GitHub

**Commit and push to GitHub after every meaningful unit of work** — after fixing a bug, adding a feature, or completing any logical change. This ensures work is never lost and the repo always reflects current state.

Remote: `https://github.com/russwitt/dead-sector` (branch: `master`)

```bash
git add <specific files>
git commit -m "descriptive message"
git push
```

Commit message conventions:
- `fix: <what was broken and how it was fixed>`
- `feat: <what was added>`
- `refactor: <what was restructured>`
- `chore: <config, tooling, non-code changes>`

Always stage specific files by name rather than `git add .` to avoid accidentally committing unintended files.

## Architecture

The game is a **scene-based state machine** with a fixed-timestep game loop. Everything connects through `src/Game.js`.

### State Flow
```
MenuScene → GameScene → LevelCompleteScene → GameScene (next level)
                     ↘ GameOverScene (lives=0 or all 5 levels cleared)
GameOverScene → MenuScene
```

### Core Loop (`src/GameLoop.js`)
Fixed 1/60s timestep with accumulator pattern. Calls `game._update(dt)` then `game._render(alpha)`. Delta is capped at 250ms.

### Scene System (`src/scenes/`)
All scenes extend `Scene.js` (base class with `onEnter(game)`, `onExit()`, `update(dt)`, `render(ctx)`). `game.switchScene(scene)` handles the transition. The active scene receives the `game` object on `onEnter` and stores it as `this.game`.

### GameScene (`src/scenes/GameScene.js`)
The main gameplay scene — composes all systems:
- Creates `Player`, `Camera`, `ParticleSystem`, `CollisionSystem`, `SpawnSystem`, `HUD`
- Maintains `this.enemies[]` and `this.bullets[]` arrays
- On each update: spawns → updates player → updates enemies → updates bullets → particles → collision → prune dead entities
- Enemies and the boss append to `this.bullets[]` via their `bulletsToSpawn` getter

### Entity Design (`src/entities/`)
- `Entity` — base AABB: `x/y` are world-center, `w/h` are half-extents. `overlaps(other)` for AABB test.
- `Player` — WASD/arrow movement, mouse aim (`atan2`), click-to-fire, invincibility timer after hit.
- `Enemy` — base with state machine (`IDLE→CHASE→ATTACK→DYING→DEAD`), separation steering via `sepX/sepY` set by `CollisionSystem`.
- `EnemyGrunt` — melee, direct chase. `elite: true` option gives 5HP + different sprite.
- `EnemyShooter` — maintains preferred distance (160px), fires with spread inaccuracy.
- `EnemyBoss` — 3-phase orbit+shoot AI; phase 3 adds rush attacks and 5-way spread. Draws its own health bar in screen-space inside `render()`.
- `Bullet` — `fromEnemy` flag distinguishes player vs. enemy projectiles. Boss overrides `spriteName` to `bullet_boss` after construction.

### Sprite Atlas (`src/data/sprites.js`)
`buildSpriteAtlas()` draws all pixel art into a single offscreen `<canvas>` at startup. Sprites are defined as arrays of strings (character grids) mapped through a palette object (`'.'` = transparent). Scale is 4px per art-pixel (8×8 art → 32×32 canvas pixels, 16×16 → 64×64).

Atlas layout (manually positioned rows):
- Row 0 (y=0): `player_0`, `player_1`
- Row 1 (y=34): `grunt_0`, `grunt_1`, `elite_0`, `elite_1`
- Row 2 (y=68): `shooter_0`, `shooter_1`
- Row 3 (y=102): `bullet_player`, `bullet_enemy`, `bullet_boss`
- Row 4 (y=128): `boss_0`, `boss_1`

`drawSprite()` is exported but rendering is mostly done inline via `ctx.drawImage(atlas.canvas, s.x, s.y, ...)`. Hit-flash uses `source-atop` composite op.

### Level Data (`src/data/levels.js`)
Array of 5 level descriptors. Each has `worldWidth/Height`, `backgroundColor/floorColor`, `playerSpawn`, `scoreMultiplier`, optional `speedMult`, and `waves[]`. Waves have `triggerCondition: 'start' | 'enemiesCleared'` and an `enemies[]` array with `{type, count}` or `{type, count, x, y}` for fixed spawns (boss).

### Systems
- **`SpawnSystem`** — drives wave progression; `update(enemies)` returns newly spawned entities each frame; `isComplete(enemies)` returns true only after all waves triggered and all enemies dead.
- **`CollisionSystem`** — AABB: player bullets vs enemies, enemy bullets vs player, world bounds clamping, and separation steering computation (sets `sepX/sepY` on each enemy).
- **`ParticleSystem`** — owns screen shake state (`shakeX/shakeY`); `Camera.follow()` consumes these offsets.
- **`Camera`** — simple center-on-target with world-bound clamping. `camera.x/y` is the world-space top-left of the viewport; subtract from entity world coords to get screen coords.

### UI (`src/ui/`)
- `Text.js` — 5×7 bitmap font, drawn with `fillRect`. `drawText(ctx, str, x, y, color, scale)` and `measureText(str, scale)`.
- `HUD.js` — rendered in screen space after all world entities; reads directly from `game.score`, `game.lives`, `game.highScore`.

### Input (`src/input/`)
- `Keyboard` — `isDown(code)`, `isJustPressed(code)`, `anyDown(...codes)`. `flush()` called by `Game._update()` after scene update.
- `Mouse` — `x/y` mapped to logical 640×480 coords accounting for CSS scaling. `clicked` is one-frame; `down` is held. `flush()` clears `clicked`.

### Global State (`src/Game.js`)
`game.score`, `game.lives`, `game.currentLevel` (0-indexed into `LEVELS`), `game.highScore` (synced to `localStorage` key `deadSectorHS`), `game.atlas` (sprite atlas), `game.keyboard`, `game.mouse`.
