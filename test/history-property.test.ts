import test from 'node:test';
import assert from 'node:assert/strict';
import { EditorHarness } from './EditorHarness.js';

test('mixed edit history is fully reversible and replayable across 100+ successful transactions', async () => {
  const h = new EditorHarness(); await h.exec('init'); const initial = h.snapshot();
  const commands: string[] = ['create g scene'];
  for (let i = 0; i < 12; i++) {
    commands.push(`create g n${i} in scene`, `create rect r${i} ${i} ${i + 1} 10 20 in n${i}`,
      `create text t${i} ${i + 1} ${i + 2} "node ${i}" in n${i}`, `move n${i} 0.5 -1.5`,
      `scale n${i} 2`, `set r${i} fill red`, `front n${i}`, `back n${i}`, `delete t${i}`);
  }
  commands.push('group combined n5 n3 n9', 'move combined -10 25', 'ungroup combined', 'addto n1 r0', 'delete n7');
  await h.exec(...commands); const final = h.snapshot();
  for (const _command of commands) await h.exec('undo');
  assert.equal(h.snapshot(), initial);
  for (const _command of commands) await h.exec('redo');
  assert.equal(h.snapshot(), final);
  assert.equal(h.codec.encode(h.codec.decode(final).document), final);
});
