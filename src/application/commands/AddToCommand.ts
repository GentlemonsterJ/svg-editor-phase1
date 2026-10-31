import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class AddToCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(2); const id = this.args.at(1); document.addTo(this.args.at(0), id);
    return `${document.require(id).label} moved into g#${this.args.at(0)}`;
  }
}
