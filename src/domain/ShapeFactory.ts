import type { ShapeProvider } from './ShapeProvider.js';
import type { Shape } from './Shape.js';
import { GeometryShapeProvider } from './GeometryShapeProvider.js';
import { TextShapeProvider } from './TextShapeProvider.js';
import { GroupShapeProvider } from './GroupShapeProvider.js';
import { Rect } from './Rect.js';
import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Line } from './Line.js';
import { EditorError } from './EditorError.js';

export class ShapeFactory {
  private readonly providers = new Map<string, ShapeProvider>();
  constructor() {
    this.register(new GeometryShapeProvider('rect', ['x', 'y', 'width', 'height'],
      (id, p) => new Rect(id, p[0]!, p[1]!, p[2]!, p[3]!), 'fill'));
    this.register(new GeometryShapeProvider('circle', ['cx', 'cy', 'r'],
      (id, p) => new Circle(id, p[0]!, p[1]!, p[2]!), 'fill'));
    this.register(new GeometryShapeProvider('ellipse', ['cx', 'cy', 'rx', 'ry'],
      (id, p) => new Ellipse(id, p[0]!, p[1]!, p[2]!, p[3]!), 'fill'));
    this.register(new GeometryShapeProvider('line', ['x1', 'y1', 'x2', 'y2'],
      (id, p) => new Line(id, p[0]!, p[1]!, p[2]!, p[3]!), 'stroke'));
    this.register(new TextShapeProvider()); this.register(new GroupShapeProvider());
  }
  register(provider: ShapeProvider): void {
    if (this.providers.has(provider.type)) throw new EditorError(`shape type already registered: ${provider.type}`);
    this.providers.set(provider.type, provider);
  }
  create(type: string, id: string, args: readonly string[]): Shape { return this.provider(type).create(id, args); }
  fromAttributes(type: string, id: string, attrs: ReadonlyMap<string, string>, text: string): Shape {
    return this.provider(type).fromAttributes(id, attrs, text);
  }
  private provider(type: string): ShapeProvider {
    // Named shape dispatch lives only here. TODO(plugin phase): external registration/loading.
    const provider = this.providers.get(type);
    if (!provider) throw new EditorError(`unknown shape type: ${type} (is the plugin loaded?)`);
    return provider;
  }
}
