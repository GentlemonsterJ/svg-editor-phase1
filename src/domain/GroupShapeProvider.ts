import type { ShapeProvider } from './ShapeProvider.js';
import { Group } from './Group.js';
import { EditorError } from './EditorError.js';

export class GroupShapeProvider implements ShapeProvider {
  readonly type = 'g';
  create(id: string, args: readonly string[]): Group {
    if (args.length) throw new EditorError('usage: create g <id> [in <containerId>]');
    return new Group(id);
  }
  fromAttributes(id: string, _attrs: ReadonlyMap<string, string>, _text: string): Group { return new Group(id); }
}
