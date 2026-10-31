import type { Command } from './Command.js';
import type { Arguments } from './Arguments.js';
import type { EditorContext } from './EditorContext.js';

export abstract class ArgumentCommand implements Command {
  constructor(protected readonly args: Arguments) {}
  abstract execute(context: EditorContext): Promise<readonly string[]>;
}
