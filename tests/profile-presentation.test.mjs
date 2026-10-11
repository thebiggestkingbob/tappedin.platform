import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../web/platform.js',import.meta.url),'utf8').split('// Profile presentation uses public activity only; existing reaction storage stays compatible.')[1];
function context(){
 const p={id:'me',name:'Creator',city:'Cape Town',category:'Music',kind:'industry',roles:['Artist'],bio:'My bio',contactEmail:'public@example.com',phone:'+27 82 123 4567',available:true};
 const ctx=vm.createContext({ICONS:{},state:{posts:[{id:'work',type:'work',by:'me',date:'2024-02-29',title:'Released work',likes:3,credits:[{id:'me'}]},{id:'other',type:'work',by:'other',date:'2024-02-28',title:'Other work',likes:90,credits:[]}],likes:['work'],gigs:[{date:'2024-02-29',title:'Public gig',public:true},{date:'2024-02-28',title:'Private fee',public:false}],socialLinks:[{platform:'Instagram',url:'https://instagram.com/creator'},{platform:'Unsafe',url:'javascript:alert(1)'}],follows:[]},contributions:[{id:'tap',by:'member',date:'2024-02-27',title:'Check in'}],toServer:({id})=>({id:id==='me'?'member':id}),icon:n=>`<i data-icon="${n}"></i>`,esc:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),safeUrl:s=>/^https:\/\//.test(s),identityCategory:p=>p.category,av:()=>'<img class="avatar big">',num:String,account:{profile:p},fan:()=>false,person:()=>p,activeProfile:'me',fmt:s=>s,render:()=>{},modal:()=>{},contributionCard:()=>'',p});
 vm.runInContext(source,ctx);return ctx;
}
test('profile puts bio under category, exposes public contact links and counts received stars once',()=>{
 const c=context(),html=vm.runInContext('profileHeader(p,true,[])',c);
 assert.ok(html.indexOf('Music')<html.indexOf('My bio'));
 assert.ok(html.includes('mailto:public@example.com'));assert.ok(html.includes('tel:+27821234567'));assert.ok(html.includes('https://wa.me/27821234567'));
 assert.ok(html.includes('data-icon="instagram"'));assert.ok(!html.includes('javascript:'));assert.match(html,/data-icon="star"><\/i>4<\/b>/);
});
test('WhatsApp requires an international phone number',()=>{
 const c=context();for(const phone of ['0821234567','+','+27abc12345678',''])assert.equal(vm.runInContext(`whatsappNumber(${JSON.stringify(phone)})`,c),'');
 assert.equal(vm.runInContext('whatsappNumber("+27 (82) 123-4567")',c),'27821234567');
});
test('calendar marks public activities, includes leap day, navigates year boundaries and hides private bookings',()=>{
 const c=context();vm.runInContext('profileCalendarOwner="me";profileCalendarMonth="2024-02"',c);
 const html=vm.runInContext('renderProfileCalendar(p)',c);assert.ok(html.includes('2024-02-29, 2 public activities'));assert.ok(html.includes('2024-02-27, 1 public activities'));assert.ok(html.includes('2024-02-28, 0 public activities'));assert.ok(!html.includes('2024-02-30'));
 assert.ok(!vm.runInContext('JSON.stringify(publicProfileActivity(p))',c).includes('Private fee'));
 vm.runInContext('profileCalendarMonth="2024-01";changeProfileMonth(-1)',c);assert.equal(vm.runInContext('profileCalendarMonth',c),'2023-12');
 vm.runInContext('changeProfileMonth(1)',c);assert.equal(vm.runInContext('profileCalendarMonth',c),'2024-01');
});
