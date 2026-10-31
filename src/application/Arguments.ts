import { EditorError } from '../domain/EditorError.js';
import { NumberValue } from '../domain/NumberValue.js';

export class Arguments {
  constructor(private readonly tokens: readonly string[], private readonly syntax: string) {}
  get length(): number { return this.tokens.length; }
  count(min: number, max = min): void {
    if (this.length < min || this.length > max) throw new EditorError(`usage: ${this.syntax}`);
  }
  at(index: number): string {
    const value = this.tokens[index];
    if (value === undefined) throw new EditorError(`usage: ${this.syntax}`);
    return value;
  }
  optional(index: number): string | undefined { return this.tokens[index]; }
  number(index: number): number { return NumberValue.parse(this.at(index)); }
  tail(index: number): readonly string[] { return this.tokens.slice(index); }
}
