import type { SvgDocument } from '../domain/SvgDocument.js';
import type { EditorSession } from './EditorSession.js';

export class HistoryEntry {
  constructor(private readonly before: SvgDocument, private readonly after: SvgDocument,
    private readonly summary: string) {}
  undo(session: EditorSession): string { session.replace(this.before.clone()); return `undone: ${this.summary}`; }
  redo(session: EditorSession): string { session.replace(this.after.clone()); return `redone: ${this.summary}`; }
}
