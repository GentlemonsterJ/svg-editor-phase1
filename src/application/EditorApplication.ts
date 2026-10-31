import type { EditorContext } from './EditorContext.js';
import { CommandRegistry } from './CommandRegistry.js';
import { Tokenizer } from './Tokenizer.js';

export class EditorApplication {
  private readonly tokenizer = new Tokenizer();
  private readonly commands: CommandRegistry;
  constructor(private readonly context: EditorContext) { this.commands = new CommandRegistry(context.shapes); }
  async run(line: string): Promise<readonly string[]> {
    try {
      const tokens = this.tokenizer.tokenize(line);
      if (!tokens.length) return [];
      return await this.commands.resolve(tokens[0]!, tokens.slice(1)).execute(this.context);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return [`error: ${message.replace(/[\r\n]+/g, ' ')}`];
    }
  }
}
