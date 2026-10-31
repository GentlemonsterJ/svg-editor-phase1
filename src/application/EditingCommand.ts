import type { Command } from './Command.js';
import type { EditingOperation } from './EditingOperation.js';
import type { EditorContext } from './EditorContext.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';

export abstract class EditingCommand implements Command, EditingOperation {
  constructor(protected readonly args: Arguments) {}
  async execute(context: EditorContext): Promise<readonly string[]> {
    return [context.history.execute(this, context.session)];
  }
  abstract apply(document: SvgDocument): string;
}
