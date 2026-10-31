import { GeometricShape } from './GeometricShape.js';

export class Line extends GeometricShape {
  constructor(id: string, x1: number, y1: number, x2: number, y2: number) {
    super(id); this.define('x1', x1); this.define('y1', y1); this.define('x2', x2); this.define('y2', y2);
  }
  override get type(): string { return 'line'; }
  override move(dx: number, dy: number): void {
    this.shift('x1', dx); this.shift('y1', dy); this.shift('x2', dx); this.shift('y2', dy);
  }
  override get geometrySummary(): string {
    return `(${this.value('x1')},${this.value('y1')}) -> (${this.value('x2')},${this.value('y2')})`;
  }
  override clone(): Line {
    const result = new Line(this.id, this.value('x1'), this.value('y1'), this.value('x2'), this.value('y2'));
    this.copyMetadata(result); return result;
  }
}
