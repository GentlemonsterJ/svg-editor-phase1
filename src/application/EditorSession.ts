import { SvgDocument } from '../domain/SvgDocument.js';
import { EditorError } from '../domain/EditorError.js';

export class EditorSession {
  private current: SvgDocument | null = null;
  private currentPath: string | null = null;
  get document(): SvgDocument {
    if (!this.current) throw new EditorError("no document. use 'init' or 'read' first");
    return this.current;
  }
  get path(): string | null { return this.currentPath; }
  open(document: SvgDocument, path: string | null = null): void { this.current = document; this.currentPath = path; }
  replace(document: SvgDocument): void { this.current = document; }
  saved(path: string): void { this.currentPath = path; }
}
