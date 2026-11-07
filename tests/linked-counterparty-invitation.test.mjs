import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const server=readFileSync(new URL('../worker/community.mjs',import.meta.url),'utf8');
const client=readFileSync(new URL('../web/community.js',import.meta.url),'utf8');
test('linked counterparty invitations require explicit opt-in',()=>{
 assert.match(server,/if\(p\.inviteSourceCounterparty\)/);
 assert.match(server,/status:'Invited'/);
 assert.match(client,/id="project-invite-source"/);
 assert.match(client,/inviteSourceCounterparty:!!document\.getElementById/);
});
test('accepted opportunity only infers a single counterparty',()=>{
 assert.match(server,/if\(acceptedPeople\.length===1\)sourceCounterparty=acceptedPeople\[0\]\.person/);
});
