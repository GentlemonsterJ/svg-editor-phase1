import { Shape } from './Shape.js';
import { Group } from './Group.js';
import { EditorError } from './EditorError.js';
import { NumberValue } from './NumberValue.js';

export class SvgDocument {
  private canvasWidth: number;
  private canvasHeight: number;
  private roots: Shape[] = [];
  private readonly rootMetadata = new Map<string, string>();

  constructor(width = 800, height = 600) {
    this.canvasWidth = NumberValue.positive(width, 'canvas width');
    this.canvasHeight = NumberValue.positive(height, 'canvas height');
  }
  get width(): number { return this.canvasWidth; }
  get height(): number { return this.canvasHeight; }
  get children(): readonly Shape[] { return [...this.roots]; }
  get attributes(): ReadonlyMap<string, string> { return new Map(this.rootMetadata); }
  preserveAttribute(name: string, value: string): void { this.rootMetadata.set(name, value); }
  resize(width: number, height: number): void {
    NumberValue.positive(width, 'canvas width'); NumberValue.positive(height, 'canvas height');
    this.canvasWidth = width; this.canvasHeight = height;
    this.rootMetadata.set('viewBox', `0 0 ${width} ${height}`);
  }
  all(): readonly Shape[] {
    const result: Shape[] = [];
    const visit = (shape: Shape): void => { result.push(shape); shape.children.forEach(visit); };
    this.roots.forEach(visit); return result;
  }
  find(id: string): Shape | undefined { return this.all().find(shape => shape.id === id); }
  require(id: string): Shape {
    const shape = this.find(id);
    if (!shape) throw new EditorError(`no such shape: ${id}`);
    return shape;
  }
  requireContainer(id: string): Shape {
    const shape = this.find(id);
    if (!shape) throw new EditorError(`no such container: ${id}`);
    if (!shape.isContainer) throw new EditorError(`not a container: ${id}`);
    return shape;
  }
  parentOf(shape: Shape): Shape | null {
    return this.all().find(candidate => candidate.children.includes(shape)) ?? null;
  }
  parentLabel(shape: Shape): string { return this.parentOf(shape)?.label ?? 'svg'; }
  add(shape: Shape, parent: Shape | null = null, index?: number): void {
    if (parent && (!this.all().includes(parent) || !parent.isContainer)) throw new EditorError(`not a container: ${parent.id}`);
    const existing = new Set(this.all().map(node => node.id));
    const rootId = this.rootMetadata.get('id');
    if (rootId) existing.add(rootId);
    const visit = (node: Shape): void => {
      if (existing.has(node.id)) throw new EditorError(`id already exists: ${node.id}`);
      existing.add(node.id); node.children.forEach(visit);
    };
    visit(shape);
    this.attach(shape, parent, index);
  }
  delete(id: string): Shape {
    const shape = this.require(id); this.detach(shape); return shape;
  }
  group(id: string, ids: readonly string[]): Group {
    if (this.find(id) || this.rootMetadata.get('id') === id) throw new EditorError(`id already exists: ${id}`);
    if (!ids.length) throw new EditorError('group requires at least one shape');
    if (new Set(ids).size !== ids.length) throw new EditorError('duplicate group member');
    const nodes = ids.map(member => this.require(member));
    for (const node of nodes) {
      if (nodes.some(other => node !== other && this.isAncestor(node, other))) {
        throw new EditorError(`cannot group a container into its own descendant: ${node.id}`);
      }
    }
    // Deterministic rule: lowest common parent, earliest selected branch;
    // children retain original document preorder, independent of argument order.
    const order = this.all(); nodes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const parent = this.commonParent(nodes);
    const siblings = parent?.children ?? this.children;
    const branches = nodes.map(node => this.branchUnder(node, parent));
    const anchor = Math.min(...branches.map(node => siblings.indexOf(node)));
    const group = new Group(id);
    for (const node of nodes) { this.detach(node); group.insert(node); }
    this.attach(group, parent, anchor);
    return group;
  }
  ungroup(id: string): number {
    const group = this.requireContainer(id);
    const parent = this.parentOf(group);
    if (!parent) throw new EditorError(`cannot ungroup top-level container: ${id}`);
    const index = parent.children.indexOf(group);
    const children = group.children;
    this.detach(group);
    children.forEach((child, offset) => { group.remove(child); parent.insert(child, index + offset); });
    return children.length;
  }
  addTo(gid: string, id: string): void {
    const parent = this.requireContainer(gid); const shape = this.require(id);
    if (shape === parent || this.isAncestor(shape, parent)) {
      throw new EditorError(`cannot group a container into its own descendant: ${shape.id}`);
    }
    this.detach(shape); this.attach(shape, parent);
  }
  reorder(id: string, front: boolean): void {
    const shape = this.require(id); const parent = this.parentOf(shape);
    this.detach(shape); this.attach(shape, parent, front ? undefined : 0);
  }
  clone(): SvgDocument {
    const result = new SvgDocument(this.width, this.height);
    for (const [key, value] of this.rootMetadata) result.preserveAttribute(key, value);
    this.roots.forEach(shape => result.add(shape.clone())); return result;
  }
  private attach(shape: Shape, parent: Shape | null, index?: number): void {
    if (parent) parent.insert(shape, index);
    else this.roots.splice(index ?? this.roots.length, 0, shape);
  }
  private detach(shape: Shape): void {
    const parent = this.parentOf(shape);
    if (parent) parent.remove(shape);
    else this.roots.splice(this.roots.indexOf(shape), 1);
  }
  private isAncestor(ancestor: Shape, node: Shape): boolean {
    return ancestor.children.some(child => child === node || this.isAncestor(child, node));
  }
  private commonParent(nodes: readonly Shape[]): Shape | null {
    let candidate = this.parentOf(nodes[0]!);
    while (candidate && !nodes.every(node => this.isAncestor(candidate!, node))) candidate = this.parentOf(candidate);
    return candidate;
  }
  private branchUnder(node: Shape, parent: Shape | null): Shape {
    let branch = node;
    while (this.parentOf(branch) !== parent) branch = this.parentOf(branch)!;
    return branch;
  }
}
