import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../worker/community.mjs',import.meta.url),'utf8');
const client=readFileSync(new URL('../web/community.js',import.meta.url),'utf8');

test('project snapshots only the accepted revision, not a later draft',()=>{
 assert.match(backend,/agreement\.revisions\.find\(r=>r\.number===agreement\.acceptedRevision\)/);
 assert.match(backend,/agreementSnapshot, business|agreementSnapshot,business/);
});
test('project overview separates accepted terms from editable project scope',()=>{
 assert.match(client,/Accepted negotiation · revision/);
 assert.match(client,/Accepted terms are preserved separately from editable project scope/);
 assert.match(client,/Project scope/);
});
