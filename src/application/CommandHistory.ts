import { EditorError } from '../domain/EditorError.js';
import type { EditorSession } from './EditorSession.js';
import type { EditingOperation } from './EditingOperation.js';
import { HistoryEntry } from './HistoryEntry.js';

export class CommandHistory {
  private readonly past: HistoryEntry[] = [];
  private readonly future: HistoryEntry[] = [];
  private blocked = true;
  execute(operation: EditingOperation, session: EditorSession): string {
    const before = session.document.clone();
    const draft = before.clone();
    const summary = operation.apply(draft); // Nothing below runs if validation/mutation fails.
    const entry = new HistoryEntry(before, draft.clone(), summary);
    session.replace(draft); this.past.push(entry); this.future.length = 0; this.blocked = false;
    return summary;
  }
  barrier(): void { this.past.length = 0; this.future.length = 0; this.blocked = true; }
  undo(session: EditorSession): string {
    this.ensureAllowed(); const entry = this.past.at(-1);
    if (!entry) throw new EditorError('nothing to undo');
    const result = entry.undo(session); this.past.pop(); this.future.push(entry); return result;
  }
  redo(session: EditorSession): string {
    this.ensureAllowed(); const entry = this.future.at(-1);
    if (!entry) throw new EditorError('nothing to redo');
    const result = entry.redo(session); this.future.pop(); this.past.push(entry); return result;
  }
  private ensureAllowed(): void { if (this.blocked) throw new EditorError('undo not allowed after io command'); }
}
