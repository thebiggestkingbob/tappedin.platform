import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../web/homepage.js',import.meta.url),'utf8');
function render(view='profile'){
 const context=vm.createContext({siteTop:()=>'<header>Existing navigation</header>',icon:()=>'<svg aria-hidden="true"></svg>',renderLanding:()=>''});
 vm.runInContext(source,context);
 return vm.runInContext(`homeProductView=${JSON.stringify(view)};renderLanding()`,context);
}
test('homepage renders required positioning, signup links and an existing showcase anchor',()=>{
 const html=render();
 for(const text of ['THE PEOPLE','BEHIND','THE WORK.','YOUR WORK. YOUR PEOPLE. YOUR NEXT MOVE.','MORE THAN A PROFILE.','GET CREDITED.','BUILD YOUR SUPPORT.','NOW GET TAPPED IN.'])assert.ok(html.includes(text),text);
 assert.ok(html.includes('href="/signup"'));assert.ok(html.includes('href="/signup?kind=fan"'));
 assert.ok(html.includes('href="#platform"'));assert.ok(html.includes('id="platform"'));assert.ok(html.includes('id="who-for"'));
 assert.ok(!html.includes('/demo'));assert.ok(!/exclusive|subscription|guaranteed|R\d|pricing/i.test(html));
});
test('every product view has a labelled tab and a valid panel linked to its real feature',()=>{
 for(const key of ['profile','discover','workspace','opportunities']){
  const html=render(key);assert.ok(html.includes(`aria-labelledby="home-tab-${key}"`));assert.ok(html.includes(`id="home-tab-${key}" aria-controls="home-product-panel" aria-selected="true"`));
 }
 const html=render('opportunities');assert.ok(html.includes('Actual project team interface'));assert.ok(html.includes('href="/feed#opportunities"'));
});
test('all desktop and mobile screenshot assets exist and stay within a small page budget',()=>{
 const names=new Set();for(const view of ['profile','discover','workspace','opportunities'])for(const [,name]of render(view).matchAll(/\/homepage\/([a-z-]+\.webp)/g))names.add(name);
 let desktopBytes=0,mobileBytes=0;
 for(const name of names){const buffer=fs.readFileSync(new URL('../public/homepage/'+name,import.meta.url));assert.equal(buffer.toString('ascii',0,4),'RIFF');assert.equal(buffer.toString('ascii',8,12),'WEBP');if(name.includes('-mobile'))mobileBytes+=buffer.length;else desktopBytes+=buffer.length;}
 assert.ok(desktopBytes<512000);assert.ok(mobileBytes<512000);
});
test('public preview rendering makes no API requests and assigns no account/member state',()=>{
 assert.ok(!/\b(fetch|api|applyBootstrap|demoMode|sessionCookies)\s*\(/.test(source));
 assert.ok(!/\b(account|state|route|view)\s*=/.test(source));
 const html=render();assert.ok(html.includes('loading="lazy"'));assert.ok(html.includes('fetchpriority="high"'));assert.ok(html.includes('width="662" height="680"'));
});

test('current preview captures are high-resolution lossless images with accurate reserved dimensions',()=>{
 const dims=JSON.parse(fs.readFileSync(new URL('../web/home-assets.json',import.meta.url),'utf8'));
 assert.equal(Object.keys(dims).length,13);
 for(const [name,size] of Object.entries(dims)){const bytes=fs.readFileSync(new URL('../public/homepage/'+name+'.webp',import.meta.url));assert.equal(bytes.toString('ascii',12,16),'VP8L');const bits=bytes.readUInt32LE(21);assert.equal(size.width,1+(bits&0x3fff));assert.equal(size.height,1+((bits>>>14)&0x3fff));assert.ok(size.width>=(name.includes('-mobile')?700:1400));}
 const c=vm.createContext({homeAssetDimensions:dims,siteTop:()=>'',icon:()=>'',renderLanding:()=>''});vm.runInContext(source,c);
 const html=vm.runInContext('homeImage("profile","Profile",760,740)',c);assert.ok(html.includes('width="'+dims.profile.width+'" height="'+dims.profile.height+'"'));assert.ok(html.includes('width="'+dims['profile-mobile'].width+'" height="'+dims['profile-mobile'].height+'"'));
});
