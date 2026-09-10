import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {unlink} from 'node:fs/promises';
import {createGameService} from '../lib/roland-account.mjs';
import {fresh,normalizeSave} from '../public/roland-home/data.js';
import {AdventureAccount} from '../public/roland-home/account.js';
const origin='http://127.0.0.1:4198',password='An unusual galaxy 42!';
const request=(action,method='GET',body,cookie,headers={})=>new Request(origin+'/api/roland/'+action,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});

test('Account isolation, persistent saves, conflict protection and session revocation',async()=>{
 const file=resolve('.data','account-test-'+randomUUID()+'.sqlite');let service=await createGameService({databasePath:file,origin,local:true});
 try{
  const aResponse=await service.handle(request('register','POST',{email:'explorer-a@example.invalid',password})),a=await aResponse.json(),aCookie=aResponse.headers.get('set-cookie').split(';')[0];assert.equal(aResponse.status,200);assert.match(aResponse.headers.get('set-cookie'),/HttpOnly/);
  const bResponse=await service.handle(request('register','POST',{email:'explorer-b@example.invalid',password})),bCookie=bResponse.headers.get('set-cookie').split(';')[0];
  const saveA=normalizeSave({...fresh(),parts:['engine'],completed:['moo'],claims:['stage:hollow:3','signal:selene:2']});const saved=await service.handle(request('save','PUT',{accountId:a.user.id,revision:0,save:saveA},aCookie));assert.equal(saved.status,200);
  assert.equal((await service.handle(request('save','PUT',{accountId:a.user.id,revision:0,save:saveA},bCookie))).status,409);
  assert.deepEqual((await (await service.handle(request('save','GET',undefined,bCookie))).json()).save.parts,[]);
  assert.equal((await service.handle(request('save','PUT',{accountId:a.user.id,revision:0,save:saveA},aCookie))).status,409);
  const newer=normalizeSave({...fresh(),parts:['sail']});await service.handle(request('save','PUT',{accountId:a.user.id,revision:1,save:newer},aCookie));assert.deepEqual((await (await service.handle(request('save','GET',undefined,aCookie))).json()).save.parts,['engine','sail']);
  service.close();service=await createGameService({databasePath:file,origin,local:true});const restored=await (await service.handle(request('session','GET',undefined,aCookie))).json();assert.equal(restored.user.id,a.user.id);assert.deepEqual(restored.save.parts,['engine','sail']);assert.ok(restored.save.claims.includes('stage:hollow:3'));assert.ok(restored.save.claims.includes('signal:selene:2'));
  assert.equal((await service.handle(request('save','GET',undefined,null,{'oai-authenticated-user-email':a.user.email}))).status,401);
  assert.equal((await service.handle(request('login','POST',{email:a.user.email,password:'wrong password here'}))).status,401);
  assert.equal((await service.handle(request('register','POST',{email:'new@example.invalid',password},undefined,{Origin:'https://evil.invalid'}))).status,403);
  assert.equal((await service.handle(request('register','POST',null))).status,400);
  assert.equal((await service.handle(request('save','PUT',{payload:'x'.repeat(129000)},aCookie))).status,413);
  await service.handle(request('logout','POST',{},aCookie));assert.equal((await service.handle(request('save','GET',undefined,aCookie))).status,401);
  const login=await service.handle(request('login','POST',{email:a.user.email,password}));assert.equal(login.status,200);assert.deepEqual((await login.json()).save.parts,['engine','sail']);
 }finally{service.close();for(const suffix of ['', '-wal','-shm'])try{await unlink(file+suffix);}catch{}}
});

const memory=()=>{const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};};
test('Account cache does not replace server equipment and freeplay stays separate',()=>{
 const storage=memory(),profile=normalizeSave({...fresh(),parts:['engine'],completed:['moo'],gear:['crystal'],claims:['gear:prism'],equipped:{suit:'crystal'}});let current;
 const client=new AdventureAccount(storage,s=>current=s,()=>{});client.useAccount({user:{id:'A'},save:profile,revision:1});assert.equal(current.equipped.suit,'crystal');client.save(current);client.cancel();client.freeplay();assert.deepEqual(current.parts,[]);client.cancel();
});
test('Concurrent save recovery preserves the merged baseline in subsequent writes',async()=>{
 const original=globalThis.fetch;let count=0,last;
 globalThis.fetch=async(url,options)=>{const input=JSON.parse(options.body);last=input.save;count++;return count===1?Response.json({save:normalizeSave({...fresh(),parts:['engine']}),revision:1},{status:409}):Response.json({save:input.save,revision:count});};
 const client=new AdventureAccount(memory(),()=>{},()=>{});try{client.useAccount({user:{id:'A'},save:fresh(),revision:0});client.save(normalizeSave({...fresh(),parts:['sail']}));clearTimeout(client.timer);await client.flush();client.save(normalizeSave({...fresh(),parts:['sail'],sound:true}));clearTimeout(client.timer);await client.flush();assert.deepEqual(last.parts,['engine','sail']);}finally{client.cancel();globalThis.fetch=original;}
});
test('A late sign-in response cannot override freeplay and cache failures are honest',async()=>{
 const original=globalThis.fetch;let release;globalThis.fetch=()=>new Promise(r=>release=r);const messages=[],storage={getItem:()=>null,setItem:()=>{throw Error('blocked');}},client=new AdventureAccount(storage,()=>{},s=>messages.push(s));
 try{const auth=client.authenticate('login','player@example.invalid',password);client.freeplay();release(Response.json({user:{id:'A'},save:fresh(),revision:0}));await assert.rejects(auth,/cancelled/);assert.equal(client.mode,'free');client.useAccount({user:{id:'A'},save:fresh(),revision:0});globalThis.fetch=async()=>{throw Error('offline');};client.save(fresh());clearTimeout(client.timer);await client.flush();assert.match(messages.at(-1),/has not been saved/);}finally{client.cancel();globalThis.fetch=original;}
});
test('Unavailable account storage fails closed and leaves freeplay possible',async()=>{const service=await createGameService();const status=await (await service.handle(request('status'))).json();assert.equal(status.available,false);assert.equal((await service.handle(request('register','POST',{email:'a@example.invalid',password}))).status,503);});
test('Rapid collection saves locally immediately and coalesces account uploads without starvation',async()=>{const real={fetch:globalThis.fetch,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,now:Date.now};const timers=new Map(),uploads=[];let now=10000,nextId=0;Date.now=()=>now;globalThis.setTimeout=(fn,delay)=>{const id=++nextId;timers.set(id,{fn,at:now+delay});return id;};globalThis.clearTimeout=id=>timers.delete(id);globalThis.fetch=async(url,options)=>{uploads.push(now);const data=JSON.parse(options.body);return Response.json({save:data.save,revision:uploads.length});};const storage=memory(),client=new AdventureAccount(storage,()=>{},()=>{});try{client.useAccount({user:{id:'A'},save:fresh(),revision:0});for(let i=0;i<200;i++){now+=100;client.save(normalizeSave({...fresh(),claims:['foe:moo:'+Math.floor(i/8)]}));for(const [id,t]of [...timers])if(t.at<=now){timers.delete(id);t.fn();await new Promise(resolve=>real.setTimeout(resolve,0));}}assert.ok(uploads.length>=4&&uploads.length<=6);assert.ok(uploads.every((t,i)=>i===0||t-uploads[i-1]>=4000));assert.ok(JSON.parse(storage.getItem('roland-get-home-v1.account.A')).claims.length>0);}finally{client.cancel();globalThis.fetch=real.fetch;globalThis.setTimeout=real.setTimeout;globalThis.clearTimeout=real.clearTimeout;Date.now=real.now;}});
