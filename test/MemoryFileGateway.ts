import type { FileGateway } from '../src/application/ports/FileGateway.js';
import { EditorError } from '../src/domain/EditorError.js';

export class MemoryFileGateway implements FileGateway {
  private readonly contents = new Map<string, string>();
  private denyWrite = false;
  seed(path: string, contents: string): void { this.contents.set(path, contents); }
  blockWrites(): void { this.denyWrite = true; }
  async read(path: string): Promise<string> {
    const value = this.contents.get(path);
    if (value === undefined) throw new EditorError(`cannot read file: ${path}`);
    return value;
  }
  async write(path: string, contents: string): Promise<void> {
    if (this.denyWrite) throw new EditorError(`cannot write file: ${path}`);
    this.seed(path, contents);
  }
}
