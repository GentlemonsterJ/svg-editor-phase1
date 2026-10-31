import type { ShapeProvider } from './ShapeProvider.js';
import type { Shape } from './Shape.js';
import { EditorError } from './EditorError.js';
import { NumberValue } from './NumberValue.js';

export class GeometryShapeProvider implements ShapeProvider {
  constructor(readonly type: string, private readonly names: readonly string[],
    private readonly build: (id: string, values: readonly number[]) => Shape,
    private readonly optionalStyle: string) {}

  create(id: string, args: readonly string[]): Shape {
    if (args.length < this.names.length || args.length > this.names.length + 1) {
      throw new EditorError(`usage: create ${this.type} <id> ${this.names.map(name => `<${name}>`).join(' ')} [${this.optionalStyle}] [in <containerId>]`);
    }
    const shape = this.build(id, this.names.map((name, index) => NumberValue.parse(args[index]!, name)));
    const style = args[this.names.length];
    if (style !== undefined) shape.setAttribute(this.optionalStyle, style);
    return shape;
  }
  fromAttributes(id: string, attrs: ReadonlyMap<string, string>, _text: string): Shape {
    return this.build(id, this.names.map(name => NumberValue.parse((attrs.get(name) ?? '0').replace(/px$/i, ''), name)));
  }
}
