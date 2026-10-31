import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class FrontCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(1); const id = this.args.at(0); document.reorder(id, true);
    return `${document.require(id).label} brought to front`;
  }
}
