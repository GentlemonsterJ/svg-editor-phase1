import type { EditorContext } from './EditorContext.js';

export interface Command {
  execute(context: EditorContext): Promise<readonly string[]>;
}
