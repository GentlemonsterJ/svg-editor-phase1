import { EditorError } from './EditorError.js';

export class NumberValue {
  static parse(value: string, label = 'number'): number {
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
      throw new EditorError(`invalid ${label}: ${value}`);
    }
    return this.finite(Number(value), label);
  }

  static finite(value: number, label = 'number'): number {
    if (!Number.isFinite(value)) throw new EditorError(`invalid ${label}: ${value}`);
    return Object.is(value, -0) ? 0 : value;
  }

  static nonNegative(value: number, label: string): number {
    this.finite(value, label);
    if (value < 0) throw new EditorError(`${label} must be non-negative`);
    return value;
  }

  static positive(value: number, label: string): number {
    this.finite(value, label);
    if (value <= 0) throw new EditorError(`${label} must be positive`);
    return value;
  }

  static format(value: number): string {
    return String(Object.is(value, -0) ? 0 : value);
  }
}
