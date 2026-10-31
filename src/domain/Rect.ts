import { GeometricShape } from './GeometricShape.js';

export class Rect extends GeometricShape {
  constructor(id: string, x: number, y: number, width: number, height: number) {
    super(id);
    this.define('x', x); this.define('y', y);
    this.define('width', width, true); this.define('height', height, true);
  }
  override get type(): string { return 'rect'; }
  override move(dx: number, dy: number): void { this.shift('x', dx); this.shift('y', dy); }
  override get geometrySummary(): string {
    return `x=${this.value('x')} y=${this.value('y')} w=${this.value('width')} h=${this.value('height')}`;
  }
  override clone(): Rect {
    const result = new Rect(this.id, this.value('x'), this.value('y'), this.value('width'), this.value('height'));
    this.copyMetadata(result); return result;
  }
}
