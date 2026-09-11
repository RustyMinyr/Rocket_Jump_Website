import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {randomUUID} from 'node:crypto';
import {openGameDatabase} from '../lib/drifter-database.mjs';import {createInsightsService} from '../lib/drifter-insights.mjs';import {createGameService} from '../lib/roland-account.mjs';import {fresh} from '../public/roland-home/data.js';

async function fixture(){const dir=await mkdtemp(join(tmpdir(),'drifter-insights-')),db=await openGameDatabase({databasePath:join(dir,'test.sqlite')});let time=Date.UTC(2026,8,11,12);const users=[{id:randomUUID(),email:'owner@example.test'},{id:randomUUID(),email:'player@example.test'}];for(const u of users)await db.query('INSERT INTO players VALUES(?,?,?,?)',[u.id,u.email,'unused-test-hash',time]);const saves=new Map(users.map(u=>[u.id,fresh()]));const service=await createInsightsService({db,json:(data,status=200)=>Response.json(data,{status}),body:r=>r.json(),rate:(key,max)=>db.consumeLimit(key,max),load:async id=>({save:saves.get(id)}),adminEmail:users[0].email,bootstrapToken:'private-owner-invitation',now:()=>time});return{db,users,saves,tick:ms=>{time+=ms;},async call(action,{method='GET',body,user=null,address='test'}={}){const req=new Request('https://game.test/api/roland/'+action,{method,...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});try{const r=await service.handle(action.split('?')[0],req,user,address);return{status:r?.status,data:r?await r.json():null};}catch(e){return{status:e.status||500,data:{error:e.message}};}},refresh:service.refreshProfile,async close(){db.close();await rm(dir,{recursive:true,force:true});}};}

test('Only the invited owner can activate and read private insights',async()=>{const f=await fixture();try{
 assert.equal((await f.call('admin-insights')).status,403);assert.equal((await f.call('admin-insights',{user:f.users[1]})).status,403);
 assert.equal((await f.call('admin-claim',{method:'POST',user:f.users[1],body:{token:'private-owner-invitation'}})).status,403);
 assert.equal((await f.call('admin-claim',{method:'POST',user:f.users[0],body:{token:'wrong'}})).status,403);
 assert.equal((await f.call('admin-claim',{method:'POST',user:f.users[0],body:{token:'private-owner-invitation'}})).status,200);
 const result=await f.call('admin-insights?days=7',{user:f.users[0]});assert.equal(result.status,200);assert.equal(result.data.active,0);assert.equal(result.data.trackingSince,null);assert.ok(result.data.insights.some(i=>i.title==='Early days'));
 assert.equal((await f.call('admin-insights?days=999',{user:f.users[0]})).status,400);
}finally{await f.close();}});

test('Telemetry counts unique browsers, honours pause and time windows, and retries are idempotent',async()=>{const f=await fixture();try{
 await f.call('admin-claim',{method:'POST',user:f.users[0],body:{token:'private-owner-invitation'}});const visitor=randomUUID();const a=(await f.call('telemetry-start',{method:'POST',body:{visitor,device:'phone'}})).data;const b=(await f.call('telemetry-start',{method:'POST',body:{visitor,device:'desktop'}})).data;const attempt=randomUUID();const events=[{id:randomUUID(),kind:'planet_start',planet:'moo',stage:0,attempt},{id:randomUUID(),kind:'stage_enter',planet:'moo',stage:0,attempt}];
 const update={...a,seq:1,active:true,events};assert.equal((await f.call('telemetry',{method:'POST',body:update})).status,200);assert.equal((await f.call('telemetry',{method:'POST',body:update})).data.duplicate,true);await f.call('telemetry',{method:'POST',body:{...b,seq:1,active:true,events:[]}});f.tick(15000);await f.call('telemetry',{method:'POST',body:{...a,seq:2,active:true,events:[]}});
 let report=(await f.call('admin-insights?days=1',{user:f.users[0]})).data;assert.equal(report.active,1,'Same browser in two tabs counts once');assert.equal(report.windows[0].players,1);assert.equal(report.attempts,1);assert.equal(report.stages[0].plays,1);
 await f.call('telemetry',{method:'POST',body:{...a,seq:3,active:false,events:[]}});await f.call('telemetry',{method:'POST',body:{...b,seq:2,active:false,events:[]}});report=(await f.call('admin-insights?days=1',{user:f.users[0]})).data;assert.equal(report.active,0);
 f.tick(2*86400000);report=(await f.call('admin-insights?days=7',{user:f.users[0]})).data;assert.equal(report.windows[0].players,0);assert.equal(report.windows[1].players,1);assert.equal(report.planets[0].exits,1);
 assert.equal((await f.call('telemetry',{method:'POST',body:{...a,token:'0'.repeat(48),seq:5,active:true,events:[]}})).status,401);
}finally{await f.close();}});

test('Feedback requires a visited world, accepts bounded choices and replaces duplicate votes',async()=>{const f=await fixture();try{const s=(await f.call('telemetry-start',{method:'POST',body:{visitor:randomUUID()}})).data;const vote={...s,planet:'moo',rating:1,reason:'art'};
 assert.equal((await f.call('feedback',{method:'POST',body:vote})).status,400);const attempt=randomUUID();await f.call('telemetry',{method:'POST',body:{...s,seq:1,active:true,events:[{id:randomUUID(),kind:'planet_start',planet:'moo',stage:0,attempt}]}});
 assert.equal((await f.call('feedback',{method:'POST',body:vote})).status,200);assert.equal((await f.call('feedback',{method:'POST',body:{...vote,rating:-1,reason:'controls'}})).status,200);assert.equal((await f.db.one('SELECT COUNT(*) AS n FROM drifter_feedback')).n,1);assert.equal((await f.call('feedback',{method:'POST',body:{...vote,reason:'<script>'}})).status,400);
 assert.equal((await f.call('telemetry',{method:'POST',body:{...s,seq:2,active:true,events:[{id:randomUUID(),kind:'stage_enter',planet:'invented',stage:0,attempt}]}})).status,400);
}finally{await f.close();}});

test('Leaderboards are opt-in, never expose emails and derive scores from server saves',async()=>{const f=await fixture();try{
 assert.deepEqual((await f.call('leaderboard')).data.entries,[]);assert.equal((await f.call('leaderboard-profile',{method:'PUT',body:{alias:'Pilot One',listed:true}})).status,401);
 const save=f.saves.get(f.users[1].id);save.completed=['moo'];save.parts=['engine'];save.claims=['clear:moo','part:engine'];
 assert.equal((await f.call('leaderboard-profile',{method:'PUT',user:f.users[1],body:{alias:'Pilot One',listed:true,xp:99999999,worlds:999}})).status,200);
 let board=(await f.call('leaderboard')).data;assert.equal(board.entries[0].worlds,1);assert.equal(board.entries[0].xp,150);assert.doesNotMatch(JSON.stringify(board),/example.test|player_id|password/);
 assert.equal((await f.call('leaderboard-profile',{method:'PUT',user:f.users[0],body:{alias:'pilot one',listed:true}})).status,409);
 assert.equal((await f.call('leaderboard-profile',{method:'PUT',user:f.users[0],body:{alias:'<img onerror=x>',listed:true}})).status,400);
 save.completed.push('cheese');save.claims.push('clear:cheese');await f.refresh(f.users[1].id,save);board=(await f.call('leaderboard')).data;assert.equal(board.entries[0].worlds,2);
 await f.call('leaderboard-profile',{method:'DELETE',user:f.users[1]});assert.deepEqual((await f.call('leaderboard')).data.entries,[]);assert.equal(save.completed.length,2);
}finally{await f.close();}});

test('Production account handler enforces same-origin telemetry and blocks unauthenticated admin reads',async()=>{const dir=await mkdtemp(join(tmpdir(),'drifter-route-'));const s=await createGameService({databasePath:join(dir,'game.sqlite'),origin:'https://game.test',local:true});try{
 const read=await s.handle(new Request('https://game.test/api/roland/admin-insights'));assert.equal(read.status,403);assert.equal(read.headers.get('cache-control'),'no-store');
 const write=await s.handle(new Request('https://game.test/api/roland/telemetry-start',{method:'POST',headers:{Origin:'https://evil.test','Content-Type':'application/json'},body:JSON.stringify({visitor:randomUUID()})}));assert.equal(write.status,403);
}finally{s.close();await rm(dir,{recursive:true,force:true});}});
