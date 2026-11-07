import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const office = readFileSync(new URL('../web/community.js', import.meta.url), 'utf8');
const opportunity = readFileSync(new URL('../web/upgrade.js', import.meta.url), 'utf8');

test('accepted brief exposes explicit linked-workspace action', () => {
  assert.match(opportunity, /a\.status==='Accepted'/);
  assert.match(opportunity, /Create linked workspace/);
  assert.match(opportunity, /newProject\(false/);
});

test('linked project creation is owner-guarded and does not silently invite people', () => {
  assert.match(office, /o\.id===sourceId&&o\.by==='me'/);
  assert.match(office, /Only the brief owner can start a linked workspace/);
  assert.match(office, /creating the workspace does not automatically invite them or confirm new terms/);
  assert.match(office, /linked:document\.getElementById\('project-linked'\)\.value/);
});

const backend = readFileSync(new URL('../worker/community.mjs', import.meta.url), 'utf8');

test('server requires brief ownership and an accepted application before linking', () => {
  assert.match(backend, /Only the brief owner can create its linked workspace/);
  assert.match(backend, /Accept an application before creating a linked workspace/);
  assert.match(backend, /json_extract\(data,'\$\.status'\) = 'Accepted'/);
});

test('server rejects an already linked workspace and UI hides repeated creation', () => {
  assert.match(backend, /A workspace is already linked to this brief/);
  assert.match(opportunity, /!officeProjects\.some\(p=>p\.linked===id/);
});
