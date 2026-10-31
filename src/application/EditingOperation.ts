import type { SvgDocument } from '../domain/SvgDocument.js';

export interface EditingOperation {
  apply(document: SvgDocument): string;
}
