import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class UngroupCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(1); const id = this.args.at(0); const count = document.ungroup(id);
    return `g#${id} ungrouped (${count} children promoted)`;
  }
}
