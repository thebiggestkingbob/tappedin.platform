import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../server/handler.mjs';
import {authCall} from '../server/supabase.mjs';
const base='https://platform.test';
const good={ok:true,status:200,body:{user:{id:'member'},access_token:'private-access',refresh_token:'private-refresh'}};
const call=(path,payload,provider,origin=base)=>handle(new Request(base+'/api/auth/'+path,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(payload)}),{authCall:provider});
const email='member@example.com',password='a-long-test-password';
test('signup sends password only to Auth and does not return a login session',async()=>{
 const r=await call('signup',{email,password},async(path,data)=>{assert.equal(path,'signup');assert.deepEqual(data,{email,password});return {ok:true,status:200,body:{user:{id:'member'}}}});
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{confirmationRequired:true});assert.equal(r.headers.getSetCookie().length,0);
});
test('signup validates password and origin before contacting provider',async()=>{
 const never=()=>assert.fail('provider must not be called');
 assert.equal((await call('signup',{email,password:'short'},never)).status,400);
 assert.equal((await call('signup',{email,password},never,'https://evil.test')).status,403);
});
test('signup confirmation verifies signup code and clears sessions instead of signing in',async()=>{
 const r=await call('confirm',{email,token:'123456'},async(path,data)=>{assert.equal(path,'verify');assert.equal(data.type,'signup');return good});
 assert.deepEqual(await r.json(),{confirmed:true});for(const cookie of r.headers.getSetCookie()){assert.ok(cookie.includes('Max-Age=0'));assert.ok(!cookie.includes('private-access'))}
});
test('reset requires valid recovery code before password update, using PUT and verified token',async()=>{
 const calls=[];const r=await call('reset',{email,token:'123456',password},async(...args)=>{calls.push(args);return good});
 assert.deepEqual(calls[0],['verify',{email,token:'123456',type:'recovery'}]);assert.deepEqual(calls[1],['user',{password},'private-access','PUT']);
 assert.deepEqual(await r.json(),{reset:true});assert.ok(!JSON.stringify(r.headers.getSetCookie()).includes('private-access'));
});
test('invalid recovery codes cannot change passwords or create sessions',async()=>{
 let count=0;const r=await call('reset',{email,token:'123456',password},async()=>{count++;return {ok:false,status:400,body:{}}});
 assert.equal(count,1);assert.equal(r.status,400);assert.equal(r.headers.getSetCookie().length,0);
});
test('recovery response does not reveal missing accounts, but preserves rate-limit errors',async()=>{
 const r=await call('recover',{email},async()=>({ok:false,status:400,body:{}}));assert.deepEqual(await r.json(),{sent:true});
 assert.equal((await call('recover',{email},async()=>({ok:false,status:429,body:{}}))).status,429);
});
test('Supabase password updates use PUT, authenticated by recovery token',async()=>{
 const oldFetch=globalThis.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_PUBLISHABLE_KEY;
 process.env.SUPABASE_URL='https://auth.test';process.env.SUPABASE_PUBLISHABLE_KEY='test-public';
 globalThis.fetch=async(url,opts)=>{assert.equal(opts.method,'PUT');assert.equal(opts.headers.authorization,'Bearer verified');return new Response('{}')};
 try{await authCall('user',{password},'verified','PUT')}finally{globalThis.fetch=oldFetch;if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=oldKey}
});
