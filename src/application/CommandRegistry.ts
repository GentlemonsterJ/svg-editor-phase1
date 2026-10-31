import type { Command } from './Command.js';
import type { ShapeFactory } from '../domain/ShapeFactory.js';
import { CommandRegistration } from './CommandRegistration.js';
import { EditorError } from '../domain/EditorError.js';
import { InitCommand } from './commands/InitCommand.js';
import { ReadCommand } from './commands/ReadCommand.js';
import { SaveCommand } from './commands/SaveCommand.js';
import { CanvasCommand } from './commands/CanvasCommand.js';
import { CreateCommand } from './commands/CreateCommand.js';
import { DeleteCommand } from './commands/DeleteCommand.js';
import { MoveCommand } from './commands/MoveCommand.js';
import { ScaleCommand } from './commands/ScaleCommand.js';
import { SetCommand } from './commands/SetCommand.js';
import { GroupCommand } from './commands/GroupCommand.js';
import { UngroupCommand } from './commands/UngroupCommand.js';
import { AddToCommand } from './commands/AddToCommand.js';
import { FrontCommand } from './commands/FrontCommand.js';
import { BackCommand } from './commands/BackCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { ShowCommand } from './commands/ShowCommand.js';
import { UndoCommand } from './commands/UndoCommand.js';
import { RedoCommand } from './commands/RedoCommand.js';
import { HelpCommand } from './commands/HelpCommand.js';

export class CommandRegistry {
  private readonly registrations = new Map<string, CommandRegistration>();
  constructor(shapes: ShapeFactory) {
    this.registrations.set('init', new CommandRegistration('init [w] [h]', a => new InitCommand(a)));
    this.registrations.set('read', new CommandRegistration('read <file.svg>', a => new ReadCommand(a)));
    this.registrations.set('save', new CommandRegistration('save [file.svg]', a => new SaveCommand(a)));
    this.registrations.set('canvas', new CommandRegistration('canvas [w h]', a => new CanvasCommand(a)));
    this.registrations.set('create', new CommandRegistration('create <type> <id> [params...] [in <containerId>]', a => new CreateCommand(a, shapes)));
    this.registrations.set('delete', new CommandRegistration('delete <id>', a => new DeleteCommand(a)));
    this.registrations.set('move', new CommandRegistration('move <id> <dx> <dy>', a => new MoveCommand(a)));
    this.registrations.set('scale', new CommandRegistration('scale <id> <factor>', a => new ScaleCommand(a)));
    this.registrations.set('set', new CommandRegistration('set <id> <attr> <value>', a => new SetCommand(a)));
    this.registrations.set('group', new CommandRegistration('group <newGid> <id1> <id2>...', a => new GroupCommand(a)));
    this.registrations.set('ungroup', new CommandRegistration('ungroup <gid>', a => new UngroupCommand(a)));
    this.registrations.set('addto', new CommandRegistration('addto <gid> <id>', a => new AddToCommand(a)));
    this.registrations.set('front', new CommandRegistration('front <id>', a => new FrontCommand(a)));
    this.registrations.set('back', new CommandRegistration('back <id>', a => new BackCommand(a)));
    this.registrations.set('tree', new CommandRegistration('tree [id]', a => new TreeCommand(a)));
    this.registrations.set('show', new CommandRegistration('show <id>', a => new ShowCommand(a)));
    this.registrations.set('undo', new CommandRegistration('undo', a => new UndoCommand(a)));
    this.registrations.set('redo', new CommandRegistration('redo', a => new RedoCommand(a)));
    this.registrations.set('help', new CommandRegistration('help', a => new HelpCommand(a, this.help())));
  }
  resolve(name: string, args: readonly string[]): Command {
    // Named command dispatch lives only here. TODO(plugin phase): command registration API.
    const registration = this.registrations.get(name);
    if (!registration) throw new EditorError(`unknown command: ${name}`);
    return registration.create(args);
  }
  help(): readonly string[] {
    return ['Commands:', ...[...this.registrations.values()].map(registration => `  ${registration.syntax}`),
      'Types:', '  rect <id> <x> <y> <w> <h> [fill]', '  circle <id> <cx> <cy> <r> [fill]',
      '  ellipse <id> <cx> <cy> <rx> <ry> [fill]', '  line <id> <x1> <y1> <x2> <y2> [stroke]',
      '  text <id> <x> <y> "content"', '  g <id>',
      'All create commands accept [in <containerId>]. EOF / Ctrl+D exits.'];
  }
}
