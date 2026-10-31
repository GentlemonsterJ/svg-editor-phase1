import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class GroupCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(2, Number.MAX_SAFE_INTEGER);
    const group = document.group(this.args.at(0), this.args.tail(1));
    return `${group.label} created with ${group.children.length} children`;
  }
}
