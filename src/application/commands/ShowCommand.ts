import { ArgumentCommand } from '../ArgumentCommand.js';
import type { EditorContext } from '../EditorContext.js';

export class ShowCommand extends ArgumentCommand {
  override async execute(context: EditorContext): Promise<readonly string[]> {
    const document = context.session.document; this.args.count(1);
    return context.presenter.show(document, this.args.at(0));
  }
}
