import { ArgumentCommand } from '../ArgumentCommand.js';
import type { Arguments } from '../Arguments.js';
import type { EditorContext } from '../EditorContext.js';

export class HelpCommand extends ArgumentCommand {
  constructor(args: Arguments, private readonly lines: readonly string[]) { super(args); }
  override async execute(_context: EditorContext): Promise<readonly string[]> { this.args.count(0); return this.lines; }
}
