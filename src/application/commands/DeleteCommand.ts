import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class DeleteCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(1); return `${document.delete(this.args.at(0)).label} deleted`;
  }
}
