import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../worker/community.mjs',import.meta.url),'utf8');
const client=readFileSync(new URL('../web/community.js',import.meta.url),'utf8');

test('Office activity only includes participant negotiations and own projects',()=>{
 assert.match(backend,/path==='\/api\/v3\/office-activity'/);
 assert.match(backend,/kind = 'negotiation' AND \(owner = \? OR recipient = \?\)/);
 assert.match(backend,/filter\(p=>p\.owner===id\|\|p\.members\?\.some\(m=>m\.person===id\)\)/);
});
test('activity flags action-required items without changing project membership',()=>{
 assert.match(backend,/actionRequired:waiting/);
 assert.match(backend,/status:'Invited',actionRequired:true/);
 assert.match(client,/function renderOfficeActivity\(/);
 assert.match(client,/function openOfficeActivity\(/);
 assert.doesNotMatch(client,/if\(p\?\.status==='Invitation'\)acceptProject/);
});
