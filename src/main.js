// Entry point — bootstraps the Game
import { Game } from './Game.js';

const canvas = document.getElementById('game-canvas');
if (!canvas) {
  throw new Error('Canvas element #game-canvas not found');
}

const game = new Game(canvas);
game.init().catch(err => {
  console.error('Failed to init game:', err);
  // Show error on canvas
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 640, 480);
  ctx.fillStyle = '#ff4444';
  ctx.font = '16px monospace';
  ctx.fillText('ERROR: ' + err.message, 20, 240);
  ctx.fillStyle = '#888';
  ctx.font = '12px monospace';
  ctx.fillText('This game requires a local HTTP server.', 20, 265);
  ctx.fillText('Run: npx serve . — then open http://localhost:3000', 20, 282);
});
