import test from 'node:test';
import assert from 'node:assert/strict';
import { EditorHarness } from './EditorHarness.js';

test('before init/read every document-dependent command reports no document; help remains available', async () => {
  const h = new EditorHarness();
  for (const command of ['canvas', 'create g a', 'delete a', 'move a 1 2', 'scale a 2', 'set a fill red',
    'group g a', 'ungroup a', 'addto g a', 'front a', 'back a', 'tree', 'show a', 'save a.svg', 'undo', 'redo']) {
    await h.error(command, "no document. use 'init' or 'read' first");
  }
  const help = await h.exec('help'); assert.ok(help.some(line => line.includes('ellipse')));
  assert.ok(help.some(line => line.includes('addto')));
});

test('all six types, floats, case-sensitive ids and SVG defaults are represented', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create rect r -1.5 2.5 10 20', 'create circle R 10 20 3 red',
    'create ellipse e 1 2 3 4 blue', 'create line l 1 2 3 4 black', 'create text t 1 2 "你好 world"', 'create g g');
  assert.equal(h.context.session.document.all().length, 6);
  assert.equal(h.attr('r', 'fill'), undefined); assert.equal(h.attr('r', 'x'), '-1.5');
  assert.equal(h.attr('R', 'fill'), 'red'); assert.equal(h.attr('l', 'stroke'), 'black');
  assert.equal(h.context.session.document.require('t').textContent, '你好 world');
  await h.error('create rect r 0 0 1 1', 'id already exists: r');
  await h.error('create hexagon h', 'unknown shape type: hexagon (is the plugin loaded?)');
  await h.error('create box n 1 2 3 4 "标题"', 'unknown shape type: box (is the plugin loaded?)');
});

test('nested creation, recursive move/scale and container presentation use Composite semantics', async () => {
  const h = new EditorHarness();
  await h.exec('init 800 600', 'create g scene', 'create g node in scene',
    'create rect r 1 2 3 4 red in node', 'create circle c 5 6 7 in node',
    'create ellipse e 8 9 10 11 in node', 'create line l 12 13 14 15 in node',
    'create text t 16 17 "开始" in node', 'move scene 10 -2', 'scale scene 2', 'set node fill gold');
  assert.equal(h.attr('r', 'x'), '22'); assert.equal(h.attr('r', 'y'), '0'); assert.equal(h.attr('r', 'width'), '6');
  assert.equal(h.attr('c', 'cx'), '30'); assert.equal(h.attr('c', 'r'), '14');
  assert.equal(h.attr('e', 'cy'), '14'); assert.equal(h.attr('e', 'ry'), '22');
  assert.equal(h.attr('l', 'x2'), '48'); assert.equal(h.attr('l', 'y2'), '26');
  assert.equal(h.attr('t', 'x'), '52'); assert.equal(h.attr('node', 'fill'), 'gold');
  assert.equal(h.attr('r', 'fill'), 'red'); // Group style inherits through SVG; it does not overwrite children.
  await h.exec('undo'); assert.equal(h.attr('node', 'fill'), undefined);
  await h.exec('undo'); assert.equal(h.attr('r', 'x'), '11');
  await h.exec('undo'); assert.equal(h.attr('r', 'x'), '1');
});

test('set whitelist, text content and validation errors do not alter document or undo history', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create rect r 1 2 3 4', 'create text t 5 6 "old"', 'set t text "new text"',
    'set r width 9', 'set r stroke blue', 'set r stroke-width 2.5');
  const before = h.snapshot();
  for (const [command, message] of [
    ['set r font-size 12', 'unknown attribute: font-size'], ['set r text nope', 'unknown attribute: text'],
    ['set t r 3', 'unknown attribute: r'], ['set r width -1', 'width must be non-negative'],
    ['set r stroke-width -1', 'stroke-width must be non-negative'], ['move r NaN 1', 'invalid number: NaN'],
    ['scale r 0', 'scale factor must be positive'], ['scale r -1', 'scale factor must be positive'],
    ['scale r Infinity', 'invalid number: Infinity'], ['delete missing', 'no such shape: missing'],
  ]) {
    await h.error(command!, message!); assert.equal(h.snapshot(), before);
  }
  await h.exec('undo'); assert.equal(h.attr('r', 'stroke-width'), undefined);
  await h.exec('undo', 'undo', 'undo'); assert.equal(h.context.session.document.require('t').textContent, 'old');
});

test('creation failures preserve both document and redo branch', async () => {
  const h = new EditorHarness(); await h.exec('init', 'create g g', 'create rect r 1 2 3 4', 'undo');
  const before = h.snapshot();
  await h.error('create circle c 0 0 1 in missing', 'no such container: missing');
  await h.error('create rect bad 0 0 -1 1', 'width must be non-negative');
  await h.error('create rect bad 0 nope 1 1', 'invalid y: nope');
  assert.equal(h.snapshot(), before); await h.exec('redo'); assert.ok(h.context.session.document.find('r'));
  await h.error('create g x in r', 'not a container: r');
});

test('group maintains document order, occupies first selected position and is one undo unit', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create g a', 'create g b', 'create g c', 'create g d');
  const before = h.snapshot(); await h.exec('group selected c a');
  assert.deepEqual(h.ids(), ['selected', 'b', 'd']); assert.deepEqual(h.ids('selected'), ['a', 'c']);
  await h.exec('undo'); assert.equal(h.snapshot(), before);
  await h.exec('redo'); assert.deepEqual(h.ids('selected'), ['a', 'c']);
});

test('group from different parents uses lowest common parent and preserves preorder', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create g scene', 'create g a in scene', 'create g b in scene',
    'create circle c1 1 1 1 in a', 'create circle c2 2 2 2 in b');
  const before = h.snapshot(); await h.exec('group pair c2 c1');
  assert.deepEqual(h.ids('scene'), ['pair', 'a', 'b']); assert.deepEqual(h.ids('pair'), ['c1', 'c2']);
  await h.exec('undo'); assert.equal(h.snapshot(), before);
});

test('reject group/addto cycles and duplicated group selection atomically', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create g scene', 'create g inner in scene', 'create circle c 1 2 3 in inner');
  const before = h.snapshot();
  await h.error('group bad c scene', 'cannot group a container into its own descendant: scene');
  await h.error('addto inner scene', 'cannot group a container into its own descendant: scene');
  await h.error('addto inner inner', 'cannot group a container into its own descendant: inner');
  await h.error('group bad c c', 'duplicate group member');
  await h.error('group inner c', 'id already exists: inner');
  await h.error('group bad c missing', 'no such shape: missing');
  assert.equal(h.snapshot(), before); await h.exec('undo'); assert.equal(h.context.session.document.find('c'), undefined);
});

test('nested ungroup promotes children in place and undo restores hierarchy; root ungroup is forbidden', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create g scene', 'create g a in scene', 'create g nested in scene',
    'create g z in scene', 'create rect r 1 2 3 4 in nested', 'create circle c 5 6 7 in nested');
  const before = h.snapshot(); await h.exec('ungroup nested');
  assert.deepEqual(h.ids('scene'), ['a', 'r', 'c', 'z']);
  await h.exec('undo'); assert.equal(h.snapshot(), before);
  await h.error('ungroup scene', 'cannot ungroup top-level container: scene');
  await h.error('ungroup r', 'not a container: r');
});

test('addto appends, front/back operate within siblings, delete restores descendants and original position', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create g scene', 'create g a in scene', 'create g b in scene', 'create g c',
    'addto scene c', 'front a');
  assert.deepEqual(h.ids('scene'), ['b', 'c', 'a']); assert.deepEqual(h.ids(), ['scene']);
  await h.exec('back a'); assert.deepEqual(h.ids('scene'), ['a', 'b', 'c']);
  await h.exec('create circle leaf 1 2 3 in b'); const before = h.snapshot();
  await h.exec('delete b'); assert.equal(h.context.session.document.find('leaf'), undefined);
  await h.exec('undo'); assert.equal(h.snapshot(), before);
  await h.exec('addto scene a'); assert.deepEqual(h.ids('scene'), ['b', 'c', 'a']);
});

test('undo/redo branch: displays do not clear redo, successful new edit does', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create circle c 1 2 3', 'move c 10 20', 'undo', 'tree', 'show c', 'help', 'canvas', 'redo');
  assert.equal(h.attr('c', 'cx'), '11');
  await h.exec('undo', 'set c fill red'); await h.error('redo', 'nothing to redo');
  await h.exec('undo', 'undo'); await h.error('undo', 'nothing to undo');
});

for (const barrier of ['init 200 300', 'canvas 200 300', 'save out.svg', 'read next.svg']) {
  test(`${barrier} clears history and blocks both undo and redo until next successful edit`, async () => {
    const h = new EditorHarness(); h.files.seed('next.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>');
    await h.exec('init', 'create g g', 'create g h', 'undo', barrier);
    await h.error('undo', 'undo not allowed after io command'); await h.error('redo', 'undo not allowed after io command');
    await h.exec('create g fresh', 'undo'); await h.error('undo', 'nothing to undo');
    await h.exec('redo'); assert.ok(h.context.session.document.find('fresh'));
  });
}

test('failed init, resize, read, save preserve document, path and redo branch', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create g g', 'save original.svg', 'create circle c 1 2 3', 'undo');
  const before = h.snapshot(); h.files.seed('bad.svg', '<svg><g>'); h.files.blockWrites();
  await h.error('init -1 200', 'canvas width must be positive');
  await h.error('canvas 100 -1', 'canvas height must be positive');
  await h.error('read missing.svg', 'cannot read file: missing.svg');
  assert.match((await h.app.run('read bad.svg'))[0]!, /^error: invalid SVG:/);
  await h.error('save failed.svg', 'cannot write file: failed.svg');
  assert.equal(h.snapshot(), before); assert.equal(h.context.session.path, 'original.svg');
  await h.exec('redo'); assert.ok(h.context.session.document.find('c'));
});

test('save default path, init path reset and explicit save-as semantics', async () => {
  const h = new EditorHarness(); await h.exec('init');
  await h.error('save', "no file path. use 'save <file.svg>'");
  await h.exec('save first.svg', 'create g g', 'save'); assert.match(await h.files.read('first.svg'), /id="g"/);
  await h.exec('read first.svg', 'save second.svg', 'save'); assert.equal(h.context.session.path, 'second.svg');
  await h.exec('init'); assert.equal(h.context.session.path, null);
});

test('overflow during recursive mutation rolls back even if a previous child already changed', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create g g', 'create rect small 1 2 3 4 in g', 'create circle big 1e308 1 1 in g');
  const before = h.snapshot(); assert.match((await h.app.run('scale g 10'))[0]!, /^error: invalid/);
  assert.equal(h.snapshot(), before); await h.exec('undo'); assert.equal(h.context.session.document.find('big'), undefined);
});

test('quoted empty text, escaped quotes, spaces, Windows backslashes and full-line comments', async () => {
  const h = new EditorHarness(); assert.deepEqual(await h.exec(' # comment', ''), []);
  await h.exec('init', 'create text t 0 0 ""'); assert.equal(h.context.session.document.require('t').textContent, '');
  await h.exec('set t text "He said \\"hi\\" at C:\\work"');
  assert.equal(h.context.session.document.require('t').textContent, 'He said "hi" at C:\\work');
  const before = h.snapshot(); await h.error('set t text "broken', 'unterminated double quote'); assert.equal(h.snapshot(), before);
});

test('tree/show expose geometry, parent, text, presentation and scoped subtrees', async () => {
  const h = new EditorHarness();
  await h.exec('init', 'create g g', 'create rect r 10 20 30 40 red in g', 'create text t 1 2 "hello" in g');
  const tree = (await h.exec('tree')).join('\n'); assert.match(tree, /svg \(800x600\)/); assert.match(tree, /rect#r.*x=10.*w=30.*fill=red/);
  assert.match(tree, /text#t.*\(1,2\).*"hello"/);
  assert.match((await h.exec('show r')).join('\n'), /parent=g#g\n.*x=10/);
  assert.equal((await h.exec('tree r')).length, 1);
});

test('wrong arity, unknown command, one-argument canvas and missing ids are single-line errors', async () => {
  const h = new EditorHarness(); await h.exec('init', 'create g g'); const before = h.snapshot();
  for (const command of ['move g 1', 'tree g extra', 'undo extra', 'canvas 100', 'set g fill', 'group x',
    'create rect r 1 2 3', 'create g', 'help extra', 'save a b', 'read', 'init 1 2 3']) {
    assert.match((await h.app.run(command))[0]!, /^error: usage:/, command); assert.equal(h.snapshot(), before);
  }
  await h.error('wut', 'unknown command: wut'); await h.error('show missing', 'no such shape: missing');
});
