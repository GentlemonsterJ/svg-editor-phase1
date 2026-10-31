import { EditorError } from './EditorError.js';
import { NumberValue } from './NumberValue.js';

export abstract class Shape {
  private readonly identifier: string;
  private readonly presentation = new Map<string, string>();
  private readonly importedAttributes = new Map<string, string>();

  protected constructor(id: string) {
    if (!id || /\s/u.test(id)) throw new EditorError('id must be non-empty and contain no whitespace');
    this.identifier = id;
  }

  get id(): string { return this.identifier; }
  abstract get type(): string;
  get label(): string { return `${this.type}#${this.id}`; }
  get isContainer(): boolean { return false; }
  get textContent(): string | null { return null; }
  get children(): readonly Shape[] { return []; }
  get attributes(): ReadonlyMap<string, string> {
    return new Map([...this.importedAttributes, ...this.presentation, ['id', this.id]]);
  }

  setAttribute(name: string, value: string): void {
    if (!['fill', 'stroke', 'stroke-width'].includes(name)) {
      throw new EditorError(`unknown attribute: ${name}`);
    }
    if (name === 'stroke-width') {
      value = NumberValue.format(NumberValue.nonNegative(NumberValue.parse(value, name), name));
    }
    this.presentation.set(name, value);
  }

  /** Import-only preservation; CLI mutation still uses the strict whitelist. */
  preserveAttribute(name: string, value: string): void {
    if (name !== 'id') this.importedAttributes.set(name, value);
  }

  insert(_child: Shape, _index = this.children.length): void {
    throw new EditorError(`not a container: ${this.id}`);
  }

  remove(_child: Shape): void { throw new EditorError(`not a container: ${this.id}`); }
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
  abstract get geometrySummary(): string;

  get summary(): string {
    const style = [...this.presentation].map(([key, value]) => `${key}=${value}`).join(' ');
    return [this.label, this.geometrySummary, style].filter(Boolean).join('  ');
  }

  protected copyMetadata(target: Shape): void {
    for (const [name, value] of this.importedAttributes) target.preserveAttribute(name, value);
    for (const [name, value] of this.presentation) target.setAttribute(name, value);
  }
}
