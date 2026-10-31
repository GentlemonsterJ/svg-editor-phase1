import { Shape } from './Shape.js';
import { NumberValue } from './NumberValue.js';
import { NumericAttribute } from './NumericAttribute.js';

export abstract class GeometricShape extends Shape {
  private readonly geometry = new Map<string, NumericAttribute>();

  protected define(name: string, value: number, isLength = false): void {
    this.geometry.set(name, new NumericAttribute(name, value, isLength));
  }
  protected value(name: string): number { return this.geometry.get(name)!.value; }
  protected shift(name: string, delta: number): void {
    this.geometry.get(name)!.set(this.value(name) + delta);
  }
  override setAttribute(name: string, value: string): void {
    const attribute = this.geometry.get(name);
    if (attribute) attribute.set(NumberValue.parse(value, name));
    else super.setAttribute(name, value);
  }
  override get attributes(): ReadonlyMap<string, string> {
    return new Map([...super.attributes, ...[...this.geometry].map(([name, attr]) =>
      [name, NumberValue.format(attr.value)] as const)]);
  }
  override scale(factor: number): void {
    NumberValue.positive(factor, 'scale factor');
    for (const attr of this.geometry.values()) attr.set(attr.value * factor);
  }
}
