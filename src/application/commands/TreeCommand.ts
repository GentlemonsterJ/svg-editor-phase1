import { ArgumentCommand } from '../ArgumentCommand.js';
import type { EditorContext } from '../EditorContext.js';

export class TreeCommand extends ArgumentCommand {
  override async execute(context: EditorContext): Promise<readonly string[]> {
    const document = context.session.document; this.args.count(0, 1);
    return context.presenter.tree(document, this.args.optional(0));
  }
}
