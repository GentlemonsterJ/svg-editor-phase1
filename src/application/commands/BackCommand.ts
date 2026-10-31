import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class BackCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(1); const id = this.args.at(0); document.reorder(id, false);
    return `${document.require(id).label} sent to back`;
  }
}
