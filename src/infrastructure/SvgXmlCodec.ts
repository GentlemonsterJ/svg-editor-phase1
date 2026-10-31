import { DOMImplementation, DOMParser, XMLSerializer, type Element, type Node } from '@xmldom/xmldom';
import type { SvgCodec } from '../application/ports/SvgCodec.js';
import { SvgDocument } from '../domain/SvgDocument.js';
import { ShapeFactory } from '../domain/ShapeFactory.js';
import type { Shape } from '../domain/Shape.js';
import { EditorError } from '../domain/EditorError.js';
import { NumberValue } from '../domain/NumberValue.js';
import { SvgTransform } from './SvgTransform.js';

export class SvgXmlCodec implements SvgCodec {
  private readonly namespace = 'http://www.w3.org/2000/svg';
  constructor(private readonly shapes: ShapeFactory) {}

  decode(source: string): { document: SvgDocument; warnings: readonly string[] } {
    if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(source)) throw new EditorError('invalid SVG: DTD and entity declarations are not supported');
    let root: Element;
    try {
      const xml = new DOMParser({ onError: (_level, message) => { throw new Error(message); } }).parseFromString(source, 'image/svg+xml');
      if (!xml.documentElement) throw new Error('missing root element');
      root = xml.documentElement;
    } catch (error: unknown) {
      throw new EditorError(`invalid SVG: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (root.localName !== 'svg' || (root.namespaceURI && root.namespaceURI !== this.namespace)) {
      throw new EditorError('invalid SVG: expected <svg> root');
    }
    const rootAttrs = this.attributesOf(root);
    const viewBox = rootAttrs.get('viewBox')?.trim().split(/[\s,]+/).map(value => NumberValue.parse(value, 'viewBox'));
    if (viewBox && (viewBox.length !== 4 || viewBox[2]! <= 0 || viewBox[3]! <= 0)) throw new EditorError('invalid SVG viewBox');
    const document = new SvgDocument(this.dimension(rootAttrs.get('width'), viewBox?.[2] ?? 300),
      this.dimension(rootAttrs.get('height'), viewBox?.[3] ?? 150));
    for (const [key, value] of rootAttrs) {
      if (!['width', 'height', 'transform', 'xmlns'].includes(key)) document.preserveAttribute(key, value);
    }

    // Reserve every explicit id first: generated ids cannot collide with later elements.
    const reserved = new Set<string>();
    const scan = (element: Element): void => {
      const id = element.getAttribute('id');
      if (id) {
        if (reserved.has(id)) throw new EditorError(`id already exists: ${id}`);
        reserved.add(id);
      }
      this.elementsOf(element).forEach(scan);
    };
    scan(root);
    const counters = new Map<string, number>(); const warnings: string[] = [];
    const load = (element: Element, parent: Shape | null, inherited: SvgTransform,
      inheritedMetrics: ReadonlyMap<string, string>): void => {
      if (element.namespaceURI && element.namespaceURI !== this.namespace) throw new EditorError(`unsupported SVG namespace: ${element.namespaceURI}`);
      const type = element.localName ?? element.tagName; const attrs = this.attributesOf(element);
      let id = attrs.get('id');
      if (!id) {
        let index = counters.get(type) ?? 0;
        do { id = `${type}${++index}`; } while (reserved.has(id));
        counters.set(type, index); reserved.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
      }
      const shape = this.shapes.fromAttributes(type, id, attrs, element.textContent ?? '');
      for (const [key, value] of attrs) {
        if (['fill', 'stroke', 'stroke-width'].includes(key)) shape.setAttribute(key, key === 'stroke-width' ? value.replace(/px$/i, '') : value);
        else if (key !== 'transform' && !shape.attributes.has(key)) shape.preserveAttribute(key, value);
      }
      const transform = inherited.compose(SvgTransform.parse(attrs.get('transform')));
      const metrics = new Map(inheritedMetrics);
      for (const key of ['font-size', 'stroke-width']) if (attrs.has(key)) metrics.set(key, attrs.get(key)!);
      const children = this.elementsOf(element);
      if (!shape.isContainer) {
        if (children.length) throw new EditorError(`unsupported child element in <${type}>`);
        shape.scale(transform.factor); shape.move(transform.dx, transform.dy);
        if (transform.factor !== 1) {
          if (attrs.has('style') || inheritedMetrics.has('style')) throw new EditorError('scaled inline CSS is not supported');
          const strokeWidth = this.dimension(metrics.get('stroke-width'), 1) * transform.factor;
          shape.setAttribute('stroke-width', String(strokeWidth));
          if (shape.textContent !== null) shape.preserveAttribute('font-size', String(this.dimension(metrics.get('font-size'), 16) * transform.factor));
        }
      }
      if (attrs.has('style')) metrics.set('style', attrs.get('style')!);
      document.add(shape, parent);
      children.forEach(child => load(child, shape, transform, metrics));
    };
    this.elementsOf(root).forEach(element => load(element, null, SvgTransform.parse(rootAttrs.get('transform')), rootAttrs));
    return { document, warnings };
  }

  encode(document: SvgDocument): string {
    const xml = new DOMImplementation().createDocument(this.namespace, 'svg', null);
    const root = xml.documentElement!;
    root.setAttribute('xmlns', this.namespace);
    root.setAttribute('width', String(document.width)); root.setAttribute('height', String(document.height));
    root.setAttribute('viewBox', document.attributes.get('viewBox') ?? `0 0 ${document.width} ${document.height}`);
    for (const [name, value] of document.attributes) {
      if (!['xmlns', 'width', 'height', 'viewBox'].includes(name)) root.setAttribute(name, value);
    }
    const append = (shape: Shape, parent: Element, depth: number): void => {
      parent.appendChild(xml.createTextNode(`\n${'  '.repeat(depth)}`));
      const element = xml.createElementNS(this.namespace, shape.type);
      for (const [name, value] of shape.attributes) element.setAttribute(name, value);
      if (shape.textContent !== null) element.appendChild(xml.createTextNode(shape.textContent));
      for (const child of shape.children) append(child, element, depth + 1);
      if (shape.children.length) element.appendChild(xml.createTextNode(`\n${'  '.repeat(depth)}`));
      parent.appendChild(element);
    };
    document.children.forEach(shape => append(shape, root, 1));
    if (document.children.length) root.appendChild(xml.createTextNode('\n'));
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(xml)}\n`;
  }
  private attributesOf(element: Element): Map<string, string> {
    const attributes = new Map<string, string>();
    for (let index = 0; index < element.attributes.length; index++) {
      const attr = element.attributes.item(index)!; attributes.set(attr.name, attr.value);
    }
    return attributes;
  }
  private elementsOf(node: Node): readonly Element[] {
    const elements: Element[] = [];
    for (let index = 0; index < node.childNodes.length; index++) {
      const child = node.childNodes.item(index)!;
      if (child.nodeType === 1) elements.push(child as Element);
    }
    return elements;
  }
  private dimension(value: string | undefined, fallback: number): number {
    return value === undefined ? fallback : NumberValue.parse(value.replace(/px$/i, ''), 'SVG dimension');
  }
}
