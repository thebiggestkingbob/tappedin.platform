import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const backend=readFileSync(new URL('../worker/community.mjs',import.meta.url),'utf8');
const office=readFileSync(new URL('../web/community.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../web/app.html',import.meta.url),'utf8');

test('accepted booking requires requester authority on the server',()=>{
  assert.match(backend,/Only the booking requester can create its linked workspace/);
  assert.match(backend,/The booking must be accepted before creating a workspace/);
  assert.match(backend,/A workspace is already linked to this booking/);
});

test('booking source is visible only to its requester in the Office selector',()=>{
  assert.match(office,/state\.requests\.filter\(b=>b\.from==='me'&&b\.status==='Accepted'\)/);
  assert.match(office,/linkedBooking=sourceId\?state\.requests\.find/);
});

test('booking and project can navigate to one another',()=>{
  assert.match(app,/Create linked workspace/);
  assert.match(app,/Open linked workspace/);
  assert.match(office,/p\.linkedKind==='requests'\?\x60setOfficeDesk\('bookings'\)\x60/);
});
