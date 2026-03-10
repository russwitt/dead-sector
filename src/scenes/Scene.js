// Base scene class — all scenes extend this
export class Scene {
  /** Called once when the scene becomes active */
  onEnter(game) {}

  /** Called once when the scene is being replaced */
  onExit() {}

  /** @param {number} dt — fixed timestep in seconds */
  update(dt) {}

  /** @param {CanvasRenderingContext2D} ctx */
  render(ctx) {}
}
