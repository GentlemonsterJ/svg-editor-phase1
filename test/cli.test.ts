import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeFileGateway } from '../src/infrastructure/NodeFileGateway.js';
import { EditorHarness } from './EditorHarness.js';

const cli = fileURLToPath(new URL('../src/cli/main.js', import.meta.url));

test('real CLI sequentially replays creation/save/read/move/undo scripts and writes valid SVG in a path with spaces', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'svg-cli-'));
  try {
    const result = spawnSync(process.execPath, [cli, '--script'], { cwd: directory, encoding: 'utf8', input: [
      '# script replay', 'init 400 200', 'create g scene', 'create rect r 10 20 30 40 red in scene',
      'create text t 20 45 "中文 & text" in scene', 'save "my drawing.svg"', 'read "my drawing.svg"',
      'move scene 10 0', 'undo', 'redo', 'save', 'tree', '',
    ].join('\n') });
    assert.equal(result.status, 0, result.stdout + result.stderr); assert.equal(result.stderr, '');
    assert.match(result.stdout, /rect#r.*x=20/); assert.ok(!result.stdout.includes('svg>'));
    const saved = await readFile(join(directory, 'my drawing.svg'), 'utf8');
    assert.equal(new EditorHarness().codec.decode(saved).document.require('t').textContent, '中文 & text');
    assert.deepEqual(await readdir(directory), ['my drawing.svg']);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('script errors set nonzero exit status while later lines still execute; default mode shows banner and prompt', () => {
  const script = spawnSync(process.execPath, [cli, '--script'], { encoding: 'utf8', input: 'init\ncreate box n\ncreate g g\ntree\n' });
  assert.equal(script.status, 1); assert.match(script.stdout, /error: unknown shape type: box/); assert.match(script.stdout, /g#g/);
  const repl = spawnSync(process.execPath, [cli], { encoding: 'utf8', input: 'init\ncanvas\n' });
  assert.equal(repl.status, 0); assert.match(repl.stdout, /svg-editor 0.1/); assert.match(repl.stdout, /svg> /);
});

test('filesystem errors use prescribed messages and failed atomic writes leave existing targets and no temp files', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'svg-files-')); const files = new NodeFileGateway();
  try {
    const missing = join(directory, 'missing.svg');
    await assert.rejects(files.read(missing), { message: `cannot read file: ${missing}` });
    const target = join(directory, 'existing.svg'); await writeFile(target, 'original');
    await files.write(target, '<svg/>'); assert.equal(await files.read(target), '<svg/>');
    await assert.rejects(files.write(directory, 'fail'), { message: `cannot write file: ${directory}` });
    await assert.rejects(files.write(join(directory, 'missing', 'a.svg'), 'fail'), /cannot write file:/);
    assert.equal(await readFile(target, 'utf8'), '<svg/>'); assert.deepEqual(await readdir(directory), ['existing.svg']);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
