import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {createGameService} from '../lib/roland-account.mjs';
import {openGameDatabase} from '../lib/drifter-database.mjs';
import {fresh,normalizeSave} from '../public/roland-home/data.js';

test('Cloud accounts persist across service instances and concurrent writes cannot lose progress',
 {skip:!process.env.DATABASE_URL},async()=>{
 const origin='https://www.rocketjump.co.za',tag=randomUUID(),address='drifter-qa-'+tag;
 const email='drifter-qa-'+tag+'@example.invalid',password='Test explorer '+randomUUID();
 const options={databaseUrl:process.env.DATABASE_URL,origin};
 const a=await createGameService(options),b=await createGameService(options),db=await openGameDatabase(options);
 const call=(service,action,method='GET',input,cookie)=>service.handle(new Request(origin+'/api/roland/'+action,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(input?{body:JSON.stringify(input)}:{})}),{clientAddress:address});
 let playerId;
 try{
  assert.deepEqual(await(await call(a,'status')).json(),{available:true,storage:'cloud'});
  const registrations=await Promise.all([call(a,'register','POST',{email,password}),call(b,'register','POST',{email,password})]);
  assert.deepEqual(registrations.map(r=>r.status).sort(),[200,409]);
  const registration=registrations.find(r=>r.status===200),player=await registration.json();playerId=player.user.id;
  assert.match(registration.headers.get('set-cookie'),/HttpOnly/);assert.match(registration.headers.get('set-cookie'),/Secure/);
  const cookie=registration.headers.get('set-cookie').split(';')[0];
  assert.equal((await(await call(b,'session','GET',undefined,cookie)).json()).user.id,playerId);
  const candidates=['engine','sail'].map(part=>normalizeSave({...fresh(),parts:[part],claims:['stage:hollow:3']}));
  const writes=await Promise.all([a,b].map((service,i)=>call(service,'save','PUT',{accountId:playerId,revision:0,save:candidates[i]},cookie)));
  assert.deepEqual(writes.map(r=>r.status).sort(),[200,409]);
  const rejected=writes.findIndex(r=>r.status===409),conflict=await writes[rejected].json();
  const retry=await call(b,'save','PUT',{accountId:playerId,revision:conflict.revision,save:candidates[rejected]},cookie);
  assert.equal(retry.status,200);
  const saved=await(await call(a,'save','GET',undefined,cookie)).json();
  assert.deepEqual(saved.save.parts,['engine','sail']);assert.equal(saved.revision,2);
  assert.ok(saved.save.claims.includes('stage:hollow:3'));
  assert.equal((await call(a,'logout','POST',{},cookie)).status,200);
  assert.equal((await call(b,'save','GET',undefined,cookie)).status,401);
  const login=await call(b,'login','POST',{email,password});assert.equal(login.status,200);
  assert.deepEqual((await login.json()).save.parts,['engine','sail']);
 }finally{
  // Only this test's unique account and rate-limit keys are removed.
  if(!playerId)playerId=(await db.one('SELECT id FROM players WHERE email=?',[email]))?.id;
  if(playerId)await db.query('DELETE FROM players WHERE id=? AND email=?',[playerId,email]);
  const hash=value=>createHash('sha256').update(value).digest('hex');
  for(const key of ['ip:'+hash(address),'register:'+hash(address),'email:'+hash(email),'save:'+playerId])await db.query('DELETE FROM limits WHERE key=?',[key]);
  a.close();b.close();db.close();
 }
});
