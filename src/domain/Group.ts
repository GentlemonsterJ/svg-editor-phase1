import { Shape } from './Shape.js';
import { EditorError } from './EditorError.js';
import { NumberValue } from './NumberValue.js';

export class Group extends Shape {
  private readonly members: Shape[] = [];
  constructor(id: string) { super(id); }
  override get type(): string { return 'g'; }
  override get isContainer(): boolean { return true; }
  override get children(): readonly Shape[] { return [...this.members]; }
  override get geometrySummary(): string { return ''; }
  override insert(child: Shape, index = this.members.length): void {
    if (child === this || this.contains(child, this)) {
      throw new EditorError(`cannot group a container into its own descendant: ${child.id}`);
    }
    if (this.members.includes(child)) throw new EditorError(`id already exists: ${child.id}`);
    if (!Number.isInteger(index) || index < 0 || index > this.members.length) throw new EditorError('invalid child index');
    this.members.splice(index, 0, child);
  }
  override remove(child: Shape): void {
    const index = this.members.indexOf(child);
    if (index < 0) throw new EditorError(`no such shape: ${child.id}`);
    this.members.splice(index, 1);
  }
  override move(dx: number, dy: number): void { for (const child of this.members) child.move(dx, dy); }
  override scale(factor: number): void {
    NumberValue.positive(factor, 'scale factor');
    for (const child of this.members) child.scale(factor);
  }
  override clone(): Group {
    const result = new Group(this.id);
    this.copyMetadata(result);
    for (const child of this.members) result.insert(child.clone());
    return result;
  }
  private contains(root: Shape, target: Shape): boolean {
    return root.children.some(child => child === target || this.contains(child, target));
  }
}
