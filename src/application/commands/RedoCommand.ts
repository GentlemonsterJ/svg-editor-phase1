import { ArgumentCommand } from '../ArgumentCommand.js';
import type { EditorContext } from '../EditorContext.js';

export class RedoCommand extends ArgumentCommand {
  override async execute(context: EditorContext): Promise<readonly string[]> {
    void context.session.document; this.args.count(0); return [context.history.redo(context.session)];
  }
}
