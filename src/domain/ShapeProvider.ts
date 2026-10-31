import type { Shape } from './Shape.js';

export interface ShapeProvider {
  readonly type: string;
  create(id: string, args: readonly string[]): Shape;
  fromAttributes(id: string, attrs: ReadonlyMap<string, string>, text: string): Shape;
}
