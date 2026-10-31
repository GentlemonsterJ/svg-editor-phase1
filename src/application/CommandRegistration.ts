import type { Command } from './Command.js';
import { Arguments } from './Arguments.js';

export class CommandRegistration {
  constructor(readonly syntax: string, private readonly build: (args: Arguments) => Command) {}
  create(tokens: readonly string[]): Command { return this.build(new Arguments(tokens, this.syntax)); }
}
