import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';
import type { EditorApplication } from '../application/EditorApplication.js';

export class CliRunner {
  constructor(private readonly application: EditorApplication) {}
  async start(input: Readable, output: Writable, script = false): Promise<boolean> {
    const repl = createInterface({ input, output, terminal: !script && !!process.stdin.isTTY });
    let failed = false;
    if (!script) { output.write("svg-editor 0.1 — type 'help' for commands\n"); repl.setPrompt('svg> '); repl.prompt(); }
    for await (const line of repl) {
      const results = await this.application.run(line);
      for (const result of results) {
        output.write(`${result}\n`);
        if (result.startsWith('error:')) failed = true;
      }
      if (!script) repl.prompt();
    }
    return failed;
  }
}
