import { NumberValue } from './NumberValue.js';

export class NumericAttribute {
  private current: number;
  constructor(private readonly name: string, value: number, private readonly isLength = false) {
    this.current = this.validate(value);
  }
  get value(): number { return this.current; }
  set(value: number): void { this.current = this.validate(value); }
  private validate(value: number): number {
    return this.isLength ? NumberValue.nonNegative(value, this.name) : NumberValue.finite(value, this.name);
  }
}
