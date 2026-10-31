import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Shape } from '../domain/Shape.js';

export class ShapePresenter {
  tree(document: SvgDocument, id?: string): readonly string[] {
    const lines: string[] = [];
    if (id !== undefined) {
      const root = document.require(id); lines.push(root.summary); this.branches(root.children, '', lines);
    } else {
      lines.push(`svg (${document.width}x${document.height})`); this.branches(document.children, '', lines);
    }
    return lines;
  }
  show(document: SvgDocument, id: string): readonly string[] {
    const shape = document.require(id);
    const attrs = [...shape.attributes].filter(([name]) => name !== 'id').map(([key, value]) => `${key}=${value}`);
    if (shape.textContent !== null) attrs.push(`text=${JSON.stringify(shape.textContent)}`);
    return [`${shape.label}  parent=${document.parentLabel(shape)}`, ...attrs.map(attr => `  ${attr}`)];
  }
  private branches(children: readonly Shape[], prefix: string, lines: string[]): void {
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      lines.push(`${prefix}${last ? '└── ' : '├── '}${child.summary}`);
      this.branches(child.children, `${prefix}${last ? '    ' : '│   '}`, lines);
    });
  }
}
