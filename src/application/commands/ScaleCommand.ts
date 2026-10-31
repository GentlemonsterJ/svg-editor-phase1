import { EditingCommand } from '../EditingCommand.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';
import { NumberValue } from '../../domain/NumberValue.js';

export class ScaleCommand extends EditingCommand {
  override apply(document: SvgDocument): string {
    this.args.count(2); const shape = document.require(this.args.at(0));
    const factor = NumberValue.positive(this.args.number(1), 'scale factor'); shape.scale(factor);
    return `${shape.label} scaled by ${factor}`;
  }
}
