import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { FileGateway } from '../application/ports/FileGateway.js';
import { EditorError } from '../domain/EditorError.js';

export class NodeFileGateway implements FileGateway {
  async read(path: string): Promise<string> {
    try { return await readFile(path, 'utf8'); }
    catch { throw new EditorError(`cannot read file: ${path}`); }
  }
  async write(path: string, contents: string): Promise<void> {
    const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, contents, { encoding: 'utf8', flag: 'wx' });
      await rename(temporary, path);
    } catch {
      await unlink(temporary).catch(() => undefined);
      throw new EditorError(`cannot write file: ${path}`);
    }
  }
}
