import type { FileGateway } from './ports/FileGateway.js';
import type { SvgCodec } from './ports/SvgCodec.js';
import { EditorSession } from './EditorSession.js';
import { CommandHistory } from './CommandHistory.js';
import { ShapeFactory } from '../domain/ShapeFactory.js';
import { ShapePresenter } from './ShapePresenter.js';

export class EditorContext {
  readonly session = new EditorSession();
  readonly history = new CommandHistory();
  readonly presenter = new ShapePresenter();
  constructor(readonly files: FileGateway, readonly codec: SvgCodec, readonly shapes: ShapeFactory) {}
}
