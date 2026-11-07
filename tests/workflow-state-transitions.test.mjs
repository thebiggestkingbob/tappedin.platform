import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const backend=readFileSync(new URL('../worker/index.mjs',import.meta.url),'utf8');

test('booking state changes follow a defined forward-only path',()=>{
  assert.match(backend,/old\.status==='Requested'\?\['Accepted','Declined'\]:\['Completed'\]/);
  assert.match(backend,/old\.status!=='Requested'&&old\.status!=='Accepted'/);
  assert.match(backend,/canRecipientTransition\|\|canRequesterCancel/);
  assert.match(backend,/extendedGrant\(d,old\.to,id,'approve'\)/);
});

test('applications can only be decided while Sent',()=>{
  assert.match(backend,/if\(old\.status!=='Sent'\)fail\(409,'This application has already been decided\.'/);
});
