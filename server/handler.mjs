import {linkPreview} from './link-preview.mjs';
import worker from '../dist/server/index.js';
import {productionDatabase} from './database.mjs';
import {authCall,verifiedSession,sessionCookies,storageCall,productionStorage,signedUpload} from './supabase.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const returnPath=(s='/app')=>typeof s==='string'&&s.startsWith('/')&&!s.startsWith('//')&&!s.includes('\\')?s:'/app';
function sameOrigin(req){return req.headers.get('origin')===new URL(req.url).origin&&req.headers.get('sec-fetch-site')!=='cross-site'}
async function smallBody(req){if(Number(req.headers.get('content-length')||0)>5000)throw new Error('Request too large');const s=await req.text();if(s.length>5000)throw new Error('Request too large');return JSON.parse(s)}
export async function handle(request,overrides={}){const url=new URL(request.url),path=url.pathname;if(path==='/demo'||path.startsWith('/demo/'))return new Response('Not found',{status:404});if(path==='/auth/login'||path==='/signin-with-chatgpt')return Response.redirect(new URL('/login?return_to='+encodeURIComponent(returnPath(url.searchParams.get('return_to')||'/app')),url),302);if(path==='/auth/logout'||path==='/signout-with-chatgpt'){const response=Response.redirect(new URL('/login',url),302),copy=new Response(null,{status:response.status,headers:response.headers});for(const c of sessionCookies({},url.protocol==='https:'))copy.headers.append('set-cookie',c);return copy}if(request.method!=='GET'&&!sameOrigin(request))return json({error:'Refresh the page and try again.'},403);
try{const provider=overrides.authCall||authCall;if(path==='/api/auth/password'&&request.method==='POST'){const b=await smallBody(request);if(typeof b.email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||typeof b.password!=='string'||!b.password||b.password.length>1024)return json({error:'Enter your email and password.'},400);const r=await provider('token?grant_type=password',{email:b.email.trim(),password:b.password});if(!r.ok||!r.body.user?.id||!r.body.access_token)return json({error:r.status===429?'Too many attempts. Please wait before trying again.':'Unable to sign in. Check your email and password, and that your account is confirmed.'},r.status===429?429:401);const response=json({signedIn:true});for(const c of sessionCookies(r.body,url.protocol==='https:'))response.headers.append('set-cookie',c);return response}if(['/api/auth/code','/api/auth/verify'].includes(path))return json({error:'Use email and password to sign in.'},410);
if(['/api/auth/signup','/api/auth/confirm','/api/auth/recover','/api/auth/reset'].includes(path)&&request.method==='POST'){
 const b=await smallBody(request);
 if(typeof b.email!=='string'||b.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))return json({error:'Enter a valid email address.'},400);
 const email=b.email.trim(),password=b.password;
 if(['/api/auth/signup','/api/auth/reset'].includes(path)&&(typeof password!=='string'||password.length<10||password.length>1024))return json({error:'Use a password between 10 and 1024 characters.'},400);
 if(['/api/auth/confirm','/api/auth/reset'].includes(path)&&(typeof b.token!=='string'||!/^\d{6,10}$/.test(b.token)))return json({error:'Enter the code from your email.'},400);
 if(path==='/api/auth/signup'){
  const r=await provider('signup',{email,password});
  if(!r.ok)return json({error:r.status===429?'Too many requests. Wait before trying again.':'Unable to create an account. Check your details or try signing in or resetting your password.'},r.status===429?429:400);
  // With confirmation disabled Supabase returns a session; never expose its tokens.
  return json({confirmationRequired:!r.body.access_token});
 }
 if(path==='/api/auth/recover'){
  const r=await provider('recover',{email});
  if(!r.ok&&r.status===429)return json({error:'Too many requests. Wait before trying again.'},429);
  if(!r.ok&&r.status>=500)return json({error:'Email delivery is temporarily unavailable. Try again shortly.'},503);
  return json({sent:true}); // Do not reveal whether an account exists.
 }
 const recovery=path==='/api/auth/reset';
 const r=await provider('verify',{email,token:b.token,type:recovery?'recovery':'signup'});
 if(!r.ok||!r.body.user?.id||!r.body.access_token)return json({error:'Code is invalid or expired. Request a new code.'},400);
 if(recovery){
  const updated=await provider('user',{password},r.body.access_token,'PUT');
  if(!updated.ok)return json({error:'Password could not be changed. Request a new reset code and try again.'},400);
 }
 // Confirmation/reset never creates a passwordless application login.
 const response=json(recovery?{reset:true}:{confirmed:true});
 for(const cookie of sessionCookies({},url.protocol==='https:'))response.headers.append('set-cookie',cookie);
 return response;
}

const session=await (overrides.verifiedSession||verifiedSession)(request);if(path==='/api/auth/session'&&request.method==='GET'){const response=json({signedIn:!!session.user});for(const cookie of session.cookies||[])response.headers.append('set-cookie',cookie);return response}const headers=new Headers(request.headers);for(const name of [...headers.keys()])if(name.startsWith('oai-'))headers.delete(name);if(session.user){headers.set('oai-authenticated-user-id',session.user.id);headers.set('oai-authenticated-user-email',session.user.email||'');headers.set('oai-authenticated-user-name',session.user.user_metadata?.name||'')}const verified=new Request(request,{headers}),DB=overrides.DB||productionDatabase(),BUCKET=overrides.BUCKET||productionStorage();let response;
if(path.startsWith('/api/storage/'))response=await handleUpload(verified,{DB,BUCKET},session);else if((path==='/app'||path==='/join')&&!session.user)response=Response.redirect(new URL('/login?return_to='+encodeURIComponent(url.pathname+url.search),url),302);else response=await worker.fetch(verified,{DB,BUCKET,linkPreview:overrides.linkPreview||linkPreview},{});const copy=new Response(response.body,{status:response.status,headers:response.headers});if(session.cookies)for(const c of session.cookies)copy.headers.append('set-cookie',c);const csp=copy.headers.get('content-security-policy');if(csp&&process.env.SUPABASE_URL){const storageOrigin=new URL(process.env.SUPABASE_URL).origin;if(storageOrigin.startsWith('https://'))copy.headers.set('content-security-policy',csp.replace("connect-src 'self'","connect-src 'self' "+storageOrigin))}return copy}catch(e){console.error('Platform request failed:',e.message);return json({error:'The platform is not ready or temporarily unavailable. Please try again.'},503)}}
async function handleUpload(req,env,session){if(!session.user)return json({error:'Sign in to upload.'},401);if(req.method!=='POST')return json({error:'Method not allowed.'},405);const b=await smallBody(req),member=await env.DB.prepare('SELECT id FROM profiles WHERE auth_key=?').bind(session.user.id).first();if(!member)return json({error:'Complete your profile.'},403);const response=await worker.fetch(new Request(new URL('/api/v3/office/'+encodeURIComponent(b.project||''),req.url),{headers:req.headers}),env,{});if(!response.ok)return response;const p=(await response.json()).project;if(p.status==='Invitation')return json({error:'Accept the project invitation first.'},403);
if(new URL(req.url).pathname==='/api/storage/ticket'){const recent=await env.DB.prepare("SELECT count(*) n FROM entities WHERE kind='uploadticket' AND owner=? AND json_extract(data,'$.created')>?").bind(member.id,new Date(Date.now()-3600000).toISOString()).first();if(Number(recent.n)>=40)return json({error:'Upload limit reached. Try again later.'},429);const id=crypto.randomUUID(),key='pending/'+session.user.id+'/'+id,url=await signedUpload(key),data={key,project:p.id,created:new Date().toISOString(),expires:Date.now()+3600000};await env.DB.prepare("INSERT INTO entities(id,owner,kind,data) VALUES(?,?,'uploadticket',?)").bind(id,member.id,JSON.stringify(data)).run();return json({id,url})}
if(new URL(req.url).pathname!=='/api/storage/complete')return json({error:'Not found.'},404);const ticket=await env.DB.prepare("DELETE FROM entities WHERE id=? AND owner=? AND kind='uploadticket' RETURNING data").bind(b.ticket,member.id).first();if(!ticket)return json({error:'Upload ticket is unavailable. Upload again.'},409);const t=JSON.parse(ticket.data);try{if(t.project!==p.id||t.expires<Date.now())return json({error:'Upload has expired or belongs to another project.'},409);const object=await env.BUCKET.get(t.key);if(!object)return json({error:'Uploaded file not found.'},404);const headers=new Headers(req.headers);headers.set('content-type',b.type||'application/octet-stream');headers.set('x-file-name',encodeURIComponent(b.filename||'Media'));headers.set('x-project-version',String(b.version));headers.delete('content-length');return await worker.fetch(new Request(new URL('/api/v3/office/'+p.id+'/upload',req.url),{method:'POST',headers,body:object.body,duplex:'half'}),env,{})}finally{await env.BUCKET.delete(t.key)}}
