import { EditingCommand } from '../EditingCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { ShapeFactory } from '../../domain/ShapeFactory.js';

export class CreateCommand extends EditingCommand {
  constructor(args: Arguments, private readonly factory: ShapeFactory) { super(args); }
  override apply(document: SvgDocument): string {
    this.args.count(2, Number.MAX_SAFE_INTEGER);
    const params = [...this.args.tail(2)];
    let parentId: string | undefined;
    if (params.length >= 2 && params.at(-2) === 'in') { parentId = params.pop()!; params.pop(); }
    const parent = parentId === undefined ? null : document.requireContainer(parentId);
    const shape = this.factory.create(this.args.at(0), this.args.at(1), params);
    document.add(shape, parent);
    return `${shape.label} created${parent ? ` in ${parent.label}` : ''}`;
  }
}
