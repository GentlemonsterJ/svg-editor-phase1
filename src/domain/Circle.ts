import { GeometricShape } from './GeometricShape.js';

export class Circle extends GeometricShape {
  constructor(id: string, cx: number, cy: number, r: number) {
    super(id); this.define('cx', cx); this.define('cy', cy); this.define('r', r, true);
  }
  override get type(): string { return 'circle'; }
  override move(dx: number, dy: number): void { this.shift('cx', dx); this.shift('cy', dy); }
  override get geometrySummary(): string { return `cx=${this.value('cx')} cy=${this.value('cy')} r=${this.value('r')}`; }
  override clone(): Circle {
    const result = new Circle(this.id, this.value('cx'), this.value('cy'), this.value('r'));
    this.copyMetadata(result); return result;
  }
}
