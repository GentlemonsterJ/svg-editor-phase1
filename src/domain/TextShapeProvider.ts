import type { ShapeProvider } from './ShapeProvider.js';
import { TextShape } from './TextShape.js';
import { NumberValue } from './NumberValue.js';
import { EditorError } from './EditorError.js';

export class TextShapeProvider implements ShapeProvider {
  readonly type = 'text';
  create(id: string, args: readonly string[]): TextShape {
    if (args.length !== 3) throw new EditorError('usage: create text <id> <x> <y> "content" [in <containerId>]');
    return new TextShape(id, NumberValue.parse(args[0]!, 'x'), NumberValue.parse(args[1]!, 'y'), args[2]!);
  }
  fromAttributes(id: string, attrs: ReadonlyMap<string, string>, text: string): TextShape {
    return new TextShape(id, NumberValue.parse((attrs.get('x') ?? '0').replace(/px$/i, ''), 'x'),
      NumberValue.parse((attrs.get('y') ?? '0').replace(/px$/i, ''), 'y'), text);
  }
}
