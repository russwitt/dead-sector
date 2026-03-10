// Programmatic sprite atlas — all pixel art defined as character grids
// Scale: 4px per art-pixel → 8×8 art = 32×32 canvas pixels
// Transparent pixel = '.'

const SCALE = 4;

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  // Player
  PB: '#4488ff',  // player body blue
  PL: '#88bbff',  // player light blue highlight
  PD: '#224488',  // player dark blue
  PG: '#aaccff',  // player gun
  // Enemy grunt
  GB: '#cc3333',  // grunt body red
  GD: '#882222',  // grunt dark
  GL: '#ff6666',  // grunt light
  // Enemy shooter
  SB: '#cc8833',  // shooter body orange
  SD: '#885522',  // shooter dark
  SL: '#ffbb66',  // shooter light
  // Boss
  BB: '#9933cc',  // boss purple
  BD: '#661199',  // boss dark purple
  BL: '#cc66ff',  // boss light
  BR: '#ff3333',  // boss red accent
  // Bullet / projectile
  YL: '#ffff44',  // yellow bullet
  YD: '#ccaa00',  // yellow dark
  OB: '#ff6600',  // orange enemy bullet
  // Common
  BK: '#1a1a1a',  // black outline
  WH: '#ffffff',  // white
  GR: '#888888',  // grey
  DG: '#444444',  // dark grey
  LG: '#bbbbbb',  // light grey
  // Particles
  R1: '#ff4444',
  R2: '#ff8844',
  R3: '#ffcc44',
};

// Draw a pixel-art frame onto ctx at (ox, oy).
// frame: array of strings, each char maps to palette key or '.' = transparent
function drawFrame(ctx, frame, palette, ox, oy, scale = SCALE) {
  for (let row = 0; row < frame.length; row++) {
    for (let col = 0; col < frame[row].length; col++) {
      const ch = frame[row][col];
      if (ch === '.') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + col * scale, oy + row * scale, scale, scale);
    }
  }
}

// ── Sprite Definitions ───────────────────────────────────────────────────────

// Player — 8×8 art, 2 walk frames, facing right (mirrored for left)
const PLAYER_F0 = [
  '..KKKK..',
  '.KKPBKK.',
  'KPPPPPKK',
  'KPGPPPBK',
  'KPPPPPBK',
  '.KKPBKK.',
  '..K..K..',
  '..K..K..',
];
const PLAYER_F1 = [
  '..KKKK..',
  '.KKPBKK.',
  'KPPPPPKK',
  'KPGPPPBK',
  'KPPPPPBK',
  '.KKPBKK.',
  '..KK.K..',
  '..K..KK.',
];

const PLAYER_PAL = { K: C.BK, P: C.PB, B: C.PL, G: C.PG, '.': null };

// Enemy Grunt — 8×8, 2 frames
const GRUNT_F0 = [
  '..KKKK..',
  '.KRRLLK.',
  'KRRRRRK.',
  'KRDRRRRK',
  'KRRRRRRK',
  '.KRRLLK.',
  '..K..K..',
  '..K..K..',
];
const GRUNT_F1 = [
  '..KKKK..',
  '.KRRLLK.',
  'KRRRRRK.',
  'KRDRRRRK',
  'KRRRRRRK',
  '.KRRLLK.',
  '..KK.K..',
  '..K..KK.',
];
const GRUNT_PAL = { K: C.BK, R: C.GB, L: C.GL, D: C.GD, '.': null };

// Elite Grunt — red tint, slightly different
const ELITE_F0 = [
  '..KKKK..',
  '.KRRLLK.',
  'KERRRRK.',
  'KRDRERRK',
  'KRRRRRRK',
  '.KRRLLK.',
  '..K..K..',
  '..K..K..',
];
const ELITE_PAL = { K: C.BK, R: C.GB, L: '#ff4444', D: '#550000', E: '#ff8888', '.': null };

// Enemy Shooter — 8×8, 2 frames
const SHOOTER_F0 = [
  '..KKKK..',
  '.KSSLLK.',
  'KSSSSSK.',
  'KSDSSSGK',
  'KSSSSSSK',
  '.KSSLLK.',
  '..K..K..',
  '..K..K..',
];
const SHOOTER_F1 = [
  '..KKKK..',
  '.KSSLLK.',
  'KSSSSSK.',
  'KSDSSSGK',
  'KSSSSSSK',
  '.KSSLLK.',
  '..KK.K..',
  '..K..KK.',
];
const SHOOTER_PAL = { K: C.BK, S: C.SB, L: C.SL, D: C.SD, G: '#ffcc00', '.': null };

// Boss — 16×16 art
const BOSS_F0 = [
  '....KKKKKKKK....',
  '...KBBBBBBBBK...',
  '..KBBLLBBLLBBK..',
  '.KBBLBBBBBBLBBK.',
  'KBBBBBBBBBBBBBBK',
  'KBBBRBBBBBBRBBBK',
  'KBBBBBBBBBBBBBK.',
  'KBBBBBBBBBBBBBK.',
  'KBBBBBBBBBBBBBK.',
  'KBBBRBBBBBBRBBBK',
  'KBBBBBBBBBBBBBBK',
  '.KBBLBBBBBBLBBK.',
  '..KBBLLBBLLBBK..',
  '...KBBBBBBBBK...',
  '....KGGGGGGGK...',
  '.....KKKKKK.....',
];
const BOSS_PAL = { K: C.BK, B: C.BB, L: C.BL, R: C.BR, G: C.BD, '.': null };

const BOSS_F1 = [
  '....KKKKKKKK....',
  '...KBBBBBBBBK...',
  '..KBBLLBBLLBBK..',
  '.KBBLBBBBBBLBBK.',
  'KBBBBBBBBBBBBBBK',
  'KBBBRBBBBBBRBBK.',
  'KBBBBBBBBBBBBBK.',
  'KBBBBBBBBBBBBBK.',
  'KBBBBBBBBBBBBBK.',
  'KBBBRBBBBBBRBBK.',
  'KBBBBBBBBBBBBBBK',
  '.KBBLBBBBBBLBBK.',
  '..KBBLLBBLLBBK..',
  '...KBBBBBBBBK...',
  '....KGGGGGGGK...',
  '.....KKKKKK.....',
];

// Bullets — 4×4 art
const BULLET_PLAYER = [
  '.YY.',
  'YYYY',
  'YYYY',
  '.YY.',
];
const BULLET_PAL = { Y: C.YL, D: C.YD, '.': null };

const BULLET_ENEMY = [
  '.OO.',
  'OOOO',
  'OOOO',
  '.OO.',
];
const BULLET_ENEMY_PAL = { O: C.OB, '.': null };

// Boss bullet — 6×6
const BOSS_BULLET = [
  '..RR..',
  '.RLLR.',
  'RLLLR.',
  'RLLLR.',
  '.RLLR.',
  '..RR..',
];
const BOSS_BULLET_PAL = { R: '#ff3333', L: '#ff9999', '.': null };

// ── Atlas Layout ─────────────────────────────────────────────────────────────
// We place sprites in a logical grid. Store frame positions for lookup.
// Coordinates are in canvas pixels.

export const SPRITE_DEFS = {
  // Each entry: { x, y, w, h } in atlas canvas pixels
};

export async function buildSpriteAtlas() {
  const ATLAS_W = 512;
  const ATLAS_H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_W;
  canvas.height = ATLAS_H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const S = SCALE; // 4 px per art pixel
  const artW8 = 8 * S;  // 32px for 8×8 art
  const artW4 = 4 * S;  // 16px for 4×4 art

  const sprites = {};

  let cx = 0, cy = 0;

  function place(key, frame, palette, artW, artH) {
    drawFrame(ctx, frame, palette, cx, cy, S);
    sprites[key] = { x: cx, y: cy, w: artW * S, h: artH * S };
    cx += artW * S + 2; // 2px gap
    if (cx + artW * S > ATLAS_W) {
      cx = 0;
      cy += artH * S + 2;
    }
    return sprites[key];
  }

  // Player
  place('player_0', PLAYER_F0, PLAYER_PAL, 8, 8);
  place('player_1', PLAYER_F1, PLAYER_PAL, 8, 8);

  cx = 0; cy = artW8 + 2;

  // Grunt
  place('grunt_0', GRUNT_F0, GRUNT_PAL, 8, 8);
  place('grunt_1', GRUNT_F1, GRUNT_PAL, 8, 8);
  // Elite grunt
  place('elite_0', ELITE_F0, ELITE_PAL, 8, 8);
  place('elite_1', GRUNT_F1, ELITE_PAL, 8, 8);

  cx = 0; cy = (artW8 + 2) * 2;

  // Shooter
  place('shooter_0', SHOOTER_F0, SHOOTER_PAL, 8, 8);
  place('shooter_1', SHOOTER_F1, SHOOTER_PAL, 8, 8);

  cx = 0; cy = (artW8 + 2) * 3;

  // Bullets
  place('bullet_player', BULLET_PLAYER, BULLET_PAL, 4, 4);
  place('bullet_enemy', BULLET_ENEMY, BULLET_ENEMY_PAL, 4, 4);
  place('bullet_boss', BOSS_BULLET, BOSS_BULLET_PAL, 6, 6);

  // Boss bullet row is 6×6 art = 24px tall — use 24+2 gap, not artW4
  cx = 0; cy = (artW8 + 2) * 3 + 6 * S + 2;

  // Boss (16×16 art)
  place('boss_0', BOSS_F0, BOSS_PAL, 16, 16);
  place('boss_1', BOSS_F1, BOSS_PAL, 16, 16);

  return { canvas, sprites };
}

// Draw a named sprite from the atlas onto ctx at (x, y), centered
export function drawSprite(ctx, atlas, name, x, y, flipX = false, tint = null) {
  const s = atlas.sprites[name];
  if (!s) return;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flipX) ctx.scale(-1, 1);
  if (tint) {
    // Draw to temp canvas then tint (simple globalCompositeOperation approach)
    ctx.drawImage(atlas.canvas, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = tint;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  } else {
    ctx.drawImage(atlas.canvas, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);
  }
  ctx.restore();
}
