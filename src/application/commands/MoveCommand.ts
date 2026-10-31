import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class MoveCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(3); const shape = document.require(this.args.at(0));
    const dx = this.args.number(1); const dy = this.args.number(2); shape.move(dx, dy);
    return `${shape.label} moved by (${dx},${dy})`;
  }
}
