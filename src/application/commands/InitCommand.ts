import { ArgumentCommand } from '../ArgumentCommand.js';
import type { EditorContext } from '../EditorContext.js';
import { SvgDocument } from '../../domain/SvgDocument.js';

export class InitCommand extends ArgumentCommand {
  override async execute(context: EditorContext): Promise<readonly string[]> {
    this.args.count(0, 2);
    const document = new SvgDocument(this.args.length > 0 ? this.args.number(0) : 800,
      this.args.length > 1 ? this.args.number(1) : 600);
    context.session.open(document); context.history.barrier();
    return [`canvas ${document.width}x${document.height} created`];
  }
}
