import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../worker/community.mjs',import.meta.url),'utf8');
const client=readFileSync(new URL('../web/community.js',import.meta.url),'utf8');

test('negotiations require a real counterparty and private membership',()=>{
  assert.match(backend,/payload\.to===id\|\|!await getProfile\(d,payload\.to\)/);
  assert.match(backend,/row\.value\.from!==id&&row\.value\.to!==id/);
});
test('offers preserve revisions and only the other party can respond',()=>{
  assert.match(backend,/n\.revisions\.push\(\{number:latest\.number\+1/);
  assert.match(backend,/if\(latest\.by===id\)fail\(403/);
  assert.match(backend,/n\.acceptedRevision=latest\.number/);
  assert.match(backend,/json_extract\(data,'\$\.version'\) = \?/);
});
test('Office exposes negotiation inbox, review and counteroffer controls',()=>{
  assert.match(client,/\['negotiations','Negotiations'\]/);
  assert.match(client,/function openNegotiation\(/);
  assert.match(client,/function counterNegotiation\(/);
  assert.match(client,/function respondNegotiation\(/);
});
