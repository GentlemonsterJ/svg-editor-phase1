import { ArgumentCommand } from '../ArgumentCommand.js';
import type { EditorContext } from '../EditorContext.js';

export class ReadCommand extends ArgumentCommand {
  override async execute(context: EditorContext): Promise<readonly string[]> {
    this.args.count(1); const path = this.args.at(0);
    const { document, warnings } = context.codec.decode(await context.files.read(path));
    context.session.open(document, path); context.history.barrier();
    return [...warnings, `read ${path} (${document.all().length} elements)`];
  }
}
