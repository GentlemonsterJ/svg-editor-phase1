import { ArgumentCommand } from '../ArgumentCommand.js';
import type { EditorContext } from '../EditorContext.js';
import { EditorError } from '../../domain/EditorError.js';

export class SaveCommand extends ArgumentCommand {
  override async execute(context: EditorContext): Promise<readonly string[]> {
    const document = context.session.document; this.args.count(0, 1);
    const path = this.args.optional(0) ?? context.session.path;
    if (!path) throw new EditorError("no file path. use 'save <file.svg>'");
    await context.files.write(path, context.codec.encode(document));
    context.session.saved(path); context.history.barrier();
    return [`saved to ${path} (${document.all().length} elements)`];
  }
}
