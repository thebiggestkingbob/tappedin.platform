import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../worker/community.mjs',import.meta.url),'utf8');
const client=readFileSync(new URL('../web/community.js',import.meta.url),'utf8');
const setup=readFileSync(new URL('../supabase/setup.sql',import.meta.url),'utf8');

test('accepted negotiations are eligible only for initiator-owned linked workspaces',()=>{
 assert.match(backend,/Only the negotiation initiator can create its linked workspace/);
 assert.match(backend,/agreement\.status!=='Accepted'\|\|!agreement\.acceptedRevision/);
 assert.match(backend,/A workspace is already linked to this agreement/);
});
test('Office can create and navigate to accepted agreement workspace',()=>{
 assert.match(client,/Create workspace from agreement/);
 assert.match(client,/linkedAgreement=sourceId\?officeNegotiations\.find/);
 assert.match(client,/p\.linkedKind==='negotiation'/);
});
test('schema declares an atomic uniqueness constraint for linked projects',()=>{
 assert.match(setup,/CREATE UNIQUE INDEX IF NOT EXISTS "project_linked_source_unique"/);
 assert.match(setup,/WHERE "kind" = 'project'/);
});
