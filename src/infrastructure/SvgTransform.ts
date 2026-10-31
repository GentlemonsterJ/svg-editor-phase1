import { EditorError } from '../domain/EditorError.js';
import { NumberValue } from '../domain/NumberValue.js';

/** Positive uniform scale + translation; compose in SVG's right-to-left order. */
export class SvgTransform {
  constructor(readonly factor = 1, readonly dx = 0, readonly dy = 0) {}
  compose(local: SvgTransform): SvgTransform {
    return new SvgTransform(NumberValue.positive(this.factor * local.factor, 'transform scale'),
      NumberValue.finite(this.factor * local.dx + this.dx), NumberValue.finite(this.factor * local.dy + this.dy));
  }
  static parse(value: string | undefined): SvgTransform {
    if (!value?.trim()) return new SvgTransform();
    let result = new SvgTransform(); let rest = value.trim();
    while (rest) {
      const match = /^(translate|scale)\s*\(([^)]*)\)\s*/.exec(rest);
      if (!match) throw new EditorError(`unsupported SVG transform: ${value}`);
      const values = match[2]!.trim().split(/[\s,]+/).map(part => NumberValue.parse(part, 'transform'));
      if (values.length < 1 || values.length > 2) throw new EditorError(`unsupported SVG transform: ${value}`);
      if (match[1] === 'translate') result = result.compose(new SvgTransform(1, values[0]!, values[1] ?? 0));
      else {
        const factor = NumberValue.positive(values[0]!, 'transform scale');
        if (values.length === 2 && values[1] !== factor) throw new EditorError('non-uniform SVG scale is not supported');
        result = result.compose(new SvgTransform(factor));
      }
      rest = rest.slice(match[0].length).replace(/^,\s*/, '');
    }
    return result;
  }
}
