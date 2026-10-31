import { EditorError } from '../domain/EditorError.js';

export class Tokenizer {
  tokenize(line: string): readonly string[] {
    if (line.trimStart().startsWith('#')) return [];
    const tokens: string[] = []; let current = ''; let quoted = false; let started = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i]!;
      if (char === '"') { quoted = !quoted; started = true; }
      else if (quoted && char === '\\' && ['"', '\\'].includes(line[i + 1] ?? '')) {
        current += line[++i]!; started = true;
      } else if (!quoted && /\s/u.test(char)) {
        if (started) { tokens.push(current); current = ''; started = false; }
      } else { current += char; started = true; }
    }
    if (quoted) throw new EditorError('unterminated double quote');
    if (started) tokens.push(current);
    return tokens;
  }
}
