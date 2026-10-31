import { ArgumentCommand } from '../ArgumentCommand.js';
import type { EditorContext } from '../EditorContext.js';
import { EditorError } from '../../domain/EditorError.js';

export class CanvasCommand extends ArgumentCommand {
  override async execute(context: EditorContext): Promise<readonly string[]> {
    const document = context.session.document; this.args.count(0, 2);
    if (this.args.length === 1) throw new EditorError('usage: canvas [w h]');
    if (this.args.length === 0) return [`canvas ${document.width}x${document.height}`];
    const draft = document.clone(); draft.resize(this.args.number(0), this.args.number(1));
    context.session.replace(draft); context.history.barrier();
    return [`canvas resized to ${draft.width}x${draft.height}`];
  }
}
