import { GeometricShape } from './GeometricShape.js';

export class TextShape extends GeometricShape {
  private content: string;
  constructor(id: string, x: number, y: number, text: string) {
    super(id); this.define('x', x); this.define('y', y); this.content = text;
  }
  override get type(): string { return 'text'; }
  override get textContent(): string { return this.content; }
  override move(dx: number, dy: number): void { this.shift('x', dx); this.shift('y', dy); }
  override setAttribute(name: string, value: string): void {
    if (name === 'text') this.content = value;
    else super.setAttribute(name, value);
  }
  override get geometrySummary(): string {
    return `(${this.value('x')},${this.value('y')}) ${JSON.stringify(this.content)}`;
  }
  override clone(): TextShape {
    const result = new TextShape(this.id, this.value('x'), this.value('y'), this.content);
    this.copyMetadata(result); return result;
  }
}
