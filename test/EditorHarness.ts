import assert from 'node:assert/strict';
import { ShapeFactory } from '../src/domain/ShapeFactory.js';
import { SvgXmlCodec } from '../src/infrastructure/SvgXmlCodec.js';
import { EditorContext } from '../src/application/EditorContext.js';
import { EditorApplication } from '../src/application/EditorApplication.js';
import { MemoryFileGateway } from './MemoryFileGateway.js';

export class EditorHarness {
  readonly shapes = new ShapeFactory();
  readonly files = new MemoryFileGateway();
  readonly codec = new SvgXmlCodec(this.shapes);
  readonly context = new EditorContext(this.files, this.codec, this.shapes);
  readonly app = new EditorApplication(this.context);
  async exec(...commands: readonly string[]): Promise<readonly string[]> {
    let result: readonly string[] = [];
    for (const command of commands) {
      result = await this.app.run(command);
      assert.ok(!result.some(line => line.startsWith('error:')), `${command}: ${result.join('\n')}`);
    }
    return result;
  }
  async error(command: string, message: string): Promise<void> {
    assert.deepEqual(await this.app.run(command), [`error: ${message}`]);
  }
  attr(id: string, name: string): string | undefined { return this.context.session.document.require(id).attributes.get(name); }
  ids(parent?: string): readonly string[] {
    const document = this.context.session.document;
    return (parent ? document.require(parent).children : document.children).map(shape => shape.id);
  }
  snapshot(): string { return this.codec.encode(this.context.session.document); }
}
