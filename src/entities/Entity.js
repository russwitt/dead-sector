// Base entity — all game objects extend this
export class Entity {
  constructor(x, y, w, h) {
    this.x = x;  // world center x
    this.y = y;  // world center y
    this.w = w;  // half-width for AABB
    this.h = h;  // half-height for AABB
    this.active = true;  // false = remove from list
  }

  /** AABB left edge */
  get left()   { return this.x - this.w; }
  /** AABB right edge */
  get right()  { return this.x + this.w; }
  /** AABB top edge */
  get top()    { return this.y - this.h; }
  /** AABB bottom edge */
  get bottom() { return this.y + this.h; }

  /** Simple AABB overlap test */
  overlaps(other) {
    return this.left < other.right &&
           this.right > other.left &&
           this.top < other.bottom &&
           this.bottom > other.top;
  }

  update(dt) {}
  render(ctx, camera, atlas) {}
}
