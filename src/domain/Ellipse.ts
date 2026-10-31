import { GeometricShape } from './GeometricShape.js';

export class Ellipse extends GeometricShape {
  constructor(id: string, cx: number, cy: number, rx: number, ry: number) {
    super(id); this.define('cx', cx); this.define('cy', cy);
    this.define('rx', rx, true); this.define('ry', ry, true);
  }
  override get type(): string { return 'ellipse'; }
  override move(dx: number, dy: number): void { this.shift('cx', dx); this.shift('cy', dy); }
  override get geometrySummary(): string {
    return `cx=${this.value('cx')} cy=${this.value('cy')} rx=${this.value('rx')} ry=${this.value('ry')}`;
  }
  override clone(): Ellipse {
    const result = new Ellipse(this.id, this.value('cx'), this.value('cy'), this.value('rx'), this.value('ry'));
    this.copyMetadata(result); return result;
  }
}
