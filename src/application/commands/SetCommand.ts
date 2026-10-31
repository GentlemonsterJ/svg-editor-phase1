import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class SetCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(3); const shape = document.require(this.args.at(0));
    shape.setAttribute(this.args.at(1), this.args.at(2));
    return `${shape.label} updated: ${this.args.at(1)}=${JSON.stringify(this.args.at(2))}`;
  }
}
