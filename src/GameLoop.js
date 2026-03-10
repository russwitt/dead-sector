// Fixed-timestep game loop using requestAnimationFrame
// Updates at 60Hz with accumulator pattern; renders with interpolation alpha

export class GameLoop {
  constructor(updateFn, renderFn) {
    this.update = updateFn;
    this.render = renderFn;
    this.running = false;
    this.rafId = null;

    this.FIXED_DT = 1 / 60;        // 60 Hz fixed update
    this.MAX_DELTA = 0.25;          // cap to prevent spiral of death
    this.accumulator = 0;
    this.lastTime = 0;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this._tick.bind(this));
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _tick(now) {
    if (!this.running) return;

    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (delta > this.MAX_DELTA) delta = this.MAX_DELTA;
    this.accumulator += delta;

    while (this.accumulator >= this.FIXED_DT) {
      this.update(this.FIXED_DT);
      this.accumulator -= this.FIXED_DT;
    }

    const alpha = this.accumulator / this.FIXED_DT;
    this.render(alpha);

    this.rafId = requestAnimationFrame(this._tick.bind(this));
  }
}
